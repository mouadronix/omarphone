import { readContentSections, requireAdmin, sendJson } from '../_store.mjs';

export default async function handler(request, response) {
  if (request.method === 'GET') {
    if (!requireAdmin(request, response)) {
      return;
    }
    sendJson(response, 200, { sections: await readContentSections() });
    return;
  }

  sendJson(response, 405, { error: 'Method not allowed' });
}
