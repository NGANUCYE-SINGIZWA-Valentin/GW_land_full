import React from 'react';

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
  variant?: 'rectangular' | 'circular' | 'rounded' | 'text';
  animation?: 'pulse' | 'wave' | 'none';
}

export const Skeleton: React.FC<SkeletonProps> = ({
  className = '',
  variant = 'rounded',
  animation = 'pulse',
  ...props
}) => {
  const variantClasses = {
    text: 'h-4 w-full rounded-md',
    circular: 'rounded-full shrink-0',
    rounded: 'rounded-2xl',
    rectangular: 'rounded-none',
  }[variant];

  const animClass = animation === 'pulse' ? 'animate-pulse' : animation === 'wave' ? 'relative overflow-hidden before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_2s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/20 dark:before:via-white/10 before:to-transparent' : '';

  return (
    <div
      className={`bg-slate-200/80 dark:bg-slate-800/80 ${variantClasses} ${animClass} ${className}`}
      {...props}
    />
  );
};

export const SkeletonText: React.FC<{
  lines?: number;
  className?: string;
  lineClassName?: string;
}> = ({ lines = 2, className = '', lineClassName = '' }) => {
  return (
    <div className={`space-y-2 w-full ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          variant="text"
          className={`${lineClassName} ${i === lines - 1 && lines > 1 ? 'w-3/5' : 'w-full'}`}
        />
      ))}
    </div>
  );
};

export const SkeletonBadge: React.FC<{ className?: string }> = ({ className = 'w-20 h-6' }) => (
  <Skeleton variant="rounded" className={`rounded-full ${className}`} />
);

export const SkeletonAvatar: React.FC<{ size?: number; className?: string }> = ({
  size = 40,
  className = '',
}) => (
  <Skeleton
    variant="circular"
    className={`shrink-0 ${className}`}
    style={{ width: size, height: size }}
  />
);

export const SkeletonButton: React.FC<{ className?: string }> = ({
  className = 'h-10 w-28 rounded-2xl',
}) => <Skeleton variant="rounded" className={className} />;

export default Skeleton;
