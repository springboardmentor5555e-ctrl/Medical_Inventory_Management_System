import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sun, Moon, Monitor, Check } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const OPTIONS = [
  { value: 'dark',   label: 'Dark',   icon: Moon    },
  { value: 'light',  label: 'Light',  icon: Sun     },
  { value: 'system', label: 'System', icon: Monitor },
];

const ThemeToggle = ({ collapsed = false }) => {
  const { theme, effectiveTheme, changeTheme } = useTheme();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const CurrentIcon = effectiveTheme === 'light' ? Sun : Moon;
  const currentOption = OPTIONS.find((o) => o.value === theme);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-xl border transition-all duration-200 ${
          open
            ? 'bg-sky-500/10 border-sky-500/20 text-sky-400'
            : 'border-transparent text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--border-subtle)]'
        }`}
        title="Change theme"
      >
        <CurrentIcon className="w-5 h-5 flex-shrink-0 transition-transform group-hover:rotate-12" />
        <AnimatePresence>
          {!collapsed && (
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-sm font-medium whitespace-nowrap flex-1 text-left"
            >
              {currentOption?.label} Mode
            </motion.span>
          )}
        </AnimatePresence>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 6, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className={`absolute z-50 glass-card rounded-xl border border-[var(--border-default)] shadow-2xl p-1.5 min-w-[165px] ${
              collapsed ? 'left-12 bottom-0' : 'bottom-full mb-2 left-0 right-0'
            }`}
            style={{ background: 'var(--bg-elevated)' }}
          >
            {OPTIONS.map(({ value, label, icon: Icon }) => (
              <button
                key={value}
                onClick={() => { changeTheme(value); setOpen(false); }}
                className={`flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                  theme === value
                    ? 'bg-sky-500/15 text-sky-400 font-semibold'
                    : 'text-[var(--text-secondary)] hover:bg-[var(--border-subtle)] hover:text-[var(--text-primary)]'
                }`}
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                <span>{label}</span>
                {theme === value && <Check className="w-3.5 h-3.5 ml-auto text-sky-400" />}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ThemeToggle;
