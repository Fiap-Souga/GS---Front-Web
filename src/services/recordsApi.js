import { authenticatedRequest, getCurrentSession } from './authApi.js'

const DEMO_API_URL = 'https://api.restful-api.dev/objects'
const DEMO_APP_MARKER = 'raiz-urbana'
const DEMO_RECORD_IDS_KEY = 'raiz-urbana-public-action-ids:v1'
const PLACE_SEPARATOR = '\n[ru-place]:'

const isValidDate = (value) => {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false
  const parsed = new Date(`${value}T00:00:00.000Z`)
  return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value
}

const encodeDemoRecord = (record) => ({
  name: record.title,
  data: {
    app: DEMO_APP_MARKER,
    body: `${record.body}${PLACE_SEPARATOR}${encodeURIComponent(record.place)}`,
    date: record.date,
    userId: record.userId,
  },
})

const readDemoRecordIds = () => {
  let serialized
  try {
    serialized = globalThis.localStorage.getItem(DEMO_RECORD_IDS_KEY)
  } catch (error) {
    throw new Error(`Não foi possível acessar a lista de ações deste navegador: ${error.message}`)
  }
  if (serialized === null) return []

  let ids
  try {
    ids = JSON.parse(serialized)
  } catch {
    throw new Error('A lista de ações deste navegador está corrompida.')
  }
  if (!Array.isArray(ids) || ids.some((id) => typeof id !== 'string' || !/^[\w-]+$/.test(id))) {
    throw new Error('A lista de ações deste navegador tem um formato inválido.')
  }
  return [...new Set(ids)]
}

const writeDemoRecordIds = (ids) => {
  try {
    globalThis.localStorage.setItem(DEMO_RECORD_IDS_KEY, JSON.stringify(ids))
  } catch (error) {
    throw new Error(`Não foi possível salvar a lista de ações neste navegador: ${error.message}`)
  }
}

const requestDemoApi = async (path = '', options = {}) => {
  let response
  try {
    response = await fetch(`${DEMO_API_URL}${path}`, options)
  } catch (error) {
    if (error.name === 'AbortError') throw error
    throw new Error(`Não foi possível conectar à API pública de demonstração. ${error.message}`)
  }

  if (!response.ok) {
    throw new Error(`A API pública de demonstração respondeu com HTTP ${response.status}.`)
  }
  if (response.status === 204 || options.method === 'DELETE') return null

  try {
    return await response.json()
  } catch (error) {
    throw new Error(`A API pública de demonstração retornou uma resposta inválida. ${error.message}`)
  }
}

const validateDemoRecord = (record) => {
  const encodedBody = record?.data?.body
  const separatorIndex = typeof encodedBody === 'string'
    ? encodedBody.lastIndexOf(PLACE_SEPARATOR)
    : -1
  const body = separatorIndex >= 0 ? encodedBody.slice(0, separatorIndex) : ''
  let place
  try {
    place = separatorIndex >= 0
      ? decodeURIComponent(encodedBody.slice(separatorIndex + PLACE_SEPARATOR.length))
      : ''
  } catch {
    throw new Error('A API pública retornou uma ação com local inválido.')
  }

  if (
    typeof record?.id !== 'string'
    || !record.id
    || typeof record.name !== 'string'
    || !record.name.trim()
    || record.name.trim().length > 100
    || record.data?.app !== DEMO_APP_MARKER
    || separatorIndex < 0
    || !body.trim()
    || body.length > 500
    || !place.trim()
    || place.length > 100
    || (record.data.date !== undefined
      && !isValidDate(record.data.date))
    || ![1, 2, 3].includes(record.data.userId)
  ) {
    throw new Error('A API pública de demonstração retornou uma ação em um formato inesperado.')
  }

  return {
    id: record.id,
    apiId: record.id,
    title: record.name,
    body,
    place,
    date: record.data.date,
    userId: record.data.userId,
  }
}

export const getRecords = async (signal) => {
  if (getCurrentSession()) {
    const data = await authenticatedRequest('/api/plans', { signal })
    if (!Array.isArray(data) || data.some((record) => (
      typeof record.id !== 'string'
      || typeof record.title !== 'string'
      || typeof record.body !== 'string'
    ))) {
      throw new Error('A API retornou dados em um formato inesperado.')
    }
    return data.map((record) => ({ ...record, apiId: record.id }))
  }

  const ids = readDemoRecordIds()
  return Promise.all(ids.map(async (id) => (
    validateDemoRecord(await requestDemoApi(`/${encodeURIComponent(id)}`, { signal }))
  )))
}

export const createRecord = async (record) => {
  if (getCurrentSession()) {
    return authenticatedRequest('/api/plans', {
      method: 'POST',
      body: JSON.stringify(record),
    })
  }

  const ids = readDemoRecordIds()
  const created = validateDemoRecord(await requestDemoApi('', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(encodeDemoRecord(record)),
  }))
  writeDemoRecordIds([...ids, created.apiId])
  return created
}

export const updateRecord = async (record) => {
  if (getCurrentSession()) {
    return authenticatedRequest(`/api/plans/${record.id}`, {
      method: 'PUT',
      body: JSON.stringify({
        userId: record.userId,
        title: record.title,
        body: record.body,
        place: record.place,
        date: record.date,
      }),
    })
  }

  const apiId = record.apiId ?? record.id
  return validateDemoRecord(await requestDemoApi(`/${encodeURIComponent(apiId)}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(encodeDemoRecord(record)),
  }))
}

export const deleteRecord = async (record) => {
  if (getCurrentSession()) {
    return authenticatedRequest(`/api/plans/${record.id}`, {
      method: 'DELETE',
    })
  }

  const apiId = record.apiId ?? record.id
  const ids = readDemoRecordIds()
  const result = await requestDemoApi(`/${encodeURIComponent(apiId)}`, { method: 'DELETE' })
  writeDemoRecordIds(ids.filter((id) => id !== apiId))
  return result
}
