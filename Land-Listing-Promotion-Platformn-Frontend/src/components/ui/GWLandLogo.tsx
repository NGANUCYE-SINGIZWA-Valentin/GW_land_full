import React from 'react';
import logoImg from '@/assets/logo bg (1).png';

interface GWLandLogoProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  variant?: 'color' | 'white';
}

export default function GWLandLogo({ variant = 'color', className = '', ...props }: GWLandLogoProps) {
  const isWhite = variant === 'white';

  return (
    <img
      src={logoImg}
      alt="GW Land"
      className={`block h-8 max-h-8 w-auto max-w-[140px] object-contain object-left select-none transition-transform duration-200 ${
        isWhite ? 'brightness-0 invert' : ''
      } ${className}`}
      loading="eager"
      {...props}
    />
  );
}