// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { CommunityRecordsApp } from './CommunityRecordsApp.jsx'

const initialRecords = [
  { id: 1, apiId: 1, userId: 1, title: 'Plantio na praça', body: 'Mutirão de mudas nativas.' },
  { id: 2, apiId: 2, userId: 2, title: 'Limpeza do parque', body: 'Cuidado com a área verde.' },
]

let fetchMock

const response = (data, status = 200) => ({
  ok: status >= 200 && status < 300,
  status,
  json: async () => data,
})

beforeEach(() => {
  fetchMock = vi.fn(async (url, options = {}) => {
    if (options.method === 'POST') {
      return response({ ...JSON.parse(options.body), id: 101 }, 201)
    }
    if (options.method === 'PUT') {
      return response(JSON.parse(options.body))
    }
    if (options.method === 'DELETE') {
      return response(null)
    }
    return response(initialRecords)
  })
  vi.stubGlobal('fetch', fetchMock)
})

afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
})

describe('CommunityRecordsApp', () => {
  it('loads records from the API', async () => {
    render(<CommunityRecordsApp />)

    expect(await screen.findByText('Plantio na praça')).toBeTruthy()
    expect(screen.getByText('Limpeza do parque')).toBeTruthy()
    expect(fetchMock).toHaveBeenCalledWith(
      'https://jsonplaceholder.typicode.com/posts?_limit=8',
      expect.objectContaining({ signal: expect.any(AbortSignal) }),
    )
  })

  it('creates a community action', async () => {
    const user = userEvent.setup()
    render(<CommunityRecordsApp />)
    await screen.findByText('Plantio na praça')
    await user.click(screen.getByRole('button', { name: '+ Nova ação' }))
    await user.type(screen.getByLabelText('Título da ação'), 'Mutirão de plantio')
    await user.type(screen.getByLabelText('Descrição'), 'Plantio de árvores nativas.')
    await user.click(screen.getByRole('button', { name: 'Criar ação' }))

    expect(await screen.findByText('Mutirão de plantio')).toBeTruthy()
    expect(fetchMock.mock.calls.some(([, options]) => options?.method === 'POST')).toBe(true)
  })

  it('updates an action', async () => {
    const user = userEvent.setup()
    render(<CommunityRecordsApp />)
    await screen.findByText('Plantio na praça')
    await user.click(screen.getAllByRole('button', { name: 'Editar' })[0])
    const title = screen.getByLabelText('Título da ação')
    await user.clear(title)
    await user.type(title, 'Plantio atualizado')
    await user.click(screen.getByRole('button', { name: 'Salvar alterações' }))

    expect(await screen.findByText('Plantio atualizado')).toBeTruthy()
    expect(fetchMock.mock.calls.some(([, options]) => options?.method === 'PUT')).toBe(true)
  })

  it('deletes an action after confirmation', async () => {
    const user = userEvent.setup()
    render(<CommunityRecordsApp />)
    await screen.findByText('Plantio na praça')
    await user.click(screen.getAllByRole('button', { name: 'Excluir' })[0])
    await user.click(screen.getByRole('alertdialog').querySelector('.record-delete-confirm'))

    await waitFor(() => expect(screen.queryByText('Plantio na praça')).toBeNull())
    expect(fetchMock.mock.calls.some(([, options]) => options?.method === 'DELETE')).toBe(true)
  })

  it('validates required fields before creating an action', async () => {
    const user = userEvent.setup()
    render(<CommunityRecordsApp />)
    await screen.findByText('Plantio na praça')
    await user.click(screen.getByRole('button', { name: '+ Nova ação' }))
    await user.click(screen.getByRole('button', { name: 'Criar ação' }))

    expect(screen.getByRole('alert').textContent).toContain('Preencha')
    expect(fetchMock.mock.calls.some(([, options]) => options?.method === 'POST')).toBe(false)
  })

  it('filters records by text', async () => {
    const user = userEvent.setup()
    render(<CommunityRecordsApp />)
    await screen.findByText('Plantio na praça')
    await user.type(screen.getByRole('searchbox', { name: 'Buscar ações' }), 'Limpeza')

    expect(screen.getByText('Limpeza do parque')).toBeTruthy()
    expect(screen.queryByText('Plantio na praça')).toBeNull()
  })

  it('filters records by region', async () => {
    const user = userEvent.setup()
    render(<CommunityRecordsApp />)
    await screen.findByText('Plantio na praça')
    await user.selectOptions(screen.getByLabelText('Filtrar por região'), '2')

    expect(screen.getByText('Limpeza do parque')).toBeTruthy()
    expect(screen.queryByText('Plantio na praça')).toBeNull()
  })

  it('reports API errors and can dismiss dialogs with Escape', async () => {
    fetchMock.mockImplementationOnce(async () => response({}, 503))
    render(<CommunityRecordsApp />)
    expect(await screen.findByRole('alert')).toBeTruthy()

    const user = userEvent.setup()
    await user.click(screen.getByRole('button', { name: '+ Nova ação' }))
    fireEvent.keyDown(document, { key: 'Escape' })
    expect(screen.queryByRole('dialog')).toBeNull()
  })
})
