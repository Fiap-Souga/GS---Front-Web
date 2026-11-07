const STORAGE_KEY = 'raiz-urbana-browser-accounts:v1'
const PBKDF2_ITERATIONS = 310_000
const PASSWORD_MAX_BYTES = 72

let activeAccount = null

const clone = (value) => structuredClone(value)
const encode = (bytes) => Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('')
const decode = (value) => {
  if (typeof value !== 'string' || value.length % 2 !== 0 || !/^[0-9a-f]*$/i.test(value)) {
    throw new Error('Os dados locais da conta estão inválidos.')
  }
  return Uint8Array.from(value.match(/.{2}/g) ?? [], (byte) => Number.parseInt(byte, 16))
}

const readAccounts = () => {
  let serialized
  try {
    serialized = localStorage.getItem(STORAGE_KEY)
  } catch (error) {
    throw new Error(`Não foi possível acessar as contas deste navegador: ${error.message}`)
  }
  if (serialized === null) return []

  let accounts
  try {
    accounts = JSON.parse(serialized)
  } catch {
    throw new Error('Os dados locais das contas estão corrompidos e não puderam ser carregados.')
  }
  if (!Array.isArray(accounts) || accounts.some((account) => (
    !account
    || typeof account.id !== 'string'
    || typeof account.email !== 'string'
    || typeof account.salt !== 'string'
    || typeof account.iv !== 'string'
    || typeof account.ciphertext !== 'string'
  ))) {
    throw new Error('O formato dos dados locais das contas não é válido.')
  }
  return accounts
}

const writeAccounts = (accounts) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(accounts))
  } catch (error) {
    throw new Error(`Não foi possível salvar a conta neste navegador: ${error.message}`)
  }
}

const ensureCrypto = () => {
  if (!globalThis.crypto?.subtle || !globalThis.crypto?.getRandomValues) {
    throw new Error('Este navegador não oferece criptografia segura. Abra o site em HTTPS ou em localhost.')
  }
}

const deriveKey = async (password, salt) => {
  ensureCrypto()
  if (new TextEncoder().encode(password).length > PASSWORD_MAX_BYTES) {
    throw new Error(`A senha pode ter no máximo ${PASSWORD_MAX_BYTES} bytes.`)
  }
  const material = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(password),
    'PBKDF2',
    false,
    ['deriveKey'],
  )
  return crypto.subtle.deriveKey(
    { name: 'PBKDF2', hash: 'SHA-256', salt, iterations: PBKDF2_ITERATIONS },
    material,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt'],
  )
}

const encryptProfile = async (profile, key) => {
  const iv = crypto.getRandomValues(new Uint8Array(12))
  const ciphertext = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    new TextEncoder().encode(JSON.stringify(profile)),
  )
  return { iv: encode(iv), ciphertext: encode(new Uint8Array(ciphertext)) }
}

const decryptProfile = async (account, key) => {
  try {
    const plaintext = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv: decode(account.iv) },
      key,
      decode(account.ciphertext),
    )
    return JSON.parse(new TextDecoder().decode(plaintext))
  } catch {
    throw new Error('E-mail ou senha incorretos.')
  }
}

const validateCredentials = ({ name, email, password }, requireName) => {
  const normalizedEmail = typeof email === 'string' ? email.trim().toLowerCase() : ''
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail) || normalizedEmail.length > 254) {
    throw new Error('Informe um e-mail válido.')
  }
  if (typeof password !== 'string' || password.length < 8) {
    throw new Error('A senha deve ter ao menos 8 caracteres.')
  }
  if (new TextEncoder().encode(password).length > PASSWORD_MAX_BYTES) {
    throw new Error(`A senha pode ter no máximo ${PASSWORD_MAX_BYTES} bytes.`)
  }
  const normalizedName = typeof name === 'string' ? name.trim() : ''
  if (requireName && (normalizedName.length < 2 || normalizedName.length > 80)) {
    throw new Error('O nome deve ter entre 2 e 80 caracteres.')
  }
  return { name: normalizedName, email: normalizedEmail }
}

export async function registerBrowserAccount(values) {
  const { name, email } = validateCredentials(values, true)
  const accounts = readAccounts()
  if (accounts.some((account) => account.email === email)) {
    throw new Error('Já existe uma conta neste navegador com esse e-mail.')
  }
  ensureCrypto()

  const salt = crypto.getRandomValues(new Uint8Array(16))
  const key = await deriveKey(values.password, salt)
  const profile = {
    id: crypto.randomUUID(),
    name,
    email,
    treeVisits: [],
    habitEntries: [],
    plans: [],
  }
  const encrypted = await encryptProfile(profile, key)
  accounts.push({
    id: profile.id,
    email,
    salt: encode(salt),
    ...encrypted,
  })
  writeAccounts(accounts)
  activeAccount = { id: profile.id, key, profile }
  return clone(profile)
}

export async function loginBrowserAccount(emailInput, password) {
  const { email } = validateCredentials({ email: emailInput, password }, false)
  const account = readAccounts().find((item) => item.email === email)
  if (!account) throw new Error('E-mail ou senha incorretos.')

  let key
  let profile
  try {
    key = await deriveKey(password, decode(account.salt))
    profile = await decryptProfile(account, key)
  } catch (error) {
    if (error.message.startsWith('A senha pode ter')) throw error
    throw new Error('E-mail ou senha incorretos.')
  }
  activeAccount = { id: account.id, key, profile }
  return clone(profile)
}

export function getBrowserAccountProfile() {
  return activeAccount ? clone(activeAccount.profile) : null
}

export function logoutBrowserAccount() {
  activeAccount = null
}

export async function updateBrowserAccountProfile(update) {
  if (!activeAccount) throw new Error('Entre na sua conta para continuar.')
  const profile = clone(activeAccount.profile)
  const nextProfile = await update(profile)
  const accounts = readAccounts()
  const accountIndex = accounts.findIndex((account) => account.id === activeAccount.id)
  if (accountIndex < 0) throw new Error('A conta local não foi encontrada neste navegador.')
  const encrypted = await encryptProfile(nextProfile, activeAccount.key)
  accounts[accountIndex] = { ...accounts[accountIndex], ...encrypted }
  writeAccounts(accounts)
  activeAccount = { ...activeAccount, profile: nextProfile }
  return clone(nextProfile)
}

export async function getBrowserAccountPlans() {
  if (!activeAccount) throw new Error('Entre na sua conta para ver seus planos.')
  return clone(activeAccount.profile.plans ?? [])
}

export async function createBrowserAccountPlan(values) {
  let created
  await updateBrowserAccountProfile((profile) => {
    created = { ...values, id: crypto.randomUUID() }
    profile.plans = [created, ...(profile.plans ?? [])]
    return profile
  })
  return created
}

export async function updateBrowserAccountPlan(id, values) {
  let updated
  await updateBrowserAccountProfile((profile) => {
    const plans = profile.plans ?? []
    const index = plans.findIndex((plan) => plan.id === id)
    if (index < 0) throw new Error('Plano não encontrado nesta conta.')
    updated = { ...plans[index], ...values, id }
    profile.plans[index] = updated
    return profile
  })
  return updated
}

export async function deleteBrowserAccountPlan(id) {
  await updateBrowserAccountProfile((profile) => {
    const plans = profile.plans ?? []
    if (!plans.some((plan) => plan.id === id)) throw new Error('Plano não encontrado nesta conta.')
    profile.plans = plans.filter((plan) => plan.id !== id)
    return profile
  })
}
