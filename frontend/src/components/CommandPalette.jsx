import React, { useState, useEffect, useMemo, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import {
  Search, Command, Package, ShoppingCart, BarChart2, Bell,
  Tag, Truck, Users, Sun, Moon, Plus, FileDown,
  ShieldAlert, Clock, AlertTriangle, ArrowRight, CornerDownLeft, X, Sparkles
} from 'lucide-react';
import { getMedicines, getSuppliers, getCategories } from '../services/api';

const CommandPalette = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);

  const [medicines, setMedicines] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [categories, setCategories] = useState([]);
  const [dataLoaded, setDataLoaded] = useState(false);

  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const { user } = useAuth();
  const inputRef = useRef(null);

  // Global key listener for Ctrl+K / Cmd+K
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  // Load searchable data on first open
  useEffect(() => {
    if (isOpen && !dataLoaded) {
      Promise.all([
        getMedicines({ page: 0, size: 500 }),
        getSuppliers(),
        getCategories(),
      ])
        .then(([medsRes, suppRes, catRes]) => {
          setMedicines(medsRes.data?.content || []);
          setSuppliers(suppRes.data || []);
          setCategories(catRes.data || []);
          setDataLoaded(true);
        })
        .catch(() => {});
    }
  }, [isOpen, dataLoaded]);

  // Reset query and selection on open/close
  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Standard Navigation Actions
  const staticActions = useMemo(() => [
    { id: 'nav-dash', title: 'Dashboard', group: 'Navigation', icon: Command, action: () => navigate('/') },
    { id: 'nav-inv', title: 'Medicine Inventory', group: 'Navigation', icon: Package, action: () => navigate('/inventory') },
    { id: 'nav-po', title: 'Purchase Orders', group: 'Navigation', icon: ShoppingCart, action: () => navigate('/purchase-orders') },
    { id: 'nav-rep', title: 'Inventory Reports & Analytics', group: 'Navigation', icon: BarChart2, action: () => navigate('/reports') },
    { id: 'nav-notif', title: 'Notifications & Alerts', group: 'Navigation', icon: Bell, action: () => navigate('/notifications') },
    { id: 'nav-cat', title: 'Categories Management', group: 'Navigation', icon: Tag, action: () => navigate('/categories') },
    { id: 'nav-sup', title: 'Suppliers Management', group: 'Navigation', icon: Truck, action: () => navigate('/suppliers') },
    ...(user?.role === 'ADMIN' ? [{ id: 'nav-users', title: 'User Management', group: 'Navigation', icon: Users, action: () => navigate('/users') }] : []),

    // Quick Filter Shortcuts
    { id: 'filter-low', title: 'Filter Low Stock Medicines (≤10 units)', group: 'Quick Filters', icon: ShieldAlert, color: 'text-amber-400', action: () => navigate('/inventory?filter=lowStock') },
    { id: 'filter-exp', title: 'Filter Expiring Medicines (Within 30 Days)', group: 'Quick Filters', icon: Clock, color: 'text-rose-400', action: () => navigate('/inventory?filter=expiring') },
    { id: 'filter-expired', title: 'Filter Expired Medicines', group: 'Quick Filters', icon: AlertTriangle, color: 'text-red-400', action: () => navigate('/inventory?filter=expired') },

    // Preferences & Tools
    { id: 'tool-theme', title: `Switch Theme to ${theme === 'dark' ? 'Light Sandalwood' : 'Deep Space Dark'}`, group: 'Preferences', icon: theme === 'dark' ? Sun : Moon, color: 'text-amber-300', action: () => toggleTheme() },
  ], [navigate, theme, toggleTheme, user?.role]);

  // Combined Results Filtered by Query
  const filteredResults = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) {
      return staticActions;
    }

    const matchedActions = staticActions.filter((a) =>
      a.title.toLowerCase().includes(q) || a.group.toLowerCase().includes(q)
    );

    const matchedMedicines = medicines
      .filter((m) =>
        (m.name || '').toLowerCase().includes(q) ||
        (m.batchNumber || '').toLowerCase().includes(q) ||
        (m.categoryName || '').toLowerCase().includes(q) ||
        (m.supplierName || '').toLowerCase().includes(q)
      )
      .slice(0, 8)
      .map((m) => ({
        id: `med-${m.id}`,
        title: m.name,
        subtitle: `Batch: ${m.batchNumber || '—'} · Stock: ${m.quantity} units · ₹${m.price}`,
        group: 'Medicines',
        icon: Package,
        color: m.quantity === 0 ? 'text-red-400' : m.quantity <= 10 ? 'text-amber-400' : 'text-sky-400',
        action: () => navigate(`/inventory?search=${encodeURIComponent(m.name)}`),
      }));

    const matchedSuppliers = suppliers
      .filter((s) => (s.name || '').toLowerCase().includes(q) || (s.email || '').toLowerCase().includes(q))
      .slice(0, 4)
      .map((s) => ({
        id: `sup-${s.id}`,
        title: s.name,
        subtitle: `Supplier · Contact: ${s.phone || s.email || '—'}`,
        group: 'Suppliers',
        icon: Truck,
        color: 'text-emerald-400',
        action: () => navigate('/suppliers'),
      }));

    const matchedCategories = categories
      .filter((c) => (c.name || '').toLowerCase().includes(q))
      .slice(0, 4)
      .map((c) => ({
        id: `cat-${c.id}`,
        title: c.name,
        subtitle: `Category · ${c.description || 'Medicines category'}`,
        group: 'Categories',
        icon: Tag,
        color: 'text-indigo-400',
        action: () => navigate('/categories'),
      }));

    return [...matchedActions, ...matchedMedicines, ...matchedSuppliers, ...matchedCategories];
  }, [query, staticActions, medicines, suppliers, categories, navigate]);

  // Handle Keyboard Arrows + Enter
  const handleKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % Math.max(1, filteredResults.length));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + filteredResults.length) % Math.max(1, filteredResults.length));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const target = filteredResults[selectedIndex];
      if (target) {
        target.action();
        setIsOpen(false);
      }
    }
  };

  if (!isOpen) return null;

  const content = (
    <AnimatePresence>
      <div
        className="fixed inset-0 z-[999999] flex items-start justify-center pt-[10vh] sm:pt-[14vh] px-4"
        style={{
          backgroundColor: 'rgba(2, 6, 23, 0.85)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
        }}
        onClick={() => setIsOpen(false)}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: -12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -12 }}
          transition={{ duration: 0.18, ease: 'easeOut' }}
          className="w-full max-w-2xl rounded-2xl overflow-hidden shadow-2xl flex flex-col"
          style={{
            background: 'linear-gradient(180deg, #0f172a 0%, #090d16 100%)',
            border: '1px solid rgba(148, 163, 184, 0.22)',
            boxShadow: '0 25px 60px -15px rgba(0,0,0,0.95), 0 0 40px rgba(56,189,248,0.15)',
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Input Header */}
          <div className="flex items-center gap-3 px-4 py-3.5 border-b border-slate-800 bg-slate-900/80">
            <Search className="w-5 h-5 text-sky-400 flex-shrink-0" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setSelectedIndex(0);
              }}
              onKeyDown={handleKeyDown}
              placeholder="Type a command, medicine name, supplier, or batch number..."
              className="w-full bg-transparent text-slate-100 text-sm font-medium placeholder:text-slate-500 focus:outline-none"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery('')}
                className="text-slate-500 hover:text-slate-300"
              >
                <X className="w-4 h-4" />
              </button>
            )}
            <kbd className="hidden sm:inline-flex items-center gap-0.5 px-2 py-0.5 text-[10px] font-mono font-bold bg-slate-800 text-slate-400 border border-slate-700 rounded-md">
              ESC
            </kbd>
          </div>

          {/* Results List */}
          <div className="max-h-[60vh] overflow-y-auto p-2 space-y-1">
            {filteredResults.length === 0 ? (
              <div className="py-12 text-center text-slate-500">
                <Search className="w-8 h-8 mx-auto mb-2 opacity-40" />
                <p className="text-sm font-semibold text-slate-400">No matching commands or records</p>
                <p className="text-xs mt-0.5">Try searching for medicines, categories, or actions</p>
              </div>
            ) : (
              filteredResults.map((item, index) => {
                const Icon = item.icon || Package;
                const isSelected = index === selectedIndex;

                return (
                  <div
                    key={item.id}
                    onMouseEnter={() => setSelectedIndex(index)}
                    onClick={() => {
                      item.action();
                      setIsOpen(false);
                    }}
                    className={`flex items-center justify-between gap-3 px-3.5 py-2.5 rounded-xl cursor-pointer transition-colors ${
                      isSelected
                        ? 'bg-sky-500/15 border border-sky-500/30 text-white'
                        : 'hover:bg-slate-800/50 text-slate-300 border border-transparent'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 border ${
                          isSelected
                            ? 'bg-sky-500/20 border-sky-500/30'
                            : 'bg-slate-800/80 border-slate-700'
                        } ${item.color || 'text-slate-300'}`}
                      >
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <p className={`text-xs sm:text-sm font-semibold truncate ${isSelected ? 'text-white' : 'text-slate-200'}`}>
                          {item.title}
                        </p>
                        {item.subtitle && (
                          <p className="text-[11px] text-slate-400 truncate mt-0.5">
                            {item.subtitle}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700/60">
                        {item.group}
                      </span>
                      {isSelected && (
                        <CornerDownLeft className="w-3.5 h-3.5 text-sky-400" />
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer Guide */}
          <div className="px-4 py-2.5 border-t border-slate-800/80 bg-slate-950/80 flex items-center justify-between text-[11px] text-slate-400">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 bg-slate-800 border border-slate-700 rounded font-mono text-[10px]">↑</kbd>
                <kbd className="px-1.5 py-0.5 bg-slate-800 border border-slate-700 rounded font-mono text-[10px]">↓</kbd>
                to navigate
              </span>
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 bg-slate-800 border border-slate-700 rounded font-mono text-[10px]">↵</kbd>
                to select
              </span>
            </div>
            <div className="flex items-center gap-1 text-slate-500">
              <Sparkles className="w-3 h-3 text-sky-400" />
              <span>MediStock Spotlight</span>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );

  return typeof document !== 'undefined' ? createPortal(content, document.body) : content;
};

export default CommandPalette;
