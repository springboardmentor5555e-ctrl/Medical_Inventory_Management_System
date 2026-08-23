import React, { createContext, useContext, useState, useCallback } from 'react'
import * as authApi from '../api/auth'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('medistock_user')
    return stored ? JSON.parse(stored) : null
  })

  const login = useCallback(async (email, password) => {
    const data = await authApi.login(email, password)
    localStorage.setItem('medistock_token', data.token)
    const userData = { userId: data.userId, email: data.email, fullName: data.fullName, role: data.role }
    localStorage.setItem('medistock_user', JSON.stringify(userData))
    setUser(userData)
    return userData
  }, [])

  const register = useCallback(async (fullName, email, password, role) => {
    const data = await authApi.register(fullName, email, password, role)
    localStorage.setItem('medistock_token', data.token)
    const userData = { userId: data.userId, email: data.email, fullName: data.fullName, role: data.role }
    localStorage.setItem('medistock_user', JSON.stringify(userData))
    setUser(userData)
    return userData
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem('medistock_token')
    localStorage.removeItem('medistock_user')
    setUser(null)
  }, [])

  return (
    <AuthContext.Provider value={{ user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
