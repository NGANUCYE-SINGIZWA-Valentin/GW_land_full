import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import GWLandLogo from '@/components/ui/GWLandLogo';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Mail, Lock } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth, ROLE_REDIRECTS } from '@/components/auth/AuthContext';
import { googleAuthUrl, facebookAuthUrl } from '@/api/auth';

export const LoginPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { login } = useAuth();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');

    const formData = new FormData(e.currentTarget);
    const email      = formData.get('email') as string;
    const password   = formData.get('password') as string;
    const rememberMe = formData.get('rememberMe') === 'on';

    if (!email || !password) {
      setError(t('auth.fillAllFields'));
      return;
    }

    setLoading(true);
    const result = await login(email, password, rememberMe);
    setLoading(false);

    if (!result.success) {
      setError(result.error ?? t('auth.loginFailed'));
      return;
    }

    navigate(result.role ? ROLE_REDIRECTS[result.role] : '/dashboard');
  };

  return (
    <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl sm:rounded-3xl border border-slate-200 dark:border-slate-800 p-5 sm:p-7 flex flex-col justify-center transition-all duration-300 shadow-none">

      {/* Clickable Logo and Welcome Back heading */}
      <div className="mb-4 flex flex-col items-center text-center">
        <Link to="/" className="mb-2 inline-block hover:scale-105 transition-transform duration-200" title="Go to home page">
          <GWLandLogo className="h-6 sm:h-7 w-auto max-w-[80px] object-contain" />
        </Link>
        <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-0.5">
          {t('auth.welcomeBack')}
        </h1>
        <p className="text-slate-600 dark:text-slate-400 font-semibold text-xs">
          {t('auth.letsGetGoing')}
        </p>
      </div>

      {error && (
        <div className="mb-3 p-2.5 bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 text-xs font-semibold rounded-xl border border-red-100 dark:border-red-900/30">
          {error}
        </div>
      )}

      <form className="space-y-3.5" onSubmit={handleLogin}>
        <Input
          label={t('auth.email')}
          name="email"
          placeholder="johndoe@example.com"
          type="email"
          icon={<Mail size={16} />}
          required
        />

        <div className="space-y-1">
          <Input
            label={t('auth.password')}
            name="password"
            placeholder="••••••••"
            type="password"
            icon={<Lock size={16} />}
            required
          />
          <div className="flex justify-between items-center px-1 pt-1">
            <label className="flex items-center gap-2 cursor-pointer group">
              <input
                type="checkbox"
                name="rememberMe"
                defaultChecked
                className="w-3.5 h-3.5 rounded border-gray-300 dark:border-slate-700 text-brand-primary focus:ring-brand-primary dark:focus:ring-brand-secondary cursor-pointer bg-white dark:bg-slate-800"
              />
              <span className="text-xs font-semibold text-slate-600 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">
                {t('auth.rememberMe')}
              </span>
            </label>
            <Link to="/forgot-password" className="text-xs font-bold text-brand-primary dark:text-brand-secondary hover:underline">
              {t('auth.forgotPassword')}
            </Link>
          </div>
        </div>

        <Button
          type="submit"
          variant="primary"
          className="w-full py-3 rounded-xl text-xs sm:text-sm font-extrabold bg-brand-primary hover:bg-brand-primary-hover dark:bg-brand-secondary dark:text-slate-900 dark:hover:bg-brand-secondary-hover shadow-none"
          disabled={loading}
        >
          {loading ? t('auth.signingIn') : t('auth.loginAction')}
        </Button>
      </form>

      {/* Divider */}
      <div className="relative my-4">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-slate-200 dark:border-slate-800" />
        </div>
        <div className="relative flex justify-center text-[10px] uppercase">
          <span className="bg-white dark:bg-slate-900 px-3 text-slate-500 dark:text-slate-400 font-bold">
            {t('auth.or')}
          </span>
        </div>
      </div>

      {/* Social Buttons */}
      <div className="flex flex-col space-y-2">
        <a
          href={googleAuthUrl()}
          className="flex items-center justify-center gap-2.5 py-2.5 px-4 bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-xs font-bold text-slate-700 dark:text-slate-200 cursor-pointer w-full shadow-none"
        >
          <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
          </svg>
          {t('auth.continueWithGoogle')}
        </a>

        <a
          href={facebookAuthUrl()}
          className="flex items-center justify-center gap-2.5 py-2.5 px-4 bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-xs font-bold text-slate-700 dark:text-slate-200 cursor-pointer w-full shadow-none"
        >
          <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none">
            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" fill="#1877F2"/>
          </svg>
          {t('auth.continueWithFacebook')}
        </a>
      </div>

      <p className="text-center mt-5 text-xs font-semibold text-slate-600 dark:text-slate-400">
        {t('auth.noAccount')}{' '}
        <Link to="/register" className="text-brand-primary dark:text-brand-secondary font-extrabold hover:underline">
          {t('auth.signUp')}
        </Link>
      </p>
    </div>
  );
};

export default LoginPage;
