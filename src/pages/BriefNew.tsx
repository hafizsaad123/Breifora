import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { 
  Sparkles, 
  ArrowLeft, 
  Loader2, 
  FileText, 
  Building, 
  Tag, 
  Mail, 
  MessageSquare,
  Check,
  Copy,
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import { supabase } from '../utils/supabase';
import { useAuth } from '../context/AuthContext';
import DashboardLayout from '../components/DashboardLayout';
import { saveFallbackBrief } from '../utils/fallbackDb';

export default function BriefNew() {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Form states
  const [projectName, setProjectName] = useState('');
  const [projectType, setProjectType] = useState('Brand Identity');
  const [clientName, setClientName] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [clientNotes, setClientNotes] = useState('');

  // Statuses
  const [submitting, setSubmitting] = useState(false);
  const [errorText, setErrorText] = useState<string | null>(null);

  const projectTypes = [
    'Logo Design', 'Website Design', 'App UI', 'Brand Identity', 
    'Social Media', 'Packaging', 'Illustration', 'Other'
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectName.trim() || !clientName.trim()) {
      setErrorText('Please enter both Project Name and Client Name to proceed.');
      return;
    }

    try {
      setSubmitting(true);
      setErrorText(null);

      // Generate a unique client link slug
      const slugSafeName = clientName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');
      const randomId = Math.floor(1000 + Math.random() * 9000);
      const clientLinkSlug = `${slugSafeName}-${randomId}`;

      const newBriefRow = {
        id: crypto.randomUUID ? crypto.randomUUID() : `brf-${Date.now()}`,
        designer_id: user?.id,
        user_id: user?.id, // keep both for compatibility
        project_name: projectName.trim(),
        title: projectName.trim(), // keep both for compatibility
        project_type: projectType,
        client_name: clientName.trim(),
        client_email: clientEmail.trim() || null,
        client_link: clientLinkSlug,
        status: 'pending',
        client_answers: null,
        generated_brief: null,
        created_at: new Date().toISOString()
      };

      // 1. Insert into Supabase briefs table
      let dbErrorOccurred = false;
      try {
        const { error: insertErr } = await supabase
          .from('briefs')
          .insert(newBriefRow);

        if (insertErr) {
          console.warn('Supabase briefs insert failed, falling back to local storage:', insertErr);
          dbErrorOccurred = true;
        }
      } catch (dbErr) {
        console.warn('Supabase briefs insert exception:', dbErr);
        dbErrorOccurred = true;
      }

      // 2. Always persist to local fallback DB so it's resilient
      saveFallbackBrief(user?.id || 'default', {
        id: newBriefRow.id,
        title: newBriefRow.project_name,
        client_name: newBriefRow.client_name,
        industry: newBriefRow.project_type,
        status: 'pending',
        content: `### Strategy Pending\nShare the public questionnaire link with ${newBriefRow.client_name} to generate this brief automatically.`
      });

      // Keep client link in local storage mapped to ID for lookup
      localStorage.setItem(`brief_client_link_${newBriefRow.id}`, clientLinkSlug);

      // Redirect designer to view the detail and share the link
      navigate(`/briefs/${newBriefRow.id}`);

    } catch (err: any) {
      console.error('Error creating new strategy briefing request:', err);
      setErrorText(err.message || 'An unexpected error occurred. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="p-6 sm:p-8 max-w-2xl mx-auto space-y-6" id="new-brief-form-container">
        
        {/* Back Link */}
        <Link 
          to="/dashboard"
          className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-slate-800 font-semibold cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to dashboard</span>
        </Link>

        {/* Title */}
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">Create Questionnaire Link</h1>
          <p className="text-xs text-slate-500 mt-1">
            Specify the project parameters. Briefora will generate an elegant multi-step client questionnaire link for you to share.
          </p>
        </div>

        {/* Form Box */}
        <form onSubmit={handleSubmit} className="bg-white border border-slate-200/60 rounded-3xl p-6 sm:p-8 shadow-3xs space-y-5">
          
          {errorText && (
            <div className="bg-rose-50 border border-rose-200 text-rose-800 p-4 rounded-xl text-xs font-semibold flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
              <span>{errorText}</span>
            </div>
          )}

          {/* Project Name */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
              <FileText className="w-3.5 h-3.5 text-slate-400" />
              <span>Project / Campaign Name</span>
            </label>
            <input
              type="text"
              required
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              placeholder="E.g., Acme Health Web Rebrand"
              className="w-full p-4 border border-slate-200 rounded-2xl outline-none focus:border-[#2516FF] focus:ring-2 focus:ring-[#2516FF]/25 text-xs font-semibold"
            />
          </div>

          {/* Grid fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Project Type */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                <Tag className="w-3.5 h-3.5 text-slate-400" />
                <span>Project Type</span>
              </label>
              <select
                value={projectType}
                onChange={(e) => setProjectType(e.target.value)}
                className="w-full p-4 border border-slate-200 rounded-2xl outline-none focus:border-[#2516FF] focus:ring-2 focus:ring-[#2516FF]/25 text-xs font-semibold"
              >
                {projectTypes.map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>

            {/* Client Name */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                <Building className="w-3.5 h-3.5 text-slate-400" />
                <span>Client Business Name</span>
              </label>
              <input
                type="text"
                required
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                placeholder="E.g., Acme Health Inc."
                className="w-full p-4 border border-slate-200 rounded-2xl outline-none focus:border-[#2516FF] focus:ring-2 focus:ring-[#2516FF]/25 text-xs font-semibold"
              />
            </div>

          </div>

          {/* Client Email (Optional) */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
              <Mail className="w-3.5 h-3.5 text-slate-400" />
              <span>Client Email Address <span className="text-slate-400 font-normal">(Optional)</span></span>
            </label>
            <input
              type="email"
              value={clientEmail}
              onChange={(e) => setClientEmail(e.target.value)}
              placeholder="E.g., primary-contact@acmehealth.com"
              className="w-full p-4 border border-slate-200 rounded-2xl outline-none focus:border-[#2516FF] focus:ring-2 focus:ring-[#2516FF]/25 text-xs font-semibold"
            />
          </div>

          {/* Client Notes */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
              <MessageSquare className="w-3.5 h-3.5 text-slate-400" />
              <span>Personal Note for Client <span className="text-slate-400 font-normal">(Optional)</span></span>
            </label>
            <textarea
              rows={3}
              value={clientNotes}
              onChange={(e) => setClientNotes(e.target.value)}
              placeholder="E.g., Hi team! Please fill out this quick design strategy questionnaire to align our aesthetic targets."
              className="w-full p-4 border border-slate-200 rounded-2xl outline-none focus:border-[#2516FF] focus:ring-2 focus:ring-[#2516FF]/25 text-xs leading-relaxed"
            />
          </div>

          {/* Submit Button */}
          <div className="pt-4 border-t border-slate-100 flex justify-end">
            <button
              type="submit"
              disabled={submitting}
              className="bg-[#2516FF] hover:bg-[#1f10e6] text-white flex items-center gap-1.5 px-6 py-3 rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer border-none"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Creating Client Workspace...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Generate Questionnaire Link</span>
                </>
              )}
            </button>
          </div>

        </form>

      </div>
    </DashboardLayout>
  );
}
