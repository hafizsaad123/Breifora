import { useState } from 'react';
import { motion } from 'motion/react';
import { Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ScrollBlurHeading } from '../ui/ScrollBlurHeading';
import { PrimaryBrandButton } from '../ui/PrimaryBrandButton';
import { SecondaryWhiteButton } from '../ui/SecondaryWhiteButton';
import { useAppSettings } from '../../context/AppSettingsContext';

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
  const { settings } = useAppSettings();
  const plans = settings.pricing || [];
  const [isAnnual, setIsAnnual] = useState(false);
  const navigate = useNavigate();

  const handleCTA = (_planId: string) => {
    navigate('/signup');
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
          {plans.map((plan: any) => {
            const isPro = plan.popular;
            const price = isAnnual 
              ? (plan.priceAnnual !== undefined ? plan.priceAnnual : Math.round((plan.priceMonthly ?? plan.price ?? 0) * 0.8))
              : (plan.priceMonthly !== undefined ? plan.priceMonthly : (plan.price !== undefined ? plan.price : 0));

            return (
              <motion.div
                key={plan.id || plan.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4 }}
                whileHover={isPro ? { y: -6, transition: { duration: 0.15 } } : undefined}
                id={`pricing-card-${plan.id}`}
                className={`rounded-2xl flex flex-col justify-between p-8 border transition-all duration-300 relative ${
                  isPro
                    ? 'border-brand-primary bg-white ring-4 ring-brand-primary/5 pt-10 md:scale-105 shadow-xl shadow-brand-primary/5'
                    : 'border-slate-100 bg-slate-50/50 hover:bg-white text-slate-800'
                }`}
              >
                {/* Isolated Highlights for the Pro Plan */}
                {isPro && (
                  <span className="absolute -top-[14px] left-1/2 -translate-x-1/2 px-5 py-1 rounded-full bg-brand-primary text-white text-[11px] font-semibold tracking-wide whitespace-nowrap z-10 shadow-sm">
                    Most popular
                  </span>
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
                      <span className="px-2.5 py-0.5 bg-primary-light text-brand-primary font-semibold text-[10px] rounded-full uppercase tracking-wider">
                        Enterprise
                      </span>
                    )}
                  </div>

                  <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
                    {plan.description || plan.desc}
                  </p>

                  <div className="py-4">
                    <AnimatedPriceText
                      value={price}
                      isFree={plan.id === 'plan-free'}
                    />
                  </div>

                  {/* Feature Checkmarks */}
                  <div className="space-y-3 pt-2">
                    <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Included capabilities:</p>
                    {plan.features?.map((feature: string, idx: number) => (
                      <div key={idx} className="flex items-start gap-2.5 text-xs text-slate-700">
                        <Check className="w-4 h-4 text-brand-primary shrink-0 mt-0.5" />
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Plan Action CTA */}
                <div className="pt-8 mt-auto">
                  {isPro ? (
                    <PrimaryBrandButton
                      onClick={() => handleCTA(plan.id)}
                      className="w-full justify-center"
                    >
                      {plan.buttonText || plan.ctaText || 'Upgrade to Pro'}
                    </PrimaryBrandButton>
                  ) : (
                    <SecondaryWhiteButton
                      onClick={() => handleCTA(plan.id)}
                      className="w-full justify-center"
                    >
                      {plan.buttonText || plan.ctaText || 'Get Started'}
                    </SecondaryWhiteButton>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
