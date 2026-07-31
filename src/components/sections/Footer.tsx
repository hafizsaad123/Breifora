import { Layers, Github, Twitter, Linkedin } from 'lucide-react';
import Logo from '../ui/Logo';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <footer className="bg-slate-50 border-t border-slate-100 relative overflow-hidden pt-16 pb-8 select-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Main Grid mapping perfectly to the logo and links layout */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 pb-12 border-b border-slate-200/60">
          
          {/* Left Column branding */}
          <div className="md:col-span-1 space-y-4">
            <Logo textSize="text-lg" />
            <p className="text-xs text-slate-500 font-semibold tracking-wider">
              From client chaos to <span className="text-brand-primary">creative clarity</span>.
            </p>
            <p className="text-[11px] text-slate-400">
              The ultimate collaborative strategy workspace built explicitly for high-end designers, creative authorities, and digital studios.
            </p>
          </div>

          {/* Column 1: Socials */}
          <div className="space-y-4">
            <h4 className="text-slate-900 font-semibold text-xs uppercase tracking-widest">Connect</h4>
            <ul className="space-y-2.5 text-xs text-slate-500">
              <li>
                <a href="#linkedin" className="font-normal hover:text-brand-primary transition-colors block">LinkedIn</a>
              </li>
              <li>
                <a href="#instagram" className="font-normal hover:text-brand-primary transition-colors block">Instagram</a>
              </li>
              <li>
                <a href="#youtube" className="font-normal hover:text-brand-primary transition-colors block">Youtube</a>
              </li>
            </ul>
          </div>

          {/* Column 2: Navigation */}
          <div className="space-y-4">
            <h4 className="text-slate-900 font-semibold text-xs uppercase tracking-widest">Platform</h4>
            <ul className="space-y-2.5 text-xs text-slate-500">
              <li>
                <button onClick={() => scrollToSection('benefits')} className="font-normal hover:text-brand-primary transition-colors block cursor-pointer">Benefits</button>
              </li>
              <li>
                <button onClick={() => scrollToSection('how-it-works')} className="font-normal hover:text-brand-primary transition-colors block cursor-pointer">How It Works</button>
              </li>
              <li>
                <button onClick={() => scrollToSection('why-briefora')} className="font-normal hover:text-brand-primary transition-colors block cursor-pointer">Why Breifora</button>
              </li>
              <li>
                <button onClick={() => scrollToSection('pricing')} className="font-normal hover:text-brand-primary transition-colors block cursor-pointer">Pricing</button>
              </li>
            </ul>
          </div>

          {/* Column 3: Trust FAQs */}
          <div className="space-y-4">
            <h4 className="text-slate-900 font-semibold text-xs uppercase tracking-widest">Resources</h4>
            <ul className="space-y-2.5 text-xs text-slate-500">
              <li>
                <button onClick={() => scrollToSection('testimonials')} className="font-normal hover:text-[#5956E9] transition-colors block cursor-pointer animate-pulse-slow">Testimonials</button>
              </li>
              <li>
                <button onClick={() => scrollToSection('faqs')} className="font-normal hover:text-[#5956E9] transition-colors block cursor-pointer">FAQs</button>
              </li>
              <li>
                <a href="#terms" className="font-normal hover:text-slate-900 transition-colors block">Terms of Service</a>
              </li>
            </ul>
          </div>

        </div>

        {/* Absolute Baseline Copyright Banner elements */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-400 font-semibold uppercase tracking-wider">
          <span>Breifora © {currentYear}. All rights reserved.</span>
          <div className="flex gap-6">
            <a href="#privacy" className="hover:text-slate-900">Privacy Policy</a>
            <a href="#security" className="hover:text-slate-900">Security</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
