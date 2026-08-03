import { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ChevronLeft, FileText } from 'lucide-react';
import { useAppSettings } from '../context/AppSettingsContext';
import Logo from '../components/ui/Logo';

export default function TermsOfService() {
  const navigate = useNavigate();
  const { settings } = useAppSettings();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="w-full min-h-screen bg-[#FAFAFC] font-sans antialiased text-slate-850">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-slate-200/60 py-4 px-6">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-slate-200 bg-white text-slate-600 hover:text-slate-900 hover:border-slate-300 text-xs font-semibold transition-all shadow-xs cursor-pointer focus:outline-none"
            >
              <ChevronLeft className="w-4 h-4" /> Back
            </button>
            <div className="h-4 w-px bg-slate-200 hidden sm:block"></div>
            <Link to="/" className="flex items-center gap-2">
              <Logo iconSize={24} />
            </Link>
          </div>
          <Link
            to="/signup"
            className="bg-[#2516FF] hover:bg-[#1d11cc] text-white text-xs font-semibold px-4 py-2 rounded-full transition-all shadow-sm"
          >
            Start for free
          </Link>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-3xl mx-auto px-6 py-12 sm:py-16">
        <div className="bg-white border border-slate-200/80 rounded-[24px] sm:rounded-[32px] p-6 sm:p-10 md:p-12 shadow-md shadow-slate-100/40 relative overflow-hidden">
          {/* Subtle Decorative Elements */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-[#2516FF]" />
          
          {/* Heading */}
          <div className="space-y-4 mb-8 pb-6 border-b border-slate-100">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#2516FF]/5 text-[#2516FF] text-[11px] font-bold tracking-wider uppercase">
              <FileText className="w-3.5 h-3.5" /> Legal Center
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight leading-none">
              Terms of Service
            </h1>
          </div>

          {/* Dynamic Content (Supports HTML from Admin) */}
          <div 
            className="prose prose-slate prose-sm sm:prose max-w-none text-slate-600 leading-relaxed space-y-6 break-words overflow-hidden
              [&>h2]:text-lg [&>h2]:sm:text-xl [&>h2]:font-bold [&>h2]:text-slate-900 [&>h2]:tracking-tight [&>h2]:mt-8 [&>h2]:mb-3
              [&>p]:text-sm [&>p]:sm:text-base [&>p]:text-slate-600 [&>p]:leading-relaxed
              [&>ul]:list-disc [&>ul]:pl-5 [&>ul]:space-y-2 [&>ul]:text-sm [&>ul]:sm:text-base [&>ul]:text-slate-600
              [&>ol]:list-decimal [&>ol]:pl-5 [&>ol]:space-y-2 [&>ol]:text-sm [&>ol]:sm:text-base [&>ol]:text-slate-600
              [&>h1]:hidden"
            dangerouslySetInnerHTML={{ __html: settings.terms_of_service }}
          />
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200/80 py-8 text-center text-xs text-slate-400 font-medium">
        <p>&copy; {new Date().getFullYear()} Briefora. All rights reserved.</p>
      </footer>
    </div>
  );
}
