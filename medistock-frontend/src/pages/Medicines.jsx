import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axiosInstance from '../services/axiosInstance';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { Search, Plus, Edit, Trash2, ChevronLeft, ChevronRight, Filter, RefreshCw, Eye } from 'lucide-react';
import { toast } from 'sonner';

const Medicines = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  // State variables for search, filter, sorting, and pagination
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedSupplier, setSelectedSupplier] = useState('');
  const [page, setPage] = useState(0);
  const [size] = useState(10);
  const [sortBy, setSortBy] = useState('id');
  const [sortDir, setSortDir] = useState('asc');

  const baseRoute = `/${user.role.toLowerCase()}`;
  const canEdit = ['ADMIN', 'PHARMACIST'].includes(user.role);

  // 1. Fetch Categories for Filter Dropdown
  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: () => axiosInstance.get('/api/categories').then(res => res.data)
  });

  // 2. Fetch Suppliers for Filter Dropdown
  const { data: suppliers } = useQuery({
    queryKey: ['suppliers'],
    queryFn: () => axiosInstance.get('/api/suppliers').then(res => res.data)
  });

  // 3. Fetch Medicines Page
  const { data: medicinesPage, isLoading, refetch } = useQuery({
    queryKey: ['medicines', search, page, sortBy, sortDir],
    queryFn: () => axiosInstance.get('/api/medicines', {
      params: {
        search: search.trim() || undefined,
        page,
        size,
        sortBy,
        direction: sortDir
      }
    }).then(res => res.data)
  });

  // 4. Delete Medicine Mutation
  const deleteMutation = useMutation({
    mutationFn: (id) => axiosInstance.delete(`/api/medicines/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries(['medicines']);
      toast.success('Medicine successfully deleted.');
    },
    onError: (err) => {
      const msg = err.response?.data?.message || 'Failed to delete medicine.';
      toast.error(msg);
    }
  });

  const handleDelete = (id, name) => {
    if (window.confirm(`Are you sure you want to delete ${name}?`)) {
      deleteMutation.mutate(id);
    }
  };

  const medicinesList = medicinesPage?.content || [];
  const totalPages = medicinesPage?.totalPages || 0;

  // Filter in memory for category and supplier since backend exposes standard text search
  const filteredMedicines = medicinesList.filter(med => {
    if (selectedCategory && med.category?.id !== Number(selectedCategory)) return false;
    if (selectedSupplier && med.supplier?.id !== Number(selectedSupplier)) return false;
    return true;
  });

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortDir('asc');
    }
    setPage(0);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-800 dark:text-slate-100">
            Medicine Inventory
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Browse, monitor, and regulate medication details.
          </p>
        </div>
        {canEdit && (
          <Link 
            to={`${baseRoute}/medicines/add`}
            className="flex items-center gap-1.5 px-4 py-2 bg-sky-500 hover:bg-sky-600 text-white rounded-xl text-sm font-semibold shadow-sm transition-colors"
          >
            <Plus size={16} />
            <span>Add Medicine</span>
          </Link>
        )}
      </div>

      {/* Filter and Search Panel */}
      <div className="glass-card p-4 grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
        {/* Search */}
        <div className="relative">
          <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
            <Search size={16} />
          </span>
          <input
            type="text"
            placeholder="Search name, barcode..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(0);
            }}
            className="w-full bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 pl-10 pr-4 py-2 rounded-xl text-sm border border-transparent focus:outline-none focus:ring-2 focus:ring-sky-500/50 transition-all"
          />
        </div>

        {/* Category Filter */}
        <div className="relative">
          <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 pointer-events-none">
            <Filter size={16} />
          </span>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 pl-10 pr-4 py-2 rounded-xl text-sm border border-transparent focus:outline-none focus:ring-2 focus:ring-sky-500/50 transition-all appearance-none"
          >
            <option value="">All Categories</option>
            {categories?.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
        </div>

        {/* Supplier Filter */}
        <div className="relative">
          <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 pointer-events-none">
            <Filter size={16} />
          </span>
          <select
            value={selectedSupplier}
            onChange={(e) => setSelectedSupplier(e.target.value)}
            className="w-full bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 pl-10 pr-4 py-2 rounded-xl text-sm border border-transparent focus:outline-none focus:ring-2 focus:ring-sky-500/50 transition-all appearance-none"
          >
            <option value="">All Suppliers</option>
            {suppliers?.map(sup => (
              <option key={sup.id} value={sup.id}>{sup.name}</option>
            ))}
          </select>
        </div>

        {/* Refresh button */}
        <button
          onClick={() => refetch()}
          className="flex justify-center items-center gap-2 py-2 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-350 transition-colors text-sm font-semibold"
        >
          <RefreshCw size={16} />
          <span>Reset Filters</span>
        </button>
      </div>

      {/* Datatable list */}
      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-50 dark:bg-slate-800/40 text-slate-500 border-b border-slate-200 dark:border-slate-800 text-xs font-semibold uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4">Image</th>
                <th className="px-6 py-4 cursor-pointer hover:text-sky-500" onClick={() => handleSort('name')}>Name</th>
                <th className="px-6 py-4">Barcode</th>
                <th className="px-6 py-4 cursor-pointer hover:text-sky-500" onClick={() => handleSort('quantity')}>Stock Status</th>
                <th className="px-6 py-4 cursor-pointer hover:text-sky-500" onClick={() => handleSort('price')}>Price</th>
                <th className="px-6 py-4 cursor-pointer hover:text-sky-500" onClick={() => handleSort('expiryDate')}>Expiry Date</th>
                <th className="px-6 py-4">Category</th>
                {canEdit && <th className="px-6 py-4 text-center">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200/50 dark:divide-slate-800/30">
              {isLoading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan="8" className="px-6 py-5"><div className="h-4 bg-slate-200 dark:bg-slate-800 rounded"></div></td>
                  </tr>
                ))
              ) : filteredMedicines.length > 0 ? (
                filteredMedicines.map((med) => {
                  const isLow = med.quantity <= med.reorderLevel;
                  const isExpired = med.expiryDate && new Date(med.expiryDate) < new Date();
                  
                  return (
                    <tr key={med.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/20 transition-colors">
                      <td className="px-6 py-4">
                        {med.imageUrl ? (
                          <img src={med.imageUrl} alt={med.name} className="w-10 h-10 rounded-xl object-cover border border-slate-200 dark:border-slate-800" />
                        ) : (
                          <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 text-xs font-bold">
                            N/A
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-semibold text-slate-800 dark:text-slate-100">{med.name}</div>
                        <div className="text-xs text-slate-400 mt-0.5">Batch: {med.batchNumber || 'N/A'}</div>
                      </td>
                      <td className="px-6 py-4 text-slate-500 font-mono text-xs">{med.barcode || 'N/A'}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${
                          isExpired 
                            ? 'bg-red-100 text-red-800 dark:bg-red-950/40 dark:text-red-400' 
                            : isLow 
                              ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-400' 
                              : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400'
                        }`}>
                          {isExpired ? 'Expired' : isLow ? 'Low Stock' : 'In Stock'} ({med.quantity})
                        </span>
                      </td>
                      <td className="px-6 py-4 font-semibold text-slate-700 dark:text-slate-350">${med.price.toFixed(2)}</td>
                      <td className="px-6 py-4 text-slate-500 font-mono text-xs">{med.expiryDate || 'N/A'}</td>
                      <td className="px-6 py-4 text-slate-500">{med.category?.name || 'Uncategorized'}</td>
                      
                      {canEdit && (
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-center gap-2">
                            <Link 
                              to={`${baseRoute}/medicines/edit/${med.id}`}
                              className="p-1.5 rounded-lg text-slate-500 hover:text-sky-500 hover:bg-sky-50 dark:hover:bg-sky-950/20 transition-colors"
                              title="Edit"
                            >
                              <Edit size={16} />
                            </Link>
                            <button
                              onClick={() => handleDelete(med.id, med.name)}
                              className="p-1.5 rounded-lg text-slate-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors"
                              title="Delete"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="8" className="px-6 py-8 text-center text-slate-400 text-sm">No medicine items found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination navigation controls */}
        {totalPages > 1 && (
          <div className="px-6 py-4 flex items-center justify-between border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30">
            <span className="text-xs text-slate-500">
              Page {page + 1} of {totalPages}
            </span>
            <div className="flex gap-2">
              <button
                disabled={page === 0}
                onClick={() => setPage(page - 1)}
                className="p-1.5 rounded-lg bg-white dark:bg-slate-850 text-slate-600 dark:text-slate-405 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 disabled:opacity-40 transition-colors"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                disabled={page >= totalPages - 1}
                onClick={() => setPage(page + 1)}
                className="p-1.5 rounded-lg bg-white dark:bg-slate-850 text-slate-600 dark:text-slate-405 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 disabled:opacity-40 transition-colors"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Medicines;
