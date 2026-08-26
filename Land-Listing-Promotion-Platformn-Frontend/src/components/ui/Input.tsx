import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  icon?: React.ReactNode;
}

export const Input: React.FC<InputProps> = ({ label, icon, className = '', type, ...props }) => {
  const isPassword = type === 'password';
  const [show, setShow] = useState(false);

  return (
    <div className="w-full space-y-1.5">
      {label && (
        <label className="text-xs font-semibold text-gray-500 dark:text-slate-400 ml-1 uppercase tracking-wider">
          {label}
        </label>
      )}
      <div className="relative flex items-center group">
        {icon && (
          <div className="absolute left-4 text-gray-400 group-focus-within:text-brand-primary dark:group-focus-within:text-brand-secondary transition-colors">
            {icon}
          </div>
        )}
        <input
          {...props}
          type={isPassword ? (show ? 'text' : 'password') : type}
          className={`w-full bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-brand-text dark:text-slate-100 text-sm rounded-xl focus:ring-1 focus:ring-brand-primary dark:focus:ring-brand-secondary focus:border-brand-primary dark:focus:border-brand-secondary block p-3 transition-all outline-none ${
            icon ? 'pl-11' : 'pl-4'
          } ${isPassword ? 'pr-11' : ''} ${className}`}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShow(v => !v)}
            className="absolute right-3 text-gray-400 hover:text-brand-primary dark:hover:text-brand-secondary transition-colors focus:outline-none"
            tabIndex={-1}
            aria-label={show ? 'Hide password' : 'Show password'}
          >
            {show ? <EyeOff size={17} /> : <Eye size={17} />}
          </button>
        )}
      </div>
    </div>
  );
};