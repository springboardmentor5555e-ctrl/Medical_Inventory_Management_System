import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axiosInstance from '../services/axiosInstance';
import { useForm } from 'react-hook-form';
import { RefreshCw, Plus, Calendar, User, ShoppingBag, CheckCircle, ArrowRight, X } from 'lucide-react';
import { toast } from 'sonner';

const ReorderRequests = () => {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('PENDING'); // PENDING, ORDERED, RECEIVED
  const [isFormOpen, setIsFormOpen] = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  // 1. Fetch Reorder Requests
  const { data: reorders = [], isLoading } = useQuery({
    queryKey: ['reorders'],
    queryFn: () => axiosInstance.get('/api/reorders').then(res => res.data)
  });

  // 2. Fetch Medicines for Creation Dropdown
  const { data: medicinesPage } = useQuery({
    queryKey: ['reorderMedicinesList'],
    queryFn: () => axiosInstance.get('/api/medicines?size=1000').then(res => res.data)
  });
  const medicines = medicinesPage?.content || medicinesPage || [];

  // 3. Fetch Suppliers for Creation Dropdown
  const { data: suppliers = [] } = useQuery({
    queryKey: ['reorderSuppliersList'],
    queryFn: () => axiosInstance.get('/api/suppliers').then(res => res.data)
  });

  // 4. Create Reorder Mutation
  const createMutation = useMutation({
    mutationFn: (data) => axiosInstance.post('/api/reorders', {
      medicineId: Number(data.medicineId),
      quantity: Number(data.quantity),
      supplierId: data.supplierId ? Number(data.supplierId) : null
    }),
    onSuccess: () => {
      queryClient.invalidateQueries(['reorders']);
      toast.success('Procurement request generated successfully!');
      setIsFormOpen(false);
      reset();
    },
    onError: (err) => {
      const msg = err.response?.data?.message || 'Failed to generate reorder request.';
      toast.error(msg);
    }
  });

  // 5. Update Status Mutation
  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }) => axiosInstance.put(`/api/reorders/${id}/status?status=${status}`),
    onSuccess: (data) => {
      queryClient.invalidateQueries(['reorders']);
      queryClient.invalidateQueries(['medicines']); // Refresh medicines stock if received
      toast.success(`Procurement state updated to ${data.data.status}`);
    },
    onError: (err) => {
      const msg = err.response?.data?.message || 'Failed to update reorder status.';
      toast.error(msg);
    }
  });

  const onSubmit = (data) => {
    createMutation.mutate(data);
  };

  const handleUpdateStatus = (id, newStatus) => {
    updateStatusMutation.mutate({ id, status: newStatus });
  };

  const filteredReorders = reorders.filter(r => r.status === activeTab);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-800 dark:text-slate-100">
            Procurement Reorders
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Request restocks, track purchase order paths, and receive shipments.
          </p>
        </div>
        <button
          onClick={() => setIsFormOpen(!isFormOpen)}
          className="flex items-center gap-1.5 px-4 py-2 bg-sky-500 hover:bg-sky-600 text-white rounded-xl text-sm font-semibold shadow-sm transition-colors"
        >
          <Plus size={16} />
          <span>New Reorder Request</span>
        </button>
      </div>

      {/* Manual Request Creator Form Drawer (inline collapsible) */}
      {isFormOpen && (
        <div className="glass-card p-6 border border-sky-200/50 dark:border-sky-900/30 relative">
          <button 
            onClick={() => setIsFormOpen(false)}
            className="absolute top-4 right-4 p-1 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X size={16} />
          </button>
          
          <h3 className="font-bold text-slate-850 dark:text-slate-200 mb-4 flex items-center gap-2">
            <ShoppingBag size={18} className="text-sky-500" />
            Create Purchase Order
          </h3>

          <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            {/* Medicine select */}
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5 pl-1">Select Medicine</label>
              <select
                {...register('medicineId', { required: 'Please select a medicine' })}
                className="w-full bg-slate-100 dark:bg-slate-800 text-slate-850 dark:text-slate-200 px-4 py-2 rounded-xl text-sm border border-transparent focus:outline-none focus:ring-2 focus:ring-sky-500/50 transition-all"
              >
                <option value="">Select...</option>
                {medicines.map(m => <option key={m.id} value={m.id}>{m.name} (Stock: {m.quantity})</option>)}
              </select>
              {errors.medicineId && <p className="text-red-500 text-xs mt-1">{errors.medicineId.message}</p>}
            </div>

            {/* Quantity */}
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5 pl-1">Procurement Qty</label>
              <input
                type="number"
                placeholder="50"
                {...register('quantity', { 
                  required: 'Quantity is required',
                  min: { value: 1, message: 'Must be at least 1' }
                })}
                className="w-full bg-slate-100 dark:bg-slate-800 text-slate-850 dark:text-slate-200 px-4 py-2 rounded-xl text-sm border border-transparent focus:outline-none focus:ring-2 focus:ring-sky-500/50 transition-all"
              />
              {errors.quantity && <p className="text-red-500 text-xs mt-1">{errors.quantity.message}</p>}
            </div>

            {/* Supplier select */}
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5 pl-1">Supplier (Optional)</label>
              <select
                {...register('supplierId')}
                className="w-full bg-slate-100 dark:bg-slate-800 text-slate-850 dark:text-slate-200 px-4 py-2 rounded-xl text-sm border border-transparent focus:outline-none focus:ring-2 focus:ring-sky-500/50 transition-all"
              >
                <option value="">Default Product Supplier</option>
                {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={createMutation.isLoading}
              className="w-full bg-sky-500 hover:bg-sky-600 text-white font-semibold py-2 rounded-xl text-sm transition-all focus:outline-none focus:ring-2 focus:ring-sky-500/50 disabled:opacity-50 flex justify-center items-center gap-1.5"
            >
              {createMutation.isLoading ? (
                <span className="w-4 h-4 border-2 border-t-transparent border-white rounded-full animate-spin"></span>
              ) : (
                <CheckCircle size={16} />
              )}
              <span>Dispatch Request</span>
            </button>
          </form>
        </div>
      )}

      {/* Tabs Menu navigation */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 gap-6 text-sm">
        {['PENDING', 'ORDERED', 'RECEIVED'].map((status) => (
          <button
            key={status}
            onClick={() => setActiveTab(status)}
            className={`pb-3 font-semibold transition-all relative ${
              activeTab === status 
                ? 'text-sky-600 dark:text-sky-400' 
                : 'text-slate-550 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
          >
            <span className="capitalize">{status.toLowerCase()} Board</span>
            {activeTab === status && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-sky-500 rounded-full"></span>
            )}
          </button>
        ))}
      </div>

      {/* Procurement Board rendering */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          [...Array(3)].map((_, i) => (
            <div key={i} className="h-40 bg-slate-200 dark:bg-slate-800 rounded-2xl animate-pulse"></div>
          ))
        ) : filteredReorders.length > 0 ? (
          filteredReorders.map((req) => (
            <div key={req.id} className="glass-card p-5 space-y-4 flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start">
                  <h4 className="font-bold text-slate-850 dark:text-slate-200 text-sm truncate max-w-[70%]">
                    {req.medicineName}
                  </h4>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                    req.status === 'PENDING' 
                      ? 'bg-amber-100 text-amber-700' 
                      : req.status === 'ORDERED' 
                        ? 'bg-sky-100 text-sky-700' 
                        : 'bg-emerald-100 text-emerald-700'
                  }`}>
                    {req.status}
                  </span>
                </div>
                
                <div className="mt-3 space-y-1.5 text-xs text-slate-500">
                  <div className="flex items-center gap-1.5">
                    <ShoppingBag size={12} className="shrink-0" />
                    <span>Quantity: <strong>{req.quantity} Units</strong></span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <User size={12} className="shrink-0" />
                    <span className="truncate">Supplier: {req.supplierName || 'N/A'}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Calendar size={12} className="shrink-0" />
                    <span>Created: {new Date(req.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>

              {/* Status Update Buttons */}
              {req.status !== 'RECEIVED' && (
                <button
                  onClick={() => handleUpdateStatus(req.id, req.status === 'PENDING' ? 'ORDERED' : 'RECEIVED')}
                  disabled={updateStatusMutation.isLoading}
                  className="w-full mt-3 flex items-center justify-center gap-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-250 py-2 rounded-xl text-xs font-semibold transition-all"
                >
                  <span>{req.status === 'PENDING' ? 'Authorize Order' : 'Mark as Received'}</span>
                  <ArrowRight size={12} />
                </button>
              )}
            </div>
          ))
        ) : (
          <div className="py-12 text-center text-slate-400 text-sm md:col-span-3">
            No procurement orders found in this status.
          </div>
        )}
      </div>
    </div>
  );
};

export default ReorderRequests;
