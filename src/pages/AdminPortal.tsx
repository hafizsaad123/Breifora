import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ShieldCheck, Lock, User, Users, Plus, Trash2, 
  CheckCircle, AlertTriangle, Activity, Settings, 
  FileText, LogOut, Key, RefreshCw, Layers, X, 
  ChevronRight, CreditCard, Save, Globe, ExternalLink,
  Menu, Inbox, Star, MessageSquare, Briefcase, PlusCircle,
  Clock, Eye, Sliders, Check, HelpCircle, ChevronDown, Sparkles, Laptop, Smartphone,
  Wallet, MessageCircle, DollarSign, ArrowUp, ArrowDown
} from 'lucide-react';
import Logo from '../components/ui/Logo';
import { pricingPlans as defaultPricingPlans, faqList as defaultFaqs, testimonialsList as defaultTestimonials } from '../data';
import { 
  getAdminHeroCopy, getAdminPrivacyPolicy, 
  getAdminUsagePolicy, getAdminTermsOfService, syncAndSaveData, fetchSyncedData, supabase,
  defaultLandingPageConfig, getAdminLandingPageConfig,
  getAdminCheckoutConfig, CheckoutConfig, defaultCheckoutConfig
} from '../lib/adminSync';

interface AdminUser {
  id: string;
  name: string;
  email: string;
  plan: 'Starter' | 'Pro' | 'Studio' | 'Free';
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
  const [activeTab, setActiveTab] = useState<'overview' | 'system' | 'pricing' | 'hero' | 'cms' | 'legal' | 'users' | 'briefs' | 'submissions' | 'checkout'>('overview');
  
  // Checkout & Payment Config State
  const [checkoutConfig, setCheckoutConfig] = useState<CheckoutConfig>(getAdminCheckoutConfig);
  const [isCheckoutSaving, setIsCheckoutSaving] = useState(false);
  
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
      { id: 'usr-104', name: 'Sarah Jenkins', email: 'sarah@freelancedesign.net', plan: 'Starter', status: 'Active', createdAt: '2025-07-15', onboarded: false, briefsCount: 1 },
      { id: 'usr-105', name: 'Alex Rivera', email: 'alex@riveradesign.org', plan: 'Starter', status: 'Active', createdAt: '2025-07-20', onboarded: true, briefsCount: 2 },
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
  const [landingPageConfig, setLandingPageConfig] = useState<any>(() => {
    return getAdminLandingPageConfig();
  });
  const updateCmsField = (section: string, field: string, value: any) => {
    setLandingPageConfig((prev: any) => {
      const updated = { ...prev };
      updated[section] = {
        ...(updated[section] || {}),
        [field]: value
      };
      return updated;
    });
  };
  const [openCmsSection, setOpenCmsSection] = useState<string | null>('header');
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'mobile'>('desktop');

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
  const [newUserPlan, setNewUserPlan] = useState<'Starter' | 'Pro' | 'Studio' | 'Free'>('Pro');

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

  const [isCmsSaving, setIsCmsSaving] = useState(false);
  const handleSaveCmsConfig = async (config = landingPageConfig) => {
    setIsCmsSaving(true);
    try {
      localStorage.setItem('briefora_admin_landing_page_config', JSON.stringify(config));
      await syncAndSaveData('landing_page_config', config);
      addAuditLog('UPDATE_HOMEPAGE_CMS', 'Entire Homepage Content');
      showToast('Home Page CMS Published and Saved Successfully!');
    } catch (err) {
      console.error(err);
      showToast('Error saving CMS configurations');
    } finally {
      setIsCmsSaving(false);
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

  const handleSaveCheckoutConfig = async () => {
    setIsCheckoutSaving(true);
    try {
      localStorage.setItem('briefora_admin_checkout_config', JSON.stringify(checkoutConfig));
      await syncAndSaveData('checkout_config', checkoutConfig);
      addAuditLog('UPDATE_CHECKOUT_CONFIG', 'Checkout & Payment Settings');
      showToast('Checkout Settings Saved & Synced!');
    } catch (err) {
      console.error(err);
      showToast('Error saving checkout configurations');
    } finally {
      setIsCheckoutSaving(false);
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
      title: 'Landing Page & Checkout',
      items: [
        { id: 'cms', label: 'Home Page CMS', icon: Layers },
        { id: 'checkout', label: 'Checkout & Payments', icon: Wallet },
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
              {activeTab === 'cms' && 'Home Page CMS'}
              {activeTab === 'legal' && 'Legal Policy Editor'}
              {activeTab === 'users' && 'User Management'}
              {activeTab === 'briefs' && 'Active Client Briefs'}
              {activeTab === 'submissions' && 'Live Inquiries Feed'}
              {activeTab === 'checkout' && 'Checkout & Payment Settings'}
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

        {/* 4. HOME PAGE CMS (MODULAR ACCORDION & PREVIEW ENGINE) */}
        {activeTab === 'cms' && (
          <div className="space-y-8">
            
            {/* Top CMS Status & Master Actions Bar */}
            <div className="bg-white/95 backdrop-blur-md border border-slate-200/80 rounded-2xl p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-sm">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-[#2516FF]/10 text-[#2516FF] rounded-2xl shrink-0">
                  <Sparkles className="w-6 h-6 animate-pulse" />
                </div>
                <div>
                  <h4 className="text-base font-black text-slate-900">Modular Landing Page CMS</h4>
                  <p className="text-xs text-slate-500 mt-1 max-w-xl leading-relaxed">
                    Directly control all visual layouts, copy segments, features, pricing, FAQs, and links on your homepage. 
                    Manage drafts locally, preview them in the device simulator, and publish when ready.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 w-full md:w-auto shrink-0">
                <button
                  type="button"
                  onClick={() => setIsPreviewOpen(true)}
                  className="flex-1 md:flex-none px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold flex items-center justify-center gap-2 cursor-pointer border border-slate-200/60 transition-all"
                >
                  <Eye className="w-4 h-4" />
                  <span>Preview Draft</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleSaveCmsConfig(landingPageConfig)}
                  disabled={isCmsSaving}
                  className="flex-1 md:flex-none px-6 py-2.5 bg-[#2516FF] hover:bg-[#1d11cc] disabled:bg-slate-300 text-white rounded-xl text-xs font-black flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-[#2516FF]/10 transition-colors"
                >
                  {isCmsSaving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  <span>{isCmsSaving ? 'Publishing...' : 'Publish Live'}</span>
                </button>
              </div>
            </div>

            {/* COLLAPSIBLE ACCORDION FOR ALL 9 SECTIONS */}
            <div className="space-y-4">
              
              {/* 1. Header / Navigation Bar */}
              <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
                <button
                  type="button"
                  onClick={() => setOpenCmsSection(openCmsSection === 'header' ? null : 'header')}
                  className="w-full flex items-center justify-between p-5 text-left font-black text-slate-800 hover:bg-slate-50/50 transition-colors cursor-pointer"
                >
                  <span className="flex items-center gap-3">
                    <span className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center text-xs text-slate-500 font-bold">1</span>
                    Header & Navigation Bar
                  </span>
                  <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${openCmsSection === 'header' ? 'rotate-180' : ''}`} />
                </button>
                {openCmsSection === 'header' && (
                  <div className="p-6 border-t border-slate-100 bg-slate-50/30 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Logo Branding Text</label>
                        <input
                          type="text"
                          value={landingPageConfig.header?.logoText || ''}
                          onChange={(e) => updateCmsField('header', 'logoText', e.target.value)}
                          className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-800 focus:outline-none focus:border-primary transition-all"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Logo Icon Size</label>
                        <input
                          type="number"
                          value={landingPageConfig.header?.iconSize || 30}
                          onChange={(e) => updateCmsField('header', 'iconSize', Number(e.target.value))}
                          className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-800 focus:outline-none focus:border-primary transition-all"
                        />
                      </div>
                    </div>

                    {/* Navigation Links list */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider">Header Links</label>
                        <button
                          type="button"
                          onClick={() => {
                            const current = landingPageConfig.header?.navLinks || [];
                            updateCmsField('header', 'navLinks', [...current, { label: 'New Link', url: '#', openNewTab: false }]);
                          }}
                          className="text-[#2516FF] hover:text-[#1d11cc] text-[11px] font-bold flex items-center gap-1 cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" /> Add Link
                        </button>
                      </div>
                      <div className="space-y-3 max-h-[220px] overflow-y-auto pr-2">
                        {(landingPageConfig.header?.navLinks || []).map((lnk: any, idx: number) => (
                          <div key={idx} className="flex items-center gap-3 p-3 bg-white border border-slate-200 rounded-xl">
                            <input
                              type="text"
                              placeholder="Label"
                              value={lnk.label}
                              onChange={(e) => {
                                const current = [...landingPageConfig.header.navLinks];
                                current[idx].label = e.target.value;
                                updateCmsField('header', 'navLinks', current);
                              }}
                              className="flex-1 bg-slate-50 border border-slate-100 rounded-lg px-3 py-1.5 text-xs"
                            />
                            <input
                              type="text"
                              placeholder="URL (e.g. #pricing)"
                              value={lnk.url}
                              onChange={(e) => {
                                const current = [...landingPageConfig.header.navLinks];
                                current[idx].url = e.target.value;
                                updateCmsField('header', 'navLinks', current);
                              }}
                              className="flex-1 bg-slate-50 border border-slate-100 rounded-lg px-3 py-1.5 text-xs"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                const current = landingPageConfig.header.navLinks.filter((_: any, i: number) => i !== idx);
                                updateCmsField('header', 'navLinks', current);
                              }}
                              className="text-slate-400 hover:text-rose-600 p-1 cursor-pointer"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-slate-100 pt-4">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Header CTA Primary Text</label>
                        <input
                          type="text"
                          value={landingPageConfig.header?.primaryCtaText || ''}
                          onChange={(e) => updateCmsField('header', 'primaryCtaText', e.target.value)}
                          className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-800"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Header CTA Primary Link</label>
                        <input
                          type="text"
                          value={landingPageConfig.header?.primaryCtaLink || ''}
                          onChange={(e) => updateCmsField('header', 'primaryCtaLink', e.target.value)}
                          className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-800"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* 2. Hero Section */}
              <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
                <button
                  type="button"
                  onClick={() => setOpenCmsSection(openCmsSection === 'hero' ? null : 'hero')}
                  className="w-full flex items-center justify-between p-5 text-left font-black text-slate-800 hover:bg-slate-50/50 transition-colors cursor-pointer"
                >
                  <span className="flex items-center gap-3">
                    <span className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center text-xs text-slate-500 font-bold">2</span>
                    Hero Section
                  </span>
                  <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${openCmsSection === 'hero' ? 'rotate-180' : ''}`} />
                </button>
                {openCmsSection === 'hero' && (
                  <div className="p-6 border-t border-slate-100 bg-slate-50/30 space-y-4">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Eyebrow Badge Text</label>
                      <input
                        type="text"
                        value={landingPageConfig.hero?.badge || ''}
                        onChange={(e) => updateCmsField('hero', 'badge', e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-800"
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Main Title Text</label>
                        <input
                          type="text"
                          value={landingPageConfig.hero?.title || ''}
                          onChange={(e) => updateCmsField('hero', 'title', e.target.value)}
                          className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-800"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Highlight Gradient Words</label>
                        <input
                          type="text"
                          value={landingPageConfig.hero?.highlightTitle || ''}
                          onChange={(e) => updateCmsField('hero', 'highlightTitle', e.target.value)}
                          className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-800"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Subheading Copy</label>
                      <textarea
                        rows={3}
                        value={landingPageConfig.hero?.subtitle || ''}
                        onChange={(e) => updateCmsField('hero', 'subtitle', e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-800 font-normal leading-relaxed"
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Primary CTA Text</label>
                        <input
                          type="text"
                          value={landingPageConfig.hero?.primaryCta || ''}
                          onChange={(e) => updateCmsField('hero', 'primaryCta', e.target.value)}
                          className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-800"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Secondary CTA Text</label>
                        <input
                          type="text"
                          value={landingPageConfig.hero?.secondaryCta || ''}
                          onChange={(e) => updateCmsField('hero', 'secondaryCta', e.target.value)}
                          className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-800"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* 3. Product Pitch & Feature Highlights */}
              <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
                <button
                  type="button"
                  onClick={() => setOpenCmsSection(openCmsSection === 'features' ? null : 'features')}
                  className="w-full flex items-center justify-between p-5 text-left font-black text-slate-800 hover:bg-slate-50/50 transition-colors cursor-pointer"
                >
                  <span className="flex items-center gap-3">
                    <span className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center text-xs text-slate-500 font-bold">3</span>
                    Product Pitch & Features
                  </span>
                  <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${openCmsSection === 'features' ? 'rotate-180' : ''}`} />
                </button>
                {openCmsSection === 'features' && (
                  <div className="p-6 border-t border-slate-100 bg-slate-50/30 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Section Eyebrow</label>
                        <input
                          type="text"
                          value={landingPageConfig.features?.eyebrow || ''}
                          onChange={(e) => updateCmsField('features', 'eyebrow', e.target.value)}
                          className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-800"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Section Title</label>
                        <input
                          type="text"
                          value={landingPageConfig.features?.title || ''}
                          onChange={(e) => updateCmsField('features', 'title', e.target.value)}
                          className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-800"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Section Description</label>
                        <input
                          type="text"
                          value={landingPageConfig.features?.description || ''}
                          onChange={(e) => updateCmsField('features', 'description', e.target.value)}
                          className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-800"
                        />
                      </div>
                    </div>

                    {/* Features list */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider">Feature Highlight Cards</label>
                        <button
                          type="button"
                          onClick={() => {
                            const current = landingPageConfig.features?.cards || [];
                            updateCmsField('features', 'cards', [...current, { title: 'New Benefit', description: 'Brief explanation...', imagePlaceholder: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800' }]);
                          }}
                          className="text-[#2516FF] hover:text-[#1d11cc] text-[11px] font-bold flex items-center gap-1 cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" /> Add Benefit Card
                        </button>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[350px] overflow-y-auto pr-2">
                        {(landingPageConfig.features?.cards || []).map((crd: any, idx: number) => (
                          <div key={idx} className="p-4 bg-white border border-slate-200 rounded-xl space-y-3 relative">
                            <button
                              type="button"
                              onClick={() => {
                                const current = landingPageConfig.features.cards.filter((_: any, i: number) => i !== idx);
                                updateCmsField('features', 'cards', current);
                              }}
                              className="absolute top-3 right-3 text-slate-400 hover:text-rose-500 transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                            <div>
                              <label className="block text-[9px] font-black uppercase text-slate-400">Card Title</label>
                              <input
                                type="text"
                                value={crd.title}
                                onChange={(e) => {
                                  const current = [...landingPageConfig.features.cards];
                                  current[idx].title = e.target.value;
                                  updateCmsField('features', 'cards', current);
                                }}
                                className="w-full bg-slate-50 border border-slate-100 rounded-lg px-2.5 py-1.5 text-xs font-bold mt-1"
                              />
                            </div>
                            <div>
                              <label className="block text-[9px] font-black uppercase text-slate-400">Card Description</label>
                              <textarea
                                value={crd.description}
                                onChange={(e) => {
                                  const current = [...landingPageConfig.features.cards];
                                  current[idx].description = e.target.value;
                                  updateCmsField('features', 'cards', current);
                                }}
                                className="w-full bg-slate-50 border border-slate-100 rounded-lg px-2.5 py-1.5 text-xs font-normal mt-1 leading-relaxed"
                                rows={2}
                              />
                            </div>
                            <div>
                              <label className="block text-[9px] font-black uppercase text-slate-400">Image Fallback URL</label>
                              <input
                                type="text"
                                value={crd.imagePlaceholder || ''}
                                onChange={(e) => {
                                  const current = [...landingPageConfig.features.cards];
                                  current[idx].imagePlaceholder = e.target.value;
                                  updateCmsField('features', 'cards', current);
                                }}
                                className="w-full bg-slate-50 border border-slate-100 rounded-lg px-2.5 py-1.5 text-xs mt-1"
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* 4. How It Works / Workflow Engine */}
              <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
                <button
                  type="button"
                  onClick={() => setOpenCmsSection(openCmsSection === 'workflow' ? null : 'workflow')}
                  className="w-full flex items-center justify-between p-5 text-left font-black text-slate-800 hover:bg-slate-50/50 transition-colors cursor-pointer"
                >
                  <span className="flex items-center gap-3">
                    <span className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center text-xs text-slate-500 font-bold">4</span>
                    How It Works / Workflow Steps
                  </span>
                  <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${openCmsSection === 'workflow' ? 'rotate-180' : ''}`} />
                </button>
                {openCmsSection === 'workflow' && (
                  <div className="p-6 border-t border-slate-100 bg-slate-50/30 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Workflow Section Title</label>
                        <input
                          type="text"
                          value={landingPageConfig.workflow?.title || ''}
                          onChange={(e) => updateCmsField('workflow', 'title', e.target.value)}
                          className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-800"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Workflow Section Subtitle</label>
                        <input
                          type="text"
                          value={landingPageConfig.workflow?.subtitle || ''}
                          onChange={(e) => updateCmsField('workflow', 'subtitle', e.target.value)}
                          className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-800"
                        />
                      </div>
                    </div>

                    {/* Step Cards List */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider">Intake Workflow Steps</label>
                        <button
                          type="button"
                          onClick={() => {
                            const current = landingPageConfig.workflow?.steps || [];
                            updateCmsField('workflow', 'steps', [...current, { stepLabel: `Step ${current.length + 1}`, title: 'New Step Title', description: 'Action details...' }]);
                          }}
                          className="text-[#2516FF] hover:text-[#1d11cc] text-[11px] font-bold flex items-center gap-1 cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" /> Add Step
                        </button>
                      </div>
                      <div className="space-y-4 max-h-[350px] overflow-y-auto pr-2">
                        {(landingPageConfig.workflow?.steps || []).map((stp: any, idx: number) => (
                          <div key={idx} className="flex gap-4 p-4 bg-white border border-slate-200 rounded-xl relative">
                            <button
                              type="button"
                              onClick={() => {
                                const current = landingPageConfig.workflow.steps.filter((_: any, i: number) => i !== idx);
                                updateCmsField('workflow', 'steps', current);
                              }}
                              className="absolute top-4 right-4 text-slate-400 hover:text-rose-500 transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                            <div className="w-20 shrink-0">
                              <label className="block text-[9px] font-black uppercase text-slate-400">Badge</label>
                              <input
                                type="text"
                                value={stp.stepLabel}
                                onChange={(e) => {
                                  const current = [...landingPageConfig.workflow.steps];
                                  current[idx].stepLabel = e.target.value;
                                  updateCmsField('workflow', 'steps', current);
                                }}
                                className="w-full bg-slate-50 border border-slate-100 rounded-lg px-2 py-1 text-xs text-center font-bold mt-1"
                              />
                            </div>
                            <div className="flex-1 space-y-3">
                              <div>
                                <label className="block text-[9px] font-black uppercase text-slate-400">Step Heading</label>
                                <input
                                  type="text"
                                  value={stp.title}
                                  onChange={(e) => {
                                    const current = [...landingPageConfig.workflow.steps];
                                    current[idx].title = e.target.value;
                                    updateCmsField('workflow', 'steps', current);
                                  }}
                                  className="w-full bg-slate-50 border border-slate-100 rounded-lg px-2.5 py-1 text-xs font-bold mt-1"
                                />
                              </div>
                              <div>
                                <label className="block text-[9px] font-black uppercase text-slate-400">Step Explanation</label>
                                <input
                                  type="text"
                                  value={stp.description}
                                  onChange={(e) => {
                                    const current = [...landingPageConfig.workflow.steps];
                                    current[idx].description = e.target.value;
                                    updateCmsField('workflow', 'steps', current);
                                  }}
                                  className="w-full bg-slate-50 border border-slate-100 rounded-lg px-2.5 py-1 text-xs mt-1"
                                />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* 5. Interactive Preview / Showcase Section */}
              <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
                <button
                  type="button"
                  onClick={() => setOpenCmsSection(openCmsSection === 'showcase' ? null : 'showcase')}
                  className="w-full flex items-center justify-between p-5 text-left font-black text-slate-800 hover:bg-slate-50/50 transition-colors cursor-pointer"
                >
                  <span className="flex items-center gap-3">
                    <span className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center text-xs text-slate-500 font-bold">5</span>
                    Interactive Showcase (Scrolling Text Highlight)
                  </span>
                  <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${openCmsSection === 'showcase' ? 'rotate-180' : ''}`} />
                </button>
                {openCmsSection === 'showcase' && (
                  <div className="p-6 border-t border-slate-100 bg-slate-50/30 space-y-4">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Statement Highlight Paragraphs (One per line)</label>
                      <textarea
                        rows={4}
                        value={landingPageConfig.showcase?.statementLines?.join('\n') || ''}
                        onChange={(e) => {
                          const lines = e.target.value.split('\n');
                          updateCmsField('showcase', 'statementLines', lines);
                        }}
                        className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-800 leading-relaxed font-sans"
                        placeholder="Type one sentence per line to dynamically highlight on user scroll..."
                      />
                      <span className="text-[10px] text-slate-400 mt-1 block">Each text row is sequentially mapped to highlight automatically as the visitor scrolls down the page.</span>
                    </div>
                  </div>
                )}
              </div>

              {/* 6. Pricing Plans */}
              <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
                <button
                  type="button"
                  onClick={() => setOpenCmsSection(openCmsSection === 'pricing' ? null : 'pricing')}
                  className="w-full flex items-center justify-between p-5 text-left font-black text-slate-800 hover:bg-slate-50/50 transition-colors cursor-pointer"
                >
                  <span className="flex items-center gap-3">
                    <span className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center text-xs text-slate-500 font-bold">6</span>
                    Pricing Plans & Subscription Tiers
                  </span>
                  <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${openCmsSection === 'pricing' ? 'rotate-180' : ''}`} />
                </button>
                {openCmsSection === 'pricing' && (
                  <div className="p-6 border-t border-slate-100 bg-slate-50/30 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Pricing Section Title</label>
                        <input
                          type="text"
                          value={landingPageConfig.pricing?.title || ''}
                          onChange={(e) => updateCmsField('pricing', 'title', e.target.value)}
                          className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-800"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Pricing Section Subtitle</label>
                        <input
                          type="text"
                          value={landingPageConfig.pricing?.subtitle || ''}
                          onChange={(e) => updateCmsField('pricing', 'subtitle', e.target.value)}
                          className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-800"
                        />
                      </div>
                    </div>

                    {/* Subscription Tiers List */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between border-b border-slate-200/60 pb-2">
                        <label className="block text-xs font-black text-slate-700 uppercase tracking-wider">Subscription Tiers Editor</label>
                      </div>
                      <div className="space-y-4 max-h-[400px] overflow-y-auto pr-1">
                        {(landingPageConfig.pricing?.plans || []).map((pln: any, idx: number) => (
                          <div key={idx} className="p-5 bg-white border border-slate-200 rounded-2xl grid grid-cols-1 md:grid-cols-12 gap-4 relative">
                            <div className="md:col-span-3">
                              <label className="block text-[9px] font-black uppercase text-slate-400">Plan Name</label>
                              <input
                                type="text"
                                value={pln.name}
                                onChange={(e) => {
                                  const current = [...landingPageConfig.pricing.plans];
                                  current[idx].name = e.target.value;
                                  updateCmsField('pricing', 'plans', current);
                                }}
                                className="w-full bg-slate-50 border border-slate-100 rounded-lg px-2.5 py-1.5 text-xs font-bold mt-1"
                              />
                            </div>
                            <div className="md:col-span-5">
                              <label className="block text-[9px] font-black uppercase text-slate-400">Plan Brief Description</label>
                              <input
                                type="text"
                                value={pln.description}
                                onChange={(e) => {
                                  const current = [...landingPageConfig.pricing.plans];
                                  current[idx].description = e.target.value;
                                  updateCmsField('pricing', 'plans', current);
                                }}
                                className="w-full bg-slate-50 border border-slate-100 rounded-lg px-2.5 py-1.5 text-xs font-normal mt-1"
                              />
                            </div>
                            <div className="md:col-span-2">
                              <label className="block text-[9px] font-black uppercase text-slate-400">Monthly ($)</label>
                              <input
                                type="number"
                                value={pln.priceMonthly}
                                onChange={(e) => {
                                  const current = [...landingPageConfig.pricing.plans];
                                  current[idx].priceMonthly = Number(e.target.value);
                                  updateCmsField('pricing', 'plans', current);
                                }}
                                className="w-full bg-slate-50 border border-slate-100 rounded-lg px-2.5 py-1.5 text-xs mt-1 text-center"
                              />
                            </div>
                            <div className="md:col-span-2">
                              <label className="block text-[9px] font-black uppercase text-slate-400">Yearly ($)</label>
                              <input
                                type="number"
                                value={pln.priceAnnual}
                                onChange={(e) => {
                                  const current = [...landingPageConfig.pricing.plans];
                                  current[idx].priceAnnual = Number(e.target.value);
                                  updateCmsField('pricing', 'plans', current);
                                }}
                                className="w-full bg-slate-50 border border-slate-100 rounded-lg px-2.5 py-1.5 text-xs mt-1 text-center"
                              />
                            </div>
                            <div className="md:col-span-12">
                              <label className="block text-[9px] font-black uppercase text-slate-400 mb-1">Features (One per line)</label>
                              <textarea
                                value={pln.features?.join('\n')}
                                onChange={(e) => {
                                  const current = [...landingPageConfig.pricing.plans];
                                  current[idx].features = e.target.value.split('\n');
                                  updateCmsField('pricing', 'plans', current);
                                }}
                                className="w-full bg-slate-50 border border-slate-100 rounded-lg px-3 py-1.5 text-xs font-mono"
                                rows={3}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* 7. FAQs Section */}
              <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
                <button
                  type="button"
                  onClick={() => setOpenCmsSection(openCmsSection === 'faqs' ? null : 'faqs')}
                  className="w-full flex items-center justify-between p-5 text-left font-black text-slate-800 hover:bg-slate-50/50 transition-colors cursor-pointer"
                >
                  <span className="flex items-center gap-3">
                    <span className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center text-xs text-slate-500 font-bold">7</span>
                    Frequently Asked Questions (FAQs)
                  </span>
                  <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${openCmsSection === 'faqs' ? 'rotate-180' : ''}`} />
                </button>
                {openCmsSection === 'faqs' && (
                  <div className="p-6 border-t border-slate-100 bg-slate-50/30 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-500 mb-1.5 uppercase tracking-wider">FAQ Section Title</label>
                        <input
                          type="text"
                          value={landingPageConfig.faq?.title || ''}
                          onChange={(e) => updateCmsField('faq', 'title', e.target.value)}
                          className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-800"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-slate-500 mb-1.5 uppercase tracking-wider">FAQ Section Subtitle</label>
                        <input
                          type="text"
                          value={landingPageConfig.faq?.subtitle || ''}
                          onChange={(e) => updateCmsField('faq', 'subtitle', e.target.value)}
                          className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-800"
                        />
                      </div>
                    </div>

                    {/* FAQ item List */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider">FAQ List Entries</label>
                        <button
                          type="button"
                          onClick={() => {
                            const current = landingPageConfig.faq?.items || [];
                            updateCmsField('faq', 'items', [...current, { question: 'New Question?', answer: 'Draft Answer text...' }]);
                          }}
                          className="text-[#2516FF] hover:text-[#1d11cc] text-[11px] font-bold flex items-center gap-1 cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" /> Add FAQ Item
                        </button>
                      </div>
                      <div className="space-y-4 max-h-[350px] overflow-y-auto pr-2">
                        {(landingPageConfig.faq?.items || []).map((faItem: any, idx: number) => (
                          <div key={idx} className="p-4 bg-white border border-slate-200 rounded-xl space-y-3 relative">
                            <button
                              type="button"
                              onClick={() => {
                                const current = landingPageConfig.faq.items.filter((_: any, i: number) => i !== idx);
                                updateCmsField('faq', 'items', current);
                              }}
                              className="absolute top-4 right-4 text-slate-400 hover:text-rose-500 transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                            <div>
                              <label className="block text-[9px] font-black uppercase text-slate-400">Question Title</label>
                              <input
                                type="text"
                                value={faItem.question}
                                onChange={(e) => {
                                  const current = [...landingPageConfig.faq.items];
                                  current[idx].question = e.target.value;
                                  updateCmsField('faq', 'items', current);
                                }}
                                className="w-full bg-slate-50 border border-slate-100 rounded-lg px-3 py-1.5 text-xs font-bold mt-1"
                              />
                            </div>
                            <div>
                              <label className="block text-[9px] font-black uppercase text-slate-400">Answer Body</label>
                              <textarea
                                value={faItem.answer}
                                onChange={(e) => {
                                  const current = [...landingPageConfig.faq.items];
                                  current[idx].answer = e.target.value;
                                  updateCmsField('faq', 'items', current);
                                }}
                                className="w-full bg-slate-50 border border-slate-100 rounded-lg px-3 py-1.5 text-xs font-normal mt-1 leading-relaxed"
                                rows={2}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* 8. Call to Action (CTA) Banner */}
              <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
                <button
                  type="button"
                  onClick={() => setOpenCmsSection(openCmsSection === 'cta' ? null : 'cta')}
                  className="w-full flex items-center justify-between p-5 text-left font-black text-slate-800 hover:bg-slate-50/50 transition-colors cursor-pointer"
                >
                  <span className="flex items-center gap-3">
                    <span className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center text-xs text-slate-500 font-bold">8</span>
                    Call to Action (CTA) Banner
                  </span>
                  <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${openCmsSection === 'cta' ? 'rotate-180' : ''}`} />
                </button>
                {openCmsSection === 'cta' && (
                  <div className="p-6 border-t border-slate-100 bg-slate-50/30 space-y-4">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-500 mb-1.5 uppercase tracking-wider">CTA Banner Heading</label>
                      <input
                        type="text"
                        value={landingPageConfig.cta?.title || ''}
                        onChange={(e) => updateCmsField('cta', 'title', e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-800 font-bold"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-500 mb-1.5 uppercase tracking-wider">CTA Banner Subheading</label>
                      <input
                        type="text"
                        value={landingPageConfig.cta?.subtitle || ''}
                        onChange={(e) => updateCmsField('cta', 'subtitle', e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-800 font-normal leading-relaxed"
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-500 mb-1.5 uppercase tracking-wider">CTA Button Label</label>
                        <input
                          type="text"
                          value={landingPageConfig.cta?.buttonText || ''}
                          onChange={(e) => updateCmsField('cta', 'buttonText', e.target.value)}
                          className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-800"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-slate-500 mb-1.5 uppercase tracking-wider">CTA Button URL</label>
                        <input
                          type="text"
                          value={landingPageConfig.cta?.buttonLink || ''}
                          onChange={(e) => updateCmsField('cta', 'buttonLink', e.target.value)}
                          className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-800"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Background Style Color Theme</label>
                        <select
                          value={landingPageConfig.cta?.bgTheme || 'blue'}
                          onChange={(e) => updateCmsField('cta', 'bgTheme', e.target.value)}
                          className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-800 focus:outline-none"
                        >
                          <option value="blue">Brand Royal Blue (#2516FF)</option>
                          <option value="slate">Cool Slate Gray</option>
                          <option value="indigo">Luxury Indigo Purple</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* 9. Footer & Legal Links */}
              <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
                <button
                  type="button"
                  onClick={() => setOpenCmsSection(openCmsSection === 'footer' ? null : 'footer')}
                  className="w-full flex items-center justify-between p-5 text-left font-black text-slate-800 hover:bg-slate-50/50 transition-colors cursor-pointer"
                >
                  <span className="flex items-center gap-3">
                    <span className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center text-xs text-slate-500 font-bold">9</span>
                    Footer & Company legal links
                  </span>
                  <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${openCmsSection === 'footer' ? 'rotate-180' : ''}`} />
                </button>
                {openCmsSection === 'footer' && (
                  <div className="p-6 border-t border-slate-100 bg-slate-50/30 space-y-4">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Company Description Text</label>
                      <textarea
                        rows={2}
                        value={landingPageConfig.footer?.descriptionText || ''}
                        onChange={(e) => updateCmsField('footer', 'descriptionText', e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-800 leading-relaxed"
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Copyright Notice Text</label>
                        <input
                          type="text"
                          value={landingPageConfig.footer?.copyrightText || ''}
                          onChange={(e) => updateCmsField('footer', 'copyrightText', e.target.value)}
                          className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-800"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Support Email Address</label>
                        <input
                          type="email"
                          value={landingPageConfig.footer?.supportEmail || ''}
                          onChange={(e) => updateCmsField('footer', 'supportEmail', e.target.value)}
                          className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-800 font-bold text-[#2516FF]"
                          placeholder="saad.designs4@gmail.com"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

            </div>
          </div>
        )}

        {/* FULLSCREEN PREVIEW DEVICE SIMULATOR OVERLAY MODAL */}
        <AnimatePresence>
          {isPreviewOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-md flex flex-col"
            >
              {/* Simulator Top Controls bar */}
              <div className="bg-slate-950 text-white p-4 border-b border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
                  <span className="text-xs font-black uppercase tracking-wider text-slate-300">Live Draft Simulator (Pre-Publishing)</span>
                </div>
                
                {/* Device Size Selectors */}
                <div className="flex items-center bg-slate-900 border border-slate-800 rounded-xl p-1 gap-1">
                  <button
                    type="button"
                    onClick={() => setPreviewDevice('desktop')}
                    className={`p-2 rounded-lg flex items-center gap-1.5 text-xs font-bold transition-all ${previewDevice === 'desktop' ? 'bg-[#2516FF] text-white shadow-sm' : 'text-slate-400 hover:text-white'}`}
                  >
                    <Laptop className="w-3.5 h-3.5" /> Desktop
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreviewDevice('mobile')}
                    className={`p-2 rounded-lg flex items-center gap-1.5 text-xs font-bold transition-all ${previewDevice === 'mobile' ? 'bg-[#2516FF] text-white shadow-sm' : 'text-slate-400 hover:text-white'}`}
                  >
                    <Smartphone className="w-3.5 h-3.5" /> Mobile
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => setIsPreviewOpen(false)}
                  className="p-2 bg-slate-900 hover:bg-slate-800 rounded-full border border-slate-800 text-slate-300 hover:text-white transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Viewport Simulation Area */}
              <div className="flex-1 bg-slate-900 flex items-center justify-center p-4 md:p-8 overflow-hidden">
                <div 
                  className={`transition-all duration-300 bg-white shadow-2xl overflow-y-auto relative h-full flex flex-col ${
                    previewDevice === 'mobile' 
                      ? 'max-w-[380px] w-full rounded-3xl border-[10px] border-slate-850 h-[680px]' 
                      : 'w-full rounded-xl h-full'
                  }`}
                >
                  
                  {/* SIMULATED SITE HEADER */}
                  <header className="sticky top-0 bg-white/95 backdrop-blur-md border-b border-slate-100 px-6 py-4 flex items-center justify-between z-10 shadow-xs">
                    <span className="flex items-center gap-2 font-bold text-slate-900 text-sm">
                      <Logo iconSize={landingPageConfig.header?.iconSize || 24} />
                      <span>{landingPageConfig.header?.logoText || 'Briefora'}</span>
                    </span>
                    <nav className="hidden md:flex items-center gap-6 text-[11px] font-bold text-slate-500 uppercase">
                      {(landingPageConfig.header?.navLinks || []).map((lnk: any, i: number) => (
                        <span key={i} className="hover:text-slate-900 cursor-pointer">{lnk.label}</span>
                      ))}
                    </nav>
                    <span className="bg-[#2516FF] text-white text-[10px] font-black px-4 py-2 rounded-full cursor-pointer hover:opacity-90">
                      {landingPageConfig.header?.primaryCtaText || 'Get Started'}
                    </span>
                  </header>

                  <div className="flex-1 space-y-24 pb-20">
                    
                    {/* SIMULATED SITE HERO */}
                    <section className="pt-16 pb-12 px-6 text-center space-y-6">
                      <span className="inline-block px-3 py-1 border border-slate-200 rounded-full text-[9px] font-bold uppercase tracking-wider text-slate-600">
                        {landingPageConfig.hero?.badge}
                      </span>
                      <h1 className="text-2xl md:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight max-w-2xl mx-auto">
                        {landingPageConfig.hero?.title}{' '}
                        <span className="text-[#2516FF]">{landingPageConfig.hero?.highlightTitle}</span>
                      </h1>
                      <p className="text-xs md:text-sm text-slate-500 max-w-xl mx-auto leading-relaxed">
                        {landingPageConfig.hero?.subtitle}
                      </p>
                      <div className="flex items-center justify-center gap-3">
                        <span className="px-6 py-2.5 bg-[#2516FF] text-white text-xs font-bold rounded-full">{landingPageConfig.hero?.primaryCta}</span>
                        <span className="px-6 py-2.5 bg-slate-100 text-slate-700 text-xs font-bold rounded-full">{landingPageConfig.hero?.secondaryCta}</span>
                      </div>
                    </section>

                    {/* SIMULATED SITE VALUE STATEMENT / PREVIEW TEXT */}
                    <section className="bg-slate-50 border-y border-slate-100 py-16 px-6">
                      <div className="max-w-xl mx-auto space-y-4">
                        <span className="text-[10px] uppercase font-black tracking-widest text-[#2516FF] block">Interactive Showcase Preview</span>
                        {(landingPageConfig.showcase?.statementLines || []).map((line: string, i: number) => (
                          <p key={i} className={`text-sm md:text-base font-medium leading-relaxed ${i === 0 ? 'text-slate-950 font-bold' : 'text-slate-400'}`}>
                            {line}
                          </p>
                        ))}
                      </div>
                    </section>

                    {/* SIMULATED SITE FEATURES */}
                    <section className="px-6 space-y-12">
                      <div className="text-center space-y-2">
                        <span className="text-[9px] font-black uppercase text-slate-400 tracking-wider block">{landingPageConfig.features?.eyebrow}</span>
                        <h2 className="text-xl md:text-3xl font-black text-slate-900 tracking-tight">{landingPageConfig.features?.title}</h2>
                        <p className="text-xs text-slate-500 max-w-lg mx-auto">{landingPageConfig.features?.description}</p>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-3xl mx-auto">
                        {(landingPageConfig.features?.cards || []).map((crd: any, i: number) => (
                          <div key={i} className="bg-white border border-slate-200/80 p-5 rounded-2xl space-y-3">
                            <span className="w-10 h-10 rounded-xl bg-[#2516FF]/5 text-[#2516FF] flex items-center justify-center font-bold text-xs">
                              {i + 1}
                            </span>
                            <h3 className="font-bold text-slate-900 text-sm">{crd.title}</h3>
                            <p className="text-xs text-slate-500 leading-relaxed">{crd.description}</p>
                          </div>
                        ))}
                      </div>
                    </section>

                    {/* SIMULATED SITE WORKFLOW */}
                    <section className="px-6 space-y-12">
                      <div className="text-center space-y-2">
                        <h2 className="text-xl md:text-3xl font-black text-slate-900 tracking-tight">{landingPageConfig.workflow?.title}</h2>
                        <p className="text-xs text-slate-500 max-w-lg mx-auto">{landingPageConfig.workflow?.subtitle}</p>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto">
                        {(landingPageConfig.workflow?.steps || []).map((stp: any, i: number) => (
                          <div key={i} className="bg-white border border-slate-200/80 p-5 rounded-2xl relative">
                            <span className="bg-[#2516FF] text-white text-[9px] px-2.5 py-1 rounded-full font-bold absolute top-4 right-4">
                              {stp.stepLabel}
                            </span>
                            <h3 className="font-bold text-slate-900 text-sm mt-4">{stp.title}</h3>
                            <p className="text-xs text-slate-500 mt-2 leading-relaxed">{stp.description}</p>
                          </div>
                        ))}
                      </div>
                    </section>

                    {/* SIMULATED SITE PRICING */}
                    <section className="px-6 space-y-8">
                      <div className="text-center space-y-2">
                        <h2 className="text-xl md:text-3xl font-black text-slate-900 tracking-tight">{landingPageConfig.pricing?.title}</h2>
                        <p className="text-xs text-slate-500 max-w-lg mx-auto">{landingPageConfig.pricing?.subtitle}</p>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto">
                        {(landingPageConfig.pricing?.plans || []).map((pln: any, i: number) => (
                          <div key={i} className={`bg-white border p-6 rounded-2xl space-y-4 flex flex-col justify-between ${pln.name.toLowerCase() === 'pro' ? 'border-[#2516FF]/60 ring-2 ring-[#2516FF]/10' : 'border-slate-250'}`}>
                            <div className="space-y-3">
                              <h3 className="font-black text-slate-900 text-base">{pln.name}</h3>
                              <p className="text-xs text-slate-400 leading-relaxed">{pln.description}</p>
                              <div className="text-2xl font-black text-slate-900 pt-1">${pln.priceMonthly}<span className="text-[10px] text-slate-400 font-normal"> / mo</span></div>
                              <ul className="space-y-2 pt-2 border-t border-slate-100">
                                {(pln.features || []).slice(0, 3).map((f: string, j: number) => (
                                  <li key={j} className="text-xs text-slate-500 flex items-center gap-2">
                                    <span className="text-[#2516FF]">✓</span> {f}
                                  </li>
                                ))}
                              </ul>
                            </div>
                            <span className="w-full bg-[#2516FF] text-white text-xs font-bold py-2 px-4 rounded-xl text-center block mt-4">{pln.ctaText || 'Get Started'}</span>
                          </div>
                        ))}
                      </div>
                    </section>

                    {/* SIMULATED SITE FAQS */}
                    <section className="px-6 max-w-2xl mx-auto space-y-8">
                      <div className="text-center space-y-2">
                        <h2 className="text-xl md:text-3xl font-black text-slate-900 tracking-tight">{landingPageConfig.faq?.title}</h2>
                        <p className="text-xs text-slate-500 max-w-lg mx-auto">{landingPageConfig.faq?.subtitle}</p>
                      </div>
                      <div className="space-y-3">
                        {(landingPageConfig.faq?.items || []).slice(0, 3).map((faq: any, i: number) => (
                          <div key={i} className="bg-slate-50 border border-slate-200/80 p-4 rounded-xl space-y-2">
                            <h4 className="font-bold text-slate-900 text-xs">Q: {faq.question}</h4>
                            <p className="text-xs text-slate-500 leading-relaxed">A: {faq.answer}</p>
                          </div>
                        ))}
                      </div>
                    </section>

                    {/* SIMULATED SITE CTA */}
                    <section className={`mx-6 p-8 rounded-3xl text-center space-y-4 ${
                      landingPageConfig.cta?.bgTheme === 'indigo' ? 'bg-indigo-950 text-white' : 
                      landingPageConfig.cta?.bgTheme === 'slate' ? 'bg-slate-900 text-white' : 'bg-[#2516FF] text-white'
                    }`}>
                      <h2 className="text-xl md:text-2xl font-extrabold tracking-tight">{landingPageConfig.cta?.title || 'Ready to lock in strategy?'}</h2>
                      <p className="text-xs text-slate-300 max-w-lg mx-auto">{landingPageConfig.cta?.subtitle || 'Join hundreds of designers securing clients with Briefora.'}</p>
                      <span className="inline-block bg-white text-slate-950 text-xs font-black px-6 py-2.5 rounded-full cursor-pointer hover:opacity-90">{landingPageConfig.cta?.buttonText || 'Start for free'}</span>
                    </section>

                  </div>

                  {/* SIMULATED SITE FOOTER */}
                  <footer className="bg-slate-50 border-t border-slate-100 p-8 text-xs text-slate-500 space-y-4">
                    <p className="leading-relaxed">{landingPageConfig.footer?.descriptionText}</p>
                    <div className="pt-4 border-t border-slate-200/60 flex items-center justify-between text-[10px]">
                      <p>{landingPageConfig.footer?.copyrightText}</p>
                      <span className="font-bold text-[#2516FF]">{landingPageConfig.footer?.supportEmail || 'saad.designs4@gmail.com'}</span>
                    </div>
                  </footer>

                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

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

        {/* 10. CHECKOUT & PAYMENT SETTINGS CMS PANEL */}
        {activeTab === 'checkout' && (
          <div className="space-y-8">
            
            {/* Top Action Card */}
            <div className="bg-white/90 backdrop-blur-md rounded-2xl p-6 sm:p-8 border border-slate-200/80 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Wallet className="w-5 h-5 text-primary" /> Checkout & Payment CMS
                </h3>
                <p className="text-slate-500 text-xs mt-1">
                  Manage E-Wallet accounts, PKR plan pricing conversions, instruction steps, WhatsApp confirmation template, and legal agreement checks.
                </p>
              </div>

              <button
                type="button"
                onClick={handleSaveCheckoutConfig}
                disabled={isCheckoutSaving}
                className="px-6 py-3 rounded-xl bg-[#2516FF] hover:bg-[#1d11cc] text-white text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-[#2516FF]/10 shrink-0 disabled:opacity-50"
              >
                {isCheckoutSaving ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                <span>{isCheckoutSaving ? 'Saving & Syncing...' : 'Save Checkout Settings'}</span>
              </button>
            </div>

            {/* 1. Page Typography & Labels CMS */}
            <div className="bg-white/80 backdrop-blur-md rounded-2xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-6">
              <div className="border-b border-slate-100 pb-4">
                <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <FileText className="w-4 h-4 text-primary" /> 1. Page Typography & Headlines CMS
                </h4>
                <p className="text-slate-500 text-xs mt-0.5">
                  Customize the main titles, headers, badges, and button labels displayed on the Checkout page.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-[11px] font-bold uppercase text-slate-600 mb-1.5">
                    Header Badge Text
                  </label>
                  <input
                    type="text"
                    value={checkoutConfig.pageText?.headerBadgeText || ''}
                    onChange={(e) => setCheckoutConfig((prev) => ({
                      ...prev,
                      pageText: { ...(prev.pageText || defaultCheckoutConfig.pageText!), headerBadgeText: e.target.value }
                    }))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-800 font-semibold focus:outline-none focus:border-primary"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase text-slate-600 mb-1.5">
                    Change Plan Button Text
                  </label>
                  <input
                    type="text"
                    value={checkoutConfig.pageText?.changePlanText || ''}
                    onChange={(e) => setCheckoutConfig((prev) => ({
                      ...prev,
                      pageText: { ...(prev.pageText || defaultCheckoutConfig.pageText!), changePlanText: e.target.value }
                    }))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-800 font-semibold focus:outline-none focus:border-primary"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-[11px] font-bold uppercase text-slate-600 mb-1.5">
                    Main Page Heading
                  </label>
                  <input
                    type="text"
                    value={checkoutConfig.pageText?.pageTitle || ''}
                    onChange={(e) => setCheckoutConfig((prev) => ({
                      ...prev,
                      pageText: { ...(prev.pageText || defaultCheckoutConfig.pageText!), pageTitle: e.target.value }
                    }))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-800 font-bold focus:outline-none focus:border-primary"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-[11px] font-bold uppercase text-slate-600 mb-1.5">
                    Page Description / Subtitle
                  </label>
                  <textarea
                    rows={2}
                    value={checkoutConfig.pageText?.pageDescription || ''}
                    onChange={(e) => setCheckoutConfig((prev) => ({
                      ...prev,
                      pageText: { ...(prev.pageText || defaultCheckoutConfig.pageText!), pageDescription: e.target.value }
                    }))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-800 font-medium focus:outline-none focus:border-primary"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase text-slate-600 mb-1.5">
                    Converted PKR Amount Label
                  </label>
                  <input
                    type="text"
                    value={checkoutConfig.pageText?.pkrConvertedLabel || ''}
                    onChange={(e) => setCheckoutConfig((prev) => ({
                      ...prev,
                      pageText: { ...(prev.pageText || defaultCheckoutConfig.pageText!), pkrConvertedLabel: e.target.value }
                    }))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-800 font-semibold focus:outline-none focus:border-primary"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase text-slate-600 mb-1.5">
                    Included Features Section Title
                  </label>
                  <input
                    type="text"
                    value={checkoutConfig.pageText?.includedFeaturesHeading || ''}
                    onChange={(e) => setCheckoutConfig((prev) => ({
                      ...prev,
                      pageText: { ...(prev.pageText || defaultCheckoutConfig.pageText!), includedFeaturesHeading: e.target.value }
                    }))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-800 font-semibold focus:outline-none focus:border-primary"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase text-slate-600 mb-1.5">
                    Select Payment Method Step Label
                  </label>
                  <input
                    type="text"
                    value={checkoutConfig.pageText?.selectMethodHeading || ''}
                    onChange={(e) => setCheckoutConfig((prev) => ({
                      ...prev,
                      pageText: { ...(prev.pageText || defaultCheckoutConfig.pageText!), selectMethodHeading: e.target.value }
                    }))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-800 font-semibold focus:outline-none focus:border-primary"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase text-slate-600 mb-1.5">
                    E-Wallet Box Heading
                  </label>
                  <input
                    type="text"
                    value={checkoutConfig.pageText?.eWalletBoxHeading || ''}
                    onChange={(e) => setCheckoutConfig((prev) => ({
                      ...prev,
                      pageText: { ...(prev.pageText || defaultCheckoutConfig.pageText!), eWalletBoxHeading: e.target.value }
                    }))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-800 font-semibold focus:outline-none focus:border-primary"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase text-slate-600 mb-1.5">
                    Instructions Section Label
                  </label>
                  <input
                    type="text"
                    value={checkoutConfig.pageText?.instructionsHeading || ''}
                    onChange={(e) => setCheckoutConfig((prev) => ({
                      ...prev,
                      pageText: { ...(prev.pageText || defaultCheckoutConfig.pageText!), instructionsHeading: e.target.value }
                    }))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-800 font-semibold focus:outline-none focus:border-primary"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase text-slate-600 mb-1.5">
                    WhatsApp Button Label
                  </label>
                  <input
                    type="text"
                    value={checkoutConfig.pageText?.whatsAppButtonText || ''}
                    onChange={(e) => setCheckoutConfig((prev) => ({
                      ...prev,
                      pageText: { ...(prev.pageText || defaultCheckoutConfig.pageText!), whatsAppButtonText: e.target.value }
                    }))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-800 font-semibold focus:outline-none focus:border-primary"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-[11px] font-bold uppercase text-slate-600 mb-1.5">
                    WhatsApp Security / Trust Note
                  </label>
                  <input
                    type="text"
                    value={checkoutConfig.pageText?.whatsAppNoteText || ''}
                    onChange={(e) => setCheckoutConfig((prev) => ({
                      ...prev,
                      pageText: { ...(prev.pageText || defaultCheckoutConfig.pageText!), whatsAppNoteText: e.target.value }
                    }))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-800 font-medium focus:outline-none focus:border-primary"
                  />
                </div>
              </div>
            </div>

            {/* 2. E-Wallet Account Details */}
            <div className="bg-white/80 backdrop-blur-md rounded-2xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-6">
              <div className="border-b border-slate-100 pb-4">
                <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <Smartphone className="w-4 h-4 text-primary" /> 2. E-Wallet Account Details
                </h4>
                <p className="text-slate-500 text-xs mt-0.5">
                  Set the receiving title and mobile number shown on the payment terminal.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-[11px] font-bold uppercase text-slate-600 mb-1.5">
                    Account Title
                  </label>
                  <input
                    type="text"
                    value={checkoutConfig.accountDetails?.accountTitle || ''}
                    onChange={(e) => setCheckoutConfig((prev) => ({
                      ...prev,
                      accountDetails: { ...prev.accountDetails, accountTitle: e.target.value }
                    }))}
                    placeholder="e.g. USMAN AHMAD"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs text-slate-800 font-bold focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase text-slate-600 mb-1.5">
                    Mobile Account Number
                  </label>
                  <input
                    type="text"
                    value={checkoutConfig.accountDetails?.mobileAccountNumber || ''}
                    onChange={(e) => setCheckoutConfig((prev) => ({
                      ...prev,
                      accountDetails: { ...prev.accountDetails, mobileAccountNumber: e.target.value }
                    }))}
                    placeholder="e.g. 03299482074"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs text-slate-800 font-mono font-bold focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                  />
                </div>
              </div>

              {/* Gateway Toggles & Custom Labels */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-100">
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800">JazzCash Gateway Tab</span>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={checkoutConfig.accountDetails?.jazzCashLogoToggle ?? true}
                        onChange={(e) => setCheckoutConfig((prev) => ({
                          ...prev,
                          accountDetails: { ...prev.accountDetails, jazzCashLogoToggle: e.target.checked }
                        }))}
                        className="sr-only peer"
                      />
                      <div className="w-9 h-5 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary"></div>
                    </label>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Tab Label</label>
                    <input
                      type="text"
                      value={checkoutConfig.accountDetails?.jazzCashLabel || ''}
                      onChange={(e) => setCheckoutConfig((prev) => ({
                        ...prev,
                        accountDetails: { ...prev.accountDetails, jazzCashLabel: e.target.value }
                      }))}
                      className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs font-semibold text-slate-800"
                    />
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800">EasyPaisa Gateway Tab</span>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={checkoutConfig.accountDetails?.easyPaisaLogoToggle ?? true}
                        onChange={(e) => setCheckoutConfig((prev) => ({
                          ...prev,
                          accountDetails: { ...prev.accountDetails, easyPaisaLogoToggle: e.target.checked }
                        }))}
                        className="sr-only peer"
                      />
                      <div className="w-9 h-5 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary"></div>
                    </label>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Tab Label</label>
                    <input
                      type="text"
                      value={checkoutConfig.accountDetails?.easyPaisaLabel || ''}
                      onChange={(e) => setCheckoutConfig((prev) => ({
                        ...prev,
                        accountDetails: { ...prev.accountDetails, easyPaisaLabel: e.target.value }
                      }))}
                      className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs font-semibold text-slate-800"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* 3. Plan Pricing Mapping (PKR Conversions) */}
            <div className="bg-white/80 backdrop-blur-md rounded-2xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-6">
              <div className="border-b border-slate-100 pb-4">
                <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-primary" /> 3. Plan Pricing Mapping (PKR Conversions)
                </h4>
                <p className="text-slate-500 text-xs mt-0.5">
                  Set exact PKR prices for each subscription plan tier and billing cycle.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Starter Plan */}
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-4">
                  <span className="text-xs font-black uppercase text-slate-900 block">Starter Plan</span>
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Monthly PKR Price</label>
                    <input
                      type="number"
                      value={checkoutConfig.pkrPrices?.starter?.monthly ?? 0}
                      onChange={(e) => setCheckoutConfig((prev) => ({
                        ...prev,
                        pkrPrices: {
                          ...prev.pkrPrices,
                          starter: { ...prev.pkrPrices?.starter, monthly: Number(e.target.value) }
                        }
                      }))}
                      className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs font-mono font-bold text-slate-800"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Annual PKR Price / Mo</label>
                    <input
                      type="number"
                      value={checkoutConfig.pkrPrices?.starter?.annual ?? 0}
                      onChange={(e) => setCheckoutConfig((prev) => ({
                        ...prev,
                        pkrPrices: {
                          ...prev.pkrPrices,
                          starter: { ...prev.pkrPrices?.starter, annual: Number(e.target.value) }
                        }
                      }))}
                      className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs font-mono font-bold text-slate-800"
                    />
                  </div>
                </div>

                {/* Pro Plan */}
                <div className="p-4 rounded-xl bg-primary-light/30 border border-primary/20 space-y-4">
                  <span className="text-xs font-black uppercase text-primary block">Pro Plan</span>
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Monthly PKR Price</label>
                    <input
                      type="number"
                      value={checkoutConfig.pkrPrices?.pro?.monthly ?? 2500}
                      onChange={(e) => setCheckoutConfig((prev) => ({
                        ...prev,
                        pkrPrices: {
                          ...prev.pkrPrices,
                          pro: { ...prev.pkrPrices?.pro, monthly: Number(e.target.value) }
                        }
                      }))}
                      className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs font-mono font-bold text-slate-800"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Annual PKR Price / Mo</label>
                    <input
                      type="number"
                      value={checkoutConfig.pkrPrices?.pro?.annual ?? 2000}
                      onChange={(e) => setCheckoutConfig((prev) => ({
                        ...prev,
                        pkrPrices: {
                          ...prev.pkrPrices,
                          pro: { ...prev.pkrPrices?.pro, annual: Number(e.target.value) }
                        }
                      }))}
                      className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs font-mono font-bold text-slate-800"
                    />
                  </div>
                </div>

                {/* Studio Plan */}
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-4">
                  <span className="text-xs font-black uppercase text-slate-900 block">Studio Plan</span>
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Monthly PKR Price</label>
                    <input
                      type="number"
                      value={checkoutConfig.pkrPrices?.studio?.monthly ?? 7500}
                      onChange={(e) => setCheckoutConfig((prev) => ({
                        ...prev,
                        pkrPrices: {
                          ...prev.pkrPrices,
                          studio: { ...prev.pkrPrices?.studio, monthly: Number(e.target.value) }
                        }
                      }))}
                      className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs font-mono font-bold text-slate-800"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Annual PKR Price / Mo</label>
                    <input
                      type="number"
                      value={checkoutConfig.pkrPrices?.studio?.annual ?? 6000}
                      onChange={(e) => setCheckoutConfig((prev) => ({
                        ...prev,
                        pkrPrices: {
                          ...prev.pkrPrices,
                          studio: { ...prev.pkrPrices?.studio, annual: Number(e.target.value) }
                        }
                      }))}
                      className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs font-mono font-bold text-slate-800"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* 4. Instruction Steps Editor */}
            <div className="bg-white/80 backdrop-blur-md rounded-2xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div>
                  <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                    <Sliders className="w-4 h-4 text-primary" /> 4. Step-by-Step Payment Instructions
                  </h4>
                  <p className="text-slate-500 text-xs mt-0.5">
                    Customize the step sequence rendered on the checkout page.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setCheckoutConfig((prev) => ({
                    ...prev,
                    instructionSteps: [...(prev.instructionSteps || []), 'New instruction step...']
                  }))}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Step
                </button>
              </div>

              <div className="space-y-3">
                {(checkoutConfig.instructionSteps || []).map((step, idx) => (
                  <div key={idx} className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-primary-light text-primary text-xs font-black flex items-center justify-center shrink-0">
                      {idx + 1}
                    </span>
                    <input
                      type="text"
                      value={step}
                      onChange={(e) => {
                        const val = e.target.value;
                        setCheckoutConfig((prev) => {
                          const updated = [...(prev.instructionSteps || [])];
                          updated[idx] = val;
                          return { ...prev, instructionSteps: updated };
                        });
                      }}
                      className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-800 font-medium focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setCheckoutConfig((prev) => ({
                          ...prev,
                          instructionSteps: (prev.instructionSteps || []).filter((_, i) => i !== idx)
                        }));
                      }}
                      className="p-2 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
                      title="Remove Step"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* 5. WhatsApp Confirmation Settings */}
            <div className="bg-white/80 backdrop-blur-md rounded-2xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-6">
              <div className="border-b border-slate-100 pb-4">
                <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <MessageCircle className="w-4 h-4 text-emerald-600" /> 5. WhatsApp Confirmation Settings
                </h4>
                <p className="text-slate-500 text-xs mt-0.5">
                  Configure destination WhatsApp number and message template with dynamic tags.
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-[11px] font-bold uppercase text-slate-600 mb-1.5">
                    WhatsApp Destination Number (with country code)
                  </label>
                  <input
                    type="text"
                    value={checkoutConfig.whatsAppConfig?.number || ''}
                    onChange={(e) => setCheckoutConfig((prev) => ({
                      ...prev,
                      whatsAppConfig: { ...prev.whatsAppConfig, number: e.target.value }
                    }))}
                    placeholder="e.g. 923299482074"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs text-slate-800 font-mono font-bold focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-[11px] font-bold uppercase text-slate-600">
                      Message Template
                    </label>
                    <span className="text-[10px] text-slate-400 font-medium">
                      Tags: <code className="text-primary font-mono">{`{PLAN_NAME}`}</code>, <code className="text-primary font-mono">{`{AMOUNT}`}</code>, <code className="text-primary font-mono">{`{ACCOUNT_NAME}`}</code>, <code className="text-primary font-mono">{`{ACCOUNT_NUMBER}`}</code>, <code className="text-primary font-mono">{`{BILLING_CYCLE}`}</code>
                    </span>
                  </div>
                  <textarea
                    rows={4}
                    value={checkoutConfig.whatsAppConfig?.messageTemplate || ''}
                    onChange={(e) => setCheckoutConfig((prev) => ({
                      ...prev,
                      whatsAppConfig: { ...prev.whatsAppConfig, messageTemplate: e.target.value }
                    }))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs text-slate-800 font-medium leading-relaxed focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                  />
                </div>
              </div>
            </div>

            {/* 6. Legal & Policy Agreement Controls */}
            <div className="bg-white/80 backdrop-blur-md rounded-2xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-6">
              <div className="border-b border-slate-100 pb-4">
                <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <FileText className="w-4 h-4 text-primary" /> 6. Legal & Agreement Policy Controls
                </h4>
                <p className="text-slate-500 text-xs mt-0.5">
                  Require users to accept terms before enabling the WhatsApp submission button.
                </p>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 border border-slate-200">
                  <div>
                    <span className="text-xs font-bold text-slate-800 block">Enforce Terms Checkbox</span>
                    <span className="text-[11px] text-slate-500">Require checkbox check before payment confirmation.</span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={checkoutConfig.legalPolicy?.enforceTermsCheckbox ?? true}
                      onChange={(e) => setCheckoutConfig((prev) => ({
                        ...prev,
                        legalPolicy: { ...prev.legalPolicy, enforceTermsCheckbox: e.target.checked }
                      }))}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary"></div>
                  </label>
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase text-slate-600 mb-1.5">
                    Checkbox Label Text
                  </label>
                  <input
                    type="text"
                    value={checkoutConfig.legalPolicy?.checkboxLabelText || ''}
                    onChange={(e) => setCheckoutConfig((prev) => ({
                      ...prev,
                      legalPolicy: { ...prev.legalPolicy, checkboxLabelText: e.target.value }
                    }))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs text-slate-800 font-medium"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Terms URL</label>
                    <input
                      type="text"
                      value={checkoutConfig.legalPolicy?.termsUrl || '/termsofservice'}
                      onChange={(e) => setCheckoutConfig((prev) => ({
                        ...prev,
                        legalPolicy: { ...prev.legalPolicy, termsUrl: e.target.value }
                      }))}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-mono text-slate-800"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Privacy URL</label>
                    <input
                      type="text"
                      value={checkoutConfig.legalPolicy?.privacyUrl || '/privacypolicy'}
                      onChange={(e) => setCheckoutConfig((prev) => ({
                        ...prev,
                        legalPolicy: { ...prev.legalPolicy, privacyUrl: e.target.value }
                      }))}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-mono text-slate-800"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Refund / Usage URL</label>
                    <input
                      type="text"
                      value={checkoutConfig.legalPolicy?.refundUrl || '/usagepolicy'}
                      onChange={(e) => setCheckoutConfig((prev) => ({
                        ...prev,
                        legalPolicy: { ...prev.legalPolicy, refundUrl: e.target.value }
                      }))}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-mono text-slate-800"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Save Bar */}
            <div className="p-4 bg-slate-900 rounded-2xl border border-slate-800 flex items-center justify-between text-white shadow-xl">
              <span className="text-xs font-semibold text-slate-300">
                Ready to publish updated checkout settings live to all visitors?
              </span>
              <button
                type="button"
                onClick={handleSaveCheckoutConfig}
                disabled={isCheckoutSaving}
                className="px-6 py-2.5 rounded-xl bg-[#2516FF] hover:bg-[#1d11cc] text-white text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer shadow-lg shadow-[#2516FF]/20"
              >
                {isCheckoutSaving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                <span>{isCheckoutSaving ? 'Saving...' : 'Publish Checkout Settings'}</span>
              </button>
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
