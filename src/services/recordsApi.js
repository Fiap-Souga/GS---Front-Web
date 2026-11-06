const API_URL = 'https://jsonplaceholder.typicode.com/posts'

const readResponse = async (response) => {
  if (!response.ok) {
    throw new Error(`A API respondeu com erro ${response.status}. Tente novamente.`)
  }
  return response.json()
}

export const getRecords = async (signal) => {
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
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json; charset=UTF-8' },
    body: JSON.stringify(record),
  })
  return readResponse(response)
}

export const updateRecord = async (record) => {
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
  const response = await fetch(`${API_URL}/${record.apiId}`, { method: 'DELETE' })
  if (!response.ok) {
    throw new Error(`A API respondeu com erro ${response.status}. Tente novamente.`)
  }
}
