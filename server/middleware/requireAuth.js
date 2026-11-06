import jwt from 'jsonwebtoken'
import mongoose from 'mongoose'
import { timingSafeEqual } from 'node:crypto'

const TOKEN_ISSUER = 'raiz-urbana-api'
const TOKEN_AUDIENCE = 'raiz-urbana-clients'
const SESSION_COOKIE = 'ru_session'
const CSRF_COOKIE = 'ru_csrf'

const readCookie = (request, name) => {
  const cookie = request.headers.cookie?.split(';').map((part) => part.trim())
    .find((part) => part.startsWith(`${name}=`))
  return cookie ? cookie.slice(name.length + 1) : ''
}

const hasValidCsrfToken = (request) => {
  const cookieToken = Buffer.from(readCookie(request, CSRF_COOKIE))
  const headerToken = Buffer.from(request.get('x-csrf-token') || '')
  if (cookieToken.length === 0 || cookieToken.length !== headerToken.length) return false
  return timingSafeEqual(cookieToken, headerToken)
}

export function createRequireAuth({ jwtSecret, userRepository }) {
  return async (request, response, next) => {
    const authorization = request.get('authorization') || ''
    const [scheme, bearerToken, extra] = authorization.split(' ')
    const cookieToken = readCookie(request, SESSION_COOKIE)
    const hasBearerToken = scheme === 'Bearer' && bearerToken && !extra
    const token = hasBearerToken ? bearerToken : cookieToken
    const cookieAuthenticated = !hasBearerToken

    if (!token || (authorization && !hasBearerToken)) {
      return response.status(401).json({ error: 'Autenticação necessária.' })
    }

    if (
      cookieAuthenticated
      && !['GET', 'HEAD', 'OPTIONS'].includes(request.method)
      && !hasValidCsrfToken(request)
    ) {
      return response.status(403).json({ error: 'Verificação de segurança inválida. Atualize a página e tente novamente.' })
    }

    let payload
    try {
      payload = jwt.verify(token, jwtSecret, {
        algorithms: ['HS256'],
        issuer: TOKEN_ISSUER,
        audience: TOKEN_AUDIENCE,
      })
    } catch {
      return response.status(401).json({ error: 'Token inválido ou expirado.' })
    }

    if (typeof payload === 'string' || !mongoose.isValidObjectId(payload.sub)) {
      return response.status(401).json({ error: 'Token inválido ou expirado.' })
    }

    try {
      const user = await userRepository.findById(payload.sub)
      if (!user) {
        return response.status(401).json({ error: 'Token inválido ou expirado.' })
      }

      request.user = {
        id: user.id,
        name: user.name,
        email: user.email,
      }
      request.authMethod = cookieAuthenticated ? 'cookie' : 'bearer'
      return next()
    } catch (error) {
      return next(error)
    }
  }
}

export { TOKEN_AUDIENCE, TOKEN_ISSUER }
