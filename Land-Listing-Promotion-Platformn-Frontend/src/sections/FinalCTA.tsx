import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Container } from '@/components/ui/Container';
import { ArrowRight } from 'lucide-react';
import { useAuth } from '@/components/auth';

export const FinalCTA: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const handleListProperty = () => {
    navigate(isAuthenticated ? '/dashboard/properties/new' : '/register');
  };

  return (
    <section id="explore" className="py-8">
      <Container>
        <div className="relative rounded-3xl overflow-hidden min-h-[380px] flex items-center justify-center p-8 md:p-16 text-center text-white shadow-xl bg-slate-950">
          {/* Background Image */}
          <img
            src="https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1920&q=80"
            alt="Luxury property background"
            className="absolute inset-0 w-full h-full object-cover opacity-45 scale-100 group-hover:scale-102 transition-transform duration-[2000ms]"
          />

          {/* Dark Overlay with subtle color tint */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/60 to-slate-950/70" />

          {/* Inner Content */}
          <div className="relative z-10 max-w-2xl mx-auto flex flex-col items-center">
            <span className="text-[10px] font-extrabold tracking-widest uppercase text-brand-accent bg-white/10 px-3 py-1 rounded-md mb-6">
              Get Started
            </span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight mb-4 drop-shadow-sm">
              Ready to Find Your Dream Property?
            </h2>
            <p className="text-sm sm:text-base text-slate-200 mb-8 max-w-md font-medium leading-relaxed drop-shadow-sm">
              Browse thousands of verified listings across Rwanda. Let us help you buy, sell, or rent with trust.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto">
              <Link
                to="/properties"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-brand-primary text-white font-bold text-sm px-8 py-4 rounded-full hover:bg-brand-primary-hover hover:scale-[1.03] active:scale-[0.98] transition-all duration-300 shadow-md cursor-pointer"
              >
                Explore Properties
                <ArrowRight size={16} />
              </Link>
              <button
                type="button"
                onClick={handleListProperty}
                className="w-full sm:w-auto inline-flex items-center justify-center bg-white text-slate-900 font-bold text-sm px-8 py-4 rounded-full hover:bg-slate-50 hover:scale-[1.03] active:scale-[0.98] transition-all duration-300 shadow-md cursor-pointer"
              >
                List Your Property
              </button>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
};
