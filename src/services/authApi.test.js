// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest'
import { authenticatedRequest, restoreSession } from './authApi.js'

const response = (body, status = 200) => ({
  status,
  ok: status >= 200 && status < 300,
  text: async () => body,
})

afterEach(() => {
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
})

describe('respostas da API de autenticação', () => {
  it('informa que a API está indisponível quando a rota CSRF retorna corpo vazio', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => response('', 500)))

    await expect(restoreSession()).rejects.toThrow(
      'A API em /api/csrf respondeu sem conteúdo (HTTP 500). Confirme que o servidor da API está ligado e acessível.',
    )
  })

  it('identifica a rota que retornou JSON malformado em vez de expor erro de parse', async () => {
    vi.stubGlobal('fetch', vi.fn()
      .mockResolvedValueOnce(response('{"csrfToken":"csrf-token"}'))
      .mockResolvedValueOnce(response('')))

    await expect(authenticatedRequest('/api/plans')).rejects.toThrow(
      'A API em /api/plans respondeu sem conteúdo (HTTP 200). Confirme que o servidor da API está ligado e acessível.',
    )
  })
})
