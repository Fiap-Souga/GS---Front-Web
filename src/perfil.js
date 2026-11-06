import './style.css'
import './perfil.css'

const icon = (name) => {
  const paths = {
    leaf: '<path d="M20 4c-9 0-15 3-15 10a6 6 0 0 0 6 6c7 0 10-7 9-16Z"/><path d="M5 20c2-5 6-8 11-11"/>',
    walk: '<circle cx="13" cy="5" r="2"/><path d="m9 21 3-6-3-4 3-3 3 4 4 2M8 12l-4 2m4 7 3-4m6-4-1 5 3 3"/>',
    water: '<path d="M12 3.5S5 11 5 15a7 7 0 0 0 14 0c0-4-7-11.5-7-11.5Z"/><path d="M9 16a3 3 0 0 0 3 3"/>',
    activity: '<path d="M22 12h-4l-3 9L9 3l-3 9H2"/>',
    pin: '<path d="M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2.5"/>',
    arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>',
    back: '<path d="m15 18-6-6 6-6M9 12h12"/>',
    people: '<path d="M16 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="10" cy="7" r="4"/><path d="M20 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>',
    spark: '<path d="m12 3 1.9 5.8L20 11l-6.1 2.2L12 19l-1.9-5.8L4 11l6.1-2.2L12 3Z"/><path d="m19 14 1.2 2.8L23 18l-2.8 1.2L19 22l-1.2-2.8L15 18l2.8-1.2L19 14Z"/>',
    trophy: '<path d="M8 21h8m-4-4v4M7 4h10v5a5 5 0 0 1-10 0V4ZM7 7H4v2a4 4 0 0 0 4 4m9-6h3v2a4 4 0 0 1-4 4"/>',
    calendar: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M16 3v4M8 3v4M3 11h18"/>',
    tree: '<path d="m12 3 6 8h-3l5 7H4l5-7H6l6-8Z"/><path d="M12 18v4"/>',
  }
  return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths[name]}</svg>`
}

const periods = {
  week: {
    label: 'Esta semana',
    range: '10–16 nov',
    exercise: '3',
    minutes: '135',
    water: '11,2',
    steps: '24.680',
    distance: '18,4',
    greenPlaces: '4',
    points: '86',
    waterAverage: '1,6',
    activityGoal: 75,
    waterGoal: 80,
    stepsGoal: 71,
    days: [
      { short: 'Seg', full: 'Segunda-feira', exercise: 30, steps: '3.420', water: '1,6 L', place: 'Praça das Corujas' },
      { short: 'Ter', full: 'Terça-feira', exercise: 0, steps: '2.180', water: '1,4 L', place: 'Nenhuma área verde registrada' },
      { short: 'Qua', full: 'Quarta-feira', exercise: 45, steps: '5.260', water: '1,8 L', place: 'Parque Villa-Lobos' },
      { short: 'Qui', full: 'Quinta-feira', exercise: 20, steps: '3.810', water: '1,7 L', place: 'Praça Benedito Calixto' },
      { short: 'Sex', full: 'Sexta-feira', exercise: 0, steps: '2.740', water: '1,5 L', place: 'Nenhuma área verde registrada' },
      { short: 'Sáb', full: 'Sábado', exercise: 40, steps: '5.190', water: '1,8 L', place: 'Parque Ibirapuera' },
      { short: 'Dom', full: 'Domingo', exercise: 0, steps: '2.080', water: '1,4 L', place: 'Nenhuma área verde registrada' },
    ],
  },
  month: {
    label: 'Este mês',
    range: '01–16 nov',
    exercise: '11',
    minutes: '415',
    water: '25,6',
    steps: '93.420',
    distance: '70,2',
    greenPlaces: '8',
    waterAverage: '1,6',
    points: '302',
    activityGoal: 68,
    waterGoal: 74,
    stepsGoal: 63,
    days: [
      { short: '01–02', full: 'Dias 01–02', exercise: 55, steps: '11.340', water: '1,4 L/dia', place: 'Parque Ibirapuera' },
      { short: '03–04', full: 'Dias 03–04', exercise: 30, steps: '8.180', water: '1,5 L/dia', place: 'Praça das Corujas' },
      { short: '05–06', full: 'Dias 05–06', exercise: 75, steps: '12.260', water: '1,7 L/dia', place: 'Parque Villa-Lobos' },
      { short: '07–08', full: 'Dias 07–08', exercise: 20, steps: '7.810', water: '1,4 L/dia', place: 'Praça Benedito Calixto' },
      { short: '09–10', full: 'Dias 09–10', exercise: 60, steps: '14.740', water: '1,6 L/dia', place: 'Parque Ibirapuera' },
      { short: '11–12', full: 'Dias 11–12', exercise: 45, steps: '13.190', water: '1,8 L/dia', place: 'Parque Villa-Lobos' },
      { short: '13–14', full: 'Dias 13–14', exercise: 90, steps: '15.080', water: '1,5 L/dia', place: 'Praça das Corujas' },
      { short: '15–16', full: 'Dias 15–16', exercise: 40, steps: '10.820', water: '1,9 L/dia', place: 'Parque Ibirapuera' },
    ],
  },
}

const demoProfiles = {
  ana: {
    name: 'Ana',
    emoji: '🌿',
    activityScale: 1,
    waterScale: 1,
    stepsScale: 1,
    greenVisits: { week: 4, month: 8 },
    similarity: { week: 78, month: 74 },
  },
  bruno: {
    name: 'Bruno',
    emoji: '🌳',
    activityScale: 1.28,
    waterScale: 1.12,
    stepsScale: 1.22,
    greenVisits: { week: 6, month: 12 },
    similarity: { week: 86, month: 82 },
  },
  luiza: {
    name: 'Luiza',
    emoji: '🌱',
    activityScale: 0.72,
    waterScale: 0.88,
    stepsScale: 0.84,
    greenVisits: { week: 2, month: 5 },
    similarity: { week: 69, month: 72 },
  },
}

document.querySelector('#app').innerHTML = `
  <header class="site-header profile-header">
    <a class="brand" href="/" aria-label="Raiz Urbana, início"><span class="brand-mark">${icon('leaf')}</span><span>raiz<span class="brand-light">urbana</span></span></a>
    <a class="profile-back" href="/">${icon('back')} Voltar ao site</a>
  </header>
  <main class="profile-main">
    <div class="demo-banner">${icon('spark')} <span><strong>Perfis demonstrativos</strong> — todos os dados são fictícios. Visitas da árvore são registradas manualmente e salvas neste navegador.</span></div>
    <section class="profile-welcome">
      <div>
        <span class="profile-eyebrow">SEU ESPAÇO RAIZ URBANA</span>
        <h1>Oi, <strong id="profile-name">Ana</strong> <span id="profile-emoji">🌿</span></h1>
        <p>Veja como foram seus hábitos e encontros com a natureza.</p>
      </div>
      <div class="profile-pickers">
        <div class="profile-week-picker">
          ${icon('people')}
          <label class="visually-hidden" for="profile-select">Perfil demonstrativo</label>
          <select id="profile-select" aria-label="Escolher perfil demonstrativo">
            <option value="ana">Ana · perfil demonstrativo</option>
            <option value="bruno">Bruno · perfil demonstrativo</option>
            <option value="luiza">Luiza · perfil demonstrativo</option>
          </select>
          <span>⌄</span>
        </div>
        <div class="profile-week-picker">
          ${icon('calendar')}
          <label class="visually-hidden" for="period-select">Período dos dados demonstrativos</label>
          <select id="period-select" aria-label="Período">
            <option value="week">Esta semana · demonstração</option>
            <option value="month">Este mês · demonstração</option>
          </select>
          <span>⌄</span>
        </div>
      </div>
    </section>

    <section class="personal-stats" aria-label="Resumo de hábitos demonstrativos">
      <article class="personal-stat stat-exercise"><span class="personal-stat-icon">${icon('activity')}</span><span class="personal-stat-label">EXERCÍCIOS</span><strong><span id="exercise-sessions">3</span> <small>sessões</small></strong><p><span id="exercise-minutes">135</span> min de atividade</p></article>
      <article class="personal-stat stat-water"><span class="personal-stat-icon">${icon('water')}</span><span class="personal-stat-label">ÁGUA REGISTRADA</span><strong><span id="water-liters">11,2</span> <small>L</small></strong><p>média de <span id="water-average">1,6</span> L por dia</p></article>
      <article class="personal-stat stat-walking"><span class="personal-stat-icon">${icon('walk')}</span><span class="personal-stat-label">CAMINHADAS</span><strong><span id="walking-distance">18,4</span> <small>km</small></strong><p><span id="walking-steps">24.680</span> passos registrados</p></article>
      <article class="personal-stat stat-green"><span class="personal-stat-icon">${icon('pin')}</span><span class="personal-stat-label">LUGARES VERDES</span><strong><span id="green-visits">4</span> <small>visitas</small></strong><p>em parques e praças</p></article>
    </section>

    <section class="tree-growth-panel" aria-labelledby="tree-growth-title">
      <div class="tree-illustration-wrap">
        <svg id="growth-tree" class="growth-tree stage-0" viewBox="0 0 220 220" role="img" aria-label="Sua árvore está começando a brotar">
          <path class="tree-ground" d="M25 184h170" />
          <g class="tree-structure">
            <path class="tree-trunk" d="M110 184c-2-29 3-49 0-73-2-17-1-37 0-56" />
            <path class="tree-branch" d="M110 126c-16-12-27-23-35-38m35 21c16-12 26-23 34-39m-34 61c-16-7-25-14-35-25m35 14c14-8 23-15 32-27" />
            <g class="tree-crown tree-crown-1"><circle cx="75" cy="82" r="13"/><circle cx="88" cy="69" r="15"/><circle cx="101" cy="83" r="13"/></g>
            <g class="tree-crown tree-crown-2"><circle cx="126" cy="60" r="15"/><circle cx="143" cy="72" r="14"/><circle cx="127" cy="83" r="14"/></g>
            <g class="tree-crown tree-crown-3"><circle cx="89" cy="111" r="13"/><circle cx="105" cy="101" r="15"/><circle cx="120" cy="113" r="14"/><circle cx="105" cy="74" r="13"/></g>
            <g class="tree-crown tree-crown-4"><circle cx="66" cy="102" r="10"/><circle cx="154" cy="91" r="11"/><circle cx="105" cy="52" r="11"/></g>
          </g>
        </svg>
      </div>
      <div class="tree-growth-copy">
        <span class="profile-eyebrow">CUIDE DE UMA ÁRVORE DIGITAL</span>
        <h2 id="tree-growth-title">Sua árvore cresce com você.</h2>
        <p>Registre suas visitas a parques e áreas verdes para acompanhar o crescimento da sua árvore.</p>
        <div class="tree-stage-row"><strong id="tree-stage">Um novo broto</strong><span id="tree-visit-count">0 visitas registradas</span></div>
        <div class="tree-progress-track" role="progressbar" aria-label="Progresso para o próximo estágio da árvore" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0"><span id="tree-progress"></span></div>
        <p class="tree-next-step" id="tree-next-step">Registre sua primeira visita para ajudar a árvore a crescer.</p>
        <div class="tree-visit-controls">
          <label class="visually-hidden" for="tree-park-select">Parque ou área verde visitada</label>
          <select id="tree-park-select">
            <option value="Parque Ibirapuera">Parque Ibirapuera</option>
            <option value="Parque Villa-Lobos">Parque Villa-Lobos</option>
            <option value="Praça das Corujas">Praça das Corujas</option>
            <option value="Praça Benedito Calixto">Praça Benedito Calixto</option>
          </select>
          <button id="register-tree-visit" type="button">${icon('pin')} Registrar visita</button>
          <button class="tree-reset-button" id="reset-tree" type="button">Reiniciar árvore</button>
        </div>
        <p class="tree-visit-status" id="tree-visit-status" aria-live="polite">Progresso demonstrativo salvo somente neste navegador. Nenhuma localização é rastreada.</p>
      </div>
    </section>

    <section class="profile-grid">
      <article class="activity-panel">
        <div class="profile-section-heading">
          <div><span class="profile-eyebrow">SEU RITMO</span><h2>Semana em movimento</h2></div>
          <span class="activity-total"><strong id="chart-total">135</strong> min ativos</span>
        </div>
        <div class="activity-chart" id="activity-chart" role="group" aria-label="Minutos de atividade por dia"></div>
        <div class="day-detail" id="day-detail" aria-live="polite"></div>
        <div class="goal-list">
          <div class="goal-item"><span>${icon('activity')} Movimento</span><strong id="movement-goal-label">3 de 4 sessões</strong><div class="goal-track"><i id="movement-goal" style="width:75%"></i></div></div>
          <div class="goal-item"><span>${icon('water')} Hidratação registrada</span><strong id="water-goal-label">80% da meta pessoal</strong><div class="goal-track"><i id="water-goal" style="width:80%"></i></div></div>
          <div class="goal-item"><span>${icon('walk')} Caminhada</span><strong id="walk-goal-label">71% da meta semanal</strong><div class="goal-track"><i id="walk-goal" style="width:71%"></i></div></div>
        </div>
        <p class="health-note">Registros ilustrativos para acompanhar hábitos — não são avaliação ou orientação médica.</p>
      </article>

      <aside class="community-panel">
        <div class="community-panel-heading">${icon('people')} <span>VOCÊ E A COMUNIDADE</span></div>
        <h2>Seu jeito de cuidar<br />também inspira.</h2>
        <p class="community-intro">Em uma comparação fictícia com pessoas da sua região, seus hábitos têm semelhanças com:</p>
        <div class="similarity-score"><strong id="similarity-score">78<small>%</small></strong><div><span>de afinidade</span><small>com a comunidade do bairro</small></div></div>
        <div class="similarity-track" role="progressbar" aria-label="Afinidade demonstrativa com a comunidade" aria-valuemin="0" aria-valuemax="100" aria-valuenow="78"><span id="similarity-bar"></span></div>
        <span class="similarity-caption" id="similarity-caption">Seu perfil fictício está próximo de 78 em cada 100 participantes.</span>
        <div class="community-comparison">
          <div class="comparison-heading"><span>HÁBITO</span><span>VOCÊ</span><span>GRUPO*</span></div>
          <div><span>${icon('activity')} Atividade</span><strong id="compare-exercise">135 min</strong><span id="group-exercise">120 min</span></div>
          <div><span>${icon('water')} Água registrada</span><strong id="compare-water">1,6 L/dia</strong><span>1,8 L/dia</span></div>
          <div><span>${icon('pin')} Visitas verdes</span><strong id="compare-green">4 visitas</strong><span id="group-green">3 visitas</span></div>
        </div>
        <p class="group-disclaimer">*Média ilustrativa, sem participantes reais. Afinidade não é competição nem avaliação de saúde.</p>
      </aside>
    </section>

    <section class="places-panel">
      <div class="places-heading"><div><span class="profile-eyebrow">SEUS ENCONTROS COM A NATUREZA</span><h2>Lugares verdes que você visitou</h2></div><span class="visit-count">${icon('pin')} <span id="places-count">4</span> visitas</span></div>
      <div class="places-list" id="places-list"></div>
      <p class="places-note">Locais fictícios para demonstrar como futuras visitas registradas pelo aplicativo poderiam aparecer aqui.</p>
    </section>

    <section class="totem-note">
      <span class="totem-icon">${icon('people')}</span>
      <div><strong>Totens que conectam o bairro.</strong><p>No futuro, totens em áreas verdes poderão apresentar atividades comunitárias de forma agregada e com privacidade.</p></div>
      <span class="totem-tag">VISÃO DO PROJETO</span>
    </section>
  </main>
  <footer class="profile-footer"><a class="brand footer-brand" href="/"><span class="brand-mark">${icon('leaf')}</span><span>raiz<span class="brand-light">urbana</span></span></a><span>Uma cidade melhor cresce com todo mundo.</span><small>Prévia demonstrativa · nenhuma informação foi coletada</small></footer>
`

const activityChart = document.querySelector('#activity-chart')
const dayDetail = document.querySelector('#day-detail')
const growthTree = document.querySelector('#growth-tree')
const treeVisitStatus = document.querySelector('#tree-visit-status')
let selectedPeriod = 'week'
let selectedDayIndex = 0
let selectedProfileId = 'ana'
let treeVisitCount = 0
let lastTreeVisitPlace = ''
let treeStorageAvailable = true
const treeMilestones = [1, 3, 6, 10]
const getTreeStorageKey = () => selectedProfileId === 'ana'
  ? 'raiz-urbana-profile-tree'
  : `raiz-urbana-profile-tree-${selectedProfileId}`

const setupCustomPicker = (select) => {
  const container = select.closest('.profile-week-picker')
  const listboxId = `${select.id}-listbox`
  const trigger = document.createElement('button')
  const options = document.createElement('div')

  container.classList.add('has-custom-picker')
  select.hidden = true
  trigger.className = 'profile-picker-trigger'
  trigger.type = 'button'
  trigger.setAttribute('aria-label', select.getAttribute('aria-label'))
  trigger.setAttribute('aria-haspopup', 'listbox')
  trigger.setAttribute('aria-expanded', 'false')
  trigger.setAttribute('aria-controls', listboxId)
  options.className = 'profile-picker-options'
  options.id = listboxId
  options.setAttribute('role', 'listbox')
  options.setAttribute('aria-label', select.getAttribute('aria-label'))
  options.hidden = true

  const renderPicker = () => {
    trigger.textContent = select.selectedOptions[0].textContent
    options.querySelectorAll('[role="option"]').forEach((option) => {
      const selected = option.dataset.value === select.value
      option.setAttribute('aria-selected', String(selected))
      option.tabIndex = selected ? 0 : -1
    })
  }

  const closePicker = (restoreFocus = false) => {
    options.hidden = true
    trigger.setAttribute('aria-expanded', 'false')
    if (restoreFocus) trigger.focus()
  }

  const openPicker = (focusLast = false) => {
    document.querySelectorAll('.profile-picker-options:not([hidden])').forEach((openOptions) => {
      if (openOptions !== options) {
        openOptions.hidden = true
        document.querySelector(`[aria-controls="${openOptions.id}"]`)?.setAttribute('aria-expanded', 'false')
      }
    })
    options.hidden = false
    trigger.setAttribute('aria-expanded', 'true')
    const activeOption = options.querySelector(`[data-value="${select.value}"]`)
    const targetOption = focusLast ? options.lastElementChild : activeOption
    targetOption?.focus()
  }

  for (const option of select.options) {
    const item = document.createElement('button')
    item.className = 'profile-picker-option'
    item.type = 'button'
    item.setAttribute('role', 'option')
    item.dataset.value = option.value
    item.textContent = option.textContent
    item.addEventListener('click', () => {
      select.value = option.value
      renderPicker()
      closePicker(true)
      select.dispatchEvent(new Event('change', { bubbles: true }))
    })
    item.addEventListener('keydown', (event) => {
      const currentIndex = [...options.children].indexOf(item)
      let nextIndex = currentIndex
      if (event.key === 'ArrowDown') nextIndex = (currentIndex + 1) % options.children.length
      else if (event.key === 'ArrowUp') nextIndex = (currentIndex - 1 + options.children.length) % options.children.length
      else if (event.key === 'Home') nextIndex = 0
      else if (event.key === 'End') nextIndex = options.children.length - 1
      else if (event.key === 'Escape') {
        event.preventDefault()
        closePicker(true)
        return
      } else if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault()
        item.click()
        return
      } else return
      event.preventDefault()
      options.children[nextIndex].focus()
    })
    options.append(item)
  }

  trigger.addEventListener('click', () => {
    if (options.hidden) openPicker()
    else closePicker()
  })
  trigger.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowDown' || event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      openPicker()
    } else if (event.key === 'ArrowUp') {
      event.preventDefault()
      openPicker(true)
    }
  })
  select.addEventListener('change', renderPicker)
  document.addEventListener('pointerdown', (event) => {
    if (!container.contains(event.target)) closePicker()
  })

  container.append(trigger, options)
  renderPicker()
  return { close: closePicker }
}

const profilePicker = setupCustomPicker(document.querySelector('#profile-select'))
const periodPicker = setupCustomPicker(document.querySelector('#period-select'))
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') {
    profilePicker.close()
    periodPicker.close()
  }
})

const formatNumber = (number, maximumFractionDigits = 0) => new Intl.NumberFormat('pt-BR', {
  maximumFractionDigits,
}).format(number)

const getProfilePeriod = (period) => {
  const base = periods[period]
  const profile = demoProfiles[selectedProfileId]
  const parks = ['Parque Ibirapuera', 'Parque Villa-Lobos', 'Praça das Corujas', 'Praça Benedito Calixto']
  const visitCount = profile.greenVisits[period]
  const visitIndexes = new Set(Array.from(
    { length: Math.min(visitCount, base.days.length) },
    (_, index) => Math.floor(((index + 0.5) * base.days.length) / Math.min(visitCount, base.days.length)),
  ))
  const days = base.days.map((day, index) => {
    const waterValue = Number.parseFloat(day.water.replace(',', '.')) * profile.waterScale
    const stepsValue = Number(day.steps.replaceAll('.', '')) * profile.stepsScale
    return {
      ...day,
      exercise: Math.round(day.exercise * profile.activityScale),
      steps: formatNumber(stepsValue),
      water: `${formatNumber(waterValue, 1)} L${period === 'month' ? '/dia' : ''}`,
      place: selectedProfileId === 'ana'
        ? day.place
        : visitIndexes.has(index)
          ? parks[(index + (selectedProfileId === 'bruno' ? 1 : 2)) % parks.length]
          : 'Nenhuma área verde registrada',
    }
  })

  const minutes = days.reduce((total, day) => total + day.exercise, 0)
  const steps = Number(base.steps.replaceAll('.', '')) * profile.stepsScale
  const exerciseSessions = days.filter((day) => day.exercise > 0).length

  return {
    ...base,
    days,
    exercise: String(exerciseSessions),
    minutes: String(minutes),
    water: formatNumber(Number.parseFloat(base.water.replace(',', '.')) * profile.waterScale, 1),
    waterAverage: formatNumber(Number.parseFloat(base.waterAverage.replace(',', '.')) * profile.waterScale, 1),
    steps: formatNumber(steps),
    distance: formatNumber(Number.parseFloat(base.distance.replace(',', '.')) * profile.stepsScale, 1),
    greenPlaces: String(visitCount),
    activityGoal: Math.min(100, Math.round(base.activityGoal * profile.activityScale)),
    stepsGoal: Math.min(100, Math.round(base.stepsGoal * profile.stepsScale)),
  }
}

const loadTreeProgress = () => {
  treeVisitCount = 0
  lastTreeVisitPlace = ''
  treeStorageAvailable = true
  try {
    const savedTree = localStorage.getItem(getTreeStorageKey())
    if (savedTree !== null) {
      const parsedTree = JSON.parse(savedTree)
      if (!Number.isSafeInteger(parsedTree.visits) || parsedTree.visits < 0 || (parsedTree.lastPlace !== undefined && typeof parsedTree.lastPlace !== 'string')) {
        throw new Error('O progresso salvo da árvore está inválido.')
      }
      treeVisitCount = parsedTree.visits
      lastTreeVisitPlace = parsedTree.lastPlace ?? ''
    }
  } catch (error) {
    treeStorageAvailable = false
    console.error('Não foi possível carregar o progresso da árvore.', error)
    treeVisitStatus.textContent = 'Não foi possível carregar o progresso salvo. Novas visitas ficarão disponíveis somente nesta sessão.'
  }
}

const renderTreeProgress = () => {
  const stageIndex = treeVisitCount >= 10 ? 4 : treeMilestones.filter((milestone) => treeVisitCount >= milestone).length
  const previousMilestone = stageIndex === 0 ? 0 : treeMilestones[stageIndex - 1]
  const nextMilestone = treeMilestones[stageIndex]
  const progress = nextMilestone
    ? Math.round(((treeVisitCount - previousMilestone) / (nextMilestone - previousMilestone)) * 100)
    : 100
  const stageNames = ['Um novo broto', 'Uma muda', 'Árvore jovem', 'Árvore florescendo', 'Árvore frondosa']
  const treeScale = 0.38 + (Math.min(treeVisitCount, 10) / 10) * 0.62

  growthTree.setAttribute('class', `growth-tree stage-${stageIndex}`)
  growthTree.style.setProperty('--tree-growth', String(treeScale))
  growthTree.setAttribute('aria-label', `Sua árvore está no estágio: ${stageNames[stageIndex]}`)
  document.querySelector('#tree-stage').textContent = stageNames[stageIndex]
  document.querySelector('#tree-visit-count').textContent = `${treeVisitCount} ${treeVisitCount === 1 ? 'visita registrada' : 'visitas registradas'}`
  document.querySelector('.tree-progress-track').setAttribute('aria-valuenow', String(progress))
  document.querySelector('#tree-progress').style.width = `${progress}%`
  document.querySelector('#tree-next-step').textContent = nextMilestone
    ? `Mais ${nextMilestone - treeVisitCount} ${nextMilestone - treeVisitCount === 1 ? 'visita' : 'visitas'} para o próximo estágio.`
    : 'Sua árvore chegou ao estágio máximo. Continue visitando áreas verdes!'
  if (treeStorageAvailable) {
    treeVisitStatus.textContent = lastTreeVisitPlace
      ? `Última visita registrada: ${lastTreeVisitPlace}. Progresso salvo somente neste navegador.`
      : 'Progresso demonstrativo salvo somente neste navegador. Nenhuma localização é rastreada.'
  }
}

document.querySelector('#register-tree-visit').addEventListener('click', () => {
  lastTreeVisitPlace = document.querySelector('#tree-park-select').value
  treeVisitCount += 1
  renderTreeProgress()

  try {
    localStorage.setItem(getTreeStorageKey(), JSON.stringify({
      visits: treeVisitCount,
      lastPlace: lastTreeVisitPlace,
    }))
    treeStorageAvailable = true
    treeVisitStatus.textContent = `Visita ao ${lastTreeVisitPlace} registrada! Sua árvore está crescendo. O progresso fica salvo neste navegador.`
  } catch (error) {
    treeStorageAvailable = false
    console.error('Não foi possível salvar o progresso da árvore.', error)
    treeVisitStatus.textContent = 'Visita contabilizada nesta sessão, mas não foi possível salvar o progresso neste navegador.'
  }
})

document.querySelector('#reset-tree').addEventListener('click', () => {
  treeVisitCount = 0
  lastTreeVisitPlace = ''
  renderTreeProgress()

  try {
    localStorage.removeItem(getTreeStorageKey())
    treeStorageAvailable = true
    treeVisitStatus.textContent = 'Árvore reiniciada. Registre novas visitas para vê-la crescer novamente.'
  } catch (error) {
    treeStorageAvailable = false
    console.error('Não foi possível reiniciar o progresso salvo da árvore.', error)
    treeVisitStatus.textContent = 'Árvore reiniciada nesta sessão, mas não foi possível apagar o progresso salvo neste navegador.'
  }
})

loadTreeProgress()
renderTreeProgress()

const getSimilarity = (period) => demoProfiles[selectedProfileId].similarity[period]

const updateDayDetail = (day) => {
  dayDetail.innerHTML = `<strong>${day.full}</strong><span>${day.exercise ? `${day.exercise} min de atividade` : 'Sem exercício registrado'} · ${day.steps} passos · ${day.water} de água</span><span>${day.place === 'Nenhuma área verde registrada' ? day.place : `${icon('pin')} ${day.place}`}</span>`
}

const renderPeriod = (period) => {
  const data = getProfilePeriod(period)
  selectedPeriod = period
  selectedDayIndex = 0

  document.querySelector('#exercise-sessions').textContent = data.exercise
  document.querySelector('#exercise-minutes').textContent = data.minutes
  document.querySelector('#water-liters').textContent = data.water
  document.querySelector('#water-average').textContent = data.waterAverage
  document.querySelector('#walking-distance').textContent = data.distance
  document.querySelector('#walking-steps').textContent = data.steps
  document.querySelector('#green-visits').textContent = data.greenPlaces
  document.querySelector('#chart-total').textContent = data.minutes
  document.querySelector('#movement-goal-label').textContent = `${data.exercise} de ${period === 'week' ? '4' : '16'} sessões`
  document.querySelector('#water-goal-label').textContent = `${data.waterGoal}% da meta pessoal`
  document.querySelector('#walk-goal-label').textContent = `${data.stepsGoal}% da meta ${period === 'week' ? 'semanal' : 'mensal'}`
  document.querySelector('#movement-goal').style.width = `${data.activityGoal}%`
  document.querySelector('#water-goal').style.width = `${data.waterGoal}%`
  document.querySelector('#walk-goal').style.width = `${data.stepsGoal}%`
  document.querySelector('#similarity-score').innerHTML = `${getSimilarity(period)}<small>%</small>`
  document.querySelector('.similarity-track').setAttribute('aria-valuenow', String(getSimilarity(period)))
  document.querySelector('#similarity-bar').style.width = `${getSimilarity(period)}%`
  document.querySelector('#similarity-caption').textContent = `Seu perfil fictício está próximo de ${getSimilarity(period)} em cada 100 participantes.`
  document.querySelector('#compare-exercise').textContent = `${data.minutes} min`
  document.querySelector('#group-exercise').textContent = period === 'week' ? '120 min' : '480 min'
  document.querySelector('#compare-water').textContent = `${data.waterAverage} L/dia`
  document.querySelector('#compare-green').textContent = `${data.greenPlaces} visitas`
  document.querySelector('#group-green').textContent = period === 'week' ? '3 visitas' : '7 visitas'
  document.querySelector('#places-count').textContent = data.greenPlaces
  document.querySelector('#chart-total').textContent = data.minutes
  document.querySelector('.places-note').textContent = period === 'week'
    ? 'Locais fictícios para demonstrar como futuras visitas registradas pelo aplicativo poderiam aparecer aqui.'
    : 'Resumo fictício do mês. Locais sem nomes de pessoas ou dados identificáveis.'

  const heights = data.days.map((day) => day.exercise)
  const maximum = Math.max(...heights, 1)
  activityChart.innerHTML = data.days.map((day, index) => {
    const height = day.exercise ? Math.max(12, (day.exercise / maximum) * 100) : 5
    return `<button class="activity-day${index === selectedDayIndex ? ' is-selected' : ''}" type="button" data-day-index="${index}" aria-pressed="${index === selectedDayIndex}" aria-label="${day.full}: ${day.exercise} minutos de atividade"><span class="bar-value">${day.exercise ? `${day.exercise} min` : '—'}</span><span class="activity-bar"><i style="height:${height}%"></i></span><span class="day-name">${day.short}</span></button>`
  }).join('')

  activityChart.querySelectorAll('[data-day-index]').forEach((button) => {
    button.addEventListener('click', () => {
      selectedDayIndex = Number(button.dataset.dayIndex)
      activityChart.querySelectorAll('[data-day-index]').forEach((dayButton) => {
        const isSelected = Number(dayButton.dataset.dayIndex) === selectedDayIndex
        dayButton.classList.toggle('is-selected', isSelected)
        dayButton.setAttribute('aria-pressed', String(isSelected))
      })
      updateDayDetail(data.days[selectedDayIndex])
    })
  })

  const visitedPlaces = data.days
    .filter((day) => day.place !== 'Nenhuma área verde registrada')
    .reduce((places, day) => {
      const existingPlace = places.find((place) => place.name === day.place)
      if (existingPlace) existingPlace.visits += 1
      else places.push({ name: day.place, visits: 1 })
      return places
    }, [])
  document.querySelector('#places-list').innerHTML = visitedPlaces.map((place) => `
    <article class="place-item">
      <span class="place-pin">${icon('pin')}</span>
      <span class="place-copy"><strong>${place.name}</strong><small>Área verde · visita demonstrativa</small></span>
      <span class="place-visits">${place.visits} ${place.visits === 1 ? 'visita' : 'visitas'}</span>
    </article>
  `).join('')

  updateDayDetail(data.days[selectedDayIndex])
}

document.querySelector('#period-select').addEventListener('change', (event) => {
  renderPeriod(event.target.value)
})

document.querySelector('#profile-select').addEventListener('change', (event) => {
  selectedProfileId = event.target.value
  const profile = demoProfiles[selectedProfileId]
  document.querySelector('#profile-name').textContent = profile.name
  document.querySelector('#profile-emoji').textContent = profile.emoji
  loadTreeProgress()
  renderTreeProgress()
  renderPeriod(selectedPeriod)
})

renderPeriod(selectedPeriod)
