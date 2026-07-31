import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, 
  Home, 
  Inbox, 
  Link as LinkIcon, 
  Users, 
  Calendar, 
  LineChart, 
  CheckSquare, 
  TrendingUp, 
  FileText, 
  Blocks, 
  HelpCircle, 
  Settings, 
  Bell, 
  MoreHorizontal, 
  LogOut, 
  ChevronDown, 
  ArrowUp, 
  ArrowDown, 
  CalendarCheck, 
  Mail, 
  MailOpen, 
  CornerUpLeft, 
  EyeOff,
  Building2, 
  Tag, 
  Check,
  ChevronLeft,
  ChevronRight,
  SlidersHorizontal,
  X,
  Menu
} from 'lucide-react';
import Logo from '../components/ui/Logo';

interface DashboardProps {
  onLogout: () => void;
}

// Exact mock historical data from the image_77f6f1.jpg reference
const INITIAL_MESSAGES = [
  {
    id: 1,
    name: "Maya Tran",
    email: "maya@zenli.io",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80",
    message: "Thanks for reaching out—this looks interesting.",
    date: "Jul 9, 2025",
    status: "Booked",
    organization: "Zenli",
    tags: "Top priority"
  },
  {
    id: 2,
    name: "Lucas Moreno",
    email: "lucas@syncro.io",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&q=80",
    message: "Let's set something up for early next week.",
    date: "Jul 11, 2025",
    status: "Replied",
    organization: "Syncro",
    tags: "Meeting booked"
  },
  {
    id: 3,
    name: "Aiden Clark",
    email: "aiden@briva.ai",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=100&q=80",
    message: "Appreciate the follow-up. We're not ready yet.",
    date: "Jul 10, 2025",
    status: "Replied",
    organization: "Briva",
    tags: "Needs review"
  },
  {
    id: 4,
    name: "Noor El-Sayed",
    email: "noor@lumora.com",
    avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=100&q=80",
    message: "Can you share more about the pricing model?",
    date: "Jul 8, 2025",
    status: "Ignored",
    organization: "Lumora",
    tags: "Needs review"
  },
  {
    id: 5,
    name: "Sofia Dimitrova",
    email: "sofia@flowly.io",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=100&q=80",
    message: "Forwarded this to our CTO. He'll get back to you.",
    date: "Jul 7, 2025",
    status: "Opened",
    organization: "Flowly",
    tags: "Top priority"
  },
  {
    id: 6,
    name: "Zane Mitchell",
    email: "zane@orbix.co",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=100&q=80",
    message: "I'm interested. Can you show a quick demo?",
    date: "Jul 6, 2025",
    status: "Ignored",
    organization: "Orbix",
    tags: "Needs review"
  },
  {
    id: 7,
    name: "Chloe Alvarez",
    email: "chloe@finza.co",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=100&q=80",
    message: "We've just onboarded a different tool, sorry.",
    date: "Jul 5, 2025",
    status: "Opened",
    organization: "Finza",
    tags: "Top lead"
  },
  {
    id: 8,
    name: "Farah Bensaid",
    email: "farah@clearo.io",
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=100&q=80",
    message: "Your product seems like a great fit for our team.",
    date: "Jul 3, 2025",
    status: "Booked",
    organization: "Clearo",
    tags: "Top priority"
  },
  {
    id: 9,
    name: "Matteo Ricci",
    email: "matteo@stryx.dev",
    avatar: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=100&q=80",
    message: "This sounds promising—mind sending a deck?",
    date: "Jul 2, 2025",
    status: "Replied",
    organization: "Stryx",
    tags: "Needs review"
  },
  {
    id: 10,
    name: "Lina Novak",
    email: "lina@quanty.com",
    avatar: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&w=100&q=80",
    message: "Just saw this—do you have time for a quick chat?",
    date: "Jun 30, 2025",
    status: "Ignored",
    organization: "Quanty",
    tags: "Needs review"
  }
];

export default function Dashboard({ onLogout }: DashboardProps) {
  // Read current user session from LocalStorage
  const [currentUser, setCurrentUser] = useState(() => {
    const stored = localStorage.getItem('briefora_current_user');
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (e) {
        console.error('Error parsing briefora_current_user:', e);
      }
    }
    return {
      firstName: "Omar",
      lastName: "Ktiri",
      email: "omar@briefora.com",
      avatar: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=100&q=80",
      userRole: "Briefora Admin",
      workspaceName: "Briefora HQ"
    };
  });

  // Keep state in sync if local storage updates
  useEffect(() => {
    const handleStorageChange = () => {
      const stored = localStorage.getItem('briefora_current_user');
      if (stored) {
        try {
          setCurrentUser(JSON.parse(stored));
        } catch (e) {
          console.error(e);
        }
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Navigation active tab tracking
  const [activeTab, setActiveTab] = useState('Home');
  const [sidebarSearch, setSidebarSearch] = useState('');
  
  // Sidebar minimized state (Desktop/Tablet collapse)
  const [isCollapsed, setIsCollapsed] = useState(false);
  // Sidebar expanded drawer state on Mobile
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // Table filter options
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [orgFilter, setOrgFilter] = useState('All');
  const [tagFilter, setTagFilter] = useState('All');
  
  // Selection and interactive states
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const [showOrgDropdown, setShowOrgDropdown] = useState(false);
  const [showTagDropdown, setShowTagDropdown] = useState(false);
  const [activeDateRange, setActiveDateRange] = useState('Last 7 days');

  // Available filters from data
  const statusOptions = ['All', 'Booked', 'Replied', 'Opened', 'Ignored'];
  const orgOptions = ['All', 'Zenli', 'Syncro', 'Briva', 'Lumora', 'Flowly', 'Orbix', 'Finza', 'Clearo', 'Stryx', 'Quanty'];
  const tagOptions = ['All', 'Top priority', 'Meeting booked', 'Needs review', 'Top lead'];

  // Main menu items
  const mainNavItems = [
    { name: 'Home', icon: Home },
    { name: 'Inbox', icon: Inbox, badge: 3 },
    { name: 'Sequences', icon: LinkIcon },
    { name: 'Prospects', icon: Users },
    { name: 'Meetings', icon: Calendar },
    { name: 'Pipeline', icon: LineChart },
    { name: 'Tasks', icon: CheckSquare },
    { name: 'Insights', icon: TrendingUp },
  ];

  // Utility menu items
  const utilityNavItems = [
    { name: 'Templates', icon: FileText },
    { name: 'Integrations', icon: Blocks },
    { name: 'Support', icon: HelpCircle },
    { name: 'Settings', icon: Settings },
  ];

  // Filter messages based on multi-parameter selectors
  const filteredMessages = useMemo(() => {
    return INITIAL_MESSAGES.filter(msg => {
      const matchSearch = 
        msg.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        msg.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        msg.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
        msg.organization.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchStatus = statusFilter === 'All' || msg.status === statusFilter;
      const matchOrg = orgFilter === 'All' || msg.organization === orgFilter;
      const matchTag = tagFilter === 'All' || msg.tags === tagFilter;

      return matchSearch && matchStatus && matchOrg && matchTag;
    });
  }, [searchTerm, statusFilter, orgFilter, tagFilter]);

  // Pagination setup (10 messages per page default, let's paginate by 5 for perfect demonstration of Previous/Next)
  const itemsPerPage = 5;
  const totalPages = Math.ceil(filteredMessages.length / itemsPerPage);
  
  const paginatedMessages = useMemo(() => {
    const startIdx = (currentPage - 1) * itemsPerPage;
    return filteredMessages.slice(startIdx, startIdx + itemsPerPage);
  }, [filteredMessages, currentPage]);

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(paginatedMessages.map(m => m.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectRow = (id: number, checked: boolean) => {
    if (checked) {
      setSelectedIds(prev => [...prev, id]);
    } else {
      setSelectedIds(prev => prev.filter(rowId => rowId !== id));
    }
  };

  const getStatusStyle = (status: string) => {
    switch(status) {
      case 'Booked':
        return {
          bg: 'bg-blue-50/70',
          text: 'text-cyan-600',
          border: 'border-blue-100',
          iconColor: 'text-cyan-500'
        };
      case 'Replied':
        return {
          bg: 'bg-emerald-50/60',
          text: 'text-emerald-600',
          border: 'border-emerald-100',
          iconColor: 'text-emerald-500'
        };
      case 'Opened':
        return {
          bg: 'bg-amber-50/60',
          text: 'text-amber-500',
          border: 'border-amber-100',
          iconColor: 'text-amber-400'
        };
      case 'Ignored':
      default:
        return {
          bg: 'bg-slate-50/80',
          text: 'text-slate-500',
          border: 'border-slate-100',
          iconColor: 'text-slate-400'
        };
    }
  };

  const getTagStyle = (tag: string) => {
    switch (tag) {
      case 'Top priority':
        return 'text-cyan-600 bg-cyan-50 border-cyan-100 hover:bg-cyan-100/50';
      case 'Meeting booked':
        return 'text-emerald-600 bg-emerald-50 border-emerald-100 hover:bg-emerald-100/50';
      case 'Needs review':
        return 'text-amber-500 bg-amber-50 border-amber-100 hover:bg-amber-100/50';
      case 'Top lead':
        return 'text-rose-500 bg-rose-50 border-rose-100 hover:bg-rose-100/50';
      default:
        return 'text-slate-500 bg-slate-50 border-slate-100';
    }
  };

  // Sidebar list matching Briefora Search filtering
  const filteredMainNav = useMemo(() => {
    if (!sidebarSearch) return mainNavItems;
    return mainNavItems.filter(item => item.name.toLowerCase().includes(sidebarSearch.toLowerCase()));
  }, [sidebarSearch]);

  const filteredUtilNav = useMemo(() => {
    if (!sidebarSearch) return utilityNavItems;
    return utilityNavItems.filter(item => item.name.toLowerCase().includes(sidebarSearch.toLowerCase()));
  }, [sidebarSearch]);

  return (
    <div className="w-full h-screen flex bg-[#F8F9FC] font-sans overflow-hidden text-slate-800">
      
      {/* 🔮 MOBILE DRAWER OVERLAY BACKDROP */}
      <AnimatePresence>
        {isMobileOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsMobileOpen(false)}
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-40 md:hidden"
          />
        )}
      </AnimatePresence>

      {/* 🧱 LEFT SIDEBAR PANEL (Responsive & Smooth Collapsible) */}
      <aside 
        className={`bg-white border-r border-slate-200/80 h-full flex flex-col justify-between select-none shrink-0 fixed md:relative top-0 bottom-0 left-0 z-45 transition-all duration-300 ease-in-out
          ${isCollapsed ? 'md:w-[76px] px-3' : 'md:w-64 px-5'} 
          ${isMobileOpen ? 'translate-x-0 w-64 px-5 shadow-2xl' : '-translate-x-full md:translate-x-0 w-64'}
        `}
      >
        <div className="flex flex-col pt-5 flex-1 overflow-y-auto no-scrollbar transition-all duration-300">
          
          {/* Logo brand label container */}
          <div className="flex items-center justify-between mb-4 mt-1">
            <div className="flex items-center gap-2 overflow-hidden">
              <Logo iconSize={32} textSize="text-lg font-black" iconOnly={isCollapsed} />
            </div>
            
            {/* Collapse desktop button or mobile close indicator */}
            <button 
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="hidden md:block text-slate-450 hover:text-slate-700 p-1.5 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer"
              title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              <svg className={`w-4 h-4 transform transition-transform duration-250 ${isCollapsed ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
              </svg>
            </button>

            {/* Mobile close button inside sidebar */}
            <button 
              onClick={() => setIsMobileOpen(false)}
              className="block md:hidden text-slate-400 hover:text-slate-650 p-1.5 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer"
              title="Close sidebar"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Pill search sidebar intake */}
          <div className="relative mb-5 min-h-[40px] flex items-center transition-all duration-350">
            {isCollapsed ? (
              <button 
                onClick={() => setIsCollapsed(false)}
                className="w-10 h-10 mx-auto flex items-center justify-center bg-[#f4f6fa] text-slate-500 hover:text-[#5956E9] rounded-xl hover:bg-[#5956E9]/5 transition-all cursor-pointer group/search relative"
                title="Search"
              >
                <Search className="w-4.5 h-4.5" />
                <div className="absolute left-14 pl-2.5 z-50 pointer-events-none opacity-0 group-hover/search:opacity-100 transition-opacity duration-200">
                  <div className="bg-slate-950/95 text-white text-[10px] font-extrabold px-3 py-1.5 rounded-lg shadow-xl whitespace-nowrap">
                    Search
                  </div>
                </div>
              </button>
            ) : (
              <div className="relative w-full">
                <Search className="absolute left-3.5 top-2.5 w-4 h-4 text-slate-400" />
                <input 
                  type="text" 
                  placeholder="Search" 
                  value={sidebarSearch}
                  onChange={(e) => setSidebarSearch(e.target.value)}
                  className="w-full bg-[#f4f6fa] border-none rounded-full py-2.5 pl-10 pr-4 text-xs font-medium text-slate-705 placeholder-slate-450 focus:outline-none focus:ring-1 focus:ring-[#5956E9] transition-all"
                />
              </div>
            )}
          </div>

          {/* MAIN NAV STACK Group */}
          <div className="mb-6">
            {isCollapsed ? (
              <div className="h-px bg-slate-100/90 my-3.5 mx-1" />
            ) : (
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-3 mb-2">Main</p>
            )}
            <nav className="space-y-0.5">
              {filteredMainNav.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.name;
                return (
                  <button
                    key={item.name}
                    onClick={() => {
                      setActiveTab(item.name);
                      // Auto-close overlay drawer on mobile selection for perfect responsiveness
                      if (window.innerWidth < 768) {
                        setIsMobileOpen(false);
                      }
                    }}
                    className={`w-full flex items-center justify-between px-3.5 py-2 rounded-xl text-xs font-bold transition-all duration-200 group/btn relative cursor-pointer ${
                      isActive 
                        ? "bg-[#5956E9]/10 text-[#5956E9]" 
                        : "text-slate-500 hover:bg-slate-50 hover:text-slate-950"
                    } ${isCollapsed ? "justify-center" : ""}`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className={`w-[17px] h-[17px] shrink-0 transition-colors duration-200 ${
                        isActive ? "text-[#5956E9]" : "text-slate-400 group-hover/btn:text-slate-950"
                      }`} />
                      {!isCollapsed && <span className="transition-opacity duration-200 truncate">{item.name}</span>}
                    </div>
                    {!isCollapsed && item.badge && (
                      <span className="bg-[#5956E9]/20 text-[#5956E9] text-[9.5px] font-black px-1.5 py-0.5 rounded-full">
                        {item.badge}
                      </span>
                    )}
                    {isCollapsed && item.badge && (
                      <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-[#5956E9] rounded-full" />
                    )}

                    {/* Highly Polished Floating Tooltip when Minimized */}
                    {isCollapsed && (
                      <div className="absolute left-14 pl-2.5 z-50 pointer-events-none opacity-0 group-hover/btn:opacity-100 transition-opacity duration-200">
                        <div className="bg-slate-950/95 text-white text-[10.5px] font-extrabold px-3 py-1.5 rounded-lg shadow-xl whitespace-nowrap leading-none flex items-center gap-1.5">
                          <span>{item.name}</span>
                          {item.badge && (
                            <span className="bg-white/20 text-white text-[9px] font-black px-1.5 py-0.5 rounded-full">
                              {item.badge}
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* UTILITY NAV STACK Group */}
          <div>
            {isCollapsed ? (
              <div className="h-px bg-slate-100/90 my-3.5 mx-1" />
            ) : (
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-3 mb-2">Utility</p>
            )}
            <nav className="space-y-0.5">
              {filteredUtilNav.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.name;
                return (
                  <button
                    key={item.name}
                    onClick={() => {
                      setActiveTab(item.name);
                      if (window.innerWidth < 768) {
                        setIsMobileOpen(false);
                      }
                    }}
                    className={`w-full flex items-center justify-between px-3.5 py-2 rounded-xl text-xs font-bold transition-all duration-200 group/btn relative cursor-pointer ${
                      isActive 
                        ? "bg-[#5956E9]/10 text-[#5956E9]" 
                        : "text-slate-500 hover:bg-slate-50 hover:text-slate-950"
                    } ${isCollapsed ? "justify-center" : ""}`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className={`w-[17px] h-[17px] shrink-0 transition-colors duration-200 ${
                        isActive ? "text-[#5956E9]" : "text-slate-400 group-hover/btn:text-slate-950"
                      }`} />
                      {!isCollapsed && <span className="transition-opacity duration-200 truncate">{item.name}</span>}
                    </div>

                    {/* Highly Polished Floating Tooltip when Minimized */}
                    {isCollapsed && (
                      <div className="absolute left-14 pl-2.5 z-50 pointer-events-none opacity-0 group-hover/btn:opacity-100 transition-opacity duration-200">
                        <div className="bg-slate-950/95 text-white text-[10.5px] font-extrabold px-3 py-1.5 rounded-lg shadow-xl whitespace-nowrap leading-none">
                          {item.name}
                        </div>
                      </div>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* PROFILE SECTION Bottom Profile Block */}
        <div className="p-3 border-t border-slate-100 flex items-center gap-3 bg-white relative">
          <button 
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="flex items-center justify-between w-full hover:bg-slate-50 p-1.5 rounded-xl transition-colors cursor-pointer group/profile relative"
          >
            <div className={`flex items-center gap-2.5 ${isCollapsed ? 'mx-auto' : ''}`}>
              <img 
                src={currentUser.avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&q=80"} 
                alt={`${currentUser.firstName} ${currentUser.lastName}`} 
                className="w-8 h-8 rounded-full object-cover border border-slate-100 shrink-0"
              />
              {!isCollapsed && (
                <div className="text-left">
                  <p className="text-xs font-extrabold text-slate-900 leading-none truncate max-w-[120px]">{currentUser.firstName} {currentUser.lastName}</p>
                  <p className="text-[10px] text-slate-400 leading-none mt-1 truncate max-w-[120px]">{currentUser.userRole || "Briefora Admin"}</p>
                </div>
              )}
            </div>
            {!isCollapsed && <MoreHorizontal className="w-4 h-4 text-slate-400" />}

            {/* Profile Tooltip when Minimized */}
            {isCollapsed && (
              <div className="absolute left-14 pl-2.5 z-50 pointer-events-none opacity-0 group-hover/profile:opacity-100 transition-opacity duration-200">
                <div className="bg-slate-950/95 text-white text-[10px] font-extrabold px-3 py-2 rounded-lg shadow-xl whitespace-nowrap text-left leading-tight">
                  <p className="font-extrabold text-white">{currentUser.firstName} {currentUser.lastName}</p>
                  <p className="text-[9px] text-slate-400 mt-0.5">{currentUser.userRole || "Briefora Admin"}</p>
                </div>
              </div>
            )}
          </button>

          {/* Quick Profile context menu floating */}
          <AnimatePresence>
            {isProfileOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setIsProfileOpen(false)} />
                <motion.div 
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className="absolute bottom-16 left-2 right-2 bg-white border border-slate-100 shadow-xl rounded-2xl p-2 z-50 text-xs"
                >
                  <div className="px-3 py-2 border-b border-slate-100 mb-1">
                    <p className="font-bold text-slate-950">Logged in as</p>
                    <p className="text-[10px] text-slate-500 truncate">{currentUser.email}</p>
                  </div>
                  <button 
                    onClick={onLogout}
                    className="w-full flex items-center gap-2 px-3 py-2 text-rose-600 hover:bg-rose-50 rounded-xl font-bold text-left transition-colors cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Log Out</span>
                  </button>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      </aside>

      {/* 🧱 MAIN VIEWPORT CONTAINER */}
      <main className="flex-1 h-full flex flex-col overflow-hidden relative z-10 w-full">
        
        {/* 🧱 TOP GLOBAL NAVIGATION HEADER */}
        <header className="h-14 bg-white border-b border-slate-200/80 px-4 sm:px-8 flex items-center justify-between select-none">
          {/* Breadcrumb & Mobile hamburger toggle */}
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setIsMobileOpen(true)}
              className="md:hidden text-slate-500 hover:text-slate-850 p-1.5 hover:bg-slate-50 rounded-xl transition-all cursor-pointer"
              title="Open Navigation"
            >
              <Menu className="w-4.5 h-4.5" />
            </button>
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500">
              <Home className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-slate-300">/</span>
              <span className="text-slate-800 font-bold capitalize">{activeTab}</span>
            </div>
          </div>

          {/* Quick top menu options */}
          <div className="flex items-center gap-4">
            <button className="text-slate-400 hover:text-slate-600 p-1.5 hover:bg-slate-50 rounded-xl transition-colors cursor-pointer relative">
              <Bell className="w-4 h-4" />
              <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-[#5956E9] rounded-full" />
            </button>
            <button className="text-slate-400 hover:text-slate-600 p-1.5 hover:bg-slate-50 rounded-xl transition-colors cursor-pointer">
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* 🧱 INTERNAL CANVAS BODY (Scrollable contents) */}
        <section className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6">
          
          {/* Layout greeting & welcome bar */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">Welcome back, {currentUser.firstName}</h1>
              <p className="text-xs font-medium text-slate-400 mt-0.5">Everything you need to monitor, automate, and streamline your briefs.</p>
            </div>

            {/* Date period dropdown tags */}
            <div className="flex items-center gap-2">
              {/* Date options drop capsules */}
              <div className="relative">
                <button
                  onClick={() => setIsProfileOpen(false)} // simple reset
                  className="bg-white px-3.5 py-2 rounded-xl text-[11px] font-bold text-slate-600 border border-slate-200 hover:border-slate-350 flex items-center gap-1.5 transition-all outline-none cursor-pointer"
                >
                  <span>{activeDateRange}</span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>
              </div>

              <div className="bg-white px-3.5 py-2 rounded-xl text-[11px] font-bold text-slate-600 border border-slate-200 flex items-center gap-2 transition-all">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span>7 Jun, 2025</span>
                <span className="text-slate-300">—</span>
                <span>13 Jun, 2025</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </div>
            </div>
          </div>

          {/* 🧱 THREE-COLUMN METRIC CARD GRID LAYER (Perfect breakdown match) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            
            {/* Outreach Sent Stat Card */}
            <div className="bg-white border border-slate-200/90 rounded-[20px] p-5 flex flex-col justify-between relative shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-extrabold text-slate-950 uppercase tracking-widest text-[10px]">Outreach sent</span>
                <button className="text-slate-450 hover:text-slate-600 p-1 rounded-md cursor-pointer">
                  <MoreHorizontal className="w-4 h-4 text-slate-300" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4 divide-x divide-slate-100">
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-[#94A3B8] uppercase">Drafted</p>
                  <div className="flex items-center gap-2 pt-1">
                    <FileText className="w-4 h-4 text-slate-400" />
                    <span className="text-xl font-black text-slate-900">42</span>
                    <span className="text-[9px] font-extrabold text-emerald-600 bg-emerald-50 border border-emerald-100 px-1 py-0.5 rounded-md flex items-center gap-0.5">
                      <ArrowUp className="w-2 h-2" /> 14%
                    </span>
                  </div>
                </div>

                <div className="space-y-1 pl-4">
                  <p className="text-[10px] font-bold text-[#94A3B8] uppercase">Sent</p>
                  <div className="flex items-center gap-2 pt-1">
                    <Mail className="w-4 h-4 text-slate-400" />
                    <span className="text-xl font-black text-slate-900">68</span>
                    <span className="text-[9px] font-extrabold text-emerald-600 bg-emerald-50 border border-emerald-100 px-1 py-0.5 rounded-md flex items-center gap-0.5">
                      <ArrowUp className="w-2 h-2" /> 17%
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-4 border-t border-slate-50 pt-2.5">
                <span className="text-[10px] text-slate-400 font-medium">vs last week</span>
              </div>
            </div>

            {/* Lead Activity Stat Card */}
            <div className="bg-white border border-slate-200/90 rounded-[20px] p-5 flex flex-col justify-between relative shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-extrabold text-slate-950 uppercase tracking-widest text-[10px]">Lead activity</span>
                <button className="text-slate-450 hover:text-slate-600 p-1 rounded-md cursor-pointer">
                  <MoreHorizontal className="w-4 h-4 text-slate-300" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4 divide-x divide-slate-100">
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-[#94A3B8] uppercase">Opened</p>
                  <div className="flex items-center gap-2 pt-1">
                    <MailOpen className="w-4 h-4 text-slate-400" />
                    <span className="text-xl font-black text-slate-900">13</span>
                    <span className="text-[9px] font-extrabold text-emerald-600 bg-emerald-50 border border-emerald-100 px-1 py-0.5 rounded-md flex items-center gap-0.5">
                      <ArrowUp className="w-2 h-2" /> 5%
                    </span>
                  </div>
                </div>

                <div className="space-y-1 pl-4">
                  <p className="text-[10px] font-bold text-[#94A3B8] uppercase">Replied</p>
                  <div className="flex items-center gap-2 pt-1">
                    <CornerUpLeft className="w-4 h-4 text-slate-400" />
                    <span className="text-xl font-black text-slate-900">12</span>
                    <span className="text-[9px] font-extrabold text-emerald-600 bg-emerald-50 border border-emerald-100 px-1 py-0.5 rounded-md flex items-center gap-0.5">
                      <ArrowUp className="w-2 h-2" /> 2%
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-4 border-t border-slate-50 pt-2.5">
                <span className="text-[10px] text-slate-400 font-medium">vs last week</span>
              </div>
            </div>

            {/* Conversions Stat Card */}
            <div className="bg-white border border-slate-200/90 rounded-[20px] p-5 flex flex-col justify-between relative shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-extrabold text-slate-950 uppercase tracking-widest text-[10px]">Conversions</span>
                <button className="text-slate-450 hover:text-slate-600 p-1 rounded-md cursor-pointer">
                  <MoreHorizontal className="w-4 h-4 text-slate-300" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4 divide-x divide-slate-100">
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-[#94A3B8] uppercase">Booked</p>
                  <div className="flex items-center gap-2 pt-1">
                    <CalendarCheck className="w-4 h-4 text-slate-400" />
                    <span className="text-xl font-black text-slate-900">7</span>
                    <span className="text-[9px] font-extrabold text-emerald-600 bg-emerald-50 border border-emerald-100 px-1 py-0.5 rounded-md flex items-center gap-0.5">
                      <ArrowUp className="w-2 h-2" /> 1%
                    </span>
                  </div>
                </div>

                <div className="space-y-1 pl-4">
                  <p className="text-[10px] font-bold text-[#94A3B8] uppercase">Ignored</p>
                  <div className="flex items-center gap-2 pt-1">
                    <EyeOff className="w-4 h-4 text-slate-400" />
                    <span className="text-xl font-black text-slate-900">16</span>
                    <span className="text-[9px] font-extrabold text-rose-600 bg-rose-50 border border-rose-100 px-1 py-0.5 rounded-md flex items-center gap-0.5">
                      <ArrowDown className="w-2 h-2" /> 5%
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-4 border-t border-slate-50 pt-2.5">
                <span className="text-[10px] text-slate-400 font-medium">vs last week</span>
              </div>
            </div>

          </div>

          {/* 🧱 DATA TABLE CONTROL BAR & HISTORICAL DATA LOG */}
          <div className="bg-white rounded-2xl border border-slate-200/95 overflow-hidden shadow-xs">
            
            {/* Control Strip Headers */}
            <div className="p-5 border-b border-slate-150 space-y-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <h3 className="font-extrabold text-slate-900 text-sm">Recent messages</h3>
                
                {/* Control search + status + organization + tags filters dropdowns */}
                <div className="flex flex-wrap items-center gap-2">
                  
                  {/* Local messages search bar */}
                  <div className="relative">
                    <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-400" />
                    <input 
                      type="text" 
                      placeholder="Search messages" 
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-48 sm:w-56 bg-slate-50 border border-slate-200 rounded-xl py-2 pl-9 pr-4 text-xs font-semibold placeholder-slate-400 focus:outline-none focus:border-[#5956E9] focus:ring-1 focus:ring-[#5956E9] focus:bg-white transition-all"
                    />
                    {searchTerm && (
                      <button 
                        onClick={() => setSearchTerm('')}
                        className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600 p-0.5 bg-slate-200/40 hover:bg-slate-250/70 rounded-full"
                      >
                        <X className="w-2.5 h-2.5" />
                      </button>
                    )}
                  </div>

                  {/* Date range selection */}
                  <div className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-600 flex items-center gap-1.5 cursor-pointer hover:border-slate-300">
                    <span>{activeDateRange}</span>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                  </div>

                  {/* Detailed date duration visual capsule */}
                  <div className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-600 hidden lg:flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span>7 Jun, 2025 - 13 Jun, 2025</span>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                  </div>

                  {/* Status Dropdown */}
                  <div className="relative">
                    <button 
                      onClick={() => {
                        setShowStatusDropdown(!showStatusDropdown);
                        setShowOrgDropdown(false);
                        setShowTagDropdown(false);
                      }}
                      className={`px-3 py-2 border rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
                        statusFilter !== 'All' 
                          ? 'border-[#5956E9] text-[#5956E9] bg-[#5956E9]/5' 
                          : 'border-slate-200 text-slate-600 hover:border-slate-300'
                      }`}
                    >
                      <SlidersHorizontal className="w-3.5 h-3.5" />
                      <span>Status: {statusFilter}</span>
                      <ChevronDown className="w-3 h-3" />
                    </button>
                    {showStatusDropdown && (
                      <>
                        <div className="fixed inset-0 z-10" onClick={() => setShowStatusDropdown(false)} />
                        <div className="absolute right-0 mt-1.5 w-36 bg-white border border-slate-100 shadow-xl rounded-xl py-1 z-20 text-xs">
                          {statusOptions.map(opt => (
                            <button
                              key={opt}
                              onClick={() => {
                                setStatusFilter(opt);
                                setShowStatusDropdown(false);
                                setCurrentPage(1);
                              }}
                              className="w-full text-left px-3.5 py-2 hover:bg-slate-50 font-bold text-slate-700 flex items-center justify-between"
                            >
                              <span>{opt}</span>
                              {statusFilter === opt && <Check className="w-3 h-3 text-[#5956E9]" />}
                            </button>
                          ))}
                        </div>
                      </>
                    )}
                  </div>

                  {/* Organization Dropdown */}
                  <div className="relative">
                    <button 
                      onClick={() => {
                        setShowOrgDropdown(!showOrgDropdown);
                        setShowStatusDropdown(false);
                        setShowTagDropdown(false);
                      }}
                      className={`px-3 py-2 border rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
                        orgFilter !== 'All' 
                          ? 'border-[#5956E9] text-[#5956E9] bg-[#5956E9]/5' 
                          : 'border-slate-200 text-slate-600 hover:border-slate-300'
                      }`}
                    >
                      <Building2 className="w-3.5 h-3.5" />
                      <span>Org: {orgFilter}</span>
                      <ChevronDown className="w-3 h-3" />
                    </button>
                    {showOrgDropdown && (
                      <>
                        <div className="fixed inset-0 z-10" onClick={() => setShowOrgDropdown(false)} />
                        <div className="absolute right-0 mt-1.5 w-44 max-h-56 overflow-y-auto bg-white border border-slate-100 shadow-xl rounded-xl py-1 z-20 text-xs">
                          {orgOptions.map(opt => (
                            <button
                              key={opt}
                              onClick={() => {
                                setOrgFilter(opt);
                                setShowOrgDropdown(false);
                                setCurrentPage(1);
                              }}
                              className="w-full text-left px-3.5 py-2 hover:bg-slate-50 font-bold text-slate-700 flex items-center justify-between"
                            >
                              <span>{opt}</span>
                              {orgFilter === opt && <Check className="w-3 h-3 text-[#5956E9]" />}
                            </button>
                          ))}
                        </div>
                      </>
                    )}
                  </div>

                  {/* Tags Dropdown */}
                  <div className="relative">
                    <button 
                      onClick={() => {
                        setShowTagDropdown(!showTagDropdown);
                        setShowStatusDropdown(false);
                        setShowOrgDropdown(false);
                      }}
                      className={`px-3 py-2 border rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
                        tagFilter !== 'All' 
                          ? 'border-[#5956E9] text-[#5956E9] bg-[#5956E9]/5' 
                          : 'border-slate-200 text-slate-600 hover:border-slate-300'
                      }`}
                    >
                      <Tag className="w-3.5 h-3.5" />
                      <span>Tags: {tagFilter}</span>
                      <ChevronDown className="w-3 h-3" />
                    </button>
                    {showTagDropdown && (
                      <>
                        <div className="fixed inset-0 z-10" onClick={() => setShowTagDropdown(false)} />
                        <div className="absolute right-0 mt-1.5 w-44 bg-white border border-slate-100 shadow-xl rounded-xl py-1 z-20 text-xs text-slate-700">
                          {tagOptions.map(opt => (
                            <button
                              key={opt}
                              onClick={() => {
                                setTagFilter(opt);
                                setShowTagDropdown(false);
                                setCurrentPage(1);
                              }}
                              className="w-full text-left px-3.5 py-2 hover:bg-slate-50 font-bold text-slate-700 flex items-center justify-between"
                            >
                              <span>{opt}</span>
                              {tagFilter === opt && <Check className="w-3 h-3 text-[#5956E9]" />}
                            </button>
                          ))}
                        </div>
                      </>
                    )}
                  </div>

                </div>
              </div>
            </div>

            {/* The Core Data Grid/Table */}
            <div className="overflow-x-auto w-full">
              <table className="w-full text-left border-collapse min-w-[1000px]">
                <thead>
                  <tr className="border-b border-slate-150 text-[10px] font-extrabold text-[#94A3B8] uppercase tracking-wider select-none bg-slate-50/70">
                    <td className="w-12 py-3.5 px-4 text-center">
                      <input 
                        type="checkbox" 
                        onChange={(e) => handleSelectAll(e.target.checked)}
                        checked={paginatedMessages.length > 0 && paginatedMessages.every(m => selectedIds.includes(m.id))}
                        className="accent-[#5956E9] h-3.5 w-3.5 rounded border-slate-300 cursor-pointer"
                      />
                    </td>
                    <td className="py-3.5 px-4 font-extrabold text-[#94A3B8] w-48">
                      <div className="flex items-center gap-1">
                        <span>Lead name</span>
                        <span className="text-slate-300">↑↓</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-extrabold text-[#94A3B8] w-48">
                      Email Address
                    </td>
                    <td className="py-3.5 px-4 font-extrabold text-[#94A3B8]">
                      <div className="flex items-center gap-1">
                        <span>Message</span>
                        <span className="text-slate-300">↑↓</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-extrabold text-[#94A3B8] w-28">
                      <div className="flex items-center gap-1">
                        <span>Date</span>
                        <span className="text-slate-300">↑↓</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-extrabold text-[#94A3B8] w-32">
                      <div className="flex items-center gap-1">
                        <span>Status</span>
                        <span className="text-slate-300">↑↓</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-extrabold text-[#94A3B8] w-32">
                      <div className="flex items-center gap-1">
                        <span>Organization</span>
                        <span className="text-slate-300">↑↓</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-extrabold text-[#94A3B8] w-36">
                      <div className="flex items-center gap-1">
                        <span>Tags</span>
                        <span className="text-slate-300">↑↓</span>
                      </div>
                    </td>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {paginatedMessages.length > 0 ? (
                    paginatedMessages.map((msg) => {
                      const isSelected = selectedIds.includes(msg.id);
                      const statusStyle = getStatusStyle(msg.status);
                      
                      return (
                        <tr 
                          key={msg.id} 
                          className={`hover:bg-[#F8F9FC]/40 text-xs font-semibold leading-relaxed transition-colors ${
                            isSelected ? 'bg-[#5956E9]/5 hover:bg-[#5956E9]/10' : ''
                          }`}
                        >
                          <td className="py-2.5 px-4 text-center">
                            <input 
                              type="checkbox" 
                              checked={isSelected}
                              onChange={(e) => handleSelectRow(msg.id, e.target.checked)}
                              className="accent-[#5956E9] h-3.5 w-3.5 rounded border-slate-350 cursor-pointer"
                            />
                          </td>
                          <td className="py-2.5 px-4">
                            <div className="flex items-center gap-2">
                              <img 
                                src={msg.avatar} 
                                alt={msg.name} 
                                className="w-6.5 h-6.5 rounded-full object-cover border border-slate-100" 
                              />
                              <span className="text-slate-900 font-extrabold">{msg.name}</span>
                            </div>
                          </td>
                          <td className="py-2.5 px-4 text-slate-400">
                            {msg.email}
                          </td>
                          <td className="py-2.5 px-4 text-slate-600 truncate max-w-xs font-semibold">
                            {msg.message}
                          </td>
                          <td className="py-2.5 px-4 text-slate-400">
                            {msg.date}
                          </td>
                          <td className="py-2.5 px-4">
                            <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold border ${statusStyle.bg} ${statusStyle.text} ${statusStyle.border}`}>
                              {msg.status === 'Booked' && <CalendarCheck className={`w-3 h-3 ${statusStyle.iconColor}`} />}
                              {msg.status === 'Replied' && <CornerUpLeft className={`w-3 h-3 ${statusStyle.iconColor}`} />}
                              {msg.status === 'Opened' && <MailOpen className={`w-3 h-3 ${statusStyle.iconColor}`} />}
                              {msg.status === 'Ignored' && <EyeOff className={`w-3 h-3 ${statusStyle.iconColor}`} />}
                              <span>{msg.status}</span>
                            </div>
                          </td>
                          <td className="py-2.5 px-4 text-slate-500 font-bold flex items-center gap-1.5 pt-4">
                            <Building2 className="w-3.5 h-3.5 text-slate-400" />
                            <span>{msg.organization}</span>
                          </td>
                          <td className="py-2.5 px-4">
                            <span className={`inline-block px-2.5 py-1 text-[10px] font-extrabold rounded-md border ${getTagStyle(msg.tags)}`}>
                              {msg.tags}
                            </span>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={8} className="py-12 text-center text-slate-400">
                        <div className="flex flex-col items-center justify-center space-y-2">
                          <SlidersHorizontal className="w-8 h-8 text-slate-300" />
                          <p className="font-bold">No messages match selected filters</p>
                          <button 
                            onClick={() => {
                              setSearchTerm('');
                              setStatusFilter('All');
                              setOrgFilter('All');
                              setTagFilter('All');
                            }}
                            className="text-xs text-[#2516FF] font-bold hover:underline cursor-pointer"
                          >
                            Reset all filters
                          </button>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Footer Row */}
            <div className="p-4 border-t border-slate-150 flex items-center justify-between select-none">
              
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1.5 bg-white border border-slate-200 hover:border-slate-300 text-[11px] font-extrabold rounded-xl text-slate-650 transition-all flex items-center gap-1 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  <span>Previous</span>
                </button>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages || totalPages === 0}
                  className="px-3 py-1.5 bg-white border border-slate-200 hover:border-slate-300 text-[11px] font-extrabold rounded-xl text-slate-650 transition-all flex items-center gap-1 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                >
                  <span>Next</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Responsive paginated marker numbers enum */}
              <div className="flex items-center gap-1">
                {totalPages > 0 && Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`min-w-7 h-7 flex items-center justify-center rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      currentPage === page 
                        ? 'bg-[#2516FF] text-white shadow-xs' 
                        : 'text-slate-500 hover:bg-slate-50'
                    }`}
                  >
                    {page}
                  </button>
                ))}
              </div>

            </div>

          </div>

        </section>
      </main>
    </div>
  );
}
