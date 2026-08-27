import React from 'react';

interface DashboardButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'teal' | 'outline' | 'danger' | 'danger-outline' | 'ghost' | 'soft-teal';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  pill?: boolean;
  children: React.ReactNode;
  icon?: React.ReactNode;
}

export const DashboardButton: React.FC<DashboardButtonProps> = ({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  pill = false,
  children,
  icon,
  className = '',
  ...props
}) => {
  const sizeStyles = {
    sm: 'py-2 px-3.5 text-xs gap-1.5',
    md: 'py-2.5 px-4.5 text-xs sm:text-sm gap-2',
    lg: 'py-3.5 px-6 text-sm sm:text-base gap-2.5 font-bold',
  }[size];

  const roundedStyles = pill
    ? 'rounded-full'
    : size === 'sm'
    ? 'rounded-xl'
    : 'rounded-2xl';

  const widthStyles = fullWidth ? 'w-full' : '';
  const isDisabled = props.disabled;

  const variants: Record<string, string> = {
    primary:
      'bg-[#1B395F] hover:bg-[#122844] active:bg-[#091524] text-white shadow-sm shadow-[#1B395F]/20 hover:shadow-md hover:shadow-[#1B395F]/30 hover:-translate-y-0.5 active:translate-y-0 cursor-pointer transition-all duration-200 active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-[#1B395F]/40',
    teal:
      'bg-[#54B5BB] hover:bg-[#439CA2] active:bg-[#32858B] text-white shadow-sm shadow-[#54B5BB]/25 hover:shadow-md hover:shadow-[#54B5BB]/35 hover:-translate-y-0.5 active:translate-y-0 cursor-pointer transition-all duration-200 active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-[#54B5BB]/40',
    'soft-teal':
      'bg-[#54B5BB]/12 hover:bg-[#54B5BB]/22 text-[#1B395F] dark:text-[#54B5BB] border border-[#54B5BB]/30 shadow-xs hover:shadow-sm hover:shadow-[#54B5BB]/15 hover:-translate-y-0.5 active:translate-y-0 font-bold cursor-pointer transition-all duration-200 active:scale-[0.98]',
    outline:
      `bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-bold shadow-xs ${
        isDisabled
          ? 'opacity-50 cursor-not-allowed'
          : 'cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/80 hover:border-[#54B5BB]/60 hover:text-[#1B395F] dark:hover:text-[#54B5BB] hover:shadow-sm hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98]'
      }`,
    danger:
      'bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white shadow-sm shadow-rose-600/20 hover:shadow-md hover:shadow-rose-600/30 hover:-translate-y-0.5 active:translate-y-0 cursor-pointer transition-all duration-200 active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-rose-500/40',
    'danger-outline':
      'bg-white dark:bg-slate-900 border border-rose-200 dark:border-rose-800/60 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 hover:border-rose-300 shadow-xs hover:shadow-sm hover:-translate-y-0.5 active:translate-y-0 cursor-pointer transition-all duration-200 active:scale-[0.98]',
    ghost:
      'bg-transparent text-slate-600 dark:text-slate-300 hover:text-[#1B395F] dark:hover:text-white hover:bg-slate-100/90 dark:hover:bg-slate-800 hover:-translate-y-0.5 active:translate-y-0 cursor-pointer transition-all duration-200',
  };

  return (
    <button
      className={`inline-flex items-center justify-center font-extrabold tracking-tight select-none ${sizeStyles} ${roundedStyles} ${widthStyles} ${variants[variant] || variants.primary} ${className}`}
      {...props}
    >
      {icon && <span className="flex-shrink-0">{icon}</span>}
      <span>{children}</span>
    </button>
  );
};
