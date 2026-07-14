import { createServer } from 'node:http';
import { createHmac, randomUUID, timingSafeEqual } from 'node:crypto';
import { mkdir, readFile } from 'node:fs/promises';
import { dirname, extname, join, normalize, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import {
  CONTENT_RESOURCE_DEFINITIONS,
  CONTENT_RESOURCES,
  CONTENT_TABLES,
  definitionForTable,
  definitionsForSection,
  normalizeContentItem,
  normalizeContentItems,
  rowToContentItem,
  rowToContentRecord,
  sqliteContentTableDdl,
  toSnakeCase,
} from './content-tables.mjs';
import { getSiteContent } from './content-data.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PROJECT_DIR = dirname(__dirname);
const DATA_DIR = join(__dirname, 'data');
const PUBLIC_DIR = join(PROJECT_DIR, 'dist', 'omarphone', 'browser');
const INDEX_FILE = join(PUBLIC_DIR, 'index.html');
const LEGACY_ORDERS_FILE = join(PROJECT_DIR, 'server', 'data', 'orders.json');
const DATABASE_FILE = join(DATA_DIR, 'omarphone.sqlite');
const PORT = Number(process.env['OMARPHONE_API_PORT'] || 4301);
const ADMIN_USERNAME = process.env['OMARPHONE_ADMIN_USERNAME'] || 'admin';
const ADMIN_PASSWORD = process.env['OMARPHONE_ADMIN_PASSWORD'] || '';
const ADMIN_AUTH_SECRET = process.env['OMARPHONE_ADMIN_AUTH_SECRET'] || ADMIN_PASSWORD;
const ADMIN_TOKEN_TTL_SECONDS = 60 * 60 * 8;

let databasePromise;

async function getDatabase() {
  if (!databasePromise) {
    databasePromise = initializeDatabase();
  }

  return databasePromise;
}

async function initializeDatabase() {
  await mkdir(DATA_DIR, { recursive: true });

  const database = await open({
    filename: DATABASE_FILE,
    driver: sqlite3.Database,
  });

  await database.exec(`
    PRAGMA journal_mode = WAL;
    PRAGMA foreign_keys = ON;

    CREATE TABLE IF NOT EXISTS orders (
      id TEXT PRIMARY KEY,
      created_at TEXT NOT NULL,
      server_received_at TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'New',
      customer_name TEXT NOT NULL,
      customer_phone TEXT NOT NULL,
      customer_email TEXT NOT NULL,
      repair_device TEXT NOT NULL,
      repair_issue TEXT NOT NULL,
      repair_service TEXT NOT NULL,
      repair_total INTEGER NOT NULL DEFAULT 0,
      schedule_city TEXT NOT NULL,
      schedule_address TEXT NOT NULL,
      schedule_date TEXT NOT NULL,
      schedule_time_slot TEXT NOT NULL,
      payload_json TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);
    CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);

    CREATE TABLE IF NOT EXISTS content_sections (
      section_key TEXT PRIMARY KEY,
      payload_json TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      customized INTEGER NOT NULL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS media_assets (
      id TEXT PRIMARY KEY,
      filename TEXT NOT NULL,
      content_type TEXT NOT NULL,
      data_base64 TEXT NOT NULL,
      byte_size INTEGER NOT NULL DEFAULT 0,
      alt_text TEXT NOT NULL DEFAULT '',
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

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
      published_at TEXT,
      sort_order INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS blog_post_tags (
      post_slug TEXT NOT NULL REFERENCES blog_posts(slug) ON DELETE CASCADE,
      tag TEXT NOT NULL,
      sort_order INTEGER NOT NULL DEFAULT 0,
      PRIMARY KEY (post_slug, tag)
    );

    ${CONTENT_TABLES.map(sqliteContentTableDdl).join('\n')}
  `);
  try {
    await database.exec('ALTER TABLE content_sections ADD COLUMN customized INTEGER NOT NULL DEFAULT 1');
  } catch (error) {
    if (!String(error).includes('duplicate column name')) {
      throw error;
    }
  }

  await migrateLegacyOrders(database);
  await seedContentSections(database);
  await seedStructuredContentTables(database);
  await seedBlogPosts(database);
  return database;
}

async function seedStructuredContentTables(database) {
  const defaults = await getSiteContent(PROJECT_DIR);
  for (const definition of CONTENT_TABLES) {
    const existing = await database.get(`SELECT COUNT(*) AS count FROM ${definition.table}`);
    if (existing?.count > 0) {
      continue;
    }

    let payload = defaults[definition.section]?.[definition.property] ?? [];
    const section = await database.get('SELECT payload_json FROM content_sections WHERE section_key = ?', definition.section);
    if (section?.payload_json) {
      try {
        const parsed = JSON.parse(section.payload_json);
        if (Array.isArray(parsed?.[definition.property])) {
          payload = parsed[definition.property];
        }
      } catch {
        payload = defaults[definition.section]?.[definition.property] ?? [];
      }
    }

    await replaceContentTable(database, definition, payload);
  }
}

async function replaceContentTable(database, definition, items) {
  const normalizedItems = normalizeContentItems(definition, items);
  await database.run(`DELETE FROM ${definition.table}`);

  const columnNames = definition.columns.map(toSnakeCase);
  const insertColumns = [...columnNames, 'sort_order'];
  const placeholders = insertColumns.map(() => '?').join(', ');
  const statement = `
    INSERT INTO ${definition.table} (${insertColumns.join(', ')})
    VALUES (${placeholders})
  `;

  for (const [index, item] of normalizedItems.entries()) {
    await database.run(statement, [...definition.columns.map((column) => item[column] ?? ''), index]);
  }

  return normalizedItems;
}

async function readContentTable(database, definition) {
  const rows = await database.all(`SELECT * FROM ${definition.table} ORDER BY sort_order ASC, id ASC`);
  return rows.map((row) => rowToContentItem(definition, row));
}

async function readStructuredContent(database) {
  const content = {};
  for (const definition of CONTENT_TABLES) {
    content[definition.section] ??= {};
    content[definition.section][definition.property] = await readContentTable(database, definition);
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

async function replaceStructuredContentSection(database, key, payload) {
  const definitions = definitionsForSection(key);
  if (definitions.length === 0) {
    return false;
  }

  for (const definition of definitions) {
    await replaceContentTable(database, definition, payload?.[definition.property] ?? []);
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

function listContentTables() {
  return CONTENT_RESOURCE_DEFINITIONS;
}

async function readContentTableRows(database, tableName) {
  const definition = getContentTableDefinition(tableName);
  const rows = await database.all(`SELECT * FROM ${definition.table} ORDER BY sort_order ASC, id ASC`);
  return rows.map((row) => rowToContentRecord(definition, row));
}

async function upsertContentTableRow(database, tableName, id, payload) {
  const definition = getContentTableDefinition(tableName);
  const item = normalizeContentItem(definition, payload);
  const sortOrder = Number.isFinite(Number(payload?.sortOrder)) ? Number(payload.sortOrder) : 0;
  const columnNames = definition.columns.map(toSnakeCase);

  if (id) {
    const assignments = [...columnNames.map((column) => `${column} = ?`), 'sort_order = ?', 'updated_at = ?'];
    await database.run(
      `
        UPDATE ${definition.table}
        SET ${assignments.join(', ')}
        WHERE id = ?
      `,
      [...definition.columns.map((column) => item[column] ?? ''), sortOrder, new Date().toISOString(), Number(id)],
    );
    const row = await database.get(`SELECT * FROM ${definition.table} WHERE id = ?`, Number(id));
    if (!row) {
      const error = new Error('Content row not found');
      error.statusCode = 404;
      throw error;
    }
    return rowToContentRecord(definition, row);
  }

  const insertColumns = [...columnNames, 'sort_order'];
  const placeholders = insertColumns.map(() => '?').join(', ');
  const result = await database.run(
    `
      INSERT INTO ${definition.table} (${insertColumns.join(', ')})
      VALUES (${placeholders})
    `,
    [...definition.columns.map((column) => item[column] ?? ''), sortOrder],
  );
  const row = await database.get(`SELECT * FROM ${definition.table} WHERE id = ?`, result.lastID);
  return rowToContentRecord(definition, row);
}

async function deleteContentTableRow(database, tableName, id) {
  const definition = getContentTableDefinition(tableName);
  const result = await database.run(`DELETE FROM ${definition.table} WHERE id = ?`, Number(id));
  return Number(result.changes ?? 0) > 0;
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

async function createMediaAsset(database, payload) {
  const media = normalizeMediaUpload(payload);
  await database.run(
    `
      INSERT INTO media_assets (id, filename, content_type, data_base64, byte_size, alt_text, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET
        filename = excluded.filename,
        content_type = excluded.content_type,
        data_base64 = excluded.data_base64,
        byte_size = excluded.byte_size,
        alt_text = excluded.alt_text,
        updated_at = excluded.updated_at
    `,
    [media.id, media.filename, media.contentType, media.dataBase64, media.byteSize, media.altText, new Date().toISOString()],
  );

  return {
    id: media.id,
    filename: media.filename,
    contentType: media.contentType,
    byteSize: media.byteSize,
    altText: media.altText,
    url: `/api/media/${media.id}`,
  };
}

async function readMediaAsset(database, id) {
  const row = await database.get(
    'SELECT id, filename, content_type, data_base64, byte_size, alt_text, created_at, updated_at FROM media_assets WHERE id = ?',
    id,
  );
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
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

async function deleteMediaAsset(database, id) {
  const result = await database.run('DELETE FROM media_assets WHERE id = ?', id);
  return Number(result.changes ?? 0) > 0;
}

async function seedContentSections(database) {
  const defaults = await getSiteContent(PROJECT_DIR);
  const now = new Date().toISOString();
  for (const [key, payload] of Object.entries(defaults)) {
    if (key === 'blogs') {
      continue;
    }
    await database.run(
      `INSERT OR IGNORE INTO content_sections (section_key, payload_json, updated_at, customized)
       VALUES (?, ?, ?, 0)`,
      [key, JSON.stringify(payload), now],
    );
  }
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
  };
}

async function seedBlogPosts(database) {
  const existing = await database.get('SELECT COUNT(*) AS count FROM blog_posts');
  if (existing?.count > 0) {
    return;
  }

  const defaults = await getSiteContent(PROJECT_DIR);
  let posts = defaults.blogs?.posts ?? [];
  const existingBlogsSection = await database.get('SELECT payload_json FROM content_sections WHERE section_key = ?', 'blogs');
  if (existingBlogsSection?.payload_json) {
    try {
      const payload = JSON.parse(existingBlogsSection.payload_json);
      if (Array.isArray(payload?.posts)) {
        posts = payload.posts;
      }
    } catch {
      posts = defaults.blogs?.posts ?? [];
    }
  }

  await replaceBlogPosts(database, posts);
  await database.run('DELETE FROM content_sections WHERE section_key = ?', 'blogs');
}

async function replaceBlogPosts(database, posts) {
  const normalizedPosts = (Array.isArray(posts) ? posts : []).map(normalizeBlogPost);
  await database.exec('DELETE FROM blog_post_tags; DELETE FROM blog_posts;');

  for (const [index, post] of normalizedPosts.entries()) {
    await database.run(
      `
        INSERT INTO blog_posts (
          slug, title, copy, post_date, tag, category, tone, image,
          author, status, views, published_at, sort_order, updated_at
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        post.slug,
        post.title,
        post.copy,
        post.date,
        post.tag,
        post.category,
        post.tone,
        post.image,
        post.author,
        post.status,
        post.views,
        post.publishedAt,
        index,
        new Date().toISOString(),
      ],
    );

    for (const [tagIndex, tag] of post.tags.entries()) {
      await database.run(
        `
          INSERT INTO blog_post_tags (post_slug, tag, sort_order)
          VALUES (?, ?, ?)
          ON CONFLICT(post_slug, tag) DO UPDATE SET sort_order = excluded.sort_order
        `,
        [post.slug, tag, tagIndex],
      );
    }
  }
}

async function migrateLegacyOrders(database) {
  const existing = await database.get('SELECT COUNT(*) AS count FROM orders');
  if (existing?.count > 0) {
    return;
  }

  let legacyOrders = [];
  try {
    const raw = await readFile(LEGACY_ORDERS_FILE, 'utf8');
    const parsed = JSON.parse(raw);
    legacyOrders = Array.isArray(parsed) ? parsed : [];
  } catch {
    return;
  }

  for (const order of legacyOrders) {
    if (validateOrder(order)) {
      await upsertOrder(database, normalizeOrder(order));
    }
  }
}

function sendJson(response, status, payload) {
  response.writeHead(status, {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET,POST,PATCH,PUT,DELETE,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Content-Type': 'application/json; charset=utf-8',
  });
  response.end(JSON.stringify(payload));
}

function base64UrlEncode(value) {
  const input = typeof value === 'string' ? value : JSON.stringify(value);
  return Buffer.from(input).toString('base64url');
}

function signAdminTokenPayload(encodedPayload) {
  return createHmac('sha256', ADMIN_AUTH_SECRET).update(encodedPayload).digest('base64url');
}

function createAdminToken(username) {
  const payload = {
    sub: username,
    exp: Math.floor(Date.now() / 1000) + ADMIN_TOKEN_TTL_SECONDS,
  };
  const encodedPayload = base64UrlEncode(payload);
  return `${encodedPayload}.${signAdminTokenPayload(encodedPayload)}`;
}

function isAdminAuthConfigured() {
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

function requireAdmin(request, response) {
  if (isAdminTokenValid(getBearerToken(request))) {
    return true;
  }

  sendJson(response, 401, { error: 'Admin authentication required' });
  return false;
}

function sendFile(response, status, content, contentType) {
  response.writeHead(status, {
    'Cache-Control': status === 200 ? 'public, max-age=3600' : 'no-cache',
    'Content-Type': contentType,
  });
  response.end(content);
}

function getContentType(filePath) {
  const extension = extname(filePath).toLowerCase();
  const contentTypes = {
    '.css': 'text/css; charset=utf-8',
    '.gif': 'image/gif',
    '.html': 'text/html; charset=utf-8',
    '.ico': 'image/x-icon',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.js': 'text/javascript; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.png': 'image/png',
    '.svg': 'image/svg+xml',
    '.webp': 'image/webp',
  };

  return contentTypes[extension] || 'application/octet-stream';
}

async function serveStatic(requestPath, response) {
  const decodedPath = decodeURIComponent(requestPath.split('?')[0]);
  const cleanPath = normalize(decodedPath).replace(/^(\.\.[/\\])+/, '');
  const requestedFile = resolve(PUBLIC_DIR, `.${cleanPath === '/' ? '/index.html' : cleanPath}`);

  if (!requestedFile.startsWith(resolve(PUBLIC_DIR))) {
    sendJson(response, 403, { error: 'Forbidden' });
    return;
  }

  try {
    const content = await readFile(requestedFile);
    sendFile(response, 200, content, getContentType(requestedFile));
  } catch {
    const index = await readFile(INDEX_FILE);
    sendFile(response, 200, index, 'text/html; charset=utf-8');
  }
}

function readRequestBody(request) {
  return new Promise((resolve, reject) => {
    let body = '';
    request.on('data', (chunk) => {
      body += chunk;
      if (body.length > 1_000_000) {
        request.destroy();
        reject(new Error('Request body is too large'));
      }
    });
    request.on('end', () => resolve(body));
    request.on('error', reject);
  });
}

function validateOrder(order) {
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

function normalizeOrder(order) {
  const now = new Date().toISOString();
  return {
    ...order,
    status: normalizeStatus(order.status),
    createdAt: order.createdAt || now,
    serverReceivedAt: order.serverReceivedAt || now,
  };
}

function normalizeStatus(status) {
  return ['New', 'In Review', 'Confirmed'].includes(status) ? status : 'New';
}

async function upsertOrder(database, order) {
  await database.run(
    `
      INSERT INTO orders (
        id,
        created_at,
        server_received_at,
        status,
        customer_name,
        customer_phone,
        customer_email,
        repair_device,
        repair_issue,
        repair_service,
        repair_total,
        schedule_city,
        schedule_address,
        schedule_date,
        schedule_time_slot,
        payload_json
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET
        created_at = excluded.created_at,
        server_received_at = excluded.server_received_at,
        status = excluded.status,
        customer_name = excluded.customer_name,
        customer_phone = excluded.customer_phone,
        customer_email = excluded.customer_email,
        repair_device = excluded.repair_device,
        repair_issue = excluded.repair_issue,
        repair_service = excluded.repair_service,
        repair_total = excluded.repair_total,
        schedule_city = excluded.schedule_city,
        schedule_address = excluded.schedule_address,
        schedule_date = excluded.schedule_date,
        schedule_time_slot = excluded.schedule_time_slot,
        payload_json = excluded.payload_json
    `,
    [
      order.id,
      order.createdAt,
      order.serverReceivedAt,
      order.status,
      order.customer.fullName,
      order.customer.phone,
      order.customer.email,
      order.repair.device,
      order.repair.issue,
      order.repair.service,
      Number(order.repair.total || 0),
      order.schedule.city,
      order.schedule.address,
      order.schedule.date,
      order.schedule.timeSlot,
      JSON.stringify(order),
    ],
  );
}

async function readOrders(database) {
  const rows = await database.all('SELECT payload_json FROM orders ORDER BY datetime(created_at) DESC, id DESC');
  return rows.map((row) => JSON.parse(row.payload_json));
}

async function updateOrderStatus(database, id, status) {
  const row = await database.get('SELECT payload_json FROM orders WHERE id = ?', id);
  if (!row) {
    return null;
  }

  const order = JSON.parse(row.payload_json);
  const updatedOrder = { ...order, status: normalizeStatus(status) };
  await upsertOrder(database, updatedOrder);
  return updatedOrder;
}

async function readBlogPosts(database) {
  const rows = await database.all(`
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
      p.published_at AS publishedAt,
      GROUP_CONCAT(t.tag, '|||') AS tags
    FROM blog_posts p
    LEFT JOIN blog_post_tags t ON t.post_slug = p.slug
    GROUP BY p.slug
    ORDER BY p.sort_order ASC, p.post_date DESC, p.title ASC
  `);

  return rows.map((row) => ({
    slug: row.slug,
    title: row.title,
    copy: row.copy,
    date: row.date,
    tag: row.tag,
    category: row.category,
    tags: row.tags ? String(row.tags).split('|||') : [],
    tone: row.tone,
    image: row.image,
    author: row.author,
    status: row.status,
    views: row.views,
    publishedAt: row.publishedAt || undefined,
  }));
}

async function readBlogPost(database, slug) {
  const posts = await readBlogPosts(database);
  return posts.find((post) => post.slug === slug) ?? null;
}

async function upsertBlogPost(database, post) {
  const normalized = normalizeBlogPost(post);
  await database.run(
    `
      INSERT INTO blog_posts (
        slug, title, copy, post_date, tag, category, tone, image,
        author, status, views, published_at, sort_order, updated_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(slug) DO UPDATE SET
        title = excluded.title,
        copy = excluded.copy,
        post_date = excluded.post_date,
        tag = excluded.tag,
        category = excluded.category,
        tone = excluded.tone,
        image = excluded.image,
        author = excluded.author,
        status = excluded.status,
        views = excluded.views,
        published_at = excluded.published_at,
        sort_order = excluded.sort_order,
        updated_at = excluded.updated_at
    `,
    [
      normalized.slug,
      normalized.title,
      normalized.copy,
      normalized.date,
      normalized.tag,
      normalized.category,
      normalized.tone,
      normalized.image,
      normalized.author,
      normalized.status,
      normalized.views,
      normalized.publishedAt,
      normalized.sortOrder ?? 0,
      new Date().toISOString(),
    ],
  );

  await database.run('DELETE FROM blog_post_tags WHERE post_slug = ?', normalized.slug);
  for (const [index, tag] of normalized.tags.entries()) {
    await database.run(
      `
        INSERT INTO blog_post_tags (post_slug, tag, sort_order)
        VALUES (?, ?, ?)
        ON CONFLICT(post_slug, tag) DO UPDATE SET sort_order = excluded.sort_order
      `,
      [normalized.slug, tag, index],
    );
  }

  return readBlogPost(database, normalized.slug);
}

async function deleteBlogPost(database, slug) {
  const result = await database.run('DELETE FROM blog_posts WHERE slug = ?', slug);
  return Number(result.changes ?? 0) > 0;
}

async function readContentOverrides(database) {
  const rows = await database.all('SELECT section_key, payload_json, updated_at, customized FROM content_sections ORDER BY section_key ASC');
  return rows.map((row) => ({
    key: row.section_key,
    updatedAt: row.updated_at,
    payload: JSON.parse(row.payload_json),
    customized: Boolean(row.customized),
  }));
}

async function readMergedSiteContent(database) {
  const defaults = await getSiteContent(PROJECT_DIR);
  const sections = await readContentOverrides(database);
  let content = structuredClone(defaults);
  for (const section of sections) {
    if (isNonEmptyObject(section.payload)) {
      content[section.key] = section.payload;
    }
  }
  content = mergeStructuredContent(content, await readStructuredContent(database));
  content.blogs = { posts: await readBlogPosts(database) };
  return content;
}

async function readContentSections(database) {
  const defaults = await getSiteContent(PROJECT_DIR);
  const overrides = await readContentOverrides(database);
  const overrideMap = new Map(overrides.map((section) => [section.key, section]));
  const keys = [...new Set([...Object.keys(defaults), ...overrides.map((section) => section.key), 'blogs'])].sort();

  const sections = keys.map((key) => {
    const override = overrideMap.get(key);
    return {
      key,
      customized: Boolean(override?.customized),
      updatedAt: override?.updatedAt ?? null,
      payload: override?.payload ?? defaults[key],
      defaultPayload: defaults[key] ?? null,
    };
  });
  const structured = await readStructuredContent(database);
  for (const section of sections) {
    if (structured[section.key]) {
      section.payload = mergeStructuredContent({ [section.key]: section.payload ?? defaults[section.key] ?? {} }, { [section.key]: structured[section.key] })[section.key];
    }
  }
  const blogs = sections.find((section) => section.key === 'blogs');
  if (blogs) {
    blogs.customized = true;
    blogs.payload = { posts: await readBlogPosts(database) };
    blogs.defaultPayload = defaults.blogs ?? { posts: [] };
  }

  return sections;
}

async function upsertContentSection(database, key, payload) {
  const now = new Date().toISOString();
  if (key === 'blogs') {
    await replaceBlogPosts(database, Array.isArray(payload?.posts) ? payload.posts : []);
    return { key, payload: { posts: await readBlogPosts(database) }, updatedAt: now, customized: true };
  }

  const structured = await replaceStructuredContentSection(database, key, payload);
  await database.run(
    `
      INSERT INTO content_sections (section_key, payload_json, updated_at, customized)
      VALUES (?, ?, ?, 1)
      ON CONFLICT(section_key) DO UPDATE SET
        payload_json = excluded.payload_json,
        updated_at = excluded.updated_at,
        customized = 1
    `,
    [key, JSON.stringify(structured ? {} : payload), now],
  );

  return { key, payload: structured ? (await readStructuredContent(database))[key] : payload, updatedAt: now, customized: true };
}

async function deleteContentSection(database, key) {
  const defaults = await getSiteContent(PROJECT_DIR);
  if (defaults[key] === undefined) {
    return 0;
  }

  if (key === 'blogs') {
    await replaceBlogPosts(database, defaults.blogs?.posts ?? []);
    return 1;
  }

  const structured = await replaceStructuredContentSection(database, key, defaults[key]);
  const result = await database.run(
    `INSERT INTO content_sections (section_key, payload_json, updated_at, customized)
     VALUES (?, ?, ?, 0)
     ON CONFLICT(section_key) DO UPDATE SET
       payload_json = excluded.payload_json,
       updated_at = excluded.updated_at,
       customized = 0`,
    [key, JSON.stringify(structured ? {} : defaults[key]), new Date().toISOString()],
  );
  return result.changes ?? 0;
}

const server = createServer(async (request, response) => {
  if (request.method === 'OPTIONS') {
    sendJson(response, 204, {});
    return;
  }

  const url = new URL(request.url ?? '/', `http://${request.headers.host}`);

  try {
    const database = await getDatabase();

    if (request.method === 'GET' && url.pathname === '/api/health') {
      const count = await database.get('SELECT COUNT(*) AS orders FROM orders');
      sendJson(response, 200, {
        ok: true,
        service: 'omarphone-api',
        database: 'sqlite',
        orders: count?.orders ?? 0,
      });
      return;
    }

    if (request.method === 'POST' && url.pathname === '/api/admin/login') {
      if (!isAdminAuthConfigured()) {
        sendJson(response, 503, { error: 'Admin authentication is not configured' });
        return;
      }

      const raw = await readRequestBody(request);
      const body = JSON.parse(raw || '{}');
      const username = String(body.username || '').trim();
      const password = String(body.password || '');

      if (username !== ADMIN_USERNAME || password !== ADMIN_PASSWORD) {
        sendJson(response, 401, { error: 'Invalid admin credentials' });
        return;
      }

      sendJson(response, 200, {
        token: createAdminToken(username),
        expiresIn: ADMIN_TOKEN_TTL_SECONDS,
      });
      return;
    }

    if (request.method === 'GET' && url.pathname === '/api/orders') {
      if (!requireAdmin(request, response)) {
        return;
      }
      sendJson(response, 200, { orders: await readOrders(database) });
      return;
    }

    if (request.method === 'GET' && url.pathname === '/api/content') {
      sendJson(response, 200, await readMergedSiteContent(database));
      return;
    }

    if (request.method === 'POST' && url.pathname === '/api/media') {
      if (!requireAdmin(request, response)) {
        return;
      }

      const raw = await readRequestBody(request);
      const media = await createMediaAsset(database, JSON.parse(raw || '{}'));
      sendJson(response, 201, { media });
      return;
    }

    const mediaMatch = url.pathname.match(/^\/api\/media\/([^/]+)$/);
    if (mediaMatch && request.method === 'GET') {
      const media = await readMediaAsset(database, decodeURIComponent(mediaMatch[1]));
      if (!media) {
        sendJson(response, 404, { error: 'Media asset not found' });
        return;
      }

      response.writeHead(200, {
        'Cache-Control': 'public, max-age=31536000, immutable',
        'Content-Type': media.contentType,
      });
      response.end(Buffer.from(media.dataBase64, 'base64'));
      return;
    }

    if (mediaMatch && request.method === 'DELETE') {
      if (!requireAdmin(request, response)) {
        return;
      }

      const deleted = await deleteMediaAsset(database, decodeURIComponent(mediaMatch[1]));
      sendJson(response, deleted ? 200 : 404, deleted ? { ok: true } : { error: 'Media asset not found' });
      return;
    }

    const isBlogCollection = url.pathname === '/api/blogs' || url.pathname === '/api/blog-posts';
    if (request.method === 'GET' && isBlogCollection) {
      const posts = await readBlogPosts(database);
      sendJson(response, 200, { resource: 'blogs', rows: posts, posts });
      return;
    }

    if (request.method === 'POST' && isBlogCollection) {
      if (!requireAdmin(request, response)) {
        return;
      }

      const raw = await readRequestBody(request);
      const post = await upsertBlogPost(database, JSON.parse(raw || '{}'));
      sendJson(response, 201, { row: post, post });
      return;
    }

    const blogPostMatch = url.pathname.match(/^\/api\/(?:blogs|blog-posts)\/([^/]+)$/);
    if (blogPostMatch && request.method === 'GET') {
      const post = await readBlogPost(database, decodeURIComponent(blogPostMatch[1]));
      if (!post) {
        sendJson(response, 404, { error: 'Blog post not found' });
        return;
      }

      sendJson(response, 200, { post });
      return;
    }

    if (blogPostMatch && (request.method === 'PUT' || request.method === 'PATCH')) {
      if (!requireAdmin(request, response)) {
        return;
      }

      const raw = await readRequestBody(request);
      const slug = decodeURIComponent(blogPostMatch[1]);
      const existing = request.method === 'PATCH' ? await readBlogPost(database, slug) : null;
      const post = await upsertBlogPost(database, {
        ...(existing ?? {}),
        ...JSON.parse(raw || '{}'),
        slug,
      });
      sendJson(response, 200, { row: post, post });
      return;
    }

    if (blogPostMatch && request.method === 'DELETE') {
      if (!requireAdmin(request, response)) {
        return;
      }

      const deleted = await deleteBlogPost(database, decodeURIComponent(blogPostMatch[1]));
      sendJson(response, deleted ? 200 : 404, deleted ? { ok: true } : { error: 'Blog post not found' });
      return;
    }

    if (request.method === 'GET' && url.pathname === '/api/content-sections') {
      if (!requireAdmin(request, response)) {
        return;
      }
      sendJson(response, 200, { sections: await readContentSections(database) });
      return;
    }

    if (request.method === 'GET' && url.pathname === '/api/content-resources') {
      if (!requireAdmin(request, response)) {
        return;
      }
      sendJson(response, 200, {
        resources: [
          {
            key: 'blogs',
            endpoint: '/api/blogs',
            section: 'blogs',
            property: 'posts',
            table: 'blog_posts',
            columns: ['slug', 'title', 'copy', 'date', 'tag', 'category', 'tags', 'tone', 'image', 'author', 'status', 'views', 'publishedAt'],
            idField: 'slug',
          },
          ...CONTENT_RESOURCE_DEFINITIONS,
        ],
      });
      return;
    }

    const resourceMatch = url.pathname.match(/^\/api\/([a-z0-9-]+)(?:\/([^/]+))?$/);
    const resourceName = resourceMatch?.[1] ?? '';
    const resourceTable = CONTENT_RESOURCES[resourceName];
    if (resourceTable) {
      if (!requireAdmin(request, response)) {
        return;
      }

      const resourceId = resourceMatch?.[2] ? decodeURIComponent(resourceMatch[2]) : null;
      if (!resourceId && request.method === 'GET') {
        sendJson(response, 200, { resource: resourceName, rows: await readContentTableRows(database, resourceTable) });
        return;
      }

      if (!resourceId && request.method === 'POST') {
        const raw = await readRequestBody(request);
        const row = await upsertContentTableRow(database, resourceTable, null, JSON.parse(raw || '{}'));
        sendJson(response, 201, { row });
        return;
      }

      if (resourceId && (request.method === 'PUT' || request.method === 'PATCH')) {
        const raw = await readRequestBody(request);
        const row = await upsertContentTableRow(database, resourceTable, resourceId, JSON.parse(raw || '{}'));
        sendJson(response, 200, { row });
        return;
      }

      if (resourceId && request.method === 'DELETE') {
        const deleted = await deleteContentTableRow(database, resourceTable, resourceId);
        sendJson(response, deleted ? 200 : 404, deleted ? { ok: true } : { error: 'Content row not found' });
        return;
      }
    }

    if (request.method === 'GET' && url.pathname === '/api/content-tables') {
      if (!requireAdmin(request, response)) {
        return;
      }
      sendJson(response, 200, { tables: listContentTables() });
      return;
    }

    const contentTableRowMatch = url.pathname.match(/^\/api\/content-tables\/([^/]+)\/([^/]+)$/);
    if (contentTableRowMatch && (request.method === 'PUT' || request.method === 'PATCH')) {
      if (!requireAdmin(request, response)) {
        return;
      }

      const raw = await readRequestBody(request);
      const row = await upsertContentTableRow(
        database,
        decodeURIComponent(contentTableRowMatch[1]),
        decodeURIComponent(contentTableRowMatch[2]),
        JSON.parse(raw || '{}'),
      );
      sendJson(response, 200, { row });
      return;
    }

    if (contentTableRowMatch && request.method === 'DELETE') {
      if (!requireAdmin(request, response)) {
        return;
      }

      const deleted = await deleteContentTableRow(
        database,
        decodeURIComponent(contentTableRowMatch[1]),
        decodeURIComponent(contentTableRowMatch[2]),
      );
      sendJson(response, deleted ? 200 : 404, deleted ? { ok: true } : { error: 'Content row not found' });
      return;
    }

    const contentTableMatch = url.pathname.match(/^\/api\/content-tables\/([^/]+)$/);
    if (contentTableMatch && request.method === 'GET') {
      if (!requireAdmin(request, response)) {
        return;
      }
      const table = decodeURIComponent(contentTableMatch[1]);
      sendJson(response, 200, { table, rows: await readContentTableRows(database, table) });
      return;
    }

    if (contentTableMatch && request.method === 'POST') {
      if (!requireAdmin(request, response)) {
        return;
      }

      const raw = await readRequestBody(request);
      const row = await upsertContentTableRow(database, decodeURIComponent(contentTableMatch[1]), null, JSON.parse(raw || '{}'));
      sendJson(response, 201, { row });
      return;
    }

    if ((request.method === 'PUT' || request.method === 'POST') && url.pathname === '/api/content-section') {
      if (!requireAdmin(request, response)) {
        return;
      }
      const raw = await readRequestBody(request);
      const body = JSON.parse(raw || '{}');
      const key = url.searchParams.get('key') || '';
      const payload = body.payload;

      if (!key || payload === null || typeof payload !== 'object') {
        sendJson(response, 400, { error: 'Content section payload must be an object or array' });
        return;
      }

      const section = await upsertContentSection(database, key, payload);
      sendJson(response, 200, { section, sections: await readContentSections(database) });
      return;
    }

    if (request.method === 'DELETE' && url.pathname === '/api/content-section') {
      if (!requireAdmin(request, response)) {
        return;
      }
      const key = url.searchParams.get('key') || '';
      await deleteContentSection(database, key);
      sendJson(response, 200, { ok: true, sections: await readContentSections(database) });
      return;
    }

    const contentSectionMatch = url.pathname.match(/^\/api\/content-sections\/([^/]+)$/);
    if ((request.method === 'PUT' || request.method === 'POST') && contentSectionMatch) {
      if (!requireAdmin(request, response)) {
        return;
      }
      const raw = await readRequestBody(request);
      const body = JSON.parse(raw || '{}');
      const key = decodeURIComponent(contentSectionMatch[1]);
      const payload = body.payload;

      if (!key || payload === null || typeof payload !== 'object') {
        sendJson(response, 400, { error: 'Content section payload must be an object or array' });
        return;
      }

      const section = await upsertContentSection(database, key, payload);
      sendJson(response, 200, { section, sections: await readContentSections(database) });
      return;
    }

    if (request.method === 'DELETE' && contentSectionMatch) {
      if (!requireAdmin(request, response)) {
        return;
      }
      const key = decodeURIComponent(contentSectionMatch[1]);
      await deleteContentSection(database, key);
      sendJson(response, 200, { ok: true, sections: await readContentSections(database) });
      return;
    }

    if (request.method === 'POST' && url.pathname === '/api/orders') {
      const raw = await readRequestBody(request);
      const order = normalizeOrder(JSON.parse(raw));

      if (!validateOrder(order)) {
        sendJson(response, 400, { error: 'Missing required order fields' });
        return;
      }

      await upsertOrder(database, order);
      sendJson(response, 201, { order });
      return;
    }

    const statusMatch = url.pathname.match(/^\/api\/orders\/([^/]+)\/status$/);
    if (request.method === 'PATCH' && statusMatch) {
      if (!requireAdmin(request, response)) {
        return;
      }
      const raw = await readRequestBody(request);
      const body = JSON.parse(raw || '{}');
      const order = await updateOrderStatus(database, statusMatch[1], body.status);

      if (!order) {
        sendJson(response, 404, { error: 'Order not found' });
        return;
      }

      sendJson(response, 200, { order, orders: await readOrders(database) });
      return;
    }

    if (request.method === 'GET') {
      await serveStatic(url.pathname, response);
      return;
    }

    sendJson(response, 404, { error: 'Not found' });
  } catch (error) {
    sendJson(response, 500, { error: error instanceof Error ? error.message : 'Server error' });
  }
});

server.listen(PORT, () => {
  console.log(`OmarPhone API running at http://127.0.0.1:${PORT}`);
  console.log(`SQLite database: ${DATABASE_FILE}`);
});
