import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import ThemeToggle from './ThemeToggle';
import { getUnreadCount, changePassword } from '../services/api';
import {
  PackageOpen,
  LayoutDashboard,
  Package,
  Tag,
  Truck,
  UserPlus,
  LogOut,
  ChevronLeft,
  ChevronRight,
  BarChart2,
  ShoppingCart,
  Bell,
  KeyRound,
  X,
  LockKeyhole,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Search,
} from 'lucide-react';

const navItems = [
  { to: '/dashboard',     label: 'Dashboard',       icon: LayoutDashboard, roles: ['ADMIN', 'PHARMACIST', 'STAFF'] },
  { to: '/inventory',     label: 'Inventory',        icon: Package,          roles: ['ADMIN', 'PHARMACIST', 'STAFF'] },
  { to: '/purchase-orders', label: 'Purchase Orders', icon: ShoppingCart,    roles: ['ADMIN', 'PHARMACIST'] },
  { to: '/reports',       label: 'Reports',          icon: BarChart2,        roles: ['ADMIN', 'PHARMACIST', 'STAFF'] },
  { to: '/notifications', label: 'Notifications',    icon: Bell,             roles: ['ADMIN', 'PHARMACIST', 'STAFF'] },
  { to: '/categories',    label: 'Categories',       icon: Tag,              roles: ['ADMIN'] },
  { to: '/suppliers',     label: 'Suppliers',        icon: Truck,            roles: ['ADMIN', 'PHARMACIST'] },
  { to: '/users',         label: 'Users',            icon: UserPlus,         roles: ['ADMIN', 'PHARMACIST'] },
];

const roleColors = {
  ADMIN:      { dot: 'bg-purple-400', pill: 'text-purple-400 bg-purple-400/10 border-purple-400/20' },
  PHARMACIST: { dot: 'bg-sky-400',    pill: 'text-sky-400 bg-sky-400/10 border-sky-400/20' },
  STAFF:      { dot: 'bg-emerald-400',pill: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20' },
};

/* ── Inline Change Password Modal ───────────────────────────── */
const SidebarChangePasswordModal = ({ onClose }) => {
  const [current, setCurrent] = useState('');
  const [next, setNext]       = useState('');
  const [showC, setShowC]     = useState(false);
  const [showN, setShowN]     = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setSuccess(''); setLoading(true);
    try {
      await changePassword({ currentPassword: current, newPassword: next });
      setSuccess('Password updated successfully!');
      setCurrent(''); setNext('');
    } catch (err) {
      setError(err.response?.data || 'Failed to update password.');
    }
    setLoading(false);
  };

  const EyeBtn = ({ show, toggle }) => (
    <button type="button" onClick={toggle}
      className="p-1 rounded hover:bg-white/10 transition-colors"
      style={{ color: 'var(--text-disabled)' }}>
      {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
    </button>
  );

  const inputStyle = {
    background: 'var(--bg-surface)',
    border: '1px solid var(--border-input)',
    color: 'var(--text-primary)',
    outline: 'none',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(6px)' }}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="glass-card rounded-2xl p-6 w-full max-w-md"
        style={{ border: '1px solid var(--border-subtle)' }}
      >
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center border"
              style={{ background: 'rgba(168,85,247,0.1)', borderColor: 'rgba(168,85,247,0.25)' }}>
              <KeyRound className="w-4 h-4 text-purple-400" />
            </div>
            <div>
              <h2 className="text-base font-bold" style={{ color: 'var(--text-primary)' }}>Change Password</h2>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Update your account password</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/5 transition-colors"
            style={{ color: 'var(--text-muted)' }}>
            <X className="w-4 h-4" />
          </button>
        </div>

        <AnimatePresence>
          {error && (
            <motion.div initial={{ opacity:0,height:0 }} animate={{ opacity:1,height:'auto' }} exit={{ opacity:0,height:0 }}
              className="overflow-hidden mb-4">
              <div className="flex items-center gap-2 p-3 rounded-xl text-sm border"
                style={{ background:'rgba(239,68,68,0.07)', borderColor:'rgba(239,68,68,0.22)', color:'#f87171' }}>
                <AlertCircle className="w-4 h-4 flex-shrink-0" /><span>{error}</span>
              </div>
            </motion.div>
          )}
          {success && (
            <motion.div initial={{ opacity:0,height:0 }} animate={{ opacity:1,height:'auto' }} exit={{ opacity:0,height:0 }}
              className="overflow-hidden mb-4">
              <div className="flex items-center gap-2 p-3 rounded-xl text-sm border"
                style={{ background:'rgba(52,211,153,0.07)', borderColor:'rgba(52,211,153,0.25)', color:'#34d399' }}>
                <CheckCircle2 className="w-4 h-4 flex-shrink-0" /><span>{success}</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <form onSubmit={handleSubmit} className="space-y-4">
          {[{ label: 'Current Password', val: current, set: setCurrent, show: showC, toggle: () => setShowC(v=>!v) },
            { label: 'New Password (min 6 chars)', val: next, set: setNext, show: showN, toggle: () => setShowN(v=>!v) }
          ].map(({ label, val, set, show, toggle }) => (
            <div key={label} className="space-y-1.5">
              <label className="block text-xs font-semibold tracking-widest uppercase"
                style={{ color: 'var(--text-muted)' }}>{label}</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none"
                  style={{ color: 'var(--text-disabled)' }}>
                  <LockKeyhole className="w-4 h-4" />
                </span>
                <input type={show ? 'text' : 'password'} required value={val}
                  onChange={e => set(e.target.value)}
                  className="w-full pl-10 pr-10 py-3 rounded-xl text-sm"
                  style={inputStyle} />
                <span className="absolute inset-y-0 right-0 pr-3 flex items-center">
                  <EyeBtn show={show} toggle={toggle} />
                </span>
              </div>
            </div>
          ))}
          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose}
              className="flex-1 py-3 rounded-xl border text-sm font-semibold"
              style={{ borderColor:'var(--border-default)', color:'var(--text-muted)', background:'var(--bg-surface)' }}>
              Cancel
            </button>
            <button type="submit" disabled={loading}
              className="flex-1 py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-colors"
              style={{ background:'linear-gradient(135deg,rgba(168,85,247,0.25),rgba(99,102,241,0.2))',
                border:'1px solid rgba(168,85,247,0.4)', color:'#c084fc' }}>
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Update Password'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

const Sidebar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [navUnread, setNavUnread] = useState(0);
  const [showChangePwd, setShowChangePwd] = useState(false);

  // Poll unread count for the sidebar badge
  useEffect(() => {
    const fetchCount = () => {
      getUnreadCount()
        .then((res) => setNavUnread(res.data?.count ?? 0))
        .catch(() => {});
    };
    fetchCount();
    const id = setInterval(fetchCount, 30_000);
    return () => clearInterval(id);
  }, []);

  const handleLogout = () => { logout(); navigate('/'); };
  const visibleItems = navItems.filter((item) => user && item.roles.includes(user.role));
  const rc = roleColors[user?.role] || roleColors.STAFF;

  // Avatar initials
  const initials = user?.username?.slice(0, 2).toUpperCase() || '?';

  return (
    <motion.aside
      animate={{ width: collapsed ? 68 : 236 }}
      transition={{ duration: 0.28, ease: [0.4, 0, 0.2, 1] }}
      className="sidebar-bg relative flex flex-col h-screen sticky top-0 flex-shrink-0"
      style={{ borderRight: '1px solid var(--border-nav)' }}
    >
      {/* ── Logo ─────────────────────────────────────── */}
      <div className="h-14 flex items-center px-4 flex-shrink-0"
        style={{ borderBottom: '1px solid var(--border-nav)' }}>
        <div className="w-8 h-8 rounded-xl bg-sky-500/15 flex items-center justify-center border border-sky-500/25 flex-shrink-0">
          <PackageOpen className="w-4 h-4 text-sky-400" />
        </div>
        <AnimatePresence>
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -8 }}
              transition={{ duration: 0.18 }}
              className="ml-3 overflow-hidden whitespace-nowrap"
            >
              <span className="font-extrabold text-[15px] tracking-tight"
                style={{
                  background: 'linear-gradient(135deg, var(--text-primary), #38bdf8)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}>
                MediStock
              </span>
              <span className="block text-[10px] font-medium mt-0 -mt-0.5"
                style={{ color: 'var(--text-muted)' }}>
                Inventory Platform
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Collapse toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-[3.6rem] w-6 h-6 rounded-full flex items-center justify-center z-30 transition-all duration-200"
        style={{
          background: 'var(--bg-elevated)',
          border: '1px solid var(--border-default)',
          color: 'var(--text-muted)',
          boxShadow: 'var(--shadow-sm)',
        }}
        onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--text-primary)'; }}
        onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-muted)'; }}
      >
        {collapsed
          ? <ChevronRight className="w-3 h-3" />
          : <ChevronLeft className="w-3 h-3" />
        }
      </button>

      {/* ── Nav section label ─────────────────────────── */}
      <AnimatePresence>
        {!collapsed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="px-4 pt-5 pb-1"
          >
            <span className="section-label text-[10px]">Navigation</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Nav Items ─────────────────────────────────── */}
      <nav className={`flex-1 py-2 ${collapsed ? 'px-2' : 'px-3'} space-y-0.5 overflow-hidden overflow-y-auto`}>
        {visibleItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-xl transition-all duration-200 group relative
               ${collapsed ? 'justify-center px-2 py-2.5' : 'px-3 py-2.5'}
               ${isActive
                 ? 'bg-sky-500/10 text-sky-400 border border-sky-500/20'
                 : 'text-[var(--text-muted)] hover:text-[var(--text-primary)] border border-transparent hover:bg-[var(--border-subtle)]'
               }`
            }
          >
            {({ isActive }) => (
              <>
                {/* Active indicator */}
                {isActive && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-sky-400 rounded-r-full" />
                )}

                {/* Icon wrapper — relative for badge positioning */}
                <span className="relative flex-shrink-0">
                  <item.icon
                    className={`transition-colors
                      ${collapsed ? 'w-5 h-5' : 'w-[18px] h-[18px]'}
                      ${isActive ? 'text-sky-400' : 'text-[var(--text-muted)] group-hover:text-[var(--text-secondary)]'}
                    `}
                  />
                  {/* Unread badge on Notifications nav item (collapsed mode only) */}
                  {collapsed && item.to === '/notifications' && navUnread > 0 && (
                    <span
                      className="absolute -top-1.5 -right-1.5 min-w-[14px] h-3.5 px-[3px] rounded-full flex items-center justify-center text-[8px] font-bold text-white pointer-events-none"
                      style={{ background: 'linear-gradient(135deg, #ef4444, #f97316)' }}
                    >
                      {navUnread > 99 ? '99+' : navUnread}
                    </span>
                  )}
                </span>

                <AnimatePresence>
                  {!collapsed && (
                    <motion.span
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.15 }}
                      className="text-[13.5px] font-medium whitespace-nowrap flex-1"
                    >
                      {item.label}
                    </motion.span>
                  )}
                </AnimatePresence>

                {/* Unread count pill (expanded sidebar only) */}
                {!collapsed && item.to === '/notifications' && navUnread > 0 && (
                  <span
                    className="ml-auto text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0 text-white"
                    style={{
                      background: 'linear-gradient(135deg, #ef4444, #f97316)',
                      boxShadow: '0 2px 6px rgba(239,68,68,0.3)',
                    }}
                  >
                    {navUnread > 99 ? '99+' : navUnread}
                  </span>
                )}

                {/* Tooltip for collapsed */}
                {collapsed && (
                  <div className="absolute left-full ml-3 px-2 py-1 rounded-lg text-xs font-medium
                    opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 whitespace-nowrap"
                    style={{
                      background: 'var(--bg-elevated)',
                      border: '1px solid var(--border-default)',
                      color: 'var(--text-primary)',
                      boxShadow: 'var(--shadow-card)',
                    }}>
                    {item.label}
                    {item.to === '/notifications' && navUnread > 0 && (
                      <span className="ml-1.5 text-[9px] font-bold text-red-400">({navUnread})</span>
                    )}
                  </div>
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* ── Footer ────────────────────────────────────── */}
      <div className={`flex-shrink-0 ${collapsed ? 'px-2' : 'px-3'} pb-4 pt-2 space-y-1`}
        style={{ borderTop: '1px solid var(--border-nav)' }}>

        {/* Theme Toggle */}
        <ThemeToggle collapsed={collapsed} />

        {/* User info block */}
        <div className={`flex items-center gap-3 rounded-xl px-2 py-2 ${collapsed ? 'justify-center' : ''}`}>
          {/* Avatar */}
          <div className={`flex-shrink-0 rounded-xl font-bold text-xs flex items-center justify-center border
            ${collapsed ? 'w-8 h-8' : 'w-8 h-8'}
            bg-gradient-to-br from-sky-500/20 to-indigo-500/20 border-sky-500/20 text-sky-400`}>
            {initials}
          </div>

          <AnimatePresence>
            {!collapsed && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex-1 min-w-0"
              >
                <p className="text-[13px] font-semibold truncate" style={{ color: 'var(--text-primary)' }}>
                  {user?.username}
                </p>
                <span className={`text-[9px] uppercase font-bold tracking-widest px-1.5 py-0.5 rounded border ${rc.pill}`}>
                  {user?.role}
                </span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Change Password quick button (expanded only) */}
          <AnimatePresence>
            {!collapsed && (
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowChangePwd(true)}
                title="Change Password"
                className="flex-shrink-0 p-1.5 rounded-lg border transition-all duration-200 hover:scale-105 group"
                style={{ background: 'rgba(168,85,247,0.07)', borderColor: 'rgba(168,85,247,0.2)', color: '#c084fc' }}
              >
                <KeyRound className="w-3.5 h-3.5" />
              </motion.button>
            )}
          </AnimatePresence>
        </div>

        {/* Change Password Modal */}
        <AnimatePresence>
          {showChangePwd && <SidebarChangePasswordModal onClose={() => setShowChangePwd(false)} />}
        </AnimatePresence>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className={`flex items-center gap-2.5 w-full rounded-xl text-[13px] font-medium transition-all duration-200 group border border-transparent
            ${collapsed ? 'justify-center px-2 py-2.5' : 'px-3 py-2.5'}
          `}
          style={{ color: 'var(--text-muted)' }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = '#f87171';
            e.currentTarget.style.background = 'rgba(239,68,68,0.08)';
            e.currentTarget.style.borderColor = 'rgba(239,68,68,0.2)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = 'var(--text-muted)';
            e.currentTarget.style.background = 'transparent';
            e.currentTarget.style.borderColor = 'transparent';
          }}
        >
          <LogOut className="w-4 h-4 flex-shrink-0" />
          <AnimatePresence>
            {!collapsed && (
              <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                Sign out
              </motion.span>
            )}
          </AnimatePresence>

          {/* Tooltip */}
          {collapsed && (
            <div className="absolute left-full ml-3 px-2 py-1 rounded-lg text-xs font-medium
              opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50"
              style={{
                background: 'var(--bg-elevated)',
                border: '1px solid var(--border-default)',
                color: 'var(--text-primary)',
              }}>
              Sign out
            </div>
          )}
        </button>
      </div>
    </motion.aside>
  );
};

export default Sidebar;
