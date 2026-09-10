/**
 * BASE_URL:
 *   Desarrollo local (npm run dev):
 *     VITE_API_URL no definida → BASE = '/api/v1'
 *     El proxy de Vite (vite.config.js) redirige /api → http://localhost:8080
 *     → No hay problema de CORS porque la petición sale del mismo origen.
 *
 *   Docker (docker-compose):
 *     VITE_API_URL = 'http://localhost:8080' (puerto publicado del host)
 *     BASE = 'http://localhost:8080/api/v1'
 *     El navegador del usuario llega directamente al puerto 8080 del host.
 *     CORS en Spring Security permite cualquier origen → OK.
 *
 *   Producción (servidor real):
 *     Definir VITE_API_URL=https://api.tudominio.com antes de `npm run build`
 */
const BASE = (import.meta.env.VITE_API_URL ?? '') + '/api/v1'

function getToken() { return localStorage.getItem('arborq_token') }

async function request(method, path, body, isMultipart = false) {
  const headers = {}
  const token = getToken()
  if (token) headers['Authorization'] = `Bearer ${token}`
  if (!isMultipart) headers['Content-Type'] = 'application/json'

  const res = await fetch(BASE + path, {
    method, headers,
    cache: 'no-store', // evita que el navegador sirva respuestas cacheadas de la API
    body: isMultipart ? body : (body ? JSON.stringify(body) : undefined)
  })

  if (res.status === 204) return null
  if (!res.ok) {
    let msg = `Error ${res.status}`
    try { const e = await res.json(); msg = e.message || msg } catch {}
    throw new Error(msg)
  }
  return res.json()
}

export const auth = {
  login:    (d) => request('POST', '/auth/login', d),
  register: (d) => request('POST', '/auth/register', d),
}

export const nodes = {
  tree:    ()        => request('GET',    '/nodes'),
  get:     (id)      => request('GET',    `/nodes/${id}`),
  create:  (d)       => request('POST',   '/nodes', d),
  update:  (id, d)   => request('PUT',    `/nodes/${id}`, d),
  remove:  (id)      => request('DELETE', `/nodes/${id}`),
  reorder: (id, d)   => request('PATCH',  `/nodes/${id}/reorder-children`, d),
}

export const pdf = {
  upload: (nodeId, file) => {
    const fd = new FormData(); fd.append('file', file)
    return request('POST', `/nodes/${nodeId}/pdf`, fd, true)
  },
  download: async (nodeId, filename) => {
    const token = getToken()
    const res = await fetch(`${BASE}/nodes/${nodeId}/pdf`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    })
    if (!res.ok) throw new Error('Error al descargar el PDF')
    const blob = await res.blob()
    const a = Object.assign(document.createElement('a'), {
      href: URL.createObjectURL(blob),
      download: filename || 'documento.pdf'
    })
    document.body.appendChild(a); a.click()
    setTimeout(() => { URL.revokeObjectURL(a.href); a.remove() }, 100)
  },
  remove: (nodeId) => request('DELETE', `/nodes/${nodeId}/pdf`),
}

export const users = {
  list:          ()         => request('GET',    '/users'),
  toggle:        (id)       => request('PATCH',  `/users/${id}/toggle`),
  changeRole:    (id, role) => request('PATCH',  `/users/${id}/role`, { role }),
  resetPassword: (id, p)    => request('PATCH',  `/users/${id}/password`, { password: p }),
  remove:        (id)       => request('DELETE', `/users/${id}`),
}

// Endpoints PÚBLICOS — no requieren token
const PUB = (import.meta.env.VITE_API_URL ?? '') + '/api/v1/public'

export const pub = {
  roots: () => fetch(PUB + '/nodes/roots').then(r => r.ok ? r.json() : Promise.reject()),
  node:  (id) => fetch(PUB + '/nodes/' + id).then(r => r.ok ? r.json() : Promise.reject()),
  /** Descarga el PDF de un nodo hoja (sin autenticación) */
  pdfUrl: (nodeId) => `${(import.meta.env.VITE_API_URL ?? '')}/api/v1/nodes/${nodeId}/pdf`,
  /** Envía la solución del nodo por email, tras aceptar las políticas */
  sendSolution: async (nodeId, payload) => {
    const res = await fetch(`${PUB}/nodes/${nodeId}/send-solution`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      cache: 'no-store',
      body: JSON.stringify(payload)
    })
    if (!res.ok) {
      let msg = `Error ${res.status}`
      try { const e = await res.json(); msg = e.message || msg } catch {}
      throw new Error(msg)
    }
    return res.json()
  },
}

// Plantilla de email compartida por todas las hojas — solo ADMIN
export const emailTemplate = {
  get:    ()   => request('GET', '/email-template'),
  update: (d)  => request('PUT', '/email-template', d),
}
