import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { PropertyCard } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Container } from '@/components/ui/Container';
import { ArrowRight } from 'lucide-react';
import * as listingsApi from '@/api/listings';
import { adaptListingSummary } from '@/utils/listingAdapters';
import type { Property } from '@/types/property';

export const LatestListings: React.FC = () => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    listingsApi
      .getPublicListings({ limit: 8 })
      .then((res) => !cancelled && setProperties(res.listings.map(adaptListingSummary)))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, []);

  if (!loading && properties.length === 0) return null;

  return (
    <section id="recent">
      <Container>
        <div className="relative rounded-[2.5rem] p-8 md:p-12 overflow-hidden bg-gradient-to-b from-white via-white/35 to-white/3">
          <div className="relative z-10 flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4 mb-10">
            <div>
              <h2 className="text-2xl font-semibold text-brand-text">
                Explore <span className="text-brand-primary">Latest</span> Listings
              </h2>
              <p className="text-gray-400 text-sm mt-1">
                The newest properties freshly added to the market.
              </p>
            </div>

            <div className="shrink-0">
              <Link to="/properties">
                <Button variant="outline" className="group w-full sm:w-auto">
                  View All New Properties{' '}
                  <ArrowRight
                    size={16}
                    className="transform group-hover:translate-x-1 transition-transform"
                  />
                </Button>
              </Link>
            </div>
          </div>

          <div className="relative z-10 grid grid-cols-2 gap-3 sm:gap-6 lg:grid-cols-4">
            {loading
              ? Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="h-64 animate-pulse rounded-3xl bg-slate-200/70" />
                ))
              : properties.slice(0, 8).map((property) => (
                  <PropertyCard key={property.id} property={property} variant="public" />
                ))}
          </div>
        </div>
      </Container>
    </section>
  );
};
