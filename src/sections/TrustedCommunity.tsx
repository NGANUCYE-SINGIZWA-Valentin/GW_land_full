import React from 'react';
import { Container } from '@/components/ui/Container';
import { Star, ShieldCheck, Heart } from 'lucide-react';

interface SuccessStory {
  name: string;
  role: string;
  avatar: string;
  rating: number;
  story: string;
}

export const TrustedCommunity: React.FC = () => {
  const stories: SuccessStory[] = [
    {
      name: 'Marie Claire',
      role: 'Homeowner, Kigali',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80',
      rating: 5,
      story: 'GW Land helped me find a verified home easily.',
    },
    {
      name: 'David Kayitare',
      role: 'Investor, Kigali',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
      rating: 5,
      story: 'GW Land has made purchasing verified land plots in Rwanda secure and transparent.',
    },
    {
      name: 'Alain Nshuti',
      role: 'Tenant, Kigali',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
      rating: 5,
      story: 'The platform search filters made finding our office space extremely simple.',
    },
  ];

  return (
    <section id="trust-community" className="py-8 bg-slate-50/50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 transition-colors duration-300">
      <Container>
        <div className="relative z-10 text-center mb-12">
          <span className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-brand-accent">
            Community & Trust
          </span>
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white mt-2">
            Trusted by Property Seekers Across Rwanda
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-2 max-w-lg mx-auto">
            We connect buyers, sellers, and tenants with verified property listings in Kigali and beyond.
          </p>
        </div>

        {/* Success Stories Grid */}
        <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-8">
          {stories.map((s, idx) => (
            <div
              key={idx}
              className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-[0_10px_30px_rgba(15,23,42,0.03)] hover:shadow-[0_20px_40px_rgba(15,23,42,0.06)] hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-0.5 text-amber-400">
                    {Array.from({ length: s.rating }).map((_, i) => (
                      <Star key={i} size={14} className="fill-amber-400" />
                    ))}
                  </div>
                  <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 px-2.5 py-1 rounded-full">
                    <ShieldCheck size={11} /> Verified Buyer
                  </span>
                </div>
                <p className="text-slate-600 dark:text-slate-300 text-sm italic leading-relaxed mb-6">
                  "{s.story}"
                </p>
              </div>

              <div className="flex items-center gap-3.5 pt-4 border-t border-slate-50 dark:border-slate-850">
                <img
                  src={s.avatar}
                  alt=""
                  loading="lazy"
                  className="w-12 h-12 rounded-full object-cover shadow-sm"
                />
                <div>
                  <h4 className="text-sm font-bold text-slate-800 dark:text-slate-250">{s.name}</h4>
                  <p className="text-xs text-slate-400 dark:text-slate-500 font-semibold">{s.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
};
