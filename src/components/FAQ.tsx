import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { faqList } from '../data';
import { ChevronDown, Plus, Minus, HelpCircle } from 'lucide-react';
import { ScrollBlurHeading } from './ScrollBlurHeading';

export default function FAQ() {
  // Item 1 (faq-1) is open by default:
  const [openId, setOpenId] = useState<string | null>('faq-1');

  const toggleAccordion = (id: string) => {
    if (openId === id) {
      setOpenId(null);
    } else {
      setOpenId(id);
    }
  };

  return (
    <section className="py-20 bg-white relative" id="faqs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Header Section */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-brand-primary/10 text-brand-primary text-xs font-semibold uppercase tracking-wider">
            Common Doubts
          </span>
          <ScrollBlurHeading className="text-3xl sm:text-4xl font-semibold text-slate-900 tracking-tight leading-[1.12]">
            Got Questions?<br />We Have Clear Answers.
          </ScrollBlurHeading>
          <p className="text-slate-600 text-sm sm:text-base">
            Everything you need to master your new digital strategy workspace. Keep your onboarding frictionless.
          </p>
        </div>

        {/* Single-Column Accordions container */}
        <div className="max-w-3xl mx-auto space-y-4">
          {faqList.map((item) => {
            const isOpen = openId === item.id;

            return (
              <div
                key={item.id}
                className={`rounded-2xl border transition-all duration-350 overflow-hidden ${
                  isOpen
                    ? 'border-brand-primary bg-brand-primary/2 shadow-md'
                    : 'border-slate-100 bg-slate-50/50 hover:bg-slate-50'
                }`}
              >
                {/* Trigger Button */}
                <button
                  onClick={() => toggleAccordion(item.id)}
                  aria-expanded={isOpen}
                  className="w-full flex items-center justify-between p-6 text-left cursor-pointer transition-colors"
                >
                  <span className="font-semibold text-[#111111] text-xs sm:text-sm md:text-base leading-snug pr-4">
                    {item.question}
                  </span>
                  <div className={`p-1.5 rounded-full flex items-center justify-center shrink-0 transition-transform duration-200 ${
                    isOpen ? 'bg-brand-primary text-white' : 'bg-slate-200/50 text-slate-600'
                  }`}>
                    {isOpen ? (
                      <Minus className="w-3 sm:w-4 h-3 sm:h-4 stroke-[3]" />
                    ) : (
                      <Plus className="w-3 sm:w-4 h-3 sm:h-4 stroke-[3]" />
                    )}
                  </div>
                </button>

                {/* Animated Answer Box Panel */}
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25, ease: "easeInOut" }}
                    >
                      <div className="px-6 pb-6 text-xs sm:text-sm text-slate-600 border-t border-brand-primary/10 pt-4 leading-relaxed bg-white/40">
                        {item.answer}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
