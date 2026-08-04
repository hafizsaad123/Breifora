import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { pricingPlans, faqList, testimonialsList } from '../data';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

// Check if credentials exist
const isCloudConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase: SupabaseClient | null = isCloudConfigured && supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey) 
  : null;

if (isCloudConfigured) {
  console.log('✅ Briefora DB Sync: Connected to Supabase Cloud live!');
} else {
  console.warn('⚠️ Briefora DB Sync: Running in Local Cache Mode. Configure VITE_SUPABASE_URL & VITE_SUPABASE_ANON_KEY in Vercel for live sync.');
}

export const ADMIN_SYNC_EVENT = 'briefora_admin_sync_event';

export function notifyAdminDataChanged() {
  window.dispatchEvent(new Event(ADMIN_SYNC_EVENT));
}

/**
 * Saves data to Supabase app_settings table AND updates localStorage
 */
export async function syncAndSaveData(key: string, value: unknown): Promise<void> {
  const jsonString = typeof value === 'string' ? value : JSON.stringify(value);
  
  // Normalize local storage key naming
  const dbKey = key.replace(/^briefora_admin_/, '').replace(/^briefora_/, '');
  const localStorageKey = `briefora_admin_${dbKey}`;
  
  localStorage.setItem(localStorageKey, jsonString);
  notifyAdminDataChanged();

  if (supabase) {
    try {
      const payload = typeof value === 'string' ? { text: value } : (value as Record<string, unknown>);
      
      const { error } = await supabase
        .from('app_settings')
        .upsert({ key: dbKey, value: payload, updated_at: new Date().toISOString() });

      if (error) {
        console.error(`Error syncing key "${dbKey}" to Supabase:`, error.message);
      }
    } catch (err) {
      console.error('Supabase sync exception:', err);
    }
  }
}

/**
 * Loads data from Supabase app_settings table or local fallback
 */
export async function fetchSyncedData<T>(key: string, fallbackDefault: T): Promise<T> {
  const dbKey = key.replace(/^briefora_admin_/, '').replace(/^briefora_/, '');
  
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('app_settings')
        .select('value')
        .eq('key', dbKey)
        .single();

      if (data && data.value && !error) {
        const val = data.value as Record<string, unknown>;
        const result = (val.text !== undefined ? val.text : val) as T;
        
        // Update local storage cache
        const localStorageKey = `briefora_admin_${dbKey}`;
        localStorage.setItem(localStorageKey, typeof result === 'string' ? result : JSON.stringify(result));
        return result;
      }
    } catch (err) {
      console.error(`Failed to fetch ${dbKey} from Supabase:`, err);
    }
  }

  const localKey = `briefora_admin_${dbKey}`;
  const local = localStorage.getItem(localKey) || localStorage.getItem(key);
  if (local) {
    try {
      return JSON.parse(local) as T;
    } catch {
      return local as unknown as T;
    }
  }

  return fallbackDefault;
}

export function getDbSyncStatus(): boolean {
  return isCloudConfigured;
}

export const getAdminHeroCopy = () => {
  const savedUnified = localStorage.getItem('briefora_admin_hero_settings');
  if (savedUnified) {
    try {
      return JSON.parse(savedUnified);
    } catch {}
  }
  const saved = localStorage.getItem('briefora_admin_hero_copy');
  if (saved) {
    try { 
      return JSON.parse(saved);
    } catch {}
  }
  return {
    badge: '⚡ AI Client Discovery for Brand Designers',
    title: 'Turn Vague Client Ideas Into',
    highlightTitle: 'Clear Brand Strategy',
    subtitle: 'Stop chasing confusing feedback and endless revisions. Briefora transforms messy client thoughts into strategic creative direction before the first concept is designed.',
    primaryCta: 'Start for free',
    secondaryCta: 'See How It Works',
  };
};

export const getAdminPrivacyPolicy = () => {
  const savedUnified = localStorage.getItem('briefora_admin_legal_policies');
  if (savedUnified) {
    try {
      const parsed = JSON.parse(savedUnified);
      if (parsed && parsed.privacy_policy) return parsed.privacy_policy;
    } catch {}
  }
  return localStorage.getItem('briefora_admin_privacy_policy') || localStorage.getItem('briefora_privacy_policy') || 'Standard Privacy Policy content for Briefora users.';
};

export const getAdminUsagePolicy = () => {
  const savedUnified = localStorage.getItem('briefora_admin_legal_policies');
  if (savedUnified) {
    try {
      const parsed = JSON.parse(savedUnified);
      if (parsed && parsed.usage_policy) return parsed.usage_policy;
    } catch {}
  }
  return localStorage.getItem('briefora_admin_usage_policy') || localStorage.getItem('briefora_usage_policy') || 'Standard Usage Policy content for Briefora services.';
};

export const getAdminTermsOfService = () => {
  const savedUnified = localStorage.getItem('briefora_admin_legal_policies');
  if (savedUnified) {
    try {
      const parsed = JSON.parse(savedUnified);
      if (parsed && parsed.terms_of_service) return parsed.terms_of_service;
    } catch {}
  }
  return localStorage.getItem('briefora_admin_terms_of_service') || localStorage.getItem('briefora_terms_of_service') || 'Standard Terms of Service agreement for Briefora.';
};

export function getAdminPricing() {
  const sanitizePlan = (plan: any) => {
    let name = plan.name;
    let id = plan.id;
    let ctaText = plan.ctaText || plan.buttonText;
    if (name === 'Free' || id === 'plan-free') {
      name = 'Starter';
      if (id === 'plan-free') id = 'plan-starter';
      if (!ctaText || ctaText === 'Use Breifora for Free' || ctaText === 'Use Briefora for Free') {
        ctaText = 'Upgrade to Starter';
      }
    }
    const priceMonthly = plan.priceMonthly !== undefined ? plan.priceMonthly : (plan.price !== undefined ? plan.price : 0);
    const priceAnnual = plan.priceAnnual !== undefined ? plan.priceAnnual : Math.round(priceMonthly * 0.8);
    return {
      ...plan,
      id: id || 'plan-starter',
      name: name || 'Starter',
      ctaText: ctaText || (name === 'Starter' ? 'Upgrade to Starter' : 'Upgrade to ' + name),
      priceMonthly,
      priceAnnual,
      price: priceMonthly
    };
  };

  const savedUnified = localStorage.getItem('briefora_admin_pricing_settings');
  if (savedUnified) {
    try {
      const parsed = JSON.parse(savedUnified);
      if (Array.isArray(parsed)) {
        return parsed.map(sanitizePlan);
      }
    } catch {}
  }
  const saved = localStorage.getItem('briefora_admin_pricing');
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) {
        return parsed.map(sanitizePlan);
      }
    } catch (e) { 
      console.error(e);
    }
  }
  return pricingPlans.map(sanitizePlan);
}

export function getAdminFaqs() {
  const savedUnified = localStorage.getItem('briefora_admin_faq_reviews_settings');
  if (savedUnified) {
    try {
      const parsed = JSON.parse(savedUnified);
      if (parsed && Array.isArray(parsed.faqs)) {
        return parsed.faqs.map((item: any, index: number) => ({
          id: item.id || `faq-${index}`,
          question: item.question || item.q || '',
          answer: item.answer || item.a || '',
          q: item.question || item.q || '',
          a: item.answer || item.a || '',
        }));
      }
    } catch {}
  }
  const saved = localStorage.getItem('briefora_admin_faqs');
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) {
        return parsed.map((item: any, index: number) => ({
          id: item.id || `faq-${index}`,
          question: item.question || item.q || '',
          answer: item.answer || item.a || '',
          q: item.question || item.q || '',
          a: item.answer || item.a || '',
        }));
      }
    } catch (e) { 
      console.error(e);
    }
  }
  return faqList.map((item, index) => ({
    id: item.id || `faq-${index}`,
    question: item.question,
    answer: item.answer,
    q: item.question,
    a: item.answer,
  }));
}

export function getAdminTestimonials() {
  const savedUnified = localStorage.getItem('briefora_admin_faq_reviews_settings');
  if (savedUnified) {
    try {
      const parsed = JSON.parse(savedUnified);
      if (parsed && Array.isArray(parsed.testimonials)) {
        return parsed.testimonials;
      }
    } catch {}
  }
  const saved = localStorage.getItem('briefora_admin_testimonials');
  if (saved) {
    try { 
      return JSON.parse(saved);
    } catch (e) { 
      console.error(e);
    }
  }
  return testimonialsList;
}

export function getSystemConfig() {
  const m1 = localStorage.getItem('briefora_admin_maintenance');
  const m2 = localStorage.getItem('briefora_maintenance');
  const isMaintenance = m1 === 'true' || m2 === 'true';
  return {
    maintenanceMode: isMaintenance,
    maintenanceMsg: localStorage.getItem('briefora_admin_maintenance_msg') || localStorage.getItem('briefora_maintenance_msg') || 'Briefora is undergoing scheduled system upgrades. We will be back online shortly.',
    signupsEnabled: localStorage.getItem('briefora_admin_signups_enabled') !== 'false',
    broadcastActive: localStorage.getItem('briefora_admin_broadcast_active') === 'true' || localStorage.getItem('briefora_broadcast_active') === 'true',
    broadcastMsg: localStorage.getItem('briefora_admin_broadcast_msg') || localStorage.getItem('briefora_broadcast_msg') || '⚡ Briefora v2.4 Release: Full interactive visual blueprint generator is live!',
  };
}

/**
 * Fetch a single setting key directly from Supabase app_settings table
 */
export async function fetchSettingFromSupabase(key: string) {
  if (!supabase) return null;
  try {
    const dbKey = key.replace(/^briefora_admin_/, '').replace(/^briefora_/, '');
    const { data, error } = await supabase
      .from('app_settings')
      .select('value')
      .eq('key', dbKey)
      .single();

    if (error || !data) return null;

    const settingKey = `briefora_admin_${dbKey}`;
    const serialized = typeof data.value === 'string' ? data.value : JSON.stringify(data.value);
    localStorage.setItem(settingKey, serialized);
    notifyAdminDataChanged();

    return data.value;
  } catch (err) {
    console.error(`Error fetching setting ${key} from Supabase:`, err);
    return null;
  }
}

/**
 * Listen live to real-time database changes in Supabase
 */
export function subscribeToSupabaseChanges(onUpdate: () => void) {
  if (!supabase) return () => {};

  const channel = supabase
    .channel('app_settings_changes')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'app_settings' },
      (payload: any) => {
        if (payload.new && payload.new.key) {
          const settingKey = `briefora_admin_${payload.new.key}`;
          const serialized = typeof payload.new.value === 'string' 
            ? payload.new.value 
            : JSON.stringify(payload.new.value);
          
          localStorage.setItem(settingKey, serialized);
          notifyAdminDataChanged();
        }
        onUpdate();
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}

export const defaultLandingPageConfig = {
  header: {
    logoText: "Briefora",
    logoIconUrl: "",
    navLinks: [
      { label: "Benefits", anchorUrl: "#features", openInNewTab: false },
      { label: "How It Works", anchorUrl: "#how-it-works", openInNewTab: false },
      { label: "Why Briefora", anchorUrl: "#why-briefora", openInNewTab: false },
      { label: "Pricing", anchorUrl: "#pricing", openInNewTab: false },
      { label: "FAQs", anchorUrl: "#faq", openInNewTab: false }
    ],
    primaryCtaText: "Start for free",
    primaryCtaLink: "/signup",
    secondaryCtaText: "Sign in",
    secondaryCtaLink: "/login",
    showSecondaryCta: true
  },
  hero: {
    badge: "⚡ AI Client Discovery for Brand Designers",
    badgeColor: "blue",
    title: "Turn Vague Client Ideas Into",
    highlightTitle: "Clear Brand Strategy",
    subtitle: "Stop chasing confusing feedback and endless revisions. Briefora transforms messy client thoughts into strategic creative direction before the first concept is designed.",
    primaryCtaText: "Start for free",
    primaryCtaLink: "/signup",
    secondaryCtaText: "See How It Works",
    secondaryCtaLink: "#features",
    socialProofText: "Trusted by 500+ design operators",
    socialProofAvatars: [
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop",
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&h=80&fit=crop",
      "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=80&h=80&fit=crop"
    ]
  },
  productPitch: {
    eyebrow: "Benefits",
    title: "Engineered for Seamless Design Discovery",
    description: "Streamline client onboarding, eliminate ambiguity, and protect your profitability.",
    features: [
      {
        id: "feat-1",
        title: "Zero-Friction Client Discovery",
        description: "Send a clean interactive link instead of a messy PDF questionnaire. Clients enjoy filling it out while you gather precise answers.",
        badge: "Zero Friction",
        highlight: false
      },
      {
        id: "feat-2",
        title: "Kill Scope Creep",
        description: "Lock down deliverables and project boundaries before starting. Protect your margins from out-of-bounds requests.",
        badge: "Scope Lock",
        highlight: true
      },
      {
        id: "feat-3",
        title: "No Client Accounts, Ever",
        description: "Clients don't need to sign up or create passwords. They just click your branded link and collaborate immediately.",
        badge: "Seamless",
        highlight: false
      },
      {
        id: "feat-4",
        title: "AI-Powered Brand Mapping",
        description: "Transform unstructured notes into comprehensive design systems, target user personas, and visual directions automatically.",
        badge: "AI Engine",
        highlight: true
      }
    ]
  },
  howItWorks: {
    title: "Lock Down the Strategy Before You Open Figma",
    subtitle: "A seamless three-step workflow designed to save you hours of alignment meetings.",
    steps: [
      {
        stepBadge: "Step 1",
        title: "Share a Unique Link",
        description: "Send your custom intake link to the client via Slack, email, or WhatsApp."
      },
      {
        stepBadge: "Step 2",
        title: "Client Fills the Intake",
        description: "AI guides the client through structured questions to extract exact design intent."
      },
      {
        stepBadge: "Step 3",
        title: "AI Writes the Brief",
        description: "Get an automated brand brief ready for client sign-off before design begins."
      }
    ]
  },
  previewShowcase: {
    title: "Aesthetic Real-time Showcase",
    subtitle: "Extract emotional intent and lock boundaries instantly.",
    statementLines: [
      "Briefora is an AI-powered strategy engine built for high-ticket creative operators.",
      "It automatically transforms vague, chaotic client ideas into structured, production-ready design briefs and comprehensive scope documents in seconds locking down your strategy before you ever open Figma."
    ]
  },
  pricing: {
    title: "Invest in Creative Clarity. Protect Your Margin.",
    subtitle: "Choose the plan that fits your creative workflow.",
    monthlyLabel: "Monthly",
    yearlyLabel: "Yearly",
    discountBadgeText: "Save 20%",
    tiers: [
      {
        id: "plan-starter",
        name: "Starter",
        description: "For independent creators establishing their onboarding workflow and protecting initial project boundaries.",
        priceMonthly: 0,
        priceAnnual: 0,
        features: [
          "1 Active magic client link to test with a real client",
          "Tactile core typographic tracks & visual style sliders",
          "Zero-login mobile access to optimize user compliance",
          "Elegant, live-updating browser blueprint workspace",
          "Direct copy-paste raw data exports & markdown views"
        ],
        ctaText: "Upgrade to Starter",
        ctaLink: "/checkout?plan=starter",
        popular: false
      },
      {
        id: "plan-pro",
        name: "Pro",
        description: "For active freelance designers, brand strategists, and consultants seeking unlimited briefs and style engines.",
        priceMonthly: 9,
        priceAnnual: 7,
        features: [
          "Unlimited active brief links (never archive history)",
          "Automatic strategic blueprint compiler & style generator",
          "Premium PDF briefs to anchor high-ticket brand proposals",
          "Custom studio branding (replace with your logo & colors)",
          "Direct Figma & Notion live iframe embeds & API sync",
          "Interactive moodboard selector & hex palette matcher"
        ],
        ctaText: "Upgrade to Pro",
        ctaLink: "/signup",
        popular: true
      },
      {
        id: "plan-studio",
        name: "Studio",
        description: "For high-end digital agencies, boutique design Collectives, and fast-growing creative groups.",
        priceMonthly: 29,
        priceAnnual: 24,
        features: [
          "100% white-label client portals (remove Briefora branding)",
          "Custom studio domain hosting (briefs.yourstudio.com)",
          "Up to 5 team editor seats with shared brief team vaults",
          "Interactive client heatmap metrics & view duration stats",
          "Priority direct Slack/email VIP onboarding assistance"
        ],
        ctaText: "Upgrade to Studio",
        ctaLink: "/signup",
        popular: false
      }
    ]
  },
  faqs: {
    title: "Got Questions? We Have Clear Answers.",
    subtitle: "Everything you need to know about how Briefora optimizes your design client onboarding workflow.",
    items: [
      {
        question: "Do my clients need to create an account to view or fill out the brief?",
        answer: "Absolutely not. Briefora is built to be zero-friction. Your clients click a secure magic link and instantly interact with your blueprint on any screen without password barriers.",
        category: "Account",
        published: true
      },
      {
        question: "Can I completely customize the branding of my workspace?",
        answer: "Yes! Pro and Studio plans allow you to customize your company logo, typography guidelines, pick custom primary palette settings, and configure custom URL paths for briefs to present a fully integrated workspace experience.",
        category: "Branding",
        published: true
      },
      {
        question: "How does the scope creep prevention system work?",
        answer: "Before starting any designs, Briefora generates a formal visual-strategic blueprint. Clients make structured choices around aesthetic mood, required core assets, and copy expectations. By requiring a structured digital sign-off, any subsequent shifts represent clear billable change requests.",
        category: "Scope",
        published: true
      },
      {
        question: "Does Briefora integrate directly with design apps?",
        answer: "We provide direct SVG/CSS styled token exports, clean Figma-ready text briefs, customizable PDF printouts, and direct iframe embedding to embed clients' signed-off briefs right inside your Figma canvases or Notion documents.",
        category: "Integrations",
        published: true
      },
      {
        question: "What happens if I exceed my active blueprint limits?",
        answer: "We never block your clients from accessing or submitting active links. If you exceed limits, we will send you a gentle notification prompting you to archive older blueprints or upgrade to a higher tier.",
        category: "Limits",
        published: true
      }
    ]
  },
  cta: {
    title: "Ready to Lock Down Your Client Alignments?",
    subtitle: "Join hundreds of elite creative studios who protect their scope and margins with Briefora.",
    primaryButtonText: "Start for free",
    primaryButtonLink: "/signup",
    bgTheme: "brand-blue"
  },
  footer: {
    companyDescription: "The AI-powered briefing system for creative agencies and freelancers. Streamline discovery, eliminate scope creep, and get client alignment fast.",
    copyrightText: "© 2026 Briefora. All rights reserved.",
    emailSupport: "saad.designs4@gmail.com",
    column1Title: "Product",
    column1Links: [
      { label: "Benefits", url: "#features" },
      { label: "How it Works", url: "#how-it-works" },
      { label: "Why Briefora", url: "#why-briefora" },
      { label: "Pricing", url: "#pricing" },
      { label: "FAQs", url: "#faq" }
    ],
    column2Title: "Legal",
    column2Links: [
      { label: "Privacy Policy", url: "/privacypolicy" },
      { label: "Usage Policy", url: "/usagepolicy" },
      { label: "Terms of Service", url: "/termsofservice" }
    ],
    socialLinks: [
      { platform: "LinkedIn", url: "https://www.linkedin.com/company/breifora/posts/?feedView=all" }
    ]
  }
};

export const getAdminLandingPageConfig = () => {
  const saved = localStorage.getItem("briefora_admin_landing_page_config");
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch {}
  }
  return defaultLandingPageConfig;
};

export interface CheckoutConfig {
  pageText?: {
    headerBadgeText: string;
    pageTitle: string;
    pageDescription: string;
    planSummaryHeading: string;
    pkrConvertedLabel: string;
    includedFeaturesHeading: string;
    changePlanText: string;
    selectMethodHeading: string;
    eWalletBoxHeading: string;
    instructionsHeading: string;
    whatsAppButtonText: string;
    whatsAppNoteText: string;
  };
  accountDetails: {
    accountTitle: string;
    mobileAccountNumber: string;
    jazzCashLabel: string;
    jazzCashLogoToggle: boolean;
    easyPaisaLabel: string;
    easyPaisaLogoToggle: boolean;
    easyPaisaAccountTitle?: string;
    easyPaisaAccountNumber?: string;
  };
  pkrPrices: {
    starter: { monthly: number; annual: number };
    pro: { monthly: number; annual: number };
    studio: { monthly: number; annual: number };
  };
  instructionSteps: string[];
  whatsAppConfig: {
    number: string;
    messageTemplate: string;
  };
  legalPolicy: {
    enforceTermsCheckbox: boolean;
    checkboxLabelText: string;
    termsUrl: string;
    privacyUrl: string;
    refundUrl: string;
  };
}

export const defaultCheckoutConfig: CheckoutConfig = {
  pageText: {
    headerBadgeText: "Secure Manual Payment Terminal",
    pageTitle: "Complete Your Briefora Subscription",
    pageDescription: "Send your payment via JazzCash or EasyPaisa to activate your account instantly.",
    planSummaryHeading: "Subscription Plan Summary",
    pkrConvertedLabel: "Converted Amount to Pay",
    includedFeaturesHeading: "Included in this plan:",
    changePlanText: "Change Plan",
    selectMethodHeading: "1. Select Payment Method",
    eWalletBoxHeading: "Destination E-Wallet Account",
    instructionsHeading: "2. Step-by-Step Instructions",
    whatsAppButtonText: "Confirm Payment on WhatsApp",
    whatsAppNoteText: "WhatsApp opens directly with pre-filled details to send your transaction screenshot.",
  },
  accountDetails: {
    accountTitle: "Saif ur Rehman",
    mobileAccountNumber: "03112075467",
    jazzCashLabel: "JazzCash",
    jazzCashLogoToggle: true,
    easyPaisaLabel: "EasyPaisa",
    easyPaisaLogoToggle: true,
    easyPaisaAccountTitle: "SAMIA BANO",
    easyPaisaAccountNumber: "03322933095",
  },
  pkrPrices: {
    starter: { monthly: 2500, annual: 17000 },
    pro: { monthly: 5000, annual: 35000 },
    studio: { monthly: 12000, annual: 85000 },
  },
  instructionSteps: [
    "Open your JazzCash or EasyPaisa App or dial *786#.",
    "Select Bank / Mobile Transfer and enter number listed above.",
    "Transfer the exact plan amount in PKR to the Mobile Account Number.",
    "Take a screenshot of your payment receipt and click 'Confirm Payment on WhatsApp' below."
  ],
  whatsAppConfig: {
    number: "03150106504",
    messageTemplate: `Hi Briefora Team! 👋 I have transferred the payment for subscription activation.

📌 Order Details:
- Plan: {PLAN_NAME}
- Billing: {BILLING_CYCLE}
- Amount Paid: Rs. {AMOUNT}
- Payment Wallet: {PAYMENT_METHOD}
- Receiver Account Name: {ACCOUNT_NAME}
- Receiver Account Number: {ACCOUNT_NUMBER}
- Registered Email: {USER_EMAIL}

📎 Attached below is my transaction screenshot for verification.`
  },
  legalPolicy: {
    enforceTermsCheckbox: true,
    checkboxLabelText: "I agree to the Terms of Service, Privacy Policy, and Usage Policy",
    termsUrl: "/termsofservice",
    privacyUrl: "/privacypolicy",
    refundUrl: "/usagepolicy"
  }
};

export const getAdminCheckoutConfig = (): CheckoutConfig => {
  const saved = localStorage.getItem("briefora_admin_checkout_config");
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      if (parsed.whatsAppConfig?.number === "923299482074" || parsed.whatsAppConfig?.number === "03299482074") {
        parsed.whatsAppConfig.number = "03150106504";
      }
      return { ...defaultCheckoutConfig, ...parsed };
    } catch {}
  }
  return defaultCheckoutConfig;
};



