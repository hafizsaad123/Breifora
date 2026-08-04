import React, { useState, useMemo } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { 
  Check, Copy, ArrowLeft, ShieldCheck, 
  ExternalLink, MessageCircle, Wallet, Lock, Sparkles
} from 'lucide-react';
import Logo from '../components/ui/Logo';
import { useAppSettings } from '../context/AppSettingsContext';
import { defaultCheckoutConfig } from '../lib/adminSync';

export default function Checkout() {
  const [searchParams] = useSearchParams();
  const { settings } = useAppSettings();

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
    const planPrices = prices[planKey] || (planKey === 'starter' ? { monthly: 0, annual: 0 } : { monthly: 2500, annual: 2000 });
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
    const numberToCopy = checkoutConfig.accountDetails.mobileAccountNumber;
    navigator.clipboard.writeText(numberToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  // Terms Agreement Checkbox State
  const [termsAgreed, setTermsAgreed] = useState(false);

  // WhatsApp Link Generation
  const whatsappUrl = useMemo(() => {
    const num = checkoutConfig.whatsAppConfig.number.replace(/[^0-9]/g, '');
    let template = checkoutConfig.whatsAppConfig.messageTemplate || defaultCheckoutConfig.whatsAppConfig.messageTemplate;

    const cycleText = isYearly ? 'Annual Billing' : 'Monthly Billing';

    template = template
      .replace('{PLAN_NAME}', planDetails.name)
      .replace('{AMOUNT}', pkrPriceFormatted)
      .replace('{ACCOUNT_NAME}', checkoutConfig.accountDetails.accountTitle)
      .replace('{ACCOUNT_NUMBER}', checkoutConfig.accountDetails.mobileAccountNumber)
      .replace('{BILLING_CYCLE}', cycleText);

    return `https://wa.me/${num}?text=${encodeURIComponent(template)}`;
  }, [checkoutConfig, planDetails.name, pkrPriceFormatted, isYearly]);

  const isButtonDisabled = checkoutConfig.legalPolicy.enforceTermsCheckbox && !termsAgreed;

  return (
    <div className="min-h-screen bg-[#FBFBFD] text-slate-900 font-sans antialiased relative selection:bg-[#2516FF] selection:text-white">
      {/* Background Ambient Accents */}
      <div className="fixed top-0 left-1/4 w-96 h-96 bg-[#2516FF]/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="fixed bottom-0 right-1/4 w-96 h-96 bg-blue-400/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Light Theme Header */}
      <header className="border-b border-slate-200/80 bg-white/80 backdrop-blur-xl sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 group">
            <Logo iconSize={32} />
          </Link>

          <Link
            to="/#pricing"
            className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 border border-slate-200/80 px-4 py-2 rounded-xl transition-all"
          >
            <ArrowLeft className="w-4 h-4" /> {pageText.changePlanText || 'Change Plan'}
          </Link>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-14">
        {/* Page Hero Title */}
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#2516FF]/10 border border-[#2516FF]/20 text-[#2516FF] text-[11px] font-bold tracking-wider uppercase mb-3">
            <ShieldCheck className="w-3.5 h-3.5" /> {pageText.headerBadgeText}
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            {pageText.pageTitle}
          </h1>
          <p className="text-slate-600 text-sm sm:text-base mt-1.5 max-w-2xl leading-relaxed">
            {pageText.pageDescription}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
          
          {/* LEFT COLUMN: PLAN SUMMARY (Light Theme Card) */}
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="lg:col-span-5 bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-sm relative overflow-hidden"
          >
            {/* Corner Decorative Accent */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-[#2516FF]/10 to-transparent rounded-bl-full pointer-events-none" />

            <div className="flex items-center justify-between gap-3 mb-4">
              <span className="px-3 py-1 rounded-lg bg-[#2516FF] text-white text-xs font-bold uppercase tracking-wider shadow-sm">
                {planDetails.name} Plan
              </span>
              <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-3 py-1 rounded-full border border-slate-200">
                {isYearly ? 'Annual Billing (Save 20%)' : 'Monthly Billing'}
              </span>
            </div>

            <p className="text-slate-600 text-xs sm:text-sm leading-relaxed mb-6">
              {planDetails.description}
            </p>

            {/* Price Banner */}
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 mb-6">
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
                <p className="text-[11px] text-emerald-600 font-semibold mt-1 flex items-center gap-1">
                  <Sparkles className="w-3 h-3" /> Discounted annual pricing rate applied
                </p>
              )}
            </div>

            {/* Features List */}
            <div className="space-y-3 mb-8">
              <span className="text-xs font-bold uppercase text-slate-500 tracking-wider block">
                {pageText.includedFeaturesHeading}
              </span>
              <ul className="space-y-2.5 text-xs sm:text-sm text-slate-700">
                {(planDetails.features || []).map((feat: string, idx: number) => (
                  <li key={idx} className="flex items-start gap-2.5">
                    <span className="w-4 h-4 rounded-full bg-emerald-100 border border-emerald-300 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
                      <Check className="w-2.5 h-2.5" />
                    </span>
                    <span className="font-medium">{feat}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Change Plan Button */}
            <div className="pt-6 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-slate-500">Need a different tier?</span>
              <Link 
                to="/#pricing" 
                className="text-[#2516FF] hover:underline font-bold transition-colors flex items-center gap-1"
              >
                Choose another plan →
              </Link>
            </div>
          </motion.div>

          {/* RIGHT COLUMN: PAYMENT & VERIFICATION TERMINAL (Light Theme Card) */}
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08 }}
            className="lg:col-span-7"
          >
            <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
              
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
                          ? 'bg-[#2516FF]/10 border-[#2516FF] text-[#2516FF] shadow-sm'
                          : 'bg-slate-50 border-slate-200 text-slate-600 hover:text-slate-900 hover:border-slate-300'
                      }`}
                    >
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-black text-xs ${
                        selectedGateway === 'jazzcash' ? 'bg-[#2516FF] text-white' : 'bg-slate-200 text-slate-700'
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
                          ? 'bg-emerald-50 border-emerald-500 text-emerald-800 shadow-sm'
                          : 'bg-slate-50 border-slate-200 text-slate-600 hover:text-slate-900 hover:border-slate-300'
                      }`}
                    >
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-black text-xs ${
                        selectedGateway === 'easypaisa' ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-700'
                      }`}>
                        EP
                      </div>
                      <span>{checkoutConfig.accountDetails.easyPaisaLabel || 'EasyPaisa'}</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Account Details Box */}
              <div className="p-5 sm:p-6 bg-slate-50/90 border border-slate-200 rounded-2xl space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase text-slate-600 tracking-wider flex items-center gap-2">
                    <Wallet className="w-4 h-4 text-[#2516FF]" /> {pageText.eWalletBoxHeading}
                  </span>
                  <span className="text-[10px] font-bold uppercase bg-white text-slate-700 px-2.5 py-0.5 rounded-full border border-slate-200 shadow-2xs">
                    {selectedGateway === 'jazzcash' ? (checkoutConfig.accountDetails.jazzCashLabel || 'JazzCash') : (checkoutConfig.accountDetails.easyPaisaLabel || 'EasyPaisa')}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block mb-1">
                      Account Title
                    </span>
                    <span className="text-sm font-black text-slate-900 tracking-wide block">
                      {checkoutConfig.accountDetails.accountTitle}
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block mb-1">
                      Mobile Account Number
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-base font-black text-[#2516FF] font-mono tracking-wider">
                        {checkoutConfig.accountDetails.mobileAccountNumber}
                      </span>
                      <button
                        type="button"
                        onClick={handleCopyNumber}
                        className="p-1.5 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-800 transition-colors cursor-pointer relative"
                        title="Copy Number"
                      >
                        <Copy className="w-3.5 h-3.5" />
                        {copied && (
                          <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-lg whitespace-nowrap">
                            Copied!
                          </span>
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-200 flex items-center justify-between">
                  <span className="text-xs text-slate-600 font-semibold">Required Transfer Amount:</span>
                  <span className="text-base font-black text-slate-900 font-mono">{pkrPriceFormatted}</span>
                </div>
              </div>

              {/* Step-by-Step Payment Instructions */}
              <div>
                <span className="text-xs font-bold uppercase text-slate-500 tracking-wider block mb-3">
                  {pageText.instructionsHeading}
                </span>
                <ol className="space-y-3">
                  {(checkoutConfig.instructionSteps || defaultCheckoutConfig.instructionSteps).map((step, idx) => (
                    <li key={idx} className="flex items-start gap-3 p-3.5 bg-slate-50 border border-slate-200/80 rounded-xl text-xs sm:text-sm text-slate-700">
                      <span className="w-5 h-5 rounded-full bg-[#2516FF]/10 text-[#2516FF] text-[11px] font-bold flex items-center justify-center shrink-0 mt-0.5 border border-[#2516FF]/20">
                        {idx + 1}
                      </span>
                      <span className="leading-relaxed font-medium">{step}</span>
                    </li>
                  ))}
                </ol>
              </div>

              {/* Legal & Terms Checkbox */}
              <div className="pt-2 border-t border-slate-100 space-y-3">
                <label className="flex items-start gap-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={termsAgreed}
                    onChange={(e) => setTermsAgreed(e.target.checked)}
                    className="mt-1 w-4 h-4 rounded border-slate-300 text-[#2516FF] focus:ring-[#2516FF] cursor-pointer"
                  />
                  <span className="text-xs text-slate-600 group-hover:text-slate-900 leading-relaxed">
                    {checkoutConfig.legalPolicy.checkboxLabelText || defaultCheckoutConfig.legalPolicy.checkboxLabelText}{' '}
                    <Link to={checkoutConfig.legalPolicy.termsUrl || '/termsofservice'} target="_blank" className="text-[#2516FF] hover:underline font-semibold">Terms of Service</Link>,{' '}
                    <Link to={checkoutConfig.legalPolicy.privacyUrl || '/privacypolicy'} target="_blank" className="text-[#2516FF] hover:underline font-semibold">Privacy Policy</Link>, and{' '}
                    <Link to={checkoutConfig.legalPolicy.refundUrl || '/usagepolicy'} target="_blank" className="text-[#2516FF] hover:underline font-semibold">Refund Policy</Link>.
                  </span>
                </label>
              </div>

              {/* WhatsApp Confirmation Button */}
              <div className="pt-2">
                <a
                  href={isButtonDisabled ? '#' : whatsappUrl}
                  target={isButtonDisabled ? '_self' : '_blank'}
                  rel="noopener noreferrer"
                  onClick={(e) => {
                    if (isButtonDisabled) {
                      e.preventDefault();
                      alert('Please agree to the Terms & Policies before proceeding to WhatsApp confirmation.');
                    }
                  }}
                  className={`w-full py-4 px-6 rounded-2xl font-bold text-xs sm:text-sm uppercase tracking-wider flex items-center justify-center gap-3 transition-all cursor-pointer shadow-md ${
                    isButtonDisabled
                      ? 'bg-slate-200 text-slate-400 cursor-not-allowed opacity-70 border border-slate-300'
                      : 'bg-emerald-600 hover:bg-emerald-700 text-white active:scale-[0.99] shadow-emerald-600/10'
                  }`}
                >
                  <MessageCircle className="w-5 h-5 shrink-0" />
                  <span>{pageText.whatsAppButtonText || 'Confirm Payment on WhatsApp'}</span>
                  <ExternalLink className="w-4 h-4 shrink-0 opacity-80" />
                </a>

                <p className="text-[11px] text-slate-500 text-center mt-3 flex items-center justify-center gap-1.5 font-medium">
                  <Lock className="w-3.5 h-3.5 text-emerald-600" /> {pageText.whatsAppNoteText}
                </p>
              </div>

            </div>
          </motion.div>

        </div>
      </main>
    </div>
  );
}
