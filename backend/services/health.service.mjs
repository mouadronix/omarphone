import { hasDatabase, readOrders } from '../../api/_store.mjs';

export async function getHealthStatus() {
  const orders = await readOrders();
  return {
    ok: true,
    service: 'omarphone-vercel-api',
    database: hasDatabase() ? 'postgres' : 'memory-fallback',
    orders: orders.length,
  };
}
