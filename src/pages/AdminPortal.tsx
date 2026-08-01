import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ShieldCheck, Lock, User, Users, Search, Plus, Trash2, 
  CheckCircle, AlertTriangle, Activity, Settings, DollarSign, 
  FileText, LogOut, Key, RefreshCw, Sliders, Layers, X, 
  ChevronRight, CreditCard, Save, Globe, ExternalLink, Zap, Edit3
} from 'lucide-react';
import Logo from '../components/ui/Logo';
import { pricingPlans as defaultPricingPlans, faqList as defaultFaqs, testimonialsList as defaultTestimonials } from '../data';
import { 
  getAdminHeroCopy, getAdminPrivacyPolicy, 
  getAdminUsagePolicy, getAdminTermsOfService, syncAndSaveData, getDbSyncStatus, ADMIN_SYNC_EVENT 
} from '../lib/adminSync';

interface AdminUser {
  id: string;
  name: string;
  email: string;
  plan: 'Free' | 'Pro' | 'Studio';
  status: 'Active' | 'Suspended';
  createdAt: string;
  onboarded: boolean;
  briefsCount: number;
}

interface AdminBrief {
  id: string;
  title: string;
  clientName: string;
  userEmail: string;
  status: 'Active' | 'Signed Off' | 'Draft' | 'Locked';
  createdAt: string;
  views: number;
}

interface AuditLog {
  id: string;
  action: string;
  target: string;
  timestamp: string;
  admin: string;
}

export default function AdminPortal() {
  const navigate = useNavigate();

  // Auth State
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return sessionStorage.getItem('briefora_admin_authed') === 'true';
  });
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Active Tab
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'briefs' | 'pricing' | 'cms' | 'hero' | 'system' | 'legal'>('overview');

  // Legal Policies
  const [privacyPolicyText, setPrivacyPolicyText] = useState<string>(() => localStorage.getItem('briefora_privacy_policy') || getAdminPrivacyPolicy());
  const [usagePolicyText, setUsagePolicyText] = useState<string>(() => localStorage.getItem('briefora_usage_policy') || getAdminUsagePolicy());
  const [termsOfServiceText, setTermsOfServiceText] = useState<string>(() => localStorage.getItem('briefora_terms_of_service') || getAdminTermsOfService());

  // Search/Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [userPlanFilter, setUserPlanFilter] = useState<string>('All');
  const [userStatusFilter, setUserStatusFilter] = useState<string>('All');

  // Users
  const [users, setUsers] = useState<AdminUser[]>(() => {
    const saved = localStorage.getItem('briefora_admin_users');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error(e); }
    }
    return [
      { id: 'usr-101', name: 'Devin Miller', email: 'devin@brandconsulting.io', plan: 'Studio', status: 'Active', createdAt: '2025-06-12', onboarded: true, briefsCount: 14 },
      { id: 'usr-102', name: 'Elena Rostova', email: 'elena@rostovastudio.com', plan: 'Pro', status: 'Active', createdAt: '2025-06-28', onboarded: true, briefsCount: 8 },
      { id: 'usr-103', name: 'Marcus Vance', email: 'marcus@vancedesign.co', plan: 'Pro', status: 'Active', createdAt: '2025-07-02', onboarded: true, briefsCount: 5 },
      { id: 'usr-104', name: 'Sarah Jenkins', email: 'sarah@freelancedesign.net', plan: 'Free', status: 'Active', createdAt: '2025-07-15', onboarded: false, briefsCount: 1 },
      { id: 'usr-105', name: 'Alex Rivera', email: 'alex@riveradesign.org', plan: 'Free', status: 'Active', createdAt: '2025-07-20', onboarded: true, briefsCount: 2 },
      { id: 'usr-106', name: 'Taylor Swift', email: 'taylor@swiftbite.app', plan: 'Studio', status: 'Active', createdAt: '2025-07-25', onboarded: true, briefsCount: 11 },
    ];
  });

  // Briefs
  const [briefs, setBriefs] = useState<AdminBrief[]>(() => {
    const saved = localStorage.getItem('briefora_admin_briefs');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error(e); }
    }
    return [
      { id: 'brf-901', title: 'Zenli Brand Alignment', clientName: 'Zenli Tech Inc.', userEmail: 'devin@brandconsulting.io', status: 'Signed Off', createdAt: '2025-07-28', views: 34 },
      { id: 'brf-902', title: 'Lumora Identity Brief', clientName: 'Lumora Health', userEmail: 'elena@rostovastudio.com', status: 'Active', createdAt: '2025-07-29', views: 18 },
      { id: 'brf-903', title: 'Vance Mobile App Wireframes', clientName: 'Vance Logistics', userEmail: 'marcus@vancedesign.co', status: 'Draft', createdAt: '2025-07-30', views: 5 },
      { id: 'brf-904', title: 'SwiftBite UI Redesign', clientName: 'SwiftBite Global', userEmail: 'taylor@swiftbite.app', status: 'Signed Off', createdAt: '2025-07-31', views: 42 },
    ];
  });

  // Dynamic CMS & Configs
  const [pricingPlans, setPricingPlans] = useState<any[]>(() => JSON.parse(localStorage.getItem('briefora_admin_pricing') || 'null') || defaultPricingPlans);
  const [faqs, setFaqs] = useState<any[]>(() => JSON.parse(localStorage.getItem('briefora_admin_faqs') || 'null') || defaultFaqs);
  const [testimonials, setTestimonials] = useState<any[]>(() => JSON.parse(localStorage.getItem('briefora_admin_testimonials') || 'null') || defaultTestimonials);
  const [heroCopy, setHeroCopy] = useState(getAdminHeroCopy);

  // System Toggles
  const [maintenanceMode, setMaintenanceMode] = useState<boolean>(() => localStorage.getItem('briefora_maintenance') === 'true');
  const [maintenanceMsg, setMaintenanceMsg] = useState<string>(() => localStorage.getItem('briefora_maintenance_msg') || 'Briefora is undergoing maintenance.');
  const [signupsAllowed, setSignupsAllowed] = useState<boolean>(() => localStorage.getItem('briefora_signups_enabled') !== 'false');
  const [announcement, setAnnouncement] = useState<string>(() => localStorage.getItem('briefora_broadcast_msg') || '⚡ Briefora v2.4 Live!');
  const [announcementActive, setAnnouncementActive] = useState<boolean>(() => localStorage.getItem('briefora_broadcast_active') === 'true');

  // Audit Logs
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() => JSON.parse(localStorage.getItem('briefora_admin_logs') || 'null') || [
    { id: 'log-1', action: 'PORTAL_INITIALIZED', target: 'Admin Portal', timestamp: new Date().toLocaleTimeString(), admin: 'system' }
  ]);

  // Modals & Toasts
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserPlan, setNewUserPlan] = useState<'Free' | 'Pro' | 'Studio'>('Pro');

  const [isAddFaqOpen, setIsAddFaqOpen] = useState(false);
  const [newFaqQuestion, setNewFaqQuestion] = useState('');
  const [newFaqAnswer, setNewFaqAnswer] = useState('');

  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const addAuditLog = (action: string, target: string) => {
    const newLog: AuditLog = { id: `log-${Date.now()}`, action, target, timestamp: new Date().toLocaleTimeString(), admin: 'admin' };
    setAuditLogs((prev) => [newLog, ...prev]);
  };

  // Sync state effects
  useEffect(() => { syncAndSaveData('briefora_admin_users', users); }, [users]);
  useEffect(() => { syncAndSaveData('briefora_admin_briefs', briefs); }, [briefs]);
  useEffect(() => { syncAndSaveData('briefora_admin_pricing', pricingPlans); }, [pricingPlans]);
  useEffect(() => { syncAndSaveData('briefora_admin_faqs', faqs); }, [faqs]);
  useEffect(() => { syncAndSaveData('briefora_admin_testimonials', testimonials); }, [testimonials]);
  useEffect(() => { syncAndSaveData('briefora_admin_hero_copy', heroCopy); }, [heroCopy]);
  useEffect(() => {
    syncAndSaveData('briefora_maintenance', String(maintenanceMode));
    syncAndSaveData('briefora_maintenance_msg', maintenanceMsg);
  }, [maintenanceMode, maintenanceMsg]);
  useEffect(() => { syncAndSaveData('briefora_signups_enabled', String(signupsAllowed)); }, [signupsAllowed]);
  useEffect(() => {
    syncAndSaveData('briefora_broadcast_msg', announcement);
    syncAndSaveData('briefora_broadcast_active', String(announcementActive));
  }, [announcement, announcementActive]);
  useEffect(() => { syncAndSaveData('briefora_admin_logs', auditLogs); }, [auditLogs]);
  useEffect(() => { syncAndSaveData('briefora_privacy_policy', privacyPolicyText); }, [privacyPolicyText]);
  useEffect(() => { syncAndSaveData('briefora_usage_policy', usagePolicyText); }, [usagePolicyText]);
  useEffect(() => { syncAndSaveData('briefora_terms_of_service', termsOfServiceText); }, [termsOfServiceText]);

  // Auth Handlers
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setLoginError('');

    setTimeout(() => {
      if (username.trim() === 'admin' && password === 'admin') {
        sessionStorage.setItem('briefora_admin_authed', 'true');
        setIsAuthenticated(true);
        addAuditLog('ADMIN_LOGIN_SUCCESS', 'Admin Portal');
        showToast('Welcome back, Admin!');
      } else {
        setLoginError('Invalid credentials. Use admin / admin.');
      }
      setIsSubmitting(false);
    }, 400);
  };

  const handleLogout = () => {
    sessionStorage.removeItem('briefora_admin_authed');
    setIsAuthenticated(false);
  };

  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserName || !newUserEmail) return;
    const newUser: AdminUser = {
      id: `usr-${Date.now()}`,
      name: newUserName,
      email: newUserEmail,
      plan: newUserPlan,
      status: 'Active',
      createdAt: new Date().toISOString().split('T')[0],
      onboarded: true,
      briefsCount: 0,
    };
    setUsers([newUser, ...users]);
    setIsAddUserOpen(false);
    setNewUserName('');
    setNewUserEmail('');
    showToast(`User ${newUser.name} created!`);
  };

  const handleDeleteUser = (id: string) => {
    setUsers(users.filter(u => u.id !== id));
    showToast('User deleted');
  };

  const handleDeleteBrief = (id: string) => {
    setBriefs(briefs.filter(b => b.id !== id));
    showToast('Brief removed');
  };

  const handleAddFaq = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFaqQuestion || !newFaqAnswer) return;
    const newFaq = { q: newFaqQuestion, a: newFaqAnswer };
    setFaqs([...faqs, newFaq]);
    setIsAddFaqOpen(false);
    setNewFaqQuestion('');
    setNewFaqAnswer('');
    showToast('FAQ item added!');
  };

  const handleDeleteFaq = (idx: number) => {
    setFaqs(faqs.filter((_, i) => i !== idx));
    showToast('FAQ deleted');
  };

  const filteredUsers = users.filter((u) => {
    const matchesSearch = u.name.toLowerCase().includes(searchTerm.toLowerCase()) || u.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPlan = userPlanFilter === 'All' || u.plan === userPlanFilter;
    const matchesStatus = userStatusFilter === 'All' || u.status === userStatusFilter;
    return matchesSearch && matchesPlan && matchesStatus;
  });

  const totalUsers = users.length;
  const activeProStudio = users.filter((u) => u.plan === 'Pro' || u.plan === 'Studio').length;
  const totalMRR = users.reduce((sum, u) => sum + (u.plan === 'Pro' ? 9 : u.plan === 'Studio' ? 29 : 0), 0);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-50/60 text-slate-900 flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden font-sans">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative z-10 w-full max-w-md bg-white border border-slate-200/80 rounded-[32px] p-8 sm:p-10 shadow-xl"
        >
          <div className="flex flex-col items-center text-center mb-8">
            <div className="p-3 bg-brand-primary/10 border border-brand-primary/20 rounded-2xl mb-4 text-brand-primary">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-primary/10 text-brand-primary text-[10px] font-bold tracking-widest uppercase mb-2">
              <Lock className="w-3 h-3" /> Admin Gatekeeper
            </span>
            <h1 className="text-2xl font-black text-slate-900">Admin Portal Login</h1>
          </div>

          {loginError && (
            <div className="mb-6 p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-3 text-rose-600 text-xs font-semibold">
              <AlertTriangle className="w-5 h-5 shrink-0" />
              <span>{loginError}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-[11px] font-bold uppercase text-slate-600 mb-1.5">Username</label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input 
                  type="text" 
                  required 
                  value={username} 
                  onChange={(e) => setUsername(e.target.value)} 
                  placeholder="admin" 
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-3 text-xs" 
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase text-slate-600 mb-1.5">Password</label>
              <div className="relative">
                <Key className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input 
                  type="password" 
                  required 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                  placeholder="••••••••" 
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-3 text-xs" 
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full mt-3 bg-brand-primary hover:bg-brand-primary/90 text-white font-bold py-3.5 rounded-xl text-xs tracking-wider uppercase transition-all shadow-md flex items-center justify-center gap-2"
            >
              {isSubmitting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <>Enter Control Center <ChevronRight className="w-4 h-4" /></>}
            </button>
          </form>

          <div className="mt-4 text-center">
            <button onClick={() => navigate('/')} className="text-[11px] font-semibold text-slate-500 hover:text-brand-primary">
              ← Back to Main Website
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/60 text-slate-900 flex flex-col font-sans relative">
      <AnimatePresence>
        {toastMsg && (
          <motion.div
            initial={{ opacity: 0, y: -20, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: -20, x: '-50%' }}
            className="fixed top-5 left-1/2 z-50 bg-slate-900 text-white px-5 py-2.5 rounded-full text-xs font-semibold shadow-xl flex items-center gap-2 border border-slate-700"
          >
            <CheckCircle className="w-4 h-4 text-emerald-400" />
            <span>{toastMsg}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <header className="bg-white border-b border-slate-200/80 px-6 py-3.5 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-4">
          <div onClick={() => navigate('/')} className="cursor-pointer flex items-center gap-2.5">
            <Logo iconSize={32} />
          </div>
          <span className="text-slate-300">|</span>
          <div className="flex items-center gap-2 bg-brand-primary/10 border border-brand-primary/20 px-3 py-1 rounded-full">
            <ShieldCheck className="w-3.5 h-3.5 text-brand-primary" />
            <span className="text-[11px] font-bold text-brand-primary uppercase">Admin Portal</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/')} className="hidden sm:flex items-center gap-1.5 px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold">
            <ExternalLink className="w-3.5 h-3.5" /> Live Site
          </button>

          <button onClick={handleLogout} className="flex items-center gap-1.5 px-3.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 rounded-lg text-xs font-bold">
            <LogOut className="w-3.5 h-3.5" /> Logout
          </button>
        </div>
      </header>

      <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 flex flex-col gap-6">
        {/* Navigation Tabs */}
        <div className="bg-white rounded-2xl p-1.5 border border-slate-200/80 flex flex-wrap gap-1">
          {[
            { id: 'overview', label: 'Overview', icon: Activity },
            { id: 'users', label: `Users (${users.length})`, icon: Users },
            { id: 'hero', label: 'Hero Copy', icon: Globe },
            { id: 'pricing', label: 'Pricing', icon: CreditCard },
            { id: 'cms', label: 'FAQs & Reviews', icon: Layers },
            { id: 'briefs', label: `Briefs (${briefs.length})`, icon: FileText },
            { id: 'system', label: 'Global System', icon: Settings },
            { id: 'legal', label: 'Legal Policies', icon: ShieldCheck },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  activeTab === tab.id ? 'bg-brand-primary text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Icon className="w-4 h-4" /> {tab.label}
              </button>
            );
          })}
        </div>

        {/* OVERVIEW TAB */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white rounded-2xl p-6 border border-slate-200/80">
                <span className="text-xs font-bold text-slate-500 uppercase">Total Users</span>
                <div className="text-3xl font-black text-slate-900 mt-2">{totalUsers}</div>
              </div>
              <div className="bg-white rounded-2xl p-6 border border-slate-200/80">
                <span className="text-xs font-bold text-slate-500 uppercase">Paid Subscribers</span>
                <div className="text-3xl font-black text-slate-900 mt-2">{activeProStudio}</div>
              </div>
              <div className="bg-white rounded-2xl p-6 border border-slate-200/80">
                <span className="text-xs font-bold text-slate-500 uppercase">Monthly MRR</span>
                <div className="text-3xl font-black text-slate-900 mt-2">${totalMRR}</div>
              </div>
              <div className="bg-white rounded-2xl p-6 border border-slate-200/80">
                <span className="text-xs font-bold text-slate-500 uppercase">Active Briefs</span>
                <div className="text-3xl font-black text-slate-900 mt-2">{briefs.length}</div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-slate-200/80">
              <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
                <Activity className="w-4 h-4 text-brand-primary" /> Admin System Activity Logs
              </h3>
              <div className="space-y-2 max-h-60 overflow-y-auto font-mono text-xs">
                {auditLogs.map((log) => (
                  <div key={log.id} className="p-2.5 bg-slate-50 rounded-lg flex items-center justify-between border border-slate-100">
                    <span className="text-slate-700 font-bold">[{log.timestamp}] {log.action}</span>
                    <span className="text-slate-400">{log.target}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* USERS TAB */}
        {activeTab === 'users' && (
          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <h3 className="text-lg font-bold text-slate-900">User Management</h3>
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <input
                  type="text"
                  placeholder="Search user or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs w-full sm:w-64"
                />
                <button onClick={() => setIsAddUserOpen(true)} className="px-4 py-2 bg-brand-primary text-white rounded-xl text-xs font-bold flex items-center gap-2 shrink-0">
                  <Plus className="w-4 h-4" /> Add User
                </button>
              </div>
            </div>
            <div className="overflow-x-auto border border-slate-200 rounded-xl">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 uppercase text-[10px] text-slate-500 font-bold">
                  <tr>
                    <th className="p-3.5">User</th>
                    <th className="p-3.5">Plan</th>
                    <th className="p-3.5">Status</th>
                    <th className="p-3.5">Joined</th>
                    <th className="p-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredUsers.map((u) => (
                    <tr key={u.id} className="hover:bg-slate-50/50">
                      <td className="p-3.5 font-bold">
                        <div>{u.name}</div>
                        <div className="text-slate-400 font-normal">{u.email}</div>
                      </td>
                      <td className="p-3.5"><span className="px-2 py-0.5 bg-indigo-100 text-indigo-700 font-bold rounded-full">{u.plan}</span></td>
                      <td className="p-3.5"><span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 font-bold rounded-full">{u.status}</span></td>
                      <td className="p-3.5 font-mono">{u.createdAt}</td>
                      <td className="p-3.5 text-right">
                        <button onClick={() => handleDeleteUser(u.id)} className="p-1 text-slate-400 hover:text-rose-600">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* HERO COPY TAB */}
        {activeTab === 'hero' && (
          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-bold text-slate-900">Hero Section Copy Editor</h3>
              <button onClick={() => showToast('Hero Copy Saved & Synced!')} className="px-4 py-2 bg-brand-primary text-white rounded-xl text-xs font-bold flex items-center gap-2">
                <Save className="w-4 h-4" /> Save Copy
              </button>
            </div>
            <div className="space-y-4 max-w-2xl">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Badge Text</label>
                <input
                  type="text"
                  value={heroCopy.badge}
                  onChange={(e) => setHeroCopy({ ...heroCopy, badge: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-medium"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Main Title</label>
                <input
                  type="text"
                  value={heroCopy.title}
                  onChange={(e) => setHeroCopy({ ...heroCopy, title: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-medium"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Highlighted Title Gradient Text</label>
                <input
                  type="text"
                  value={heroCopy.highlightTitle}
                  onChange={(e) => setHeroCopy({ ...heroCopy, highlightTitle: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-medium text-brand-primary font-bold"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Subtitle</label>
                <textarea
                  rows={3}
                  value={heroCopy.subtitle}
                  onChange={(e) => setHeroCopy({ ...heroCopy, subtitle: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-medium"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Primary CTA Button</label>
                  <input
                    type="text"
                    value={heroCopy.primaryCta}
                    onChange={(e) => setHeroCopy({ ...heroCopy, primaryCta: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-medium"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Secondary CTA Button</label>
                  <input
                    type="text"
                    value={heroCopy.secondaryCta}
                    onChange={(e) => setHeroCopy({ ...heroCopy, secondaryCta: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-medium"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* PRICING TAB */}
        {activeTab === 'pricing' && (
          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-bold text-slate-900">Pricing Tier Management</h3>
              <button onClick={() => showToast('Pricing Plans Updated!')} className="px-4 py-2 bg-brand-primary text-white rounded-xl text-xs font-bold flex items-center gap-2">
                <Save className="w-4 h-4" /> Save Pricing
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {pricingPlans.map((plan, idx) => (
                <div key={idx} className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-slate-900">{plan.name}</span>
                    <span className="text-xs font-semibold px-2 py-0.5 bg-slate-200 rounded-md text-slate-700">{plan.badge || 'Plan'}</span>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-slate-400">Monthly Price ($)</label>
                    <input
                      type="number"
                      value={plan.price}
                      onChange={(e) => {
                        const updated = [...pricingPlans];
                        updated[idx].price = Number(e.target.value);
                        setPricingPlans(updated);
                      }}
                      className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-sm font-bold mt-1"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-slate-400">Description</label>
                    <input
                      type="text"
                      value={plan.desc || plan.description || ''}
                      onChange={(e) => {
                        const updated = [...pricingPlans];
                        updated[idx].desc = e.target.value;
                        setPricingPlans(updated);
                      }}
                      className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs mt-1"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* FAQS & CMS TAB */}
        {activeTab === 'cms' && (
          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-bold text-slate-900">FAQ Content Management</h3>
              <button onClick={() => setIsAddFaqOpen(true)} className="px-4 py-2 bg-brand-primary text-white rounded-xl text-xs font-bold flex items-center gap-2">
                <Plus className="w-4 h-4" /> Add FAQ Item
              </button>
            </div>
            <div className="space-y-3">
              {faqs.map((faq, idx) => (
                <div key={idx} className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex justify-between items-start gap-4">
                  <div className="space-y-1">
                    <div className="font-bold text-xs text-slate-900">Q: {faq.q}</div>
                    <div className="text-xs text-slate-600">A: {faq.a}</div>
                  </div>
                  <button onClick={() => handleDeleteFaq(idx)} className="text-slate-400 hover:text-rose-600 p-1">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* BRIEFS TAB */}
        {activeTab === 'briefs' && (
          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 space-y-6">
            <h3 className="text-lg font-bold text-slate-900">Interactive Client Briefs Overview</h3>
            <div className="overflow-x-auto border border-slate-200 rounded-xl">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 uppercase text-[10px] text-slate-500 font-bold">
                  <tr>
                    <th className="p-3.5">Brief Title</th>
                    <th className="p-3.5">Client</th>
                    <th className="p-3.5">Creator Email</th>
                    <th className="p-3.5">Status</th>
                    <th className="p-3.5">Views</th>
                    <th className="p-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {briefs.map((b) => (
                    <tr key={b.id}>
                      <td className="p-3.5 font-bold text-slate-900">{b.title}</td>
                      <td className="p-3.5 text-slate-600 font-medium">{b.clientName}</td>
                      <td className="p-3.5 text-slate-500 font-mono">{b.userEmail}</td>
                      <td className="p-3.5">
                        <span className={`px-2 py-0.5 font-bold rounded-full ${
                          b.status === 'Signed Off' ? 'bg-emerald-100 text-emerald-700' :
                          b.status === 'Active' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-600'
                        }`}>
                          {b.status}
                        </span>
                      </td>
                      <td className="p-3.5 font-bold">{b.views}</td>
                      <td className="p-3.5 text-right">
                        <button onClick={() => handleDeleteBrief(b.id)} className="p-1 text-slate-400 hover:text-rose-600">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* GLOBAL SYSTEM TAB */}
        {activeTab === 'system' && (
          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 space-y-6">
            <h3 className="text-lg font-bold text-slate-900">System Controls & Broadcast Banners</h3>
            <div className="space-y-6 max-w-xl">
              <div className="flex items-center justify-between p-4 bg-slate-50 border border-slate-200 rounded-xl">
                <div>
                  <div className="font-bold text-xs text-slate-900">Maintenance Mode</div>
                  <div className="text-[11px] text-slate-500">Redirects visitors to maintenance overlay</div>
                </div>
                <input
                  type="checkbox"
                  checked={maintenanceMode}
                  onChange={(e) => {
                    setMaintenanceMode(e.target.checked);
                    showToast(e.target.checked ? 'Maintenance Mode Enabled' : 'Maintenance Mode Disabled');
                  }}
                  className="w-5 h-5 accent-brand-primary"
                />
              </div>

              <div className="flex items-center justify-between p-4 bg-slate-50 border border-slate-200 rounded-xl">
                <div>
                  <div className="font-bold text-xs text-slate-900">User Signups Enabled</div>
                  <div className="text-[11px] text-slate-500">Allow new users to register on the site</div>
                </div>
                <input
                  type="checkbox"
                  checked={signupsAllowed}
                  onChange={(e) => {
                    setSignupsAllowed(e.target.checked);
                    showToast(e.target.checked ? 'Signups Allowed' : 'Signups Disabled');
                  }}
                  className="w-5 h-5 accent-brand-primary"
                />
              </div>

              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-bold text-xs text-slate-900">Broadcast Announcement Banner</div>
                    <div className="text-[11px] text-slate-500">Show top banner message across website</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={announcementActive}
                    onChange={(e) => {
                      setAnnouncementActive(e.target.checked);
                      showToast(e.target.checked ? 'Banner Activated' : 'Banner Deactivated');
                    }}
                    className="w-5 h-5 accent-brand-primary"
                  />
                </div>
                <input
                  type="text"
                  value={announcement}
                  onChange={(e) => setAnnouncement(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs font-medium"
                />
              </div>
            </div>
          </div>
        )}

        {/* LEGAL POLICIES TAB */}
        {activeTab === 'legal' && (
          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-bold text-slate-900">Legal Document Editors</h3>
              <button onClick={() => showToast('Legal documents updated!')} className="px-4 py-2 bg-brand-primary text-white rounded-xl text-xs font-bold flex items-center gap-2">
                <Save className="w-4 h-4" /> Save Legal Copy
              </button>
            </div>
            <div className="space-y-6">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Privacy Policy HTML/Text</label>
                <textarea
                  rows={4}
                  value={privacyPolicyText}
                  onChange={(e) => setPrivacyPolicyText(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-mono"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Usage Policy HTML/Text</label>
                <textarea
                  rows={4}
                  value={usagePolicyText}
                  onChange={(e) => setUsagePolicyText(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-mono"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Terms of Service HTML/Text</label>
                <textarea
                  rows={4}
                  value={termsOfServiceText}
                  onChange={(e) => setTermsOfServiceText(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-mono"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ADD USER MODAL */}
      <AnimatePresence>
        {isAddUserOpen && (
          <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-100">
              <div className="flex justify-between items-center mb-4">
                <h4 className="font-bold text-slate-900 text-sm">Create New Account</h4>
                <button onClick={() => setIsAddUserOpen(false)} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
              </div>
              <form onSubmit={handleAddUser} className="space-y-3">
                <input type="text" placeholder="Full Name" required value={newUserName} onChange={(e) => setNewUserName(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs" />
                <input type="email" placeholder="Email Address" required value={newUserEmail} onChange={(e) => setNewUserEmail(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs" />
                <select value={newUserPlan} onChange={(e) => setNewUserPlan(e.target.value as any)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-semibold">
                  <option value="Free">Free Plan</option>
                  <option value="Pro">Pro Plan ($9/mo)</option>
                  <option value="Studio">Studio Plan ($29/mo)</option>
                </select>
                <button type="submit" className="w-full bg-brand-primary text-white font-bold py-3 rounded-xl text-xs uppercase tracking-wider mt-2">Create User</button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ADD FAQ MODAL */}
      <AnimatePresence>
        {isAddFaqOpen && (
          <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-100">
              <div className="flex justify-between items-center mb-4">
                <h4 className="font-bold text-slate-900 text-sm">Add New FAQ Question</h4>
                <button onClick={() => setIsAddFaqOpen(false)} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
              </div>
              <form onSubmit={handleAddFaq} className="space-y-3">
                <input type="text" placeholder="Question" required value={newFaqQuestion} onChange={(e) => setNewFaqQuestion(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-bold" />
                <textarea rows={3} placeholder="Answer" required value={newFaqAnswer} onChange={(e) => setNewFaqAnswer(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-medium" />
                <button type="submit" className="w-full bg-brand-primary text-white font-bold py-3 rounded-xl text-xs uppercase tracking-wider mt-2">Add FAQ</button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}