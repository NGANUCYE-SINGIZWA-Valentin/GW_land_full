import { apiRequest } from './client';
import type { ListingDetail, ListingSummary, MyListing, PaginatedListings } from './types';

export interface PublicListingsQuery {
  page?: number;
  limit?: number;
  district_id?: number;
  sector_id?: number;
  min_price?: number;
  max_price?: number;
  min_size?: number;
  max_size?: number;
  size_unit?: string;
  featured?: boolean;
  q?: string;
}

export function getPublicListings(query: PublicListingsQuery = {}) {
  return apiRequest<PaginatedListings<ListingSummary>>('/listings', { query });
}

export function getListingBySlug(slug: string) {
  return apiRequest<{ listing: ListingDetail }>(`/listings/${slug}`);
}

export function getMyListings() {
  return apiRequest<{ listings: MyListing[] }>('/listings/mine', { auth: true });
}

export interface CreateListingPayload {
  title: string;
  description: string;
  district_id: number;
  sector_id: number;
  latitude?: number;
  longitude?: number;
  price_rwf?: number;
  price_usd?: number;
  size_value: number;
  size_unit: 'sqm' | 'hectare';
  upi?: string;
  tenure_type?: 'freehold' | 'leasehold' | 'customary';
  land_use?: 'residential' | 'commercial' | 'agricultural' | 'mixed';
  has_road_access?: boolean;
  has_water?: boolean;
  has_electricity?: boolean;
  images: File[];
  documents?: File[];
}

export function createListing(payload: CreateListingPayload) {
  const formData = new FormData();
  formData.append('title', payload.title);
  formData.append('description', payload.description);
  formData.append('district_id', String(payload.district_id));
  formData.append('sector_id', String(payload.sector_id));
  if (payload.latitude !== undefined) formData.append('latitude', String(payload.latitude));
  if (payload.longitude !== undefined) formData.append('longitude', String(payload.longitude));
  if (payload.price_rwf !== undefined) formData.append('price_rwf', String(payload.price_rwf));
  if (payload.price_usd !== undefined) formData.append('price_usd', String(payload.price_usd));
  formData.append('size_value', String(payload.size_value));
  formData.append('size_unit', payload.size_unit);
  if (payload.upi) formData.append('upi', payload.upi);
  if (payload.tenure_type) formData.append('tenure_type', payload.tenure_type);
  if (payload.land_use) formData.append('land_use', payload.land_use);
  if (payload.has_road_access !== undefined) formData.append('has_road_access', String(payload.has_road_access));
  if (payload.has_water !== undefined) formData.append('has_water', String(payload.has_water));
  if (payload.has_electricity !== undefined) formData.append('has_electricity', String(payload.has_electricity));
  payload.images.forEach((file) => formData.append('images', file));
  (payload.documents || []).forEach((file) => formData.append('documents', file));

  return apiRequest<{ listing: MyListing; images_uploaded: number; documents_uploaded: number; message: string }>(
    '/listings',
    { method: 'POST', auth: true, formData }
  );
}

export interface UpdateListingPayload {
  title?: string;
  description?: string;
  price_rwf?: number;
  price_usd?: number;
  size_value?: number;
  size_unit?: 'sqm' | 'hectare';
}

export function updateListing(id: string, payload: UpdateListingPayload) {
  return apiRequest<{ listing: MyListing; message: string }>(`/listings/${id}`, {
    method: 'PUT',
    auth: true,
    body: payload,
  });
}

export function deleteListing(id: string) {
  return apiRequest<{ message: string }>(`/listings/${id}`, { method: 'DELETE', auth: true });
}

export function markListingSold(id: string) {
  return apiRequest<{ listing: MyListing }>(`/listings/${id}/sold`, { method: 'PATCH', auth: true });
}
