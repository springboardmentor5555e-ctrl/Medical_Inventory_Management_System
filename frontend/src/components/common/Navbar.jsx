import { useState } from 'react'
import { Bell, Menu, User, Shield, LogOut } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import NotificationDropdown from './NotificationDropdown'

export default function Navbar({
  activeView,
  setActiveView,
  toggleSidebar,
  notifications = [],
  markNotificationRead,
  markAllNotificationsRead,
}) {
  const { user, role, logout } = useAuth()
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)

  const unreadCount = notifications.filter((n) => n.unread).length

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between h-16 px-4 sm:px-6 bg-white/90 backdrop-blur-md border-b border-slate-200/80 transition-all">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={toggleSidebar}
          className="lg:hidden p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
          aria-label="Toggle navigation"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex flex-col">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-400">
            <span>MediStock</span>
            <span>/</span>
            <span className="text-emerald-600 capitalize">{activeView}</span>
          </div>
          <h1 className="text-base sm:text-lg font-bold text-slate-900 leading-tight">
            {activeView}
          </h1>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Notification Bell with Dropdown */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setDropdownOpen((prev) => !prev)}
            className={`relative p-2.5 rounded-xl border transition-all ${
              dropdownOpen
                ? 'bg-emerald-50 text-emerald-600 border-emerald-200'
                : 'text-slate-600 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 border-slate-200/80'
            }`}
            aria-label="View notifications"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 flex items-center justify-center bg-rose-500 text-white text-[10px] font-bold rounded-full border-2 border-white shadow-sm animate-pulse">
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </button>

          <NotificationDropdown
            isOpen={dropdownOpen}
            close={() => setDropdownOpen(false)}
            notifications={notifications}
            markRead={markNotificationRead}
            markAllRead={markAllNotificationsRead}
            viewAll={() => setActiveView('Notifications')}
          />
        </div>

        {/* User Pill / Profile Menu */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setProfileOpen((prev) => !prev)}
            className="flex items-center gap-2.5 p-1.5 sm:px-3 sm:py-1.5 rounded-xl border border-slate-200/80 bg-slate-50 hover:bg-slate-100 transition-colors text-left"
          >
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-600 to-teal-700 text-white font-bold flex items-center justify-center text-xs shadow-sm">
              {(user?.name || user?.email || 'U')[0].toUpperCase()}
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-xs font-semibold text-slate-800 leading-none truncate max-w-[130px]">
                {user?.name || user?.email?.split('@')[0]}
              </p>
              <span className="text-[10px] font-bold tracking-wide uppercase text-emerald-600">
                {role}
              </span>
            </div>
          </button>

          {profileOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setProfileOpen(false)} />
              <div className="absolute right-0 top-12 z-50 w-56 bg-white rounded-2xl shadow-xl border border-slate-200/80 py-2 overflow-hidden">
                <div className="px-4 py-2 border-b border-slate-100">
                  <p className="text-xs font-semibold text-slate-800 truncate">{user?.email}</p>
                  <p className="text-[11px] text-emerald-600 font-medium">{role} Access</p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setProfileOpen(false)
                    setActiveView('Profile')
                  }}
                  className="w-full px-4 py-2 text-left text-xs font-medium text-slate-700 hover:bg-slate-50 flex items-center gap-2 transition-colors"
                >
                  <User className="w-4 h-4 text-slate-400" />
                  <span>My Profile</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setProfileOpen(false)
                    setActiveView('Settings')
                  }}
                  className="w-full px-4 py-2 text-left text-xs font-medium text-slate-700 hover:bg-slate-50 flex items-center gap-2 transition-colors"
                >
                  <Shield className="w-4 h-4 text-slate-400" />
                  <span>Account Settings</span>
                </button>
                <div className="my-1 border-t border-slate-100" />
                <button
                  type="button"
                  onClick={() => {
                    setProfileOpen(false)
                    logout()
                  }}
                  className="w-full px-4 py-2 text-left text-xs font-semibold text-rose-600 hover:bg-rose-50 flex items-center gap-2 transition-colors"
                >
                  <LogOut className="w-4 h-4 text-rose-500" />
                  <span>Sign Out</span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
