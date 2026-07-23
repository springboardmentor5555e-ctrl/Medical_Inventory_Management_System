import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Lock, Mail, User as UserIcon, ShieldCheck, MapPin, Phone, Building, Hash } from 'lucide-react';
import { toast } from 'sonner';

const Register = () => {
  const { register: signup } = useAuth();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const { register, handleSubmit, watch, formState: { errors } } = useForm();
  const selectedRole = watch('role');

  const onSubmit = async (data) => {
    setSubmitting(true);
    try {
      const { role } = await signup(
        data.name,
        data.email,
        data.password,
        data.role,
        data.pharmacyName,
        data.address,
        data.city,
        data.phone,
        data.gstNumber,
        data.drugLicenseNumber,
        data.ownerEmail
      );
      if (role === 'PHARMACIST' || role === 'SUPPLIER' || role === 'STAFF') {
        toast.info("Registration request submitted. Pending Administrator approval.");
        navigate('/login');
      } else {
        navigate(`/${role.toLowerCase()}/dashboard`);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4 relative overflow-hidden transition-colors duration-200">
      <div className="absolute w-80 h-80 rounded-full bg-sky-400/10 -top-20 -left-20 blur-3xl pointer-events-none"></div>
      <div className="absolute w-80 h-80 rounded-full bg-emerald-400/10 -bottom-20 -right-20 blur-3xl pointer-events-none"></div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-lg bg-white/70 dark:bg-slate-900/60 backdrop-blur-md border border-slate-200/50 dark:border-slate-800/40 shadow-xl rounded-3xl p-8 text-center my-6"
      >
        <div className="flex justify-center mb-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-sky-500 to-emerald-400 flex items-center justify-center text-white text-xl font-bold shadow-md">
            M
          </div>
        </div>
        <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Create Account</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1.5">Join the MediStock inventory workspace</p>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4 text-left">
          {/* Role selector field */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1.5 pl-1">
              Select Your Workspace Role
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                <ShieldCheck size={16} />
              </span>
              <select
                {...register('role', { required: 'Please select a workspace role' })}
                className="w-full bg-slate-100 dark:bg-slate-800/50 text-slate-800 dark:text-slate-200 pl-10 pr-4 py-2.5 rounded-xl text-sm border border-transparent focus:outline-none focus:ring-2 focus:ring-sky-500/50 focus:border-sky-500 transition-all"
              >
                <option value="">Select a role...</option>
                <option value="CUSTOMER">Customer (Order medicine & search pharmacies)</option>
                <option value="PHARMACIST">Pharmacy Owner / Pharmacist</option>
                <option value="SUPPLIER">Medicine Supplier</option>
                <option value="STAFF">Pharmacy Staff (Cashier / POS operations)</option>
              </select>
            </div>
            {errors.role && <p className="text-red-500 text-xs mt-1 pl-1">{errors.role.message}</p>}
          </div>

          {/* Full Name field */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1.5 pl-1">
              Full Name
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                <UserIcon size={16} />
              </span>
              <input
                type="text"
                placeholder="John Doe"
                {...register('name', { 
                  required: 'Name is required',
                  minLength: { value: 2, message: 'Name must be at least 2 characters' }
                })}
                className="w-full bg-slate-100 dark:bg-slate-800/50 text-slate-800 dark:text-slate-200 pl-10 pr-4 py-2.5 rounded-xl text-sm border border-transparent focus:outline-none focus:ring-2 focus:ring-sky-500/50 focus:border-sky-500 transition-all"
              />
            </div>
            {errors.name && <p className="text-red-500 text-xs mt-1 pl-1">{errors.name.message}</p>}
          </div>

          {/* Email field */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1.5 pl-1">
              Email Address
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                <Mail size={16} />
              </span>
              <input
                type="email"
                placeholder="user@medistock.com"
                {...register('email', { 
                  required: 'Email is required',
                  pattern: { value: /^\S+@\S+$/i, message: 'Invalid email format' }
                })}
                className="w-full bg-slate-100 dark:bg-slate-800/50 text-slate-800 dark:text-slate-200 pl-10 pr-4 py-2.5 rounded-xl text-sm border border-transparent focus:outline-none focus:ring-2 focus:ring-sky-500/50 focus:border-sky-500 transition-all"
              />
            </div>
            {errors.email && <p className="text-red-500 text-xs mt-1 pl-1">{errors.email.message}</p>}
          </div>

          {/* Password field */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1.5 pl-1">
              Password
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                <Lock size={16} />
              </span>
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                {...register('password', { 
                  required: 'Password is required',
                  minLength: { value: 6, message: 'Password must be at least 6 characters' }
                })}
                className="w-full bg-slate-100 dark:bg-slate-800/50 text-slate-800 dark:text-slate-200 pl-10 pr-10 py-2.5 rounded-xl text-sm border border-transparent focus:outline-none focus:ring-2 focus:ring-sky-500/50 focus:border-sky-500 transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {errors.password && <p className="text-red-500 text-xs mt-1 pl-1">{errors.password.message}</p>}
          </div>

          {/* ROLE SPECIFIC EXTRA FIELDS */}
          
          {/* Pharmacy Owner Fields */}
          {selectedRole === 'PHARMACIST' && (
            <div className="space-y-4 pt-2 border-t border-slate-200 dark:border-slate-800">
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1.5 pl-1">
                  Pharmacy / Store Name
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                    <Building size={16} />
                  </span>
                  <input
                    type="text"
                    placeholder="City Health Pharmacy"
                    {...register('pharmacyName', { required: 'Pharmacy name is required' })}
                    className="w-full bg-slate-100 dark:bg-slate-800/50 text-slate-800 dark:text-slate-200 pl-10 pr-4 py-2.5 rounded-xl text-sm border border-transparent focus:outline-none focus:ring-2 focus:ring-sky-500/50 focus:border-sky-500 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1.5 pl-1">
                  Phone Number
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                    <Phone size={16} />
                  </span>
                  <input
                    type="text"
                    placeholder="+91 99999 88888"
                    {...register('phone', { required: 'Phone number is required' })}
                    className="w-full bg-slate-100 dark:bg-slate-800/50 text-slate-800 dark:text-slate-200 pl-10 pr-4 py-2.5 rounded-xl text-sm border border-transparent focus:outline-none focus:ring-2 focus:ring-sky-500/50 focus:border-sky-500 transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1.5 pl-1">
                    City
                  </label>
                  <input
                    type="text"
                    placeholder="New Delhi"
                    {...register('city', { required: 'City is required' })}
                    className="w-full bg-slate-100 dark:bg-slate-800/50 text-slate-800 dark:text-slate-200 px-4 py-2.5 rounded-xl text-sm border border-transparent focus:outline-none focus:ring-2 focus:ring-sky-500/50 focus:border-sky-500 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1.5 pl-1">
                    Address
                  </label>
                  <input
                    type="text"
                    placeholder="Connaught Place"
                    {...register('address', { required: 'Address is required' })}
                    className="w-full bg-slate-100 dark:bg-slate-800/50 text-slate-800 dark:text-slate-200 px-4 py-2.5 rounded-xl text-sm border border-transparent focus:outline-none focus:ring-2 focus:ring-sky-500/50 focus:border-sky-500 transition-all"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Supplier Fields */}
          {selectedRole === 'SUPPLIER' && (
            <div className="space-y-4 pt-2 border-t border-slate-200 dark:border-slate-800">
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1.5 pl-1">
                  GST Number
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                    <Hash size={16} />
                  </span>
                  <input
                    type="text"
                    placeholder="07AAAAA1111A1Z1"
                    {...register('gstNumber', { required: 'GST Number is required' })}
                    className="w-full bg-slate-100 dark:bg-slate-800/50 text-slate-800 dark:text-slate-200 pl-10 pr-4 py-2.5 rounded-xl text-sm border border-transparent focus:outline-none focus:ring-2 focus:ring-sky-500/50 focus:border-sky-500 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1.5 pl-1">
                  Drug License Number
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                    <Hash size={16} />
                  </span>
                  <input
                    type="text"
                    placeholder="DL-123456"
                    {...register('drugLicenseNumber', { required: 'Drug License is required' })}
                    className="w-full bg-slate-100 dark:bg-slate-800/50 text-slate-800 dark:text-slate-200 pl-10 pr-4 py-2.5 rounded-xl text-sm border border-transparent focus:outline-none focus:ring-2 focus:ring-sky-500/50 focus:border-sky-500 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1.5 pl-1">
                  Company Address
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                    <MapPin size={16} />
                  </span>
                  <input
                    type="text"
                    placeholder="Okhla Industrial Area, Sector 5"
                    {...register('address', { required: 'Address is required' })}
                    className="w-full bg-slate-100 dark:bg-slate-800/50 text-slate-800 dark:text-slate-200 pl-10 pr-4 py-2.5 rounded-xl text-sm border border-transparent focus:outline-none focus:ring-2 focus:ring-sky-500/50 focus:border-sky-500 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1.5 pl-1">
                  Phone Number
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                    <Phone size={16} />
                  </span>
                  <input
                    type="text"
                    placeholder="+91 99112 23344"
                    {...register('phone', { required: 'Phone is required' })}
                    className="w-full bg-slate-100 dark:bg-slate-800/50 text-slate-800 dark:text-slate-200 pl-10 pr-4 py-2.5 rounded-xl text-sm border border-transparent focus:outline-none focus:ring-2 focus:ring-sky-500/50 focus:border-sky-500 transition-all"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Customer Fields */}
          {selectedRole === 'CUSTOMER' && (
            <div className="space-y-4 pt-2 border-t border-slate-200 dark:border-slate-800">
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1.5 pl-1">
                  Phone Number
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                    <Phone size={16} />
                  </span>
                  <input
                    type="text"
                    placeholder="+91 95555 44444"
                    {...register('phone', { required: 'Phone number is required' })}
                    className="w-full bg-slate-100 dark:bg-slate-800/50 text-slate-800 dark:text-slate-200 pl-10 pr-4 py-2.5 rounded-xl text-sm border border-transparent focus:outline-none focus:ring-2 focus:ring-sky-500/50 focus:border-sky-500 transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1.5 pl-1">
                    City
                  </label>
                  <input
                    type="text"
                    placeholder="New Delhi"
                    {...register('city', { required: 'City is required' })}
                    className="w-full bg-slate-100 dark:bg-slate-800/50 text-slate-800 dark:text-slate-200 px-4 py-2.5 rounded-xl text-sm border border-transparent focus:outline-none focus:ring-2 focus:ring-sky-500/50 focus:border-sky-500 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1.5 pl-1">
                    Delivery Address
                  </label>
                  <input
                    type="text"
                    placeholder="Dwarka Sector 10, Flat 405"
                    {...register('address', { required: 'Address is required' })}
                    className="w-full bg-slate-100 dark:bg-slate-800/50 text-slate-800 dark:text-slate-200 px-4 py-2.5 rounded-xl text-sm border border-transparent focus:outline-none focus:ring-2 focus:ring-sky-500/50 focus:border-sky-500 transition-all"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Staff Fields */}
          {selectedRole === 'STAFF' && (
            <div className="space-y-4 pt-2 border-t border-slate-200 dark:border-slate-800">
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1.5 pl-1">
                  Pharmacy Owner Email
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                    <Mail size={16} />
                  </span>
                  <input
                    type="email"
                    placeholder="owner@medistock.com"
                    {...register('ownerEmail', { required: 'Pharmacy owner email is required to request join' })}
                    className="w-full bg-slate-100 dark:bg-slate-800/50 text-slate-800 dark:text-slate-200 pl-10 pr-4 py-2.5 rounded-xl text-sm border border-transparent focus:outline-none focus:ring-2 focus:ring-sky-500/50 focus:border-sky-500 transition-all"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={submitting}
            className="w-full mt-2 bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-600 hover:to-sky-700 text-white font-medium py-2.5 rounded-xl text-sm transition-all focus:outline-none focus:ring-2 focus:ring-sky-500/50 disabled:opacity-50 flex justify-center items-center gap-2 shadow-sm"
          >
            {submitting ? (
              <span className="w-5 h-5 border-2 border-t-transparent border-white rounded-full animate-spin"></span>
            ) : 'Sign Up'}
          </button>
        </form>

        <p className="text-sm text-slate-500 dark:text-slate-400 mt-6">
          Already have an account?{' '}
          <Link to="/login" className="text-sky-600 dark:text-sky-400 font-semibold hover:underline">
            Login here
          </Link>
        </p>
      </motion.div>
    </div>
  );
};

export default Register;
