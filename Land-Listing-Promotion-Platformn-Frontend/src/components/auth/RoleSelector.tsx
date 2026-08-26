import React from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronDown } from 'lucide-react';
import type { UserRole } from './AuthContext';

interface RoleSelectorProps {
  value: UserRole | '';
  onChange: (role: UserRole) => void;
  error?: string;
}

export const RoleSelector: React.FC<RoleSelectorProps> = ({ value, onChange, error }) => {
  const { t } = useTranslation();
  const ROLE_OPTIONS: { role: Extract<UserRole, 'Seller' | 'Buyer'>; label: string }[] = [
    { role: 'Buyer', label: t('auth.buyer') },
    { role: 'Seller', label: t('auth.seller') },
  ];
  return (
    <div>
      <label className="block text-sm font-semibold text-slate-700 mb-1.5">
        {t('auth.iAmA')}
      </label>
      <div className="relative">
        <select
          value={value}
          onChange={e => onChange(e.target.value as UserRole)}
          className={`w-full appearance-none px-4 py-3 pr-10 rounded-xl border bg-white text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-brand-primary ${
            error ? 'border-red-400 text-red-500' : value ? 'border-brand-primary text-slate-700' : 'border-gray-200 text-gray-400'
          }`}
        >
          <option value="" disabled>{t('auth.selectYourRole')}</option>
          {ROLE_OPTIONS.map(({ role, label }) => (
            <option key={role} value={role}>{label}</option>
          ))}
        </select>
        <ChevronDown size={16} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
      </div>
      {error && <p className="mt-1.5 text-xs text-red-500 font-medium">{error}</p>}
    </div>
  );
};
