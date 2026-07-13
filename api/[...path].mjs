import { CONTENT_RESOURCE_DEFINITIONS, CONTENT_RESOURCES } from '../backend/content-tables.mjs';
import {
  createAdminToken,
  createMediaAsset,
  deleteBlogPost,
  deleteContentSection,
  deleteContentTableRow,
  deleteMediaAsset,
  getAdminTokenTtlSeconds,
  isAdminAuthConfigured,
  listContentTables,
  readBlogPost,
  readBlogPosts,
  readContentSections,
  readContentTableRows,
  readMediaAsset,
  readMergedSiteContent,
  readOrders,
  requireAdmin,
  sendJson,
  updateOrderStatus,
  upsertBlogPost,
  upsertContentSection,
  upsertContentTableRow,
  upsertOrder,
  validateOrder,
  verifyAdminCredentials,
} from './_store.mjs';

async function getRequestBody(request) {
  if (request.body && typeof request.body === 'object') {
    return request.body;
  }

  const chunks = [];
  for await (const chunk of request) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }

  const raw = Buffer.concat(chunks).toString('utf8').trim();
  return raw ? JSON.parse(raw) : {};
}

function pathParts(request) {
  const url = new URL(request.url ?? '/', `https://${request.headers.host || 'omarphone.vercel.app'}`);
  return url.pathname.replace(/^\/api\/?/, '').split('/').filter(Boolean).map(decodeURIComponent);
}

export default async function handler(request, response) {
  if (request.method === 'OPTIONS') {
    sendJson(response, 204, {});
    return;
  }

  const [resourceName, id, action] = pathParts(request);

  try {
    if (request.method === 'POST' && resourceName === 'admin' && id === 'login') {
      if (!isAdminAuthConfigured()) {
        sendJson(response, 503, { error: 'Admin authentication is not configured' });
        return;
      }

      const body = await getRequestBody(request);
      if (!verifyAdminCredentials(body.username, body.password)) {
        sendJson(response, 401, { error: 'Invalid admin credentials' });
        return;
      }

      sendJson(response, 200, {
        token: createAdminToken(String(body.username).trim()),
        expiresIn: getAdminTokenTtlSeconds(),
      });
      return;
    }

    if (request.method === 'GET' && resourceName === 'content') {
      sendJson(response, 200, await readMergedSiteContent());
      return;
    }

    if (request.method === 'GET' && resourceName === 'content-sections') {
      if (!requireAdmin(request, response)) {
        return;
      }
      sendJson(response, 200, { sections: await readContentSections() });
      return;
    }

    if (request.method === 'GET' && resourceName === 'content-resources') {
      if (!requireAdmin(request, response)) {
        return;
      }
      sendJson(response, 200, { resources: CONTENT_RESOURCE_DEFINITIONS });
      return;
    }

    if (resourceName === 'content-section') {
      if (!requireAdmin(request, response)) {
        return;
      }

      const url = new URL(request.url ?? '/', `https://${request.headers.host || 'omarphone.vercel.app'}`);
      const key = url.searchParams.get('key') || '';
      if ((request.method === 'PUT' || request.method === 'POST') && key) {
        const body = await getRequestBody(request);
        const section = await upsertContentSection(key, body.payload);
        sendJson(response, 200, { section, sections: await readContentSections() });
        return;
      }

      if (request.method === 'DELETE' && key) {
        await deleteContentSection(key);
        sendJson(response, 200, { ok: true, sections: await readContentSections() });
        return;
      }
    }

    if (resourceName === 'content-tables') {
      if (!requireAdmin(request, response)) {
        return;
      }

      if (!id && request.method === 'GET') {
        sendJson(response, 200, { tables: listContentTables() });
        return;
      }

      if (id && !action && request.method === 'GET') {
        sendJson(response, 200, { table: id, rows: await readContentTableRows(id) });
        return;
      }

      if (id && !action && request.method === 'POST') {
        const row = await upsertContentTableRow(id, null, await getRequestBody(request));
        sendJson(response, 201, { row });
        return;
      }

      if (id && action && (request.method === 'PUT' || request.method === 'PATCH')) {
        const row = await upsertContentTableRow(id, action, await getRequestBody(request));
        sendJson(response, 200, { row });
        return;
      }

      if (id && action && request.method === 'DELETE') {
        const deleted = await deleteContentTableRow(id, action);
        sendJson(response, deleted ? 200 : 404, deleted ? { ok: true } : { error: 'Content row not found' });
        return;
      }
    }

    if (resourceName === 'blog-posts') {
      if (!id && request.method === 'GET') {
        sendJson(response, 200, { posts: await readBlogPosts() });
        return;
      }

      if (!id && request.method === 'POST') {
        if (!requireAdmin(request, response)) {
          return;
        }
        const post = await upsertBlogPost(await getRequestBody(request));
        sendJson(response, 201, { post });
        return;
      }

      if (id && request.method === 'GET') {
        const post = await readBlogPost(id);
        sendJson(response, post ? 200 : 404, post ? { post } : { error: 'Blog post not found' });
        return;
      }

      if (id && (request.method === 'PUT' || request.method === 'PATCH')) {
        if (!requireAdmin(request, response)) {
          return;
        }
        const existing = request.method === 'PATCH' ? await readBlogPost(id) : null;
        const post = await upsertBlogPost({ ...(existing ?? {}), ...(await getRequestBody(request)), slug: id });
        sendJson(response, 200, { post });
        return;
      }

      if (id && request.method === 'DELETE') {
        if (!requireAdmin(request, response)) {
          return;
        }
        const deleted = await deleteBlogPost(id);
        sendJson(response, deleted ? 200 : 404, deleted ? { ok: true } : { error: 'Blog post not found' });
        return;
      }
    }

    if (resourceName === 'orders') {
      if (!id && request.method === 'GET') {
        if (!requireAdmin(request, response)) {
          return;
        }
        sendJson(response, 200, { orders: await readOrders() });
        return;
      }

      if (!id && request.method === 'POST') {
        const body = await getRequestBody(request);
        if (!validateOrder(body)) {
          sendJson(response, 400, { error: 'Missing required order fields' });
          return;
        }
        const result = await upsertOrder(body);
        sendJson(response, 201, { order: result.order });
        return;
      }

      if (id && action === 'status' && request.method === 'PATCH') {
        if (!requireAdmin(request, response)) {
          return;
        }
        const result = await updateOrderStatus(id, (await getRequestBody(request)).status);
        sendJson(response, result ? 200 : 404, result ?? { error: 'Order not found' });
        return;
      }
    }

    if (resourceName === 'media') {
      if (!id && request.method === 'POST') {
        if (!requireAdmin(request, response)) {
          return;
        }
        const media = await createMediaAsset(await getRequestBody(request));
        sendJson(response, 201, { media });
        return;
      }

      if (id && request.method === 'GET') {
        const media = await readMediaAsset(id);
        if (!media) {
          sendJson(response, 404, { error: 'Media asset not found' });
          return;
        }
        response.setHeader('Content-Type', media.contentType);
        response.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
        response.send(Buffer.from(media.dataBase64, 'base64'));
        return;
      }

      if (id && request.method === 'DELETE') {
        if (!requireAdmin(request, response)) {
          return;
        }
        const deleted = await deleteMediaAsset(id);
        sendJson(response, deleted ? 200 : 404, deleted ? { ok: true } : { error: 'Media asset not found' });
        return;
      }
    }

    const table = CONTENT_RESOURCES[resourceName];
    if (table) {
      if (!requireAdmin(request, response)) {
        return;
      }

      if (!id && request.method === 'GET') {
        sendJson(response, 200, { resource: resourceName, rows: await readContentTableRows(table) });
        return;
      }

      if (!id && request.method === 'POST') {
        const row = await upsertContentTableRow(table, null, await getRequestBody(request));
        sendJson(response, 201, { row });
        return;
      }

      if (id && (request.method === 'PUT' || request.method === 'PATCH')) {
        const row = await upsertContentTableRow(table, id, await getRequestBody(request));
        sendJson(response, 200, { row });
        return;
      }

      if (id && request.method === 'DELETE') {
        const deleted = await deleteContentTableRow(table, id);
        sendJson(response, deleted ? 200 : 404, deleted ? { ok: true } : { error: 'Content row not found' });
        return;
      }
    }

    sendJson(response, 404, { error: 'API route not found' });
  } catch (error) {
    sendJson(response, error.statusCode || 500, { error: error.message || 'Server error' });
  }
}
