import { useState } from 'react'
import { motion } from 'framer-motion'
import { Mail, Lock, Eye, EyeOff, LogIn } from 'lucide-react'

export default function LoginForm({
  onLogin,
  switchToRegister,
  onForgotPassword,
  loading,
}) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(true)

  const handleSubmit = (e) => {
    e.preventDefault()
    onLogin(email, password, rememberMe)
  }

  const handleFillDemo = (demoEmail, demoPass) => {
    setEmail(demoEmail)
    setPassword(demoPass)
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
      className="w-full max-w-md mx-auto"
    >
      <div className="mb-6">
        <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200/60">
          Secure Portal Access
        </span>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-2.5 tracking-tight">
          Welcome back
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Enter your authorized MediStock credentials to access inventory.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Email Field */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            Email Address
          </label>
          <div className="relative">
            <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. admin@medistock.com"
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50/80 hover:bg-slate-50 border border-slate-200/90 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:bg-white transition-all"
            />
          </div>
        </div>

        {/* Password Field */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-semibold text-slate-700">
              Password
            </label>
            <button
              type="button"
              onClick={onForgotPassword}
              className="text-[11px] font-semibold text-emerald-600 hover:text-emerald-700 transition-colors"
            >
              Forgot password?
            </button>
          </div>
          <div className="relative">
            <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type={showPassword ? 'text' : 'password'}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full pl-10 pr-10 py-2.5 bg-slate-50/80 hover:bg-slate-50 border border-slate-200/90 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:bg-white transition-all"
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="p-1 text-slate-400 hover:text-slate-600 absolute right-3 top-2.5 rounded transition-colors"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Remember Me */}
        <div className="flex items-center justify-between pt-0.5">
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="w-4 h-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500/20"
            />
            <span className="text-xs text-slate-600 font-medium">Keep me signed in</span>
          </label>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2 transition-all disabled:opacity-60 disabled:cursor-not-allowed hover:shadow-emerald-600/30 active:scale-[0.99]"
        >
          {loading ? (
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              <span>Sign In to Dashboard</span>
              <LogIn className="w-4 h-4" />
            </>
          )}
        </button>
      </form>

      {/* Switch to Register */}
      <div className="mt-6 pt-5 border-t border-slate-100 text-center">
        <p className="text-xs text-slate-500">
          Need a new staff or pharmacist account?{' '}
          <button
            type="button"
            onClick={switchToRegister}
            className="font-bold text-emerald-600 hover:text-emerald-700 transition-colors ml-1"
          >
            Create Account
          </button>
        </p>
      </div>

      {/* Quick Demo Credentials for Reviewers */}
      <div className="mt-5 p-3 rounded-xl bg-slate-50 border border-slate-200/60">
        <p className="text-[11px] font-semibold text-slate-600 mb-1.5 flex items-center justify-between">
          <span>Quick Demo Logins</span>
          <span className="text-[10px] text-slate-400">Click to autofill</span>
        </p>
        <div className="flex flex-wrap gap-1.5">
          <button
            type="button"
            onClick={() => handleFillDemo('admin@medistock.com', 'Admin@123')}
            className="px-2.5 py-1 text-[11px] font-medium bg-white hover:bg-emerald-50 text-slate-700 hover:text-emerald-700 border border-slate-200 rounded-lg transition-colors shadow-2xs"
          >
            Admin (Admin@123)
          </button>
          <button
            type="button"
            onClick={() => handleFillDemo('pharmacist@medistock.com', 'Pharma@123')}
            className="px-2.5 py-1 text-[11px] font-medium bg-white hover:bg-emerald-50 text-slate-700 hover:text-emerald-700 border border-slate-200 rounded-lg transition-colors shadow-2xs"
          >
            Pharmacist (Pharma@123)
          </button>
          <button
            type="button"
            onClick={() => handleFillDemo('staff@medistock.com', 'Staff@123')}
            className="px-2.5 py-1 text-[11px] font-medium bg-white hover:bg-emerald-50 text-slate-700 hover:text-emerald-700 border border-slate-200 rounded-lg transition-colors shadow-2xs"
          >
            Staff (Staff@123)
          </button>
        </div>
      </div>
    </motion.div>
  )
}
