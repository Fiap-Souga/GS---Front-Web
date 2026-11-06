import React, { useEffect, useState } from 'react'
import { getCurrentSession, login, logout, register, restoreSession, updateProfile } from '../services/authApi.js'

export function AccountPanel() {
  const [profile, setProfile] = useState(getCurrentSession())
  const [mode, setMode] = useState('login')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')

  useEffect(() => {
    const syncSession = (event) => {
      setProfile(event.detail)
      setName(event.detail?.name ?? '')
    }
    window.addEventListener('raiz-urbana:session', syncSession)
    restoreSession()
      .catch((requestError) => setError(requestError.message))
      .finally(() => setIsLoading(false))
    return () => window.removeEventListener('raiz-urbana:session', syncSession)
  }, [])

  const submitAuth = async (event) => {
    event.preventDefault()
    setIsLoading(true)
    setError('')
    setNotice('')
    try {
      const signedInProfile = mode === 'register'
        ? await register({ name, email, password })
        : await login({ email, password })
      setProfile(signedInProfile)
      setName(signedInProfile.name)
      setPassword('')
      setNotice('Sua conta foi criada. Seus dados ficam salvos neste computador.')
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setIsLoading(false)
    }
  }

  const saveName = async (event) => {
    event.preventDefault()
    setIsLoading(true)
    setError('')
    setNotice('')
    try {
      const updatedProfile = await updateProfile(name)
      setProfile(updatedProfile)
      setNotice('Nome do perfil atualizado.')
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setIsLoading(false)
    }
  }

  const signOut = async () => {
    setIsLoading(true)
    setError('')
    try {
      await logout()
      setProfile(null)
      setName('')
      setNotice('Você saiu da sua conta.')
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <section className="account-panel" aria-labelledby="account-panel-title">
      {profile ? (
        <>
          <div className="account-panel-heading">
            <div>
              <span className="profile-eyebrow">SUA CONTA</span>
              <h2 id="account-panel-title">Olá, {profile.name}</h2>
              <p>{profile.email} · perfil, hábitos, planos e árvore salvos na sua conta</p>
            </div>
            <button type="button" className="account-secondary-button" disabled={isLoading} onClick={signOut}>Sair</button>
          </div>
          <form className="account-name-form" onSubmit={saveName}>
            <label htmlFor="account-name">Nome do perfil</label>
            <input id="account-name" minLength={2} maxLength={80} required value={name} onChange={(event) => setName(event.target.value)} />
            <button type="submit" className="account-primary-button" disabled={isLoading}>Salvar nome</button>
          </form>
        </>
      ) : (
        <>
          <div className="account-panel-heading">
            <div>
              <span className="profile-eyebrow">SEU ESPAÇO PESSOAL</span>
              <h2 id="account-panel-title">Salve seus planos e sua árvore</h2>
              <p>Crie uma conta ou entre para guardar seus dados pessoais neste computador.</p>
            </div>
          </div>
          <div className="account-mode-switch" role="group" aria-label="Acesso à conta">
            <button type="button" aria-pressed={mode === 'login'} onClick={() => setMode('login')}>Entrar</button>
            <button type="button" aria-pressed={mode === 'register'} onClick={() => setMode('register')}>Criar conta</button>
          </div>
          <form className="account-auth-form" onSubmit={submitAuth}>
            {mode === 'register' && (
              <label>Nome
                <input autoComplete="name" minLength={2} maxLength={80} required value={name} onChange={(event) => setName(event.target.value)} />
              </label>
            )}
            <label>E-mail
              <input type="email" autoComplete="email" maxLength={254} required value={email} onChange={(event) => setEmail(event.target.value)} />
            </label>
            <label>Senha
              <input type="password" autoComplete={mode === 'register' ? 'new-password' : 'current-password'} minLength={8} maxLength={72} required value={password} onChange={(event) => setPassword(event.target.value)} />
            </label>
            <button type="submit" className="account-primary-button" disabled={isLoading}>
              {isLoading ? 'Aguarde...' : mode === 'register' ? 'Criar minha conta' : 'Entrar'}
            </button>
          </form>
        </>
      )}
      {error && <p className="account-message account-error" role="alert">{error}</p>}
      {notice && <p className="account-message" role="status">{notice}</p>}
      <p className="account-privacy-note">A senha é armazenada como hash protegido; suas informações de perfil não são públicas.</p>
    </section>
  )
}
