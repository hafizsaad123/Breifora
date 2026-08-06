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
  Zap,
  FolderOpen,
  Search,
  Clock,
  CheckCircle,
  Copy,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  User,
  Loader2,
  Settings as SettingsIcon
} from 'lucide-react';
import { supabase } from '../utils/supabase';
import { useAuth } from '../context/AuthContext';
import DashboardLayout from '../components/DashboardLayout';
import { getFallbackProfile, getFallbackBriefs, saveFallbackBrief } from '../utils/fallbackDb';

export default function Dashboard() {
  const { user, searchQuery } = useAuth();
  const navigate = useNavigate();

  const [profile, setProfile] = useState<any>(null);
  const [briefs, setBriefs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [copyingId, setCopyingId] = useState<string | null>(null);

  const loadDashboardData = async () => {
    if (!user?.id) return;
    try {
      setLoading(true);
      setErrorMessage(null);

      // 1. Fetch profiles table
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

      // Block checks if user status is blocked
      if (profileData?.status === 'blocked') {
        await supabase.auth.signOut();
        navigate('/suspended');
        return;
      }

      // 2. Fetch all briefs where designer_id or user_id matches
      let briefsData = [];
      try {
        const { data, error: briefsError } = await supabase
          .from('briefs')
          .select('*')
          .or(`designer_id.eq.${user.id},user_id.eq.${user.id}`)
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

      // Ensure some status properties are normalized
      const normalizedBriefs = (briefsData || []).map((b: any) => {
        let mappedStatus = b.status || 'completed';
        if (mappedStatus === 'Active') mappedStatus = 'completed';
        return {
          ...b,
          status: mappedStatus
        };
      });

      setBriefs(normalizedBriefs);

    } catch (err: any) {
      console.warn('Error loading dashboard data (using local fallback):', err);
      setProfile(getFallbackProfile(user.id));
      setBriefs(getFallbackBriefs(user.id));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, [user?.id]);

  const handleCopyLink = async (clientLink: string, briefId: string) => {
    if (!clientLink) return;
    try {
      const fullLink = `${window.location.origin}/brief/${clientLink}`;
      await navigator.clipboard.writeText(fullLink);
      setCopyingId(briefId);
      setTimeout(() => setCopyingId(null), 2000);
    } catch (err) {
      console.error('Failed to copy client link:', err);
    }
  };

  const fullName = profile?.full_name || profile?.name || user?.name || '';
  const workspaceName = profile?.workspace_name || '';
  const creditsRemaining = profile?.free_credits !== undefined ? profile.free_credits : (profile?.credits !== undefined ? profile.credits : 1);

  // Filter briefs based on global search query
  const filteredBriefs = briefs.filter((brief) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    const nameMatch = (brief.project_name || brief.title || '').toLowerCase().includes(query);
    const clientMatch = (brief.client_name || '').toLowerCase().includes(query);
    return nameMatch || clientMatch;
  });

  // Calculate top stats
  const totalCreated = briefs.length;
  const awaitingClient = briefs.filter(b => b.status === 'pending' || b.status === 'processing').length;
  const completedBriefs = briefs.filter(b => b.status === 'completed' || b.status === 'Active').length;

  // Get recent 5 briefs for the table
  const recentBriefs = filteredBriefs.slice(0, 5);

  return (
    <DashboardLayout>
      <div className="p-6 sm:p-8 space-y-8" id="dashboard-core-view">
        
        {/* Welcome Block */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4" id="greeting-row">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              Welcome back, {fullName} 👋
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Active workspace: <span className="font-semibold text-slate-700">{workspaceName}</span>
            </p>
          </div>

          <Link
            id="new-brief-top-btn"
            to="/briefs/new"
            className="bg-linear-to-r from-[#2516FF] to-indigo-600 hover:from-indigo-600 hover:to-[#2516FF] text-white font-bold text-xs px-5 py-3 rounded-xl shadow-xs hover:shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer self-start sm:self-auto border-none"
          >
            <Plus className="w-4 h-4" />
            <span>Create New Brief</span>
          </Link>
        </div>

        {/* 📊 STATS GRID (4-COLUMN) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" id="metrics-grid-4">
          
          {/* Card 1: Total Created */}
          <div className="bg-white border border-slate-200/60 rounded-2xl p-5 shadow-3xs relative hover:shadow-xs transition-all">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Briefs</span>
              <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-[#2516FF]">
                <FileText className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-black text-slate-900 mt-4 font-mono">{totalCreated}</p>
            <p className="text-[10px] text-slate-400 mt-1 font-semibold">In this workspace</p>
          </div>

          {/* Card 2: Awaiting Client */}
          <div className="bg-white border border-slate-200/60 rounded-2xl p-5 shadow-3xs relative hover:shadow-xs transition-all">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Awaiting Client</span>
              <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center text-amber-600">
                <Clock className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-black text-slate-900 mt-4 font-mono">{awaitingClient}</p>
            <p className="text-[10px] text-slate-400 mt-1 font-semibold">Pending client input</p>
          </div>

          {/* Card 3: Completed Briefs */}
          <div className="bg-white border border-slate-200/60 rounded-2xl p-5 shadow-3xs relative hover:shadow-xs transition-all">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Completed Briefs</span>
              <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
                <CheckCircle className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-black text-slate-900 mt-4 font-mono">{completedBriefs}</p>
            <p className="text-[10px] text-slate-400 mt-1 font-semibold">AI Briefs Generated</p>
          </div>

          {/* Card 4: Credits Remaining */}
          <div className="bg-white border border-slate-200/60 rounded-2xl p-5 shadow-3xs relative hover:shadow-xs transition-all">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Credits Remaining</span>
              <div className="w-8 h-8 rounded-lg bg-purple-550/15 flex items-center justify-center text-purple-600">
                <Zap className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-black text-slate-900 mt-4 font-mono">{creditsRemaining}</p>
            <p className="text-[10px] text-slate-400 mt-1 font-semibold">Deducts 1/generation</p>
          </div>

        </div>

        {/* QUICK ACTIONS & DELIVERABLES SPLIT */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* LEFT: RECENT BRIEFS TABLE (SPAN 2) */}
          <div className="lg:col-span-2 bg-white border border-slate-200/60 rounded-3xl p-6 sm:p-8 shadow-3xs space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-bold text-slate-900 text-sm tracking-tight">Recent Strategic Briefs</h2>
                <p className="text-[11px] text-slate-400 font-semibold mt-0.5">Your most recently requested and generated strategic deliverables.</p>
              </div>
              {totalCreated > 0 && (
                <Link
                  to="/briefs"
                  className="text-xs font-bold text-[#2516FF] hover:text-[#1f10e6] flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <span>View All</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              )}
            </div>

            {loading ? (
              <div className="py-12 flex flex-col items-center justify-center gap-2">
                <Loader2 className="w-6 h-6 text-[#2516FF] animate-spin" />
                <p className="text-xs text-slate-400 font-semibold">Retrieving workspace brief states...</p>
              </div>
            ) : briefs.length === 0 ? (
              <div className="border border-dashed border-slate-200 rounded-2xl p-8 text-center max-w-md mx-auto space-y-4">
                <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center mx-auto text-slate-400">
                  <FolderOpen className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-bold text-slate-800">No briefs generated yet</p>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    Create a new brief link, share the questionnaire with your client, and watch Briefora AI generate complete design specs automatically.
                  </p>
                </div>
                <Link
                  to="/briefs/new"
                  className="inline-flex items-center gap-1 bg-[#2516FF] hover:bg-[#1f10e6] text-white font-bold text-[11px] px-4 py-2 rounded-xl transition-all"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Generate New Client Link</span>
                </Link>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase text-[9px] tracking-wider">
                      <th className="pb-3 font-semibold">Project Details</th>
                      <th className="pb-3 font-semibold">Status</th>
                      <th className="pb-3 font-semibold">Requested On</th>
                      <th className="pb-3 text-right font-semibold">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {recentBriefs.map((briefItem) => {
                      const clientLinkSlug = briefItem.client_link || briefItem.id;
                      const hasCompleted = briefItem.status === 'completed' || briefItem.status === 'Active';
                      const isPending = briefItem.status === 'pending' || !briefItem.status;
                      const isProcessing = briefItem.status === 'processing';

                      return (
                        <tr key={briefItem.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="py-4">
                            <div>
                              <p className="font-bold text-slate-900 text-xs">
                                {briefItem.project_name || briefItem.title || 'Creative Strategy'}
                              </p>
                              <p className="text-[10px] text-slate-400 font-medium mt-0.5">
                                Client: <span className="text-slate-600 font-semibold">{briefItem.client_name || 'N/A'}</span> • Type: {briefItem.project_type || briefItem.industry || 'Other'}
                              </p>
                            </div>
                          </td>
                          <td className="py-4">
                            {hasCompleted ? (
                              <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 border border-emerald-150 text-[10px] font-bold px-2.5 py-0.5 rounded-full">
                                <span className="w-1 h-1 bg-emerald-500 rounded-full animate-pulse" />
                                <span>Brief Generated</span>
                              </span>
                            ) : isProcessing ? (
                              <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 border border-blue-150 text-[10px] font-bold px-2.5 py-0.5 rounded-full">
                                <span className="w-1 h-1 bg-blue-500 rounded-full animate-ping" />
                                <span>AI Generating...</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-700 border border-amber-150 text-[10px] font-bold px-2.5 py-0.5 rounded-full">
                                <span className="w-1 h-1 bg-amber-500 rounded-full animate-pulse" />
                                <span>Awaiting Client</span>
                              </span>
                            )}
                          </td>
                          <td className="py-4 text-slate-500 font-semibold text-[11px]">
                            {briefItem.created_at ? new Date(briefItem.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : 'Just now'}
                          </td>
                          <td className="py-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              {briefItem.client_link && (
                                <button
                                  type="button"
                                  onClick={() => handleCopyLink(briefItem.client_link, briefItem.id)}
                                  className="p-1.5 border border-slate-200 rounded-lg text-slate-500 hover:text-slate-800 hover:border-slate-300 transition-all cursor-pointer"
                                  title="Copy questionnaire link for client"
                                >
                                  {copyingId === briefItem.id ? (
                                    <span className="text-[10px] font-bold text-emerald-600 px-1">Copied!</span>
                                  ) : (
                                    <Copy className="w-3.5 h-3.5" />
                                  )}
                                </button>
                              )}
                              <button
                                type="button"
                                onClick={() => navigate(`/briefs/${briefItem.id}`)}
                                className="bg-[#2516FF]/10 hover:bg-[#2516FF] text-[#2516FF] hover:text-white font-bold text-[10px] px-3 py-1.5 rounded-lg transition-all cursor-pointer border-none"
                              >
                                View
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* RIGHT: QUICK ACTIONS & ACCOUNT AT A GLANCE */}
          <div className="bg-linear-to-b from-[#1E112C] to-[#12081C] text-white rounded-3xl p-6 sm:p-8 shadow-md flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="w-10 h-10 rounded-xl bg-purple-550/15 flex items-center justify-center text-purple-400">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-white text-sm tracking-tight">Active Strategy Guide</h3>
                <p className="text-[11px] text-purple-200 mt-1 leading-relaxed">
                  Briefora automates client questionnaires. Copy your strategic link, send it to your client, and obtain an expert-level brief formatted instantly.
                </p>
              </div>
            </div>

            <div className="space-y-3 pt-4 border-t border-purple-900/50">
              <h4 className="text-[10px] font-bold text-purple-300 uppercase tracking-wider">Quick Launch Commands</h4>
              <Link
                to="/briefs/new"
                className="w-full bg-[#2516FF] hover:bg-[#1f10e6] text-white text-center font-bold text-xs py-3 rounded-xl block transition-all shadow-sm"
              >
                Create New Brief
              </Link>
              
              {briefs.length > 0 && briefs.find(b => b.client_link) && (
                <button
                  type="button"
                  onClick={() => {
                    const firstBriefWithLink = briefs.find(b => b.client_link);
                    if (firstBriefWithLink) {
                      handleCopyLink(firstBriefWithLink.client_link, 'quick-action');
                    }
                  }}
                  className="w-full bg-white/10 hover:bg-white/15 text-white font-semibold text-xs py-3 rounded-xl block transition-all text-center border-none cursor-pointer"
                >
                  {copyingId === 'quick-action' ? '✓ Client Link Copied!' : 'Copy Latest Client Link'}
                </button>
              )}
            </div>

            <div className="flex items-center gap-2.5 pt-4 border-t border-purple-900/50 text-[10px] text-purple-300">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Full Supabase security rules are active</span>
            </div>
          </div>

        </div>

      </div>
    </DashboardLayout>
  );
}
