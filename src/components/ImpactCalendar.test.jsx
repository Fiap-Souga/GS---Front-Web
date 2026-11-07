// @vitest-environment jsdom
import React from 'react'
import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { ImpactCalendar } from './ImpactCalendar.jsx'

describe('ImpactCalendar', () => {
  it('combines visits, habits, and community actions by date', () => {
    const now = new Date()
    const visitDate = new Date(now.getTime() - now.getTimezoneOffset() * 60_000).toISOString().slice(0, 10)
    render(
      <ImpactCalendar
        profile={{
          treeVisits: [{ place: 'Horto comunitário', visitedAt: `${visitDate}T12:30:00.000Z` }],
          habitEntries: [{ date: visitDate, exerciseMinutes: 25, waterLiters: 1.5, steps: 3500 }],
        }}
        plans={[{ title: 'Mutirão de plantio', place: 'Praça nova', date: visitDate }]}
      />,
    )

    const summary = [...document.querySelectorAll('.impact-calendar-summary span')].map((item) => item.textContent)
    expect(summary).toEqual(expect.arrayContaining([
      '1 visita verde',
      '1 dia de hábitos',
      '1 ação comunitária',
    ]))
    const markedDay = screen.getByRole('button', { name: /Horto comunitário/ })
    expect(markedDay.getAttribute('title')).toContain('Mutirão de plantio')
    fireEvent.click(markedDay)

    expect(screen.getByText('Visita a Horto comunitário')).toBeTruthy()
    expect(screen.getAllByText('Hábitos registrados').length).toBeGreaterThan(1)
    expect(screen.getByText('Mutirão de plantio')).toBeTruthy()
    expect([...document.querySelectorAll('.impact-day-details li span')]
      .some((item) => item.textContent.includes('Praça nova'))).toBe(true)
  })
})
