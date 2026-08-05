import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  FileText, 
  Trash2, 
  Plus, 
  Search, 
  Sparkles, 
  AlertCircle, 
  CheckCircle, 
  ArrowRight,
  FolderOpen,
  Calendar,
  Building,
  Check,
  ChevronRight,
  Wand2
} from 'lucide-react';
import { supabase } from '../utils/supabase';
import { useAuth } from '../context/AuthContext';
import DashboardLayout from '../components/DashboardLayout';
import { getFallbackBriefs, deleteFallbackBrief } from '../utils/fallbackDb';

export default function BriefsList() {
  const { user, searchQuery, setSearchQuery } = useAuth();
  const navigate = useNavigate();

  const [briefs, setBriefs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchBriefs = async () => {
    if (!user?.id) return;
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('briefs')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.warn('Supabase fetch briefs warning (using local fallback):', error);
        setBriefs(getFallbackBriefs(user.id));
      } else {
        setBriefs(data || getFallbackBriefs(user.id));
      }
    } catch (err: any) {
      console.warn('Error fetching briefs (using local fallback):', err);
      setBriefs(getFallbackBriefs(user.id));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBriefs();
  }, [user?.id]);

  const showToast = (type: 'success' | 'error', text: string) => {
    setToastMessage({ type, text });
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  const handleDeleteBrief = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Avoid navigating to details
    try {
      setDeletingId(id);
      const { error } = await supabase
        .from('briefs')
        .delete()
        .eq('id', id);

      if (error) {
        console.warn('Supabase delete brief warning (using local fallback):', error);
      }

      // Always update local fallback
      deleteFallbackBrief(user.id, id);
      setBriefs(prev => prev.filter(b => b.id !== id));
      showToast('success', 'Strategy brief was deleted successfully.');
    } catch (err: any) {
      console.warn('Error deleting brief (using local fallback):', err);
      deleteFallbackBrief(user.id, id);
      setBriefs(prev => prev.filter(b => b.id !== id));
      showToast('success', 'Strategy brief was deleted successfully (offline mode).');
    } finally {
      setDeletingId(null);
    }
  };

  const filteredBriefs = briefs.filter(brief => {
    const query = searchQuery.toLowerCase();
    return (
      (brief.title || '').toLowerCase().includes(query) ||
      (brief.client_name || '').toLowerCase().includes(query) ||
      (brief.industry || '').toLowerCase().includes(query)
    );
  });

  return (
    <DashboardLayout>
      <div className="p-6 sm:p-8 space-y-6" id="briefs-list-view">

        {/* Dynamic Toast Alerts */}
        <AnimatePresence>
          {toastMessage && (
            <motion.div
              id="list-toast"
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              className={`fixed top-6 right-6 z-50 p-4 rounded-2xl shadow-xl border flex items-start gap-3 max-w-sm ${
                toastMessage.type === 'success' 
                  ? 'bg-emerald-50 border-emerald-150 text-emerald-800' 
                  : 'bg-rose-50 border-rose-150 text-rose-800'
              }`}
            >
              {toastMessage.type === 'success' ? (
                <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              )}
              <div className="flex-1">
                <p className="text-xs font-bold capitalize">{toastMessage.type} Action</p>
                <p className="text-[11px] mt-0.5">{toastMessage.text}</p>
              </div>
              <button 
                type="button" 
                onClick={() => setToastMessage(null)}
                className="text-xs font-bold cursor-pointer hover:underline border-none bg-transparent self-start"
              >
                Close
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* HEADER ROW */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4" id="list-header">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">AI Strategy Briefs</h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Browse, manage, and share your generated professional agency deliverables.
            </p>
          </div>

          <Link
            id="new-brief-btn-list"
            to="/briefs/new"
            className="bg-[#2516FF] hover:bg-[#1f10e6] text-white font-bold text-xs px-5 py-3 rounded-full shadow-md flex items-center justify-center gap-1.5 transition-all cursor-pointer self-start sm:self-auto shrink-0 border-none"
          >
            <Plus className="w-4 h-4" />
            <span>Generate Strategy Brief</span>
          </Link>
        </div>

        {/* SEARCH BAR PANEL */}
        {briefs.length > 0 && (
          <div className="relative w-full max-w-md" id="search-input-container">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              id="search-briefs-input"
              type="text"
              placeholder="Search by title, client, or industry..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 rounded-2xl border border-slate-200 bg-white text-xs font-semibold focus:outline-none focus:border-[#2516FF] focus:ring-1 focus:ring-[#2516FF]/20 transition-all placeholder:text-slate-400"
            />
          </div>
        )}

        {/* MAIN RESULTS AREA */}
        {loading ? (
          <div className="py-24 flex flex-col items-center justify-center gap-3">
            <div className="w-8 h-8 rounded-full border-2 border-slate-200 border-t-[#2516FF] animate-spin" />
            <p className="text-xs text-slate-400 font-semibold">Retrieving briefs from Supabase...</p>
          </div>
        ) : briefs.length === 0 ? (
          /* Empty State */
          <div id="list-empty-state" className="bg-white border border-slate-200 rounded-3xl p-8 sm:p-16 text-center max-w-lg mx-auto space-y-5 my-8">
            <div className="w-14 h-14 rounded-full bg-slate-50 flex items-center justify-center mx-auto text-slate-400">
              <FolderOpen className="w-7 h-7" />
            </div>
            <div className="space-y-1.5">
              <h3 className="text-base font-black text-slate-800">No strategy briefs compile history</h3>
              <p className="text-xs text-slate-500 leading-relaxed max-w-xs mx-auto">
                Formulate powerful branding direction, visual systems, and timelined user flow roadmaps instantly.
              </p>
            </div>
            <Link
              id="empty-state-create-btn"
              to="/briefs/new"
              className="inline-flex items-center gap-1.5 bg-[#2516FF] hover:bg-[#1f10e6] text-white font-bold text-xs px-5 py-2.5 rounded-full transition-all shadow-sm cursor-pointer border-none"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Generate Brief</span>
            </Link>
          </div>
        ) : filteredBriefs.length === 0 ? (
          /* Search Empty State */
          <div className="text-center py-16 bg-slate-50 border border-slate-200 rounded-2xl" id="search-empty">
            <p className="text-slate-500 text-xs font-semibold">No results found for "{searchQuery}"</p>
            <button 
              type="button"
              onClick={() => setSearchQuery('')}
              className="text-[#2516FF] text-xs font-bold mt-2 cursor-pointer border-none bg-transparent hover:underline"
            >
              Clear Search Query
            </button>
          </div>
        ) : (
          /* Dynamic Grid of Brief Cards */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5" id="briefs-grid">
            {filteredBriefs.map((brief) => (
              <div
                key={brief.id}
                id={`brief-card-${brief.id}`}
                onClick={() => navigate(`/briefs/${brief.id}`)}
                className="bg-white border border-slate-200/90 rounded-2xl p-5 hover:border-blue-200 transition-all flex flex-col justify-between hover:shadow-md cursor-pointer group relative shadow-3xs"
              >
                <div className="space-y-4">
                  {/* Badge & Action Header */}
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[9px] font-black tracking-wider text-[#2516FF] bg-[#2516FF]/10 px-2.5 py-1 rounded-md uppercase font-mono truncate max-w-[120px]">
                      {brief.industry || 'Industry'}
                    </span>
                    
                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-150 text-[9px] font-bold rounded-md">
                        {brief.status || 'Active'}
                      </span>
                      
                      {/* Delete Trigger Button */}
                      <button
                        id={`delete-btn-${brief.id}`}
                        type="button"
                        onClick={(e) => handleDeleteBrief(brief.id, e)}
                        disabled={deletingId === brief.id}
                        className="w-7 h-7 rounded-lg bg-slate-50 hover:bg-rose-50 text-slate-400 hover:text-rose-600 flex items-center justify-center cursor-pointer border border-slate-100 transition-colors disabled:opacity-50"
                        title="Delete Brief"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Info Core */}
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm group-hover:text-[#2516FF] transition-colors line-clamp-1">
                      {brief.title || 'Brand Strategy Plan'}
                    </h3>
                    <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-2 font-semibold">
                      <Building className="w-3.5 h-3.5 text-slate-400" />
                      <span>Client:</span>
                      <span className="text-slate-700 truncate font-bold">{brief.client_name || 'N/A'}</span>
                    </div>
                  </div>
                </div>

                {/* Footer bar */}
                <div className="border-t border-slate-100/80 pt-4 mt-5 flex items-center justify-between text-[11px] text-slate-400 font-semibold shrink-0">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-slate-350" />
                    <span>
                      {brief.created_at ? new Date(brief.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : 'Recently'}
                    </span>
                  </div>
                  
                  <span className="text-[#2516FF] font-bold flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                    <span>View Brief</span>
                    <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </DashboardLayout>
  );
}
