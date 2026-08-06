import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { jsPDF } from 'jspdf';
import { 
  ArrowLeft, 
  Copy, 
  Trash2, 
  Calendar, 
  Building, 
  Tag, 
  Check, 
  AlertCircle, 
  Share2, 
  Download,
  Loader2,
  FileText,
  Clock,
  Sparkles,
  ExternalLink,
  QrCode,
  ListTodo,
  FileSpreadsheet,
  RefreshCw,
  Palette,
  Lightbulb,
  CheckCircle,
  TrendingUp,
  AlertOctagon
} from 'lucide-react';
import { supabase } from '../utils/supabase';
import { useAuth } from '../context/AuthContext';
import DashboardLayout from '../components/DashboardLayout';
import { getFallbackBriefs, deleteFallbackBrief, saveFallbackBrief } from '../utils/fallbackDb';

export default function BriefDetail() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [brief, setBrief] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [errorText, setErrorText] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedSection, setCopiedSection] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [regenerating, setRegenerating] = useState(false);

  // Active view tab for completed brief sections
  const [activeTab, setActiveTab] = useState<'all' | 'creative' | 'scope'>('all');

  const fetchBriefDetails = async () => {
    if (!id || !user?.id) return;
    try {
      setLoading(true);
      setErrorText(null);

      const { data, error } = await supabase
        .from('briefs')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (error) {
        console.warn('Supabase fetch brief detail warning (trying local fallback):', error);
        loadLocalFallback();
      } else if (!data) {
        loadLocalFallback();
      } else {
        setBrief(data);
      }
    } catch (err: any) {
      console.warn('Error fetching brief detail:', err);
      loadLocalFallback();
    } finally {
      setLoading(false);
    }
  };

  const loadLocalFallback = () => {
    const briefsList = getFallbackBriefs(user?.id || 'default');
    const found = briefsList.find(b => b.id === id);
    if (found) {
      const clientAnswers = {
        project_type: found.industry || 'Brand Identity',
        business_description: 'An outstanding business model in modern industry sector looking to position itself with premium design elements.',
        target_audience: 'Modern user persona profiles searching for responsive, visual, high-contrast layouts.',
        mood_vibes: ['Professional', 'Minimal & Clean', 'Luxury & Premium'],
        color_preferences: 'Cobalt Blue, Off-white, Onyx Dark Gray.',
        design_inspiration: 'Apple-inspired spacious typography, Stripe gradients.',
        competitors: 'Traditional market participants.',
        unique_value_proposition: 'High-speed medical or corporate services delivery.',
        deliverables: ['Logo & Visual Systems', 'Brand Guidelines Booklet'],
        timeline: 'Standard (3-4 Weeks)',
        budget: '$5,000 - $10,000'
      };

      const generatedBrief = {
        executive_summary: `${found.client_name} is launching a critical initiative to rebrand their core visual guidelines. Our strategic brief outlines positioning, direction, and milestones.`,
        project_overview: `Develop a comprehensive, high-contrast brand framework aligning deliverables.`,
        target_audience: `High-fidelity segments demanding rapid clinical and corporate execution.`,
        design_direction: `Minimal art direction with a deep geometric visual scheme.`,
        color_preferences: `Deep Indigo (#2516FF), Soft Gray (#F8FAFC), Charcoal Black.`,
        typography_suggestions: `Display: Playfair Display; Body: Inter / Plus Jakarta Sans.`,
        competitor_analysis: `Competitors lack elegant mobile layouts. Briefora fills the typographic gap.`,
        key_messages: `Sophistication, Speed, Trust`,
        deliverables: ['Full Brand Guidelines', 'UI/UX Visual Blueprint'],
        timeline: `Phased 3-week sprint`,
        budget: `Aesthetic-aligned budget bounds`,
        special_notes: `Any additional iterations out of the 2 specified rounds will be billed standard hourly.`
      };

      setBrief({
        id: found.id,
        project_name: found.title,
        title: found.title,
        client_name: found.client_name,
        project_type: found.industry || 'Brand Identity',
        status: found.status === 'Active' ? 'completed' : 'pending',
        client_link: found.id,
        client_answers: clientAnswers,
        generated_brief: brief?.generated_brief || generatedBrief,
        created_at: found.created_at
      });
    } else {
      setErrorText('This strategy brief request is unavailable or has been removed.');
    }
  };

  useEffect(() => {
    fetchBriefDetails();
  }, [id, user?.id]);

  const handleCopyClientLink = async () => {
    if (!brief?.client_link) return;
    try {
      const fullUrl = `${window.location.origin}/brief/${brief.client_link}`;
      await navigator.clipboard.writeText(fullUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    } catch (err) {
      console.error('Failed to copy client link:', err);
    }
  };

  const handleCopySection = async (title: string, text: string) => {
    try {
      await navigator.clipboard.writeText(`${title.toUpperCase()}\n\n${text}`);
      setCopiedSection(title);
      setTimeout(() => setCopiedSection(null), 2000);
    } catch (err) {
      console.error('Failed to copy section:', err);
    }
  };

  const handleDeleteBrief = async () => {
    if (!brief?.id) return;
    try {
      setDeleting(true);
      
      const { error } = await supabase
        .from('briefs')
        .delete()
        .eq('id', brief.id);

      if (error) {
        console.warn('Supabase delete failed:', error);
      }

      deleteFallbackBrief(user?.id || 'default', brief.id);
      navigate('/briefs');

    } catch (err) {
      console.error('Failed to delete brief:', err);
      deleteFallbackBrief(user?.id || 'default', brief?.id);
      navigate('/briefs');
    } finally {
      setDeleting(false);
    }
  };

  // Simulate on behalf of the client
  const handleSimulateClientSubmit = async () => {
    try {
      setRegenerating(true);
      setErrorText(null);

      const mockAnswers = {
        project_type: brief?.project_type || 'Brand Identity',
        business_description: `We are an innovative digital service provider for ${brief?.client_name}. We help users automate creative strategy workflows.`,
        target_audience: 'Modern creatives, busy digital agency planners, and freelancers.',
        mood_vibes: ['Professional', 'Luxury & Premium', 'Minimal & Clean'],
        color_preferences: 'Deep royal blue and pristine off-white.',
        design_inspiration: 'Sleek, luxury design guidelines.',
        competitors: 'Legacy manual document drafters.',
        unique_value_proposition: 'AI-assisted immediate brief translation.',
        deliverables: ['Logo & Iconography', 'Full Brand Guidelines Book'],
        timeline: 'ASAP (1-2 Weeks)',
        budget: '$3,000 - $5,000'
      };

      const response = await fetch('/api/generate-structured-brief', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          projectName: brief?.project_name || brief?.title || 'Creative Strategy Brand Design',
          projectType: brief?.project_type || 'Brand Identity',
          clientName: brief?.client_name || 'Valued Client',
          answers: mockAnswers
        })
      });

      if (!response.ok) {
        throw new Error('AI Compiler failed to compile simulation.');
      }

      const data = await response.json();
      const briefDetails = data.brief;

      try {
        await supabase
          .from('briefs')
          .update({
            client_answers: mockAnswers,
            generated_brief: briefDetails,
            status: 'completed',
            completed_at: new Date().toISOString()
          })
          .eq('id', brief.id);

        await supabase.rpc('decrement_credit');
      } catch (dbErr) {
        console.warn('Database write bypassed during simulation:', dbErr);
      }

      saveFallbackBrief(user?.id || 'default', {
        id: brief.id,
        title: brief.project_name || brief.title,
        client_name: brief.client_name,
        industry: brief.project_type,
        status: 'completed',
        content: `### Executive Summary\n${briefDetails.executive_summary}\n\n### Project Overview\n${briefDetails.project_overview}`
      });

      fetchBriefDetails();

    } catch (err: any) {
      console.error('Simulation error:', err);
      alert('Simulation failed. Please try again.');
    } finally {
      setRegenerating(false);
    }
  };

  const handleDownloadPDF = () => {
    if (!brief || !brief.generated_brief) return;

    const gBrief = brief.generated_brief;
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    const pageHeight = doc.internal.pageSize.getHeight();
    const pageWidth = doc.internal.pageSize.getWidth();
    let y = 30;

    const printText = (title: string, textContent: any, fontSize = 10, isHeader = false) => {
      if (!textContent) return;

      const margin = 20;
      const textWidth = pageWidth - (margin * 2);

      if (y > pageHeight - 35) {
        doc.addPage();
        y = 25;
      }

      if (isHeader) {
        doc.setFont('Helvetica', 'bold');
        doc.setFontSize(fontSize);
        doc.setTextColor(37, 22, 255);
        doc.text(title, margin, y);
        y += 6;
      } else {
        doc.setFont('Helvetica', 'normal');
        doc.setFontSize(fontSize);
        doc.setTextColor(30, 41, 59);

        const str = Array.isArray(textContent) ? textContent.map(t => `• ${t}`).join('\n') : String(textContent);
        const splitLines = doc.splitTextToSize(str, textWidth);
        
        splitLines.forEach((line: string) => {
          if (y > pageHeight - 20) {
            doc.addPage();
            y = 25;
          }
          doc.text(line, margin, y);
          y += 5.5;
        });
        y += 6;
      }
    };

    // PAGE 1: COVER
    doc.setFillColor(37, 22, 255);
    doc.rect(0, 0, 8, pageHeight, 'F');

    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(37, 22, 255);
    doc.text('B R I E F O R A', 25, 35);
    doc.setFontSize(10);
    doc.setTextColor(148, 163, 184);
    doc.text('AI-POWERED CREATIVE BRIEF', 25, 41);

    doc.setFontSize(26);
    doc.setTextColor(15, 23, 42);
    doc.text(brief.project_name || brief.title || 'Brand Strategy Campaign', 25, 90, { maxWidth: pageWidth - 50 });

    doc.setFontSize(12);
    doc.setFont('Helvetica', 'normal');
    doc.setTextColor(71, 85, 105);
    doc.text(`Strategic brief compiled for: ${brief.client_name}`, 25, 115);
    doc.text(`Design Project Vertical: ${brief.project_type || 'Visual Identity'}`, 25, 122);

    const dateStr = brief.created_at ? new Date(brief.created_at).toLocaleDateString() : new Date().toLocaleDateString();
    doc.setFontSize(9);
    doc.setTextColor(148, 163, 184);
    doc.text(`Created on: ${dateStr}`, 25, 250);
    doc.text('Confidential creative design deliverable. Unauthorized redistribution forbidden.', 25, 255);

    // PAGE 2: REPORT
    doc.addPage();
    doc.setFillColor(37, 22, 255);
    doc.rect(0, 0, 8, pageHeight, 'F');

    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(14);
    doc.setTextColor(15, 23, 42);
    doc.text('CREATIVE STRATEGY GUIDE', 20, 22);
    
    doc.setDrawColor(226, 232, 240);
    doc.line(20, 25, pageWidth - 20, 25);
    
    y = 35;

    printText('1. Executive Brand Summary', gBrief.executive_summary, 12, true);
    printText('', gBrief.executive_summary, 10, false);

    printText('2. Project Scope & Objectives', gBrief.project_overview, 12, true);
    printText('', gBrief.project_overview, 10, false);

    printText('3. Target Audience & Persona Profiles', gBrief.target_audience, 12, true);
    printText('', gBrief.target_audience, 10, false);

    printText('4. Art & Aesthetic Direction', gBrief.design_direction, 12, true);
    printText('', gBrief.design_direction, 10, false);

    printText('5. Color Guidelines', gBrief.color_preferences, 12, true);
    printText('', gBrief.color_preferences, 10, false);

    printText('6. Typography Suggestions', gBrief.typography_suggestions, 12, true);
    printText('', gBrief.typography_suggestions, 10, false);

    printText('7. Competitor Landscapes', gBrief.competitor_analysis, 12, true);
    printText('', gBrief.competitor_analysis, 10, false);

    printText('8. Key Slogans & Messaging Core', gBrief.key_messages, 12, true);
    printText('', gBrief.key_messages, 10, false);

    printText('9. Deliverable Items', gBrief.deliverables, 12, true);
    printText('', gBrief.deliverables, 10, false);

    printText('10. Expected Timeline Bounds', gBrief.timeline, 12, true);
    printText('', gBrief.timeline, 10, false);

    printText('11. Strategic Budget Allocation', gBrief.budget, 12, true);
    printText('', gBrief.budget, 10, false);

    printText('12. Scope Protection Safeguards', gBrief.special_notes, 12, true);
    printText('', gBrief.special_notes, 10, false);

    const pdfFilename = `${(brief.project_name || 'brief').toLowerCase().replace(/[^a-z0-9]+/g, '-')}-strategy.pdf`;
    doc.save(pdfFilename);
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="w-full h-full flex items-center justify-center bg-[#F8FAFC]">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="w-8 h-8 text-[#2516FF] animate-spin" />
            <p className="text-xs text-slate-500 font-semibold font-sans">Retrieving briefing record details...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (errorText || !brief) {
    return (
      <DashboardLayout>
        <div className="p-6 sm:p-8 max-w-2xl mx-auto space-y-6" id="detail-error">
          <div className="bg-rose-50 border border-rose-200 text-rose-800 p-6 rounded-2xl space-y-4">
            <div className="flex items-center gap-2.5">
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
              <h2 className="text-sm font-bold">Strategy Brief Unavailable</h2>
            </div>
            <p className="text-xs text-rose-600 leading-relaxed">
              {errorText || 'This strategy brief was removed or you lack active authorization.'}
            </p>
            <div className="pt-2">
              <Link
                to="/briefs"
                className="bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold px-4 py-2 rounded-xl transition-all inline-block"
              >
                Return to Briefs List
              </Link>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const isCompleted = brief.status === 'completed' || brief.status === 'Active';
  const clientLinkUrl = `${window.location.origin}/brief/${brief.client_link}`;

  return (
    <DashboardLayout>
      <div className="p-6 sm:p-8 space-y-8" id="brief-detail-view-container">
        
        {/* Navigation row */}
        <div className="flex items-center justify-between" id="detail-back-bar">
          <Link 
            to="/briefs"
            className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-slate-800 font-semibold cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Briefs</span>
          </Link>

          <div className="flex items-center gap-3">
            <button
              onClick={handleDeleteBrief}
              disabled={deleting}
              className="p-2 border border-slate-200 hover:border-rose-200 hover:bg-rose-50 rounded-xl text-slate-500 hover:text-rose-600 transition-all cursor-pointer"
              title="Delete Brief"
            >
              {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Title Meta Card */}
        <div className="bg-white border border-slate-200/60 rounded-3xl p-6 sm:p-8 shadow-3xs flex flex-col sm:flex-row justify-between sm:items-center gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] font-bold text-[#2516FF] bg-[#2516FF]/10 px-2.5 py-1 rounded-md tracking-wider uppercase font-mono">
                {brief.project_type || 'Brand Strategy'}
              </span>
              {isCompleted ? (
                <span className="bg-emerald-50 text-emerald-700 border border-emerald-150 text-[10px] font-bold px-2.5 py-0.5 rounded-full">
                  Brief Generated
                </span>
              ) : (
                <span className="bg-amber-50 text-amber-700 border border-amber-150 text-[10px] font-bold px-2.5 py-0.5 rounded-full">
                  Awaiting Client Input
                </span>
              )}
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              {brief.project_name || brief.title}
            </h1>
            <p className="text-xs text-slate-500 font-semibold">
              Client: <span className="text-slate-700 font-bold">{brief.client_name}</span>
            </p>
          </div>

          {isCompleted && (
            <button
              onClick={handleDownloadPDF}
              className="bg-linear-to-r from-[#2516FF] to-indigo-600 hover:from-indigo-600 hover:to-[#2516FF] text-white font-bold text-xs px-5 py-3 rounded-xl shadow-xs hover:shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer border-none"
            >
              <Download className="w-4 h-4" />
              <span>Download Strategy PDF</span>
            </button>
          )}
        </div>

        {/* IF PENDING: SHOW CLIENT MAGIC SHARING LINK CARD */}
        {!isCompleted ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" id="share-link-view">
            
            {/* Share Widget Panel */}
            <div className="lg:col-span-2 bg-white border border-slate-200/60 rounded-3xl p-6 sm:p-8 shadow-3xs space-y-5">
              <div className="space-y-1.5">
                <h3 className="font-bold text-slate-900 text-sm">Send Strategy Questionnaire</h3>
                <p className="text-[11px] text-slate-400 font-semibold leading-relaxed">
                  Provide this magic link to your client. It loads a 10-step high-fidelity client questionnaire. Once completed, Briefora AI compiles the brand design brief instantly.
                </p>
              </div>

              <div className="flex gap-2 p-2 border border-slate-100 rounded-2xl bg-slate-50">
                <input
                  type="text"
                  readOnly
                  value={clientLinkUrl}
                  className="flex-1 bg-transparent px-3 py-2 text-xs font-mono font-bold text-slate-700 outline-none truncate"
                />
                <button
                  type="button"
                  onClick={handleCopyClientLink}
                  className="bg-[#2516FF] hover:bg-[#1f10e6] text-white text-xs font-bold px-4 py-2 rounded-xl transition-all cursor-pointer border-none flex items-center gap-1 shrink-0"
                >
                  {copiedLink ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedLink ? 'Copied' : 'Copy'}</span>
                </button>
              </div>

              <div className="flex items-center gap-2 pt-4 border-t border-slate-50 text-[11px] text-slate-500">
                <Clock className="w-4 h-4 text-slate-400" />
                <span>Waiting for client submission to populate this strategy document.</span>
              </div>
            </div>

            {/* Quick Testing Options Cover */}
            <div className="bg-linear-to-b from-[#1E112C] to-[#12081C] text-white rounded-3xl p-6 sm:p-8 shadow-md flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <div className="w-10 h-10 rounded-xl bg-purple-550/15 flex items-center justify-center text-purple-400">
                  <RefreshCw className="w-5 h-5 animate-spin-slow" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-sm">Test AI Strategy Engine</h3>
                  <p className="text-[11px] text-purple-200 mt-1 leading-relaxed">
                    Don’t want to wait for the client? Simulate a premium medical/corporate questionnaire submission immediately to preview the elite AI generation.
                  </p>
                </div>
              </div>

              <button
                type="button"
                disabled={regenerating}
                onClick={handleSimulateClientSubmit}
                className="w-full bg-[#2516FF] hover:bg-[#1f10e6] text-white text-center font-bold text-xs py-3 rounded-xl block transition-all shadow-sm cursor-pointer border-none"
              >
                {regenerating ? 'Compiling AI Deliverables...' : 'Simulate Client Answers'}
              </button>
            </div>

          </div>
        ) : (
          /* IF COMPLETED: SHOW BEAUTIFUL GLASSMORPHIC DETAILED REPORT CARDS */
          <div className="space-y-6" id="generated-strategy-deck">
            
            {/* View Filter tabs */}
            <div className="flex border-b border-slate-200 gap-6">
              <button
                onClick={() => setActiveTab('all')}
                className={`pb-3 text-xs font-bold border-b-2 transition-all cursor-pointer ${
                  activeTab === 'all' ? 'border-[#2516FF] text-[#2516FF]' : 'border-transparent text-slate-400 hover:text-slate-700'
                }`}
              >
                Full Creative Deck
              </button>
              <button
                onClick={() => setActiveTab('creative')}
                className={`pb-3 text-xs font-bold border-b-2 transition-all cursor-pointer ${
                  activeTab === 'creative' ? 'border-[#2516FF] text-[#2516FF]' : 'border-transparent text-slate-400 hover:text-slate-700'
                }`}
              >
                Aesthetic & Design
              </button>
              <button
                onClick={() => setActiveTab('scope')}
                className={`pb-3 text-xs font-bold border-b-2 transition-all cursor-pointer ${
                  activeTab === 'scope' ? 'border-[#2516FF] text-[#2516FF]' : 'border-transparent text-slate-400 hover:text-slate-700'
                }`}
              >
                Timeline & Budget
              </button>
            </div>

            {/* Grid display of Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Executive Summary */}
              {(activeTab === 'all' || activeTab === 'creative') && (
                <div className="bg-white border border-slate-200/50 rounded-3xl p-6 sm:p-8 shadow-3xs flex flex-col justify-between hover:shadow-xs transition-shadow">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-50 pb-3">
                      <h4 className="font-bold text-slate-900 text-xs flex items-center gap-2">
                        <FileText className="w-4 h-4 text-[#2516FF]" />
                        <span>1. Executive Summary & Positioning</span>
                      </h4>
                      <button
                        onClick={() => handleCopySection('Executive Summary', brief.generated_brief.executive_summary)}
                        className="text-slate-400 hover:text-[#2516FF] transition-colors p-1"
                      >
                        {copiedSection === 'Executive Summary' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed font-semibold">
                      {brief.generated_brief.executive_summary}
                    </p>
                  </div>
                </div>
              )}

              {/* Project Scope */}
              {(activeTab === 'all' || activeTab === 'creative') && (
                <div className="bg-white border border-slate-200/50 rounded-3xl p-6 sm:p-8 shadow-3xs flex flex-col justify-between hover:shadow-xs transition-shadow">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-50 pb-3">
                      <h4 className="font-bold text-slate-900 text-xs flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-[#2516FF]" />
                        <span>2. Objectives & Project Scope</span>
                      </h4>
                      <button
                        onClick={() => handleCopySection('Project Objectives', brief.generated_brief.project_overview)}
                        className="text-slate-400 hover:text-[#2516FF] transition-colors p-1"
                      >
                        {copiedSection === 'Project Objectives' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed font-semibold">
                      {brief.generated_brief.project_overview}
                    </p>
                  </div>
                </div>
              )}

              {/* Target Audience */}
              {(activeTab === 'all' || activeTab === 'creative') && (
                <div className="bg-white border border-slate-200/50 rounded-3xl p-6 sm:p-8 shadow-3xs flex flex-col justify-between hover:shadow-xs transition-shadow">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-50 pb-3">
                      <h4 className="font-bold text-slate-900 text-xs flex items-center gap-2">
                        <QrCode className="w-4 h-4 text-[#2516FF]" />
                        <span>3. Target Audience & Personas</span>
                      </h4>
                      <button
                        onClick={() => handleCopySection('Target Audience', brief.generated_brief.target_audience)}
                        className="text-slate-400 hover:text-[#2516FF] transition-colors p-1"
                      >
                        {copiedSection === 'Target Audience' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed font-semibold">
                      {brief.generated_brief.target_audience}
                    </p>
                  </div>
                </div>
              )}

              {/* Design & Direction */}
              {(activeTab === 'all' || activeTab === 'creative') && (
                <div className="bg-white border border-slate-200/50 rounded-3xl p-6 sm:p-8 shadow-3xs flex flex-col justify-between hover:shadow-xs transition-shadow">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-50 pb-3">
                      <h4 className="font-bold text-slate-900 text-xs flex items-center gap-2">
                        <Lightbulb className="w-4 h-4 text-[#2516FF]" />
                        <span>4. Creative Art & Aesthetic Theme</span>
                      </h4>
                      <button
                        onClick={() => handleCopySection('Creative Direction', brief.generated_brief.design_direction)}
                        className="text-slate-400 hover:text-[#2516FF] transition-colors p-1"
                      >
                        {copiedSection === 'Creative Direction' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed font-semibold">
                      {brief.generated_brief.design_direction}
                    </p>
                  </div>
                </div>
              )}

              {/* Color Guidelines */}
              {(activeTab === 'all' || activeTab === 'creative') && (
                <div className="bg-white border border-slate-200/50 rounded-3xl p-6 sm:p-8 shadow-3xs flex flex-col justify-between hover:shadow-xs transition-shadow">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-50 pb-3">
                      <h4 className="font-bold text-slate-900 text-xs flex items-center gap-2">
                        <Palette className="w-4 h-4 text-[#2516FF]" />
                        <span>5. Color Scheme Recommendations</span>
                      </h4>
                      <button
                        onClick={() => handleCopySection('Color Spectrum', brief.generated_brief.color_preferences)}
                        className="text-slate-400 hover:text-[#2516FF] transition-colors p-1"
                      >
                        {copiedSection === 'Color Spectrum' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed font-semibold">
                      {brief.generated_brief.color_preferences}
                    </p>
                  </div>
                </div>
              )}

              {/* Typography Suggestions */}
              {(activeTab === 'all' || activeTab === 'creative') && (
                <div className="bg-white border border-slate-200/50 rounded-3xl p-6 sm:p-8 shadow-3xs flex flex-col justify-between hover:shadow-xs transition-shadow">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-50 pb-3">
                      <h4 className="font-bold text-slate-900 text-xs flex items-center gap-2">
                        <FileSpreadsheet className="w-4 h-4 text-[#2516FF]" />
                        <span>6. Typographic Guideline pairings</span>
                      </h4>
                      <button
                        onClick={() => handleCopySection('Typography Suggestion', brief.generated_brief.typography_suggestions)}
                        className="text-slate-400 hover:text-[#2516FF] transition-colors p-1"
                      >
                        {copiedSection === 'Typography Suggestion' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed font-semibold">
                      {brief.generated_brief.typography_suggestions}
                    </p>
                  </div>
                </div>
              )}

              {/* Timeline & Budget */}
              {(activeTab === 'all' || activeTab === 'scope') && (
                <div className="bg-white border border-slate-200/50 rounded-3xl p-6 sm:p-8 shadow-3xs flex flex-col justify-between hover:shadow-xs transition-shadow">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-50 pb-3">
                      <h4 className="font-bold text-slate-900 text-xs flex items-center gap-2">
                        <Clock className="w-4 h-4 text-[#2516FF]" />
                        <span>7. Project Timeline & Scheduling</span>
                      </h4>
                      <button
                        onClick={() => handleCopySection('Project Timeline', brief.generated_brief.timeline)}
                        className="text-slate-400 hover:text-[#2516FF] transition-colors p-1"
                      >
                        {copiedSection === 'Project Timeline' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed font-semibold">
                      {brief.generated_brief.timeline}
                    </p>
                  </div>
                </div>
              )}

              {/* Budget Allocation */}
              {(activeTab === 'all' || activeTab === 'scope') && (
                <div className="bg-white border border-slate-200/50 rounded-3xl p-6 sm:p-8 shadow-3xs flex flex-col justify-between hover:shadow-xs transition-shadow">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-50 pb-3">
                      <h4 className="font-bold text-slate-900 text-xs flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-[#2516FF]" />
                        <span>8. Tactical Budget Allocation</span>
                      </h4>
                      <button
                        onClick={() => handleCopySection('Tactical Budget', brief.generated_brief.budget)}
                        className="text-slate-400 hover:text-[#2516FF] transition-colors p-1"
                      >
                        {copiedSection === 'Tactical Budget' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed font-semibold">
                      {brief.generated_brief.budget}
                    </p>
                  </div>
                </div>
              )}

              {/* Out-Of-Scope Safeguards */}
              {(activeTab === 'all' || activeTab === 'scope') && (
                <div className="bg-white border border-slate-200/50 rounded-3xl p-6 sm:p-8 shadow-3xs flex flex-col justify-between hover:shadow-xs transition-shadow md:col-span-2">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-50 pb-3">
                      <h4 className="font-bold text-slate-900 text-xs flex items-center gap-2">
                        <AlertOctagon className="w-4 h-4 text-purple-600" />
                        <span>9. Special Notes & Scope Creep Protections</span>
                      </h4>
                      <button
                        onClick={() => handleCopySection('Special Guidelines', brief.generated_brief.special_notes)}
                        className="text-slate-400 hover:text-[#2516FF] transition-colors p-1"
                      >
                        {copiedSection === 'Special Guidelines' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed font-semibold">
                      {brief.generated_brief.special_notes}
                    </p>
                  </div>
                </div>
              )}

            </div>

          </div>
        )}

      </div>
    </DashboardLayout>
  );
}
