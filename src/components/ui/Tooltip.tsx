import React, { useState, useRef, useEffect, ReactNode } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { HelpCircle, Info, ShieldCheck, CheckCircle2, Clock, AlertTriangle, XCircle, Copy, Check, Sparkles } from 'lucide-react';

export type TooltipPosition = 'top' | 'bottom' | 'left' | 'right';
export type TooltipVariant = 'dark' | 'light' | 'brand' | 'warning' | 'success' | 'danger';

export interface TooltipProps {
  content: ReactNode;
  title?: string;
  children: ReactNode;
  position?: TooltipPosition;
  variant?: TooltipVariant;
  delay?: number;
  interactive?: boolean;
  disabled?: boolean;
  className?: string;
  maxWidth?: string;
  showArrow?: boolean;
}

export const Tooltip: React.FC<TooltipProps> = ({
  content,
  title,
  children,
  position = 'top',
  variant = 'dark',
  delay = 150,
  interactive = false,
  disabled = false,
  className = '',
  maxWidth = 'max-w-xs sm:max-w-sm',
  showArrow = true,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const showTooltip = () => {
    if (disabled) return;
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => setIsVisible(true), delay);
  };

  const hideTooltip = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => setIsVisible(false), interactive ? 100 : 0);
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const getPositionClasses = () => {
    switch (position) {
      case 'bottom':
        return 'top-full left-1/2 -translate-x-1/2 mt-2';
      case 'left':
        return 'right-full top-1/2 -translate-y-1/2 mr-2';
      case 'right':
        return 'left-full top-1/2 -translate-y-1/2 ml-2';
      case 'top':
      default:
        return 'bottom-full left-1/2 -translate-x-1/2 mb-2';
    }
  };

  const getArrowClasses = () => {
    switch (position) {
      case 'bottom':
        return 'bottom-full left-1/2 -translate-x-1/2 border-b-current border-t-transparent border-x-transparent';
      case 'left':
        return 'left-full top-1/2 -translate-y-1/2 border-l-current border-r-transparent border-y-transparent';
      case 'right':
        return 'right-full top-1/2 -translate-y-1/2 border-r-current border-l-transparent border-y-transparent';
      case 'top':
      default:
        return 'top-full left-1/2 -translate-x-1/2 border-t-current border-b-transparent border-x-transparent';
    }
  };

  const getVariantClasses = () => {
    switch (variant) {
      case 'light':
        return 'bg-white text-slate-800 border border-slate-200 shadow-xl shadow-slate-900/10';
      case 'brand':
        return 'bg-[#1B395F] text-white border border-[#54B5BB]/30 shadow-xl shadow-[#1B395F]/30';
      case 'warning':
        return 'bg-amber-950 text-amber-100 border border-amber-500/30 shadow-xl shadow-amber-950/40';
      case 'success':
        return 'bg-emerald-950 text-emerald-100 border border-emerald-500/30 shadow-xl shadow-emerald-950/40';
      case 'danger':
        return 'bg-rose-950 text-rose-100 border border-rose-500/30 shadow-xl shadow-rose-950/40';
      case 'dark':
      default:
        return 'bg-slate-900/95 backdrop-blur-md text-slate-100 border border-slate-700/60 shadow-2xl shadow-slate-950/60';
    }
  };

  return (
    <div
      ref={containerRef}
      className={`relative inline-flex items-center ${className}`}
      onMouseEnter={showTooltip}
      onMouseLeave={hideTooltip}
      onFocus={showTooltip}
      onBlur={hideTooltip}
    >
      {children}

      <AnimatePresence>
        {isVisible && !disabled && (
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: position === 'top' ? 4 : position === 'bottom' ? -4 : 0, x: position === 'left' ? 4 : position === 'right' ? -4 : 0 }}
            animate={{ opacity: 1, scale: 1, y: 0, x: 0 }}
            exit={{ opacity: 0, scale: 0.94 }}
            transition={{ duration: 0.14, ease: [0.16, 1, 0.3, 1] }}
            className={`absolute z-[9999] pointer-events-auto ${getPositionClasses()} ${maxWidth} w-max min-w-[140px] px-3.5 py-2.5 rounded-2xl text-xs font-normal leading-relaxed ${getVariantClasses()}`}
            onMouseEnter={() => interactive && clearTimeout(timeoutRef.current!)}
            onMouseLeave={hideTooltip}
            role="tooltip"
          >
            {title && (
              <div className="font-bold text-[13px] tracking-tight mb-1 text-white flex items-center gap-1.5 border-b border-white/10 pb-1">
                {title}
              </div>
            )}
            <div className="font-medium">{content}</div>

            {showArrow && (
              <div
                className={`absolute w-0 h-0 border-4 pointer-events-none ${getArrowClasses()}`}
                style={{
                  color:
                    variant === 'light'
                      ? '#ffffff'
                      : variant === 'brand'
                      ? '#1B395F'
                      : variant === 'warning'
                      ? '#451a03'
                      : variant === 'success'
                      ? '#022c22'
                      : variant === 'danger'
                      ? '#4c0519'
                      : '#0f172a',
                }}
              />
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

/* ─── Column Header Info Tooltip ────────────────────────────────────────── */
export interface ColumnInfoTooltipProps {
  label: string;
  tooltipText: string;
  icon?: ReactNode;
}

export const ColumnHeaderTooltip: React.FC<ColumnInfoTooltipProps> = ({
  label,
  tooltipText,
  icon = <Info size={13} className="text-slate-400 hover:text-brand-primary transition-colors cursor-help inline-block ml-1" />,
}) => {
  return (
    <div className="inline-flex items-center gap-1">
      <span>{label}</span>
      <Tooltip content={tooltipText} position="top" variant="dark" maxWidth="max-w-xs">
        <span className="inline-flex items-center justify-center p-0.5 rounded-full hover:bg-slate-100 transition-colors">
          {icon}
        </span>
      </Tooltip>
    </div>
  );
};

/* ─── Truncated Text Cell with Full Context & Copy Tooltip ────────────── */
export interface TruncatedCellTooltipProps {
  text: string;
  fullText?: string;
  subtext?: string;
  maxWidthClass?: string;
  allowCopy?: boolean;
  badge?: string;
  icon?: ReactNode;
}

export const TruncatedCellTooltip: React.FC<TruncatedCellTooltipProps> = ({
  text,
  fullText,
  subtext,
  maxWidthClass = 'max-w-[180px]',
  allowCopy = false,
  badge,
  icon,
}) => {
  const [copied, setCopied] = useState(false);
  const displayText = fullText || text;

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(displayText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Tooltip
      interactive={allowCopy}
      position="top"
      variant="dark"
      maxWidth="max-w-xs sm:max-w-sm"
      content={
        <div className="space-y-1.5">
          <div className="flex items-center justify-between gap-3">
            <span className="font-semibold text-slate-100">{displayText}</span>
            {allowCopy && (
              <button
                type="button"
                onClick={handleCopy}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-white/10 hover:bg-white/20 text-[11px] font-bold text-white transition-all cursor-pointer flex-shrink-0"
              >
                {copied ? <Check size={11} className="text-emerald-400" /> : <Copy size={11} />}
                {copied ? 'Copied' : 'Copy'}
              </button>
            )}
          </div>
          {subtext && <p className="text-[11px] text-slate-300 font-normal leading-relaxed">{subtext}</p>}
          {badge && (
            <span className="inline-block px-2 py-0.5 rounded-md bg-[#54B5BB]/20 text-[#54B5BB] text-[10px] font-bold">
              {badge}
            </span>
          )}
        </div>
      }
    >
      <div className={`flex items-center gap-1.5 min-w-0 ${maxWidthClass} cursor-help group`}>
        {icon && <span className="flex-shrink-0 text-slate-400 group-hover:text-brand-primary">{icon}</span>}
        <span className="truncate font-medium text-slate-700 group-hover:text-brand-primary transition-colors">
          {text}
        </span>
      </div>
    </Tooltip>
  );
};

/* ─── Interactive Property Status Badge with Explanatory Tooltip ────────── */
export interface PropertyStatusTooltipProps {
  status: 'approved' | 'pending' | 'rejected' | 'sold' | 'archived' | 'featured' | 'under_review' | string;
  isFeatured?: boolean;
  statusNotes?: string;
  className?: string;
}

const PROPERTY_STATUS_META: Record<
  string,
  {
    label: string;
    description: string;
    pillClass: string;
    dotClass: string;
    icon: ReactNode;
    variant: TooltipVariant;
  }
> = {
  approved: {
    label: 'Approved / Live',
    description:
      'Publicly active on the Rwanda land marketplace. Verified buyers can view title parcel details, schedule site visits, and submit direct inquiries.',
    pillClass: 'bg-emerald-50 text-emerald-700 border-emerald-200/80 hover:bg-emerald-100/70',
    dotClass: 'bg-emerald-500',
    icon: <CheckCircle2 size={13} className="text-emerald-600" />,
    variant: 'dark',
  },
  published: {
    label: 'Published',
    description:
      'Publicly live on the marketplace. All verified buyers can inspect parcel specs and contact you directly.',
    pillClass: 'bg-emerald-50 text-emerald-700 border-emerald-200/80 hover:bg-emerald-100/70',
    dotClass: 'bg-emerald-500',
    icon: <CheckCircle2 size={13} className="text-emerald-600" />,
    variant: 'dark',
  },
  pending: {
    label: 'Pending Review',
    description:
      'Under administrative vetting with the National Land Authority registry. Listing will automatically go live once ownership and boundary titles are verified.',
    pillClass: 'bg-amber-50 text-amber-700 border-amber-200/80 hover:bg-amber-100/70',
    dotClass: 'bg-amber-500 animate-pulse',
    icon: <Clock size={13} className="text-amber-600" />,
    variant: 'warning',
  },
  under_review: {
    label: 'Under Review',
    description:
      'A moderator is inspecting submitted UPI documents and satellite coordinate overlays.',
    pillClass: 'bg-indigo-50 text-indigo-700 border-indigo-200/80 hover:bg-indigo-100/70',
    dotClass: 'bg-indigo-500',
    icon: <HelpCircle size={13} className="text-indigo-600" />,
    variant: 'dark',
  },
  rejected: {
    label: 'Revision Required',
    description:
      'The submission requires corrections (e.g. invalid parcel dimensions, mismatched owner names, or blurry deed scans). Click to view reviewer comments.',
    pillClass: 'bg-rose-50 text-rose-700 border-rose-200/80 hover:bg-rose-100/70',
    dotClass: 'bg-rose-500',
    icon: <XCircle size={13} className="text-rose-600" />,
    variant: 'danger',
  },
  sold: {
    label: 'Sold / Closed',
    description:
      'Transaction finalized and deed transferred. Removed from marketplace search; retained in your portfolio archive for valuation records.',
    pillClass: 'bg-slate-100 text-slate-700 border-slate-300 hover:bg-slate-200',
    dotClass: 'bg-slate-500',
    icon: <ShieldCheck size={13} className="text-slate-600" />,
    variant: 'dark',
  },
  archived: {
    label: 'Archived',
    description:
      'Deactivated by seller or administrator. Can be restored anytime from your property management table.',
    pillClass: 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200',
    dotClass: 'bg-slate-400',
    icon: <AlertTriangle size={13} className="text-slate-500" />,
    variant: 'dark',
  },
};

export const PropertyStatusBadgeTooltip: React.FC<PropertyStatusTooltipProps> = ({
  status,
  isFeatured = false,
  statusNotes,
  className = '',
}) => {
  const normStatus = (status || 'pending').toLowerCase();
  const meta = PROPERTY_STATUS_META[normStatus] || {
    label: status.charAt(0).toUpperCase() + status.slice(1),
    description: `Current property lifecycle status: ${status}`,
    pillClass: 'bg-slate-100 text-slate-700 border-slate-200',
    dotClass: 'bg-slate-400',
    icon: <Info size={13} />,
    variant: 'dark' as TooltipVariant,
  };

  return (
    <div className={`inline-flex items-center gap-1.5 ${className}`}>
      <Tooltip
        title={`Status: ${meta.label}`}
        content={
          <div className="space-y-1.5 max-w-[260px]">
            <p className="text-xs text-slate-200 leading-snug">{meta.description}</p>
            {statusNotes && (
              <div className="mt-1 p-2 rounded-xl bg-white/10 text-[11px] text-amber-200 font-mono">
                Notes: {statusNotes}
              </div>
            )}
            <div className="pt-1 flex items-center justify-between text-[10px] text-slate-400 border-t border-white/10">
              <span>Lifecycle: {normStatus}</span>
              <span className="text-[#54B5BB] font-semibold">GW Land Registry</span>
            </div>
          </div>
        }
        position="top"
        variant={meta.variant}
      >
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border transition-all cursor-help select-none ${meta.pillClass}`}
        >
          <span className={`w-1.5 h-1.5 rounded-full ${meta.dotClass}`} />
          {meta.label}
        </span>
      </Tooltip>

      {isFeatured && (
        <Tooltip
          title="Featured Listing"
          content="Promoted to top search ranks, homepage spotlight, and priority buyer newsletter with 4.2x higher lead volume."
          position="top"
          variant="brand"
        >
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-gradient-to-r from-amber-500/20 to-teal-500/20 text-amber-800 dark:text-amber-300 border border-amber-300/60 shadow-xs cursor-help">
            <Sparkles size={11} className="text-amber-500 animate-spin-slow" />
            Featured
          </span>
        </Tooltip>
      )}
    </div>
  );
};

/* ─── User Status Badge with Interactive Permissions Tooltip ────────────── */
export const UserStatusBadgeTooltip: React.FC<{
  status: 'approved' | 'pending' | 'blocked' | string;
  role?: string;
  isVerified?: boolean;
}> = ({ status, role = 'User', isVerified = false }) => {
  const normStatus = (status || 'pending').toLowerCase();

  const userMeta: Record<string, { label: string; desc: string; pill: string; dot: string }> = {
    approved: {
      label: 'Approved',
      desc: 'Active verified account. Permitted to submit properties, message buyers, and execute land transactions.',
      pill: 'bg-emerald-50 text-emerald-700 border-emerald-200/80',
      dot: 'bg-emerald-500',
    },
    pending: {
      label: 'Pending',
      desc: 'Registration in progress awaiting email validation or preliminary identity approval.',
      pill: 'bg-amber-50 text-amber-700 border-amber-200/80',
      dot: 'bg-amber-500 animate-pulse',
    },
    blocked: {
      label: 'Blocked',
      desc: 'Account suspended due to policy violations or unresolved buyer dispute reports.',
      pill: 'bg-rose-50 text-rose-700 border-rose-200/80',
      dot: 'bg-rose-500',
    },
  };

  const current = userMeta[normStatus] || {
    label: status,
    desc: `Account status: ${status}`,
    pill: 'bg-slate-100 text-slate-700 border-slate-200',
    dot: 'bg-slate-400',
  };

  return (
    <div className="inline-flex items-center gap-1.5">
      <Tooltip
        title={`Account: ${current.label}`}
        content={
          <div className="space-y-1.5 max-w-[240px]">
            <p className="text-xs text-slate-200">{current.desc}</p>
            <div className="text-[10px] text-slate-400 pt-1 border-t border-white/10 flex justify-between">
              <span>Role: {role}</span>
              <span className={isVerified ? 'text-emerald-400 font-bold' : 'text-slate-400'}>
                {isVerified ? 'ID Verified' : 'Standard'}
              </span>
            </div>
          </div>
        }
        position="top"
        variant="dark"
      >
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border transition-all cursor-help ${current.pill}`}
        >
          <span className={`w-1.5 h-1.5 rounded-full ${current.dot}`} />
          {current.label}
        </span>
      </Tooltip>

      {isVerified && (
        <Tooltip
          title="Verified Land Agent"
          content="National ID and professional broker credentials audited by GW Land trust & safety team."
          position="top"
          variant="brand"
        >
          <span className="inline-flex items-center gap-1 p-1 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200 cursor-help">
            <ShieldCheck size={13} className="text-emerald-600" />
          </span>
        </Tooltip>
      )}
    </div>
  );
};
