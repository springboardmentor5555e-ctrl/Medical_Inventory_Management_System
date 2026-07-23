import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axiosInstance from '../services/axiosInstance';
import { motion } from 'framer-motion';
import { 
  ShoppingBag, 
  DollarSign, 
  Users, 
  Truck, 
  TrendingUp, 
  Check, 
  X, 
  Package, 
  Calendar,
  Pill,
  Send,
  UserCheck
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell
} from 'recharts';
import { toast } from 'sonner';

const SupplierDashboard = () => {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('orders');

  // Fetch reorder requests sent to this supplier
  const { data: ordersList, isLoading: ordersLoading } = useQuery({
    queryKey: ['supplierOrders'],
    queryFn: () => axiosInstance.get('/api/reorders').then(res => res.data)
  });

  // Fetch partnerships
  const { data: partnerships, isLoading: partnershipsLoading } = useQuery({
    queryKey: ['supplierPartnerships'],
    queryFn: () => axiosInstance.get('/api/partnerships').then(res => res.data)
  });

  // Status updates mutations
  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }) => axiosInstance.put(`/api/reorders/${id}?status=${status}`),
    onSuccess: () => {
      queryClient.invalidateQueries(['supplierOrders']);
      toast.success("Order status updated!");
    }
  });

  const acceptPartnerMutation = useMutation({
    mutationFn: (id) => axiosInstance.post(`/api/partnerships/${id}/accept`),
    onSuccess: () => {
      queryClient.invalidateQueries(['supplierPartnerships']);
      toast.success("Partnership accepted!");
    }
  });

  const rejectPartnerMutation = useMutation({
    mutationFn: (id) => axiosInstance.post(`/api/partnerships/${id}/reject`),
    onSuccess: () => {
      queryClient.invalidateQueries(['supplierPartnerships']);
      toast.info("Partnership rejected.");
    }
  });

  const loading = ordersLoading || partnershipsLoading;

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 w-48 bg-slate-200 dark:bg-slate-800 rounded"></div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 bg-slate-200 dark:bg-slate-800 rounded-2xl"></div>
          ))}
        </div>
        <div className="h-64 bg-slate-200 dark:bg-slate-800 rounded-2xl"></div>
      </div>
    );
  }

  const orders = ordersList || [];
  const activePartnerships = partnerships?.filter(p => p.status === 'ACCEPTED') || [];
  const pendingPartnerships = partnerships?.filter(p => p.status === 'PENDING') || [];

  // Compute metrics
  const totalOrders = orders.length;
  const completedOrders = orders.filter(o => o.status === 'DELIVERED' || o.status === 'RECEIVED').length;
  const activeOrdersCount = totalOrders - completedOrders - orders.filter(o => o.status === 'CANCELLED' || o.status === 'REJECTED').length;
  const supplierRevenue = orders
    .filter(o => o.status === 'DELIVERED' || o.status === 'RECEIVED')
    .reduce((acc, curr) => acc + (curr.quantity * 5.0), 0); // Mock unit pricing base value for dashboard revenue

  // Process chart data
  const chartData = [
    { name: 'Jan', orders: 2, revenue: 120 },
    { name: 'Feb', orders: 4, revenue: 240 },
    { name: 'Mar', orders: 3, revenue: 180 },
    { name: 'Apr', orders: 6, revenue: 420 },
    { name: 'May', orders: 5, revenue: 310 },
    { name: 'Jun', orders: totalOrders, revenue: supplierRevenue }
  ];

  return (
    <div className="space-y-6">
      {/* Title Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-800 dark:text-slate-100">
            Supplier Operations Center
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Accept procurements, dispatch packages, and manage connected stores.
          </p>
        </div>

        <div className="flex gap-2 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
          <button 
            onClick={() => setActiveTab('orders')}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${activeTab === 'orders' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            Procurements ({activeOrdersCount})
          </button>
          <button 
            onClick={() => setActiveTab('partnerships')}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-1.5 ${activeTab === 'partnerships' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            Partnerships
            {pendingPartnerships.length > 0 && <span className="bg-sky-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">{pendingPartnerships.length}</span>}
          </button>
          <button 
            onClick={() => setActiveTab('analytics')}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${activeTab === 'analytics' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            Analytics
          </button>
        </div>
      </div>

      {/* KPI Stats summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div whileHover={{ y: -3 }} className="glass-card p-6 flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Active Deliveries</span>
            <h3 className="text-3xl font-bold text-slate-850 dark:text-slate-100 mt-2">{activeOrdersCount}</h3>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-sky-100 dark:bg-sky-950/40 text-sky-600 dark:text-sky-400 flex items-center justify-center">
            <Truck size={22} />
          </div>
        </motion.div>

        <motion.div whileHover={{ y: -3 }} className="glass-card p-6 flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Total Orders</span>
            <h3 className="text-3xl font-bold text-slate-850 dark:text-slate-100 mt-2">{totalOrders}</h3>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <ShoppingBag size={22} />
          </div>
        </motion.div>

        <motion.div whileHover={{ y: -3 }} className="glass-card p-6 flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Store Partners</span>
            <h3 className="text-3xl font-bold text-slate-850 dark:text-slate-100 mt-2">{activePartnerships.length}</h3>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-indigo-100 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
            <Users size={22} />
          </div>
        </motion.div>

        <motion.div whileHover={{ y: -3 }} className="glass-card p-6 flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Estimated Earnings</span>
            <h3 className="text-3xl font-bold text-emerald-600 dark:text-emerald-400 mt-2">${supplierRevenue.toFixed(2)}</h3>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <DollarSign size={22} />
          </div>
        </motion.div>
      </div>

      {/* Tab: Procurements (Reorders List) */}
      {activeTab === 'orders' && (
        <div className="glass-card p-6">
          <h4 className="font-bold text-slate-800 dark:text-slate-200 mb-4">Pharmacy Purchase Orders</h4>
          <div className="overflow-x-auto w-full">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 text-xs font-semibold uppercase tracking-wider">
                  <th className="py-3">Order #</th>
                  <th className="py-3">Medicine</th>
                  <th className="py-3">Quantity</th>
                  <th className="py-3">Date</th>
                  <th className="py-3">Status</th>
                  <th className="py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.length > 0 ? (
                  orders.map((o) => (
                    <tr key={o.id} className="border-b border-slate-100 dark:border-slate-800/20 hover:bg-slate-50/50 dark:hover:bg-slate-900/30">
                      <td className="py-4 font-semibold text-slate-700 dark:text-slate-350">PO-#{o.id}</td>
                      <td className="py-4">
                        <span className="font-medium text-slate-800 dark:text-slate-200">{o.medicineName}</span>
                      </td>
                      <td className="py-4 text-slate-600 dark:text-slate-400 font-semibold">{o.quantity} units</td>
                      <td className="py-4 text-slate-500">
                        {new Date(o.createdAt).toLocaleDateString(undefined, {month: 'short', day: 'numeric', hour: '2-digit', minute:'2-digit'})}
                      </td>
                      <td className="py-4">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          o.status === 'PENDING' ? 'bg-amber-100 text-amber-700' :
                          o.status === 'ACCEPTED' || o.status === 'PACKED' ? 'bg-sky-100 text-sky-700' :
                          o.status === 'DISPATCHED' || o.status === 'OUT_FOR_DELIVERY' ? 'bg-indigo-100 text-indigo-700' :
                          o.status === 'DELIVERED' || o.status === 'RECEIVED' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
                        }`}>
                          {o.status}
                        </span>
                      </td>
                      <td className="py-4 text-right flex justify-end gap-2">
                        {o.status === 'PENDING' && (
                          <>
                            <button 
                              onClick={() => updateStatusMutation.mutate({ id: o.id, status: 'ACCEPTED' })}
                              className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-100"
                              title="Accept Order"
                            >
                              <Check size={14} />
                            </button>
                            <button 
                              onClick={() => updateStatusMutation.mutate({ id: o.id, status: 'REJECTED' })}
                              className="p-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100"
                              title="Reject Order"
                            >
                              <X size={14} />
                            </button>
                          </>
                        )}
                        {o.status !== 'PENDING' && o.status !== 'DELIVERED' && o.status !== 'RECEIVED' && o.status !== 'CANCELLED' && o.status !== 'REJECTED' && (
                          <select 
                            onChange={(e) => updateStatusMutation.mutate({ id: o.id, status: e.target.value })}
                            defaultValue={o.status}
                            className="bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1 text-xs outline-none focus:ring-1 focus:ring-sky-500"
                          >
                            <option value="ACCEPTED">Accepted</option>
                            <option value="PACKED">Packed</option>
                            <option value="DISPATCHED">Dispatched</option>
                            <option value="OUT_FOR_DELIVERY">Out For Delivery</option>
                            <option value="DELIVERED">Delivered</option>
                            <option value="CANCELLED">Cancel Order</option>
                          </select>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="py-12 text-center text-slate-400 text-sm">No reorder procurements received.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab: Partnerships */}
      {activeTab === 'partnerships' && (
        <div className="space-y-6">
          {/* Pending partnership requests */}
          <div className="glass-card p-6">
            <h4 className="font-bold text-slate-800 dark:text-slate-200 mb-4 flex items-center gap-2">
              <UserCheck size={18} className="text-amber-500" />
              Incoming Partnership Invitations
            </h4>
            <div className="overflow-x-auto w-full">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 text-xs font-semibold uppercase tracking-wider">
                    <th className="py-3">Pharmacy Owner ID</th>
                    <th className="py-3">Status</th>
                    <th className="py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {pendingPartnerships.length > 0 ? (
                    pendingPartnerships.map((p) => (
                      <tr key={p.id} className="border-b border-slate-100 dark:border-slate-800/20 hover:bg-slate-50/50">
                        <td className="py-4 font-semibold text-slate-800 dark:text-slate-200">Owner User ID: #{p.pharmacyOwnerId}</td>
                        <td className="py-4">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-700">
                            {p.status}
                          </span>
                        </td>
                        <td className="py-4 text-right flex justify-end gap-2">
                          <button 
                            onClick={() => acceptPartnerMutation.mutate(p.id)}
                            className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-100"
                            title="Accept Partnership"
                          >
                            <Check size={14} />
                          </button>
                          <button 
                            onClick={() => rejectPartnerMutation.mutate(p.id)}
                            className="p-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100"
                            title="Reject Partnership"
                          >
                            <X size={14} />
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="3" className="py-6 text-center text-slate-400 text-sm">No pending partnership requests.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Connected pharmacies list */}
          <div className="glass-card p-6">
            <h4 className="font-bold text-slate-800 dark:text-slate-200 mb-4">Connected Active Pharmacy Clients</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {activePartnerships.length > 0 ? (
                activePartnerships.map((p) => (
                  <div key={p.id} className="p-4 rounded-2xl border border-slate-200/50 dark:border-slate-800/40 bg-slate-50/50 dark:bg-slate-900/30 flex justify-between items-center">
                    <div>
                      <h5 className="font-bold text-slate-800 dark:text-slate-200 text-sm">Pharmacy Partner</h5>
                      <p className="text-xs text-slate-500 mt-0.5">Owner ID: #{p.pharmacyOwnerId}</p>
                      <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1">Joined: {new Date(p.createdAt).toLocaleDateString()}</p>
                    </div>
                    <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400">
                      CONNECTED
                    </span>
                  </div>
                ))
              ) : (
                <div className="col-span-full py-8 text-center text-slate-400 text-sm">No connected partner pharmacies.</div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Tab: Analytics */}
      {activeTab === 'analytics' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="glass-card p-6 flex flex-col justify-between">
            <h4 className="font-bold text-slate-800 dark:text-slate-200 mb-4">Procurement Revenue Analytics</h4>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" className="dark:stroke-slate-800" vertical={false} />
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                  <Tooltip />
                  <Area type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorRev)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="glass-card p-6 flex flex-col justify-between">
            <h4 className="font-bold text-slate-800 dark:text-slate-200 mb-4">Orders Distribution Profile</h4>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" className="dark:stroke-slate-800" vertical={false} />
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                  <Tooltip />
                  <Bar dataKey="orders" fill="#0284c7" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SupplierDashboard;
