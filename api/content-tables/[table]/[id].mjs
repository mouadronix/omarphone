import { deleteContentTableRow, requireAdmin, sendJson, upsertContentTableRow } from '../../_store.mjs';

export default async function handler(request, response) {
  if (!requireAdmin(request, response)) {
    return;
  }

  const table = String(request.query?.table || '');
  const id = String(request.query?.id || '');

  try {
    if (request.method === 'PUT' || request.method === 'PATCH') {
      const row = await upsertContentTableRow(table, id, request.body ?? {});
      sendJson(response, 200, { row });
      return;
    }

    if (request.method === 'DELETE') {
      const deleted = await deleteContentTableRow(table, id);
      sendJson(response, deleted ? 200 : 404, deleted ? { ok: true } : { error: 'Content row not found' });
      return;
    }

    sendJson(response, 405, { error: 'Method not allowed' });
  } catch (error) {
    sendJson(response, error.statusCode || 500, { error: error.message || 'Server error' });
  }
}
