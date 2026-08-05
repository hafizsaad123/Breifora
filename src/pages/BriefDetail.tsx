import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import Markdown from 'react-markdown';
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
  Sparkles
} from 'lucide-react';
import { supabase } from '../utils/supabase';
import { useAuth } from '../context/AuthContext';
import DashboardLayout from '../components/DashboardLayout';
import { getFallbackBriefs, deleteFallbackBrief } from '../utils/fallbackDb';

export default function BriefDetail() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [brief, setBrief] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [errorText, setErrorText] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const fetchBriefDetails = async () => {
    if (!id || !user?.id) return;
    try {
      setLoading(true);
      setErrorText(null);

      const { data, error } = await supabase
        .from('briefs')
        .select('*')
        .eq('id', id)
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) {
        console.warn('Supabase fetch brief details warning (using local fallback):', error);
        const briefs = getFallbackBriefs(user.id);
        const localFound = briefs.find(b => b.id === id);
        if (localFound) {
          setBrief(localFound);
        } else {
          throw new Error('This strategic deliverable could not be found in local or remote registries.');
        }
      } else if (!data) {
        const briefs = getFallbackBriefs(user.id);
        const localFound = briefs.find(b => b.id === id);
        if (localFound) {
          setBrief(localFound);
        } else {
          throw new Error('This strategic deliverable could not be found or you do not have permission to view it.');
        }
      } else {
        setBrief(data);
      }
    } catch (err: any) {
      console.warn('Error fetching brief detail (using local fallback):', err);
      // Try local fallback as absolute last resort
      const briefs = getFallbackBriefs(user.id);
      const localFound = briefs.find(b => b.id === id);
      if (localFound) {
        setBrief(localFound);
      } else {
        setErrorText(err.message || 'Failed to fetch strategy brief details.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBriefDetails();
  }, [id, user?.id]);

  const handleCopy = async () => {
    if (!brief?.content) return;
    try {
      await navigator.clipboard.writeText(brief.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      console.error('Copy failed:', err);
    }
  };

  const handleDelete = async () => {
    if (!brief?.id) return;
    try {
      setDeleting(true);
      const { error } = await supabase
        .from('briefs')
        .delete()
        .eq('id', brief.id);

      if (error) {
        console.warn('Supabase delete brief detail warning (using local fallback):', error);
      }

      // Always delete local fallback
      deleteFallbackBrief(user.id, brief.id);
      navigate('/briefs');
    } catch (err: any) {
      console.warn('Delete brief failed (using local fallback):', err);
      deleteFallbackBrief(user.id, brief.id);
      navigate('/briefs');
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="w-full h-full flex items-center justify-center bg-[#F8FAFC]">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="w-8 h-8 text-[#2516FF] animate-spin" />
            <p className="text-xs text-slate-500 font-semibold">Retrieving strategic blueprint...</p>
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
              <h2 className="text-sm font-bold">Failed to load Strategy</h2>
            </div>
            <p className="text-xs text-rose-600 leading-relaxed">
              {errorText || 'This strategy brief is unavailable or has been removed.'}
            </p>
            <div className="pt-2">
              <Link
                to="/briefs"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-rose-700 hover:underline"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Return to AI Strategy Briefs</span>
              </Link>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-6 sm:p-8 max-w-5xl mx-auto space-y-8" id="brief-detail-view">

        {/* TOP NAVIGATION HEADER */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4" id="detail-top-nav">
          <Link
            to="/briefs"
            className="text-xs text-slate-500 hover:text-[#2516FF] font-bold flex items-center gap-1.5 group cursor-pointer self-start transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
            <span>Back to Strategy Briefs</span>
          </Link>

          {/* Action Row */}
          <div className="flex items-center gap-2.5" id="detail-action-buttons">
            {/* Copy To Clipboard Button */}
            <button
              id="copy-to-clipboard-btn"
              type="button"
              onClick={handleCopy}
              className={`flex items-center gap-1.5 text-xs font-bold px-4 py-2.5 rounded-xl border transition-all cursor-pointer ${
                copied 
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-700' 
                  : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Copied Strategy!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Strategy text</span>
                </>
              )}
            </button>

            {/* Delete Strategy Button */}
            <button
              id="delete-detail-btn"
              type="button"
              onClick={handleDelete}
              disabled={deleting}
              className="flex items-center gap-1.5 text-xs font-bold px-4 py-2.5 rounded-xl border border-rose-100 bg-rose-50 text-rose-700 hover:bg-rose-100/70 transition-all cursor-pointer disabled:opacity-50"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>{deleting ? 'Deleting...' : 'Delete strategy'}</span>
            </button>
          </div>
        </div>

        {/* STRATEGIC TITLE BLOCK HERO */}
        <div className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 shadow-2xs space-y-6" id="title-block-hero">
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="text-[10px] font-black tracking-wider text-[#2516FF] bg-[#2516FF]/15 px-3 py-1 rounded-md uppercase font-mono">
              {brief.industry || 'Market Verticals'}
            </span>
            <span className="px-2.5 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-150 text-[10px] font-bold rounded-md">
              {brief.status || 'Active'}
            </span>
            <span className="flex items-center gap-1 text-[11px] text-slate-400 font-semibold ml-auto">
              <Clock className="w-3.5 h-3.5" />
              Compiled on {new Date(brief.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
            </span>
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-tight">
              {brief.title || 'Brand Strategy Blueprint'}
            </h1>
            <div className="flex flex-wrap items-center gap-6 pt-2 text-xs text-slate-500 font-semibold">
              <div className="flex items-center gap-1.5">
                <Building className="w-4 h-4 text-slate-400" />
                <span>Client Profile:</span>
                <span className="text-slate-800 font-bold">{brief.client_name || 'N/A'}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Tag className="w-4 h-4 text-slate-400" />
                <span>Industry Sector:</span>
                <span className="text-slate-800 font-bold">{brief.industry || 'N/A'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* STRATEGY DELIVERABLE CONTENT BODY */}
        <div className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-10 shadow-2xs space-y-6" id="content-body-block">
          
          <div className="border-b border-slate-100 pb-5 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#2516FF]" />
                Interactive Brand Strategic Brief
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">High-fidelity agency grade deliverables compiled via Gemini models.</p>
            </div>
            
            <button
              id="copy-floating-btn"
              type="button"
              onClick={handleCopy}
              className="text-slate-400 hover:text-[#2516FF] p-2 rounded-lg bg-slate-50 hover:bg-slate-100 transition-all border border-slate-100 cursor-pointer"
              title="Copy strategy details"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>

          {/* Render markdown using react-markdown with custom elegant formatting classes */}
          <div className="markdown-body text-slate-800 text-xs sm:text-sm leading-relaxed space-y-6 select-text" id="strategy-brief-rendered-markdown">
            <Markdown 
              components={{
                h1: ({node, ...props}) => <h1 className="text-base sm:text-lg font-black text-slate-900 border-b border-slate-100 pb-2 mt-8 mb-4 tracking-tight uppercase" {...props} />,
                h2: ({node, ...props}) => <h2 className="text-sm sm:text-base font-bold text-slate-900 mt-6 mb-3 tracking-tight" {...props} />,
                h3: ({node, ...props}) => <h3 className="text-xs sm:text-sm font-bold text-slate-800 mt-5 mb-2" {...props} />,
                p: ({node, ...props}) => <p className="mb-4 text-slate-650 leading-relaxed" {...props} />,
                ul: ({node, ...props}) => <ul className="list-disc pl-5 mb-5 space-y-2 text-slate-650" {...props} />,
                ol: ({node, ...props}) => <ol className="list-decimal pl-5 mb-5 space-y-2 text-slate-650" {...props} />,
                li: ({node, ...props}) => <li className="pl-1" {...props} />,
                blockquote: ({node, ...props}) => <blockquote className="border-l-4 border-[#2516FF]/40 bg-[#2516FF]/5 p-4 rounded-r-xl italic my-4 text-slate-700" {...props} />,
                strong: ({node, ...props}) => <strong className="font-bold text-slate-900" {...props} />,
                code: ({node, ...props}) => <code className="bg-slate-100 px-1.5 py-0.5 rounded-md font-mono text-[11px] text-[#2516FF]" {...props} />
              }}
            >
              {brief.content}
            </Markdown>
          </div>
        </div>

      </div>
    </DashboardLayout>
  );
}
