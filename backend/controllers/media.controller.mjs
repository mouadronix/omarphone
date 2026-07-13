import { sendJson } from '../../api/_store.mjs';
import { readJsonBody } from '../http/request.mjs';
import { requireAdmin } from '../services/admin.service.mjs';
import { createMediaAsset, deleteMediaAsset, readMediaAsset } from '../services/media.service.mjs';

export async function handleMedia(request, response, id = null) {
  if (!id && request.method === 'POST') {
    if (!requireAdmin(request, response)) {
      return;
    }
    const media = await createMediaAsset(await readJsonBody(request));
    sendJson(response, 201, { media });
    return;
  }

  if (id && request.method === 'GET') {
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

  if (id && request.method === 'DELETE') {
    if (!requireAdmin(request, response)) {
      return;
    }
    const deleted = await deleteMediaAsset(id);
    sendJson(response, deleted ? 200 : 404, deleted ? { ok: true } : { error: 'Media asset not found' });
    return;
  }

  sendJson(response, 405, { error: 'Method not allowed' });
}
