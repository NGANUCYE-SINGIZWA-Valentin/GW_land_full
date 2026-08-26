import React, { useEffect, useState } from 'react';
import { Heart } from 'lucide-react';
import { PropertyCard } from '@/components/ui/Card';
import * as favoritesApi from '@/api/favorites';
import { adaptListingSummary } from '@/utils/listingAdapters';
import type { Property } from '@/types/property';

export const BuyerFavorites: React.FC = () => {
  const [favorites, setFavorites] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    favoritesApi.getFavorites()
      .then((res) => setFavorites(res.favorites.map(adaptListingSummary)))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="p-1 sm:p-6 lg:p-8 bg-slate-50/50 min-h-screen w-full min-w-0 space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-slate-800">My Favorites</h2>
        <p className="text-sm text-slate-400 mt-0.5">Listings you've saved to revisit later.</p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-64 rounded-3xl bg-slate-100 animate-pulse" />
          ))}
        </div>
      ) : favorites.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
          <div className="w-11 h-11 rounded-full bg-slate-50 flex items-center justify-center mx-auto mb-3">
            <Heart size={18} className="text-slate-300" />
          </div>
          <p className="text-sm text-slate-400">No favorites yet — tap the heart on any listing to save it here.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {favorites.map((property) => (
            <PropertyCard key={property.id} property={property} />
          ))}
        </div>
      )}
    </div>
  );
};
