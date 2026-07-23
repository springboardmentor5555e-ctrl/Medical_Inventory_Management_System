import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axiosInstance from '../services/axiosInstance';
import { Sun, Moon, Bell, Search, User as UserIcon } from 'lucide-react';
import { Link } from 'react-router-dom';

const Navbar = () => {
  const { user } = useAuth();
  const [darkMode, setDarkMode] = useState(localStorage.getItem('theme') === 'dark');
  const [unreadCount, setUnreadCount] = useState(0);

  // Toggle Dark Mode
  useEffect(() => {
    if (darkMode) {
      document.body.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.body.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  // Fetch unread notifications count
  useEffect(() => {
    const fetchUnreadCount = async () => {
      try {
        const response = await axiosInstance.get('/api/notifications/unread-count');
        setUnreadCount(response.data);
      } catch (error) {
        console.error("Failed to fetch unread notifications count", error);
      }
    };

    if (user) {
      fetchUnreadCount();
      // Poll notifications count every 30 seconds
      const interval = setInterval(fetchUnreadCount, 30000);
      return () => clearInterval(interval);
    }
  }, [user]);

  if (!user) return null;

  return (
    <header className="h-16 fixed top-0 right-0 z-10 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200/50 dark:border-slate-800/40 px-6 flex items-center justify-between transition-all left-0 md:left-auto md:w-[calc(100%-16rem)] md:has-[+aside.w-20]:w-[calc(100%-5rem)]">
      {/* Search Input Bar */}
      <div className="relative w-72 hidden sm:block">
        <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 pointer-events-none">
          <Search size={16} />
        </span>
        <input 
          type="text" 
          placeholder="Global medicine search..." 
          className="w-full bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 pl-10 pr-4 py-2 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/50 border border-transparent focus:border-sky-500 transition-all"
        />
      </div>
      <div className="sm:hidden font-semibold text-sky-600 dark:text-sky-400">
        MediStock
      </div>

      {/* Action Tools */}
      <div className="flex items-center gap-4">
        {/* Dark Mode Toggle */}
        <button
          onClick={() => setDarkMode(!darkMode)}
          className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 transition-colors"
          title="Toggle Dark Mode"
        >
          {darkMode ? <Sun size={20} /> : <Moon size={20} />}
        </button>

        {/* Notifications Icon with Badge */}
        <Link 
          to={`/${user.role.toLowerCase()}/notifications`}
          className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 relative transition-colors"
          title="Notifications"
        >
          <Bell size={20} />
          {unreadCount > 0 && (
            <span className="absolute top-1.5 right-1.5 w-4.5 h-4.5 bg-red-550 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white dark:border-slate-900">
              {unreadCount}
            </span>
          )}
        </Link>

        {/* Profile Summary & Role Badge */}
        <div className="flex items-center gap-3 pl-2 border-l border-slate-200 dark:border-slate-800">
          <div className="w-8 h-8 rounded-full bg-sky-100 dark:bg-sky-950 text-sky-600 dark:text-sky-400 flex items-center justify-center font-bold">
            <UserIcon size={16} />
          </div>
          <div className="hidden lg:block text-left">
            <p className="text-sm font-semibold leading-none text-slate-800 dark:text-slate-200">{user.name}</p>
            <span className="inline-block mt-1 px-1.5 py-0.5 rounded text-[10px] font-extrabold tracking-wide uppercase leading-none bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400">
              {user.role}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
