import { handleContentSection } from './_content-section-handler.mjs';

export default async function handler(request, response) {
  const queryKey = Array.isArray(request.query?.key) ? request.query.key[0] : request.query?.key;
  await handleContentSection(request, response, queryKey ? String(queryKey) : '');
}
