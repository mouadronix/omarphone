import { createHmac, randomUUID, timingSafeEqual } from 'node:crypto';
import { neon } from '@neondatabase/serverless';
import {
  CONTENT_RESOURCE_DEFINITIONS,
  CONTENT_TABLES,
  definitionForTable,
  definitionsForSection,
  normalizeContentItems,
  normalizeContentItem,
  postgresContentTableDdl,
  rowToContentItem,
  rowToContentRecord,
  toSnakeCase,
} from '../backend/content-tables.mjs';
import { getSiteContent } from '../backend/content-data.mjs';

const PROJECT_DIR = process.cwd();
const DATABASE_URL = process.env.POSTGRES_URL || process.env.DATABASE_URL || process.env.POSTGRES_PRISMA_URL;
const sql = DATABASE_URL ? neon(DATABASE_URL) : null;
const ADMIN_USERNAME = process.env.OMARPHONE_ADMIN_USERNAME || 'admin';
const ADMIN_PASSWORD = process.env.OMARPHONE_ADMIN_PASSWORD || '';
const ADMIN_AUTH_SECRET = process.env.OMARPHONE_ADMIN_AUTH_SECRET || ADMIN_PASSWORD;
const ADMIN_TOKEN_TTL_SECONDS = 60 * 60 * 8;

let memoryOrders = [];
let memoryContentOverrides = {};
let memoryBlogPosts = null;
let memoryMediaAssets = new Map();
let schemaReadyPromise = null;
let defaultContentPromise = null;

function getDefaultContent() {
  if (!defaultContentPromise) {
    defaultContentPromise = getSiteContent(PROJECT_DIR);
  }
  return defaultContentPromise;
}

export function sendJson(response, status, payload) {
  response.status(status).json({
    ...payload,
    storage: sql ? 'postgres' : 'memory-fallback',
  });
}

export function hasDatabase() {
  return Boolean(sql);
}

function base64UrlEncode(value) {
  const input = typeof value === 'string' ? value : JSON.stringify(value);
  return Buffer.from(input).toString('base64url');
}

function signAdminTokenPayload(encodedPayload) {
  return createHmac('sha256', ADMIN_AUTH_SECRET).update(encodedPayload).digest('base64url');
}

export function createAdminToken(username) {
  const payload = {
    sub: username,
    exp: Math.floor(Date.now() / 1000) + ADMIN_TOKEN_TTL_SECONDS,
  };
  const encodedPayload = base64UrlEncode(payload);
  return `${encodedPayload}.${signAdminTokenPayload(encodedPayload)}`;
}

export function verifyAdminCredentials(username, password) {
  if (!isAdminAuthConfigured()) {
    return false;
  }

  return String(username || '').trim() === ADMIN_USERNAME && String(password || '') === ADMIN_PASSWORD;
}

export function getAdminTokenTtlSeconds() {
  return ADMIN_TOKEN_TTL_SECONDS;
}

export function isAdminAuthConfigured() {
  return Boolean(ADMIN_USERNAME && ADMIN_PASSWORD && ADMIN_AUTH_SECRET);
}

function isAdminTokenValid(token) {
  const [encodedPayload, signature] = String(token || '').split('.');
  if (!encodedPayload || !signature) {
    return false;
  }

  const expected = signAdminTokenPayload(encodedPayload);
  const signatureBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expected);
  if (signatureBuffer.length !== expectedBuffer.length || !timingSafeEqual(signatureBuffer, expectedBuffer)) {
    return false;
  }

  try {
    const payload = JSON.parse(Buffer.from(encodedPayload, 'base64url').toString('utf8'));
    return payload?.sub === ADMIN_USERNAME && Number(payload?.exp) > Math.floor(Date.now() / 1000);
  } catch {
    return false;
  }
}

function getBearerToken(request) {
  const authorization = request.headers.authorization || '';
  const match = authorization.match(/^Bearer\s+(.+)$/i);
  return match?.[1] ?? '';
}

export function requireAdmin(request, response) {
  if (isAdminTokenValid(getBearerToken(request))) {
    return true;
  }

  sendJson(response, 401, { error: 'Admin authentication required' });
  return false;
}

export function normalizeStatus(status) {
  return ['New', 'In Review', 'Confirmed'].includes(status) ? status : 'New';
}

async function ensureSchema() {
  if (!sql) {
    return;
  }

  if (!schemaReadyPromise) {
    schemaReadyPromise = Promise.all([
      sql`
        CREATE TABLE IF NOT EXISTS orders (
          id TEXT PRIMARY KEY,
          created_at TIMESTAMPTZ NOT NULL,
          server_received_at TIMESTAMPTZ NOT NULL,
          status TEXT NOT NULL DEFAULT 'New',
          payload_json JSONB NOT NULL
        )
      `,
      sql`
        CREATE TABLE IF NOT EXISTS content_sections (
          section_key TEXT PRIMARY KEY,
          payload_json JSONB NOT NULL,
          updated_at TIMESTAMPTZ NOT NULL,
          customized BOOLEAN NOT NULL DEFAULT FALSE
        )
      `,
      sql`
        CREATE TABLE IF NOT EXISTS media_assets (
          id TEXT PRIMARY KEY,
          filename TEXT NOT NULL,
          content_type TEXT NOT NULL,
          data_base64 TEXT NOT NULL,
          byte_size INTEGER NOT NULL DEFAULT 0,
          alt_text TEXT NOT NULL DEFAULT '',
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        )
      `,
      sql`
        CREATE TABLE IF NOT EXISTS blog_posts (
          slug TEXT PRIMARY KEY,
          title TEXT NOT NULL,
          copy TEXT NOT NULL,
          post_date TEXT NOT NULL,
          tag TEXT NOT NULL,
          category TEXT NOT NULL,
          tone TEXT NOT NULL,
          image TEXT NOT NULL,
          author TEXT NOT NULL DEFAULT 'OmarPhone Team',
          status TEXT NOT NULL DEFAULT 'Published',
          views INTEGER NOT NULL DEFAULT 0,
          published_at TIMESTAMPTZ,
          sort_order INTEGER NOT NULL DEFAULT 0,
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        )
      `,
      sql`
        CREATE TABLE IF NOT EXISTS blog_post_tags (
          post_slug TEXT NOT NULL REFERENCES blog_posts(slug) ON DELETE CASCADE,
          tag TEXT NOT NULL,
          sort_order INTEGER NOT NULL DEFAULT 0,
          PRIMARY KEY (post_slug, tag)
        )
      `,
      ...CONTENT_TABLES.map((definition) => sql.query(postgresContentTableDdl(definition))),
      sql`ALTER TABLE content_sections ADD COLUMN IF NOT EXISTS customized BOOLEAN NOT NULL DEFAULT TRUE`,
    ]);
    schemaReadyPromise = schemaReadyPromise.then(async () => {
      const defaults = await getDefaultContent();
      for (const [key, payload] of Object.entries(defaults)) {
        if (key === 'blogs') {
          continue;
        }
        await sql`
          INSERT INTO content_sections (section_key, payload_json, updated_at, customized)
          VALUES (${key}, ${JSON.stringify(payload)}::jsonb, ${new Date().toISOString()}, FALSE)
          ON CONFLICT (section_key) DO NOTHING
        `;
      }
      await seedStructuredContentTables(defaults);
      await seedBlogPosts(defaults.blogs?.posts ?? []);
    });
  }

  await schemaReadyPromise;
}

async function seedStructuredContentTables(defaults) {
  for (const definition of CONTENT_TABLES) {
    const existing = await sql.query(`SELECT COUNT(*)::int AS count FROM ${definition.table}`);
    if ((existing[0]?.count ?? 0) > 0) {
      continue;
    }

    let payload = defaults[definition.section]?.[definition.property] ?? [];
    const section = await sql`
      SELECT payload_json
      FROM content_sections
      WHERE section_key = ${definition.section}
      LIMIT 1
    `;
    const sectionPayload = section[0]?.payload_json;
    if (Array.isArray(sectionPayload?.[definition.property])) {
      payload = sectionPayload[definition.property];
    }

    await replaceContentTable(definition, payload);
  }
}

async function replaceContentTable(definition, items) {
  const normalizedItems = normalizeContentItems(definition, items);
  await sql.query(`DELETE FROM ${definition.table}`);

  const columnNames = definition.columns.map(toSnakeCase);
  const insertColumns = [...columnNames, 'sort_order'];
  const placeholders = insertColumns.map((_, index) => `$${index + 1}`).join(', ');
  const insertSql = `
    INSERT INTO ${definition.table} (${insertColumns.join(', ')})
    VALUES (${placeholders})
  `;

  for (const [index, item] of normalizedItems.entries()) {
    await sql.query(insertSql, [...definition.columns.map((column) => item[column] ?? ''), index]);
  }

  return normalizedItems;
}

async function readContentTable(definition) {
  const rows = await sql.query(`SELECT * FROM ${definition.table} ORDER BY sort_order ASC, id ASC`);
  return rows.map((row) => rowToContentItem(definition, row));
}

async function readStructuredContent() {
  await ensureSchema();
  const content = {};
  for (const definition of CONTENT_TABLES) {
    content[definition.section] ??= {};
    content[definition.section][definition.property] = await readContentTable(definition);
  }
  return content;
}

function isNonEmptyObject(value) {
  return !!value && typeof value === 'object' && !Array.isArray(value) && Object.keys(value).length > 0;
}

function mergeStructuredContent(base, structured) {
  const merged = structuredClone(base);
  for (const [sectionKey, sectionPayload] of Object.entries(structured)) {
    const currentSection = isNonEmptyObject(merged[sectionKey]) ? merged[sectionKey] : {};
    const nextSection = { ...currentSection };
    for (const [property, rows] of Object.entries(sectionPayload)) {
      if (Array.isArray(rows) && rows.length > 0) {
        nextSection[property] = rows;
      }
    }
    merged[sectionKey] = nextSection;
  }
  return merged;
}

async function replaceStructuredContentSection(key, payload) {
  const definitions = definitionsForSection(key);
  if (definitions.length === 0) {
    return false;
  }

  for (const definition of definitions) {
    await replaceContentTable(definition, payload?.[definition.property] ?? []);
  }
  return true;
}

function getContentTableDefinition(tableName) {
  const definition = definitionForTable(tableName);
  if (!definition) {
    const error = new Error('Unknown content table');
    error.statusCode = 404;
    throw error;
  }
  return definition;
}

export function listContentTables() {
  return CONTENT_RESOURCE_DEFINITIONS;
}

export async function readContentTableRows(tableName) {
  const definition = getContentTableDefinition(tableName);
  if (!sql) {
    const defaults = await getDefaultContent();
    const rows = normalizeContentItems(definition, defaults[definition.section]?.[definition.property] ?? []);
    return rows.map((row, index) => ({ id: index + 1, sortOrder: index, ...row }));
  }

  await ensureSchema();
  const rows = await sql.query(`SELECT * FROM ${definition.table} ORDER BY sort_order ASC, id ASC`);
  return rows.map((row) => rowToContentRecord(definition, row));
}

export async function upsertContentTableRow(tableName, id, payload) {
  const definition = getContentTableDefinition(tableName);
  const item = normalizeContentItem(definition, payload);
  const sortOrder = Number.isFinite(Number(payload?.sortOrder)) ? Number(payload.sortOrder) : 0;

  if (!sql) {
    return { id: Number(id || 1), sortOrder, ...item };
  }

  await ensureSchema();
  const columnNames = definition.columns.map(toSnakeCase);
  if (id) {
    const assignments = [...columnNames.map((column, index) => `${column} = $${index + 1}`), `sort_order = $${columnNames.length + 1}`, 'updated_at = NOW()'];
    const query = `
      UPDATE ${definition.table}
      SET ${assignments.join(', ')}
      WHERE id = $${columnNames.length + 2}
      RETURNING *
    `;
    const rows = await sql.query(query, [...definition.columns.map((column) => item[column] ?? ''), sortOrder, Number(id)]);
    if (!rows[0]) {
      const error = new Error('Content row not found');
      error.statusCode = 404;
      throw error;
    }
    return rowToContentRecord(definition, rows[0]);
  }

  const insertColumns = [...columnNames, 'sort_order'];
  const placeholders = insertColumns.map((_, index) => `$${index + 1}`).join(', ');
  const rows = await sql.query(
    `
      INSERT INTO ${definition.table} (${insertColumns.join(', ')})
      VALUES (${placeholders})
      RETURNING *
    `,
    [...definition.columns.map((column) => item[column] ?? ''), sortOrder],
  );
  return rowToContentRecord(definition, rows[0]);
}

export async function deleteContentTableRow(tableName, id) {
  const definition = getContentTableDefinition(tableName);
  if (!sql) {
    return true;
  }

  await ensureSchema();
  const result = await sql.query(`DELETE FROM ${definition.table} WHERE id = $1`, [Number(id)]);
  return Number(result.count ?? 0) > 0;
}

function normalizeMediaUpload(payload) {
  const rawData = String(payload?.data || payload?.dataBase64 || '');
  const dataUrlMatch = rawData.match(/^data:([^;]+);base64,(.+)$/);
  const contentType = String(payload?.contentType || dataUrlMatch?.[1] || 'application/octet-stream');
  const dataBase64 = String(dataUrlMatch?.[2] || rawData).replace(/\s/g, '');
  if (!dataBase64) {
    const error = new Error('Media upload requires base64 image data');
    error.statusCode = 400;
    throw error;
  }

  const buffer = Buffer.from(dataBase64, 'base64');
  if (!buffer.length || buffer.length > 5 * 1024 * 1024) {
    const error = new Error('Media upload must be a valid image up to 5MB');
    error.statusCode = 400;
    throw error;
  }

  if (!contentType.startsWith('image/')) {
    const error = new Error('Only image uploads are supported');
    error.statusCode = 400;
    throw error;
  }

  return {
    id: String(payload?.id || randomUUID()),
    filename: String(payload?.filename || `upload-${Date.now()}`),
    contentType,
    dataBase64,
    byteSize: buffer.length,
    altText: String(payload?.altText || ''),
  };
}

export async function createMediaAsset(payload) {
  const media = normalizeMediaUpload(payload);
  if (!sql) {
    memoryMediaAssets.set(media.id, media);
    return { ...media, url: `/api/media/${media.id}` };
  }

  await ensureSchema();
  await sql`
    INSERT INTO media_assets (id, filename, content_type, data_base64, byte_size, alt_text, updated_at)
    VALUES (
      ${media.id},
      ${media.filename},
      ${media.contentType},
      ${media.dataBase64},
      ${media.byteSize},
      ${media.altText},
      ${new Date().toISOString()}
    )
    ON CONFLICT (id) DO UPDATE SET
      filename = EXCLUDED.filename,
      content_type = EXCLUDED.content_type,
      data_base64 = EXCLUDED.data_base64,
      byte_size = EXCLUDED.byte_size,
      alt_text = EXCLUDED.alt_text,
      updated_at = EXCLUDED.updated_at
  `;

  return {
    id: media.id,
    filename: media.filename,
    contentType: media.contentType,
    byteSize: media.byteSize,
    altText: media.altText,
    url: `/api/media/${media.id}`,
  };
}

export async function readMediaAsset(id) {
  if (!sql) {
    const media = memoryMediaAssets.get(id);
    return media ? { ...media, dataBase64: media.dataBase64 } : null;
  }

  await ensureSchema();
  const rows = await sql`
    SELECT id, filename, content_type, data_base64, byte_size, alt_text, created_at, updated_at
    FROM media_assets
    WHERE id = ${id}
    LIMIT 1
  `;
  const row = rows[0];
  if (!row) {
    return null;
  }

  return {
    id: row.id,
    filename: row.filename,
    contentType: row.content_type,
    dataBase64: row.data_base64,
    byteSize: row.byte_size,
    altText: row.alt_text,
    createdAt: row.created_at ? new Date(row.created_at).toISOString() : null,
    updatedAt: row.updated_at ? new Date(row.updated_at).toISOString() : null,
  };
}

export async function deleteMediaAsset(id) {
  if (!sql) {
    return memoryMediaAssets.delete(id);
  }

  await ensureSchema();
  const result = await sql`DELETE FROM media_assets WHERE id = ${id}`;
  return Number(result.count ?? 0) > 0;
}

function normalizeBlogPost(post, index = 0) {
  const title = String(post?.title || `Blog Post ${index + 1}`);
  const slug = String(post?.slug || title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || `blog-${index + 1}`);
  const tag = String(post?.tag || post?.category || 'News');
  return {
    slug,
    title,
    copy: String(post?.copy || ''),
    date: String(post?.date || ''),
    tag,
    category: String(post?.category || tag),
    tags: Array.isArray(post?.tags) ? post.tags.map(String) : [tag],
    tone: String(post?.tone || 'violet'),
    image: String(post?.image || '/assets/cutouts/screen-repair.png'),
    author: String(post?.author || 'OmarPhone Team'),
    status: String(post?.status || 'Published'),
    views: Number.isFinite(Number(post?.views)) ? Number(post.views) : 0,
    publishedAt: post?.publishedAt ? String(post.publishedAt) : null,
    sortOrder: Number.isFinite(Number(post?.sortOrder)) ? Number(post.sortOrder) : index,
  };
}

async function seedBlogPosts(posts) {
  if (!sql) {
    if (!memoryBlogPosts) {
      memoryBlogPosts = posts.map(normalizeBlogPost);
    }
    return;
  }

  const existing = await sql`SELECT COUNT(*)::int AS count FROM blog_posts`;
  if ((existing[0]?.count ?? 0) > 0) {
    return;
  }

  const existingBlogsSection = await sql`
    SELECT payload_json
    FROM content_sections
    WHERE section_key = 'blogs'
    LIMIT 1
  `;
  const existingPayload = existingBlogsSection[0]?.payload_json;
  if (Array.isArray(existingPayload?.posts)) {
    posts = existingPayload.posts;
  }

  await replaceBlogPosts(posts, false);
  await sql`DELETE FROM content_sections WHERE section_key = 'blogs'`;
}

async function replaceBlogPosts(posts, shouldEnsureSchema = true) {
  const normalizedPosts = (Array.isArray(posts) ? posts : []).map(normalizeBlogPost);

  if (!sql) {
    memoryBlogPosts = normalizedPosts;
    return normalizedPosts;
  }

  if (shouldEnsureSchema) {
    await ensureSchema();
  }
  await sql`DELETE FROM blog_post_tags`;
  await sql`DELETE FROM blog_posts`;

  for (const [index, post] of normalizedPosts.entries()) {
    await sql`
      INSERT INTO blog_posts (
        slug, title, copy, post_date, tag, category, tone, image,
        author, status, views, published_at, sort_order, updated_at
      )
      VALUES (
        ${post.slug}, ${post.title}, ${post.copy}, ${post.date}, ${post.tag},
        ${post.category}, ${post.tone}, ${post.image}, ${post.author},
        ${post.status}, ${post.views}, ${post.publishedAt}, ${index}, ${new Date().toISOString()}
      )
    `;

    for (const [tagIndex, tag] of post.tags.entries()) {
      await sql`
        INSERT INTO blog_post_tags (post_slug, tag, sort_order)
        VALUES (${post.slug}, ${tag}, ${tagIndex})
        ON CONFLICT (post_slug, tag) DO UPDATE SET sort_order = EXCLUDED.sort_order
      `;
    }
  }

  return normalizedPosts;
}

export async function readBlogPosts() {
  const defaults = await getDefaultContent();
  if (!sql) {
    if (!memoryBlogPosts) {
      memoryBlogPosts = (defaults.blogs?.posts ?? []).map(normalizeBlogPost);
    }
    return memoryBlogPosts.map(({ sortOrder, ...post }) => post);
  }

  await ensureSchema();
  const rows = await sql`
    SELECT
      p.slug,
      p.title,
      p.copy,
      p.post_date AS date,
      p.tag,
      p.category,
      p.tone,
      p.image,
      p.author,
      p.status,
      p.views,
      p.published_at,
      COALESCE(
        json_agg(t.tag ORDER BY t.sort_order) FILTER (WHERE t.tag IS NOT NULL),
        '[]'::json
      ) AS tags
    FROM blog_posts p
    LEFT JOIN blog_post_tags t ON t.post_slug = p.slug
    GROUP BY p.slug
    ORDER BY p.sort_order ASC, p.post_date DESC, p.title ASC
  `;

  return rows.map((row) => ({
    slug: row.slug,
    title: row.title,
    copy: row.copy,
    date: row.date,
    tag: row.tag,
    category: row.category,
    tags: row.tags ?? [],
    tone: row.tone,
    image: row.image,
    author: row.author,
    status: row.status,
    views: row.views,
    publishedAt: row.published_at ? new Date(row.published_at).toISOString() : undefined,
  }));
}

export async function readBlogPost(slug) {
  const posts = await readBlogPosts();
  return posts.find((post) => post.slug === slug) ?? null;
}

export async function upsertBlogPost(post) {
  const normalized = normalizeBlogPost(post);

  if (!sql) {
    const posts = memoryBlogPosts ?? [];
    memoryBlogPosts = [normalized, ...posts.filter((item) => item.slug !== normalized.slug)];
    return normalized;
  }

  await ensureSchema();
  await sql`
    INSERT INTO blog_posts (
      slug, title, copy, post_date, tag, category, tone, image,
      author, status, views, published_at, sort_order, updated_at
    )
    VALUES (
      ${normalized.slug}, ${normalized.title}, ${normalized.copy}, ${normalized.date},
      ${normalized.tag}, ${normalized.category}, ${normalized.tone}, ${normalized.image},
      ${normalized.author}, ${normalized.status}, ${normalized.views}, ${normalized.publishedAt},
      ${normalized.sortOrder}, ${new Date().toISOString()}
    )
    ON CONFLICT (slug) DO UPDATE SET
      title = EXCLUDED.title,
      copy = EXCLUDED.copy,
      post_date = EXCLUDED.post_date,
      tag = EXCLUDED.tag,
      category = EXCLUDED.category,
      tone = EXCLUDED.tone,
      image = EXCLUDED.image,
      author = EXCLUDED.author,
      status = EXCLUDED.status,
      views = EXCLUDED.views,
      published_at = EXCLUDED.published_at,
      sort_order = EXCLUDED.sort_order,
      updated_at = EXCLUDED.updated_at
  `;

  await sql`DELETE FROM blog_post_tags WHERE post_slug = ${normalized.slug}`;
  for (const [index, tag] of normalized.tags.entries()) {
    await sql`
      INSERT INTO blog_post_tags (post_slug, tag, sort_order)
      VALUES (${normalized.slug}, ${tag}, ${index})
      ON CONFLICT (post_slug, tag) DO UPDATE SET sort_order = EXCLUDED.sort_order
    `;
  }

  return readBlogPost(normalized.slug);
}

export async function deleteBlogPost(slug) {
  if (!sql) {
    memoryBlogPosts = (memoryBlogPosts ?? []).filter((post) => post.slug !== slug);
    return true;
  }

  await ensureSchema();
  const result = await sql`DELETE FROM blog_posts WHERE slug = ${slug}`;
  return Number(result.count ?? 0) > 0;
}

export function normalizeOrder(order) {
  const now = new Date().toISOString();
  return {
    ...order,
    status: normalizeStatus(order?.status),
    createdAt: order?.createdAt || now,
    serverReceivedAt: order?.serverReceivedAt || now,
  };
}

export function validateOrder(order) {
  const required = [
    order?.id,
    order?.customer?.fullName,
    order?.customer?.phone,
    order?.customer?.email,
    order?.repair?.device,
    order?.repair?.issue,
    order?.repair?.service,
    order?.schedule?.city,
    order?.schedule?.address,
    order?.schedule?.date,
    order?.schedule?.timeSlot,
  ];

  return required.every((value) => typeof value === 'string' && value.trim().length > 0);
}

export async function readOrders() {
  if (!sql) {
    return memoryOrders;
  }

  await ensureSchema();
  const rows = await sql`
    SELECT payload_json
    FROM orders
    ORDER BY created_at DESC, id DESC
  `;
  return rows.map((row) => row.payload_json);
}

export async function upsertOrder(order) {
  const normalized = normalizeOrder(order);

  if (!sql) {
    memoryOrders = [normalized, ...memoryOrders.filter((item) => item.id !== normalized.id)];
    return { order: normalized, orders: memoryOrders };
  }

  await ensureSchema();
  await sql`
    INSERT INTO orders (id, created_at, server_received_at, status, payload_json)
    VALUES (
      ${normalized.id},
      ${normalized.createdAt},
      ${normalized.serverReceivedAt},
      ${normalized.status},
      ${JSON.stringify(normalized)}::jsonb
    )
    ON CONFLICT (id) DO UPDATE SET
      created_at = excluded.created_at,
      server_received_at = excluded.server_received_at,
      status = excluded.status,
      payload_json = excluded.payload_json
  `;

  return { order: normalized, orders: await readOrders() };
}

export async function updateOrderStatus(id, status) {
  const normalizedStatus = normalizeStatus(status);

  if (!sql) {
    memoryOrders = memoryOrders.map((order) => order.id === id ? { ...order, status: normalizedStatus } : order);
    const order = memoryOrders.find((item) => item.id === id) ?? null;
    return order ? { order, orders: memoryOrders } : null;
  }

  await ensureSchema();
  const rows = await sql`
    SELECT payload_json
    FROM orders
    WHERE id = ${id}
    LIMIT 1
  `;
  const order = rows[0]?.payload_json;
  if (!order) {
    return null;
  }

  const updatedOrder = { ...order, status: normalizedStatus };
  await sql`
    UPDATE orders
    SET status = ${normalizedStatus},
        payload_json = ${JSON.stringify(updatedOrder)}::jsonb
    WHERE id = ${id}
  `;

  return { order: updatedOrder, orders: await readOrders() };
}

async function readContentOverrides() {
  if (!sql) {
    const defaults = await getDefaultContent();
    return Object.fromEntries(Object.entries(defaults).map(([key, payload]) => [
      key,
      key === 'blogs'
        ? { payload: { posts: memoryBlogPosts ?? payload.posts ?? [] }, updatedAt: null, customized: true }
        : memoryContentOverrides[key] ?? { payload, updatedAt: null, customized: false },
    ]));
  }

  await ensureSchema();
  const rows = await sql`
    SELECT section_key, payload_json, updated_at, customized
    FROM content_sections
    ORDER BY section_key ASC
  `;

  return Object.fromEntries(rows.map((row) => [
    row.section_key,
    {
      payload: row.payload_json,
      updatedAt: new Date(row.updated_at).toISOString(),
      customized: Boolean(row.customized),
    },
  ]));
}

export async function readMergedSiteContent() {
  const defaults = await getDefaultContent();
  const sections = await readContentOverrides();
  let content = structuredClone(defaults);
  for (const [key, value] of Object.entries(sections)) {
    if (isNonEmptyObject(value.payload)) {
      content[key] = value.payload;
    }
  }
  if (sql) {
    content = mergeStructuredContent(content, await readStructuredContent());
  }
  content.blogs = { posts: await readBlogPosts() };
  return content;
}

export async function readContentSections() {
  const defaults = await getDefaultContent();
  const sections = await readContentOverrides();
  const keys = [...new Set([...Object.keys(defaults), ...Object.keys(sections), 'blogs'])].sort();

  const result = keys.map((key) => {
    const section = sections[key];
    return {
      key,
      customized: Boolean(section?.customized),
      updatedAt: section?.updatedAt ?? null,
      payload: section?.payload ?? defaults[key] ?? null,
      defaultPayload: defaults[key] ?? null,
    };
  });
  if (sql) {
    const structured = await readStructuredContent();
    for (const section of result) {
      if (structured[section.key]) {
        section.payload = mergeStructuredContent({ [section.key]: section.payload ?? defaults[section.key] ?? {} }, { [section.key]: structured[section.key] })[section.key];
      }
    }
  }
  const blogs = result.find((section) => section.key === 'blogs');
  if (blogs) {
    blogs.customized = true;
    blogs.payload = { posts: await readBlogPosts() };
    blogs.defaultPayload = defaults.blogs ?? { posts: [] };
  }

  return result;
}

export async function upsertContentSection(key, payload) {
  const updatedAt = new Date().toISOString();

  if (key === 'blogs') {
    const posts = Array.isArray(payload?.posts) ? payload.posts : [];
    await replaceBlogPosts(posts);
    return { key, payload: { posts: await readBlogPosts() }, updatedAt, customized: true };
  }

  if (!sql) {
    memoryContentOverrides[key] = { payload, updatedAt };
    return { key, payload, updatedAt, customized: true };
  }

  await ensureSchema();
  const structured = await replaceStructuredContentSection(key, payload);
  await sql`
    INSERT INTO content_sections (section_key, payload_json, updated_at, customized)
    VALUES (${key}, ${JSON.stringify(structured ? {} : payload)}::jsonb, ${updatedAt}, TRUE)
    ON CONFLICT (section_key) DO UPDATE SET
      payload_json = excluded.payload_json,
      updated_at = excluded.updated_at,
      customized = TRUE
  `;

  return { key, payload: structured ? (await readStructuredContent())[key] : payload, updatedAt, customized: true };
}

export async function deleteContentSection(key) {
  const defaults = await getDefaultContent();
  const payload = defaults[key];
  if (payload === undefined) {
    return;
  }

  if (key === 'blogs') {
    await replaceBlogPosts(payload.posts ?? []);
    return;
  }

  if (!sql) {
    memoryContentOverrides[key] = { payload, updatedAt: null, customized: false };
    return;
  }

  await ensureSchema();
  const structured = await replaceStructuredContentSection(key, payload);
  await sql`
    INSERT INTO content_sections (section_key, payload_json, updated_at, customized)
    VALUES (${key}, ${JSON.stringify(structured ? {} : payload)}::jsonb, ${new Date().toISOString()}, FALSE)
    ON CONFLICT (section_key) DO UPDATE SET
      payload_json = excluded.payload_json,
      updated_at = excluded.updated_at,
      customized = FALSE
  `;
}
