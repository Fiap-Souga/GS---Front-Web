// @vitest-environment jsdom
import { webcrypto } from 'node:crypto'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

beforeEach(() => {
  vi.resetModules()
  vi.doMock('./accountMode.js', () => ({ isBrowserAccountMode: true }))
  vi.stubGlobal('crypto', webcrypto)
  vi.stubGlobal('fetch', vi.fn())
  localStorage.clear()
})

afterEach(() => {
  vi.doUnmock('./accountMode.js')
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
})

describe('autenticação no modo local do navegador', () => {
  it('cadastra, entra, salva dados e planos sem enviar requisições à rede', async () => {
    const api = await import('./authApi.js')
    const profile = await api.register({
      name: 'Ana Verde',
      email: 'ana@example.com',
      password: 'senha-segura-123',
    })
    expect(api.getCurrentSession()).toEqual(profile)

    await api.saveHabitEntry({
      date: new Date().toISOString().slice(0, 10),
      exerciseMinutes: 25,
      waterLiters: 1.5,
      steps: 3000,
    })
    await api.addTreeVisit('Parque Ibirapuera')
    const plan = await api.authenticatedRequest('/api/plans', {
      method: 'POST',
      body: JSON.stringify({
        title: 'Plantio',
        body: 'Mudas nativas.',
        place: 'Horto comunitário',
        date: new Date().toISOString().slice(0, 10),
        userId: 1,
      }),
    })
    expect(await api.authenticatedRequest('/api/plans')).toMatchObject([
      { id: plan.id, title: 'Plantio', place: 'Horto comunitário' },
    ])

    await api.logout()
    expect(api.getCurrentSession()).toBeNull()
    const signedIn = await api.login({ email: 'ana@example.com', password: 'senha-segura-123' })
    expect(signedIn.habitEntries).toHaveLength(1)
    expect(signedIn.treeVisits).toHaveLength(1)
    expect(signedIn.plans).toHaveLength(1)
    expect(fetch).not.toHaveBeenCalled()
  })
})
