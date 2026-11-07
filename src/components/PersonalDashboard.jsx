import React, { useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { deleteHabitEntry, getCurrentSession, saveHabitEntry } from '../services/authApi.js'
import '../react.css'

const localDate = () => {
  const now = new Date()
  const offset = now.getTimezoneOffset() * 60_000
  return new Date(now.getTime() - offset).toISOString().slice(0, 10)
}

const formatDate = (date) => new Intl.DateTimeFormat('pt-BR', {
  dateStyle: 'long',
  timeZone: 'UTC',
}).format(new Date(`${date}T12:00:00.000Z`))

const number = (value, fractionDigits = 0) => new Intl.NumberFormat('pt-BR', {
  maximumFractionDigits: fractionDigits,
}).format(value)

const TOUR_STEPS = [
  {
    selector: '.account-panel',
    title: 'Seu perfil, do seu jeito',
    text: 'Altere seu nome e confira qual conta está conectada. Seus dados são privados desta conta.',
  },
  {
    selector: '.habit-panel',
    title: 'Registre seus hábitos',
    text: 'Escolha o dia, adicione atividade, água e passos. Você pode voltar para editar ou excluir qualquer registro.',
  },
  {
    selector: '.tree-growth-panel',
    title: 'Ajude sua árvore a crescer',
    text: 'Registre uma visita a uma área verde para acompanhar o crescimento da sua árvore digital.',
  },
  {
    selector: '.community-records',
    title: 'Crie planos para sua comunidade',
    text: 'Adicione iniciativas, filtre a lista e edite ou remova seus próprios planos.',
  },
]

const TOUR_STORAGE_PREFIX = 'raiz-urbana-profile-tour'

const getTourStorageKey = (userId) => `${TOUR_STORAGE_PREFIX}:${userId}`

const saveTourState = (userId, state) => {
  try {
    localStorage.setItem(getTourStorageKey(userId), state)
  } catch (error) {
    console.error('Não foi possível salvar a preferência do tutorial.', error)
  }
}

const readTourState = (userId) => {
  try {
    return localStorage.getItem(getTourStorageKey(userId))
  } catch (error) {
    console.error('Não foi possível carregar a preferência do tutorial.', error)
    return null
  }
}

const lastSevenDays = () => {
  const today = new Date(`${localDate()}T12:00:00.000Z`)
  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date(today)
    date.setUTCDate(today.getUTCDate() - (6 - index))
    const key = date.toISOString().slice(0, 10)
    return {
      date: key,
      label: new Intl.DateTimeFormat('pt-BR', { weekday: 'short', timeZone: 'UTC' })
        .format(date)
        .replace('.', ''),
    }
  })
}

export function PersonalDashboard() {
  const [profile, setProfile] = useState(getCurrentSession())
  const [date, setDate] = useState(localDate)
  const [exerciseMinutes, setExerciseMinutes] = useState('0')
  const [waterLiters, setWaterLiters] = useState('0')
  const [steps, setSteps] = useState('0')
  const [isSaving, setIsSaving] = useState(false)
  const [busyDate, setBusyDate] = useState('')
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [tourState, setTourState] = useState(null)
  const [tourStep, setTourStep] = useState(-1)
  const tourTriggerRef = useRef(null)
  const activeProfileId = useRef(profile?.id ?? null)

  useEffect(() => {
    const syncProfile = (event) => {
      const nextProfile = event.detail
      setProfile(nextProfile)
      const nextProfileId = nextProfile?.id ?? null
      if (nextProfileId !== activeProfileId.current) {
        setTourStep(-1)
        setTourState(nextProfile ? readTourState(nextProfile.id) : null)
        activeProfileId.current = nextProfileId
      }
    }
    window.addEventListener('raiz-urbana:session', syncProfile)
    if (profile) setTourState(readTourState(profile.id))
    return () => window.removeEventListener('raiz-urbana:session', syncProfile)
  }, [])

  useEffect(() => {
    if (tourStep < 0) return undefined

    const target = document.querySelector(TOUR_STEPS[tourStep].selector)
    if (!target) {
      console.error(`Não foi possível encontrar a seção do tour: ${TOUR_STEPS[tourStep].selector}`)
      setTourStep(-1)
      return undefined
    }

    target.classList.add('tour-highlight')
    target.scrollIntoView?.({ behavior: 'smooth', block: 'center' })
    const closeOnEscape = (event) => {
      if (event.key === 'Escape') closeTour(false)
      if (event.key !== 'Tab') return
      const buttons = document.querySelectorAll('.profile-tour-card button:not(:disabled)')
      const firstButton = buttons[0]
      const lastButton = buttons[buttons.length - 1]
      if (event.shiftKey && document.activeElement === firstButton) {
        event.preventDefault()
        lastButton?.focus()
      } else if (!event.shiftKey && document.activeElement === lastButton) {
        event.preventDefault()
        firstButton?.focus()
      }
    }
    document.querySelector('.tour-next-button')?.focus()
    document.addEventListener('keydown', closeOnEscape)
    return () => {
      target.classList.remove('tour-highlight')
      document.removeEventListener('keydown', closeOnEscape)
    }
  }, [tourStep])

  const entries = profile?.habitEntries ?? []
  const entriesByDate = useMemo(() => new Map(entries.map((entry) => [entry.date, entry])), [entries])
  const weekDays = useMemo(lastSevenDays, [])
  const weekEntries = useMemo(
    () => new Map(entries.filter((entry) => weekDays.some((day) => day.date === entry.date))
      .map((entry) => [entry.date, entry])),
    [entries, weekDays],
  )
  const weekMinutes = useMemo(
    () => [...weekEntries.values()].reduce((sum, entry) => sum + entry.exerciseMinutes, 0),
    [weekEntries],
  )
  const maximumWeekMinutes = Math.max(weekMinutes, ...[...weekEntries.values()].map((entry) => entry.exerciseMinutes), 1)
  const totals = useMemo(() => entries.reduce((result, entry) => ({
    days: result.days + 1,
    sessions: result.sessions + Number(entry.exerciseMinutes > 0),
    minutes: result.minutes + entry.exerciseMinutes,
    water: result.water + entry.waterLiters,
    steps: result.steps + entry.steps,
  }), { days: 0, sessions: 0, minutes: 0, water: 0, steps: 0 }), [entries])

  if (!profile) return null

  const selectedEntry = entriesByDate.get(date)
  const startTour = () => {
    setTourStep(0)
    setTourState(null)
    saveTourState(profile.id, 'started')
  }
  const closeTour = (completed = false) => {
    setTourStep(-1)
    setTourState(completed ? 'completed' : 'dismissed')
    saveTourState(profile.id, completed ? 'completed' : 'dismissed')
    tourTriggerRef.current?.focus()
  }
  const exportEntries = () => {
    const columns = ['data', 'atividade_minutos', 'agua_litros', 'passos']
    const rows = entries.map((entry) => [
      entry.date,
      entry.exerciseMinutes,
      entry.waterLiters,
      entry.steps,
    ])
    const csv = [columns, ...rows]
      .map((row) => row.map((value) => `"${String(value).replaceAll('"', '""')}"`).join(';'))
      .join('\r\n')
    const url = URL.createObjectURL(new Blob(['\uFEFF', csv], { type: 'text/csv;charset=utf-8' }))
    const link = document.createElement('a')
    link.href = url
    link.download = 'meus-registros-raiz-urbana.csv'
    link.click()
    window.setTimeout(() => URL.revokeObjectURL(url), 1000)
    setNotice('Seu arquivo CSV foi preparado para download.')
  }
  const submitEntry = async (event) => {
    event.preventDefault()
    setIsSaving(true)
    setError('')
    setNotice('')
    try {
      await saveHabitEntry({
        date,
        exerciseMinutes: Number(exerciseMinutes),
        waterLiters: Number(waterLiters),
        steps: Number(steps),
      }, Boolean(selectedEntry))
      setNotice(`Registro de ${formatDate(date)} salvo na sua conta.`)
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setIsSaving(false)
    }
  }

  const editEntry = (entry) => {
    setDate(entry.date)
    setExerciseMinutes(String(entry.exerciseMinutes))
    setWaterLiters(String(entry.waterLiters))
    setSteps(String(entry.steps))
    setError('')
    setNotice('')
    document.querySelector('#habit-entry-title')?.scrollIntoView?.({ behavior: 'smooth', block: 'center' })
  }

  const removeEntry = async (entry) => {
    setBusyDate(entry.date)
    setError('')
    setNotice('')
    try {
      await deleteHabitEntry(entry.date)
      setNotice(`Registro de ${formatDate(entry.date)} excluído.`)
      if (date === entry.date) {
        setExerciseMinutes('0')
        setWaterLiters('0')
        setSteps('0')
      }
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setBusyDate('')
    }
  }

  return (
    <div className="personal-dashboard">
      <section className="habit-panel" aria-labelledby="habit-entry-title">
        <div className="habit-panel-heading">
          <div>
            <span className="profile-eyebrow">ACOMPANHAMENTO PESSOAL</span>
            <h2 id="habit-entry-title">Seus hábitos, do seu jeito</h2>
            <p>Adicione um registro por dia. Se escolher uma data já registrada, você poderá atualizar os valores.</p>
          </div>
          <div className="habit-heading-actions">
            <button ref={tourTriggerRef} type="button" className="habit-tool-button" onClick={startTour}>Fazer tour</button>
            <button type="button" className="habit-tool-button" onClick={exportEntries} disabled={entries.length === 0}>
              Exportar CSV
            </button>
          </div>
        </div>

        <div className="habit-summary" aria-label="Totais registrados na conta">
          <article><span>DIAS REGISTRADOS</span><strong>{totals.days}</strong></article>
          <article><span>SESSÕES DE MOVIMENTO</span><strong>{totals.sessions}</strong></article>
          <article><span>TEMPO DE ATIVIDADE</span><strong>{number(totals.minutes)} <small>min</small></strong></article>
          <article><span>ÁGUA REGISTRADA</span><strong>{number(totals.water, 1)} <small>L</small></strong></article>
          <article><span>PASSOS REGISTRADOS</span><strong>{number(totals.steps)}</strong></article>
        </div>

        <section className="habit-weekly" aria-labelledby="habit-weekly-title">
          <div className="habit-weekly-heading">
            <div>
              <h3 id="habit-weekly-title">Últimos 7 dias</h3>
              <p>{number(weekMinutes)} minutos de atividade registrados</p>
            </div>
            <span>{weekEntries.size} {weekEntries.size === 1 ? 'dia' : 'dias'} com registro</span>
          </div>
          <div className="habit-weekly-chart" role="img" aria-label="Gráfico de atividade física dos últimos sete dias">
            {weekDays.map((day) => {
              const entry = weekEntries.get(day.date)
              const minutes = entry?.exerciseMinutes ?? 0
              return (
                <div className="habit-weekly-day" key={day.date} aria-label={`${formatDate(day.date)}: ${minutes} minutos`}>
                  <span>{minutes ? `${minutes} min` : '—'}</span>
                  <div className="habit-weekly-track"><i style={{ height: `${minutes ? Math.max(8, (minutes / maximumWeekMinutes) * 100) : 0}%` }} /></div>
                  <small>{day.label}</small>
                </div>
              )
            })}
          </div>
        </section>

        <form className="habit-entry-form" onSubmit={submitEntry}>
          <label>Data
            <input type="date" max={localDate()} required value={date} onChange={(event) => setDate(event.target.value)} />
          </label>
          <label>Atividade física (minutos)
            <input type="number" min="0" max="1440" step="1" required value={exerciseMinutes} onChange={(event) => setExerciseMinutes(event.target.value)} />
          </label>
          <label>Água (litros)
            <input type="number" min="0" max="30" step="0.1" required value={waterLiters} onChange={(event) => setWaterLiters(event.target.value)} />
          </label>
          <label>Passos
            <input type="number" min="0" max="200000" step="1" required value={steps} onChange={(event) => setSteps(event.target.value)} />
          </label>
          <button type="submit" className="habit-save-button" disabled={isSaving}>
            {isSaving ? 'Salvando...' : selectedEntry ? 'Atualizar registro' : 'Adicionar registro'}
          </button>
        </form>

        {error && <p className="habit-message habit-error" role="alert">{error}</p>}
        {notice && <p className="habit-message" role="status">{notice}</p>}

        <div className="habit-history">
          <div className="habit-history-heading">
            <h3>Seus registros</h3>
            {entries.length > 0 && <span>{entries.length} {entries.length === 1 ? 'dia salvo' : 'dias salvos'}</span>}
          </div>
          {entries.length === 0 ? (
            <p className="habit-empty">Ainda não há registros. Escolha uma data e adicione seu primeiro acompanhamento.</p>
          ) : (
            <ul>
              {entries.map((entry) => (
                <li key={entry.date}>
                  <div>
                    <strong>{formatDate(entry.date)}</strong>
                    <span>{entry.exerciseMinutes} min de atividade · {number(entry.waterLiters, 1)} L de água · {number(entry.steps)} passos</span>
                  </div>
                  <div className="habit-entry-actions">
                    <button type="button" disabled={isSaving || Boolean(busyDate)} onClick={() => editEntry(entry)}>Editar</button>
                    <button type="button" disabled={isSaving || Boolean(busyDate)} onClick={() => removeEntry(entry)}>
                      {busyDate === entry.date ? 'Excluindo...' : 'Excluir'}
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
      {tourState !== 'dismissed' && tourState !== 'completed' && tourStep < 0 && (
        <aside className="tour-invitation" role="status">
          <span className="tour-invitation-icon" aria-hidden="true">✦</span>
          <div>
            <strong>Você é novo por aqui?</strong>
            <span>Faça um tour rápido pelo seu perfil.</span>
            <button type="button" onClick={startTour}>Começar tour <span aria-hidden="true">→</span></button>
          </div>
          <button type="button" className="tour-invitation-close" aria-label="Dispensar convite do tour" onClick={() => closeTour(false)}>×</button>
        </aside>
      )}
      {tourStep >= 0 && createPortal(
        <>
          <div className="profile-tour-backdrop" />
          <section className="profile-tour-card" role="dialog" aria-modal="true" aria-labelledby="profile-tour-title">
            <div className="profile-tour-progress">
              <span>SEU TOUR</span>
              <span>{tourStep + 1} de {TOUR_STEPS.length}</span>
            </div>
            <div className="profile-tour-track"><i style={{ width: `${((tourStep + 1) / TOUR_STEPS.length) * 100}%` }} /></div>
            <h2 id="profile-tour-title">{TOUR_STEPS[tourStep].title}</h2>
            <p>{TOUR_STEPS[tourStep].text}</p>
            <div className="profile-tour-actions">
              <button type="button" className="tour-skip-button" onClick={() => closeTour(false)}>Pular tour</button>
              <div>
                {tourStep > 0 && <button type="button" className="tour-back-button" onClick={() => setTourStep(tourStep - 1)}>Voltar</button>}
                <button
                  type="button"
                  className="tour-next-button"
                  onClick={() => tourStep === TOUR_STEPS.length - 1 ? closeTour(true) : setTourStep(tourStep + 1)}
                >
                  {tourStep === TOUR_STEPS.length - 1 ? 'Concluir' : 'Próximo'}
                </button>
              </div>
            </div>
          </section>
        </>,
        document.body,
      )}
    </div>
  )
}
