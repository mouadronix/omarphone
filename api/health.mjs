import { hasDatabase, readOrders, sendJson } from './_store.mjs';

export default async function handler(request, response) {
  if (request.method !== 'GET') {
    sendJson(response, 405, { error: 'Method not allowed' });
    return;
  }

  const orders = await readOrders();
  sendJson(response, 200, {
    ok: true,
    service: 'omarphone-vercel-api',
    database: hasDatabase() ? 'postgres' : 'memory-fallback',
    orders: orders.length,
  });
}
