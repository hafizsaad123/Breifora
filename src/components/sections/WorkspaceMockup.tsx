import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plus, 
  Palette, 
  Sparkles, 
  Users, 
  FileCheck, 
  ShieldAlert, 
  Search, 
  Sun, 
  Moon, 
  Bell, 
  ArrowRight, 
  Settings, 
  Layout, 
  FolderGit, 
  FileText, 
  Layers, 
  ExternalLink,
  ChevronRight,
  ClipboardCheck,
  Zap,
  Target
} from 'lucide-react';

const presets = [
  {
    label: "Luxury Beauty Brand",
    input: "Client wants a high-end natural cosmetics brand. They like rich warm beige, gold accents, and want it to feel exceptionally exclusive, clean, and spacious.",
    output: {
      theme: "Quiet Luxury / Desert Sand",
      colors: [
        { name: "Sandalwood", hex: "#EADCC9" },
        { name: "Alabaster", hex: "#FAF8F5" },
        { name: "Champagne Gold", hex: "#D4AF37" },
        { name: "Charcoal Slate", hex: "#2C3E50" }
      ],
      typography: "Playfair Display paired with Inter (high letter-spacing)",
      demographics: "Eco-conscious prestige shoppers, ages 24-45, status seeking.",
      deliverables: ["Premium eCommerce Experience", "Custom Embossed Shipping Box Layout", "1x Art-directed Product Hero Animation"]
    }
  },
  {
    label: "Minimalist Tech SaaS",
    input: "SaaS app helping developers monitor carbon emissions. Wants it to look incredibly sharp, neon toxic colors combined with dark slate, ultra-modern tech feel.",
    output: {
      theme: "Cyber Punk Cyber-Green / Monochrome Dark",
      colors: [
        { name: "Toxic Lime", hex: "#39FF14" },
        { name: "Deep Charcoal", hex: "#0E1111" },
        { name: "Cyber Silver", hex: "#F3F4F6" },
        { name: "Grid Indigo", hex: "#1F2937" }
      ],
      typography: "JetBrains Mono paired with Space Grotesk",
      demographics: "DevOps leads, tech founders, sustainability-focused corporations.",
      deliverables: ["Interactive Metric Dashboard Wireframes", "Custom SVG Interactive Component Assets", "Figma Design Token Style Guide"]
    }
  },
  {
    label: "Boutique Coffee Roasters",
    input: "Local high-end artisanal roaster. Wants a heritage, rustic, vintage typography focus. Navy blue and raw cardboard color vibes. Highly welcoming but prestigious.",
    output: {
      theme: "Artisan Heritage / Raw Organic",
      colors: [
        { name: "Deep Navy Seal", hex: "#1E2A38" },
        { name: "Raw Kraft Paper", hex: "#C3B091" },
        { name: "Coarse Espresso", hex: "#3E2723" },
        { name: "Creamy Foam", hex: "#FDFBF7" }
      ],
      typography: "Cormorant Garamond paired with Roboto Mono",
      demographics: "Third-wave coffee hobbyists, design enthusiasts, neighborhood elite.",
      deliverables: ["Minimalistic Pack Bag Mockups", "Dynamic Coffee Origin Interactive Map Layout", "Brand Manifesto Typographic Billboard"]
    }
  }
];

export default function WorkspaceMockup() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'ai-parser' | 'client-link'>('ai-parser');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [clientInput, setClientInput] = useState(presets[0].input);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [activeOutput, setActiveOutput] = useState(presets[0].output);

  const handlePresetSelect = (preset: typeof presets[0]) => {
    setClientInput(preset.input);
    setIsAnalyzing(true);
    setTimeout(() => {
      setActiveOutput(preset.output);
      setIsAnalyzing(false);
    }, 850);
  };

  const handleCustomAnalyze = () => {
    setIsAnalyzing(true);
    setTimeout(() => {
      // Build a smart semi-random output based on typed keywords
      const text = clientInput.toLowerCase();
      let theme = "Modern Minimalist";
      let colors = [
        { name: "Custom Sage", hex: "#7D8C83" },
        { name: "Pure Sand", hex: "#EFECE6" },
        { name: "Midnight Onyx", hex: "#111111" },
        { name: "Soft Coral", hex: "#FF7F50" }
      ];
      let typography = "Satoshi paired with Cabinet Grotesk";
      let deliverables = ["Interactive Portfolio App Interface", "Brand Guideline Sheet", "Tailored Component Library Docs"];

      if (text.includes("blue") || text.includes("ocean") || text.includes("tech")) {
        theme = "Pacific Tech Blue / Deep Sea";
        colors = [
          { name: "Electric Ocean", hex: "#0052FF" },
          { name: "Seafoam Ice", hex: "#ECF4FF" },
          { name: "Asphalt Ink", hex: "#111827" },
          { name: "Hyper Blue", hex: "#3B82F6" }
        ];
        typography = "Plus Jakarta Sans paired with Fira Code";
      } else if (text.includes("green") || text.includes("eco") || text.includes("nature")) {
        theme = "Sylvan Botanical Garden / Forest Core";
        colors = [
          { name: "Deep Spruce", hex: "#1B3B2B" },
          { name: "Pale Mint", hex: "#E8F5E9" },
          { name: "Warm Clay", hex: "#D7B19D" },
          { name: "Pebble Charcoal", hex: "#374151" }
        ];
        typography = "Cinzel Decorative paired with Inter";
      }

      setActiveOutput({
        theme,
        colors,
        typography,
        demographics: "Targeted creative consumers looking for elevated experiences.",
        deliverables
      });
      setIsAnalyzing(false);
    }, 900);
  };

  return (
    <div className={`w-full rounded-2xl border transition-colors duration-300 overflow-hidden shadow-2xl ${
      isDarkMode ? 'bg-[#0F172A] border-slate-800 text-slate-100' : 'bg-white border-slate-100 text-slate-800'
    }`}>
      {/* Workspace Header */}
      <div className={`flex items-center justify-between px-4 sm:px-6 py-4 border-b ${
        isDarkMode ? 'bg-[#1E293B] border-slate-800' : 'bg-slate-50 border-slate-100'
      }`}>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-red-400"></span>
            <span className="w-3 h-3 rounded-full bg-yellow-400"></span>
            <span className="w-3 h-3 rounded-full bg-green-400"></span>
          </div>
          <span className="h-4 w-px bg-slate-200 hidden sm:block"></span>
          <div className="hidden sm:flex bg-slate-100 rounded-lg p-0.5 text-xs font-semibold text-slate-600 border border-slate-200">
            <button 
              onClick={() => setActiveTab('ai-parser')}
              className={`px-3 py-1.5 rounded-md cursor-pointer transition-colors ${activeTab === 'ai-parser' ? 'bg-white text-slate-900 shadow-xs' : 'hover:text-slate-900'}`}
            >
              AI Brand Mapper
            </button>
            <button 
              onClick={() => setActiveTab('dashboard')}
              className={`px-3 py-1.5 rounded-md cursor-pointer transition-colors ${activeTab === 'dashboard' ? 'bg-white text-slate-900 shadow-xs' : 'hover:text-slate-900'}`}
            >
              Creative Studio Dashboard
            </button>
            <button 
              onClick={() => setActiveTab('client-link')}
              className={`px-3 py-1.5 rounded-md cursor-pointer transition-colors ${activeTab === 'client-link' ? 'bg-white text-slate-900 shadow-xs' : 'hover:text-slate-900'}`}
            >
              What Clients See
            </button>
          </div>
        </div>

        {/* Top Control Bar Icons */}
        <div className="flex items-center gap-3">
          <div className="relative max-w-40 sm:max-w-64 hidden xs:block">
            <Search className="absolute left-2.5 top-2.5 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search design token..." 
              readOnly
              className="pl-8 pr-3 py-1.5 w-full text-xs rounded-lg border border-slate-200 bg-white/70 focus:outline-none focus:ring-1 focus:ring-brand-primary"
            />
          </div>
          
          <button 
            onClick={() => setIsDarkMode(!isDarkMode)} 
            className="p-1.5 rounded-lg hover:bg-slate-200/50 text-slate-500 cursor-pointer"
            title="Toggle theme inside preview"
          >
            {isDarkMode ? <Sun className="w-4.5 h-4.5 text-yellow-400" /> : <Moon className="w-4.5 h-4.5 text-slate-500" />}
          </button>
          <button className="p-1.5 rounded-lg hover:bg-slate-200/50 text-slate-500 relative">
            <Bell className="w-4.5 h-4.5" />
            <span className="w-1.5 h-1.5 rounded-full bg-brand-primary absolute top-2 right-2"></span>
          </button>
          <div className="w-7 h-7 rounded-full bg-brand-primary text-white text-xs font-semibold flex items-center justify-center">
            JS
          </div>
        </div>
      </div>

      {/* Tabs Selector for Small Screen View */}
      <div className="flex sm:hidden overflow-x-auto border-b border-slate-100 p-2 gap-1.5 text-xs font-semibold">
        <button 
          onClick={() => setActiveTab('ai-parser')}
          className={`px-3 py-2 rounded-lg whitespace-nowrap ${activeTab === 'ai-parser' ? 'bg-brand-primary text-white' : 'bg-slate-100 text-slate-600'}`}
        >
          AI Brand Mapper
        </button>
        <button 
          onClick={() => setActiveTab('dashboard')}
          className={`px-3 py-2 rounded-lg whitespace-nowrap ${activeTab === 'dashboard' ? 'bg-brand-primary text-white' : 'bg-slate-100 text-slate-600'}`}
        >
          Creative Dashboard
        </button>
        <button 
          onClick={() => setActiveTab('client-link')}
          className={`px-3 py-2 rounded-lg whitespace-nowrap ${activeTab === 'client-link' ? 'bg-brand-primary text-white' : 'bg-slate-100 text-slate-600'}`}
        >
          Client View
        </button>
      </div>

      {/* Workspace App Body */}
      <div className="flex h-[450.5px] items-stretch overflow-hidden">
        {/* Left Sidebar (Desktop/Laptop layout layout) */}
        <div className={`w-52 hidden lg:flex flex-col border-r p-4 justify-between select-none ${
          isDarkMode ? 'bg-[#111827] border-slate-800' : 'bg-slate-50 border-slate-100'
        }`}>
          <div className="space-y-6">
            <div className="flex items-center gap-2">
              <span className="p-1 rounded bg-[#EAE8FE] text-brand-primary font-semibold text-xs uppercase tracking-widest">
                PRO
              </span>
              <span className="text-xs font-semibold text-slate-400">Breifora Core v2</span>
            </div>

            <div className="space-y-1.5">
              <button 
                onClick={() => setActiveTab('ai-parser')}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                  activeTab === 'ai-parser' 
                    ? 'bg-brand-primary text-white shadow-xs md:shadow-md md:shadow-brand-primary/15' 
                    : isDarkMode ? 'text-slate-400 hover:bg-slate-800 hover:text-white' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-950'
                }`}
              >
                <Sparkles className="w-4 h-4" />
                AI Brand Mapper
              </button>
              
              <button 
                onClick={() => setActiveTab('dashboard')}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                  activeTab === 'dashboard' 
                    ? 'bg-brand-primary text-white shadow-xs md:shadow-md md:shadow-brand-primary/15' 
                    : isDarkMode ? 'text-slate-400 hover:bg-slate-800 hover:text-white' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-950'
                }`}
              >
                <Layout className="w-4 h-4" />
                Workspace
              </button>

              <button 
                onClick={() => setActiveTab('client-link')}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                  activeTab === 'client-link' 
                    ? 'bg-brand-primary text-white shadow-xs md:shadow-md md:shadow-brand-primary/15' 
                    : isDarkMode ? 'text-slate-400 hover:bg-slate-800 hover:text-white' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-950'
                }`}
              >
                <ExternalLink className="w-4 h-4" />
                Client Intake View
              </button>

              <div className="h-px bg-slate-200/50 my-3"></div>

              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest block px-3 mb-1.5">Active Blueprints</span>
              
              <div className="space-y-1">
                {presets.map((preset, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setActiveTab('ai-parser');
                      handlePresetSelect(preset);
                    }}
                    className={`w-full text-left truncate px-3 py-1.5 rounded-md text-[11px] font-normal transition-colors cursor-pointer ${
                      activeOutput.theme.includes(preset.label.split(' ')[0])
                        ? 'text-brand-primary bg-brand-primary/5 font-semibold'
                        : isDarkMode ? 'text-slate-400 hover:text-white hover:bg-slate-800' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    🚀 {preset.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-1">
            <div className={`p-2.5 rounded-xl border flex items-center justify-between text-[11px] ${
              isDarkMode ? 'bg-slate-900 border-slate-800 text-slate-400' : 'bg-slate-100 border-slate-200 text-slate-600'
            }`}>
              <span>Active Projects</span>
              <span className="font-semibold text-slate-900 bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded">6 / 15</span>
            </div>
            <button className="w-full flex items-center gap-2 px-3 py-1.5 text-[11px] font-semibold text-slate-500 hover:text-slate-950">
              <Settings className="w-3.5 h-3.5" />
              Settings
            </button>
          </div>
        </div>

        {/* Center Canvas Workspace Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          <AnimatePresence mode="wait">
            
            {/* TAO 1: AI PARSER (Active Showcase tool) */}
            {activeTab === 'ai-parser' && (
              <motion.div
                key="ai-parser"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="h-full flex flex-col justify-between space-y-4"
              >
                <div>
                  <div className="flex flex-col xs:flex-row xs:items-center justify-between gap-2 border-b border-dashed pb-3.5 border-slate-200">
                    <div>
                      <h3 className="text-sm font-semibold flex items-center gap-1.5">
                        <Sparkles className="w-4 h-4 text-brand-primary" />
                        AI Brand Mapping Module
                      </h3>
                      <p className="text-[11px] text-slate-400">Transform messy paragraphs of client requests into clean brand tokens.</p>
                    </div>
                    <div className="flex gap-1.5 overflow-x-auto py-1">
                      {presets.map((p, idx) => (
                        <button
                          key={idx}
                          onClick={() => handlePresetSelect(p)}
                          className={`px-2 py-1 rounded text-[10px] whitespace-nowrap font-semibold border transition-all cursor-pointer ${
                            clientInput === p.input
                              ? 'bg-brand-primary text-white border-brand-primary'
                              : 'bg-slate-100 text-slate-600 border-transparent hover:bg-slate-200'
                          }`}
                        >
                          {p.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    {/* Left Panel: Raw text */}
                    <div className="space-y-2">
                      <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest block">Client Feedback Raw Input</label>
                      <div className="relative">
                        <textarea
                          value={clientInput}
                          onChange={(e) => setClientInput(e.target.value)}
                          className={`w-full h-32 text-xs rounded-xl border p-3 focus:outline-none focus:ring-2 focus:ring-brand-primary/20 transition-colors ${
                            isDarkMode ? 'bg-slate-900 border-slate-800 text-slate-200' : 'bg-slate-50 border-slate-200 text-slate-800'
                          }`}
                          placeholder="Type or paste chaotic client design notes here..."
                        />
                        <button
                          onClick={handleCustomAnalyze}
                          disabled={isAnalyzing}
                          className="absolute bottom-2 right-2 px-3 py-1.5 bg-brand-primary hover:bg-brand-purple-dark text-white rounded-lg text-[10px] font-semibold flex items-center gap-1 shadow-sm cursor-pointer disabled:opacity-50"
                        >
                          {isAnalyzing ? (
                            <>
                              <svg className="animate-spin h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                              Mapping...
                            </>
                          ) : (
                            <>
                              <Zap className="w-3 h-3 text-yellow-300" />
                              Map Brand
                            </>
                          )}
                        </button>
                      </div>
                      <p className="text-[10px] text-slate-400 italic">💡 Choose presets above to simulate immediate mapping results.</p>
                    </div>

                    {/* Right Panel: Rendered strategy blueprint */}
                    <div className={`p-4 rounded-xl border relative min-h-36 ${
                      isDarkMode ? 'bg-[#1E293B] border-slate-800' : 'bg-[#FAF9FF] border-brand-primary/10'
                    }`}>
                      <span className="absolute top-2.5 right-2 px-2 py-0.5 bg-brand-primary/10 text-brand-primary font-semibold text-[9px] rounded-full uppercase tracking-wider">
                        AUTO-GENERATED BLUEPRINT
                      </span>

                      {isAnalyzing ? (
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/70 backdrop-blur-xs rounded-xl dark:bg-slate-950/70">
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                            className="w-7 h-7 border-2 border-brand-primary border-t-transparent rounded-full"
                          />
                          <p className="text-xs font-semibold text-brand-primary mt-2">Gemini is structuring creative data...</p>
                        </div>
                      ) : null}

                      <div className="space-y-3.5">
                        <div>
                          <span className="text-[10px] font-semibold text-slate-400 block uppercase">Aesthetic Blueprint Direction</span>
                          <span className="text-xs font-semibold text-slate-800 dark:text-slate-100 flex items-center gap-1 mt-0.5">
                            <Palette className="w-3.5 h-3.5 text-brand-primary" />
                            {activeOutput.theme}
                          </span>
                        </div>

                        <div>
                          <span className="text-[10px] font-semibold text-slate-400 block uppercase">Suggested Visual Palette</span>
                          <div className="flex gap-2.5 mt-1.5">
                            {activeOutput.colors.map((color, i) => (
                              <div key={i} className="flex flex-col items-center gap-1 group">
                                <div 
                                  style={{ backgroundColor: color.hex }}
                                  className="w-8 h-8 rounded-lg shadow-xs border border-slate-200/50 group-hover:scale-110 transition-transform"
                                />
                                <span className="text-[9px] font-mono text-slate-500">{color.hex}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div>
                            <span className="text-[10px] font-semibold text-slate-400 block uppercase">Recommended Font Stack</span>
                            <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 block mt-0.5 truncate">{activeOutput.typography}</span>
                          </div>
                          <div>
                            <span className="text-[10px] font-semibold text-slate-400 block uppercase">Target Brand Persona</span>
                            <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 block mt-0.5 truncate">{activeOutput.demographics}</span>
                          </div>
                        </div>

                        <div className="border-t border-slate-200/50 pt-2 text-[11px]">
                          <span className="text-[10px] font-semibold text-slate-400 block uppercase mb-1">Locked Scope Deliverables</span>
                          <div className="space-y-1">
                            {activeOutput.deliverables.map((del, index) => (
                              <div key={index} className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                                <span className="truncate">{del}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className={`p-3 rounded-xl flex items-center justify-between text-xs font-semibold ${
                  isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-slate-50 border-slate-100'
                }`}>
                  <span className="text-slate-500">Ready to present to client?</span>
                  <button 
                    onClick={() => setActiveTab('client-link')}
                    className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-[10px] font-semibold flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    Generate Discovery URL
                    <ArrowRight className="w-3" />
                  </button>
                </div>
              </motion.div>
            )}

            {/* TAB 2: PORTFOLIO MAIN DASHBOARD */}
            {activeTab === 'dashboard' && (
              <motion.div
                key="dashboard"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="space-y-5"
              >
                <div>
                  <h3 className="text-sm font-semibold flex items-center gap-1.5">
                    <Layout className="w-4 h-4 text-brand-primary" />
                    Creative Agency Core Hub
                  </h3>
                  <p className="text-[11px] text-slate-400">Overview of client onboarding metrics and prevented project drift.</p>
                </div>

                {/* Grid 4 Stats Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
                  <div className={`p-3.5 rounded-xl border text-center ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-slate-50 border-slate-100'}`}>
                    <div className="flex justify-center mb-1.5">
                      <div className="w-8 h-8 rounded-lg bg-primary-light text-brand-primary flex items-center justify-center">
                        <FolderGit className="w-4 h-4" />
                      </div>
                    </div>
                    <span className="text-[9px] font-semibold text-slate-400 uppercase tracking-widest block">Total Blueprints</span>
                    <span className="text-2xl font-semibold text-slate-900 dark:text-white block mt-0.5">22</span>
                    <span className="text-[9px] text-emerald-600 font-semibold mt-0.5 block">+5% from last month</span>
                  </div>

                  <div className={`p-3.5 rounded-xl border text-center ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-slate-50 border-slate-100'}`}>
                    <div className="flex justify-center mb-1.5">
                      <div className="w-8 h-8 rounded-lg bg-orange-50 text-orange-700 flex items-center justify-center">
                        <Users className="w-4 h-4" />
                      </div>
                    </div>
                    <span className="text-[9px] font-semibold text-slate-400 uppercase tracking-widest block">Pending Intakes</span>
                    <span className="text-2xl font-semibold text-slate-900 dark:text-white block mt-0.5">8</span>
                    <span className="text-[9px] text-orange-500 font-semibold mt-0.5 block">-25% friction drop-off</span>
                  </div>

                  <div className={`p-3.5 rounded-xl border text-center ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-slate-50 border-slate-100'}`}>
                    <div className="flex justify-center mb-1.5">
                      <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
                        <FileCheck className="w-4 h-4" />
                      </div>
                    </div>
                    <span className="text-[9px] font-semibold text-slate-400 uppercase tracking-widest block">Approved Briefs</span>
                    <span className="text-2xl font-semibold text-slate-900 dark:text-white block mt-0.5">5</span>
                    <span className="text-[9px] text-emerald-600 font-semibold mt-0.5 block">100% sign-off rate</span>
                  </div>

                  <div className={`p-3.5 rounded-xl border text-center ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-slate-50 border-slate-100'}`}>
                    <div className="flex justify-center mb-1.5">
                      <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-700 flex items-center justify-center">
                        <ShieldAlert className="w-4 h-4" />
                      </div>
                    </div>
                    <span className="text-[9px] font-semibold text-slate-400 uppercase tracking-widest block">Scope Creeps Stopped</span>
                    <span className="text-2xl font-semibold text-slate-900 dark:text-white block mt-0.5">2</span>
                    <span className="text-[9px] text-emerald-500 font-semibold mt-0.5 block">Protected $4,850 in margins</span>
                  </div>
                </div>

                {/* Inner Preview Table */}
                <div className={`border rounded-xl p-3 text-xs overflow-x-auto ${isDarkMode ? 'border-slate-800 bg-slate-900/50' : 'border-slate-100 bg-slate-50/50'}`}>
                  <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest block mb-2.5">Active Client Alignment Funnel</span>
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-200 text-slate-400 text-[10px] font-semibold uppercase">
                        <th className="py-2">Client Brand</th>
                        <th className="py-2">Blueprint Type</th>
                        <th className="py-2">Status</th>
                        <th className="py-2">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      <tr>
                        <td className="py-2 font-semibold">Lumina Skincare</td>
                        <td className="py-2">Luxury Beauty Brand</td>
                        <td className="py-2"><span className="px-2 py-0.5 bg-amber-100 text-amber-800 rounded-full text-[10px] font-semibold">Reviewing Brand Map</span></td>
                        <td className="py-2"><button onClick={() => { setActiveTab('ai-parser'); handlePresetSelect(presets[0]); }} className="text-brand-primary font-semibold hover:underline cursor-pointer">Open Workspace</button></td>
                      </tr>
                      <tr>
                        <td className="py-2 font-semibold">EcoPulse SaaS</td>
                        <td className="py-2">Minimalist Tech SaaS</td>
                        <td className="py-2"><span className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded-full text-[10px] font-semibold">Intake Dispatched</span></td>
                        <td className="py-2"><button onClick={() => { setActiveTab('ai-parser'); handlePresetSelect(presets[1]); }} className="text-brand-primary font-semibold hover:underline cursor-pointer">Edit Questions</button></td>
                      </tr>
                      <tr>
                        <td className="py-2 font-semibold">Vapor Coffee Shop</td>
                        <td className="py-2">Artisanal Coffee Roaster</td>
                        <td className="py-2"><span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-full text-[10px] font-semibold">Approved & Signed</span></td>
                        <td className="py-2"><button onClick={() => { setActiveTab('ai-parser'); handlePresetSelect(presets[2]); }} className="text-[#5956E9] font-semibold hover:underline cursor-pointer">Export Brief (PDF)</button></td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </motion.div>
            )}

            {/* TAB 3: CLIENT VIEW DETAILED PREVIEW */}
            {activeTab === 'client-link' && (
              <motion.div
                key="client-link"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="flex flex-col md:flex-row gap-5 h-full items-stretch"
              >
                {/* Visual demonstration frame resembling a cell phone intake screen */}
                <div className={`w-full md:w-64 rounded-2xl border p-4 flex flex-col justify-between ${
                  isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
                } shadow-md`}>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between border-b pb-2">
                      <div className="flex items-center gap-1.5">
                        <div className="w-5 h-5 rounded bg-brand-primary/10 flex items-center justify-center text-brand-primary text-xs font-semibold">B</div>
                        <span className="text-[10px] font-semibold">Creative Intake Portal</span>
                      </div>
                      <span className="text-[9px] text-slate-400">Step 3 of 5</span>
                    </div>

                    <div className="space-y-3">
                      <span className="text-xs font-semibold leading-tight block text-slate-800 dark:text-slate-100">
                        Visual Direction Inquiry: Choose the typography aesthetic that speaks to your target demographics.
                      </span>

                      <div className="space-y-2">
                        <button className="w-full text-left p-2.5 rounded-xl border border-brand-primary bg-brand-primary/5 text-xs font-semibold cursor-pointer block">
                          <span className="block text-slate-800 dark:text-slate-100 text-[11px]">Serif & Editorial</span>
                          <span className="block text-[9px] text-slate-400 font-normal">Sophisticated, luxury, premium status.</span>
                        </button>
                        <button className="w-full text-left p-2.5 rounded-xl border border-slate-200 hover:border-brand-primary/50 text-xs font-semibold transition-colors cursor-pointer block">
                          <span className="block text-slate-800 dark:text-slate-100 text-[11px]">Geometric Monospaced</span>
                          <span className="block text-[9px] text-slate-400 font-normal">Tech-driven, raw modern, efficient.</span>
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  <div className="pt-4 border-t">
                    <button className="w-full py-2 bg-brand-primary hover:bg-brand-purple-dark text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1">
                      Save & Next Slide
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Side commentary */}
                <div className="flex-1 flex flex-col justify-center space-y-4">
                  <span className="px-2.5 py-1 bg-brand-primary/10 text-brand-primary font-semibold text-[10px] rounded-full uppercase tracking-wider w-fit">
                    Zero Onboarding Friction
                  </span>
                  <h4 className="text-lg font-semibold text-slate-900 dark:text-white leading-snug">
                    Your clients get a beautiful, secure link that allows them to submit decisions in under 4 minutes.
                  </h4>
                  <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-400">
                    <li className="flex items-center gap-2">
                      <ClipboardCheck className="w-4 h-4 text-emerald-500" />
                      No complex passwords or usernames required for clients
                    </li>
                    <li className="flex items-center gap-2">
                      <Target className="w-4 h-4 text-emerald-500" />
                      Visual-based questions increase alignment accuracy by 85%
                    </li>
                    <li className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-emerald-500" />
                      Immediately uploads results to your unified workspace
                    </li>
                  </ul>
                  <button 
                    onClick={() => setActiveTab('ai-parser')}
                    className="w-fit text-xs text-brand-primary font-semibold flex items-center gap-1 hover:underline cursor-pointer"
                  >
                    Back to AI Brand Mapper
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
