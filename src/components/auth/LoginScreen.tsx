import React, { useState, useEffect, useRef } from 'react';
import {
  Shield,
  Home,
  Briefcase,
  Mail,
  User,
  ArrowRight,
  RefreshCw,
  CheckCircle2,
  Lock,
  Sparkles,
  ArrowLeft
} from 'lucide-react';
import { authService } from '../../services/auth';
import { landApi } from '../../services/landApi';
import { useToast } from '../common/Toast';

interface LoginScreenProps {
  onSuccess: (redirectPath: string) => void;
  onNavigateHome: () => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({
  onSuccess,
  onNavigateHome
}) => {
  const { showToast } = useToast();

  const [role, setRole] = useState<'OWNER' | 'AGENT'>('OWNER');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  // OTP inputs (6 individual digits)
  const [otpDigits, setOtpDigits] = useState<string[]>(['', '', '', '', '', '']);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Steps: 1 = Details & Request OTP, 2 = Verify OTP
  const [step, setStep] = useState<1 | 2>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 60-second Countdown Timer
  const [timerSeconds, setTimerSeconds] = useState(0);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (timerSeconds > 0) {
      interval = setInterval(() => {
        setTimerSeconds(prev => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timerSeconds]);

  // Focus first digit box on step 2
  useEffect(() => {
    if (step === 2) {
      const timer = setTimeout(() => {
        inputRefs.current[0]?.focus();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [step]);

  const handleSendOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    if (!name.trim()) {
      showToast('error', 'Name Required', 'Please provide your full legal name.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim() || !emailRegex.test(email.trim())) {
      showToast('error', 'Invalid Email', 'Please enter a valid email address.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await authService.sendOtp(name.trim(), email.trim().toLowerCase(), role);
      showToast('success', 'Verification OTP Sent', res.message || `OTP sent to ${email}`);
      setStep(2);
      setTimerSeconds(60);
      setOtpDigits(['', '', '', '', '', '']);
    } catch (err: any) {
      showToast('error', 'Request Failed', err.message || 'Could not send verification code.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    const cleanChar = value.replace(/[^0-9]/g, '');
    const newDigits = [...otpDigits];

    if (cleanChar.length > 1) {
      // User pasted multiple characters into a single box
      const pastedChars = cleanChar.slice(0, 6).split('');
      for (let i = 0; i < 6; i++) {
        newDigits[i] = pastedChars[i] || '';
      }
      setOtpDigits(newDigits);
      const nextIdx = Math.min(pastedChars.length, 5);
      inputRefs.current[nextIdx]?.focus();
      return;
    }

    newDigits[index] = cleanChar;
    setOtpDigits(newDigits);

    // Auto focus next input
    if (cleanChar && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData('text').replace(/[^0-9]/g, '').slice(0, 6);
    if (!pasteData) return;

    const newDigits = [...otpDigits];
    for (let i = 0; i < 6; i++) {
      newDigits[i] = pasteData[i] || '';
    }
    setOtpDigits(newDigits);
    const targetIdx = Math.min(pasteData.length, 5);
    inputRefs.current[targetIdx]?.focus();
  };

  const handleVerifyOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const otp = otpDigits.join('');

    if (otp.length < 6) {
      showToast('error', 'Incomplete Code', 'Please enter all 6 digits of your verification OTP.');
      return;
    }

    setIsSubmitting(true);
    try {
      const authData = await authService.verifyOtp(email.trim().toLowerCase(), otp);
      showToast('success', 'Authentication Successful', `Welcome, ${authData.name}`);

      // Check whether user already has parcel submissions
      let targetPath = '/submit-land';
      try {
        const myParcels = await landApi.getMyLands();
        if (myParcels && myParcels.length > 0) {
          targetPath = '/my-lands';
        }
      } catch {
        targetPath = '/submit-land';
      }

      onSuccess(targetPath);
    } catch (err: any) {
      showToast('error', 'Verification Failed', err.message || 'Invalid or expired OTP.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 sm:p-6 lg:p-8 bg-gradient-to-b from-slate-50 via-emerald-50/25 to-slate-100 text-slate-900 relative overflow-hidden">
      {/* Soft Ambient Background Accents */}
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        {/* Back navigation */}
        <button
          onClick={onNavigateHome}
          className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-900 font-semibold transition-colors mb-5 cursor-pointer group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
          <span>Back to Developers Directory</span>
        </button>

        {/* Card Container (Clean Light Enterprise Aesthetic) */}
        <div className="bg-white/95 backdrop-blur-md border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-xl shadow-slate-200/60">
          {/* Header Brand */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-600 to-emerald-700 text-white shadow-md shadow-emerald-900/15 mb-3">
              <Shield className="w-6 h-6" />
            </div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900">
              Institutional Land Portal
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Direct access for Landowners & Authorized Channel Partners
            </p>
          </div>

          {/* Role Selector Pill Toggle */}
          <div className="mb-6">
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2 text-center">
              Select Your Access Role
            </label>
            <div className="grid grid-cols-2 gap-2 p-1.5 bg-slate-100/90 border border-slate-200/90 rounded-2xl">
              <button
                type="button"
                onClick={() => {
                  setRole('OWNER');
                  if (step === 2) {
                    setStep(1);
                    setOtpDigits(['', '', '', '', '', '']);
                  }
                }}
                className={`flex flex-col items-center justify-center py-2.5 px-3 rounded-xl transition-all cursor-pointer ${
                  role === 'OWNER'
                    ? 'bg-white text-slate-900 shadow-xs border border-slate-200 font-bold'
                    : 'text-slate-600 hover:text-slate-900 font-medium'
                }`}
              >
                <div className="flex items-center gap-1.5 text-xs">
                  <Home className={`w-4 h-4 ${role === 'OWNER' ? 'text-emerald-600' : 'text-slate-400'}`} />
                  <span>Landowner</span>
                </div>
                <span className={`text-[10px] mt-0.5 font-bold ${role === 'OWNER' ? 'text-emerald-700' : 'text-slate-400'}`}>
                  OWNER
                </span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setRole('AGENT');
                  if (step === 2) {
                    setStep(1);
                    setOtpDigits(['', '', '', '', '', '']);
                  }
                }}
                className={`flex flex-col items-center justify-center py-2.5 px-3 rounded-xl transition-all cursor-pointer ${
                  role === 'AGENT'
                    ? 'bg-white text-slate-900 shadow-xs border border-slate-200 font-bold'
                    : 'text-slate-600 hover:text-slate-900 font-medium'
                }`}
              >
                <div className="flex items-center gap-1.5 text-xs">
                  <Briefcase className={`w-4 h-4 ${role === 'AGENT' ? 'text-emerald-600' : 'text-slate-400'}`} />
                  <span>Real Estate Agent</span>
                </div>
                <span className={`text-[10px] mt-0.5 font-bold ${role === 'AGENT' ? 'text-emerald-700' : 'text-slate-400'}`}>
                  AGENT
                </span>
              </button>
            </div>
            <div className="text-[11px] text-center text-slate-500 mt-2 px-2">
              {role === 'OWNER'
                ? '🏡 Submit and review land proposals for Joint Development (JDA) or Outright Sale.'
                : '🤝 Register client land parcels, represent mandates, and track institutional brokerage.'}
            </div>
          </div>

          {/* Step 1: Details & Send OTP */}
          {step === 1 && (
            <form onSubmit={handleSendOtp} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Full Name <span className="text-emerald-600">*</span>
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder={role === 'OWNER' ? 'e.g. Rajesh Sharma' : 'e.g. Vikram Singhania'}
                    className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-slate-50/70 border border-slate-300 text-xs text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 shadow-2xs transition-all font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Official Email Address <span className="text-emerald-600">*</span>
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="rajesh@example.com"
                    className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-slate-50/70 border border-slate-300 text-xs text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 shadow-2xs transition-all font-mono"
                  />
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  A 6-digit one-time verification password will be dispatched to this address.
                </p>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full mt-2 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs tracking-wide shadow-md shadow-emerald-900/15 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Dispatching OTP...</span>
                  </>
                ) : (
                  <>
                    <span>Send OTP</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* Step 2: 6-Box Individual Digit OTP Input */}
          {step === 2 && (
            <form onSubmit={handleVerifyOtp} className="space-y-5">
              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs flex items-center justify-between">
                <div>
                  <span className="text-slate-500 text-[10px] block uppercase tracking-wider font-bold">
                    Code dispatched to
                  </span>
                  <span className="font-mono text-emerald-700 font-bold text-xs">{email}</span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setStep(1);
                    setOtpDigits(['', '', '', '', '', '']);
                  }}
                  className="text-xs text-emerald-700 hover:text-emerald-800 font-bold underline underline-offset-2 cursor-pointer transition-colors"
                >
                  Change
                </button>
              </div>

              <div>
                <label className="block text-center text-xs font-bold text-slate-700 mb-3">
                  Enter 6-Digit Verification Code
                </label>

                {/* 6 Individual Digit Boxes */}
                <div className="flex items-center justify-center gap-2 sm:gap-2.5" onPaste={handlePaste}>
                  {otpDigits.map((digit, idx) => (
                    <input
                      key={idx}
                      ref={el => { inputRefs.current[idx] = el; }}
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={1}
                      value={digit}
                      onChange={e => handleOtpChange(idx, e.target.value)}
                      onKeyDown={e => handleKeyDown(idx, e)}
                      className={`w-11 h-13 text-center text-lg sm:text-xl font-bold font-mono rounded-xl border transition-all focus:outline-none ${
                        digit
                          ? 'border-emerald-600 text-emerald-900 bg-emerald-50/60 shadow-xs'
                          : 'bg-slate-50/80 border-slate-300 text-slate-900 focus:bg-white focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600'
                      }`}
                    />
                  ))}
                </div>
              </div>

              {/* Countdown Timer / Resend Button */}
              <div className="text-center text-xs">
                {timerSeconds > 0 ? (
                  <span className="text-slate-500 font-medium">
                    Resend code in{' '}
                    <span className="font-mono text-emerald-700 font-bold">
                      {timerSeconds}s
                    </span>
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleSendOtp()}
                    disabled={isSubmitting}
                    className="text-emerald-700 hover:text-emerald-800 font-bold text-xs underline underline-offset-2 cursor-pointer transition-colors"
                  >
                    Resend OTP Code
                  </button>
                )}
              </div>

              <button
                type="submit"
                disabled={isSubmitting || otpDigits.join('').length < 6}
                className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs tracking-wide shadow-md shadow-emerald-900/15 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Verifying Code...</span>
                  </>
                ) : (
                  <>
                    <span>Verify & Continue</span>
                    <CheckCircle2 className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* Security & RERA Badge */}
          <div className="mt-6 pt-5 border-t border-slate-100 flex items-center justify-center gap-2 text-[11px] text-slate-400">
            <Lock className="w-3.5 h-3.5 text-emerald-600" />
            <span>End-to-End Encrypted • RERA Institutional Verification</span>
          </div>
        </div>

        {/* Demo Helper note for development ease */}
        <div className="mt-4 p-3 rounded-2xl bg-white/80 border border-slate-200 text-[11px] text-slate-500 text-center shadow-2xs">
          <Sparkles className="w-3.5 h-3.5 text-emerald-600 inline mr-1.5" />
          <span>OTP valid for 10 minutes. If backend mock OTP is configured, use <b className="text-emerald-700">123456</b>.</span>
        </div>
      </div>
    </div>
  );
};
