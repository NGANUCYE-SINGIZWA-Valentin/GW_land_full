import React from 'react';
import { Button } from '@/components/ui/Button';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export const ExploreBanner: React.FC = () => {
  return (
    <section id="explore" className="relative w-full overflow-hidden bg-white border-y border-slate-200">
      
      {/* 🌟 EFFETS DE DEGRADES - fond global */}
      <div className="absolute left-0 top-0 w-full h-full bg-gradient-to-br from-brand-primary/5 to-brand-primary/10 pointer-events-none z-0"></div>

      {/* Fond dégradé pour la zone image (droite) - pleine largeur */}
      <div className="hidden lg:block absolute right-0 top-0 w-[45%] h-full bg-gradient-to-bl from-brand-primary/5 to-transparent pointer-events-none z-0"></div>

      {/* Conteneur interne max-width pour contraindre les enfants */}
      <div className="relative z-10 w-full max-w-7xl mx-auto flex flex-col lg:flex-row items-stretch">

        {/* Contenu textuel & Actions (Gauche) */}
        <div className="flex-1 px-6 sm:px-12 md:px-20 py-10 md:py-14 flex flex-col justify-center">

          {/* Titre réorienté uniquement pour l'achat (Buyers) */}
          <h2 className="text-xl sm:text-3xl md:text-4xl font-semibold leading-[1.15] mb-6 text-slate-900 tracking-tight">
            Ready to find your perfect property? <br className="hidden lg:block"/>
            <span className="text-brand-primary">
              Start your journey today.
            </span>
          </h2>
          
          {/* Description réorientée uniquement pour l'achat (Buyers) */}
          <p className="text-sm text-slate-600 mb-10 max-w-xl leading-relaxed">
            Discover premium plots of land to build your future, modern turnkey villas, 
            and exclusive residential properties across Rwanda's most sought-after locations. 
            Our local experts are ready to guide you to your ideal investment.
          </p>

          <div className="flex flex-col sm:flex-row flex-wrap gap-4 sm:gap-5">
            <Link to="/properties">
              <Button variant="primary" className="w-full sm:w-auto group px-8 py-4 text-base rounded-2xl transition-all duration-300">
                Explore Properties
                <ArrowRight size={18} className="transform group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </div>
        </div>

        {/* 🏡 ILLUSTRATION (Droite) */}
        <div className="w-full lg:w-[45%] min-h-[300px] sm:min-h-[400px] lg:min-h-full p-8 lg:p-12 flex items-center justify-center">
          <div className="w-full h-full rounded-3xl overflow-hidden bg-gray-100">
            <img
              src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80"
              alt="Modern Real Estate in Rwanda"
              loading="lazy"
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
            />
          </div>
        </div>
      </div>
    </section>
  );
};