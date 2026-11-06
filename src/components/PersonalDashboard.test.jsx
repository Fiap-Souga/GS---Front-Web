// @vitest-environment jsdom
import React from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { PersonalDashboard } from './PersonalDashboard.jsx'

const mocks = vi.hoisted(() => ({
  profile: null,
  saveHabitEntry: vi.fn(),
  deleteHabitEntry: vi.fn(),
}))
const tourFixtures = []

vi.mock('../services/authApi.js', () => ({
  getCurrentSession: () => mocks.profile,
  saveHabitEntry: mocks.saveHabitEntry,
  deleteHabitEntry: mocks.deleteHabitEntry,
}))

const setProfile = (profile) => {
  mocks.profile = profile
  act(() => window.dispatchEvent(new CustomEvent('raiz-urbana:session', { detail: profile })))
}

const today = () => {
  const now = new Date()
  return new Date(now.getTime() - now.getTimezoneOffset() * 60_000).toISOString().slice(0, 10)
}

beforeEach(() => {
  mocks.profile = null
  mocks.saveHabitEntry.mockReset()
  mocks.deleteHabitEntry.mockReset()
  for (const selector of ['.account-panel', '.tree-growth-panel', '.community-records']) {
    const element = document.createElement('section')
    element.className = selector.slice(1)
    document.body.append(element)
    tourFixtures.push(element)
  }
})

afterEach(() => {
  cleanup()
  tourFixtures.splice(0).forEach((element) => element.remove())
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
  vi.useRealTimers()
})

describe('PersonalDashboard', () => {
  it('starts with zero totals and explains how to begin', () => {
    render(<PersonalDashboard />)
    setProfile({ id: 'user-1', habitEntries: [] })

    expect(screen.getByText(/Ainda não há registros/)).toBeTruthy()
    expect(screen.getByText('Você é novo por aqui?')).toBeTruthy()
    expect(screen.getByText('DIAS REGISTRADOS').parentElement.textContent).toContain('0')
    expect(screen.getByText('TEMPO DE ATIVIDADE').parentElement.textContent).toContain('0 min')
  })

  it('adds a daily record and updates the personal totals', async () => {
    const user = userEvent.setup()
    mocks.saveHabitEntry.mockImplementation(async (entry) => {
      const savedProfile = { ...mocks.profile, habitEntries: [entry] }
      setProfile(savedProfile)
      return savedProfile
    })
    render(<PersonalDashboard />)
    setProfile({ id: 'user-1', habitEntries: [] })
    const date = today()
    fireEvent.change(screen.getByLabelText('Data'), { target: { value: date } })
    await user.clear(screen.getByLabelText('Atividade física (minutos)'))
    await user.type(screen.getByLabelText('Atividade física (minutos)'), '25')
    await user.clear(screen.getByLabelText('Água (litros)'))
    await user.type(screen.getByLabelText('Água (litros)'), '1.5')
    await user.clear(screen.getByLabelText('Passos'))
    await user.type(screen.getByLabelText('Passos'), '3500')
    await user.click(screen.getByRole('button', { name: 'Adicionar registro' }))

    await screen.findByText(/25 min de atividade/)
    expect(mocks.saveHabitEntry).toHaveBeenCalledWith({
      date,
      exerciseMinutes: 25,
      waterLiters: 1.5,
      steps: 3500,
    }, false)
    expect(screen.getByText('DIAS REGISTRADOS').parentElement.textContent).toContain('1')
    expect(screen.getByText('TEMPO DE ATIVIDADE').parentElement.textContent).toContain('25 min')
  })

  it('lets the user edit and delete a saved day', async () => {
    const user = userEvent.setup()
    const entry = {
      date: today(),
      exerciseMinutes: 20,
      waterLiters: 1,
      steps: 2000,
    }
    mocks.saveHabitEntry.mockImplementation(async (updatedEntry) => {
      const savedProfile = { ...mocks.profile, habitEntries: [updatedEntry] }
      setProfile(savedProfile)
      return savedProfile
    })
    mocks.deleteHabitEntry.mockImplementation(async () => {
      const savedProfile = { ...mocks.profile, habitEntries: [] }
      setProfile(savedProfile)
      return savedProfile
    })
    render(<PersonalDashboard />)
    setProfile({ id: 'user-1', habitEntries: [entry] })
    await user.click(screen.getByRole('button', { name: 'Editar' }))
    await user.clear(screen.getByLabelText('Atividade física (minutos)'))
    await user.type(screen.getByLabelText('Atividade física (minutos)'), '40')
    await user.click(screen.getByRole('button', { name: 'Atualizar registro' }))
    await waitFor(() => expect(mocks.saveHabitEntry).toHaveBeenCalledWith({
      ...entry,
      exerciseMinutes: 40,
    }, true))

    await user.click(screen.getByRole('button', { name: 'Excluir' }))
    await waitFor(() => expect(mocks.deleteHabitEntry).toHaveBeenCalledWith(entry.date))
    expect(await screen.findByText(/Ainda não há registros/)).toBeTruthy()
  })

  it('guides a new user through profile sections and remembers tour completion', async () => {
    const user = userEvent.setup()
    render(<PersonalDashboard />)
    setProfile({ id: 'new-user', habitEntries: [] })

    await user.click(screen.getByRole('button', { name: /Começar tour/ }))
    expect(screen.getByRole('dialog')).toBeTruthy()
    expect(screen.getByRole('heading', { name: 'Seu perfil, do seu jeito' })).toBeTruthy()

    await user.click(screen.getByRole('button', { name: 'Próximo' }))
    expect(screen.getByRole('heading', { name: 'Registre seus hábitos' })).toBeTruthy()
    expect(document.querySelector('.habit-panel').classList.contains('tour-highlight')).toBe(true)

    await user.click(screen.getByRole('button', { name: 'Próximo' }))
    expect(screen.getByRole('heading', { name: 'Ajude sua árvore a crescer' })).toBeTruthy()
    await user.click(screen.getByRole('button', { name: 'Próximo' }))
    expect(screen.getByRole('heading', { name: 'Crie planos para sua comunidade' })).toBeTruthy()
    await user.click(screen.getByRole('button', { name: 'Concluir' }))

    expect(screen.queryByRole('dialog')).toBeNull()
    expect(localStorage.getItem('raiz-urbana-profile-tour:new-user')).toBe('completed')
    expect(screen.queryByRole('button', { name: /Começar tour/ })).toBeNull()
    expect(screen.getByRole('button', { name: 'Fazer tour' })).toBeTruthy()
  })

  it('exports the account records as a CSV file', async () => {
    const entry = {
      date: today(),
      exerciseMinutes: 20,
      waterLiters: 1.5,
      steps: 2000,
    }
    const createObjectURL = vi.fn(() => 'blob:habit-export')
    const revokeObjectURL = vi.fn()
    vi.stubGlobal('URL', { createObjectURL, revokeObjectURL })
    vi.useFakeTimers()
    const click = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(function () {
      expect(this.download).toBe('meus-registros-raiz-urbana.csv')
    })
    render(<PersonalDashboard />)
    setProfile({ id: 'export-user', habitEntries: [entry] })
    fireEvent.click(screen.getByRole('button', { name: 'Exportar CSV' }))

    expect(createObjectURL).toHaveBeenCalledWith(expect.any(Blob))
    expect(click).toHaveBeenCalledOnce()
    expect(screen.getByText('Seu arquivo CSV foi preparado para download.')).toBeTruthy()
    vi.runAllTimers()
    expect(revokeObjectURL).toHaveBeenCalledWith('blob:habit-export')
  })
})
