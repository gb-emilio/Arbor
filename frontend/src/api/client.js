const BASE = '/api/v1'

function getToken() { return localStorage.getItem('arborq_token') }

async function request(method, path, body, isMultipart = false) {
  const headers = {}
  const token = getToken()
  if (token) headers['Authorization'] = `Bearer ${token}`
  if (!isMultipart) headers['Content-Type'] = 'application/json'
  const res = await fetch(BASE + path, {
    method, headers,
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

export const auth  = {
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
    if (!res.ok) throw new Error('Error al descargar')
    const blob = await res.blob()
    const a = Object.assign(document.createElement('a'), {
      href: URL.createObjectURL(blob), download: filename || 'doc.pdf'
    })
    a.click(); URL.revokeObjectURL(a.href)
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
