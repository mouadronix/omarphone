import { deleteMediaAsset, readMediaAsset, requireAdmin, sendJson } from '../_store.mjs';

export default async function handler(request, response) {
  const id = String(request.query?.id || '');

  try {
    if (request.method === 'GET') {
      const media = await readMediaAsset(id);
      if (!media) {
        sendJson(response, 404, { error: 'Media asset not found' });
        return;
      }

      response.setHeader('Content-Type', media.contentType);
      response.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
      response.send(Buffer.from(media.dataBase64, 'base64'));
      return;
    }

    if (request.method === 'DELETE') {
      if (!requireAdmin(request, response)) {
        return;
      }

      const deleted = await deleteMediaAsset(id);
      sendJson(response, deleted ? 200 : 404, deleted ? { ok: true } : { error: 'Media asset not found' });
      return;
    }

    sendJson(response, 405, { error: 'Method not allowed' });
  } catch (error) {
    sendJson(response, error.statusCode || 500, { error: error.message || 'Server error' });
  }
}
