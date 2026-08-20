import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useLocation, useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import MedicineModal from '../components/MedicineModal';
import StockAdjustModal from '../components/StockAdjustModal';
import ConfirmDialog from '../components/ConfirmDialog';
import {
  getMedicines, createMedicine, updateMedicine,
  deleteMedicine, adjustStock, getCategories,
  getLowStockMedicines, getExpiringMedicines, getExpiredMedicines
} from '../services/api';
import {
  Package, Plus, Search, Filter, Edit2, Trash2,
  ArrowUpDown, RefreshCw, AlertTriangle, Calendar,
  ChevronLeft, ChevronRight, X, LayoutList, ShieldAlert, Clock, FileSpreadsheet, Loader2
} from 'lucide-react';
import { exportMedicinesCSV } from '../utils/exportCsv';

const LOW_STOCK  = 10;
const EXPIRY_DAYS = 90; // 3 months (90 days)

const daysUntilExpiry = (dateStr) =>
  Math.ceil((new Date(dateStr) - new Date()) / 86400000);

const QuantityBadge = ({ qty }) => {
  if (qty === 0) return (
    <span className="badge text-red-400 bg-red-500/10 border-red-500/25">Out of stock</span>
  );
  if (qty <= LOW_STOCK) return (
    <span className="badge text-amber-400 bg-amber-500/10 border-amber-500/25">Low stock</span>
  );
  return null;
};

const ExpiryBadge = ({ dateStr }) => {
  if (!dateStr) return null;
  const days = daysUntilExpiry(dateStr);
  if (days <= 0) return (
    <span className="badge text-red-400 bg-red-500/10 border-red-500/25">Expired</span>
  );
  if (days <= EXPIRY_DAYS) return (
    <span className="badge text-rose-400 bg-rose-500/10 border-rose-500/25">{days}d left</span>
  );
  return null;
};

const Skeleton = () => (
  <tr>
    {Array.from({ length: 8 }).map((_, i) => (
      <td key={i} className="px-4 py-3.5">
        <div className="h-4 rounded-lg animate-pulse" style={{ background: 'var(--border-subtle)', width: i === 0 ? '80%' : '60%' }} />
      </td>
    ))}
  </tr>
);

const Inventory = () => {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const canWrite  = ['ADMIN', 'PHARMACIST'].includes(user?.role);
  const canDelete = user?.role === 'ADMIN';

  // Read URL filter param on mount / location change
  const getUrlFilter = () => {
    const params = new URLSearchParams(location.search);
    return params.get('filter') || '';
  };
  const getUrlCategory = () => {
    const params = new URLSearchParams(location.search);
    return params.get('category') || '';
  };
  const [urlFilter, setUrlFilter] = useState(getUrlFilter);

  const [medicines, setMedicines]         = useState([]);
  const [categories, setCategories]       = useState([]);
  const [loading, setLoading]             = useState(true);
  const [page, setPage]                   = useState(0);
  const [totalPages, setTotalPages]       = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [searchInput, setSearchInput]     = useState('');
  const [searchName, setSearchName]       = useState('');
  const [filterCategory, setFilterCategory] = useState(getUrlCategory);
  const [addModal, setAddModal]           = useState(false);
  const [editModal, setEditModal]         = useState(null);
  const [adjustModal, setAdjustModal]     = useState(null);
  const [deleteDialog, setDeleteDialog]   = useState(null);
  const [actionError, setActionError]     = useState('');

  // ── Search suggestions ───────────────────────────────────
  const [suggestions, setSuggestions]     = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggLoading, setSuggLoading]     = useState(false);
  const [activeSugg, setActiveSugg]       = useState(-1);
  const searchWrapperRef                  = useRef(null);
  const suggDebounceRef                   = useRef(null);

  useEffect(() => {
    setUrlFilter(getUrlFilter());
    setFilterCategory(getUrlCategory());
    setPage(0);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.search]);

  const fetchMedicines = useCallback(async () => {
    setLoading(true);
    try {
      // When a special URL filter is active, call the dedicated endpoint which
      // returns ALL matching records — not just the current page.
      if (urlFilter === 'expiring') {
        const res = await getExpiringMedicines(EXPIRY_DAYS);
        const data = res.data || [];
        setMedicines(data);
        setTotalPages(1);
        setTotalElements(data.length);
      } else if (urlFilter === 'expired') {
        const res = await getExpiredMedicines();
        const data = res.data || [];
        setMedicines(data);
        setTotalPages(1);
        setTotalElements(data.length);
      } else if (urlFilter === 'lowStock') {
        const res = await getLowStockMedicines(LOW_STOCK);
        const data = res.data || [];
        setMedicines(data);
        setTotalPages(1);
        setTotalElements(data.length);
      } else if (urlFilter === 'outOfStock') {
        const res = await getLowStockMedicines(0);
        const data = (res.data || []).filter((m) => m.quantity === 0);
        setMedicines(data);
        setTotalPages(1);
        setTotalElements(data.length);
      } else {
        const params = { page, size: 12, sortBy: 'name', sortDir: 'asc' };
        if (searchName)     params.name = searchName;
        if (filterCategory) params.categoryId = filterCategory;
        const res = await getMedicines(params);
        setMedicines(res.data.content || []);
        setTotalPages(res.data.totalPages || 0);
        setTotalElements(res.data.totalElements || 0);
      }
    } catch {
      setMedicines([]);
    } finally {
      setLoading(false);
    }
  }, [page, searchName, filterCategory, urlFilter]);

  useEffect(() => { fetchMedicines(); }, [fetchMedicines]);
  useEffect(() => {
    getCategories().then((r) => setCategories(r.data)).catch(() => {});
  }, []);

  const handleSearch = (e) => { e.preventDefault(); setSearchName(searchInput); setPage(0); setShowSuggestions(false); };

  // Change stock status filter from the dropdown in the filter bar
  const handleStockStatusChange = (value) => {
    setPage(0);
    if (value) {
      setUrlFilter(value);
      navigate(`/inventory?filter=${value}`, { replace: true });
    } else {
      setUrlFilter('');
      navigate('/inventory', { replace: true });
    }
  };

  const resetFilters = () => {
    setSearchInput(''); setSearchName(''); setFilterCategory(''); setPage(0);
    setSuggestions([]); setShowSuggestions(false);
    setUrlFilter('');
    navigate('/inventory', { replace: true });
  };
  const hasFilters = searchName || filterCategory || urlFilter;

  // Debounced suggestion fetch
  const handleSearchInputChange = (e) => {
    const val = e.target.value;
    setSearchInput(val);
    setActiveSugg(-1);
    if (suggDebounceRef.current) clearTimeout(suggDebounceRef.current);
    if (val.trim().length < 2) { setSuggestions([]); setShowSuggestions(false); return; }
    setSuggLoading(true);
    suggDebounceRef.current = setTimeout(async () => {
      try {
        const res = await getMedicines({ name: val.trim(), page: 0, size: 8, sortBy: 'name', sortDir: 'asc' });
        const names = (res.data.content || []).map((m) => ({ id: m.id, name: m.name, category: m.categoryName }));
        setSuggestions(names);
        setShowSuggestions(names.length > 0);
      } catch { setSuggestions([]); setShowSuggestions(false); }
      finally { setSuggLoading(false); }
    }, 300);
  };

  const selectSuggestion = (name) => {
    setSearchInput(name);
    setSearchName(name);
    setPage(0);
    setSuggestions([]);
    setShowSuggestions(false);
    setActiveSugg(-1);
  };

  const handleSearchKeyDown = (e) => {
    if (!showSuggestions) return;
    if (e.key === 'ArrowDown') { e.preventDefault(); setActiveSugg((p) => Math.min(p + 1, suggestions.length - 1)); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setActiveSugg((p) => Math.max(p - 1, -1)); }
    else if (e.key === 'Enter' && activeSugg >= 0) { e.preventDefault(); selectSuggestion(suggestions[activeSugg].name); }
    else if (e.key === 'Escape') { setShowSuggestions(false); setActiveSugg(-1); }
  };

  // Close suggestions on outside click
  useEffect(() => {
    const handler = (e) => { if (searchWrapperRef.current && !searchWrapperRef.current.contains(e.target)) setShowSuggestions(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleAdd    = async (d) => { await createMedicine(d); fetchMedicines(); };
  const handleEdit   = async (d) => { await updateMedicine(editModal.id, d); fetchMedicines(); };
  const handleAdjust = async (d) => { await adjustStock(d); fetchMedicines(); };
  const handleDelete = async () => {
    try { await deleteMedicine(deleteDialog.id); setDeleteDialog(null); fetchMedicines(); }
    catch (err) { setActionError(err.response?.data || 'Delete failed'); }
  };

  // medicines already comes pre-filtered from the backend when a URL filter is active
  const displayedMedicines = medicines;

  // Active filter display config
  const filterConfig = {
    lowStock:   { label: 'Low Stock Items',                  icon: ShieldAlert,    color: 'amber', borderColor: 'rgba(245,158,11,0.25)', bg: 'rgba(245,158,11,0.07)', iconColor: '#f59e0b', textColor: '#fbbf24' },
    expiring:   { label: 'Expiring in Next 3 Months (90 Days)', icon: Clock,          color: 'rose',  borderColor: 'rgba(244,63,94,0.25)',  bg: 'rgba(244,63,94,0.07)',  iconColor: '#f43f5e', textColor: '#fb7185' },
    expired:    { label: 'Expired Medicines',        icon: AlertTriangle,  color: 'red',   borderColor: 'rgba(239,68,68,0.25)',  bg: 'rgba(239,68,68,0.07)',  iconColor: '#ef4444', textColor: '#f87171' },
    outOfStock: { label: 'Out of Stock',             icon: AlertTriangle,  color: 'red',   borderColor: 'rgba(239,68,68,0.25)',  bg: 'rgba(239,68,68,0.07)',  iconColor: '#ef4444', textColor: '#f87171' },
  };
  const activeFilter = urlFilter ? filterConfig[urlFilter] : null;

  const [csvExporting, setCsvExporting] = useState(false);

  const handleExportCSV = async () => {
    if (csvExporting) return;
    setCsvExporting(true);
    try {
      const res = await getMedicines({ page: 0, size: 1000 });
      const allMeds = res.data?.content || [];
      exportMedicinesCSV(allMeds);
    } catch (err) {
      console.error('Failed to export medicines CSV:', err);
      setActionError('Failed to export inventory CSV.');
    } finally {
      setCsvExporting(false);
    }
  };

  return (
    <Layout>
      <div className="p-6 lg:p-8">

        {/* ── Page Header ─────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-7"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-2xl bg-sky-500/12 border border-sky-500/20 flex items-center justify-center">
              <LayoutList className="w-5 h-5 text-sky-400" />
            </div>
            <div>
              <h1 className="text-xl font-extrabold tracking-tight" style={{ color: 'var(--text-primary)' }}>
                Medicine Inventory
              </h1>
              <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                {totalElements} item{totalElements !== 1 ? 's' : ''} in database
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              onClick={handleExportCSV}
              disabled={csvExporting || loading}
              className="btn-ghost flex items-center gap-2 text-sm py-2.5 px-4 border border-[var(--border-default)] hover:bg-[var(--border-subtle)] disabled:opacity-50"
              title="Download entire inventory spreadsheet as CSV"
            >
              {csvExporting ? (
                <Loader2 className="w-4 h-4 text-emerald-400 animate-spin" />
              ) : (
                <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
              )}
              <span>{csvExporting ? 'Exporting…' : 'Export CSV'}</span>
            </button>

            {canWrite && (
              <button onClick={() => setAddModal(true)} className="btn-primary">
                <Plus className="w-4 h-4" />
                Add Medicine
              </button>
            )}
          </div>
        </motion.div>

        {/* ── Error Banner ─────────────────────────────── */}
        <AnimatePresence>
          {actionError && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-5 overflow-hidden"
            >
              <div className="flex items-center gap-3 p-3.5 rounded-xl border text-sm"
                style={{ background: 'rgba(239,68,68,0.06)', borderColor: 'rgba(239,68,68,0.2)', color: '#f87171' }}>
                <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                <span className="flex-1">{actionError}</span>
                <button onClick={() => setActionError('')}>
                  <X className="w-4 h-4 opacity-60 hover:opacity-100 transition-opacity" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Filter Bar ───────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="glass-card rounded-2xl p-3.5 mb-5 flex flex-col sm:flex-row gap-3 items-center"
          style={{ position: 'relative', zIndex: 20 }}
        >
          {/* Search */}
          <form onSubmit={handleSearch} className="flex gap-2.5 flex-1 min-w-0 w-full sm:w-auto">
            <div className="relative flex-1 min-w-0" ref={searchWrapperRef}>
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 pointer-events-none z-10"
                style={{ color: 'var(--text-muted)' }} />
              <input
                value={searchInput}
                onChange={handleSearchInputChange}
                onKeyDown={handleSearchKeyDown}
                onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
                placeholder="Search medicines..."
                className="glass-input w-full pl-9 pr-4 py-2.5 text-sm"
                autoComplete="off"
              />

              {/* Suggestions Dropdown */}
              <AnimatePresence>
                {showSuggestions && (
                  <motion.div
                    initial={{ opacity: 0, y: -4, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -4, scale: 0.98 }}
                    transition={{ duration: 0.14, ease: 'easeOut' }}
                    className="absolute left-0 right-0 top-full mt-2 z-50 overflow-hidden rounded-2xl"
                    style={{
                      background: 'var(--bg-elevated)',
                      border: '1px solid var(--border-default)',
                      boxShadow: '0 20px 60px rgba(0,0,0,0.45), 0 4px 16px rgba(0,0,0,0.3)',
                      backdropFilter: 'blur(24px)',
                    }}
                  >
                    {/* Header */}
                    <div className="flex items-center justify-between px-4 pt-3 pb-2"
                      style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                      <span className="text-xs font-semibold tracking-widest uppercase"
                        style={{ color: 'var(--text-muted)' }}>
                        Suggestions
                      </span>
                      {!suggLoading && (
                        <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                          {suggestions.length} result{suggestions.length !== 1 ? 's' : ''}
                        </span>
                      )}
                    </div>

                    {suggLoading ? (
                      <div className="flex items-center gap-2.5 px-4 py-4" style={{ color: 'var(--text-muted)' }}>
                        <svg className="w-3.5 h-3.5 animate-spin" viewBox="0 0 24 24" fill="none">
                          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="30" strokeLinecap="round"/>
                        </svg>
                        <span className="text-xs">Searching…</span>
                      </div>
                    ) : (
                      <ul className="py-1.5">
                        {suggestions.map((s, idx) => (
                          <li key={s.id} style={{ borderBottom: idx < suggestions.length - 1 ? '1px solid var(--border-subtle)' : 'none' }}>
                            <button
                              type="button"
                              onMouseDown={(e) => { e.preventDefault(); selectSuggestion(s.name); }}
                              onMouseEnter={() => setActiveSugg(idx)}
                              className="w-full text-left flex items-center justify-between gap-3 px-4 py-3 transition-all duration-100"
                              style={{
                                background: activeSugg === idx ? 'rgba(56,189,248,0.07)' : 'transparent',
                              }}
                            >
                              <div className="flex items-center gap-3 min-w-0">
                                <div className="w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0"
                                  style={{
                                    background: activeSugg === idx ? 'rgba(56,189,248,0.15)' : 'var(--border-subtle)',
                                  }}>
                                  <Search className="w-3 h-3" style={{ color: activeSugg === idx ? '#38bdf8' : 'var(--text-muted)' }} />
                                </div>
                                <span className="text-sm font-medium truncate"
                                  style={{ color: activeSugg === idx ? '#38bdf8' : 'var(--text-primary)' }}>
                                  {s.name}
                                </span>
                              </div>
                              {s.category && (
                                <span className="text-xs flex-shrink-0 px-2.5 py-1 rounded-full font-medium"
                                  style={{ background: 'rgba(99,102,241,0.12)', color: '#818cf8', border: '1px solid rgba(99,102,241,0.2)' }}>
                                  {s.category}
                                </span>
                              )}
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <button type="submit" className="btn-ghost text-sm py-2.5 px-4 flex-shrink-0">
              Search
            </button>
          </form>

          {/* Category filter */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Filter className="w-3.5 h-3.5 flex-shrink-0" style={{ color: 'var(--text-muted)' }} />
            <select
              value={filterCategory}
              onChange={(e) => { setFilterCategory(e.target.value); setPage(0); }}
              className="glass-input py-2.5 px-3 text-sm min-w-[150px] flex-1 sm:flex-initial"
            >
              <option value="">All Categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          {/* Stock Status filter */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <ShieldAlert className="w-3.5 h-3.5 flex-shrink-0" style={{ color: 'var(--text-muted)' }} />
            <select
              value={urlFilter}
              onChange={(e) => handleStockStatusChange(e.target.value)}
              className="glass-input py-2.5 px-3 text-sm min-w-[155px] flex-1 sm:flex-initial"
              style={{
                color: urlFilter === 'lowStock'   ? '#fbbf24'
                     : urlFilter === 'outOfStock' ? '#f87171'
                     : urlFilter === 'expiring'   ? '#fb7185'
                     : 'var(--text-secondary)',
              }}
            >
              <option value="">All Statuses</option>
              <option value="lowStock">⚠ Low Stock</option>
              <option value="expiring">⏰ Expiring Soon</option>
              <option value="expired">⛔ Expired</option>
              <option value="outOfStock">✕ Out of Stock</option>
            </select>
          </div>

          {/* Reset */}
          {hasFilters && (
            <button onClick={resetFilters} className="btn-ghost text-sm py-2.5 px-3 flex-shrink-0 flex items-center gap-1.5">
              <X className="w-3.5 h-3.5" />
              Clear
            </button>
          )}
        </motion.div>

        {/* ── Active Filter Banner ─────────────────────── */}
        <AnimatePresence>
          {activeFilter && (
            <motion.div
              key={urlFilter}
              initial={{ opacity: 0, y: -6, height: 0 }}
              animate={{ opacity: 1, y: 0, height: 'auto' }}
              exit={{ opacity: 0, y: -6, height: 0 }}
              transition={{ duration: 0.22, ease: 'easeOut' }}
              className="mb-5 overflow-hidden"
            >
              <div
                className="flex items-center gap-3 px-4 py-3 rounded-xl border text-sm font-medium"
                style={{ background: activeFilter.bg, borderColor: activeFilter.borderColor }}
              >
                <activeFilter.icon className="w-4 h-4 flex-shrink-0" style={{ color: activeFilter.iconColor }} />
                <span style={{ color: activeFilter.textColor }}>Showing: <strong>{activeFilter.label}</strong></span>
                <span className="ml-auto text-xs font-semibold px-2 py-0.5 rounded-full"
                  style={{ background: activeFilter.borderColor, color: activeFilter.textColor }}>
                  {displayedMedicines.length} item{displayedMedicines.length !== 1 ? 's' : ''}
                </span>
                <button
                  onClick={resetFilters}
                  className="flex items-center gap-1 text-xs opacity-70 hover:opacity-100 transition-opacity"
                  style={{ color: activeFilter.textColor }}
                >
                  <X className="w-3.5 h-3.5" /> Clear
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Data Table ───────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="glass-card rounded-2xl overflow-hidden"
        >
          <div className="overflow-x-auto">
            <table className="w-full data-table">
              <thead>
                <tr>
                  {['Medicine', 'Batch No.', 'Stock', 'Expiry Date', 'Category', 'Supplier', 'Price', ''].map((h) => (
                    <th key={h} className="text-left">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} />)
                ) : displayedMedicines.length === 0 ? (
                  <tr>
                    <td colSpan={8}>
                      <div className="flex flex-col items-center justify-center py-20">
                        <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4"
                          style={{ background: 'var(--border-subtle)' }}>
                          <Package className="w-6 h-6" style={{ color: 'var(--text-muted)' }} />
                        </div>
                        <p className="font-semibold mb-1" style={{ color: 'var(--text-secondary)' }}>
                          {hasFilters ? 'No results found' : 'No medicines yet'}
                        </p>
                        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                          {hasFilters
                            ? 'Try adjusting your search or filters'
                            : canWrite ? 'Add your first medicine to get started' : 'The inventory is empty'}
                        </p>
                        {hasFilters && (
                          <button onClick={resetFilters} className="mt-4 btn-ghost text-sm">Clear filters</button>
                        )}
                        {!hasFilters && canWrite && (
                          <button onClick={() => setAddModal(true)} className="mt-4 btn-primary text-sm">
                            <Plus className="w-3.5 h-3.5" /> Add Medicine
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ) : displayedMedicines.map((med, i) => {
                  const days = med.expiryDate ? daysUntilExpiry(med.expiryDate) : null;
                  const isExpiring = days !== null && days <= EXPIRY_DAYS && days > 0;
                  const isExpired  = days !== null && days <= 0;
                  const isLow      = med.quantity <= LOW_STOCK;

                  return (
                    <motion.tr
                      key={med.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.025 }}
                    >
                      {/* Medicine name + badges */}
                      <td className="px-4 py-3.5">
                        <div className="flex flex-col gap-1">
                          <span className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>
                            {med.name}
                          </span>
                          <div className="flex flex-wrap gap-1">
                            <QuantityBadge qty={med.quantity} />
                            <ExpiryBadge dateStr={med.expiryDate} />
                          </div>
                        </div>
                      </td>

                      {/* Batch number */}
                      <td className="px-4 py-3.5">
                        <span className="font-mono text-xs px-2 py-1 rounded-lg"
                          style={{ background: 'var(--border-subtle)', color: 'var(--text-secondary)' }}>
                          {med.batchNumber}
                        </span>
                      </td>

                      {/* Quantity */}
                      <td className="px-4 py-3.5">
                        <span className={`text-sm font-bold ${isLow || isExpired ? 'text-amber-400' : ''}`}
                          style={!isLow && !isExpired ? { color: 'var(--text-primary)' } : {}}>
                          {med.quantity}
                          <span className="text-xs font-normal ml-1" style={{ color: 'var(--text-muted)' }}>units</span>
                        </span>
                      </td>

                      {/* Expiry */}
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-1.5">
                          <Calendar className={`w-3.5 h-3.5 flex-shrink-0 ${isExpired ? 'text-red-400' : isExpiring ? 'text-rose-400' : ''}`}
                            style={!isExpired && !isExpiring ? { color: 'var(--text-muted)' } : {}} />
                          <span className={`text-sm ${isExpired ? 'text-red-400' : isExpiring ? 'text-rose-400' : ''}`}
                            style={!isExpired && !isExpiring ? { color: 'var(--text-secondary)' } : {}}>
                            {med.expiryDate || '—'}
                          </span>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="px-4 py-3.5">
                        {med.categoryName ? (
                          <span className="badge text-indigo-400 bg-indigo-500/10 border-indigo-500/25">
                            {med.categoryName}
                          </span>
                        ) : (
                          <span style={{ color: 'var(--text-disabled)' }}>—</span>
                        )}
                      </td>

                      {/* Supplier */}
                      <td className="px-4 py-3.5 text-sm max-w-[130px] truncate" style={{ color: 'var(--text-secondary)' }}>
                        {med.supplierName || <span style={{ color: 'var(--text-disabled)' }}>—</span>}
                      </td>

                      {/* Price */}
                      <td className="px-4 py-3.5">
                        <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                          ₹{med.price?.toFixed(2)}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-1 justify-end">
                          {canWrite && (
                            <>
                              <ActionBtn
                                icon={ArrowUpDown}
                                label="Adjust Stock"
                                color="emerald"
                                onClick={() => setAdjustModal(med)}
                              />
                              <ActionBtn
                                icon={Edit2}
                                label="Edit"
                                color="sky"
                                onClick={() => setEditModal(med)}
                              />
                            </>
                          )}
                          {canDelete && (
                            <ActionBtn
                              icon={Trash2}
                              label="Delete"
                              color="red"
                              onClick={() => setDeleteDialog(med)}
                            />
                          )}
                        </div>
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* ── Pagination ──────────────────────────────── */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-5 py-3.5"
              style={{ borderTop: '1px solid var(--border-subtle)' }}>
              <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                Page {page + 1} of {totalPages} · {totalElements} total records
              </span>
              <div className="flex items-center gap-1.5">
                <button
                  disabled={page === 0}
                  onClick={() => setPage(page - 1)}
                  className="btn-ghost p-2 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                {/* Page numbers */}
                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                  const p = Math.max(0, Math.min(page - 2, totalPages - 5)) + i;
                  return (
                    <button
                      key={p}
                      onClick={() => setPage(p)}
                      className={`w-8 h-8 rounded-lg text-xs font-semibold transition-all ${
                        p === page
                          ? 'bg-sky-500/20 text-sky-400 border border-sky-500/30'
                          : 'btn-ghost p-0'
                      }`}
                    >
                      {p + 1}
                    </button>
                  );
                })}

                <button
                  disabled={page >= totalPages - 1}
                  onClick={() => setPage(page + 1)}
                  className="btn-ghost p-2 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </motion.div>
      </div>

      {/* ── Modals ───────────────────────────────────── */}
      <MedicineModal isOpen={addModal}    onClose={() => setAddModal(false)}  onSubmit={handleAdd} />
      <MedicineModal isOpen={!!editModal} onClose={() => setEditModal(null)}  onSubmit={handleEdit} initialData={editModal} />
      <StockAdjustModal isOpen={!!adjustModal} onClose={() => setAdjustModal(null)} onSubmit={handleAdjust} medicine={adjustModal} />
      <ConfirmDialog
        isOpen={!!deleteDialog}
        title="Delete Medicine"
        message={`Permanently delete "${deleteDialog?.name}"? This cannot be undone.`}
        confirmLabel="Delete"
        onConfirm={handleDelete}
        onCancel={() => setDeleteDialog(null)}
      />
    </Layout>
  );
};

/* ── Action Button ───────────────────────────────── */
const colorStyles = {
  emerald: { idle: 'var(--text-muted)', hover: '#34d399', hoverBg: 'rgba(52,211,153,0.08)' },
  sky:     { idle: 'var(--text-muted)', hover: '#38bdf8', hoverBg: 'rgba(56,189,248,0.08)' },
  red:     { idle: 'var(--text-muted)', hover: '#f87171', hoverBg: 'rgba(248,113,113,0.08)' },
};

const ActionBtn = ({ icon: Icon, label, color, onClick }) => {
  const c = colorStyles[color] || colorStyles.sky;
  return (
    <button
      onClick={onClick}
      title={label}
      className="w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-150"
      style={{ color: c.idle }}
      onMouseEnter={(e) => {
        e.currentTarget.style.color = c.hover;
        e.currentTarget.style.background = c.hoverBg;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.color = c.idle;
        e.currentTarget.style.background = 'transparent';
      }}
    >
      <Icon className="w-3.5 h-3.5" />
    </button>
  );
};

export default Inventory;
