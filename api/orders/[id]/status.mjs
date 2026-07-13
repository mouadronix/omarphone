import { requireAdmin, sendJson, updateOrderStatus } from '../../_store.mjs';

export default async function handler(request, response) {
  if (request.method !== 'PATCH') {
    sendJson(response, 405, { error: 'Method not allowed' });
    return;
  }

  if (!requireAdmin(request, response)) {
    return;
  }

  const { id } = request.query;
  const result = await updateOrderStatus(String(id), request.body?.status);
  if (!result) {
    sendJson(response, 404, { error: 'Order not found' });
    return;
  }

  sendJson(response, 200, result);
}
