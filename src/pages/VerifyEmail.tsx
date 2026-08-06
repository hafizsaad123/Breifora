import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Mail, ChevronLeft, ArrowRight, RefreshCw, Sparkles, Check, Inbox } from 'lucide-react';
import Logo from '../components/ui/Logo';
import { supabase } from '../utils/supabase';

export default function VerifyEmail() {
  const navigate = useNavigate();
  const location = useLocation();

  // Get email from route state or fall back to localStorage
  const [email, setEmail] = useState<string>(() => {
    if (location.state && (location.state as any).email) {
      return (location.state as any).email;
    }
    return localStorage.getItem('pending_verification_email') || '';
  });

  const [cooldown, setCooldown] = useState<number>(0);
  const [isResending, setIsResending] = useState<boolean>(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Manage 60-second cooldown timer
  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => {
      setCooldown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  // Handle Resend Verification Email
  const handleResend = async () => {
    if (cooldown > 0 || isResending) return;
    if (!email) {
      setToast({ type: 'error', text: 'No pending email address found. Please try logging in or signing up again.' });
      return;
    }

    setIsResending(true);
    setToast(null);

    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email,
        options: {
          emailRedirectTo: `${window.location.origin}/onboarding`,
        },
      });

      if (error) {
        throw error;
      }

      setToast({ type: 'success', text: 'Verification email resent successfully!' });
      setCooldown(60);
    } catch (err: any) {
      console.error('Error resending verification email:', err);
      setToast({
        type: 'error',
        text: err.message || 'Failed to resend verification email. Please try again.',
      });
    } finally {
      setIsResending(false);
    }
  };

  // Handle Back to Login - clears pending verification details
  const handleBackToLogin = () => {
    localStorage.removeItem('pending_verification_email');
    navigate('/login');
  };

  return (
    <div className="w-full min-h-screen relative flex flex-col justify-between items-center overflow-x-hidden bg-[#FFFFFF] p-4 sm:p-6 font-sans select-none antialiased">
      {/* Background Radial Light Accent matching Landing.tsx and Signup.tsx */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-10%,rgba(37,22,255,0.07),rgba(255,255,255,0))] pointer-events-none" />

      {/* Top Header Navigation Bar */}
      <div className="relative z-20 w-full max-w-5xl flex items-center justify-center py-4 px-2">
        <div className="absolute left-2 sm:left-4">
          <button
            onClick={handleBackToLogin}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-slate-200/80 bg-white/80 backdrop-blur-xs text-slate-700 hover:text-slate-900 hover:border-slate-300 text-xs font-semibold transition-all shadow-xs cursor-pointer"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            <span>Back to Login</span>
          </button>
        </div>

        <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
          <Logo iconSize={32} />
        </div>
      </div>

      {/* Main Container Card */}
      <div className="relative z-10 w-full max-w-[440px] my-auto py-4">
        <div className="w-full bg-white border border-slate-200/80 rounded-[28px] md:rounded-[32px] p-7 sm:p-9 flex flex-col shadow-xl shadow-slate-200/40 relative">
          
          {/* Animated Card Content */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col text-center"
          >
            {/* Top Mail / Inbox Icon */}
            <div className="mx-auto w-14 h-14 rounded-full bg-purple-50 text-[#2516FF] flex items-center justify-center mb-6 shadow-sm">
              <Inbox className="w-7 h-7 text-[#2516FF]" />
            </div>

            {/* Heading */}
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight leading-tight mb-2">
              Check Your Inbox ✉️
            </h2>

            {/* Description */}
            <p className="text-xs font-normal text-slate-500 mb-4 leading-relaxed">
              We sent a confirmation link to:
            </p>

            {/* Highlighted Email Badge / Pill */}
            {email ? (
              <div className="mb-6 flex justify-center">
                <span className="inline-flex items-center bg-purple-50 text-purple-700 font-medium text-xs px-4 py-1.5 rounded-full border border-purple-100/85 break-all max-w-full">
                  {email}
                </span>
              </div>
            ) : (
              <div className="mb-6 flex justify-center">
                <span className="inline-flex items-center bg-amber-50 text-amber-700 font-medium text-xs px-4 py-1.5 rounded-full border border-amber-100/85">
                  Your registered email
                </span>
              </div>
            )}

            {/* Detailed Instructions */}
            <p className="text-xs text-slate-600 leading-relaxed mb-6 font-medium">
              Click the link in the email to activate your Briefora account and continue onboarding.
            </p>

            {/* Action Buttons */}
            <div className="space-y-3">
              <motion.button
                whileHover={{ y: cooldown > 0 || isResending ? 0 : -0.5 }}
                whileTap={{ scale: cooldown > 0 || isResending ? 1 : 0.985 }}
                onClick={handleResend}
                disabled={cooldown > 0 || isResending}
                className="w-full py-3 rounded-full bg-[#2516FF] disabled:bg-slate-100 disabled:text-slate-400 text-white font-bold text-xs hover:bg-[#1f10e6] disabled:hover:bg-slate-100 transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer border-none"
              >
                {isResending ? (
                  <>
                    <svg className="animate-spin h-4 w-4 text-slate-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Resending...</span>
                  </>
                ) : cooldown > 0 ? (
                  <span>Resend in {cooldown}s</span>
                ) : (
                  <>
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Resend Verification Email</span>
                  </>
                )}
              </motion.button>
            </div>

            {/* Feedback Alerts */}
            <AnimatePresence mode="wait">
              {toast && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className={`mt-4 p-3 rounded-xl text-left border ${
                    toast.type === 'success'
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-100'
                      : 'bg-rose-50 text-rose-800 border-rose-100'
                  }`}
                >
                  <p className="text-[11px] font-semibold leading-relaxed">
                    {toast.text}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Divider */}
            <div className="relative flex py-4 items-center">
              <div className="flex-grow border-t border-slate-100"></div>
            </div>

            {/* Footer Notice */}
            <p className="text-[11px] text-slate-400 leading-normal mb-1 font-medium">
              Didn't receive the email? Check your spam folder or contact support.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Page Footer */}
      <div className="relative z-20 py-4 text-center">
        <button
          onClick={handleBackToLogin}
          className="text-xs font-bold text-[#2516FF] hover:underline cursor-pointer bg-transparent border-none p-0"
        >
          ← Back to Login
        </button>
      </div>
    </div>
  );
}
