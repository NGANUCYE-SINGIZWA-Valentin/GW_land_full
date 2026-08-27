import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { PropertyCard } from '../components/ui/Card';
import { Container } from '@/components/ui/Container';
import { ArrowRight } from 'lucide-react';
import { ScrollReveal } from '@/components/ui/ScrollReveal';
import * as listingsApi from '@/api/listings';
import { adaptListingSummary } from '@/utils/listingAdapters';
import type { Property } from '@/types/property';

export const FeaturedListings: React.FC = () => {
  const { t } = useTranslation();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    listingsApi
      .getPublicListings({ featured: true, limit: 9 })
      .then((res) => !cancelled && setProperties(res.listings.map(adaptListingSummary)))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, []);

  if (!loading && properties.length === 0) return null;

  return (
    <section id="featured" className="pt-12 pb-6 bg-gradient-to-b from-slate-50/90 via-[#54B5BB]/5 to-slate-50/90 dark:from-slate-950 dark:via-slate-950 dark:to-slate-900 text-slate-900 dark:text-slate-100 transition-colors duration-300">
      <Container>
        <ScrollReveal>
          <div className="relative z-10 text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white mt-2 tracking-tight">
              {t('home.featuredListings')}
            </h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-2 max-w-md mx-auto">{t('home.featuredSubtitle')}</p>
          </div>
        </ScrollReveal>

        {/* Grille des propriétés */}
        <div className="relative z-10 grid grid-cols-2 gap-3 sm:gap-6 md:grid-cols-2 lg:grid-cols-3">
          {loading
            ? Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-64 animate-pulse rounded-3xl bg-slate-200/70 dark:bg-slate-800/60" />
              ))
            : (properties || []).slice(0, 9).map((prop, idx) => (
                <ScrollReveal key={prop.id} delay={idx * 75}>
                  <PropertyCard property={prop} />
                </ScrollReveal>
              ))}
        </div>

        {/* Button below the grid */}
        <div className="flex justify-center mt-8">
          <Link to="/properties?featured=true">
            <button className="group flex items-center justify-center gap-2 bg-brand-primary text-white hover:bg-brand-primary-hover hover:shadow-[0_10px_25px_-5px_rgba(27,57,95,0.4)] hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.99] transition-all duration-300 font-extrabold text-sm px-9 py-4 rounded-full cursor-pointer shadow-md">
              {t('properties.viewAllProperties')}
              <ArrowRight
                size={16}
                className="transform group-hover:translate-x-1 transition-transform duration-300"
              />
            </button>
          </Link>
        </div>
      </Container>
    </section>
  );
};
