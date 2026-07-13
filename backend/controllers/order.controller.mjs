import { sendJson } from '../../api/_store.mjs';
import { readJsonBody } from '../http/request.mjs';
import { requireAdmin } from '../services/admin.service.mjs';
import { readOrders, updateOrderStatus, upsertOrder, validateOrder } from '../services/order.service.mjs';

export async function handleOrders(request, response, id = null, action = null) {
  if (!id && request.method === 'GET') {
    if (!requireAdmin(request, response)) {
      return;
    }
    sendJson(response, 200, { orders: await readOrders() });
    return;
  }

  if (!id && request.method === 'POST') {
    const body = await readJsonBody(request);
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
    const result = await updateOrderStatus(id, (await readJsonBody(request)).status);
    sendJson(response, result ? 200 : 404, result ?? { error: 'Order not found' });
    return;
  }

  sendJson(response, 405, { error: 'Method not allowed' });
}

