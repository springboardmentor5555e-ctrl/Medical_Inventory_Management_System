import React, { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  X, Search, ArrowRight, Package, AlertTriangle, Calendar,
  ShieldAlert, Clock, ShoppingCart, CheckCircle2, DollarSign,
  Truck, Tag, Layers, ExternalLink, RefreshCw, ChevronRight, Hash, ArrowUpDown,
  Plus, Minus, Check, Loader2, Trash2, Zap, AlertCircle
} from 'lucide-react';
import {
  getMedicines, getLowStockMedicines, getExpiringMedicines,
  getExpiredMedicines, getPurchaseOrders, adjustStock,
  updatePurchaseOrderStatus
} from '../services/api';

/* ── Helpers ──────────────────────────────────────────────────────────── */
function formatCurrency(val) {
  if (val == null) return '—';
  return `₹${Number(val).toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;
}

function formatDate(dateStr) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric'
  });
}

function daysUntilExpiry(dateStr) {
  if (!dateStr) return 0;
  return Math.ceil((new Date(dateStr) - new Date()) / 86400000);
}

/* ── CONFIG BY STAT TYPE ──────────────────────────────────────────────── */
const STAT_CONFIG = {
  totalMedicines: {
    title: 'All Active Medicines',
    subtitle: 'Complete list of pharmaceutical products currently in stock and registered',
    icon: Package,
    color: 'text-sky-500 dark:text-sky-400',
    bg: 'bg-sky-500/15 border-sky-500/30',
    link: '/inventory',
    linkText: 'Open Full Inventory',
    entityType: 'medicines',
  },
  lowStockCount: {
    title: 'Low Stock Alerts',
    subtitle: 'Medicines with quantity at or below 10 units requiring restock',
    icon: ShieldAlert,
    color: 'text-amber-500 dark:text-amber-400',
    bg: 'bg-amber-500/15 border-amber-500/30',
    link: '/inventory?filter=lowStock',
    linkText: 'Manage Low Stock in Inventory',
    entityType: 'medicines',
  },
  expiringCount: {
    title: 'Expiring Soon (Next 3 Months / 90 Days)',
    subtitle: 'Medicines approaching their expiration date in the next 3 months',
    icon: Clock,
    color: 'text-rose-500 dark:text-rose-400',
    bg: 'bg-rose-500/15 border-rose-500/30',
    link: '/inventory?filter=expiring',
    linkText: 'Manage Expiring Stock in Inventory',
    entityType: 'medicines',
  },
  expiredCount: {
    title: 'Expired Medicines',
    subtitle: 'Medicines past their expiration date that must be quarantined or discarded',
    icon: AlertTriangle,
    color: 'text-red-500 dark:text-red-400',
    bg: 'bg-red-500/15 border-red-500/30',
    link: '/inventory?filter=expired',
    linkText: 'Remove Expired Stock in Inventory',
    entityType: 'medicines',
  },
  inventoryValue: {
    title: 'Inventory Valuation Breakdown',
    subtitle: 'Total stock value calculation across all categories and batches',
    icon: DollarSign,
    color: 'text-emerald-500 dark:text-emerald-400',
    bg: 'bg-emerald-500/15 border-emerald-500/30',
    link: '/inventory',
    linkText: 'View All Inventory Assets',
    entityType: 'medicines',
  },
  totalPurchaseOrders: {
    title: 'All Purchase Orders',
    subtitle: 'History and active procurement orders placed with suppliers',
    icon: ShoppingCart,
    color: 'text-sky-500 dark:text-sky-400',
    bg: 'bg-sky-500/15 border-sky-500/30',
    link: '/purchase-orders',
    linkText: 'Go to Purchase Orders',
    entityType: 'orders',
  },
  pendingOrders: {
    title: 'Pending Purchase Orders',
    subtitle: 'Orders awaiting shipment, delivery, or receipt from suppliers',
    icon: Clock,
    color: 'text-amber-500 dark:text-amber-400',
    bg: 'bg-amber-500/15 border-amber-500/30',
    link: '/purchase-orders?status=PENDING',
    linkText: 'Manage Pending Deliveries',
    entityType: 'orders',
  },
  receivedOrders: {
    title: 'Received Purchase Orders',
    subtitle: 'Completed purchase orders successfully added to warehouse stock',
    icon: CheckCircle2,
    color: 'text-emerald-500 dark:text-emerald-400',
    bg: 'bg-emerald-500/15 border-emerald-500/30',
    link: '/purchase-orders?status=RECEIVED',
    linkText: 'View Completed Orders',
    entityType: 'orders',
  },
  totalPurchaseSpend: {
    title: 'Purchase Spend Breakdown',
    subtitle: 'Financial valuation and expenditure on supplier purchase orders',
    icon: DollarSign,
    color: 'text-indigo-500 dark:text-indigo-400',
    bg: 'bg-indigo-500/15 border-indigo-500/30',
    link: '/purchase-orders',
    linkText: 'Review Purchase Orders & Spend',
    entityType: 'orders',
  },
};

const StatDetailModal = ({ statKey, statValue, isOpen, onClose }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const canWrite = ['ADMIN', 'PHARMACIST'].includes(user?.role);

  const config = STAT_CONFIG[statKey] || {
    title: 'Metric Details',
    subtitle: 'Detailed record breakdown',
    icon: Layers,
    color: 'text-sky-500 dark:text-sky-400',
    bg: 'bg-sky-500/15 border-sky-500/30',
    link: '/inventory',
    linkText: 'View in System',
    entityType: 'medicines',
  };

  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState([]);
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');
  const [toastMessage, setToastMessage] = useState('');

  // Inline action state
  const [activeActionMedId, setActiveActionMedId] = useState(null);
  const [actionType, setActionType] = useState('RESTOCK'); // RESTOCK | DISPOSE
  const [actionQty, setActionQty] = useState('');
  const [actionReason, setActionReason] = useState('');
  const [actionSubmitting, setActionSubmitting] = useState(false);

  const fetchData = async () => {
    if (!isOpen || !statKey) return;
    setLoading(true);
    setError('');
    setActiveActionMedId(null);
    try {
      if (statKey === 'totalMedicines' || statKey === 'inventoryValue') {
        const res = await getMedicines({ page: 0, size: 1000 });
        setItems(res.data?.content || []);
      } else if (statKey === 'lowStockCount') {
        const res = await getLowStockMedicines(10);
        setItems(res.data || []);
      } else if (statKey === 'expiringCount') {
        const res = await getExpiringMedicines(90);
        setItems(res.data || []);
      } else if (statKey === 'expiredCount') {
        const res = await getExpiredMedicines();
        setItems(res.data || []);
      } else if (statKey === 'totalPurchaseOrders' || statKey === 'totalPurchaseSpend') {
        const res = await getPurchaseOrders({ page: 0, size: 1000 });
        setItems(res.data?.content || []);
      } else if (statKey === 'pendingOrders') {
        const res = await getPurchaseOrders({ status: 'PENDING', page: 0, size: 1000 });
        setItems(res.data?.content || []);
      } else if (statKey === 'receivedOrders') {
        const res = await getPurchaseOrders({ status: 'RECEIVED', page: 0, size: 1000 });
        setItems(res.data?.content || []);
      } else {
        const res = await getMedicines({ page: 0, size: 1000 });
        setItems(res.data?.content || []);
      }
    } catch (err) {
      console.error('Failed to load metric details:', err);
      setError('Could not load detailed data for this metric.');
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [isOpen, statKey]);

  // Handle ESC key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Quick Restock or Disposal submit
  const handleQuickRestockSubmit = async (med) => {
    const qty = parseInt(actionQty, 10);
    if (!qty || qty <= 0) {
      alert('Please enter a valid positive quantity');
      return;
    }
    setActionSubmitting(true);
    try {
      const movementType = actionType === 'RESTOCK' ? 'IN' : 'OUT';
      const reason = actionReason || (actionType === 'RESTOCK' ? 'Quick manual restock' : 'Expired stock disposal');
      await adjustStock(med.id, {
        quantity: qty,
        movementType,
        reason,
      });
      setToastMessage(
        actionType === 'RESTOCK'
          ? `✓ Successfully added ${qty} units to ${med.name}`
          : `✓ Disposed ${qty} expired units of ${med.name}`
      );
      setTimeout(() => setToastMessage(''), 3000);
      setActiveActionMedId(null);
      fetchData();
    } catch (err) {
      console.error('Quick action failed:', err);
      alert(err.response?.data?.message || err.response?.data || 'Failed to update stock');
    } finally {
      setActionSubmitting(false);
    }
  };

  // Quick PO status change
  const handleOrderStatusChange = async (orderId, newStatus) => {
    try {
      await updatePurchaseOrderStatus(orderId, newStatus);
      setToastMessage(`✓ Purchase Order #${orderId} marked as ${newStatus}`);
      setTimeout(() => setToastMessage(''), 3000);
      fetchData();
    } catch (err) {
      console.error('Failed to update PO status:', err);
      alert('Failed to update order status');
    }
  };

  // Filter items by search
  const filteredItems = useMemo(() => {
    if (!search.trim()) return items;
    const q = search.toLowerCase();

    return items.filter((item) => {
      if (config.entityType === 'medicines') {
        return (
          (item.name || '').toLowerCase().includes(q) ||
          (item.batchNumber || '').toLowerCase().includes(q) ||
          (item.categoryName || '').toLowerCase().includes(q) ||
          (item.supplierName || '').toLowerCase().includes(q)
        );
      } else {
        // Purchase orders
        return (
          String(item.id).includes(q) ||
          (item.supplierName || '').toLowerCase().includes(q) ||
          (item.status || '').toLowerCase().includes(q) ||
          (item.items || []).some((li) => (li.medicineName || '').toLowerCase().includes(q))
        );
      }
    });
  }, [items, search, config.entityType]);

  if (!isOpen) return null;

  const Icon = config.icon;

  const modalContent = (
    <AnimatePresence>
      <div
        className="fixed inset-0 z-[99999] flex items-center justify-center p-3 sm:p-6"
        style={{
          backgroundColor: 'rgba(2, 6, 23, 0.75)',
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
        }}
        onClick={onClose}
      >
        {/* Modal Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 12 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          className="rounded-2xl w-full max-w-4xl max-h-[88vh] flex flex-col relative z-10 overflow-hidden shadow-2xl my-auto border border-[var(--border-default)]"
          style={{
            background: 'var(--bg-elevated)',
            color: 'var(--text-primary)',
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="p-5 sm:p-6 flex items-center justify-between border-b border-[var(--border-subtle)] bg-[var(--bg-surface)] flex-shrink-0">
            <div className="flex items-center gap-3.5 min-w-0">
              <div className={`w-11 h-11 rounded-xl border flex items-center justify-center flex-shrink-0 ${config.bg}`}>
                <Icon className={`w-5 h-5 ${config.color}`} />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2.5">
                  <h2 className="text-lg sm:text-xl font-extrabold truncate" style={{ color: 'var(--text-primary)' }}>
                    {config.title}
                  </h2>
                  {statValue !== undefined && statValue !== null && (
                    <span className={`text-xs font-black px-2.5 py-0.5 rounded-full border ${config.bg} ${config.color}`}>
                      {statValue}
                    </span>
                  )}
                </div>
                <p className="text-xs truncate mt-0.5" style={{ color: 'var(--text-muted)' }}>
                  {config.subtitle}
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-9 h-9 rounded-xl flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--border-subtle)] transition-all flex-shrink-0 ml-2"
              title="Close modal (Esc)"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Toast Notification Banner */}
          <AnimatePresence>
            {toastMessage && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-emerald-500/20 border-b border-emerald-500/30 text-emerald-600 dark:text-emerald-300 px-6 py-2 text-xs font-bold flex items-center gap-2"
              >
                <Check className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                <span>{toastMessage}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Search Bar & Count Summary */}
          <div className="px-5 sm:px-6 py-3 border-b border-[var(--border-subtle)] bg-[var(--bg-card)] flex items-center justify-between gap-4 flex-shrink-0">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={`Search by name, batch, category, supplier...`}
                className="w-full pl-9 pr-4 py-2 text-xs rounded-xl glass-input"
                autoFocus
              />
            </div>
            <div className="text-xs font-semibold text-[var(--text-secondary)] flex-shrink-0">
              Showing <strong className="text-sky-500 dark:text-sky-400 font-bold">{filteredItems.length}</strong> of {items.length} records
            </div>
          </div>

          {/* Modal Body / Items List */}
          <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-2.5 max-h-[58vh]">
            {loading ? (
              <div className="space-y-3 py-6">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="h-16 rounded-xl bg-[var(--border-subtle)] animate-pulse border border-[var(--border-default)]" />
                ))}
              </div>
            ) : error ? (
              <div className="p-8 text-center text-sm text-red-500 bg-red-950/20 border border-red-500/30 rounded-xl">
                <AlertTriangle className="w-8 h-8 mx-auto mb-2 opacity-90 text-red-500" />
                {error}
              </div>
            ) : filteredItems.length === 0 ? (
              <div className="py-16 text-center" style={{ color: 'var(--text-muted)' }}>
                <Package className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p className="text-base font-bold" style={{ color: 'var(--text-secondary)' }}>
                  No matching {config.entityType} found
                </p>
                <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                  {search ? 'Try adjusting your search terms' : 'There are currently no items in this record.'}
                </p>
              </div>
            ) : config.entityType === 'medicines' ? (
              /* Medicine items */
              <div className="space-y-3">
                {filteredItems.map((med, idx) => {
                  const days = daysUntilExpiry(med.expiryDate);
                  const isExpired = days <= 0;
                  const isLow = med.quantity <= 10;
                  const isOut = med.quantity === 0;
                  const isActionOpen = activeActionMedId === med.id;

                  return (
                    <motion.div
                      key={med.id || idx}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: Math.min(idx * 0.02, 0.3) }}
                      className={`rounded-xl border transition-all duration-150 overflow-hidden ${
                        isExpired
                          ? 'bg-[var(--bg-surface)] border-red-500/30'
                          : isOut
                          ? 'bg-[var(--bg-surface)] border-red-500/25'
                          : isLow
                          ? 'bg-[var(--bg-surface)] border-amber-500/25'
                          : 'bg-[var(--bg-surface)] border-[var(--border-default)] hover:border-sky-500/30'
                      }`}
                    >
                      <div className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        {/* Left: Quantity Badge + Name + Meta */}
                        <div className="flex items-center gap-3.5 min-w-0">
                          {/* Qty Badge */}
                          <div
                            className={`w-11 h-11 rounded-xl flex flex-col items-center justify-center flex-shrink-0 border font-bold ${
                              isOut
                                ? 'bg-red-500/20 text-red-500 border-red-500/30'
                                : isLow
                                ? 'bg-amber-500/20 text-amber-500 dark:text-amber-300 border-amber-500/30'
                                : 'bg-sky-500/20 text-sky-600 dark:text-sky-300 border-sky-500/30'
                            }`}
                          >
                            <span className="text-base font-black leading-none">{med.quantity}</span>
                            <span className="text-[9px] uppercase tracking-wider font-semibold opacity-80 mt-0.5">
                              {isOut ? 'OUT' : 'QTY'}
                            </span>
                          </div>

                          {/* Name & details */}
                          <div className="min-w-0">
                            <p className="text-sm sm:text-base font-bold truncate" style={{ color: 'var(--text-primary)' }}>
                              {med.name}
                            </p>
                            <div className="flex flex-wrap items-center gap-2 mt-1 text-xs" style={{ color: 'var(--text-secondary)' }}>
                              {med.categoryName && (
                                <span className="px-2 py-0.5 rounded-md font-semibold bg-[var(--bg-elevated)] text-indigo-600 dark:text-indigo-300 border border-[var(--border-default)]">
                                  {med.categoryName}
                                </span>
                              )}
                              <span style={{ color: 'var(--text-muted)' }}>
                                Batch: <strong className="font-mono" style={{ color: 'var(--text-secondary)' }}>{med.batchNumber || '—'}</strong>
                              </span>
                              {med.supplierName && (
                                <span style={{ color: 'var(--text-muted)' }}>
                                  · Supplier: <strong style={{ color: 'var(--text-secondary)' }}>{med.supplierName}</strong>
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Right: Price, Expiry & Quick Action Buttons */}
                        <div className="flex items-center justify-between sm:justify-end gap-3 flex-shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-[var(--border-subtle)]">
                          <div className="text-left sm:text-right">
                            <p className="text-sm font-extrabold text-emerald-600 dark:text-emerald-400">
                              {formatCurrency(med.price)}
                              <span className="text-xs font-normal ml-1" style={{ color: 'var(--text-muted)' }}>/ unit</span>
                            </p>
                            <p className="text-xs mt-0.5">
                              {isExpired ? (
                                <span className="inline-flex items-center gap-1 text-red-500 dark:text-red-400 font-bold">
                                  ⛔ Expired ({med.expiryDate})
                                </span>
                              ) : days <= 90 ? (
                                <span className="inline-flex items-center gap-1 text-rose-500 dark:text-rose-400 font-bold">
                                  ⏰ {days} days left
                                </span>
                              ) : (
                                <span className="font-medium" style={{ color: 'var(--text-muted)' }}>
                                  Exp: {med.expiryDate || '—'}
                                </span>
                              )}
                            </p>
                          </div>

                          {/* Quick Action Trigger Button */}
                          {canWrite && (
                            <div className="flex items-center gap-1.5 ml-2">
                              {isExpired ? (
                                <button
                                  type="button"
                                  onClick={() => {
                                    if (isActionOpen) {
                                      setActiveActionMedId(null);
                                    } else {
                                      setActiveActionMedId(med.id);
                                      setActionType('DISPOSE');
                                      setActionQty(String(med.quantity || 1));
                                      setActionReason('Expired stock quarantine disposal');
                                    }
                                  }}
                                  className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                                    isActionOpen
                                      ? 'bg-red-600 text-white'
                                      : 'bg-red-500/15 hover:bg-red-500/25 text-red-500 dark:text-red-300 border border-red-500/30'
                                  }`}
                                  title="Quarantine or dispose of expired medicine"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                  <span>{isActionOpen ? 'Cancel' : 'Dispose'}</span>
                                </button>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => {
                                    if (isActionOpen) {
                                      setActiveActionMedId(null);
                                    } else {
                                      setActiveActionMedId(med.id);
                                      setActionType('RESTOCK');
                                      setActionQty('50');
                                      setActionReason('Quick restock adjustment');
                                    }
                                  }}
                                  className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                                    isActionOpen
                                      ? 'bg-sky-600 text-white'
                                      : 'bg-sky-500/15 hover:bg-sky-500/25 text-sky-600 dark:text-sky-300 border border-sky-500/30'
                                  }`}
                                  title="Quickly add inventory units"
                                >
                                  <Zap className="w-3.5 h-3.5 text-amber-500" />
                                  <span>{isActionOpen ? 'Cancel' : '+ Restock'}</span>
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Expandable Inline Action Form */}
                      <AnimatePresence>
                        {isActionOpen && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="bg-[var(--bg-card)] border-t border-[var(--border-subtle)] p-3.5 sm:p-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3"
                          >
                            <div className="flex flex-wrap items-center gap-2.5 flex-1">
                              <span className="text-xs font-bold" style={{ color: 'var(--text-primary)' }}>
                                {actionType === 'DISPOSE' ? 'Disposal Quantity:' : 'Add Units:'}
                              </span>
                              <input
                                type="number"
                                min="1"
                                value={actionQty}
                                onChange={(e) => setActionQty(e.target.value)}
                                className="w-24 px-3 py-1.5 text-xs font-mono font-bold rounded-lg glass-input"
                                placeholder="Qty"
                                autoFocus
                              />
                              <div className="flex items-center gap-1">
                                {[20, 50, 100].map((preset) => (
                                  <button
                                    key={preset}
                                    type="button"
                                    onClick={() => setActionQty(String(preset))}
                                    className="px-2 py-1 text-[11px] font-semibold rounded bg-[var(--bg-elevated)] text-[var(--text-secondary)] hover:bg-[var(--border-subtle)] border border-[var(--border-default)]"
                                  >
                                    +{preset}
                                  </button>
                                ))}
                              </div>
                              <input
                                type="text"
                                value={actionReason}
                                onChange={(e) => setActionReason(e.target.value)}
                                placeholder="Reason note (optional)"
                                className="flex-1 min-w-[160px] px-3 py-1.5 text-xs rounded-lg glass-input"
                              />
                            </div>

                            <div className="flex items-center gap-2 self-end sm:self-auto">
                              <button
                                type="button"
                                onClick={() => setActiveActionMedId(null)}
                                className="px-3 py-1.5 text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)] rounded-lg"
                              >
                                Cancel
                              </button>
                              <button
                                type="button"
                                disabled={actionSubmitting}
                                onClick={() => handleQuickRestockSubmit(med)}
                                className={`px-4 py-1.5 text-xs font-bold rounded-lg flex items-center gap-1.5 text-white transition-all disabled:opacity-50 ${
                                  actionType === 'DISPOSE'
                                    ? 'bg-red-600 hover:bg-red-500'
                                    : 'bg-emerald-600 hover:bg-emerald-500'
                                }`}
                              >
                                {actionSubmitting ? (
                                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                ) : (
                                  <Check className="w-3.5 h-3.5" />
                                )}
                                <span>
                                  {actionType === 'DISPOSE' ? 'Confirm Disposal' : `Add +${actionQty || 0} Units`}
                                </span>
                              </button>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  );
                })}
              </div>
            ) : (
              /* Purchase Order items */
              <div className="space-y-3">
                {filteredItems.map((order, idx) => {
                  const statusColors = {
                    PENDING: 'bg-amber-500/15 border-amber-500/30 text-amber-600 dark:text-amber-300',
                    RECEIVED: 'bg-emerald-500/15 border-emerald-500/30 text-emerald-600 dark:text-emerald-300',
                    CANCELLED: 'bg-rose-500/15 border-rose-500/30 text-rose-600 dark:text-rose-300',
                  };
                  return (
                    <motion.div
                      key={order.id || idx}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: Math.min(idx * 0.02, 0.3) }}
                      className="p-4 rounded-xl border border-[var(--border-default)] bg-[var(--bg-surface)] flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-all duration-150 hover:border-sky-500/40"
                    >
                      <div className="flex items-center gap-3.5 min-w-0">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center font-mono font-black text-xs bg-[var(--bg-elevated)] text-sky-600 dark:text-sky-300 border border-[var(--border-default)]">
                          #{order.id}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm sm:text-base font-bold truncate" style={{ color: 'var(--text-primary)' }}>
                            {order.supplierName || 'Unknown Supplier'}
                          </p>
                          <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                            Ordered on <span style={{ color: 'var(--text-secondary)' }}>{formatDate(order.orderDate)}</span> · <span className="text-sky-600 dark:text-sky-300 font-semibold">{(order.items || []).length} item(s)</span>
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between sm:justify-end gap-3 flex-shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-[var(--border-subtle)]">
                        <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${statusColors[order.status] || statusColors.PENDING}`}>
                          {order.status}
                        </span>
                        <p className="text-base font-extrabold text-sky-600 dark:text-sky-400">
                          {formatCurrency(order.totalAmount)}
                        </p>

                        {/* Quick Status Actions for Pending Orders */}
                        {canWrite && order.status === 'PENDING' && (
                          <div className="flex items-center gap-1.5 ml-2">
                            <button
                              type="button"
                              onClick={() => handleOrderStatusChange(order.id, 'RECEIVED')}
                              className="px-2.5 py-1 text-xs font-bold rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-600 dark:text-emerald-300 border border-emerald-500/30 flex items-center gap-1"
                              title="Mark this purchase order as received and add items to inventory"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Receive</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => handleOrderStatusChange(order.id, 'CANCELLED')}
                              className="px-2.5 py-1 text-xs font-bold rounded-lg bg-rose-500/15 hover:bg-rose-500/25 text-rose-600 dark:text-rose-300 border border-rose-500/30 flex items-center gap-1"
                              title="Cancel order"
                            >
                              <X className="w-3.5 h-3.5" />
                              <span>Cancel</span>
                            </button>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer Action */}
          <div className="p-4 sm:p-5 border-t border-[var(--border-subtle)] bg-[var(--bg-surface)] flex flex-col sm:flex-row items-center justify-between gap-3 flex-shrink-0">
            <div className="text-xs text-center sm:text-left" style={{ color: 'var(--text-muted)' }}>
              Take direct actions above or navigate to the dedicated management page
            </div>
            <div className="flex items-center gap-2.5 w-full sm:w-auto">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold rounded-xl text-[var(--text-secondary)] hover:text-[var(--text-primary)] bg-[var(--bg-elevated)] hover:bg-[var(--border-subtle)] border border-[var(--border-default)] transition-colors flex-1 sm:flex-initial"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  navigate(config.link);
                }}
                className="btn-primary px-5 py-2 text-xs font-bold flex items-center justify-center gap-2 flex-1 sm:flex-initial shadow-lg shadow-sky-500/20"
              >
                <span>{config.linkText}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );

  return typeof document !== 'undefined' ? createPortal(modalContent, document.body) : modalContent;
};

export default StatDetailModal;
