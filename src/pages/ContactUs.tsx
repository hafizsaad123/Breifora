import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Mail, 
  Phone, 
  MapPin, 
  Send, 
  CheckCircle, 
  AlertCircle, 
  Clock, 
  ChevronRight, 
  Shield, 
  Sparkles, 
  MessageSquare,
  HelpCircle,
  FileText,
  ChevronLeft
} from 'lucide-react';
import Footer from '../components/sections/Footer';
import Logo from '../components/ui/Logo';
import { PrimaryBrandButton } from '../components/ui/PrimaryBrandButton';
import { SecondaryWhiteButton } from '../components/ui/SecondaryWhiteButton';
import { supabase } from '../lib/adminSync';

export default function ContactUs() {
  const navigate = useNavigate();

  // Form states
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('General Inquiry');
  const [message, setMessage] = useState('');
  const [consent, setConsent] = useState(false);

  // Status and feedback states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [feedbackMessage, setFeedbackMessage] = useState('');

  // Form field touched / validation states for visual feedback
  const [touched, setTouched] = useState({
    fullName: false,
    email: false,
    message: false,
    consent: false,
  });

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Validation functions
  const isEmailValid = (emailStr: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailStr);
  };

  const isFormValid = 
    fullName.trim() !== '' && 
    isEmailValid(email) && 
    message.trim().length >= 10 && 
    consent;

  // Handle Form Submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched({
      fullName: true,
      email: true,
      message: true,
      consent: true,
    });

    if (!isFormValid) {
      setSubmitStatus('error');
      if (message.trim().length < 10 && message.trim().length > 0) {
        setFeedbackMessage('Please write a message of at least 10 characters.');
      } else if (!consent) {
        setFeedbackMessage('You must agree to the Terms of Service and Privacy Policy to submit.');
      } else {
        setFeedbackMessage('Please fill in all required fields with valid values.');
      }
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus('idle');
    setFeedbackMessage('');

    const submissionData = {
      full_name: fullName.trim(),
      email: email.trim(),
      subject,
      message: message.trim(),
      status: 'unread',
      created_at: new Date().toISOString()
    };

    try {
      let dbSuccess = false;

      // 1. Attempt to write to Supabase if configured
      if (supabase) {
        const { error } = await supabase
          .from('contact_submissions')
          .insert([submissionData]);

        if (error) {
          console.error('Supabase contact submission error:', error.message);
          // Fall back to local queue if database write fails (e.g. table not created yet)
        } else {
          dbSuccess = true;
          console.log('✅ Contact submission saved to Supabase successfully!');
        }
      }

      // 2. Always backup / log to localStorage for safety & robust local testing
      const existingQueue = JSON.parse(localStorage.getItem('briefora_contact_submissions') || '[]');
      existingQueue.push({
        ...submissionData,
        synced_online: dbSuccess,
        id: 'sub-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7)
      });
      localStorage.setItem('briefora_contact_submissions', JSON.stringify(existingQueue));

      // Trigger Audit log in Admin if applicable
      const existingLogs = JSON.parse(localStorage.getItem('briefora_admin_logs') || '[]');
      existingLogs.unshift({
        id: 'log-' + Date.now(),
        action: 'CONTACT_FORM_SUBMISSION',
        target: `${fullName.trim()} (${subject})`,
        timestamp: new Date().toLocaleTimeString(),
        admin: 'system'
      });
      localStorage.setItem('briefora_admin_logs', JSON.stringify(existingLogs));

      // 3. Success UI updates
      setSubmitStatus('success');
      setFeedbackMessage(
        dbSuccess 
          ? "Thank you! Your message has been sent. We'll get back to you within 24 hours."
          : "Message sent! (Saved locally in offline mode). We'll get back to you shortly."
      );

      // Reset form fields
      setFullName('');
      setEmail('');
      setSubject('General Inquiry');
      setMessage('');
      setConsent(false);
      setTouched({
        fullName: false,
        email: false,
        message: false,
        consent: false,
      });

    } catch (err: any) {
      console.error('Form submission unexpected error:', err);
      setSubmitStatus('error');
      setFeedbackMessage('An unexpected error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full min-h-screen bg-[#FAFAFC] font-sans antialiased text-slate-800 flex flex-col justify-between relative overflow-x-hidden">
      
      {/* Absolute background accent glow */}
      <div className="absolute top-[-10%] left-[-20%] w-[60%] h-[50%] rounded-full bg-[#2516FF]/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[20%] right-[-20%] w-[50%] h-[40%] rounded-full bg-[#5956E9]/5 blur-[120px] pointer-events-none" />

      {/* Header (Matching Terms of Service page with landing page button styles) */}
      <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-slate-200/60 py-4 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <SecondaryWhiteButton
              onClick={() => navigate(-1)}
              className="px-3 py-1.5 text-xs text-slate-600 font-semibold border border-slate-200"
            >
              <ChevronLeft className="w-4 h-4 mr-1.5" /> Back
            </SecondaryWhiteButton>
            <div className="h-4 w-px bg-slate-200 hidden sm:block"></div>
            <Link to="/" className="flex items-center gap-2">
              <Logo iconSize={24} />
            </Link>
          </div>
          <button
            onClick={() => navigate('/signup')}
            className="px-6 py-2.5 bg-[#2516FF] hover:bg-[#1d11cc] text-white font-bold text-sm rounded-full shadow-sm cursor-pointer transition-colors duration-200 tracking-tight"
          >
            Start for free
          </button>
        </div>
      </header>

      {/* Content wrapper */}
      <main className="flex-grow py-12 sm:py-16 relative z-10">
        
        {/* Main Content Section */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Header/Hero Section */}
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
            
            {/* Quick response chips / badges */}
            <div className="flex flex-wrap justify-center gap-2 mb-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#2516FF]/5 text-[#2516FF] text-[11px] font-bold tracking-wider uppercase border border-[#2516FF]/10">
                <Clock className="w-3.5 h-3.5" /> Fast Response Within 24h
              </span>
            </div>

            {/* Title & Subtext */}
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight leading-none">
              We'd love to <span className="text-[#2516FF]">hear from you</span>
            </h1>
            <p className="text-sm sm:text-base md:text-lg text-slate-500 font-medium leading-relaxed max-w-2xl mx-auto">
              Have a question about our client discovery tools, pricing models, or white-label solutions? Drop us a line. Let's align your creative strategy.
            </p>
          </div>

          {/* Main Stack: Interactive Form on top, FAQ Redirect Box below */}
          <div className="max-w-3xl mx-auto space-y-8">
            
            {/* The primary Interactive Form Card */}
            <div className="bg-white border border-slate-200/80 rounded-[24px] sm:rounded-[32px] p-6 sm:p-8 md:p-10 shadow-md shadow-slate-100/40 relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#2516FF] to-[#5956E9]" />

              <h3 className="text-xl font-extrabold text-slate-900 tracking-tight mb-1.5">
                Send us a Message
              </h3>
              <p className="text-xs sm:text-sm text-slate-400 font-semibold mb-8">
                Complete the quick creative brief below to direct your message to the correct team department.
              </p>

              {/* Submitting Success/Error Alerts */}
              <AnimatePresence mode="wait">
                {submitStatus === 'success' && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mb-6 p-4 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-800 text-xs sm:text-sm font-medium flex items-start gap-3"
                  >
                    <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold">Success!</p>
                      <p className="text-emerald-700 font-medium">{feedbackMessage}</p>
                    </div>
                  </motion.div>
                )}

                {submitStatus === 'error' && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mb-6 p-4 rounded-xl bg-red-50 border border-red-100 text-red-800 text-xs sm:text-sm font-medium flex items-start gap-3"
                  >
                    <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold">Submission Error</p>
                      <p className="text-red-700 font-medium">{feedbackMessage}</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* The Contact Form */}
              <form onSubmit={handleSubmit} className="space-y-6">
                
                {/* Row 1: Full Name */}
                <div className="space-y-1.5">
                  <label htmlFor="fullName" className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="fullName"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    onBlur={() => setTouched({ ...touched, fullName: true })}
                    placeholder="Jane Cooper"
                    className={`w-full px-4 py-3 rounded-xl border bg-slate-50/50 text-sm font-semibold transition-all outline-none focus:bg-white
                      ${touched.fullName && fullName.trim() === '' 
                        ? 'border-red-300 focus:border-red-400 focus:ring-1 focus:ring-red-200' 
                        : 'border-slate-200 focus:border-[#2516FF] focus:ring-1 focus:ring-[#2516FF]/15'
                      }`}
                    required
                  />
                  {touched.fullName && fullName.trim() === '' && (
                    <p className="text-[11px] text-red-500 font-semibold">Full name is required.</p>
                  )}
                </div>

                {/* Row 2: Email Address */}
                <div className="space-y-1.5">
                  <label htmlFor="email" className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onBlur={() => setTouched({ ...touched, email: true })}
                    placeholder="jane@studio-example.com"
                    className={`w-full px-4 py-3 rounded-xl border bg-slate-50/50 text-sm font-semibold transition-all outline-none focus:bg-white
                      ${touched.email && (!email || !isEmailValid(email))
                        ? 'border-red-300 focus:border-red-400 focus:ring-1 focus:ring-red-200' 
                        : 'border-slate-200 focus:border-[#2516FF] focus:ring-1 focus:ring-[#2516FF]/15'
                      }`}
                    required
                  />
                  {touched.email && !email && (
                    <p className="text-[11px] text-red-500 font-semibold">Email address is required.</p>
                  )}
                  {touched.email && email && !isEmailValid(email) && (
                    <p className="text-[11px] text-red-500 font-semibold">Please enter a valid email format (e.g., name@example.com).</p>
                  )}
                </div>

                {/* Row 3: Topic / Subject Dropdown */}
                <div className="space-y-1.5">
                  <label htmlFor="subject" className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Topic / Subject
                  </label>
                  <div className="relative">
                    <select
                      id="subject"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50/50 text-sm font-semibold transition-all outline-none focus:bg-white appearance-none cursor-pointer focus:border-[#2516FF] focus:ring-1 focus:ring-[#2516FF]/15"
                    >
                      <option value="General Inquiry">General Inquiry</option>
                      <option value="Billing & Subscriptions">Billing & Subscriptions</option>
                      <option value="Technical Support">Technical Support</option>
                      <option value="Feedback">Feedback</option>
                    </select>
                    {/* Custom dropdown arrow */}
                    <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none text-slate-400">
                      <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20">
                        <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Row 4: Message Textarea */}
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <label htmlFor="message" className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
                      Message <span className="text-red-500">*</span>
                    </label>
                    <span className="text-[10px] font-bold text-slate-400">Min. 10 characters</span>
                  </div>
                  <textarea
                    id="message"
                    rows={5}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onBlur={() => setTouched({ ...touched, message: true })}
                    placeholder="Write your request, details, or questions here..."
                    className={`w-full px-4 py-3 rounded-xl border bg-slate-50/50 text-sm font-semibold transition-all outline-none focus:bg-white resize-y
                      ${touched.message && message.trim().length < 10
                        ? 'border-red-300 focus:border-red-400 focus:ring-1 focus:ring-red-200' 
                        : 'border-slate-200 focus:border-[#2516FF] focus:ring-1 focus:ring-[#2516FF]/15'
                      }`}
                    required
                  />
                  {touched.message && message.trim().length === 0 && (
                    <p className="text-[11px] text-red-500 font-semibold">Message is required.</p>
                  )}
                  {touched.message && message.trim().length > 0 && message.trim().length < 10 && (
                    <p className="text-[11px] text-red-500 font-semibold">Message must be at least 10 characters (currently {message.trim().length}).</p>
                  )}
                </div>

                {/* Row 5: Privacy Consent Checkbox */}
                <div className="space-y-1.5 pt-2">
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={consent}
                      onChange={(e) => setConsent(e.target.checked)}
                      onBlur={() => setTouched({ ...touched, consent: true })}
                      className="mt-1 w-4 h-4 rounded border-slate-300 text-[#2516FF] focus:ring-[#2516FF]/15 cursor-pointer accent-[#2516FF]"
                      required
                    />
                    <span className="text-xs text-slate-500 font-semibold leading-relaxed">
                      I agree to the <a href="/termsofservice" target="_blank" rel="noopener noreferrer" className="text-[#2516FF] underline hover:text-[#1d11cc]">Terms of Service</a> and <a href="/privacypolicy" target="_blank" rel="noopener noreferrer" className="text-[#2516FF] underline hover:text-[#1d11cc]">Privacy Policy</a>, and consent to having this form data stored for response delivery. <span className="text-red-500">*</span>
                    </span>
                  </label>
                  {touched.consent && !consent && (
                    <p className="text-[11px] text-red-500 font-semibold pl-7">You must consent to continue.</p>
                  )}
                </div>

                {/* Row 6: Submit Button (Static style matching header, with hover transition, no motion scale) */}
                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-4 px-8 bg-[#2516FF] hover:bg-[#1d11cc] text-white font-bold text-sm rounded-full shadow-sm cursor-pointer transition-colors duration-200 tracking-wider flex items-center justify-center disabled:bg-slate-300 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Sending Inquiry...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4 mr-2" /> Send Secure Inquiry
                      </>
                    )}
                  </button>
                </div>

              </form>
            </div>

            {/* Looking for immediate answers? Card below the form card */}
            <div className="bg-gradient-to-br from-[#2516FF]/5 to-transparent border border-[#2516FF]/10 rounded-[24px] p-8 text-center max-w-2xl mx-auto">
              <HelpCircle className="w-10 h-10 text-[#2516FF] mx-auto mb-4" />
              <h4 className="text-base font-bold text-slate-900 mb-1.5">Looking for immediate answers?</h4>
              <p className="text-xs sm:text-sm text-slate-500 font-semibold leading-relaxed mb-5">
                Check out our Frequently Asked Questions covering client onboarding, billing limits, and design agency customization.
              </p>
              <SecondaryWhiteButton 
                onClick={() => navigate('/#faq')}
                className="px-5 py-2.5 text-xs font-bold border border-slate-200"
              >
                Visit FAQs
              </SecondaryWhiteButton>
            </div>

          </div>

        </div>

      </main>

      {/* Minimalist Footer matching 2nd image */}
      <footer className="w-full bg-white border-t border-slate-200/50 py-10 mt-auto">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-[13px] sm:text-sm text-slate-400 font-medium">
            © 2026 Briefora. All rights reserved.
          </p>
        </div>
      </footer>

    </div>
  );
}
