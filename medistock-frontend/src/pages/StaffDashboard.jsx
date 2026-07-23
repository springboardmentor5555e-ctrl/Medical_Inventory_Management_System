import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import axiosInstance from '../services/axiosInstance';
import { Search, ShoppingCart, Mic, MicOff, CheckCircle, HelpCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

const StaffDashboard = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isListening, setIsListening] = useState(false);

  // Fetch medicines dynamically based on user search term
  const { data: medicinesPage, isLoading } = useQuery({
    queryKey: ['medicinesSearch', searchTerm],
    queryFn: () => axiosInstance.get(`/api/medicines?search=${searchTerm}&size=5`).then(res => res.data),
    keepPreviousData: true
  });

  const searchResults = medicinesPage?.content || [];

  // Voice Search Web Speech API
  const handleVoiceSearch = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      toast.error('Voice search is not supported in this browser.');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.lang = 'en-US';
    recognition.interimResults = false;

    recognition.onstart = () => {
      setIsListening(true);
      toast.info('Listening for medicine name...');
    };

    recognition.onresult = (event) => {
      const speechToText = event.results[0][0].transcript;
      setSearchTerm(speechToText);
      toast.success(`Voice query resolved: "${speechToText}"`);
    };

    recognition.onerror = (e) => {
      console.error(e);
      toast.error('Voice search error. Try typing instead.');
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  };

  return (
    <div className="space-y-6">
      {/* Title Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-800 dark:text-slate-100">
            Cashier Register Center
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Log invoices, search stock, and lookup barcode details.
          </p>
        </div>
        <div>
          <Link 
            to="/staff/billing" 
            className="flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold bg-sky-500 hover:bg-sky-600 text-white shadow-md transition-colors"
          >
            <ShoppingCart size={18} />
            <span>Launch POS Register</span>
          </Link>
        </div>
      </div>

      {/* Main search and scan area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Interactive Search Box */}
        <div className="glass-card p-6 lg:col-span-2 space-y-4">
          <h3 className="font-bold text-slate-800 dark:text-slate-200">Instant Inventory Lookup</h3>
          
          <div className="flex gap-2">
            <div className="relative flex-1">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                <Search size={18} />
              </span>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Type medicine name, barcode, or category..."
                className="w-full bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 pl-10 pr-4 py-2.5 rounded-xl border border-transparent focus:outline-none focus:ring-2 focus:ring-sky-500/50 focus:border-sky-500 transition-all text-sm"
              />
            </div>

            <button
              onClick={handleVoiceSearch}
              type="button"
              className={`p-2.5 rounded-xl transition-colors shrink-0 ${
                isListening 
                  ? 'bg-red-500 hover:bg-red-600 text-white animate-pulse' 
                  : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400'
              }`}
              title="Voice Search"
            >
              {isListening ? <MicOff size={18} /> : <Mic size={18} />}
            </button>
          </div>

          {/* Dynamic Search Results */}
          <div className="mt-4 space-y-2">
            {isLoading ? (
              [...Array(3)].map((_, i) => (
                <div key={i} className="h-14 bg-slate-100 dark:bg-slate-850 rounded-xl animate-pulse"></div>
              ))
            ) : searchResults.length > 0 ? (
              <AnimatePresence>
                {searchResults.map((med) => {
                  const isLow = med.quantity <= med.reorderLevel;
                  const isExpired = med.expiryDate && new Date(med.expiryDate) < new Date();
                  
                  return (
                    <motion.div
                      key={med.id}
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-250/50 dark:border-slate-800/40 hover:border-sky-500/40 transition-colors flex justify-between items-center"
                    >
                      <div>
                        <h4 className="font-semibold text-sm text-slate-800 dark:text-slate-200">{med.name}</h4>
                        <div className="flex gap-3 text-xs text-slate-400 dark:text-slate-500 mt-1">
                          <span>Barcode: {med.barcode || 'N/A'}</span>
                          <span>•</span>
                          <span>Category: {med.category?.name || 'Uncategorized'}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className={`px-2 py-0.5 text-xs font-bold rounded-full ${
                          isExpired 
                            ? 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400' 
                            : isLow 
                              ? 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400' 
                              : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400'
                        }`}>
                          {isExpired ? 'Expired' : isLow ? 'Low Stock' : 'In Stock'}: {med.quantity}
                        </span>
                        <p className="font-bold text-slate-850 dark:text-slate-150 text-sm mt-1">${med.price.toFixed(2)}</p>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            ) : searchTerm ? (
              <div className="py-8 text-center text-slate-400 text-sm">No medicines found matching "{searchTerm}"</div>
            ) : (
              <div className="py-8 text-center text-slate-400 text-sm">Start typing above or click Voice Search to find medicines.</div>
            )}
          </div>
        </div>

        {/* Quick Operations Instructions */}
        <div className="glass-card p-6 flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-slate-800 dark:text-slate-200 mb-4">Registry Guidelines</h3>
            <div className="space-y-4 text-sm text-slate-600 dark:text-slate-400">
              <div className="flex gap-3">
                <CheckCircle className="text-emerald-500 shrink-0 mt-0.5" size={16} />
                <p><strong>Stock Deductions:</strong> Completing a POS invoice automatically updates medicine counts in the database.</p>
              </div>
              <div className="flex gap-3">
                <CheckCircle className="text-emerald-500 shrink-0 mt-0.5" size={16} />
                <p><strong>Expiries:</strong> The system automatically blocks billing for expired items and suggests alternative drugs.</p>
              </div>
              <div className="flex gap-3">
                <HelpCircle className="text-sky-500 shrink-0 mt-0.5" size={16} />
                <p><strong>Quick POS Search:</strong> Add medicines to the bill using barcode scanners or direct typing in the billing panel.</p>
              </div>
            </div>
          </div>
          <div className="bg-sky-50 dark:bg-sky-950/20 border border-sky-100/50 dark:border-sky-900/30 p-4 rounded-2xl text-xs text-sky-700 dark:text-sky-400 mt-4 leading-relaxed">
            Note: Contact the on-duty **Pharmacist** or **Administrator** for inventory restocks or product adjustments.
          </div>
        </div>
      </div>
    </div>
  );
};

export default StaffDashboard;
