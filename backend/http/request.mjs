export async function readJsonBody(request) {
  if (request.body && typeof request.body === 'object') {
    return request.body;
  }

  const chunks = [];
  for await (const chunk of request) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }

  const raw = Buffer.concat(chunks).toString('utf8').trim();
  return raw ? JSON.parse(raw) : {};
}

export function getRequestUrl(request) {
  return new URL(request.url ?? '/', `https://${request.headers.host || 'omarphone.vercel.app'}`);
}

export function getApiPath(request) {
  return getRequestUrl(request)
    .pathname
    .replace(/^\/api\/?/, '')
    .split('/')
    .filter(Boolean)
    .map(decodeURIComponent);
}

export function getQueryParam(request, key) {
  return getRequestUrl(request).searchParams.get(key) || '';
}

