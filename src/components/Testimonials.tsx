import { motion } from 'motion/react';
import { Quote } from 'lucide-react';
import { ScrollBlurHeading } from './ScrollBlurHeading';

// Custom G2 / Platform verified badge mimicking the high-contrast logo in image_fa3060.jpg
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

// Highly tailored brand designer and creative consultant testimonials
const row1Testimonials = [
  {
    name: "Devin M.",
    role: "Studio Director & Brand Consultant",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=faces",
    title: "Efficient & Thorough",
    text: "The connection with Breifora is top-notch. Getting it up and running was exceptionally smooth, and the brand mapping workspace has made our client onboarding flow go really well."
  },
  {
    name: "Guin W.",
    role: "Certified Coach & Human Design Specialist",
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=faces",
    title: "Unmatched intake engine",
    text: "While the platform has zero learning curve, the level of visual strategy alignment is unmatched. Just send a magic workspace link, clients click and select their design direction."
  },
  {
    name: "Michael R.",
    role: "Creative Partner, Sales & Marketing",
    avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&h=150&fit=crop&crop=faces",
    title: "Well worth the investment",
    text: "The margin protection is amazing. Breifora virtually eliminates mid-project scope creep from the outset. I recommend Breifora to any digital agency looking to secure client boundaries!"
  },
  {
    name: "Elena Rostova",
    role: "Boutique Creative Director",
    avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&h=150&fit=crop&crop=faces",
    title: "Luxurious White-Label Vibe",
    text: "Presenting my clients with a custom-branded Breifora link completely sets the tone for a high-ticket engagement. No logins required, beautiful visual mood boards."
  }
];

const row2Testimonials = [
  {
    name: "Jorge E.",
    role: "Head of Design & UX Strategy",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=faces",
    title: "Scope creep virtually zero",
    text: "Incredible client compliance because of the zero-login workspace. It represents unbelievable value for the price. I would put it up to par with enterprise-grade solutions."
  },
  {
    name: "Jason J.",
    role: "Lead UI Artist, Co-Founder",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=faces",
    title: "Brings style & layout together",
    text: "Clients love interactively picking active colour schemes, typographic directions, and layout priorities. It converts hours of manual intake into clean digital style tokens."
  },
  {
    name: "Christal B.",
    role: "Principal Brand Strategist",
    avatar: "https://images.unsplash.com/photo-1534751516642-a131ffd1037f?w=150&h=150&fit=crop&crop=faces",
    title: "Dramatically saves agency hours",
    text: "I found Breifora to be more up to date and the set up was exceptionally user friendly. Setup is streamlined, style extraction is robust, and client sign-off takes 10 seconds."
  },
  {
    name: "Marcus T.",
    role: "Senior UX Consultant",
    avatar: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&h=150&fit=crop&crop=faces",
    title: "Elite client experience",
    text: "Our clients expect elegance and elite workflows. Breifora is the first onboarding module that matches that standard. Seamless, beautiful, and highly aligned."
  }
];

// Duplicate lists to enable mathematically seamless infinite loop scrolling
const topTrack = [...row1Testimonials, ...row1Testimonials];
const bottomTrack = [...row2Testimonials, ...row2Testimonials];

export default function Testimonials() {
  return (
    <section className="py-24 bg-slate-50/50 relative overflow-hidden border-t border-b border-slate-100" id="testimonials">
      {/* Premium background radial glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#5956E9]/3 rounded-full blur-3xl pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Header Section */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-brand-primary/10 text-brand-primary text-xs font-semibold uppercase tracking-wider">
            Approved by Creators
          </span>
          <ScrollBlurHeading className="text-3xl sm:text-4xl font-semibold text-slate-900 tracking-tight leading-[1.12]">
            Endorsed by Top-Tier Designers & Studios
          </ScrollBlurHeading>
          <p className="text-slate-600 text-sm sm:text-base">
            See how boutique agency owners, visual strategists, and consultants use Breifora to align aesthetic goals and safeguard margins.
          </p>
        </div>
      </div>

      {/* CSS-Keyframes Marquee Styles embedded directly to prevent any flicker */}
      <style>{`
        @keyframes scroll-left {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        @keyframes scroll-right {
          0% { transform: translateX(-50%); }
          100% { transform: translateX(0); }
        }
        .animate-scroll-left {
          animation: scroll-left 35s linear infinite;
        }
        .animate-scroll-right {
          animation: scroll-right 35s linear infinite;
        }
        .pause-on-hover:hover .marquee-track {
          animation-play-state: paused;
        }
      `}</style>

      {/* Infinite sliding container wrapped with relative masking gradients */}
      <div className="relative w-full overflow-hidden space-y-6 py-4">
        
        {/* Relative Left & Right Linear Alpha Fades */}
        <div className="absolute top-0 bottom-0 left-0 w-24 sm:w-48 bg-gradient-to-r from-slate-50 via-slate-50/80 to-transparent z-20 pointer-events-none" />
        <div className="absolute top-0 bottom-0 right-0 w-24 sm:w-48 bg-gradient-to-l from-slate-50 via-slate-50/80 to-transparent z-20 pointer-events-none" />

        {/* Row 1: Sliding Continuously Left */}
        <div className="flex w-full overflow-hidden pause-on-hover">
          <div className="flex gap-6 marquee-track animate-scroll-left shrink-0">
            {topTrack.map((test, index) => (
              <motion.div
                key={`top-${index}`}
                className="w-[380px] sm:w-[420px] bg-white border border-slate-100 hover:border-brand-primary rounded-2xl p-6 transition-colors duration-300 flex flex-col justify-between shrink-0 cursor-pointer"
              >
                <div>
                  {/* Profile Header Row */}
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={test.avatar}
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
                  </div>

                  {/* Testimonial Core Content */}
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

        {/* Row 2: Sliding Continuously Right */}
        <div className="flex w-full overflow-hidden pause-on-hover">
          <div className="flex gap-6 marquee-track animate-scroll-right shrink-0">
            {bottomTrack.map((test, index) => (
              <motion.div
                key={`bottom-${index}`}
                className="w-[380px] sm:w-[420px] bg-white border border-slate-100 hover:border-brand-primary rounded-2xl p-6 transition-colors duration-300 flex flex-col justify-between shrink-0 cursor-pointer"
              >
                <div>
                  {/* Profile Header Row */}
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={test.avatar}
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
                  </div>

                  {/* Testimonial Core Content */}
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

      </div>
    </section>
  );
}

