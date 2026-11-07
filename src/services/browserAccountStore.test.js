// @vitest-environment jsdom
import { webcrypto } from 'node:crypto'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
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

const STORAGE_KEY = 'raiz-urbana-browser-accounts:v1'

beforeEach(() => {
  vi.stubGlobal('crypto', webcrypto)
  localStorage.clear()
  logoutBrowserAccount()
})

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('contas locais criptografadas no navegador', () => {
  it('cria uma conta sem guardar a senha nem os dados pessoais em texto aberto', async () => {
    const profile = await registerBrowserAccount({
      name: 'Ana Verde',
      email: 'ANA@example.com',
      password: 'senha-segura-123',
    })
    const serialized = localStorage.getItem(STORAGE_KEY)

    expect(profile).toMatchObject({
      name: 'Ana Verde',
      email: 'ana@example.com',
      treeVisits: [],
      habitEntries: [],
      plans: [],
    })
    expect(serialized).not.toContain('senha-segura-123')
    expect(serialized).not.toContain('Ana Verde')
    expect(serialized).not.toContain('habitEntries')
    expect(getBrowserAccountProfile()).toEqual(profile)
  })

  it('requer a senha correta e permite entrar novamente após sair', async () => {
    await registerBrowserAccount({
      name: 'Ana Verde',
      email: 'ana@example.com',
      password: 'senha-segura-123',
    })
    logoutBrowserAccount()

    await expect(loginBrowserAccount('ana@example.com', 'senha-errada-123'))
      .rejects.toThrow('E-mail ou senha incorretos.')
    await expect(loginBrowserAccount('ana@example.com', 'senha-segura-123'))
      .resolves.toMatchObject({ name: 'Ana Verde', email: 'ana@example.com' })
  })

  it('mantém perfil, árvore, hábitos e planos criptografados após cada alteração', async () => {
    const profile = await registerBrowserAccount({
      name: 'Ana Verde',
      email: 'ana@example.com',
      password: 'senha-segura-123',
    })
    await updateBrowserAccountProfile((current) => ({
      ...current,
      treeVisits: [{ place: 'Parque Ibirapuera', visitedAt: '2026-11-06T12:00:00.000Z' }],
      habitEntries: [{ date: '2026-11-06', exerciseMinutes: 30, waterLiters: 1.5, steps: 4000 }],
    }))
    const plan = await createBrowserAccountPlan({
      title: 'Mutirão de plantio',
      body: 'Cuidar da praça.',
      userId: 1,
    })
    await updateBrowserAccountPlan(plan.id, { ...plan, title: 'Plantio comunitário' })

    logoutBrowserAccount()
    const restored = await loginBrowserAccount('ana@example.com', 'senha-segura-123')
    expect(restored.id).toBe(profile.id)
    expect(restored.treeVisits).toHaveLength(1)
    expect(restored.habitEntries).toHaveLength(1)
    expect(await getBrowserAccountPlans()).toMatchObject([
      { id: plan.id, title: 'Plantio comunitário' },
    ])
    await deleteBrowserAccountPlan(plan.id)
    expect(await getBrowserAccountPlans()).toEqual([])
  })

  it('recusa duplicatas e informa dados locais corrompidos', async () => {
    const values = {
      name: 'Ana Verde',
      email: 'ana@example.com',
      password: 'senha-segura-123',
    }
    await registerBrowserAccount(values)
    await expect(registerBrowserAccount(values)).rejects.toThrow('Já existe uma conta')
    logoutBrowserAccount()
    localStorage.setItem(STORAGE_KEY, '{inválido')
    await expect(loginBrowserAccount(values.email, values.password)).rejects.toThrow('corrompidos')
  })
})
