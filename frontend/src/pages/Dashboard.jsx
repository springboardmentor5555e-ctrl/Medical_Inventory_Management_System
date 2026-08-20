import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import Layout from '../components/Layout';
import StatCard from '../components/StatCard';
import StatDetailModal from '../components/StatDetailModal';
import { getDashboardStats, getAnalytics } from '../services/api';
import { motion } from 'framer-motion';
import {
  Package, AlertTriangle, Calendar, Layers,
  Activity, ArrowRight, Tag, Truck,
  ShieldAlert, Search, Sun, Moon, Monitor, Check,
  ArrowUp, ArrowDown, BarChart2, DollarSign,
} from 'lucide-react';

/* ── helpers ─────────────────────────────────────────── */
function formatCurrency(val) {
  if (val == null) return '—';
  if (val >= 1_000_000) return `₹${(val / 1_000_000).toFixed(1)}M`;
  if (val >= 1_000)     return `₹${(val / 1_000).toFixed(1)}K`;
  return `₹${val.toFixed(0)}`;
}

/* ── Theme Panel ──────────────────────────────────────── */
const THEME_OPTIONS = [
  { value: 'dark',   label: 'Dark',   icon: Moon,    desc: 'Deep space interface',       accent: 'from-indigo-500 to-purple-600', bg: 'bg-indigo-500/10 border-indigo-500/20', iconColor: 'text-indigo-400' },
  { value: 'light',  label: 'Light',  icon: Sun,     desc: 'Clean, bright workspace',    accent: 'from-amber-400 to-orange-500',  bg: 'bg-amber-500/10 border-amber-500/20',  iconColor: 'text-amber-400' },
  { value: 'system', label: 'System', icon: Monitor, desc: 'Follows your OS preference', accent: 'from-sky-500 to-cyan-400',      bg: 'bg-sky-500/10 border-sky-500/20',      iconColor: 'text-sky-400' },
];

const ThemePanel = () => {
  const { theme, changeTheme } = useTheme();
  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="section-label">Appearance</h2>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {THEME_OPTIONS.map(({ value, label, icon: Icon, desc, bg, iconColor, accent }, i) => {
          const isActive = theme === value;
          return (
            <motion.button
              key={value}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              onClick={() => changeTheme(value)}
              className={`relative glass-card rounded-2xl p-4 text-left transition-all duration-300 overflow-hidden
                ${isActive
                  ? 'border-sky-500/35 shadow-lg shadow-sky-500/10'
                  : 'hover:border-[var(--border-input)] hover:-translate-y-0.5'
                }`}
              style={{ border: `1px solid ${isActive ? 'rgba(56,189,248,0.35)' : 'var(--border-subtle)'}` }}
            >
              {isActive && (
                <motion.div layoutId="theme-bar" className={`absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r ${accent}`} />
              )}
              <div className={`w-9 h-9 rounded-xl ${bg} border flex items-center justify-center mb-3`}>
                <Icon className={`w-4 h-4 ${iconColor}`} />
              </div>
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-bold text-[13.5px]" style={{ color: 'var(--text-primary)' }}>{label}</p>
                  <p className="text-[11px] mt-0.5" style={{ color: 'var(--text-muted)' }}>{desc}</p>
                </div>
                {isActive && (
                  <div className="w-5 h-5 rounded-full bg-sky-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Check className="w-2.5 h-2.5 text-white" />
                  </div>
                )}
              </div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
};

/* ── Mini Category Chart ─────────────────────────────── */
const CATEGORY_COLORS = ['#38bdf8','#818cf8','#34d399','#fb923c','#f472b6','#a78bfa'];

const MiniCategoryChart = ({ data, loading }) => {
  if (loading) {
    return (
      <div className="space-y-2.5">
        {[1,2,3,4].map((i) => (
          <div key={i} className="flex items-center gap-3">
            <div className="w-20 h-3 rounded animate-pulse" style={{ background: 'var(--border-subtle)' }} />
            <div className="flex-1 h-5 rounded-lg animate-pulse" style={{ background: 'var(--border-subtle)' }} />
          </div>
        ))}
      </div>
    );
  }
  if (!data || data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8">
        <Tag className="w-7 h-7 mb-2" style={{ color: 'var(--text-muted)' }} />
        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>No category data</p>
      </div>
    );
  }
  const top5 = data.slice(0, 5);
  const max  = Math.max(...top5.map((d) => d.count), 1);
  return (
    <div className="space-y-2">
      {top5.map((cat, i) => {
        const pct   = (cat.count / max) * 100;
        const color = CATEGORY_COLORS[i % CATEGORY_COLORS.length];
        return (
          <motion.div
            key={cat.categoryName}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 + i * 0.06 }}
            className="flex items-center gap-2.5"
          >
            <div className="w-[100px] flex-shrink-0 text-right">
              <span className="text-[11px] font-medium truncate block" style={{ color: 'var(--text-secondary)' }}>
                {cat.categoryName}
              </span>
            </div>
            <div className="flex-1 h-5 rounded-md overflow-hidden" style={{ background: 'var(--border-subtle)' }}>
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${pct}%` }}
                transition={{ delay: 0.35 + i * 0.06, duration: 0.55, ease: 'easeOut' }}
                className="h-full rounded-md flex items-center justify-end pr-2"
                style={{ background: `linear-gradient(90deg, ${color}44, ${color})`, minWidth: pct > 0 ? 20 : 0 }}
              >
                {pct > 30 && <span className="text-[9px] font-bold text-white">{cat.count}</span>}
              </motion.div>
            </div>
            <span className="text-[10px] font-bold w-5 text-right flex-shrink-0" style={{ color }}>{cat.count}</span>
          </motion.div>
        );
      })}
    </div>
  );
};

/* ── Mini Stock Movement Meter ───────────────────────── */
const MiniMovementMeter = ({ stockIn, stockOut, loading }) => {
  const total  = stockIn + stockOut;
  const inPct  = total > 0 ? Math.round((stockIn  / total) * 100) : 0;
  const outPct = total > 0 ? 100 - inPct : 0;

  if (loading) {
    return <div className="h-20 animate-pulse rounded-xl" style={{ background: 'var(--border-subtle)' }} />;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
            <ArrowUp className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div>
            <p className="text-[10px] font-semibold" style={{ color: 'var(--text-muted)' }}>Stock IN</p>
            <p className="text-base font-extrabold text-emerald-400">{stockIn.toLocaleString()}</p>
          </div>
        </div>
        <div className="text-center">
          <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Total</p>
          <p className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>{total.toLocaleString()}</p>
        </div>
        <div className="flex items-center gap-2 text-right">
          <div>
            <p className="text-[10px] font-semibold" style={{ color: 'var(--text-muted)' }}>Stock OUT</p>
            <p className="text-base font-extrabold text-rose-400">{stockOut.toLocaleString()}</p>
          </div>
          <div className="w-7 h-7 rounded-lg bg-rose-500/10 border border-rose-500/20 flex items-center justify-center">
            <ArrowDown className="w-3.5 h-3.5 text-rose-400" />
          </div>
        </div>
      </div>

      {total === 0 ? (
        <div className="h-3.5 rounded-full flex items-center justify-center" style={{ background: 'var(--border-subtle)', border: '1.5px dashed var(--border-default)' }}>
          <span className="text-[9px] font-semibold tracking-wide" style={{ color: 'var(--text-muted)' }}>
            NO MOVEMENTS YET
          </span>
        </div>
      ) : (
        <div>
          <div className="h-3.5 rounded-full overflow-hidden flex" style={{ background: 'var(--border-subtle)' }}>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${inPct}%` }}
              transition={{ duration: 0.8, ease: 'easeOut', delay: 0.3 }}
              className="h-full"
              style={{ background: 'linear-gradient(90deg, #10b981, #34d399)', borderRadius: '9999px 0 0 9999px' }}
            />
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${outPct}%` }}
              transition={{ duration: 0.8, ease: 'easeOut', delay: 0.3 }}
              className="h-full"
              style={{ background: 'linear-gradient(90deg, #fb7185, #f43f5e)', borderRadius: '0 9999px 9999px 0' }}
            />
          </div>
          <div className="flex justify-between mt-1">
            <span className="text-[10px] font-semibold text-emerald-400">{inPct}% IN</span>
            <span className="text-[10px] font-semibold text-rose-400">{outPct}% OUT</span>
          </div>
        </div>
      )}
    </div>
  );
};

/* ── Mini Critical Items List ────────────────────────── */
const MiniCriticalList = ({ items, loading, onNavigate }) => {
  if (loading) {
    return (
      <div className="space-y-2">
        {[1,2,3].map((i) => (
          <div key={i} className="flex items-center gap-3 p-2 rounded-xl animate-pulse" style={{ background: 'var(--border-subtle)' }}>
            <div className="w-8 h-8 rounded-lg flex-shrink-0" style={{ background: 'var(--border-default)' }} />
            <div className="flex-1 space-y-1.5">
              <div className="h-3 rounded w-2/3" style={{ background: 'var(--border-default)' }} />
              <div className="h-2 rounded w-1/3" style={{ background: 'var(--border-default)' }} />
            </div>
          </div>
        ))}
      </div>
    );
  }
  if (!items || items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-6 gap-2">
        <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
          <ShieldAlert className="w-5 h-5 text-emerald-400" />
        </div>
        <p className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>All stock levels healthy</p>
      </div>
    );
  }

  return (
    <div className="space-y-1.5">
      {items.slice(0, 4).map((item, i) => {
        const urgency = item.quantity === 0 ? 'empty' : item.quantity <= 3 ? 'critical' : 'low';
        const colors = {
          empty:    { bg: 'bg-red-500/10 border-red-500/20',     badge: 'bg-red-500/15 text-red-400',     bar: '#ef4444' },
          critical: { bg: 'bg-rose-500/10 border-rose-500/20',   badge: 'bg-rose-500/15 text-rose-400',   bar: '#f43f5e' },
          low:      { bg: 'bg-amber-500/10 border-amber-500/20', badge: 'bg-amber-500/15 text-amber-400', bar: '#f59e0b' },
        };
        const c = colors[urgency];
        const barPct = Math.min((item.quantity / 10) * 100, 100);
        return (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 + i * 0.05 }}
            onClick={onNavigate}
            className={`flex items-center gap-2.5 p-2 rounded-xl border cursor-pointer transition-all duration-150 hover:-translate-y-px ${c.bg}`}
          >
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${c.badge}`}>
              <span className="text-sm font-black">{item.quantity}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold truncate" style={{ color: 'var(--text-primary)' }}>{item.name}</p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <div className="flex-1 h-1 rounded-full" style={{ background: 'var(--border-subtle)' }}>
                  <div className="h-full rounded-full" style={{ width: `${barPct}%`, background: c.bar }} />
                </div>
                <span className="text-[9px]" style={{ color: 'var(--text-muted)' }}>{item.categoryName}</span>
              </div>
            </div>
            <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md flex-shrink-0 ${c.badge}`}>
              {urgency === 'empty' ? 'OUT' : urgency === 'critical' ? 'CRIT' : 'LOW'}
            </span>
          </motion.div>
        );
      })}
    </div>
  );
};

/* ── Dashboard ────────────────────────────────────────── */
const Dashboard = () => {
  const { user }    = useAuth();
  const navigate    = useNavigate();

  const [stats, setStats]               = useState(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [analytics, setAnalytics]       = useState(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(true);
  const [selectedStatModal, setSelectedStatModal] = useState(null);

  useEffect(() => {
    setStatsLoading(true);
    getDashboardStats(10, 90)
      .then((res) => setStats(res.data))
      .catch(() => setStats(null))
      .finally(() => setStatsLoading(false));

    setAnalyticsLoading(true);
    getAnalytics()
      .then((res) => setAnalytics(res.data))
      .catch(() => setAnalytics(null))
      .finally(() => setAnalyticsLoading(false));
  }, []);

  const roleCards = {
    ADMIN: [
      { label: 'Categories',    desc: 'Manage medicine categories and classifications.', icon: Tag,        color: 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400',  path: '/categories' },
      { label: 'Suppliers',     desc: 'Manage supplier contacts and partnerships.',      icon: Truck,      color: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400', path: '/suppliers' },
      { label: 'Inventory',     desc: 'Add, edit, and manage medicines across batches.', icon: Layers,     color: 'bg-purple-500/10 border-purple-500/20 text-purple-400',   path: '/inventory' },
      { label: 'Low Stock',     desc: 'View medicines running below threshold.',         icon: ShieldAlert,color: 'bg-amber-500/10 border-amber-500/20 text-amber-400',      path: '/inventory?filter=lowStock' },
      { label: 'Expiring Soon', desc: 'View medicines expiring within next 3 months (90 days).', icon: Calendar, color: 'bg-rose-500/10 border-rose-500/20 text-rose-400', path: '/inventory?filter=expiring' },
    ],
    PHARMACIST: [
      { label: 'Inventory',     desc: 'Manage stock levels and add new medicines.',      icon: Package,    color: 'bg-sky-500/10 border-sky-500/20 text-sky-400',            path: '/inventory' },
      { label: 'Low Stock',     desc: 'View medicines running below threshold.',         icon: ShieldAlert,color: 'bg-amber-500/10 border-amber-500/20 text-amber-400',      path: '/inventory?filter=lowStock' },
      { label: 'Expiring Soon', desc: 'View medicines expiring within next 3 months (90 days).', icon: Calendar, color: 'bg-rose-500/10 border-rose-500/20 text-rose-400', path: '/inventory?filter=expiring' },
      { label: 'Suppliers',     desc: 'View and manage supplier records.',               icon: Truck,      color: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400', path: '/suppliers' },
    ],
    STAFF: [
      { label: 'Browse Inventory', desc: 'Search medicines and check quantities.',   icon: Search,     color: 'bg-sky-500/10 border-sky-500/20 text-sky-400',       path: '/inventory' },
      { label: 'Low Stock',        desc: 'View medicines running below threshold.',  icon: ShieldAlert,color: 'bg-amber-500/10 border-amber-500/20 text-amber-400', path: '/inventory?filter=lowStock' },
      { label: 'Expiring Soon',    desc: 'View medicines expiring within next 3 months (90 days).', icon: Activity, color: 'bg-rose-500/10 border-rose-500/20 text-rose-400', path: '/inventory?filter=expiring' },
    ],
  };

  const quickActions = roleCards[user?.role] || roleCards.STAFF;
  const hour         = new Date().getHours();
  const greeting     = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  return (
    <Layout>
      <div className="p-6 lg:p-8 max-w-screen-xl mx-auto">

        {/* ── Hero Header ───────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl p-6 mb-8 relative overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, rgba(14,165,233,0.09) 0%, rgba(99,102,241,0.05) 100%)',
            border: '1px solid rgba(14,165,233,0.14)',
          }}
        >
          <div className="absolute right-0 top-0 w-72 h-72 rounded-full pointer-events-none"
            style={{ background: 'radial-gradient(circle, rgba(14,165,233,0.10), transparent 70%)', transform: 'translate(35%, -45%)' }} />

          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <p className="section-label mb-1.5">{greeting}</p>
              <h1 className="text-[22px] font-extrabold tracking-tight" style={{ color: 'var(--text-primary)' }}>
                {user?.username} <span className="text-sky-400">👋</span>
              </h1>
              <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
                Your MediStock workspace is ready. Here's what's happening today.
              </p>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              {/* Inventory value badge */}
              {!analyticsLoading && analytics?.totalInventoryValue != null && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2 }}
                  onClick={() => setSelectedStatModal({ statKey: 'inventoryValue', statValue: formatCurrency(analytics.totalInventoryValue) })}
                  className="flex items-center gap-1.5 text-xs font-semibold text-purple-400 bg-purple-500/10 border border-purple-500/20 px-3 py-1.5 rounded-full cursor-pointer hover:bg-purple-500/20 transition-all duration-200"
                >
                  <DollarSign className="w-3 h-3" />
                  {formatCurrency(analytics.totalInventoryValue)} value
                </motion.div>
              )}
              <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                System Online
              </div>
            </div>
          </div>
        </motion.div>

        {/* ── Live Statistics ────────────────────────────── */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="section-label">Live Statistics</h2>
            <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Updated just now</span>
          </div>

          {statsLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              {[0, 1, 2].map((i) => (
                <div key={i} className="glass-card rounded-2xl p-6 animate-pulse" style={{ border: '1px solid var(--border-subtle)' }}>
                  <div className="w-11 h-11 rounded-xl mb-5" style={{ background: 'var(--border-subtle)' }} />
                  <div className="h-9 w-14 rounded-lg mb-2" style={{ background: 'var(--border-subtle)' }} />
                  <div className="h-3 w-28 rounded" style={{ background: 'var(--border-subtle)' }} />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              <StatCard
                icon={Package}
                value={stats?.totalMedicines ?? '—'}
                label="Total Medicines"
                sublabel="Active inventory records"
                color="sky"
                delay={0}
                onClick={() => setSelectedStatModal({ statKey: 'totalMedicines', statValue: stats?.totalMedicines })}
              />
              <StatCard
                icon={AlertTriangle}
                value={stats?.lowStockCount ?? '—'}
                label="Low Stock Alerts"
                sublabel="Quantity at or below 10"
                color="amber"
                delay={0.08}
                onClick={() => setSelectedStatModal({ statKey: 'lowStockCount', statValue: stats?.lowStockCount })}
              />
              <StatCard
                icon={Calendar}
                value={stats?.expiringCount ?? '—'}
                label="Expiring Soon"
                sublabel="Within next 3 months (90 days)"
                color="rose"
                delay={0.16}
                onClick={() => setSelectedStatModal({ statKey: 'expiringCount', statValue: stats?.expiringCount })}
              />
            </div>
          )}
        </div>

        {/* ── Analytics Insights ────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="section-label">Analytics Insights</h2>
            <button
              onClick={() => navigate('/reports')}
              className="flex items-center gap-1 text-xs font-semibold transition-colors duration-150"
              style={{ color: '#38bdf8' }}
              onMouseEnter={(e) => { e.currentTarget.style.color = '#7dd3fc'; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = '#38bdf8'; }}
            >
              View full report
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

            {/* Category Breakdown */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="glass-card rounded-2xl p-5"
              style={{ border: '1px solid var(--border-subtle)' }}
            >
              <div className="flex items-center gap-2.5 mb-4">
                <div className="w-8 h-8 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center flex-shrink-0">
                  <Tag className="w-4 h-4 text-sky-400" />
                </div>
                <div>
                  <h3 className="text-[13px] font-bold" style={{ color: 'var(--text-primary)' }}>By Category</h3>
                  <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>Top 5 medicine categories</p>
                </div>
              </div>
              <MiniCategoryChart
                data={analytics?.categoryBreakdown || []}
                loading={analyticsLoading}
              />
            </motion.div>

            {/* Stock Movement */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.26 }}
              className="glass-card rounded-2xl p-5"
              style={{ border: '1px solid var(--border-subtle)' }}
            >
              <div className="flex items-center gap-2.5 mb-4">
                <div className="w-8 h-8 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center flex-shrink-0">
                  <Activity className="w-4 h-4 text-indigo-400" />
                </div>
                <div>
                  <h3 className="text-[13px] font-bold" style={{ color: 'var(--text-primary)' }}>Stock Movement</h3>
                  <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>Total IN vs OUT ratio</p>
                </div>
              </div>
              <MiniMovementMeter
                stockIn={analytics?.totalStockIn   ?? 0}
                stockOut={analytics?.totalStockOut ?? 0}
                loading={analyticsLoading}
              />
            </motion.div>

            {/* Critical Items */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.32 }}
              className="glass-card rounded-2xl p-5"
              style={{ border: '1px solid var(--border-subtle)' }}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center flex-shrink-0">
                    <ShieldAlert className="w-4 h-4 text-amber-400" />
                  </div>
                  <div>
                    <h3 className="text-[13px] font-bold" style={{ color: 'var(--text-primary)' }}>Critical Stock</h3>
                    <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>Needs immediate attention</p>
                  </div>
                </div>
                {!analyticsLoading && (analytics?.topLowStockItems?.length ?? 0) > 4 && (
                  <button
                    onClick={() => navigate('/inventory?filter=lowStock')}
                    className="text-[10px] font-semibold flex items-center gap-0.5 transition-colors"
                    style={{ color: 'var(--text-muted)' }}
                    onMouseEnter={(e) => { e.currentTarget.style.color = '#f59e0b'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-muted)'; }}
                  >
                    See all <ArrowRight className="w-2.5 h-2.5" />
                  </button>
                )}
              </div>
              <MiniCriticalList
                items={analytics?.topLowStockItems || []}
                loading={analyticsLoading}
                onNavigate={() => navigate('/inventory?filter=lowStock')}
              />
            </motion.div>

          </div>
        </motion.div>

        {/* ── Appearance / Theme ──────────────────────── */}
        <ThemePanel />

        {/* ── Quick Access ────────────────────────────── */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="section-label">Quick Access</h2>
            <span className="badge text-sky-400 bg-sky-500/10 border-sky-500/20">{user?.role}</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {quickActions.map((action, i) => (
              <motion.div
                key={action.label}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 + i * 0.07 }}
                onClick={() => navigate(action.path)}
                className="glass-card rounded-2xl p-5 cursor-pointer group transition-all duration-250 hover:-translate-y-0.5 hover-glow"
                style={{ border: '1px solid var(--border-subtle)' }}
              >
                <div className={`w-10 h-10 rounded-xl ${action.color} flex items-center justify-center border mb-4`}>
                  <action.icon className="w-[18px] h-[18px]" />
                </div>
                <h3 className="font-bold text-[13.5px] mb-1" style={{ color: 'var(--text-primary)' }}>
                  {action.label}
                </h3>
                <p className="text-xs leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                  {action.desc}
                </p>
                <div className="flex items-center gap-1 mt-4 text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>
                  Open
                  <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1 duration-200" />
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* ── Stat Detail Modal ───────────────────────── */}
        <StatDetailModal
          isOpen={!!selectedStatModal}
          statKey={selectedStatModal?.statKey}
          statValue={selectedStatModal?.statValue}
          onClose={() => setSelectedStatModal(null)}
        />

      </div>
    </Layout>
  );
};

export default Dashboard;
