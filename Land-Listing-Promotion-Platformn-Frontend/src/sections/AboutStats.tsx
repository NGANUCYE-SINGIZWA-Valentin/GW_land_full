import React from 'react';
import { Container } from '@/components/ui/Container';

const STATS = [
  { value: '10K+', label: 'Properties' },
  { value: '5K+', label: 'Happy Clients' },
  { value: '500+', label: 'Agents' },
];

export const AboutStats: React.FC = () => {
  return (
    <section id="about-gw-land">
      <Container>
        <div className="relative rounded-3xl p-8 md:p-12 overflow-hidden bg-gradient-to-b from-white via-white/35 to-white/3 border border-white/60 backdrop-blur-md shadow-[0_20px_50px_-12px_rgba(148,163,184,0.12)]">
          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            {/* Image */}
            <div className="rounded-3xl overflow-hidden h-64 sm:h-80 lg:h-full lg:min-h-[360px]">
              <img
                src="https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=1200&q=80"
                alt="Modern real estate interior"
                loading="lazy"
                className="w-full h-full object-cover"
              />
            </div>

            {/* Text + Stats */}
            <div>
              <h2 className="text-2xl font-semibold text-brand-text mb-4">
                About <span className="text-brand-primary">GW Land</span>
              </h2>
              <p className="text-gray-500 text-sm leading-relaxed mb-8">
                GW Land is Rwanda's trusted real estate marketplace, connecting buyers, sellers, and
                investors with verified homes, land, and commercial properties across Kigali and beyond.
                Our platform combines local market expertise with a modern, transparent buying experience.
              </p>

              <div className="grid grid-cols-3 gap-4">
                {STATS.map((s) => (
                  <div key={s.label} className="text-center sm:text-left">
                    <p className="text-2xl sm:text-3xl font-bold text-brand-primary">{s.value}</p>
                    <p className="text-xs sm:text-sm text-gray-500 mt-1">{s.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
};
