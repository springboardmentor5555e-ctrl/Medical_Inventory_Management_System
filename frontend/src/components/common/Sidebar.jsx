import {
  LayoutDashboard,
  Pill,
  Truck,
  Activity,
  Clock,
  BarChart3,
  Bell,
  FileDown,
  Users,
  Settings,
  User,
  LogOut,
  Cross,
  X,
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'

export default function Sidebar({
  activeView,
  setActiveView,
  isOpen,
  closeMobile,
}) {
  const { logout, canManageUsers, canViewSuppliers, canViewReports, canViewAnalytics } = useAuth()

  const allNavItems = [
    { id: 'Dashboard', label: 'Dashboard', icon: LayoutDashboard, visible: true },
    { id: 'Medicines', label: 'Medicines', icon: Pill, visible: true },
    { id: 'Suppliers', label: 'Suppliers', icon: Truck, visible: canViewSuppliers },
    { id: 'Stock History', label: 'Stock History', icon: Activity, visible: true },
    { id: 'Expiry Monitoring', label: 'Expiry Tracker', icon: Clock, visible: true },
    { id: 'Analytics', label: 'Analytics', icon: BarChart3, visible: canViewAnalytics },
    { id: 'Notifications', label: 'Notifications', icon: Bell, visible: true },
    { id: 'Reports', label: 'Reports', icon: FileDown, visible: canViewReports },
    { id: 'User Management', label: 'Team Access', icon: Users, visible: canManageUsers },
    { id: 'Settings', label: 'Settings', icon: Settings, visible: true },
    { id: 'Profile', label: 'My Profile', icon: User, visible: true },
  ]

  const navItems = allNavItems.filter((item) => item.visible)

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-xs lg:hidden"
          onClick={closeMobile}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-[#0b1f33] text-white flex flex-col justify-between border-r border-slate-800 shadow-2xl lg:shadow-none transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div>
          {/* Brand Header */}
          <div className="flex items-center justify-between h-16 px-6 border-b border-slate-800/80">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-white shadow-lg shadow-emerald-500/20">
                <Cross className="w-5 h-5 fill-white text-emerald-600" />
              </div>
              <div>
                <h2 className="text-sm font-bold tracking-tight text-white flex items-center gap-1.5">
                  <span>MediStock</span>
                  <span className="text-[10px] px-1.5 py-0.2 bg-emerald-500/20 text-emerald-400 font-semibold rounded">PRO</span>
                </h2>
                <p className="text-[10px] font-medium text-slate-400 tracking-wide uppercase">Healthcare Platform</p>
              </div>
            </div>

            <button
              type="button"
              onClick={closeMobile}
              className="lg:hidden p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Section */}
          <div className="px-3 py-4">
            <p className="px-3 text-[11px] font-semibold tracking-wider uppercase text-slate-400 mb-2">
              Main Menu
            </p>
            <nav className="space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon
                const isActive = activeView === item.id
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      setActiveView(item.id)
                      if (closeMobile) closeMobile()
                    }}
                    className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                      isActive
                        ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30 font-bold'
                        : 'text-slate-300 hover:bg-slate-800/70 hover:text-white'
                    }`}
                  >
                    <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                    <span className="truncate">{item.label}</span>
                  </button>
                )
              })}
            </nav>
          </div>
        </div>

        {/* Footer info & logout */}
        <div className="p-4 border-t border-slate-800/80 bg-slate-900/40">
          <div className="px-2 py-1.5 mb-2 rounded-lg bg-slate-800/60 border border-slate-750 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[11px] font-medium text-slate-300">System Healthy</span>
            </div>
            <span className="text-[10px] text-slate-400">v1.4</span>
          </div>

          <button
            type="button"
            onClick={logout}
            className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-rose-300 hover:text-rose-100 hover:bg-rose-500/10 rounded-xl transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  )
}
