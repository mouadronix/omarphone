import { createMediaAsset, requireAdmin, sendJson } from './_store.mjs';

export default async function handler(request, response) {
  if (!requireAdmin(request, response)) {
    return;
  }

  if (request.method !== 'POST') {
    sendJson(response, 405, { error: 'Method not allowed' });
    return;
  }

  try {
    const media = await createMediaAsset(request.body ?? {});
    sendJson(response, 201, { media });
  } catch (error) {
    sendJson(response, error.statusCode || 500, { error: error.message || 'Server error' });
  }
}
