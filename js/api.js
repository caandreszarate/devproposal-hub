/* ============================================================
   api.js — Fetch wrapper y métodos de la API REST
   ============================================================ */

export const BASE_URL = 'http://127.0.0.1:3000/api';

/**
 * Fetch wrapper con manejo centralizado de errores.
 * En caso de que el backend no responda, lanza un error descriptivo.
 */
async function request(method, endpoint, body = null) {
  const options = {
    method,
    headers: { 'Content-Type': 'application/json' }
  };

  if (body) options.body = JSON.stringify(body);

  try {
    const res = await fetch(`${BASE_URL}${endpoint}`, options);
    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || `Error ${res.status}`);
    }

    return data;
  } catch (err) {
    if (err.name === 'TypeError' && err.message.includes('fetch')) {
      throw new Error('No se pudo conectar con el servidor. Verifica que el backend esté corriendo.');
    }
    throw err;
  }
}

// ── Propuestas ─────────────────────────────────────────────

export async function createProposal(data) {
  return request('POST', '/proposals', data);
}

export async function getProposals(params = {}) {
  const qs = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => { if (v !== undefined && v !== '') qs.set(k, v); });
  const query = qs.toString() ? `?${qs.toString()}` : '';
  return request('GET', `/proposals${query}`);
}

export async function getProposalById(id) {
  return request('GET', `/proposals/${id}`);
}

export async function updateProposal(id, data) {
  return request('PATCH', `/proposals/${id}`, data);
}

export async function deleteProposal(id, adminKey) {
  const options = {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json', 'x-admin-key': adminKey }
  };
  try {
    const res = await fetch(`${BASE_URL}/proposals/${id}`, options);
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || `Error ${res.status}`);
    return data;
  } catch (err) {
    if (err.name === 'TypeError') throw new Error('Sin conexión al servidor');
    throw err;
  }
}

export async function exportProposals() {
  const res = await fetch(`${BASE_URL}/proposals/export`);
  if (!res.ok) throw new Error('Error al exportar');
  return res.json();
}

// ── Estadísticas ───────────────────────────────────────────

export async function getStats() {
  return request('GET', '/proposals/stats');
}

// ── Health check ───────────────────────────────────────────
// Usa no-cors para evitar bloqueos CORS en el indicador de estado.
// Si el servidor responde (respuesta opaca o normal), está online.
// Si lanza error de red, está offline.
export async function checkHealth() {
  try {
    const res = await fetch(`${BASE_URL}/health`, {
      method: 'GET',
      mode: 'no-cors',
      cache: 'no-store'
    });
    // res.type === 'opaque' significa que el servidor respondió
    return res.type === 'opaque' || res.ok;
  } catch {
    return false;
  }
}
