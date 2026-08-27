import React, { createContext, useContext, useState } from 'react';

export type Currency = 'RWF' | 'USD' | 'EUR' | 'GBP';

interface CurrencyRates {
  RWF: number;
  USD: number;
  EUR: number;
  GBP: number;
}

// Fixed conversion rates against RWF base
const RATES: CurrencyRates = {
  RWF: 1,
  USD: 1 / 1380,
  EUR: 1 / 1500,
  GBP: 1 / 1750,
};

const SYMBOLS: Record<Currency, string> = {
  RWF: 'RWF',
  USD: '$',
  EUR: '€',
  GBP: '£',
};

interface CurrencyContextType {
  currency: Currency;
  setCurrency: (c: Currency) => void;
  formatPrice: (priceRwf?: number | string | null, priceUsd?: number | string | null) => string;
  formatCurrency: (priceRwf?: number | string | null, priceUsd?: number | string | null) => string;
}

const defaultFormatter = (priceRwf?: number | string | null): string => {
  const num = Number(priceRwf);
  if (!priceRwf || isNaN(num) || num <= 0) return 'Price on request';
  return `RWF ${Math.round(num).toLocaleString()}`;
};

const CurrencyContext = createContext<CurrencyContextType>({
  currency: 'RWF',
  setCurrency: () => {},
  formatPrice: defaultFormatter,
  formatCurrency: defaultFormatter,
});

export const CurrencyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currency, setCurrency] = useState<Currency>('RWF');

  const formatPrice = (priceRwf?: number | string | null, priceUsd?: number | string | null): string => {
    const numRwf = Number(priceRwf);
    const numUsd = Number(priceUsd);

    if (currency === 'USD' && !isNaN(numUsd) && numUsd > 0) {
      return `$ ${Math.round(numUsd).toLocaleString()}`;
    }

    if (!priceRwf || isNaN(numRwf) || numRwf <= 0) {
      if (!isNaN(numUsd) && numUsd > 0) {
        return `$ ${Math.round(numUsd).toLocaleString()}`;
      }
      return 'Price on request';
    }

    const rate = RATES[currency] ?? 1;
    const converted = numRwf * rate;

    if (currency === 'RWF') {
      return `RWF ${Math.round(converted).toLocaleString()}`;
    }
    return `${SYMBOLS[currency] ?? '$'} ${Math.round(converted).toLocaleString()}`;
  };

  const formatCurrency = formatPrice;

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency, formatPrice, formatCurrency }}>
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = () => useContext(CurrencyContext);
