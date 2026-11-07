// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from 'vitest'

const STORAGE_KEY = 'raiz-urbana-accessibility-zoom'

beforeEach(() => {
  vi.resetModules()
  localStorage.clear()
  document.documentElement.style.zoom = ''
  document.body.innerHTML = '<header class="site-header"></header>'
})

describe('controles de acessibilidade', () => {
  it('amplia, reduz e restaura a página salvando a preferência', async () => {
    const { initAccessibilityControls } = await import('./accessibility.js')
    initAccessibilityControls()

    document.querySelector('.accessibility-trigger').click()
    expect(document.querySelector('.accessibility-panel').hidden).toBe(false)

    document.querySelector('[data-zoom-action="increase"]').click()
    expect(document.documentElement.style.zoom).toBe('110%')
    expect(localStorage.getItem(STORAGE_KEY)).toBe('110')

    document.querySelector('[data-zoom-action="decrease"]').click()
    expect(document.documentElement.style.zoom).toBe('100%')

    document.querySelector('[data-zoom-action="increase"]').click()
    document.querySelector('.accessibility-reset').click()
    expect(document.documentElement.style.zoom).toBe('100%')
    expect(localStorage.getItem(STORAGE_KEY)).toBe('100')
  })

  it('restaura a preferência salva ao iniciar os controles', async () => {
    localStorage.setItem(STORAGE_KEY, '130')
    const { initAccessibilityControls } = await import('./accessibility.js')

    initAccessibilityControls()

    expect(document.documentElement.style.zoom).toBe('130%')
    expect(document.querySelector('.accessibility-zoom-value').textContent).toBe('130%')
  })
})
