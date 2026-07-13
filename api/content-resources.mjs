import { CONTENT_RESOURCE_DEFINITIONS } from '../backend/content-tables.mjs';
import { requireAdmin, sendJson } from './_store.mjs';

export default async function handler(request, response) {
  if (!requireAdmin(request, response)) {
    return;
  }

  if (request.method !== 'GET') {
    sendJson(response, 405, { error: 'Method not allowed' });
    return;
  }

  sendJson(response, 200, { resources: CONTENT_RESOURCE_DEFINITIONS });
}
