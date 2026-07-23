import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutDashboard, 
  Pill, 
  Users, 
  Receipt, 
  ShoppingCart, 
  RefreshCw, 
  Bell, 
  FileSpreadsheet, 
  MessageSquare,
  LogOut, 
  ChevronLeft, 
  ChevronRight 
} from 'lucide-react';

const Sidebar = ({ isCollapsed, setIsCollapsed }) => {
  const { user, logout } = useAuth();
  
  if (!user) return null;

  const role = user.role; // ADMIN, PHARMACIST, STAFF, SUPPLIER, CUSTOMER

  // Dynamic route base path
  const base = `/${role.toLowerCase()}`;

  // Menu items list mapping
  const menuConfig = {
    ADMIN: [
      { path: `${base}/dashboard`, label: 'Dashboard', icon: LayoutDashboard },
      { path: `${base}/medicines`, label: 'Medicines', icon: Pill },
      { path: `${base}/suppliers`, label: 'Suppliers', icon: Users },
      { path: `${base}/billing`, label: 'POS Billing', icon: ShoppingCart },
      { path: `${base}/reorders`, label: 'Reorder Board', icon: RefreshCw },
      { path: `${base}/chat`, label: 'Chat Inbox', icon: MessageSquare },
      { path: `${base}/notifications`, label: 'Notifications', icon: Bell },
      { path: `${base}/reports`, label: 'Reports', icon: FileSpreadsheet },
    ],
    PHARMACIST: [
      { path: `${base}/dashboard`, label: 'Dashboard', icon: LayoutDashboard },
      { path: `${base}/medicines`, label: 'Medicines', icon: Pill },
      { path: `${base}/suppliers`, label: 'Suppliers & Partners', icon: Users },
      { path: `${base}/billing`, label: 'POS Billing', icon: ShoppingCart },
      { path: `${base}/reorders`, label: 'Reorder Board', icon: RefreshCw },
      { path: `${base}/chat`, label: 'Chat Inbox', icon: MessageSquare },
      { path: `${base}/notifications`, label: 'Notifications', icon: Bell },
    ],
    STAFF: [
      { path: `${base}/dashboard`, label: 'Dashboard', icon: LayoutDashboard },
      { path: `${base}/billing`, label: 'POS Billing', icon: ShoppingCart },
      { path: `${base}/medicines`, label: 'Medicines Stock', icon: Pill },
      { path: `${base}/chat`, label: 'Chat Inbox', icon: MessageSquare },
      { path: `${base}/notifications`, label: 'Notifications', icon: Bell },
    ],
    SUPPLIER: [
      { path: `${base}/dashboard`, label: 'Portal Dashboard', icon: LayoutDashboard },
      { path: `${base}/medicines`, label: 'Product Catalog', icon: Pill },
      { path: `${base}/partnerships`, label: 'Pharmacy Network', icon: Users },
      { path: `${base}/chat`, label: 'Chat Inbox', icon: MessageSquare },
      { path: `${base}/notifications`, label: 'Orders & Alerts', icon: Bell },
    ],
    CUSTOMER: [
      { path: `${base}/dashboard`, label: 'Storefront', icon: LayoutDashboard },
      { path: `${base}/chat`, label: 'Chat Helpdesk', icon: MessageSquare },
      { path: `${base}/notifications`, label: 'Alerts', icon: Bell },
    ]
  };

  const currentMenu = menuConfig[role] || [];

  return (
    <aside 
      className={`fixed top-0 left-0 z-20 h-screen bg-white dark:bg-slate-900 border-r border-slate-200/50 dark:border-slate-800/40 transition-all duration-300 flex flex-col justify-between ${
        isCollapsed ? 'w-20' : 'w-64'
      }`}
    >
      <div>
        {/* Brand Header */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-slate-200/50 dark:border-slate-800/40">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-sky-500 to-emerald-400 flex items-center justify-center text-white font-bold shrink-0 shadow-sm">
              M
            </div>
            {!isCollapsed && (
              <span className="font-bold text-lg bg-gradient-to-r from-sky-600 to-emerald-600 bg-clip-text text-transparent truncate">
                MediStock
              </span>
            )}
          </div>
          
          <button 
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="hidden md:flex p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-500 transition-colors"
          >
            {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>
        </div>

        {/* Navigation list */}
        <nav className="p-3 space-y-1">
          {currentMenu.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) => 
                  `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                    isActive 
                      ? 'bg-sky-50 dark:bg-sky-950/30 text-sky-600 dark:text-sky-400 shadow-sm border border-sky-100/50 dark:border-sky-900/30' 
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-slate-100'
                  }`
                }
              >
                <Icon size={18} className="shrink-0" />
                {!isCollapsed && <span className="truncate">{item.label}</span>}
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* User Footer Profile & Logout */}
      <div className="p-3 border-t border-slate-200/50 dark:border-slate-800/40 bg-slate-50/50 dark:bg-slate-900/30">
        {!isCollapsed && (
          <div className="mb-3 px-2 flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center font-bold text-slate-700 dark:text-slate-300">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-semibold truncate text-slate-800 dark:text-slate-200">{user.name}</p>
              <p className="text-xs text-slate-500 truncate capitalize">{role.toLowerCase()}</p>
            </div>
          </div>
        )}
        
        <button
          onClick={logout}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 transition-all ${
            isCollapsed ? 'justify-center' : ''
          }`}
        >
          <LogOut size={18} className="shrink-0" />
          {!isCollapsed && <span>Logout</span>}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
