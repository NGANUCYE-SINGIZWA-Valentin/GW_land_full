import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Container } from '@/components/ui/Container';
import { ScrollReveal } from '@/components/ui/ScrollReveal';

export const CallbackSection: React.FC = () => {
  return (
    <section 
      id="request-callback" 
      className="py-16 bg-slate-50 dark:bg-slate-950 relative overflow-hidden border-t border-slate-100 dark:border-slate-800 transition-colors duration-300"
    >
      {/* Decorative brand blur shapes */}
      <div className="absolute top-1/2 left-1/4 w-80 h-80 bg-brand-primary/10 rounded-full filter blur-3xl -translate-y-1/2" />
      <div className="absolute top-1/2 right-1/4 w-80 h-80 bg-brand-secondary/10 rounded-full filter blur-3xl -translate-y-1/2" />

      <Container className="relative z-10 px-4 sm:px-6">
        <ScrollReveal>
          <div className="max-w-4xl mx-auto bg-brand-primary text-white rounded-3xl p-8 sm:p-10 border border-brand-primary/50 shadow-2xl flex flex-col md:flex-row md:items-center md:justify-between gap-6 text-left">
            
            <div className="flex-1">
              <div className="inline-flex items-center bg-white/10 px-3.5 py-1 rounded-full text-white text-[9px] sm:text-[10px] font-extrabold uppercase tracking-wider mb-3">
                Professional Support
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mb-2 leading-tight">
                Need Property Assistance?
              </h2>
              <p className="text-white/80 text-xs sm:text-sm font-semibold max-w-xl leading-relaxed">
                Connect with our real estate experts today.
              </p>
            </div>

            <div className="shrink-0 w-full md:w-auto">
              <Link to="/contact" className="w-full sm:w-auto">
                <button className="group w-full md:w-auto flex items-center justify-center gap-2 bg-brand-secondary text-white hover:bg-brand-secondary-hover hover:shadow-[0_8px_20px_-4px_rgba(84,181,187,0.45)] hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.99] transition-all duration-300 font-extrabold text-xs sm:text-sm px-8 py-3.5 rounded-full cursor-pointer shadow-md">
                  Contact Us
                  <ArrowRight size={15} className="transform group-hover:translate-x-1 transition-transform duration-300" />
                </button>
              </Link>
            </div>

          </div>
        </ScrollReveal>
      </Container>
    </section>
  );
};
