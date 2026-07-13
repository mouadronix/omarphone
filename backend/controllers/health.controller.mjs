import { sendJson } from '../../api/_store.mjs';
import { getHealthStatus } from '../services/health.service.mjs';

export async function showHealth(request, response) {
  if (request.method !== 'GET') {
    sendJson(response, 405, { error: 'Method not allowed' });
    return;
  }

  sendJson(response, 200, await getHealthStatus());
}

