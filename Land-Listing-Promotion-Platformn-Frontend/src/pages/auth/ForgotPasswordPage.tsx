import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import GWLandLogo from '@/components/ui/GWLandLogo';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Mail, Lock, KeyRound } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import * as authApi from '@/api/auth';
import { ApiError } from '@/api/client';

export const ForgotPasswordPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [step, setStep] = useState<'request' | 'reset'>('request');
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRequest = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setInfo('');
    const email = (new FormData(e.currentTarget).get('email') as string) || '';
    if (!email) {
      setError(t('auth.pleaseEnterEmail'));
      return;
    }
    setLoading(true);
    try {
      const { message } = await authApi.forgotPassword(email);
      setInfo(message);
      setStep('reset');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : t('auth.somethingWentWrong'));
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setInfo('');
    const formData = new FormData(e.currentTarget);
    const token = formData.get('token') as string;
    const newPassword = formData.get('newPassword') as string;
    const confirmPassword = formData.get('confirmPassword') as string;

    if (!token || !newPassword) {
      setError(t('auth.fillAllFields'));
      return;
    }
    if (newPassword !== confirmPassword) {
      setError(t('auth.passwordsDontMatch'));
      return;
    }
    if (newPassword.length < 8) {
      setError(t('auth.passwordTooShort'));
      return;
    }

    setLoading(true);
    try {
      await authApi.resetPassword(token, newPassword);
      navigate('/login');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : t('auth.somethingWentWrong'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl sm:rounded-3xl border border-slate-200 dark:border-slate-800 p-5 sm:p-7 flex flex-col justify-center transition-all duration-300 shadow-none">

      <div className="mb-4 flex flex-col items-center text-center">
        <Link to="/" className="mb-2 inline-block hover:scale-105 transition-transform duration-200" title="Go to home page">
          <GWLandLogo className="h-6 sm:h-7 w-auto max-w-[80px] object-contain" />
        </Link>
        <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-0.5">
          {t('auth.resetPassword')}
        </h1>
        <p className="text-slate-600 dark:text-slate-400 font-semibold text-xs">
          {step === 'request'
            ? t('auth.enterEmailForReset')
            : t('auth.enterCodeAndNewPassword')}
        </p>
      </div>

      {error && (
        <div className="mb-3 p-2.5 bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 text-xs font-semibold rounded-xl border border-red-100 dark:border-red-900/30">
          {error}
        </div>
      )}
      {info && (
        <div className="mb-3 p-2.5 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 text-xs font-semibold rounded-xl border border-emerald-100 dark:border-emerald-900/30">
          {info}
        </div>
      )}

      {step === 'request' ? (
        <form className="space-y-3" onSubmit={handleRequest}>
          <Input
            label={t('auth.emailAddressLabel')}
            name="email"
            placeholder="johndoe@example.com"
            type="email"
            icon={<Mail size={16} />}
            required
          />
          <Button
            type="submit"
            variant="primary"
            className="w-full py-3 rounded-xl text-xs sm:text-sm font-extrabold bg-brand-primary hover:bg-brand-primary-hover dark:bg-brand-secondary dark:text-slate-900 dark:hover:bg-brand-secondary-hover shadow-none mt-1"
            disabled={loading}
          >
            {loading ? t('propertyDetails.sending') : t('auth.sendResetCode')}
          </Button>
        </form>
      ) : (
        <form className="space-y-3" onSubmit={handleReset}>
          <Input
            label={t('auth.resetCode')}
            name="token"
            placeholder={t('auth.resetCodePlaceholder')}
            type="text"
            icon={<KeyRound size={16} />}
            required
          />
          <Input
            label={t('auth.newPassword')}
            name="newPassword"
            placeholder={t('auth.passwordAtLeast8')}
            type="password"
            icon={<Lock size={16} />}
            required
          />
          <Input
            label={t('auth.confirmNewPassword')}
            name="confirmPassword"
            placeholder="••••••••"
            type="password"
            icon={<Lock size={16} />}
            required
          />
          <Button
            type="submit"
            variant="primary"
            className="w-full py-3 rounded-xl text-xs sm:text-sm font-extrabold bg-brand-primary hover:bg-brand-primary-hover dark:bg-brand-secondary dark:text-slate-900 dark:hover:bg-brand-secondary-hover shadow-none mt-1"
            disabled={loading}
          >
            {loading ? t('auth.resetting') : t('auth.resetPasswordAction')}
          </Button>
        </form>
      )}

      <p className="text-center mt-8 text-xs sm:text-sm font-bold text-gray-500 dark:text-slate-400">
        {t('auth.rememberedPassword')}{' '}
        <Link to="/login" className="text-brand-primary dark:text-brand-secondary font-extrabold hover:underline">
          {t('auth.logIn')}
        </Link>
      </p>
    </div>
  );
};
