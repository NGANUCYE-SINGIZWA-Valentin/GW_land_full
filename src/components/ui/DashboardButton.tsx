import React from 'react';

interface DashboardButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'outline' | 'danger' | 'danger-outline';
  fullWidth?: boolean;
  children: React.ReactNode;
}

export const DashboardButton: React.FC<DashboardButtonProps> = ({
  variant = 'primary',
  fullWidth = true,
  children,
  className = '',
  ...props
}) => {
  const baseStyles =
    'py-2.5 px-4 font-semibold text-xs rounded-xl shadow-sm text-center tracking-tight transition-colors';
  const widthStyles = fullWidth ? 'w-full' : '';

  const isDisabled = props.disabled;

  const variants: Record<string, string> = {
    primary:
      'bg-brand-dark hover:bg-brand-dark-hover active:bg-brand-dark-active text-white',
    outline:
      `bg-white border border-slate-200 text-slate-700 ${isDisabled ? 'cursor-default' : 'cursor-pointer hover:bg-slate-50 hover:border-slate-300'}`,
    danger:
      'bg-red-600 hover:bg-red-700 active:bg-red-800 text-white',
    'danger-outline':
      'bg-white border border-red-200 text-red-600 hover:bg-red-50 cursor-pointer',
  };

  return (
    <button
      className={`${baseStyles} ${widthStyles} ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};