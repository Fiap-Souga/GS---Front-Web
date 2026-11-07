const FORMSPREE_ENDPOINT = 'https://formspree.io/f/xeaawgoz'
const SUBMIT_LABEL = 'Quero receber novidades'

export function initInterestForm() {
  const form = document.querySelector('#join-form')
  const message = document.querySelector('#form-message')
  const submitButton = form?.querySelector('button[type="submit"]')
  if (!form || !message || !submitButton) {
    throw new Error('Não foi possível iniciar o formulário de interesse.')
  }

  form.addEventListener('submit', async (event) => {
    event.preventDefault()
    if (!form.reportValidity()) return

    submitButton.disabled = true
    submitButton.textContent = 'Enviando...'
    message.textContent = ''

    try {
      const formData = new FormData(form)
      const response = await fetch(FORMSPREE_ENDPOINT, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.get('email'),
          _subject: 'Novo interesse no projeto Raiz Urbana',
        }),
      })

      let result
      try {
        result = await response.json()
      } catch {
        throw new Error('O serviço de cadastro respondeu de forma inesperada. Tente novamente.')
      }
      if (!response.ok) {
        const detail = Array.isArray(result?.errors)
          ? result.errors.map((error) => error.message).filter(Boolean).join(' ')
          : ''
        throw new Error(detail || 'Não foi possível registrar seu e-mail. Tente novamente.')
      }

      form.reset()
      message.textContent = 'Pronto! Seu e-mail foi registrado para receber atualizações do projeto.'
    } catch (error) {
      console.error('Não foi possível enviar o formulário de interesse.', error)
      message.textContent = error instanceof TypeError
        ? 'Não foi possível conectar ao serviço. Verifique sua conexão e tente novamente.'
        : error.message || 'Não foi possível registrar seu e-mail. Tente novamente.'
    } finally {
      submitButton.disabled = false
      submitButton.innerHTML = `${SUBMIT_LABEL} <span aria-hidden="true">→</span>`
    }
  })
}
