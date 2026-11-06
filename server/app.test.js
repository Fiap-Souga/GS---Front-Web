import { afterEach, describe, expect, it, vi } from 'vitest'
import request from 'supertest'
import bcrypt from 'bcryptjs'
import { createApp } from './app.js'
import { loadConfig } from './config.js'
import User from './models/User.js'

const JWT_SECRET = 'test-secret-with-more-than-thirty-two-bytes'
const USER_ID = '507f1f77bcf86cd799439011'

const createRepository = () => {
  const users = new Map()
  let nextId = 0
  return {
    users,
    create: vi.fn(async (values) => {
      if (users.has(values.email)) {
        const error = new Error('Duplicate email')
        error.code = 11000
        throw error
      }
      const user = {
        id: nextId++ === 0 ? USER_ID : '507f1f77bcf86cd799439012',
        treeVisits: [],
        ...values,
      }
      users.set(values.email, user)
      return user
    }),
    findByEmailWithPassword: vi.fn(async (email) => users.get(email) ?? null),
    findById: vi.fn(async (id) => [...users.values()].find((user) => user.id === id) ?? null),
    updateProfile: vi.fn(async (id, values) => {
      const user = [...users.values()].find((item) => item.id === id)
      if (user) Object.assign(user, values)
      return user ?? null
    }),
    addTreeVisit: vi.fn(async (id, visit, limit) => {
      const user = [...users.values()].find((item) => item.id === id)
      if (user) user.treeVisits = [...user.treeVisits, visit].slice(-limit)
      return user ?? null
    }),
    resetTreeVisits: vi.fn(async (id) => {
      const user = [...users.values()].find((item) => item.id === id)
      if (user) user.treeVisits = []
      return user ?? null
    }),
  }
}

const createPlanRepository = () => {
  const plans = new Map()
  let nextId = 0
  const ids = ['507f1f77bcf86cd799439021', '507f1f77bcf86cd799439022']
  return {
    plans,
    create: vi.fn(async (values) => {
      const plan = { id: ids[nextId++], ...values }
      plans.set(plan.id, plan)
      return plan
    }),
    findByOwner: vi.fn(async (owner) => [...plans.values()].filter((plan) => plan.owner === owner)),
    updateByOwner: vi.fn(async (id, owner, values) => {
      const plan = plans.get(id)
      if (!plan || plan.owner !== owner) return null
      Object.assign(plan, values)
      return plan
    }),
    deleteByOwner: vi.fn(async (id, owner) => {
      const plan = plans.get(id)
      if (!plan || plan.owner !== owner) return null
      plans.delete(id)
      return plan
    }),
  }
}

const signIn = async (app, email) => {
  const response = await request(app).post('/api/auth/login').send({
    email,
    password: 'senha-segura-123',
  })
  return {
    cookie: response.headers['set-cookie'].map((value) => value.split(';')[0]).join('; '),
    csrfToken: response.body.csrfToken,
  }
}

describe('API de autenticação', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('cadastra usuário guardando hash e não devolve senha nem hash', async () => {
    const userRepository = createRepository()
    const app = createApp({ userRepository, jwtSecret: JWT_SECRET })
    const response = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Ana Verde', email: 'ANA@EXAMPLE.COM', password: 'senha-segura-123' })

    expect(response.status).toBe(201)
    expect(response.body.user).toEqual({ id: USER_ID, name: 'Ana Verde', email: 'ana@example.com' })
    expect(response.body).not.toHaveProperty('password')
    expect(response.body).not.toHaveProperty('passwordHash')
    expect(userRepository.users.get('ana@example.com').passwordHash).not.toBe('senha-segura-123')
    expect(await bcrypt.compare('senha-segura-123', userRepository.users.get('ana@example.com').passwordHash)).toBe(true)
  })

  it('define e-mail único e hash de senha oculto por padrão no modelo MongoDB', () => {
    expect(User.schema.path('email').options.unique).toBe(true)
    expect(User.schema.path('passwordHash').options.select).toBe(false)
  })

  it('rejeita senhas fracas sem criar usuário', async () => {
    const userRepository = createRepository()
    const app = createApp({ userRepository, jwtSecret: JWT_SECRET })
    const response = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Ana', email: 'ana@example.com', password: 'curta' })

    expect(response.status).toBe(400)
    expect(userRepository.create).not.toHaveBeenCalled()
  })

  it('rejeita login com senha acima do limite de bytes do bcrypt', async () => {
    const userRepository = createRepository()
    const app = createApp({ userRepository, jwtSecret: JWT_SECRET })
    const response = await request(app).post('/api/auth/login').send({
      email: 'ana@example.com',
      password: `${'a'.repeat(72)}x`,
    })

    expect(response.status).toBe(400)
    expect(userRepository.findByEmailWithPassword).not.toHaveBeenCalled()
  })

  it('não permite cadastro duplicado com mesmo e-mail, sem diferença de maiúsculas', async () => {
    const userRepository = createRepository()
    const app = createApp({ userRepository, jwtSecret: JWT_SECRET })
    const user = { name: 'Ana Verde', email: 'ana@example.com', password: 'senha-segura-123' }
    await request(app).post('/api/auth/register').send(user)
    const duplicate = await request(app).post('/api/auth/register').send({ ...user, email: 'ANA@example.com' })

    expect(duplicate.status).toBe(409)
  })

  it('faz login, emite token curto e permite consultar o perfil autenticado', async () => {
    const userRepository = createRepository()
    const app = createApp({ userRepository, jwtSecret: JWT_SECRET })
    await request(app).post('/api/auth/register').send({
      name: 'Ana Verde',
      email: 'ana@example.com',
      password: 'senha-segura-123',
    })
    const login = await request(app).post('/api/auth/login').send({
      email: 'ANA@example.com',
      password: 'senha-segura-123',
    })
    const profile = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${login.body.accessToken}`)

    expect(login.status).toBe(200)
    expect(login.body.expiresIn).toBe('15m')
    expect(profile.status).toBe(200)
    expect(profile.body.user).toEqual({ id: USER_ID, name: 'Ana Verde', email: 'ana@example.com' })
  })

  it('retorna a mesma mensagem para e-mail inexistente e senha incorreta', async () => {
    const userRepository = createRepository()
    const app = createApp({ userRepository, jwtSecret: JWT_SECRET })
    const missingUser = await request(app).post('/api/auth/login').send({
      email: 'missing@example.com',
      password: 'senha-segura-123',
    })
    await request(app).post('/api/auth/register').send({
      name: 'Ana Verde',
      email: 'ana@example.com',
      password: 'senha-segura-123',
    })
    const wrongPassword = await request(app).post('/api/auth/login').send({
      email: 'ana@example.com',
      password: 'senha-incorreta-123',
    })

    expect(missingUser.status).toBe(401)
    expect(missingUser.body.error).toBe(wrongPassword.body.error)
  })

  it('protege o perfil e rejeita token adulterado', async () => {
    const app = createApp({ userRepository: createRepository(), jwtSecret: JWT_SECRET })
    const noToken = await request(app).get('/api/auth/me')
    const badToken = await request(app).get('/api/auth/me').set('Authorization', 'Bearer invalid.token.value')

    expect(noToken.status).toBe(401)
    expect(badToken.status).toBe(401)
  })

  it('protege a sessão web com cookie HttpOnly e token CSRF', async () => {
    const userRepository = createRepository()
    const app = createApp({ userRepository, jwtSecret: JWT_SECRET })
    await request(app).post('/api/auth/register').send({
      name: 'Ana Verde',
      email: 'ana@example.com',
      password: 'senha-segura-123',
    })
    const session = await signIn(app, 'ana@example.com')
    const cookieHeader = (await request(app).post('/api/auth/login').send({
      email: 'ana@example.com',
      password: 'senha-segura-123',
    })).headers['set-cookie']

    expect(cookieHeader.some((cookie) => cookie.includes('ru_session=') && cookie.includes('HttpOnly'))).toBe(true)
    const rejected = await request(app)
      .post('/api/profile/tree-visits')
      .set('Cookie', session.cookie)
      .send({ place: 'Parque Ibirapuera' })
    const accepted = await request(app)
      .post('/api/profile/tree-visits')
      .set('Cookie', session.cookie)
      .set('X-CSRF-Token', session.csrfToken)
      .send({ place: 'Parque Ibirapuera' })

    expect(rejected.status).toBe(403)
    expect(accepted.status).toBe(201)
    expect(accepted.body.profile.treeVisits).toHaveLength(1)
  })

  it('mantém planos isolados por conta e persiste o CRUD', async () => {
    const userRepository = createRepository()
    const planRepository = createPlanRepository()
    const app = createApp({ userRepository, planRepository, jwtSecret: JWT_SECRET })
    const credentials = (email) => ({
      name: email.split('@')[0],
      email,
      password: 'senha-segura-123',
    })
    await request(app).post('/api/auth/register').send(credentials('ana@example.com'))
    await request(app).post('/api/auth/register').send(credentials('bia@example.com'))
    const ana = await signIn(app, 'ana@example.com')
    const bia = await signIn(app, 'bia@example.com')

    const created = await request(app)
      .post('/api/plans')
      .set('Cookie', ana.cookie)
      .set('X-CSRF-Token', ana.csrfToken)
      .send({ title: 'Plantio comunitário', body: 'Preparar mudas nativas.', userId: 1 })
    const anaPlans = await request(app).get('/api/plans').set('Cookie', ana.cookie)
    const biaPlans = await request(app).get('/api/plans').set('Cookie', bia.cookie)
    const deniedUpdate = await request(app)
      .put(`/api/plans/${created.body.id}`)
      .set('Cookie', bia.cookie)
      .set('X-CSRF-Token', bia.csrfToken)
      .send({ title: 'Alteração indevida', body: 'Sem acesso.', userId: 1 })
    const updated = await request(app)
      .put(`/api/plans/${created.body.id}`)
      .set('Cookie', ana.cookie)
      .set('X-CSRF-Token', ana.csrfToken)
      .send({ title: 'Plantio atualizado', body: 'Mudas nativas.', userId: 2 })
    const deleted = await request(app)
      .delete(`/api/plans/${created.body.id}`)
      .set('Cookie', ana.cookie)
      .set('X-CSRF-Token', ana.csrfToken)

    expect(created.status).toBe(201)
    expect(anaPlans.body).toHaveLength(1)
    expect(biaPlans.body).toEqual([])
    expect(deniedUpdate.status).toBe(404)
    expect(updated.body.title).toBe('Plantio atualizado')
    expect(deleted.status).toBe(204)
    expect(planRepository.plans.size).toBe(0)
  })

  it('atualiza o perfil e reinicia apenas a árvore da conta autenticada', async () => {
    const userRepository = createRepository()
    const app = createApp({ userRepository, jwtSecret: JWT_SECRET })
    await request(app).post('/api/auth/register').send({
      name: 'Ana Verde',
      email: 'ana@example.com',
      password: 'senha-segura-123',
    })
    const session = await signIn(app, 'ana@example.com')
    const updated = await request(app)
      .patch('/api/profile')
      .set('Cookie', session.cookie)
      .set('X-CSRF-Token', session.csrfToken)
      .send({ name: 'Ana Silva' })
    await request(app)
      .post('/api/profile/tree-visits')
      .set('Cookie', session.cookie)
      .set('X-CSRF-Token', session.csrfToken)
      .send({ place: 'Parque Villa-Lobos' })
    const reset = await request(app)
      .delete('/api/profile/tree-visits')
      .set('Cookie', session.cookie)
      .set('X-CSRF-Token', session.csrfToken)

    expect(updated.body.profile.name).toBe('Ana Silva')
    expect(reset.body.profile.treeVisits).toEqual([])
  })

  it('limita tentativas de cadastro e login por janela de tempo', async () => {
    const app = createApp({ userRepository: createRepository(), jwtSecret: JWT_SECRET })
    const attempts = await Promise.all(Array.from({ length: 11 }, () => (
      request(app).post('/api/auth/login').send({ email: 'invalid', password: 'bad' })
    )))

    expect(attempts.at(-1).status).toBe(429)
  })

  it('valida a configuração de conexão e aceita somente origens de cliente listadas', async () => {
    const config = loadConfig({
      PORT: '4000',
      JWT_SECRET,
      CLIENT_ORIGINS: 'https://site.example.com,https://app.example.com',
      TRUST_PROXY_HOPS: '0',
      DATA_FILE: 'server/data/test-users.json',
    })
    const app = createApp({
      userRepository: createRepository(),
      jwtSecret: config.jwtSecret,
      clientOrigins: config.clientOrigins,
    })
    const allowed = await request(app)
      .get('/api/health')
      .set('Origin', 'https://site.example.com')
    const denied = await request(app)
      .get('/api/health')
      .set('Origin', 'https://other.example.com')

    expect(allowed.headers['access-control-allow-origin']).toBe('https://site.example.com')
    expect(denied.headers['access-control-allow-origin']).toBeUndefined()
    expect(() => loadConfig({
      PORT: '4000',
      JWT_SECRET: 'short',
    })).toThrow('JWT_SECRET')
    expect(() => loadConfig({
      PORT: '4000',
      JWT_SECRET,
      DATA_FILE: 'server/data/users.txt',
    })).toThrow('DATA_FILE')
  })
})
