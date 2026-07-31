import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Menu, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Logo from './Logo';
import { PrimaryBrandButton } from './PrimaryBrandButton';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 15) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    setIsOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const menuItems = [
    { label: 'Benefits', id: 'benefits' },
    { label: 'How It Works', id: 'how-it-works' },
    { label: 'Why Briefora', id: 'why-briefora' },
    { label: 'Pricing', id: 'pricing' },
    { label: 'Testimonials', id: 'testimonials' },
    { label: 'FAQs', id: 'faqs' },
  ];

  return (
    <header className="sticky top-4 left-0 right-0 z-50 w-full flex justify-center px-4 sm:px-6 lg:px-8 transition-all duration-300">
      <nav
        className={`max-w-7xl w-full rounded-full border transition-all duration-300 px-6 sm:px-8 py-2 md:py-2.5 ${
          scrolled
            ? 'bg-white/90 backdrop-blur-lg border-slate-200/80 scale-[0.99]'
            : 'bg-white/75 backdrop-blur-md border-slate-200/50'
        }`}
        id="main-navbar"
      >
        <div className="flex justify-between items-center h-12 md:h-14">
          
          {/* Leftside: Logo branding (matches image_f9bc20.png layout position) */}
          <div 
            className="flex-shrink-0 flex items-center gap-2 cursor-pointer" 
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          >
          <img src="https://github.com/hafizsaad123/breifora/blob/main/Frame%2025178150.png?raw=true" width="120px"/>
          
          </div>

          {/* Centerside: Symmetrical Links Grid with dropdown style indicators */}
          <div className="hidden md:flex items-center space-x-6 text-[13px] font-semibold text-slate-600">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => scrollToSection(item.id)}
                className="hover:text-brand-primary active:scale-[0.98] transition-all duration-200 cursor-pointer flex items-center gap-1 font-medium"
              >
                <span>{item.label}</span>
              </button>
            ))}
          </div>

          {/* Rightside: Capsule Utility Action Buttons stack */}
          <div className="hidden md:flex items-center gap-2">
            <button 
              onClick={() => navigate('/login')}
              className="px-5 py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 text-[12px] font-semibold rounded-full border border-slate-100 transition-all duration-200 cursor-pointer active:scale-95"
            >
              Log In
            </button>
            <PrimaryBrandButton 
              onClick={() => navigate('/signup')}
              className="px-5 py-2 text-[12px]"
            >
              Start Free
            </PrimaryBrandButton>
          </div>

          {/* Mobile Menu Button icon */}
          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-1.5 rounded-full text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
            >
              {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Drawer dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            transition={{ duration: 0.15 }}
            className="absolute top-16 left-4 right-4 bg-white/95 backdrop-blur-lg rounded-2xl border border-slate-200/50 p-4 shadow-xl overflow-hidden md:hidden z-50"
          >
            <div className="space-y-1.5 flex flex-col">
              {menuItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => scrollToSection(item.id)}
                  className="w-full text-left px-4 py-2.5 rounded-xl text-slate-700 hover:bg-slate-50 hover:text-brand-primary font-medium text-sm transition-colors cursor-pointer flex items-center justify-between"
                >
                  <span>{item.label}</span>
                </button>
              ))}
              <div className="pt-3 mt-2 border-t border-slate-100 space-y-2 px-2">
                <button
                  onClick={() => navigate('/login')}
                  className="w-full py-2.5 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-full text-xs font-semibold border border-slate-150 transition-all flex items-center justify-center cursor-pointer"
                >
                  Log In
                </button>
                <PrimaryBrandButton
                  onClick={() => navigate('/signup')}
                  className="w-full py-2.5 text-xs font-semibold"
                >
                  Start Free
                </PrimaryBrandButton>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
