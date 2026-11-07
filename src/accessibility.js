const STORAGE_KEY = 'raiz-urbana-accessibility-zoom'
const ZOOM_LEVELS = [100, 110, 120, 130, 140]

const readSavedZoom = () => {
  try {
    const savedZoom = Number(localStorage.getItem(STORAGE_KEY))
    return ZOOM_LEVELS.includes(savedZoom) ? savedZoom : 100
  } catch (error) {
    console.error('Não foi possível carregar a preferência de acessibilidade.', error)
    return 100
  }
}

export function initAccessibilityControls() {
  const header = document.querySelector('.site-header')
  if (!header) throw new Error('Não foi possível encontrar o cabeçalho para os controles de acessibilidade.')

  let zoom = readSavedZoom()
  document.documentElement.style.zoom = `${zoom}%`

  const controls = document.createElement('div')
  controls.className = 'accessibility-controls'
  controls.innerHTML = `
    <button class="accessibility-trigger" type="button" aria-expanded="false" aria-controls="accessibility-panel">
      <span class="accessibility-trigger-icon" aria-hidden="true">A+</span>
      <span class="accessibility-label">Acessibilidade</span>
    </button>
    <section class="accessibility-panel" id="accessibility-panel" aria-label="Ajustes de acessibilidade" hidden>
      <strong>Facilite a leitura</strong>
      <p>Amplie o texto e os elementos da página.</p>
      <div class="accessibility-zoom-controls">
        <button type="button" data-zoom-action="decrease" aria-label="Diminuir ampliação">A−</button>
        <span class="accessibility-zoom-value" aria-live="polite"></span>
        <button type="button" data-zoom-action="increase" aria-label="Aumentar ampliação">A+</button>
      </div>
      <button class="accessibility-reset" type="button">Restaurar tamanho original</button>
    </section>
  `
  header.append(controls)

  const trigger = controls.querySelector('.accessibility-trigger')
  const panel = controls.querySelector('.accessibility-panel')
  const zoomValue = controls.querySelector('.accessibility-zoom-value')
  const decreaseButton = controls.querySelector('[data-zoom-action="decrease"]')
  const increaseButton = controls.querySelector('[data-zoom-action="increase"]')
  const resetButton = controls.querySelector('.accessibility-reset')

  const renderZoom = () => {
    document.documentElement.style.zoom = `${zoom}%`
    zoomValue.textContent = `${zoom}%`
    decreaseButton.disabled = zoom === ZOOM_LEVELS[0]
    increaseButton.disabled = zoom === ZOOM_LEVELS[ZOOM_LEVELS.length - 1]
    resetButton.disabled = zoom === ZOOM_LEVELS[0]
  }

  const saveZoom = (nextZoom) => {
    zoom = nextZoom
    renderZoom()
    try {
      localStorage.setItem(STORAGE_KEY, String(zoom))
    } catch (error) {
      console.error('Não foi possível salvar a preferência de acessibilidade.', error)
    }
  }

  trigger.addEventListener('click', () => {
    const isExpanded = trigger.getAttribute('aria-expanded') === 'true'
    trigger.setAttribute('aria-expanded', String(!isExpanded))
    panel.hidden = isExpanded
    if (!isExpanded) increaseButton.focus()
  })

  controls.addEventListener('click', (event) => {
    const action = event.target.closest('[data-zoom-action]')?.dataset.zoomAction
    if (action === 'increase') {
      const nextZoom = ZOOM_LEVELS[ZOOM_LEVELS.indexOf(zoom) + 1]
      if (nextZoom) saveZoom(nextZoom)
    } else if (action === 'decrease') {
      const nextZoom = ZOOM_LEVELS[ZOOM_LEVELS.indexOf(zoom) - 1]
      if (nextZoom) saveZoom(nextZoom)
    } else if (event.target === resetButton) {
      saveZoom(ZOOM_LEVELS[0])
    }
  })

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && !panel.hidden) {
      panel.hidden = true
      trigger.setAttribute('aria-expanded', 'false')
      trigger.focus()
    }
  })

  renderZoom()
}
