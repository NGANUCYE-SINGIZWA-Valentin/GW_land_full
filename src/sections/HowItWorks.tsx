import React from 'react';
import { Container } from '@/components/ui/Container';
import { Search, Calendar, MessageSquare, Key, ChevronRight, ChevronDown } from 'lucide-react';

export const HowItWorks: React.FC = () => {
  const steps = [
    {
      num: '1',
      title: 'Search Properties',
      desc: 'Browse hundreds of verified homes, land plots, and commercial spots with advanced filters.',
      icon: Search,
      color: 'text-blue-600 bg-blue-50 border-blue-100',
    },
    {
      num: '2',
      title: 'Book Visit',
      desc: 'Schedule a physical or virtual property viewing with a trusted agent at your convenience.',
      icon: Calendar,
      color: 'text-amber-600 bg-amber-50 border-amber-100',
    },
    {
      num: '3',
      title: 'Negotiate',
      desc: 'Interact with verified sellers directly to align on terms, secure pricing, and close deals.',
      icon: MessageSquare,
      color: 'text-indigo-600 bg-indigo-50 border-indigo-100',
    },
    {
      num: '4',
      title: 'Own Property',
      desc: 'Sign contracts, securely complete your transactions, and receive the keys to your new space.',
      icon: Key,
      color: 'text-emerald-600 bg-emerald-50 border-emerald-100',
    },
  ];

  return (
    <section id="how-it-works" className="py-8">
      <Container>
        <div className="relative z-10 text-center mb-12">
          <span className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-brand-accent">
            Process Flow
          </span>
          <h2 className="text-3xl font-bold text-slate-900 mt-2">
            How It Works
          </h2>
          <p className="text-slate-500 text-sm mt-2 max-w-md mx-auto">
            Follow our simple, secure, and transparent steps to finding and owning your next property.
          </p>
        </div>

        <div className="relative z-10 flex flex-col lg:flex-row items-start justify-between gap-8 max-w-6xl mx-auto">
          {steps.map((step, idx) => (
            <React.Fragment key={idx}>
              {/* Step Card */}
              <div className="flex-1 flex flex-col items-center text-center p-6 bg-white rounded-2xl border border-slate-100 shadow-[0_10px_30px_rgba(15,23,42,0.02)] group hover:shadow-[0_20px_40px_rgba(15,23,42,0.06)] hover:-translate-y-1 transition-all duration-300 w-full relative">
                
                {/* Number Badge */}
                <span className="absolute top-4 left-4 text-xs font-bold text-slate-400 bg-slate-50 border border-slate-100 rounded-full h-6 w-6 flex items-center justify-center">
                  {step.num}
                </span>

                {/* Icon */}
                <div className={`p-4 rounded-full border mb-4 group-hover:scale-115 transition-transform duration-300 ${step.color}`}>
                  <step.icon size={26} strokeWidth={1.5} />
                </div>

                {/* Details */}
                <h3 className="text-base font-bold text-slate-800 mb-2">
                  {step.title}
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed max-w-[200px]">
                  {step.desc}
                </p>
              </div>

              {/* Arrow Connector (Hidden after the last step) */}
              {idx < steps.length - 1 && (
                <div className="flex shrink-0 items-center justify-center self-center py-2 lg:py-0 text-slate-300">
                  <ChevronRight size={24} className="hidden lg:block transform group-hover:translate-x-1 transition-transform" />
                  <ChevronDown size={24} className="lg:hidden" />
                </div>
              )}
            </React.Fragment>
          ))}
        </div>
      </Container>
    </section>
  );
};