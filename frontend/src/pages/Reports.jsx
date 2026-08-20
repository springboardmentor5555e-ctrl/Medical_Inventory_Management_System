import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Layout from '../components/Layout';
import {
  BarChart2, Package, AlertTriangle, Calendar, ShieldAlert,
  TrendingUp, TrendingDown, ArrowUpDown, RefreshCw,
  ChevronLeft, ChevronRight, Tag, Clock, Activity,
  ArrowUp, ArrowDown, ArrowRight, Database, DollarSign, Truck, FileDown, Loader2,
  ShoppingCart, CheckCircle2, FileSpreadsheet
} from 'lucide-react';
import { getAnalytics, getStockLogs, getExpiringMedicines } from '../services/api';
import { exportReportAsPDF } from '../utils/exportPdf';
import { exportStockLogsCSV } from '../utils/exportCsv';
import StatDetailModal from '../components/StatDetailModal';

/* ── helpers ────────────────────────────────────────────────────────────────── */

const daysUntilExpiry = (dateStr) =>
  Math.ceil((new Date(dateStr) - new Date()) / 86400000);

function timeAgo(dateStr) {
  const diff = Math.floor((Date.now() - new Date(dateStr)) / 1000);
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

function formatCurrency(val) {
  if (val == null) return '—';
  if (val >= 1_000_000) return `₹${(val / 1_000_000).toFixed(1)}M`;
  if (val >= 1_000)     return `₹${(val / 1_000).toFixed(1)}K`;
  return `₹${val.toFixed(0)}`;
}

function shortDate(dateStr) {
  // "2026-08-01" → "Aug 1"
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

/* ── StatCard ───────────────────────────────────────────────────────────────── */
const STAT_PALETTE = {
  sky:    { icon: 'text-sky-400',     bg: 'bg-sky-500/10 border-sky-500/20',     grad: 'from-sky-500 to-cyan-400',      glow: 'rgba(14,165,233,0.18)' },
  amber:  { icon: 'text-amber-400',   bg: 'bg-amber-500/10 border-amber-500/20',  grad: 'from-amber-500 to-orange-400',  glow: 'rgba(245,158,11,0.18)' },
  rose:   { icon: 'text-rose-400',    bg: 'bg-rose-500/10 border-rose-500/20',    grad: 'from-rose-500 to-pink-400',     glow: 'rgba(244,63,94,0.18)'  },
  red:    { icon: 'text-red-400',     bg: 'bg-red-500/10 border-red-500/20',      grad: 'from-red-500 to-rose-400',      glow: 'rgba(239,68,68,0.18)'  },
  emerald:{ icon: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20', grad: 'from-emerald-500 to-teal-400', glow: 'rgba(52,211,153,0.18)' },
  purple: { icon: 'text-purple-400',  bg: 'bg-purple-500/10 border-purple-500/20', grad: 'from-purple-500 to-indigo-400', glow: 'rgba(168,85,247,0.18)' },
};

const StatCard = ({ icon: Icon, value, label, sublabel, color = 'sky', delay = 0, onClick }) => {
  const p = STAT_PALETTE[color] || STAT_PALETTE.sky;
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => (e.key === 'Enter' || e.key === ' ') && onClick() : undefined}
      className={`glass-card rounded-2xl p-5 relative overflow-hidden transition-all duration-250 group ${
        onClick ? 'cursor-pointer hover:-translate-y-1 hover:shadow-xl hover:border-sky-500/30' : ''
      }`}
      style={{ border: '1px solid var(--border-subtle)' }}
    >
      <div
        className="absolute inset-0 pointer-events-none transition-opacity duration-300 opacity-60 group-hover:opacity-100"
        style={{ background: `radial-gradient(circle at top right, ${p.glow}, transparent 65%)` }}
      />
      <div className="flex items-start justify-between mb-4">
        <div className={`w-10 h-10 rounded-xl ${p.bg} border flex items-center justify-center`}>
          <Icon className={`w-5 h-5 ${p.icon}`} />
        </div>
        {onClick && (
          <span
            className="text-[10px] font-semibold px-2 py-0.5 rounded-full border transition-all duration-200 opacity-0 group-hover:opacity-100 flex items-center gap-1"
            style={{ background: 'var(--border-subtle)', borderColor: 'var(--border-default)', color: 'var(--text-muted)' }}
          >
            Details <ArrowRight className="w-2.5 h-2.5" />
          </span>
        )}
      </div>
      <p className="text-3xl font-extrabold tracking-tight" style={{ color: 'var(--text-primary)' }}>
        {value ?? '—'}
      </p>
      <p className="text-sm font-semibold mt-1" style={{ color: 'var(--text-secondary)' }}>{label}</p>
      {sublabel && (
        <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{sublabel}</p>
      )}
    </motion.div>
  );
};

/* ── Section Header ─────────────────────────────────────────────────────────── */
const SectionHeader = ({ icon: Icon, title, subtitle, delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, x: -8 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ delay }}
    className="flex items-center gap-3 mb-5"
  >
    <div className="w-8 h-8 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center flex-shrink-0">
      <Icon className="w-4 h-4 text-sky-400" />
    </div>
    <div>
      <h2 className="text-[15px] font-bold" style={{ color: 'var(--text-primary)' }}>{title}</h2>
      {subtitle && <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{subtitle}</p>}
    </div>
  </motion.div>
);

/* ── Category Bar Chart ─────────────────────────────────────────────────────── */
const CATEGORY_COLORS = [
  '#38bdf8', '#818cf8', '#34d399', '#fb923c', '#f472b6',
  '#a78bfa', '#22d3ee', '#facc15', '#4ade80', '#f87171',
];

const CategoryChart = ({ data, loading }) => {
  const max = data.length > 0 ? Math.max(...data.map((d) => d.count)) : 1;

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="flex items-center gap-3">
            <div className="w-24 h-3 rounded animate-pulse" style={{ background: 'var(--border-subtle)' }} />
            <div className="flex-1 h-6 rounded-lg animate-pulse" style={{ background: 'var(--border-subtle)', width: `${30 + i * 15}%` }} />
          </div>
        ))}
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-10">
        <Tag className="w-8 h-8 mb-2" style={{ color: 'var(--text-muted)' }} />
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>No category data available</p>
      </div>
    );
  }

  return (
    <div className="space-y-2.5">
      {data.map((cat, i) => {
        const pct = max > 0 ? (cat.count / max) * 100 : 0;
        const color = CATEGORY_COLORS[i % CATEGORY_COLORS.length];
        return (
          <motion.div
            key={cat.categoryName}
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.06 }}
            className="flex items-center gap-3 group"
          >
            <div className="w-[130px] flex-shrink-0 text-right">
              <span className="text-xs font-medium truncate block" style={{ color: 'var(--text-secondary)' }}>
                {cat.categoryName}
              </span>
            </div>
            <div className="flex-1 h-6 rounded-lg overflow-hidden relative" style={{ background: 'var(--border-subtle)' }}>
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${pct}%` }}
                transition={{ delay: i * 0.06 + 0.1, duration: 0.6, ease: 'easeOut' }}
                className="h-full rounded-lg flex items-center justify-end pr-2.5"
                style={{ background: `linear-gradient(90deg, ${color}33, ${color})`, minWidth: pct > 0 ? 24 : 0 }}
              >
                {pct > 20 && (
                  <span className="text-[10px] font-bold text-white">{cat.count}</span>
                )}
              </motion.div>
              {pct <= 20 && (
                <span className="absolute right-0 top-1/2 -translate-y-1/2 mr-[-28px] text-[10px] font-semibold"
                  style={{ color: 'var(--text-muted)' }}>
                  {cat.count}
                </span>
              )}
            </div>
            <div
              className="w-8 h-6 rounded-lg flex items-center justify-center text-[10px] font-bold flex-shrink-0"
              style={{ background: `${color}18`, color }}
            >
              {cat.count}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};

/* ── Stock Movement Meter ────────────────────────────────────────────────────── */
const StockMovementMeter = ({ stockIn, stockOut, loading }) => {
  const total = stockIn + stockOut;
  const inPct  = total > 0 ? Math.round((stockIn  / total) * 100) : 0;
  const outPct = total > 0 ? 100 - inPct : 0;

  if (loading) {
    return <div className="h-24 animate-pulse rounded-xl" style={{ background: 'var(--border-subtle)' }} />;
  }

  return (
    <div>
      {/* Counters row */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
            <ArrowUp className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div>
            <p className="text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>Stock IN</p>
            <p className="text-lg font-extrabold text-emerald-400">{stockIn.toLocaleString()}</p>
          </div>
        </div>
        <div className="text-center">
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Total Movements</p>
          <p className="text-base font-bold" style={{ color: 'var(--text-primary)' }}>{total.toLocaleString()}</p>
        </div>
        <div className="flex items-center gap-2 text-right">
          <div>
            <p className="text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>Stock OUT</p>
            <p className="text-lg font-extrabold text-rose-400">{stockOut.toLocaleString()}</p>
          </div>
          <div className="w-7 h-7 rounded-lg bg-rose-500/10 border border-rose-500/20 flex items-center justify-center">
            <ArrowDown className="w-3.5 h-3.5 text-rose-400" />
          </div>
        </div>
      </div>

      {/* Progress bar – neutral dashed when no data, real split otherwise */}
      {total === 0 ? (
        <div>
          <div
            className="h-4 rounded-full flex items-center justify-center"
            style={{ background: 'var(--border-subtle)', border: '1.5px dashed var(--border-default)' }}
          >
            <span className="text-[9px] font-semibold tracking-wide" style={{ color: 'var(--text-muted)' }}>
              NO MOVEMENTS RECORDED YET
            </span>
          </div>
          <div className="flex justify-center mt-1.5">
            <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
              Adjust stock in the Inventory page to see data here
            </span>
          </div>
        </div>
      ) : (
        <div>
          <div className="h-4 rounded-full overflow-hidden flex" style={{ background: 'var(--border-subtle)' }}>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${inPct}%` }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              className="h-full"
              style={{ background: 'linear-gradient(90deg, #10b981, #34d399)', borderRadius: '9999px 0 0 9999px' }}
            />
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${outPct}%` }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              className="h-full"
              style={{ background: 'linear-gradient(90deg, #fb7185, #f43f5e)', borderRadius: '0 9999px 9999px 0' }}
            />
          </div>
          <div className="flex justify-between mt-1.5">
            <span className="text-[10px] font-semibold text-emerald-400">{inPct}% IN</span>
            <span className="text-[10px] font-semibold text-rose-400">{outPct}% OUT</span>
          </div>
        </div>
      )}
    </div>
  );
};


/* ── 7-Day Sparkline Chart ───────────────────────────────────────────────────── */
const DailyTrendChart = ({ data, loading }) => {
  if (loading) {
    return <div className="h-32 animate-pulse rounded-xl" style={{ background: 'var(--border-subtle)' }} />;
  }

  if (!data || data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-10">
        <Activity className="w-8 h-8 mb-2" style={{ color: 'var(--text-muted)' }} />
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>No movement data for the last 7 days</p>
      </div>
    );
  }

  const maxVal = Math.max(...data.flatMap((d) => [d.stockIn, d.stockOut]), 1);
  const barW = 100 / (data.length * 2 + (data.length - 1));

  return (
    <div>
      {/* SVG Bar chart */}
      <svg viewBox="0 0 300 80" className="w-full" style={{ overflow: 'visible' }}>
        {data.map((day, i) => {
          const groupX = (i / data.length) * 300 + 4;
          const bw = (300 / data.length) * 0.38;
          const gap = bw * 0.3;
          const inH  = maxVal > 0 ? (day.stockIn  / maxVal) * 64 : 0;
          const outH = maxVal > 0 ? (day.stockOut / maxVal) * 64 : 0;

          return (
            <g key={day.date}>
              {/* IN bar */}
              <title>{`${shortDate(day.date)}: IN ${day.stockIn} / OUT ${day.stockOut}`}</title>
              <motion.rect
                x={groupX}
                y={80 - inH}
                width={bw}
                height={inH}
                rx="3"
                fill="url(#inGrad)"
                initial={{ height: 0, y: 80 }}
                animate={{ height: inH, y: 80 - inH }}
                transition={{ delay: i * 0.06, duration: 0.5, ease: 'easeOut' }}
              />
              {/* OUT bar */}
              <motion.rect
                x={groupX + bw + gap}
                y={80 - outH}
                width={bw}
                height={outH}
                rx="3"
                fill="url(#outGrad)"
                initial={{ height: 0, y: 80 }}
                animate={{ height: outH, y: 80 - outH }}
                transition={{ delay: i * 0.06 + 0.05, duration: 0.5, ease: 'easeOut' }}
              />
            </g>
          );
        })}
        <defs>
          <linearGradient id="inGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#34d399" />
            <stop offset="100%" stopColor="#10b981" stopOpacity="0.6" />
          </linearGradient>
          <linearGradient id="outGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#fb7185" />
            <stop offset="100%" stopColor="#f43f5e" stopOpacity="0.6" />
          </linearGradient>
        </defs>
      </svg>

      {/* X-axis labels */}
      <div className="flex justify-between mt-1">
        {data.map((day) => (
          <span key={day.date} className="text-[9px] font-medium" style={{ color: 'var(--text-muted)' }}>
            {shortDate(day.date)}
          </span>
        ))}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 mt-3">
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-sm" style={{ background: '#34d399' }} />
          <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Stock IN</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-sm" style={{ background: '#fb7185' }} />
          <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Stock OUT</span>
        </div>
      </div>
    </div>
  );
};

/* ── Supplier Breakdown ──────────────────────────────────────────────────────── */
const SUPPLIER_COLORS = [
  '#818cf8', '#22d3ee', '#f472b6', '#fb923c', '#a78bfa', '#facc15',
];

const SupplierChart = ({ data, loading }) => {
  const max = data.length > 0 ? Math.max(...data.map((d) => d.count)) : 1;

  if (loading) {
    return (
      <div className="space-y-2">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-center gap-2">
            <div className="w-20 h-3 rounded animate-pulse" style={{ background: 'var(--border-subtle)' }} />
            <div className="flex-1 h-5 rounded-lg animate-pulse" style={{ background: 'var(--border-subtle)' }} />
          </div>
        ))}
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-6">
        <Truck className="w-7 h-7 mb-2" style={{ color: 'var(--text-muted)' }} />
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>No supplier data</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {data.slice(0, 6).map((sup, i) => {
        const pct = max > 0 ? (sup.count / max) * 100 : 0;
        const color = SUPPLIER_COLORS[i % SUPPLIER_COLORS.length];
        return (
          <motion.div
            key={sup.supplierName}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.06 }}
            className="flex items-center gap-2"
          >
            <div className="w-[110px] flex-shrink-0 text-right">
              <span className="text-[11px] font-medium truncate block" style={{ color: 'var(--text-secondary)' }}>
                {sup.supplierName}
              </span>
            </div>
            <div className="flex-1 h-5 rounded-md overflow-hidden" style={{ background: 'var(--border-subtle)' }}>
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${pct}%` }}
                transition={{ delay: i * 0.06 + 0.1, duration: 0.5, ease: 'easeOut' }}
                className="h-full rounded-md flex items-center justify-end pr-2"
                style={{ background: `linear-gradient(90deg, ${color}44, ${color})`, minWidth: pct > 0 ? 20 : 0 }}
              >
                {pct > 25 && <span className="text-[9px] font-bold text-white">{sup.count}</span>}
              </motion.div>
            </div>
            <span className="text-[10px] font-bold w-5 text-right flex-shrink-0" style={{ color }}>{sup.count}</span>
          </motion.div>
        );
      })}
    </div>
  );
};

/* ── Top Low-Stock Items ─────────────────────────────────────────────────────── */
const TopLowStockList = ({ items, loading }) => {
  if (loading) {
    return (
      <div className="space-y-2">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="flex items-center gap-3 p-2.5 rounded-xl animate-pulse" style={{ background: 'var(--border-subtle)' }}>
            <div className="w-8 h-8 rounded-lg" style={{ background: 'var(--border-default)' }} />
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
      <div className="flex flex-col items-center justify-center py-8">
        <ShieldAlert className="w-8 h-8 mb-2" style={{ color: 'var(--text-muted)' }} />
        <p className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>All stock levels are healthy</p>
        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>No medicines below the threshold</p>
      </div>
    );
  }

  return (
    <div className="space-y-1.5">
      {items.map((item, i) => {
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
            transition={{ delay: i * 0.05 }}
            className={`flex items-center gap-3 p-2.5 rounded-xl border ${c.bg}`}
          >
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${c.badge}`}>
              <span className="text-sm font-black">{item.quantity}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate" style={{ color: 'var(--text-primary)' }}>
                {item.name}
              </p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <div className="flex-1 h-1.5 rounded-full" style={{ background: 'var(--border-subtle)' }}>
                  <div
                    className="h-full rounded-full transition-all"
                    style={{ width: `${barPct}%`, background: c.bar }}
                  />
                </div>
                <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{item.categoryName}</span>
              </div>
            </div>
            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${c.badge}`}>
              {urgency === 'empty' ? 'OUT' : 'LOW'}
            </span>
          </motion.div>
        );
      })}
    </div>
  );
};

/* ── Expiry Timeline ─────────────────────────────────────────────────────────── */
const ExpiryTimeline = ({ medicines, loading }) => {
  if (loading) {
    return (
      <div className="space-y-2">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="flex items-center gap-3 p-3 rounded-xl animate-pulse" style={{ background: 'var(--border-subtle)' }}>
            <div className="w-10 h-10 rounded-lg" style={{ background: 'var(--border-default)' }} />
            <div className="flex-1 space-y-1.5">
              <div className="h-3 rounded w-2/3" style={{ background: 'var(--border-default)' }} />
              <div className="h-2.5 rounded w-1/3" style={{ background: 'var(--border-default)' }} />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (medicines.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8">
        <Calendar className="w-8 h-8 mb-2" style={{ color: 'var(--text-muted)' }} />
        <p className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>No medicines expiring soon</p>
        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>All stock is well within expiry dates</p>
      </div>
    );
  }

  return (
    <div className="space-y-2 max-h-[320px] overflow-y-auto pr-1">
      {medicines.slice(0, 15).map((med, i) => {
        const days = daysUntilExpiry(med.expiryDate);
        const urgency = days <= 7 ? 'critical' : days <= 15 ? 'high' : 'medium';
        const colors = {
          critical: { bg: 'bg-red-500/10 border-red-500/20', text: 'text-red-400', badge: 'bg-red-500/15 text-red-400' },
          high:     { bg: 'bg-rose-500/10 border-rose-500/20', text: 'text-rose-400', badge: 'bg-rose-500/15 text-rose-400' },
          medium:   { bg: 'bg-amber-500/10 border-amber-500/20', text: 'text-amber-400', badge: 'bg-amber-500/15 text-amber-400' },
        };
        const c = colors[urgency];
        return (
          <motion.div
            key={med.id}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.04 }}
            className={`flex items-center gap-3 p-3 rounded-xl border ${c.bg}`}
          >
            <div className={`w-10 h-10 rounded-lg flex flex-col items-center justify-center flex-shrink-0 ${c.badge}`}>
              <span className={`text-[11px] font-black leading-none ${c.text}`}>{days}</span>
              <span className={`text-[8px] font-semibold ${c.text}`}>days</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate" style={{ color: 'var(--text-primary)' }}>
                {med.name}
              </p>
              <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
                Batch: {med.batchNumber} · Expires {med.expiryDate}
              </p>
            </div>
            <div className="text-right flex-shrink-0">
              <p className="text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>
                {med.quantity} units
              </p>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};

/* ── Stock Log Table ─────────────────────────────────────────────────────────── */
const StockLogTable = ({ logs, page, totalPages, totalElements, onPageChange, loading }) => {
  if (loading && logs.length === 0) {
    return (
      <div className="overflow-x-auto">
        <table className="w-full data-table">
          <thead>
            <tr>
              {['Medicine', 'Batch', 'Type', 'Qty', 'Reason', 'By', 'When'].map((h) => (
                <th key={h} className="text-left">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[1, 2, 3, 4, 5].map((i) => (
              <tr key={i}>
                {[1, 2, 3, 4, 5, 6, 7].map((j) => (
                  <td key={j} className="px-4 py-3.5">
                    <div className="h-4 rounded animate-pulse" style={{ background: 'var(--border-subtle)', width: j === 1 ? '80%' : '60%' }} />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  if (logs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <Database className="w-10 h-10 mb-3" style={{ color: 'var(--text-muted)' }} />
        <p className="font-semibold" style={{ color: 'var(--text-secondary)' }}>No stock adjustments yet</p>
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Stock movements will appear here after adjustments are made</p>
      </div>
    );
  }

  return (
    <>
      <div className="overflow-x-auto">
        <table className="w-full data-table">
          <thead>
            <tr>
              {['Medicine', 'Batch', 'Type', 'Qty', 'Reason', 'By', 'When'].map((h) => (
                <th key={h} className="text-left">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {logs.map((log, i) => (
              <motion.tr
                key={log.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.02 }}
              >
                <td className="px-4 py-3.5">
                  <span className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>
                    {log.medicineName}
                  </span>
                </td>
                <td className="px-4 py-3.5">
                  <span className="font-mono text-xs px-2 py-1 rounded-lg"
                    style={{ background: 'var(--border-subtle)', color: 'var(--text-secondary)' }}>
                    {log.batchNumber || '—'}
                  </span>
                </td>
                <td className="px-4 py-3.5">
                  <span className={`inline-flex items-center gap-1.5 badge font-semibold
                    ${log.movementType === 'IN'
                      ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/25'
                      : 'text-rose-400 bg-rose-500/10 border-rose-500/25'}`}>
                    {log.movementType === 'IN'
                      ? <ArrowUp className="w-3 h-3" />
                      : <ArrowDown className="w-3 h-3" />}
                    {log.movementType}
                  </span>
                </td>
                <td className="px-4 py-3.5">
                  <span className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>
                    {log.movementType === 'IN' ? '+' : '-'}{log.quantity}
                  </span>
                </td>
                <td className="px-4 py-3.5 max-w-[200px]">
                  <span className="text-sm truncate block" style={{ color: 'var(--text-secondary)' }}>
                    {log.reason || <span style={{ color: 'var(--text-muted)' }}>—</span>}
                  </span>
                </td>
                <td className="px-4 py-3.5">
                  <span className="text-xs font-medium px-2 py-1 rounded-lg"
                    style={{ background: 'var(--border-subtle)', color: 'var(--text-secondary)' }}>
                    {log.username}
                  </span>
                </td>
                <td className="px-4 py-3.5">
                  <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                    {timeAgo(log.timestamp)}
                  </span>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-5 py-3.5"
          style={{ borderTop: '1px solid var(--border-subtle)' }}>
          <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
            Page {page + 1} of {totalPages} · {totalElements} records
          </span>
          <div className="flex items-center gap-1.5">
            <button
              disabled={page === 0}
              onClick={() => onPageChange(page - 1)}
              className="btn-ghost p-2 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
              const p = Math.max(0, Math.min(page - 2, totalPages - 5)) + i;
              return (
                <button key={p} onClick={() => onPageChange(p)}
                  className={`w-8 h-8 rounded-lg text-xs font-semibold transition-all ${
                    p === page
                      ? 'bg-sky-500/20 text-sky-400 border border-sky-500/30'
                      : 'btn-ghost p-0'
                  }`}>
                  {p + 1}
                </button>
              );
            })}
            <button
              disabled={page >= totalPages - 1}
              onClick={() => onPageChange(page + 1)}
              className="btn-ghost p-2 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </>
  );
};

/* ── Reports Page ────────────────────────────────────────────────────────────── */
const Reports = () => {
  const [analytics, setAnalytics]           = useState(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(true);

  const [expiringMeds, setExpiringMeds]     = useState([]);
  const [expiryLoading, setExpiryLoading]   = useState(true);

  const [logs, setLogs]                     = useState([]);
  const [logsPage, setLogsPage]             = useState(0);
  const [logsTotalPages, setLogsTotalPages] = useState(0);
  const [logsTotalElements, setLogsTotalElements] = useState(0);
  const [logsLoading, setLogsLoading]       = useState(true);

  const [lastRefresh, setLastRefresh]       = useState(new Date());
  const [pdfExporting, setPdfExporting]     = useState(false);

  // Detail Modal state for clicked StatCards
  const [selectedStatModal, setSelectedStatModal] = useState(null);

  /* Fetch analytics */
  const loadAnalytics = useCallback(() => {
    setAnalyticsLoading(true);
    getAnalytics()
      .then((r) => setAnalytics(r.data))
      .catch(() => setAnalytics(null))
      .finally(() => setAnalyticsLoading(false));
  }, []);

  /* Fetch expiring medicines */
  const loadExpiring = useCallback(() => {
    setExpiryLoading(true);
    getExpiringMedicines(30)
      .then((r) => setExpiringMeds(r.data || []))
      .catch(() => setExpiringMeds([]))
      .finally(() => setExpiryLoading(false));
  }, []);

  /* Fetch stock logs */
  const loadLogs = useCallback(async (p = 0) => {
    setLogsLoading(true);
    try {
      const r = await getStockLogs(p, 15);
      setLogs(r.data.content || []);
      setLogsTotalPages(r.data.totalPages || 0);
      setLogsTotalElements(r.data.totalElements || 0);
    } catch {
      setLogs([]);
    } finally {
      setLogsLoading(false);
    }
  }, []);

  useEffect(() => { loadAnalytics(); loadExpiring(); }, [loadAnalytics, loadExpiring]);
  useEffect(() => { loadLogs(logsPage); }, [loadLogs, logsPage]);

  const handleRefresh = () => {
    loadAnalytics();
    loadExpiring();
    loadLogs(logsPage);
    setLastRefresh(new Date());
  };

  /* Export PDF – fetches all logs (up to 500) then builds the report */
  const handleExportPDF = async () => {
    if (pdfExporting) return;
    setPdfExporting(true);
    try {
      // Fetch complete logs (not just current page)
      const logsRes = await getStockLogs(0, 500);
      const allLogs = logsRes.data?.content || [];
      await exportReportAsPDF({
        analytics,
        expiringMeds,
        allLogs,
      });
    } catch (err) {
      console.error('PDF export failed:', err);
      alert('PDF export failed. Please try again.');
    } finally {
      setPdfExporting(false);
    }
  };

  /* Export Stock Logs as CSV */
  const handleExportCSV = async () => {
    try {
      const res = await getStockLogs(0, 1000);
      const allLogs = res.data?.content || [];
      exportStockLogsCSV(allLogs);
    } catch (err) {
      console.error('CSV export failed:', err);
      alert('Failed to export CSV.');
    }
  };

  const statsConfig = [
    { icon: Package,       key: 'totalMedicines',     label: 'Total Medicines',  sublabel: 'Active records',       color: 'sky',     delay: 0    },
    { icon: ShieldAlert,   key: 'lowStockCount',      label: 'Low Stock',        sublabel: 'Quantity ≤ 10 units',  color: 'amber',   delay: 0.07 },
    { icon: Clock,         key: 'expiringCount',      label: 'Expiring Soon',    sublabel: 'Within 3 months (90 days)', color: 'rose', delay: 0.14 },
    { icon: AlertTriangle, key: 'expiredCount',        label: 'Expired',          sublabel: 'Past expiry date',     color: 'red',     delay: 0.21 },
  ];

  // Inventory value (formatted) stat
  const inventoryValue = analyticsLoading ? null : formatCurrency(analytics?.totalInventoryValue ?? 0);

  return (
    <Layout>
      <div className="p-6 lg:p-8 max-w-screen-xl mx-auto">

        {/* ── Page Header ──────────────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-2xl bg-sky-500/12 border border-sky-500/20 flex items-center justify-center">
              <BarChart2 className="w-5 h-5 text-sky-400" />
            </div>
            <div>
              <h1 className="text-xl font-extrabold tracking-tight" style={{ color: 'var(--text-primary)' }}>
                Inventory Reports
              </h1>
              <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                Live analytics & audit trail · Last updated {lastRefresh.toLocaleTimeString()}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
            <button
              onClick={handleRefresh}
              className="btn-ghost flex items-center gap-2 text-sm py-2.5 px-3.5"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Refresh
            </button>
            <button
              onClick={handleExportCSV}
              className="btn-ghost flex items-center gap-2 text-sm py-2.5 px-3.5 border border-[var(--border-default)] hover:bg-[var(--border-subtle)]"
              title="Download Stock Movement Logs as CSV"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
              <span>Export CSV</span>
            </button>
            <button
              id="export-pdf-btn"
              onClick={handleExportPDF}
              disabled={pdfExporting || analyticsLoading}
              className="flex items-center gap-2 text-sm py-2.5 px-4 rounded-xl font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                background: pdfExporting ? 'rgba(14,165,233,0.12)' : 'linear-gradient(135deg, #0ea5e9, #6366f1)',
                color: '#fff',
                boxShadow: pdfExporting ? 'none' : '0 4px 14px rgba(14,165,233,0.35)',
              }}
            >
              {pdfExporting
                ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                : <FileDown className="w-3.5 h-3.5" />}
              {pdfExporting ? 'Generating PDF…' : 'Export PDF'}
            </button>
          </div>
        </motion.div>

        {/* ── Summary Stats ─────────────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          {statsConfig.map(({ icon, key, label, sublabel, color, delay }) => (
            <StatCard
              key={key}
              icon={icon}
              value={analyticsLoading ? null : (analytics?.[key] ?? 0)}
              label={label}
              sublabel={sublabel}
              color={color}
              delay={delay}
              onClick={() => setSelectedStatModal({ statKey: key, statValue: analytics?.[key] ?? 0 })}
            />
          ))}
          {/* Inventory Value card */}
          <StatCard
            icon={DollarSign}
            value={inventoryValue}
            label="Inventory Value"
            sublabel="Total stock worth"
            color="emerald"
            delay={0.28}
            onClick={() => setSelectedStatModal({ statKey: 'inventoryValue', statValue: inventoryValue })}
          />
        </div>

        {/* ── Purchase Orders Summary ────────────────────────────────────────────── */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="section-label">Purchase Orders Summary</h2>
          </div>
          
          {analyticsLoading ? (
             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
               {Array.from({ length: 4 }).map((_, i) => (
                 <div key={i} className="glass-card rounded-2xl p-6 h-28 animate-pulse" style={{ border: '1px solid var(--border-subtle)' }} />
               ))}
             </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              <StatCard
                icon={ShoppingCart}
                value={analytics?.totalPurchaseOrders || 0}
                label="Total Orders"
                sublabel="All time"
                color="sky"
                delay={0}
                onClick={() => setSelectedStatModal({ statKey: 'totalPurchaseOrders', statValue: analytics?.totalPurchaseOrders || 0 })}
              />
              <StatCard
                icon={Clock}
                value={analytics?.pendingOrders || 0}
                label="Pending Orders"
                sublabel="Awaiting delivery"
                color="amber"
                delay={0.05}
                onClick={() => setSelectedStatModal({ statKey: 'pendingOrders', statValue: analytics?.pendingOrders || 0 })}
              />
              <StatCard
                icon={CheckCircle2}
                value={analytics?.receivedOrders || 0}
                label="Received Orders"
                sublabel="Completed"
                color="emerald"
                delay={0.1}
                onClick={() => setSelectedStatModal({ statKey: 'receivedOrders', statValue: analytics?.receivedOrders || 0 })}
              />
              <StatCard
                icon={DollarSign}
                value={formatCurrency(analytics?.totalPurchaseSpend)}
                label="Total Spend"
                sublabel="Purchase value"
                color="purple"
                delay={0.15}
                onClick={() => setSelectedStatModal({ statKey: 'totalPurchaseSpend', statValue: formatCurrency(analytics?.totalPurchaseSpend) })}
              />
            </div>
          )}
        </div>

        {/* ── Row 2: Category Chart + 7-Day Trend ───────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-5 mb-5">

          {/* Category Breakdown (3/5) */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="lg:col-span-3 glass-card rounded-2xl p-6"
            style={{ border: '1px solid var(--border-subtle)' }}
          >
            <SectionHeader
              icon={Tag}
              title="Category Breakdown"
              subtitle="Medicine count per category (live)"
              delay={0.26}
            />
            <CategoryChart
              data={analytics?.categoryBreakdown || []}
              loading={analyticsLoading}
            />
          </motion.div>

          {/* 7-Day Movement Trend (2/5) */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="lg:col-span-2 glass-card rounded-2xl p-6"
            style={{ border: '1px solid var(--border-subtle)' }}
          >
            <SectionHeader
              icon={Activity}
              title="7-Day Movement Trend"
              subtitle="Daily stock IN vs OUT"
              delay={0.31}
            />
            <DailyTrendChart
              data={analytics?.dailyMovements || []}
              loading={analyticsLoading}
            />
          </motion.div>
        </div>

        {/* ── Row 3: Stock Movement + Supplier + Low-Stock ──────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-5">

          {/* Stock Movement */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.33 }}
            className="glass-card rounded-2xl p-6"
            style={{ border: '1px solid var(--border-subtle)' }}
          >
            <SectionHeader
              icon={ArrowUpDown}
              title="Stock Movements"
              subtitle="Total units IN vs OUT (all time)"
              delay={0.34}
            />
            <StockMovementMeter
              stockIn={analytics?.totalStockIn || 0}
              stockOut={analytics?.totalStockOut || 0}
              loading={analyticsLoading}
            />
            <div className="my-4" style={{ borderTop: '1px solid var(--border-subtle)' }} />
            <div className="space-y-3">
              {[
                { label: 'Net Stock Change', value: (analytics?.totalStockIn || 0) - (analytics?.totalStockOut || 0), icon: Activity },
              ].map(({ label, value, icon: Icon }) => {
                const isPositive = value >= 0;
                return (
                  <div key={label} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Icon className="w-3.5 h-3.5" style={{ color: 'var(--text-muted)' }} />
                      <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{label}</span>
                    </div>
                    <span className={`text-sm font-bold ${isPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {isPositive ? '+' : ''}{analyticsLoading ? '—' : value}
                    </span>
                  </div>
                );
              })}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Total Restocked</span>
                </div>
                <span className="text-sm font-bold text-emerald-400">
                  {analyticsLoading ? '—' : (analytics?.totalStockIn || 0).toLocaleString()}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <TrendingDown className="w-3.5 h-3.5 text-rose-400" />
                  <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Total Dispensed</span>
                </div>
                <span className="text-sm font-bold text-rose-400">
                  {analyticsLoading ? '—' : (analytics?.totalStockOut || 0).toLocaleString()}
                </span>
              </div>
            </div>
          </motion.div>

          {/* Supplier Breakdown */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.36 }}
            className="glass-card rounded-2xl p-6"
            style={{ border: '1px solid var(--border-subtle)' }}
          >
            <SectionHeader
              icon={Truck}
              title="Supplier Breakdown"
              subtitle="Medicine count per supplier"
              delay={0.37}
            />
            <SupplierChart
              data={analytics?.supplierBreakdown || []}
              loading={analyticsLoading}
            />
          </motion.div>

          {/* Top Low-Stock Items */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.39 }}
            className="glass-card rounded-2xl p-6"
            style={{ border: '1px solid var(--border-subtle)' }}
          >
            <SectionHeader
              icon={ShieldAlert}
              title="Critical Low-Stock"
              subtitle="Medicines with ≤10 units remaining"
              delay={0.40}
            />
            <TopLowStockList
              items={analytics?.topLowStockItems || []}
              loading={analyticsLoading}
            />
          </motion.div>
        </div>

        {/* ── Row 4: Expiry Timeline + Stock Audit Log ───────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">

          {/* Expiry Timeline (2/5) */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.42 }}
            className="lg:col-span-2 glass-card rounded-2xl p-6"
            style={{ border: '1px solid var(--border-subtle)' }}
          >
            <SectionHeader
              icon={Calendar}
              title="Expiry Timeline"
              subtitle="Medicines expiring within 30 days"
              delay={0.43}
            />
            <ExpiryTimeline medicines={expiringMeds} loading={expiryLoading} />
          </motion.div>

          {/* Stock Audit Log (3/5) */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45 }}
            className="lg:col-span-3 glass-card rounded-2xl overflow-hidden"
            style={{ border: '1px solid var(--border-subtle)' }}
          >
            <div className="px-6 pt-6 pb-0">
              <SectionHeader
                icon={ArrowUpDown}
                title="Stock Adjustment Log"
                subtitle={`${logsTotalElements} total stock movements`}
                delay={0.46}
              />
            </div>
            <StockLogTable
              logs={logs}
              page={logsPage}
              totalPages={logsTotalPages}
              totalElements={logsTotalElements}
              onPageChange={setLogsPage}
              loading={logsLoading}
            />
          </motion.div>
        </div>

        {/* ── Stat Detail Modal ──────────────────────────────────────────────────── */}
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

export default Reports;
