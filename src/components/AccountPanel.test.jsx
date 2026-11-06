// @vitest-environment jsdom
import React from 'react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { cleanup, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AccountPanel } from './AccountPanel.jsx'
import { login, register, restoreSession, updateProfile } from '../services/authApi.js'

vi.mock('../services/authApi.js', () => ({
  getCurrentSession: vi.fn(() => null),
  login: vi.fn(),
  logout: vi.fn(),
  register: vi.fn(),
  restoreSession: vi.fn(),
  updateProfile: vi.fn(),
}))

afterEach(() => {
  cleanup()
  vi.clearAllMocks()
})

describe('AccountPanel', () => {
  it('creates an account and shows the saved profile', async () => {
    const user = userEvent.setup()
    register.mockResolvedValue({
      id: 'user-1',
      name: 'Ana Verde',
      email: 'ana@example.com',
      treeVisits: [],
    })
    restoreSession.mockResolvedValue(null)
    render(<AccountPanel />)
    await screen.findByRole('button', { name: 'Criar conta' })
    await user.click(screen.getByRole('button', { name: 'Criar conta' }))
    await user.type(screen.getByLabelText('Nome'), 'Ana Verde')
    await user.type(screen.getByLabelText('E-mail'), 'ana@example.com')
    await user.type(screen.getByLabelText('Senha'), 'senha-segura-123')
    await user.click(screen.getByRole('button', { name: 'Criar minha conta' }))

    expect(await screen.findByText('Olá, Ana Verde')).toBeTruthy()
    expect(register).toHaveBeenCalledWith({
      name: 'Ana Verde',
      email: 'ana@example.com',
      password: 'senha-segura-123',
    })
  })

  it('updates the signed-in profile name', async () => {
    const user = userEvent.setup()
    const profile = {
      id: 'user-1',
      name: 'Ana Verde',
      email: 'ana@example.com',
      treeVisits: [],
    }
    restoreSession.mockImplementation(async () => {
      window.dispatchEvent(new CustomEvent('raiz-urbana:session', { detail: profile }))
      return profile
    })
    updateProfile.mockResolvedValue({ ...profile, name: 'Ana Silva' })
    render(<AccountPanel />)

    await screen.findByRole('button', { name: 'Salvar nome' })
    const nameInput = screen.getByLabelText('Nome do perfil')
    await user.clear(nameInput)
    await user.type(nameInput, 'Ana Silva')
    await user.click(screen.getByRole('button', { name: 'Salvar nome' }))

    expect(await screen.findByText('Olá, Ana Silva')).toBeTruthy()
    expect(updateProfile).toHaveBeenCalledWith('Ana Silva')
    await waitFor(() => expect(screen.getByRole('status').textContent).toContain('atualizado'))
  })
})
