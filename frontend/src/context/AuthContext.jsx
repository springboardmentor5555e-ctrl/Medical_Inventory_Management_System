import { createContext, useContext, useState, useMemo, useCallback } from 'react'
import { apiRequest } from '../services/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [auth, setAuth] = useState(() => {
    try {
      const saved = localStorage.getItem('medistock.auth')
      return saved ? JSON.parse(saved) : null
    } catch {
      return null
    }
  })
  const [loading, setLoading] = useState(false)

  const token = auth?.token

  const login = useCallback(async (email, password, rememberMe = true) => {
    setLoading(true)
    try {
      const data = await apiRequest('/api/auth/login', {
        method: 'POST',
        body: { email, password },
      })
      const session = {
        token: data.token,
        email: data.email,
        role: data.role,
        name: data.name || email.split('@')[0],
      }
      if (rememberMe) {
        localStorage.setItem('medistock.auth', JSON.stringify(session))
      } else {
        sessionStorage.setItem('medistock.auth', JSON.stringify(session))
      }
      setAuth(session)
      return data
    } finally {
      setLoading(false)
    }
  }, [])

  const register = useCallback(async ({ name, email, password, role }) => {
    setLoading(true)
    try {
      const data = await apiRequest('/api/auth/register', {
        method: 'POST',
        body: { name, email, password, role },
      })
      return data
    } finally {
      setLoading(false)
    }
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem('medistock.auth')
    sessionStorage.removeItem('medistock.auth')
    setAuth(null)
  }, [])

  const updateProfile = useCallback((profileUpdates) => {
    setAuth((prev) => {
      if (!prev) return null
      const updated = { ...prev, ...profileUpdates }
      localStorage.setItem('medistock.auth', JSON.stringify(updated))
      return updated
    })
  }, [])

  const role = auth?.role || ''
  const isAdmin = role === 'ADMIN'
  const isPharmacist = role === 'PHARMACIST'
  const isStaff = role === 'STAFF'

  const permissions = useMemo(() => ({
    canWrite: isAdmin || isPharmacist,
    canDelete: isAdmin,
    canManageStock: Boolean(auth),
    canViewSuppliers: isAdmin || isPharmacist,
    canViewReports: isAdmin || isPharmacist,
    canViewAnalytics: isAdmin || isPharmacist,
    canManageUsers: isAdmin,
    canAccessSettings: true,
  }), [isAdmin, isPharmacist, auth])

  const value = useMemo(() => ({
    auth,
    token,
    user: auth,
    role,
    isAdmin,
    isPharmacist,
    isStaff,
    ...permissions,
    login,
    register,
    logout,
    updateProfile,
    authLoading: loading,
  }), [auth, token, role, isAdmin, isPharmacist, isStaff, permissions, login, register, logout, updateProfile, loading])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
