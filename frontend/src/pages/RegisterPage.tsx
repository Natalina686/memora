import {
  useState,
  type FormEvent,
} from 'react'

import { useAuth } from '../auth/useAuth'

interface RegisterPageProps {
  onShowLogin: () => void
}

export function RegisterPage({
  onShowLogin,
}: RegisterPageProps) {
  const { register } = useAuth()

  const [email, setEmail] =
    useState('')

  const [password, setPassword] =
    useState('')

  const [error, setError] =
    useState<string | null>(null)

  const [loading, setLoading] =
    useState(false)

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault()

    setError(null)

    if (password.length < 8) {
      setError(
        'Пароль повинен містити щонайменше 8 символів.',
      )

      return
    }

    setLoading(true)

    try {
      await register(email, password)
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : 'Registration failed',
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
          <h2>Реєстрація</h2>

          <p>
            Створіть акаунт для роботи з
            Memora.
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
              minLength={8}
              required
              autoComplete="new-password"
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
              ? 'Створення...'
              : 'Створити акаунт'}
          </button>
        </form>

        <p className="auth-switch">
          Уже є акаунт?{' '}

          <button
            type="button"
            className="link-button"
            onClick={onShowLogin}
          >
            Увійти
          </button>
        </p>
      </section>
    </main>
  )
}