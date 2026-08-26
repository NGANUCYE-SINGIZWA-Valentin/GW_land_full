import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Container } from '@/components/ui/Container';
import { Check, ArrowRight } from 'lucide-react';
import { motion, useMotionValue, useTransform, animate, useInView } from 'framer-motion';

const AnimatedCounter: React.FC<{ value: number; suffix?: string }> = ({ value, suffix = '' }) => {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: '-50px' });

  useEffect(() => {
    if (inView && ref.current) {
      const controls = animate(0, value, {
        duration: 1.5,
        ease: 'easeOut',
        onUpdate: (latest) => {
          if (ref.current) {
            ref.current.textContent = Math.round(latest).toLocaleString() + suffix;
          }
        },
      });
      return () => controls.stop();
    }
  }, [value, suffix, inView]);

  return (
    <span ref={ref} className="text-3xl sm:text-4xl font-extrabold text-brand-primary">
      0{suffix}
    </span>
  );
};

export const WhyChooseUs: React.FC = () => {
  const features = [
    'Verified Listings',
    'Trusted Properties',
    'Transparent Pricing',
    'Secure Transactions',
  ];

  const stats = [
    { value: 10, suffix: 'K+', label: 'Verified Properties' },
    { value: 5, suffix: 'K+', label: 'Happy Clients' },
    { value: 98, suffix: '%', label: 'Customer Satisfaction' },
  ];

  return (
    <section id="why-choose-us" className="py-8">
      <Container>
        <div className="relative rounded-3xl p-8 md:p-12 overflow-hidden bg-gradient-to-b from-white via-white/35 to-white/3 border border-white/60 backdrop-blur-md shadow-[0_20px_50px_-12px_rgba(148,163,184,0.12)]">
          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-12">
            
            {/* Left side: Premium Image */}
            <div className="rounded-3xl overflow-hidden h-[300px] sm:h-[400px] lg:h-[480px] shadow-lg relative group">
              <img
                src="https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=1200&q=80"
                alt="Premium real estate exterior"
                loading="lazy"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/30 via-transparent to-transparent" />
            </div>

            {/* Right side: Text details */}
            <div className="flex flex-col justify-center">
              <span className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-brand-accent mb-3">
                Why Choose GW Land
              </span>
              <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 leading-tight mb-4">
                Trusted Real Estate Marketplace in Rwanda
              </h2>
              <p className="text-slate-500 text-sm leading-relaxed mb-6">
                GW Land connects buyers, sellers, and investors with verified properties through a trusted and transparent platform.
              </p>

              {/* Grid of features */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 mb-8">
                {features.map((feature, idx) => (
                  <div key={idx} className="flex items-center gap-2.5">
                    <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                      <Check size={12} strokeWidth={3} />
                    </div>
                    <span className="text-sm font-semibold text-slate-700">{feature}</span>
                  </div>
                ))}
              </div>

              <div>
                <Link
                  to="/about"
                  className="inline-flex items-center justify-center gap-2 bg-brand-primary text-white font-bold text-sm px-6 py-3.5 rounded-full hover:bg-brand-primary-hover hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 shadow-md cursor-pointer"
                >
                  Learn More
                  <ArrowRight size={16} />
                </Link>
              </div>
            </div>
          </div>

          {/* Animated Statistics */}
          <div className="relative z-10 pt-8 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-3 gap-8">
            {stats.map((s, idx) => (
              <div key={idx} className="text-center p-4 bg-slate-50/50 rounded-2xl border border-slate-50/80">
                <p className="text-3xl sm:text-4xl font-extrabold text-brand-primary">
                  <AnimatedCounter value={s.value} suffix={s.suffix} />
                </p>
                <p className="text-xs sm:text-sm text-slate-400 font-semibold mt-2 uppercase tracking-wider">
                  {s.label}
                </p>
              </div>
            ))}
          </div>

        </div>
      </Container>
    </section>
  );
};
