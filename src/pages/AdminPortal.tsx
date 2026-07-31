import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ShieldCheck, 
  Lock, 
  User, 
  Users, 
  Search, 
  Plus, 
  Trash2, 
  Edit3, 
  CheckCircle, 
  AlertTriangle, 
  Activity, 
  Settings, 
  DollarSign, 
  FileText, 
  LogOut, 
  Key, 
  Server, 
  RefreshCw, 
  BarChart3, 
  Filter, 
  ExternalLink, 
  Zap, 
  Bell, 
  Eye, 
  Database, 
  HelpCircle, 
  Star, 
  Sliders, 
  Layers, 
  Check, 
  X, 
  ShieldAlert,
  Radio,
  Sparkles,
  ChevronRight,
  TrendingUp,
  UserCheck,
  UserX,
  CreditCard,
  MessageSquare,
  Megaphone,
  Save,
  Globe
} from 'lucide-react';
import Logo from '../components/ui/Logo';
import { pricingPlans as defaultPricingPlans, faqList as defaultFaqs, testimonialsList as defaultTestimonials } from '../data';
import { notifyAdminDataChanged, getAdminHeroCopy, getSystemConfig, getAdminPrivacyPolicy, getAdminUsagePolicy, getAdminTermsOfService, syncAndSaveData, getDbSyncStatus, ADMIN_SYNC_EVENT } from '../lib/adminSync';

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

  // Control Center Active Tab
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'briefs' | 'pricing' | 'cms' | 'hero' | 'system' | 'legal'>('overview');

  // Legal Policies States
  const [privacyPolicyText, setPrivacyPolicyText] = useState<string>(() => {
    return localStorage.getItem('briefora_privacy_policy') || getAdminPrivacyPolicy();
  });
  const [usagePolicyText, setUsagePolicyText] = useState<string>(() => {
    return localStorage.getItem('briefora_usage_policy') || getAdminUsagePolicy();
  });
  const [termsOfServiceText, setTermsOfServiceText] = useState<string>(() => {
    return localStorage.getItem('briefora_terms_of_service') || getAdminTermsOfService();
  });

  // Search and Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [userPlanFilter, setUserPlanFilter] = useState<string>('All');
  const [userStatusFilter, setUserStatusFilter] = useState<string>('All');

  // Users Persistence
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
      { id: 'usr-105', name: 'Alexandre Dubois', email: 'alex@duboisagency.fr', plan: 'Studio', status: 'Suspended', createdAt: '2025-05-20', onboarded: true, briefsCount: 22 },
      { id: 'usr-106', name: 'Hana Takahashi', email: 'hana@tokyocreative.jp', plan: 'Pro', status: 'Active', createdAt: '2025-07-20', onboarded: true, briefsCount: 4 },
    ];
  });

  // Briefs Persistence
  const [briefs, setBriefs] = useState<AdminBrief[]>(() => {
    const saved = localStorage.getItem('briefora_admin_briefs');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error(e); }
    }
    return [
      { id: 'brf-901', title: 'Zenli Brand Alignment & Strategy', clientName: 'Zenli Tech Inc.', userEmail: 'devin@brandconsulting.io', status: 'Signed Off', createdAt: '2025-07-28', views: 34 },
      { id: 'brf-902', title: 'Lumora Identity Discovery Brief', clientName: 'Lumora Health', userEmail: 'elena@rostovastudio.com', status: 'Active', createdAt: '2025-07-29', views: 18 },
      { id: 'brf-903', title: 'Syncro Design System Matrix', clientName: 'Syncro Logistics', userEmail: 'marcus@vancedesign.co', status: 'Draft', createdAt: '2025-07-30', views: 5 },
      { id: 'brf-904', title: 'Orbix Rebrand Discovery', clientName: 'Orbix AI', userEmail: 'alex@duboisagency.fr', status: 'Locked', createdAt: '2025-07-22', views: 52 },
    ];
  });

  // Dynamic Pricing Persistence
  const [pricingPlans, setPricingPlans] = useState<any[]>(() => {
    const saved = localStorage.getItem('briefora_admin_pricing');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error(e); }
    }
    return defaultPricingPlans;
  });

  // Dynamic FAQs Persistence
  const [faqs, setFaqs] = useState<any[]>(() => {
    const saved = localStorage.getItem('briefora_admin_faqs');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error(e); }
    }
    return defaultFaqs;
  });

  // Dynamic Testimonials Persistence
  const [testimonials, setTestimonials] = useState<any[]>(() => {
    const saved = localStorage.getItem('briefora_admin_testimonials');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error(e); }
    }
    return defaultTestimonials;
  });

  // Dynamic Hero Copy Persistence
  const [heroCopy, setHeroCopy] = useState(getAdminHeroCopy);

  // System Controls
  const [maintenanceMode, setMaintenanceMode] = useState<boolean>(() => {
    return localStorage.getItem('briefora_maintenance') === 'true';
  });
  const [maintenanceMsg, setMaintenanceMsg] = useState<string>(() => {
    return localStorage.getItem('briefora_maintenance_msg') || 'Breifora is undergoing scheduled system upgrades. We will be back online shortly.';
  });
  const [signupsAllowed, setSignupsAllowed] = useState<boolean>(() => {
    return localStorage.getItem('briefora_signups_enabled') !== 'false';
  });
  const [announcement, setAnnouncement] = useState<string>(() => {
    return localStorage.getItem('briefora_broadcast_msg') || '⚡ Breifora v2.4 Release: Full interactive visual blueprint generator is live!';
  });
  const [announcementActive, setAnnouncementActive] = useState<boolean>(() => {
    return localStorage.getItem('briefora_broadcast_active') === 'true';
  });

  // Audit Logs Persistence
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() => {
    const saved = localStorage.getItem('briefora_admin_logs');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error(e); }
    }
    return [
      { id: 'log-1', action: 'PORTAL_INITIALIZED', target: 'Admin Portal', timestamp: '00:01:00', admin: 'system' },
      { id: 'log-2', action: 'SYNC_REALTIME_HOOKS', target: 'Live Site', timestamp: '00:02:15', admin: 'system' },
    ];
  });

  // Modals state
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserPlan, setNewUserPlan] = useState<'Free' | 'Pro' | 'Studio'>('Pro');

  const [isAddFaqOpen, setIsAddFaqOpen] = useState(false);
  const [newFaqQuestion, setNewFaqQuestion] = useState('');
  const [newFaqAnswer, setNewFaqAnswer] = useState('');

  const [isAddTestimonialOpen, setIsAddTestimonialOpen] = useState(false);
  const [newTestName, setNewTestName] = useState('');
  const [newTestRole, setNewTestRole] = useState('');
  const [newTestTitle, setNewTestTitle] = useState('');
  const [newTestText, setNewTestText] = useState('');
  const [newTestAvatar, setNewTestAvatar] = useState('');

  // Status Notification Toast
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  // Sync state changes to localStorage and Firestore globally
  useEffect(() => {
    syncAndSaveData('briefora_admin_users', users);
  }, [users]);

  useEffect(() => {
    syncAndSaveData('briefora_admin_briefs', briefs);
  }, [briefs]);

  useEffect(() => {
    syncAndSaveData('briefora_admin_pricing', pricingPlans);
  }, [pricingPlans]);

  useEffect(() => {
    syncAndSaveData('briefora_admin_faqs', faqs);
  }, [faqs]);

  useEffect(() => {
    syncAndSaveData('briefora_admin_testimonials', testimonials);
  }, [testimonials]);

  useEffect(() => {
    syncAndSaveData('briefora_admin_hero_copy', heroCopy);
  }, [heroCopy]);

  useEffect(() => {
    syncAndSaveData('briefora_maintenance', String(maintenanceMode));
    syncAndSaveData('briefora_maintenance_msg', maintenanceMsg);
  }, [maintenanceMode, maintenanceMsg]);

  useEffect(() => {
    syncAndSaveData('briefora_signups_enabled', String(signupsAllowed));
  }, [signupsAllowed]);

  useEffect(() => {
    syncAndSaveData('briefora_broadcast_msg', announcement);
    syncAndSaveData('briefora_broadcast_active', String(announcementActive));
  }, [announcement, announcementActive]);

  useEffect(() => {
    syncAndSaveData('briefora_admin_logs', auditLogs);
  }, [auditLogs]);

  useEffect(() => {
    syncAndSaveData('briefora_privacy_policy', privacyPolicyText);
  }, [privacyPolicyText]);

  useEffect(() => {
    syncAndSaveData('briefora_usage_policy', usagePolicyText);
  }, [usagePolicyText]);

  useEffect(() => {
    syncAndSaveData('briefora_terms_of_service', termsOfServiceText);
  }, [termsOfServiceText]);

  // Real-time Cloud Sync Event Listener to refresh Admin Dashboard instantly if cloud data updates
  useEffect(() => {
    const handleSync = () => {
      const savedUsers = localStorage.getItem('briefora_admin_users');
      if (savedUsers) {
        try { setUsers(JSON.parse(savedUsers)); } catch (e) {}
      }
      const savedBriefs = localStorage.getItem('briefora_admin_briefs');
      if (savedBriefs) {
        try { setBriefs(JSON.parse(savedBriefs)); } catch (e) {}
      }
      const savedPricing = localStorage.getItem('briefora_admin_pricing');
      if (savedPricing) {
        try { setPricingPlans(JSON.parse(savedPricing)); } catch (e) {}
      }
      const savedFaqs = localStorage.getItem('briefora_admin_faqs');
      if (savedFaqs) {
        try { setFaqs(JSON.parse(savedFaqs)); } catch (e) {}
      }
      const savedTestimonials = localStorage.getItem('briefora_admin_testimonials');
      if (savedTestimonials) {
        try { setTestimonials(JSON.parse(savedTestimonials)); } catch (e) {}
      }
      const savedHeroCopy = localStorage.getItem('briefora_admin_hero_copy');
      if (savedHeroCopy) {
        try { setHeroCopy(JSON.parse(savedHeroCopy)); } catch (e) {}
      }
      
      const maintenance = localStorage.getItem('briefora_maintenance') === 'true';
      if (maintenance !== maintenanceMode) setMaintenanceMode(maintenance);
      
      const mMsg = localStorage.getItem('briefora_maintenance_msg') || 'Breifora is undergoing scheduled system upgrades. We will be back online shortly.';
      if (mMsg !== maintenanceMsg) setMaintenanceMsg(mMsg);
      
      const signups = localStorage.getItem('briefora_signups_enabled') !== 'false';
      if (signups !== signupsAllowed) setSignupsAllowed(signups);
      
      const bMsg = localStorage.getItem('briefora_broadcast_msg') || '⚡ Breifora v2.4 Release: Full interactive visual blueprint generator is live!';
      if (bMsg !== announcement) setAnnouncement(bMsg);
      
      const bActive = localStorage.getItem('briefora_broadcast_active') === 'true';
      if (bActive !== announcementActive) setAnnouncementActive(bActive);
      
      const savedPrivacy = localStorage.getItem('briefora_privacy_policy');
      if (savedPrivacy && savedPrivacy !== privacyPolicyText) setPrivacyPolicyText(savedPrivacy);
      
      const savedUsage = localStorage.getItem('briefora_usage_policy');
      if (savedUsage && savedUsage !== usagePolicyText) setUsagePolicyText(savedUsage);
      
      const savedTerms = localStorage.getItem('briefora_terms_of_service');
      if (savedTerms && savedTerms !== termsOfServiceText) setTermsOfServiceText(savedTerms);
    };

    window.addEventListener(ADMIN_SYNC_EVENT, handleSync);
    return () => window.removeEventListener(ADMIN_SYNC_EVENT, handleSync);
  }, [maintenanceMode, maintenanceMsg, signupsAllowed, announcement, announcementActive, privacyPolicyText, usagePolicyText, termsOfServiceText]);

  // Helper log function
  const addAuditLog = (action: string, target: string) => {
    const newLog: AuditLog = {
      id: `log-${Date.now()}`,
      action,
      target,
      timestamp: new Date().toLocaleTimeString(),
      admin: 'admin',
    };
    setAuditLogs((prev) => [newLog, ...prev]);
  };

  // Handle Login Submit
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
        setLoginError('Invalid username or password. Please use admin / admin.');
        addAuditLog('ADMIN_LOGIN_FAILED', `Attempted username: ${username}`);
      }
      setIsSubmitting(false);
    }, 400);
  };

  const handleLogout = () => {
    sessionStorage.removeItem('briefora_admin_authed');
    setIsAuthenticated(false);
    addAuditLog('ADMIN_LOGOUT', 'Admin Portal');
  };

  // User Actions
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

    setUsers((prev) => [newUser, ...prev]);
    addAuditLog('CREATE_USER', `Added user ${newUserEmail} (${newUserPlan})`);
    showToast(`Added user ${newUserName}`);
    setNewUserName('');
    setNewUserEmail('');
    setIsAddUserOpen(false);
  };

  const toggleUserStatus = (userId: string) => {
    setUsers((prev) =>
      prev.map((u) => {
        if (u.id === userId) {
          const nextStatus = u.status === 'Active' ? 'Suspended' : 'Active';
          addAuditLog('UPDATE_USER_STATUS', `User ${u.email} -> ${nextStatus}`);
          showToast(`User ${u.name} set to ${nextStatus}`);
          return { ...u, status: nextStatus };
        }
        return u;
      })
    );
  };

  const deleteUser = (userId: string, email: string) => {
    if (confirm(`Are you sure you want to permanently delete user ${email}?`)) {
      setUsers((prev) => prev.filter((u) => u.id !== userId));
      addAuditLog('DELETE_USER', `Deleted user ${email}`);
      showToast(`User ${email} deleted`);
    }
  };

  // Brief Actions
  const toggleBriefStatus = (briefId: string) => {
    setBriefs((prev) =>
      prev.map((b) => {
        if (b.id === briefId) {
          const statuses: ('Active' | 'Signed Off' | 'Draft' | 'Locked')[] = ['Active', 'Signed Off', 'Draft', 'Locked'];
          const nextIdx = (statuses.indexOf(b.status) + 1) % statuses.length;
          const nextStatus = statuses[nextIdx];
          addAuditLog('UPDATE_BRIEF_STATUS', `Brief ${b.id} -> ${nextStatus}`);
          showToast(`Brief status updated to ${nextStatus}`);
          return { ...b, status: nextStatus };
        }
        return b;
      })
    );
  };

  const deleteBrief = (briefId: string, title: string) => {
    if (confirm(`Are you sure you want to delete brief "${title}"?`)) {
      setBriefs((prev) => prev.filter((b) => b.id !== briefId));
      addAuditLog('DELETE_BRIEF', `Deleted brief ${title}`);
      showToast(`Deleted brief "${title}"`);
    }
  };

  // Pricing Edit Handlers
  const handlePriceChange = (planId: string, field: 'priceMonthly' | 'priceAnnual' | 'name' | 'description', value: any) => {
    setPricingPlans((prev) =>
      prev.map((p) => {
        if (p.id === planId) {
          return { ...p, [field]: value };
        }
        return p;
      })
    );
    showToast('Updated pricing plan live!');
  };

  // FAQ Handlers
  const handleAddFaq = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFaqQuestion || !newFaqAnswer) return;
    const item = {
      id: `faq-${Date.now()}`,
      question: newFaqQuestion,
      answer: newFaqAnswer,
    };
    setFaqs((prev: any) => [...prev, item]);
    addAuditLog('ADD_FAQ', `Added FAQ: ${newFaqQuestion.slice(0, 30)}...`);
    showToast('FAQ added and updated live on landing page!');
    setNewFaqQuestion('');
    setNewFaqAnswer('');
    setIsAddFaqOpen(false);
  };

  const deleteFaq = (faqId: string) => {
    setFaqs((prev: any[]) => prev.filter((f) => f.id !== faqId));
    addAuditLog('DELETE_FAQ', `Deleted FAQ ID: ${faqId}`);
    showToast('FAQ deleted live!');
  };

  // Testimonials Handlers
  const handleAddTestimonial = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTestName || !newTestText) return;
    const item = {
      id: `test-${Date.now()}`,
      name: newTestName,
      role: newTestRole || 'Verified Client',
      title: newTestTitle || 'Exceptional Workflow',
      text: newTestText,
      avatar: newTestAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=faces'
    };
    setTestimonials((prev: any) => [item, ...prev]);
    addAuditLog('ADD_TESTIMONIAL', `Added testimonial by ${newTestName}`);
    showToast('Testimonial added and live on landing page!');
    setNewTestName('');
    setNewTestRole('');
    setNewTestTitle('');
    setNewTestText('');
    setNewTestAvatar('');
    setIsAddTestimonialOpen(false);
  };

  const deleteTestimonial = (testId: string) => {
    setTestimonials((prev: any[]) => prev.filter((t, i) => (t.id || `test-${i}`) !== testId));
    addAuditLog('DELETE_TESTIMONIAL', `Deleted testimonial ID: ${testId}`);
    showToast('Testimonial deleted live!');
  };

  // Filtered Users
  const filteredUsers = users.filter((u) => {
    const matchesSearch = u.name.toLowerCase().includes(searchTerm.toLowerCase()) || u.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPlan = userPlanFilter === 'All' || u.plan === userPlanFilter;
    const matchesStatus = userStatusFilter === 'All' || u.status === userStatusFilter;
    return matchesSearch && matchesPlan && matchesStatus;
  });

  // Calculate High level stats
  const totalUsers = users.length;
  const activeProStudio = users.filter((u) => u.plan === 'Pro' || u.plan === 'Studio').length;
  const totalMRR = users.reduce((sum, u) => {
    if (u.plan === 'Pro') return sum + 9;
    if (u.plan === 'Studio') return sum + 29;
    return sum;
  }, 0);

  // UNAUTHENTICATED: Admin Login Form (Matches User Login / Signup UI style exactly!)
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-50/60 text-slate-900 flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden font-sans selection:bg-brand-primary/10 selection:text-brand-primary">
        {/* Background glow matching landing page & user dashboard */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-brand-primary/5 rounded-full blur-3xl pointer-events-none"></div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="relative z-10 w-full max-w-md bg-white border border-slate-200/80 rounded-[32px] p-8 sm:p-10 shadow-xl shadow-slate-200/50"
        >
          {/* Header Branding */}
          <div className="flex flex-col items-center text-center mb-8">
            <div className="p-3 bg-brand-primary/10 border border-brand-primary/20 rounded-2xl mb-4 text-brand-primary">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-primary/10 border border-brand-primary/20 text-brand-primary text-[10px] font-bold tracking-widest uppercase mb-2">
              <Lock className="w-3 h-3" /> Admin Gatekeeper
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Admin Portal Login</h1>
            <p className="text-xs font-semibold text-slate-500 mt-1.5">Manage users, pricing, content & live system parameters</p>
          </div>

          {/* Alert Error Message */}
          {loginError && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mb-6 p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-3 text-rose-600 text-xs font-semibold"
            >
              <AlertTriangle className="w-5 h-5 shrink-0" />
              <span>{loginError}</span>
            </motion.div>
          )}

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                Admin Username
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input 
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="admin"
                  className="w-full bg-slate-50 border border-slate-200 focus:border-brand-primary focus:bg-white rounded-xl pl-10 pr-4 py-3 text-xs text-slate-900 placeholder-slate-400 focus:outline-none transition-all font-medium"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                Admin Password
              </label>
              <div className="relative">
                <Key className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input 
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-50 border border-slate-200 focus:border-brand-primary focus:bg-white rounded-xl pl-10 pr-4 py-3 text-xs text-slate-900 placeholder-slate-400 focus:outline-none transition-all font-medium"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full mt-3 bg-brand-primary hover:bg-brand-primary/90 text-white font-bold py-3.5 rounded-xl text-xs tracking-wider uppercase transition-all shadow-md shadow-brand-primary/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" /> Authenticating...
                </>
              ) : (
                <>
                  Enter Admin Control Center <ChevronRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>



          {/* Back to main site link */}
          <div className="mt-4 text-center">
            <button 
              onClick={() => navigate('/')} 
              className="text-[11px] font-semibold text-slate-500 hover:text-brand-primary transition-colors cursor-pointer"
            >
              ← Back to Breifora Main Website
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  // AUTHENTICATED: Admin Control Center Dashboard (Matches User Dashboard UI style exactly!)
  return (
    <div className="min-h-screen bg-slate-50/60 text-slate-900 flex flex-col font-sans selection:bg-brand-primary/10 selection:text-brand-primary relative">
      
      {/* Toast Notification */}
      <AnimatePresence>
        {toastMsg && (
          <motion.div
            initial={{ opacity: 0, y: -20, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: -20, x: '-50%' }}
            className="fixed top-5 left-1/2 z-50 bg-slate-900 text-white px-5 py-2.5 rounded-full text-xs font-semibold shadow-xl flex items-center gap-2 border border-slate-700 pointer-events-none"
          >
            <CheckCircle className="w-4 h-4 text-emerald-400" />
            <span>{toastMsg}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top Navigation Bar */}
      <header className="bg-white border-b border-slate-200/80 px-6 py-3.5 flex items-center justify-between sticky top-0 z-40 shadow-2xs">
        <div className="flex items-center gap-4">
          <div onClick={() => navigate('/')} className="cursor-pointer flex items-center gap-2.5">
            <Logo iconSize={32} />
          </div>
          <span className="text-slate-300">|</span>
          <div className="flex items-center gap-2 bg-brand-primary/10 border border-brand-primary/20 px-3 py-1 rounded-full">
            <ShieldCheck className="w-3.5 h-3.5 text-brand-primary" />
            <span className="text-[11px] font-bold text-brand-primary tracking-wider uppercase">Admin Control Center</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden md:flex items-center gap-2 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full text-emerald-700 text-xs font-semibold">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            Realtime Sync Active
          </div>

          <button 
            onClick={() => navigate('/')} 
            className="hidden sm:flex items-center gap-1.5 px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition-all cursor-pointer"
          >
            <ExternalLink className="w-3.5 h-3.5" /> Live Site
          </button>

          <button 
            onClick={handleLogout} 
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 rounded-lg text-xs font-bold transition-all cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" /> Logout
          </button>
        </div>
      </header>

      {/* Main Admin Dashboard Container */}
      <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 flex flex-col gap-6">
        
        {/* Navigation Tabs Header */}
        <div className="bg-white rounded-2xl p-1.5 border border-slate-200/80 shadow-2xs flex flex-wrap gap-1">
          <button
            onClick={() => setActiveTab('overview')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'overview' ? 'bg-brand-primary text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Activity className="w-4 h-4" /> System Overview
          </button>

          <button
            onClick={() => setActiveTab('users')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'users' ? 'bg-brand-primary text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Users className="w-4 h-4" /> User Management ({users.length})
          </button>

          <button
            onClick={() => setActiveTab('hero')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'hero' ? 'bg-brand-primary text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Globe className="w-4 h-4" /> Landing Hero Copy
          </button>

          <button
            onClick={() => setActiveTab('pricing')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'pricing' ? 'bg-brand-primary text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <CreditCard className="w-4 h-4" /> Pricing Plans
          </button>

          <button
            onClick={() => setActiveTab('cms')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'cms' ? 'bg-brand-primary text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Layers className="w-4 h-4" /> FAQs & Testimonials
          </button>

          <button
            onClick={() => setActiveTab('briefs')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'briefs' ? 'bg-brand-primary text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <FileText className="w-4 h-4" /> Client Briefs ({briefs.length})
          </button>

          <button
            onClick={() => setActiveTab('system')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'system' ? 'bg-brand-primary text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Settings className="w-4 h-4" /> Global Parameters
          </button>

          <button
            onClick={() => setActiveTab('legal')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'legal' ? 'bg-brand-primary text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <ShieldCheck className="w-4 h-4" /> Legal & Policies
          </button>
        </div>

        {/* TAB 1: SYSTEM OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* KPI Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-2xs">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Registered</span>
                  <div className="p-2 bg-brand-primary/10 rounded-xl text-brand-primary">
                    <Users className="w-5 h-5" />
                  </div>
                </div>
                <div className="mt-3">
                  <span className="text-3xl font-black text-slate-900">{totalUsers}</span>
                  <span className="text-xs text-emerald-600 font-bold ml-2">↑ +18% this month</span>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-2xs">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Paid Subscribers</span>
                  <div className="p-2 bg-purple-50 rounded-xl text-purple-600">
                    <Zap className="w-5 h-5" />
                  </div>
                </div>
                <div className="mt-3">
                  <span className="text-3xl font-black text-slate-900">{activeProStudio}</span>
                  <span className="text-xs text-slate-500 font-semibold ml-2">({Math.round((activeProStudio / totalUsers) * 100)}% conversion)</span>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-2xs">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Estimated MRR</span>
                  <div className="p-2 bg-emerald-50 rounded-xl text-emerald-600">
                    <DollarSign className="w-5 h-5" />
                  </div>
                </div>
                <div className="mt-3">
                  <span className="text-3xl font-black text-slate-900">${totalMRR}</span>
                  <span className="text-xs text-emerald-600 font-bold ml-2">/month active</span>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-2xs">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Active Client Briefs</span>
                  <div className="p-2 bg-amber-50 rounded-xl text-amber-600">
                    <FileText className="w-5 h-5" />
                  </div>
                </div>
                <div className="mt-3">
                  <span className="text-3xl font-black text-slate-900">{briefs.length}</span>
                  <span className="text-xs text-slate-500 font-semibold ml-2">across workspaces</span>
                </div>
              </div>
            </div>

            {/* Quick Control Center Panel */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-2xs space-y-4">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Sliders className="w-5 h-5 text-brand-primary" /> Live System Switchboard
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
                {/* Maintenance Toggle */}
                <div className="p-4 rounded-xl border border-slate-200/80 bg-slate-50/50 flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">Maintenance Mode</h4>
                    <p className="text-[11px] text-slate-500 mt-0.5">Redirect users to upgrade screen</p>
                  </div>
                  <button
                    onClick={() => {
                      setMaintenanceMode(!maintenanceMode);
                      showToast(`Maintenance mode turned ${!maintenanceMode ? 'ON' : 'OFF'}`);
                    }}
                    className={`w-12 h-6 rounded-full p-1 transition-colors cursor-pointer ${
                      maintenanceMode ? 'bg-amber-500' : 'bg-slate-300'
                    }`}
                  >
                    <div className={`w-4 h-4 rounded-full bg-white transition-transform ${maintenanceMode ? 'translate-x-6' : 'translate-x-0'}`} />
                  </button>
                </div>

                {/* Registration Toggle */}
                <div className="p-4 rounded-xl border border-slate-200/80 bg-slate-50/50 flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">New User Signups</h4>
                    <p className="text-[11px] text-slate-500 mt-0.5">Enable or pause registrations</p>
                  </div>
                  <button
                    onClick={() => {
                      setSignupsAllowed(!signupsAllowed);
                      showToast(`Signups ${!signupsAllowed ? 'ENABLED' : 'PAUSED'}`);
                    }}
                    className={`w-12 h-6 rounded-full p-1 transition-colors cursor-pointer ${
                      signupsAllowed ? 'bg-brand-primary' : 'bg-slate-300'
                    }`}
                  >
                    <div className={`w-4 h-4 rounded-full bg-white transition-transform ${signupsAllowed ? 'translate-x-6' : 'translate-x-0'}`} />
                  </button>
                </div>

                {/* Broadcast Banner Toggle */}
                <div className="p-4 rounded-xl border border-slate-200/80 bg-slate-50/50 flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">Global Announcement Bar</h4>
                    <p className="text-[11px] text-slate-500 mt-0.5">Show notice banner on top</p>
                  </div>
                  <button
                    onClick={() => {
                      setAnnouncementActive(!announcementActive);
                      showToast(`Announcement banner ${!announcementActive ? 'ENABLED' : 'HIDDEN'}`);
                    }}
                    className={`w-12 h-6 rounded-full p-1 transition-colors cursor-pointer ${
                      announcementActive ? 'bg-brand-primary' : 'bg-slate-300'
                    }`}
                  >
                    <div className={`w-4 h-4 rounded-full bg-white transition-transform ${announcementActive ? 'translate-x-6' : 'translate-x-0'}`} />
                  </button>
                </div>
              </div>
            </div>

            {/* Audit Activity Log */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-2xs space-y-4">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Activity className="w-5 h-5 text-brand-primary" /> Live Audit Trail
              </h3>
              <div className="divide-y divide-slate-100 max-h-60 overflow-y-auto">
                {auditLogs.map((log) => (
                  <div key={log.id} className="py-2.5 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-3">
                      <span className="px-2 py-0.5 bg-slate-100 font-mono text-[10px] text-slate-600 rounded font-bold">
                        {log.timestamp}
                      </span>
                      <span className="font-bold text-brand-primary">{log.action}</span>
                      <span className="text-slate-600">{log.target}</span>
                    </div>
                    <span className="text-[10px] font-semibold text-slate-400">By {log.admin}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: USER MANAGEMENT */}
        {activeTab === 'users' && (
          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-2xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900">User Accounts Database</h3>
                <p className="text-xs text-slate-500 mt-0.5">Search, add, suspend or change user plan permissions</p>
              </div>

              <button
                onClick={() => setIsAddUserOpen(true)}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-primary hover:bg-brand-primary/90 text-white text-xs font-bold cursor-pointer transition-all shadow-xs"
              >
                <Plus className="w-4 h-4" /> Add New User
              </button>
            </div>

            {/* Filter Bar */}
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <div className="relative flex-1 w-full">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search user by name or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-brand-primary"
                />
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <select
                  value={userPlanFilter}
                  onChange={(e) => setUserPlanFilter(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 focus:outline-none"
                >
                  <option value="All">All Tiers</option>
                  <option value="Free">Free</option>
                  <option value="Pro">Pro</option>
                  <option value="Studio">Studio</option>
                </select>

                <select
                  value={userStatusFilter}
                  onChange={(e) => setUserStatusFilter(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 focus:outline-none"
                >
                  <option value="All">All Statuses</option>
                  <option value="Active">Active</option>
                  <option value="Suspended">Suspended</option>
                </select>
              </div>
            </div>

            {/* Users Table */}
            <div className="overflow-x-auto border border-slate-200/80 rounded-xl">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200/80 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="p-3.5">User</th>
                    <th className="p-3.5">Plan Tier</th>
                    <th className="p-3.5">Status</th>
                    <th className="p-3.5">Joined</th>
                    <th className="p-3.5">Briefs</th>
                    <th className="p-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredUsers.map((u) => (
                    <tr key={u.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="p-3.5">
                        <div className="font-bold text-slate-900">{u.name}</div>
                        <div className="text-[11px] text-slate-500">{u.email}</div>
                      </td>
                      <td className="p-3.5">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                          u.plan === 'Studio' ? 'bg-purple-100 text-purple-700' :
                          u.plan === 'Pro' ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-700'
                        }`}>
                          {u.plan}
                        </span>
                      </td>
                      <td className="p-3.5">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          u.status === 'Active' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                        }`}>
                          {u.status}
                        </span>
                      </td>
                      <td className="p-3.5 text-slate-600 font-mono text-[11px]">{u.createdAt}</td>
                      <td className="p-3.5 text-slate-700 font-bold">{u.briefsCount}</td>
                      <td className="p-3.5 text-right space-x-2">
                        <button
                          onClick={() => toggleUserStatus(u.id)}
                          className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-bold text-[11px] cursor-pointer"
                        >
                          {u.status === 'Active' ? 'Suspend' : 'Activate'}
                        </button>
                        <button
                          onClick={() => deleteUser(u.id, u.email)}
                          className="p-1.5 hover:bg-rose-50 text-rose-600 rounded-lg cursor-pointer"
                          title="Delete User"
                        >
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

        {/* TAB 3: LANDING HERO COPY */}
        {activeTab === 'hero' && (
          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-2xs space-y-6 max-w-3xl">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Landing Page Hero Section</h3>
              <p className="text-xs text-slate-500 mt-0.5">Changes saved here update the live landing page immediately</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Hero Badge Text</label>
                <input
                  type="text"
                  value={heroCopy.badge}
                  onChange={(e) => setHeroCopy({ ...heroCopy, badge: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-brand-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Headline Main Text</label>
                <input
                  type="text"
                  value={heroCopy.title}
                  onChange={(e) => setHeroCopy({ ...heroCopy, title: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-brand-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Headline Highlight Text (Colored)</label>
                <input
                  type="text"
                  value={heroCopy.highlightTitle}
                  onChange={(e) => setHeroCopy({ ...heroCopy, highlightTitle: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-brand-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Subtitle Paragraph</label>
                <textarea
                  rows={3}
                  value={heroCopy.subtitle}
                  onChange={(e) => setHeroCopy({ ...heroCopy, subtitle: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-xs text-slate-900 focus:outline-none focus:border-brand-primary"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Primary CTA Button Label</label>
                  <input
                    type="text"
                    value={heroCopy.primaryCta}
                    onChange={(e) => setHeroCopy({ ...heroCopy, primaryCta: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-brand-primary"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Secondary CTA Button Label</label>
                  <input
                    type="text"
                    value={heroCopy.secondaryCta}
                    onChange={(e) => setHeroCopy({ ...heroCopy, secondaryCta: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-brand-primary"
                  />
                </div>
              </div>

              <button
                onClick={() => {
                  showToast('Landing page hero section updated live!');
                  addAuditLog('UPDATE_HERO_COPY', 'Hero Section');
                }}
                className="px-5 py-2.5 bg-brand-primary hover:bg-brand-primary/90 text-white rounded-xl text-xs font-bold cursor-pointer transition-all shadow-xs flex items-center gap-2"
              >
                <Save className="w-4 h-4" /> Save & Update Live
              </button>
            </div>
          </div>
        )}

        {/* TAB 4: PRICING PLANS */}
        {activeTab === 'pricing' && (
          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-2xs space-y-6">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Live Pricing Plans</h3>
              <p className="text-xs text-slate-500 mt-0.5">Edit prices or descriptions to update the live pricing grid instantly</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {pricingPlans.map((plan) => (
                <div key={plan.id} className="border border-slate-200 rounded-2xl p-5 bg-slate-50/50 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 text-sm">{plan.name}</span>
                    {plan.popular && <span className="px-2 py-0.5 bg-brand-primary text-white text-[10px] font-bold rounded-full">POPULAR</span>}
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 uppercase">Monthly Price ($)</label>
                    <input
                      type="number"
                      value={plan.priceMonthly}
                      onChange={(e) => handlePriceChange(plan.id, 'priceMonthly', Number(e.target.value))}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm font-bold text-slate-900 mt-1"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 uppercase">Annual Price ($ / mo)</label>
                    <input
                      type="number"
                      value={plan.priceAnnual}
                      onChange={(e) => handlePriceChange(plan.id, 'priceAnnual', Number(e.target.value))}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm font-bold text-slate-900 mt-1"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 uppercase">Description</label>
                    <textarea
                      rows={2}
                      value={plan.description}
                      onChange={(e) => handlePriceChange(plan.id, 'description', e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-xs text-slate-700 mt-1"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 5: CMS FAQS & TESTIMONIALS */}
        {activeTab === 'cms' && (
          <div className="space-y-6">
            {/* FAQs Management */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-2xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Frequently Asked Questions ({faqs.length})</h3>
                  <p className="text-xs text-slate-500 mt-0.5">Manage questions shown on landing page</p>
                </div>

                <button
                  onClick={() => setIsAddFaqOpen(true)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-brand-primary text-white text-xs font-bold cursor-pointer"
                >
                  <Plus className="w-4 h-4" /> Add FAQ
                </button>
              </div>

              <div className="space-y-3">
                {faqs.map((faq: any) => (
                  <div key={faq.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 flex items-start justify-between gap-4">
                    <div>
                      <h4 className="font-bold text-slate-900 text-xs">{faq.question}</h4>
                      <p className="text-xs text-slate-600 mt-1">{faq.answer}</p>
                    </div>
                    <button
                      onClick={() => deleteFaq(faq.id)}
                      className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg cursor-pointer shrink-0"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Testimonials Management */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-2xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Wall of Love Testimonials ({testimonials.length})</h3>
                  <p className="text-xs text-slate-500 mt-0.5">Manage reviews shown in continuous scroll ticker</p>
                </div>

                <button
                  onClick={() => setIsAddTestimonialOpen(true)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-brand-primary text-white text-xs font-bold cursor-pointer"
                >
                  <Plus className="w-4 h-4" /> Add Review
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {testimonials.map((test: any, idx: number) => (
                  <div key={test.id || idx} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 flex items-start justify-between gap-3">
                    <div>
                      <div className="font-bold text-slate-900 text-xs">{test.name} — <span className="text-slate-500 font-normal">{test.role}</span></div>
                      <div className="font-bold text-brand-primary text-xs mt-1">"{test.title}"</div>
                      <p className="text-xs text-slate-600 mt-1 italic">{test.text}</p>
                    </div>
                    <button
                      onClick={() => deleteTestimonial(test.id || `test-${idx}`)}
                      className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg cursor-pointer shrink-0"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 6: CLIENT BRIEFS */}
        {activeTab === 'briefs' && (
          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-2xs space-y-6">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Client Briefs Activity ({briefs.length})</h3>
              <p className="text-xs text-slate-500 mt-0.5">Inspect or change status of active client briefs</p>
            </div>

            <div className="overflow-x-auto border border-slate-200/80 rounded-xl">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200/80 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="p-3.5">Brief Title</th>
                    <th className="p-3.5">Client</th>
                    <th className="p-3.5">Designer Email</th>
                    <th className="p-3.5">Status</th>
                    <th className="p-3.5">Views</th>
                    <th className="p-3.5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {briefs.map((b) => (
                    <tr key={b.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="p-3.5 font-bold text-slate-900">{b.title}</td>
                      <td className="p-3.5 text-slate-700">{b.clientName}</td>
                      <td className="p-3.5 text-slate-500">{b.userEmail}</td>
                      <td className="p-3.5">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                          b.status === 'Signed Off' ? 'bg-emerald-100 text-emerald-700' :
                          b.status === 'Active' ? 'bg-brand-primary/10 text-brand-primary' :
                          b.status === 'Locked' ? 'bg-rose-100 text-rose-700' : 'bg-slate-100 text-slate-600'
                        }`}>
                          {b.status}
                        </span>
                      </td>
                      <td className="p-3.5 font-bold text-slate-700">{b.views}</td>
                      <td className="p-3.5 text-right space-x-2">
                        <button
                          onClick={() => toggleBriefStatus(b.id)}
                          className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-bold text-[11px] cursor-pointer"
                        >
                          Cycle Status
                        </button>
                        <button
                          onClick={() => deleteBrief(b.id, b.title)}
                          className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg cursor-pointer"
                        >
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

        {/* TAB 7: GLOBAL PARAMETERS */}
        {activeTab === 'system' && (
          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-2xs space-y-6 max-w-3xl">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Global System Parameters</h3>
              <p className="text-xs text-slate-500 mt-0.5">Control live site banners, maintenance text, and signups</p>
            </div>

            <div className="space-y-5">
              <div className="p-4 border border-slate-200 rounded-2xl bg-slate-50/50 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">Broadcast Banner Text</h4>
                    <p className="text-[11px] text-slate-500">Notice banner displayed at top of main site</p>
                  </div>
                  <button
                    onClick={() => setAnnouncementActive(!announcementActive)}
                    className={`px-3 py-1 rounded-full text-xs font-bold cursor-pointer ${
                      announcementActive ? 'bg-brand-primary text-white' : 'bg-slate-200 text-slate-600'
                    }`}
                  >
                    {announcementActive ? 'Active' : 'Disabled'}
                  </button>
                </div>
                <input
                  type="text"
                  value={announcement}
                  onChange={(e) => setAnnouncement(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-brand-primary"
                />
              </div>

              <div className="p-4 border border-slate-200 rounded-2xl bg-slate-50/50 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">Maintenance Mode Screen Message</h4>
                    <p className="text-[11px] text-slate-500">Displayed when maintenance mode is active</p>
                  </div>
                  <button
                    onClick={() => setMaintenanceMode(!maintenanceMode)}
                    className={`px-3 py-1 rounded-full text-xs font-bold cursor-pointer ${
                      maintenanceMode ? 'bg-amber-500 text-white' : 'bg-slate-200 text-slate-600'
                    }`}
                  >
                    {maintenanceMode ? 'Maintenance ON' : 'Maintenance OFF'}
                  </button>
                </div>
                <textarea
                  rows={2}
                  value={maintenanceMsg}
                  onChange={(e) => setMaintenanceMsg(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl p-3 text-xs text-slate-900 focus:outline-none focus:border-brand-primary"
                />
              </div>

              <div className="p-4 border border-slate-200 rounded-2xl bg-slate-50/50 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-slate-900">User Signups Registration</h4>
                  <p className="text-[11px] text-slate-500">Allow new users to register on Breifora</p>
                </div>
                <button
                  onClick={() => setSignupsAllowed(!signupsAllowed)}
                  className={`px-3 py-1 rounded-full text-xs font-bold cursor-pointer ${
                    signupsAllowed ? 'bg-emerald-600 text-white' : 'bg-rose-500 text-white'
                  }`}
                >
                  {signupsAllowed ? 'Signups Allowed' : 'Signups Paused'}
                </button>
              </div>

              {/* CLOUD DB SYNCHRONIZATION PARAMETERS */}
              <div className="p-5 border border-slate-200 rounded-2xl bg-slate-50/50 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Globe className="w-5 h-5 text-brand-primary" />
                    <h4 className="text-xs font-bold text-slate-900 font-sans">Global Cloud Sync Status</h4>
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold ${
                    getDbSyncStatus().connected 
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' 
                      : 'bg-amber-100 text-amber-800 border border-amber-300'
                  }`}>
                    {getDbSyncStatus().connected ? '🟢 Connected (Firestore Live)' : '🟡 Local Storage Offline Cache'}
                  </span>
                </div>

                <div className="text-xs space-y-2 text-slate-600 leading-relaxed">
                  <p>
                    By default, changes made in this admin dashboard only persist inside your <strong>own browser storage</strong>. To instantly sync pricing changes (such as <strong>pro plan $9 &rarr; $0</strong>), user logs, legal agreements, and system states in real-time for visitors globally across all browsers, you can link this live site (Netlify/Vercel) to a free Google Firebase Firestore database.
                  </p>
                </div>

                {/* DB Sync Settings Guidelines */}
                <div className="bg-white border border-slate-200/85 rounded-xl p-4 space-y-3">
                  <h5 className="text-[11px] font-bold text-slate-800 uppercase tracking-wide">🚀 Connect in 1 Minute (100% Free):</h5>
                  <ol className="list-decimal list-inside text-[11px] text-slate-500 space-y-2 leading-relaxed">
                    <li>Go to the <a href="https://console.firebase.google.com/" target="_blank" rel="noreferrer" className="text-brand-primary font-bold underline">Firebase Console</a> and create a standard project.</li>
                    <li>Add a <strong>Web App</strong> to retrieve your configuration credentials.</li>
                    <li>Inside your Netlify Dashboard (or local <code>.env</code> file), navigate to <strong>Site Settings &rarr; Environment Variables</strong>.</li>
                    <li>Add the following 6 environment keys copied from your configuration object:</li>
                  </ol>

                  <div className="bg-slate-950 text-slate-200 rounded-lg p-3 font-mono text-[10px] space-y-1 block select-all overflow-x-auto leading-normal">
                    <div>VITE_FIREBASE_API_KEY="..."</div>
                    <div>VITE_FIREBASE_AUTH_DOMAIN="..."</div>
                    <div>VITE_FIREBASE_PROJECT_ID="..."</div>
                    <div>VITE_FIREBASE_STORAGE_BUCKET="..."</div>
                    <div>VITE_FIREBASE_MESSAGING_SENDER_ID="..."</div>
                    <div>VITE_FIREBASE_APP_ID="..."</div>
                  </div>

                  <p className="text-[10px] text-slate-400 leading-normal">
                    Once defined, redeploy your site, and the platform will automatically boot in <strong>Cloud Live Mode</strong>, giving you 1000% real-time synchronized control.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 8: LEGAL & POLICIES MANAGEMENT */}
        {activeTab === 'legal' && (
          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-2xs space-y-6">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Legal Agreements & Policies</h3>
              <p className="text-xs text-slate-500 mt-0.5">Edit and manage Privacy Policy, Usage Policy, and Terms of Service directly. Changes take effect instantly across the live platform.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Privacy Policy Panel */}
              <div className="border border-slate-200/80 rounded-2xl p-5 bg-slate-50/50 flex flex-col justify-between space-y-4">
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-brand-primary" />
                    <h4 className="text-sm font-bold text-slate-900">Privacy Policy</h4>
                  </div>
                  <p className="text-xs text-slate-500">Governs data storage and encryption policies.</p>
                  <textarea
                    rows={16}
                    value={privacyPolicyText}
                    onChange={(e) => setPrivacyPolicyText(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl p-3 text-xs text-slate-900 focus:outline-none focus:border-brand-primary font-mono leading-relaxed"
                    placeholder="HTML content or text..."
                  />
                </div>
                <button
                  onClick={() => {
                    addAuditLog('Updated Privacy Policy text', 'Privacy Policy Content');
                    showToast('Privacy Policy updated successfully!');
                  }}
                  className="w-full py-2.5 bg-brand-primary hover:bg-brand-primary/90 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-1.5 cursor-pointer border-none"
                >
                  <Save className="w-3.5 h-3.5" /> Save Changes
                </button>
              </div>

              {/* Usage Policy Panel */}
              <div className="border border-slate-200/80 rounded-2xl p-5 bg-slate-50/50 flex flex-col justify-between space-y-4">
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-brand-primary" />
                    <h4 className="text-sm font-bold text-slate-900">Usage Policy</h4>
                  </div>
                  <p className="text-xs text-slate-500">Governs acceptable parameters and client requirements.</p>
                  <textarea
                    rows={16}
                    value={usagePolicyText}
                    onChange={(e) => setUsagePolicyText(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl p-3 text-xs text-slate-900 focus:outline-none focus:border-brand-primary font-mono leading-relaxed"
                    placeholder="HTML content or text..."
                  />
                </div>
                <button
                  onClick={() => {
                    addAuditLog('Updated Usage Policy text', 'Usage Policy Content');
                    showToast('Usage Policy updated successfully!');
                  }}
                  className="w-full py-2.5 bg-brand-primary hover:bg-brand-primary/90 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-1.5 cursor-pointer border-none"
                >
                  <Save className="w-3.5 h-3.5" /> Save Changes
                </button>
              </div>

              {/* Terms of Service Panel */}
              <div className="border border-slate-200/80 rounded-2xl p-5 bg-slate-50/50 flex flex-col justify-between space-y-4">
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-2">
                    <FileText className="w-5 h-5 text-brand-primary" />
                    <h4 className="text-sm font-bold text-slate-900">Terms of Service</h4>
                  </div>
                  <p className="text-xs text-slate-500">Governs agreements, subscriptions, and liabilities.</p>
                  <textarea
                    rows={16}
                    value={termsOfServiceText}
                    onChange={(e) => setTermsOfServiceText(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl p-3 text-xs text-slate-900 focus:outline-none focus:border-brand-primary font-mono leading-relaxed"
                    placeholder="HTML content or text..."
                  />
                </div>
                <button
                  onClick={() => {
                    addAuditLog('Updated Terms of Service text', 'Terms of Service Content');
                    showToast('Terms of Service updated successfully!');
                  }}
                  className="w-full py-2.5 bg-brand-primary hover:bg-brand-primary/90 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-1.5 cursor-pointer border-none"
                >
                  <Save className="w-3.5 h-3.5" /> Save Changes
                </button>
              </div>
            </div>
          </div>
        )}

      </div>

      {/* ADD USER MODAL */}
      {isAddUserOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full border border-slate-200 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900">Add New User Account</h3>
              <button onClick={() => setIsAddUserOpen(false)} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddUser} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={newUserName}
                  onChange={(e) => setNewUserName(e.target.value)}
                  placeholder="e.g. Maya Lin"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  value={newUserEmail}
                  onChange={(e) => setNewUserEmail(e.target.value)}
                  placeholder="e.g. maya@studio.com"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Plan Tier</label>
                <select
                  value={newUserPlan}
                  onChange={(e) => setNewUserPlan(e.target.value as any)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900"
                >
                  <option value="Free">Free</option>
                  <option value="Pro">Pro ($9/mo)</option>
                  <option value="Studio">Studio ($29/mo)</option>
                </select>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddUserOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-brand-primary hover:bg-brand-primary/90 text-white rounded-xl text-xs font-bold cursor-pointer"
                >
                  Create User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADD FAQ MODAL */}
      {isAddFaqOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full border border-slate-200 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900">Add New FAQ</h3>
              <button onClick={() => setIsAddFaqOpen(false)} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddFaq} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Question</label>
                <input
                  type="text"
                  required
                  value={newFaqQuestion}
                  onChange={(e) => setNewFaqQuestion(e.target.value)}
                  placeholder="e.g. Can I export my blueprints?"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Answer</label>
                <textarea
                  rows={3}
                  required
                  value={newFaqAnswer}
                  onChange={(e) => setNewFaqAnswer(e.target.value)}
                  placeholder="e.g. Yes, all blueprints export cleanly to PDF..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-900"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddFaqOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-brand-primary hover:bg-brand-primary/90 text-white rounded-xl text-xs font-bold cursor-pointer"
                >
                  Publish FAQ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADD TESTIMONIAL MODAL */}
      {isAddTestimonialOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full border border-slate-200 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900">Add Testimonial Review</h3>
              <button onClick={() => setIsAddTestimonialOpen(false)} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddTestimonial} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Author Name</label>
                <input
                  type="text"
                  required
                  value={newTestName}
                  onChange={(e) => setNewTestName(e.target.value)}
                  placeholder="e.g. Sophia Martinez"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Role / Studio</label>
                <input
                  type="text"
                  value={newTestRole}
                  onChange={(e) => setNewTestRole(e.target.value)}
                  placeholder="e.g. Lead Brand Designer"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Review Headline</label>
                <input
                  type="text"
                  value={newTestTitle}
                  onChange={(e) => setNewTestTitle(e.target.value)}
                  placeholder="e.g. Zero revision friction"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Review Text</label>
                <textarea
                  rows={3}
                  required
                  value={newTestText}
                  onChange={(e) => setNewTestText(e.target.value)}
                  placeholder="e.g. Breifora transformed how we lock scope with high-ticket clients..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-900"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddTestimonialOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-brand-primary hover:bg-brand-primary/90 text-white rounded-xl text-xs font-bold cursor-pointer"
                >
                  Publish Review
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
