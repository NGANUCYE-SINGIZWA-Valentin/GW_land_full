import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import GWLandLogo from '@/components/ui/GWLandLogo';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Mail, Lock, Shield, ShieldAlert, Store, User, Sparkles, Loader2, CheckCircle2 } from 'lucide-react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth, ROLE_REDIRECTS } from '@/components/auth/AuthContext';
import { googleAuthUrl, facebookAuthUrl } from '@/api/auth';

const DEMO_ACCOUNTS = [
  {
    role: 'SubAdmin' as const,
    label: 'Sub-Admin (Moderation)',
    email: 'subadmin@gwland.com',
    pass: 'Passw0rd!123',
    icon: <ShieldAlert size={14} className="text-purple-500" />,
    badge: 'bg-purple-50 text-purple-700 dark:bg-purple-950/30 dark:text-purple-300 border-purple-200 dark:border-purple-800/50 hover:bg-purple-100 dark:hover:bg-purple-900/40',
  },
  {
    role: 'Administrator' as const,
    label: 'Super Admin',
    email: 'admin@gwland.com',
    pass: 'Passw0rd!123',
    icon: <Shield size={14} className="text-indigo-500" />,
    badge: 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/30 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800/50 hover:bg-indigo-100 dark:hover:bg-indigo-900/40',
  },
  {
    role: 'Seller' as const,
    label: 'Seller / Land Broker',
    email: 'seller@test.com',
    pass: 'Passw0rd!123',
    icon: <Store size={14} className="text-emerald-500" />,
    badge: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/50 hover:bg-emerald-100 dark:hover:bg-emerald-900/40',
  },
  {
    role: 'Buyer' as const,
    label: 'Buyer / Investor',
    email: 'buyer@test.com',
    pass: 'TestPass123!',
    icon: <User size={14} className="text-blue-500" />,
    badge: 'bg-blue-50 text-blue-700 dark:bg-blue-950/30 dark:text-blue-300 border-blue-200 dark:border-blue-800/50 hover:bg-blue-100 dark:hover:bg-blue-900/40',
  },
];

export const LoginPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated, isLoading: authLoading, login } = useAuth();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeDemoRole, setActiveDemoRole] = useState<string | null>(null);
  const [emailInput, setEmailInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');

  // If already authenticated, redirect straight to the destination dashboard
  useEffect(() => {
    if (isAuthenticated && user?.role && !authLoading) {
      const fromPath = (location.state as { from?: { pathname?: string } })?.from?.pathname;
      const target = fromPath || ROLE_REDIRECTS[user.role] || '/dashboard';
      navigate(target, { replace: true });
    }
  }, [isAuthenticated, user, authLoading, navigate, location.state]);

  const executeLogin = async (email: string, pass: string, remember = true, demoRole?: string) => {
    setError('');
    setLoading(true);
    if (demoRole) setActiveDemoRole(demoRole);

    try {
      const result = await login(email, pass, remember);
      if (!result.success) {
        setLoading(false);
        setActiveDemoRole(null);
        setError(result.error ?? t('auth.loginFailed'));
        return;
      }
      const fromPath = (location.state as { from?: { pathname?: string } })?.from?.pathname;
      const target = fromPath || (result.role ? ROLE_REDIRECTS[result.role] : '/dashboard');
      navigate(target, { replace: true });
    } catch {
      setLoading(false);
      setActiveDemoRole(null);
      setError(t('auth.loginFailed'));
    }
  };

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const email      = (formData.get('email') as string) || emailInput;
    const password   = (formData.get('password') as string) || passwordInput;
    const rememberMe = formData.get('rememberMe') === 'on';

    if (!email || !password) {
      setError(t('auth.fillAllFields'));
      return;
    }

    await executeLogin(email, password, rememberMe);
  };

  const handleQuickDemoLogin = (email: string, pass: string, role: string) => {
    setEmailInput(email);
    setPasswordInput(pass);
    executeLogin(email, pass, true, role);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 16, scale: 0.985 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.38, ease: [0.16, 1, 0.3, 1] }}
      className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 flex flex-col justify-center transition-all duration-300 shadow-xl overflow-hidden"
    >
      {/* Top indeterminate loading indicator strip */}
      {loading && (
        <div className="absolute top-0 left-0 right-0 h-1 bg-slate-100 dark:bg-slate-800 overflow-hidden">
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: '100%' }}
            transition={{ repeat: Infinity, duration: 1.1, ease: 'easeInOut' }}
            className="h-full w-1/2 bg-gradient-to-r from-[#54B5BB] via-[#1B395F] to-[#54B5BB]"
          />
        </div>
      )}

      {/* Clickable Logo and Welcome Back heading */}
      <motion.div 
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.32, delay: 0.05 }}
        className="mb-5 flex flex-col items-center text-center"
      >
        <Link to="/" className="mb-3 inline-block hover:scale-105 transition-transform duration-200" title="Go to home page">
          <GWLandLogo className="h-8 w-auto max-w-[100px] object-contain" />
        </Link>
        <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
          {t('auth.welcomeBack')}
        </h1>
        <p className="text-slate-500 dark:text-slate-400 font-medium text-xs mt-1">
          Sign in to your GW Land real estate account
        </p>
      </motion.div>

      {/* Quick Demo Sign-in Pills */}
      <motion.div 
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.32, delay: 0.1 }}
        className="mb-5 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80"
      >
        <div className="flex items-center justify-between mb-2.5 px-0.5">
          <div className="flex items-center gap-1.5">
            <Sparkles size={13} className="text-amber-500" />
            <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              Quick 1-Click Portals:
            </span>
          </div>
          {loading && activeDemoRole && (
            <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-[#54B5BB] animate-pulse">
              <Loader2 size={10} className="animate-spin" />
              Authenticating...
            </span>
          )}
        </div>
        <div className="grid grid-cols-2 gap-2">
          {DEMO_ACCOUNTS.map((acc) => {
            const isThisLoading = loading && activeDemoRole === acc.role;
            return (
              <button
                key={acc.role}
                type="button"
                onClick={() => handleQuickDemoLogin(acc.email, acc.pass, acc.role)}
                disabled={loading}
                className={`flex items-center gap-2 p-2 rounded-xl border text-left text-xs font-bold transition-all duration-150 hover:scale-[1.02] active:scale-[0.98] cursor-pointer disabled:cursor-not-allowed disabled:opacity-75 ${acc.badge} ${isThisLoading ? 'ring-2 ring-[#54B5BB]/60 shadow-sm' : ''}`}
              >
                {isThisLoading ? (
                  <Loader2 size={14} className="animate-spin text-[#54B5BB] shrink-0" />
                ) : (
                  acc.icon
                )}
                <span className="truncate">{acc.label}</span>
              </button>
            );
          })}
        </div>
      </motion.div>

      {/* Error state */}
      <AnimatePresence>
        {error && (
          <motion.div 
            initial={{ opacity: 0, height: 0, y: -6 }}
            animate={{ opacity: 1, height: 'auto', y: 0 }}
            exit={{ opacity: 0, height: 0, y: -6 }}
            transition={{ duration: 0.2 }}
            className="mb-4 p-3 bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 text-xs font-semibold rounded-xl border border-red-200 dark:border-red-900/40"
          >
            {error}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Login Form */}
      <motion.form 
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.32, delay: 0.15 }}
        className="space-y-4" 
        onSubmit={handleLogin}
      >
        <Input
          label={t('auth.email')}
          name="email"
          value={emailInput}
          onChange={(e) => setEmailInput(e.target.value)}
          placeholder="subadmin@gwland.com"
          type="text"
          icon={<Mail size={16} />}
          disabled={loading}
          required
        />

        <div className="space-y-1.5">
          <Input
            label={t('auth.password')}
            name="password"
            value={passwordInput}
            onChange={(e) => setPasswordInput(e.target.value)}
            placeholder="••••••••"
            type="password"
            icon={<Lock size={16} />}
            disabled={loading}
            required
          />
          <div className="flex justify-between items-center px-1 pt-1">
            <label className="flex items-center gap-2 cursor-pointer group">
              <input
                type="checkbox"
                name="rememberMe"
                defaultChecked
                disabled={loading}
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
          className="w-full py-3.5 rounded-xl text-xs sm:text-sm font-extrabold bg-[#1B395F] hover:bg-[#122844] text-white shadow-md shadow-[#1B395F]/15 flex items-center justify-center gap-2 transition-all"
          disabled={loading}
        >
          {loading ? (
            <>
              <Loader2 size={16} className="animate-spin text-white" />
              <span>{t('auth.signingIn') || 'Signing in...'}</span>
            </>
          ) : (
            t('auth.loginAction')
          )}
        </Button>
      </motion.form>

      {/* Divider */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.32, delay: 0.2 }}
        className="relative my-4"
      >
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-slate-200 dark:border-slate-800" />
        </div>
        <div className="relative flex justify-center text-[10px] uppercase">
          <span className="bg-white dark:bg-slate-900 px-3 text-slate-400 font-bold">
            {t('auth.or')}
          </span>
        </div>
      </motion.div>

      {/* Social Buttons */}
      <motion.div 
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.32, delay: 0.25 }}
        className="flex flex-col space-y-2"
      >
        <a
          href={googleAuthUrl()}
          className={`flex items-center justify-center gap-2.5 py-2.5 px-4 bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-xs font-bold text-slate-700 dark:text-slate-200 cursor-pointer w-full shadow-none ${loading ? 'pointer-events-none opacity-60' : ''}`}
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
          className={`flex items-center justify-center gap-2.5 py-2.5 px-4 bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-xs font-bold text-slate-700 dark:text-slate-200 cursor-pointer w-full shadow-none ${loading ? 'pointer-events-none opacity-60' : ''}`}
        >
          <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none">
            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" fill="#1877F2"/>
          </svg>
          {t('auth.continueWithFacebook')}
        </a>
      </motion.div>

      <motion.p 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.32, delay: 0.3 }}
        className="text-center mt-5 text-xs font-semibold text-slate-500 dark:text-slate-400"
      >
        {t('auth.noAccount')}{' '}
        <Link to="/register" className="text-[#1B395F] dark:text-[#54B5BB] font-extrabold hover:underline">
          {t('auth.signUp')}
        </Link>
      </motion.p>
    </motion.div>
  );
};

export default LoginPage;

