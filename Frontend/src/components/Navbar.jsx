import React from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import NotificationBell from './NotificationBell'

const linkClass = ({ isActive }) =>
  `px-3 py-2 rounded-md text-sm font-medium transition ${
    isActive
      ? 'bg-brand-600 text-white'
      : 'text-slate-600 hover:bg-slate-100'
  }`

export default function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <nav className="bg-white border-b border-slate-200 sticky top-0 z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">

          {/* Logo + Navigation */}
          <div className="flex items-center gap-8">

            <button
              onClick={() => navigate('/')}
              className="font-display text-xl font-bold text-brand-700"
            >
              MediStock
            </button>

            <div className="hidden sm:flex gap-1">

              <NavLink
                to="/"
                end
                className={linkClass}
              >
                Dashboard
              </NavLink>

              <NavLink
                to="/medicines"
                className={linkClass}
              >
                Medicines
              </NavLink>

              <NavLink
                to="/suppliers"
                className={linkClass}
              >
                Suppliers
              </NavLink>

              <NavLink
                to="/expiry-tracking"
                className={linkClass}
              >
                Expiry Tracking
              </NavLink>

              <NavLink
                to="/reports"
                className={linkClass}
              >
                Reports
              </NavLink>

            </div>
          </div>

          {/* Right Side */}
          <div className="flex items-center gap-4">

            <NotificationBell />

            {user && (
              <span className="text-sm text-slate-500 hidden sm:inline">
                {user.fullName} ·{' '}
                <span className="uppercase text-xs font-semibold text-brand-600">
                  {user.role}
                </span>
              </span>
            )}

            <button
              onClick={handleLogout}
              className="text-sm font-medium text-slate-500 hover:text-red-600 transition"
            >
              Logout
            </button>

          </div>
        </div>
      </div>
    </nav>
  )
}