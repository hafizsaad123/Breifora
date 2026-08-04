import React, { useState, useMemo, useEffect } from 'react';
import { useSearchParams, Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'motion/react';
import { 
  Check, Copy, ArrowLeft, ShieldCheck, 
  ExternalLink, MessageCircle, Wallet, Lock, Sparkles, User as UserIcon, LogOut, X,
  Clock
} from 'lucide-react';
import Logo from '../components/ui/Logo';
import { useAppSettings } from '../context/AppSettingsContext';
import { defaultCheckoutConfig } from '../lib/adminSync';
import { useAuth } from '../context/AuthContext';
import { pricingPlans } from '../data';

export default function Checkout() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { settings } = useAppSettings();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [isChangePlanOpen, setIsChangePlanOpen] = useState(false);
  const [modalIsYearly, setModalIsYearly] = useState(false);

  // Smart Pre-Checkout Auth Guard
  useEffect(() => {
    const localUser = localStorage.getItem('briefora_current_user') || localStorage.getItem('briefora_user');
    if (!user && !localUser) {
      const currentFullUrl = location.pathname + location.search;
      navigate(`/signup?redirect=${encodeURIComponent(currentFullUrl)}`, { replace: true });
    }
  }, [user, location, navigate]);

  const checkoutConfig = useMemo(() => {
    const raw = settings.checkout_config || defaultCheckoutConfig;
    return {
      ...defaultCheckoutConfig,
      ...raw,
      pageText: {
        ...defaultCheckoutConfig.pageText,
        ...(raw.pageText || {})
      },
      accountDetails: {
        ...defaultCheckoutConfig.accountDetails,
        ...(raw.accountDetails || {})
      },
      pkrPrices: {
        ...defaultCheckoutConfig.pkrPrices,
        ...(raw.pkrPrices || {})
      },
      whatsAppConfig: {
        ...defaultCheckoutConfig.whatsAppConfig,
        ...(raw.whatsAppConfig || {})
      },
      legalPolicy: {
        ...defaultCheckoutConfig.legalPolicy,
        ...(raw.legalPolicy || {})
      }
    };
  }, [settings.checkout_config]);

  const pageText = checkoutConfig.pageText!;

  // Query Params
  const planParam = (searchParams.get('plan') || 'pro').toLowerCase();
  const billingParam = (searchParams.get('billing') || 'monthly').toLowerCase();

  const isYearly = billingParam === 'yearly' || billingParam === 'annual';

  // Normalize Plan Key
  const planKey = useMemo<'starter' | 'pro' | 'studio'>(() => {
    if (planParam.includes('starter') || planParam.includes('free')) return 'starter';
    if (planParam.includes('studio')) return 'studio';
    return 'pro';
  }, [planParam]);

  // Find Plan Details from Pricing Settings
  const planDetails = useMemo(() => {
    const list = settings.pricing || [];
    const matched = list.find((p: any) => {
      const pid = (p.id || '').toLowerCase();
      const pname = (p.name || '').toLowerCase();
      if (planKey === 'starter') {
        return pid === 'plan-starter' || pid === 'starter' || pid === 'plan-free' || pid === 'free' || pname === 'starter' || pname === 'free';
      }
      return pid === `plan-${planKey}` || pid === planKey || pname === planKey;
    });

    if (matched) {
      return {
        ...matched,
        name: (matched.name === 'Free' || planKey === 'starter') ? 'Starter' : matched.name
      };
    }

    if (planKey === 'starter') {
      return {
        name: 'Starter',
        description: 'For independent creators establishing their onboarding workflow.',
        features: [
          '1 Active magic client link',
          'Tactile core typographic tracks & style sliders',
          'Zero-login mobile access',
          'Live-updating browser blueprint workspace',
          'Direct raw data exports'
        ]
      };
    } else if (planKey === 'studio') {
      return {
        name: 'Studio',
        description: 'For high-end digital agencies and creative groups.',
        features: [
          '100% white-label client portals',
          'Custom studio domain hosting',
          'Up to 5 team editor seats',
          'Interactive client heatmap metrics',
          'Priority direct Slack/email onboarding'
        ]
      };
    } else {
      return {
        name: 'Pro',
        description: 'For active freelance designers and brand strategists.',
        features: [
          'Unlimited active brief links',
          'Automatic strategic blueprint compiler',
          'Premium PDF briefs to anchor proposals',
          'Custom studio branding',
          'Direct Figma & Notion embeds',
          'Interactive moodboard selector'
        ]
      };
    }
  }, [settings.pricing, planKey]);

  // PKR Price Calculation
  const pkrPriceNum = useMemo(() => {
    const prices = checkoutConfig.pkrPrices || defaultCheckoutConfig.pkrPrices;
    const planPrices = prices[planKey] || (planKey === 'starter' ? { monthly: 2500, annual: 17000 } : { monthly: 5000, annual: 35000 });
    return isYearly ? planPrices.annual : planPrices.monthly;
  }, [checkoutConfig.pkrPrices, planKey, isYearly]);

  const pkrPriceFormatted = useMemo(() => {
    if (pkrPriceNum === 0) return 'FREE';
    return `PKR ${pkrPriceNum.toLocaleString()}`;
  }, [pkrPriceNum]);

  // Active Tab: JazzCash or EasyPaisa
  const [selectedGateway, setSelectedGateway] = useState<'jazzcash' | 'easypaisa'>('jazzcash');

  // Copy State
  const [copied, setCopied] = useState(false);
  const handleCopyNumber = () => {
    const numberToCopy = selectedGateway === 'easypaisa'
      ? (checkoutConfig.accountDetails.easyPaisaAccountNumber || '03322933095')
      : (checkoutConfig.accountDetails.mobileAccountNumber || '03112075467');
    navigator.clipboard.writeText(numberToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  // Get highly personalized, verified step-by-step instructions per wallet
  const getPersonalizedSteps = () => {
    const hasCustomSteps = checkoutConfig.instructionSteps && 
      JSON.stringify(checkoutConfig.instructionSteps) !== JSON.stringify(defaultCheckoutConfig.instructionSteps);

    if (hasCustomSteps) {
      return checkoutConfig.instructionSteps;
    }

    if (selectedGateway === 'easypaisa') {
      const activeNumber = checkoutConfig.accountDetails?.easyPaisaAccountNumber || '03322933095';
      const activeTitle = checkoutConfig.accountDetails?.easyPaisaAccountTitle || 'SAMIA BANO';
      return [
        <span key="1">Open your <strong>EasyPaisa App</strong> on your smartphone, or dial <strong>*786#</strong> if using USSD code.</span>,
        <span key="2">On the main screen, tap on <strong>"EasyPaisa Transfer"</strong> to initiate a direct wallet-to-wallet payment.</span>,
        <span key="3">Enter our mobile number <strong className="text-emerald-600 select-all font-mono">{activeNumber}</strong> and tap next.</span>,
        <span key="4">Specify the exact subscription amount of <strong className="font-mono text-slate-950 font-bold">{pkrPriceFormatted}</strong>.</span>,
        <span key="5"><strong>CRITICAL VERIFICATION:</strong> On the confirmation screen, verify that the Account Title is <strong className="text-slate-900 font-bold underline">{activeTitle}</strong> before entering your PIN.</span>,
        <span key="6">Save the transaction receipt or take a clear screenshot of the confirmation page.</span>
      ];
    } else {
      const activeNumber = checkoutConfig.accountDetails?.mobileAccountNumber || '03112075467';
      const activeTitle = checkoutConfig.accountDetails?.accountTitle || 'Saif ur Rehman';
      return [
        <span key="1">Open your <strong>JazzCash App</strong> on your smartphone, or dial <strong>*786#</strong> if using USSD code.</span>,
        <span key="2">Tap on <strong>"Send Money"</strong> on the main dashboard and select the <strong>"Mobile Account"</strong> option.</span>,
        <span key="3">Enter our registered number <strong className="text-[#2516FF] select-all font-mono">{activeNumber}</strong> and tap next.</span>,
        <span key="4">Specify the exact subscription amount of <strong className="font-mono text-slate-950 font-bold">{pkrPriceFormatted}</strong>.</span>,
        <span key="5"><strong>CRITICAL VERIFICATION:</strong> On the confirmation screen, verify that the Account Title is <strong className="text-slate-900 font-bold underline">{activeTitle}</strong> before entering your 4-digit MPIN.</span>,
        <span key="6">Save the transaction receipt or take a clear screenshot of the confirmation page.</span>
      ];
    }
  };

  // Terms Agreement Checkbox State
  const [termsAgreed, setTermsAgreed] = useState(false);
  const [isPaymentDoneOpen, setIsPaymentDoneOpen] = useState(false);

  // Active user email
  const userEmail = user?.email || (localStorage.getItem('briefora_current_user') ? JSON.parse(localStorage.getItem('briefora_current_user')!).email : 'guest@briefora.com');

  // WhatsApp Link Generation
  const whatsappUrl = useMemo(() => {
    let rawNum = checkoutConfig.whatsAppConfig?.number || '03150106504';
    let digits = rawNum.replace(/[^0-9]/g, '');
    if (digits.startsWith('03')) {
      digits = '92' + digits.slice(1);
    }
    let template = checkoutConfig.whatsAppConfig?.messageTemplate || `Hi Briefora Team! 👋 I have transferred the payment for subscription activation.

📌 Order Details:
- Plan: {PLAN_NAME}
- Billing: {BILLING_CYCLE}
- Amount Paid: Rs. {AMOUNT}
- Payment Wallet: {PAYMENT_METHOD}
- Receiver Account Name: {ACCOUNT_NAME}
- Receiver Account Number: {ACCOUNT_NUMBER}
- Registered Email: {USER_EMAIL}

📎 Attached below is my transaction screenshot for verification.`;

    const cycleText = isYearly ? 'Annual Billing' : 'Monthly Billing';
    const methodText = selectedGateway === 'easypaisa' ? 'EasyPaisa Wallet' : 'JazzCash Wallet';
    const activeAccountTitle = selectedGateway === 'easypaisa'
      ? (checkoutConfig.accountDetails.easyPaisaAccountTitle || 'SAMIA BANO')
      : (checkoutConfig.accountDetails.accountTitle || 'Saif ur Rehman');
    const activeAccountNumber = selectedGateway === 'easypaisa'
      ? (checkoutConfig.accountDetails.easyPaisaAccountNumber || '03322933095')
      : (checkoutConfig.accountDetails.mobileAccountNumber || '03112075467');

    template = template
      .replace('{PLAN_NAME}', planDetails.name)
      .replace('{AMOUNT}', pkrPriceFormatted)
      .replace('{ACCOUNT_NAME}', activeAccountTitle)
      .replace('{ACCOUNT_NUMBER}', activeAccountNumber)
      .replace('{BILLING_CYCLE}', cycleText)
      .replace('{PAYMENT_METHOD}', methodText)
      .replace('{USER_EMAIL}', userEmail);

    return `https://wa.me/${digits}?text=${encodeURIComponent(template)}`;
  }, [checkoutConfig, planDetails.name, pkrPriceFormatted, isYearly, userEmail, selectedGateway]);

  const isButtonDisabled = checkoutConfig.legalPolicy.enforceTermsCheckbox && !termsAgreed;

  const handleSwitchAccount = () => {
    logout();
    const currentFullUrl = location.pathname + location.search;
    navigate(`/signup?redirect=${encodeURIComponent(currentFullUrl)}`);
  };

  const handleOpenChangePlan = (e: React.MouseEvent) => {
    e.preventDefault();
    setModalIsYearly(isYearly);
    setIsChangePlanOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#FAFAFC] text-slate-800 font-sans antialiased relative selection:bg-[#2516FF] selection:text-white flex flex-col justify-between overflow-x-hidden">
      {/* Background Ambient Accents */}
      <div className="fixed top-0 left-1/4 w-96 h-96 bg-[#2516FF]/5 rounded-full blur-[140px] pointer-events-none" />
      <div className="fixed bottom-0 right-1/4 w-96 h-96 bg-[#5956E9]/5 rounded-full blur-[140px] pointer-events-none" />

      {/* Light Theme Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-slate-200/60 sticky top-0 z-40 py-4 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 group cursor-pointer">
            <Logo iconSize={32} />
          </Link>

          <button
            onClick={handleOpenChangePlan}
            className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-50 border border-slate-200 px-4 py-2 rounded-xl transition-all cursor-pointer shadow-sm"
          >
            <ArrowLeft className="w-4 h-4" /> {pageText.changePlanText || 'Change Plan'}
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-14 flex-grow relative z-10 w-full">
        {/* Page Hero Title */}
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#2516FF]/5 border border-[#2516FF]/10 text-[#2516FF] text-[11px] font-bold tracking-wider uppercase mb-3">
            <ShieldCheck className="w-3.5 h-3.5 text-[#2516FF]" /> {pageText.headerBadgeText}
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            {pageText.pageTitle}
          </h1>
          <p className="text-slate-500 text-sm sm:text-base mt-1.5 max-w-2xl leading-relaxed font-medium">
            {pageText.pageDescription}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
          
          {/* LEFT COLUMN: PLAN SUMMARY (Light High-Contrast Card) */}
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="lg:col-span-5 bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 shadow-md shadow-slate-100/40 relative overflow-hidden"
          >
            {/* Corner Decorative Accent */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-[#2516FF]/5 to-transparent rounded-bl-full pointer-events-none" />

            <div className="flex items-center justify-between gap-3 mb-4">
              <span className="px-3.5 py-1 rounded-lg bg-[#2516FF] text-white text-xs font-bold uppercase tracking-wider shadow-md">
                {planDetails.name} Plan
              </span>
              <span className="text-xs font-semibold text-slate-600 bg-slate-50 px-3 py-1 rounded-full border border-slate-200 shadow-sm">
                {isYearly ? 'Annual Billing (Save 20%)' : 'Monthly Billing'}
              </span>
            </div>

            <p className="text-slate-500 text-xs sm:text-sm leading-relaxed mb-6 font-medium">
              {planDetails.description}
            </p>

            {/* Price Banner */}
            <div className="p-5 rounded-2xl bg-slate-50/70 border border-slate-100 mb-6">
              <span className="text-[11px] font-bold uppercase text-slate-500 tracking-wider block mb-1">
                {pageText.pkrConvertedLabel}
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl sm:text-4xl font-black text-slate-900 font-mono tracking-tight">
                  {pkrPriceFormatted}
                </span>
                <span className="text-slate-500 text-xs font-semibold">
                  {isYearly ? '/ year' : '/ month'}
                </span>
              </div>
              {isYearly && pkrPriceNum > 0 && (
                <p className="text-[11px] text-emerald-600 font-bold mt-1.5 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-emerald-600" /> Discounted annual pricing rate applied
                </p>
              )}
            </div>

            {/* Features List */}
            <div className="space-y-3 mb-8">
              <span className="text-xs font-bold uppercase text-slate-500 tracking-wider block">
                {pageText.includedFeaturesHeading}
              </span>
              <ul className="space-y-2.5 text-xs sm:text-sm text-slate-600 font-medium">
                {(planDetails.features || []).map((feat: string, idx: number) => (
                  <li key={idx} className="flex items-start gap-2.5">
                    <span className="w-4 h-4 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
                      <Check className="w-2.5 h-2.5" />
                    </span>
                    <span className="text-slate-600 font-semibold">{feat}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Change Plan Button */}
            <div className="pt-6 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-slate-500">Need a different tier?</span>
              <button 
                onClick={handleOpenChangePlan}
                className="text-[#2516FF] hover:text-[#1d11cc] font-bold transition-colors flex items-center gap-1 cursor-pointer"
              >
                Choose another plan →
              </button>
            </div>
          </motion.div>

          {/* RIGHT COLUMN: PAYMENT TERMINAL (Light High-Contrast Card) */}
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08 }}
            className="lg:col-span-7"
          >
            <div className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 shadow-md shadow-slate-100/40 space-y-6 relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#2516FF] to-[#5956E9]" />
              
              {/* Account / Logged in User Bar */}
              <div className="p-4 bg-slate-50/60 border border-slate-150 rounded-2xl flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-full bg-[#2516FF]/5 border border-[#2516FF]/10 flex items-center justify-center text-[#2516FF] shrink-0">
                    <UserIcon className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">Checkout Identity</p>
                    <p className="text-xs font-bold text-slate-800 truncate">{userEmail}</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleSwitchAccount}
                  className="text-xs font-bold text-slate-500 hover:text-slate-800 bg-white hover:bg-slate-50 px-3 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 border border-slate-200 shadow-sm"
                >
                  <LogOut className="w-3.5 h-3.5 text-slate-500" />
                  <span>Switch Account</span>
                </button>
              </div>

              {/* Payment Method Selector Tabs */}
              <div>
                <span className="text-xs font-bold uppercase text-slate-500 tracking-wider block mb-3">
                  {pageText.selectMethodHeading}
                </span>
                
                <div className="grid grid-cols-2 gap-3 sm:gap-4">
                  {checkoutConfig.accountDetails.jazzCashLogoToggle && (
                    <button
                      type="button"
                      onClick={() => setSelectedGateway('jazzcash')}
                      className={`p-4 rounded-2xl border transition-all flex items-center justify-center gap-3 cursor-pointer text-xs sm:text-sm font-bold ${
                        selectedGateway === 'jazzcash'
                          ? 'bg-[#2516FF]/5 border-[#2516FF] text-[#2516FF] shadow-md shadow-[#2516FF]/5 ring-2 ring-[#2516FF]/20'
                          : 'bg-slate-50/50 border-slate-200 text-slate-500 hover:text-slate-800 hover:border-slate-300'
                      }`}
                    >
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-black text-xs ${
                        selectedGateway === 'jazzcash' ? 'bg-[#2516FF] text-white' : 'bg-slate-100 text-slate-500 border border-slate-200'
                      }`}>
                        JC
                      </div>
                      <span>{checkoutConfig.accountDetails.jazzCashLabel || 'JazzCash'}</span>
                    </button>
                  )}

                  {checkoutConfig.accountDetails.easyPaisaLogoToggle && (
                    <button
                      type="button"
                      onClick={() => setSelectedGateway('easypaisa')}
                      className={`p-4 rounded-2xl border transition-all flex items-center justify-center gap-3 cursor-pointer text-xs sm:text-sm font-bold ${
                        selectedGateway === 'easypaisa'
                          ? 'bg-emerald-500/5 border-emerald-500 text-emerald-700 shadow-md shadow-emerald-500/5 ring-2 ring-emerald-500/20'
                          : 'bg-slate-50/50 border-slate-200 text-slate-500 hover:text-slate-800 hover:border-slate-300'
                      }`}
                    >
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-black text-xs ${
                        selectedGateway === 'easypaisa' ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-500 border border-slate-200'
                      }`}>
                        EP
                      </div>
                      <span>{checkoutConfig.accountDetails.easyPaisaLabel || 'EasyPaisa'}</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Account Details Box */}
              <div className="p-5 sm:p-6 bg-slate-50/50 border border-slate-200 rounded-2xl space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase text-slate-500 tracking-wider flex items-center gap-2">
                    <Wallet className="w-4 h-4 text-[#2516FF]" /> {pageText.eWalletBoxHeading}
                  </span>
                  <span className="text-[10px] font-bold uppercase bg-white text-slate-600 px-2.5 py-0.5 rounded-full border border-slate-200 shadow-sm">
                    {selectedGateway === 'jazzcash' ? (checkoutConfig.accountDetails.jazzCashLabel || 'JazzCash') : (checkoutConfig.accountDetails.easyPaisaLabel || 'EasyPaisa')}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block mb-1">
                      Account Title
                    </span>
                    <span className="text-sm font-black text-slate-800 tracking-wide block">
                      {selectedGateway === 'easypaisa'
                        ? (checkoutConfig.accountDetails.easyPaisaAccountTitle || 'SAMIA BANO')
                        : (checkoutConfig.accountDetails.accountTitle || 'Saif ur Rehman')}
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block mb-1">
                      Mobile Account Number
                    </span>
                    <div className="flex items-center gap-2">
                      <span className={`text-base font-black font-mono tracking-wider ${selectedGateway === 'easypaisa' ? 'text-emerald-600' : 'text-[#2516FF]'}`}>
                        {selectedGateway === 'easypaisa'
                          ? (checkoutConfig.accountDetails.easyPaisaAccountNumber || '03322933095')
                          : (checkoutConfig.accountDetails.mobileAccountNumber || '03112075467')}
                      </span>
                      <button
                        type="button"
                        onClick={handleCopyNumber}
                        className="p-1.5 rounded-lg bg-white hover:bg-slate-50 text-slate-600 transition-colors cursor-pointer relative border border-slate-200 shadow-sm"
                        title="Copy Number"
                      >
                        <Copy className="w-3.5 h-3.5" />
                        {copied && (
                          <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-850 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-lg whitespace-nowrap">
                            Copied!
                          </span>
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-200/80 flex items-center justify-between">
                  <span className="text-xs text-slate-500 font-semibold">Required Transfer Amount:</span>
                  <span className="text-base font-black text-slate-800 font-mono">{pkrPriceFormatted}</span>
                </div>
              </div>

              {/* Step-by-Step Payment Instructions */}
              <div>
                <span className="text-xs font-bold uppercase text-slate-500 tracking-wider block mb-3">
                  {pageText.instructionsHeading}
                </span>
                <ol className="space-y-3">
                  {getPersonalizedSteps().map((step, idx) => (
                    <li key={idx} className="flex items-start gap-3 p-3.5 bg-slate-50/40 border border-slate-150 rounded-xl text-xs sm:text-sm text-slate-600">
                      <span className="w-5 h-5 rounded-full bg-[#2516FF]/5 text-[#2516FF] text-[11px] font-bold flex items-center justify-center shrink-0 mt-0.5 border border-[#2516FF]/10">
                        {idx + 1}
                      </span>
                      <span className="leading-relaxed font-semibold">{step}</span>
                    </li>
                  ))}
                </ol>
              </div>

              {/* Legal & Terms Checkbox */}
              <div className="pt-2 border-t border-slate-150 space-y-3">
                <label className="flex items-start gap-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={termsAgreed}
                    onChange={(e) => setTermsAgreed(e.target.checked)}
                    className="mt-1 w-4 h-4 rounded border-slate-300 bg-slate-50 text-[#2516FF] focus:ring-[#2516FF] cursor-pointer"
                  />
                  <span className="text-xs text-slate-500 group-hover:text-slate-700 leading-relaxed font-medium">
                    I agree to the{' '}
                    <Link to={checkoutConfig.legalPolicy.termsUrl || '/termsofservice'} target="_blank" className="text-[#2516FF] hover:text-[#1d11cc] hover:underline font-bold">Terms of Service</Link>,{' '}
                    <Link to={checkoutConfig.legalPolicy.privacyUrl || '/privacypolicy'} target="_blank" className="text-[#2516FF] hover:text-[#1d11cc] hover:underline font-bold">Privacy Policy</Link>, and{' '}
                    <Link to={checkoutConfig.legalPolicy.refundUrl || '/usagepolicy'} target="_blank" className="text-[#2516FF] hover:text-[#1d11cc] hover:underline font-bold">Usage Policy</Link>.
                  </span>
                </label>
              </div>

              {/* Split Confirmation Buttons */}
              <div className="pt-2">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* WhatsApp Confirmation Button */}
                  <a
                    href={isButtonDisabled ? '#' : whatsappUrl}
                    target={isButtonDisabled ? '_self' : '_blank'}
                    rel="noopener noreferrer"
                    onClick={(e) => {
                      if (isButtonDisabled) {
                        e.preventDefault();
                      }
                    }}
                    className={`w-full py-4 px-4 rounded-2xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg select-none ${
                      isButtonDisabled
                        ? 'bg-slate-100 text-slate-400 cursor-not-allowed opacity-60 border border-slate-200'
                        : 'bg-emerald-600 hover:bg-emerald-500 text-white active:scale-[0.99] shadow-md shadow-emerald-600/10'
                    }`}
                  >
                    <MessageCircle className="w-4 h-4 shrink-0" />
                    <span className="truncate">{pageText.whatsAppButtonText || 'Confirm on WhatsApp'}</span>
                    <ExternalLink className="w-3.5 h-3.5 shrink-0 opacity-80" />
                  </a>

                  {/* Payment Done Button */}
                  <button
                    type="button"
                    disabled={isButtonDisabled}
                    onClick={() => {
                      if (!isButtonDisabled) {
                        setIsPaymentDoneOpen(true);
                      }
                    }}
                    className={`w-full py-4 px-4 rounded-2xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg select-none ${
                      isButtonDisabled
                        ? 'bg-slate-100 text-slate-400 cursor-not-allowed opacity-60 border border-slate-200'
                        : 'bg-[#2516FF] hover:bg-[#1d11cc] text-white active:scale-[0.99] shadow-md shadow-[#2516FF]/10'
                    }`}
                  >
                    <ShieldCheck className="w-4.5 h-4.5 shrink-0" />
                    <span>Payment Done</span>
                  </button>
                </div>

                {isButtonDisabled && (
                  <p className="text-[11px] text-red-500 font-semibold text-center mt-2.5">
                    * Please agree to the Terms, Privacy, and Usage Policies before proceeding.
                  </p>
                )}

                <p className="text-[11px] text-slate-400 text-center mt-3 flex items-center justify-center gap-1.5 font-medium">
                  <Lock className="w-3.5 h-3.5 text-emerald-600" /> {pageText.whatsAppNoteText}
                </p>
              </div>

            </div>
          </motion.div>

        </div>
      </main>

      {/* Change Plan Modal */}
      {isChangePlanOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl max-w-5xl w-full border border-slate-200/80 shadow-2xl relative overflow-hidden flex flex-col my-8 max-h-[90vh]"
          >
            {/* Header / Close button */}
            <div className="p-6 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white z-10 shrink-0">
              <div>
                <h3 className="text-xl font-bold text-slate-900">Change Pricing Plan</h3>
                <p className="text-xs text-slate-500 font-medium mt-0.5">Choose the plan that suits you best</p>
              </div>
              <button 
                onClick={() => setIsChangePlanOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-2 rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="p-6 sm:p-8 overflow-y-auto space-y-8">
              {/* Toggle switch */}
              <div className="flex items-center justify-center">
                <div className="relative bg-slate-100 p-1 rounded-full flex items-center w-64 shadow-inner border border-slate-200">
                  <div
                    className="absolute top-1 left-1 bottom-1 w-[calc(50%-4px)] bg-[#2516FF] rounded-full transition-all duration-300 ease-in-out"
                    style={{
                      transform: modalIsYearly ? 'translateX(100%)' : 'translateX(0)',
                    }}
                  ></div>

                  <button
                    type="button"
                    onClick={() => setModalIsYearly(false)}
                    className="relative z-10 w-1/2 py-2 text-center text-xs font-semibold transition-colors duration-200 focus:outline-none select-none cursor-pointer"
                  >
                    <span className={!modalIsYearly ? 'text-white' : 'text-slate-800'}>
                      Monthly
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setModalIsYearly(true)}
                    className="relative z-10 w-1/2 py-2 text-center text-xs font-semibold transition-colors duration-200 focus:outline-none select-none cursor-pointer"
                  >
                    <span className={modalIsYearly ? 'text-white' : 'text-slate-800'}>
                      Yearly
                    </span>
                  </button>
                </div>
              </div>

              {/* Plans Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch pt-2 pb-6">
                {(settings.pricing || pricingPlans || []).map((plan: any) => {
                  const isPro = plan.name?.toLowerCase() === 'pro';
                  const price = modalIsYearly 
                    ? (plan.priceAnnual !== undefined ? plan.priceAnnual : Math.round(plan.priceMonthly * 0.8)) 
                    : plan.priceMonthly;
                  const formattedPrice = price === 0 || price === '0' || price === 'Free' ? 'Free' : `$${price}`;
                  const isCurrent = (plan.name || '').toLowerCase() === planKey;

                  return (
                    <div 
                      key={plan.id}
                      className={`rounded-2xl flex flex-col justify-between transition-all border ${
                        isPro 
                          ? 'border-[#2516FF] bg-gradient-to-b from-[#2516FF]/5 to-transparent' 
                          : 'border-slate-200/80 bg-slate-50/50'
                      } ${isCurrent ? 'ring-2 ring-[#2516FF] shadow-md' : 'shadow-sm'}`}
                    >
                      <div className="p-6 flex flex-col h-full justify-between">
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="text-lg font-bold text-slate-900">{plan.name}</h4>
                            {isCurrent && (
                              <span className="bg-[#2516FF]/10 text-[#2516FF] text-[10px] font-bold px-2 py-0.5 rounded-full border border-[#2516FF]/20">
                                Current
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-500 leading-relaxed mb-4 font-medium">
                            {plan.description}
                          </p>

                          <div className="flex items-baseline gap-1 mb-6">
                            <span className="text-3xl font-extrabold text-slate-900">{formattedPrice}</span>
                            {formattedPrice !== 'Free' ? (
                              <span className="text-[10px] text-slate-500 font-semibold">
                                {modalIsYearly ? '/ month (billed yearly)' : '/ month'}
                              </span>
                            ) : (
                              <span className="text-[10px] text-slate-500 font-semibold">/ forever</span>
                            )}
                          </div>

                          <ul className="space-y-2.5 text-xs text-slate-600 leading-relaxed mb-6">
                            {(plan.features || []).map((feature: string, idx: number) => (
                              <li key={idx} className="flex items-center gap-2 font-medium">
                                <svg className="w-3.5 h-3.5 text-[#2516FF] shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"></path>
                                </svg>
                                <span>{feature}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        <button
                          onClick={() => {
                            setSearchParams({ 
                              plan: (plan.name || '').toLowerCase(), 
                              billing: modalIsYearly ? 'yearly' : 'monthly' 
                            });
                            setIsChangePlanOpen(false);
                          }}
                          className={`w-full font-bold py-2.5 px-4 rounded-xl text-xs transition-all text-center block cursor-pointer ${
                            isPro 
                              ? 'bg-[#2516FF] hover:bg-[#1d11cc] text-white shadow-sm' 
                              : 'bg-white hover:bg-slate-50 text-slate-800 border border-slate-200'
                          }`}
                        >
                          {isCurrent ? 'Stay with this plan' : `Select ${plan.name}`}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Payment Verification Processing Modal */}
      {isPaymentDoneOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl max-w-md w-full border border-slate-100 shadow-2xl p-6 sm:p-8 relative overflow-hidden text-center"
          >
            {/* Close button */}
            <button 
              onClick={() => setIsPaymentDoneOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1.5 rounded-full hover:bg-slate-50 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Top design accent bar */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#2516FF] to-indigo-600"></div>

            {/* Icon Banner */}
            <div className="relative w-20 h-20 rounded-full bg-emerald-50 text-emerald-500 flex items-center justify-center mb-5 mx-auto border-4 border-emerald-100/30">
              <ShieldCheck className="w-11 h-11" />
              <span className="absolute -bottom-1 -right-1 bg-white rounded-full p-1.5 border border-slate-100 text-[#2516FF] shadow-sm flex items-center justify-center">
                <Clock className="w-4 h-4 animate-pulse" />
              </span>
            </div>

            {/* Heading */}
            <h3 className="text-xl font-bold text-slate-900 tracking-tight mb-2">
              Payment Submitted!
            </h3>
            
            {/* Subheading badge */}
            <p className="text-xs font-bold text-[#2516FF] bg-[#2516FF]/5 px-3 py-1 rounded-full inline-block mb-5">
              Verification in Progress
            </p>

            {/* Transaction overview block */}
            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-150 text-xs text-slate-600 text-left space-y-2 mb-6">
              <div className="flex justify-between items-center">
                <span className="font-semibold text-slate-500">Selected Plan:</span>
                <span className="font-extrabold text-slate-800">{planDetails.name}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-semibold text-slate-500">Payment Wallet:</span>
                <span className="font-extrabold text-slate-800">
                  {selectedGateway === 'easypaisa' ? 'EasyPaisa' : 'JazzCash'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-semibold text-slate-500">Amount Paid:</span>
                <span className="font-extrabold text-[#2516FF] font-mono">{pkrPriceFormatted}</span>
              </div>
            </div>

            {/* Main statement text */}
            <div className="text-sm text-slate-600 font-medium leading-relaxed mb-6 space-y-3">
              <p>
                Thank you for submitting! Our <strong>Briefora team</strong> is now reviewing your payment.
              </p>
              <p className="text-xs bg-amber-50/50 border border-amber-200/60 rounded-xl p-3 text-amber-800 leading-normal">
                🔔 Your subscription plan will be activated within <strong>3-4 hours</strong>. You will receive a confirmation email once your account has been successfully upgraded!
              </p>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2.5">
              <button
                onClick={() => {
                  setIsPaymentDoneOpen(false);
                  navigate('/dashboard');
                }}
                className="w-full py-3.5 px-6 bg-[#2516FF] hover:bg-[#1d11cc] text-white font-bold text-xs uppercase tracking-wider rounded-2xl transition-all cursor-pointer shadow-md shadow-[#2516FF]/15 active:scale-[0.98]"
              >
                Go to Dashboard
              </button>
              
              <button
                onClick={() => setIsPaymentDoneOpen(false)}
                className="w-full py-2 px-6 text-xs text-slate-400 hover:text-slate-600 font-semibold transition-all cursor-pointer bg-transparent border-none hover:underline"
              >
                Close & Stay on Page
              </button>
            </div>
          </motion.div>
        </div>
      )}

    </div>
  );
}
