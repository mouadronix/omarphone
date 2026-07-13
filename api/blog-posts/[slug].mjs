import { deleteBlogPost, readBlogPost, requireAdmin, sendJson, upsertBlogPost } from '../_store.mjs';

export default async function handler(request, response) {
  const slug = String(request.query?.slug ?? '');

  if (!slug) {
    sendJson(response, 400, { error: 'Blog post slug is required' });
    return;
  }

  if (request.method === 'GET') {
    const post = await readBlogPost(slug);
    if (!post) {
      sendJson(response, 404, { error: 'Blog post not found' });
      return;
    }

    sendJson(response, 200, { post });
    return;
  }

  if (request.method === 'PUT' || request.method === 'PATCH') {
    if (!requireAdmin(request, response)) {
      return;
    }

    const existing = request.method === 'PATCH' ? await readBlogPost(slug) : null;
    const post = await upsertBlogPost({ ...(existing ?? {}), ...request.body, slug });
    sendJson(response, 200, { post });
    return;
  }

  if (request.method === 'DELETE') {
    if (!requireAdmin(request, response)) {
      return;
    }

    const deleted = await deleteBlogPost(slug);
    sendJson(response, deleted ? 200 : 404, deleted ? { ok: true } : { error: 'Blog post not found' });
    return;
  }

  sendJson(response, 405, { error: 'Method not allowed' });
}
