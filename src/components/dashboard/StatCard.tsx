import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { ArrowUpRight, TrendingUp, Sparkles } from 'lucide-react';

export interface StatCardProps {
  title: string;
  value: string;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  icon: React.ReactNode;
  showSubtext?: boolean;
  isActive?: boolean;
  accentGradient?: 'indigo' | 'emerald' | 'amber' | 'cyan' | 'purple' | 'teal';
  onClick?: () => void;
}

const GRADIENT_MAP = {
  indigo: 'from-indigo-600 to-blue-500 shadow-indigo-500/25',
  emerald: 'from-emerald-500 to-teal-600 shadow-emerald-500/25',
  amber: 'from-amber-500 to-orange-500 shadow-amber-500/25',
  cyan: 'from-cyan-500 to-blue-600 shadow-cyan-500/25',
  purple: 'from-purple-600 to-indigo-600 shadow-purple-500/25',
  teal: 'from-teal-500 to-emerald-500 shadow-teal-500/25',
};

const BORDER_ACCENT_MAP = {
  indigo: 'group-hover:border-indigo-500/40',
  emerald: 'group-hover:border-emerald-500/40',
  amber: 'group-hover:border-amber-500/40',
  cyan: 'group-hover:border-cyan-500/40',
  purple: 'group-hover:border-purple-500/40',
  teal: 'group-hover:border-teal-500/40',
};

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  change = '+12.5%',
  changeType = 'positive',
  icon,
  showSubtext = true,
  isActive = false,
  accentGradient = 'indigo',
  onClick
}) => {
  const reduceMotion = useReducedMotion();
  const gradientStyle = GRADIENT_MAP[accentGradient] || GRADIENT_MAP.indigo;
  const borderHoverStyle = BORDER_ACCENT_MAP[accentGradient] || BORDER_ACCENT_MAP.indigo;

  return (
    <motion.div
      onClick={onClick}
      whileHover={reduceMotion ? undefined : { y: -4, scale: 1.01 }}
      whileTap={reduceMotion ? undefined : { scale: 0.98 }}
      transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
      className={`relative bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-xl flex flex-col justify-between cursor-pointer group min-w-0 w-full min-h-[135px] transition-all duration-300 ${borderHoverStyle} ${
        isActive ? 'ring-2 ring-indigo-500 shadow-lg shadow-indigo-500/10' : ''
      }`}
    >
      {/* Top ambient highlight line */}
      <div className={`absolute top-0 left-6 right-6 h-[2px] bg-gradient-to-r ${gradientStyle} opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-full`} />

      {/* Card Header: Value & Title + Icon Badge */}
      <div className="flex items-start justify-between gap-4 w-full">
        <div className="flex flex-col space-y-1 min-w-0">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 truncate">
            {title}
          </span>
          <span className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-800 dark:text-white leading-tight truncate">
            {value}
          </span>
        </div>

        {/* Floating Gradient Icon Badge */}
        <div className={`w-11 h-11 rounded-2xl bg-gradient-to-tr ${gradientStyle} text-white shadow-md flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300`}>
          {icon}
        </div>
      </div>

      {/* Card Footer: Trend Pill / Subtext or Progress Bar */}
      {showSubtext ? (
        <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100 dark:border-slate-800/60 w-full">
          <div className="flex items-center gap-1.5 text-[11px] font-bold">
            <span className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full border ${
              changeType === 'positive'
                ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/40'
                : changeType === 'negative'
                ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-800/40'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700'
            }`}>
              <ArrowUpRight size={12} className={changeType === 'negative' ? 'rotate-90' : ''} />
              {change}
            </span>
            <span className="text-slate-400 dark:text-slate-500 font-normal truncate">vs last month</span>
          </div>

          <Sparkles size={13} className="text-slate-300 dark:text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
      ) : (
        <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden mt-3">
          <div className={`h-full rounded-full bg-gradient-to-r ${gradientStyle} transition-all duration-500 w-full`} />
        </div>
      )}
    </motion.div>
  );
};