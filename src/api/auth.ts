import { apiRequest } from './client';
import type { BackendUser } from './types';

export interface AuthResponse {
  user: BackendUser;
  token: string;
}

export function login(email: string, password: string) {
  return apiRequest<AuthResponse>('/auth/login', { method: 'POST', body: { email, password } });
}

export interface RegisterPayload {
  full_name: string;
  email: string;
  password: string;
  phone?: string;
  whatsapp_number?: string;
  role: 'buyer' | 'seller';
}

export function register(payload: RegisterPayload) {
  return apiRequest<AuthResponse>('/auth/register', { method: 'POST', body: payload });
}

export function getMe() {
  return apiRequest<{ user: BackendUser }>('/auth/me', { auth: true });
}

export function updateMe(payload: { full_name?: string; phone?: string; whatsapp_number?: string }) {
  return apiRequest<{ user: BackendUser }>('/auth/me', { method: 'PUT', auth: true, body: payload });
}

export function forgotPassword(email: string) {
  return apiRequest<{ message: string }>('/auth/forgot-password', { method: 'POST', body: { email } });
}

export function resetPassword(token: string, new_password: string) {
  return apiRequest<{ message: string }>('/auth/reset-password', { method: 'POST', body: { token, new_password } });
}

export function uploadProfilePhoto(file: File) {
  const formData = new FormData();
  formData.append('photo', file);
  return apiRequest<{ user: BackendUser; photo_url: string }>('/auth/me/photo', {
    method: 'POST',
    auth: true,
    formData,
  });
}

export function changePassword(current_password: string, new_password: string) {
  return apiRequest<{ message: string }>('/auth/me/password', {
    method: 'PUT',
    auth: true,
    body: { current_password, new_password },
  });
}

// "Continue with Google/Facebook" — these are full-page redirects (the user's
// browser navigates to the provider's consent screen), not fetch calls, so we
// just build the URL for a plain <a href>. `role` only matters on the Register
// page (a brand-new OAuth signup needs to know Buyer vs Seller); Login always
// omits it since an existing account already has a role.
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export function googleAuthUrl(role?: 'buyer' | 'seller'): string {
  return `${API_URL}/auth/google${role ? `?role=${role}` : ''}`;
}

export function facebookAuthUrl(role?: 'buyer' | 'seller'): string {
  return `${API_URL}/auth/facebook${role ? `?role=${role}` : ''}`;
}
