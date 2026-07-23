import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axiosInstance from '../services/axiosInstance';
import { motion } from 'framer-motion';
import { 
  Pill, 
  Users, 
  DollarSign, 
  TrendingUp, 
  AlertTriangle, 
  Calendar, 
  ArrowRight,
  Plus,
  ShoppingCart,
  CheckCircle,
  XCircle,
  Lock,
  Unlock,
  Shield,
  FileText
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar
} from 'recharts';
import { toast } from 'sonner';

const AdminDashboard = () => {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('overview');

  // Fetch metrics data
  const { data: medicinesRes, isLoading: medLoading } = useQuery({
    queryKey: ['medicines'],
    queryFn: () => axiosInstance.get('/api/medicines?size=1000').then(res => res.data)
  });

  const { data: suppliersRes, isLoading: supLoading } = useQuery({
    queryKey: ['suppliers'],
    queryFn: () => axiosInstance.get('/api/suppliers').then(res => res.data)
  });

  const { data: salesRes, isLoading: salesLoading } = useQuery({
    queryKey: ['sales'],
    queryFn: () => axiosInstance.get('/api/sales').then(res => res.data)
  });

  const { data: reordersRes, isLoading: reorderLoading } = useQuery({
    queryKey: ['reorders'],
    queryFn: () => axiosInstance.get('/api/reorders').then(res => res.data)
  });

  const { data: lowStockRes, isLoading: lowLoading } = useQuery({
    queryKey: ['lowStock'],
    queryFn: () => axiosInstance.get('/api/medicines/low-stock').then(res => res.data)
  });

  const { data: expiringRes, isLoading: expiringLoading } = useQuery({
    queryKey: ['expiringSoon'],
    queryFn: () => axiosInstance.get('/api/medicines/expiring?days=30').then(res => res.data)
  });

  // Admin Specific Queries
  const { data: usersList, isLoading: usersLoading } = useQuery({
    queryKey: ['adminUsers'],
    queryFn: () => axiosInstance.get('/api/admin/users').then(res => res.data)
  });

  const { data: sysLogs, isLoading: logsLoading } = useQuery({
    queryKey: ['adminLogs'],
    queryFn: () => axiosInstance.get('/api/admin/logs').then(res => res.data)
  });

  // Mutation commands
  const approveMutation = useMutation({
    mutationFn: (id) => axiosInstance.post(`/api/admin/users/${id}/approve`),
    onSuccess: () => {
      queryClient.invalidateQueries(['adminUsers']);
      toast.success("User approved successfully!");
    }
  });

  const rejectMutation = useMutation({
    mutationFn: (id) => axiosInstance.post(`/api/admin/users/${id}/reject`),
    onSuccess: () => {
      queryClient.invalidateQueries(['adminUsers']);
      toast.success("User rejected successfully!");
    }
  });

  const blockMutation = useMutation({
    mutationFn: (id) => axiosInstance.post(`/api/admin/users/${id}/block`),
    onSuccess: () => {
      queryClient.invalidateQueries(['adminUsers']);
      toast.error("User blocked successfully!");
    }
  });

  const unblockMutation = useMutation({
    mutationFn: (id) => axiosInstance.post(`/api/admin/users/${id}/unblock`),
    onSuccess: () => {
      queryClient.invalidateQueries(['adminUsers']);
      toast.success("User unblocked successfully!");
    }
  });

  const loading = medLoading || supLoading || salesLoading || reorderLoading || lowLoading || expiringLoading || usersLoading || logsLoading;

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-slate-200 dark:bg-slate-800 rounded animate-pulse"></div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 bg-slate-200 dark:bg-slate-800 rounded-2xl animate-pulse"></div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="h-80 lg:col-span-2 bg-slate-200 dark:bg-slate-800 rounded-2xl animate-pulse"></div>
          <div className="h-80 bg-slate-200 dark:bg-slate-800 rounded-2xl animate-pulse"></div>
        </div>
      </div>
    );
  }

  // Analytics Computation
  const totalMedicines = medicinesRes?.totalElements || medicinesRes?.length || 0;
  const totalSuppliers = suppliersRes?.length || 0;
  const totalSalesCount = salesRes?.length || 0;
  const totalRevenue = salesRes?.reduce((acc, curr) => acc + curr.totalAmount, 0) || 0;
  const lowStockCount = lowStockRes?.length || 0;
  const expiringCount = expiringRes?.length || 0;

  const salesHistory = salesRes || [];
  const chartData = salesHistory.slice(-10).map(sale => ({
    name: sale.invoiceNumber.substring(4, 10),
    amount: sale.totalAmount,
    date: new Date(sale.saleDate).toLocaleDateString(undefined, {month: 'short', day: 'numeric'})
  }));

  const medicines = medicinesRes?.content || medicinesRes || [];
  const categoryCounts = {};
  medicines.forEach(m => {
    const catName = m.category?.name || 'Uncategorized';
    categoryCounts[catName] = (categoryCounts[catName] || 0) + 1;
  });
  const pieData = Object.keys(categoryCounts).map(name => ({
    name,
    value: categoryCounts[name]
  }));
  const COLORS = ['#0284c7', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

  const today = new Date();
  let expired = 0, nextMonth = 0, threeMonths = 0, safe = 0;
  medicines.forEach(m => {
    if (!m.expiryDate) return;
    const expiry = new Date(m.expiryDate);
    const diffTime = expiry - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays <= 0) expired++;
    else if (diffDays <= 30) nextMonth++;
    else if (diffDays <= 90) threeMonths++;
    else safe++;
  });
  const barData = [
    { name: 'Expired', count: expired, fill: '#ef4444' },
    { name: '0-30 Days', count: nextMonth, fill: '#f59e0b' },
    { name: '30-90 Days', count: threeMonths, fill: '#0284c7' },
    { name: '90+ Days', count: safe, fill: '#10b981' }
  ];

  const recentSales = salesHistory.slice(-5).reverse();

  // Filters for User categories
  const pendingUsers = usersList?.filter(u => u.status === 'PENDING') || [];
  const approvedUsers = usersList?.filter(u => u.status !== 'PENDING') || [];

  return (
    <div className="space-y-6">
      {/* Title Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-800 dark:text-slate-100">
            System Administration
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Enterprise configurations and accounts audit workspace.
          </p>
        </div>
        <div className="flex gap-2 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
          <button 
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${activeTab === 'overview' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            Overview
          </button>
          <button 
            onClick={() => setActiveTab('approvals')}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-1.5 ${activeTab === 'approvals' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            Approvals
            {pendingUsers.length > 0 && <span className="bg-sky-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">{pendingUsers.length}</span>}
          </button>
          <button 
            onClick={() => setActiveTab('users')}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${activeTab === 'users' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            Users
          </button>
          <button 
            onClick={() => setActiveTab('logs')}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${activeTab === 'logs' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            Logs
          </button>
        </div>
      </div>

      {/* Tab: Overview (Original Dashboard) */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <motion.div whileHover={{ y: -4 }} className="glass-card p-6 flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Total Medicines</span>
                <h3 className="text-3xl font-bold text-slate-800 dark:text-slate-100 mt-2">{totalMedicines}</h3>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-sky-100 dark:bg-sky-950/40 text-sky-600 dark:text-sky-400 flex items-center justify-center">
                <Pill size={22} />
              </div>
            </motion.div>

            <motion.div whileHover={{ y: -4 }} className="glass-card p-6 flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Total Revenue</span>
                <h3 className="text-3xl font-bold text-emerald-600 dark:text-emerald-400 mt-2">
                  ${totalRevenue.toFixed(2)}
                </h3>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <DollarSign size={22} />
              </div>
            </motion.div>

            <motion.div whileHover={{ y: -4 }} className="glass-card p-6 flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Low Stock Warnings</span>
                <h3 className={`text-3xl font-bold mt-2 ${lowStockCount > 0 ? 'text-red-500' : 'text-slate-855'}`}>
                  {lowStockCount}
                </h3>
              </div>
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${lowStockCount > 0 ? 'bg-red-100 dark:bg-red-950/40 text-red-500' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'}`}>
                <AlertTriangle size={22} />
              </div>
            </motion.div>

            <motion.div whileHover={{ y: -4 }} className="glass-card p-6 flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Expiring (30 days)</span>
                <h3 className={`text-3xl font-bold mt-2 ${expiringCount > 0 ? 'text-amber-500' : 'text-slate-855'}`}>
                  {expiringCount}
                </h3>
              </div>
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${expiringCount > 0 ? 'bg-amber-100 dark:bg-amber-950/40 text-amber-500' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'}`}>
                <Calendar size={22} />
              </div>
            </motion.div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="glass-card p-6 lg:col-span-2 flex flex-col justify-between">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-bold text-slate-800 dark:text-slate-200">Revenue Transaction Analytics</h4>
                <span className="text-xs px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 font-semibold flex items-center gap-1.5">
                  <TrendingUp size={12} />
                  Recent Invoices
                </span>
              </div>
              <div className="h-64 w-full">
                {chartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.2}/>
                          <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" className="dark:stroke-slate-800" />
                      <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} tickLine={false} />
                      <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                      <Tooltip contentStyle={{ borderRadius: '12px', fontSize: '12px' }} />
                      <Area type="monotone" dataKey="amount" stroke="#0284c7" strokeWidth={2} fillOpacity={1} fill="url(#colorAmount)" />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-slate-400 text-sm">
                    No recent transactions recorded.
                  </div>
                )}
              </div>
            </div>

            <div className="glass-card p-6 flex flex-col justify-between">
              <h4 className="font-bold text-slate-800 dark:text-slate-200 mb-4">Inventory Expiry Timeline</h4>
              <div className="h-64 w-full">
                {totalMedicines > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={barData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" className="dark:stroke-slate-800" />
                      <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} />
                      <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                      <Tooltip contentStyle={{ borderRadius: '12px', fontSize: '12px' }} />
                      <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                        {barData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-slate-400 text-sm">
                    No medicine records available.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab: Registration Approvals */}
      {activeTab === 'approvals' && (
        <div className="glass-card p-6">
          <h4 className="font-bold text-slate-800 dark:text-slate-200 mb-4">Pending Registrations Approval Requests</h4>
          <div className="overflow-x-auto w-full">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 text-xs font-semibold uppercase tracking-wider">
                  <th className="py-3">Name</th>
                  <th className="py-3">Email</th>
                  <th className="py-3">Role</th>
                  <th className="py-3">Workspace Details</th>
                  <th className="py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {pendingUsers.length > 0 ? (
                  pendingUsers.map((u) => (
                    <tr key={u.id} className="border-b border-slate-100 dark:border-slate-800/20 hover:bg-slate-50/50 dark:hover:bg-slate-900/30">
                      <td className="py-4 font-semibold text-slate-800 dark:text-slate-200">{u.name}</td>
                      <td className="py-4 text-slate-600 dark:text-slate-400">{u.email}</td>
                      <td className="py-4">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-400">
                          {u.role}
                        </span>
                      </td>
                      <td className="py-4 text-xs text-slate-500">
                        {u.role === 'PHARMACIST' && `Pharmacy: ${u.pharmacyName || 'N/A'}, City: ${u.city || 'N/A'}`}
                        {u.role === 'SUPPLIER' && `GST: ${u.gstNumber || 'N/A'}, License: ${u.drugLicenseNumber || 'N/A'}`}
                        {u.role === 'STAFF' && `Requesting owner ID: ${u.ownerId || 'N/A'}`}
                      </td>
                      <td className="py-4 text-right flex justify-end gap-2">
                        <button 
                          onClick={() => approveMutation.mutate(u.id)}
                          className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-100 dark:bg-emerald-950/20 dark:text-emerald-400"
                          title="Approve registration"
                        >
                          <CheckCircle size={16} />
                        </button>
                        <button 
                          onClick={() => rejectMutation.mutate(u.id)}
                          className="p-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-950/20 dark:text-red-400"
                          title="Reject registration"
                        >
                          <XCircle size={16} />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="py-12 text-center text-slate-400 text-sm">No pending registrations found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab: Users Directory */}
      {activeTab === 'users' && (
        <div className="glass-card p-6">
          <h4 className="font-bold text-slate-800 dark:text-slate-200 mb-4">Accounts Directory Control</h4>
          <div className="overflow-x-auto w-full">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 text-xs font-semibold uppercase tracking-wider">
                  <th className="py-3">Name</th>
                  <th className="py-3">Email</th>
                  <th className="py-3">Role</th>
                  <th className="py-3">Status</th>
                  <th className="py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {approvedUsers.length > 0 ? (
                  approvedUsers.map((u) => (
                    <tr key={u.id} className="border-b border-slate-100 dark:border-slate-800/20 hover:bg-slate-50/50 dark:hover:bg-slate-900/30">
                      <td className="py-4 font-semibold text-slate-800 dark:text-slate-200">{u.name}</td>
                      <td className="py-4 text-slate-600 dark:text-slate-400">{u.email}</td>
                      <td className="py-4">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400">
                          {u.role}
                        </span>
                      </td>
                      <td className="py-4">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${u.status === 'BLOCKED' ? 'bg-red-150 text-red-650' : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400'}`}>
                          {u.status}
                        </span>
                      </td>
                      <td className="py-4 text-right flex justify-end gap-2">
                        {u.status === 'BLOCKED' ? (
                          <button 
                            onClick={() => unblockMutation.mutate(u.id)}
                            className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-100 dark:bg-emerald-950/20 dark:text-emerald-400"
                            title="Unblock User"
                          >
                            <Unlock size={16} />
                          </button>
                        ) : (
                          <button 
                            onClick={() => blockMutation.mutate(u.id)}
                            className="p-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-950/20 dark:text-red-400"
                            title="Block User"
                          >
                            <Lock size={16} />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="py-12 text-center text-slate-400 text-sm">No registered users found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab: System Logs */}
      {activeTab === 'logs' && (
        <div className="glass-card p-6">
          <div className="flex items-center gap-2 mb-4">
            <FileText className="text-sky-500" size={18} />
            <h4 className="font-bold text-slate-800 dark:text-slate-200">System Logs / Audit Trail</h4>
          </div>
          <div className="overflow-x-auto w-full bg-slate-950 text-slate-300 p-4 rounded-2xl font-mono text-xs max-h-96 overflow-y-auto space-y-2">
            {sysLogs && sysLogs.length > 0 ? (
              sysLogs.map((log, index) => (
                <div key={index} className="flex gap-4 border-b border-slate-900 pb-1.5 last:border-0">
                  <span className="text-slate-500 shrink-0">{log.timestamp}</span>
                  <span className="text-sky-400 shrink-0">[{log.module}]</span>
                  <span className={`shrink-0 ${log.level === 'ERROR' ? 'text-red-500' : 'text-emerald-400'}`}>{log.level}</span>
                  <span className="text-slate-200">{log.message}</span>
                </div>
              ))
            ) : (
              <div className="text-center py-6 text-slate-500">No logs found.</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
