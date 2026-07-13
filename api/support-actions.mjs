import { handleContentResource } from './_content-resource-handler.mjs';

export default async function handler(request, response) {
  await handleContentResource(request, response, 'support-actions');
}
