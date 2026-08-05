import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { 
  FileText, 
  Plus, 
  TrendingUp, 
  Wand2, 
  ArrowRight,
  Sparkles,
  AlertCircle,
  HelpCircle,
  Zap,
  FolderOpen,
  Search
} from 'lucide-react';
import { supabase } from '../utils/supabase';
import { useAuth } from '../context/AuthContext';
import DashboardLayout from '../components/DashboardLayout';
import { getFallbackProfile, getFallbackBriefs } from '../utils/fallbackDb';

export default function Dashboard() {
  const { user, searchQuery } = useAuth();
  const navigate = useNavigate();

  const [profile, setProfile] = useState<any>(null);
  const [briefs, setBriefs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const loadDashboardData = async () => {
    if (!user?.id) return;
    try {
      setLoading(true);
      setErrorMessage(null);

      // 1. Fetch profiles table to read workspace_name and free_credits
      let profileData = null;
      try {
        const { data, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .maybeSingle();

        if (profileError) {
          console.warn('Supabase profile fetch warning (using local fallback):', profileError);
          profileData = getFallbackProfile(user.id);
        } else {
          profileData = data || getFallbackProfile(user.id);
        }
      } catch (e) {
        console.warn('Supabase profile exception (using local fallback):', e);
        profileData = getFallbackProfile(user.id);
      }
      setProfile(profileData);

      // 2. Fetch all briefs where user_id matches the active session user
      let briefsData = [];
      try {
        const { data, error: briefsError } = await supabase
          .from('briefs')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (briefsError) {
          console.warn('Supabase briefs fetch warning (using local fallback):', briefsError);
          briefsData = getFallbackBriefs(user.id);
        } else {
          briefsData = data || getFallbackBriefs(user.id);
        }
      } catch (e) {
        console.warn('Supabase briefs exception (using local fallback):', e);
        briefsData = getFallbackBriefs(user.id);
      }
      setBriefs(briefsData || []);

    } catch (err: any) {
      console.warn('Error loading dashboard data (using local fallback):', err);
      // Fail-safe default states
      setProfile(getFallbackProfile(user.id));
      setBriefs(getFallbackBriefs(user.id));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, [user?.id]);

  // Handle toast close
  const dismissError = () => setErrorMessage(null);

  const fullName = profile?.full_name || user?.name || 'Saad';
  const workspaceName = profile?.workspace_name || 'My Strategy Hub';
  const freeCredits = profile?.free_credits !== undefined ? profile.free_credits : 0;

  // Filter briefs based on global search query
  const filteredBriefs = briefs.filter((brief) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    const titleMatch = brief.title?.toLowerCase().includes(query);
    const clientMatch = brief.client_name?.toLowerCase().includes(query);
    return titleMatch || clientMatch;
  });

  const totalBriefsCount = briefs.length;
  const filteredCount = filteredBriefs.length;

  // Get top 3 most recent entries of filtered list
  const recentBriefs = filteredBriefs.slice(0, 3);

  return (
    <DashboardLayout>
      <div className="p-6 sm:p-8 space-y-8" id="dashboard-content-area">
        
        {/* Error Toast Notification */}
        {errorMessage && (
          <div id="error-toast" className="bg-rose-50 border border-rose-200 text-rose-800 p-4 rounded-2xl flex items-start gap-3 shadow-sm animate-in fade-in slide-in-from-top-3">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-xs font-bold">Transaction Failed</p>
              <p className="text-[11px] text-rose-600 mt-0.5">{errorMessage}</p>
            </div>
            <button 
              type="button" 
              onClick={dismissError} 
              className="text-rose-450 hover:text-rose-750 text-xs font-bold uppercase tracking-wider cursor-pointer bg-transparent border-none"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* GREETING & ACTION BUTTON ROW */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4" id="greeting-row">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              Welcome back, {fullName} 👋
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Here is what is happening with <span className="font-bold text-slate-700">{workspaceName}</span> today.
            </p>
          </div>

          <Link
            id="new-brief-btn-top"
            to="/briefs/new"
            className="bg-[#2516FF] hover:bg-[#1f10e6] text-white font-bold text-xs px-5 py-3 rounded-full shadow-md flex items-center justify-center gap-1.5 transition-all cursor-pointer self-start sm:self-auto shrink-0 border-none"
          >
            <Plus className="w-4 h-4" />
            <span>New Strategy Brief</span>
          </Link>
        </div>

        {/* 📊 METRICS SECTION */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4" id="metrics-grid">
          {/* Total Briefs */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-2xs relative hover:shadow-md transition-all">
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-xl bg-blue-50/90 flex items-center justify-center">
                <FileText className="w-5 h-5 text-[#2516FF]" />
              </div>
              <span className="text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-150 px-2.5 py-0.5 rounded-full font-bold">
                Live Sync
              </span>
            </div>
            <p className="text-xs text-slate-500 font-semibold mt-4">Total Briefs Generated</p>
            <p className="text-3xl font-black text-slate-900 mt-1 font-mono">{totalBriefsCount}</p>
          </div>

          {/* Credits Remaining */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-2xs relative hover:shadow-md transition-all">
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-xl bg-purple-50/90 flex items-center justify-center">
                <Zap className="w-5 h-5 text-purple-600" />
              </div>
              <span className="text-[10px] bg-purple-550/10 text-purple-700 border border-purple-200 px-2.5 py-0.5 rounded-full font-bold">
                Trial Limit
              </span>
            </div>
            <p className="text-xs text-slate-500 font-semibold mt-4">Available Strategy Credits</p>
            <p className="text-3xl font-black text-slate-900 mt-1 font-mono">{freeCredits}</p>
          </div>

          {/* Status Indicator */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-2xs relative hover:shadow-md transition-all">
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-xl bg-emerald-50/90 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-emerald-600" />
              </div>
              <span className="text-[10px] bg-blue-50 text-[#2516FF] border border-blue-150 px-2.5 py-0.5 rounded-full font-bold uppercase">
                {profile?.subscription_status || 'Free'}
              </span>
            </div>
            <p className="text-xs text-slate-500 font-semibold mt-4">Subscription Plan</p>
            <p className="text-lg font-black text-slate-900 mt-3 font-sans capitalize">{profile?.subscription_status || 'Free Trial'}</p>
          </div>
        </div>

        {/* 📜 RECENT ACTIVITY GRID OR EMPTY STATE */}
        <div className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 shadow-2xs space-y-6" id="activity-section">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-black text-slate-900 text-lg tracking-tight">Recent Strategic Deliverables</h2>
              <p className="text-xs text-slate-500 mt-0.5">Your most recently generated AI strategy documents.</p>
            </div>
            {totalBriefsCount > 0 && (
              <Link
                to="/briefs"
                className="text-xs font-bold text-[#2516FF] hover:text-[#1f10e6] flex items-center gap-1 cursor-pointer transition-colors"
              >
                <span>View all briefs</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            )}
          </div>

          {loading ? (
            <div className="py-12 flex flex-col items-center justify-center gap-2">
              <div className="w-6 h-6 rounded-full border-2 border-slate-200 border-t-[#2516FF] animate-spin" />
              <p className="text-xs text-slate-400 font-semibold">Loading strategic content...</p>
            </div>
          ) : briefs.length === 0 ? (
            /* Strict empty state block */
            <div id="empty-state-container" className="border-2 border-dashed border-slate-200 rounded-2xl p-8 sm:p-12 text-center max-w-lg mx-auto space-y-5 my-4">
              <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center mx-auto text-slate-400">
                <FolderOpen className="w-6 h-6" />
              </div>
              <div className="space-y-1.5">
                <p className="text-sm font-black text-slate-800">Generate your first strategic brief</p>
                <p className="text-xs text-slate-500 leading-relaxed max-w-sm mx-auto">
                  You do not have any briefs generated in this workspace yet. Map client details and requirements into clean briefing decks instantly using our elite AI compiler.
                </p>
              </div>
              <Link
                id="create-first-brief-btn"
                to="/briefs/new"
                className="inline-flex items-center gap-1.5 bg-[#2516FF] hover:bg-[#1f10e6] text-white font-bold text-xs px-5 py-2.5 rounded-full transition-all shadow-sm cursor-pointer border-none"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Create Brief Now</span>
              </Link>
            </div>
          ) : filteredBriefs.length === 0 ? (
            /* Search Empty State */
            <div id="search-empty-state" className="border border-slate-200 rounded-2xl p-8 text-center max-w-md mx-auto space-y-4 my-4 bg-slate-550/5">
              <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
                <Search className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-bold text-slate-800">No matching briefs found</p>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Your search for "{searchQuery}" did not return any strategic deliverables. Try adjusting your search query.
                </p>
              </div>
            </div>
          ) : (
            /* Top 3 entries activity grid */
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4" id="recent-briefs-grid">
              {recentBriefs.map((brief) => (
                <div 
                  key={brief.id} 
                  id={`recent-card-${brief.id}`}
                  className="p-5 border border-slate-200/90 hover:border-blue-200 rounded-2xl bg-slate-50/40 hover:bg-white transition-all duration-300 flex flex-col justify-between group cursor-pointer shadow-3xs"
                  onClick={() => navigate(`/briefs/${brief.id}`)}
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-[#2516FF] bg-[#2516FF]/15 px-2.5 py-1 rounded-md tracking-wider uppercase font-mono">
                        {brief.industry || 'Strategy'}
                      </span>
                      <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-150 text-[10px] font-bold rounded-md">
                        {brief.status || 'Active'}
                      </span>
                    </div>

                    <div>
                      <h4 className="font-bold text-slate-900 text-sm group-hover:text-[#2516FF] transition-colors truncate">
                        {brief.title || 'Brand Strategy Plan'}
                      </h4>
                      <p className="text-xs text-slate-500 font-semibold mt-1">
                        Client: <span className="text-slate-700">{brief.client_name || 'N/A'}</span>
                      </p>
                    </div>
                  </div>

                  <div className="border-t border-slate-100 pt-4 mt-5 flex items-center justify-between text-[11px] text-slate-400 font-semibold">
                    <span>
                      {brief.created_at ? new Date(brief.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : 'Just now'}
                    </span>
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

      </div>
    </DashboardLayout>
  );
}
