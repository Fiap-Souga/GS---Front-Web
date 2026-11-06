import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import { rateLimit } from 'express-rate-limit'
import { randomBytes } from 'node:crypto'
import User from './models/User.js'
import Plan from './models/Plan.js'
import { createAuthRouter } from './routes/authRoutes.js'
import { createProfileRouter } from './routes/profileRoutes.js'
import { createPlanRouter } from './routes/planRoutes.js'
import { createRequireAuth } from './middleware/requireAuth.js'

const AUTH_RATE_LIMIT = {
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: { error: 'Muitas tentativas. Aguarde alguns minutos e tente novamente.' },
}

const defaultUserRepository = {
  create: (values) => User.create(values),
  findByEmailWithPassword: (email) => User.findByEmailWithPassword(email),
  findById: (id) => User.findById(id),
  updateProfile: (id, values) => User.findByIdAndUpdate(id, values, { new: true, runValidators: true }),
  addTreeVisit: (id, visit, limit) => User.findByIdAndUpdate(
    id,
    { $push: { treeVisits: { $each: [visit], $slice: -limit } } },
    { new: true },
  ),
  resetTreeVisits: (id) => User.findByIdAndUpdate(id, { $set: { treeVisits: [] } }, { new: true }),
}

const defaultPlanRepository = {
  create: (values) => Plan.create(values),
  findByOwner: (owner) => Plan.find({ owner }).sort({ createdAt: -1 }),
  updateByOwner: (id, owner, values) => Plan.findOneAndUpdate(
    { _id: id, owner },
    values,
    { new: true, runValidators: true },
  ),
  deleteByOwner: (id, owner) => Plan.findOneAndDelete({ _id: id, owner }),
}

export function createApp({
  userRepository = defaultUserRepository,
  planRepository = defaultPlanRepository,
  jwtSecret,
  clientOrigins = ['http://localhost:5173', 'http://localhost:4173'],
  trustProxyHops = 0,
  secureCookie = process.env.NODE_ENV === 'production',
} = {}) {
  if (!jwtSecret || Buffer.byteLength(jwtSecret, 'utf8') < 32) {
    throw new Error('JWT_SECRET precisa ter pelo menos 32 bytes aleatórios.')
  }

  const app = express()
  app.disable('x-powered-by')
  if (trustProxyHops > 0) app.set('trust proxy', trustProxyHops)
  app.use(helmet())
  app.use(cors({
    origin: (origin, callback) => callback(null, !origin || clientOrigins.includes(origin)),
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-CSRF-Token'],
    credentials: true,
  }))
  app.use(express.json({ limit: '10kb' }))

  app.get('/api/health', (request, response) => response.json({ status: 'ok' }))
  app.get('/api/csrf', (request, response) => {
    const token = randomBytes(32).toString('hex')
    const sameSite = secureCookie ? 'None; Secure' : 'Lax'
    response.append('Set-Cookie', `ru_csrf=${token}; Path=/; SameSite=${sameSite}; Max-Age=900`)
    return response.json({ csrfToken: token })
  })
  const requireAuth = createRequireAuth({ jwtSecret, userRepository })
  app.use('/api/auth', createAuthRouter({
    userRepository,
    jwtSecret,
    authLimiter: rateLimit(AUTH_RATE_LIMIT),
    secureCookie,
    requireAuth,
  }))
  app.use('/api/profile', createProfileRouter({
    userRepository,
    requireAuth,
  }))
  app.use('/api/plans', createPlanRouter({
    planRepository,
    requireAuth,
  }))

  app.use((error, request, response, next) => {
    if (response.headersSent) return next(error)

    if (error.type === 'entity.parse.failed') {
      return response.status(400).json({ error: 'O corpo da requisição não contém JSON válido.' })
    }
    if (error.type === 'entity.too.large') {
      return response.status(413).json({ error: 'A requisição excede o tamanho permitido.' })
    }

    console.error('Erro não tratado na API:', error)
    return response.status(500).json({ error: 'Erro interno. Tente novamente mais tarde.' })
  })

  return app
}
