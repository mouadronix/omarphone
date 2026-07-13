import { readOrders, requireAdmin, sendJson, upsertOrder, validateOrder } from './_store.mjs';

export default async function handler(request, response) {
  if (request.method === 'GET') {
    if (!requireAdmin(request, response)) {
      return;
    }
    sendJson(response, 200, { orders: await readOrders() });
    return;
  }

  if (request.method === 'POST') {
    const order = request.body;
    if (!validateOrder(order)) {
      sendJson(response, 400, { error: 'Missing required order fields' });
      return;
    }

    const result = await upsertOrder(order);
    sendJson(response, 201, { order: result.order });
    return;
  }

  sendJson(response, 405, { error: 'Method not allowed' });
}
