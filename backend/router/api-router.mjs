import { sendJson } from '../../api/_store.mjs';
import { getApiPath } from '../http/request.mjs';
import { login } from '../controllers/admin.controller.mjs';
import { handleBlogs } from '../controllers/blog.controller.mjs';
import {
  handleResource,
  handleTable,
  listResources,
  listSections,
  mutateSection,
  showPublicContent,
} from '../controllers/content.controller.mjs';
import { showHealth } from '../controllers/health.controller.mjs';
import { handleMedia } from '../controllers/media.controller.mjs';
import { handleOrders } from '../controllers/order.controller.mjs';

export async function handleApiRequest(request, response) {
  if (request.method === 'OPTIONS') {
    sendJson(response, 204, {});
    return;
  }

  const [resource, id, action] = getApiPath(request);

  try {
    if (resource === 'health') {
      await showHealth(request, response);
      return;
    }

    if (resource === 'admin' && id === 'login') {
      await login(request, response);
      return;
    }

    if (resource === 'content') {
      await showPublicContent(request, response);
      return;
    }

    if (resource === 'content-sections') {
      await listSections(request, response);
      return;
    }

    if (resource === 'content-resources') {
      await listResources(request, response);
      return;
    }

    if (resource === 'content-section') {
      await mutateSection(request, response);
      return;
    }

    if (resource === 'content-tables') {
      await handleTable(request, response, id, action);
      return;
    }

    if (resource === 'blog-posts') {
      await handleBlogs(request, response, id);
      return;
    }

    if (resource === 'orders') {
      await handleOrders(request, response, id, action);
      return;
    }

    if (resource === 'media') {
      await handleMedia(request, response, id);
      return;
    }

    if (await handleResource(request, response, resource, id)) {
      return;
    }

    sendJson(response, 404, { error: 'API route not found' });
  } catch (error) {
    sendJson(response, error.statusCode || 500, { error: error.message || 'Server error' });
  }
}

