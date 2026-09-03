import { useState } from 'react'

import './App.css'

import { useAuth } from './auth/useAuth'
import { DashboardPage } from './pages/DashboardPage'
import { LoginPage } from './pages/LoginPage'
import { RegisterPage } from './pages/RegisterPage'

function App() {
  const { isAuthenticated } = useAuth()

  const [authMode, setAuthMode] =
    useState<'login' | 'register'>('login')

  if (isAuthenticated) {
    return <DashboardPage />
  }

  if (authMode === 'register') {
    return (
      <RegisterPage
        onShowLogin={() =>
          setAuthMode('login')
        }
      />
    )
  }

  return (
    <LoginPage
      onShowRegister={() =>
        setAuthMode('register')
      }
    />
  )
}

export default App