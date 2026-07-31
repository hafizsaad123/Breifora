import { logoCloud } from '../data';
import { Layers, Disc, CircleDot, Compass } from 'lucide-react';
import { motion } from 'motion/react';

export default function LogoCloud() {
  const icons = [
    <Layers className="w-5 h-5 text-slate-400" />,
    <Disc className="w-5 h-5 text-slate-400" />,
    <CircleDot className="w-5 h-5 text-slate-400" />,
    <Compass className="w-5 h-5 text-slate-400" />
  ];

  // Quadruple the data array to guarantee ample width and completely seamless, repeating loop cycles
  const duplicatedLogos = [...logoCloud, ...logoCloud, ...logoCloud, ...logoCloud];

  return (
    <section className="py-12 border-y border-slate-100 bg-white/50 select-none overflow-hidden relative">
      {/* Edge masking gradients for seamless dissolving at container boundaries */}
      <div className="absolute top-0 bottom-0 left-0 w-20 md:w-36 bg-gradient-to-r from-white via-white/80 to-transparent z-10 pointer-events-none" />
      <div className="absolute top-0 bottom-0 right-0 w-20 md:w-36 bg-gradient-to-l from-white via-white/80 to-transparent z-10 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <p className="text-center text-xs font-semibold uppercase tracking-widest text-slate-400 mb-8">
          Trusted By Designers Worldwide
        </p>

        {/* Embedded CSS style rules for perfect, flicker-free hardware accelerated animation to the right */}
        <style>{`
          @keyframes logo-scroll-right {
            0% { transform: translateX(-50%); }
            100% { transform: translateX(0); }
          }
          .animate-logo-scroll-right {
            display: flex;
            width: max-content;
            animation: logo-scroll-right 28s linear infinite;
          }
          .logo-marquee-container:hover .animate-logo-scroll-right {
            animation-play-state: paused;
          }
        `}</style>

        <div className="logo-marquee-container overflow-hidden w-full relative">
          <div className="animate-logo-scroll-right flex items-center gap-16 md:gap-24">
            {duplicatedLogos.map((logo, index) => (
              <motion.div
                key={`${logo.id}-${index}`}
                whileHover={{ scale: 1.05 }}
                className="flex items-center gap-2 text-slate-400 hover:text-slate-600 transition-colors duration-200 shrink-0 cursor-pointer"
              >
                <div className="flex-shrink-0">
                  {icons[index % icons.length]}
                </div>
                <span className="font-display font-semibold text-base md:text-lg tracking-tight">
                  {logo.text}
                </span>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

