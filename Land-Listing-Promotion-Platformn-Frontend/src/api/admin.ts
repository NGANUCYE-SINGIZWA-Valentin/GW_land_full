import { apiRequest } from './client';
import type {
  AdminListing,
  AdminNotification,
  Analytics,
  BackendUser,
  PaginatedListings,
  Report,
  AdminConversation,
  Message,
  ActivityEntry,
  AdminPayment,
  RevenueSummary,
  PlanKey,
} from './types';

export function getAllListings(status?: string, page = 1, limit = 50) {
  return apiRequest<PaginatedListings<AdminListing>>('/admin/listings', {
    auth: true,
    query: { status, page, limit },
  });
}

export function approveListing(id: string) {
  return apiRequest<{ listing: AdminListing; message: string }>(`/admin/listings/${id}/approve`, {
    method: 'PATCH',
    auth: true,
  });
}

export function rejectListing(id: string, reason: string) {
  return apiRequest<{ listing: AdminListing; message: string }>(`/admin/listings/${id}/reject`, {
    method: 'PATCH',
    auth: true,
    body: { reason },
  });
}

export function deleteAnyListing(id: string) {
  return apiRequest<{ message: string }>(`/admin/listings/${id}`, { method: 'DELETE', auth: true });
}

export function setFeatured(id: string, featured: boolean) {
  return apiRequest<{ listing: AdminListing }>(`/admin/listings/${id}/feature`, {
    method: 'PATCH',
    auth: true,
    body: { featured },
  });
}

export function setUpiVerified(id: string, verified: boolean) {
  return apiRequest<{ listing: AdminListing }>(`/admin/listings/${id}/upi-verify`, {
    method: 'PATCH',
    auth: true,
    body: { verified },
  });
}

export function setPremium(id: string, premium: boolean) {
  return apiRequest<{ listing: AdminListing }>(`/admin/listings/${id}/premium`, {
    method: 'PATCH',
    auth: true,
    body: { premium },
  });
}

export function getAllUsers() {
  return apiRequest<{ users: BackendUser[] }>('/admin/users', { auth: true });
}

export function setUserStatus(id: string, status: 'approved' | 'blocked' | 'pending') {
  return apiRequest<{ user: BackendUser }>(`/admin/users/${id}/status`, {
    method: 'PATCH',
    auth: true,
    body: { status },
  });
}

export function setUserVerified(id: string, verified: boolean) {
  return apiRequest<{ user: BackendUser }>(`/admin/users/${id}/verify`, {
    method: 'PATCH',
    auth: true,
    body: { verified },
  });
}

export function deleteUser(id: string) {
  return apiRequest<{ message: string }>(`/admin/users/${id}`, { method: 'DELETE', auth: true });
}

export function getNotifications() {
  return apiRequest<{ notifications: AdminNotification[] }>('/admin/notifications', { auth: true });
}

export function markNotificationRead(id: string) {
  return apiRequest<{ notification: AdminNotification }>(`/admin/notifications/${id}/read`, {
    method: 'PATCH',
    auth: true,
  });
}

export function getAnalytics() {
  return apiRequest<Analytics>('/admin/analytics', { auth: true });
}

export interface TopSeller {
  id: string;
  full_name: string;
  email: string;
  photo_url: string | null;
  is_verified: boolean;
  listing_count: string;
  total_views: string;
}

export function getTopSellers() {
  return apiRequest<{ sellers: TopSeller[] }>('/admin/top-sellers', { auth: true });
}

export function getReports() {
  return apiRequest<{ reports: Report[] }>('/admin/reports', { auth: true });
}

export function updateReportStatus(id: string, status: 'reviewed' | 'dismissed') {
  return apiRequest<{ report: Report }>(`/admin/reports/${id}`, {
    method: 'PATCH',
    auth: true,
    body: { status },
  });
}

export function deleteReport(id: string) {
  return apiRequest<{ message: string }>(`/admin/reports/${id}`, { method: 'DELETE', auth: true });
}

export interface CreateUserPayload {
  full_name: string;
  email: string;
  password: string;
  phone?: string;
  role: BackendUser['role'];
}

export function createUser(payload: CreateUserPayload) {
  return apiRequest<{ user: BackendUser }>('/admin/users', {
    method: 'POST',
    auth: true,
    body: payload,
  });
}

export interface UpdateUserPayload {
  full_name?: string;
  email?: string;
  phone?: string;
  role?: BackendUser['role'];
}

export function updateUser(id: string, payload: UpdateUserPayload) {
  return apiRequest<{ user: BackendUser }>(`/admin/users/${id}`, {
    method: 'PUT',
    auth: true,
    body: payload,
  });
}

export function impersonateUser(id: string) {
  return apiRequest<{ user: BackendUser; token: string }>(`/admin/users/${id}/impersonate`, {
    method: 'POST',
    auth: true,
  });
}

export function getUserActivity(userId: string) {
  return apiRequest<{ activity: ActivityEntry[] }>(`/admin/users/${userId}/activity`, { auth: true });
}

export function getAllPayments() {
  return apiRequest<{ payments: AdminPayment[] }>('/admin/payments', { auth: true });
}

export function confirmPayment(id: string) {
  return apiRequest<{ payment: AdminPayment; message: string }>(`/admin/payments/${id}/confirm`, {
    method: 'PATCH',
    auth: true,
  });
}

export function rejectPayment(id: string) {
  return apiRequest<{ payment: AdminPayment; message: string }>(`/admin/payments/${id}/reject`, {
    method: 'PATCH',
    auth: true,
  });
}

export function getRevenueSummary() {
  return apiRequest<RevenueSummary>('/admin/revenue-summary', { auth: true });
}

export function updatePricingPlan(planKey: PlanKey, data: { amount_rwf: number; amount_usd?: number | null; label?: string; description?: string }) {
  return apiRequest<{ plan: unknown }>(`/admin/pricing/${planKey}`, {
    method: 'PUT',
    auth: true,
    body: data,
  });
}

export function getAllConversations() {
  return apiRequest<{ conversations: AdminConversation[] }>('/admin/messages', { auth: true });
}

export function getConversationThread(userA: string, userB: string, listingId?: string | null) {
  return apiRequest<{ messages: Message[] }>('/admin/messages/thread', {
    auth: true,
    query: { user_a: userA, user_b: userB, listing_id: listingId || undefined },
  });
}
