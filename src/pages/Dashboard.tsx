import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, 
  LayoutGrid, 
  Folder, 
  Wand2, 
  LayoutTemplate, 
  BarChart2, 
  Plug, 
  Users, 
  Settings, 
  CreditCard, 
  Sparkles, 
  MoreHorizontal, 
  ChevronDown, 
  Bell, 
  Plus, 
  FileText, 
  TrendingUp, 
  Pencil, 
  UserPlus, 
  Check, 
  X,
  Zap,
  LogOut,
  Smartphone,
  Menu
} from 'lucide-react';
import Logo from '../components/ui/Logo';
import { useAuth } from '../context/AuthContext';

interface DashboardProps {
  onLogout: () => void;
}

export default function Dashboard({ onLogout }: DashboardProps) {
  const { user, decrementCredit } = useAuth();
  const navigate = useNavigate();

  // Active Tab state
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [timeRange, setTimeRange] = useState('This Month');

  // Modals & Generator State
  const [showNewBriefModal, setShowNewBriefModal] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [modalBilling, setModalBilling] = useState<'monthly' | 'yearly'>('monthly');
  const [isGenerating, setIsGenerating] = useState(false);
  const [clientNameInput, setClientNameInput] = useState('');
  const [industryInput, setIndustryInput] = useState('');
  const [newlyCreatedBriefs, setNewlyCreatedBriefs] = useState<any[]>([]);

  // User session reading
  const currentUser = (() => {
    const stored = localStorage.getItem('briefora_current_user');
    if (stored) {
      try { return JSON.parse(stored); } catch (e) { /* fallback */ }
    }
    return {
      firstName: user?.firstName || 'Saad',
      lastName: user?.lastName || '',
      email: user?.email || 'saad@briefora.com',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&q=80',
      userRole: 'Workspace'
    };
  })();

  const freeCreditsRemaining = user?.free_credits !== undefined ? user.free_credits : 1;

  const handleCreateBriefSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const success = decrementCredit();
    if (!success) {
      setShowNewBriefModal(false);
      setShowUpgradeModal(true);
      return;
    }

    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
      const briefObj = {
        id: Date.now(),
        client: clientNameInput || 'Redesign Strategy Brief',
        industry: industryInput || 'Digital Experience',
        createdAt: 'Just now',
        status: 'Active'
      };
      setNewlyCreatedBriefs(prev => [briefObj, ...prev]);
      setClientNameInput('');
      setIndustryInput('');
      setShowNewBriefModal(false);
    }, 1000);
  };

  const navMenuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutGrid },
    { id: 'projects', label: 'Projects', icon: Folder },
    { id: 'ai-briefs', label: 'AI Briefs', icon: Wand2 },
    { id: 'templates', label: 'Templates', icon: LayoutTemplate },
    { id: 'analytics', label: 'Analytics', icon: BarChart2 },
    { id: 'integrations', label: 'Integrations', icon: Plug },
    { id: 'team', label: 'Team', icon: Users },
    { id: 'settings', label: 'Settings', icon: Settings },
    { id: 'billing', label: 'Billing', icon: CreditCard },
  ];

  return (
    <div className="flex h-screen w-full bg-[#F8FAFC] font-sans overflow-hidden text-slate-800">

      {/* 📱 MOBILE SIDEBAR OVERLAY */}
      <AnimatePresence>
        {isMobileOpen && (
          <motion.div
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
        className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white border-r border-slate-150 flex flex-col justify-between p-5 transition-transform duration-300 ease-in-out shrink-0 ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="space-y-6">
          {/* Logo Header */}
          <div className="flex items-center justify-between px-2 pt-1">
            <Logo />
            <button
              type="button"
              onClick={() => setIsMobileOpen(false)}
              className="lg:hidden text-slate-400 hover:text-slate-600 p-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Items */}
          <nav className="space-y-1">
            {navMenuItems.map((item) => {
              const IconComp = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    setActiveTab(item.id);
                    setIsMobileOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer group ${
                    isActive
                      ? 'bg-[#EBF2FF] text-[#2516FF]'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <IconComp
                    className={`w-4 h-4 transition-colors ${
                      isActive ? 'text-[#2516FF]' : 'text-slate-400 group-hover:text-slate-600'
                    }`}
                  />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom Sidebar Content: Upgrade Card & Profile */}
        <div className="space-y-4 pt-4 border-t border-slate-100">
          
          {/* Upgrade Card */}
          <div className="bg-[#F4F7FF] border border-blue-100/80 rounded-2xl p-4 space-y-3">
            <div className="w-8 h-8 rounded-full bg-blue-100/80 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-[#2516FF]" />
            </div>
            <div>
              <p className="font-bold text-slate-900 text-xs">Upgrade to Pro</p>
              <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                Unlock more features and boost your productivity.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowUpgradeModal(true)}
              className="w-full bg-[#2516FF] hover:bg-[#1f10e6] text-white font-medium text-xs py-2 rounded-xl transition-all shadow-2xs cursor-pointer text-center"
            >
              Upgrade Now
            </button>
          </div>

          {/* User Profile Footer Pill */}
          <div className="relative">
            <div
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="border border-slate-200/80 rounded-2xl p-2.5 flex items-center justify-between hover:bg-slate-50 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-full bg-[#2516FF] text-white font-bold text-xs flex items-center justify-center shrink-0">
                  {currentUser.firstName?.[0]?.toUpperCase() || 'S'}
                </div>
                <div className="truncate text-left">
                  <p className="text-xs font-bold text-slate-900 truncate">{currentUser.firstName || 'Saad'}</p>
                  <p className="text-[10px] text-slate-400 truncate">Workspace</p>
                </div>
              </div>
              <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
            </div>

            {/* Logout Dropdown Popup */}
            <AnimatePresence>
              {isProfileOpen && (
                <>
                  <div className="fixed inset-0 z-30" onClick={() => setIsProfileOpen(false)} />
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 8 }}
                    className="absolute bottom-14 left-0 right-0 bg-white border border-slate-200 shadow-xl rounded-2xl p-2 z-40 text-xs space-y-1"
                  >
                    <div className="px-3 py-2 border-b border-slate-100">
                      <p className="font-bold text-slate-900">{currentUser.firstName} {currentUser.lastName}</p>
                      <p className="text-[10px] text-slate-400 truncate">{currentUser.email}</p>
                    </div>
                    <button
                      type="button"
                      onClick={onLogout}
                      className="w-full flex items-center gap-2 px-3 py-2 text-rose-600 hover:bg-rose-50 rounded-xl font-semibold text-left cursor-pointer transition-colors"
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
      <div className="flex-1 flex flex-col h-full overflow-hidden">

        {/* 🔝 TOP HEADER BAR */}
        <header className="bg-white border-b border-slate-200/80 px-6 py-3.5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3 flex-1">
            <button
              type="button"
              onClick={() => setIsMobileOpen(true)}
              className="lg:hidden text-slate-500 p-1.5 rounded-lg hover:bg-slate-100"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Search Capsule Input */}
            <div className="bg-white border border-slate-200/90 rounded-full px-4 py-2 flex items-center gap-2 text-xs text-slate-400 w-full max-w-sm shadow-2xs focus-within:border-blue-500 transition-colors">
              <Search className="w-4 h-4 text-slate-400 shrink-0" />
              <input
                type="text"
                placeholder="Search anything..."
                className="bg-transparent border-none outline-none text-xs text-slate-800 placeholder-slate-400 flex-1"
              />
              <kbd className="px-1.5 py-0.5 rounded border border-slate-200 text-[10px] text-slate-400 font-mono">⌘ K</kbd>
            </div>
          </div>

          {/* Top Right User Controls */}
          <div className="flex items-center gap-3">
            {/* Notification Bell */}
            <div className="w-9 h-9 rounded-full bg-white border border-slate-200/90 flex items-center justify-center relative text-slate-600 hover:text-slate-900 shadow-2xs cursor-pointer transition-colors">
              <Bell className="w-4 h-4" />
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#2516FF] text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                3
              </span>
            </div>

            {/* User Avatar Circle */}
            <div className="w-9 h-9 rounded-full bg-[#2516FF] text-white font-bold flex items-center justify-center text-sm shadow-2xs cursor-pointer">
              {currentUser.firstName?.[0]?.toUpperCase() || 'S'}
            </div>
          </div>
        </header>

        {/* 📜 MAIN DASHBOARD SCROLL CONTENT */}
        <main className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6">

          {/* GREETING & ACTION BUTTON ROW */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
                Welcome back, {currentUser.firstName || 'Saad'} 👋
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Here's what's happening with your workspace today.
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                if (freeCreditsRemaining <= 0) {
                  setShowUpgradeModal(true);
                } else {
                  setShowNewBriefModal(true);
                }
              }}
              className="bg-[#2516FF] hover:bg-[#1f10e6] text-white font-medium text-xs px-4 py-2.5 rounded-xl shadow-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer self-start sm:self-auto shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>New Brief</span>
            </button>
          </div>

          {/* 📊 TOP 4 METRIC CARDS ROW */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Card 1: Total Briefs */}
            <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-2xs relative hover:shadow-md transition-all">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-blue-50/90 flex items-center justify-center">
                  <FileText className="w-5 h-5 text-[#2516FF]" />
                </div>
                <button type="button" className="text-slate-300 hover:text-slate-500 cursor-pointer">
                  <MoreHorizontal className="w-4 h-4" />
                </button>
              </div>
              <p className="text-xs text-slate-500 font-medium mt-3">Total Briefs</p>
              <p className="text-2xl font-bold text-slate-900 mt-1 font-geist">24</p>
              <div className="flex items-center gap-1 mt-2 text-xs">
                <span className="text-emerald-600 font-semibold">↑ 12%</span>
                <span className="text-slate-400">from last week</span>
              </div>
            </div>

            {/* Card 2: Active Projects */}
            <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-2xs relative hover:shadow-md transition-all">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-blue-50/90 flex items-center justify-center">
                  <Folder className="w-5 h-5 text-[#2516FF]" />
                </div>
                <button type="button" className="text-slate-300 hover:text-slate-500 cursor-pointer">
                  <MoreHorizontal className="w-4 h-4" />
                </button>
              </div>
              <p className="text-xs text-slate-500 font-medium mt-3">Active Projects</p>
              <p className="text-2xl font-bold text-slate-900 mt-1 font-geist">8</p>
              <div className="flex items-center gap-1 mt-2 text-xs">
                <span className="text-emerald-600 font-semibold">↑ 8%</span>
                <span className="text-slate-400">from last week</span>
              </div>
            </div>

            {/* Card 3: Completed */}
            <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-2xs relative hover:shadow-md transition-all">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-blue-50/90 flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-[#2516FF]" />
                </div>
                <button type="button" className="text-slate-300 hover:text-slate-500 cursor-pointer">
                  <MoreHorizontal className="w-4 h-4" />
                </button>
              </div>
              <p className="text-xs text-slate-500 font-medium mt-3">Completed</p>
              <p className="text-2xl font-bold text-slate-900 mt-1 font-geist">16</p>
              <div className="flex items-center gap-1 mt-2 text-xs">
                <span className="text-emerald-600 font-semibold">↑ 20%</span>
                <span className="text-slate-400">from last week</span>
              </div>
            </div>

            {/* Card 4: Team Members */}
            <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-2xs relative hover:shadow-md transition-all">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-blue-50/90 flex items-center justify-center">
                  <Users className="w-5 h-5 text-[#2516FF]" />
                </div>
                <button type="button" className="text-slate-300 hover:text-slate-500 cursor-pointer">
                  <MoreHorizontal className="w-4 h-4" />
                </button>
              </div>
              <p className="text-xs text-slate-500 font-medium mt-3">Team Members</p>
              <p className="text-2xl font-bold text-slate-900 mt-1 font-geist">5</p>
              <div className="flex items-center gap-1 mt-2 text-xs">
                <span className="text-slate-400 font-medium">No change</span>
              </div>
            </div>
          </div>

          {/* 🧩 MIDDLE SECTION: 2 COLUMNS LAYOUT */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

            {/* ⬅️ LEFT COLUMN (2 SPANS) */}
            <div className="lg:col-span-2 space-y-5">

              {/* 📈 BRIEFS OVERVIEW CHART CARD */}
              <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-2xs space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="font-bold text-slate-900 text-base">Briefs Overview</h2>
                  <div className="relative">
                    <button
                      type="button"
                      className="border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-600 font-medium bg-white hover:bg-slate-50 flex items-center gap-1 cursor-pointer"
                    >
                      <span>{timeRange}</span>
                      <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                    </button>
                  </div>
                </div>

                {/* Vector SVG Chart Canvas Matching Reference Image */}
                <div className="relative w-full h-64 pt-2">
                  <svg className="w-full h-full overflow-visible" viewBox="0 0 600 220" preserveAspectRatio="none">
                    <defs>
                      <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#2516FF" stopOpacity="0.22" />
                        <stop offset="100%" stopColor="#2516FF" stopOpacity="0.0" />
                      </linearGradient>
                    </defs>

                    {/* Horizontal Grid lines */}
                    <line x1="40" y1="20" x2="580" y2="20" stroke="#F1F5F9" strokeWidth="1" />
                    <line x1="40" y1="60" x2="580" y2="60" stroke="#F1F5F9" strokeWidth="1" />
                    <line x1="40" y1="100" x2="580" y2="100" stroke="#F1F5F9" strokeWidth="1" />
                    <line x1="40" y1="140" x2="580" y2="140" stroke="#F1F5F9" strokeWidth="1" />
                    <line x1="40" y1="180" x2="580" y2="180" stroke="#F1F5F9" strokeWidth="1" />

                    {/* Y Axis Labels */}
                    <text x="15" y="24" fill="#94A3B8" fontSize="11" textAnchor="end">30</text>
                    <text x="15" y="64" fill="#94A3B8" fontSize="11" textAnchor="end">25</text>
                    <text x="15" y="104" fill="#94A3B8" fontSize="11" textAnchor="end">20</text>
                    <text x="15" y="144" fill="#94A3B8" fontSize="11" textAnchor="end">15</text>
                    <text x="15" y="184" fill="#94A3B8" fontSize="11" textAnchor="end">10</text>
                    <text x="15" y="214" fill="#94A3B8" fontSize="11" textAnchor="end">0</text>

                    {/* Filled Gradient Area */}
                    <path
                      d="M 50,160 Q 90,120 130,140 T 210,90 T 290,110 T 370,120 T 450,70 T 530,90 T 570,50 L 570,180 L 50,180 Z"
                      fill="url(#chartGradient)"
                    />

                    {/* Blue Smooth Curve Line */}
                    <path
                      d="M 50,160 Q 90,120 130,140 T 210,90 T 290,110 T 370,120 T 450,70 T 530,90 T 570,50"
                      fill="none"
                      stroke="#2516FF"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                    />

                    {/* Data Points */}
                    <circle cx="50" cy="160" r="3.5" fill="#2516FF" />
                    <circle cx="110" cy="130" r="3.5" fill="#2516FF" />
                    <circle cx="170" cy="150" r="3.5" fill="#2516FF" />
                    <circle cx="230" cy="95" r="3.5" fill="#2516FF" />
                    <circle cx="290" cy="110" r="5" fill="#2516FF" stroke="#FFFFFF" strokeWidth="2" />
                    <circle cx="350" cy="130" r="3.5" fill="#2516FF" />
                    <circle cx="410" cy="105" r="3.5" fill="#2516FF" />
                    <circle cx="470" cy="75" r="3.5" fill="#2516FF" />
                    <circle cx="530" cy="95" r="3.5" fill="#2516FF" />
                    <circle cx="570" cy="50" r="3.5" fill="#2516FF" />

                    {/* Active Point Tooltip Badge '18' on May 16 */}
                    <g transform="translate(278, 70)">
                      <rect x="0" y="0" width="24" height="20" rx="6" fill="#2516FF" />
                      <text x="12" y="14" fill="#FFFFFF" fontSize="11" fontWeight="bold" textAnchor="middle">18</text>
                    </g>
                  </svg>

                  {/* X Axis Date Labels */}
                  <div className="flex justify-between pl-10 pr-2 pt-2 text-[11px] text-slate-400 font-medium">
                    <span>May 1</span>
                    <span>May 6</span>
                    <span>May 11</span>
                    <span className="text-[#2516FF] font-bold">May 16</span>
                    <span>May 21</span>
                    <span>May 26</span>
                    <span>May 31</span>
                  </div>
                </div>
              </div>

              {/* 📁 TOP PROJECTS CARD */}
              <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-2xs space-y-5">
                <div className="flex items-center justify-between">
                  <h2 className="font-bold text-slate-900 text-base">Top Projects</h2>
                  <button
                    type="button"
                    className="border border-slate-200 rounded-xl px-3 py-1 text-xs font-medium text-slate-600 bg-white hover:bg-slate-50 cursor-pointer"
                  >
                    View all
                  </button>
                </div>

                <div className="space-y-4">
                  {/* Item 1 */}
                  <div className="flex items-center justify-between gap-4 p-2.5 rounded-xl hover:bg-slate-50/80 transition-colors">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-xl bg-blue-50 text-[#2516FF] flex items-center justify-center shrink-0">
                        <Pencil className="w-4.5 h-4.5" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-xs text-slate-900 truncate">Breifora Redesign</p>
                        <p className="text-[11px] text-slate-400 truncate">Updated 2 hours ago</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="h-1.5 w-32 sm:w-44 bg-slate-100 rounded-full overflow-hidden">
                        <div className="bg-[#2516FF] h-full w-[75%] rounded-full" />
                      </div>
                      <span className="text-xs font-semibold text-slate-600 w-8 text-right">75%</span>
                      <button type="button" className="text-slate-300 hover:text-slate-500 cursor-pointer">
                        <MoreHorizontal className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Item 2 */}
                  <div className="flex items-center justify-between gap-4 p-2.5 rounded-xl hover:bg-slate-50/80 transition-colors">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-xl bg-blue-50 text-[#2516FF] flex items-center justify-center shrink-0">
                        <LayoutTemplate className="w-4.5 h-4.5" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-xs text-slate-900 truncate">AI Landing Page</p>
                        <p className="text-[11px] text-slate-400 truncate">Updated yesterday</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="h-1.5 w-32 sm:w-44 bg-slate-100 rounded-full overflow-hidden">
                        <div className="bg-[#2516FF] h-full w-[60%] rounded-full" />
                      </div>
                      <span className="text-xs font-semibold text-slate-600 w-8 text-right">60%</span>
                      <button type="button" className="text-slate-300 hover:text-slate-500 cursor-pointer">
                        <MoreHorizontal className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Item 3 */}
                  <div className="flex items-center justify-between gap-4 p-2.5 rounded-xl hover:bg-slate-50/80 transition-colors">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-xl bg-blue-50 text-[#2516FF] flex items-center justify-center shrink-0">
                        <Smartphone className="w-4.5 h-4.5" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-xs text-slate-900 truncate">Mobile App Concept</p>
                        <p className="text-[11px] text-slate-400 truncate">Updated 2 days ago</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="h-1.5 w-32 sm:w-44 bg-slate-100 rounded-full overflow-hidden">
                        <div className="bg-[#2516FF] h-full w-[40%] rounded-full" />
                      </div>
                      <span className="text-xs font-semibold text-slate-600 w-8 text-right">40%</span>
                      <button type="button" className="text-slate-300 hover:text-slate-500 cursor-pointer">
                        <MoreHorizontal className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

            </div>

            {/* ➡️ RIGHT COLUMN (1 SPAN) */}
            <div className="space-y-5">

              {/* 🔔 RECENT ACTIVITY CARD */}
              <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-2xs space-y-5">
                <div className="flex items-center justify-between">
                  <h2 className="font-bold text-slate-900 text-base">Recent Activity</h2>
                  <button
                    type="button"
                    className="border border-slate-200 rounded-xl px-3 py-1 text-xs font-medium text-slate-600 bg-white hover:bg-slate-50 cursor-pointer"
                  >
                    View all
                  </button>
                </div>

                <div className="space-y-4">
                  {/* Activity 1 */}
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
                      <Pencil className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <p className="text-xs font-medium text-slate-800 leading-snug">
                        AI Brief <span className="font-semibold">"Landing Page Design"</span> updated
                      </p>
                      <p className="text-[11px] text-slate-400 mt-0.5">2 minutes ago</p>
                    </div>
                  </div>

                  {/* Activity 2 */}
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 mt-0.5">
                      <Folder className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <p className="text-xs font-medium text-slate-800 leading-snug">
                        New project <span className="font-semibold">"Breifora Redesign"</span> created
                      </p>
                      <p className="text-[11px] text-slate-400 mt-0.5">1 hour ago</p>
                    </div>
                  </div>

                  {/* Activity 3 */}
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center shrink-0 mt-0.5">
                      <Users className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <p className="text-xs font-medium text-slate-800 leading-snug">
                        Team member <span className="font-semibold">Alina</span> joined the workspace
                      </p>
                      <p className="text-[11px] text-slate-400 mt-0.5">3 hours ago</p>
                    </div>
                  </div>

                  {/* Activity 4 */}
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
                      <Check className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <p className="text-xs font-medium text-slate-800 leading-snug">
                        AI Brief <span className="font-semibold">"Mobile App Concept"</span> completed
                      </p>
                      <p className="text-[11px] text-slate-400 mt-0.5">5 hours ago</p>
                    </div>
                  </div>

                  {/* Activity 5 */}
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 mt-0.5">
                      <TrendingUp className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <p className="text-xs font-medium text-slate-800 leading-snug">
                        Template <span className="font-semibold">"SaaS Landing Page"</span> used
                      </p>
                      <p className="text-[11px] text-slate-400 mt-0.5">Yesterday</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* ⚡ QUICK ACTIONS CARD */}
              <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-2xs space-y-4">
                <h2 className="font-bold text-slate-900 text-base">Quick Actions</h2>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {/* Action 1 */}
                  <button
                    type="button"
                    onClick={() => {
                      if (freeCreditsRemaining <= 0) {
                        setShowUpgradeModal(true);
                      } else {
                        setShowNewBriefModal(true);
                      }
                    }}
                    className="bg-[#F8FAFC] border border-slate-100 hover:border-blue-200 rounded-xl p-3.5 flex flex-col items-center justify-center gap-2 cursor-pointer transition-all hover:bg-blue-50/40 text-center group"
                  >
                    <div className="w-8 h-8 rounded-lg bg-blue-50 text-[#2516FF] flex items-center justify-center group-hover:scale-110 transition-transform">
                      <FileText className="w-4 h-4 text-[#2516FF]" />
                    </div>
                    <span className="text-[11px] font-semibold text-slate-700">New Brief</span>
                  </button>

                  {/* Action 2 */}
                  <button
                    type="button"
                    onClick={() => setShowNewBriefModal(true)}
                    className="bg-[#F8FAFC] border border-slate-100 hover:border-blue-200 rounded-xl p-3.5 flex flex-col items-center justify-center gap-2 cursor-pointer transition-all hover:bg-blue-50/40 text-center group"
                  >
                    <div className="w-8 h-8 rounded-lg bg-blue-50 text-[#2516FF] flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Folder className="w-4 h-4 text-[#2516FF]" />
                    </div>
                    <span className="text-[11px] font-semibold text-slate-700">New Project</span>
                  </button>

                  {/* Action 3 */}
                  <button
                    type="button"
                    onClick={() => setActiveTab('templates')}
                    className="bg-[#F8FAFC] border border-slate-100 hover:border-blue-200 rounded-xl p-3.5 flex flex-col items-center justify-center gap-2 cursor-pointer transition-all hover:bg-blue-50/40 text-center group"
                  >
                    <div className="w-8 h-8 rounded-lg bg-blue-50 text-[#2516FF] flex items-center justify-center group-hover:scale-110 transition-transform">
                      <LayoutGrid className="w-4 h-4 text-[#2516FF]" />
                    </div>
                    <span className="text-[11px] font-semibold text-slate-700">Browse Templates</span>
                  </button>

                  {/* Action 4 */}
                  <button
                    type="button"
                    onClick={() => setActiveTab('team')}
                    className="bg-[#F8FAFC] border border-slate-100 hover:border-blue-200 rounded-xl p-3.5 flex flex-col items-center justify-center gap-2 cursor-pointer transition-all hover:bg-blue-50/40 text-center group"
                  >
                    <div className="w-8 h-8 rounded-lg bg-blue-50 text-[#2516FF] flex items-center justify-center group-hover:scale-110 transition-transform">
                      <UserPlus className="w-4 h-4 text-[#2516FF]" />
                    </div>
                    <span className="text-[11px] font-semibold text-slate-700">Invite Team</span>
                  </button>
                </div>
              </div>

            </div>

          </div>

          {/* Render newly generated briefs list if any */}
          {newlyCreatedBriefs.length > 0 && (
            <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-2xs space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">Recently Generated Strategy Briefs</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {newlyCreatedBriefs.map((b) => (
                  <div key={b.id} className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between text-xs">
                    <div>
                      <p className="font-bold text-slate-900">{b.client}</p>
                      <p className="text-[10px] text-slate-400">{b.industry} • {b.createdAt}</p>
                    </div>
                    <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold rounded-md">
                      Active
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

        </main>
      </div>

      {/* 🪄 NEW BRIEF GENERATOR MODAL */}
      <AnimatePresence>
        {showNewBriefModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowNewBriefModal(false)}
              className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative z-10 w-full max-w-md bg-white border border-slate-200 rounded-3xl p-6 shadow-2xl space-y-5"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-blue-50 text-[#2516FF] flex items-center justify-center">
                    <Sparkles className="w-4 h-4 text-[#2516FF]" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">Generate AI Brief</h3>
                    <p className="text-[11px] text-slate-400">1 Free Credit Available</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowNewBriefModal(false)}
                  className="text-slate-400 hover:text-slate-600 p-1"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateBriefSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Client / Project Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Acme Corp Rebrand"
                    value={clientNameInput}
                    onChange={(e) => setClientNameInput(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Industry / Focus Area</label>
                  <input
                    type="text"
                    placeholder="e.g. B2B SaaS & Product Strategy"
                    value={industryInput}
                    onChange={(e) => setIndustryInput(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isGenerating}
                  className="w-full py-3 bg-[#2516FF] hover:bg-[#1f10e6] text-white font-bold text-xs rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                >
                  {isGenerating ? (
                    <span>Compiling Strategy Brief...</span>
                  ) : (
                    <>
                      <Zap className="w-4 h-4 fill-white" />
                      <span>Generate Strategy Deck ({freeCreditsRemaining} Free)</span>
                    </>
                  )}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 🚀 UPGRADE PLAN PAYWALL MODAL */}
      <AnimatePresence>
        {showUpgradeModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
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
                  <span>1-Credit Trial Completed</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
                  Unlock Unlimited Client Strategy Briefs
                </h2>
                <p className="text-slate-500 text-xs sm:text-sm leading-relaxed">
                  You have used your 1 free strategy brief generation. Choose a plan to continue building client magic links, generating strategic blueprints, and closing high-value retainers.
                </p>

                {/* Billing Toggle Switcher */}
                <div className="flex items-center justify-center gap-3 pt-4 select-none">
                  <button
                    type="button"
                    onClick={() => setModalBilling('monthly')}
                    className={`text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer ${
                      modalBilling === 'monthly' ? 'text-[#2516FF]' : 'text-slate-400 hover:text-slate-600'
                    }`}
                  >
                    Billed Monthly
                  </button>
                  <button
                    type="button"
                    onClick={() => setModalBilling(modalBilling === 'monthly' ? 'yearly' : 'monthly')}
                    className={`w-12 h-7 rounded-full p-1 cursor-pointer transition-colors duration-300 relative ${
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
                    className={`text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-colors cursor-pointer ${
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
                        <span>1 Active magic client link</span>
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
                    className="w-full py-3 px-4 bg-[#2516FF] hover:bg-[#1f10e6] text-white font-bold text-xs rounded-xl transition-all shadow-xs cursor-pointer"
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
