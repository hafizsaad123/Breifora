import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  LayoutGrid, 
  Wand2, 
  Settings, 
  CreditCard, 
  Sparkles, 
  ChevronDown, 
  Bell, 
  Plus, 
  X,
  LogOut,
  Menu,
  ChevronRight,
  ShieldCheck,
  Zap,
  Check,
  Search,
  ChevronLeft
} from 'lucide-react';
import Logo from './ui/Logo';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../utils/supabase';
import { getFallbackProfile } from '../utils/fallbackDb';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const { user, logout, updateUser, sidebarOpen, setSidebarOpen, searchQuery, setSearchQuery } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [profileData, setProfileData] = useState<any>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [modalBilling, setModalBilling] = useState<'monthly' | 'yearly'>('monthly');

  // Verify authentication
  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  // Fetch the profiles table for dynamic layout info
  const fetchProfile = async () => {
    if (!user?.id) return;
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

      if (error) {
        console.warn('Error fetching profile in layout (using local fallback):', error);
        const fallback = getFallbackProfile(user.id);
        setProfileData(fallback);
      } else if (data) {
        setProfileData(data);
        // Also update the local auth context to stay in sync
        updateUser({
          name: data.full_name || data.name || user.name,
          free_credits: data.free_credits !== undefined ? data.free_credits : user.free_credits,
          subscription_status: data.subscription_status || data.plan || user.subscription_status,
          workspaceName: data.workspace_name || data.workspaceName || user.workspaceName
        });
      } else {
        const fallback = getFallbackProfile(user.id);
        setProfileData(fallback);
      }
    } catch (err) {
      console.warn('Unexpected layout profile fetch error (using local fallback):', err);
      const fallback = getFallbackProfile(user.id);
      setProfileData(fallback);
    } finally {
      setLoadingProfile(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [user?.id, location.pathname]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    logout();
    navigate('/');
  };

  if (!user) {
    return null;
  }

  const navMenuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutGrid, path: '/dashboard' },
    { id: 'briefs', label: 'AI Strategy Briefs', icon: Wand2, path: '/briefs' },
    { id: 'new-brief', label: 'Generate Strategy Brief', icon: Plus, path: '/briefs/new' },
    { id: 'settings', label: 'Settings', icon: Settings, path: '/settings' },
  ];

  const currentPath = location.pathname;
  const freeCredits = profileData?.free_credits !== undefined ? profileData.free_credits : (user?.free_credits ?? 0);
  const workspaceName = profileData?.workspace_name || user?.workspaceName || 'My Strategy Hub';
  const fullName = profileData?.full_name || user?.name || 'Saad';
  const subStatus = profileData?.subscription_status || user?.subscription_status || 'free';

  return (
    <div className="flex h-screen w-full bg-[#F8FAFC] font-sans overflow-hidden text-slate-800" id="briefora-dashboard-root">
      
      {/* 📱 MOBILE SIDEBAR OVERLAY */}
      <AnimatePresence>
        {isMobileOpen && (
          <motion.div
            id="mobile-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsMobileOpen(false)}
            className="fixed inset-0 bg-slate-900/50 z-40 lg:hidden backdrop-blur-xs"
          />
        )}
      </AnimatePresence>

      {/* 🧭 LEFT SIDEBAR NAVIGATION */}
      <aside
        id="dashboard-sidebar"
        className={`fixed lg:static inset-y-0 left-0 z-50 bg-white border-r border-slate-200/60 flex flex-col justify-between transition-all duration-300 ease-in-out shrink-0 ${
          sidebarOpen ? 'w-64 p-5' : 'w-20 p-3 lg:p-4'
        } ${
          isMobileOpen ? 'w-64 p-5 translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="space-y-6">
          {/* Logo Header */}
          <div className={`flex items-center pt-1 ${sidebarOpen ? 'justify-between px-2' : 'justify-center'}`} id="sidebar-logo-header">
            {sidebarOpen ? (
              <>
                <Logo />
                <div className="flex items-center gap-1">
                  <button
                    id="collapse-sidebar-btn"
                    type="button"
                    onClick={() => setSidebarOpen(false)}
                    className="hidden lg:flex text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-50 cursor-pointer transition-colors"
                    title="Collapse Sidebar"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    id="close-mobile-menu-btn"
                    type="button"
                    onClick={() => setIsMobileOpen(false)}
                    className="lg:hidden text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </>
            ) : (
              <button
                id="expand-sidebar-btn"
                type="button"
                onClick={() => setSidebarOpen(true)}
                className="hidden lg:flex text-slate-400 hover:text-slate-600 p-2 rounded-lg hover:bg-slate-50 cursor-pointer transition-colors"
                title="Expand Sidebar"
              >
                <ChevronRight className="w-5 h-5 text-[#2516FF]" />
              </button>
            )}
          </div>

          {/* Navigation Items */}
          <nav className="space-y-1.5" id="sidebar-nav">
            {navMenuItems.map((item) => {
              const IconComp = item.icon;
              const isActive = currentPath === item.path || (item.path === '/briefs' && currentPath.startsWith('/briefs/'));
              const showText = sidebarOpen || isMobileOpen;
              return (
                <Link
                  id={`nav-item-${item.id}`}
                  key={item.id}
                  to={item.path}
                  onClick={() => setIsMobileOpen(false)}
                  className={`w-full flex items-center rounded-xl text-xs font-semibold transition-all cursor-pointer group ${
                    showText ? 'justify-start gap-3 px-3.5 py-2.5' : 'justify-center p-2.5'
                  } ${
                    isActive
                      ? 'bg-[#EBF2FF] text-[#2516FF]'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                  title={!showText ? item.label : undefined}
                >
                  <IconComp
                    className={`w-4 h-4 transition-colors shrink-0 ${
                      isActive ? 'text-[#2516FF]' : 'text-slate-400 group-hover:text-slate-600'
                    }`}
                  />
                  {showText && <span>{item.label}</span>}
                  {item.id === 'new-brief' && showText && (
                    <span className="ml-auto bg-[#2516FF] text-white text-[9px] px-1.5 py-0.5 rounded-full font-bold">
                      {freeCredits}
                    </span>
                  )}
                  {item.id === 'new-brief' && !showText && (
                    <div className="absolute top-1 right-1 w-1.5 h-1.5 bg-[#2516FF] rounded-full animate-pulse" />
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Bottom Sidebar Content: Upgrade Card & Profile */}
        <div className="space-y-4 pt-4 border-t border-slate-100" id="sidebar-footer">
          
          {/* Upgrade Card */}
          {subStatus === 'free' && (sidebarOpen || isMobileOpen) && (
            <div id="sidebar-upgrade-card" className="bg-[#F4F7FF] border border-blue-100/80 rounded-2xl p-4 space-y-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="w-8 h-8 rounded-full bg-blue-100/80 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-[#2516FF]" />
              </div>
              <div>
                <p className="font-bold text-slate-900 text-xs">Upgrade to Pro</p>
                <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                  Unlock unlimited strategic client briefs & magic strategy links.
                </p>
              </div>
              <button
                id="sidebar-upgrade-now-btn"
                type="button"
                onClick={() => setShowUpgradeModal(true)}
                className="w-full bg-[#2516FF] hover:bg-[#1f10e6] text-white font-bold text-[11px] py-2 rounded-xl transition-all shadow-2xs cursor-pointer text-center border-none"
              >
                Upgrade Now
              </button>
            </div>
          )}

          {subStatus === 'free' && (!sidebarOpen && !isMobileOpen) && (
            <button
              id="sidebar-upgrade-mini-btn"
              type="button"
              onClick={() => setShowUpgradeModal(true)}
              className="w-full h-10 rounded-xl bg-[#F4F7FF] border border-blue-100/80 hover:bg-blue-100 flex items-center justify-center text-[#2516FF] transition-all cursor-pointer"
              title="Upgrade to Pro"
            >
              <Sparkles className="w-4 h-4 text-[#2516FF]" />
            </button>
          )}

          {/* User Profile Footer Pill */}
          <div className="relative" id="sidebar-profile-pill">
            <div
              id="profile-dropdown-toggle"
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className={`border border-slate-200/80 rounded-2xl flex items-center hover:bg-slate-50 transition-colors cursor-pointer ${
                sidebarOpen || isMobileOpen ? 'p-2.5 justify-between' : 'p-2 justify-center'
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-full bg-[#2516FF] text-white font-bold text-xs flex items-center justify-center shrink-0">
                  {fullName?.[0]?.toUpperCase() || 'U'}
                </div>
                {(sidebarOpen || isMobileOpen) && (
                  <div className="truncate text-left">
                    <p className="text-xs font-bold text-slate-900 truncate">{fullName}</p>
                    <p className="text-[10px] text-slate-400 truncate font-semibold uppercase tracking-wider">{workspaceName}</p>
                  </div>
                )}
              </div>
              {(sidebarOpen || isMobileOpen) && <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />}
            </div>

            {/* Logout Dropdown Popup */}
            <AnimatePresence>
              {isProfileOpen && (
                <>
                  <div className="fixed inset-0 z-30" onClick={() => setIsProfileOpen(false)} />
                  <motion.div
                    id="profile-popup-menu"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 8 }}
                    className="absolute bottom-14 left-0 right-0 bg-white border border-slate-200 shadow-xl rounded-2xl p-2 z-40 text-xs space-y-1"
                  >
                    <div className="px-3 py-2 border-b border-slate-100">
                      <p className="font-bold text-slate-900 truncate">{fullName}</p>
                      <p className="text-[10px] text-slate-400 truncate">{user.email}</p>
                    </div>
                    <button
                      id="profile-logout-btn"
                      type="button"
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-3 py-2 text-rose-600 hover:bg-rose-50 rounded-xl font-semibold text-left cursor-pointer transition-colors border-none bg-transparent"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Log Out</span>
                    </button>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>

        </div>
      </aside>

      {/* 🖥️ MAIN VIEWPORT CONTAINER */}
      <div className="flex-1 flex flex-col h-full overflow-hidden" id="dashboard-viewport">

        {/* 🔝 TOP HEADER BAR */}
        <header className="bg-white border-b border-slate-200/80 px-6 py-3.5 flex items-center justify-between shrink-0" id="dashboard-header">
          <div className="flex items-center gap-3 flex-1 min-w-0 mr-4">
            <button
              id="mobile-menu-toggle"
              type="button"
              onClick={() => setIsMobileOpen(true)}
              className="lg:hidden text-slate-500 p-1.5 rounded-lg hover:bg-slate-100 cursor-pointer"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Real Global Search Bar */}
            <div className="flex-1 max-w-md relative" id="header-search-bar">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-slate-400" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search briefs by title or client name..."
                className="block w-full pl-9 pr-3 py-2 border border-slate-200 rounded-xl bg-slate-50 hover:bg-slate-50/50 focus:bg-white focus:ring-2 focus:ring-[#2516FF]/25 focus:border-[#2516FF] text-xs font-semibold placeholder-slate-400 transition-all outline-none"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Top Right User Controls */}
          <div className="flex items-center gap-3 shrink-0" id="header-controls">
            {/* Credits Counter badge */}
            <div id="credit-badge" className="hidden sm:flex items-center gap-1.5 bg-[#2516FF]/10 text-[#2516FF] text-[11px] font-bold px-3 py-1.5 rounded-full border border-[#2516FF]/20">
              <Zap className="w-3.5 h-3.5 fill-[#2516FF]" />
              <span>{freeCredits} Trial Credits</span>
            </div>

            {/* Notification Bell */}
            <div className="w-9 h-9 rounded-full bg-white border border-slate-200/90 flex items-center justify-center relative text-slate-600 hover:text-slate-900 shadow-2xs cursor-pointer transition-colors">
              <Bell className="w-4 h-4" />
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#2516FF] text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                1
              </span>
            </div>

            {/* User Avatar Circle */}
            <div className="w-9 h-9 rounded-full bg-[#2516FF] text-white font-bold flex items-center justify-center text-sm shadow-2xs">
              {fullName?.[0]?.toUpperCase() || 'U'}
            </div>
          </div>
        </header>

        {/* 📜 MAIN CONTENT */}
        <main className="flex-1 overflow-y-auto" id="dashboard-main-content">
          {loadingProfile ? (
            <div className="w-full h-full flex items-center justify-center bg-slate-50/50">
              <div className="flex flex-col items-center gap-3">
                <div className="w-8 h-8 rounded-full border-2 border-slate-200 border-t-[#2516FF] animate-spin" />
                <p className="text-xs text-slate-500 font-semibold">Synchronizing with Supabase...</p>
              </div>
            </div>
          ) : (
            children
          )}
        </main>
      </div>

      {/* 🚀 UPGRADE PLAN PAYWALL MODAL */}
      <AnimatePresence>
        {showUpgradeModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto" id="layout-upgrade-modal">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowUpgradeModal(false)}
              className="fixed inset-0 bg-slate-950/40 backdrop-blur-xs"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative z-10 w-full max-w-4xl bg-white border border-slate-200/95 rounded-3xl p-6 sm:p-8 text-slate-900 shadow-2xl overflow-hidden my-auto"
            >
              <button
                type="button"
                onClick={() => setShowUpgradeModal(false)}
                className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 p-2 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="text-center max-w-2xl mx-auto mb-8 space-y-3">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-xs font-bold uppercase tracking-wider border border-blue-100/80">
                  <Zap className="w-3.5 h-3.5 fill-blue-600" />
                  <span>Interactive Strategy Plans</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
                  Unlock Unlimited Client Strategy Briefs
                </h2>
                <p className="text-slate-500 text-xs sm:text-sm leading-relaxed">
                  Choose the plan that suits your client workload. Generate robust marketing briefs, interactive wireframe instructions, and typography pairing recommendations in seconds.
                </p>

                {/* Billing Toggle Switcher */}
                <div className="flex items-center justify-center gap-3 pt-4 select-none">
                  <button
                    type="button"
                    onClick={() => setModalBilling('monthly')}
                    className={`text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer border-none bg-transparent ${
                      modalBilling === 'monthly' ? 'text-[#2516FF]' : 'text-slate-400 hover:text-slate-600'
                    }`}
                  >
                    Billed Monthly
                  </button>
                  <button
                    type="button"
                    onClick={() => setModalBilling(modalBilling === 'monthly' ? 'yearly' : 'monthly')}
                    className={`w-12 h-7 rounded-full p-1 cursor-pointer transition-colors duration-300 relative border-none ${
                      modalBilling === 'yearly' ? 'bg-[#2516FF]' : 'bg-slate-200'
                    }`}
                  >
                    <motion.div
                      layout
                      className="w-5 h-5 rounded-full bg-white shadow-xs"
                      animate={{ x: modalBilling === 'yearly' ? 20 : 0 }}
                      transition={{ type: "spring", stiffness: 350, damping: 25 }}
                    />
                  </button>
                  <button
                    type="button"
                    onClick={() => setModalBilling('yearly')}
                    className={`text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-colors cursor-pointer border-none bg-transparent ${
                      modalBilling === 'yearly' ? 'text-[#2516FF]' : 'text-slate-400 hover:text-slate-600'
                    }`}
                  >
                    Billed Annually <span className="text-[10px] bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full border border-emerald-100">Save 20%</span>
                  </button>
                </div>
              </div>

              {/* 3 Pricing Options Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-stretch">
                {/* STARTER CARD */}
                <div className="bg-slate-50/60 border border-slate-200/80 rounded-2xl p-6 flex flex-col justify-between space-y-6 hover:border-slate-300 transition-all shadow-3xs">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-bold text-slate-900">Starter</h3>
                      <span className="text-[10px] font-bold uppercase bg-slate-100 text-slate-600 px-2.5 py-0.5 rounded-full border border-slate-200">Sandbox</span>
                    </div>
                    <p className="text-xs text-slate-500">For independent creators establishing their workflow.</p>
                    <div className="py-2">
                      <p className="text-2xl font-black text-slate-900 font-mono">
                        {modalBilling === 'yearly' ? 'PKR 17,000' : 'PKR 2,500'}
                      </p>
                      <p className="text-[10px] text-slate-500">{modalBilling === 'yearly' ? '/ year' : '/ month'}</p>
                    </div>
                    <ul className="space-y-2 text-xs text-slate-600 pt-2">
                      <li className="flex items-center gap-2">
                        <Check className="w-3.5 h-3.5 text-[#2516FF] shrink-0" />
                        <span>10 Active magic strategy briefs</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="w-3.5 h-3.5 text-[#2516FF] shrink-0" />
                        <span>Tactile core typographic tracks</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="w-3.5 h-3.5 text-[#2516FF] shrink-0" />
                        <span>Direct raw data exports</span>
                      </li>
                    </ul>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setShowUpgradeModal(false);
                      navigate(`/checkout?plan=starter&billing=${modalBilling}`);
                    }}
                    className="w-full py-3 px-4 bg-white hover:bg-slate-50 text-slate-800 font-bold text-xs rounded-xl transition-all border border-slate-200/80 hover:border-slate-300 shadow-3xs cursor-pointer"
                  >
                    Upgrade to Starter
                  </button>
                </div>

                {/* PRO CARD (HIGHLIGHTED) */}
                <div className="bg-white border-2 border-[#2516FF] rounded-2xl p-6 flex flex-col justify-between space-y-6 relative shadow-md shadow-blue-500/5">
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#2516FF] text-white text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full shadow-xs">
                    Most Popular
                  </span>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between pt-1">
                      <h3 className="text-lg font-bold text-slate-900">Pro</h3>
                      <span className="text-[10px] font-bold uppercase bg-blue-50 text-blue-600 px-2.5 py-0.5 rounded-full border border-blue-100">Agencies</span>
                    </div>
                    <p className="text-xs text-slate-500">For active freelance designers and brand strategists.</p>
                    <div className="py-2">
                      <p className="text-2xl font-black text-slate-900 font-mono">
                        {modalBilling === 'yearly' ? 'PKR 35,000' : 'PKR 5,000'}
                      </p>
                      <p className="text-[10px] text-slate-500">{modalBilling === 'yearly' ? '/ year' : '/ month'}</p>
                    </div>
                    <ul className="space-y-2 text-xs text-slate-600 pt-2">
                      <li className="flex items-center gap-2">
                        <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                        <span>Unlimited active brief links</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                        <span>Strategic blueprint compiler</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                        <span>Premium PDF exports & branding</span>
                      </li>
                    </ul>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setShowUpgradeModal(false);
                      navigate(`/checkout?plan=pro&billing=${modalBilling}`);
                    }}
                    className="w-full py-3 px-4 bg-[#2516FF] hover:bg-[#1f10e6] text-white font-bold text-xs rounded-xl transition-all shadow-xs cursor-pointer border-none"
                  >
                    Upgrade to Pro
                  </button>
                </div>

                {/* STUDIO CARD */}
                <div className="bg-slate-50/60 border border-slate-200/80 rounded-2xl p-6 flex flex-col justify-between space-y-6 hover:border-slate-300 transition-all shadow-3xs">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-bold text-slate-900">Studio</h3>
                      <span className="text-[10px] font-bold uppercase bg-purple-50 text-purple-600 px-2.5 py-0.5 rounded-full border border-purple-100">Enterprise</span>
                    </div>
                    <p className="text-xs text-slate-500">For high-end digital agencies and creative groups.</p>
                    <div className="py-2">
                      <p className="text-2xl font-black text-slate-900 font-mono">
                        {modalBilling === 'yearly' ? 'PKR 85,000' : 'PKR 12,000'}
                      </p>
                      <p className="text-[10px] text-slate-500">{modalBilling === 'yearly' ? '/ year' : '/ month'}</p>
                    </div>
                    <ul className="space-y-2 text-xs text-slate-600 pt-2">
                      <li className="flex items-center gap-2">
                        <Check className="w-3.5 h-3.5 text-purple-500 shrink-0" />
                        <span>100% white-label client portals</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="w-3.5 h-3.5 text-purple-500 shrink-0" />
                        <span>Custom studio domain hosting</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="w-3.5 h-3.5 text-purple-500 shrink-0" />
                        <span>Up to 5 team editor seats</span>
                      </li>
                    </ul>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setShowUpgradeModal(false);
                      navigate(`/checkout?plan=studio&billing=${modalBilling}`);
                    }}
                    className="w-full py-3 px-4 bg-white hover:bg-slate-50 text-slate-800 font-bold text-xs rounded-xl transition-all border border-slate-200/80 hover:border-slate-300 shadow-3xs cursor-pointer"
                  >
                    Upgrade to Studio
                  </button>
                </div>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
