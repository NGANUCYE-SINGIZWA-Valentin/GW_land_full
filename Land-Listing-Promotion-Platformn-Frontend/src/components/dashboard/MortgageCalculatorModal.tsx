import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calculator } from 'lucide-react';
import { useCurrency } from '@/context/CurrencyContext';

interface MortgageCalculatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialPriceRwf?: number;
}

export const MortgageCalculatorModal: React.FC<MortgageCalculatorModalProps> = ({
  isOpen,
  onClose,
  initialPriceRwf = 45000000,
}) => {
  const { formatCurrency } = useCurrency();
  const [propertyPrice, setPropertyPrice] = useState(initialPriceRwf);
  const [downPaymentPercent, setDownPaymentPercent] = useState(20);
  const [interestRate, setInterestRate] = useState(16); // Standard Rwandan bank mortgage rate (~15-17%)
  const [loanTenureYears, setLoanTenureYears] = useState(15);

  if (!isOpen) return null;

  // Calculation Logic
  const downPaymentRwf = (propertyPrice * downPaymentPercent) / 100;
  const loanPrincipal = propertyPrice - downPaymentRwf;
  const monthlyInterestRate = interestRate / 100 / 12;
  const totalPaymentsCount = loanTenureYears * 12;

  const monthlyPaymentRwf =
    monthlyInterestRate > 0
      ? (loanPrincipal *
          (monthlyInterestRate * Math.pow(1 + monthlyInterestRate, totalPaymentsCount))) /
        (Math.pow(1 + monthlyInterestRate, totalPaymentsCount) - 1)
      : loanPrincipal / totalPaymentsCount;

  const totalRepaymentRwf = monthlyPaymentRwf * totalPaymentsCount;
  const totalInterestRwf = totalRepaymentRwf - loanPrincipal;

  const rwfToUsdRate = 1380;
  const monthlyPaymentUsd = Math.round(monthlyPaymentRwf / rwfToUsdRate);

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 backdrop-blur-md overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="relative bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl w-full max-w-3xl overflow-hidden my-auto max-h-[90vh] flex flex-col"
        >
          {/* Header */}
          <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800/80 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50 flex-shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
                <Calculator size={20} />
              </div>
              <div>
                <h3 className="text-lg font-extrabold text-slate-800 dark:text-white">
                  Land Financing & Mortgage Estimator
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Estimate monthly payment terms based on commercial Rwandan bank rates
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

          <div className="p-6 overflow-y-auto space-y-6 flex-1 custom-scrollbar">
            {/* Input Controls */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Property Price */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  Property Price Base (RWF)
                </label>
                <input
                  type="number"
                  value={propertyPrice}
                  onChange={(e) => setPropertyPrice(Number(e.target.value))}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm font-bold text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {/* Down Payment % */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs font-bold text-slate-700 dark:text-slate-300">
                  <span className="uppercase tracking-wider">Down Payment ({downPaymentPercent}%)</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-extrabold">
                    {formatCurrency(Math.round(downPaymentRwf))}
                  </span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="50"
                  step="5"
                  value={downPaymentPercent}
                  onChange={(e) => setDownPaymentPercent(Number(e.target.value))}
                  className="w-full accent-emerald-500 cursor-pointer"
                />
              </div>

              {/* Interest Rate */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs font-bold text-slate-700 dark:text-slate-300">
                  <span className="uppercase tracking-wider">Annual Interest Rate</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-extrabold">
                    {interestRate}% per annum
                  </span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="22"
                  step="0.5"
                  value={interestRate}
                  onChange={(e) => setInterestRate(Number(e.target.value))}
                  className="w-full accent-emerald-500 cursor-pointer"
                />
              </div>

              {/* Loan Tenure */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs font-bold text-slate-700 dark:text-slate-300">
                  <span className="uppercase tracking-wider">Loan Period ({loanTenureYears} Years)</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-extrabold">
                    {totalPaymentsCount} Months
                  </span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="25"
                  step="1"
                  value={loanTenureYears}
                  onChange={(e) => setLoanTenureYears(Number(e.target.value))}
                  className="w-full accent-emerald-500 cursor-pointer"
                />
              </div>
            </div>

            {/* Results Display Hero */}
            <div className="p-6 rounded-3xl bg-gradient-to-br from-emerald-600 via-teal-700 to-slate-900 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="space-y-1 text-center md:text-left">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-200">
                  Estimated Monthly Payment
                </span>
                <div className="text-3xl sm:text-4xl font-black tracking-tight">
                  {formatCurrency(Math.round(monthlyPaymentRwf))}
                </div>
                <span className="text-xs text-emerald-100/80 block">
                  Approx. ${monthlyPaymentUsd.toLocaleString()} USD / month
                </span>
              </div>

              <div className="px-5 py-3 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-xs font-medium space-y-1.5 w-full md:w-auto">
                <div className="flex justify-between gap-4">
                  <span className="text-emerald-200">Loan Amount:</span>
                  <span className="font-bold">{formatCurrency(Math.round(loanPrincipal))}</span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-emerald-200">Total Interest:</span>
                  <span className="font-bold">{formatCurrency(Math.round(totalInterestRwf))}</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
