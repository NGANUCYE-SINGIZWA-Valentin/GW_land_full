import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { SearchBar } from '@/components/ui/SearchBar';
import { Container } from '@/components/ui/Container';
import { useAuth } from '@/components/auth';

// High-quality real estate photography: modern house, luxury villa, apartment building,
// commercial/office tower, and a premium residential exterior.
const SLIDES = [
  {
    image: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1920&q=80',
    alt: 'Modern house exterior',
  },
  {
    image: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1920&q=80',
    alt: 'Luxury villa with pool',
  },
  {
    image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1920&q=80',
    alt: 'Modern apartment building',
  },
  {
    image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1920&q=80',
    alt: 'Commercial office building',
  },
  {
    image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1920&q=80',
    alt: 'Premium residential property',
  },
];

const AUTOPLAY_INTERVAL_MS = 5000;

export const HeroSlider: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { isAuthenticated } = useAuth();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const slideCount = SLIDES.length;

  const handleSubmitProperty = () => {
    navigate(isAuthenticated ? '/dashboard/properties/new' : '/register');
  };

  // Wrap-around so autoplay loops indefinitely.
  const goToNext = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % slideCount);
  }, [slideCount]);

  // Autoplay: advances every 5s, paused while the pointer is over the slider.
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  useEffect(() => {
    if (isHovered) return;
    intervalRef.current = setInterval(goToNext, AUTOPLAY_INTERVAL_MS);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isHovered, currentIndex, goToNext]);

  return (
    <section
      id="hero-slider"
      className="relative w-full min-h-[560px] md:h-[85vh] md:min-h-[720px] md:max-h-[860px] overflow-hidden"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Slides: all stacked and cross-faded via opacity, so no layout shift occurs */}
      {SLIDES.map((slide, index) => (
        <img
          key={slide.image}
          src={slide.image}
          alt={slide.alt}
          loading={index === 0 ? 'eager' : 'lazy'}
          className={`absolute inset-0 w-full h-full object-cover object-center transition-opacity duration-1000 ease-in-out ${
            index === currentIndex ? 'opacity-100' : 'opacity-0'
          }`}
        />
      ))}

      {/* Tint + darken overlay so the white headline stays readable on any photo */}
      <div className="absolute inset-0 bg-gradient-to-br from-brand-primary/20 via-brand-primary/10 to-brand-primary/10 mix-blend-multiply" />
      <div className="absolute inset-0 bg-brand-primary/50" />

      {/* Content: headline, description, CTAs — centered; search bar centered below */}
      <div className="relative z-10 flex flex-col justify-center h-full pt-28 pb-16 md:pt-32 md:pb-16 gap-10">
        <Container className="w-full">
          <div className="max-w-2xl mx-auto text-white text-center">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-semibold leading-tight tracking-tight mb-4 antialiased drop-shadow-sm">
              {t('home.heroTitle')}
            </h1>
            <p className="text-base sm:text-lg text-white/90 leading-relaxed font-normal antialiased max-w-xl mx-auto mb-8">
              {t('home.heroSubtitle')}
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                to="/properties"
                className="w-full sm:w-auto text-center px-8 py-3.5 rounded-full bg-white text-brand-primary font-semibold text-sm shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all duration-300"
              >
                {t('home.exploreProperties')}
              </Link>
              <button
                type="button"
                onClick={handleSubmitProperty}
                className="w-full sm:w-auto px-8 py-3.5 rounded-full border border-white/70 text-white font-semibold text-sm hover:bg-white/10 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300"
              >
                {t('home.submitProperty')}
              </button>
            </div>
          </div>
        </Container>

        <div className="w-full max-w-7xl mx-auto flex justify-center px-4 sm:px-6 lg:px-8">
          <SearchBar />
        </div>
      </div>
    </section>
  );
};
