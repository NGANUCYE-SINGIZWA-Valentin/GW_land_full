import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { useAuth } from '@/components/auth/AuthContext';
import * as favoritesApi from '@/api/favorites';

interface FavoritesContextValue {
  favoriteIds: Set<string>;
  isFavorited: (listingId: string) => boolean;
  toggleFavorite: (listingId: string) => Promise<void>;
}

const FavoritesContext = createContext<FavoritesContextValue | undefined>(undefined);

export const FavoritesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, user } = useAuth();
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'Buyer') {
      setFavoriteIds(new Set());
      return;
    }
    favoritesApi.getFavorites()
      .then((res) => setFavoriteIds(new Set(res.favorites.map((f) => f.id))))
      .catch(() => {});
  }, [isAuthenticated, user?.role]);

  const isFavorited = useCallback((listingId: string) => favoriteIds.has(listingId), [favoriteIds]);

  const toggleFavorite = useCallback(async (listingId: string) => {
    const wasFavorited = favoriteIds.has(listingId);
    // Optimistic update — feels instant, reverted below if the request fails.
    setFavoriteIds((prev) => {
      const next = new Set(prev);
      wasFavorited ? next.delete(listingId) : next.add(listingId);
      return next;
    });
    try {
      if (wasFavorited) await favoritesApi.removeFavorite(listingId);
      else await favoritesApi.addFavorite(listingId);
    } catch {
      setFavoriteIds((prev) => {
        const next = new Set(prev);
        wasFavorited ? next.add(listingId) : next.delete(listingId);
        return next;
      });
    }
  }, [favoriteIds]);

  return (
    <FavoritesContext.Provider value={{ favoriteIds, isFavorited, toggleFavorite }}>
      {children}
    </FavoritesContext.Provider>
  );
};

export const useFavorites = () => {
  const ctx = useContext(FavoritesContext);
  if (!ctx) throw new Error('useFavorites must be used within a FavoritesProvider');
  return ctx;
};
