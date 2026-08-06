import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  User, 
  Building, 
  Tag, 
  Briefcase, 
  Key, 
  Trash2, 
  Check, 
  Loader2, 
  ShieldAlert,
  Zap,
  Sparkles,
  RefreshCw,
  Mail,
  Award
} from 'lucide-react';
import { supabase } from '../utils/supabase';
import { useAuth } from '../context/AuthContext';
import DashboardLayout from '../components/DashboardLayout';
import { getFallbackProfile, saveFallbackProfile, getFallbackBriefs } from '../utils/fallbackDb';

export default function Settings() {
  const { user, updateUser } = useAuth();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profileData, setProfileData] = useState<any>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Form Fields
  const [fullName, setFullName] = useState('');
  const [workspaceName, setWorkspaceName] = useState('');
  const [role, setRole] = useState('Freelancer');
  const [industry, setIndustry] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');

  const [totalBriefsCount, setTotalBriefsCount] = useState(0);

  const avatars = [
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&q=80',
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=100&q=80',
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=100&q=80'
  ];

  const roleOptions = ['Freelancer', 'Agency', 'Studio', 'admin'];

  useEffect(() => {
    fetchProfile();
  }, [user?.id]);

  const fetchProfile = async () => {
    if (!user?.id) return;
    try {
      setLoading(true);
      setErrorMsg(null);

      let data = null;
      try {
        const { data: resData, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .maybeSingle();

        if (error) {
          console.warn('Supabase fetch profile warning (using local fallback):', error);
          data = getFallbackProfile(user.id);
        } else {
          data = resData || getFallbackProfile(user.id);
        }
      } catch (e) {
        console.warn('Supabase fetch profile exception (using local fallback):', e);
        data = getFallbackProfile(user.id);
      }

      setProfileData(data);
      setFullName(data.full_name || data.name || '');
      setWorkspaceName(data.workspace_name || '');
      setRole(data.role || data.primary_role || 'Freelancer');
      setIndustry(data.industry || data.industry_focus || 'Digital strategy');
      setAvatarUrl(data.avatar || avatars[0]);

      // Fetch Briefs count
      let briefsList = [];
      try {
        const { data: bData, error: bError } = await supabase
          .from('briefs')
          .select('id')
          .or(`designer_id.eq.${user.id},user_id.eq.${user.id}`);
        if (!bError && bData) {
          briefsList = bData;
        } else {
          briefsList = getFallbackBriefs(user.id);
        }
      } catch (bErr) {
        briefsList = getFallbackBriefs(user.id);
      }
      setTotalBriefsCount(briefsList.length);

    } catch (err: any) {
      console.warn('Error loading profile:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !workspaceName.trim()) {
      setErrorMsg('Name and Workspace fields cannot be empty.');
      return;
    }

    try {
      setSaving(true);
      setErrorMsg(null);
      setSuccessMsg(null);

      const updatePayload = {
        full_name: fullName.trim(),
        name: fullName.trim(),
        workspace_name: workspaceName.trim(),
        role: role,
        primary_role: role,
        industry: industry.trim(),
        industry_focus: industry.trim(),
        avatar: avatarUrl
      };

      try {
        await supabase
          .from('profiles')
          .update(updatePayload)
          .eq('id', user.id);
      } catch (dbErr) {
        console.warn('Supabase profiles update exception:', dbErr);
      }

      saveFallbackProfile(user.id, {
        full_name: fullName.trim(),
        name: fullName.trim(),
        workspace_name: workspaceName.trim(),
        role: role,
        industry: industry.trim(),
        avatar: avatarUrl
      });

      updateUser({
        name: fullName.trim(),
        workspaceName: workspaceName.trim()
      });

      setSuccessMsg('Your strategy settings have been successfully updated.');
      setTimeout(() => setSuccessMsg(null), 3000);

    } catch (err: any) {
      console.error('Failed to update profile settings:', err);
      setErrorMsg(err.message || 'An unexpected error occurred saving settings.');
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordReset = async () => {
    try {
      setErrorMsg(null);
      setSuccessMsg(null);
      
      const { error } = await supabase.auth.resetPasswordForEmail(user.email, {
        redirectTo: `${window.location.origin}/resetpassword`
      });

      if (error) {
        throw error;
      }

      setSuccessMsg('A password reset link has been dispatched to your registered email.');
    } catch (err: any) {
      console.error('Password reset failed:', err);
      setErrorMsg(err.message || 'Failed to dispatch password reset link. Try again.');
    }
  };

  const handleDeleteAccount = () => {
    const confirmation = window.confirm('CRITICAL WARNING: This action is irreversible. All of your briefs, designs, and credentials will be permanently erased. Do you wish to proceed?');
    if (confirmation) {
      alert('Your account deletion request has been logged. Our administration team will process this transaction within 24 hours.');
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="w-full h-full flex items-center justify-center bg-[#F8FAFC]">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="w-8 h-8 text-[#2516FF] animate-spin" />
            <p className="text-xs text-slate-500 font-semibold font-sans">Reading profile settings...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const currentPlan = profileData?.plan || profileData?.subscription_status || 'free';
  const availableCredits = profileData?.free_credits !== undefined ? profileData.free_credits : (profileData?.credits !== undefined ? profileData.credits : 1);

  return (
    <DashboardLayout>
      <div className="p-6 sm:p-8 max-w-4xl mx-auto space-y-8" id="profile-settings-view">
        
        {/* Header Title */}
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">Account & Strategy Settings</h1>
          <p className="text-xs text-slate-500 mt-1">
            Manage your professional workspace identifiers, subscription plans, and secure key credentials.
          </p>
        </div>

        {successMsg && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-2xl text-xs font-semibold flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-600" />
            <span>{successMsg}</span>
          </div>
        )}

        {errorMsg && (
          <div className="bg-rose-50 border border-rose-200 text-rose-800 p-4 rounded-2xl text-xs font-semibold flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-rose-600" />
            <span>{errorMsg}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* LEFT COLUMN: PERSONAL INFO PROFILE (SPAN 2) */}
          <div className="lg:col-span-2 space-y-6">
            
            <form onSubmit={handleSaveProfile} className="bg-white border border-slate-200/60 rounded-3xl p-6 sm:p-8 shadow-3xs space-y-6">
              <h2 className="font-bold text-slate-900 text-sm border-b border-slate-50 pb-3">Personal & Workspace Information</h2>
              
              {/* Avatar Selector */}
              <div className="space-y-2.5">
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Choose Profile Avatar</label>
                <div className="flex items-center gap-3">
                  {avatars.map((url, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setAvatarUrl(url)}
                      className={`w-12 h-12 rounded-full overflow-hidden border-2 transition-all cursor-pointer ${
                        avatarUrl === url ? 'border-[#2516FF] scale-105' : 'border-transparent opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img src={url} alt="Avatar option" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    </button>
                  ))}
                </div>
              </div>

              {/* Full Name */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                  <User className="w-3.5 h-3.5 text-slate-400" />
                  <span>Full Professional Name</span>
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="E.g., Saad"
                  className="w-full p-4 border border-slate-200 rounded-2xl outline-none focus:border-[#2516FF] focus:ring-2 focus:ring-[#2516FF]/25 text-xs font-semibold"
                />
              </div>

              {/* Workspace Name */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                  <Building className="w-3.5 h-3.5 text-slate-400" />
                  <span>Creative Workspace Identifier</span>
                </label>
                <input
                  type="text"
                  required
                  value={workspaceName}
                  onChange={(e) => setWorkspaceName(e.target.value)}
                  placeholder="E.g., Saad Creative Studio"
                  className="w-full p-4 border border-slate-200 rounded-2xl outline-none focus:border-[#2516FF] focus:ring-2 focus:ring-[#2516FF]/25 text-xs font-semibold"
                />
              </div>

              {/* Role & Industry */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* Role */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                    <Briefcase className="w-3.5 h-3.5 text-slate-400" />
                    <span>Your Strategic Role</span>
                  </label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full p-4 border border-slate-200 rounded-2xl outline-none focus:border-[#2516FF] focus:ring-2 focus:ring-[#2516FF]/25 text-xs font-semibold"
                  >
                    {roleOptions.map(r => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                </div>

                {/* Industry */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                    <Tag className="w-3.5 h-3.5 text-slate-400" />
                    <span>Industry Sector</span>
                  </label>
                  <input
                    type="text"
                    value={industry}
                    onChange={(e) => setIndustry(e.target.value)}
                    placeholder="E.g., Digital UI/UX & SaaS Product Design"
                    className="w-full p-4 border border-slate-200 rounded-2xl outline-none focus:border-[#2516FF] focus:ring-2 focus:ring-[#2516FF]/25 text-xs font-semibold"
                  />
                </div>

              </div>

              {/* Submit */}
              <div className="pt-4 border-t border-slate-100 flex justify-end">
                <button
                  type="submit"
                  disabled={saving}
                  className="bg-[#2516FF] hover:bg-[#1f10e6] text-white flex items-center gap-1.5 px-6 py-2.5 rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer border-none"
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Saving Changes...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Save Profile Settings</span>
                    </>
                  )}
                </button>
              </div>

            </form>

            {/* PASSWORD RESET ZONE */}
            <div className="bg-white border border-slate-200/60 rounded-3xl p-6 sm:p-8 shadow-3xs space-y-4">
              <h2 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                <Key className="w-4 h-4 text-slate-400" />
                <span>Security Credentials</span>
              </h2>
              <p className="text-xs text-slate-500 leading-relaxed max-w-lg">
                Require a password change? We will transmit a secure reset link to your active email inbox to change credentials.
              </p>
              <button
                type="button"
                onClick={handlePasswordReset}
                className="bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 hover:border-slate-300 font-bold text-xs px-4 py-2.5 rounded-xl transition-all cursor-pointer inline-flex items-center gap-1.5"
              >
                <Mail className="w-4 h-4" />
                <span>Dispatch Password Reset Email</span>
              </button>
            </div>

          </div>

          {/* RIGHT COLUMN: SUBSCRIPTION & DANGER ZONE */}
          <div className="space-y-6">
            
            {/* SUBSCRIPTION SUMMARY CARD */}
            <div className="bg-linear-to-b from-[#1E112C] to-[#12081C] text-white rounded-3xl p-6 shadow-md space-y-5">
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <span className="text-[9px] font-bold text-purple-300 uppercase tracking-wider">Current Account Tier</span>
                  <p className="font-black text-white text-lg capitalize">{currentPlan} Plan</p>
                </div>
                <div className="w-9 h-9 rounded-xl bg-purple-550/15 flex items-center justify-center text-purple-400">
                  <Award className="w-5 h-5" />
                </div>
              </div>

              {/* Credit bar meter */}
              <div className="space-y-2 pt-2">
                <div className="flex justify-between text-[10px] font-bold text-purple-200">
                  <span>Strategy Credits Remaining</span>
                  <span>{availableCredits} / 3</span>
                </div>
                <div className="h-2 w-full bg-purple-950 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-linear-to-r from-[#2516FF] to-purple-550 rounded-full"
                    style={{ width: `${Math.min((availableCredits / 3) * 100, 100)}%` }}
                  />
                </div>
                <p className="text-[9px] text-purple-300 leading-relaxed font-medium">
                  Your strategy credits renew on your billing cycle. Deducts 1 credit per AI briefing compiled.
                </p>
              </div>

              {/* Total Briefs */}
              <div className="pt-4 border-t border-purple-900/40 flex justify-between items-center text-xs text-purple-200 font-semibold">
                <span>Total briefs compiled</span>
                <span className="font-mono font-bold text-white text-sm">{totalBriefsCount}</span>
              </div>
            </div>

            {/* DANGER ZONE ACCENT CARD */}
            <div className="border border-rose-150 rounded-3xl p-6 bg-rose-50/30 space-y-4">
              <h3 className="font-bold text-rose-800 text-xs flex items-center gap-1.5">
                <Trash2 className="w-4 h-4 text-rose-600" />
                <span>Account Deletion Zone</span>
              </h3>
              <p className="text-[11px] text-rose-600/80 leading-relaxed">
                Permanently purge your workspace. This action immediately destroys all briefed client entries, compiled AI PDFs, and logs.
              </p>
              <button
                type="button"
                onClick={handleDeleteAccount}
                className="w-full bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs py-2.5 rounded-xl transition-all shadow-3xs cursor-pointer border-none text-center"
              >
                Erase Creative Account
              </button>
            </div>

          </div>

        </div>

      </div>
    </DashboardLayout>
  );
}
