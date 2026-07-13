import { sendJson } from '../../api/_store.mjs';
import { readJsonBody } from '../http/request.mjs';
import { loginAdmin } from '../services/admin.service.mjs';

export async function login(request, response) {
  if (request.method !== 'POST') {
    sendJson(response, 405, { error: 'Method not allowed' });
    return;
  }

  sendJson(response, 200, loginAdmin(await readJsonBody(request)));
}

