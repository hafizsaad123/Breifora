import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ShieldCheck, Lock, User, Users, Plus, Trash2, 
  CheckCircle, AlertTriangle, Activity, Settings, 
  FileText, LogOut, Key, RefreshCw, Layers, X, 
  ChevronRight, CreditCard, Save, Globe, ExternalLink,
  Menu, Inbox, Star, MessageSquare, Briefcase, PlusCircle,
  Clock, Eye, Sliders, Check, HelpCircle
} from 'lucide-react';
import Logo from '../components/ui/Logo';
import { pricingPlans as defaultPricingPlans, faqList as defaultFaqs, testimonialsList as defaultTestimonials } from '../data';
import { 
  getAdminHeroCopy, getAdminPrivacyPolicy, 
  getAdminUsagePolicy, getAdminTermsOfService, syncAndSaveData, fetchSyncedData, supabase
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

interface ContactSubmission {
  id: string;
  full_name: string;
  email: string;
  subject: string;
  message: string;
  status: 'unread' | 'read' | 'responded';
  created_at: string;
  synced_online?: boolean;
}

interface TestimonialItem {
  id: string;
  quote: string;
  author: string;
  role: string;
  avatar: string;
  rating?: number;
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
  const [activeTab, setActiveTab] = useState<'overview' | 'system' | 'pricing' | 'hero' | 'cms' | 'legal' | 'users' | 'briefs' | 'submissions'>('overview');
  
  // Mobile Sidebar State
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Legal Policies
  const [privacyPolicyText, setPrivacyPolicyText] = useState<string>(() => localStorage.getItem('briefora_admin_privacy_policy') || localStorage.getItem('briefora_privacy_policy') || getAdminPrivacyPolicy());
  const [usagePolicyText, setUsagePolicyText] = useState<string>(() => localStorage.getItem('briefora_admin_usage_policy') || localStorage.getItem('briefora_usage_policy') || getAdminUsagePolicy());
  const [termsOfServiceText, setTermsOfServiceText] = useState<string>(() => localStorage.getItem('briefora_admin_terms_of_service') || localStorage.getItem('briefora_terms_of_service') || getAdminTermsOfService());

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
  const [testimonials, setTestimonials] = useState<TestimonialItem[]>(() => {
    const saved = localStorage.getItem('briefora_admin_testimonials');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error(e); }
    }
    return defaultTestimonials;
  });
  const [heroCopy, setHeroCopy] = useState(getAdminHeroCopy);

  // System Toggles
  const [maintenanceMode, setMaintenanceMode] = useState<boolean>(() => {
    const m1 = localStorage.getItem('briefora_admin_maintenance');
    const m2 = localStorage.getItem('briefora_maintenance');
    return m1 === 'true' || m2 === 'true';
  });
  const [signupsAllowed, setSignupsAllowed] = useState<boolean>(() => localStorage.getItem('briefora_admin_signups_enabled') !== 'false');
  const [announcement, setAnnouncement] = useState<string>(() => localStorage.getItem('briefora_admin_broadcast_msg') || localStorage.getItem('briefora_broadcast_msg') || '⚡ Briefora v2.4 Live!');
  const [announcementActive, setAnnouncementActive] = useState<boolean>(() => localStorage.getItem('briefora_admin_broadcast_active') === 'true' || localStorage.getItem('briefora_broadcast_active') === 'true');

  // Support submissions feed
  const [submissions, setSubmissions] = useState<ContactSubmission[]>(() => {
    const saved = localStorage.getItem('briefora_contact_submissions');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error(e); }
    }
    return [
      {
        id: 'sub-1',
        full_name: 'Sarah Connor',
        email: 'sarah@cyberdyne.jp',
        subject: 'Inquiry about Studio Plan White-labeling',
        message: 'Hello, we are looking to use Briefora for our agency. Can we set up custom domain hosting with white-labeling right out of the box on the Studio plan? Thank you!',
        status: 'unread',
        created_at: new Date(Date.now() - 3600000 * 2).toISOString(),
      },
      {
        id: 'sub-2',
        full_name: 'Tony Stark',
        email: 'tony@starkindustries.com',
        subject: 'Figma and Notion integration question',
        message: 'Does the Pro plan live iframe embed support deep linking and custom dark themes for Figma frames? I want to integrate it into our internal wiki.',
        status: 'read',
        created_at: new Date(Date.now() - 3600000 * 24).toISOString(),
      },
      {
        id: 'sub-3',
        full_name: 'Bruce Wayne',
        email: 'bruce@waynecorp.com',
        subject: 'Custom Security & Privacy Compliance',
        message: 'We require a custom SLA and local data hosting within the EU. Please let us know if your enterprise options support this model.',
        status: 'responded',
        created_at: new Date(Date.now() - 3600000 * 48).toISOString(),
      }
    ];
  });

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

  const [isAddReviewOpen, setIsAddReviewOpen] = useState(false);
  const [newReviewAuthor, setNewReviewAuthor] = useState('');
  const [newReviewRole, setNewReviewRole] = useState('');
  const [newReviewQuote, setNewReviewQuote] = useState('');
  const [newReviewAvatar, setNewReviewAvatar] = useState('https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=faces');

  const [selectedSubmission, setSelectedSubmission] = useState<ContactSubmission | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const addAuditLog = (action: string, target: string) => {
    const newLog: AuditLog = { 
      id: `log-${Date.now()}`, 
      action, 
      target, 
      timestamp: new Date().toLocaleTimeString(), 
      admin: 'admin'
    };
    setAuditLogs((prev) => [newLog, ...prev]);
  };

  // Initial Sync from Supabase Cloud on mount
  useEffect(() => {
    async function loadCloudSettings() {
      const fetchedPricing = await fetchSyncedData('pricing', pricingPlans);
      if (fetchedPricing) setPricingPlans(fetchedPricing);

      const fetchedHero = await fetchSyncedData('hero_copy', heroCopy);
      if (fetchedHero) setHeroCopy(fetchedHero);

      const fetchedFaqs = await fetchSyncedData('faqs', faqs);
      if (fetchedFaqs) setFaqs(fetchedFaqs);

      const fetchedTestimonials = await fetchSyncedData('testimonials', testimonials);
      if (fetchedTestimonials) setTestimonials(fetchedTestimonials);

      // Load Live Contact submissions
      if (supabase) {
        try {
          const { data, error } = await supabase
            .from('contact_submissions')
            .select('*')
            .order('created_at', { ascending: false });
          if (data && !error) {
            setSubmissions(data.map((item: any) => ({
              ...item,
              id: item.id?.toString() || 'sub-' + Math.random().toString(),
              status: item.status || 'unread'
            })));
            localStorage.setItem('briefora_contact_submissions', JSON.stringify(data));
          }
        } catch (err) {
          console.error('Error fetching submissions from Supabase:', err);
        }
      }
    }
    loadCloudSettings();
  }, []);

  // Save loading states
  const [isPricingSaving, setIsPricingSaving] = useState(false);
  const [isHeroSaving, setIsHeroSaving] = useState(false);
  const [isFaqReviewsSaving, setIsFaqReviewsSaving] = useState(false);
  const [isLegalSaving, setIsLegalSaving] = useState(false);
  const [isSystemSaving, setIsSystemSaving] = useState(false);

  // Save Handlers
  const handleSavePricing = async () => {
    setIsPricingSaving(true);
    try {
      await syncAndSaveData('pricing_settings', pricingPlans);
      await syncAndSaveData('pricing', pricingPlans);
      addAuditLog('UPDATE_PRICING', 'Pricing Plans Settings');
      showToast('Pricing Plans Saved & Synced to Supabase!');
    } catch (err) {
      console.error(err);
      showToast('Error syncing pricing plans');
    } finally {
      setIsPricingSaving(false);
    }
  };

  const handleSaveHeroCopy = async () => {
    setIsHeroSaving(true);
    try {
      await syncAndSaveData('hero_settings', heroCopy);
      await syncAndSaveData('hero_copy', heroCopy);
      addAuditLog('UPDATE_HERO_COPY', 'Hero Section Settings');
      showToast('Hero Copy Saved & Synced to Supabase!');
    } catch (err) {
      console.error(err);
      showToast('Error syncing Hero settings');
    } finally {
      setIsHeroSaving(false);
    }
  };

  const handleSaveFaqReviews = async () => {
    setIsFaqReviewsSaving(true);
    try {
      const payload = { faqs, testimonials };
      await syncAndSaveData('faq_reviews_settings', payload);
      await syncAndSaveData('faqs', faqs);
      await syncAndSaveData('testimonials', testimonials);
      addAuditLog('UPDATE_CMS_REVIEWS', 'FAQs and Customer Reviews');
      showToast('FAQs & Testimonials Saved & Synced!');
    } catch (err) {
      console.error(err);
      showToast('Error syncing FAQs and Reviews');
    } finally {
      setIsFaqReviewsSaving(false);
    }
  };

  const handleSaveLegal = async () => {
    setIsLegalSaving(true);
    try {
      const payload = {
        privacy_policy: privacyPolicyText,
        terms_of_service: termsOfServiceText,
        usage_policy: usagePolicyText
      };
      await syncAndSaveData('legal_policies', payload);
      await syncAndSaveData('privacy_policy', privacyPolicyText);
      await syncAndSaveData('terms_of_service', termsOfServiceText);
      await syncAndSaveData('usage_policy', usagePolicyText);
      addAuditLog('UPDATE_LEGAL_POLICIES', 'Legal Documents Settings');
      showToast('Legal Documents Synced & Saved!');
    } catch (err) {
      console.error(err);
      showToast('Error syncing legal policies');
    } finally {
      setIsLegalSaving(false);
    }
  };

  const handleSaveSystem = async () => {
    setIsSystemSaving(true);
    try {
      localStorage.setItem('briefora_admin_broadcast_msg', announcement);
      localStorage.setItem('briefora_broadcast_msg', announcement);
      localStorage.setItem('briefora_admin_broadcast_active', String(announcementActive));
      localStorage.setItem('briefora_broadcast_active', String(announcementActive));
      localStorage.setItem('briefora_admin_signups_enabled', String(signupsAllowed));
      
      await syncAndSaveData('broadcast_msg', announcement);
      await syncAndSaveData('broadcast_active', String(announcementActive));
      await syncAndSaveData('signups_enabled', String(signupsAllowed));
      
      addAuditLog('UPDATE_SYSTEM_SETTINGS', 'Global System Config');
      showToast('System Configuration Saved!');
    } catch (err) {
      console.error(err);
      showToast('Error syncing system configuration');
    } finally {
      setIsSystemSaving(false);
    }
  };

  const handleMaintenanceChange = async (checked: boolean) => {
    setMaintenanceMode(checked);
    // STRICTLY NORMALIZE BOTH BOOLEAN VALUE KEYS INSTANTLY
    localStorage.setItem('briefora_admin_maintenance', String(checked));
    localStorage.setItem('briefora_maintenance', String(checked));
    
    await syncAndSaveData('maintenance', String(checked));
    showToast(checked ? '⚡ Maintenance Mode Active' : '🟢 System Live (Maintenance OFF)');
    addAuditLog(checked ? 'ENABLE_MAINTENANCE' : 'DISABLE_MAINTENANCE', 'Global System');
  };

  // Sync users/briefs/submissions to local storage
  useEffect(() => { localStorage.setItem('briefora_admin_users', JSON.stringify(users)); }, [users]);
  useEffect(() => { localStorage.setItem('briefora_admin_briefs', JSON.stringify(briefs)); }, [briefs]);
  useEffect(() => { localStorage.setItem('briefora_admin_logs', JSON.stringify(auditLogs)); }, [auditLogs]);
  useEffect(() => { localStorage.setItem('briefora_contact_submissions', JSON.stringify(submissions)); }, [submissions]);
  useEffect(() => { localStorage.setItem('briefora_admin_testimonials', JSON.stringify(testimonials)); }, [testimonials]);

  // Auth Handlers
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setLoginError('');

    setTimeout(() => {
      if (username.trim() === 'admin' && password === 'kP9$vX!2mQ#7bZ&9') {
        sessionStorage.setItem('briefora_admin_authed', 'true');
        setIsAuthenticated(true);
        addAuditLog('ADMIN_LOGIN_SUCCESS', 'Admin Portal');
        showToast('Welcome back, Admin!');
      } else {
        setLoginError('Invalid credentials. Please check your username and password.');
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
    addAuditLog('CREATE_USER', `${newUser.name} (${newUser.plan})`);
    showToast(`User ${newUser.name} created!`);
  };

  const handleDeleteUser = (id: string) => {
    const u = users.find(usr => usr.id === id);
    setUsers(users.filter(u => u.id !== id));
    addAuditLog('DELETE_USER', u ? u.name : id);
    showToast('User deleted');
  };

  const handleDeleteBrief = (id: string) => {
    const b = briefs.find(br => br.id === id);
    setBriefs(briefs.filter(b => b.id !== id));
    addAuditLog('DELETE_BRIEF', b ? b.title : id);
    showToast('Brief removed');
  };

  const handleAddFaq = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFaqQuestion || !newFaqAnswer) return;
    const newFaq = { q: newFaqQuestion, a: newFaqAnswer, question: newFaqQuestion, answer: newFaqAnswer };
    setFaqs([...faqs, newFaq]);
    setIsAddFaqOpen(false);
    setNewFaqQuestion('');
    setNewFaqAnswer('');
    showToast('FAQ Draft Added! Click "Save Changes" to publish.');
  };

  const handleDeleteFaq = (idx: number) => {
    setFaqs(faqs.filter((_, i) => i !== idx));
    showToast('FAQ Draft Removed! Click "Save Changes" to publish.');
  };

  const handleAddReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReviewAuthor || !newReviewQuote) return;
    const newReview: TestimonialItem = {
      id: `test-${Date.now()}`,
      quote: newReviewQuote,
      author: newReviewAuthor,
      role: newReviewRole || 'Designer',
      avatar: newReviewAvatar,
      rating: 5
    };
    setTestimonials([newReview, ...testimonials]);
    setIsAddReviewOpen(false);
    setNewReviewAuthor('');
    setNewReviewRole('');
    setNewReviewQuote('');
    showToast('Review Draft Added! Click "Save Changes" to publish.');
  };

  const handleDeleteReview = (id: string) => {
    setTestimonials(testimonials.filter(t => t.id !== id));
    showToast('Review Draft Removed! Click "Save Changes" to publish.');
  };

  const handleDeleteSubmission = async (id: string) => {
    const updated = submissions.filter(s => s.id !== id);
    setSubmissions(updated);
    
    if (supabase) {
      try {
        await supabase.from('contact_submissions').delete().eq('id', id);
      } catch (err) {
        console.error('Supabase submission delete error:', err);
      }
    }
    
    showToast('Submission deleted');
    addAuditLog('DELETE_CONTACT_SUBMISSION', id);
  };

  const handleMarkSubmissionStatus = async (id: string, newStatus: 'unread' | 'read' | 'responded') => {
    const updated = submissions.map(s => s.id === id ? { ...s, status: newStatus } : s);
    setSubmissions(updated);
    
    if (supabase) {
      try {
        await supabase.from('contact_submissions').update({ status: newStatus }).eq('id', id);
      } catch (err) {
        console.error('Supabase status update error:', err);
      }
    }
    
    showToast(`Submission marked as ${newStatus}`);
    addAuditLog('UPDATE_CONTACT_STATUS', `${id} to ${newStatus}`);
  };

  const handleSavePricingPlanField = (index: number, field: string, value: any) => {
    const updated = [...pricingPlans];
    updated[index] = {
      ...updated[index],
      [field]: value
    };
    setPricingPlans(updated);
  };

  const handleAddPlanFeature = (planIndex: number) => {
    const updated = [...pricingPlans];
    if (!updated[planIndex].features) updated[planIndex].features = [];
    updated[planIndex].features.push('New Plan Benefit');
    setPricingPlans(updated);
  };

  const handleRemovePlanFeature = (planIndex: number, featureIdx: number) => {
    const updated = [...pricingPlans];
    updated[planIndex].features = updated[planIndex].features.filter((_: any, idx: number) => idx !== featureIdx);
    setPricingPlans(updated);
  };

  const handleUpdatePlanFeature = (planIndex: number, featureIdx: number, val: string) => {
    const updated = [...pricingPlans];
    updated[planIndex].features[featureIdx] = val;
    setPricingPlans(updated);
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

  // Sidebar navigation sections mapping
  const navigationCategories = [
    {
      title: 'Management',
      items: [
        { id: 'overview', label: 'Dashboard', icon: Activity },
        { id: 'users', label: `Users (${users.length})`, icon: Users },
        { id: 'briefs', label: `Client Briefs (${briefs.length})`, icon: Briefcase },
      ]
    },
    {
      title: 'System Control',
      items: [
        { id: 'system', label: 'Global System', icon: Settings },
        { id: 'pricing', label: 'Pricing & Plans', icon: CreditCard },
        { id: 'submissions', label: `Inquiries (${submissions.filter(s => s.status === 'unread').length})`, icon: Inbox },
      ]
    },
    {
      title: 'Website Content',
      items: [
        { id: 'hero', label: 'Hero Copy & CTA', icon: Globe },
        { id: 'cms', label: 'FAQs & Reviews', icon: Layers },
        { id: 'legal', label: 'Legal Policies', icon: FileText },
      ]
    }
  ];

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden font-sans">
        {/* Glow ambient background elements */}
        <div className="absolute top-[-20%] left-[-20%] w-[60%] h-[60%] rounded-full bg-[#2516FF]/5 blur-[150px] pointer-events-none" />
        <div className="absolute bottom-[-20%] right-[-20%] w-[60%] h-[60%] rounded-full bg-blue-500/5 blur-[150px] pointer-events-none" />

        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative z-10 w-full max-w-md bg-white/80 border border-slate-200/80 rounded-[32px] p-8 sm:p-10 shadow-xl backdrop-blur-md"
        >
          <div className="flex flex-col items-center text-center mb-8">
            <div className="p-4 bg-primary-light border border-primary/20 rounded-2xl mb-4 text-[#2516FF] shadow-inner">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary-light text-[#2516FF] text-[10px] font-bold tracking-widest uppercase mb-2 border border-primary/20">
              <Lock className="w-3 h-3" /> Gatekeeper Security
            </span>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Admin Portal Login</h1>
            <p className="text-slate-500 text-xs mt-1">Briefora Interactive Command Center</p>
          </div>

          {loginError && (
            <div className="mb-6 p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-start gap-3 text-rose-800 text-xs">
              <AlertTriangle className="w-5 h-5 shrink-0 text-rose-500 mt-0.5" />
              <span>{loginError}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1.5 tracking-wider">Username</label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input 
                  type="text" 
                  required 
                  value={username} 
                  onChange={(e) => setUsername(e.target.value)} 
                  placeholder="admin" 
                  className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-4 py-3.5 text-xs text-slate-950 placeholder-slate-400 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all" 
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1.5 tracking-wider">Password</label>
              <div className="relative">
                <Key className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input 
                  type="password" 
                  required 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                  placeholder="••••••••" 
                  className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-4 py-3.5 text-xs text-slate-950 placeholder-slate-400 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all" 
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full mt-3 bg-[#2516FF] hover:bg-[#1d11cc] text-white font-bold py-4 rounded-xl text-xs tracking-wider uppercase transition-all shadow-lg shadow-[#2516FF]/10 flex items-center justify-center gap-2 cursor-pointer"
            >
              {isSubmitting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <>Enter Control Center <ChevronRight className="w-4 h-4" /></>}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button onClick={() => navigate('/')} className="text-[11px] font-semibold text-slate-500 hover:text-primary transition-colors">
              ← Return to Live Landing
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-700 flex flex-col lg:flex-row font-sans relative overflow-x-hidden">
      
      {/* Toast Alert */}
      <AnimatePresence>
        {toastMsg && (
          <motion.div
            initial={{ opacity: 0, y: -20, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: -20, x: '-50%' }}
            className="fixed top-5 left-1/2 z-[100] bg-white border border-slate-200 text-slate-900 px-5 py-3 rounded-2xl text-xs font-semibold shadow-xl flex items-center gap-2.5 backdrop-blur-lg"
          >
            <CheckCircle className="w-4 h-4 text-emerald-500" />
            <span>{toastMsg}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* MOBILE HEADER BAR */}
      <header className="lg:hidden w-full bg-white/90 border-b border-slate-200/80 px-6 py-4 flex items-center justify-between sticky top-0 z-40 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <button onClick={() => setIsMobileSidebarOpen(true)} className="p-1 text-slate-500 hover:text-slate-900 focus:outline-none cursor-pointer">
            <Menu className="w-6 h-6" />
          </button>
          <Logo iconSize={26} />
          <span className="text-xs font-bold text-slate-500 tracking-wider">ADMIN</span>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => window.open('/', '_blank')} className="p-1.5 bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-700 cursor-pointer transition-colors">
            <ExternalLink className="w-4 h-4" />
          </button>
          <button onClick={handleLogout} className="p-1.5 bg-rose-50 text-rose-600 hover:bg-rose-100 rounded-lg cursor-pointer transition-colors">
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* MOBILE DRAWER OVERLAY */}
      <AnimatePresence>
        {isMobileSidebarOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileSidebarOpen(false)}
              className="fixed inset-0 bg-black/40 backdrop-blur-xs"
            />
            
            {/* Sidebar drawer content */}
            <motion.div 
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 bottom-0 left-0 w-72 bg-white/95 border-r border-slate-200 shadow-2xl z-50 flex flex-col p-6 backdrop-blur-lg"
            >
              <div className="flex items-center justify-between pb-6 border-b border-slate-200">
                <div className="flex items-center gap-2.5">
                  <Logo iconSize={30} />
                  <div>
                    <h2 className="text-sm font-black text-slate-900 tracking-wide">Briefora Admin</h2>
                    <p className="text-[10px] font-bold text-primary tracking-wider uppercase">V2.4 Control</p>
                  </div>
                </div>
                <button onClick={() => setIsMobileSidebarOpen(false)} className="p-1 text-slate-400 hover:text-slate-600 cursor-pointer">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Navigation Items (Mobile scrollable) */}
              <nav className="flex-1 overflow-y-auto py-6 space-y-6">
                {navigationCategories.map((category) => (
                  <div key={category.title} className="space-y-1.5">
                    <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest block px-3 mb-1">{category.title}</span>
                    {category.items.map((item) => {
                      const Icon = item.icon;
                      const isActive = activeTab === item.id;
                      return (
                        <button
                          key={item.id}
                          onClick={() => {
                            setActiveTab(item.id as any);
                            setIsMobileSidebarOpen(false);
                          }}
                          className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                            isActive 
                              ? 'bg-[#2516FF] text-white shadow-lg shadow-[#2516FF]/25' 
                              : 'text-slate-600 hover:text-primary hover:bg-slate-100'
                          }`}
                        >
                          <Icon className="w-4 h-4 shrink-0" />
                          <span>{item.label}</span>
                        </button>
                      );
                    })}
                  </div>
                ))}
              </nav>

              {/* Bottom Quick Actions */}
              <div className="pt-6 border-t border-slate-200 space-y-2">
                <button 
                  onClick={() => window.open('/', '_blank')}
                  className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-700 transition-colors cursor-pointer"
                >
                  <span className="flex items-center gap-2"><ExternalLink className="w-4 h-4" /> Live Site</span>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                </button>
                <button 
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 text-xs font-bold transition-colors cursor-pointer"
                >
                  <LogOut className="w-4 h-4" /> Logout
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* PERSISTENT DESKTOP LEFT SIDEBAR */}
      <aside className="hidden lg:flex w-64 border-r border-slate-200/80 bg-white/80 backdrop-blur-xl flex-col shrink-0 min-h-screen sticky top-0 p-6 z-30">
        <div className="pb-6 border-b border-slate-200/60 flex items-center gap-3">
          <Logo iconSize={32} />
          <div>
            <h2 className="text-sm font-black text-slate-900 tracking-wide">Briefora Admin</h2>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[9px] font-bold text-slate-500 tracking-wider uppercase">System Connected</span>
            </div>
          </div>
        </div>

        {/* Sidebar Nav Categories */}
        <nav className="flex-1 overflow-y-auto py-6 space-y-6 select-none">
          {navigationCategories.map((category) => (
            <div key={category.title} className="space-y-1">
              <span className="text-[9px] font-black uppercase text-slate-400 tracking-widest block px-3 mb-1">{category.title}</span>
              {category.items.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id as any)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all relative cursor-pointer ${
                      isActive 
                        ? 'bg-primary-light text-primary border-l-2 border-primary' 
                        : 'text-slate-600 hover:text-primary hover:bg-slate-100/60'
                    }`}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    <span>{item.label}</span>
                    {isActive && (
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-primary shadow-[0_0_8px_#2516FF]" />
                    )}
                  </button>
                );
              })}
            </div>
          ))}
        </nav>

        {/* Desktop Quick Actions Footer */}
        <div className="pt-6 border-t border-slate-200/60 space-y-2">
          <button 
            onClick={() => window.open('/', '_blank')}
            className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-700 transition-colors cursor-pointer"
          >
            <span className="flex items-center gap-2"><ExternalLink className="w-4 h-4" /> Live Site</span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          </button>
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 text-xs font-bold transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" /> Logout
          </button>
        </div>
      </aside>

      {/* MAIN WORKSPACE CONTENT */}
      <main className="flex-1 min-h-screen p-6 sm:p-8 lg:p-10 overflow-y-auto max-w-7xl w-full mx-auto">
        
        {/* Workspace Title Eyebrow */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-[10px] font-black uppercase text-primary tracking-widest">Workspace</span>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              {activeTab === 'overview' && 'Dashboard Overview'}
              {activeTab === 'system' && 'Global System Panel'}
              {activeTab === 'pricing' && 'Pricing & Plans Editor'}
              {activeTab === 'hero' && 'Hero Section Settings'}
              {activeTab === 'cms' && 'FAQs & Testimonial Reviews'}
              {activeTab === 'legal' && 'Legal Policy Editor'}
              {activeTab === 'users' && 'User Management'}
              {activeTab === 'briefs' && 'Active Client Briefs'}
              {activeTab === 'submissions' && 'Live Inquiries Feed'}
            </h1>
          </div>

          {/* Clock or Synced marker */}
          <div className="flex items-center gap-2.5 bg-white/80 border border-slate-200/80 rounded-xl px-4 py-2 text-xs font-semibold text-slate-600 shadow-sm self-start sm:self-auto">
            <Clock className="w-4 h-4 text-primary animate-pulse" />
            <span>Active Admin Session</span>
          </div>
        </div>

        {/* VIEW CONDITIONAL RENDERINGS */}

        {/* 1. OVERVIEW TAB */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              <div className="bg-white/80 backdrop-blur-md rounded-2xl p-6 border border-slate-200/80 shadow-sm">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Users</span>
                <div className="text-3xl font-black text-slate-900 mt-2 flex items-baseline gap-2">
                  {totalUsers}
                  <span className="text-xs text-emerald-600 font-bold font-mono">+100% cloud</span>
                </div>
              </div>
              <div className="bg-white/80 backdrop-blur-md rounded-2xl p-6 border border-slate-200/80 shadow-sm">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Paid Subscribers</span>
                <div className="text-3xl font-black text-slate-900 mt-2 flex items-baseline gap-2">
                  {activeProStudio}
                  <span className="text-xs text-primary font-bold">Pro/Studio</span>
                </div>
              </div>
              <div className="bg-white/80 backdrop-blur-md rounded-2xl p-6 border border-slate-200/80 shadow-sm">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Estimated Monthly MRR</span>
                <div className="text-3xl font-black text-slate-900 mt-2 font-mono">${totalMRR}</div>
              </div>
              <div className="bg-white/80 backdrop-blur-md rounded-2xl p-6 border border-slate-200/80 shadow-sm">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Active Client Briefs</span>
                <div className="text-3xl font-black text-slate-900 mt-2 font-mono">{briefs.length}</div>
              </div>
            </div>

            {/* Quick Actions & System Info */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white/80 backdrop-blur-md rounded-2xl p-6 border border-slate-200/80 shadow-sm space-y-4">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-primary" /> Quick Commands
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  <button onClick={() => setActiveTab('system')} className="p-3 bg-slate-50 hover:bg-primary-light border border-slate-200 hover:border-primary/30 rounded-xl text-left transition-all cursor-pointer group">
                    <span className="block text-xs font-bold text-slate-800 group-hover:text-primary">Global Banner</span>
                    <span className="block text-[10px] text-slate-500 mt-1">Configure broadcast alerts</span>
                  </button>
                  <button onClick={() => setActiveTab('pricing')} className="p-3 bg-slate-50 hover:bg-primary-light border border-slate-200 hover:border-primary/30 rounded-xl text-left transition-all cursor-pointer group">
                    <span className="block text-xs font-bold text-slate-800 group-hover:text-primary">Edit Pricing</span>
                    <span className="block text-[10px] text-slate-500 mt-1">Adjust plans and Stripe</span>
                  </button>
                  <button onClick={() => setActiveTab('submissions')} className="p-3 bg-slate-50 hover:bg-primary-light border border-slate-200 hover:border-primary/30 rounded-xl text-left transition-all cursor-pointer group">
                    <span className="block text-xs font-bold text-slate-800 group-hover:text-primary">Live Inquiries</span>
                    <span className="block text-[10px] text-slate-500 mt-1">View contact requests</span>
                  </button>
                  <button onClick={() => setActiveTab('cms')} className="p-3 bg-slate-50 hover:bg-primary-light border border-slate-200 hover:border-primary/30 rounded-xl text-left transition-all cursor-pointer group">
                    <span className="block text-xs font-bold text-slate-800 group-hover:text-primary">FAQs & Reviews</span>
                    <span className="block text-[10px] text-slate-500 mt-1">Add items & client logos</span>
                  </button>
                </div>
              </div>

              {/* Maintenance quick status */}
              <div className="bg-white/80 backdrop-blur-md rounded-2xl p-6 border border-slate-200/80 shadow-sm flex flex-col justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 mb-3">
                    <Activity className="w-4 h-4 text-primary" /> Fast System Telemetry
                  </h3>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between py-1.5 border-b border-slate-100">
                      <span className="text-slate-500">Database Sync Connection</span>
                      <span className="font-bold text-emerald-600">ACTIVE (SUPABASE)</span>
                    </div>
                    <div className="flex justify-between py-1.5 border-b border-slate-100">
                      <span className="text-slate-500">Broadcast Banner Status</span>
                      <span className={`font-bold ${announcementActive ? 'text-primary' : 'text-slate-400'}`}>
                        {announcementActive ? 'ON AIR' : 'DEACTIVATED'}
                      </span>
                    </div>
                    <div className="flex justify-between py-1.5 border-b border-slate-100">
                      <span className="text-slate-500">System Maintenance Overlay</span>
                      <span className={`font-bold ${maintenanceMode ? 'text-amber-600' : 'text-slate-400'}`}>
                        {maintenanceMode ? 'ACTIVE' : 'OFF (PUBLIC)'}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                  <span>Version v2.4 (Production)</span>
                  <span className="font-mono">PID: {Math.floor(Math.random() * 9000 + 1000)}</span>
                </div>
              </div>
            </div>

            {/* Audit Logs */}
            <div className="bg-white/80 backdrop-blur-md rounded-2xl p-6 border border-slate-200/80 shadow-sm">
              <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
                <Activity className="w-4 h-4 text-[#2516FF]" /> System Security & Audit Logs
              </h3>
              <div className="space-y-2 max-h-64 overflow-y-auto font-mono text-xs scrollbar-thin">
                {auditLogs.map((log) => (
                  <div key={log.id} className="p-3 bg-slate-50/80 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between border border-slate-200/60 gap-2">
                    <div className="flex items-center gap-2.5">
                      <span className="text-slate-400 font-bold">[{log.timestamp}]</span>
                      <span className="text-slate-700 font-semibold">{log.action}</span>
                    </div>
                    <span className="text-primary bg-primary-light border border-primary/20 px-2 py-0.5 rounded-md text-[10px] font-bold self-start sm:self-auto">{log.target}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 2. GLOBAL SYSTEM PANEL */}
        {activeTab === 'system' && (
          <div className="bg-white/80 backdrop-blur-md rounded-2xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Global Control Switches</h2>
                <p className="text-slate-500 text-xs mt-1">Control client access, signups, and site availability instantaneously.</p>
              </div>
              <button 
                onClick={handleSaveSystem}
                disabled={isSystemSaving}
                className="px-5 py-2.5 bg-[#2516FF] hover:bg-[#1d11cc] disabled:bg-primary/40 text-white rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer shadow-lg shadow-[#2516FF]/10 transition-colors self-start sm:self-auto"
              >
                {isSystemSaving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                <span>{isSystemSaving ? 'Saving...' : 'Save System Settings'}</span>
              </button>
            </div>

            <div className="space-y-6 max-w-2xl">
              {/* Maintenance Mode Toggle with CRITICAL Normalization */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between p-5 bg-slate-50/80 border border-slate-200/80 rounded-xl gap-4">
                <div className="space-y-1">
                  <div className="font-bold text-xs text-slate-900 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-500" /> System Maintenance Mode
                  </div>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    Instantly restricts and redirects all platform visitors to a premium maintenance message overlay. Normalizes boolean values strictly.
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-[11px] font-bold ${maintenanceMode ? 'text-amber-600 animate-pulse' : 'text-emerald-600'}`}>
                    {maintenanceMode ? 'MAINTENANCE ON' : 'SYSTEM LIVE'}
                  </span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={maintenanceMode}
                      onChange={(e) => handleMaintenanceChange(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#2516FF]" />
                  </label>
                </div>
              </div>

              {/* User Signups allowed */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between p-5 bg-slate-50/80 border border-slate-200/80 rounded-xl gap-4">
                <div className="space-y-1">
                  <div className="font-bold text-xs text-slate-900 flex items-center gap-2">
                    <Users className="w-4 h-4 text-primary" /> New Signups Gate
                  </div>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    Allow or temporarily pause new designer registrations on the Briefora platform.
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-[11px] font-bold text-slate-600">
                    {signupsAllowed ? 'Allowed' : 'Paused'}
                  </span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={signupsAllowed}
                      onChange={(e) => {
                        setSignupsAllowed(e.target.checked);
                        showToast(e.target.checked ? 'Signups Allowed (Draft)' : 'Signups Disabled (Draft)');
                      }}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#2516FF]" />
                  </label>
                </div>
              </div>

              {/* Broadcast Announcement Banner */}
              <div className="p-5 bg-slate-50/80 border border-slate-200/80 rounded-xl space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <div className="font-bold text-xs text-slate-900 flex items-center gap-2">
                      <Star className="w-4 h-4 text-amber-500" /> Global Top Alert Banner
                    </div>
                    <p className="text-[11px] text-slate-500">Displays a floating alert banner at the very top of all public-facing pages.</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={announcementActive}
                      onChange={(e) => {
                        setAnnouncementActive(e.target.checked);
                        showToast(e.target.checked ? 'Alert Banner Activated (Draft)' : 'Alert Banner Hidden (Draft)');
                      }}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#2516FF]" />
                  </label>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[10px] font-bold uppercase text-slate-500 tracking-wider">Banner Display Text</label>
                  <input
                    type="text"
                    value={announcement}
                    onChange={(e) => {
                      setAnnouncement(e.target.value);
                    }}
                    className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                    placeholder="Enter broadcast text..."
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 3. PRICING & PLANS EDITOR */}
        {activeTab === 'pricing' && (
          <div className="bg-white/80 backdrop-blur-md rounded-2xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Pricing Tiers & Benefit Matrix</h2>
                <p className="text-slate-500 text-xs mt-1">Configure pricing values, plan benefits, and corresponding secure checkout links.</p>
              </div>
              <button 
                onClick={handleSavePricing}
                disabled={isPricingSaving}
                className="px-5 py-2.5 bg-[#2516FF] hover:bg-[#1d11cc] disabled:bg-primary/40 text-white rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer shadow-lg shadow-[#2516FF]/10 transition-colors self-start sm:self-auto"
              >
                {isPricingSaving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                <span>{isPricingSaving ? 'Saving...' : 'Save Pricing Plans'}</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {pricingPlans.map((plan, planIdx) => (
                <div key={planIdx} className="bg-slate-50/80 border border-slate-200/80 rounded-2xl p-6 space-y-5 shadow-xs">
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="font-bold text-slate-900 text-base block">{plan.name}</span>
                      <span className="text-[10px] text-slate-500 font-bold tracking-wider uppercase mt-0.5 block">{plan.id}</span>
                    </div>
                    <span className="text-[10px] font-black px-2.5 py-1 bg-primary-light border border-primary/20 rounded-md text-primary">
                      {plan.badge || 'Plan'}
                    </span>
                  </div>

                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] font-bold uppercase text-slate-500">Monthly Price ($)</label>
                        <input
                          type="number"
                          value={plan.priceMonthly !== undefined ? plan.priceMonthly : (plan.price !== undefined ? plan.price : 0)}
                          onChange={(e) => handleSavePricingPlanField(planIdx, 'priceMonthly', Number(e.target.value))}
                          className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 font-bold mt-1 focus:outline-none focus:border-primary"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold uppercase text-slate-500">Annual Price ($)</label>
                        <input
                          type="number"
                          value={plan.priceAnnual !== undefined ? plan.priceAnnual : 0}
                          onChange={(e) => handleSavePricingPlanField(planIdx, 'priceAnnual', Number(e.target.value))}
                          className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 font-bold mt-1 focus:outline-none focus:border-primary"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold uppercase text-slate-500">Stripe Payment Link (Monthly)</label>
                      <input
                        type="url"
                        value={plan.paymentUrlMonthly || ''}
                        onChange={(e) => handleSavePricingPlanField(planIdx, 'paymentUrlMonthly', e.target.value)}
                        placeholder="https://buy.stripe.com/..."
                        className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-[11px] text-slate-700 mt-1 focus:outline-none focus:border-primary"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold uppercase text-slate-500">Stripe Payment Link (Annual)</label>
                      <input
                        type="url"
                        value={plan.paymentUrlAnnual || ''}
                        onChange={(e) => handleSavePricingPlanField(planIdx, 'paymentUrlAnnual', e.target.value)}
                        placeholder="https://buy.stripe.com/..."
                        className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-[11px] text-slate-700 mt-1 focus:outline-none focus:border-primary"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold uppercase text-slate-500">Description</label>
                      <textarea
                        rows={3}
                        value={plan.description || plan.desc || ''}
                        onChange={(e) => {
                          handleSavePricingPlanField(planIdx, 'description', e.target.value);
                          handleSavePricingPlanField(planIdx, 'desc', e.target.value);
                        }}
                        className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-[11px] text-slate-700 mt-1 focus:outline-none focus:border-primary"
                      />
                    </div>

                    {/* Features editing */}
                    <div className="space-y-2 pt-2">
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] font-bold uppercase text-slate-500 tracking-wider">Features</span>
                        <button 
                          onClick={() => handleAddPlanFeature(planIdx)}
                          className="text-primary text-[10px] font-bold flex items-center gap-1 hover:underline cursor-pointer"
                        >
                          <Plus className="w-3 h-3" /> Add Feature
                        </button>
                      </div>

                      <div className="space-y-1.5 max-h-48 overflow-y-auto scrollbar-thin pr-1">
                        {(plan.features || []).map((feature: string, featureIdx: number) => (
                          <div key={featureIdx} className="flex gap-2 items-center">
                            <input
                              type="text"
                              value={feature}
                              onChange={(e) => handleUpdatePlanFeature(planIdx, featureIdx, e.target.value)}
                              className="flex-1 bg-white border border-slate-200 rounded-md px-2 py-1 text-[11px] text-slate-700 focus:outline-none focus:border-primary"
                            />
                            <button 
                              onClick={() => handleRemovePlanFeature(planIdx, featureIdx)}
                              className="text-rose-500 hover:text-rose-600 shrink-0 cursor-pointer p-1 rounded hover:bg-rose-50 transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 4. HERO SECTION SETTINGS */}
        {activeTab === 'hero' && (
          <div className="bg-white/80 backdrop-blur-md rounded-2xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Landing Page Hero & CTA Settings</h2>
                <p className="text-slate-500 text-xs mt-1">Configure live text titles, high-impact gradient keywords, and button actions.</p>
              </div>
              <button 
                onClick={handleSaveHeroCopy}
                disabled={isHeroSaving}
                className="px-5 py-2.5 bg-[#2516FF] hover:bg-[#1d11cc] disabled:bg-primary/40 text-white rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer shadow-lg shadow-[#2516FF]/10 transition-colors self-start sm:self-auto"
              >
                {isHeroSaving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                <span>{isHeroSaving ? 'Saving...' : 'Save Hero Copy'}</span>
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Form parameters */}
              <div className="space-y-4 lg:col-span-7">
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wide">Eyebrow Badge Text</label>
                  <input
                    type="text"
                    value={heroCopy.badge}
                    onChange={(e) => setHeroCopy({ ...heroCopy, badge: e.target.value })}
                    className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-xs text-slate-800 font-medium focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wide">Main Title Left Text</label>
                  <input
                    type="text"
                    value={heroCopy.title}
                    onChange={(e) => setHeroCopy({ ...heroCopy, title: e.target.value })}
                    className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-xs text-slate-800 font-medium focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wide">Highlighted Gradient Title Keywords</label>
                  <input
                    type="text"
                    value={heroCopy.highlightTitle}
                    onChange={(e) => setHeroCopy({ ...heroCopy, highlightTitle: e.target.value })}
                    className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-xs text-primary font-black focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wide">Subheading Description Copy</label>
                  <textarea
                    rows={4}
                    value={heroCopy.subtitle}
                    onChange={(e) => setHeroCopy({ ...heroCopy, subtitle: e.target.value })}
                    className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-xs text-slate-600 leading-relaxed focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wide">Primary Button CTA Text</label>
                    <input
                      type="text"
                      value={heroCopy.primaryCta}
                      onChange={(e) => setHeroCopy({ ...heroCopy, primaryCta: e.target.value })}
                      className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-xs text-slate-800 font-medium focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wide">Secondary Button CTA Text</label>
                    <input
                      type="text"
                      value={heroCopy.secondaryCta}
                      onChange={(e) => setHeroCopy({ ...heroCopy, secondaryCta: e.target.value })}
                      className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-xs text-slate-800 font-medium focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* Visual Interactive Preview */}
              <div className="lg:col-span-5 bg-slate-50 border border-slate-200 rounded-2xl p-6 space-y-4 shadow-xs">
                <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider block border-b border-slate-200/60 pb-2">LIVE COMPOSITION PREVIEW</span>
                <div className="space-y-4 py-4">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary-light text-primary text-[9px] font-black tracking-widest uppercase border border-primary/20">
                    {heroCopy.badge || 'AI CLIENT DISCOVERY'}
                  </span>
                  
                  <h3 className="text-xl font-extrabold text-slate-900 leading-tight">
                    {heroCopy.title || 'Turn Ideas Into'}{' '}
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#2516FF] to-[#1d11cc]">
                      {heroCopy.highlightTitle || 'Clear Creative Blueprints'}
                    </span>
                  </h3>
                  
                  <p className="text-xs text-slate-600 leading-relaxed line-clamp-3">
                    {heroCopy.subtitle || 'Transforms vague client feedback into clean vector briefs instantly.'}
                  </p>

                  <div className="flex gap-2.5 pt-2">
                    <button className="px-4 py-2 bg-[#2516FF] text-white text-[11px] font-bold rounded-lg shadow-md shadow-[#2516FF]/10">
                      {heroCopy.primaryCta || 'Start for free'}
                    </button>
                    <button className="px-4 py-2 bg-white text-slate-700 text-[11px] font-semibold rounded-lg border border-slate-200 shadow-2xs hover:bg-slate-50 transition-colors">
                      {heroCopy.secondaryCta || 'See How It Works'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 5. FAQS & TESTIMONIAL REVIEWS */}
        {activeTab === 'cms' && (
          <div className="space-y-8">
            
            {/* Top Draft Notification & Save Bar */}
            <div className="bg-primary-light/60 border border-primary/20 rounded-2xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-2xs">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-primary-light/80 text-primary rounded-xl">
                  <Star className="w-5 h-5 fill-primary-light" />
                </div>
                <div>
                  <h4 className="text-sm font-black text-slate-900">CMS Content Draft Manager</h4>
                  <p className="text-[11px] text-primary font-medium mt-0.5">FAQs and customer reviews are stored in local drafts. Click Save to publish changes.</p>
                </div>
              </div>
              <button
                onClick={handleSaveFaqReviews}
                disabled={isFaqReviewsSaving}
                className="w-full sm:w-auto px-6 py-2.5 bg-[#2516FF] hover:bg-[#1d11cc] disabled:bg-primary/40 text-white rounded-xl text-xs font-black flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-[#2516FF]/10 transition-colors shrink-0"
              >
                {isFaqReviewsSaving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                <span>{isFaqReviewsSaving ? 'Publishing...' : 'Save CMS Changes'}</span>
              </button>
            </div>

            {/* FAQs */}
            <div className="bg-white/80 backdrop-blur-md rounded-2xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">Frequently Asked Questions</h2>
                  <p className="text-slate-500 text-xs mt-1">Add, structure, and dynamically remove platform query items.</p>
                </div>
                <button 
                  onClick={() => setIsAddFaqOpen(true)}
                  className="px-4 py-2 bg-[#2516FF] hover:bg-[#1d11cc] text-white rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer transition-colors shadow-sm"
                >
                  <Plus className="w-4 h-4" /> Add FAQ Item
                </button>
              </div>

              <div className="space-y-4 max-h-[400px] overflow-y-auto scrollbar-thin pr-1">
                {faqs.map((faq, idx) => (
                  <div key={idx} className="p-4 bg-slate-50 border border-slate-200/80 rounded-xl flex justify-between items-start gap-4 shadow-2xs">
                    <div className="space-y-1.5 flex-1">
                      <div className="font-bold text-xs text-slate-900">Q: {faq.question || faq.q}</div>
                      <div className="text-xs text-slate-600 leading-relaxed">A: {faq.answer || faq.a}</div>
                    </div>
                    <button 
                      onClick={() => handleDeleteFaq(idx)}
                      className="text-slate-400 hover:text-rose-600 p-1 cursor-pointer transition-colors hover:bg-rose-50 rounded-lg"
                      title="Delete FAQ"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Testimonials Editor */}
            <div className="bg-white/80 backdrop-blur-md rounded-2xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">Testimonials & Client Reviews</h2>
                  <p className="text-slate-500 text-xs mt-1">Review live quotes and manage testimonials displayed on the homepage.</p>
                </div>
                <button 
                  onClick={() => setIsAddReviewOpen(true)}
                  className="px-4 py-2 bg-[#2516FF] hover:bg-[#1d11cc] text-white rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer transition-colors shadow-sm"
                >
                  <Plus className="w-4 h-4" /> Add Review
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {testimonials.map((test) => (
                  <div key={test.id} className="p-5 bg-slate-50 border border-slate-200/80 rounded-2xl flex flex-col justify-between gap-4 shadow-2xs">
                    <div className="space-y-3">
                      <div className="flex items-center gap-1 text-amber-400">
                        {[...Array(test.rating || 5)].map((_, i) => (
                          <Star key={i} className="w-3.5 h-3.5 fill-current" />
                        ))}
                      </div>
                      <p className="text-xs text-slate-700 italic leading-relaxed">
                        "{test.quote}"
                      </p>
                    </div>

                    <div className="flex items-center justify-between border-t border-slate-200/60 pt-3">
                      <div className="flex items-center gap-3">
                        <img 
                          src={test.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=faces'} 
                          alt={test.author} 
                          className="w-8 h-8 rounded-full border border-slate-200 object-cover"
                          referrerPolicy="no-referrer"
                        />
                        <div>
                          <div className="text-xs font-bold text-slate-900">{test.author}</div>
                          <div className="text-[10px] text-slate-500">{test.role}</div>
                        </div>
                      </div>
                      <button 
                        onClick={() => handleDeleteReview(test.id)}
                        className="text-slate-400 hover:text-rose-600 p-1.5 hover:bg-rose-50 rounded-lg transition-colors"
                        title="Remove Review"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

        {/* 6. LEGAL POLICY EDITORS */}
        {activeTab === 'legal' && (
          <div className="bg-white/80 backdrop-blur-md rounded-2xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Platform Legal & Compliance Policy</h2>
                <p className="text-slate-500 text-xs mt-1">Directly format rich-text contents supporting Privacy, Terms, and Usage Policies.</p>
              </div>
              <button 
                onClick={handleSaveLegal}
                disabled={isLegalSaving}
                className="px-5 py-2.5 bg-[#2516FF] hover:bg-[#1d11cc] disabled:bg-primary/40 text-white rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer shadow-lg shadow-[#2516FF]/10 transition-colors self-start sm:self-auto"
              >
                {isLegalSaving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                <span>{isLegalSaving ? 'Saving...' : 'Sync Policies'}</span>
              </button>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide">Privacy Policy HTML Content</label>
                <textarea
                  rows={8}
                  value={privacyPolicyText}
                  onChange={(e) => setPrivacyPolicyText(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-xs text-slate-800 font-mono leading-relaxed focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                  placeholder="Enter policy html tags/raw-text..."
                />
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide">Terms of Service HTML Content</label>
                <textarea
                  rows={8}
                  value={termsOfServiceText}
                  onChange={(e) => setTermsOfServiceText(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-xs text-slate-800 font-mono leading-relaxed focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                  placeholder="Enter terms of service html tags/raw-text..."
                />
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide">Usage Policy HTML Content</label>
                <textarea
                  rows={8}
                  value={usagePolicyText}
                  onChange={(e) => setUsagePolicyText(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-xs text-slate-800 font-mono leading-relaxed focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                  placeholder="Enter usage policy html tags/raw-text..."
                />
              </div>
            </div>
          </div>
        )}

        {/* 7. USER MANAGEMENT */}
        {activeTab === 'users' && (
          <div className="bg-white/80 backdrop-blur-md rounded-2xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900">User Accounts Control</h3>
                <p className="text-slate-500 text-xs mt-1">Manage active credentials, subscriber status, and direct profile states.</p>
              </div>
              <div className="flex items-center gap-3 w-full sm:w-auto self-start sm:self-auto">
                <button onClick={() => setIsAddUserOpen(true)} className="px-4 py-2.5 bg-[#2516FF] hover:bg-[#1d11cc] text-white rounded-xl text-xs font-bold flex items-center gap-2 shrink-0 cursor-pointer transition-colors shadow-lg shadow-[#2516FF]/10">
                  <Plus className="w-4 h-4" /> Add User Account
                </button>
              </div>
            </div>

            {/* Filters */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <input
                type="text"
                placeholder="Search by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
              />
              <select 
                value={userPlanFilter} 
                onChange={(e) => setUserPlanFilter(e.target.value)}
                className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-700 font-semibold focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
              >
                <option value="All">All Subscription Plans</option>
                <option value="Free">Free Plan</option>
                <option value="Pro">Pro Plan</option>
                <option value="Studio">Studio Plan</option>
              </select>
              <select 
                value={userStatusFilter} 
                onChange={(e) => setUserStatusFilter(e.target.value)}
                className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-700 font-semibold focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
              >
                <option value="All">All User Statuses</option>
                <option value="Active">Active Account</option>
                <option value="Suspended">Suspended Account</option>
              </select>
            </div>

            <div className="overflow-x-auto border border-slate-200 rounded-xl shadow-xs">
              <table className="w-full text-left text-xs min-w-[600px]">
                <thead className="bg-slate-50 border-b border-slate-200 text-[10px] text-slate-500 font-black tracking-wider uppercase">
                  <tr>
                    <th className="p-4">User</th>
                    <th className="p-4">Subscription Plan</th>
                    <th className="p-4">Account Status</th>
                    <th className="p-4">Created Date</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredUsers.map((u) => (
                    <tr key={u.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="p-4 font-bold text-slate-900">
                        <div>{u.name}</div>
                        <div className="text-slate-500 font-normal text-[11px] mt-0.5">{u.email}</div>
                      </td>
                      <td className="p-4">
                        <span className={`px-2.5 py-1 text-[10px] font-black tracking-wider rounded-md uppercase ${
                          u.plan === 'Studio' ? 'bg-primary-light text-primary border border-primary/20' :
                          u.plan === 'Pro' ? 'bg-primary-light/80 text-primary border border-primary/10' :
                          'bg-slate-100 text-slate-600 border border-slate-200/50'
                        }`}>
                          {u.plan}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-black rounded-md ${
                          u.status === 'Active' ? 'bg-emerald-50 text-emerald-600 border border-emerald-200/50' : 'bg-rose-50 text-rose-600 border border-rose-200/50'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${u.status === 'Active' ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                          {u.status}
                        </span>
                      </td>
                      <td className="p-4 font-mono text-slate-500">{u.createdAt}</td>
                      <td className="p-4 text-right">
                        <button 
                          onClick={() => handleDeleteUser(u.id)} 
                          className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-all cursor-pointer"
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

        {/* 8. ACTIVE CLIENT BRIEF LOGS */}
        {activeTab === 'briefs' && (
          <div className="bg-white/80 backdrop-blur-md rounded-2xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-6">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Client Brief Workspace Overview</h3>
              <p className="text-slate-500 text-xs mt-1">Review live generated client style briefs, statuses, and viewer metrics.</p>
            </div>

            <div className="overflow-x-auto border border-slate-200 rounded-xl shadow-xs">
              <table className="w-full text-left text-xs min-w-[700px]">
                <thead className="bg-slate-50 border-b border-slate-200 text-[10px] text-slate-500 font-black tracking-wider uppercase">
                  <tr>
                    <th className="p-4">Brief Title</th>
                    <th className="p-4">Target Client</th>
                    <th className="p-4">Designer Email</th>
                    <th className="p-4">Workflow Status</th>
                    <th className="p-4">Analytics Views</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {briefs.map((b) => (
                    <tr key={b.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="p-4 font-bold text-slate-900">{b.title}</td>
                      <td className="p-4 text-slate-700 font-medium">{b.clientName}</td>
                      <td className="p-4 text-slate-500 font-mono text-[11px]">{b.userEmail}</td>
                      <td className="p-4">
                        <span className={`px-2.5 py-1 text-[10px] font-black tracking-wider rounded-md uppercase ${
                          b.status === 'Signed Off' ? 'bg-emerald-50 text-emerald-600 border border-emerald-200/50' :
                          b.status === 'Active' ? 'bg-primary-light text-primary border border-primary/20' : 
                          'bg-slate-100 text-slate-600 border border-slate-200/50'
                        }`}>
                          {b.status}
                        </span>
                      </td>
                      <td className="p-4 font-bold text-slate-800 flex items-center gap-1.5 mt-2.5">
                        <Eye className="w-3.5 h-3.5 text-primary" />
                        <span>{b.views} views</span>
                      </td>
                      <td className="p-4 text-right">
                        <button 
                          onClick={() => handleDeleteBrief(b.id)} 
                          className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-all cursor-pointer"
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

        {/* 9. SUPPORT SUBMISSIONS / INQUIRIES FEED */}
        {activeTab === 'submissions' && (
          <div className="bg-white/80 backdrop-blur-md rounded-2xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-6">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Live Inquiries Feed</h3>
              <p className="text-slate-500 text-xs mt-1">Incoming contact submissions fetched from the cloud database.</p>
            </div>

            <div className="space-y-4">
              {submissions.length === 0 ? (
                <div className="p-10 border border-dashed border-slate-200 rounded-2xl text-center text-slate-400 text-xs">
                  <Inbox className="w-8 h-8 mx-auto mb-3 text-slate-300" />
                  No inquiries received yet.
                </div>
              ) : (
                submissions.map((sub) => (
                  <div 
                    key={sub.id} 
                    className={`p-5 rounded-2xl border transition-all ${
                      sub.status === 'unread' 
                        ? 'bg-primary-light/40 border-primary/20 shadow-xs shadow-[#2516FF]/5' 
                        : 'bg-slate-50/80 border-slate-200/80'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200/60 pb-3 mb-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold text-slate-900 text-sm">{sub.full_name}</span>
                          <span className="text-[10px] font-mono text-slate-500">{sub.email}</span>
                          {sub.status === 'unread' && (
                            <span className="bg-primary-light border border-primary/20 text-primary text-[9px] font-black px-2 py-0.5 rounded-full uppercase">NEW</span>
                          )}
                        </div>
                        <h4 className="font-bold text-xs text-slate-700 mt-1">{sub.subject}</h4>
                      </div>
                      
                      <div className="flex items-center gap-2 self-start sm:self-auto">
                        <span className="text-[10px] text-slate-500 font-mono">
                          {sub.created_at ? new Date(sub.created_at).toLocaleString() : 'Recent'}
                        </span>
                      </div>
                    </div>

                    <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-line mb-4 bg-white p-3.5 rounded-xl border border-slate-200/80">
                      {sub.message}
                    </p>

                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => handleMarkSubmissionStatus(sub.id, 'read')}
                          className={`px-3 py-1.5 rounded-lg text-[10px] font-bold border transition-colors flex items-center gap-1 cursor-pointer ${
                            sub.status === 'read'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : 'bg-white hover:bg-slate-50 text-slate-600 border-slate-200'
                          }`}
                        >
                          <Check className="w-3 h-3" /> Mark Read
                        </button>
                        <button 
                          onClick={() => handleMarkSubmissionStatus(sub.id, 'responded')}
                          className={`px-3 py-1.5 rounded-lg text-[10px] font-bold border transition-colors flex items-center gap-1 cursor-pointer ${
                            sub.status === 'responded'
                              ? 'bg-primary-light text-primary border border-primary/20'
                              : 'bg-white hover:bg-slate-50 text-slate-600 border-slate-200'
                          }`}
                        >
                          <Check className="w-3 h-3" /> Marked Responded
                        </button>
                      </div>

                      <button 
                        onClick={() => handleDeleteSubmission(sub.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                        title="Delete Inquiry"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

      </main>

      {/* MODALS */}

      {/* 1. ADD USER MODAL */}
      <AnimatePresence>
        {isAddUserOpen && (
          <div className="fixed inset-0 z-[110] bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }} 
              animate={{ opacity: 1, scale: 1 }} 
              exit={{ opacity: 0, scale: 0.95 }} 
              className="bg-white border border-slate-200 rounded-3xl p-6 max-w-md w-full shadow-2xl"
            >
              <div className="flex justify-between items-center mb-5 border-b border-slate-100 pb-3">
                <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <Users className="w-4 h-4 text-primary" /> Create New Account
                </h4>
                <button onClick={() => setIsAddUserOpen(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <form onSubmit={handleAddUser} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Full Name</label>
                  <input 
                    type="text" 
                    placeholder="Sarah Jenkins" 
                    required 
                    value={newUserName} 
                    onChange={(e) => setNewUserName(e.target.value)} 
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all" 
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Email Address</label>
                  <input 
                    type="email" 
                    placeholder="sarah@agency.co" 
                    required 
                    value={newUserEmail} 
                    onChange={(e) => setNewUserEmail(e.target.value)} 
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all" 
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Subscription Plan Level</label>
                  <select 
                    value={newUserPlan} 
                    onChange={(e) => setNewUserPlan(e.target.value as any)} 
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-3 text-xs text-slate-700 font-semibold focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                  >
                    <option value="Free">Free Plan</option>
                    <option value="Pro">Pro Plan ($9/mo)</option>
                    <option value="Studio">Studio Plan ($29/mo)</option>
                  </select>
                </div>
                <button 
                  type="submit" 
                  className="w-full bg-[#2516FF] hover:bg-[#1d11cc] text-white font-bold py-3.5 rounded-xl text-xs uppercase tracking-wider mt-2 cursor-pointer shadow-lg shadow-[#2516FF]/10 transition-colors"
                >
                  Create User
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 2. ADD FAQ MODAL */}
      <AnimatePresence>
        {isAddFaqOpen && (
          <div className="fixed inset-0 z-[110] bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }} 
              animate={{ opacity: 1, scale: 1 }} 
              exit={{ opacity: 0, scale: 0.95 }} 
              className="bg-white border border-slate-200 rounded-3xl p-6 max-w-md w-full shadow-2xl"
            >
              <div className="flex justify-between items-center mb-5 border-b border-slate-100 pb-3">
                <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <HelpCircle className="w-4 h-4 text-primary" /> Add FAQ Question
                </h4>
                <button onClick={() => setIsAddFaqOpen(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <form onSubmit={handleAddFaq} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Question</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Can I upgrade my plan later?" 
                    required 
                    value={newFaqQuestion} 
                    onChange={(e) => setNewFaqQuestion(e.target.value)} 
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs text-slate-800 font-bold placeholder-slate-400 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all" 
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Answer Description</label>
                  <textarea 
                    rows={4} 
                    placeholder="e.g. Yes, you can scale or downgrade your subscription tier at any time..." 
                    required 
                    value={newFaqAnswer} 
                    onChange={(e) => setNewFaqAnswer(e.target.value)} 
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs text-slate-700 font-medium placeholder-slate-400 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all" 
                  />
                </div>
                <button 
                  type="submit" 
                  className="w-full bg-[#2516FF] hover:bg-[#1d11cc] text-white font-bold py-3.5 rounded-xl text-xs uppercase tracking-wider mt-2 cursor-pointer shadow-lg shadow-[#2516FF]/10 transition-colors"
                >
                  Add FAQ Item
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 3. ADD REVIEW MODAL */}
      <AnimatePresence>
        {isAddReviewOpen && (
          <div className="fixed inset-0 z-[110] bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }} 
              animate={{ opacity: 1, scale: 1 }} 
              exit={{ opacity: 0, scale: 0.95 }} 
              className="bg-white border border-slate-200 rounded-3xl p-6 max-w-md w-full shadow-2xl"
            >
              <div className="flex justify-between items-center mb-5 border-b border-slate-100 pb-3">
                <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-primary" /> Add Client Review
                </h4>
                <button onClick={() => setIsAddReviewOpen(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <form onSubmit={handleAddReview} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Author Name</label>
                  <input 
                    type="text" 
                    placeholder="Johnathan Doe" 
                    required 
                    value={newReviewAuthor} 
                    onChange={(e) => setNewReviewAuthor(e.target.value)} 
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all" 
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Role / Subtitle</label>
                  <input 
                    type="text" 
                    placeholder="Boutique Creative Director" 
                    required 
                    value={newReviewRole} 
                    onChange={(e) => setNewReviewRole(e.target.value)} 
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all" 
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Quote Description</label>
                  <textarea 
                    rows={3} 
                    placeholder="Briefora completely optimized our onboarding cycle..." 
                    required 
                    value={newReviewQuote} 
                    onChange={(e) => setNewReviewQuote(e.target.value)} 
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs text-slate-700 placeholder-slate-400 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all" 
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Avatar Image URL</label>
                  <input 
                    type="url" 
                    value={newReviewAvatar} 
                    onChange={(e) => setNewReviewAvatar(e.target.value)} 
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs text-slate-700 placeholder-slate-400 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all" 
                  />
                </div>
                <button 
                  type="submit" 
                  className="w-full bg-[#2516FF] hover:bg-[#1d11cc] text-white font-bold py-3.5 rounded-xl text-xs uppercase tracking-wider mt-2 cursor-pointer shadow-lg shadow-[#2516FF]/10 transition-colors"
                >
                  Submit Review
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
