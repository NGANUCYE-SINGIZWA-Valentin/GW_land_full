import React from 'react';
import { SearchBar } from '@/components/ui/SearchBar';

const DEFAULT_IMAGE = 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80';

type HeroVariant = 'home' | 'about' | 'contact';

const HEIGHT_CLASSES: Record<HeroVariant, string> = {
  home:    'min-h-[450px] md:h-[72vh] md:min-h-[680px] md:max-h-[750px]',
  about:   'min-h-[220px] md:h-[320px] md:min-h-[300px] md:max-h-[340px]',
  contact: 'min-h-[220px] md:h-[300px] md:min-h-[280px] md:max-h-[320px]',
};

// About/Contact heroes sit full-bleed behind the fixed, transparent-over-hero navbar,
// so they need extra top clearance the other sides don't (px/pb kept separate from pt
// so the two don't collide as competing Tailwind utilities).
const PADDING_CLASSES: Record<HeroVariant, string> = {
  home:    'p-6 md:p-16',
  about:   'px-6 pb-6 pt-24 md:px-10 md:pb-10 md:pt-28',
  contact: 'px-6 pb-6 pt-24 md:px-8 md:pb-8 md:pt-28',
};

const TEXT_MARGIN_CLASSES: Record<HeroVariant, string> = {
  home:    'mb-10',
  about:   'mb-4',
  contact: 'mb-2',
};

interface HeroSectionProps {
  /** URL de l'image de fond */
  image?: string;
  /** Titre principal — accepte du JSX (ex: <span> pour coloration) */
  title: React.ReactNode;
  /** Sous-titre */
  subtitle: string;
  /** Afficher la barre de recherche en dessous du texte */
  showSearchBar?: boolean;
  /** Variant de hauteur (home, about, contact) */
  variant?: HeroVariant;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  image = DEFAULT_IMAGE,
  title,
  subtitle,
  showSearchBar = false,
  variant = 'home',
}) => {
  return (
    <section id="hero" className={`relative w-full ${HEIGHT_CLASSES[variant]} flex flex-col justify-center items-center text-center ${PADDING_CLASSES[variant]} overflow-hidden`}>
      {/* 🎨 BACKGROUND UNIQUE FULL-SCREEN */}
      <div className="absolute inset-0 z-0">
        <img 
          src={image} 
          alt="Hero Background" 
          className="w-full h-full object-cover object-center"
        />
        
        {/* Étape A : L'overlay de coloration violette/indigo en mode multiply pour teinter le ciel et les textures */}
        <div className="absolute inset-0 bg-gradient-to-br from-brand-primary/25 via-brand-primary/10 to-brand-primary/5 mix-blend-multiply"></div>

        {/* Étape B : Un overlay assombri pour bien faire ressortir le texte centré */}
        <div className="absolute inset-0 bg-brand-primary/45"></div>
      </div>

      {/* 📝 CONTENU TEXTUEL EN BLANC PUR */}
      <div className={`relative z-10 max-w-3xl text-white ${TEXT_MARGIN_CLASSES[variant]} mx-auto`}>
        <h1 className="text-4xl md:text-5xl font-semibold leading-tight tracking-tight mb-4 antialiased drop-shadow-sm">
          {title}
        </h1>
        <p className="text-base text-white/90 leading-relaxed font-normal antialiased">
          {subtitle}
        </p>
      </div>

      {/* 🔍 BARRE DE RECHERCHE POSITIONNÉE (Style d'origine strictement conservé) */}
      {showSearchBar && (
        <div className="relative z-10 w-full flex justify-center">
          <SearchBar />
        </div>
      )}
    </section>
  );
};
