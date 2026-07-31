import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { getAdminTestimonials, ADMIN_SYNC_EVENT } from '../../lib/adminSync';
import { ScrollBlurHeading } from '../ui/ScrollBlurHeading';

const G2Badge = () => (
  <div className="flex items-center gap-1.5 bg-red-50/70 border border-red-100/80 rounded-lg px-2 py-0.5 shrink-0 shadow-xs">
    <span className="text-[11px] font-black text-red-500 tracking-tight flex items-center">
      G<span className="text-[8px] font-bold self-start -mt-0.5 ml-0.5">2</span>
    </span>
    <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest pl-1.5 border-l border-slate-200">
      Verified
    </span>
  </div>
);

export default function Testimonials() {
  const [testimonials, setTestimonials] = useState(getAdminTestimonials);

  useEffect(() => {
    const handleUpdate = () => {
      setTestimonials(getAdminTestimonials());
    };
    window.addEventListener(ADMIN_SYNC_EVENT, handleUpdate);
    window.addEventListener('storage', handleUpdate);
    return () => {
      window.removeEventListener(ADMIN_SYNC_EVENT, handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, []);

  const half = Math.ceil(testimonials.length / 2);
  const row1 = testimonials.slice(0, half);
  const row2 = testimonials.slice(half);

  const topTrack = [...row1, ...row1, ...row1];
  const bottomTrack = [...row2, ...row2, ...row2];

  return (
    <section className="py-24 bg-slate-50/50 overflow-hidden relative" id="testimonials">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 mb-16">
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-brand-primary/10 text-brand-primary text-xs font-semibold uppercase tracking-wider">
            Verified Experiences
          </span>
          <ScrollBlurHeading className="text-3xl sm:text-5xl font-semibold text-slate-900 tracking-tight leading-[1.08]">
            Loved by Strategic Consultants & Studios.
          </ScrollBlurHeading>
          <p className="text-slate-600 text-sm sm:text-base max-w-2xl mx-auto">
            Discover how leading creative teams use Breifora to eliminate infinite client revisions and protect project profit margins.
          </p>
        </div>
      </div>

      {/* Infinite Scrolling Ticker Cards */}
      <div className="space-y-6">
        {/* Row 1: Left track */}
        <div className="flex w-full overflow-hidden pause-on-hover">
          <div className="flex gap-6 marquee-track animate-scroll-left shrink-0">
            {topTrack.map((test: any, index: number) => (
              <motion.div
                key={`top-${index}`}
                className="w-[380px] sm:w-[420px] bg-white border border-slate-200/80 hover:border-brand-primary rounded-2xl p-6 transition-colors duration-300 flex flex-col justify-between shrink-0 cursor-pointer shadow-xs"
              >
                <div>
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={test.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=faces'}
                        alt={test.name}
                        referrerPolicy="no-referrer"
                        className="w-11 h-11 rounded-full object-cover border border-slate-100"
                      />
                      <div>
                        <h4 className="font-semibold text-slate-950 text-sm leading-tight tracking-tight">
                          {test.name}
                        </h4>
                        <p className="text-slate-400 text-[11px] font-medium tracking-normal mt-0.5">
                          {test.role}
                        </p>
                      </div>
                    </div>
                    <G2Badge />
                  </div>

                  <span className="font-bold text-slate-950 text-sm mt-5 block tracking-tight leading-snug">
                    {test.title}
                  </span>
                  <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed font-normal">
                    "{test.text}"
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Row 2: Right track */}
        {row2.length > 0 && (
          <div className="flex w-full overflow-hidden pause-on-hover">
            <div className="flex gap-6 marquee-track animate-scroll-right shrink-0">
              {bottomTrack.map((test: any, index: number) => (
                <motion.div
                  key={`bottom-${index}`}
                  className="w-[380px] sm:w-[420px] bg-white border border-slate-200/80 hover:border-brand-primary rounded-2xl p-6 transition-colors duration-300 flex flex-col justify-between shrink-0 cursor-pointer shadow-xs"
                >
                  <div>
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <img
                          src={test.avatar || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=faces'}
                          alt={test.name}
                          referrerPolicy="no-referrer"
                          className="w-11 h-11 rounded-full object-cover border border-slate-100"
                        />
                        <div>
                          <h4 className="font-semibold text-slate-950 text-sm leading-tight tracking-tight">
                            {test.name}
                          </h4>
                          <p className="text-slate-400 text-[11px] font-medium tracking-normal mt-0.5">
                            {test.role}
                          </p>
                        </div>
                      </div>
                      <G2Badge />
                    </div>

                    <span className="font-bold text-slate-950 text-sm mt-5 block tracking-tight leading-snug">
                      {test.title}
                    </span>
                    <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed font-normal">
                      "{test.text}"
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
