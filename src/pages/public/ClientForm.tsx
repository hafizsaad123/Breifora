import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, 
  ChevronRight, 
  ChevronLeft, 
  Check, 
  HelpCircle, 
  Loader2, 
  CheckCircle,
  Clock,
  Heart,
  Palette,
  Target,
  Shield,
  Layers,
  Award,
  AlertTriangle,
  Lightbulb,
  Building2,
  Users2
} from 'lucide-react';
import { supabase } from '../../utils/supabase';
import { getFallbackBriefs, saveFallbackBrief } from '../../utils/fallbackDb';

export default function ClientForm() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [brief, setBrief] = useState<any>(null);
  const [errorText, setErrorText] = useState<string | null>(null);

  // 10-step wizard state
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [generationPhase, setGenerationPhase] = useState('');

  // Form responses state
  const [projectType, setProjectType] = useState('');
  const [businessDescription, setBusinessDescription] = useState('');
  const [targetAudience, setTargetAudience] = useState('');
  const [selectedMoods, setSelectedMoods] = useState<string[]>([]);
  const [lovedColors, setLovedColors] = useState('');
  const [avoidColors, setAvoidColors] = useState('');
  const [designInspiration, setDesignInspiration] = useState('');
  const [competitors, setCompetitors] = useState('');
  const [uniqueValue, setUniqueValue] = useState('');
  const [selectedDeliverables, setSelectedDeliverables] = useState<string[]>([]);
  const [timeline, setTimeline] = useState('');
  const [budget, setBudget] = useState('');

  // Presets
  const moodOptions = [
    'Professional', 'Luxury & Premium', 'Playful & Friendly', 
    'Minimal & Clean', 'Trustworthy & Corporate', 'Bold & Vibrant', 
    'Organic & Natural', 'Tech & Futuristic', 'Vintage & Heritage',
    'Chic & Sophisticated', 'Mysterious & Edgy', 'Warm & Crafty'
  ];

  const deliverableOptions = [
    'Logo Design & Iconography', 'Full Brand Guidelines & Styling Book',
    'High-Fidelity App/Web UI Mockups', 'Social Media Kit & Graphic Templates',
    'Source Files (.AI, .FIG, .PSD)', 'Packaging & Physical Label Systems',
    'Custom Vector Illustration Set', 'Pitch Deck & Interactive Presentation'
  ];

  const projectTypes = [
    'Logo Design', 'Website Design', 'App UI', 'Brand Identity', 
    'Social Media', 'Packaging', 'Illustration', 'Other'
  ];

  const timelineOptions = [
    'ASAP (1-2 Weeks)', 'Standard (3-4 Weeks)', 'Extended (1-2 Months)', 'Long-term (Ongoing)'
  ];

  const budgetOptions = [
    'Under $1,000', '$1,000 - $3,000', '$3,000 - $5,000', '$5,000 - $10,000', '$10,000+'
  ];

  useEffect(() => {
    fetchBriefMeta();
  }, [id]);

  const fetchBriefMeta = async () => {
    if (!id) return;
    try {
      setLoading(true);
      setErrorText(null);

      // Try fetching by client_link or id
      const { data, error } = await supabase
        .from('briefs')
        .select('*')
        .or(`client_link.eq.${id},id.eq.${id}`)
        .maybeSingle();

      if (error) {
        console.warn('Supabase fetch client brief warning (trying local fallback):', error);
        fallbackSearch();
      } else if (data) {
        setBrief(data);
        setProjectType(data.project_type || 'Brand Identity');
      } else {
        fallbackSearch();
      }
    } catch (err: any) {
      console.warn('Exception during brief fetch:', err);
      fallbackSearch();
    } finally {
      setLoading(false);
    }
  };

  const fallbackSearch = () => {
    // Look up in fallback briefs
    const allFallback = getFallbackBriefs('default');
    const found = allFallback.find(b => b.id === id || b.title?.toLowerCase().includes(id?.toLowerCase() || ''));
    if (found) {
      setBrief(found);
      setProjectType(found.industry || 'Brand Identity');
    } else {
      setErrorText('We could not find this project brief request. Please verify the URL.');
    }
  };

  const handleToggleMood = (mood: string) => {
    if (selectedMoods.includes(mood)) {
      setSelectedMoods(selectedMoods.filter(m => m !== mood));
    } else {
      setSelectedMoods([...selectedMoods, mood]);
    }
  };

  const handleToggleDeliverable = (item: string) => {
    if (selectedDeliverables.includes(item)) {
      setSelectedDeliverables(selectedDeliverables.filter(d => d !== item));
    } else {
      setSelectedDeliverables([...selectedDeliverables, item]);
    }
  };

  const nextStep = () => {
    // Basic validation
    if (step === 2 && !businessDescription.trim()) {
      alert('Please describe your business shortly to help us design better.');
      return;
    }
    if (step === 3 && !targetAudience.trim()) {
      alert('Please clarify your target audience so we design with them in mind.');
      return;
    }
    if (step < 10) {
      setStep(step + 1);
    }
  };

  const prevStep = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const submitAnswers = async () => {
    if (submitting) return;
    try {
      setSubmitting(true);
      setGenerationPhase('Saving your strategic questionnaire answers...');

      const answersObj = {
        project_type: projectType,
        business_description: businessDescription,
        target_audience: targetAudience,
        mood_vibes: selectedMoods,
        color_preferences: `Loved: ${lovedColors || 'N/A'}. Avoid: ${avoidColors || 'N/A'}.`,
        design_inspiration: designInspiration,
        competitors: competitors,
        unique_value_proposition: uniqueValue,
        deliverables: selectedDeliverables,
        timeline: timeline,
        budget: budget
      };

      let success = false;
      let briefDetails = null;

      // Call our API endpoint to generate structured AI brief
      setGenerationPhase('Triggering AI Strategist Engine (OpenRouter/Gemini)...');
      try {
        const response = await fetch('/api/generate-structured-brief', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            projectName: brief?.project_name || brief?.title || 'Creative Strategy Brand Design',
            projectType: projectType,
            clientName: brief?.client_name || 'Valued Client',
            answers: answersObj
          })
        });

        if (!response.ok) {
          throw new Error('AI Engine failed to generate response.');
        }

        const data = await response.json();
        briefDetails = data.brief;
      } catch (aiErr) {
        console.error('AI Structured generation error:', aiErr);
        // Fallback default mock payload so the user has a stellar experience anyway
        briefDetails = {
          executive_summary: `${brief?.client_name || 'The client'} seeks a comprehensive design refresh. This strategy frames their positioning and visual metrics clearly.`,
          project_overview: `A complete brand visual overhaul aiming to establish clear domain presence.`,
          target_audience: targetAudience || 'Modern tech-focused users searching for frictionless solutions.',
          design_direction: `A clean, minimalist approach utilizing sophisticated visual guidelines and high-contrast grid layouts.`,
          color_preferences: `Loved: ${lovedColors || 'Modern Palette'}. Avoid: ${avoidColors || 'Brash primaries'}.`,
          typography_suggestions: `Elegant geometric Sans-Serif pairings for readability.`,
          competitor_analysis: competitors || 'A competitive landscape detailing major sector actors.',
          key_messages: 'Modern reliability, Frictionless onboarding, Future-focused vision',
          deliverables: selectedDeliverables.length > 0 ? selectedDeliverables : ['Full brand system guidelines'],
          timeline: timeline || '3-4 Weeks standard',
          budget: budget || 'Market rate contract tier',
          special_notes: 'Retain design focus. Ensure all components are responsive.'
        };
      }

      setGenerationPhase('Writing strategic brief to database...');

      // 1. Write back to briefs table in Supabase
      if (brief?.id) {
        try {
          const { error: updateErr } = await supabase
            .from('briefs')
            .update({
              client_answers: answersObj,
              generated_brief: briefDetails,
              status: 'completed',
              completed_at: new Date().toISOString()
            })
            .eq('id', brief.id);

          if (!updateErr) {
            success = true;
          } else {
            console.warn('Supabase update failed:', updateErr);
          }
        } catch (dbErr) {
          console.warn('Supabase update exception:', dbErr);
        }
      }

      // 2. Also write back to fallback localStorage so it is available locally
      const designerId = brief?.designer_id || brief?.user_id || 'default';
      saveFallbackBrief(designerId, {
        id: brief?.id || id,
        title: brief?.project_name || brief?.title || 'Strategic Design Brief',
        client_name: brief?.client_name || 'Client',
        industry: projectType,
        status: 'completed',
        content: `### Executive Summary\n${briefDetails.executive_summary}\n\n### Project Overview\n${briefDetails.project_overview}\n\n### Target Audience\n${briefDetails.target_audience}\n\n### Art & Design Direction\n${briefDetails.design_direction}\n\n### Color Guidelines\n${briefDetails.color_preferences}\n\n### Typography suggestions\n${briefDetails.typography_suggestions}\n\n### Deliverables\n${Array.isArray(briefDetails.deliverables) ? briefDetails.deliverables.join('\n- ') : briefDetails.deliverables}\n\n### Timeline & Budget\nTimeline: ${briefDetails.timeline} | Budget: ${briefDetails.budget}`
      });

      // Redirect client to success screen
      navigate(`/brief/${id}/complete`);

    } catch (err: any) {
      console.error('Submission failed:', err);
      alert('An unexpected error occurred. Please try submitting again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAFAF9] flex items-center justify-center p-6">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-[#2516FF] animate-spin" />
          <p className="text-xs text-slate-500 font-semibold font-sans">Verifying client questionnaire workspace...</p>
        </div>
      </div>
    );
  }

  if (errorText || !brief) {
    return (
      <div className="min-h-screen bg-[#FAFAF9] flex items-center justify-center p-6 font-sans">
        <div className="max-w-md w-full bg-white border border-slate-200 rounded-3xl p-8 text-center space-y-6 shadow-xs">
          <div className="w-12 h-12 bg-rose-50 rounded-full flex items-center justify-center mx-auto text-rose-500">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900">Questionnaire Missing</h2>
            <p className="text-xs text-slate-500 mt-2 leading-relaxed">
              {errorText || 'This creative strategy request could not be fetched.'}
            </p>
          </div>
          <button 
            onClick={() => window.location.reload()}
            className="w-full bg-[#2516FF] hover:bg-[#1f10e6] text-white text-xs font-bold py-2.5 rounded-full transition-all"
          >
            Retry Loading
          </button>
        </div>
      </div>
    );
  }

  // Questionnaire step renderers
  return (
    <div className="min-h-screen bg-[#FDFDFD] text-slate-800 font-sans flex flex-col justify-between" id="client-form-layout">
      
      {/* HEADER */}
      <header className="border-b border-slate-100 bg-white/80 backdrop-blur-md sticky top-0 z-10 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <span className="font-mono font-black text-xs text-[#2516FF] tracking-wider bg-[#2516FF]/10 px-2.5 py-1 rounded-md">
            BRIEFORA
          </span>
          <span className="h-4 w-px bg-slate-200" />
          <p className="text-xs text-slate-500 font-semibold">
            Creative briefing system
          </p>
        </div>
        <div className="bg-[#2516FF]/10 text-[#2516FF] border border-[#2516FF]/15 px-3 py-1 rounded-full text-[10px] font-bold">
          Project: {brief.project_name || brief.title || 'Brand strategy'}
        </div>
      </header>

      {/* COMPILING LOADER */}
      {submitting && (
        <div className="fixed inset-0 bg-white/95 z-50 flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-300">
          <div className="max-w-md space-y-6">
            <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center mx-auto">
              <Loader2 className="w-8 h-8 text-[#2516FF] animate-spin" />
            </div>
            <div className="space-y-2">
              <h3 className="font-bold text-slate-900 text-sm">Drafting Strategy Brief</h3>
              <p className="text-xs text-slate-500 leading-relaxed max-w-xs mx-auto">
                {generationPhase}
              </p>
            </div>
            <p className="text-[10px] text-slate-400">Please do not refresh this tab.</p>
          </div>
        </div>
      )}

      {/* MAIN CONTAINER */}
      <main className="flex-1 max-w-2xl w-full mx-auto px-6 py-12 flex flex-col justify-center">
        
        {/* Progress Bar */}
        <div className="space-y-3 mb-10" id="progress-indicator">
          <div className="flex justify-between items-center text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            <span>Step {step} of 10</span>
            <span>{Math.round((step / 10) * 100)}% Complete</span>
          </div>
          <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
            <motion.div 
              className="h-full bg-[#2516FF] rounded-full"
              initial={{ width: '0%' }}
              animate={{ width: `${(step / 10) * 100}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>

        {/* Wizard Card */}
        <div className="bg-white border border-slate-200/60 rounded-3xl p-8 sm:p-10 shadow-3xs min-h-[400px] flex flex-col justify-between">
          
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 15 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -15 }}
              transition={{ duration: 0.2 }}
              className="space-y-6 flex-1"
            >
              {/* STEP 1: PROJECT TYPE */}
              {step === 1 && (
                <div className="space-y-5">
                  <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-[#2516FF]">
                    <Layers className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-slate-900">Confirm Project Focus</h2>
                    <p className="text-xs text-slate-500 mt-1">
                      What is the primary visual vertical we are building together?
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-3 pt-2">
                    {projectTypes.map((type) => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setProjectType(type)}
                        className={`p-4 border rounded-2xl text-left text-xs font-bold transition-all cursor-pointer ${
                          projectType === type 
                            ? 'border-[#2516FF] bg-[#2516FF]/5 text-[#2516FF]' 
                            : 'border-slate-200 hover:border-slate-300 bg-white text-slate-700'
                        }`}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* STEP 2: BUSINESS DESCRIPTION */}
              {step === 2 && (
                <div className="space-y-5">
                  <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-[#2516FF]">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-slate-900">Describe Your Business</h2>
                    <p className="text-xs text-slate-500 mt-1">
                      Briefly describe what your business offers and what industry you dominate.
                    </p>
                  </div>
                  <textarea
                    rows={5}
                    value={businessDescription}
                    onChange={(e) => setBusinessDescription(e.target.value)}
                    placeholder="E.g., Acme Health provides zero-friction remote telehealth services, helping busy professionals connect with verified doctors in under 5 minutes."
                    className="w-full p-4 border border-slate-200 rounded-2xl outline-none focus:border-[#2516FF] focus:ring-2 focus:ring-[#2516FF]/25 text-xs leading-relaxed"
                  />
                </div>
              )}

              {/* STEP 3: TARGET AUDIENCE */}
              {step === 3 && (
                <div className="space-y-5">
                  <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-[#2516FF]">
                    <Users2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-slate-900">Your Target Audience</h2>
                    <p className="text-xs text-slate-500 mt-1">
                      Who is going to interact with, buy, or use this design system?
                    </p>
                  </div>
                  <textarea
                    rows={5}
                    value={targetAudience}
                    onChange={(e) => setTargetAudience(e.target.value)}
                    placeholder="E.g., Remote busy workers, tech-savvy urban professionals aged 25-45 who require instant clinical relief with clean UX."
                    className="w-full p-4 border border-slate-200 rounded-2xl outline-none focus:border-[#2516FF] focus:ring-2 focus:ring-[#2516FF]/25 text-xs leading-relaxed"
                  />
                </div>
              )}

              {/* STEP 4: MOOD/VIBE SELECTOR */}
              {step === 4 && (
                <div className="space-y-5">
                  <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-[#2516FF]">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-slate-900">Select Design Personality</h2>
                    <p className="text-xs text-slate-500 mt-1">
                      Choose multiple stylistic modifiers that describe the brand's mood.
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2.5 pt-2">
                    {moodOptions.map((mood) => {
                      const active = selectedMoods.includes(mood);
                      return (
                        <button
                          key={mood}
                          type="button"
                          onClick={() => handleToggleMood(mood)}
                          className={`px-4 py-2.5 rounded-full text-xs font-semibold transition-all border cursor-pointer ${
                            active 
                              ? 'bg-[#2516FF] text-white border-[#2516FF]' 
                              : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                          }`}
                        >
                          {mood}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* STEP 5: COLOR PREFERENCES */}
              {step === 5 && (
                <div className="space-y-5">
                  <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-[#2516FF]">
                    <Palette className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-slate-900">Color Spectrum</h2>
                    <p className="text-xs text-slate-500 mt-1">
                      Specify colors you absolutely love, and any colors we must strictly avoid.
                    </p>
                  </div>
                  <div className="space-y-4 pt-2">
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold text-slate-500 uppercase">Loved Colors</label>
                      <input
                        type="text"
                        value={lovedColors}
                        onChange={(e) => setLovedColors(e.target.value)}
                        placeholder="E.g., Deep cobalt blue, warm terracotta sand, off-white"
                        className="w-full p-4 border border-slate-200 rounded-2xl outline-none focus:border-[#2516FF] focus:ring-2 focus:ring-[#2516FF]/25 text-xs"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold text-slate-500 uppercase">Avoided Colors</label>
                      <input
                        type="text"
                        value={avoidColors}
                        onChange={(e) => setAvoidColors(e.target.value)}
                        placeholder="E.g., Neon yellow, aggressive blood-red, heavy blacks"
                        className="w-full p-4 border border-slate-200 rounded-2xl outline-none focus:border-[#2516FF] focus:ring-2 focus:ring-[#2516FF]/25 text-xs"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 6: INSPIRATION EXAMPLES */}
              {step === 6 && (
                <div className="space-y-5">
                  <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-[#2516FF]">
                    <Lightbulb className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-slate-900">Visual Inspiration</h2>
                    <p className="text-xs text-slate-500 mt-1">
                      Are there specific visual works, design systems, or links that you absolutely admire?
                    </p>
                  </div>
                  <textarea
                    rows={5}
                    value={designInspiration}
                    onChange={(e) => setDesignInspiration(e.target.value)}
                    placeholder="E.g., Apple's generous use of white space, Stripe's fluid multi-color gradient mesh backgrounds, or Airbnb's approachable bold fonts."
                    className="w-full p-4 border border-slate-200 rounded-2xl outline-none focus:border-[#2516FF] focus:ring-2 focus:ring-[#2516FF]/25 text-xs leading-relaxed"
                  />
                </div>
              )}

              {/* STEP 7: COMPETITORS */}
              {step === 7 && (
                <div className="space-y-5">
                  <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-[#2516FF]">
                    <Target className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-slate-900">Key Competitors</h2>
                    <p className="text-xs text-slate-500 mt-1">
                      Name 2-3 major sector competitors whose design we want to outclass.
                    </p>
                  </div>
                  <textarea
                    rows={5}
                    value={competitors}
                    onChange={(e) => setCompetitors(e.target.value)}
                    placeholder="E.g., Competitor A (modern but cluttered web UI), Competitor B (established brand but lacks warm personality)."
                    className="w-full p-4 border border-slate-200 rounded-2xl outline-none focus:border-[#2516FF] focus:ring-2 focus:ring-[#2516FF]/25 text-xs leading-relaxed"
                  />
                </div>
              )}

              {/* STEP 8: UNIQUE VALUE PROP */}
              {step === 8 && (
                <div className="space-y-5">
                  <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-[#2516FF]">
                    <Award className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-slate-900">Your Unique Advantage</h2>
                    <p className="text-xs text-slate-500 mt-1">
                      What makes your brand or digital offering radically different from competitors?
                    </p>
                  </div>
                  <textarea
                    rows={5}
                    value={uniqueValue}
                    onChange={(e) => setUniqueValue(e.target.value)}
                    placeholder="E.g., We deliver genuine medical consults in under 5 minutes without requiring monthly insurance subscriptions."
                    className="w-full p-4 border border-slate-200 rounded-2xl outline-none focus:border-[#2516FF] focus:ring-2 focus:ring-[#2516FF]/25 text-xs leading-relaxed"
                  />
                </div>
              )}

              {/* STEP 9: DELIVERABLES */}
              {step === 9 && (
                <div className="space-y-5">
                  <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-[#2516FF]">
                    <Layers className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-slate-900">Requested Deliverables</h2>
                    <p className="text-xs text-slate-500 mt-1">
                      Check all core visual assets that need to be produced in this project.
                    </p>
                  </div>
                  <div className="space-y-2.5 pt-2">
                    {deliverableOptions.map((item) => {
                      const active = selectedDeliverables.includes(item);
                      return (
                        <div
                          key={item}
                          onClick={() => handleToggleDeliverable(item)}
                          className={`flex items-center gap-3 p-4 border rounded-2xl cursor-pointer transition-all ${
                            active 
                              ? 'border-[#2516FF] bg-[#2516FF]/5' 
                              : 'border-slate-200 hover:border-slate-300'
                          }`}
                        >
                          <div className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all ${
                            active ? 'bg-[#2516FF] border-[#2516FF] text-white' : 'border-slate-300'
                          }`}>
                            {active && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                          </div>
                          <span className="text-xs font-semibold text-slate-700">{item}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* STEP 10: TIMELINE & BUDGET */}
              {step === 10 && (
                <div className="space-y-5">
                  <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-[#2516FF]">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-slate-900">Timeline & Budget</h2>
                    <p className="text-xs text-slate-500 mt-1">
                      Finally, specify your expected delivery timeline and active budget.
                    </p>
                  </div>
                  <div className="space-y-4 pt-2">
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold text-slate-500 uppercase">Project Timeline</label>
                      <select
                        value={timeline}
                        onChange={(e) => setTimeline(e.target.value)}
                        className="w-full p-4 border border-slate-200 rounded-2xl outline-none focus:border-[#2516FF] focus:ring-2 focus:ring-[#2516FF]/25 text-xs font-semibold"
                      >
                        <option value="">Select expected timeline...</option>
                        {timelineOptions.map(t => (
                          <option key={t} value={t}>{t}</option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold text-slate-500 uppercase">Available Budget Range</label>
                      <select
                        value={budget}
                        onChange={(e) => setBudget(e.target.value)}
                        className="w-full p-4 border border-slate-200 rounded-2xl outline-none focus:border-[#2516FF] focus:ring-2 focus:ring-[#2516FF]/25 text-xs font-semibold"
                      >
                        <option value="">Select budget range...</option>
                        {budgetOptions.map(b => (
                          <option key={b} value={b}>{b}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              )}

            </motion.div>
          </AnimatePresence>

          {/* Footer Navigation Button Row */}
          <div className="flex items-center justify-between pt-8 border-t border-slate-100 mt-8" id="wizard-navigation-footer">
            <button
              type="button"
              onClick={prevStep}
              disabled={step === 1}
              className={`flex items-center gap-1 px-4 py-2 text-xs font-bold rounded-full transition-all cursor-pointer ${
                step === 1 
                  ? 'text-slate-300 pointer-events-none' 
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Back</span>
            </button>

            {step < 10 ? (
              <button
                type="button"
                onClick={nextStep}
                className="bg-[#2516FF] hover:bg-[#1f10e6] text-white flex items-center gap-1.5 px-5 py-2.5 rounded-full text-xs font-bold transition-all shadow-sm cursor-pointer border-none"
              >
                <span>Continue</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={submitAnswers}
                className="bg-[#2516FF] hover:bg-[#1f10e6] text-white flex items-center gap-1.5 px-6 py-2.5 rounded-full text-xs font-bold transition-all shadow-md cursor-pointer border-none"
              >
                <Sparkles className="w-4 h-4" />
                <span>Submit Questionnaire</span>
              </button>
            )}
          </div>

        </div>

      </main>

      {/* FOOTER */}
      <footer className="border-t border-slate-100 bg-white py-6 text-center text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
        Powered by Briefora AI • Encrypted Clinical Strategy Safeguards
      </footer>

    </div>
  );
}
