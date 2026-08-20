import React, { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/Layout';
import ConfirmDialog from '../components/ConfirmDialog';
import {
  getSuppliers, createSupplier, updateSupplier, deleteSupplier,
  getMedicines, createPurchaseOrder
} from '../services/api';
import {
  Truck, Plus, Edit2, Trash2, X, Loader2, RefreshCw, AlertTriangle,
  Phone, Mail, MapPin, Package, ShoppingCart, Tag,
  Check, ArrowRight, ShieldAlert, DollarSign, Layers, Zap, Minus, CheckCircle2
} from 'lucide-react';

/* ── Helpers ──────────────────────────────────────────────────────────── */
function formatCurrency(val) {
  if (val == null) return '—';
  return `₹${Number(val).toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;
}

/* ── Supplier Quick Order Modal ───────────────────────────────────────── */
const SupplierQuickOrderModal = ({ isOpen, onClose, supplier, allMedicines = [], initialItem = null }) => {
  const navigate = useNavigate();
  const [quantities, setQuantities] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const supplierMedicines = useMemo(() => {
    if (!supplier) return [];
    return allMedicines.filter((m) =>
      m.supplierId === supplier.id ||
      (m.supplierName && m.supplierName.toLowerCase() === supplier.name.toLowerCase())
    );
  }, [supplier, allMedicines]);

  useEffect(() => {
    if (isOpen && supplierMedicines.length > 0) {
      const initial = {};
      supplierMedicines.forEach((m) => {
        if (initialItem && initialItem.id === m.id) {
          initial[m.id] = 50;
        } else if ((m.quantity || 0) <= 10) {
          // Pre-fill low stock with recommended restock quantity
          initial[m.id] = Math.max(20, 50 - (m.quantity || 0));
        } else {
          initial[m.id] = 0;
        }
      });
      setQuantities(initial);
      setError('');
      setSuccess('');
    }
  }, [isOpen, supplierMedicines, initialItem]);

  const updateQty = (medId, delta) => {
    setQuantities((prev) => ({
      ...prev,
      [medId]: Math.max(0, (prev[medId] || 0) + delta),
    }));
  };

  const setQty = (medId, val) => {
    setQuantities((prev) => ({
      ...prev,
      [medId]: Math.max(0, parseInt(val) || 0),
    }));
  };

  const orderItems = useMemo(() => {
    return supplierMedicines
      .filter((m) => (quantities[m.id] || 0) > 0)
      .map((m) => ({
        medicineName: m.name,
        quantity: quantities[m.id],
        unitPrice: m.price || 0,
      }));
  }, [supplierMedicines, quantities]);

  const totalAmount = orderItems.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
  const totalUnits = orderItems.reduce((sum, item) => sum + item.quantity, 0);

  const handlePlaceOrder = async () => {
    if (orderItems.length === 0) {
      setError('Please specify a restock quantity (> 0) for at least one medicine');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      await createPurchaseOrder({
        supplierId: supplier.id,
        items: orderItems,
      });
      setSuccess(`✓ Purchase order placed for ${totalUnits} units (${formatCurrency(totalAmount)})!`);
      setTimeout(() => {
        onClose();
        navigate(`/purchase-orders?status=PENDING`);
      }, 1600);
    } catch (err) {
      const data = err.response?.data;
      setError(typeof data === 'string' ? data : (data?.message || err.message || 'Failed to place order'));
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen || !supplier) return null;

  const modalJSX = (
    <AnimatePresence>
      <div
        className="fixed inset-0 z-[99999] flex items-center justify-center p-3 sm:p-6"
        style={{ backgroundColor: 'rgba(2, 6, 23, 0.75)', backdropFilter: 'blur(10px)' }}
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 16 }}
          transition={{ duration: 0.2 }}
          className="rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl border border-[var(--border-default)]"
          style={{ background: 'var(--bg-elevated)', color: 'var(--text-primary)' }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="p-5 sm:p-6 flex items-center justify-between border-b border-[var(--border-subtle)] bg-[var(--bg-surface)] flex-shrink-0">
            <div className="flex items-center gap-3.5 min-w-0">
              <div className="w-11 h-11 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center flex-shrink-0">
                <Zap className="w-5 h-5 text-amber-400" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-bold truncate" style={{ color: 'var(--text-primary)' }}>
                    Quick Order — {supplier.name}
                  </h2>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-500 dark:text-amber-300 border border-amber-500/25">
                    Fast Restock
                  </span>
                </div>
                <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                  Select quantities and place order directly with {supplier.name}
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-9 h-9 rounded-xl flex items-center justify-center transition-colors flex-shrink-0 text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--border-subtle)]"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Feedback Banners */}
          {error && (
            <div className="m-4 p-3 rounded-xl bg-red-950/20 border border-red-500/30 text-red-500 dark:text-red-300 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}
          {success && (
            <div className="m-4 p-3 rounded-xl bg-emerald-950/20 border border-emerald-500/30 text-emerald-600 dark:text-emerald-300 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
              <span>{success}</span>
            </div>
          )}

          {/* Medicines Quantities List */}
          <div className="p-5 overflow-y-auto flex-1 space-y-3 max-h-[50vh]">
            {supplierMedicines.length === 0 ? (
              <div className="py-12 text-center" style={{ color: 'var(--text-muted)' }}>
                <Package className="w-10 h-10 mx-auto mb-2 opacity-50" />
                <p className="text-sm font-semibold" style={{ color: 'var(--text-secondary)' }}>No medicines in this supplier's catalogue yet</p>
                <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                  Assign products to this supplier in Inventory or use the Full Order page.
                </p>
              </div>
            ) : (
              supplierMedicines.map((med) => {
                const qty = quantities[med.id] || 0;
                const isLow = (med.quantity || 0) <= 10;
                const isOut = med.quantity === 0;
                const itemTotal = qty * (med.price || 0);

                return (
                  <div
                    key={med.id}
                    className={`p-3.5 rounded-xl border transition-all ${
                      qty > 0
                        ? 'border-sky-500/40 bg-sky-500/5'
                        : 'border-[var(--border-subtle)] bg-[var(--bg-surface)] hover:border-[var(--border-default)]'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      {/* Medicine info */}
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-bold truncate" style={{ color: 'var(--text-primary)' }}>{med.name}</p>
                          {isOut ? (
                            <span className="px-1.5 py-0.2 rounded text-[10px] font-extrabold bg-red-500/15 text-red-500 border border-red-500/30">
                              OUT OF STOCK
                            </span>
                          ) : isLow ? (
                            <span className="px-1.5 py-0.2 rounded text-[10px] font-extrabold bg-amber-500/15 text-amber-500 dark:text-amber-300 border border-amber-500/30">
                              LOW ({med.quantity} left)
                            </span>
                          ) : (
                            <span className="text-[11px]" style={{ color: 'var(--text-muted)' }}>({med.quantity} in stock)</span>
                          )}
                        </div>
                        <div className="flex items-center gap-3 mt-1 text-xs" style={{ color: 'var(--text-muted)' }}>
                          <span>Unit Price: <strong className="text-emerald-500 dark:text-emerald-400">{formatCurrency(med.price)}</strong></span>
                          <span>•</span>
                          <span>Category: <strong style={{ color: 'var(--text-secondary)' }}>{med.categoryName || 'General'}</strong></span>
                        </div>
                      </div>

                      {/* Quantity Stepper & Presets */}
                      <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap justify-between sm:justify-end">
                        {/* Preset Chips */}
                        <div className="flex items-center gap-1">
                          {[20, 50, 100].map((preset) => (
                            <button
                              key={preset}
                              type="button"
                              onClick={() => setQty(med.id, preset)}
                              className={`text-[10px] font-bold px-2 py-1 rounded-md transition-colors ${
                                qty === preset
                                  ? 'bg-sky-500 text-white shadow-sm'
                                  : 'bg-[var(--bg-elevated)] text-[var(--text-secondary)] hover:bg-[var(--border-subtle)] border border-[var(--border-default)]'
                              }`}
                            >
                              +{preset}
                            </button>
                          ))}
                        </div>

                        {/* Increment / Decrement Counter */}
                        <div className="flex items-center border border-[var(--border-default)] rounded-lg overflow-hidden bg-[var(--bg-elevated)]">
                          <button
                            type="button"
                            onClick={() => updateQty(med.id, -10)}
                            disabled={qty <= 0}
                            className="p-1.5 text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--border-subtle)] disabled:opacity-30 transition-colors"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <input
                            type="number"
                            min="0"
                            value={qty}
                            onChange={(e) => setQty(med.id, e.target.value)}
                            className="w-14 text-center text-xs font-bold bg-transparent outline-none"
                            style={{ color: 'var(--text-primary)' }}
                          />
                          <button
                            type="button"
                            onClick={() => updateQty(med.id, 10)}
                            className="p-1.5 text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--border-subtle)] transition-colors"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Subtotal if qty > 0 */}
                    {qty > 0 && (
                      <div className="mt-2 pt-2 border-t border-[var(--border-subtle)] flex items-center justify-between text-xs">
                        <span style={{ color: 'var(--text-muted)' }}>Subtotal for {qty} units:</span>
                        <span className="font-bold text-sky-500 dark:text-sky-400">{formatCurrency(itemTotal)}</span>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* Footer Order Summary & Place Button */}
          <div className="p-4 sm:p-5 border-t border-[var(--border-subtle)] bg-[var(--bg-surface)] flex flex-col sm:flex-row sm:items-center justify-between gap-3 flex-shrink-0">
            <div>
              <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Total Purchase Order:</span>
              <div className="flex items-baseline gap-2">
                <span className="text-lg font-extrabold text-emerald-500 dark:text-emerald-400">
                  {formatCurrency(totalAmount)}
                </span>
                <span className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>
                  ({totalUnits} units across {orderItems.length} products)
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={onClose}
                disabled={submitting}
                className="px-4 py-2 text-xs font-semibold rounded-xl text-[var(--text-secondary)] hover:text-[var(--text-primary)] bg-[var(--bg-elevated)] hover:bg-[var(--border-subtle)] border border-[var(--border-default)] transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handlePlaceOrder}
                disabled={submitting || orderItems.length === 0}
                className="btn-primary px-5 py-2.5 text-xs font-bold flex items-center gap-2 shadow-lg shadow-sky-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Zap className="w-4 h-4 text-amber-300" />
                )}
                <span>{submitting ? 'Placing Order…' : 'Submit Quick Order'}</span>
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );

  return typeof document !== 'undefined' ? createPortal(modalJSX, document.body) : modalJSX;
};

/* ── Supplier Catalogue Modal ─────────────────────────────────────────── */
const SupplierCatalogueModal = ({ isOpen, onClose, supplier, allMedicines = [], onQuickOrderClick }) => {
  const [search, setSearch] = useState('');

  const supplierMedicines = useMemo(() => {
    if (!supplier) return [];
    return allMedicines.filter((m) =>
      m.supplierId === supplier.id ||
      (m.supplierName && m.supplierName.toLowerCase() === supplier.name.toLowerCase())
    );
  }, [supplier, allMedicines]);

  const filtered = useMemo(() => {
    if (!search.trim()) return supplierMedicines;
    const q = search.toLowerCase();
    return supplierMedicines.filter((m) =>
      (m.name || '').toLowerCase().includes(q) ||
      (m.batchNumber || '').toLowerCase().includes(q) ||
      (m.categoryName || '').toLowerCase().includes(q)
    );
  }, [supplierMedicines, search]);

  const totalValue = supplierMedicines.reduce((sum, m) => sum + ((m.quantity || 0) * (m.price || 0)), 0);
  const lowStockCount = supplierMedicines.filter((m) => (m.quantity || 0) <= 10).length;

  if (!isOpen || !supplier) return null;

  const modalJSX = (
    <AnimatePresence>
      <div
        className="fixed inset-0 z-[99999] flex items-center justify-center p-3 sm:p-6"
        style={{ backgroundColor: 'rgba(2, 6, 23, 0.75)', backdropFilter: 'blur(10px)' }}
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 16 }}
          transition={{ duration: 0.2 }}
          className="rounded-2xl w-full max-w-3xl max-h-[85vh] flex flex-col overflow-hidden shadow-2xl border border-[var(--border-default)]"
          style={{ background: 'var(--bg-elevated)', color: 'var(--text-primary)' }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="p-5 sm:p-6 flex items-center justify-between border-b border-[var(--border-subtle)] bg-[var(--bg-surface)] flex-shrink-0">
            <div className="flex items-center gap-3.5 min-w-0">
              <div className="w-11 h-11 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center flex-shrink-0">
                <Truck className="w-5 h-5 text-emerald-500 dark:text-emerald-400" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-bold truncate" style={{ color: 'var(--text-primary)' }}>
                    {supplier.name}
                  </h2>
                  <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-300 border border-emerald-500/25">
                    {supplierMedicines.length} Products
                  </span>
                </div>
                <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                  Medicines purchased and supplied by {supplier.name}
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-9 h-9 rounded-xl flex items-center justify-center transition-colors flex-shrink-0 text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--border-subtle)]"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Quick Summary Metrics */}
          <div className="grid grid-cols-3 gap-3 p-4 border-b border-[var(--border-subtle)] bg-[var(--bg-surface)] flex-shrink-0">
            <div className="px-3 py-2 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-default)]">
              <span className="text-[10px] font-semibold uppercase" style={{ color: 'var(--text-muted)' }}>Total Items</span>
              <p className="text-base font-extrabold" style={{ color: 'var(--text-primary)' }}>{supplierMedicines.length}</p>
            </div>
            <div className="px-3 py-2 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-default)]">
              <span className="text-[10px] font-semibold uppercase" style={{ color: 'var(--text-muted)' }}>Inventory Value</span>
              <p className="text-base font-extrabold text-emerald-500 dark:text-emerald-400">{formatCurrency(totalValue)}</p>
            </div>
            <div className="px-3 py-2 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-default)]">
              <span className="text-[10px] font-semibold uppercase" style={{ color: 'var(--text-muted)' }}>Low Stock Items</span>
              <p className="text-base font-extrabold text-amber-500 dark:text-amber-400">{lowStockCount}</p>
            </div>
          </div>

          {/* Search bar */}
          <div className="px-5 py-2.5 border-b border-[var(--border-subtle)] bg-[var(--bg-card)] flex items-center justify-between gap-3 flex-shrink-0">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search products in this catalogue..."
              className="w-full max-w-sm px-3.5 py-1.5 text-xs rounded-xl glass-input"
            />
            <span className="text-xs flex-shrink-0" style={{ color: 'var(--text-muted)' }}>
              Showing <strong>{filtered.length}</strong> items
            </span>
          </div>

          {/* List */}
          <div className="p-5 overflow-y-auto flex-1 space-y-2.5 max-h-[50vh]">
            {filtered.length === 0 ? (
              <div className="py-12 text-center" style={{ color: 'var(--text-muted)' }}>
                <Package className="w-10 h-10 mx-auto mb-2 opacity-50" />
                <p className="text-sm font-semibold" style={{ color: 'var(--text-secondary)' }}>No medicines associated with this supplier yet</p>
                <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                  Medicines can be linked to this supplier during creation or in the inventory editor.
                </p>
              </div>
            ) : (
              filtered.map((med) => {
                const isLow = (med.quantity || 0) <= 10;
                const isOut = med.quantity === 0;

                return (
                  <div
                    key={med.id}
                    className="p-3.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-[var(--border-default)] transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={`w-9 h-9 rounded-lg flex items-center justify-center font-bold text-xs flex-shrink-0 border ${
                          isOut
                            ? 'bg-red-500/15 text-red-500 border-red-500/30'
                            : isLow
                            ? 'bg-amber-500/15 text-amber-500 dark:text-amber-300 border-amber-500/30'
                            : 'bg-sky-500/15 text-sky-500 dark:text-sky-300 border-sky-500/30'
                        }`}
                      >
                        {med.quantity}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-bold truncate" style={{ color: 'var(--text-primary)' }}>{med.name}</p>
                        <div className="flex flex-wrap items-center gap-2 mt-0.5 text-xs" style={{ color: 'var(--text-muted)' }}>
                          {med.categoryName && (
                            <span className="px-1.5 py-0.5 rounded font-medium bg-[var(--bg-elevated)] text-sky-600 dark:text-sky-300 text-[10px] border border-[var(--border-default)]">
                              {med.categoryName}
                            </span>
                          )}
                          <span>Batch: <strong className="font-mono" style={{ color: 'var(--text-secondary)' }}>{med.batchNumber || '—'}</strong></span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-3 flex-shrink-0">
                      <div className="text-left sm:text-right">
                        <p className="text-sm font-bold text-emerald-500 dark:text-emerald-400">{formatCurrency(med.price)}</p>
                        <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Exp: {med.expiryDate || '—'}</p>
                      </div>

                      {/* Quick Reorder button for this specific medicine */}
                      <button
                        type="button"
                        onClick={() => {
                          onClose();
                          if (onQuickOrderClick) onQuickOrderClick(supplier, med);
                        }}
                        className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-amber-500/15 hover:bg-amber-500/25 text-amber-600 dark:text-amber-300 border border-amber-500/30 flex items-center gap-1 transition-colors"
                        title={`Quick reorder ${med.name}`}
                      >
                        <Zap className="w-3 h-3 text-amber-500" />
                        <span>Quick Reorder</span>
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer CTA */}
          <div className="p-4 sm:p-5 border-t border-[var(--border-subtle)] bg-[var(--bg-surface)] flex items-center justify-between gap-3 flex-shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold rounded-xl text-[var(--text-secondary)] hover:text-[var(--text-primary)] bg-[var(--bg-elevated)] hover:bg-[var(--border-subtle)] border border-[var(--border-default)] transition-colors"
            >
              Close
            </button>
            <button
              type="button"
              onClick={() => {
                onClose();
                if (onQuickOrderClick) onQuickOrderClick(supplier);
              }}
              className="btn-primary px-4 py-2 text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-sky-500/20"
            >
              <Zap className="w-3.5 h-3.5 text-amber-300" />
              <span>Open Quick Order for this Supplier</span>
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );

  return typeof document !== 'undefined' ? createPortal(modalJSX, document.body) : modalJSX;
};

/* ── Supplier Form Modal ──────────────────────────────────────────────── */
const SupplierFormModal = ({ isOpen, onClose, onSubmit, initialData = null }) => {
  const [form, setForm] = useState({ name: '', contactNumber: '', email: '', address: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      setForm({
        name: initialData?.name || '',
        contactNumber: initialData?.contactNumber || '',
        email: initialData?.email || '',
        address: initialData?.address || '',
      });
      setError('');
    }
  }, [isOpen, initialData]);

  const handleChange = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await onSubmit(form);
      onClose();
    } catch (err) {
      const data = err.response?.data;
      const errorMsg = typeof data === 'string' ? data : (data?.message || err.message || 'An error occurred');
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const inputClass = 'glass-input w-full px-3 py-2.5 rounded-xl text-sm outline-none';
  const labelClass = 'block text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-1.5';

  if (!isOpen) return null;

  const modalJSX = (
    <AnimatePresence>
      <div
        className="fixed inset-0 z-[99999] flex items-center justify-center p-4"
        style={{ backgroundColor: 'rgba(2, 6, 23, 0.75)', backdropFilter: 'blur(8px)' }}
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: 20 }}
          transition={{ duration: 0.2 }}
          className="rounded-2xl w-full max-w-md border border-[var(--border-default)] overflow-hidden shadow-2xl"
          style={{ background: 'var(--bg-elevated)', color: 'var(--text-primary)' }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border-subtle)] bg-[var(--bg-surface)]">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/15 flex items-center justify-center border border-emerald-500/25">
                <Truck className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
              </div>
              <h2 className="font-bold" style={{ color: 'var(--text-primary)' }}>{initialData ? 'Edit Supplier' : 'New Supplier'}</h2>
            </div>
            <button onClick={onClose} className="text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
            {error && (
              <div className="text-red-500 bg-red-950/20 border border-red-500/30 p-3 rounded-xl text-xs">{error}</div>
            )}
            <div>
              <label className={labelClass}>Supplier Name *</label>
              <input name="name" value={form.name} onChange={handleChange}
                placeholder="e.g. MediPharm Ltd." required className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Contact Number *</label>
              <input name="contactNumber" value={form.contactNumber} onChange={handleChange}
                placeholder="+91 9876543210" required className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Email *</label>
              <input type="email" name="email" value={form.email} onChange={handleChange}
                placeholder="contact@supplier.com" required className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Address *</label>
              <textarea name="address" value={form.address} onChange={handleChange}
                placeholder="Supplier warehouse or office address..." required rows={2} className={`${inputClass} resize-none`} />
            </div>

            <div className="flex gap-3 pt-2">
              <button type="button" onClick={onClose} className="btn-ghost flex-1 py-2.5 text-sm">Cancel</button>
              <button type="submit" disabled={loading} className="btn-primary flex-1 py-2.5 text-sm flex items-center justify-center gap-2">
                {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                {initialData ? 'Update Supplier' : 'Add Supplier'}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );

  return typeof document !== 'undefined' ? createPortal(modalJSX, document.body) : modalJSX;
};

/* ── MAIN SUPPLIERS PAGE ──────────────────────────────────────────────── */
const Suppliers = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const canWrite = user?.role === 'ADMIN' || user?.role === 'PHARMACIST';
  const canDelete = user?.role === 'ADMIN';

  const [suppliers, setSuppliers] = useState([]);
  const [allMedicines, setAllMedicines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formModal, setFormModal] = useState({ open: false, data: null });
  const [catalogueSupplier, setCatalogueSupplier] = useState(null);
  const [quickOrderState, setQuickOrderState] = useState({ open: false, supplier: null, item: null });
  const [deleteDialog, setDeleteDialog] = useState(null);
  const [error, setError] = useState('');

  const fetchSuppliersAndMedicines = async () => {
    setLoading(true);
    try {
      const [suppRes, medsRes] = await Promise.all([
        getSuppliers(),
        getMedicines({ page: 0, size: 1000 }),
      ]);
      setSuppliers(suppRes.data || []);
      setAllMedicines(medsRes.data?.content || []);
    } catch {
      setSuppliers([]);
      setAllMedicines([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSuppliersAndMedicines();
  }, []);

  const handleSubmit = async (data) => {
    if (formModal.data) {
      await updateSupplier(formModal.data.id, data);
    } else {
      await createSupplier(data);
    }
    fetchSuppliersAndMedicines();
  };

  const handleDelete = async () => {
    try {
      await deleteSupplier(deleteDialog.id);
      setDeleteDialog(null);
      fetchSuppliersAndMedicines();
    } catch (err) {
      setError(err.response?.data || 'Delete failed');
      setDeleteDialog(null);
    }
  };

  // Group medicines by supplier ID
  const medicinesBySupplier = useMemo(() => {
    const map = {};
    for (const m of allMedicines) {
      if (m.supplierId) {
        if (!map[m.supplierId]) map[m.supplierId] = [];
        map[m.supplierId].push(m);
      }
    }
    return map;
  }, [allMedicines]);

  return (
    <Layout>
      <div className="p-6 lg:p-8 max-w-6xl mx-auto">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/15 flex items-center justify-center border border-emerald-500/25">
                <Truck className="w-5 h-5 text-emerald-500 dark:text-emerald-400" />
              </div>
              <h1 className="text-2xl font-extrabold tracking-tight" style={{ color: 'var(--text-primary)' }}>
                Suppliers & Catalogues
              </h1>
            </div>
            <p className="text-sm ml-13" style={{ color: 'var(--text-muted)' }}>
              {suppliers.length} registered pharmaceutical vendor{suppliers.length !== 1 ? 's' : ''}
            </p>
          </div>
          {canWrite && (
            <button onClick={() => setFormModal({ open: true, data: null })}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white text-sm font-semibold shadow-lg shadow-emerald-500/20 transition-all self-start sm:self-auto">
              <Plus className="w-4 h-4" />
              Add Supplier
            </button>
          )}
        </motion.div>

        {error && (
          <div className="mb-4 text-red-500 bg-red-950/20 border border-red-500/30 p-3.5 rounded-xl text-sm flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
            <button onClick={() => setError('')} className="ml-auto text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)]">Dismiss</button>
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-20 gap-2" style={{ color: 'var(--text-muted)' }}>
            <RefreshCw className="w-4 h-4 animate-spin text-emerald-400" /> Loading suppliers and product catalogues...
          </div>
        ) : suppliers.length === 0 ? (
          <div className="glass-card rounded-2xl border border-[var(--border-default)] p-16 text-center">
            <Truck className="w-12 h-12 mx-auto mb-3 opacity-50" style={{ color: 'var(--text-muted)' }} />
            <p className="font-semibold" style={{ color: 'var(--text-secondary)' }}>No suppliers registered yet</p>
            {canWrite && (
              <button onClick={() => setFormModal({ open: true, data: null })}
                className="mt-3 text-emerald-500 hover:text-emerald-400 text-xs font-medium">
                + Register your first supplier
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {suppliers.map((sup, i) => {
              const suppliedMeds = medicinesBySupplier[sup.id] || [];
              const productCount = suppliedMeds.length;
              const hasLowStock = suppliedMeds.some((m) => (m.quantity || 0) <= 10);

              return (
                <motion.div
                  key={sup.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="glass-card rounded-2xl p-5 border border-[var(--border-default)] hover:border-emerald-500/40 transition-all duration-200 group flex flex-col justify-between"
                >
                  <div>
                    {/* Title + Action Icons */}
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 flex-shrink-0">
                          <Truck className="w-4.5 h-4.5 text-emerald-500 dark:text-emerald-400" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-bold text-base" style={{ color: 'var(--text-primary)' }}>{sup.name}</h3>
                            {hasLowStock && (
                              <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-600 dark:text-amber-300 border border-amber-500/30">
                                REORDER NEEDED
                              </span>
                            )}
                          </div>
                          <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                            {productCount} {productCount === 1 ? 'Medicine' : 'Medicines'} in Catalogue
                          </span>
                        </div>
                      </div>

                      <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                        {canWrite && (
                          <button onClick={() => setFormModal({ open: true, data: sup })}
                            className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-sky-500 hover:bg-sky-500/10 transition-all"
                            title="Edit Supplier">
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                        {canDelete && (
                          <button onClick={() => setDeleteDialog(sup)}
                            className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-red-500 hover:bg-red-500/10 transition-all"
                            title="Delete Supplier">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Contact Details */}
                    <div className="space-y-1.5 py-2 px-1 text-xs" style={{ color: 'var(--text-secondary)' }}>
                      <div className="flex items-center gap-2">
                        <Phone className="w-3.5 h-3.5 opacity-60 flex-shrink-0" />
                        <span>{sup.contactNumber}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Mail className="w-3.5 h-3.5 opacity-60 flex-shrink-0" />
                        <span className="truncate">{sup.email}</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <MapPin className="w-3.5 h-3.5 opacity-60 flex-shrink-0 mt-0.5" />
                        <span className="line-clamp-1" style={{ color: 'var(--text-muted)' }}>{sup.address}</span>
                      </div>
                    </div>

                    {/* Product Pills Preview */}
                    <div className="mt-3 pt-3 border-t border-[var(--border-subtle)]">
                      <span className="text-[10px] uppercase font-bold tracking-wider block mb-1.5" style={{ color: 'var(--text-muted)' }}>
                        Supplied Products:
                      </span>
                      {productCount > 0 ? (
                        <div className="flex flex-wrap gap-1.5">
                          {suppliedMeds.slice(0, 3).map((m) => (
                            <span
                              key={m.id}
                              className="px-2 py-0.5 rounded-md text-[11px] font-semibold bg-[var(--bg-surface)] text-sky-600 dark:text-sky-300 border border-[var(--border-default)]"
                            >
                              {m.name}
                            </span>
                          ))}
                          {productCount > 3 && (
                            <span className="px-1.5 py-0.5 rounded-md text-[10px] font-bold bg-[var(--bg-surface)] text-[var(--text-muted)] border border-[var(--border-default)]">
                              +{productCount - 3} more
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-xs italic" style={{ color: 'var(--text-muted)' }}>No products assigned yet</span>
                      )}
                    </div>
                  </div>

                  {/* Card Bottom Actions */}
                  <div className="flex items-center justify-between gap-2 mt-4 pt-3 border-t border-[var(--border-subtle)]">
                    <button
                      type="button"
                      onClick={() => setCatalogueSupplier(sup)}
                      className="text-xs font-semibold text-sky-600 dark:text-sky-400 hover:text-sky-700 dark:hover:text-sky-300 flex items-center gap-1 py-1.5 px-2.5 rounded-lg hover:bg-sky-500/10 transition-colors"
                    >
                      <Layers className="w-3.5 h-3.5" />
                      <span>View Catalogue ({productCount})</span>
                    </button>

                    {canWrite && (
                      <div className="flex items-center gap-2">
                        {/* Direct 1-Click Quick Order Modal Button */}
                        <button
                          type="button"
                          onClick={() => setQuickOrderState({ open: true, supplier: sup, item: null })}
                          className="text-xs font-bold px-3 py-1.5 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 text-amber-600 dark:text-amber-300 border border-amber-500/30 flex items-center gap-1.5 transition-all shadow-sm"
                          title="Open Quick Order Drawer to specify quantities and reorder in 1 click"
                        >
                          <Zap className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400" />
                          <span>Quick Order</span>
                        </button>

                        {/* Full PO Page Flow */}
                        <button
                          type="button"
                          onClick={() => navigate(`/purchase-orders?supplier=${sup.id}`)}
                          className="text-xs font-semibold px-2.5 py-1.5 rounded-lg bg-[var(--bg-surface)] hover:bg-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-[var(--border-default)] flex items-center gap-1 transition-all"
                          title="Open full Purchase Order form"
                        >
                          <ShoppingCart className="w-3 h-3 opacity-70" />
                          <span>Full PO</span>
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

      {/* Supplier Form Modal */}
      <SupplierFormModal
        isOpen={formModal.open}
        onClose={() => setFormModal({ open: false, data: null })}
        onSubmit={handleSubmit}
        initialData={formModal.data}
      />

      {/* Supplier Catalogue Modal */}
      <SupplierCatalogueModal
        isOpen={!!catalogueSupplier}
        supplier={catalogueSupplier}
        allMedicines={allMedicines}
        onClose={() => setCatalogueSupplier(null)}
        onQuickOrderClick={(sup, med) => setQuickOrderState({ open: true, supplier: sup, item: med || null })}
      />

      {/* Supplier Quick Order Modal */}
      <SupplierQuickOrderModal
        isOpen={quickOrderState.open}
        supplier={quickOrderState.supplier}
        initialItem={quickOrderState.item}
        allMedicines={allMedicines}
        onClose={() => setQuickOrderState({ open: false, supplier: null, item: null })}
      />

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deleteDialog}
        title="Delete Supplier"
        message={`Delete supplier "${deleteDialog?.name}"? Medicines linked to this supplier will lose their association.`}
        confirmLabel="Delete"
        onConfirm={handleDelete}
        onCancel={() => setDeleteDialog(null)}
      />
    </Layout>
  );
};

export default Suppliers;
