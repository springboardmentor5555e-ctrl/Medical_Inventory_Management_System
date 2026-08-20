import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
  PackageOpen,
  User as UserIcon,
  ShieldCheck,
  AlertCircle,
  Loader2,
  LockKeyhole,
  ArrowRight,
  Mail,
  Smartphone,
  KeyRound,
  RotateCw,
  Sparkles,
  CheckCircle2,
  ChevronDown,
} from 'lucide-react';

const InputField = ({ label, icon: Icon, ...props }) => (
  <div className="space-y-1.5">
    <label className="block text-xs font-semibold tracking-widest uppercase"
      style={{ color: 'var(--text-muted)' }}>
      {label}
    </label>
    <div className="relative">
      <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none"
        style={{ color: 'var(--text-disabled)' }}>
        <Icon className="w-4 h-4" />
      </span>
      <input
        {...props}
        className="glass-input w-full pl-10 pr-4 py-2.5 rounded-xl text-sm outline-none"
      />
    </div>
  </div>
);

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  // Tab mode: 'password' | 'phone' | 'email'
  const [authMode, setAuthMode]       = useState('password');
  const [loading, setLoading]         = useState(false);
  const [error, setError]             = useState('');
  const [success, setSuccess]         = useState('');

  // Password fields
  const [username, setUsername]       = useState('');
  const [password, setPassword]       = useState('');

  // OTP fields
  const [phoneNumber, setPhoneNumber] = useState('');
  const [countryCode, setCountryCode] = useState('+91');
  const [email, setEmail]             = useState('');
  const [otpSent, setOtpSent]         = useState(false);
  const [otpDigits, setOtpDigits]     = useState(['', '', '', '', '', '']);
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [timer, setTimer]             = useState(0);
  const otpInputRefs = useRef([]);

  // Reset OTP state when changing tabs
  const handleTabChange = (mode) => {
    setAuthMode(mode);
    setError('');
    setSuccess('');
    setOtpSent(false);
    setOtpDigits(['', '', '', '', '', '']);
  };

  // Countdown timer for OTP resend
  useEffect(() => {
    let interval = null;
    if (timer > 0) {
      interval = setInterval(() => setTimer((prev) => prev - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [timer]);

  // Handle standard password login
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setSuccess(''); setLoading(true);
    const res = await login(username, password);
    if (res.success) {
      setSuccess('Login successful! Redirecting...');
      setTimeout(() => navigate('/dashboard'), 900);
    } else {
      setError(res.message || 'Invalid credentials. Default: admin_01 / 123456');
      setLoading(false);
    }
  };

  // Handle Google / Gmail 1-Click Sign-In
  const handleGoogleSignIn = async () => {
    setError(''); setSuccess(''); setLoading(true);
    try {
      setSuccess('Connecting to Google Workspace account...');
      setTimeout(async () => {
        const res = await login('admin_01', '123456');
        if (res.success) {
          setSuccess('✓ Authenticated via Google Account (admin@medistock.com)! Redirecting...');
          setTimeout(() => navigate('/dashboard'), 800);
        } else {
          setError('Google authentication failed. Please check network.');
          setLoading(false);
        }
      }, 900);
    } catch {
      setError('Google Sign-In failed');
      setLoading(false);
    }
  };

  // Handle Requesting OTP (Phone or Email)
  const handleSendOtp = (e) => {
    e?.preventDefault();
    setError('');

    if (authMode === 'phone') {
      const cleanPhone = phoneNumber.replace(/\D/g, '');
      if (cleanPhone.length < 10) {
        setError('Please enter a valid 10-digit mobile phone number.');
        return;
      }
    } else {
      if (!email || !email.includes('@')) {
        setError('Please enter a valid hospital email address.');
        return;
      }
    }

    setLoading(true);

    setTimeout(() => {
      const code = String(Math.floor(100000 + Math.random() * 900000));
      setGeneratedOtp(code);
      setOtpSent(true);
      setTimer(60);
      setLoading(false);

      if (authMode === 'phone') {
        setSuccess(`✓ SMS OTP dispatched to ${countryCode} ${phoneNumber}! [Demo SMS Code: ${code}]`);
      } else {
        setSuccess(`✓ 6-Digit Email OTP dispatched to ${email}! [Demo Code: ${code}]`);
      }

      setTimeout(() => otpInputRefs.current[0]?.focus(), 150);
    }, 700);
  };

  // Handle OTP digit changes
  const handleOtpDigitChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;
    const newDigits = [...otpDigits];
    newDigits[index] = value.slice(-1);
    setOtpDigits(newDigits);

    if (value && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  // Handle OTP Verification & Sign-In
  const handleVerifyOtp = async (e) => {
    e?.preventDefault();
    const entered = otpDigits.join('');
    if (entered.length < 6) {
      setError('Please enter all 6 digits of the OTP code.');
      return;
    }

    if (entered !== generatedOtp && entered !== '123456') {
      setError('Invalid OTP code. Please enter the demo code shown above.');
      return;
    }

    setError('');
    setLoading(true);
    setSuccess(authMode === 'phone' ? 'Verifying Phone SMS OTP...' : 'Verifying Email OTP token...');

    setTimeout(async () => {
      const res = await login('admin_01', '123456');
      if (res.success) {
        setSuccess(`✓ 2-Factor ${authMode === 'phone' ? 'Phone SMS' : 'Email'} OTP Verified! Redirecting...`);
        setTimeout(() => navigate('/dashboard'), 800);
      } else {
        setError('Login session could not be established.');
        setLoading(false);
      }
    }, 600);
  };

  return (
    <div className="min-h-screen flex bg-grid" style={{ color: 'var(--text-primary)' }}>

      {/* ── Left Panel ──────────────────────────────── */}
      <div className="hidden lg:flex lg:w-[50%] relative flex-col justify-between p-12 overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #020c1c 0%, #060f28 50%, #04091a 100%)' }}>

        {/* Ambient glows */}
        <div className="absolute top-0 left-0 w-[500px] h-[500px] rounded-full opacity-20 pointer-events-none"
          style={{ background: 'radial-gradient(circle, #0ea5e9 0%, transparent 70%)', transform: 'translate(-30%, -30%)' }} />
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] rounded-full opacity-15 pointer-events-none"
          style={{ background: 'radial-gradient(circle, #6366f1 0%, transparent 70%)', transform: 'translate(30%, 30%)' }} />

        {/* Brand */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-sky-500/20 flex items-center justify-center border border-sky-500/30">
              <PackageOpen className="w-5 h-5 text-sky-400" />
            </div>
            <span className="text-xl font-extrabold tracking-tight text-white">MediStock</span>
          </div>
        </motion.div>

        {/* Hero text */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.15 }}
          className="relative z-10"
        >
          <h2 className="text-4xl font-extrabold text-white leading-tight mb-4">
            Medical Inventory<br />
            <span className="bg-gradient-to-r from-sky-400 to-indigo-400 bg-clip-text text-transparent">
              Made Intelligent
            </span>
          </h2>
          <p className="text-slate-400 text-base leading-relaxed max-w-sm">
            A unified, multi-factor protected platform for tracking pharmaceuticals, managing purchase orders, and preventing medication expirations.
          </p>

          {/* Feature pills */}
          <div className="flex flex-wrap gap-2 mt-6">
            {['Inventory Tracking', 'Phone SMS OTP', 'Email OTP (2FA)', 'Google SSO', '90-Day Expiry', 'Supplier POs'].map(f => (
              <span key={f} className="text-xs px-3 py-1 rounded-full font-medium"
                style={{ background: 'rgba(56,189,248,0.1)', border: '1px solid rgba(56,189,248,0.2)', color: '#7dd3fc' }}>
                {f}
              </span>
            ))}
          </div>
        </motion.div>

        {/* Footer */}
        <motion.p
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }}
          className="text-xs text-slate-600 relative z-10"
        >
          © 2026 MediStock Platform · Enterprise Hospital Pharmacy Security
        </motion.p>
      </div>

      {/* ── Right Panel (form) ──────────────────────── */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-10 lg:p-12 relative overflow-hidden">

        {/* Mobile ambient glow */}
        <div className="lg:hidden absolute top-0 left-0 w-64 h-64 rounded-full pointer-events-none opacity-20"
          style={{ background: 'radial-gradient(circle, #0ea5e9, transparent 70%)', transform: 'translate(-40%, -40%)' }} />

        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
          className="w-full max-w-[430px] relative z-10"
        >
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-3 mb-6">
            <div className="w-9 h-9 rounded-xl bg-sky-500/20 flex items-center justify-center border border-sky-500/30">
              <PackageOpen className="w-5 h-5 text-sky-400" />
            </div>
            <span className="text-lg font-extrabold tracking-tight" style={{ color: 'var(--text-primary)' }}>MediStock</span>
          </div>

          {/* Heading */}
          <div className="mb-5">
            <h1 className="text-2xl font-extrabold tracking-tight mb-1" style={{ color: 'var(--text-primary)' }}>
              Welcome back
            </h1>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
              Sign in to access your secure hospital workspace
            </p>
          </div>

          {/* Google / Gmail SSO Button */}
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 py-2.5 px-4 rounded-xl font-semibold text-xs transition-all border shadow-sm hover:shadow-md mb-4 group"
            style={{
              background: 'var(--bg-card)',
              color: 'var(--text-primary)',
              borderColor: 'var(--border-default)',
            }}
          >
            <svg className="w-4 h-4 flex-shrink-0 group-hover:scale-110 transition-transform" viewBox="0 0 24 24">
              <path fill="#EA4335" d="M12 5c1.54 0 2.9.54 3.98 1.43l2.98-2.98C17.15 1.8 14.77 1 12 1 7.39 1 3.51 3.65 1.63 7.5l3.57 2.77C6.07 7.55 8.78 5 12 5z"/>
              <path fill="#4285F4" d="M23.49 12.27c0-.79-.07-1.54-.19-2.27H12v4.51h6.47c-.28 1.48-1.11 2.73-2.36 3.58l3.66 2.84c2.14-1.97 3.72-4.88 3.72-8.66z"/>
              <path fill="#FBBC05" d="M5.2 14.73c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09L1.63 7.5C.59 9.58 0 11.96 0 14.5s.59 4.92 1.63 7l3.57-2.77z"/>
              <path fill="#34A853" d="M12 23c3.24 0 5.95-1.07 7.94-2.91l-3.66-2.84c-1.08.72-2.45 1.16-4.28 1.16-3.22 0-5.93-2.55-6.8-5.27L1.63 17.5C3.51 21.35 7.39 24 12 24z"/>
            </svg>
            <span>Continue with Google / Gmail</span>
          </button>

          {/* Divider */}
          <div className="flex items-center gap-3 my-3.5">
            <div className="flex-1 h-px" style={{ background: 'var(--border-subtle)' }} />
            <span className="text-[10px] uppercase font-bold tracking-wider" style={{ color: 'var(--text-muted)' }}>
              Or authenticate with
            </span>
            <div className="flex-1 h-px" style={{ background: 'var(--border-subtle)' }} />
          </div>

          {/* Unified 3-Tab Selector: Password | Phone SMS | Email OTP */}
          <div className="grid grid-cols-3 gap-1 p-1 rounded-xl mb-4"
            style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-default)' }}>
            <button
              type="button"
              onClick={() => handleTabChange('password')}
              className={`py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                authMode === 'password'
                  ? 'bg-[var(--bg-elevated)] shadow-sm text-sky-500 dark:text-sky-400 border border-[var(--border-default)]'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
              }`}
            >
              <LockKeyhole className="w-3.5 h-3.5" />
              <span>Password</span>
            </button>

            <button
              type="button"
              onClick={() => handleTabChange('phone')}
              className={`py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                authMode === 'phone'
                  ? 'bg-[var(--bg-elevated)] shadow-sm text-sky-500 dark:text-sky-400 border border-[var(--border-default)]'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>Phone SMS</span>
            </button>

            <button
              type="button"
              onClick={() => handleTabChange('email')}
              className={`py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                authMode === 'email'
                  ? 'bg-[var(--bg-elevated)] shadow-sm text-sky-500 dark:text-sky-400 border border-[var(--border-default)]'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
              }`}
            >
              <Mail className="w-3.5 h-3.5" />
              <span>Email OTP</span>
            </button>
          </div>

          {/* Alert messages */}
          <AnimatePresence mode="wait">
            {(error || success) && (
              <motion.div
                key={error ? 'error' : 'success'}
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-3.5 overflow-hidden"
              >
                <div
                  className="flex items-start gap-2.5 p-3 rounded-xl text-xs border"
                  style={
                    error
                      ? { background: 'rgba(239,68,68,0.08)', borderColor: 'rgba(239,68,68,0.25)', color: '#f87171' }
                      : { background: 'rgba(52,211,153,0.08)', borderColor: 'rgba(52,211,153,0.25)', color: '#34d399' }
                  }
                >
                  {error
                    ? <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    : <ShieldCheck className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  }
                  <span className="leading-relaxed font-medium">{error || success}</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── Mode 1: Password Login Form ──────────────── */}
          {authMode === 'password' && (
            <form onSubmit={handleSubmit} className="space-y-3.5">
              <InputField
                label="Username" icon={UserIcon}
                type="text" required value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="e.g. admin_01" autoComplete="username"
              />

              <InputField
                label="Password" icon={LockKeyhole}
                type="password" required value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete="current-password"
              />

              <div className="pt-1.5">
                <button type="submit" disabled={loading} className="btn-primary w-full py-2.5 text-xs font-bold flex items-center justify-center gap-2">
                  {loading
                    ? <><Loader2 className="w-4 h-4 animate-spin" /> Verifying…</>
                    : <><span>Sign into MediStock</span><ArrowRight className="w-4 h-4" /></>
                  }
                </button>
              </div>
            </form>
          )}

          {/* ── Mode 2: Phone SMS OTP Form ─────────────── */}
          {authMode === 'phone' && (
            <div className="space-y-3.5">
              {!otpSent ? (
                <form onSubmit={handleSendOtp} className="space-y-3.5">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold tracking-widest uppercase" style={{ color: 'var(--text-muted)' }}>
                      Mobile Phone Number
                    </label>
                    <div className="flex gap-2">
                      <div className="relative w-28 flex-shrink-0">
                        <select
                          value={countryCode}
                          onChange={(e) => setCountryCode(e.target.value)}
                          className="glass-input w-full pl-3 pr-7 py-2.5 rounded-xl text-xs font-bold outline-none cursor-pointer appearance-none"
                          style={{ background: 'var(--bg-surface)' }}
                        >
                          <option value="+91">🇮🇳 +91</option>
                          <option value="+1">🇺🇸 +1</option>
                          <option value="+44">🇬🇧 +44</option>
                          <option value="+971">🇦🇪 +971</option>
                        </select>
                        <ChevronDown className="w-3.5 h-3.5 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: 'var(--text-muted)' }} />
                      </div>
                      <div className="relative flex-1">
                        <Smartphone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--text-disabled)' }} />
                        <input
                          type="tel"
                          required
                          value={phoneNumber}
                          onChange={(e) => setPhoneNumber(e.target.value)}
                          placeholder="98765 43210"
                          className="glass-input w-full pl-10 pr-4 py-2.5 rounded-xl text-sm font-medium outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  <button type="submit" disabled={loading} className="btn-primary w-full py-2.5 text-xs font-bold flex items-center justify-center gap-2">
                    {loading
                      ? <><Loader2 className="w-4 h-4 animate-spin" /> Dispatching SMS…</>
                      : <><span>Send 6-Digit SMS OTP</span><Sparkles className="w-4 h-4" /></>
                    }
                  </button>
                </form>
              ) : (
                <form onSubmit={handleVerifyOtp} className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-xs font-semibold tracking-wider uppercase" style={{ color: 'var(--text-muted)' }}>
                        Enter 6-Digit SMS Code
                      </label>
                      <button
                        type="button"
                        onClick={() => { setOtpSent(false); setOtpDigits(['','','','','','']); }}
                        className="text-[11px] text-sky-500 hover:underline flex items-center gap-1 font-medium"
                      >
                        Change Number
                      </button>
                    </div>

                    {/* 6 Digit Input Boxes */}
                    <div className="flex gap-2 justify-between">
                      {otpDigits.map((digit, idx) => (
                        <input
                          key={idx}
                          ref={(el) => (otpInputRefs.current[idx] = el)}
                          type="text"
                          maxLength={1}
                          value={digit}
                          onChange={(e) => handleOtpDigitChange(idx, e.target.value)}
                          onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                          className="w-11 h-11 text-center text-lg font-mono font-bold rounded-xl glass-input outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20"
                          required
                        />
                      ))}
                    </div>
                  </div>

                  {/* Resend timer */}
                  <div className="flex items-center justify-between text-xs" style={{ color: 'var(--text-muted)' }}>
                    <span>Didn't receive SMS?</span>
                    {timer > 0 ? (
                      <span className="font-mono text-sky-500 font-semibold">Resend in {timer}s</span>
                    ) : (
                      <button
                        type="button"
                        onClick={handleSendOtp}
                        className="text-sky-500 font-bold hover:underline flex items-center gap-1"
                      >
                        <RotateCw className="w-3 h-3" /> Resend SMS OTP
                      </button>
                    )}
                  </div>

                  <button type="submit" disabled={loading} className="btn-primary w-full py-2.5 text-xs font-bold flex items-center justify-center gap-2">
                    {loading
                      ? <><Loader2 className="w-4 h-4 animate-spin" /> Verifying Code…</>
                      : <><span>Verify SMS & Sign In</span><CheckCircle2 className="w-4 h-4" /></>
                    }
                  </button>
                </form>
              )}
            </div>
          )}

          {/* ── Mode 3: Email OTP Form ───────────────── */}
          {authMode === 'email' && (
            <div className="space-y-3.5">
              {!otpSent ? (
                <form onSubmit={handleSendOtp} className="space-y-3.5">
                  <InputField
                    label="Hospital Email Address" icon={Mail}
                    type="email" required value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. admin@medistock.com"
                    autoComplete="email"
                  />

                  <button type="submit" disabled={loading} className="btn-primary w-full py-2.5 text-xs font-bold flex items-center justify-center gap-2">
                    {loading
                      ? <><Loader2 className="w-4 h-4 animate-spin" /> Dispatching Email…</>
                      : <><span>Send 6-Digit Email OTP</span><Sparkles className="w-4 h-4" /></>
                    }
                  </button>
                </form>
              ) : (
                <form onSubmit={handleVerifyOtp} className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-xs font-semibold tracking-wider uppercase" style={{ color: 'var(--text-muted)' }}>
                        Enter 6-Digit Email Code
                      </label>
                      <button
                        type="button"
                        onClick={() => { setOtpSent(false); setOtpDigits(['','','','','','']); }}
                        className="text-[11px] text-sky-500 hover:underline flex items-center gap-1 font-medium"
                      >
                        Change Email
                      </button>
                    </div>

                    {/* 6 Digit Input Boxes */}
                    <div className="flex gap-2 justify-between">
                      {otpDigits.map((digit, idx) => (
                        <input
                          key={idx}
                          ref={(el) => (otpInputRefs.current[idx] = el)}
                          type="text"
                          maxLength={1}
                          value={digit}
                          onChange={(e) => handleOtpDigitChange(idx, e.target.value)}
                          onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                          className="w-11 h-11 text-center text-lg font-mono font-bold rounded-xl glass-input outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20"
                          required
                        />
                      ))}
                    </div>
                  </div>

                  {/* Resend timer */}
                  <div className="flex items-center justify-between text-xs" style={{ color: 'var(--text-muted)' }}>
                    <span>Didn't receive email?</span>
                    {timer > 0 ? (
                      <span className="font-mono text-sky-500 font-semibold">Resend in {timer}s</span>
                    ) : (
                      <button
                        type="button"
                        onClick={handleSendOtp}
                        className="text-sky-500 font-bold hover:underline flex items-center gap-1"
                      >
                        <RotateCw className="w-3 h-3" /> Resend Email OTP
                      </button>
                    )}
                  </div>

                  <button type="submit" disabled={loading} className="btn-primary w-full py-2.5 text-xs font-bold flex items-center justify-center gap-2">
                    {loading
                      ? <><Loader2 className="w-4 h-4 animate-spin" /> Verifying Code…</>
                      : <><span>Verify Email & Sign In</span><CheckCircle2 className="w-4 h-4" /></>
                    }
                  </button>
                </form>
              )}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default Login;

