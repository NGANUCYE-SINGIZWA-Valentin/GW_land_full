import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, DollarSign, Calendar, FileText, CheckCircle2 } from 'lucide-react';
import type { Property } from '@/types/property';

interface OfferModalProps {
  isOpen: boolean;
  onClose: () => void;
  property: Property | null;
  onSubmitOffer?: (offerData: { amountRwf: number; paymentTerms: string; notes: string }) => void;
}

export const OfferModal: React.FC<OfferModalProps> = ({
  isOpen,
  onClose,
  property,
  onSubmitOffer,
}) => {
  const [offerAmount, setOfferAmount] = useState(property?.price_rwf || 0);
  const [paymentTerms, setPaymentTerms] = useState('Cash (Full Lump Sum)');
  const [notes, setNotes] = useState('');
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen || !property) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmitOffer?.({
      amountRwf: offerAmount,
      paymentTerms,
      notes,
    });
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      onClose();
    }, 1800);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 backdrop-blur-md overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="relative bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl w-full max-w-lg overflow-hidden my-auto flex flex-col"
        >
          {/* Header */}
          <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800/80 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-brand-primary/10 text-brand-primary flex items-center justify-center font-bold">
                <DollarSign size={20} />
              </div>
              <div>
                <h3 className="text-lg font-extrabold text-slate-800 dark:text-white">
                  Make a Purchase Offer
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 truncate max-w-[240px]">
                  {property.title}
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-white flex items-center justify-center transition-all cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>

          {submitted ? (
            <div className="p-10 text-center space-y-3">
              <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 size={32} />
              </div>
              <h4 className="text-lg font-extrabold text-slate-800 dark:text-white">
                Offer Sent Successfully!
              </h4>
              <p className="text-xs text-slate-500 max-w-xs mx-auto">
                The land owner will review your offer and get in touch with you directly.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              {/* Asking Price Banner */}
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 flex justify-between items-center text-xs">
                <span className="text-slate-500 font-medium">Asking Price:</span>
                <span className="font-extrabold text-slate-800 dark:text-white">
                  RWF {Number(property.price_rwf).toLocaleString()}
                </span>
              </div>

              {/* Offer Amount Input */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  Your Offer Amount (RWF)
                </label>
                <input
                  type="number"
                  required
                  value={offerAmount}
                  onChange={(e) => setOfferAmount(Number(e.target.value))}
                  className="w-full px-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm font-bold text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-primary"
                />
              </div>

              {/* Payment Terms Select */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  Payment Method / Terms
                </label>
                <select
                  value={paymentTerms}
                  onChange={(e) => setPaymentTerms(e.target.value)}
                  className="w-full px-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm font-semibold text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-primary cursor-pointer"
                >
                  <option value="Cash (Full Lump Sum)">Cash (Full Lump Sum)</option>
                  <option value="Bank Mortgage Financing">Bank Mortgage Financing</option>
                  <option value="Installments (50% Down + 6 Months)">Installments (50% Down + 6 Months)</option>
                  <option value="Subject to Land Survey Verification">Subject to Land Survey Verification</option>
                </select>
              </div>

              {/* Notes / Message */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  Additional Contingencies / Message
                </label>
                <textarea
                  rows={3}
                  placeholder="E.g., Ready to close within 14 days pending title deed verification..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm font-medium text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-primary"
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full py-3 bg-brand-primary hover:bg-brand-primary-hover text-white rounded-2xl text-sm font-bold shadow-lg shadow-brand-primary/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Send size={16} /> Submit Offer
              </button>
            </form>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
