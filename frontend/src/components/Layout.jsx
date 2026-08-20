import React from 'react';
import Sidebar from './Sidebar';
import CommandPalette from './CommandPalette';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from 'react-router-dom';

const Layout = ({ children }) => {
  const location = useLocation();

  return (
    <div className="flex min-h-screen bg-grid text-[var(--text-primary)] font-sans">
      <Sidebar />
      <main className="flex-1 overflow-x-hidden overflow-y-auto relative">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
            className="min-h-full"
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Global Spotlight Search */}
      <CommandPalette />
    </div>
  );
};

export default Layout;
