import { motion } from 'motion/react';
import { Sparkles, ArrowRight, Play } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import WorkspaceMockup from './WorkspaceMockup';
import { PrimaryBrandButton } from './PrimaryBrandButton';
import { SecondaryWhiteButton } from './SecondaryWhiteButton';

export default function Hero() {
  const navigate = useNavigate();

  const introTransition = {
    type: "spring",
    stiffness: 100,
    damping: 20,
    mass: 1,
  };

  return (
    <section className="relative overflow-hidden pt-28 pb-16 sm:pt-36 sm:pb-24 bg-white" id="hero">

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-4xl mx-auto space-y-7">
          {/* Top Badge */}
          <motion.div
            initial={{ opacity: 0, y: -15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...introTransition, delay: 0.1 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#EAE8FE] border border-brand-primary/10 text-brand-primary text-xs font-semibold uppercase tracking-wider"
          >
            <Sparkles className="w-3.5 h-3.5 text-brand-primary" />
            AI Client Discovery for Brand Designers
          </motion.div>

          {/* H1 Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={introTransition}
            className="text-4xl sm:text-[60px] font-semibold text-slate-900 tracking-tight leading-[1.08]"
          >
            Turn Client Chaos Into<br className="hidden sm:inline" />{" "}
            <span className="text-brand-primary">
              Elite Strategic Blueprints
            </span>
          </motion.h1>

          {/* Subtext */}
          <motion.p
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...introTransition, delay: 0.15 }}
            className="text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto font-normal leading-relaxed"
          >
            The zero-login brand alignment engine trusted by premium visual consultants and boutique studios. Capture precise stylistic direction and lock project scope entirely online—no client passwords required.
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...introTransition, delay: 0.2 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2"
          >
            <PrimaryBrandButton
              onClick={() => navigate('/signup')}
              className="w-full sm:w-auto gap-2 py-4"
            >
              Start Free
              <ArrowRight className="w-5 h-5" />
            </PrimaryBrandButton>
            <SecondaryWhiteButton
              onClick={() => {
                const element = document.getElementById('how-it-works');
                if (element) element.scrollIntoView({ behavior: 'smooth' });
              }}
              className="w-full sm:w-auto gap-2 py-4"
            >
              <Play className="w-4 h-4 fill-current text-[#5956E9]" />
              Watch Demo
            </SecondaryWhiteButton>
          </motion.div>



          <p className="text-[10px] text-slate-400 font-normal uppercase tracking-widest pt-2">
            NO CREDIT CARD REQUIRED
          </p>
        </div>

        {/* Product Mockup View card container with continuous viewport reveal animation */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...introTransition, delay: 0.3 }}
          className="mt-14 sm:mt-18 max-w-5xl mx-auto rounded-2xl p-1 bg-white/40 border border-white/20 shadow-2xl shadow-brand-primary/5"
        >
          <WorkspaceMockup />
        </motion.div>
      </div>
    </section>
  );
}
