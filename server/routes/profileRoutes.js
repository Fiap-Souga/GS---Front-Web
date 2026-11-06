import { Router } from 'express'

const MAX_TREE_VISITS = 1000
const VALID_PLACES = new Set([
  'Parque Ibirapuera',
  'Parque Villa-Lobos',
  'Praça das Corujas',
  'Praça Benedito Calixto',
])

const publicProfile = (user) => ({
  id: user.id,
  name: user.name,
  email: user.email,
  treeVisits: (user.treeVisits ?? []).map((visit) => ({
    place: visit.place,
    visitedAt: visit.visitedAt,
  })),
  habitEntries: (user.habitEntries ?? []).map((entry) => ({
    date: entry.date,
    exerciseMinutes: entry.exerciseMinutes,
    waterLiters: entry.waterLiters,
    steps: entry.steps,
  })),
})

const isValidDate = (value) => {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false
  const parsed = new Date(`${value}T00:00:00.000Z`)
  return !Number.isNaN(parsed.getTime())
    && parsed.toISOString().slice(0, 10) === value
    && value <= new Date().toISOString().slice(0, 10)
}

const validateHabitEntry = (values) => {
  const { date, exerciseMinutes, waterLiters, steps } = values ?? {}
  if (
    !isValidDate(date)
    || !Number.isInteger(exerciseMinutes)
    || exerciseMinutes < 0
    || exerciseMinutes > 1440
    || typeof waterLiters !== 'number'
    || !Number.isFinite(waterLiters)
    || waterLiters < 0
    || waterLiters > 30
    || !Number.isInteger(steps)
    || steps < 0
    || steps > 200000
  ) return null
  return { date, exerciseMinutes, waterLiters, steps }
}

export function createProfileRouter({ userRepository, requireAuth }) {
  const router = Router()

  router.get('/', requireAuth, async (request, response, next) => {
    try {
      const user = await userRepository.findById(request.user.id)
      if (!user) return response.status(404).json({ error: 'Perfil não encontrado.' })
      return response.json({ profile: publicProfile(user) })
    } catch (error) {
      return next(error)
    }
  })

  router.patch('/', requireAuth, async (request, response, next) => {
    const name = typeof request.body?.name === 'string' ? request.body.name.trim() : ''
    if (name.length < 2 || name.length > 80) {
      return response.status(400).json({ error: 'O nome deve ter entre 2 e 80 caracteres.' })
    }

    try {
      const user = await userRepository.updateProfile(request.user.id, { name })
      if (!user) return response.status(404).json({ error: 'Perfil não encontrado.' })
      return response.json({ profile: publicProfile(user) })
    } catch (error) {
      return next(error)
    }
  })

  router.post('/tree-visits', requireAuth, async (request, response, next) => {
    const place = request.body?.place
    if (typeof place !== 'string' || !VALID_PLACES.has(place)) {
      return response.status(400).json({ error: 'Selecione uma área verde válida.' })
    }

    try {
      const user = await userRepository.addTreeVisit(request.user.id, {
        place,
        visitedAt: new Date(),
      }, MAX_TREE_VISITS)
      if (!user) return response.status(404).json({ error: 'Perfil não encontrado.' })
      return response.status(201).json({ profile: publicProfile(user) })
    } catch (error) {
      return next(error)
    }
  })

  router.delete('/tree-visits', requireAuth, async (request, response, next) => {
    try {
      const user = await userRepository.resetTreeVisits(request.user.id)
      if (!user) return response.status(404).json({ error: 'Perfil não encontrado.' })
      return response.json({ profile: publicProfile(user) })
    } catch (error) {
      return next(error)
    }
  })

  router.post('/habit-entries', requireAuth, async (request, response, next) => {
    const entry = validateHabitEntry(request.body)
    if (!entry) {
      return response.status(400).json({ error: 'Informe uma data válida e valores de hábitos dentro dos limites.' })
    }

    try {
      const user = await userRepository.upsertHabitEntry(request.user.id, entry)
      if (!user) return response.status(404).json({ error: 'Perfil não encontrado.' })
      return response.status(201).json({ profile: publicProfile(user) })
    } catch (error) {
      return next(error)
    }
  })

  router.put('/habit-entries/:date', requireAuth, async (request, response, next) => {
    const entry = validateHabitEntry({ ...request.body, date: request.params.date })
    if (!entry) {
      return response.status(400).json({ error: 'Informe uma data válida e valores de hábitos dentro dos limites.' })
    }

    try {
      const user = await userRepository.upsertHabitEntry(request.user.id, entry)
      if (!user) return response.status(404).json({ error: 'Perfil não encontrado.' })
      return response.json({ profile: publicProfile(user) })
    } catch (error) {
      return next(error)
    }
  })

  router.delete('/habit-entries/:date', requireAuth, async (request, response, next) => {
    if (!isValidDate(request.params.date)) {
      return response.status(400).json({ error: 'Selecione uma data válida.' })
    }

    try {
      const user = await userRepository.deleteHabitEntry(request.user.id, request.params.date)
      if (!user) return response.status(404).json({ error: 'Perfil não encontrado.' })
      return response.json({ profile: publicProfile(user) })
    } catch (error) {
      return next(error)
    }
  })

  return router
}
