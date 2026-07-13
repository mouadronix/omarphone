import { handleContentSection } from '../_content-section-handler.mjs';

export default async function handler(request, response) {
  const { key } = request.query;
  const sectionKey = String(key);
  await handleContentSection(request, response, sectionKey);
}
