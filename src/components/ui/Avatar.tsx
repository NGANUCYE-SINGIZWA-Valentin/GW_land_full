import React from 'react';

// A small, deterministic palette in the brand's family so avatars never
// clash with the navy/teal UI, no matter whose name hashes to what.
const PALETTE = [
  'bg-brand-primary text-white',
  'bg-brand-secondary text-white',
  'bg-amber-500 text-white',
  'bg-emerald-500 text-white',
  'bg-rose-500 text-white',
  'bg-indigo-500 text-white',
];

function colorFor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return PALETTE[Math.abs(hash) % PALETTE.length];
}

function initialsFor(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  return parts.slice(0, 2).map((p) => p[0]?.toUpperCase()).join('');
}

const SIZE_CLASSES = {
  sm: 'w-7 h-7 text-[10px]',
  md: 'w-9 h-9 text-xs',
  lg: 'w-12 h-12 text-sm',
  xl: 'w-16 h-16 text-base',
  '2xl': 'w-24 h-24 text-2xl',
};

interface AvatarProps {
  src?: string | null;
  name: string;
  size?: keyof typeof SIZE_CLASSES;
  className?: string;
}

export const Avatar: React.FC<AvatarProps> = ({ src, name, size = 'md', className = '' }) => {
  const base = `${SIZE_CLASSES[size]} rounded-full flex-shrink-0 overflow-hidden flex items-center justify-center font-bold ${className}`;

  if (src) {
    return <img src={src} alt={name} className={`${base} object-cover border border-slate-200`} />;
  }

  return (
    <div className={`${base} ${colorFor(name)}`} title={name}>
      {initialsFor(name)}
    </div>
  );
};
