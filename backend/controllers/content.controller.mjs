import { sendJson } from '../../api/_store.mjs';
import { getQueryParam, readJsonBody } from '../http/request.mjs';
import { requireAdmin } from '../services/admin.service.mjs';
import {
  deleteContentSection,
  deleteContentTableRow,
  findContentResourceTable,
  listContentResources,
  listContentTables,
  readContentSections,
  readContentTableRows,
  readMergedSiteContent,
  upsertContentSection,
  upsertContentTableRow,
} from '../services/content.service.mjs';

export async function showPublicContent(request, response) {
  if (request.method !== 'GET') {
    sendJson(response, 405, { error: 'Method not allowed' });
    return;
  }

  sendJson(response, 200, await readMergedSiteContent());
}

export async function listSections(request, response) {
  if (!requireAdmin(request, response)) {
    return;
  }

  if (request.method !== 'GET') {
    sendJson(response, 405, { error: 'Method not allowed' });
    return;
  }

  sendJson(response, 200, { sections: await readContentSections() });
}

export async function listResources(request, response) {
  if (!requireAdmin(request, response)) {
    return;
  }

  if (request.method !== 'GET') {
    sendJson(response, 405, { error: 'Method not allowed' });
    return;
  }

  sendJson(response, 200, { resources: listContentResources() });
}

export async function mutateSection(request, response) {
  if (!requireAdmin(request, response)) {
    return;
  }

  const key = getQueryParam(request, 'key');
  if (!key) {
    sendJson(response, 400, { error: 'Content section key is required' });
    return;
  }

  if (request.method === 'PUT' || request.method === 'POST') {
    const body = await readJsonBody(request);
    const section = await upsertContentSection(key, body.payload);
    sendJson(response, 200, { section, sections: await readContentSections() });
    return;
  }

  if (request.method === 'DELETE') {
    await deleteContentSection(key);
    sendJson(response, 200, { ok: true, sections: await readContentSections() });
    return;
  }

  sendJson(response, 405, { error: 'Method not allowed' });
}

export async function handleTable(request, response, table, id = null) {
  if (!requireAdmin(request, response)) {
    return;
  }

  if (!table && request.method === 'GET') {
    sendJson(response, 200, { tables: listContentTables() });
    return;
  }

  if (table && !id && request.method === 'GET') {
    sendJson(response, 200, { table, rows: await readContentTableRows(table) });
    return;
  }

  if (table && !id && request.method === 'POST') {
    const row = await upsertContentTableRow(table, null, await readJsonBody(request));
    sendJson(response, 201, { row });
    return;
  }

  if (table && id && (request.method === 'PUT' || request.method === 'PATCH')) {
    const row = await upsertContentTableRow(table, id, await readJsonBody(request));
    sendJson(response, 200, { row });
    return;
  }

  if (table && id && request.method === 'DELETE') {
    const deleted = await deleteContentTableRow(table, id);
    sendJson(response, deleted ? 200 : 404, deleted ? { ok: true } : { error: 'Content row not found' });
    return;
  }

  sendJson(response, 405, { error: 'Method not allowed' });
}

export async function handleResource(request, response, resourceName, id = null) {
  const table = findContentResourceTable(resourceName);
  if (!table) {
    return false;
  }

  if (!id && request.method === 'GET') {
    sendJson(response, 200, { resource: resourceName, rows: await readContentTableRows(table) });
    return true;
  }

  if (!requireAdmin(request, response)) {
    return true;
  }

  if (!id && request.method === 'POST') {
    const row = await upsertContentTableRow(table, null, await readJsonBody(request));
    sendJson(response, 201, { row });
    return true;
  }

  if (id && (request.method === 'PUT' || request.method === 'PATCH')) {
    const row = await upsertContentTableRow(table, id, await readJsonBody(request));
    sendJson(response, 200, { row });
    return true;
  }

  if (id && request.method === 'DELETE') {
    const deleted = await deleteContentTableRow(table, id);
    sendJson(response, deleted ? 200 : 404, deleted ? { ok: true } : { error: 'Content row not found' });
    return true;
  }

  sendJson(response, 405, { error: 'Method not allowed' });
  return true;
}
