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
})

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

  return router
}
