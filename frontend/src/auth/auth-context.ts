import { createContext } from 'react'
import type { Account } from '../api/api'

export interface AuthContextValue {
  account: Account | null
  token: string | null
  isAuthenticated: boolean

  login: (
    email: string,
    password: string,
  ) => Promise<void>

  register: (
    email: string,
    password: string,
  ) => Promise<void>

  logout: () => void
}

export const AuthContext =
  createContext<AuthContextValue | undefined>(
    undefined,
  )