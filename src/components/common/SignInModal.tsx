import React, { useState } from 'react';
import { Modal } from './Modal';
import { useToast } from './Toast';
import { Mail, User, ArrowRight, KeyRound, RefreshCw, CheckCircle2, Building2 } from 'lucide-react';
import { authService } from '../../services/auth';

interface SignInModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SignInModal: React.FC<SignInModalProps> = ({
  isOpen,
  onClose
}) => {
  const { showToast } = useToast();
  const [partnerType, setPartnerType] = useState<'OWNER' | 'AGENT'>('OWNER');
  
  // Form fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  
  // Step: 1 = Request Code, 2 = Verify Code
  const [step, setStep] = useState<1 | 2>(1);
  const [loading, setLoading] = useState(false);

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      showToast('error', 'Missing Name', 'Please enter your full name.');
      return;
    }
    if (!email.trim()) {
      showToast('error', 'Missing Email', 'Please enter your email address.');
      return;
    }

    setLoading(true);
    try {
      const res = await authService.sendOtp(name.trim(), email.trim().toLowerCase(), partnerType);
      showToast('success', 'Verification Code Sent', res.message);
      setOtp('');
      setStep(2);
    } catch (err: any) {
      showToast('error', 'Request Failed', err.message || 'Could not send verification code.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanOtp = otp.trim().replace(/\s+/g, '');
    if (!cleanOtp) {
      showToast('error', 'Missing Code', 'Please enter the 6-digit OTP code.');
      return;
    }

    setLoading(true);
    try {
      const res = await authService.verifyOtp(email.trim().toLowerCase(), cleanOtp);
      showToast('success', 'Signed In', `Welcome back, ${res.user.name}`);
      onClose();
      // Reset form
      setStep(1);
      setName('');
      setEmail('');
      setOtp('');
    } catch (err: any) {
      showToast('error', 'Verification Failed', err.message || 'Invalid or expired OTP.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Portal Sign In"
      subtitle="Land Owner & Channel Partner Access"
      maxWidth="md"
    >
      <div className="space-y-4">
        {/* Partner Type Toggle */}
        <div className="grid grid-cols-2 gap-2 p-1 rounded-xl bg-slate-100 border border-slate-200">
          <button
            type="button"
            onClick={() => { setPartnerType('OWNER'); setStep(1); setOtp(''); }}
            className={`py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              partnerType === 'OWNER'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>Land Owner</span>
          </button>

          <button
            type="button"
            onClick={() => { setPartnerType('AGENT'); setStep(1); setOtp(''); }}
            className={`py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              partnerType === 'AGENT'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>Real Estate Agent</span>
          </button>
        </div>

        {/* Step 1: Request Code */}
        {step === 1 && (
          <form onSubmit={handleSendOtp} className="space-y-3.5">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Full Name *
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Enter your name"
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-white border border-slate-300 text-xs text-slate-900 focus:outline-none focus:border-emerald-600"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Email Address *
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="you@company.com"
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-white border border-slate-300 text-xs text-slate-900 focus:outline-none focus:border-emerald-600 font-mono"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-900/10 flex items-center justify-center gap-1.5 transition-all cursor-pointer"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Requesting Code...</span>
                </>
              ) : (
                <>
                  <span>Send Verification Code</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </form>
        )}

        {/* Step 2: Verify Code */}
        {step === 2 && (
          <form onSubmit={handleVerifyOtp} className="space-y-3.5">
            <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
              <div>
                <span className="text-slate-500 block text-[10px]">Code sent to</span>
                <span className="font-mono font-bold text-slate-900">{email}</span>
              </div>
              <button
                type="button"
                onClick={() => setStep(1)}
                className="text-[11px] text-emerald-700 hover:underline font-semibold cursor-pointer"
              >
                Change
              </button>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Enter 6-Digit Code
              </label>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  required
                  autoFocus
                  maxLength={8}
                  value={otp}
                  onChange={e => setOtp(e.target.value.replace(/[^0-9]/g, ''))}
                  placeholder="• • • • • •"
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-white border border-slate-300 text-sm font-mono tracking-widest text-slate-900 focus:outline-none focus:border-emerald-600 text-center font-bold"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !otp.trim()}
              className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-900/10 flex items-center justify-center gap-1.5 transition-all cursor-pointer"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Verifying...</span>
                </>
              ) : (
                <>
                  <span>Verify Code</span>
                  <CheckCircle2 className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </Modal>
  );
};
