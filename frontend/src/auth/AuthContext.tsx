import {
  useState,
  type ReactNode,
} from 'react'

import {
  login as loginRequest,
  register as registerRequest,
  type Account,
} from '../api/api'

import { AuthContext } from './auth-context'

function readStoredAccount(): Account | null {
  const stored =
    localStorage.getItem('memora_account')

  if (!stored) {
    return null
  }

  try {
    return JSON.parse(stored) as Account
  } catch {
    localStorage.removeItem('memora_account')
    return null
  }
}

export function AuthProvider({
  children,
}: {
  children: ReactNode
}) {
  const [token, setToken] =
    useState<string | null>(() =>
      localStorage.getItem(
        'memora_access_token',
      ),
    )

  const [account, setAccount] =
    useState<Account | null>(
      readStoredAccount,
    )

  function saveAuth(
    accessToken: string,
    authenticatedAccount: Account,
  ) {
    localStorage.setItem(
      'memora_access_token',
      accessToken,
    )

    localStorage.setItem(
      'memora_account',
      JSON.stringify(authenticatedAccount),
    )

    setToken(accessToken)
    setAccount(authenticatedAccount)
  }

  async function login(
    email: string,
    password: string,
  ) {
    const response =
      await loginRequest(email, password)

    saveAuth(
      response.accessToken,
      response.account,
    )
  }

  async function register(
    email: string,
    password: string,
  ) {
    const response =
      await registerRequest(
        email,
        password,
      )

    saveAuth(
      response.accessToken,
      response.account,
    )
  }

  function logout() {
    localStorage.removeItem(
      'memora_access_token',
    )

    localStorage.removeItem(
      'memora_account',
    )

    setToken(null)
    setAccount(null)
  }

  return (
    <AuthContext.Provider
      value={{
        account,
        token,
        isAuthenticated:
          Boolean(token && account),
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}