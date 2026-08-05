import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  User, 
  Building, 
  Settings as SettingsIcon, 
  CreditCard, 
  Sparkles, 
  Save, 
  AlertCircle, 
  CheckCircle,
  Zap,
  ArrowRight,
  Shield,
  HelpCircle
} from 'lucide-react';
import { supabase } from '../utils/supabase';
import { useAuth } from '../context/AuthContext';
import DashboardLayout from '../components/DashboardLayout';
import { getFallbackProfile, saveFallbackProfile } from '../utils/fallbackDb';

export default function Settings() {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();

  const [fullName, setFullName] = useState('');
  const [workspaceName, setWorkspaceName] = useState('');
  const [subStatus, setSubStatus] = useState('free');
  const [freeCredits, setFreeCredits] = useState(0);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const fetchProfileData = async () => {
    if (!user?.id) return;
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

      if (error) {
        console.warn('Supabase fetch settings profile warning (using local fallback):', error);
        const fallback = getFallbackProfile(user.id);
        setFullName(fallback.full_name || fallback.name || '');
        setWorkspaceName(fallback.workspace_name || '');
        setSubStatus(fallback.subscription_status || fallback.plan || 'free');
        setFreeCredits(fallback.free_credits !== undefined ? fallback.free_credits : 0);
      } else if (data) {
        setFullName(data.full_name || '');
        setWorkspaceName(data.workspace_name || '');
        setSubStatus(data.subscription_status || data.plan || 'free');
        setFreeCredits(data.free_credits !== undefined ? data.free_credits : 0);
      } else {
        const fallback = getFallbackProfile(user.id);
        setFullName(fallback.full_name || fallback.name || '');
        setWorkspaceName(fallback.workspace_name || '');
        setSubStatus(fallback.subscription_status || fallback.plan || 'free');
        setFreeCredits(fallback.free_credits !== undefined ? fallback.free_credits : 0);
      }
    } catch (err: any) {
      console.warn('Error fetching settings profile (using local fallback):', err);
      const fallback = getFallbackProfile(user.id);
      setFullName(fallback.full_name || fallback.name || '');
      setWorkspaceName(fallback.workspace_name || '');
      setSubStatus(fallback.subscription_status || fallback.plan || 'free');
      setFreeCredits(fallback.free_credits !== undefined ? fallback.free_credits : 0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfileData();
  }, [user?.id]);

  const showToast = (type: 'success' | 'error', text: string) => {
    setToast({ type, text });
    setTimeout(() => setToast(null), 4000);
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !workspaceName.trim()) {
      showToast('error', 'Full name and workspace name cannot be empty.');
      return;
    }

    try {
      setSaving(true);
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: fullName.trim(),
          workspace_name: workspaceName.trim()
        })
        .eq('id', user.id);

      if (error) {
        console.warn('Supabase profile save warning (using local fallback):', error);
      }

      // Always save to fallback local storage
      saveFallbackProfile(user.id, {
        full_name: fullName.trim(),
        workspace_name: workspaceName.trim()
      });

      // Update local context
      updateUser({
        name: fullName.trim(),
        workspaceName: workspaceName.trim()
      });

      showToast('success', 'Profile and workspace details updated successfully.');
    } catch (err: any) {
      console.warn('Error updating settings (using local fallback):', err);
      // Fallback save anyway
      saveFallbackProfile(user.id, {
        full_name: fullName.trim(),
        workspace_name: workspaceName.trim()
      });
      updateUser({
        name: fullName.trim(),
        workspaceName: workspaceName.trim()
      });
      showToast('success', 'Profile and workspace details updated successfully (offline mode).');
    } finally {
      setSaving(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="p-6 sm:p-8 max-w-4xl mx-auto space-y-8" id="settings-view">
        
        {/* Dynamic Toast Messages */}
        <AnimatePresence>
          {toast && (
            <motion.div
              id="settings-toast"
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              className={`fixed top-6 right-6 z-50 p-4 rounded-2xl shadow-xl border flex items-start gap-3 max-w-sm ${
                toast.type === 'success' 
                  ? 'bg-emerald-50 border-emerald-150 text-emerald-800' 
                  : 'bg-rose-50 border-rose-150 text-rose-800'
              }`}
            >
              {toast.type === 'success' ? (
                <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              )}
              <div className="flex-1">
                <p className="text-xs font-bold capitalize">{toast.type} Status</p>
                <p className="text-[11px] mt-0.5">{toast.text}</p>
              </div>
              <button 
                type="button" 
                onClick={() => setToast(null)}
                className="text-xs font-bold cursor-pointer hover:underline border-none bg-transparent self-start"
              >
                Close
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* HEADER BLOCK */}
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <SettingsIcon className="w-6 h-6 text-slate-600" />
            Workspace Settings
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Update your professional user profile and view active agency-tier subscription billing details.
          </p>
        </div>

        {loading ? (
          <div className="py-24 flex flex-col items-center justify-center gap-3 bg-white border border-slate-200/80 rounded-3xl">
            <div className="w-8 h-8 rounded-full border-2 border-slate-200 border-t-[#2516FF] animate-spin" />
            <p className="text-xs text-slate-400 font-semibold">Synchronizing profile configurations...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start" id="settings-layout-grid">
            
            {/* 📝 PROFILE UPDATE COMPONENT */}
            <div className="lg:col-span-2 bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 shadow-2xs space-y-6" id="settings-profile-card">
              <div className="border-b border-slate-100 pb-4">
                <h2 className="font-black text-slate-900 text-sm uppercase tracking-wider">Identity Details</h2>
                <p className="text-xs text-slate-400 mt-0.5">Control how your workspace and deliverables represent your brand.</p>
              </div>

              <form onSubmit={handleSaveProfile} className="space-y-5" id="settings-form">
                {/* Full Name field */}
                <div className="space-y-2">
                  <label htmlFor="settings-fullName" className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      id="settings-fullName"
                      type="text"
                      required
                      placeholder="e.g. Saad"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:border-[#2516FF] focus:ring-1 focus:ring-[#2516FF]/15 placeholder:text-slate-400 bg-slate-50/50 hover:bg-white focus:bg-white transition-all"
                    />
                  </div>
                </div>

                {/* Workspace Name field */}
                <div className="space-y-2">
                  <label htmlFor="settings-workspaceName" className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Workspace Brand Hub
                  </label>
                  <div className="relative">
                    <Building className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      id="settings-workspaceName"
                      type="text"
                      required
                      placeholder="e.g. Saad Creative Studio"
                      value={workspaceName}
                      onChange={(e) => setWorkspaceName(e.target.value)}
                      className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:border-[#2516FF] focus:ring-1 focus:ring-[#2516FF]/15 placeholder:text-slate-400 bg-slate-50/50 hover:bg-white focus:bg-white transition-all"
                    />
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-end">
                  <button
                    id="settings-save-btn"
                    type="submit"
                    disabled={saving}
                    className="bg-[#2516FF] hover:bg-[#1f10e6] text-white font-bold text-xs px-5 py-2.5 rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-3xs cursor-pointer border-none disabled:opacity-50"
                  >
                    <Save className="w-4 h-4" />
                    <span>{saving ? 'Saving changes...' : 'Save settings'}</span>
                  </button>
                </div>
              </form>
            </div>

            {/* 💳 READ-ONLY BILLING PANEL */}
            <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-2xs space-y-6" id="settings-billing-panel">
              <div className="border-b border-slate-100 pb-4">
                <h2 className="font-black text-slate-900 text-sm uppercase tracking-wider flex items-center gap-1.5">
                  <CreditCard className="w-4 h-4 text-[#2516FF]" />
                  Plan & Billing
                </h2>
                <p className="text-xs text-slate-400 mt-0.5 font-semibold">Active workspace quota.</p>
              </div>

              {/* Read Only subscription_status text badge */}
              <div className="bg-[#F4F7FF] border border-blue-100/60 rounded-2xl p-4.5 space-y-3" id="billing-status-box">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Current Tier</span>
                  <span className="text-[10px] font-black uppercase text-white bg-[#2516FF] px-2.5 py-1 rounded-md tracking-wider">
                    {subStatus}
                  </span>
                </div>
                
                <div>
                  <p className="text-lg font-black text-slate-900 capitalize leading-none">{subStatus} Plan</p>
                  <p className="text-[11px] text-slate-500 mt-1.5 leading-relaxed">
                    {subStatus === 'free' 
                      ? `Includes ${freeCredits} strategy generation credits to Sandbox test ideas.` 
                      : `Premium active account with access to high-fidelity agency briefs.`
                    }
                  </p>
                </div>
              </div>

              {/* Manage upgrades buttons */}
              <div className="space-y-3" id="billing-actions">
                <Link
                  id="checkout-upgrade-btn"
                  to="/checkout"
                  className="w-full bg-[#2516FF] hover:bg-[#1f10e6] text-white font-bold text-xs py-3 px-4 rounded-xl flex items-center justify-center gap-1.5 shadow-3xs transition-all cursor-pointer border-none"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Manage Plans & Upgrades</span>
                  <ArrowRight className="w-3.5 h-3.5 ml-auto" />
                </Link>

                <div className="flex items-center gap-1.5 justify-center text-[10px] text-slate-400 font-semibold pt-1">
                  <Shield className="w-3.5 h-3.5" />
                  <span>Secure bank-grade payments via Stripe</span>
                </div>
              </div>
            </div>

          </div>
        )}

      </div>
    </DashboardLayout>
  );
}
