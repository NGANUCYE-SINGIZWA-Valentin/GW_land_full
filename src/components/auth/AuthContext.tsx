import React, { createContext, useContext, useState, useCallback, useMemo, useEffect } from 'react';
import { ApiError, clearToken, getToken, setToken } from '@/api/client';
import * as authApi from '@/api/auth';
import type { BackendRole, BackendUser } from '@/api/types';

const IMPERSONATOR_TOKEN_KEY = 'gw_impersonator_token';
const AUTH_USER_KEY = 'gw_auth_user';

function getStoredAuthUser(): AuthUser | null {
  try {
    const raw = localStorage.getItem(AUTH_USER_KEY) || sessionStorage.getItem(AUTH_USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function setStoredAuthUser(user: AuthUser | null, remember: boolean): void {
  try {
    localStorage.removeItem(AUTH_USER_KEY);
    sessionStorage.removeItem(AUTH_USER_KEY);
    if (user) {
      (remember ? localStorage : sessionStorage).setItem(AUTH_USER_KEY, JSON.stringify(user));
    }
  } catch {}
}

function clearStoredAuthUser(): void {
  try {
    localStorage.removeItem(AUTH_USER_KEY);
    sessionStorage.removeItem(AUTH_USER_KEY);
  } catch {}
}

// ── Role definitions ──────────────────────────────────────────────────────────
export type UserRole = 'Administrator' | 'SubAdmin' | 'Seller' | 'Buyer';

export interface AuthUser {
  id: string;
  fullName: string;
  email: string;
  phone?: string | null;
  whatsappNumber?: string | null;
  photoUrl?: string | null;
  isVerified: boolean;
  role: UserRole;
}

// Role → dashboard redirect map
export const ROLE_REDIRECTS: Record<UserRole, string> = {
  Administrator: '/admin/dashboard',
  Seller:        '/seller/dashboard',
  Buyer:         '/dashboard',
  SubAdmin:      '/admin/sub-dashboard',
};

const BACKEND_TO_FRONTEND_ROLE: Record<BackendRole, UserRole> = {
  admin: 'Administrator',
  sub_admin: 'SubAdmin',
  seller: 'Seller',
  buyer: 'Buyer',
};

const FRONTEND_TO_BACKEND_ROLE: Record<'Seller' | 'Buyer', 'seller' | 'buyer'> = {
  Seller: 'seller',
  Buyer: 'buyer',
};

function toAuthUser(user: BackendUser): AuthUser {
  return {
    id: user.id,
    fullName: user.full_name,
    email: user.email,
    phone: user.phone,
    whatsappNumber: user.whatsapp_number,
    photoUrl: user.photo_url,
    isVerified: user.is_verified,
    role: BACKEND_TO_FRONTEND_ROLE[user.role],
  };
}

// ── Context ───────────────────────────────────────────────────────────────────
interface RegisterInput {
  fullName: string;
  email: string;
  password: string;
  phone?: string;
  role: 'Seller' | 'Buyer';
}

interface AuthContextValue {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string, remember?: boolean) => Promise<{ success: boolean; error?: string; role?: UserRole }>;
  register: (input: RegisterInput) => Promise<{ success: boolean; error?: string; role?: UserRole }>;
  loginWithToken: (token: string) => Promise<{ success: boolean; error?: string; role?: UserRole }>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  hasRole: (role: UserRole | UserRole[]) => boolean;
  impersonate: (token: string) => Promise<{ success: boolean; error?: string; role?: UserRole }>;
  stopImpersonating: () => Promise<{ success: boolean; error?: string; role?: UserRole }>;
  isImpersonating: boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

// ── Provider ──────────────────────────────────────────────────────────────────
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(() => getStoredAuthUser());
  const [isLoading, setIsLoading] = useState(() => !getStoredAuthUser() && !!getToken());
  const [isImpersonating, setIsImpersonating] = useState(() => !!sessionStorage.getItem(IMPERSONATOR_TOKEN_KEY));

  useEffect(() => {
    const token = getToken();
    if (!token) {
      clearStoredAuthUser();
      setUser(null);
      setIsLoading(false);
      return;
    }
    authApi
      .getMe()
      .then(({ user: backendUser }) => {
        const authUser = toAuthUser(backendUser);
        setUser(authUser);
        setStoredAuthUser(authUser, true);
      })
      .catch(() => {
        clearToken();
        clearStoredAuthUser();
        setUser(null);
      })
      .finally(() => setIsLoading(false));
  }, []);

  const login = useCallback(async (
    email: string,
    password: string,
    remember = true
  ): Promise<{ success: boolean; error?: string; role?: UserRole }> => {
    try {
      const { user: backendUser, token } = await authApi.login(email, password);
      setToken(token, remember);
      const authUser = toAuthUser(backendUser);
      setStoredAuthUser(authUser, remember);
      setUser(authUser);
      return { success: true, role: authUser.role };
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Invalid email or password. Please try again.';
      return { success: false, error: message };
    }
  }, []);

  const register = useCallback(async (
    input: RegisterInput
  ): Promise<{ success: boolean; error?: string; role?: UserRole }> => {
    try {
      const { user: backendUser, token } = await authApi.register({
        full_name: input.fullName,
        email: input.email,
        password: input.password,
        phone: input.phone,
        role: FRONTEND_TO_BACKEND_ROLE[input.role],
      });
      setToken(token, true);
      const authUser = toAuthUser(backendUser);
      setStoredAuthUser(authUser, true);
      setUser(authUser);
      return { success: true, role: authUser.role };
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Something went wrong while registering.';
      return { success: false, error: message };
    }
  }, []);

  // Used by the OAuth callback page: the backend already signed a valid JWT
  // (the user completed the Google/Facebook consent screen), we just need to
  // store it and hydrate the user, same as a normal login.
  const loginWithToken = useCallback(async (
    token: string
  ): Promise<{ success: boolean; error?: string; role?: UserRole }> => {
    try {
      setToken(token, true);
      const { user: backendUser } = await authApi.getMe();
      const authUser = toAuthUser(backendUser);
      setStoredAuthUser(authUser, true);
      setUser(authUser);
      return { success: true, role: authUser.role };
    } catch (err) {
      clearToken();
      clearStoredAuthUser();
      const message = err instanceof ApiError ? err.message : 'Something went wrong signing you in.';
      return { success: false, error: message };
    }
  }, []);

  const logout = useCallback(() => {
    sessionStorage.removeItem(IMPERSONATOR_TOKEN_KEY);
    setIsImpersonating(false);
    clearToken();
    clearStoredAuthUser();
    setUser(null);
  }, []);

  // Admin "log in as" a target user: stash the admin's own token so it can be
  // restored later, then switch the active session to the target's token.
  const impersonate = useCallback(async (
    token: string
  ): Promise<{ success: boolean; error?: string; role?: UserRole }> => {
    const currentToken = getToken();
    if (!currentToken) return { success: false, error: 'No active session to impersonate from.' };
    try {
      setToken(token, false); // impersonated sessions never persist past this tab/session
      const { user: backendUser } = await authApi.getMe();
      sessionStorage.setItem(IMPERSONATOR_TOKEN_KEY, currentToken);
      setIsImpersonating(true);
      const authUser = toAuthUser(backendUser);
      setStoredAuthUser(authUser, false);
      setUser(authUser);
      return { success: true, role: authUser.role };
    } catch (err) {
      setToken(currentToken, false);
      const message = err instanceof ApiError ? err.message : 'Could not switch to that account.';
      return { success: false, error: message };
    }
  }, []);

  // Restores the admin's own session after impersonating someone.
  const stopImpersonating = useCallback(async (): Promise<{ success: boolean; error?: string; role?: UserRole }> => {
    const stashed = sessionStorage.getItem(IMPERSONATOR_TOKEN_KEY);
    if (!stashed) return { success: false, error: 'Not currently impersonating anyone.' };
    try {
      setToken(stashed, true);
      const { user: backendUser } = await authApi.getMe();
      sessionStorage.removeItem(IMPERSONATOR_TOKEN_KEY);
      setIsImpersonating(false);
      const authUser = toAuthUser(backendUser);
      setStoredAuthUser(authUser, true);
      setUser(authUser);
      return { success: true, role: authUser.role };
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Could not return to your admin session — please log in again.';
      sessionStorage.removeItem(IMPERSONATOR_TOKEN_KEY);
      setIsImpersonating(false);
      clearToken();
      clearStoredAuthUser();
      setUser(null);
      return { success: false, error: message };
    }
  }, []);

  const refreshUser = useCallback(async () => {
    if (!getToken()) return;
    try {
      const { user: backendUser } = await authApi.getMe();
      const authUser = toAuthUser(backendUser);
      setUser(authUser);
      setStoredAuthUser(authUser, true);
    } catch {
      // ignore transient refresh failures
    }
  }, []);

  const hasRole = useCallback((role: UserRole | UserRole[]): boolean => {
    if (!user) return false;
    return Array.isArray(role) ? role.includes(user.role) : user.role === role;
  }, [user]);

  const value = useMemo(
    () => ({
      user, isAuthenticated: !!user, isLoading, login, register, loginWithToken, logout, refreshUser, hasRole,
      impersonate, stopImpersonating, isImpersonating,
    }),
    [user, isLoading, login, register, loginWithToken, logout, refreshUser, hasRole, impersonate, stopImpersonating, isImpersonating]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// ── Hook ──────────────────────────────────────────────────────────────────────
export const useAuth = (): AuthContextValue => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
};
