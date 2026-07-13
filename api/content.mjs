import { readMergedSiteContent, sendJson } from './_store.mjs';

export default async function handler(request, response) {
  if (request.method !== 'GET') {
    sendJson(response, 405, { error: 'Method not allowed' });
    return;
  }

  sendJson(response, 200, await readMergedSiteContent());
}
