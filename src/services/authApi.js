export const API_BASE = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '')

let currentProfile = null
let csrfToken = ''

const notifySessionChange = () => {
  window.dispatchEvent(new CustomEvent('raiz-urbana:session', { detail: currentProfile }))
}

const readCsrfCookie = () => {
  const csrfCookie = document.cookie.split(';').map((part) => part.trim())
    .find((part) => part.startsWith('ru_csrf='))
  return csrfCookie ? csrfCookie.slice('ru_csrf='.length) : ''
}

const readJsonResponse = async (response, path) => {
  const body = await response.text()
  if (!body.trim()) {
    throw Object.assign(new Error(
      `A API em ${path} respondeu sem conteúdo (HTTP ${response.status}). Confirme que o servidor da API está ligado e acessível.`,
    ), { status: response.status })
  }

  try {
    return JSON.parse(body)
  } catch {
    throw Object.assign(new Error(
      `A API em ${path} retornou uma resposta inválida (HTTP ${response.status}). Confira a URL e o servidor da API.`,
    ), { status: response.status })
  }
}

const ensureCsrfToken = async () => {
  if (csrfToken && readCsrfCookie() === csrfToken) return csrfToken
  const response = await fetch(`${API_BASE}/api/csrf`, { credentials: 'include' })
  const data = await readJsonResponse(response, '/api/csrf')
  if (!response.ok || typeof data.csrfToken !== 'string') {
    throw new Error(data.error || `Não foi possível iniciar uma sessão segura (HTTP ${response.status}).`)
  }
  csrfToken = data.csrfToken
  return csrfToken
}

const apiRequest = async (path, options = {}) => {
  const method = options.method || 'GET'
  const headers = new Headers(options.headers)
  if (options.body && !headers.has('Content-Type')) headers.set('Content-Type', 'application/json')
  if (!['GET', 'HEAD', 'OPTIONS'].includes(method) && csrfToken) {
    headers.set('X-CSRF-Token', csrfToken)
  }
  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    method,
    headers,
    credentials: 'include',
  })
  if (response.status === 401 && currentProfile) {
    currentProfile = null
    csrfToken = ''
    notifySessionChange()
  }
  if (response.status === 204) return null
  const data = await readJsonResponse(response, path)
  if (!response.ok) {
    throw Object.assign(new Error(data.error || 'Não foi possível concluir a solicitação.'), {
      status: response.status,
    })
  }
  return data
}

export async function authenticatedRequest(path, options = {}) {
  await ensureCsrfToken()
  return apiRequest(path, options)
}

const loadProfile = async () => {
  const data = await apiRequest('/api/profile')
  currentProfile = data.profile
  notifySessionChange()
  return currentProfile
}

export const getCurrentSession = () => currentProfile

export async function restoreSession() {
  await ensureCsrfToken()
  try {
    return await loadProfile()
  } catch (error) {
    if (error.status === 401) {
      currentProfile = null
      notifySessionChange()
      return null
    }
    throw error
  }
}

const authenticate = async (path, values) => {
  await ensureCsrfToken()
  const data = await apiRequest(path, {
    method: 'POST',
    body: JSON.stringify(values),
  })
  csrfToken = data.csrfToken
  return loadProfile()
}

export const register = (values) => authenticate('/api/auth/register', values)
export const login = (values) => authenticate('/api/auth/login', values)

export async function logout() {
  await ensureCsrfToken()
  await apiRequest('/api/auth/logout', { method: 'POST' })
  currentProfile = null
  csrfToken = ''
  notifySessionChange()
}

export async function updateProfile(name) {
  const data = await apiRequest('/api/profile', {
    method: 'PATCH',
    body: JSON.stringify({ name }),
  })
  currentProfile = data.profile
  notifySessionChange()
  return currentProfile
}

export async function addTreeVisit(place) {
  const data = await apiRequest('/api/profile/tree-visits', {
    method: 'POST',
    body: JSON.stringify({ place }),
  })
  currentProfile = data.profile
  notifySessionChange()
  return currentProfile
}

export async function resetTreeVisits() {
  const data = await apiRequest('/api/profile/tree-visits', { method: 'DELETE' })
  currentProfile = data.profile
  notifySessionChange()
  return currentProfile
}
