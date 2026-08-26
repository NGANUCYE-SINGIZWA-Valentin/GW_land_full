import React, { useState } from 'react';
import { Send, Mail } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import * as miscApi from '@/api/misc';
import { ApiError } from '@/api/client';

export const PropertiesNewsletter: React.FC = () => {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [error, setError] = useState('');

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('sending');
    setError('');
    try {
      await miscApi.subscribeNewsletter(email);
      setStatus('sent');
      setEmail('');
    } catch (err) {
      setStatus('error');
      setError(err instanceof ApiError ? err.message : 'Something went wrong. Please try again.');
    }
  };

  return (
    <section className="w-full">
      {/* 🌟 LE CONTENEUR AVEC TON DÉGRADÉ DE BLANC EXACT */}
      <div className="relative rounded-[2.5rem] p-8 md:p-12 overflow-hidden bg-gradient-to-b from-white via-white/35 to-white/3 border border-white/60 backdrop-blur-md shadow-[0_20px_50px_-12px_rgba(148,163,184,0.12)] flex flex-col items-center text-center">

        {/* CONTENU (z-10 pour passer au-dessus des lueurs) */}
        <div className="relative z-10 max-w-2xl mx-auto mb-8">
          <h2 className="text-2xl sm:text-3xl md:text-3xl font-semibold text-brand-text tracking-tight leading-tight mb-4">
            Subscribe our newsletter for latest <br className="hidden sm:inline" /> news and daily updates
          </h2>
          <p className="text-sm text-gray-500 max-w-md mx-auto leading-relaxed">
            Stay informed about new property listings in Kigali, market trends, and exclusive real estate opportunities in Rwanda.
          </p>
        </div>

        {status === 'sent' ? (
          <p className="relative z-10 text-sm font-semibold text-emerald-600">You're subscribed! Thanks for joining our newsletter.</p>
        ) : (
          <form
            onSubmit={handleSubscribe}
            className="relative z-10 w-full max-w-md mx-auto"
          >
            {error && <p className="mb-2 text-xs font-semibold text-red-500">{error}</p>}
            <div className="bg-white border border-gray-100 rounded-2xl p-2 shadow-[0_10px_30px_-5px_rgba(148,163,184,0.12)] focus-within:border-brand-primary/30 transition-all duration-300 space-y-2 sm:space-y-0 sm:flex sm:items-center sm:rounded-full sm:p-2 sm:pl-6">
              <Input
                label=""
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                icon={<Mail size={18} />}
                required
                className="border-0 bg-transparent focus:ring-0 focus:border-transparent p-0"
              />
              <button
                type="submit"
                disabled={status === 'sending'}
                className="w-full sm:w-auto group flex items-center justify-center gap-2 bg-brand-primary text-white font-medium text-sm px-6 py-3.5 rounded-full hover:bg-brand-primary-hover hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 shadow-sm disabled:opacity-60"
              >
                {status === 'sending' ? 'Subscribing…' : 'Subscribe'}
                <Send size={14} className="opacity-80 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </form>
        )}

      </div>
    </section>
  );
};
