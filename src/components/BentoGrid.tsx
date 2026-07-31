import { motion } from 'motion/react';
import { bentoFeatures } from '../data';
import { ShieldCheck, UserMinus, ToggleLeft, HelpCircle } from 'lucide-react';
import { ScrollBlurHeading } from './ScrollBlurHeading';

export default function BentoGrid() {
  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { 
      opacity: 1, 
      y: 0, 
      transition: { 
        type: "spring", 
        stiffness: 90, 
        damping: 18 
      } 
    },
  };

  const icons = [
    <ToggleLeft className="w-6 h-6 text-brand-primary" />,
    <ShieldCheck className="w-6 h-6 text-brand-primary" />,
    <UserMinus className="w-6 h-6 text-brand-primary" />,
    <HelpCircle className="w-6 h-6 text-brand-primary" />
  ];

  return (
    <section className="py-20 bg-[#FBFBFF] relative" id="benefits">
      <div className="absolute inset-0 mesh-dot-bg opacity-30 pointer-events-none"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
          <span className="inline-flex items-center gap-1.5 h-auto pl-4 pr-[13px] pt-[5px] pb-[5px] mr-[1px] mb-[23px] rounded-full bg-brand-primary/10 text-brand-primary text-xs font-semibold uppercase tracking-wider">
            Client Alignment Infrastructure
          </span>
          <ScrollBlurHeading className="text-3xl sm:text-4xl font-semibold text-slate-900 tracking-tight leading-[1.12]">
            Elite Visual Curation.<br />Complete Margin Defense.
          </ScrollBlurHeading>
          <p className="text-slate-600 text-sm sm:text-base">
            Traditional questionnaires collect text fields. Breifora maps complete creative directions while locking in your project boundaries.
          </p>
        </div>

        {/* CSS Grid 2 columns */}
        <motion.div
          variants={containerVariants}
          initial="hidden animate"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto"
        >
          {bentoFeatures.map((feat, index) => {
            return (
              <motion.div
                key={feat.id}
                variants={cardVariants}
                id={`bento-feature-${feat.id}`}
                className="group rounded-2xl p-8 border bg-white border-slate-200 text-slate-800 hover:border-brand-primary transition-all duration-300 relative overflow-hidden flex flex-col justify-between min-h-64"
              >
                {/* Card Icon */}
                <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-6 shadow-sm bg-brand-primary/5 text-brand-primary">
                  {icons[index % icons.length]}
                </div>

                {/* Card Header & Description */}
                <div className="space-y-3">
                  <h3 className="text-xl font-semibold tracking-tight text-slate-900 group-hover:text-brand-primary transition-colors duration-300">
                    {feat.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-slate-600">
                    {feat.description}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
