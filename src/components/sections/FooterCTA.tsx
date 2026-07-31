import { motion } from 'motion/react';
import { ArrowRight, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ScrollBlurHeading } from '../ui/ScrollBlurHeading';
import { SecondaryWhiteButton } from '../ui/SecondaryWhiteButton';

export default function FooterCTA() {
  const navigate = useNavigate();

  return (
    <section className="py-16 bg-white relative overflow-hidden">
      {/* Decorative gradient glow container */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-brand-primary/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Main Banner Box */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98, y: 30 }}
          whileInView={{ opacity: 1, scale: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ type: "spring", stiffness: 80, damping: 18 }}
          className="gradient-cta-card rounded-3xl p-8 sm:p-14 lg:p-20 text-center relative overflow-hidden text-white"
        >
          {/* Subtle design mesh background overlay */}
          <div className="absolute inset-0 opacity-10 pointer-events-none mix-blend-overlay">
            <div className="absolute inset-0 mesh-dot-bg"></div>
          </div>

          <div className="absolute top-0 right-10 w-96 h-96 bg-white/10 rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-brand-purple-dark/40 rounded-full blur-3xl pointer-events-none"></div>

          <div className="max-w-3xl mx-auto space-y-8 relative z-10">
            {/* Top Badge Accent */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 border border-white/10 text-white text-[10px] font-semibold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
              Secure 100% Alignment Today
            </div>

            {/* Title */}
            <ScrollBlurHeading className="text-3xl sm:text-5xl font-semibold tracking-tight leading-[1.08]">
              Ready to Turn Client Chaos<br />into{" "}
              <span className="text-[#140E4c]">
                Creative Clarity?
              </span>
            </ScrollBlurHeading>

            {/* Subtext */}
            <p className="text-white/80 text-sm sm:text-lg max-w-xl mx-auto leading-relaxed">
              Automate intake. Kill scope creep. Protect your margins. Join hundreds of elite creators for free today.
            </p>

            {/* White Solid CTA Button */}
            <div className="flex flex-col items-center gap-3 pt-4">
              <SecondaryWhiteButton
                onClick={() => navigate('/signup')}
                className="w-full sm:w-auto px-10 py-5 text-xs uppercase tracking-widest gap-2"
              >
                Start Free with Breifora
                <ArrowRight className="w-4 h-4 text-white" />
              </SecondaryWhiteButton>
              
              <span className="text-[10px] text-white/60 tracking-wider uppercase font-semibold">
                No credit card required
              </span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
