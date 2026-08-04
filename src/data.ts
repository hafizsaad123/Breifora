export interface FeatureItem {
  id: string;
  title: string;
  description: string;
  bgGlow?: boolean;
}

export interface ProcessItem {
  step: string;
  title: string;
  description: string;
  highlight?: boolean;
}

export interface ComparisonRow {
  characteristic: string;
  brieforaValue: string;
  othersValue: string;
}

export interface PricingPlan {
  id: string;
  name: string;
  description: string;
  priceMonthly: number;
  priceAnnual: number;
  features: string[];
  ctaText: string;
  popular?: boolean;
  color: string;
}

export interface TestimonialItem {
  id: string;
  quote: string;
  author: string;
  role: string;
  avatar: string;
}

export interface FAQItem {
  id: string;
  question: string;
  answer: string;
}

export const logoCloud = [
  { id: 'logo1', name: 'Nexus Studio', text: 'Nexus Studio' },
  { id: 'logo2', name: 'Vanguard Creative', text: 'Vanguard' },
  { id: 'logo3', name: 'Hyperion Agency', text: 'Hyperion' },
  { id: 'logo4', name: 'Apex Design Co.', text: 'Apex Design' },
  { id: 'logo5', name: 'Pulse Interactive', text: 'Pulse Interactive' },
  { id: 'logo6', name: 'Aether Digital', text: 'Aether Digital' },
];

export const bentoFeatures: FeatureItem[] = [
  {
    id: 'bento1',
    title: 'Zero-Login Client Workspace',
    description: 'Clients click a secure, individual magic link to view and sign off on their blueprint instantly. Zero passwords, zero register screens, zero friction.',
    bgGlow: false,
  },
  {
    id: 'bento2',
    title: 'Pre-Design Scope Locks',
    description: 'Bind clients to a concrete, digital sign-off of aesthetics, deliverables, and copy guidelines before touching a single pixel. Kills scope creep.',
    bgGlow: true,
  },
  {
    id: 'bento3',
    title: 'Interactive Visual Alignment',
    description: 'Clients interact with sleek typographic tracks, aesthetic sliders, and mood boards to extract precise emotional intent, not just raw text data.',
    bgGlow: false,
  },
  {
    id: 'bento4',
    title: 'Continuous Live Embedding',
    description: 'Display interactive briefs seamlessly with built-in Figma & Notion iframe embeds, or output premium PDF briefs to justify premium, high-ticket proposals.',
    bgGlow: true,
  },
];

export const processSteps: ProcessItem[] = [
  {
    step: 'Step 1',
    title: 'Email a Magic Workspace Link',
    description: 'Generate and send a single secure client link in seconds. No platform logins or account setup required.',
  },
  {
    step: 'Step 2',
    title: 'Interactive Choice Mapping',
    description: 'Client is guided through a series of interactive typographic tracks, style spectrums, and content layouts on any device.',
  },
  {
    step: 'Step 3',
    title: 'Lock Strategic Blueprint',
    description: 'Watch raw ideas map into an elegant brand dossier with aesthetic sign-offs. Embed live in Figma or export beautifully.',
  },
];

export const comparisonMatrix: ComparisonRow[] = [
  {
    characteristic: 'Target Objectives',
    brieforaValue: 'Extracts true creative intent and visual style',
    othersValue: 'Gathers generic unstructured text replies',
  },
  {
    characteristic: 'Client Onboarding',
    brieforaValue: 'Zero login, zero friction magic links',
    othersValue: 'Forced registrations and password setups',
  },
  {
    characteristic: 'Strategy Generation',
    brieforaValue: 'Instant, structured interactive blueprints',
    othersValue: 'Hours of tedious discovery call dictation',
  },
  {
    characteristic: 'Aesthetic Alignment',
    brieforaValue: 'Interactive tactile mood sliders',
    othersValue: 'Vague adjectives ("organic yet modern")',
  },
  {
    characteristic: 'Design Validation',
    brieforaValue: 'Formal digital sign-off before design starts',
    othersValue: 'Immediate guessing and pixel-pushing loops',
  },
  {
    characteristic: 'Margin Protection',
    brieforaValue: 'Hard boundaries that flag future scope edits',
    othersValue: 'Complacent acceptance of creeping revisions',
  },
  {
    characteristic: 'Studio Brand Polish',
    brieforaValue: 'Sophisticated curated white-label portals',
    othersValue: 'Plain spreadsheets or low-end basic forms',
  },
];

export const pricingPlans: PricingPlan[] = [
  {
    id: 'plan-starter',
    name: 'Starter',
    description: 'For independent creators establishing their onboarding workflow and protecting initial project boundaries.',
    priceMonthly: 0,
    priceAnnual: 0,
    features: [
      '1 Active magic client link to test with a real client',
      'Tactile core typographic tracks & visual style sliders',
      'Zero-login mobile access to optimize user compliance',
      'Elegant, live-updating browser blueprint workspace',
      'Direct copy-paste raw data exports & markdown views',
    ],
    ctaText: 'Upgrade to Starter',
    color: 'slate',
  },
  {
    id: 'plan-pro',
    name: 'Pro',
    description: 'For active freelance designers, brand strategists, and consultants seeking unlimited briefs and style engines.',
    priceMonthly: 9,
    priceAnnual: 7, // annual equivalent per month (rounded down, e.g. billed $84 annually)
    features: [
      'Unlimited active brief links (never archive history)',
      'Automatic strategic blueprint compiler & style generator',
      'Premium PDF briefs to anchor high-ticket brand proposals',
      'Custom studio branding (replace with your logo & colors)',
      'Direct Figma & Notion live iframe embeds & API sync',
      'Interactive moodboard selector & hex palette matcher',
    ],
    ctaText: 'Upgrade to Pro',
    popular: true,
    color: 'brand-primary',
  },
  {
    id: 'plan-studio',
    name: 'Studio',
    description: 'For high-end digital agencies, boutique design Collectives, and fast-growing creative groups.',
    priceMonthly: 29,
    priceAnnual: 24, // annual equivalent per month (e.g. billed $288 annually)
    features: [
      '100% white-label client portals (remove Breifora branding)',
      'Custom studio domain hosting (briefs.yourstudio.com)',
      'Up to 5 team editor seats with shared brief team vaults',
      'Interactive client heatmap metrics & view duration stats',
      'Priority direct Slack/email VIP onboarding assistance',
    ],
    ctaText: 'Upgrade to Studio',
    color: 'dark',
  },
];

export const testimonialsList: TestimonialItem[] = [
  {
    id: 'test-1',
    quote: 'Breifora saved me 4 hours of tedious client onboarding calls this week alone. The automated strategy engine extracts exactly what I need to start designing instantly.',
    author: 'John White',
    role: 'Brand Designer',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=faces',
  },
  {
    id: 'test-2',
    quote: 'No more endless revisions or shifting project targets. Having a concrete client sign-off before Figma production starts has completely protected my studio\'s profit margins.',
    author: 'Sarah Jenkins',
    role: 'UI/UX Consultant',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=faces',
  },
  {
    id: 'test-3',
    quote: 'My clients actually love using this workspace link. No more endless logins required—just a clean, interactive discovery flow that makes my business look incredibly elite.',
    author: 'Elena Rostova',
    role: 'Studio Founder',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&h=150&fit=crop&crop=faces',
  },
  // Repeat to match the mockup image block which contains 2 rows of alternating opinions
  {
    id: 'test-4',
    quote: 'I absolutely love using this workspace link. No more logins needed, layout is beautiful, and client alignment is pristine. It validates my designer rate.',
    author: 'Elena Rostova',
    role: 'Studio Founder',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&h=150&fit=crop&crop=faces',
  },
  {
    id: 'test-5',
    quote: 'Breifora saved me 4 hours of tedious client onboarding calls this week alone. The automated strategy engine extracts exactly what I need to start designing instantly.',
    author: 'John White',
    role: 'Brand Designer',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=faces',
  },
  {
    id: 'test-6',
    quote: 'No more endless revisions or shifting project targets. Having a concrete client sign-off before Figma production starts has completely protected my studio\'s profit margins.',
    author: 'Sarah Jenkins',
    role: 'UI/UX Consultant',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=faces',
  },
];

export const faqList: FAQItem[] = [
  {
    id: 'faq-1',
    question: 'Do my clients need to create an account to view or fill out the brief?',
    answer: 'Absolutely not. Breifora is built to be zero-friction. Your clients click a secure magic link and instantly interact with your blueprint on any screen without password barriers.',
  },
  {
    id: 'faq-2',
    question: 'Can I completely customize the branding of my workspace?',
    answer: 'Yes! Pro and Studio plans allow you to customize your company logo, typography guidelines, pick custom primary palette settings, and configure custom URL paths for briefs to present a fully integrated workspace experience.',
  },
  {
    id: 'faq-3',
    question: 'How does the scope creep prevention system work?',
    answer: 'Before starting any designs, Breifora generates a formal visual-strategic blueprint. Clients make structured choices around aesthetic mood, required core assets, and copy expectations. By requiring a structured digital sign-off, any subsequent shifts represent clear billable change requests.',
  },
  {
    id: 'faq-4',
    question: 'Does Breifora integrate directly with design apps?',
    answer: 'We provide direct SVG/CSS styled token exports, clean Figma-ready text briefs, customizable PDF printouts, and direct iframe embedding to embed clients\' signed-off briefs right inside your Figma canvases or Notion documents.',
  },
  {
    id: 'faq-5',
    question: 'What happens if I exceed my active blueprint limits?',
    answer: 'We never block your clients from accessing or submitting active links. If you exceed limits, we will send you a gentle notification prompting you to archive older blueprints or upgrade to a higher tier.',
  },
];
