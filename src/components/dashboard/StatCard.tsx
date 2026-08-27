import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { ArrowUpRight, ArrowDownRight, TrendingUp, Sparkles } from 'lucide-react';

export interface StatCardProps {
  title: string;
  value: string;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  icon: React.ReactNode;
  showSubtext?: boolean;
  isActive?: boolean;
  accentGradient?: 'indigo' | 'emerald' | 'amber' | 'cyan' | 'purple' | 'teal' | 'navy';
  onClick?: () => void;
  badgeText?: string;
  comparisonLabel?: string;
}

const ACCENT_STYLES = {
  navy: {
    iconBg: 'bg-[#1B395F]/10 text-[#1B395F] border-[#1B395F]/20',
    topBorder: 'bg-[#1B395F]',
    hoverBorder: 'group-hover:border-[#1B395F]/40',
    glow: 'group-hover:shadow-[#1B395F]/5',
  },
  teal: {
    iconBg: 'bg-[#54B5BB]/15 text-[#3FA2A8] border-[#54B5BB]/30',
    topBorder: 'bg-[#54B5BB]',
    hoverBorder: 'group-hover:border-[#54B5BB]/40',
    glow: 'group-hover:shadow-[#54B5BB]/10',
  },
  emerald: {
    iconBg: 'bg-emerald-50 text-emerald-600 border-emerald-200/60',
    topBorder: 'bg-emerald-500',
    hoverBorder: 'group-hover:border-emerald-500/40',
    glow: 'group-hover:shadow-emerald-500/5',
  },
  amber: {
    iconBg: 'bg-amber-50 text-amber-600 border-amber-200/60',
    topBorder: 'bg-amber-500',
    hoverBorder: 'group-hover:border-amber-500/40',
    glow: 'group-hover:shadow-amber-500/5',
  },
  indigo: {
    iconBg: 'bg-indigo-50 text-indigo-600 border-indigo-200/60',
    topBorder: 'bg-indigo-600',
    hoverBorder: 'group-hover:border-indigo-500/40',
    glow: 'group-hover:shadow-indigo-500/5',
  },
  cyan: {
    iconBg: 'bg-cyan-50 text-cyan-600 border-cyan-200/60',
    topBorder: 'bg-cyan-500',
    hoverBorder: 'group-hover:border-cyan-500/40',
    glow: 'group-hover:shadow-cyan-500/5',
  },
  purple: {
    iconBg: 'bg-purple-50 text-purple-600 border-purple-200/60',
    topBorder: 'bg-purple-600',
    hoverBorder: 'group-hover:border-purple-500/40',
    glow: 'group-hover:shadow-purple-500/5',
  },
};

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  change = '+12.5%',
  changeType = 'positive',
  icon,
  showSubtext = true,
  isActive = false,
  accentGradient = 'navy',
  onClick,
  badgeText,
  comparisonLabel = 'vs last month'
}) => {
  const reduceMotion = useReducedMotion();
  const style = ACCENT_STYLES[accentGradient] || ACCENT_STYLES.navy;

  return (
    <motion.div
      onClick={onClick}
      whileHover={reduceMotion ? undefined : { y: -3, scale: 1.01 }}
      whileTap={reduceMotion ? undefined : { scale: 0.98 }}
      transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
      className={`relative bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-[0_2px_12px_-3px_rgba(0,0,0,0.04)] hover:shadow-lg flex flex-col justify-between cursor-pointer group min-w-0 w-full min-h-[140px] transition-all duration-300 ${style.hoverBorder} ${
        isActive ? 'ring-2 ring-[#54B5BB] shadow-md shadow-[#54B5BB]/10' : ''
      }`}
    >
      {/* Subtle top indicator on hover */}
      <div className={`absolute top-0 left-5 right-5 h-[2px] ${style.topBorder} opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-full`} />

      {/* Header: Title & Icon Container */}
      <div className="flex items-start justify-between gap-3 w-full">
        <div className="flex flex-col space-y-1 min-w-0">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 truncate">
            {title}
          </span>
          <span className="text-2xl sm:text-3xl font-black tracking-tight text-slate-800 dark:text-white leading-tight truncate">
            {value}
          </span>
        </div>

        {/* Micro-badge icon container */}
        <div className={`w-11 h-11 rounded-2xl border ${style.iconBg} flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform duration-200 shadow-sm`}>
          {icon}
        </div>
      </div>

      {/* Footer: Trend chip / comparison or custom badge */}
      {showSubtext ? (
        <div className="flex items-center justify-between gap-2 pt-3 mt-2 border-t border-slate-100 dark:border-slate-800/80 w-full">
          <div className="flex items-center gap-1.5 text-[11px] font-bold">
            <span
              className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full border text-[10.5px] ${
                changeType === 'positive'
                  ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400 border-emerald-200/80 dark:border-emerald-800/50 font-bold'
                  : changeType === 'negative'
                  ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/30 dark:text-rose-400 border-rose-200/80 dark:border-rose-800/50 font-bold'
                  : 'bg-slate-50 text-slate-600 dark:bg-slate-800 dark:text-slate-400 border-slate-200 dark:border-slate-700 font-semibold'
              }`}
            >
              {changeType === 'positive' && <ArrowUpRight size={12} className="stroke-[2.5]" />}
              {changeType === 'negative' && <ArrowDownRight size={12} className="stroke-[2.5]" />}
              {change}
            </span>
            <span className="text-slate-400 dark:text-slate-500 font-medium truncate">{comparisonLabel}</span>
          </div>

          {badgeText && (
            <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full truncate">
              {badgeText}
            </span>
          )}
        </div>
      ) : (
        <div className="w-full h-1 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden mt-3" />
      )}
    </motion.div>
  );
};
