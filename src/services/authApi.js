import { isBrowserAccountMode } from './accountMode.js'
import {
  createBrowserAccountPlan,
  deleteBrowserAccountPlan,
  getBrowserAccountPlans,
  getBrowserAccountProfile,
  loginBrowserAccount,
  logoutBrowserAccount,
  registerBrowserAccount,
  updateBrowserAccountPlan,
  updateBrowserAccountProfile,
} from './browserAccountStore.js'

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
  if (isBrowserAccountMode) {
    if (path === '/api/plans' && (!options.method || options.method === 'GET')) {
      return getBrowserAccountPlans()
    }
    if (path === '/api/plans' && options.method === 'POST') {
      return createBrowserAccountPlan(JSON.parse(options.body))
    }
    const planMatch = path.match(/^\/api\/plans\/([^/]+)$/)
    if (planMatch && options.method === 'PUT') {
      return updateBrowserAccountPlan(planMatch[1], JSON.parse(options.body))
    }
    if (planMatch && options.method === 'DELETE') {
      return deleteBrowserAccountPlan(planMatch[1])
    }
    throw new Error('Esta operação não está disponível no armazenamento deste navegador.')
  }
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
  if (isBrowserAccountMode) {
    currentProfile = getBrowserAccountProfile()
    notifySessionChange()
    return currentProfile
  }
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
  if (isBrowserAccountMode) {
    currentProfile = path.endsWith('/register')
      ? await registerBrowserAccount(values)
      : await loginBrowserAccount(values.email, values.password)
    notifySessionChange()
    return currentProfile
  }
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
  if (isBrowserAccountMode) {
    logoutBrowserAccount()
    currentProfile = null
    notifySessionChange()
    return
  }
  await ensureCsrfToken()
  await apiRequest('/api/auth/logout', { method: 'POST' })
  currentProfile = null
  csrfToken = ''
  notifySessionChange()
}

export async function updateProfile(name) {
  if (isBrowserAccountMode) {
    currentProfile = await updateBrowserAccountProfile((profile) => ({ ...profile, name }))
    notifySessionChange()
    return currentProfile
  }
  const data = await apiRequest('/api/profile', {
    method: 'PATCH',
    body: JSON.stringify({ name }),
  })
  currentProfile = data.profile
  notifySessionChange()
  return currentProfile
}

export async function addTreeVisit(place) {
  if (isBrowserAccountMode) {
    currentProfile = await updateBrowserAccountProfile((profile) => ({
      ...profile,
      treeVisits: [...(profile.treeVisits ?? []), { place, visitedAt: new Date().toISOString() }].slice(-1000),
    }))
    notifySessionChange()
    return currentProfile
  }
  const data = await apiRequest('/api/profile/tree-visits', {
    method: 'POST',
    body: JSON.stringify({ place }),
  })
  currentProfile = data.profile
  notifySessionChange()
  return currentProfile
}

export async function resetTreeVisits() {
  if (isBrowserAccountMode) {
    currentProfile = await updateBrowserAccountProfile((profile) => ({ ...profile, treeVisits: [] }))
    notifySessionChange()
    return currentProfile
  }
  const data = await apiRequest('/api/profile/tree-visits', { method: 'DELETE' })
  currentProfile = data.profile
  notifySessionChange()
  return currentProfile
}

export async function saveHabitEntry(entry, isEditing = false) {
  if (isBrowserAccountMode) {
    currentProfile = await updateBrowserAccountProfile((profile) => {
      const entries = profile.habitEntries ?? []
      const filtered = entries.filter((item) => item.date !== entry.date)
      return {
        ...profile,
        habitEntries: [entry, ...filtered].sort((left, right) => right.date.localeCompare(left.date)),
      }
    })
    notifySessionChange()
    return currentProfile
  }
  const path = isEditing
    ? `/api/profile/habit-entries/${encodeURIComponent(entry.date)}`
    : '/api/profile/habit-entries'
  const data = await apiRequest(path, {
    method: isEditing ? 'PUT' : 'POST',
    body: JSON.stringify(entry),
  })
  currentProfile = data.profile
  notifySessionChange()
  return currentProfile
}

export async function deleteHabitEntry(date) {
  if (isBrowserAccountMode) {
    currentProfile = await updateBrowserAccountProfile((profile) => ({
      ...profile,
      habitEntries: (profile.habitEntries ?? []).filter((entry) => entry.date !== date),
    }))
    notifySessionChange()
    return currentProfile
  }
  const data = await apiRequest(`/api/profile/habit-entries/${encodeURIComponent(date)}`, {
    method: 'DELETE',
  })
  currentProfile = data.profile
  notifySessionChange()
  return currentProfile
}
