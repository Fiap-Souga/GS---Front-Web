import { extname, resolve } from 'node:path'

const parseOrigins = (value) => value
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean)

export function loadConfig(env = process.env) {
  const port = Number(env.PORT || 4000)
  const trustProxyHops = Number(env.TRUST_PROXY_HOPS || 0)
  const jwtSecret = env.JWT_SECRET
  const dataFile = resolve(process.cwd(), env.DATA_FILE || 'server/data/raiz-urbana.json')

  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error('PORT precisa ser um número entre 1 e 65535.')
  }
  if (!jwtSecret || Buffer.byteLength(jwtSecret, 'utf8') < 32) {
    throw new Error('JWT_SECRET precisa ter pelo menos 32 bytes aleatórios.')
  }
  if (!Number.isInteger(trustProxyHops) || trustProxyHops < 0 || trustProxyHops > 5) {
    throw new Error('TRUST_PROXY_HOPS precisa ser um número entre 0 e 5.')
  }
  if (extname(dataFile).toLowerCase() !== '.json') {
    throw new Error('DATA_FILE precisa apontar para um arquivo .json.')
  }

  return {
    port,
    trustProxyHops,
    dataFile,
    jwtSecret,
    clientOrigins: parseOrigins(env.CLIENT_ORIGINS || 'http://localhost:5173'),
  }
}
