import { CONTENT_RESOURCES } from '../backend/content-tables.mjs';
import { deleteContentTableRow, readContentTableRows, requireAdmin, sendJson, upsertContentTableRow } from './_store.mjs';

export async function handleContentResource(request, response, resourceName) {
  if (!requireAdmin(request, response)) {
    return;
  }

  const table = CONTENT_RESOURCES[resourceName];
  if (!table) {
    sendJson(response, 404, { error: 'Unknown content resource' });
    return;
  }

  const id = request.query?.id ? String(request.query.id) : null;

  try {
    if (!id && request.method === 'GET') {
      sendJson(response, 200, { resource: resourceName, rows: await readContentTableRows(table) });
      return;
    }

    if (!id && request.method === 'POST') {
      const row = await upsertContentTableRow(table, null, request.body ?? {});
      sendJson(response, 201, { row });
      return;
    }

    if (id && (request.method === 'PUT' || request.method === 'PATCH')) {
      const row = await upsertContentTableRow(table, id, request.body ?? {});
      sendJson(response, 200, { row });
      return;
    }

    if (id && request.method === 'DELETE') {
      const deleted = await deleteContentTableRow(table, id);
      sendJson(response, deleted ? 200 : 404, deleted ? { ok: true } : { error: 'Content row not found' });
      return;
    }

    sendJson(response, 405, { error: 'Method not allowed' });
  } catch (error) {
    sendJson(response, error.statusCode || 500, { error: error.message || 'Server error' });
  }
}
