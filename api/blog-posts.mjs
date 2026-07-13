import { readBlogPosts, requireAdmin, sendJson, upsertBlogPost } from './_store.mjs';

export default async function handler(request, response) {
  if (request.method === 'GET') {
    sendJson(response, 200, { posts: await readBlogPosts() });
    return;
  }

  if (request.method === 'POST') {
    if (!requireAdmin(request, response)) {
      return;
    }

    const post = await upsertBlogPost(request.body ?? {});
    sendJson(response, 201, { post });
    return;
  }

  sendJson(response, 405, { error: 'Method not allowed' });
}
