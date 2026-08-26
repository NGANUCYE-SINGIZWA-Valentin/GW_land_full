import { apiRequest } from './client';
import type { ReportReasonCategory } from './types';

export interface ContactPayload {
  listing_id?: string;
  sender_name: string;
  sender_email: string;
  sender_phone?: string;
  message_body: string;
}

export function sendContactForm(payload: ContactPayload) {
  return apiRequest<{ message: string }>('/contact', { method: 'POST', body: payload });
}

export function reportListing(
  listingId: string,
  reason_category: ReportReasonCategory,
  reason?: string,
  reporter_email?: string
) {
  return apiRequest<{ message: string }>(`/listings/${listingId}/report`, {
    method: 'POST',
    body: { reason_category, reason, reporter_email },
  });
}

export function subscribeNewsletter(email: string) {
  return apiRequest<{ message: string }>('/newsletter', { method: 'POST', body: { email } });
}

export interface SellerStats {
  total_listings: number;
  pending: number;
  approved: number;
  sold: number;
  rejected: number;
  total_views: number;
  top_listings: { id: string; title: string; slug: string; view_count: number }[];
}

export function getMyListingStats() {
  return apiRequest<SellerStats>('/listings/mine/stats', { auth: true });
}
