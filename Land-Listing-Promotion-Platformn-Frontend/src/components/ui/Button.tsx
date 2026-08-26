import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'outline' | 'secondary';
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({ variant = 'primary', children, className = '', ...props }) => {
  const baseStyles = "px-6 py-2.5 rounded-full font-medium transition-all duration-300 flex items-center justify-center gap-2 text-sm";
  
  const variants = {
    primary: "bg-brand-primary hover:bg-brand-primary-hover text-white",
    outline: "border border-gray-200 hover:border-brand-primary text-brand-text hover:text-brand-primary",
    secondary: "bg-slate-800 hover:hover:bg-brand-primary-hover text-white"
  };

  return (
    <button className={`${baseStyles} ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
};