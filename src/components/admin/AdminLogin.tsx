import React, { useState, useEffect, useRef } from 'react';
import { authService, AdminUser } from '../../services/auth';
import { useToast } from '../common/Toast';
import {
  Shield,
  Mail,
  User,
  ArrowRight,
  ShieldCheck,
  ArrowLeft,
  KeyRound,
  RefreshCw,
  Edit2,
  CheckCircle2
} from 'lucide-react';

interface AdminLoginProps {
  onLoginSuccess: (user: AdminUser) => void;
  onNavigateHome: () => void;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({ onLoginSuccess, onNavigateHome }) => {
  const { showToast } = useToast();

  // Step state: 1 = Request OTP, 2 = Verify OTP
  const [step, setStep] = useState<1 | 2>(1);

  // Form inputs (pure empty state for production)
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');

  // UI state
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [infoMsg, setInfoMsg] = useState('');
  const [countdown, setCountdown] = useState(0);

  const otpInputRef = useRef<HTMLInputElement>(null);

  // Resend countdown timer
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  // Focus OTP input when transitioning to Step 2
  useEffect(() => {
    if (step === 2) {
      otpInputRef.current?.focus();
    }
  }, [step]);

  // Step 1: Send OTP
  const handleSendOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMsg('');
    setInfoMsg('');

    const cleanEmail = email.trim().toLowerCase();
    const cleanName = name.trim();

    if (!cleanName) {
      setErrorMsg('Please enter your administrator name.');
      return;
    }

    if (!cleanEmail) {
      setErrorMsg('Please enter your work email address.');
      return;
    }

    setLoading(true);
    try {
      const res = await authService.sendOtp(cleanName, cleanEmail, 'ADMIN');
      showToast('success', 'OTP Sent', res.message);
      setInfoMsg(res.message);
      setOtp('');
      setStep(2);
      setCountdown(60);
    } catch (err: any) {
      const msg = err.message || 'Failed to dispatch verification code.';
      setErrorMsg(msg);
      showToast('error', 'Authentication Failed', msg);
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify OTP
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    const cleanOtp = otp.trim().replace(/\s+/g, '');
    if (!cleanOtp) {
      setErrorMsg('Please enter the 6-digit OTP code.');
      return;
    }

    setLoading(true);
    try {
      const res = await authService.verifyOtp(email.trim().toLowerCase(), cleanOtp);
      showToast('success', 'Authenticated', `Welcome, ${res.user.name}`);
      onLoginSuccess(res.user);
    } catch (err: any) {
      const msg = err.message || 'Invalid or expired OTP code.';
      setErrorMsg(msg);
      showToast('error', 'Verification Failed', msg);
    } finally {
      setLoading(false);
    }
  };

  const handleEditEmail = () => {
    setStep(1);
    setOtp('');
    setErrorMsg('');
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Back Link */}
        <button
          onClick={onNavigateHome}
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors mb-6 group cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" />
          <span>Return to Portal</span>
        </button>

        {/* Card Box */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden">
          {/* Header Strip */}
          <div className="bg-slate-900 px-6 py-8 text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-tr from-emerald-950/40 via-transparent to-transparent pointer-events-none" />

            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-emerald-600/20 border border-emerald-500/30 text-emerald-400 mb-3 relative">
              <Shield className="w-7 h-7" />
              <div className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-emerald-500 ring-2 ring-slate-900" />
            </div>

            <h1 className="text-xl font-extrabold text-white tracking-tight">
              ESTATE<span className="text-emerald-400">HUB</span> Admin Gate
            </h1>
            <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
              Passwordless Two-Step Verification
            </p>

            {/* Stepper indicator */}
            <div className="mt-5 flex items-center justify-center gap-3">
              <div
                className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold transition-all ${
                  step === 1
                    ? 'bg-emerald-500 text-slate-950 shadow-sm'
                    : 'bg-emerald-950/80 text-emerald-300 border border-emerald-800/40'
                }`}
              >
                <span>1. Request OTP</span>
                {step === 2 && <CheckCircle2 className="w-3 h-3 text-emerald-400" />}
              </div>

              <div className="w-4 h-px bg-slate-700" />

              <div
                className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold transition-all ${
                  step === 2
                    ? 'bg-emerald-500 text-slate-950 shadow-sm'
                    : 'bg-slate-800 text-slate-400 border border-slate-700'
                }`}
              >
                <span>2. Verify Code</span>
              </div>
            </div>
          </div>

          {/* Error Banner */}
          {errorMsg && (
            <div className="mx-6 mt-6 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 leading-relaxed flex items-start gap-2.5">
              <div className="w-1.5 h-1.5 rounded-full bg-rose-600 mt-1.5 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* ================= STEP 1: REQUEST OTP ================= */}
          {step === 1 && (
            <form onSubmit={handleSendOtp} className="p-6 sm:p-8 space-y-5">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Full Name *
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="Enter your name"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 outline-none text-sm text-slate-800 font-medium transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Work Email *
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="admin@yourcompany.com"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 outline-none text-sm text-slate-800 font-medium transition-all"
                  />
                </div>
              </div>

              {/* Role Indicator */}
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <div>
                    <p className="text-xs font-bold text-slate-800">Privilege</p>
                    <p className="text-[11px] text-slate-500">Administrative console access</p>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-md bg-emerald-100 text-emerald-800 font-mono text-xs font-bold border border-emerald-200">
                  ADMIN
                </span>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Sending Code...</span>
                  </span>
                ) : (
                  <>
                    <span>Request OTP Code</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* ================= STEP 2: VERIFY OTP ================= */}
          {step === 2 && (
            <form onSubmit={handleVerifyOtp} className="p-6 sm:p-8 space-y-5">
              <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-between">
                <div>
                  <p className="text-[11px] font-medium text-emerald-800">Verification code sent to</p>
                  <p className="text-xs font-bold text-emerald-950 font-mono mt-0.5">{email}</p>
                </div>
                <button
                  type="button"
                  onClick={handleEditEmail}
                  className="px-2.5 py-1 rounded-lg bg-white border border-emerald-300 text-emerald-800 hover:bg-emerald-100 text-[11px] font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <Edit2 className="w-3 h-3" />
                  <span>Change</span>
                </button>
              </div>

              {infoMsg && (
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>{infoMsg}</span>
                </div>
              )}

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Enter 6-Digit OTP Code *
                  </label>
                  <span className="text-[11px] font-semibold text-slate-400">Valid for 10 minutes</span>
                </div>

                <div className="relative">
                  <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    ref={otpInputRef}
                    type="text"
                    required
                    maxLength={8}
                    autoComplete="one-time-code"
                    value={otp}
                    onChange={e => setOtp(e.target.value.replace(/[^0-9]/g, ''))}
                    placeholder="• • • • • •"
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-300 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 outline-none text-base font-mono tracking-widest text-slate-900 font-bold transition-all text-center"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || !otp.trim()}
                className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Verifying...</span>
                  </span>
                ) : (
                  <>
                    <span>Verify & Enter Admin Console</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              {/* Resend actions */}
              <div className="pt-2 flex items-center justify-between text-xs text-slate-600">
                <button
                  type="button"
                  onClick={handleEditEmail}
                  className="text-slate-500 hover:text-slate-800 font-medium transition-colors"
                >
                  ← Change details
                </button>

                <button
                  type="button"
                  disabled={countdown > 0 || loading}
                  onClick={() => handleSendOtp()}
                  className="font-bold text-emerald-700 hover:text-emerald-800 disabled:text-slate-400 transition-colors cursor-pointer"
                >
                  {countdown > 0 ? `Resend code in ${countdown}s` : 'Resend Code'}
                </button>
              </div>
            </form>
          )}

          {/* Footer Note */}
          <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-100 text-center text-[10px] text-slate-400">
            🔒 Secure JWT Authentication
          </div>
        </div>
      </div>
    </div>
  );
};
