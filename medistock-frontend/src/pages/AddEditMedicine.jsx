import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useQuery, useMutation } from '@tanstack/react-query';
import axiosInstance from '../services/axiosInstance';
import { useAuth } from '../context/AuthContext';
import { Pill, ArrowLeft, Upload, FileText, Check } from 'lucide-react';
import { toast } from 'sonner';

const AddEditMedicine = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isEditMode = !!id;
  const baseRoute = `/${user.role.toLowerCase()}`;

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [selectedAlternatives, setSelectedAlternatives] = useState([]);

  const { register, handleSubmit, setValue, reset, formState: { errors } } = useForm();

  // 1. Fetch Categories
  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: () => axiosInstance.get('/api/categories').then(res => res.data)
  });

  // 2. Fetch Suppliers
  const { data: suppliers } = useQuery({
    queryKey: ['suppliers'],
    queryFn: () => axiosInstance.get('/api/suppliers').then(res => res.data)
  });

  // 3. Fetch all medicines for Alternatives multi-select
  const { data: allMedicinesPage } = useQuery({
    queryKey: ['allMedicinesList'],
    queryFn: () => axiosInstance.get('/api/medicines?size=100').then(res => res.data)
  });
  const allMedicines = allMedicinesPage?.content || allMedicinesPage || [];

  // Filter out the current medicine from its own alternatives list
  const alternativeOptions = allMedicines.filter(m => m.id !== Number(id));

  // 4. Fetch Medicine details if in Edit Mode
  const { data: medicineDetails, isLoading: isDetailsLoading } = useQuery({
    queryKey: ['medicineDetails', id],
    queryFn: () => axiosInstance.get(`/api/medicines/${id}`).then(res => res.data),
    enabled: isEditMode,
    onSuccess: (data) => {
      // Pre-fill form fields
      reset({
        name: data.name,
        barcode: data.barcode || '',
        categoryId: data.category?.id || '',
        supplierId: data.supplier?.id || '',
        quantity: data.quantity,
        price: data.price,
        batchNumber: data.batchNumber || '',
        manufacturingDate: data.manufacturingDate || '',
        expiryDate: data.expiryDate || '',
        reorderLevel: data.reorderLevel,
        description: data.description || ''
      });
      setImagePreview(data.imageUrl);
      setSelectedAlternatives(data.alternatives?.map(a => a.id) || []);
    }
  });

  // Re-run field population if query resolves later
  useEffect(() => {
    if (medicineDetails) {
      reset({
        name: medicineDetails.name,
        barcode: medicineDetails.barcode || '',
        categoryId: medicineDetails.category?.id || '',
        supplierId: medicineDetails.supplier?.id || '',
        quantity: medicineDetails.quantity,
        price: medicineDetails.price,
        batchNumber: medicineDetails.batchNumber || '',
        manufacturingDate: medicineDetails.manufacturingDate || '',
        expiryDate: medicineDetails.expiryDate || '',
        reorderLevel: medicineDetails.reorderLevel,
        description: medicineDetails.description || ''
      });
      setImagePreview(medicineDetails.imageUrl);
      setSelectedAlternatives(medicineDetails.alternatives?.map(a => a.id) || []);
    }
  }, [medicineDetails, reset]);

  // Image selector handling
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleAlternativeToggle = (medId) => {
    setSelectedAlternatives(prev => 
      prev.includes(medId) ? prev.filter(id => id !== medId) : [...prev, medId]
    );
  };

  // Submit flow
  const saveMutation = useMutation({
    mutationFn: async (formData) => {
      const payload = {
        ...formData,
        categoryId: formData.categoryId ? Number(formData.categoryId) : null,
        supplierId: formData.supplierId ? Number(formData.supplierId) : null,
        alternativeIds: selectedAlternatives
      };

      let savedMed;
      if (isEditMode) {
        savedMed = await axiosInstance.put(`/api/medicines/${id}`, payload).then(res => res.data);
      } else {
        savedMed = await axiosInstance.post('/api/medicines', payload).then(res => res.data);
      }

      // If an image file was selected, upload it to the Cloudinary endpoint
      if (imageFile) {
        const uploadData = new FormData();
        uploadData.append('image', imageFile);
        await axiosInstance.post(`/api/medicines/${savedMed.id}/image`, uploadData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
      }
    },
    onSuccess: () => {
      toast.success(isEditMode ? 'Medicine updated successfully!' : 'Medicine created successfully!');
      navigate(`${baseRoute}/medicines`);
    },
    onError: (err) => {
      const msg = err.response?.data?.message || 'Failed to save medicine.';
      toast.error(msg);
    }
  });

  const onSubmit = (data) => {
    saveMutation.mutate(data);
  };

  if (isEditMode && isDetailsLoading) {
    return <div className="text-center py-12 text-slate-400">Loading details...</div>;
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header bar */}
      <div className="flex items-center gap-3">
        <Link 
          to={`${baseRoute}/medicines`}
          className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400 transition-colors"
        >
          <ArrowLeft size={16} />
        </Link>
        <div>
          <h1 className="text-2xl font-extrabold text-slate-800 dark:text-slate-100">
            {isEditMode ? 'Modify Product' : 'Add Medication'}
          </h1>
          <p className="text-xs text-slate-500">Configure medicine specifications, stock thresholds, and attachments.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column: Image Upload & Alternatives selection */}
        <div className="space-y-6">
          {/* Image Upload Box */}
          <div className="glass-card p-6 text-center space-y-4">
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">Medicine Illustration</h3>
            
            <div className="relative w-full h-48 rounded-2xl border-2 border-dashed border-slate-250 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30 overflow-hidden flex flex-col items-center justify-center p-4">
              {imagePreview ? (
                <>
                  <img src={imagePreview} alt="Preview" className="w-full h-full object-cover rounded-xl" />
                  <label className="absolute bottom-2 right-2 bg-slate-900/80 hover:bg-slate-900 text-white p-2 rounded-xl cursor-pointer text-xs transition-colors flex items-center gap-1.5 backdrop-blur-sm">
                    <Upload size={14} />
                    Change
                    <input type="file" onChange={handleImageChange} className="hidden" accept="image/*" />
                  </label>
                </>
              ) : (
                <label className="cursor-pointer flex flex-col items-center gap-2 text-slate-400 hover:text-slate-650 transition-colors">
                  <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-850 flex items-center justify-center">
                    <Upload size={20} />
                  </div>
                  <span className="text-xs font-semibold">Select cover image</span>
                  <span className="text-[10px] text-slate-400">PNG, JPG up to 10MB</span>
                  <input type="file" onChange={handleImageChange} className="hidden" accept="image/*" />
                </label>
              )}
            </div>
          </div>

          {/* Alternatives select list */}
          <div className="glass-card p-6 flex flex-col justify-between">
            <h3 className="text-sm font-bold text-slate-850 dark:text-slate-200 mb-3">Alternative Suggestions</h3>
            <p className="text-xs text-slate-450 mb-3 leading-relaxed">Choose equivalents to suggest during billing checkout if this medicine runs out of stock.</p>

            <div className="max-h-48 overflow-y-auto space-y-1.5 pr-2">
              {alternativeOptions.length > 0 ? (
                alternativeOptions.map((med) => {
                  const isChecked = selectedAlternatives.includes(med.id);
                  return (
                    <button
                      key={med.id}
                      type="button"
                      onClick={() => handleAlternativeToggle(med.id)}
                      className={`w-full flex items-center justify-between p-2.5 rounded-xl border text-left text-xs font-medium transition-all ${
                        isChecked 
                          ? 'border-sky-500 bg-sky-50/50 dark:bg-sky-950/20 text-sky-700 dark:text-sky-400' 
                          : 'border-slate-200/60 dark:border-slate-800/40 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900/30'
                      }`}
                    >
                      <span className="truncate">{med.name}</span>
                      {isChecked && <Check size={14} className="shrink-0 text-sky-500" />}
                    </button>
                  );
                })
              ) : (
                <div className="text-center py-6 text-xs text-slate-400">No other medicines available to link.</div>
              )}
            </div>
          </div>
        </div>

        {/* Right Columns: Core Form specifications */}
        <div className="md:col-span-2 glass-card p-8 space-y-6">
          <h3 className="font-bold text-slate-800 dark:text-slate-200 border-b border-slate-100 dark:border-slate-800 pb-3 flex items-center gap-2">
            <Pill size={18} className="text-sky-500" />
            Product Details
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Name */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Medicine Name</label>
              <input 
                type="text"
                {...register('name', { required: 'Name is required' })}
                placeholder="Paracetamol 500mg"
                className="w-full bg-slate-100 dark:bg-slate-800 text-slate-850 dark:text-slate-200 px-4 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/50 border border-transparent focus:border-sky-500 transition-all"
              />
              {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
            </div>

            {/* Barcode */}
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Barcode / EAN</label>
              <input 
                type="text"
                {...register('barcode')}
                placeholder="7891234567890"
                className="w-full bg-slate-100 dark:bg-slate-800 text-slate-850 dark:text-slate-200 px-4 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/50 border border-transparent focus:border-sky-500 transition-all"
              />
            </div>

            {/* Category dropdown */}
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Category</label>
              <select
                {...register('categoryId')}
                className="w-full bg-slate-100 dark:bg-slate-800 text-slate-850 dark:text-slate-200 px-4 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/50 border border-transparent focus:border-sky-500 transition-all"
              >
                <option value="">Select Category...</option>
                {categories?.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>

            {/* Supplier dropdown */}
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Supplier Partner</label>
              <select
                {...register('supplierId')}
                className="w-full bg-slate-100 dark:bg-slate-800 text-slate-850 dark:text-slate-200 px-4 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/50 border border-transparent focus:border-sky-500 transition-all"
              >
                <option value="">Select Supplier...</option>
                {suppliers?.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>

            {/* Batch number */}
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Batch Identifier</label>
              <input 
                type="text"
                {...register('batchNumber')}
                placeholder="BCH-2026-X"
                className="w-full bg-slate-100 dark:bg-slate-800 text-slate-850 dark:text-slate-200 px-4 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/50 border border-transparent focus:border-sky-500 transition-all"
              />
            </div>

            {/* Quantity */}
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">In-Stock Quantity</label>
              <input 
                type="number"
                {...register('quantity', { 
                  required: 'Quantity is required',
                  min: { value: 0, message: 'Cannot be negative' }
                })}
                placeholder="100"
                className="w-full bg-slate-100 dark:bg-slate-800 text-slate-850 dark:text-slate-200 px-4 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/50 border border-transparent focus:border-sky-500 transition-all"
              />
              {errors.quantity && <p className="text-red-500 text-xs mt-1">{errors.quantity.message}</p>}
            </div>

            {/* Unit Price */}
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Selling Price ($)</label>
              <input 
                type="number"
                step="0.01"
                {...register('price', { 
                  required: 'Price is required',
                  min: { value: 0, message: 'Cannot be negative' }
                })}
                placeholder="12.99"
                className="w-full bg-slate-100 dark:bg-slate-800 text-slate-850 dark:text-slate-200 px-4 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/50 border border-transparent focus:border-sky-500 transition-all"
              />
              {errors.price && <p className="text-red-500 text-xs mt-1">{errors.price.message}</p>}
            </div>

            {/* Reorder Level */}
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Reorder Level Alert</label>
              <input 
                type="number"
                {...register('reorderLevel', { 
                  required: 'Reorder Level is required',
                  min: { value: 0, message: 'Cannot be negative' }
                })}
                placeholder="10"
                className="w-full bg-slate-100 dark:bg-slate-800 text-slate-850 dark:text-slate-200 px-4 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/50 border border-transparent focus:border-sky-500 transition-all"
              />
              {errors.reorderLevel && <p className="text-red-500 text-xs mt-1">{errors.reorderLevel.message}</p>}
            </div>

            {/* Manufacturing date */}
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Manufacturing Date</label>
              <input 
                type="date"
                {...register('manufacturingDate')}
                className="w-full bg-slate-100 dark:bg-slate-800 text-slate-850 dark:text-slate-200 px-4 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/50 border border-transparent focus:border-sky-500 transition-all"
              />
            </div>

            {/* Expiry Date */}
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Expiry Date</label>
              <input 
                type="date"
                {...register('expiryDate')}
                className="w-full bg-slate-100 dark:bg-slate-800 text-slate-850 dark:text-slate-200 px-4 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/50 border border-transparent focus:border-sky-500 transition-all"
              />
            </div>

            {/* Description */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Brief description</label>
              <textarea 
                rows="3"
                {...register('description')}
                placeholder="Contraindications, instructions, warnings..."
                className="w-full bg-slate-100 dark:bg-slate-800 text-slate-850 dark:text-slate-200 px-4 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/50 border border-transparent focus:border-sky-500 transition-all resize-none"
              ></textarea>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex justify-end gap-3 border-t border-slate-100 dark:border-slate-800 pt-5">
            <Link 
              to={`${baseRoute}/medicines`}
              className="px-5 py-2.5 rounded-xl text-sm font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={saveMutation.isLoading}
              className="px-6 py-2.5 rounded-xl text-sm font-semibold bg-sky-500 hover:bg-sky-600 text-white shadow-sm flex items-center gap-1.5 disabled:opacity-50 transition-colors"
            >
              {saveMutation.isLoading ? (
                <span className="w-4 h-4 border-2 border-t-transparent border-white rounded-full animate-spin"></span>
              ) : (
                <Check size={16} />
              )}
              <span>{isEditMode ? 'Update Inventory' : 'Publish Medicine'}</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default AddEditMedicine;
