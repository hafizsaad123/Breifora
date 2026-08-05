import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, 
  Wand2, 
  AlertCircle, 
  Check, 
  ChevronRight, 
  Loader2, 
  FileText, 
  User, 
  Building, 
  Tag, 
  BookOpen, 
  Zap,
  CheckCircle2,
  ShieldAlert,
  ArrowLeft
} from 'lucide-react';
import { supabase } from '../utils/supabase';
import { useAuth } from '../context/AuthContext';
import DashboardLayout from '../components/DashboardLayout';
import { getFallbackProfile, saveFallbackProfile, saveFallbackBrief } from '../utils/fallbackDb';

export default function BriefNew() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [loadingProfile, setLoadingProfile] = useState(true);
  const [profileData, setProfileData] = useState<any>(null);
  const [isPaywallBlocked, setIsPaywallBlocked] = useState(false);

  // Form Fields
  const [title, setTitle] = useState('');
  const [clientName, setClientName] = useState('');
  const [industry, setIndustry] = useState('');
  const [requirements, setRequirements] = useState('');

  // Statuses
  const [submitting, setSubmitting] = useState(false);
  const [loaderPhase, setLoaderPhase] = useState(0);
  const [errorText, setErrorText] = useState<string | null>(null);

  // Loading messages rotation
  const compilerMessages = [
    "Analyzing industry standard patterns...",
    "Conducting automated competitive landscape analysis...",
    "Formulating visual direction & typographic pairings...",
    "Drafting customized digital product UX strategy...",
    "Compiling phased project launch roadmap..."
  ];

  // Rotate messages while compiling
  useEffect(() => {
    let interval: any;
    if (submitting) {
      interval = setInterval(() => {
        setLoaderPhase(prev => (prev + 1) % compilerMessages.length);
      }, 3500);
    }
    return () => clearInterval(interval);
  }, [submitting]);

  // Load user profile & check for trial paywall constraints on mount
  const checkProfileState = async () => {
    if (!user?.id) return;
    try {
      setLoadingProfile(true);
      setErrorText(null);

      let data = null;
      try {
        const { data: resData, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .maybeSingle();

        if (error) {
          console.warn('Supabase profile fetch in brief generator warning (using local fallback):', error);
          data = getFallbackProfile(user.id);
        } else {
          data = resData || getFallbackProfile(user.id);
        }
      } catch (e) {
        console.warn('Supabase profile exception in brief generator (using local fallback):', e);
        data = getFallbackProfile(user.id);
      }

      if (data) {
        setProfileData(data);
        const credits = data.free_credits !== undefined ? data.free_credits : 0;
        const subStatus = data.subscription_status || data.plan || 'free';

        // Check paywall condition: blocked immediately if credits are 0 and plan is free
        if (credits <= 0 && subStatus === 'free') {
          setIsPaywallBlocked(true);
        }
      }
    } catch (err: any) {
      console.warn('Error fetching profile in brief generator (using local fallback):', err);
      const fallback = getFallbackProfile(user.id);
      setProfileData(fallback);
      if (fallback.free_credits <= 0 && (fallback.subscription_status || fallback.plan || 'free') === 'free') {
        setIsPaywallBlocked(true);
      }
    } finally {
      setLoadingProfile(false);
    }
  };

  useEffect(() => {
    checkProfileState();
  }, [user?.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName || !industry) {
      setErrorText('Please enter both client name and industry.');
      return;
    }

    try {
      setSubmitting(true);
      setErrorText(null);
      setLoaderPhase(0);

      const resolvedTitle = title.trim() || `Brand Strategy Plan for ${clientName}`;

      // 1. Fetch AI compiled strategy brief from backend server API
      const response = await fetch('/api/generate-brief', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: resolvedTitle,
          clientName: clientName.trim(),
          industry: industry.trim(),
          requirements: requirements.trim(),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Server rejected strategy compilation.');
      }

      const responseData = await response.json();
      const generatedContent = responseData.content;

      // 2. Decrement credit atomically via RPC
      let successCredit = false;
      try {
        const { error: rpcError } = await supabase.rpc('decrement_credit');
        if (!rpcError) {
          successCredit = true;
        } else {
          console.warn('RPC decrement_credit failed (falling back to local):', rpcError);
        }
      } catch (e) {
        console.warn('RPC decrement_credit exception (falling back to local):', e);
      }

      // Always decrement from local fallback to stay synchronized
      const fallbackProfile = getFallbackProfile(user.id);
      const newCredits = Math.max(0, (fallbackProfile.free_credits !== undefined ? fallbackProfile.free_credits : 5) - 1);
      saveFallbackProfile(user.id, { free_credits: newCredits });

      // 3. Insert newly compiled record into briefs table
      let insertedId = `brf-${Date.now()}`;
      try {
        const { data: insertedData, error: insertError } = await supabase
          .from('briefs')
          .insert({
            user_id: user.id,
            title: resolvedTitle,
            client_name: clientName.trim(),
            industry: industry.trim(),
            status: 'Active',
            content: generatedContent,
          })
          .select('*')
          .single();

        if (insertError) {
          console.warn('Supabase insert brief warning (using local fallback):', insertError);
          saveFallbackBrief(user.id, {
            id: insertedId,
            title: resolvedTitle,
            client_name: clientName.trim(),
            industry: industry.trim(),
            status: 'Active',
            content: generatedContent
          });
        } else if (insertedData) {
          insertedId = insertedData.id;
          // Sync with local fallback too so it's always accessible offline
          saveFallbackBrief(user.id, {
            id: insertedData.id,
            title: resolvedTitle,
            client_name: clientName.trim(),
            industry: industry.trim(),
            status: 'Active',
            content: generatedContent
          });
        }
      } catch (e) {
        console.warn('Supabase insert brief exception (using local fallback):', e);
        saveFallbackBrief(user.id, {
          id: insertedId,
          title: resolvedTitle,
          client_name: clientName.trim(),
          industry: industry.trim(),
          status: 'Active',
          content: generatedContent
        });
      }

      // 4. Redirect to the newly generated brief details route
      navigate(`/briefs/${insertedId}`);

    } catch (err: any) {
      console.error('Failed to compile strategy brief:', err);
      setErrorText(err.message || 'Error occurred during dynamic compile step.');
      setSubmitting(false);
    }
  };

  if (loadingProfile) {
    return (
      <DashboardLayout>
        <div className="w-full h-full flex items-center justify-center bg-[#F8FAFC]">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="w-8 h-8 text-[#2516FF] animate-spin" />
            <p className="text-xs text-slate-500 font-semibold">Validating client strategy access...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-6 sm:p-8 max-w-4xl mx-auto space-y-6" id="new-brief-container">
        
        {/* TOP BREADCRUMB */}
        <div className="flex items-center gap-2">
          <Link to="/dashboard" className="text-xs text-slate-500 hover:text-[#2516FF] font-semibold flex items-center gap-1">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Dashboard</span>
          </Link>
          <span className="text-slate-300 text-xs">/</span>
          <span className="text-xs text-slate-800 font-bold">Generate Strategy Brief</span>
        </div>

        {/* 🛑 ACTIVE PLAN PAYWALL CONTAINER */}
        {isPaywallBlocked ? (
          <div id="trial-paywall-blocker" className="bg-white border border-slate-200/90 rounded-3xl p-8 sm:p-12 text-center shadow-xl space-y-6 my-4 max-w-2xl mx-auto">
            <div className="w-16 h-16 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center mx-auto text-[#2516FF]">
              <ShieldAlert className="w-8 h-8" />
            </div>
            
            <div className="space-y-2">
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">Upgrade Needed</h2>
              <p className="text-slate-500 text-xs sm:text-sm leading-relaxed max-w-md mx-auto">
                You have reached your <strong>0 trial credit limits</strong>. Upgrade your account today to unlock unlimited brand blueprints, interface briefs, and client presentations.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => navigate('/settings')}
                className="w-full sm:w-auto bg-[#2516FF] hover:bg-[#1f10e6] text-white font-bold text-xs px-6 py-3 rounded-full shadow-md cursor-pointer transition-colors border-none"
              >
                View Plans & Upgrade
              </button>
              <Link
                to="/dashboard"
                className="w-full sm:w-auto text-slate-600 hover:bg-slate-50 border border-slate-200 font-bold text-xs px-6 py-3 rounded-full text-center cursor-pointer transition-colors"
              >
                Back to Dashboard
              </Link>
            </div>
          </div>
        ) : submitting ? (
          /* ⚙️ DYNAMIC COMPILER LOADING PROGRESS OVERLAY */
          <div id="compiler-loading-screen" className="bg-white border border-slate-200/90 rounded-3xl p-8 sm:p-16 text-center shadow-md space-y-8 my-8 animate-in fade-in zoom-in-95 duration-500">
            <div className="relative w-24 h-24 mx-auto flex items-center justify-center">
              <div className="absolute inset-0 rounded-full border-4 border-blue-50 border-t-[#2516FF] animate-spin" />
              <div className="w-16 h-16 rounded-full bg-[#2516FF]/10 flex items-center justify-center text-[#2516FF]">
                <Wand2 className="w-8 h-8 animate-pulse" />
              </div>
            </div>

            <div className="space-y-2.5 max-w-sm mx-auto">
              <h3 className="text-lg font-black text-slate-900 tracking-tight">Compiling Client Strategy...</h3>
              <p className="text-xs text-slate-500 leading-relaxed font-semibold min-h-[36px]">
                {compilerMessages[loaderPhase]}
              </p>
            </div>

            {/* Simulated progress indicators */}
            <div className="flex justify-center items-center gap-2 max-w-xs mx-auto">
              {compilerMessages.map((_, idx) => (
                <div 
                  key={idx} 
                  className={`h-1.5 rounded-full transition-all duration-500 ${
                    idx === loaderPhase 
                      ? 'w-8 bg-[#2516FF]' 
                      : idx < loaderPhase 
                      ? 'w-2 bg-emerald-450' 
                      : 'w-2 bg-slate-200'
                  }`}
                />
              ))}
            </div>
          </div>
        ) : (
          /* 📝 CREATIVE STRATEGY FORM */
          <div className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 shadow-2xs space-y-6" id="form-card">
            
            <div className="border-b border-slate-100 pb-5">
              <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-[#2516FF]" />
                Strategy Brief Parameters
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Provide client core values, industry keywords, and focus directives to align our deep brand strategist models.
              </p>
            </div>

            {errorText && (
              <div className="bg-rose-50 border border-rose-200 text-rose-800 p-4 rounded-xl flex items-start gap-3 text-xs" id="form-error-banner">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="font-bold">Execution Failed</p>
                  <p className="mt-0.5 text-rose-600">{errorText}</p>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6" id="strategy-brief-form">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Client Name Field */}
                <div className="space-y-2">
                  <label htmlFor="clientName" className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Client / Product Name <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Building className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      id="clientName"
                      type="text"
                      required
                      placeholder="e.g. Acme Health"
                      value={clientName}
                      onChange={(e) => setClientName(e.target.value)}
                      className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:border-[#2516FF] focus:ring-1 focus:ring-[#2516FF]/15 placeholder:text-slate-400"
                    />
                  </div>
                </div>

                {/* Industry / Domain Field */}
                <div className="space-y-2">
                  <label htmlFor="industry" className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Industry Verticals <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Tag className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      id="industry"
                      type="text"
                      required
                      placeholder="e.g. Telehealth & Wellness Tech"
                      value={industry}
                      onChange={(e) => setIndustry(e.target.value)}
                      className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:border-[#2516FF] focus:ring-1 focus:ring-[#2516FF]/15 placeholder:text-slate-400"
                    />
                  </div>
                </div>
              </div>

              {/* Title Field */}
              <div className="space-y-2">
                <label htmlFor="title" className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Project Deliverable Title
                </label>
                <div className="relative">
                  <FileText className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    id="title"
                    type="text"
                    placeholder="e.g. Brand Positioning & Creative Strategy (leave empty for auto)"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:border-[#2516FF] focus:ring-1 focus:ring-[#2516FF]/15 placeholder:text-slate-400"
                  />
                </div>
              </div>

              {/* Focus / Requirements Field */}
              <div className="space-y-2">
                <label htmlFor="requirements" className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Key Directives & Audience Focus
                </label>
                <div className="relative">
                  <BookOpen className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                  <textarea
                    id="requirements"
                    rows={5}
                    placeholder="Provide details on audience persona, design themes (minimalist, premium, bright), wireframing expectations, competitive challenges, or custom typography goals..."
                    value={requirements}
                    onChange={(e) => setRequirements(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:border-[#2516FF] focus:ring-1 focus:ring-[#2516FF]/15 placeholder:text-slate-400 resize-y"
                  />
                </div>
              </div>

              {/* Trigger compiler buttons */}
              <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-1.5 text-slate-500 text-[11px] font-semibold">
                  <Zap className="w-3.5 h-3.5 text-[#2516FF] fill-[#2516FF]" />
                  <span>Deducts <strong>1 strategy credit</strong> upon successful generation.</span>
                </div>

                <button
                  id="compile-strategy-btn"
                  type="submit"
                  className="w-full sm:w-auto bg-[#2516FF] hover:bg-[#1f10e6] text-white font-bold text-xs px-6 py-3 rounded-xl shadow-md flex items-center justify-center gap-1.5 transition-all cursor-pointer border-none"
                >
                  <Wand2 className="w-4 h-4" />
                  <span>Compile Brand Strategy</span>
                </button>
              </div>

            </form>
          </div>
        )}

      </div>
    </DashboardLayout>
  );
}
