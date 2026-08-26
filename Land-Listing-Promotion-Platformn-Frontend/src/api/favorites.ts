import { apiRequest } from './client';
import type { ListingSummary } from './types';

export interface FavoriteListing extends ListingSummary {
  favorited_at: string;
}

export function getFavorites() {
  return apiRequest<{ favorites: FavoriteListing[] }>('/favorites', { auth: true });
}

export function addFavorite(listingId: string) {
  return apiRequest<{ message: string }>('/favorites', {
    method: 'POST',
    auth: true,
    body: { listing_id: listingId },
  });
}

export function removeFavorite(listingId: string) {
  return apiRequest<{ message: string }>(`/favorites/${listingId}`, {
    method: 'DELETE',
    auth: true,
  });
}
