import React, { useMemo, useState } from 'react'

const EVENT_TYPES = {
  visit: { label: 'Visita a área verde', className: 'impact-dot-visit' },
  habit: { label: 'Hábitos registrados', className: 'impact-dot-habit' },
  action: { label: 'Ação comunitária', className: 'impact-dot-action' },
}

const dateKey = (date) => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const localDateKey = (value) => {
  if (typeof value !== 'string') return ''
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  return dateKey(date)
}

const formatDate = (key, options = { dateStyle: 'long' }) => {
  const date = new Date(`${key}T12:00:00.000Z`)
  return new Intl.DateTimeFormat('pt-BR', { ...options, timeZone: 'UTC' }).format(date)
}

const formatTime = (value) => {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  return new Intl.DateTimeFormat('pt-BR', { hour: '2-digit', minute: '2-digit' }).format(date)
}

const shiftMonth = (date, offset) => new Date(date.getFullYear(), date.getMonth() + offset, 1)

const getMonthDays = (month) => {
  const firstDay = new Date(month.getFullYear(), month.getMonth(), 1)
  const offset = (firstDay.getDay() + 6) % 7
  const totalDays = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate()
  const cellCount = Math.ceil((offset + totalDays) / 7) * 7
  return Array.from({ length: cellCount }, (_, index) => {
    const day = index - offset + 1
    if (day < 1 || day > totalDays) return null
    const date = new Date(month.getFullYear(), month.getMonth(), day)
    return { date, key: dateKey(date), day }
  })
}

const addEvent = (events, date, event) => {
  if (!date) return
  const dayEvents = events.get(date) ?? []
  dayEvents.push(event)
  events.set(date, dayEvents)
}

export function ImpactCalendar({ profile, plans = [] }) {
  const [month, setMonth] = useState(() => {
    const now = new Date()
    return new Date(now.getFullYear(), now.getMonth(), 1)
  })
  const [selectedDate, setSelectedDate] = useState('')

  const eventsByDate = useMemo(() => {
    const events = new Map()
    for (const visit of profile?.treeVisits ?? []) {
      const date = localDateKey(visit.visitedAt)
      const time = formatTime(visit.visitedAt)
      addEvent(events, date, {
        type: 'visit',
        title: `Visita a ${visit.place}`,
        place: visit.place,
        detail: time ? `Registrada às ${time}` : 'Visita registrada',
      })
    }
    for (const entry of profile?.habitEntries ?? []) {
      addEvent(events, localDateKey(entry.date), {
        type: 'habit',
        title: 'Hábitos registrados',
        detail: `${entry.exerciseMinutes} min de atividade · ${entry.waterLiters} L de água · ${entry.steps} passos`,
      })
    }
    for (const plan of plans) {
      addEvent(events, localDateKey(plan.date), {
        type: 'action',
        title: plan.title,
        place: plan.place,
        detail: plan.place ? `Ação em ${plan.place}` : 'Ação comunitária',
      })
    }
    return events
  }, [plans, profile])

  const days = useMemo(() => getMonthDays(month), [month])
  const monthPrefix = `${month.getFullYear()}-${String(month.getMonth() + 1).padStart(2, '0')}-`
  const monthEvents = [...eventsByDate.entries()]
    .filter(([date]) => date.startsWith(monthPrefix))
    .flatMap(([date, events]) => events.map((event) => ({ ...event, date })))
  const activeDays = new Set(monthEvents.map((event) => event.date)).size
  const monthLabel = new Intl.DateTimeFormat('pt-BR', { month: 'long', year: 'numeric' }).format(month)
  const selectedEvents = eventsByDate.get(selectedDate) ?? []

  const tooltipForDay = (key, dayEvents) => {
    const date = formatDate(key)
    if (dayEvents.length === 0) return `${date} · Nenhum registro`
    return `${date}\n${dayEvents.map((event) => (
      [event.title, event.place, event.detail].filter(Boolean).join(' · ')
    )).join('\n')}`
  }

  return (
    <section className="impact-calendar" aria-labelledby="impact-calendar-title">
      <div className="impact-calendar-heading">
        <div>
          <span className="profile-eyebrow">SEU CAMINHO VERDE</span>
          <h3 id="impact-calendar-title">Calendário de impacto</h3>
          <p>Visitas, hábitos e ações reunidos em um só lugar. Passe ou toque nos dias marcados para ver os detalhes.</p>
        </div>
        <div className="impact-calendar-month-nav" aria-label="Navegar pelos meses">
          <button type="button" aria-label="Mês anterior" onClick={() => {
            setMonth((current) => shiftMonth(current, -1))
            setSelectedDate('')
          }}>‹</button>
          <strong aria-live="polite">{monthLabel}</strong>
          <button type="button" aria-label="Próximo mês" onClick={() => {
            setMonth((current) => shiftMonth(current, 1))
            setSelectedDate('')
          }}>›</button>
        </div>
      </div>

      <div className="impact-calendar-summary" aria-live="polite">
        <span><strong>{profile?.treeVisits?.length ?? 0}</strong> {(profile?.treeVisits?.length ?? 0) === 1 ? 'visita verde' : 'visitas verdes'}</span>
        <span><strong>{profile?.habitEntries?.length ?? 0}</strong> {(profile?.habitEntries?.length ?? 0) === 1 ? 'dia de hábitos' : 'dias de hábitos'}</span>
        <span><strong>{plans.length}</strong> {plans.length === 1 ? 'ação comunitária' : 'ações comunitárias'}</span>
        <span><strong>{activeDays}</strong>{activeDays === 1 ? ' dia ativo' : ' dias ativos'} no mês</span>
        <span><strong>{monthEvents.length}</strong>{monthEvents.length === 1 ? ' registro' : ' registros'} no mês</span>
      </div>

      <div className="impact-calendar-grid" role="group" aria-label={`Calendário de impacto de ${monthLabel}`}>
        {['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'].map((day) => (
          <span className="impact-weekday" key={day}>{day}</span>
        ))}
        {days.map((day, index) => {
          if (!day) return <span className="impact-day-empty" aria-hidden="true" key={`empty-${index}`} />
          const dayEvents = eventsByDate.get(day.key) ?? []
          const typeDots = [...new Set(dayEvents.map((event) => event.type))]
          const tooltip = tooltipForDay(day.key, dayEvents)
          return (
            <div className="impact-day-cell" key={day.key}>
              <button
                type="button"
                className={`impact-day${dayEvents.length ? ' has-events' : ''}${selectedDate === day.key ? ' is-selected' : ''}`}
                aria-label={tooltip.replaceAll('\n', '. ')}
                aria-pressed={selectedDate === day.key}
                title={tooltip.replaceAll('\n', ' | ')}
                data-tooltip={tooltip}
                onClick={() => setSelectedDate(day.key)}
              >
                <span>{day.day}</span>
                <span className="impact-day-dots" aria-hidden="true">
                  {typeDots.slice(0, 3).map((type) => (
                    <i className={`impact-day-dot ${EVENT_TYPES[type].className}`} key={type} />
                  ))}
                  {dayEvents.length > typeDots.length && <small>+{dayEvents.length - typeDots.length}</small>}
                </span>
              </button>
            </div>
          )
        })}
      </div>

      <div className="impact-calendar-legend" aria-label="Tipos de registro">
        {Object.entries(EVENT_TYPES).map(([type, item]) => (
          <span key={type}><i className={`impact-day-dot ${item.className}`} />{item.label}</span>
        ))}
      </div>

      <div className="impact-day-details" aria-live="polite">
        <h4>{selectedDate ? formatDate(selectedDate) : 'Escolha um dia no calendário'}</h4>
        {selectedEvents.length
          ? <ul>
            {selectedEvents.map((event, index) => (
              <li key={`${event.type}-${event.title}-${index}`}>
                <i className={`impact-day-dot ${EVENT_TYPES[event.type].className}`} />
                <div>
                  <strong>{event.title}</strong>
                  <span>{[event.place, event.detail].filter(Boolean).join(' · ')}</span>
                </div>
              </li>
            ))}
          </ul>
          : <p>{selectedDate ? 'Nenhuma atividade registrada neste dia.' : 'Os dias com pontos têm visitas, hábitos ou ações comunitárias.'}</p>}
      </div>
    </section>
  )
}
