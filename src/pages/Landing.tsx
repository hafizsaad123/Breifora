import { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Menu, X } from 'lucide-react';
import Logo from '../components/ui/Logo';
import { useAppSettings } from '../context/AppSettingsContext';
import { getAdminLandingPageConfig } from '../lib/adminSync';
import dashboardImg from '../assets/images/dashboard.png';
import bentocard01 from '../assets/images/bentocard01.png';
import bentocard02 from '../assets/images/bentocard02.png';
import bentocard03 from '../assets/images/bentocard03.png';
import bentocard04 from '../assets/images/bentocard04.png';
import howitworkscard01 from '../assets/images/howitworkscard01.png';
import howitworkscard02 from '../assets/images/howitworkscard02.png';
import howitworkscard03 from '../assets/images/howitworkscard03.png';

export default function Landing() {
  const { settings } = useAppSettings();
  const cmsConfig = settings.landing_page_config || getAdminLandingPageConfig();
  const location = useLocation();

  // Mobile menu open state
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Billing state for Pricing section (false = Monthly, true = Yearly)
  const [isYearly, setIsYearly] = useState(false);

  // FAQ open index state (0 open by default)
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  // Smooth scroll handler for section links
  const scrollToNavSection = (e: React.MouseEvent<HTMLAnchorElement>, url: string) => {
    if (url && url.startsWith('#')) {
      e.preventDefault();
      setIsMenuOpen(false);
      const targetId = url.substring(1);
      const element = document.getElementById(targetId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        window.history.pushState(null, '', url);
      }
    }
  };

  // Hash-scrolling logic on mount or navigation
  useEffect(() => {
    if (location.hash) {
      const targetId = location.hash.substring(1);
      // Wait slightly for DOM rendering
      const timer = setTimeout(() => {
        const element = document.getElementById(targetId);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [location.hash]);

  // Scroll text section ref & words state
  const scrollSectionRef = useRef<HTMLElement | null>(null);
  const [scrollProgress, setScrollProgress] = useState(0);

  // Value statement paragraph lines
  const statementLines = cmsConfig.showcase?.statementLines || [
    "Briefora is an AI-powered strategy engine built for high-ticket creative operators.",
    "It automatically transforms vague, chaotic client ideas into structured, production-ready design briefs and comprehensive scope documents in seconds locking down your strategy before you ever open Figma."
  ];

  // Calculate total words across statement lines
  const allWords = statementLines.flatMap((line: string) => line.trim().split(/\s+/));

  // Scroll progress listener for text highlight effect
  useEffect(() => {
    const handleScroll = () => {
      if (!scrollSectionRef.current) return;
      const rect = scrollSectionRef.current.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      const start = windowHeight * 0.8;
      const end = rect.height * 0.2;

      let progress = (start - rect.top) / (start + end);
      progress = Math.max(0, Math.min(1, progress));
      setScrollProgress(progress);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const activeWordCount = Math.floor(scrollProgress * allWords.length);

  const toggleFaq = (index: number) => {
    setOpenFaqIndex((prev) => (prev === index ? null : index));
  };

  let wordCounter = 0;

  return (
    <div className="bg-[#FFFFFF] text-slate-900 font-sans antialiased font-normal min-h-screen overflow-x-hidden w-full relative">
      {/* Navigation Bar */}
      <header className="fixed top-5 left-0 right-0 z-50 px-4 md:px-8">
        <div className="max-w-6xl mx-auto bg-white/90 backdrop-blur-md border border-slate-200/80 rounded-2xl px-6 py-3.5 flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 hover:opacity-90 transition-opacity">
            <Logo iconSize={cmsConfig.header?.iconSize || 30} />
          </Link>

          {/* Nav Links */}
          <nav className="hidden md:flex items-center gap-8 text-xs md:text-sm font-medium text-slate-600">
            {(cmsConfig.header?.navLinks || [
              { label: 'Benefits', url: '#features' },
              { label: 'How It Works', url: '#how-it-works' },
              { label: 'Why Briefora', url: '#why-briefora' },
              { label: 'Pricing', url: '#pricing' },
              { label: 'FAQs', url: '#faq' },
            ]).map((lnk: any, idx: number) => (
              <a
                key={idx}
                href={lnk.url}
                target={lnk.openNewTab ? '_blank' : undefined}
                rel={lnk.openNewTab ? 'noopener noreferrer' : undefined}
                onClick={(e) => scrollToNavSection(e, lnk.url)}
                className="hover:text-slate-900 transition-colors cursor-pointer select-none font-medium"
              >
                {lnk.label}
              </a>
            ))}
          </nav>

          {/* CTA Buttons */}
          <div className="hidden md:flex items-center gap-3">
            <Link
              to={cmsConfig.header?.secondaryCtaLink || '/login'}
              className="bg-slate-100/90 hover:bg-slate-200/90 text-slate-900 text-xs md:text-sm font-medium px-5 py-2.5 rounded-full transition-all cursor-pointer"
            >
              {cmsConfig.header?.secondaryCtaText || 'Sign in'}
            </Link>
            <Link
              to={cmsConfig.header?.primaryCtaLink || '/signup'}
              className="bg-[#2516FF] hover:bg-[#1d11cc] text-white text-xs md:text-sm font-medium px-5 py-2.5 rounded-full transition-all animate-shimmer cursor-pointer"
            >
              {cmsConfig.header?.primaryCtaText || 'Start for free'}
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 rounded-full border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer focus:outline-none"
              aria-label="Toggle menu"
            >
              {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Navigation Drawer */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            className="fixed top-24 left-4 right-4 z-40 md:hidden bg-white/95 backdrop-blur-lg border border-slate-200/90 rounded-2xl p-6 shadow-xl flex flex-col gap-6"
          >
            <nav className="flex flex-col gap-4 text-sm font-medium text-slate-700">
              {(cmsConfig.header?.navLinks || [
                { label: 'Benefits', url: '#features' },
                { label: 'How It Works', url: '#how-it-works' },
                { label: 'Why Briefora', url: '#why-briefora' },
                { label: 'Pricing', url: '#pricing' },
                { label: 'FAQs', url: '#faq' },
              ]).map((lnk: any, idx: number) => (
                <a 
                  key={idx}
                  href={lnk.url} 
                  onClick={(e) => scrollToNavSection(e, lnk.url)}
                  className="hover:text-slate-900 py-2 border-b border-slate-100 transition-colors cursor-pointer flex items-center justify-between"
                >
                  <span>{lnk.label}</span>
                </a>
              ))}
            </nav>

            <div className="flex flex-col gap-3 pt-2">
              <Link
                to="/login"
                onClick={() => setIsMenuOpen(false)}
                className="w-full bg-slate-100 hover:bg-slate-200 text-slate-900 text-sm font-medium py-3 rounded-full text-center transition-all"
              >
                Sign in
              </Link>
              <Link
                to="/signup"
                onClick={() => setIsMenuOpen(false)}
                className="w-full bg-[#2516FF] hover:bg-[#1d11cc] text-white text-sm font-medium py-3 rounded-full text-center transition-all shadow-sm"
              >
                Start for free
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hero Section */}
      <section className="pt-40 pb-20 px-6 bg-[#FFFFFF] overflow-hidden">
        <div className="max-w-5xl mx-auto text-center">
          {/* Eyebrow Badge */}
          <motion.div 
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.2 }}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-[#0F172A]/10 text-slate-900 text-xs font-semibold tracking-wide uppercase mb-6 cursor-default"
          >
            <svg className="w-3.5 h-3.5 fill-current text-[#2516FF]" viewBox="0 0 24 24">
              <path d="M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5L12 2Z" />
            </svg>
            <span>{cmsConfig.hero?.badge || settings.hero_copy?.badge || 'AI Client Discovery for Brand Designers'}</span>
          </motion.div>

          {/* Title */}
          <h1 className="text-3xl md:text-5xl font-semibold tracking-tight text-slate-900 mb-4 leading-[1.25]">
            {cmsConfig.hero?.title || settings.hero_copy?.title || 'Turn Vague Client Ideas Into'}<br className="hidden md:block" />{' '}
            <span className="text-[#2516FF]">{cmsConfig.hero?.highlightTitle || settings.hero_copy?.highlightTitle || 'Clear Brand Strategy'}</span>
          </h1>

          {/* Subheading */}
          <p className="text-base md:text-lg font-medium text-slate-600 leading-relaxed max-w-2xl mx-auto mb-10">
            {cmsConfig.hero?.subtitle || settings.hero_copy?.subtitle || 'Stop chasing confusing feedback and endless revisions. Briefora transforms messy client thoughts into strategic creative direction before the first concept is designed.'}
          </p>

          {/* Pill CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <Link
              to="/signup"
              className="w-full sm:w-auto bg-[#2516FF] hover:bg-[#1d11cc] text-white font-medium px-8 py-3.5 rounded-full text-base transition-all text-center block sm:inline-block"
            >
              {cmsConfig.hero?.primaryCta || settings.hero_copy?.primaryCta || 'Start for free'}
            </Link>
            <a
              href="#features"
              className="w-full sm:w-auto bg-slate-100/90 hover:bg-slate-200/90 text-slate-900 font-medium px-8 py-3.5 rounded-full text-base transition-all text-center block sm:inline-block"
            >
              {cmsConfig.hero?.secondaryCta || settings.hero_copy?.secondaryCta || 'See How It Works'}
            </a>
          </div>

          {/* Dashboard Preview */}
          <motion.div 
            whileHover={{ y: -6, boxShadow: "0 20px 30px -10px rgba(15, 23, 42, 0.08)" }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="relative mx-auto rounded-2xl border border-slate-200/80 bg-[#FFFFFF] overflow-hidden max-w-5xl shadow-sm transition-shadow duration-300"
          >
            <img
              src={dashboardImg}
              alt="Briefora Dashboard Preview"
              className="w-full h-auto object-cover block"
              onError={(e) => {
                (e.target as HTMLImageElement).src =
                  'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&auto=format&fit=crop&q=80';
              }}
            />
          </motion.div>
        </div>
      </section>

      {/* Main Value Statement Section */}
      <section
        id="scroll-text-section"
        ref={scrollSectionRef}
        className="py-32 px-6 bg-[#FFFFFF] border-b border-slate-100 min-h-[80vh] flex items-center"
      >
        <div className="max-w-3xl mx-auto text-left space-y-8">
          {statementLines.map((line, lineIdx) => {
            const words = line.trim().split(/\s+/);
            return (
              <p
                key={lineIdx}
                className="scroll-fill-text text-2xl sm:text-3xl md:text-3xl font-medium leading-relaxed tracking-tight"
              >
                {words.map((word, wordIdx) => {
                  const currentIndex = wordCounter++;
                  const isBriefora = word.replace(/[^a-zA-Z]/g, '').toLowerCase() === 'briefora';
                  const isActive = currentIndex < activeWordCount;

                  return (
                    <span
                      key={wordIdx}
                      className={`scroll-word ${isBriefora ? 'brand-word' : ''} ${isActive ? 'active' : ''}`}
                    >
                      {word}{' '}
                    </span>
                  );
                })}
              </p>
            );
          })}
        </div>
      </section>

      {/* Benefits Section */}
      <section id="features" className="py-24 px-6 bg-[#FFFFFF]">
        <div className="max-w-6xl mx-auto text-center">
          {/* Eyebrow Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-[#0F172A]/10 text-slate-900 text-xs font-semibold tracking-wide uppercase mb-6">
            <svg className="w-3.5 h-3.5 fill-current text-[#2516FF]" viewBox="0 0 24 24">
              <path d="M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5L12 2Z" />
            </svg>
            <span>{cmsConfig.features?.eyebrow || 'Benefits'}</span>
          </div>

          <h2 className="text-3xl md:text-5xl font-semibold text-slate-900 tracking-tight leading-[1.25] mb-4">
            {cmsConfig.features?.title || 'Engineered for Seamless Design Discovery'}
          </h2>
          <p className="text-base md:text-lg font-medium text-slate-600 leading-relaxed max-w-2xl mx-auto mb-16">
            {cmsConfig.features?.description || 'Streamline client onboarding, eliminate ambiguity, and protect your profitability.'}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 lg:gap-8 text-left">
            {(cmsConfig.features?.cards || [
              { title: 'Zero-Friction Client Discovery', description: 'Send a clean interactive link instead of a messy PDF questionnaire. Clients enjoy filling it out while you gather precise answers.', imagePlaceholder: bentocard04 },
              { title: 'Kill Scope Creep', description: 'Lock down deliverables and project boundaries before starting. Protect your margins from out-of-bounds requests.', imagePlaceholder: bentocard02 },
              { title: 'No Client Accounts, Ever', description: 'Clients don\'t need to sign up or create passwords. They just click your branded link and collaborate immediately.', imagePlaceholder: bentocard03 },
              { title: 'AI-Powered Brand Mapping', description: 'Transform unstructured notes into comprehensive design systems, target user personas, and visual directions automatically.', imagePlaceholder: bentocard01 },
            ]).map((card: any, idx: number) => (
              <motion.div 
                key={idx}
                whileHover={{ y: -5 }}
                transition={{ duration: 0.25, ease: 'easeOut' }}
                className="bg-[#FFFFFF] rounded-3xl border border-slate-100 hover:border-slate-300/80 hover:shadow-xl hover:shadow-slate-100 p-6 md:p-8 flex flex-col justify-between transition-all duration-300"
              >
                <div className="bg-[#FEFEFE] rounded-2xl overflow-hidden mb-6 flex items-center justify-center p-2 border border-slate-100/60 min-h-[220px]">
                  <img
                    src={card.imagePlaceholder || (idx === 0 ? bentocard04 : idx === 1 ? bentocard02 : idx === 2 ? bentocard03 : bentocard01)}
                    alt={card.title}
                    className="w-full h-auto object-contain max-h-[220px]"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&auto=format&fit=crop&q=80';
                    }}
                  />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-slate-900 mb-2 tracking-tight">
                    {card.title}
                  </h3>
                  <p className="text-sm md:text-base font-normal text-slate-500 leading-relaxed">
                    {card.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-24 px-6 bg-[#FFFFFF]">
        <div className="max-w-6xl mx-auto text-center">
          {/* Eyebrow Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-[#0F172A]/10 text-slate-900 text-xs font-semibold tracking-wide uppercase mb-6">
            <svg className="w-3.5 h-3.5 fill-current text-[#2516FF]" viewBox="0 0 24 24">
              <path d="M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5L12 2Z" />
            </svg>
            <span>How It Works</span>
          </div>

          <h2 className="text-3xl md:text-5xl font-semibold text-slate-900 tracking-tight leading-[1.25] mb-4">
            {cmsConfig.workflow?.title || 'Lock Down the Strategy Before You Open Figma'}
          </h2>
          <p className="text-base md:text-lg font-medium text-slate-600 leading-relaxed max-w-2xl mx-auto mb-16">
            {cmsConfig.workflow?.subtitle || 'A seamless three-step workflow designed to save you hours of alignment meetings.'}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 text-left">
            {(cmsConfig.workflow?.steps || [
              { stepLabel: 'Step 1', title: 'Share a Unique Link', description: 'Send your custom intake link to the client via Slack, email, or WhatsApp.' },
              { stepLabel: 'Step 2', title: 'Client Fills the Intake', description: 'AI guides the client through structured questions to extract exact design intent.' },
              { stepLabel: 'Step 3', title: 'AI Writes the Brief', description: 'Get an automated brand brief ready for client sign-off before design begins.' },
            ]).map((step: any, idx: number) => (
              <motion.div 
                key={idx}
                whileHover={{ y: -5 }}
                transition={{ duration: 0.25, ease: 'easeOut' }}
                className="bg-[#FFFFFF] rounded-3xl border border-slate-100 hover:border-slate-300/80 hover:shadow-xl hover:shadow-slate-100 p-6 md:p-8 flex flex-col justify-between transition-all duration-300"
              >
                <div className="bg-[#FEFEFE] rounded-2xl overflow-hidden mb-6 flex items-center justify-center p-2 border border-slate-100/60 min-h-[220px]">
                  <img
                    src={step.image || (idx === 0 ? howitworkscard03 : idx === 1 ? howitworkscard02 : howitworkscard01)}
                    alt={step.title}
                    className="w-full h-auto object-contain max-h-[220px]"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=800&auto=format&fit=crop&q=80';
                    }}
                  />
                </div>
                <div>
                  <span className="bg-[#2516FF] text-white text-xs px-3 py-1 rounded-full font-semibold inline-block mb-4">
                    {step.stepLabel || `Step ${idx + 1}`}
                  </span>
                  <h3 className="text-xl font-semibold text-slate-900 mb-2 tracking-tight">
                    {step.title}
                  </h3>
                  <p className="text-sm md:text-base font-normal text-slate-500 leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Briefora / Comparison Section */}
      <section id="why-briefora" className="py-24 px-6 bg-[#FFFFFF]">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            {/* Eyebrow Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-[#0F172A]/10 text-slate-900 text-xs font-semibold tracking-wide uppercase mb-6">
              <svg className="w-3.5 h-3.5 fill-current text-[#2516FF]" viewBox="0 0 24 24">
                <path d="M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5L12 2Z" />
              </svg>
              <span>Why Briefora</span>
            </div>

            <h2 className="text-3xl md:text-5xl font-semibold text-slate-900 tracking-tight leading-[1.25] mb-4">
              {cmsConfig.comparison?.title || 'Stop Collecting Raw Data. Start Extracting Creative Direction'}
            </h2>
            <p className="text-base md:text-lg font-medium text-slate-600 leading-relaxed max-w-2xl mx-auto">
              {cmsConfig.comparison?.subtitle || 'Generic forms collect raw data. Briefora extracts actionable creative direction. See the difference.'}
            </p>
          </div>

          {/* Comparison Table Card */}
          <div className="bg-[#FFFFFF] rounded-3xl border border-slate-200/80 overflow-hidden">
            <div className="grid grid-cols-2 divide-x divide-slate-100">
              {/* Table Headers */}
              <div className="p-4 sm:p-6 md:p-8 text-center border-b border-slate-100 flex items-center justify-center">
                <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-slate-900 tracking-tight">Others</h3>
              </div>
              <div className="p-4 sm:p-6 md:p-8 text-center bg-[#2516FF]/5 border-b border-slate-100 flex items-center justify-center">
                <Logo iconSize={24} />
              </div>

              {(cmsConfig.comparison?.rows || [
                { others: 'Gathers basic text entries', briefora: 'Extracts true creative intent' },
                { others: 'Forced signups or account setup', briefora: 'Zero login, zero friction' },
                { others: 'Hours of manual brief drafting', briefora: 'Instant AI-generated blueprints' },
                { others: 'Ignores aesthetic context', briefora: 'Translates stylistic adjectives' },
                { others: 'Overwhelming, endless form fields', briefora: '10 plain-language visual prompts' },
                { others: 'Invites vague, unbilled direction edits', briefora: 'Halts early scope creep completely' },
                { others: 'Messy email text or raw spreadsheets', briefora: 'Live workspace & clean PDF exports' },
                { others: 'Generic, low-end template feel', briefora: 'Premium high-ticket studio vibe' },
              ]).map((row: any, rIdx: number) => (
                <div key={rIdx} className="contents">
                  <div className="p-3 sm:p-5 text-xs sm:text-sm md:text-base font-normal text-slate-500 flex items-center justify-center gap-2 sm:gap-3 border-b border-slate-100 text-center">
                    <span className="w-4 h-4 sm:w-5 h-5 rounded-full bg-slate-200 text-slate-500 flex items-center justify-center text-[9px] sm:text-[10px] font-bold shrink-0">
                      ✕
                    </span>
                    <span>{row.others}</span>
                  </div>
                  <div className="p-3 sm:p-5 text-xs sm:text-sm md:text-base font-normal text-slate-900 bg-[#2516FF]/5 flex items-center justify-center gap-2 sm:gap-3 border-b border-slate-100 text-center">
                    <span className="w-4 h-4 sm:w-5 h-5 rounded-full bg-[#2516FF] text-white flex items-center justify-center text-[9px] sm:text-[10px] font-bold shrink-0">
                      ✓
                    </span>
                    <span>{row.briefora}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-24 px-6 bg-[#FFFFFF]">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-10">
            {/* Eyebrow Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-[#0F172A]/10 text-slate-900 text-xs font-semibold tracking-wide uppercase mb-6">
              <svg className="w-3.5 h-3.5 fill-current text-[#2516FF]" viewBox="0 0 24 24">
                <path d="M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5L12 2Z" />
              </svg>
              <span>Pricing</span>
            </div>

            <h2 className="text-3xl md:text-5xl font-semibold text-slate-900 tracking-tight leading-[1.25] mb-4">
              {cmsConfig.pricing?.title || 'Invest in Creative Clarity. Protect Your Margin.'}
            </h2>
            <p className="text-base md:text-lg font-medium text-slate-600 leading-relaxed max-w-2xl mx-auto">
              {cmsConfig.pricing?.subtitle || 'Choose the plan that fits your creative workflow.'}
            </p>
          </div>

          {/* Wide Inline Segmented Toggle Control */}
          <div className="flex items-center justify-center mb-12">
            <div className="relative bg-slate-100/90 p-1 rounded-full flex items-center w-64 shadow-inner border border-slate-200/60">
              {/* Inner Sliding Brand Blue Pill */}
              <div
                className="absolute top-1 left-1 bottom-1 w-[calc(50%-4px)] bg-[#2516FF] rounded-full transition-all duration-300 ease-in-out"
                style={{
                  transform: isYearly ? 'translateX(100%)' : 'translateX(0)',
                }}
              ></div>

              {/* Monthly Button */}
              <button
                type="button"
                onClick={() => setIsYearly(false)}
                className="relative z-10 w-1/2 py-2 text-center text-xs font-medium transition-colors duration-200 focus:outline-none select-none cursor-pointer"
              >
                <span className={!isYearly ? 'text-white' : 'text-slate-800'}>
                  Monthly
                </span>
              </button>

              {/* Yearly Button */}
              <button
                type="button"
                onClick={() => setIsYearly(true)}
                className="relative z-10 w-1/2 py-2 text-center text-xs font-medium transition-colors duration-200 focus:outline-none select-none cursor-pointer"
              >
                <span className={isYearly ? 'text-white' : 'text-slate-800'}>
                  Yearly
                </span>
              </button>
            </div>
          </div>

          {/* Pricing Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 items-stretch pt-4">
            {(cmsConfig.pricing?.plans || settings.pricing || []).map((plan: any) => {
              const isPro = plan.name?.toLowerCase() === 'pro';
              const price = isYearly 
                ? (plan.priceAnnual !== undefined ? plan.priceAnnual : Math.round(plan.priceMonthly * 0.8)) 
                : plan.priceMonthly;
              const formattedPrice = price === 0 || price === '0' || price === 'Free' ? 'Free' : `$${price}`;
              
              if (isPro) {
                return (
                  <motion.div 
                    key={plan.id}
                    whileHover={{ y: -20 }}
                    transition={{ duration: 0.25 }}
                    className="bg-[#2516FF] rounded-3xl p-[1.5px] flex flex-col justify-between transition-all lg:-translate-y-4 hover:shadow-2xl hover:shadow-[#2516FF]/20"
                  >
                    <div className="text-center py-2 text-white font-bold text-xs tracking-wider uppercase">
                      Most Popular
                    </div>

                    <div className="bg-white rounded-[22.5px] p-7 h-full flex flex-col justify-between">
                      <div>
                        <h3 className="text-2xl font-bold text-slate-900 mb-2">{plan.name}</h3>
                        <p className="text-sm md:text-base font-normal text-slate-500 leading-relaxed mb-6">
                          {plan.description}
                        </p>

                        <div className="flex items-baseline gap-1 mb-8">
                          <span className="text-4xl font-extrabold text-slate-900">
                            {formattedPrice}
                          </span>
                          {formattedPrice !== 'Free' && (
                            <span className="text-sm text-slate-500 font-medium">
                              {isYearly ? '/ month (billed yearly)' : '/ month'}
                            </span>
                          )}
                        </div>

                        <ul className="space-y-4 text-sm md:text-base font-normal text-slate-500 leading-relaxed mb-8">
                          {(plan.features || []).map((feature: string, idx: number) => (
                            <li key={idx} className="flex items-center gap-3">
                              <svg className="w-4 h-4 text-[#2516FF] shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"></path>
                              </svg>
                              <span>{feature}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <Link
                        to="/signup"
                        className="w-full bg-[#2516FF] hover:bg-[#1d11cc] text-white font-medium py-3.5 px-6 rounded-full text-sm transition-all text-center block"
                      >
                        {plan.ctaText || 'Start with Pro'}
                      </Link>
                    </div>
                  </motion.div>
                );
              }

              return (
                <motion.div 
                  key={plan.id}
                  whileHover={{ y: -5 }}
                  transition={{ duration: 0.25 }}
                  className="bg-slate-50/60 rounded-3xl border border-slate-200/80 p-8 flex flex-col justify-between transition-all hover:border-slate-300 hover:shadow-lg"
                >
                  <div>
                    <h3 className="text-2xl font-bold text-slate-900 mb-2">{plan.name}</h3>
                    <p className="text-sm md:text-base font-normal text-slate-500 leading-relaxed mb-6">
                      {plan.description}
                    </p>

                    <div className="flex items-baseline gap-1 mb-8">
                      <span className="text-4xl font-extrabold text-slate-900">{formattedPrice}</span>
                      {formattedPrice !== 'Free' ? (
                        <span className="text-sm text-slate-500 font-medium">
                          {isYearly ? '/ month (billed yearly)' : '/ month'}
                        </span>
                      ) : (
                        <span className="text-sm text-slate-500 font-medium">/ forever</span>
                      )}
                    </div>

                    <ul className="space-y-4 text-sm md:text-base font-normal text-slate-500 leading-relaxed mb-8">
                      {(plan.features || []).map((feature: string, idx: number) => (
                        <li key={idx} className="flex items-center gap-3">
                          <svg className="w-4 h-4 text-[#2516FF] shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"></path>
                          </svg>
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <Link
                    to="/signup"
                    className="w-full bg-slate-100/90 hover:bg-slate-200/90 text-slate-900 font-medium py-3.5 px-6 rounded-full text-sm transition-all text-center block"
                  >
                    {plan.ctaText || 'Start for free'}
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-24 px-6 bg-[#FFFFFF]">
        <div className="max-w-3xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-12">
            {/* Eyebrow Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-[#0F172A]/10 text-slate-900 text-xs font-semibold tracking-wide uppercase mb-6">
              <svg className="w-3.5 h-3.5 fill-current text-[#2516FF]" viewBox="0 0 24 24">
                <path d="M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5L12 2Z" />
              </svg>
              <span>FAQs</span>
            </div>

            <h2 className="text-3xl md:text-5xl font-semibold text-slate-900 tracking-tight leading-[1.25] mb-4">
              {cmsConfig.faq?.title || 'Got Questions? We Have Clear Answers.'}
            </h2>
            <p className="text-base md:text-lg font-medium text-slate-600 leading-relaxed max-w-2xl mx-auto">
              {cmsConfig.faq?.subtitle || 'Everything you need to know about how Briefora optimizes your design client onboarding workflow.'}
            </p>
          </div>

          {/* FAQ List Container */}
          <div className="space-y-4">
            {(cmsConfig.faq?.items || settings.faqs || []).map((faq: any, index: number) => (
              <motion.div 
                key={index}
                layout
                className={`faq-item bg-white border rounded-2xl p-6 transition-colors duration-200 ${openFaqIndex === index ? 'border-[#2516FF]/40 shadow-xs' : 'border-slate-200/80 hover:border-slate-300'}`}
              >
                <button
                  type="button"
                  onClick={() => toggleFaq(index)}
                  className="w-full flex items-center justify-between text-left focus:outline-none gap-4 cursor-pointer"
                >
                  <span className="text-base md:text-lg font-medium text-slate-900 tracking-tight">
                    {faq.question}
                  </span>
                  <motion.span 
                    animate={{ rotate: openFaqIndex === index ? 180 : 0 }}
                    transition={{ duration: 0.25, ease: "easeInOut" }}
                    className="faq-icon-btn w-6 h-6 rounded-full bg-[#2516FF] text-white flex items-center justify-center shrink-0"
                  >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d={openFaqIndex === index ? "M20 12H4" : "M12 4v16m8-8H4"}></path>
                    </svg>
                  </motion.span>
                </button>
                <AnimatePresence initial={false}>
                  {openFaqIndex === index && (
                    <motion.div
                      key={`faq-${index}`}
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
                      className="overflow-hidden"
                    >
                      <div className="pt-4 mt-2 border-t border-slate-100/80">
                        <p className="text-sm md:text-base font-normal text-slate-500 leading-relaxed">
                          {faq.answer}
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FOOTER SECTION */}
      <footer className="bg-white border-t border-slate-200 pt-16 pb-12 text-slate-600 font-sans">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Top Main Content Grid */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-12 pb-16">
            {/* Brand & Left Info Column */}
            <div className="md:col-span-6 flex flex-col justify-between space-y-6">
              <div>
                {/* Brand Logo */}
                <Link to="/" className="inline-flex items-center gap-2 mb-6">
                  <Logo iconSize={30} />
                </Link>
                <p className="text-sm md:text-base font-normal text-slate-500 leading-relaxed max-w-sm">
                  {cmsConfig.footer?.brandDescription || 'The AI-powered briefing system for creative agencies and freelancers. Streamline discovery, eliminate scope creep, and get client alignment fast.'}
                </p>
              </div>
            </div>

            {/* Links Column: Pages */}
            <div className="md:col-span-3">
              <ul className="space-y-3.5 text-sm font-normal text-slate-500">
                {(cmsConfig.footer?.navLinks || [
                  { label: 'Benefits', url: '#features' },
                  { label: 'How it Works', url: '#how-it-works' },
                  { label: 'Why Briefora', url: '#why-briefora' },
                  { label: 'Pricing', url: '#pricing' },
                  { label: 'FAQs', url: '#faq' },
                ]).map((lnk: any, idx: number) => (
                  <li key={idx}>
                    <a href={lnk.url} className="hover:text-slate-900 transition-colors">
                      {lnk.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Policies Column */}
            <div className="md:col-span-3 flex flex-col justify-start">
              <ul className="space-y-3.5 text-sm font-normal text-slate-500">
                {(cmsConfig.footer?.policyLinks || [
                  { label: 'Privacy Policy', url: '/privacypolicy' },
                  { label: 'Usage Policy', url: '/usagepolicy' },
                  { label: 'Terms of Service', url: '/termsofservice' },
                ]).map((lnk: any, idx: number) => (
                  <li key={idx}>
                    <Link to={lnk.url} className="hover:text-slate-900 transition-colors">
                      {lnk.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="pt-8 border-t border-slate-200/80 flex items-center justify-between text-xs text-slate-500">
            <p>{cmsConfig.footer?.copyrightText || '© 2026 Briefora. All rights reserved.'}</p>

            {/* LinkedIn Logo Button */}
            <a
              href={cmsConfig.footer?.socialLink || "https://www.linkedin.com/company/breifora/posts/?feedView=all"}
              target="_blank"
              rel="noopener noreferrer"
              className="w-9 h-9 rounded-full border border-slate-300 flex items-center justify-center text-slate-600 hover:text-slate-900 hover:border-slate-900 transition-colors shrink-0"
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-1.2.7-1.88 1.63-1.88.93 0 1.28.62 1.28 1.88v4.93h2.63M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z" />
              </svg>
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
