// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { initInterestForm } from './interestForm.js'

const ENDPOINT = 'https://formspree.io/f/xeaawgoz'

beforeEach(() => {
  document.body.innerHTML = `
  <form id="join-form">
    <input name="email" type="email" value="ana@example.com" required />
    <button type="submit">Quero receber novidades</button>
  </form>
    <p id="form-message"></p>
  `
  vi.stubGlobal('fetch', vi.fn())
  vi.spyOn(HTMLFormElement.prototype, 'reportValidity').mockReturnValue(true)
  vi.spyOn(console, 'error').mockImplementation(() => {})
})

describe('formulário de interesse', () => {
  it('envia e-mail e consentimento ao Formspree e confirma sucesso', async () => {
    fetch.mockResolvedValue({
      ok: true,
      json: async () => ({ ok: true }),
    })
    initInterestForm()

    document.querySelector('#join-form').dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }))
    await vi.waitFor(() => expect(document.querySelector('#form-message').textContent).toContain('foi registrado'))

    expect(fetch).toHaveBeenCalledOnce()
    expect(fetch).toHaveBeenCalledWith(ENDPOINT, expect.objectContaining({
      method: 'POST',
      headers: expect.objectContaining({ Accept: 'application/json' }),
      body: JSON.stringify({
        email: 'ana@example.com',
        _subject: 'Novo interesse no projeto Raiz Urbana',
      }),
    }))
    expect(document.querySelector('#form-message').textContent).toContain('foi registrado')
    expect(document.querySelector('button[type="submit"]').disabled).toBe(false)
  })

  it('mostra o erro retornado pelo serviço sem indicar sucesso', async () => {
    fetch.mockResolvedValue({
      ok: false,
      json: async () => ({ errors: [{ message: 'E-mail já cadastrado.' }] }),
    })
    initInterestForm()

    document.querySelector('#join-form').dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }))
    await vi.waitFor(() => expect(document.querySelector('#form-message').textContent).toBe('E-mail já cadastrado.'))
    expect(document.querySelector('button[type="submit"]').disabled).toBe(false)
  })

  it('informa falha de conexão e permite tentar novamente', async () => {
    fetch.mockRejectedValue(new TypeError('fetch failed'))
    initInterestForm()

    document.querySelector('#join-form').dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }))
    await vi.waitFor(() => expect(document.querySelector('#form-message').textContent).toContain('Verifique sua conexão'))
    expect(document.querySelector('button[type="submit"]').disabled).toBe(false)
  })
})
