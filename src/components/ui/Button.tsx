import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'teal' | 'outline' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  pill?: boolean;
  children: React.ReactNode;
  icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  pill = true,
  children,
  icon,
  className = '',
  ...props
}) => {
  const sizeStyles = {
    sm: 'px-4 py-2 text-xs gap-1.5',
    md: 'px-5 py-2.5 text-sm gap-2',
    lg: 'px-7 py-3.5 text-base gap-2.5 font-bold',
  }[size];

  const roundedStyles = pill ? 'rounded-full' : 'rounded-2xl';

  const variants = {
    primary:
      'bg-[#1B395F] hover:bg-[#122844] active:bg-[#091524] text-white shadow-sm shadow-[#1B395F]/20 hover:shadow-md hover:shadow-[#1B395F]/30 hover:-translate-y-0.5 active:translate-y-0 focus:ring-2 focus:ring-[#1B395F]/40',
    teal:
      'bg-[#54B5BB] hover:bg-[#439CA2] active:bg-[#32858B] text-white shadow-sm shadow-[#54B5BB]/25 hover:shadow-md hover:shadow-[#54B5BB]/35 hover:-translate-y-0.5 active:translate-y-0 focus:ring-2 focus:ring-[#54B5BB]/40',
    outline:
      'border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:border-[#54B5BB] text-slate-800 dark:text-slate-200 hover:text-[#1B395F] dark:hover:text-[#54B5BB] hover:bg-slate-50 dark:hover:bg-slate-800 shadow-xs hover:shadow-sm hover:-translate-y-0.5 active:translate-y-0',
    secondary:
      'bg-slate-800 hover:bg-[#1B395F] text-white shadow-sm hover:shadow-md hover:-translate-y-0.5 active:translate-y-0',
    ghost:
      'bg-transparent text-slate-700 dark:text-slate-300 hover:text-[#1B395F] dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 hover:-translate-y-0.5 active:translate-y-0',
  };

  return (
    <button
      className={`${roundedStyles} font-extrabold transition-all duration-200 flex items-center justify-center cursor-pointer active:scale-[0.98] select-none ${sizeStyles} ${variants[variant] || variants.primary} ${className}`}
      {...props}
    >
      {icon && <span className="flex-shrink-0">{icon}</span>}
      {children}
    </button>
  );
};
