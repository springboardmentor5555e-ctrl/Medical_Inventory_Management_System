import { useState } from 'react'
import {
  User,
  Bell,
  KeyRound,
  CheckCircle2,
  Lock,
  Eye,
  EyeOff,
  Server,
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { apiRequest } from '../../services/api'

export default function SettingsView({ showToast }) {
  const { user, token, role } = useAuth()
  const [activeTab, setActiveTab] = useState('profile')

  // Password change state
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showCurrent, setShowCurrent] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [passwordLoading, setPasswordLoading] = useState(false)

  const handlePasswordChange = async (e) => {
    e.preventDefault()
    if (newPassword !== confirmPassword) {
      showToast({ type: 'error', message: 'New password and confirmation do not match.' })
      return
    }
    if (newPassword.length < 8) {
      showToast({ type: 'error', message: 'New password must be at least 8 characters long.' })
      return
    }

    setPasswordLoading(true)
    try {
      await apiRequest('/api/users/change-password', {
        token,
        method: 'POST',
        body: { currentPassword, newPassword },
      })
      showToast({ type: 'success', message: 'Account password updated successfully!' })
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    } catch (err) {
      showToast({ type: 'error', message: err.message || 'Failed to update password.' })
    } finally {
      setPasswordLoading(false)
    }
  }

  const tabs = [
    { id: 'profile', label: 'Profile Information', icon: User },
    { id: 'security', label: 'Security & Password', icon: KeyRound },
    { id: 'notifications', label: 'Alert Preferences', icon: Bell },
    { id: 'system', label: 'System Overview', icon: Server },
  ]

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pb-12">
      {/* Settings Navigation Tabs (3 cols) */}
      <div className="lg:col-span-3 space-y-1">
        <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-sm space-y-1">
          <p className="px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
            Settings Menu
          </p>
          {tabs.map((tab) => {
            const Icon = tab.icon
            const isSelected = activeTab === tab.id
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  isSelected
                    ? 'bg-emerald-50 text-emerald-700 shadow-xs'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <Icon className={`w-4 h-4 ${isSelected ? 'text-emerald-600' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Settings Main Content Area (9 cols) */}
      <div className="lg:col-span-9 space-y-6">
        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 space-y-6">
            <div>
              <h3 className="text-base font-bold text-slate-900">Personnel Profile</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Authenticated user details and organizational assignment.
              </p>
            </div>

            <div className="flex items-center gap-4 p-4 bg-slate-50 border border-slate-200/70 rounded-2xl">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white font-bold text-xl flex items-center justify-center shadow-md">
                {(user?.name || user?.email || 'U')[0].toUpperCase()}
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900">{user?.name || 'MediStock User'}</h4>
                <p className="text-xs text-slate-500">{user?.email}</p>
                <span className="inline-block mt-1.5 px-2 py-0.5 text-[10px] font-bold uppercase rounded-md bg-emerald-100 text-emerald-800">
                  {role} Role
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-3.5 bg-white border border-slate-200/80 rounded-xl">
                <span className="text-[11px] font-semibold text-slate-400 uppercase">Full Name</span>
                <p className="text-xs font-bold text-slate-800 mt-0.5">{user?.name || 'Administrator'}</p>
              </div>
              <div className="p-3.5 bg-white border border-slate-200/80 rounded-xl">
                <span className="text-[11px] font-semibold text-slate-400 uppercase">Work Email</span>
                <p className="text-xs font-bold text-slate-800 mt-0.5">{user?.email}</p>
              </div>
              <div className="p-3.5 bg-white border border-slate-200/80 rounded-xl">
                <span className="text-[11px] font-semibold text-slate-400 uppercase">Organization</span>
                <p className="text-xs font-bold text-slate-800 mt-0.5">MediStock Healthcare</p>
              </div>
              <div className="p-3.5 bg-white border border-slate-200/80 rounded-xl">
                <span className="text-[11px] font-semibold text-slate-400 uppercase">Session Status</span>
                <p className="text-xs font-bold text-emerald-600 mt-0.5 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Authenticated via JWT</span>
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Security & Password Tab */}
        {activeTab === 'security' && (
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 space-y-6">
            <div>
              <h3 className="text-base font-bold text-slate-900">Security Credentials</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Update your account password to maintain security integrity.
              </p>
            </div>

            <form onSubmit={handlePasswordChange} className="space-y-4 max-w-lg">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Current Password <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type={showCurrent ? 'text' : 'password'}
                    required
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Enter current password..."
                    className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:bg-white"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrent((prev) => !prev)}
                    className="p-1 text-slate-400 hover:text-slate-600 absolute right-3 top-2.5"
                  >
                    {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  New Password (min 8 characters) <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type={showNew ? 'text' : 'password'}
                    required
                    minLength={8}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:bg-white"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNew((prev) => !prev)}
                    className="p-1 text-slate-400 hover:text-slate-600 absolute right-3 top-2.5"
                  >
                    {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Confirm New Password <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type={showNew ? 'text' : 'password'}
                    required
                    minLength={8}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:bg-white"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={passwordLoading}
                  className="py-2.5 px-5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-md shadow-emerald-600/20 transition-all disabled:opacity-60"
                >
                  {passwordLoading ? 'Updating Password...' : 'Save New Password'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Notifications Preference Tab */}
        {activeTab === 'notifications' && (
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 space-y-5">
            <div>
              <h3 className="text-base font-bold text-slate-900">Email & In-App Notification Flow</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Automated asynchronous alert dispatch mechanisms configured in MediStock.
              </p>
            </div>

            <div className="space-y-3">
              <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-2xl flex items-start gap-3">
                <div className="p-2 rounded-xl bg-emerald-100 text-emerald-700 shrink-0">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">Low Stock & Out-of-Stock Triggers</h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Dispatches instant event notifications when stock falls below configured SKU minimum levels or reaches zero units.
                  </p>
                </div>
              </div>

              <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-2xl flex items-start gap-3">
                <div className="p-2 rounded-xl bg-amber-100 text-amber-700 shrink-0">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">Daily Automated Expiry Scanning</h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Scheduled daily cron (02:00 AM) and on-demand scans identify batches reaching 30-day expiry threshold or expired dates.
                  </p>
                </div>
              </div>

              <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-2xl flex items-start gap-3">
                <div className="p-2 rounded-xl bg-sky-100 text-sky-700 shrink-0">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">Asynchronous Spring Mail Delivery</h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Executed asynchronously after database transaction commit via <code className="text-[11px] bg-slate-200/70 px-1 py-0.5 rounded">AFTER_COMMIT</code> event listeners to guarantee fail-safe database mutations.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* System Overview Tab */}
        {activeTab === 'system' && (
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 space-y-5">
            <div>
              <h3 className="text-base font-bold text-slate-900">System Environment & Infrastructure</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Overview of backend persistence, security layers, and API connectors.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-xl">
                <span className="text-[11px] font-semibold text-slate-400 uppercase">Database Layer</span>
                <p className="text-xs font-bold text-slate-800 mt-1">PostgreSQL 18.4 (JPA / Hibernate)</p>
              </div>

              <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-xl">
                <span className="text-[11px] font-semibold text-slate-400 uppercase">Security Engine</span>
                <p className="text-xs font-bold text-slate-800 mt-1">Spring Security 6 + JJWT Stateless Tokens</p>
              </div>

              <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-xl">
                <span className="text-[11px] font-semibold text-slate-400 uppercase">Export Engines</span>
                <p className="text-xs font-bold text-slate-800 mt-1">Apache POI 5.4.1 + OpenPDF 2.0.3</p>
              </div>

              <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-xl">
                <span className="text-[11px] font-semibold text-slate-400 uppercase">API Documentation</span>
                <p className="text-xs font-bold text-emerald-600 mt-1">SpringDoc OpenAPI / Swagger 2.8.9</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
