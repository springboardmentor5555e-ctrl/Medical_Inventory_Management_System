import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import axiosInstance from '../services/axiosInstance';
import { 
  Search, 
  ShoppingCart, 
  Trash2, 
  Plus, 
  Minus, 
  QrCode, 
  Mic, 
  MicOff, 
  Printer, 
  X, 
  Check, 
  Sparkles, 
  AlertCircle 
} from 'lucide-react';
import { toast } from 'sonner';
import BarcodeScannerComponent from 'react-qr-barcode-scanner';

const Billing = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [cart, setCart] = useState([]);
  const [isScanning, setIsScanning] = useState(false);
  const [isListening, setIsListening] = useState(false);
  
  // Invoice state after successful sale
  const [activeInvoice, setActiveInvoice] = useState(null);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);

  // Suggested Alternatives list state
  const [outOfStockAlternativeTarget, setOutOfStockAlternativeTarget] = useState(null);

  // Extra checkout options
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerId, setCustomerId] = useState(null);
  const [couponCode, setCouponCode] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('CASH');
  const [appliedCoupon, setAppliedCoupon] = useState(null);

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    try {
      const res = await axiosInstance.get(`/api/coupons/validate?code=${couponCode.trim()}&amount=${subtotal}`);
      setAppliedCoupon(res.data);
      toast.success("Coupon applied successfully!");
    } catch (e) {
      toast.error(e.response?.data?.message || "Invalid coupon");
      setAppliedCoupon(null);
    }
  };

  // 1. Fetch medicines for search panel
  const { data: medicinesPage, isLoading: searchLoading, refetch: refetchMedicines } = useQuery({
    queryKey: ['billingSearch', searchTerm],
    queryFn: () => axiosInstance.get(`/api/medicines?search=${searchTerm.trim()}&size=5`).then(res => res.data),
    enabled: searchTerm.trim().length > 0
  });

  const searchResults = medicinesPage?.content || [];

  // 2. Checkout mutation
  const checkoutMutation = useMutation({
    mutationFn: (payload) => axiosInstance.post('/api/sales', payload).then(res => res.data),
    onSuccess: (invoice) => {
      toast.success(`Checkout complete! Invoice ${invoice.invoiceNumber} created.`);
      setActiveInvoice(invoice);
      setShowInvoiceModal(true);
      setCart([]);
      setCustomerEmail('');
      setCustomerId(null);
      setCouponCode('');
      setAppliedCoupon(null);
      refetchMedicines();
    },
    onError: (err) => {
      const msg = err.response?.data?.message || 'Checkout failed. Please inspect stock levels.';
      toast.error(msg);
    }
  });

  // Adding to cart logic
  const handleAddToCart = (medicine) => {
    // Expiry check
    if (medicine.expiryDate && new Date(medicine.expiryDate) < new Date()) {
      toast.error(`"${medicine.name}" has expired! Billing blocked.`);
      return;
    }

    // Out of stock check
    if (medicine.quantity <= 0) {
      toast.error(`"${medicine.name}" is out of stock!`);
      // Display alternatives modal
      setOutOfStockAlternativeTarget(medicine);
      return;
    }

    const existingItem = cart.find(item => item.id === medicine.id);
    if (existingItem) {
      if (existingItem.cartQuantity >= medicine.quantity) {
        toast.warning(`Cannot add more. Only ${medicine.quantity} units in stock.`);
        return;
      }
      setCart(cart.map(item => 
        item.id === medicine.id 
          ? { ...item, cartQuantity: item.cartQuantity + 1 }
          : item
      ));
    } else {
      setCart([...cart, { ...medicine, cartQuantity: 1 }]);
    }
    setSearchTerm('');
    toast.success(`${medicine.name} added to cart.`);
  };

  // Adjust quantity
  const handleUpdateQuantity = (id, delta, maxQty) => {
    setCart(cart.map(item => {
      if (item.id === id) {
        const newQty = item.cartQuantity + delta;
        if (newQty <= 0) return item;
        if (newQty > maxQty) {
          toast.warning(`Maximum stock reached. Only ${maxQty} units available.`);
          return item;
        }
        return { ...item, cartQuantity: newQty };
      }
      return item;
    }));
  };

  // Remove item
  const handleRemoveItem = (id) => {
    setCart(cart.filter(item => item.id !== id));
    toast.info('Item removed from cart.');
  };

  // Resolve Barcode Scans
  const handleBarcodeScan = async (barcode) => {
    if (!barcode) return;
    setIsScanning(false);
    toast.info(`Scanned barcode: ${barcode}. Searching...`);

    try {
      const response = await axiosInstance.get(`/api/medicines/barcode/${barcode}`);
      const medicine = response.data;
      handleAddToCart(medicine);
    } catch (error) {
      console.error(error);
      toast.error(`Medicine with barcode "${barcode}" not found in system.`);
    }
  };

  // Voice Speech search API
  const handleVoiceSearch = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      toast.error('Voice commands not supported in this browser.');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.lang = 'en-US';
    
    recognition.onstart = () => {
      setIsListening(true);
      toast.info('Speak the medicine name...');
    };

    recognition.onresult = (event) => {
      const spokenText = event.results[0][0].transcript;
      setSearchTerm(spokenText);
      toast.success(`Voice resolved: "${spokenText}"`);
    };

    recognition.onerror = () => {
      toast.error('Speech recognition error.');
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  };

  const handleCheckout = () => {
    if (cart.length === 0) {
      toast.warning('Cart is empty.');
      return;
    }

    const itemsPayload = cart.map(item => ({
      medicineId: item.id,
      quantity: item.cartQuantity
    }));

    checkoutMutation.mutate({
      items: itemsPayload,
      discountAmount: discount,
      taxAmount: tax,
      paymentMethod: paymentMethod,
      couponCode: appliedCoupon?.code,
      customerId: customerId
    });
  };

  // Calc totals
  const subtotal = cart.reduce((acc, curr) => acc + (curr.price * curr.cartQuantity), 0);
  const discount = appliedCoupon 
    ? (appliedCoupon.type === 'PERCENTAGE' ? (subtotal * appliedCoupon.value / 100) : appliedCoupon.value)
    : subtotal * 0.05; // Fallback flat 5% loyalty discount
  const taxRate = 0.08; // 8% sales tax
  const tax = (subtotal - discount) * taxRate;
  const total = subtotal - discount + tax;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      
      {/* Left panel: Cart & Product selection */}
      <div className="lg:col-span-2 space-y-6">
        
        {/* Search controls */}
        <div className="glass-card p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-800 dark:text-slate-200">Point of Sale (POS) Billing</h2>
            <div className="flex gap-2">
              {/* Scan Trigger */}
              <button
                onClick={() => setIsScanning(!isScanning)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors border border-slate-200/50 dark:border-slate-800/40"
              >
                <QrCode size={14} />
                <span>Scan Barcode</span>
              </button>
              {/* Voice Trigger */}
              <button
                onClick={handleVoiceSearch}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors border border-slate-200/50 dark:border-slate-800/40 ${
                  isListening 
                    ? 'bg-red-500 hover:bg-red-650 text-white animate-pulse' 
                    : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200'
                }`}
              >
                {isListening ? <MicOff size={14} /> : <Mic size={14} />}
                <span>Voice Search</span>
              </button>
            </div>
          </div>

          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
              <Search size={16} />
            </span>
            <input
              type="text"
              placeholder="Search by name, category, or scan barcode..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 pl-10 pr-4 py-2.5 rounded-xl text-sm border border-transparent focus:outline-none focus:ring-2 focus:ring-sky-500/50 transition-all"
            />

            {/* Quick search dropdown overlay */}
            {searchTerm.trim().length > 0 && (
              <div className="absolute top-12 left-0 right-0 z-30 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl overflow-hidden max-h-60 overflow-y-auto">
                {searchLoading ? (
                  <div className="p-4 text-center text-slate-400 text-sm">Searching...</div>
                ) : searchResults.length > 0 ? (
                  searchResults.map(med => {
                    const isLow = med.quantity <= med.reorderLevel;
                    const isOut = med.quantity <= 0;
                    const isExpired = med.expiryDate && new Date(med.expiryDate) < new Date();
                    
                    return (
                      <button
                        key={med.id}
                        onClick={() => handleAddToCart(med)}
                        className="w-full text-left p-3.5 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors flex items-center justify-between border-b border-slate-100 dark:border-slate-800 last:border-0"
                      >
                        <div>
                          <div className="font-semibold text-sm text-slate-800 dark:text-slate-200">{med.name}</div>
                          <div className="text-xs text-slate-450 mt-0.5">Barcode: {med.barcode || 'N/A'} | Expiry: {med.expiryDate || 'N/A'}</div>
                        </div>
                        <div className="text-right">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold tracking-wide uppercase ${
                            isExpired 
                              ? 'bg-red-100 text-red-700' 
                              : isOut 
                                ? 'bg-red-50 text-red-500 border border-red-200' 
                                : isLow 
                                  ? 'bg-amber-100 text-amber-700' 
                                  : 'bg-emerald-100 text-emerald-700'
                          }`}>
                            {isExpired ? 'Expired' : isOut ? 'Out of Stock' : isLow ? 'Low Stock' : 'In Stock'} ({med.quantity})
                          </span>
                          <p className="font-bold text-slate-700 dark:text-slate-350 text-sm mt-1">${med.price.toFixed(2)}</p>
                        </div>
                      </button>
                    );
                  })
                ) : (
                  <div className="p-4 text-center text-slate-400 text-sm">No medicines found.</div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Cart table list */}
        <div className="glass-card p-6 space-y-4">
          <h3 className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
            <ShoppingCart size={18} className="text-sky-500" />
            Shopping Cart Items
          </h3>

          <div className="overflow-x-auto w-full">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 text-xs font-semibold uppercase tracking-wider">
                  <th className="py-2.5">Medicine</th>
                  <th className="py-2.5">Price</th>
                  <th className="py-2.5 text-center">Quantity</th>
                  <th className="py-2.5 text-right">Subtotal</th>
                  <th className="py-2.5 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100/50 dark:divide-slate-800/20">
                {cart.length > 0 ? (
                  cart.map((item) => (
                    <tr key={item.id}>
                      <td className="py-3.5">
                        <div className="font-semibold text-slate-850 dark:text-slate-200">{item.name}</div>
                        <div className="text-xs text-slate-400 mt-0.5">Avail: {item.quantity} Units</div>
                      </td>
                      <td className="py-3.5 text-slate-555">${item.price.toFixed(2)}</td>
                      <td className="py-3.5">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleUpdateQuantity(item.id, -1, item.quantity)}
                            className="p-1 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-500 transition-colors"
                          >
                            <Minus size={12} />
                          </button>
                          <span className="w-8 text-center font-bold text-sm">{item.cartQuantity}</span>
                          <button
                            onClick={() => handleUpdateQuantity(item.id, 1, item.quantity)}
                            className="p-1 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-500 transition-colors"
                          >
                            <Plus size={12} />
                          </button>
                        </div>
                      </td>
                      <td className="py-3.5 text-right font-bold text-slate-800 dark:text-slate-200">
                        ${(item.price * item.cartQuantity).toFixed(2)}
                      </td>
                      <td className="py-3.5 text-center">
                        <button
                          onClick={() => handleRemoveItem(item.id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition-all"
                        >
                          <Trash2 size={15} />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="py-12 text-center text-slate-400 text-sm">
                      Cart is empty. Add medicine from the search dropdown.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Right panel: Checkout total summaries */}
      <div className="space-y-6">
        
        {/* Checkout card widgets */}
        <div className="glass-card p-6 space-y-6">
          <h3 className="font-bold text-slate-850 dark:text-slate-200 border-b border-slate-100 dark:border-slate-800 pb-3">
            Checkout Summary
          </h3>

          {/* Customer Mapping */}
          <div className="space-y-2 text-left text-xs">
            <label className="block font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider pl-1">
              Customer Reference (Optional)
            </label>
            <input 
              type="text" 
              placeholder="Search or enter customer email..."
              value={customerEmail}
              onChange={(e) => {
                setCustomerEmail(e.target.value);
                // Simple email check to map customerId if exists in database
                if (e.target.value.includes('@')) {
                  axiosInstance.get(`/api/customer/pharmacies?search=${e.target.value}`).then(res => {
                    const matched = res.data?.find(u => u.email.toLowerCase() === e.target.value.toLowerCase());
                    if (matched) {
                      setCustomerId(matched.id);
                      toast.success(`Matched Customer Profile: ${matched.name}`);
                    }
                  }).catch(() => {});
                }
              }}
              className="w-full bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 px-3 py-2 rounded-xl border border-transparent focus:outline-none focus:ring-1 focus:ring-sky-500"
            />
          </div>

          {/* POS Coupon validation */}
          <div className="space-y-2 text-left text-xs">
            <label className="block font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider pl-1">
              Apply Discount Coupon
            </label>
            <div className="flex gap-2">
              <input 
                type="text" 
                placeholder="PROMOCODE"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value)}
                className="flex-grow bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 px-3 py-2 rounded-xl border border-transparent focus:outline-none focus:ring-1 focus:ring-sky-500"
              />
              <button 
                onClick={handleApplyCoupon}
                className="px-3 py-2 bg-slate-800 dark:bg-slate-700 text-white font-bold rounded-xl hover:bg-slate-750 transition-colors"
              >
                Apply
              </button>
            </div>
          </div>

          {/* Payment Method selector */}
          <div className="space-y-2 text-left text-xs">
            <label className="block font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider pl-1">
              Select Payment Method
            </label>
            <select 
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="w-full bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 px-3 py-2 rounded-xl border border-transparent focus:outline-none focus:ring-1 focus:ring-sky-500 outline-none"
            >
              <option value="CASH">Cash</option>
              <option value="UPI">UPI (QR Code)</option>
              <option value="CARD">Card Swipe</option>
              <option value="PHONEPE">PhonePe Wallet</option>
              <option value="PAYTM">Paytm Wallet</option>
              <option value="GPAY">Google Pay</option>
            </select>
          </div>
          
          <div className="space-y-3 text-sm">
            <div className="flex justify-between text-slate-500">
              <span>Cart Subtotal</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">${subtotal.toFixed(2)}</span>
            </div>
            
            <div className="flex justify-between text-slate-500">
              <span>Coupon / Loyalty Discount</span>
              <span className="font-semibold text-emerald-600">-${discount.toFixed(2)}</span>
            </div>
            
            <div className="flex justify-between text-slate-500">
              <span>VAT / Tax (8% GST)</span>
              <span className="font-semibold text-slate-850 dark:text-slate-250">${tax.toFixed(2)}</span>
            </div>
            
            <div className="border-t border-slate-100 dark:border-slate-800 pt-3 flex justify-between text-base font-extrabold text-slate-800 dark:text-slate-100">
              <span>Grand Total</span>
              <span className="text-xl text-sky-600 dark:text-sky-400">${total.toFixed(2)}</span>
            </div>
          </div>

          <button
            onClick={handleCheckout}
            disabled={cart.length === 0 || checkoutMutation.isLoading}
            className="w-full bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-600 hover:to-sky-700 text-white font-semibold py-3 rounded-2xl shadow-md transition-all flex justify-center items-center gap-2 disabled:opacity-50"
          >
            {checkoutMutation.isLoading ? (
              <span className="w-5 h-5 border-2 border-t-transparent border-white rounded-full animate-spin"></span>
            ) : (
              <ShoppingCart size={18} />
            )}
            <span>Process Checkout</span>
          </button>
        </div>

        {/* Instructions Alert panel */}
        <div className="glass-card p-6 text-xs text-slate-500 dark:text-slate-400 space-y-3 leading-relaxed">
          <p className="font-semibold text-slate-700 dark:text-slate-350">Register Tips:</p>
          <ul className="list-disc pl-4 space-y-1">
            <li>Make sure to use webcam scan indicators for barcodes.</li>
            <li>Voice instructions automatically append search filters.</li>
            <li>Alternative recommendations appear if inventories are 0.</li>
          </ul>
        </div>
      </div>

      {/* Barcode scanner Overlay */}
      {isScanning && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-xl p-6 relative overflow-hidden text-center">
            
            <button 
              onClick={() => setIsScanning(false)}
              className="absolute top-4 right-4 p-1 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X size={18} />
            </button>

            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-150 mb-3">Align Barcode in Scanner</h3>
            
            <div className="w-full h-52 bg-slate-100 dark:bg-slate-850 rounded-xl overflow-hidden relative flex items-center justify-center border border-slate-200 dark:border-slate-800">
              <BarcodeScannerComponent
                width="100%"
                height="100%"
                onUpdate={(err, result) => {
                  if (result) handleBarcodeScan(result.text);
                }}
              />
              <div className="absolute inset-x-4 top-1/2 -translate-y-1/2 border-t-2 border-red-500 animate-pulse pointer-events-none"></div>
            </div>
            
            <p className="text-xs text-slate-400 mt-3 leading-snug">
              Point your camera at the barcode on the box to automatically fetch medicine detail properties.
            </p>
          </div>
        </div>
      )}

      {/* Suggested Alternatives Modal Sheet */}
      {outOfStockAlternativeTarget && (
        <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-250 dark:border-slate-800 rounded-3xl p-6 relative overflow-hidden">
            
            <button 
              onClick={() => setOutOfStockAlternativeTarget(null)}
              className="absolute top-4 right-4 p-1 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X size={18} />
            </button>

            <div className="flex gap-2.5 items-start mb-3 text-red-500">
              <AlertCircle size={20} className="shrink-0 mt-0.5" />
              <div>
                <h3 className="font-bold text-slate-800 dark:text-slate-150">"{outOfStockAlternativeTarget.name}" is Unavailable</h3>
                <p className="text-xs text-slate-500 mt-1 leading-snug">Stock levels are currently depleted. You can recommend one of the linked alternatives below instead.</p>
              </div>
            </div>

            <div className="space-y-2 mt-4 max-h-48 overflow-y-auto pr-2">
              {outOfStockAlternativeTarget.alternatives && outOfStockAlternativeTarget.alternatives.length > 0 ? (
                outOfStockAlternativeTarget.alternatives.map((alt) => {
                  // To check actual details of alternatives, we fetch or display brief details
                  // Since alt maps to simple MedicineSummary, we display it and let user search it or directly add it
                  // Let's resolve adding alternative:
                  return (
                    <div key={alt.id} className="p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl flex justify-between items-center text-xs">
                      <div>
                        <span className="font-bold text-slate-800 dark:text-slate-200">{alt.name}</span>
                        <p className="text-slate-400 mt-0.5">Barcode: {alt.barcode || 'N/A'}</p>
                      </div>
                      <button
                        onClick={() => {
                          setSearchTerm(alt.name);
                          setOutOfStockAlternativeTarget(null);
                          toast.info(`Alternatives query set: "${alt.name}". Please add from dropdown.`);
                        }}
                        className="px-2.5 py-1.5 rounded-lg bg-sky-50 hover:bg-sky-100 dark:bg-sky-950 dark:hover:bg-sky-900 text-sky-600 dark:text-sky-400 font-bold tracking-wide uppercase transition-colors"
                      >
                        Select Alternative
                      </button>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-6 text-slate-400 text-xs">No alternatives recorded in database for this drug.</div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Unified Receipt Invoice Modal Overlay */}
      {showInvoiceModal && activeInvoice && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 print:p-0 print:bg-white">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-2xl relative overflow-hidden print:border-0 print:shadow-none print:w-full print:max-w-none print:h-screen print:rounded-none">
            
            <button 
              onClick={() => {
                setShowInvoiceModal(false);
                setActiveInvoice(null);
              }}
              className="absolute top-4 right-4 p-1 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors print:hidden"
            >
              <X size={18} />
            </button>

            {/* Receipt headers */}
            <div className="text-center pb-4 border-b border-dashed border-slate-200 dark:border-slate-800">
              <span className="inline-flex items-center justify-center bg-emerald-50 text-emerald-600 w-10 h-10 rounded-full font-bold mb-2">
                <Check size={20} />
              </span>
              <h2 className="text-xl font-bold text-slate-850 dark:text-slate-100">MediStock Receipt</h2>
              <p className="text-xs text-slate-450 mt-1">Transaction Invoice Slip</p>
            </div>

            {/* Invoices metadata */}
            <div className="py-4 grid grid-cols-2 gap-4 text-xs border-b border-dashed border-slate-200 dark:border-slate-800 leading-relaxed">
              <div>
                <p className="text-slate-400 uppercase tracking-wider font-semibold">Invoice No</p>
                <p className="font-bold text-slate-800 dark:text-slate-250 mt-0.5">{activeInvoice.invoiceNumber}</p>
              </div>
              <div className="text-right">
                <p className="text-slate-400 uppercase tracking-wider font-semibold">Invoice Date</p>
                <p className="font-bold text-slate-800 dark:text-slate-200 mt-0.5">
                  {new Date(activeInvoice.saleDate).toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-slate-400 uppercase tracking-wider font-semibold">Cashier</p>
                <p className="font-bold text-slate-800 dark:text-slate-250 mt-0.5">{activeInvoice.cashierName}</p>
              </div>
              <div className="text-right">
                <p className="text-slate-400 uppercase tracking-wider font-semibold">Status</p>
                <span className="inline-block mt-0.5 px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold uppercase text-[10px]">PAID</span>
              </div>
            </div>

            {/* Invoice Line items */}
            <div className="py-4 border-b border-dashed border-slate-200 dark:border-slate-800">
              <table className="w-full text-left text-xs whitespace-nowrap">
                <thead>
                  <tr className="text-slate-400 font-bold uppercase tracking-wider">
                    <th className="pb-2">Medication</th>
                    <th className="pb-2 text-center">Qty</th>
                    <th className="pb-2 text-right">Price</th>
                    <th className="pb-2 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100/50 dark:divide-slate-800/10">
                  {activeInvoice.items?.map((item, idx) => (
                    <tr key={idx} className="text-slate-650 dark:text-slate-400">
                      <td className="py-2.5 font-semibold text-slate-800 dark:text-slate-250">{item.medicineName}</td>
                      <td className="py-2.5 text-center">{item.quantity}</td>
                      <td className="py-2.5 text-right">${item.unitPrice.toFixed(2)}</td>
                      <td className="py-2.5 text-right font-bold text-slate-800 dark:text-slate-200">${item.subtotal.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Invoice final totals */}
            <div className="py-4 text-xs space-y-2 border-b border-dashed border-slate-200 dark:border-slate-800">
              <div className="flex justify-between text-slate-500">
                <span>Items Subtotal</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  ${(activeInvoice.totalAmount / 1.03).toFixed(2)} {/* approximate base */}
                </span>
              </div>
              <div className="flex justify-between text-slate-800 dark:text-slate-100 text-base font-extrabold">
                <span>Grand Receipt Total</span>
                <span className="text-lg text-emerald-600">${activeInvoice.totalAmount.toFixed(2)}</span>
              </div>
            </div>

            {/* Actions triggers */}
            <div className="pt-4 flex justify-end gap-3 print:hidden">
              <button
                onClick={() => {
                  setShowInvoiceModal(false);
                  setActiveInvoice(null);
                }}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors"
              >
                Close Receipt
              </button>
              <button
                onClick={handlePrint}
                className="px-5 py-2.5 rounded-xl text-xs font-semibold bg-sky-500 hover:bg-sky-600 text-white shadow-sm flex items-center gap-1.5 transition-colors"
              >
                <Printer size={14} />
                <span>Print Receipt</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Billing;
