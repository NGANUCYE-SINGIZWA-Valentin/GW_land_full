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
  formatPrice: (priceRwf: number) => string;
}

const CurrencyContext = createContext<CurrencyContextType>({
  currency: 'RWF',
  setCurrency: () => {},
  formatPrice: (priceRwf: number) => `RWF ${priceRwf.toLocaleString()}`,
});

export const CurrencyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currency, setCurrency] = useState<Currency>('RWF');

  const formatPrice = (priceRwf: number): string => {
    if (!priceRwf || isNaN(priceRwf)) return 'Price on request';
    const rate = RATES[currency];
    const converted = priceRwf * rate;

    if (currency === 'RWF') {
      return `RWF ${Math.round(converted).toLocaleString()}`;
    }
    return `${SYMBOLS[currency]} ${Math.round(converted).toLocaleString()}`;
  };

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency, formatPrice }}>
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = () => useContext(CurrencyContext);
