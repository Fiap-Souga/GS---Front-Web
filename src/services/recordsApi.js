import { authenticatedRequest, getCurrentSession } from './authApi.js'

const API_URL = 'https://jsonplaceholder.typicode.com/posts'

const readResponse = async (response) => {
  if (response.status === 204) return null
  const body = await response.text()
  if (!body.trim()) {
    throw new Error(`A API de iniciativas respondeu sem conteúdo (HTTP ${response.status}). Tente novamente.`)
  }

  let data
  try {
    data = JSON.parse(body)
  } catch {
    throw new Error(`A API de iniciativas retornou uma resposta inválida (HTTP ${response.status}).`)
  }

  if (!response.ok) {
    throw new Error(data.error || `A API respondeu com erro ${response.status}. Tente novamente.`)
  }
  return data
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

  const response = await fetch(`${API_URL}?_limit=8`, { signal })
  const data = await readResponse(response)
  if (!Array.isArray(data) || data.some((record) => (
    !Number.isInteger(record.id)
    || typeof record.title !== 'string'
    || typeof record.body !== 'string'
  ))) {
    throw new Error('A API retornou dados em um formato inesperado.')
  }
  return data.map((record, index) => ({
    ...record,
    userId: (index % 3) + 1,
    apiId: record.id,
  }))
}

export const createRecord = async (record) => {
  if (getCurrentSession()) {
    return authenticatedRequest('/api/plans', {
      method: 'POST',
      body: JSON.stringify(record),
    })
  }

  const response = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json; charset=UTF-8' },
    body: JSON.stringify(record),
  })
  return readResponse(response)
}

export const updateRecord = async (record) => {
  if (getCurrentSession()) {
    return authenticatedRequest(`/api/plans/${record.id}`, {
      method: 'PUT',
      body: JSON.stringify({
        userId: record.userId,
        title: record.title,
        body: record.body,
      }),
    })
  }

  const response = await fetch(`${API_URL}/${record.apiId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json; charset=UTF-8' },
    body: JSON.stringify({
      userId: record.userId,
      title: record.title,
      body: record.body,
    }),
  })
  return readResponse(response)
}

export const deleteRecord = async (record) => {
  if (getCurrentSession()) {
    return authenticatedRequest(`/api/plans/${record.id}`, {
      method: 'DELETE',
    })
  }

  const response = await fetch(`${API_URL}/${record.apiId}`, { method: 'DELETE' })
  if (!response.ok) {
    throw new Error(`A API respondeu com erro ${response.status}. Tente novamente.`)
  }
}
