import { afterEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({
  authenticatedRequest: vi.fn(),
  getCurrentSession: vi.fn(),
}))

vi.mock('./authApi.js', () => mocks)

import { createRecord, deleteRecord, getRecords, updateRecord } from './recordsApi.js'

const jsonResponse = (body, status = 200) => ({
  ok: status >= 200 && status < 300,
  status,
  json: async () => body,
})

const publicRecord = (id, record) => ({
  id: String(id),
  name: record.title,
  data: {
    app: 'raiz-urbana',
    body: `${record.body}\n[ru-place]:${encodeURIComponent(record.place)}`,
    date: record.date,
    userId: record.userId,
  },
})

const sampleRecord = {
  title: 'Mutirão de plantio',
  body: 'Plantio de espécies nativas.',
  place: 'Horto comunitário',
  date: '2026-11-15',
  userId: 1,
}

const createStorage = (ids = []) => {
  let serialized = JSON.stringify(ids)
  return {
    getItem: vi.fn(() => serialized),
    setItem: vi.fn((key, value) => {
      serialized = value
    }),
    read: () => JSON.parse(serialized),
  }
}

afterEach(() => {
  mocks.authenticatedRequest.mockReset()
  mocks.getCurrentSession.mockReset()
  vi.unstubAllGlobals()
})

describe('recordsApi', () => {
  it('loads indexed public actions from the external API', async () => {
    mocks.getCurrentSession.mockReturnValue(null)
    const storage = createStorage(['external-1'])
    vi.stubGlobal('localStorage', storage)
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse(publicRecord('external-1', sampleRecord)))
    vi.stubGlobal('fetch', fetchMock)

    const result = await getRecords()

    expect(fetchMock).toHaveBeenCalledWith(
      'https://api.restful-api.dev/objects/external-1',
      { signal: undefined },
    )
    expect(result).toEqual([{ ...sampleRecord, id: 'external-1', apiId: 'external-1' }])
    expect(storage.getItem).toHaveBeenCalledWith('raiz-urbana-public-action-ids:v1')
  })

  it('creates a public action with an external POST request', async () => {
    mocks.getCurrentSession.mockReturnValue(null)
    const storage = createStorage()
    vi.stubGlobal('localStorage', storage)
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse(publicRecord('external-1', sampleRecord), 201))
    vi.stubGlobal('fetch', fetchMock)

    await expect(createRecord(sampleRecord)).resolves.toEqual({
      ...sampleRecord,
      id: 'external-1',
      apiId: 'external-1',
    })
    expect(storage.read()).toEqual(['external-1'])
    expect(fetchMock).toHaveBeenCalledWith('https://api.restful-api.dev/objects', expect.objectContaining({
      method: 'POST',
      body: JSON.stringify({
        name: sampleRecord.title,
        data: {
          app: 'raiz-urbana',
          body: `${sampleRecord.body}\n[ru-place]:Horto%20comunit%C3%A1rio`,
          date: sampleRecord.date,
          userId: sampleRecord.userId,
        },
      }),
    }))
  })

  it('updates and deletes the external resource id, not the local UI id', async () => {
    mocks.getCurrentSession.mockReturnValue(null)
    const storage = createStorage(['external-1'])
    vi.stubGlobal('localStorage', storage)
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(jsonResponse(publicRecord('external-1', {
        ...sampleRecord,
        title: 'Atualizado',
      })))
      .mockResolvedValueOnce({ ok: true, status: 200 })
    vi.stubGlobal('fetch', fetchMock)
    const record = {
      ...sampleRecord,
      id: 'local-ui-id',
      apiId: 'external-1',
      title: 'Atualizado',
    }

    await updateRecord(record)
    await deleteRecord(record)

    expect(fetchMock.mock.calls[0][0]).toBe('https://api.restful-api.dev/objects/external-1')
    expect(fetchMock.mock.calls[0][1].method).toBe('PUT')
    expect(fetchMock.mock.calls[1]).toEqual([
      'https://api.restful-api.dev/objects/external-1',
      { method: 'DELETE' },
    ])
    expect(storage.read()).toEqual([])
  })

  it('surfaces API failures and malformed responses', async () => {
    mocks.getCurrentSession.mockReturnValue(null)
    vi.stubGlobal('localStorage', createStorage(['broken']))
    const unavailable = vi.fn().mockResolvedValue({ ok: false, status: 503 })
    vi.stubGlobal('fetch', unavailable)
    await expect(getRecords()).rejects.toThrow('HTTP 503')

    const malformed = vi.fn().mockResolvedValue(jsonResponse({
      id: 'broken',
      name: 'Ação inválida',
      data: { app: 'raiz-urbana' },
    }))
    vi.stubGlobal('fetch', malformed)
    await expect(getRecords()).rejects.toThrow('formato inesperado')
  })

  it('sends the community action place and date when editing', async () => {
    mocks.getCurrentSession.mockReturnValue({ id: 'account-1' })
    mocks.authenticatedRequest.mockResolvedValue({ id: 'plan-1' })
    const record = {
      id: 'plan-1',
      title: 'Mutirão de plantio',
      body: 'Preparar o canteiro.',
      place: 'Horto comunitário',
      date: '2026-11-15',
      userId: 1,
    }

    await updateRecord(record)

    expect(mocks.authenticatedRequest).toHaveBeenCalledWith('/api/plans/plan-1', {
      method: 'PUT',
      body: JSON.stringify({
        userId: record.userId,
        title: record.title,
        body: record.body,
        place: record.place,
        date: record.date,
      }),
    })
  })
})
