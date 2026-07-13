import { createAdminToken, getAdminTokenTtlSeconds, isAdminAuthConfigured, sendJson, verifyAdminCredentials } from '../_store.mjs';

export default async function handler(request, response) {
  if (request.method !== 'POST') {
    sendJson(response, 405, { error: 'Method not allowed' });
    return;
  }

  if (!isAdminAuthConfigured()) {
    sendJson(response, 503, { error: 'Admin authentication is not configured' });
    return;
  }

  const username = request.body?.username;
  const password = request.body?.password;
  if (!verifyAdminCredentials(username, password)) {
    sendJson(response, 401, { error: 'Invalid admin credentials' });
    return;
  }

  sendJson(response, 200, {
    token: createAdminToken(String(username).trim()),
    expiresIn: getAdminTokenTtlSeconds(),
  });
}
