import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import Sidebar from '../components/Sidebar';
import {
  UserPlus, User as UserIcon, Mail, LockKeyhole, ShieldCheck,
  AlertCircle, Loader2, Crown, Pill, Users as UsersIcon,
  CheckCircle2, Trash2, Edit3, Search, RefreshCw,
  Shield, Calendar, X, Eye, EyeOff, KeyRound, Smartphone, Phone,
} from 'lucide-react';
import {
  getUsers, updateUser, deleteUser, changePassword,
} from '../services/api';
import axios from 'axios';

/* ── Role config ─────────────────────────────────────────────── */
const ROLES = [
  {
    value: 'ADMIN',
    label: 'Admin',
    icon: Crown,
    description: 'Full access — manage users, inventory, categories & suppliers',
    accent: {
      pill: 'text-purple-400 bg-purple-400/10 border-purple-400/25',
      ring: 'border-purple-500/50',
      bg: 'bg-purple-500/10',
      glow: 'rgba(168,85,247,0.18)',
      color: '#c084fc',
    },
  },
  {
    value: 'PHARMACIST',
    label: 'Pharmacist',
    icon: Pill,
    description: 'Manage medicines & suppliers, read-only on categories',
    accent: {
      pill: 'text-sky-400 bg-sky-400/10 border-sky-400/25',
      ring: 'border-sky-500/50',
      bg: 'bg-sky-500/10',
      glow: 'rgba(56,189,248,0.18)',
      color: '#38bdf8',
    },
  },
  {
    value: 'STAFF',
    label: 'Staff',
    icon: UsersIcon,
    description: 'View dashboard & inventory only — read-only access',
    accent: {
      pill: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/25',
      ring: 'border-emerald-500/50',
      bg: 'bg-emerald-500/10',
      glow: 'rgba(52,211,153,0.18)',
      color: '#34d399',
    },
  },
];

const roleInfo = Object.fromEntries(ROLES.map((r) => [r.value, r]));

/* ── Helpers ─────────────────────────────────────────────────── */
const Field = ({ label, icon: Icon, type = 'text', rightEl, ...props }) => (
  <div className="space-y-1.5">
    <label className="block text-xs font-semibold tracking-widest uppercase"
      style={{ color: 'var(--text-muted)' }}>{label}</label>
    <div className="relative">
      <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none"
        style={{ color: 'var(--text-disabled)' }}>
        <Icon className="w-4 h-4" />
      </span>
      <input {...props} type={type}
        className="glass-input w-full pl-10 pr-10 py-3 rounded-xl text-sm outline-none" />
      {rightEl && (
        <span className="absolute inset-y-0 right-0 pr-3 flex items-center">
          {rightEl}
        </span>
      )}
    </div>
  </div>
);

const RolePill = ({ role }) => {
  const info = roleInfo[role];
  if (!info) return null;
  const Icon = info.icon;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${info.accent.pill}`}>
      <Icon className="w-3 h-3" />
      {info.label}
    </span>
  );
};

const Alert = ({ type, message, onClose }) => (
  <motion.div
    initial={{ opacity: 0, y: -8, height: 0 }}
    animate={{ opacity: 1, y: 0, height: 'auto' }}
    exit={{ opacity: 0, height: 0 }}
    className="overflow-hidden mb-5"
  >
    <div className="flex items-center gap-3 p-4 rounded-xl text-sm border"
      style={type === 'error'
        ? { background: 'rgba(239,68,68,0.07)', borderColor: 'rgba(239,68,68,0.22)', color: '#f87171' }
        : { background: 'rgba(52,211,153,0.07)', borderColor: 'rgba(52,211,153,0.25)', color: '#34d399' }
      }
    >
      {type === 'error'
        ? <AlertCircle className="w-4 h-4 flex-shrink-0" />
        : <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
      }
      <span className="flex-1">{message}</span>
      {onClose && (
        <button onClick={onClose} className="opacity-60 hover:opacity-100 transition-opacity">
          <X className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  </motion.div>
);

/* ── Edit User Modal ─────────────────────────────────────────── */
const EditUserModal = ({ user, onClose, onSave, callerRole }) => {
  const [email, setEmail] = useState(user.email);
  const [phoneNumber, setPhoneNumber] = useState(user.phoneNumber || '');
  const [role, setRole] = useState(user.role);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const availableRoles = callerRole === 'ADMIN' ? ROLES : ROLES.filter(r => r.value === 'STAFF');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await updateUser(user.id, { email, phoneNumber, role });
      onSave(res.data);
    } catch (err) {
      setError(err.response?.data || 'Failed to update user.');
    }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="glass-card rounded-2xl p-6 w-full max-w-md"
        style={{ border: '1px solid var(--border-subtle)' }}
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center border"
              style={{ background: 'rgba(56,189,248,0.1)', borderColor: 'rgba(56,189,248,0.25)' }}>
              <Edit3 className="w-4 h-4 text-sky-400" />
            </div>
            <div>
              <h2 className="text-base font-bold" style={{ color: 'var(--text-primary)' }}>Edit User</h2>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>@{user.username}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/5 transition-colors"
            style={{ color: 'var(--text-muted)' }}>
            <X className="w-4 h-4" />
          </button>
        </div>

        <AnimatePresence>
          {error && <Alert type="error" message={error} onClose={() => setError('')} />}
        </AnimatePresence>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Field label="Email Address" icon={Mail}
            type="email" required value={email}
            onChange={e => setEmail(e.target.value)} />

          <Field label="Mobile Phone Number" icon={Smartphone}
            type="tel" value={phoneNumber}
            onChange={e => setPhoneNumber(e.target.value)}
            placeholder="+91 98765 43210" />

          <div className="space-y-2">
            <label className="block text-xs font-semibold tracking-widest uppercase"
              style={{ color: 'var(--text-muted)' }}>System Role</label>
            <div className="grid grid-cols-1 gap-2">
              {availableRoles.map(({ value, label, icon: Icon, accent }) => {
                const isSelected = role === value;
                return (
                  <button key={value} type="button" onClick={() => setRole(value)}
                    className="text-left px-4 py-3 rounded-xl border transition-all duration-200 flex items-center gap-3"
                    style={isSelected
                      ? { background: accent.bg, borderColor: accent.color + '66', boxShadow: `0 0 0 1px ${accent.glow}` }
                      : { background: 'var(--bg-surface)', borderColor: 'var(--border-default)' }
                    }
                  >
                    {isSelected && <ShieldCheck className="w-4 h-4" style={{ color: accent.color }} />}
                    {!isSelected && <Icon className="w-4 h-4" style={{ color: 'var(--text-disabled)' }} />}
                    <span className="text-sm font-medium" style={{ color: isSelected ? accent.color : 'var(--text-secondary)' }}>
                      {label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose}
              className="flex-1 py-3 rounded-xl border text-sm font-semibold transition-colors"
              style={{ borderColor: 'var(--border-default)', color: 'var(--text-muted)', background: 'var(--bg-surface)' }}>
              Cancel
            </button>
            <button type="submit" disabled={loading} className="flex-1 btn-primary py-3 gap-2">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save Changes'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

/* ── Change Password Modal ───────────────────────────────────── */
const ChangePasswordModal = ({ onClose }) => {
  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNext, setShowNext] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setSuccess(''); setLoading(true);
    try {
      await changePassword({ currentPassword: current, newPassword: next });
      setSuccess('Password changed successfully!');
      setCurrent(''); setNext('');
    } catch (err) {
      setError(err.response?.data || 'Failed to change password.');
    }
    setLoading(false);
  };

  const EyeBtn = ({ show, toggle }) => (
    <button type="button" onClick={toggle}
      className="p-1 rounded transition-colors hover:bg-white/10"
      style={{ color: 'var(--text-disabled)' }}>
      {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
    </button>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="glass-card rounded-2xl p-6 w-full max-w-md"
        style={{ border: '1px solid var(--border-subtle)' }}
      >
        <div className="flex items-center justify-between mb-6">
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
          {error && <Alert type="error" message={error} onClose={() => setError('')} />}
          {success && <Alert type="success" message={success} onClose={() => setSuccess('')} />}
        </AnimatePresence>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Field label="Current Password" icon={LockKeyhole}
            type={showCurrent ? 'text' : 'password'}
            required value={current}
            onChange={e => setCurrent(e.target.value)}
            rightEl={<EyeBtn show={showCurrent} toggle={() => setShowCurrent(v => !v)} />}
          />
          <Field label="New Password" icon={KeyRound}
            type={showNext ? 'text' : 'password'}
            required minLength={6} value={next}
            onChange={e => setNext(e.target.value)}
            rightEl={<EyeBtn show={showNext} toggle={() => setShowNext(v => !v)} />}
          />
          <p className="text-xs" style={{ color: 'var(--text-disabled)' }}>
            Minimum 6 characters
          </p>
          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose}
              className="flex-1 py-3 rounded-xl border text-sm font-semibold transition-colors"
              style={{ borderColor: 'var(--border-default)', color: 'var(--text-muted)', background: 'var(--bg-surface)' }}>
              Cancel
            </button>
            <button type="submit" disabled={loading} className="flex-1 btn-primary py-3 gap-2">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Update Password'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

/* ── Delete Confirm Modal ────────────────────────────────────── */
const DeleteConfirmModal = ({ user, onClose, onConfirm, loading }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
    style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}>
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="glass-card rounded-2xl p-6 w-full max-w-sm text-center"
      style={{ border: '1px solid rgba(239,68,68,0.3)' }}
    >
      <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
        style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)' }}>
        <Trash2 className="w-6 h-6 text-red-400" />
      </div>
      <h3 className="text-base font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
        Delete User
      </h3>
      <p className="text-sm mb-1" style={{ color: 'var(--text-secondary)' }}>
        Are you sure you want to delete
      </p>
      <p className="text-sm font-bold mb-4" style={{ color: '#f87171' }}>
        @{user.username}
      </p>
      <p className="text-xs mb-6" style={{ color: 'var(--text-muted)' }}>
        This action cannot be undone. The user will lose all access immediately.
      </p>
      <div className="flex gap-3">
        <button onClick={onClose}
          className="flex-1 py-3 rounded-xl border text-sm font-semibold"
          style={{ borderColor: 'var(--border-default)', color: 'var(--text-muted)', background: 'var(--bg-surface)' }}>
          Cancel
        </button>
        <button onClick={onConfirm} disabled={loading}
          className="flex-1 py-3 rounded-xl text-sm font-semibold transition-colors flex items-center justify-center gap-2"
          style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', color: '#f87171' }}>
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Trash2 className="w-4 h-4" />Delete</>}
        </button>
      </div>
    </motion.div>
  </div>
);

/* ── Create User Form ────────────────────────────────────────── */
const CreateUserForm = ({ isAdmin, onCreated }) => {
  const { register } = useAuth();
  const availableRoles = isAdmin ? ROLES : ROLES.filter(r => r.value === 'STAFF');

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState(isAdmin ? 'PHARMACIST' : 'STAFF');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setSuccess(''); setLoading(true);
    const res = await register(username, email, password, role, phoneNumber);
    if (res.success) {
      setSuccess(`Account created for "${username}" as ${role}.`);
      setUsername(''); setEmail(''); setPhoneNumber(''); setPassword('');
      setRole(isAdmin ? 'PHARMACIST' : 'STAFF');
      onCreated?.();
    } else {
      setError(res.message || 'Failed to create user.');
    }
    setLoading(false);
  };

  const selectedRole = ROLES.find(r => r.value === role);

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
      <AnimatePresence>
        {error && <Alert key="err" type="error" message={error} onClose={() => setError('')} />}
        {success && <Alert key="ok" type="success" message={success} onClose={() => setSuccess('')} />}
      </AnimatePresence>

      <div className="glass-card rounded-2xl p-6 lg:p-8" style={{ border: '1px solid var(--border-subtle)' }}>
        <h2 className="text-base font-bold mb-6" style={{ color: 'var(--text-primary)' }}>
          Create New User
        </h2>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Username" icon={UserIcon}
              type="text" required value={username}
              onChange={e => setUsername(e.target.value)}
              placeholder="john_doe" autoComplete="off" />
            <Field label="Email Address" icon={Mail}
              type="email" required value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="john@hospital.org" autoComplete="off" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Mobile Phone Number" icon={Smartphone}
              type="tel" value={phoneNumber}
              onChange={e => setPhoneNumber(e.target.value)}
              placeholder="+91 98765 43210" autoComplete="off" />
            <Field label="Temporary Password" icon={LockKeyhole}
              type={showPassword ? 'text' : 'password'}
              required value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••" autoComplete="new-password"
              rightEl={
                <button type="button" onClick={() => setShowPassword(v => !v)}
                  className="p-1 rounded hover:bg-white/10 transition-colors"
                  style={{ color: 'var(--text-disabled)' }}>
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              }
            />
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-semibold tracking-widest uppercase"
              style={{ color: 'var(--text-muted)' }}>System Role</label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {availableRoles.map(({ value, label, icon: Icon, description, accent }) => {
                const isSelected = role === value;
                return (
                  <button key={value} type="button" onClick={() => setRole(value)}
                    className="text-left p-4 rounded-xl border transition-all duration-200 relative overflow-hidden"
                    style={isSelected
                      ? { background: accent.bg, borderColor: accent.color + '66', boxShadow: `0 0 0 1px ${accent.glow}` }
                      : { background: 'var(--bg-surface)', borderColor: 'var(--border-default)' }
                    }
                  >
                    {isSelected && (
                      <span className="absolute top-2 right-2">
                        <ShieldCheck className="w-3.5 h-3.5" style={{ color: accent.color }} />
                      </span>
                    )}
                    <Icon className="w-4 h-4 mb-2" style={{ color: accent.color }} />
                    <p className="text-sm font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>{label}</p>
                    <p className="text-[11px] leading-relaxed" style={{ color: 'var(--text-muted)' }}>{description}</p>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="pt-2">
            <button type="submit" disabled={loading} className="btn-primary w-full py-3.5 gap-2">
              {loading
                ? <Loader2 className="w-4 h-4 animate-spin" />
                : <><UserPlus className="w-4 h-4" /><span>Create {selectedRole?.label} Account</span></>
              }
            </button>
          </div>
        </form>
      </div>

      <div className="mt-4 p-4 rounded-xl text-xs leading-relaxed"
        style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', color: 'var(--text-muted)' }}>
        {isAdmin
          ? <><strong style={{ color: 'var(--text-secondary)' }}>🔒 Admin:</strong> You can create accounts with any role. New users should change their password after first login.</>
          : <><strong style={{ color: 'var(--text-secondary)' }}>💊 Pharmacist:</strong> You can create <strong>Staff</strong> accounts only. Contact an Admin for higher-level accounts.</>
        }
      </div>
    </motion.div>
  );
};

/* ── User List (Manage) ──────────────────────────────────────── */
const UserList = ({ currentUser, onChangePassword }) => {
  const [users, setUsers] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [editTarget, setEditTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [toastMsg, setToastMsg] = useState('');
  const [toastType, setToastType] = useState('success');

  const toast = (msg, type = 'success') => {
    setToastMsg(msg); setToastType(type);
    setTimeout(() => setToastMsg(''), 4000);
  };

  const fetchUsers = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const res = await getUsers();
      setUsers(res.data);
    } catch {
      setError('Failed to load users.');
    }
    setLoading(false);
  }, []);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  useEffect(() => {
    const q = search.toLowerCase();
    setFiltered(
      users.filter(u =>
        u.username.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        (u.phoneNumber && u.phoneNumber.toLowerCase().includes(q)) ||
        u.role.toLowerCase().includes(q)
      )
    );
  }, [users, search]);

  const handleSaveEdit = (updated) => {
    setUsers(prev => prev.map(u => u.id === updated.id ? updated : u));
    setEditTarget(null);
    toast(`@${updated.username} updated successfully`);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      await deleteUser(deleteTarget.id);
      setUsers(prev => prev.filter(u => u.id !== deleteTarget.id));
      toast(`@${deleteTarget.username} deleted`);
      setDeleteTarget(null);
    } catch (err) {
      toast(err.response?.data || 'Failed to delete user.', 'error');
      setDeleteTarget(null);
    }
    setDeleteLoading(false);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  return (
    <>
      {/* Toast */}
      <AnimatePresence>
        {toastMsg && (
          <motion.div
            initial={{ opacity: 0, y: -20, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: -20, x: '-50%' }}
            className="fixed top-5 left-1/2 z-50 px-5 py-3 rounded-xl text-sm font-medium shadow-xl"
            style={toastType === 'error'
              ? { background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', color: '#f87171' }
              : { background: 'rgba(52,211,153,0.15)', border: '1px solid rgba(52,211,153,0.3)', color: '#34d399' }
            }
          >
            {toastMsg}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edit Modal */}
      <AnimatePresence>
        {editTarget && (
          <EditUserModal
            user={editTarget}
            onClose={() => setEditTarget(null)}
            onSave={handleSaveEdit}
            callerRole={currentUser.role}
          />
        )}
      </AnimatePresence>

      {/* Delete Modal */}
      <AnimatePresence>
        {deleteTarget && (
          <DeleteConfirmModal
            user={deleteTarget}
            onClose={() => setDeleteTarget(null)}
            onConfirm={handleDelete}
            loading={deleteLoading}
          />
        )}
      </AnimatePresence>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row gap-3 mb-5">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--text-disabled)' }} />
            <input
              value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search by username, email, phone or role…"
              className="glass-input w-full pl-10 pr-4 py-2.5 rounded-xl text-sm"
            />
          </div>
          <button onClick={fetchUsers}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium transition-colors hover:bg-white/5"
            style={{ borderColor: 'var(--border-default)', color: 'var(--text-muted)' }}>
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <button onClick={onChangePassword}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium transition-colors"
            style={{ borderColor: 'rgba(168,85,247,0.4)', color: '#c084fc', background: 'rgba(168,85,247,0.08)' }}>
            <KeyRound className="w-4 h-4" />
            Change My Password
          </button>
        </div>

        {error && (
          <div className="p-4 rounded-xl text-sm mb-4"
            style={{ background: 'rgba(239,68,68,0.07)', border: '1px solid rgba(239,68,68,0.22)', color: '#f87171' }}>
            {error}
          </div>
        )}

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-3 mb-5">
          {[
            { label: 'Total Users', value: users.length, color: 'sky' },
            { label: 'Admins', value: users.filter(u => u.role === 'ADMIN').length, color: 'purple' },
            { label: 'Staff', value: users.filter(u => u.role === 'STAFF').length, color: 'emerald' },
          ].map(({ label, value, color }) => (
            <div key={label} className="glass-card rounded-xl p-4 text-center"
              style={{ border: '1px solid var(--border-subtle)' }}>
              <p className="text-2xl font-extrabold" style={{
                color: color === 'sky' ? '#38bdf8' : color === 'purple' ? '#c084fc' : '#34d399'
              }}>{value}</p>
              <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{label}</p>
            </div>
          ))}
        </div>

        {/* Table */}
        <div className="glass-card rounded-2xl overflow-hidden" style={{ border: '1px solid var(--border-subtle)' }}>
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-6 h-6 animate-spin" style={{ color: 'var(--text-muted)' }} />
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-16" style={{ color: 'var(--text-muted)' }}>
              <UsersIcon className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p className="text-sm">{search ? 'No users match your search.' : 'No users found.'}</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-subtle)', background: 'rgba(255,255,255,0.02)' }}>
                    {['User', 'Role', 'Email', 'Phone Number', 'Joined', 'Actions'].map(h => (
                      <th key={h} className="px-5 py-3.5 text-left text-xs font-semibold tracking-widest uppercase whitespace-nowrap"
                        style={{ color: 'var(--text-muted)' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((u, idx) => {
                    const isSelf = u.username === currentUser.username;
                    return (
                      <motion.tr
                        key={u.id}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.04 }}
                        className="transition-colors hover:bg-white/[0.02]"
                        style={{ borderBottom: '1px solid var(--border-subtle)' }}
                      >
                        {/* User column */}
                        <td className="px-5 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0"
                              style={{
                                background: roleInfo[u.role]?.accent.bg ?? 'rgba(255,255,255,0.05)',
                                border: `1px solid ${roleInfo[u.role]?.accent.color ?? '#888'}44`,
                                color: roleInfo[u.role]?.accent.color ?? '#888',
                              }}>
                              {u.username[0].toUpperCase()}
                            </div>
                            <div>
                              <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                                @{u.username}
                              </p>
                              {isSelf && (
                                <span className="text-[10px] font-medium px-1.5 py-0.5 rounded"
                                  style={{ background: 'rgba(56,189,248,0.1)', color: '#38bdf8' }}>
                                  You
                                </span>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Role column */}
                        <td className="px-5 py-4 whitespace-nowrap">
                          <RolePill role={u.role} />
                        </td>

                        {/* Email column */}
                        <td className="px-5 py-4 whitespace-nowrap">
                          <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>{u.email}</span>
                        </td>

                        {/* Phone Number column */}
                        <td className="px-5 py-4 whitespace-nowrap min-w-[160px]">
                          {u.phoneNumber ? (
                            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-lg border text-xs font-mono font-semibold"
                              style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-default)', color: 'var(--text-primary)' }}>
                              <Smartphone className="w-3.5 h-3.5 text-sky-500 flex-shrink-0" />
                              <span className="tracking-wide">
                                {u.phoneNumber}
                              </span>
                            </div>
                          ) : (
                            <span className="text-xs italic" style={{ color: 'var(--text-disabled)' }}>Not registered</span>
                          )}
                        </td>

                        {/* Joined column */}
                        <td className="px-5 py-4 whitespace-nowrap min-w-[130px]">
                          <div className="flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5" style={{ color: 'var(--text-disabled)' }} />
                            <span className="text-sm" style={{ color: 'var(--text-muted)' }}>
                              {formatDate(u.createdAt)}
                            </span>
                          </div>
                        </td>

                        {/* Actions column */}
                        <td className="px-5 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => setEditTarget(u)}
                              title="Edit user"
                              className="p-2 rounded-lg border transition-all duration-200 hover:scale-105"
                              style={{ background: 'rgba(56,189,248,0.07)', borderColor: 'rgba(56,189,248,0.2)', color: '#38bdf8' }}
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            {!isSelf && (
                              <button
                                onClick={() => setDeleteTarget(u)}
                                title="Delete user"
                                className="p-2 rounded-lg border transition-all duration-200 hover:scale-105"
                                style={{ background: 'rgba(239,68,68,0.07)', borderColor: 'rgba(239,68,68,0.2)', color: '#f87171' }}
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </td>
                      </motion.tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Count footer */}
        {!loading && (
          <p className="mt-3 text-xs text-right" style={{ color: 'var(--text-muted)' }}>
            Showing {filtered.length} of {users.length} user{users.length !== 1 ? 's' : ''}
          </p>
        )}
      </motion.div>
    </>
  );
};

/* ── Main Page ───────────────────────────────────────────────── */
const Users = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';
  const [activeTab, setActiveTab] = useState(isAdmin ? 'manage' : 'create');
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const TABS = [
    ...(isAdmin ? [{ id: 'manage', label: 'Manage Users', icon: UsersIcon }] : []),
    { id: 'create', label: 'Create User', icon: UserPlus },
  ];

  return (
    <div className="flex h-screen overflow-hidden bg-grid">
      <Sidebar />

      <main className="flex-1 overflow-y-auto p-6 lg:p-8">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }} className="mb-6">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center border"
              style={{ background: 'rgba(168,85,247,0.1)', borderColor: 'rgba(168,85,247,0.25)' }}>
              <Shield className="w-4 h-4" style={{ color: '#c084fc' }} />
            </div>
            <div>
              <h1 className="text-xl font-extrabold tracking-tight" style={{ color: 'var(--text-primary)' }}>
                User Management
              </h1>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                {isAdmin
                  ? 'Admin · View, create, edit and delete user accounts'
                  : 'Pharmacist · Create Staff accounts'}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Tabs */}
        {TABS.length > 1 && (
          <div className="flex gap-1 mb-6 p-1 rounded-xl inline-flex"
            style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}>
            {TABS.map(({ id, label, icon: Icon }) => (
              <button key={id} onClick={() => setActiveTab(id)}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200"
                style={activeTab === id
                  ? { background: 'rgba(168,85,247,0.15)', color: '#c084fc', border: '1px solid rgba(168,85,247,0.3)' }
                  : { color: 'var(--text-muted)', border: '1px solid transparent' }
                }
              >
                <Icon className="w-4 h-4" />
                {label}
              </button>
            ))}
          </div>
        )}

        <div className="max-w-4xl">
          <AnimatePresence mode="wait">
            {activeTab === 'manage' && isAdmin ? (
              <UserList
                key={`list-${refreshKey}`}
                currentUser={user}
                onChangePassword={() => setShowChangePassword(true)}
              />
            ) : (
              <CreateUserForm
                key="create"
                isAdmin={isAdmin}
                onCreated={() => { setRefreshKey(k => k + 1); if (isAdmin) setActiveTab('manage'); }}
              />
            )}
          </AnimatePresence>
        </div>

        {/* Change Password Modal */}
        <AnimatePresence>
          {showChangePassword && (
            <ChangePasswordModal onClose={() => setShowChangePassword(false)} />
          )}
        </AnimatePresence>
      </main>
    </div>
  );
};

export default Users;
