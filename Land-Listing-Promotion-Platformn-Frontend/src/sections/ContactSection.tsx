import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Send } from 'lucide-react';
import { Container } from '@/components/ui/Container';
import * as miscApi from '@/api/misc';
import { ApiError } from '@/api/client';

export const ContactSection: React.FC = () => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
  });
  const [consent, setConsent] = useState(false);
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setStatus('sending');
    try {
      await miscApi.sendContactForm({
        sender_name: formData.name,
        sender_email: formData.email,
        sender_phone: formData.phone || undefined,
        message_body: formData.message,
      });
      setStatus('sent');
      setFormData({ name: '', email: '', phone: '', message: '' });
      setConsent(false);
    } catch (err) {
      setStatus('error');
      setError(err instanceof ApiError ? err.message : t('contact.errorGeneric'));
    }
  };

  return (
    <section id="contact" className="min-h-[calc(100vh-96px)] bg-brand-surface dark:bg-slate-950 px-5 pt-14 pb-28 text-brand-text dark:text-slate-100 md:px-8 md:pt-20 md:pb-36 transition-colors duration-300">
      <Container>
        <div className="mx-auto max-w-[980px]">
          <header className="mb-9 text-center">
            <h1 className="text-3xl font-bold tracking-tight text-brand-primary dark:text-brand-secondary md:text-5xl">{t('contact.heroTitle')}</h1>
            <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">{t('contact.heroSubtitle')}</p>
          </header>

          <div className="grid items-stretch gap-6 md:grid-cols-[0.95fr_1.05fr]">
            <div className="min-h-[300px] overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-[0_18px_45px_-28px_rgba(10,31,68,0.5)] md:min-h-0">
              <img src="/assets/images/contact.jpg" alt="GW Land support team" className="h-full min-h-[300px] w-full object-cover" />
            </div>

            <form
              onSubmit={handleSubmit}
              className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-[0_18px_45px_-28px_rgba(10,31,68,0.5)] md:p-7"
            >
              <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-brand-accent">{t('contact.getInTouch')}</p>
              <h2 className="mt-2 text-xl font-bold text-brand-primary dark:text-brand-secondary">{t('contact.supportTeamTitle')}</h2>
              <p className="mt-2 text-xs leading-relaxed text-slate-500 dark:text-slate-400">{t('contact.supportIntro')}</p>
              {status === 'sent' && (
                <div className="mt-4 rounded-lg bg-emerald-50 dark:bg-emerald-950/20 px-3 py-2.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                  {t('contact.thanksMessage')}
                </div>
              )}
              {status === 'error' && (
                <div className="mt-4 rounded-lg bg-red-50 dark:bg-red-950/20 px-3 py-2.5 text-xs font-semibold text-red-600 dark:text-red-400">
                  {error}
                </div>
              )}
              <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <label className="block text-[10px] font-semibold text-slate-600 dark:text-slate-300">{t('contact.fullName')}
                <input
                  type="text"
                  name="name"
                  placeholder="John Doe"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="mt-1.5 w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2.5 text-xs text-brand-text dark:text-slate-100 outline-none placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-brand-accent dark:focus:border-brand-secondary"
                />
              </label>
              <label className="block text-[10px] font-semibold text-slate-600 dark:text-slate-300">{t('contact.emailAddress')}
                <input
                  type="email"
                  name="email"
                  placeholder="john@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="mt-1.5 w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2.5 text-xs text-brand-text dark:text-slate-100 outline-none placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-brand-accent dark:focus:border-brand-secondary"
                />
              </label>
              </div>
              <label className="mt-4 block text-[10px] font-semibold text-slate-600 dark:text-slate-300">{t('contact.phoneNumber')}
                <input
                  type="tel"
                  name="phone"
                  placeholder="+250 782 576 686"
                  value={formData.phone}
                  onChange={handleChange}
                  className="mt-1.5 w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2.5 text-xs text-brand-text dark:text-slate-100 outline-none placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-brand-accent dark:focus:border-brand-secondary"
                />
              </label>
              <label className="mt-4 block text-[10px] font-semibold text-slate-600 dark:text-slate-300">{t('contact.message')}
                <textarea
                  name="message"
                  placeholder={t('contact.messagePlaceholder')}
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows={4}
                  className="mt-1.5 w-full resize-none rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2.5 text-xs text-brand-text dark:text-slate-100 outline-none placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-brand-accent dark:focus:border-brand-secondary"
                />
              </label>

              <label className="mt-4 flex items-start gap-2 text-[10px] leading-relaxed text-slate-500 dark:text-slate-400">
                <input
                  type="checkbox"
                  checked={consent}
                  onChange={(e) => setConsent(e.target.checked)}
                  required
                  className="mt-0.5 shrink-0 accent-brand-primary dark:accent-brand-secondary"
                />
                {t('contact.consent')}
              </label>

              <button
                type="submit"
                disabled={status === 'sending'}
                className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-brand-primary dark:bg-brand-secondary dark:text-slate-900 dark:hover:bg-brand-secondary-hover px-6 py-3 text-xs font-bold text-white transition hover:bg-brand-primary-hover disabled:opacity-60"
              >
                {status === 'sending' ? t('contact.sending') : t('contact.send')}
                <Send size={14} className="opacity-80 group-hover:translate-x-1 transition-transform" />
              </button>
            </form>
          </div>
        </div>
      </Container>
    </section>
  );
};