import { motion } from 'motion/react';
import { processSteps } from '../../data';
import { Link2, Laptop, FileSignature } from 'lucide-react';
import { ScrollBlurHeading } from '../ui/ScrollBlurHeading';

export default function ProcessSteps() {
  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.15,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 25 },
    visible: { 
      opacity: 1, 
      y: 0, 
      transition: { 
        type: "spring" as const, 
        stiffness: 90, 
        damping: 18 
      } 
    },
  };

  const icons = [
    <Link2 className="w-5 h-5 text-brand-primary" />,
    <Laptop className="w-5 h-5 text-brand-primary" />,
    <FileSignature className="w-5 h-5 text-brand-primary" />
  ];

  return (
    <section className="py-20 bg-white relative overflow-hidden" id="how-it-works">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Header Section */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-brand-primary/10 text-brand-primary text-xs font-semibold uppercase tracking-wider">
            Zero-Friction Discovery Flow
          </span>
          <ScrollBlurHeading className="text-3xl sm:text-4xl font-semibold text-slate-900 tracking-tight leading-[1.12]">
            Establish Aesthetic Boundaries Before Crafting Visuals
          </ScrollBlurHeading>
          <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
            Eliminate infinite onboarding loopaches. Send an elegant magic link, let clients interactively visual-map their brand preferences, and lock down project scope with an online strategic blueprint.
          </p>
        </div>

        {/* 3-Column Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden animate"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto"
        >
          {processSteps.map((step, idx) => {
            return (
              <motion.div
                key={idx}
                variants={itemVariants}
                className="group relative bg-slate-50 border border-slate-100 hover:border-brand-primary p-8 rounded-2xl flex flex-col justify-between transition-all duration-300"
              >
                {/* Visual Connector Line (for desktop and multi-columns layout) */}
                {idx < 2 && (
                  <div className="hidden md:block absolute top-1/2 -right-4 translate-y-[-50%] w-8 h-0.5 border-t-2 border-dashed border-slate-200 z-10"></div>
                )}

                <div className="space-y-5">
                  {/* Step Badge */}
                  <div className="flex items-center justify-between">
                    <span className="px-3 py-1 bg-brand-primary/10 text-brand-primary font-semibold text-[11px] rounded-lg uppercase tracking-wider">
                      {step.step}
                    </span>
                    <div className="w-9 h-9 rounded-lg bg-white shadow-xs border border-slate-100 flex items-center justify-center">
                      {icons[idx]}
                    </div>
                  </div>

                  {/* Graphic Mock Box to mimic visual card styling in the raw mockup */}
                  <div className="w-full h-24 rounded-xl bg-gradient-to-r from-[#2516FF]/10 via-slate-100 to-[#2516FF]/15 flex items-center justify-center p-3 overflow-hidden select-none relative transition-transform duration-300">
                    <div className="absolute inset-0 bg-radial-gradient from-white/10 to-transparent blur-md"></div>
                    <div className="w-full text-center space-y-1.5 z-10">
                      <span className="h-2 w-12 bg-white/60 rounded block mx-auto"></span>
                      <span className="h-1.5 w-24 bg-white/40 rounded block mx-auto"></span>
                      <span className="h-1.5 w-16 bg-white/30 rounded block mx-auto"></span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold text-slate-900 group-hover:text-brand-primary transition-colors">
                      {step.title}
                    </h3>
                    <p className="text-slate-600 text-xs leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
