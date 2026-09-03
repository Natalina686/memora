import {
  useState,
  type FormEvent,
} from 'react'

import { useAuth } from '../auth/useAuth'

interface LoginPageProps {
  onShowRegister: () => void
}

export function LoginPage({
  onShowRegister,
}: LoginPageProps) {
  const { login } = useAuth()

  const [email, setEmail] =
    useState('nata@example.com')

  const [password, setPassword] =
    useState('password123')

  const [error, setError] =
    useState<string | null>(null)

  const [loading, setLoading] =
    useState(false)

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault()

    setError(null)
    setLoading(true)

    try {
      await login(email, password)
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : 'Login failed',
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-card">
        <div className="brand">
          <div className="brand-mark">M</div>

          <div>
            <h1>Memora</h1>
            <p>Персоналізоване навчання</p>
          </div>
        </div>

        <div className="auth-heading">
          <h2>Вхід</h2>

          <p>
            Увійдіть до свого навчального
            простору.
          </p>
        </div>

        <form
          className="auth-form"
          onSubmit={handleSubmit}
        >
          <label>
            Email

            <input
              type="email"
              value={email}
              onChange={(event) =>
                setEmail(event.target.value)
              }
              required
              autoComplete="email"
            />
          </label>

          <label>
            Пароль

            <input
              type="password"
              value={password}
              onChange={(event) =>
                setPassword(event.target.value)
              }
              required
              autoComplete="current-password"
            />
          </label>

          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          <button
            className="primary-button"
            type="submit"
            disabled={loading}
          >
            {loading
              ? 'Вхід...'
              : 'Увійти'}
          </button>
        </form>

        <p className="auth-switch">
          Ще немає акаунта?{' '}

          <button
            type="button"
            className="link-button"
            onClick={onShowRegister}
          >
            Зареєструватися
          </button>
        </p>
      </section>
    </main>
  )
}