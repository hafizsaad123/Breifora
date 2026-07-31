import { motion } from 'motion/react';
import { Check, X, Layers, AlertCircle } from 'lucide-react';
import Logo from './Logo';
import { ScrollBlurHeading } from './ScrollBlurHeading';

interface MatrixRow {
  characteristic: string;
  brieforaValue: string;
  othersValue: string;
}

const matrixRows: MatrixRow[] = [
  {
    characteristic: "Target Objectives",
    brieforaValue: "Structured alignment modules",
    othersValue: "Endless back-and-forth lines"
  },
  {
    characteristic: "Client Onboarding",
    brieforaValue: "Zero-login friction",
    othersValue: "Friction-heavy platform signup"
  },
  {
    characteristic: "Strategy Generation",
    brieforaValue: "Automatic structured blueprint",
    othersValue: "Manual notes scattered everywhere"
  },
  {
    characteristic: "Design Testing",
    brieforaValue: "Interactive visual choices",
    othersValue: "Vague descriptive phrases"
  },
  {
    characteristic: "Brand Architecture",
    brieforaValue: "Core pillars map automatically",
    othersValue: "Lost inside unorganized text documents"
  },
  {
    characteristic: "Design Validation",
    brieforaValue: "Clear approval step before design",
    othersValue: "Immediate pixel pushing, guesswork"
  },
  {
    characteristic: "Deliverables Locked",
    brieforaValue: "Automated scope boundaries",
    othersValue: "Scope creep occurs mid-project"
  },
  {
    characteristic: "Client Perception",
    brieforaValue: "Ultra-elite professional authority",
    othersValue: "Generic freelance contractor vibe"
  }
];

export default function ComparisonMatrix() {
  return (
    <section className="py-20 bg-[#FBFBFF]" id="why-briefora">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Section */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-brand-primary/10 text-brand-primary text-xs font-semibold uppercase tracking-wider">
            Why Elite Designers Switch
          </span>
          <ScrollBlurHeading className="text-3xl sm:text-4xl font-semibold text-slate-900 tracking-tight leading-[1.12]">
            Stop Collecting Raw Data.<br />Start Extracting Creative Direction.
          </ScrollBlurHeading>
          <p className="text-slate-600 text-sm sm:text-base">
            Don't settle for basic form builders or messy email chains. Breifora is built specifically for creative client workflows.
          </p>
        </div>

        {/* Comparison Table Container */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.5 }}
          className="max-w-4xl mx-auto overflow-hidden bg-white rounded-2xl border border-slate-200"
        >
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[620.5px]">
              <thead>
                <tr className="bg-slate-50/70 border-b border-slate-100 text-slate-500 text-xs font-semibold uppercase tracking-wider">
                  <th className="py-5 px-6 font-semibold text-slate-500 w-[28%]">Comparison Feature</th>
                  <th className="py-5 px-6 font-semibold text-brand-primary text-center bg-brand-primary/5 uppercase tracking-widest w-[36%]">
                    <div className="inline-flex items-center gap-1.5 justify-center">
                      <Logo iconOnly iconSize={18} />
                      Breifora Platform
                    </div>
                  </th>
                  <th className="py-5 px-6 font-semibold text-slate-500 text-center w-[36%]">
                    <div className="inline-flex items-center gap-1.5 justify-center">
                      <AlertCircle className="w-4 h-4 text-slate-400" />
                      Standard Forms & Emails
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {matrixRows.map((row, index) => (
                  <tr key={index} className="hover:bg-slate-50/50 transition-colors">
                    {/* Characteristic column */}
                    <td className="py-4 px-6 font-semibold text-slate-900 text-xs uppercase sm:text-sm tracking-tight">
                      {row.characteristic}
                    </td>

                    {/* Briefora column with vibrant checkmarks */}
                    <td className="py-4 px-6 bg-brand-primary/2 flex-cell text-center">
                      <div className="flex items-center gap-2.5 justify-center text-xs font-semibold text-[#5956E9]">
                        <div className="w-5.5 h-5.5 rounded-full bg-[#EAE8FE] flex items-center justify-center text-brand-primary shrink-0 shadow-sm border border-brand-primary/15">
                          <Check className="w-3.5 h-3.5 stroke-[3.5]" />
                        </div>
                        <span className="text-slate-800 font-normal text-left">{row.brieforaValue}</span>
                      </div>
                    </td>

                    {/* standard other column with gray cancel labels */}
                    <td className="py-4 px-6 text-center">
                      <div className="flex items-center gap-2.5 justify-center text-xs text-slate-500">
                        <div className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 shrink-0">
                          <X className="w-3 h-3 stroke-[2.5]" />
                        </div>
                        <span className="text-slate-500 text-left">{row.othersValue}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
