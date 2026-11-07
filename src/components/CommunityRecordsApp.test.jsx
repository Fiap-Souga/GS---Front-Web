// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { CommunityRecordsApp } from './CommunityRecordsApp.jsx'

let fetchMock

beforeEach(() => {
  fetchMock = vi.fn()
  vi.stubGlobal('fetch', fetchMock)
})

afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
})

describe('CommunityRecordsApp', () => {
  it('loads Portuguese demo records without depending on an external API', async () => {
    render(<CommunityRecordsApp />)

    expect(await screen.findByText('Mutirão de plantio na praça')).toBeTruthy()
    expect(screen.getByText('Cuidado coletivo com o parque')).toBeTruthy()
    expect(screen.getByText('Vamos plantar mudas de espécies nativas e deixar a praça mais verde. Traga luvas, uma garrafa de água e disposição para colaborar!')).toBeTruthy()
    expect(screen.getByText('Sábado de brincadeiras ao ar livre')).toBeTruthy()
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('creates a community action', async () => {
    const user = userEvent.setup()
    render(<CommunityRecordsApp />)
    await screen.findByText('Mutirão de plantio na praça')
    await user.click(screen.getByRole('button', { name: '+ Nova ação' }))
    await user.type(screen.getByLabelText('Título da ação'), 'Mutirão de plantio')
    await user.type(screen.getByLabelText('Descrição'), 'Plantio de árvores nativas.')
    await user.type(screen.getByLabelText('Local da ação'), 'Horto comunitário')
    fireEvent.change(screen.getByLabelText('Data da ação'), { target: { value: '2026-11-15' } })
    await user.click(screen.getByRole('button', { name: 'Criar ação' }))

    expect(await screen.findByText('Mutirão de plantio')).toBeTruthy()
    expect(screen.getByText('Horto comunitário')).toBeTruthy()
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('updates an action', async () => {
    const user = userEvent.setup()
    render(<CommunityRecordsApp />)
    await screen.findByText('Mutirão de plantio na praça')
    await user.click(screen.getAllByRole('button', { name: 'Editar' })[0])
    const title = screen.getByLabelText('Título da ação')
    await user.clear(title)
    await user.type(title, 'Plantio atualizado')
    await user.clear(screen.getByLabelText('Local da ação'))
    await user.type(screen.getByLabelText('Local da ação'), 'Praça nova')
    await user.click(screen.getByRole('button', { name: 'Salvar alterações' }))

    expect(await screen.findByText('Plantio atualizado')).toBeTruthy()
    expect(screen.getByText('Praça nova')).toBeTruthy()
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('deletes an action after confirmation', async () => {
    const user = userEvent.setup()
    render(<CommunityRecordsApp />)
    await screen.findByText('Mutirão de plantio na praça')
    await user.click(screen.getAllByRole('button', { name: 'Excluir' })[0])
    await user.click(screen.getByRole('alertdialog').querySelector('.record-delete-confirm'))

    await waitFor(() => expect(screen.queryByText('Mutirão de plantio na praça')).toBeNull())
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('validates required fields before creating an action', async () => {
    const user = userEvent.setup()
    render(<CommunityRecordsApp />)
    await screen.findByText('Mutirão de plantio na praça')
    await user.click(screen.getByRole('button', { name: '+ Nova ação' }))
    await user.click(screen.getByRole('button', { name: 'Criar ação' }))

    expect(screen.getByRole('alert').textContent).toContain('Preencha')
    expect(fetchMock.mock.calls.some(([, options]) => options?.method === 'POST')).toBe(false)
  })

  it('filters records by text', async () => {
    const user = userEvent.setup()
    render(<CommunityRecordsApp />)
    await screen.findByText('Mutirão de plantio na praça')
    await user.type(screen.getByRole('searchbox', { name: 'Buscar ações' }), 'Cuidado coletivo')

    expect(screen.getByText('Cuidado coletivo com o parque')).toBeTruthy()
    expect(screen.queryByText('Mutirão de plantio na praça')).toBeNull()
  })

  it('filters records by region', async () => {
    const user = userEvent.setup()
    render(<CommunityRecordsApp />)
    await screen.findByText('Mutirão de plantio na praça')
    await user.selectOptions(screen.getByLabelText('Filtrar por região'), '2')

    expect(screen.getByText('Cuidado coletivo com o parque')).toBeTruthy()
    expect(screen.getByText('Caminhada de observação da natureza')).toBeTruthy()
    expect(screen.queryByText('Mutirão de plantio na praça')).toBeNull()
  })

  it('shows demo data even when the external fetch mock fails and dismisses dialogs with Escape', async () => {
    fetchMock.mockRejectedValueOnce(new Error('API indisponível'))
    render(<CommunityRecordsApp />)
    expect(await screen.findByText('Mutirão de plantio na praça')).toBeTruthy()
    expect(screen.queryByRole('alert')).toBeNull()

    const user = userEvent.setup()
    await user.click(screen.getByRole('button', { name: '+ Nova ação' }))
    fireEvent.keyDown(document, { key: 'Escape' })
    expect(screen.queryByRole('dialog')).toBeNull()
  })
})
