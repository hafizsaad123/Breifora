import { useState } from 'react';
import { motion } from 'motion/react';
import { Check, HelpCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { pricingPlans } from '../data';
import { ScrollBlurHeading } from './ScrollBlurHeading';
import { PrimaryBrandButton } from './PrimaryBrandButton';
import { SecondaryWhiteButton } from './SecondaryWhiteButton';

interface AnimatedPriceTextProps {
  value: string | number;
  isFree?: boolean;
}

export function AnimatedPriceText({ value, isFree }: AnimatedPriceTextProps) {
  return (
    <div className="flex items-baseline font-geist">
      <span className="text-2xl md:text-3xl font-bold text-slate-900 self-start mt-1 font-geist">$</span>
      <span className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight font-geist px-1 py-1">
        {value}
      </span>
      <span className="text-sm font-medium text-slate-400 ml-1 font-geist">
        {isFree ? 'Forever' : '/mo'}
      </span>
    </div>
  );
}

export default function Pricing() {
  const [isAnnual, setIsAnnual] = useState(false);
  const navigate = useNavigate();

  const handleCTA = (planId: string) => {
    if (planId === 'plan-free') {
      navigate('/signup');
    } else {
      console.log(`Premium tier selected: ${planId}`);
      navigate('/signup');
    }
  };

  return (
    <section className="py-24 bg-white relative overflow-hidden" id="pricing">
      {/* Mesh decorative glow behind final pricing cards */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-brand-primary/5 rounded-full blur-3xl pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Header section */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-5">
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-brand-primary/10 text-brand-primary text-xs font-semibold uppercase tracking-wider">
            Predictable Pricing
          </span>
          <ScrollBlurHeading className="text-3xl sm:text-5xl font-semibold text-slate-900 tracking-tight leading-[1.08]">
            Invest in Creative Clarity. Protect Your Margin.
          </ScrollBlurHeading>
          <p className="text-slate-600 text-sm sm:text-base">
            Select the tailored plan that aligns with your active workflow needs. No setup fees, cancel anytime.
          </p>

          {/* Monthly/Annual Toggle Switcher */}
          <div className="flex items-center justify-center gap-3 pt-6 select-none">
            <span className={`text-xs font-semibold uppercase tracking-wider transition-colors ${!isAnnual ? 'text-brand-primary' : 'text-slate-400'}`}>
              Billed Monthly
            </span>
            <button
              onClick={() => setIsAnnual(!isAnnual)}
              className={`w-14 h-8 rounded-full p-1 cursor-pointer transition-colors duration-300 relative ${
                isAnnual ? 'bg-brand-primary' : 'bg-slate-300'
              }`}
            >
              <motion.div
                layout
                className="w-6 h-6 rounded-full bg-white shadow-sm"
                animate={{ x: isAnnual ? 24 : 0 }}
                transition={{ type: "spring", stiffness: 350, damping: 25 }}
              />
            </button>
            <span className={`text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5 transition-colors ${isAnnual ? 'text-brand-primary' : 'text-slate-400'}`}>
              Billed Annually
            </span>
          </div>
        </div>

        {/* Pricing Cards Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto items-stretch">
          {pricingPlans.map((plan) => {
            const isPro = plan.popular;
            const price = isAnnual ? plan.priceAnnual : plan.priceMonthly;

            return (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4 }}
                whileHover={isPro ? { y: -6, transition: { duration: 0.15 } } : undefined}
                id={`pricing-card-${plan.id}`}
                className={`rounded-2xl flex flex-col justify-between p-8 border transition-all duration-300 relative ${
                  isPro
                    ? 'border-brand-primary bg-white ring-4 ring-brand-primary/5 pt-10 md:scale-105'
                    : 'border-slate-100 bg-slate-50/50 hover:bg-white text-slate-800'
                }`}
              >
                {/* Isolated Highlights for the Pro Plan */}
                {isPro && (
                  <>
                    {/* Popular Distinctive Badge centered on top border */}
                    <span className="absolute -top-[14px] left-1/2 -translate-x-1/2 px-5 py-1 rounded-full bg-brand-primary text-white text-[11px] font-semibold tracking-wide whitespace-nowrap z-10 shadow-sm">
                      Most popular
                    </span>
                  </>
                )}

                {/* Plan Header */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-semibold text-slate-900 tracking-tight">
                      {plan.name}
                    </h3>
                    {plan.id === 'plan-free' && (
                      <span className="px-2.5 py-0.5 bg-slate-100 text-slate-600 font-semibold text-[10px] rounded-full uppercase tracking-wider">
                        Sandbox
                      </span>
                    )}
                    {plan.id === 'plan-studio' && (
                      <span className="px-2.5 py-0.5 bg-purple-50 text-indigo-800 font-semibold text-[10px] rounded-full uppercase tracking-wider">
                        Enterprise
                      </span>
                    )}
                  </div>

                  <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
                    {plan.description}
                  </p>

                  <div className="py-4">
                    <AnimatedPriceText
                      value={price}
                      isFree={plan.id === 'plan-free'}
                    />
                    {isAnnual && plan.id !== 'plan-free' && (
                      <span className="text-[10px] font-semibold text-emerald-600 block mt-1 uppercase">
                        Billed annually (${price * 12}/yr)
                      </span>
                    )}
                  </div>
                </div>

                {/* Features List Section */}
                <div className="border-t border-slate-100 my-6 pt-6 flex-1 space-y-4">
                  <span className="text-[10px] font-semibold text-slate-400 block uppercase tracking-widest">
                    Key Features Included:
                  </span>
                  <ul className="space-y-3.5">
                    {plan.features.map((feat, i) => (
                      <li key={i} className="flex items-start gap-2.5 text-xs text-slate-700 leading-tight">
                        <div className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                          isPro ? 'bg-brand-primary/10 text-brand-primary' : 'bg-slate-200/50 text-slate-500'
                        }`}>
                          <Check className="w-3 h-3 stroke-[3]" />
                        </div>
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Action Call to Action Button */}
                <div className="pt-2">
                  {isPro ? (
                    <PrimaryBrandButton 
                      className="w-full text-xs uppercase tracking-wider py-3.5"
                      onClick={() => handleCTA(plan.id)}
                    >
                      {plan.ctaText}
                    </PrimaryBrandButton>
                  ) : (
                    <SecondaryWhiteButton
                      className="w-full text-xs uppercase tracking-wider py-3.5"
                      onClick={() => handleCTA(plan.id)}
                    >
                      {plan.ctaText}
                    </SecondaryWhiteButton>
                  )}
                  <p className="text-[10px] text-center text-slate-400 mt-2.5">
                    {plan.id === 'plan-free' ? 'No setup limits' : 'No compliance lockouts. Standard rules.'}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
