import {
  createAdminToken,
  getAdminTokenTtlSeconds,
  isAdminAuthConfigured,
  requireAdmin,
  verifyAdminCredentials,
} from '../../api/_store.mjs';

export { requireAdmin };

export function loginAdmin(credentials) {
  if (!isAdminAuthConfigured()) {
    const error = new Error('Admin authentication is not configured');
    error.statusCode = 503;
    throw error;
  }

  if (!verifyAdminCredentials(credentials?.username, credentials?.password)) {
    const error = new Error('Invalid admin credentials');
    error.statusCode = 401;
    throw error;
  }

  return {
    token: createAdminToken(String(credentials.username).trim()),
    expiresIn: getAdminTokenTtlSeconds(),
  };
}

