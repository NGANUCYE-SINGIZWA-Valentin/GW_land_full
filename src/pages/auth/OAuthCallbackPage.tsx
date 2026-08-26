import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import GWLandLogo from '@/components/ui/GWLandLogo';
import { useAuth, ROLE_REDIRECTS } from '@/components/auth/AuthContext';

// Landed on after "Continue with Google/Facebook": the backend already
// completed the OAuth exchange and either hands us a signed JWT (?token=)
// or an ?error= message if something went wrong.
export const OAuthCallbackPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { loginWithToken } = useAuth();
  const [error, setError] = useState('');

  useEffect(() => {
    const token = searchParams.get('token');
    const oauthError = searchParams.get('error');

    if (oauthError) {
      setError(oauthError);
      return;
    }
    if (!token) {
      setError('Missing sign-in token. Please try again.');
      return;
    }

    loginWithToken(token).then((result) => {
      if (!result.success) {
        setError(result.error ?? 'Something went wrong signing you in.');
        return;
      }
      navigate(result.role ? ROLE_REDIRECTS[result.role] : '/dashboard', { replace: true });
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl sm:rounded-3xl border border-slate-200 dark:border-slate-800 p-7 flex flex-col items-center text-center gap-4">
      <GWLandLogo className="h-7 w-auto max-w-[80px] object-contain" />
      {error ? (
        <>
          <p className="text-sm font-semibold text-red-600 dark:text-red-400">{error}</p>
          <Link to="/login" className="text-sm font-extrabold text-brand-primary dark:text-brand-secondary hover:underline">
            Back to login
          </Link>
        </>
      ) : (
        <>
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-primary border-t-transparent" />
          <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">Signing you in…</p>
        </>
      )}
    </div>
  );
};
