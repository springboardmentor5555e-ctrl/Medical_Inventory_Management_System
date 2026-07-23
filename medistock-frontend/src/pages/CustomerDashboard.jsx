import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axiosInstance from '../services/axiosInstance';
import { motion } from 'framer-motion';
import { 
  Search, 
  MapPin, 
  ShoppingCart, 
  Pill, 
  Heart, 
  X, 
  Tag, 
  DollarSign, 
  Phone, 
  CheckCircle, 
  Download,
  AlertCircle
} from 'lucide-react';
import { toast } from 'sonner';

const CustomerDashboard = () => {
  const queryClient = useQueryClient();
  
  // Search state
  const [searchCity, setSearchCity] = useState('');
  const [pharmacySearch, setPharmacySearch] = useState('');
  const [selectedPharmacy, setSelectedPharmacy] = useState(null);
  
  // Cart state
  const [cart, setCart] = useState([]);
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [checkoutStep, setCheckoutStep] = useState('shop'); // shop, cart, checkout, success
  const [paymentMethod, setPaymentMethod] = useState('CASH');

  // 1. Fetch Pharmacies
  const { data: pharmacies, isLoading: pharmaciesLoading } = useQuery({
    queryKey: ['customerPharmacies', pharmacySearch],
    queryFn: () => axiosInstance.get(`/api/customer/pharmacies?search=${pharmacySearch}`).then(res => res.data)
  });

  // 2. Fetch Medicines for selected pharmacy
  const { data: medicines, isLoading: medicinesLoading } = useQuery({
    queryKey: ['pharmacyMedicines', selectedPharmacy?.id],
    queryFn: () => axiosInstance.get(`/api/customer/pharmacies/${selectedPharmacy.id}/medicines`).then(res => res.data),
    enabled: !!selectedPharmacy
  });

  // 3. Fetch Wishlist
  const { data: wishlist, isLoading: wishlistLoading } = useQuery({
    queryKey: ['customerWishlist'],
    queryFn: () => axiosInstance.get('/api/wishlist').then(res => res.data)
  });

  // 4. Fetch Order History
  const { data: orderHistory, isLoading: historyLoading } = useQuery({
    queryKey: ['customerHistory'],
    queryFn: () => axiosInstance.get('/api/sales').then(res => res.data)
  });

  // Mutations
  const toggleWishlistMutation = useMutation({
    mutationFn: (medicineId) => {
      const isWishlisted = wishlist?.some(item => item.id === medicineId);
      if (isWishlisted) {
        return axiosInstance.delete(`/api/wishlist/${medicineId}`);
      } else {
        return axiosInstance.post(`/api/wishlist/${medicineId}`);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['customerWishlist']);
      toast.success("Wishlist updated!");
    }
  });

  const checkoutMutation = useMutation({
    mutationFn: (payload) => axiosInstance.post('/api/sales', payload).then(res => res.data),
    onSuccess: (data) => {
      toast.success("Order placed successfully!");
      setCart([]);
      setAppliedCoupon(null);
      setCouponCode('');
      setCheckoutStep('success');
      queryClient.invalidateQueries(['customerHistory']);
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Order checkout failed. Please verify stock.");
    }
  });

  // Calculate cart values
  const cartSubtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const discountVal = appliedCoupon 
    ? (appliedCoupon.type === 'PERCENTAGE' 
        ? (cartSubtotal * appliedCoupon.value / 100.0) 
        : appliedCoupon.value)
    : 0.0;
  const taxVal = cartSubtotal * 0.05; // 5% GST
  const cartTotal = Math.max(0.0, cartSubtotal - discountVal + taxVal);

  const handleApplyCoupon = async () => {
    try {
      const response = await axiosInstance.get(`/api/coupons/validate?code=${couponCode}&amount=${cartSubtotal}`);
      setAppliedCoupon(response.data);
      toast.success("Coupon applied successfully!");
    } catch (error) {
      toast.error(error.response?.data?.message || "Invalid coupon code");
      setAppliedCoupon(null);
    }
  };

  const handleAddToCart = (med) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === med.id);
      if (existing) {
        if (existing.quantity >= med.quantity) {
          toast.error("Cannot add more units than available in pharmacy stock!");
          return prev;
        }
        return prev.map(item => item.id === med.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { ...med, quantity: 1 }];
    });
    toast.success(`${med.name} added to cart!`);
  };

  const handleCheckoutSubmit = () => {
    if (cart.length === 0) return;
    const payload = {
      items: cart.map(item => ({ medicineId: item.id, quantity: item.quantity })),
      discountAmount: discountVal,
      taxAmount: taxVal,
      paymentMethod: paymentMethod,
      couponCode: appliedCoupon?.code,
      ownerId: selectedPharmacy.id
    };
    checkoutMutation.mutate(payload);
  };

  return (
    <div className="space-y-6">
      {/* Title Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-800 dark:text-slate-100">
          MediStock Storefront
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Search local pharmacies, review stock pricing, and place orders.
        </p>
      </div>

      {checkoutStep === 'shop' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Pharmacy search and listing */}
          <div className="glass-card p-6 space-y-4">
            <h4 className="font-bold text-slate-800 dark:text-slate-200">Local Pharmacies Locator</h4>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                <Search size={16} />
              </span>
              <input 
                type="text" 
                placeholder="Search city or pharmacy name..."
                value={pharmacySearch}
                onChange={(e) => setPharmacySearch(e.target.value)}
                className="w-full bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 pl-9 pr-4 py-2 rounded-xl text-sm border border-transparent focus:outline-none focus:ring-2 focus:ring-sky-500/50"
              />
            </div>

            <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
              {pharmacies && pharmacies.length > 0 ? (
                pharmacies.map((pharm) => (
                  <div 
                    key={pharm.id} 
                    onClick={() => {
                      setSelectedPharmacy(pharm);
                      setCart([]); // Clear cart when switching store
                    }}
                    className={`p-4 rounded-2xl border text-left cursor-pointer transition-all ${
                      selectedPharmacy?.id === pharm.id 
                        ? 'border-sky-500 bg-sky-50/50 dark:bg-sky-950/20' 
                        : 'border-slate-200/50 dark:border-slate-800/40 hover:bg-slate-50/50'
                    }`}
                  >
                    <h5 className="font-bold text-slate-800 dark:text-slate-200 text-sm">{pharm.pharmacyName || pharm.name}</h5>
                    <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                      <MapPin size={12} />
                      {pharm.address}, {pharm.city}
                    </p>
                    <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 flex items-center gap-1">
                      <Phone size={10} />
                      {pharm.phone || 'No phone'}
                    </p>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-slate-400 text-sm">No pharmacies found in this region.</div>
              )}
            </div>
          </div>

          {/* Medicines Listing */}
          <div className="lg:col-span-2 glass-card p-6 space-y-4 text-left">
            <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3">
              <h4 className="font-bold text-slate-850 dark:text-slate-200">
                {selectedPharmacy ? `${selectedPharmacy.pharmacyName || selectedPharmacy.name}'s Catalog` : "Select a Pharmacy to view stock"}
              </h4>
              {cart.length > 0 && (
                <button 
                  onClick={() => setCheckoutStep('cart')}
                  className="flex items-center gap-1.5 px-4.5 py-2 bg-sky-500 hover:bg-sky-600 text-white rounded-xl text-xs font-bold transition-all shadow-sm"
                >
                  <ShoppingCart size={14} />
                  <span>Cart ({cart.length})</span>
                </button>
              )}
            </div>

            {selectedPharmacy ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[500px] overflow-y-auto pr-1">
                {medicines && medicines.length > 0 ? (
                  medicines.map((med) => {
                    const isWishlisted = wishlist?.some(item => item.id === med.id);
                    return (
                      <div key={med.id} className="p-4 border border-slate-200/50 dark:border-slate-800/40 rounded-2xl flex flex-col justify-between hover:shadow-sm transition-all bg-white/40 dark:bg-slate-900/20">
                        <div>
                          <div className="flex justify-between items-start gap-2">
                            <h5 className="font-bold text-slate-800 dark:text-slate-200 text-sm">{med.name}</h5>
                            <button 
                              onClick={() => toggleWishlistMutation.mutate(med.id)}
                              className={`p-1.5 rounded-lg border transition-colors ${
                                isWishlisted 
                                  ? 'bg-rose-50 border-rose-200 text-rose-500 dark:bg-rose-950/20' 
                                  : 'border-slate-200 dark:border-slate-700 text-slate-400 hover:text-slate-600'
                              }`}
                            >
                              <Heart size={14} fill={isWishlisted ? "currentColor" : "none"} />
                            </button>
                          </div>
                          <p className="text-xs text-slate-500 mt-1 line-clamp-2">{med.description || "No description provided."}</p>
                          <p className="text-[10px] text-slate-400 mt-1">Batch: {med.batchNumber || "N/A"} | Exp: {med.expiryDate || "N/A"}</p>
                        </div>
                        <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/50 flex justify-between items-center">
                          <div>
                            <span className="text-xs text-slate-400">Price</span>
                            <p className="font-extrabold text-sm text-slate-800 dark:text-slate-200">${med.price.toFixed(2)}</p>
                          </div>
                          <div>
                            {med.quantity > 0 ? (
                              <button 
                                onClick={() => handleAddToCart(med)}
                                className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-250 font-semibold rounded-xl text-xs flex items-center gap-1"
                              >
                                <Plus size={12} />
                                Add Unit
                              </button>
                            ) : (
                              <span className="text-xs font-semibold text-red-500">Out of Stock</span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="col-span-full py-12 text-center text-slate-400 text-sm">This store has no medicines registered in inventory.</div>
                )}
              </div>
            ) : (
              <div className="py-24 text-center text-slate-400 text-sm flex flex-col items-center justify-center gap-2">
                <AlertCircle size={24} />
                <span>Search and choose a partner pharmacy on the left tab to start shopping.</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab: Cart & Coupon Panel */}
      {checkoutStep === 'cart' && (
        <div className="glass-card p-6 max-w-2xl mx-auto space-y-6 text-left">
          <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3">
            <h4 className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
              <ShoppingCart size={18} />
              Review Your Cart Items
            </h4>
            <button onClick={() => setCheckoutStep('shop')} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg">
              <X size={16} />
            </button>
          </div>

          <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
            {cart.map((item) => (
              <div key={item.id} className="flex justify-between items-center p-3.5 border border-slate-200/50 dark:border-slate-800/40 rounded-2xl bg-white dark:bg-slate-900/30">
                <div>
                  <h5 className="font-semibold text-slate-850 dark:text-slate-200 text-sm">{item.name}</h5>
                  <p className="text-xs text-slate-500 mt-0.5">${item.price.toFixed(2)} per unit</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-bold text-slate-700 dark:text-slate-350">{item.quantity} Qty</span>
                  <button 
                    onClick={() => setCart(prev => prev.filter(i => i.id !== item.id))}
                    className="p-1 text-slate-400 hover:text-red-500 rounded"
                  >
                    <X size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Coupon Code Section */}
          <div className="flex gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <div className="relative flex-grow">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                <Tag size={14} />
              </span>
              <input 
                type="text" 
                placeholder="Apply Coupon (e.g. WELCOME10)"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value)}
                className="w-full bg-slate-100 dark:bg-slate-800 text-slate-855 pl-9 pr-4 py-2 rounded-xl text-sm border border-transparent focus:outline-none focus:ring-2 focus:ring-sky-500/50"
              />
            </div>
            <button 
              onClick={handleApplyCoupon}
              className="px-4 py-2 bg-slate-800 dark:bg-slate-700 text-white rounded-xl text-sm font-semibold hover:bg-slate-700 transition-colors"
            >
              Apply
            </button>
          </div>

          {/* Cart Pricing summary */}
          <div className="space-y-2 text-sm text-slate-600 dark:text-slate-400 pt-4 border-t border-slate-100 dark:border-slate-800">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>${cartSubtotal.toFixed(2)}</span>
            </div>
            {appliedCoupon && (
              <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-semibold">
                <span>Coupon Discount ({appliedCoupon.code})</span>
                <span>-${discountVal.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span>GST / Tax (5%)</span>
              <span>${taxVal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-base font-extrabold text-slate-800 dark:text-slate-100 border-t border-slate-100 dark:border-slate-800 pt-2">
              <span>Total Payment Amount</span>
              <span>${cartTotal.toFixed(2)}</span>
            </div>
          </div>

          <button 
            onClick={() => setCheckoutStep('checkout')}
            className="w-full py-2.5 bg-sky-500 hover:bg-sky-600 text-white font-bold rounded-xl text-sm transition-all text-center"
          >
            Proceed to Checkout
          </button>
        </div>
      )}

      {/* Tab: Checkout Configuration */}
      {checkoutStep === 'checkout' && (
        <div className="glass-card p-6 max-w-xl mx-auto space-y-6 text-left">
          <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3">
            <h4 className="font-bold text-slate-800 dark:text-slate-200">Configure Checkout & Payments</h4>
            <button onClick={() => setCheckoutStep('cart')} className="p-1 hover:bg-slate-100 rounded-lg">
              <X size={16} />
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-2">
                Choose Payment Option
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button 
                  onClick={() => setPaymentMethod('CASH')}
                  className={`p-3 rounded-2xl border text-center font-bold text-xs transition-all ${
                    paymentMethod === 'CASH' ? 'border-sky-500 bg-sky-50/50 text-sky-600' : 'border-slate-200/50 hover:bg-slate-50'
                  }`}
                >
                  Pay on Collection (Cash)
                </button>
                <button 
                  onClick={() => setPaymentMethod('UPI')}
                  className={`p-3 rounded-2xl border text-center font-bold text-xs transition-all ${
                    paymentMethod === 'UPI' ? 'border-sky-500 bg-sky-50/50 text-sky-600' : 'border-slate-200/50 hover:bg-slate-50'
                  }`}
                >
                  Scan & Pay (UPI QR)
                </button>
              </div>
            </div>

            {paymentMethod === 'UPI' && (
              <div className="p-4 border border-slate-200 dark:border-slate-800 rounded-2xl bg-slate-50 dark:bg-slate-900/30 text-center flex flex-col items-center justify-center gap-3">
                <p className="text-xs text-slate-500 font-semibold">Scan QR Code using PhonePe, Paytm, or GPay</p>
                <div className="w-40 h-40 bg-white border border-slate-200 rounded-2xl flex items-center justify-center text-slate-300 font-bold">
                  {/* Mock QR Code representation */}
                  <div className="p-2 bg-slate-50 rounded-xl">
                    <img 
                      src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=upi://pay?pa=medistock@upi&pn=MediStock" 
                      alt="UPI QR Payment" 
                      className="w-36 h-36"
                    />
                  </div>
                </div>
                <span className="text-[10px] text-slate-400">Total: ${cartTotal.toFixed(2)}</span>
              </div>
            )}
          </div>

          <button 
            onClick={handleCheckoutSubmit}
            disabled={checkoutMutation.isPending}
            className="w-full py-2.5 bg-gradient-to-r from-sky-500 to-sky-600 text-white font-bold rounded-xl text-sm transition-all flex justify-center items-center"
          >
            {checkoutMutation.isPending ? (
              <span className="w-5 h-5 border-2 border-t-transparent border-white rounded-full animate-spin"></span>
            ) : `Confirm & Pay $${cartTotal.toFixed(2)}`}
          </button>
        </div>
      )}

      {/* Tab: Success screen */}
      {checkoutStep === 'success' && (
        <div className="glass-card p-8 max-w-md mx-auto text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto shadow-sm">
            <CheckCircle size={32} />
          </div>
          <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100">Order Confirmed!</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">Your order has been sent to the pharmacy for validation and dispatch.</p>
          
          <button 
            onClick={() => setCheckoutStep('shop')}
            className="w-full py-2 bg-slate-800 dark:bg-slate-700 text-white rounded-xl text-xs font-semibold hover:bg-slate-700"
          >
            Continue Shopping
          </button>
        </div>
      )}

      {/* Purchase logs / invoices */}
      {checkoutStep === 'shop' && (
        <div className="glass-card p-6 text-left">
          <h4 className="font-bold text-slate-800 dark:text-slate-200 mb-4">Previous Orders & Invoices</h4>
          <div className="overflow-x-auto w-full">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 text-xs font-semibold uppercase tracking-wider">
                  <th className="py-2.5">Invoice #</th>
                  <th className="py-2.5">Total Paid</th>
                  <th className="py-2.5">Date</th>
                  <th className="py-2.5">Coupon</th>
                  <th className="py-2.5 text-right">Invoice</th>
                </tr>
              </thead>
              <tbody>
                {orderHistory && orderHistory.length > 0 ? (
                  orderHistory.map((item) => (
                    <tr key={item.id} className="border-b border-slate-100/50 dark:border-slate-800/20 last:border-0 hover:bg-slate-50/50">
                      <td className="py-3 font-semibold text-slate-700 dark:text-slate-350">{item.invoiceNumber}</td>
                      <td className="py-3 text-emerald-600 font-bold">${item.totalAmount.toFixed(2)}</td>
                      <td className="py-3 text-slate-500">
                        {new Date(item.saleDate).toLocaleDateString(undefined, {month: 'short', day: 'numeric', hour: '2-digit', minute:'2-digit'})}
                      </td>
                      <td className="py-3 text-slate-500">
                        {item.couponCode ? (
                          <span className="px-2 py-0.5 text-[10px] font-bold bg-emerald-100 text-emerald-700 rounded-full">{item.couponCode}</span>
                        ) : 'None'}
                      </td>
                      <td className="py-3 text-right">
                        <button 
                          onClick={() => toast.success("Downloading PDF invoice...")}
                          className="p-1 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-600 rounded"
                        >
                          <Download size={14} />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="py-6 text-center text-slate-400 text-sm">No transaction logs available.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerDashboard;
