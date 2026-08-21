import { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import AuthHero from './AuthHero'
import LoginForm from './LoginForm'
import RegisterForm from './RegisterForm'
import ForgotPasswordModal from './ForgotPasswordModal'

export default function AuthShell({ showToast }) {
  const { login, register, authLoading } = useAuth()
  const [authMode, setAuthMode] = useState('login')
  const [forgotPasswordOpen, setForgotPasswordOpen] = useState(false)

  const handleLogin = async (email, password, rememberMe) => {
    try {
      await login(email, password, rememberMe)
      showToast({ type: 'success', message: 'Welcome back to MediStock!' })
    } catch (err) {
      showToast({ type: 'error', message: err.message || 'Login failed' })
    }
  }

  const handleRegister = async ({ name, email, password, role }) => {
    try {
      const res = await register({ name, email, password, role })
      showToast({
        type: 'success',
        message: res.message || 'Account created successfully! You can now sign in.',
      })
      setAuthMode('login')
    } catch (err) {
      showToast({ type: 'error', message: err.message || 'Registration failed' })
    }
  }

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-12 bg-slate-50">
      {/* Left Medical Hero Section (7 cols on desktop) */}
      <div className="lg:col-span-7 xl:col-span-7">
        <AuthHero />
      </div>

      {/* Right Authentication Card Section (5 cols on desktop) */}
      <div className="lg:col-span-5 xl:col-span-5 flex items-center justify-center p-6 sm:p-10 lg:p-12">
        <div className="w-full max-w-md bg-white rounded-3xl shadow-xl shadow-slate-200/60 border border-slate-200/80 p-6 sm:p-8">
          {/* Top Auth Mode Tabs */}
          <div className="flex p-1 bg-slate-100/90 rounded-2xl mb-6 border border-slate-200/60">
            <button
              type="button"
              onClick={() => setAuthMode('login')}
              className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
                authMode === 'login'
                  ? 'bg-white text-emerald-700 shadow-sm'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => setAuthMode('register')}
              className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
                authMode === 'register'
                  ? 'bg-white text-emerald-700 shadow-sm'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Create Account
            </button>
          </div>

          {authMode === 'login' ? (
            <LoginForm
              onLogin={handleLogin}
              switchToRegister={() => setAuthMode('register')}
              onForgotPassword={() => setForgotPasswordOpen(true)}
              loading={authLoading}
            />
          ) : (
            <RegisterForm
              onRegister={handleRegister}
              switchToLogin={() => setAuthMode('login')}
              loading={authLoading}
            />
          )}
        </div>
      </div>

      <ForgotPasswordModal
        isOpen={forgotPasswordOpen}
        close={() => setForgotPasswordOpen(false)}
      />
    </div>
  )
}
