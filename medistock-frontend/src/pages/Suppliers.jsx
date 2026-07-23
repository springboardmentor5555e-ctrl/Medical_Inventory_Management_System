import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axiosInstance from '../services/axiosInstance';
import { useAuth } from '../context/AuthContext';
import { useForm } from 'react-hook-form';
import { Plus, Edit, Trash2, Mail, Phone, MapPin, X, Check, Search } from 'lucide-react';
import { toast } from 'sonner';

const Suppliers = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [editingSupplier, setEditingSupplier] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const canEdit = ['ADMIN', 'PHARMACIST'].includes(user.role);
  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm();

  // 1. Fetch Suppliers
  const { data: suppliers = [], isLoading } = useQuery({
    queryKey: ['suppliers'],
    queryFn: () => axiosInstance.get('/api/suppliers').then(res => res.data)
  });

  // 2. Save Supplier Mutation (Create or Update)
  const saveMutation = useMutation({
    mutationFn: (data) => {
      if (editingSupplier) {
        return axiosInstance.put(`/api/suppliers/${editingSupplier.id}`, data);
      } else {
        return axiosInstance.post('/api/suppliers', data);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['suppliers']);
      toast.success(editingSupplier ? 'Supplier updated successfully!' : 'Supplier added successfully!');
      closeModal();
    },
    onError: (err) => {
      const msg = err.response?.data?.message || 'Failed to save supplier details.';
      toast.error(msg);
    }
  });

  // 3. Delete Supplier Mutation
  const deleteMutation = useMutation({
    mutationFn: (id) => axiosInstance.delete(`/api/suppliers/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries(['suppliers']);
      toast.success('Supplier deleted successfully.');
    },
    onError: (err) => {
      const msg = err.response?.data?.message || 'Failed to delete supplier.';
      toast.error(msg);
    }
  });

  const handleDelete = (id, name) => {
    if (window.confirm(`Are you sure you want to delete ${name}?`)) {
      deleteMutation.mutate(id);
    }
  };

  const openAddModal = () => {
    setEditingSupplier(null);
    reset({ name: '', phone: '', email: '', address: '' });
    setIsModalOpen(true);
  };

  const openEditModal = (supplier) => {
    setEditingSupplier(supplier);
    reset({
      name: supplier.name,
      phone: supplier.phone || '',
      email: supplier.email || '',
      address: supplier.address || ''
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingSupplier(null);
  };

  const onSubmit = (data) => {
    saveMutation.mutate(data);
  };

  // Filter in memory by name/email/phone
  const filteredSuppliers = suppliers.filter(sup => 
    sup.name.toLowerCase().includes(search.toLowerCase()) ||
    (sup.email && sup.email.toLowerCase().includes(search.toLowerCase())) ||
    (sup.phone && sup.phone.includes(search))
  );

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-800 dark:text-slate-100">
            Supplier Partners
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Manage logistics, details, and wholesale directories.
          </p>
        </div>
        {canEdit && (
          <button 
            onClick={openAddModal}
            className="flex items-center gap-1.5 px-4 py-2 bg-sky-500 hover:bg-sky-600 text-white rounded-xl text-sm font-semibold shadow-sm transition-colors"
          >
            <Plus size={16} />
            <span>Add Supplier</span>
          </button>
        )}
      </div>

      {/* Lookup filter */}
      <div className="glass-card p-4 relative max-w-md">
        <span className="absolute inset-y-0 left-0 pl-7 flex items-center text-slate-400 pointer-events-none">
          <Search size={16} />
        </span>
        <input
          type="text"
          placeholder="Filter by supplier name, phone, email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-slate-100 dark:bg-slate-800 text-slate-850 dark:text-slate-200 pl-10 pr-4 py-2 rounded-xl text-sm border border-transparent focus:outline-none focus:ring-2 focus:ring-sky-500/50 transition-all"
        />
      </div>

      {/* Datatable list */}
      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-50 dark:bg-slate-800/40 text-slate-500 border-b border-slate-200 dark:border-slate-800 text-xs font-semibold uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4">Name</th>
                <th className="px-6 py-4">Phone</th>
                <th className="px-6 py-4">Email</th>
                <th className="px-6 py-4">Address</th>
                {canEdit && <th className="px-6 py-4 text-center">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200/50 dark:divide-slate-800/30">
              {isLoading ? (
                [...Array(3)].map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan="5" className="px-6 py-5"><div className="h-4 bg-slate-200 dark:bg-slate-800 rounded"></div></td>
                  </tr>
                ))
              ) : filteredSuppliers.length > 0 ? (
                filteredSuppliers.map((sup) => (
                  <tr key={sup.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/20 transition-colors">
                    <td className="px-6 py-4 font-semibold text-slate-800 dark:text-slate-100">{sup.name}</td>
                    <td className="px-6 py-4 text-slate-500 font-mono text-xs">
                      {sup.phone ? (
                        <span className="flex items-center gap-1.5"><Phone size={13} /> {sup.phone}</span>
                      ) : 'N/A'}
                    </td>
                    <td className="px-6 py-4 text-slate-500 text-xs">
                      {sup.email ? (
                        <span className="flex items-center gap-1.5"><Mail size={13} /> {sup.email}</span>
                      ) : 'N/A'}
                    </td>
                    <td className="px-6 py-4 text-slate-500 text-xs max-w-xs truncate">
                      {sup.address ? (
                        <span className="flex items-center gap-1.5"><MapPin size={13} /> {sup.address}</span>
                      ) : 'N/A'}
                    </td>
                    {canEdit && (
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => openEditModal(sup)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-sky-500 hover:bg-sky-50 dark:hover:bg-sky-950/20 transition-colors"
                            title="Edit"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            onClick={() => handleDelete(sup.id, sup.name)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors"
                            title="Delete"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-slate-400 text-sm">No suppliers registered.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Overlay Modal for Create / Edit */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-xl p-6 overflow-hidden relative">
            
            <button 
              onClick={closeModal}
              className="absolute top-4 right-4 p-1 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X size={18} />
            </button>

            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-150 mb-4">
              {editingSupplier ? 'Modify Supplier' : 'Add Supplier Partner'}
            </h3>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {/* Name */}
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5 pl-1">Supplier Name</label>
                <input
                  type="text"
                  placeholder="Pfizer International"
                  {...register('name', { required: 'Name is required' })}
                  className="w-full bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 px-4 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/50 border border-transparent focus:border-sky-500 transition-all"
                />
                {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
              </div>

              {/* Phone */}
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5 pl-1">Phone Number</label>
                <input
                  type="text"
                  placeholder="+1 (555) 019-2834"
                  {...register('phone')}
                  className="w-full bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 px-4 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/50 border border-transparent focus:border-sky-500 transition-all"
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5 pl-1">Email Address</label>
                <input
                  type="email"
                  placeholder="contact@pfizer.com"
                  {...register('email', { 
                    pattern: { value: /^\S+@\S+$/i, message: 'Invalid email format' }
                  })}
                  className="w-full bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 px-4 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/50 border border-transparent focus:border-sky-500 transition-all"
                />
                {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
              </div>

              {/* Address */}
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5 pl-1">Office Address</label>
                <textarea
                  rows="2"
                  placeholder="235 East 42nd Street, New York, NY"
                  {...register('address')}
                  className="w-full bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 px-4 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/50 border border-transparent focus:border-sky-500 transition-all resize-none"
                ></textarea>
              </div>

              {/* Buttons */}
              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 rounded-xl text-sm font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-750 dark:text-slate-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saveMutation.isLoading}
                  className="px-5 py-2.5 rounded-xl text-sm font-semibold bg-sky-500 hover:bg-sky-600 text-white shadow-sm flex items-center gap-1 disabled:opacity-50 transition-colors"
                >
                  {saveMutation.isLoading ? (
                    <span className="w-4 h-4 border-2 border-t-transparent border-white rounded-full animate-spin"></span>
                  ) : (
                    <Check size={16} />
                  )}
                  <span>Save Partner</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Suppliers;
