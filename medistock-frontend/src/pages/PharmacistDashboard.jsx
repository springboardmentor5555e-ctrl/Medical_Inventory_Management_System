import React from 'react';
import { useQuery } from '@tanstack/react-query';
import axiosInstance from '../services/axiosInstance';
import { Pill, AlertTriangle, Calendar, Plus, RefreshCw, Users, ShieldAlert } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const PharmacistDashboard = () => {
  const { data: medicinesRes, isLoading: medLoading } = useQuery({
    queryKey: ['medicines'],
    queryFn: () => axiosInstance.get('/api/medicines?size=1000').then(res => res.data)
  });

  const { data: lowStockRes, isLoading: lowLoading } = useQuery({
    queryKey: ['lowStock'],
    queryFn: () => axiosInstance.get('/api/medicines/low-stock').then(res => res.data)
  });

  const { data: expiringRes, isLoading: expiringLoading } = useQuery({
    queryKey: ['expiring'],
    queryFn: () => axiosInstance.get('/api/medicines/expiring?days=30').then(res => res.data)
  });

  const loading = medLoading || lowLoading || expiringLoading;

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 w-48 bg-slate-200 dark:bg-slate-800 rounded"></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-32 bg-slate-200 dark:bg-slate-800 rounded-2xl"></div>
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="h-64 bg-slate-200 dark:bg-slate-800 rounded-2xl"></div>
          <div className="h-64 bg-slate-200 dark:bg-slate-800 rounded-2xl"></div>
        </div>
      </div>
    );
  }

  const medicines = medicinesRes?.content || medicinesRes || [];
  const lowStock = lowStockRes || [];
  const expiring = expiringRes || [];

  return (
    <div className="space-y-6">
      {/* Title Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-800 dark:text-slate-100">
            Pharmacist Workspace
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Real-time stock alerts and replenishment center.
          </p>
        </div>
        
        {/* Quick Actions Shortcuts */}
        <div className="flex gap-2">
          <Link 
            to="/pharmacist/medicines/add" 
            className="flex items-center gap-1.5 px-4 py-2 bg-sky-500 hover:bg-sky-600 text-white rounded-xl text-sm font-semibold shadow-sm transition-colors"
          >
            <Plus size={16} />
            <span>Add Medicine</span>
          </Link>
          <Link 
            to="/pharmacist/reorders" 
            className="flex items-center gap-1.5 px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-sm font-semibold transition-colors"
          >
            <RefreshCw size={16} />
            <span>Procurements</span>
          </Link>
          <Link 
            to="/pharmacist/suppliers" 
            className="flex items-center gap-1.5 px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-sm font-semibold transition-colors"
          >
            <Users size={16} />
            <span>Suppliers</span>
          </Link>
        </div>
      </div>

      {/* KPI stats metrics summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div whileHover={{ y: -3 }} className="glass-card p-6 flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Total Products</span>
            <h3 className="text-3xl font-bold text-slate-850 dark:text-slate-100 mt-2">{medicines.length}</h3>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-sky-100 dark:bg-sky-950/40 text-sky-600 dark:text-sky-400 flex items-center justify-center">
            <Pill size={22} />
          </div>
        </motion.div>

        <motion.div whileHover={{ y: -3 }} className="glass-card p-6 flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Low Stock Warnings</span>
            <h3 className={`text-3xl font-bold mt-2 ${lowStock.length > 0 ? 'text-red-500' : 'text-slate-800 dark:text-slate-100'}`}>
              {lowStock.length}
            </h3>
          </div>
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${lowStock.length > 0 ? 'bg-red-100 dark:bg-red-950/40 text-red-500' : 'bg-slate-100 dark:bg-slate-850 text-slate-500'}`}>
            <AlertTriangle size={22} />
          </div>
        </motion.div>

        <motion.div whileHover={{ y: -3 }} className="glass-card p-6 flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Near-Expiry Batches</span>
            <h3 className={`text-3xl font-bold mt-2 ${expiring.length > 0 ? 'text-amber-500' : 'text-slate-800 dark:text-slate-100'}`}>
              {expiring.length}
            </h3>
          </div>
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${expiring.length > 0 ? 'bg-amber-100 dark:bg-amber-950/40 text-amber-500' : 'bg-slate-100 dark:bg-slate-850 text-slate-500'}`}>
            <Calendar size={22} />
          </div>
        </motion.div>
      </div>

      {/* Critical Lists Split views */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Low Stock Alerts */}
        <div className="glass-card p-6 flex flex-col justify-between">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="text-red-500" size={18} />
            <h4 className="font-bold text-slate-850 dark:text-slate-200">Critical Stock Deficits</h4>
          </div>

          <div className="max-h-80 overflow-y-auto space-y-3 pr-2">
            {lowStock.length > 0 ? (
              lowStock.map((med) => (
                <div key={med.id} className="flex justify-between items-center p-3 rounded-xl bg-red-50/50 dark:bg-red-950/10 border border-red-100/50 dark:border-red-950/20">
                  <div>
                    <h5 className="font-semibold text-sm text-slate-800 dark:text-slate-200">{med.name}</h5>
                    <p className="text-xs text-slate-500 mt-0.5">Barcode: {med.barcode || 'N/A'}</p>
                  </div>
                  <div className="text-right">
                    <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400">
                      {med.quantity} Units Left
                    </span>
                    <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1">Reorder Level: {med.reorderLevel}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-12 text-center text-slate-400 text-sm">No items are currently below reorder levels.</div>
            )}
          </div>
        </div>

        {/* Expiring Medicines Alerts */}
        <div className="glass-card p-6 flex flex-col justify-between">
          <div className="flex items-center gap-2 mb-4">
            <ShieldAlert className="text-amber-500" size={18} />
            <h4 className="font-bold text-slate-850 dark:text-slate-200">Batches Expiring (30 Days)</h4>
          </div>

          <div className="max-h-80 overflow-y-auto space-y-3 pr-2">
            {expiring.length > 0 ? (
              expiring.map((med) => (
                <div key={med.id} className="flex justify-between items-center p-3 rounded-xl bg-amber-50/50 dark:bg-amber-950/10 border border-amber-100/50 dark:border-amber-950/20">
                  <div>
                    <h5 className="font-semibold text-sm text-slate-800 dark:text-slate-200">{med.name}</h5>
                    <p className="text-xs text-slate-500 mt-0.5">Batch: {med.batchNumber || 'N/A'}</p>
                  </div>
                  <div className="text-right">
                    <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400">
                      {med.expiryDate}
                    </span>
                    <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1">Quantity: {med.quantity}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-12 text-center text-slate-400 text-sm">No medicines are close to expiry.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PharmacistDashboard;
