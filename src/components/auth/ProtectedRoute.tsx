import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth, ROLE_REDIRECTS, type UserRole } from './AuthContext';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  allowedRoles?: UserRole[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ allowedRoles }) => {
  const { user, isAuthenticated, isLoading, hasRole } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-300">
        <div className="flex flex-col items-center gap-3">
          <Loader2 size={36} className="animate-spin text-[#1B395F] dark:text-[#54B5BB]" />
          <p className="text-xs font-semibold tracking-wide text-slate-500 dark:text-slate-400">
            Checking authentication...
          </p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && !hasRole(allowedRoles)) {
    if (user?.role && ROLE_REDIRECTS[user.role]) {
      return <Navigate to={ROLE_REDIRECTS[user.role]} replace />;
    }
    return <Navigate to="/unauthorized" replace />;
  }

  return <Outlet />;
};
