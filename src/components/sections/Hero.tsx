import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Sparkles, ArrowRight, Play } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import WorkspaceMockup from './WorkspaceMockup';
import { PrimaryBrandButton } from '../ui/PrimaryBrandButton';
import { SecondaryWhiteButton } from '../ui/SecondaryWhiteButton';
import { 
  getAdminHeroCopy, 
  fetchSettingFromSupabase, 
  subscribeToSupabaseChanges, 
  ADMIN_SYNC_EVENT 
} from '../../lib/adminSync';

export default function Hero() {
  const navigate = useNavigate();
  const [heroCopy, setHeroCopy] = useState(getAdminHeroCopy);

  useEffect(() => {
    // 1. Fetch current settings directly from Supabase on component mount
    fetchSettingFromSupabase('hero_copy').then((data) => {
      if (data) {
        setHeroCopy(data);
      }
    });

    // 2. Handle local sync events
    const handleUpdate = () => {
      setHeroCopy(getAdminHeroCopy());
    };

    window.addEventListener(ADMIN_SYNC_EVENT, handleUpdate);
    window.addEventListener('storage', handleUpdate);

    // 3. Subscribe to real-time database updates from Supabase
    const unsubscribeSupabase = subscribeToSupabaseChanges(() => {
      setHeroCopy(getAdminHeroCopy());
    });

    return () => {
      window.removeEventListener(ADMIN_SYNC_EVENT, handleUpdate);
      window.removeEventListener('storage', handleUpdate);
      unsubscribeSupabase();
    };
  }, []);

  const introTransition = {
    type: "spring" as const,
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
            {heroCopy.badge}
          </motion.div>

          {/* H1 Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={introTransition}
            className="text-4xl sm:text-[60px] font-semibold text-slate-900 tracking-tight leading-[1.08]"
          >
            {heroCopy.title}<br className="hidden sm:inline" />{" "}
            <span className="text-brand-primary">
              {heroCopy.highlightTitle}
            </span>
          </motion.h1>

          {/* Subtext */}
          <motion.p
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...introTransition, delay: 0.15 }}
            className="text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto font-normal leading-relaxed"
          >
            {heroCopy.subtitle}
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
              {heroCopy.primaryCta}
              <ArrowRight className="w-5 h-5" />
            </PrimaryBrandButton>
            {Boolean(heroCopy.secondaryCta && heroCopy.secondaryCta.trim()) && (
              <SecondaryWhiteButton
                onClick={() => {
                  const element = document.getElementById('how-it-works');
                  if (element) element.scrollIntoView({ behavior: 'smooth' });
                }}
                className="w-full sm:w-auto gap-2 py-4"
              >
                <Play className="w-4 h-4 fill-current text-[#5956E9]" />
                {heroCopy.secondaryCta}
              </SecondaryWhiteButton>
            )}
          </motion.div>
        </div>

        {/* Product Mockup View card container */}
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