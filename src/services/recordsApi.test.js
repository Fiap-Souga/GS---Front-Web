import { afterEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({
  authenticatedRequest: vi.fn(),
  getCurrentSession: vi.fn(),
}))

vi.mock('./authApi.js', () => mocks)

import { updateRecord } from './recordsApi.js'

afterEach(() => {
  mocks.authenticatedRequest.mockReset()
  mocks.getCurrentSession.mockReset()
})

describe('recordsApi', () => {
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
