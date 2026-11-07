// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { CommunityRecordsApp } from './CommunityRecordsApp.jsx'

let fetchMock

const demoRecords = [
  ['Mutirão de plantio na praça', 'Vamos plantar mudas de espécies nativas e deixar a praça mais verde. Traga luvas, uma garrafa de água e disposição para colaborar!', 'Praça Benedito Calixto', 1],
  ['Cuidado coletivo com o parque', 'Encontro para recolher resíduos, cuidar dos canteiros e conversar sobre como manter o parque agradável para toda a vizinhança.', 'Parque Ibirapuera', 2],
  ['Horta comunitária para todos', 'Participe do preparo dos canteiros, do plantio de temperos e da troca de dicas para cuidar da horta comunitária.', 'Horta da Vila Madalena', 3],
  ['Compostagem no bairro', 'Aprenda a separar resíduos orgânicos e a transformá-los em adubo para as plantas da praça. Atividade aberta para iniciantes.', 'Praça das Corujas', 1],
  ['Caminhada de observação da natureza', 'Um passeio tranquilo para observar as árvores, conhecer as áreas verdes do bairro e compartilhar ideias para preservá-las.', 'Parque Villa-Lobos', 2],
  ['Oficina de jardins para polinizadores', 'Vamos montar um pequeno jardim com plantas que ajudam abelhas e borboletas. Cada pessoa pode trazer uma muda ou semente.', 'Praça do Pôr do Sol', 3],
  ['Roda de conversa sobre água', 'Encontro para trocar soluções simples de economia de água e conversar sobre a importância dos rios e nascentes da região.', 'Centro Cultural de Pinheiros', 1],
  ['Sábado de brincadeiras ao ar livre', 'Uma manhã de jogos, leitura e convivência na praça. Traga uma canga, um livro ou uma brincadeira para compartilhar.', 'Praça Horácio Sabino', 2],
].map(([title, body, place, userId], index) => ({
  id: String(index + 1),
  name: title,
  data: {
    app: 'raiz-urbana',
    body: `${body}\n[ru-place]:${encodeURIComponent(place)}`,
    userId,
  },
}))

const jsonResponse = (body, status = 200) => ({
  ok: status >= 200 && status < 300,
  status,
  json: async () => body,
})

beforeEach(() => {
  window.localStorage.clear()
  window.localStorage.setItem(
    'raiz-urbana-public-action-ids:v1',
    JSON.stringify(demoRecords.map((record) => record.id)),
  )
  fetchMock = vi.fn(async (url, options = {}) => {
    const method = options.method || 'GET'
    if (method === 'DELETE') return { ok: true, status: 200 }
    if (method === 'POST') {
      return jsonResponse({ ...JSON.parse(options.body), id: 'external-101' }, 201)
    }
    if (method === 'PUT') {
      return jsonResponse({
        ...JSON.parse(options.body),
        id: url.split('/').pop(),
      })
    }
    return jsonResponse(demoRecords.find((record) => record.id === url.split('/').pop()))
  })
  vi.stubGlobal('fetch', fetchMock)
})

afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
})

describe('CommunityRecordsApp', () => {
  it('loads Portuguese demo records using identifiers from the public API', async () => {
    render(<CommunityRecordsApp />)

    expect(await screen.findByText('Mutirão de plantio na praça')).toBeTruthy()
    expect(screen.getByText('Cuidado coletivo com o parque')).toBeTruthy()
    expect(screen.getByText('Vamos plantar mudas de espécies nativas e deixar a praça mais verde. Traga luvas, uma garrafa de água e disposição para colaborar!')).toBeTruthy()
    expect(screen.getByText('Sábado de brincadeiras ao ar livre')).toBeTruthy()
    expect(fetchMock).toHaveBeenCalledWith(
      'https://api.restful-api.dev/objects/1',
      expect.objectContaining({ signal: expect.any(AbortSignal) }),
    )
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
    expect(fetchMock).toHaveBeenCalledWith('https://api.restful-api.dev/objects', expect.objectContaining({
      method: 'POST',
      body: expect.stringContaining('"name":"Mutirão de plantio"'),
    }))
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
    expect(fetchMock).toHaveBeenCalledWith('https://api.restful-api.dev/objects/1', expect.objectContaining({
      method: 'PUT',
      body: expect.stringContaining('"name":"Plantio atualizado"'),
    }))
  })

  it('deletes an action after confirmation', async () => {
    const user = userEvent.setup()
    render(<CommunityRecordsApp />)
    await screen.findByText('Mutirão de plantio na praça')
    await user.click(screen.getAllByRole('button', { name: 'Excluir' })[0])
    await user.click(screen.getByRole('alertdialog').querySelector('.record-delete-confirm'))

    await waitFor(() => expect(screen.queryByText('Mutirão de plantio na praça')).toBeNull())
    expect(fetchMock).toHaveBeenCalledWith('https://api.restful-api.dev/objects/1', { method: 'DELETE' })
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

  it('shows an explicit API error instead of hiding a failed request and dismisses dialogs with Escape', async () => {
    fetchMock.mockRejectedValueOnce(new Error('API indisponível'))
    render(<CommunityRecordsApp />)
    expect(await screen.findByRole('alert')).toBeTruthy()
    expect(screen.queryByText('Mutirão de plantio na praça')).toBeNull()

    const user = userEvent.setup()
    await user.click(screen.getByRole('button', { name: '+ Nova ação' }))
    fireEvent.keyDown(document, { key: 'Escape' })
    expect(screen.queryByRole('dialog')).toBeNull()
  })
})
