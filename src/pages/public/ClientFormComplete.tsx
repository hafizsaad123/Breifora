import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { CheckCircle2, FileText, ArrowRight, Star, ExternalLink, RefreshCw } from 'lucide-react';

export default function ClientFormComplete() {
  const { id } = useParams<{ id: string }>();

  return (
    <div className="min-h-screen bg-[#FDFDFD] text-slate-800 font-sans flex flex-col justify-between" id="client-complete-layout">
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
      </header>

      {/* MAIN SUCCESS BODY */}
      <main className="flex-1 max-w-md w-full mx-auto px-6 py-12 flex flex-col justify-center text-center">
        <div className="bg-white border border-slate-200/60 rounded-3xl p-8 sm:p-10 shadow-3xs space-y-6">
          <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <h1 className="text-lg font-bold text-slate-900">Questionnaire Submitted!</h1>
            <p className="text-xs text-slate-500 leading-relaxed">
              Your detailed brand insights have been captured. Briefora’s AI strategy compiler is translating your responses into structured design briefs, typographic suggestions, and color palettes.
            </p>
          </div>

          <div className="border border-slate-100 rounded-2xl p-4 bg-slate-50/50 space-y-3 text-left">
            <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">What happens next?</h3>
            <ul className="space-y-2.5 text-xs text-slate-600">
              <li className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-[#2516FF] mt-1.5 shrink-0" />
                <span>Your designer will review the compiled AI creative brief.</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-[#2516FF] mt-1.5 shrink-0" />
                <span>The design team aligns mood-board vibe directions and asset deliverables.</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-[#2516FF] mt-1.5 shrink-0" />
                <span>Active design drafting starts on your confirmed parameters.</span>
              </li>
            </ul>
          </div>

          <div className="pt-2 text-center text-[10px] text-slate-400 font-semibold">
            You can close this tab now. Thank you!
          </div>
        </div>
      </main>

      {/* FOOTER */}
      <footer className="border-t border-slate-100 bg-white py-6 text-center text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
        Powered by Briefora AI • Client Strategy Portal
      </footer>
    </div>
  );
}
