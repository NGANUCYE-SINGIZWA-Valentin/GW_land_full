import React from 'react';
import { Container } from '@/components/ui/Container';
import { SlidersHorizontal, MessageCircle, PlusCircle, TrendingUp } from 'lucide-react';

export const EverythingYouNeed: React.FC = () => {
  const features = [
    {
      icon: SlidersHorizontal,
      title: 'Browse & Filter',
      desc: 'Search properties easily using advanced filters.',
      color: 'bg-blue-50 text-blue-600 border-blue-100',
    },
    {
      icon: MessageCircle,
      title: 'Contact Sellers',
      desc: 'Connect with verified sellers and property owners.',
      color: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    },
    {
      icon: PlusCircle,
      title: 'List Property',
      desc: 'Publish your property and reach potential buyers.',
      color: 'bg-amber-50 text-amber-600 border-amber-100',
    },
    {
      icon: TrendingUp,
      title: 'Promote Listings',
      desc: "Increase your property's visibility.",
      color: 'bg-rose-50 text-rose-600 border-rose-100',
    },
  ];

  return (
    <section id="everything-you-need" className="py-8">
      <Container>
        <div className="relative rounded-3xl p-8 md:p-12 overflow-hidden bg-gradient-to-b from-white via-white/35 to-white/3 border border-white/60 backdrop-blur-md shadow-[0_20px_50px_-12px_rgba(148,163,184,0.12)]">
          
          <div className="relative z-10 text-center mb-10">
            <span className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-brand-accent">
              Core Capabilities
            </span>
            <h2 className="text-3xl font-bold text-slate-900 mt-2">
              Everything You Need
            </h2>
            <p className="text-slate-500 text-sm mt-2 max-w-md mx-auto">
              All the tools and resources you need to rent, buy, list, or advertise properties in Rwanda.
            </p>
          </div>

          <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((item, index) => (
              <div
                key={index}
                className="bg-white p-6 rounded-2xl border border-slate-100 shadow-[0_10px_25px_rgba(15,23,42,0.02)] flex flex-col items-center text-center group hover:shadow-[0_20px_40px_rgba(15,23,42,0.06)] hover:-translate-y-1 transition-all duration-300"
              >
                <div className={`p-4 rounded-full border mb-4 group-hover:scale-110 transition-transform duration-300 ${item.color}`}>
                  <item.icon size={26} strokeWidth={1.5} />
                </div>
                <h3 className="text-base font-bold text-slate-800 mb-2">{item.title}</h3>
                <p className="text-xs text-slate-400 font-medium leading-relaxed max-w-[200px]">{item.desc}</p>
              </div>
            ))}
          </div>

        </div>
      </Container>
    </section>
  );
};
