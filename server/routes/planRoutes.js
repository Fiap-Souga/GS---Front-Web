import { Router } from 'express'
import mongoose from 'mongoose'

const toPublicPlan = (plan) => ({
  id: plan.id ?? String(plan._id),
  title: plan.title,
  body: plan.body,
  userId: plan.userId,
})

const validatePlan = (values) => {
  const title = typeof values?.title === 'string' ? values.title.trim() : ''
  const body = typeof values?.body === 'string' ? values.body.trim() : ''
  const userId = Number(values?.userId)
  if (!title || title.length > 100 || !body || body.length > 500 || ![1, 2, 3].includes(userId)) {
    return null
  }
  return { title, body, userId }
}

export function createPlanRouter({ planRepository, requireAuth }) {
  const router = Router()

  router.get('/', requireAuth, async (request, response, next) => {
    try {
      const plans = await planRepository.findByOwner(request.user.id)
      return response.json(plans.map(toPublicPlan))
    } catch (error) {
      return next(error)
    }
  })

  router.post('/', requireAuth, async (request, response, next) => {
    const values = validatePlan(request.body)
    if (!values) return response.status(400).json({ error: 'Informe título, descrição e região válidos.' })

    try {
      const plan = await planRepository.create({ ...values, owner: request.user.id })
      return response.status(201).json(toPublicPlan(plan))
    } catch (error) {
      return next(error)
    }
  })

  router.put('/:id', requireAuth, async (request, response, next) => {
    if (!mongoose.isValidObjectId(request.params.id)) {
      return response.status(400).json({ error: 'Ação inválida.' })
    }
    const values = validatePlan(request.body)
    if (!values) return response.status(400).json({ error: 'Informe título, descrição e região válidos.' })

    try {
      const plan = await planRepository.updateByOwner(request.params.id, request.user.id, values)
      if (!plan) return response.status(404).json({ error: 'Ação não encontrada.' })
      return response.json(toPublicPlan(plan))
    } catch (error) {
      return next(error)
    }
  })

  router.delete('/:id', requireAuth, async (request, response, next) => {
    if (!mongoose.isValidObjectId(request.params.id)) {
      return response.status(400).json({ error: 'Ação inválida.' })
    }

    try {
      const deleted = await planRepository.deleteByOwner(request.params.id, request.user.id)
      if (!deleted) return response.status(404).json({ error: 'Ação não encontrada.' })
      return response.status(204).end()
    } catch (error) {
      return next(error)
    }
  })

  return router
}
