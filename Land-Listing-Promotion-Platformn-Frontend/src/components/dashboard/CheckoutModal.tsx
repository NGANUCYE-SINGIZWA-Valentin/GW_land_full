import React, { useState } from 'react';
import { 
  X, 
  Lock, 
  CreditCard, 
  User, 
  Calendar, 
  Info, 
  ShieldCheck,
  ChevronDown,
  Smartphone
} from 'lucide-react';
import { DashboardButton } from '@/components/ui/DashboardButton';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  itemName?: string; // Nom du plan ou du listing promu
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({ 
  isOpen, 
  onClose 
}) => {
  const [subscriptionType, setSubscriptionType] = useState<'1month' | '12month'>('1month');
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'paypal' | 'apple' | 'momo'>('card');
  const [promoCode, setPromoCode] = useState('');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200 overflow-y-auto py-4">
      
      {/* 📦 CONTENEUR PRINCIPAL DU MODAL (Inspiré de original-2f2f9c783376fa351415a88571cb5601.webp) */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-4xl w-full overflow-hidden flex flex-col font-sans my-auto">
        
        {/* 🔔 EN-TÊTE DU MODAL */}
        <div className="p-6 border-b border-slate-200 flex items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <div>
              <h2 className="text-lg font-semibold text-slate-700 tracking-tight">Check Subscription and Proceed to Payment</h2>
              <p className="text-xs text-slate-400 mt-0.5">Add a new payment method to your account to active your premium feature.</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 border border-slate-200 hover:bg-slate-50 text-slate-400 hover:text-slate-600 rounded-xl transition-all cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        {/* 🗺️ CORPS DU MODAL : DEUX COLONNES ASYMÉTRIQUES */}
        <div className="flex flex-col lg:flex-row flex-1">
          
          {/* COLONNE GAUCHE : OPTIONS & INFOS DE PAIEMENT (60%) */}
          <div className="flex-1 p-6 sm:p-8 space-y-6 border-b lg:border-b-0 lg:border-r border-slate-200">
            
            {/* 1. Subscription options */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-slate-900 tracking-tight">Subscription options</h3>
              
              <div className="grid grid-cols-1 gap-3">
                {/* Option 12 mois */}
                <div 
                  onClick={() => setSubscriptionType('12month')}
                  className={`border p-4 rounded-xl flex items-center justify-between gap-4 cursor-pointer transition-all ${
                    subscriptionType === '12month'
                      ? 'border-brand-primary bg-brand-primary/[0.02] ring-1 ring-brand-primary'
                      : 'border-slate-200/80 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                      subscriptionType === '12month' ? 'border-brand-primary' : 'border-slate-300'
                    }`}>
                      {subscriptionType === '12month' && <div className="w-2 h-2 rounded-full bg-brand-primary" />}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-900">12 month</p>
                      <p className="text-xs text-slate-400">$3.99/month</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-brand-primary">For $47.88</p>
                    <p className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">Save $12</p>
                  </div>
                </div>

                {/* Option 1 mois */}
                <div 
                  onClick={() => setSubscriptionType('1month')}
                  className={`border p-4 rounded-xl flex items-center justify-between gap-4 cursor-pointer transition-all ${
                    subscriptionType === '1month'
                      ? 'border-brand-primary bg-brand-primary/[0.02] ring-1 ring-brand-primary'
                      : 'border-slate-200/80 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                      subscriptionType === '1month' ? 'border-brand-primary' : 'border-slate-300'
                    }`}>
                      {subscriptionType === '1month' && <div className="w-2 h-2 rounded-full bg-brand-primary" />}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-900">1 month</p>
                      <p className="text-xs text-slate-400">$4.88/month</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-slate-900">For $4.88</p>
                  </div>
                </div>
              </div>
            </div>

            {/* 2. Payment information */}
            <div className="space-y-4">
              <div className="flex items-center gap-1.5">
                <h3 className="text-sm font-semibold text-slate-900 tracking-tight">Payment information</h3>
                <Lock size={13} className="text-slate-400" />
              </div>

              {/* Sélecteur de méthode (Tabs horizontaux) */}
              <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
                <button 
                  onClick={() => setPaymentMethod('card')}
                  className={`px-4 py-2 text-xs font-semibold rounded-lg border transition-all flex items-center gap-2 cursor-pointer ${
                    paymentMethod === 'card'
                      ? 'border-brand-primary/20 bg-brand-primary/5 text-brand-primary'
                      : 'border-slate-200 text-slate-500 bg-white hover:bg-slate-50'
                  }`}
                >
                  <CreditCard size={14} /> Credit Card
                </button>
                <button 
                  onClick={() => setPaymentMethod('paypal')}
                  className={`px-4 py-2 text-xs font-semibold rounded-lg border transition-all flex items-center gap-2 cursor-pointer ${
                    paymentMethod === 'paypal'
                      ? 'border-brand-primary/20 bg-brand-primary/5 text-brand-primary'
                      : 'border-slate-200 text-slate-500 bg-white hover:bg-slate-50'
                  }`}
                >
                  Paypal
                </button>
                <button 
                  onClick={() => setPaymentMethod('apple')}
                  className={`px-4 py-2 text-xs font-semibold rounded-lg border transition-all flex items-center gap-2 cursor-pointer ${
                    paymentMethod === 'apple'
                      ? 'border-brand-primary/20 bg-brand-primary/5 text-brand-primary'
                      : 'border-slate-200 text-slate-500 bg-white hover:bg-slate-50'
                  }`}
                >
                  Apple
                </button>
                <button 
                  onClick={() => setPaymentMethod('momo')}
                  className={`px-4 py-2 text-xs font-semibold rounded-lg border transition-all flex items-center gap-2 cursor-pointer ${
                    paymentMethod === 'momo'
                      ? 'border-brand-primary/20 bg-brand-primary/5 text-brand-primary'
                      : 'border-slate-200 text-slate-500 bg-white hover:bg-slate-50'
                  }`}
                >
                  <Smartphone size={14} /> Momo
                </button>
              </div>

              {/* Formulaire de carte dynamique */}
              {paymentMethod === 'card' && (
                <div className="space-y-4 data-inputs-group">
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Name on card</label>
                    <div className="flex items-center gap-2 border border-slate-200 rounded-xl px-3 py-2 bg-slate-50/30 focus-within:border-slate-400 focus-within:bg-white transition-all">
                      <User size={14} className="text-slate-400" />
                      <input type="text" placeholder="Nisha Kumari" className="text-sm font-medium text-slate-800 w-full outline-none bg-transparent" />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Card Number</label>
                    <div className="flex items-center gap-2 border border-slate-200 rounded-xl px-3 py-2 bg-slate-50/30 focus-within:border-slate-400 focus-within:bg-white transition-all">
                      <CreditCard size={14} className="text-slate-400" />
                      <input type="text" placeholder="1234 1234 1234 1234" className="text-sm font-medium text-slate-800 w-full outline-none bg-transparent" />
                      <span className="text-[10px] font-semibold text-blue-600 bg-blue-50 px-1 rounded border border-blue-100">VISA</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Expiry</label>
                      <div className="flex items-center gap-2 border border-slate-200 rounded-xl px-3 py-2 bg-slate-50/30 focus-within:border-slate-400 focus-within:bg-white transition-all">
                        <Calendar size={14} className="text-slate-400" />
                        <input type="text" placeholder="06 / 2024" className="text-sm font-medium text-slate-800 w-full outline-none bg-transparent" />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">CVC</label>
                      <div className="flex items-center gap-2 border border-slate-200 rounded-xl px-3 py-2 bg-slate-50/30 focus-within:border-slate-400 focus-within:bg-white transition-all">
                        <Lock size={14} className="text-slate-400" />
                        <input type="password" placeholder="•••" className="text-sm font-medium text-slate-800 w-full outline-none bg-transparent tracking-widest" />
                      </div>
                    </div>
                  </div>

                  {/* Option de sauvegarde */}
                  <label className="flex items-center gap-2.5 pt-1 cursor-pointer select-none">
                    <input type="checkbox" defaultChecked className="w-4 h-4 accent-brand-primary rounded border-slate-300" />
                    <span className="text-xs font-medium text-slate-600">Save card for future payment</span>
                  </label>
                </div>
              )}

              {/* Formulaire Momo */}
              {paymentMethod === 'momo' && (
                <div className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Mobile Money Number</label>
                    <div className="flex items-center gap-2 border border-slate-200 rounded-xl px-3 py-2 bg-slate-50/30 focus-within:border-slate-400 focus-within:bg-white transition-all">
                      <Smartphone size={14} className="text-slate-400" />
                      <input type="tel" placeholder="+1 234 567 890" className="text-sm font-medium text-slate-800 w-full outline-none bg-transparent" />
                    </div>
                  </div>
                  <p className="text-[11px] text-slate-400 font-medium">You will receive a payment request on your Mobile Money account.</p>
                </div>
              )}

              {paymentMethod !== 'card' && paymentMethod !== 'momo' && (
                <div className="py-6 text-center text-xs text-slate-400 border border-dashed border-slate-200 rounded-2xl bg-slate-50/50">
                  Redirect session configuration for <span className="font-semibold capitalize">{paymentMethod}</span> protocol.
                </div>
              )}

            </div>
          </div>

          {/* COLONNE DROITE : RÉCAPITULATIF (FINITION COMPACTE DE DROITE - 40%) */}
          <div className="w-full lg:w-80 shrink-0 p-6 sm:p-8 bg-slate-50/50 flex flex-col justify-between gap-6">
            
            <div className="space-y-5">
              {/* Entête Summary */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-sm font-semibold text-slate-900 tracking-tight">
                  <span>Summary</span>
                  <Info size={13} className="text-slate-400" />
                </div>
                {/* Menu devise */}
                <div className="flex items-center gap-1 px-2 py-1 bg-white border border-slate-200 rounded-lg text-[11px] font-semibold text-slate-700 cursor-pointer shadow-sm">
                  <span>USD</span>
                  <ChevronDown size={10} className="text-slate-400" />
                </div>
              </div>

              {/* Code promo input */}
              <div className="flex gap-2">
                <input 
                  type="text" 
                  placeholder="Promo code" 
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value)}
                  className="bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-medium text-slate-800 outline-none focus:border-slate-400 w-full shadow-inner/5"
                />
                <DashboardButton variant="primary" className="!w-auto px-3 py-1.5 text-xs">
                  Apply
                </DashboardButton>
              </div>

              {/* Lignes de prix calculées */}
              <div className="space-y-3 pt-2">
                <div className="flex items-start justify-between text-xs">
                  <div>
                    <p className="font-semibold text-slate-800">Total for {subscriptionType === '1month' ? '1 month' : '12 month'}</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">{subscriptionType === '1month' ? 'Billed monthly' : 'Billed annually'}</p>
                  </div>
                  <span className="font-semibold text-slate-900">
                    {subscriptionType === '1month' ? '$4.99' : '$47.88'}
                  </span>
                </div>

                <hr className="border-slate-200/60" />

                <div className="flex items-center justify-between text-sm">
                  <span className="font-semibold text-slate-900">Total amount due</span>
                  <span className="font-semibold text-slate-900 text-base">
                    {subscriptionType === '1month' ? '$4.99' : '$47.88'}
                  </span>
                </div>
              </div>

              {/* Pays de facturation */}
              <div className="space-y-1.5 pt-2">
                <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">Billing Country</label>
                <div className="flex items-center justify-between px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 shadow-sm cursor-pointer hover:border-slate-300 transition-all">
                    <div className="flex items-center gap-2">
                      <span className="w-4 h-3 bg-slate-200 inline-block rounded-sm overflow-hidden text-[9px] font-black text-center leading-3">&#x1F1F7;&#x1F1FC;</span>
                      <span>Rwanda</span>
                    </div>
                  <ChevronDown size={12} className="text-slate-400" />
                </div>
              </div>
            </div>

            {/* CTA Bouton de paiement final & mentions légales de sécurité */}
            <div className="space-y-4 pt-4 lg:pt-0">
              <DashboardButton variant="primary">
                Pay {subscriptionType === '1month' ? '$4.99' : '$47.88'}
              </DashboardButton>

              {/* Notes légales discrètes basées sur original-2f2f9c783376fa351415a88571cb5601.webp */}
              <div className="space-y-2.5 text-[10px] text-slate-400/90 leading-normal font-medium px-1">
                <div className="flex items-start gap-2">
                  <Info size={12} className="text-slate-300 shrink-0 mt-0.5" />
                  <p>Subscription auto-renews every month. You next billing date is scheduled safely.</p>
                </div>
                <div className="flex items-start gap-2">
                  <ShieldCheck size={12} className="text-slate-300 shrink-0 mt-0.5" />
                  <p>Payments are protected with end-to-end TLS encryption and standard privacy laws.</p>
                </div>
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};