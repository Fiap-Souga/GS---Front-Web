import { Router } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { randomBytes } from 'node:crypto'
import { createRequireAuth, TOKEN_AUDIENCE, TOKEN_ISSUER } from '../middleware/requireAuth.js'

const PASSWORD_MIN_LENGTH = 8
const PASSWORD_MAX_BYTES = 72
const BCRYPT_ROUNDS = 12
const TOKEN_LIFETIME = '15m'
const SESSION_COOKIE = 'ru_session'
const CSRF_COOKIE = 'ru_csrf'
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const DUMMY_PASSWORD_HASH = bcrypt.hash(randomBytes(32).toString('hex'), BCRYPT_ROUNDS)

const publicUser = (user) => ({
  id: user.id,
  name: user.name,
  email: user.email,
})

const createAccessToken = (userId, jwtSecret) => jwt.sign({}, jwtSecret, {
  algorithm: 'HS256',
  subject: userId,
  expiresIn: TOKEN_LIFETIME,
  issuer: TOKEN_ISSUER,
  audience: TOKEN_AUDIENCE,
})

const cookieOptions = ({ secureCookie }) => (
  `Path=/; SameSite=${secureCookie ? 'None; Secure' : 'Lax'}`
)

const setSessionCookies = (response, accessToken, csrfToken, secureCookie) => {
  const options = cookieOptions({ secureCookie })
  response.append('Set-Cookie', `${SESSION_COOKIE}=${accessToken}; HttpOnly; ${options}; Max-Age=900`)
  response.append('Set-Cookie', `${CSRF_COOKIE}=${csrfToken}; ${options}; Max-Age=900`)
}

const isValidEmail = (email) => (
  typeof email === 'string'
  && email.length <= 254
  && EMAIL_PATTERN.test(email.trim())
)

const isValidPassword = (password) => (
  typeof password === 'string'
  && password.length >= PASSWORD_MIN_LENGTH
  && Buffer.byteLength(password, 'utf8') <= PASSWORD_MAX_BYTES
)

export function createAuthRouter({
  userRepository,
  jwtSecret,
  authLimiter,
  secureCookie,
  requireAuth = createRequireAuth({ jwtSecret, userRepository }),
}) {
  const router = Router()

  router.post('/register', authLimiter, async (request, response, next) => {
    const { name, email, password } = request.body ?? {}
    const normalizedEmail = typeof email === 'string' ? email.trim().toLowerCase() : ''
    const normalizedName = typeof name === 'string' ? name.trim() : ''

    if (normalizedName.length < 2 || normalizedName.length > 80) {
      return response.status(400).json({ error: 'O nome deve ter entre 2 e 80 caracteres.' })
    }
    if (!isValidEmail(normalizedEmail)) {
      return response.status(400).json({ error: 'Informe um e-mail válido.' })
    }
    if (!isValidPassword(password)) {
      return response.status(400).json({
        error: `A senha deve ter ao menos ${PASSWORD_MIN_LENGTH} caracteres e no máximo ${PASSWORD_MAX_BYTES} bytes.`,
      })
    }

    try {
      const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS)
      const user = await userRepository.create({
        name: normalizedName,
        email: normalizedEmail,
        passwordHash,
      })
      const accessToken = createAccessToken(user.id, jwtSecret)
      const csrfToken = randomBytes(32).toString('hex')
      setSessionCookies(response, accessToken, csrfToken, secureCookie)

      return response.status(201).json({
        user: publicUser(user),
        accessToken,
        csrfToken,
        tokenType: 'Bearer',
        expiresIn: TOKEN_LIFETIME,
      })
    } catch (error) {
      if (error.code === 11000) {
        return response.status(409).json({ error: 'Não foi possível criar a conta com esses dados.' })
      }
      return next(error)
    }
  })

  router.post('/login', authLimiter, async (request, response, next) => {
    const { email, password } = request.body ?? {}
    if (
      !isValidEmail(email)
      || typeof password !== 'string'
      || password.length === 0
      || Buffer.byteLength(password, 'utf8') > PASSWORD_MAX_BYTES
    ) {
      return response.status(400).json({ error: 'Informe e-mail e senha válidos.' })
    }

    try {
      const user = await userRepository.findByEmailWithPassword(email.trim().toLowerCase())
      const passwordHash = user ? user.passwordHash : await DUMMY_PASSWORD_HASH
      const passwordMatches = await bcrypt.compare(password, passwordHash)

      if (!user || !passwordMatches) {
        return response.status(401).json({ error: 'E-mail ou senha incorretos.' })
      }

      const accessToken = createAccessToken(user.id, jwtSecret)
      const csrfToken = randomBytes(32).toString('hex')
      setSessionCookies(response, accessToken, csrfToken, secureCookie)
      return response.json({
        user: publicUser(user),
        accessToken,
        csrfToken,
        tokenType: 'Bearer',
        expiresIn: TOKEN_LIFETIME,
      })
    } catch (error) {
      return next(error)
    }
  })

  router.get('/me', requireAuth, (request, response) => {
    return response.json({ user: request.user })
  })

  router.post('/logout', requireAuth, (request, response) => {
    const options = cookieOptions({ secureCookie })
    response.append('Set-Cookie', `${SESSION_COOKIE}=; HttpOnly; ${options}; Max-Age=0`)
    response.append('Set-Cookie', `${CSRF_COOKIE}=; ${options}; Max-Age=0`)
    return response.status(204).end()
  })

  return router
}
