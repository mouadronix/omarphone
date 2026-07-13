import { sendJson } from '../../api/_store.mjs';
import { readJsonBody } from '../http/request.mjs';
import { requireAdmin } from '../services/admin.service.mjs';
import { deleteBlogPost, readBlogPost, readBlogPosts, upsertBlogPost } from '../services/blog.service.mjs';

export async function handleBlogs(request, response, slug = null) {
  if (!slug && request.method === 'GET') {
    sendJson(response, 200, { posts: await readBlogPosts() });
    return;
  }

  if (!slug && request.method === 'POST') {
    if (!requireAdmin(request, response)) {
      return;
    }
    const post = await upsertBlogPost(await readJsonBody(request));
    sendJson(response, 201, { post });
    return;
  }

  if (slug && request.method === 'GET') {
    const post = await readBlogPost(slug);
    sendJson(response, post ? 200 : 404, post ? { post } : { error: 'Blog post not found' });
    return;
  }

  if (slug && (request.method === 'PUT' || request.method === 'PATCH')) {
    if (!requireAdmin(request, response)) {
      return;
    }
    const existing = request.method === 'PATCH' ? await readBlogPost(slug) : null;
    const post = await upsertBlogPost({ ...(existing ?? {}), ...(await readJsonBody(request)), slug });
    sendJson(response, 200, { post });
    return;
  }

  if (slug && request.method === 'DELETE') {
    if (!requireAdmin(request, response)) {
      return;
    }
    const deleted = await deleteBlogPost(slug);
    sendJson(response, deleted ? 200 : 404, deleted ? { ok: true } : { error: 'Blog post not found' });
    return;
  }

  sendJson(response, 405, { error: 'Method not allowed' });
}

