import { readContentTableRows, requireAdmin, sendJson, upsertContentTableRow } from '../_store.mjs';

export default async function handler(request, response) {
  if (!requireAdmin(request, response)) {
    return;
  }

  const table = String(request.query?.table || '');

  try {
    if (request.method === 'GET') {
      sendJson(response, 200, { table, rows: await readContentTableRows(table) });
      return;
    }

    if (request.method === 'POST') {
      const row = await upsertContentTableRow(table, null, request.body ?? {});
      sendJson(response, 201, { row });
      return;
    }

    sendJson(response, 405, { error: 'Method not allowed' });
  } catch (error) {
    sendJson(response, error.statusCode || 500, { error: error.message || 'Server error' });
  }
}
