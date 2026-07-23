import React, { useState } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Lock, Mail, ShieldAlert } from 'lucide-react';
import { toast } from 'sonner';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm();

  // Show session expiry warning
  const isExpired = searchParams.get('expired') === 'true';

  const onSubmit = async (data) => {
    setSubmitting(true);
    try {
      const { role } = await login(data.email, data.password);
      navigate(`/${role.toLowerCase()}/dashboard`);
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogleLogin = () => {
    // Redirect browser to Google Authorization API on Spring Boot backend
    window.location.href = 'http://localhost:8080/oauth2/authorization/google';
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4 relative overflow-hidden transition-colors duration-200">
      {/* Background soft blur bubbles */}
      <div className="absolute w-80 h-80 rounded-full bg-sky-400/10 -top-20 -left-20 blur-3xl pointer-events-none"></div>
      <div className="absolute w-80 h-80 rounded-full bg-emerald-400/10 -bottom-20 -right-20 blur-3xl pointer-events-none"></div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md bg-white/70 dark:bg-slate-900/60 backdrop-blur-md border border-slate-200/50 dark:border-slate-800/40 shadow-xl rounded-3xl p-8 text-center"
      >
        {/* Brand Header */}
        <div className="flex justify-center mb-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-sky-500 to-emerald-400 flex items-center justify-center text-white text-xl font-bold shadow-md">
            M
          </div>
        </div>
        <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Welcome to MediStock</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1.5">Enterprise Medical Inventory Portal</p>

        {isExpired && (
          <div className="mt-4 px-3 py-2 bg-amber-50 dark:bg-amber-950/20 border border-amber-250 rounded-xl text-xs text-amber-700 dark:text-amber-400 flex items-center gap-2">
            <ShieldAlert size={14} className="shrink-0" />
            <span>Session expired. Please log in again.</span>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4 text-left">
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
                placeholder="doctor@medistock.com"
                {...register('email', { 
                  required: 'Email is required',
                  pattern: { value: /^\S+@\S+$/i, message: 'Invalid email pattern' }
                })}
                className="w-full bg-slate-100 dark:bg-slate-800/50 text-slate-800 dark:text-slate-200 pl-10 pr-4 py-2.5 rounded-xl text-sm border border-transparent focus:outline-none focus:ring-2 focus:ring-sky-500/50 focus:border-sky-500 transition-all"
              />
            </div>
            {errors.email && <p className="text-red-500 text-xs mt-1 pl-1">{errors.email.message}</p>}
          </div>

          {/* Password field */}
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider pl-1">
                Password
              </label>
              <a href="#forgot" className="text-xs text-sky-600 dark:text-sky-400 hover:underline">
                Forgot password?
              </a>
            </div>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                <Lock size={16} />
              </span>
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                {...register('password', { required: 'Password is required' })}
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

          {/* Submit Button */}
          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-600 hover:to-sky-700 text-white font-medium py-2.5 rounded-xl text-sm transition-all focus:outline-none focus:ring-2 focus:ring-sky-500/50 disabled:opacity-50 flex justify-center items-center gap-2 shadow-sm"
          >
            {submitting ? (
              <span className="w-5 h-5 border-2 border-t-transparent border-white rounded-full animate-spin"></span>
            ) : 'Sign In'}
          </button>
        </form>

        {/* Separator Divider */}
        <div className="relative flex py-5 items-center">
          <div className="flex-grow border-t border-slate-200 dark:border-slate-800"></div>
          <span className="flex-shrink mx-4 text-slate-400 text-xs uppercase tracking-wider font-semibold">or continue with</span>
          <div className="flex-grow border-t border-slate-200 dark:border-slate-800"></div>
        </div>

        {/* Social Authentication Button */}
        <button
          onClick={handleGoogleLogin}
          type="button"
          className="w-full flex justify-center items-center gap-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 py-2.5 rounded-xl text-sm font-semibold transition-colors"
        >
          {/* Custom SVG Google Icon */}
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path
              fill="#EA4335"
              d="M12.24 10.285V14.4h6.887c-.648 2.41-2.519 4.2-5.136 4.2A5.64 5.64 0 0 1 8.35 13a5.64 5.64 0 0 1 5.64-5.64c2.406 0 4.218 1.48 4.218 1.48l3.14-3.14S18.52 2.5 13.99 2.5a10.5 10.5 0 0 0-10.5 10.5 10.5 10.5 0 0 0 10.5 10.5c5.805 0 10.155-3.8 10.155-9.8 0-.615-.075-1.415-.225-2.015H12.24z"
            />
          </svg>
          Google Workspace
        </button>

        {/* Form Switcher */}
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-6">
          Don't have an account?{' '}
          <Link to="/register" className="text-sky-600 dark:text-sky-400 font-semibold hover:underline">
            Register here
          </Link>
        </p>
      </motion.div>
    </div>
  );
};

export default Login;
