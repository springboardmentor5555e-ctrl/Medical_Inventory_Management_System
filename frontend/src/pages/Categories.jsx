import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import ConfirmDialog from '../components/ConfirmDialog';
import { getCategories, createCategory, updateCategory, deleteCategory } from '../services/api';
import {
  Tag, Plus, Edit2, Trash2, X, Loader2, RefreshCw, AlertTriangle
} from 'lucide-react';

const CategoryFormModal = ({ isOpen, onClose, onSubmit, initialData = null }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      setName(initialData?.name || '');
      setDescription(initialData?.description || '');
      setError('');
    }
  }, [isOpen, initialData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) { setError('Name is required'); return; }
    setLoading(true);
    setError('');
    try {
      await onSubmit({ name: name.trim(), description: description.trim() });
      onClose();
    } catch (err) {
      const data = err.response?.data;
      const errorMsg = typeof data === 'string' ? data : (data?.message || err.message || 'An error occurred');
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        style={{ backgroundColor: 'rgba(2, 6, 23, 0.75)', backdropFilter: 'blur(8px)' }}
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: 20 }}
          transition={{ duration: 0.2 }}
          className="rounded-2xl w-full max-w-sm border border-[var(--border-default)] shadow-2xl overflow-hidden"
          style={{ background: 'var(--bg-elevated)', color: 'var(--text-primary)' }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border-subtle)] bg-[var(--bg-surface)]">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-indigo-500/15 flex items-center justify-center border border-indigo-500/25">
                <Tag className="w-4 h-4 text-indigo-500 dark:text-indigo-400" />
              </div>
              <h2 className="font-bold" style={{ color: 'var(--text-primary)' }}>
                {initialData ? 'Edit Category' : 'New Category'}
              </h2>
            </div>
            <button onClick={onClose} className="text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
            {error && (
              <div className="text-red-500 bg-red-950/20 border border-red-500/30 p-3 rounded-xl text-xs">{error}</div>
            )}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: 'var(--text-muted)' }}>Name *</label>
              <input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Antibiotics"
                className="glass-input w-full px-3 py-2.5 rounded-xl text-sm outline-none" required />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: 'var(--text-muted)' }}>Description</label>
              <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Brief description..."
                rows={3} className="glass-input w-full px-3 py-2.5 rounded-xl text-sm outline-none resize-none" />
            </div>

            <div className="flex gap-3 pt-2">
              <button type="button" onClick={onClose} className="btn-ghost flex-1 py-2.5 text-sm">
                Cancel
              </button>
              <button type="submit" disabled={loading}
                className="btn-primary flex-1 py-2.5 text-sm flex items-center justify-center gap-2">
                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                {initialData ? 'Save Changes' : 'Create'}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

const Categories = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const isAdmin = user?.role === 'ADMIN';

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formModal, setFormModal] = useState({ open: false, data: null });
  const [deleteDialog, setDeleteDialog] = useState(null);
  const [error, setError] = useState('');

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await getCategories();
      setCategories(res.data || []);
    } catch { setCategories([]); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchCategories(); }, []);

  const handleSubmit = async (data) => {
    if (formModal.data) {
      await updateCategory(formModal.data.id, data);
    } else {
      await createCategory(data);
    }
    fetchCategories();
  };

  const handleDelete = async () => {
    try {
      await deleteCategory(deleteDialog.id);
      setDeleteDialog(null);
      fetchCategories();
    } catch (err) {
      setError(err.response?.data || 'Delete failed');
      setDeleteDialog(null);
    }
  };

  return (
    <Layout>
      <div className="p-6 lg:p-8 max-w-4xl mx-auto">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <div className="w-9 h-9 rounded-xl bg-indigo-500/15 flex items-center justify-center border border-indigo-500/25">
                <Tag className="w-5 h-5 text-indigo-500 dark:text-indigo-400" />
              </div>
              <h1 className="text-2xl font-extrabold tracking-tight" style={{ color: 'var(--text-primary)' }}>
                Categories
              </h1>
            </div>
            <p className="text-sm ml-12" style={{ color: 'var(--text-muted)' }}>
              {categories.length} categor{categories.length !== 1 ? 'ies' : 'y'} configured
            </p>
          </div>
          {isAdmin && (
            <button onClick={() => setFormModal({ open: true, data: null })}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white text-sm font-semibold shadow-lg shadow-indigo-500/20 transition-all">
              <Plus className="w-4 h-4" />
              New Category
            </button>
          )}
        </motion.div>

        {error && (
          <div className="mb-4 text-red-500 bg-red-950/20 border border-red-500/30 p-3.5 rounded-xl text-sm flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
            <button onClick={() => setError('')} className="ml-auto text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)]">Dismiss</button>
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-20 gap-2" style={{ color: 'var(--text-muted)' }}>
            <RefreshCw className="w-4 h-4 animate-spin text-indigo-400" /> Loading categories...
          </div>
        ) : categories.length === 0 ? (
          <div className="glass-card rounded-2xl border border-[var(--border-default)] p-16 text-center">
            <Tag className="w-10 h-10 mx-auto mb-3 opacity-50" style={{ color: 'var(--text-muted)' }} />
            <p className="font-semibold" style={{ color: 'var(--text-secondary)' }}>No categories yet</p>
            {isAdmin && (
              <button onClick={() => setFormModal({ open: true, data: null })}
                className="mt-3 text-indigo-500 hover:text-indigo-400 text-xs font-medium">
                + Create your first category
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {categories.map((cat, i) => (
              <motion.div key={cat.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                onClick={() => navigate(`/inventory?category=${cat.id}`)}
                className="glass-card rounded-2xl p-5 border border-[var(--border-default)] hover:border-indigo-500/40 hover:shadow-lg transition-all group cursor-pointer"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2.5 mb-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 flex-shrink-0 shadow-sm shadow-indigo-500/30" />
                      <h3 className="font-bold text-base tracking-tight truncate" style={{ color: 'var(--text-primary)' }}>
                        {cat.name}
                      </h3>
                    </div>
                    <p className="text-xs ml-5 leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                      {cat.description || <span className="italic opacity-60">No description provided</span>}
                    </p>
                  </div>
                  {isAdmin && (
                    <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                      <button
                        onClick={(e) => { e.stopPropagation(); setFormModal({ open: true, data: cat }); }}
                        className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-sky-500 hover:bg-sky-500/10 transition-all"
                        title="Edit Category">
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); setDeleteDialog(cat); }}
                        className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-red-500 hover:bg-red-500/10 transition-all"
                        title="Delete Category">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      <CategoryFormModal
        isOpen={formModal.open}
        onClose={() => setFormModal({ open: false, data: null })}
        onSubmit={handleSubmit}
        initialData={formModal.data}
      />
      <ConfirmDialog
        isOpen={!!deleteDialog}
        title="Delete Category"
        message={`Delete category "${deleteDialog?.name}"? Medicines in this category will lose their association.`}
        confirmLabel="Delete"
        onConfirm={handleDelete}
        onCancel={() => setDeleteDialog(null)}
      />
    </Layout>
  );
};

export default Categories;
