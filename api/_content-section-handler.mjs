import { deleteContentSection, readContentSections, requireAdmin, sendJson, upsertContentSection } from './_store.mjs';

export async function handleContentSection(request, response, sectionKey) {
  if (!requireAdmin(request, response)) {
    return;
  }

  if (!sectionKey) {
    sendJson(response, 400, { error: 'Content section key is required' });
    return;
  }

  if (request.method === 'GET') {
    const sections = await readContentSections();
    const section = sections.find((item) => item.key === sectionKey);

    if (!section) {
      sendJson(response, 404, { error: 'Content section not found' });
      return;
    }

    sendJson(response, 200, { section });
    return;
  }

  if (request.method === 'PUT' || request.method === 'POST') {
    const payload = request.body?.payload;
    if (payload === null || typeof payload !== 'object') {
      sendJson(response, 400, { error: 'Content section payload must be an object or array' });
      return;
    }

    const section = await upsertContentSection(sectionKey, payload);
    sendJson(response, 200, { section, sections: await readContentSections() });
    return;
  }

  if (request.method === 'DELETE') {
    await deleteContentSection(sectionKey);
    sendJson(response, 200, { ok: true, sections: await readContentSections() });
    return;
  }

  sendJson(response, 405, { error: 'Method not allowed' });
}
