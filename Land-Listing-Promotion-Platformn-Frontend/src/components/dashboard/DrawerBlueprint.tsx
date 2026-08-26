import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles } from 'lucide-react';

interface DrawerBlueprintProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
  width?: 'sm' | 'md' | 'lg' | 'xl';
}

const MODAL_WIDTH_CLASSES = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-2xl',
};

export const DrawerBlueprint: React.FC<DrawerBlueprintProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  icon,
  children,
  footer,
  width = 'md',
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[9998] flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
          {/* Backdrop Blur Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-md z-[9998]"
            onClick={onClose}
          />

          {/* Compact Centered Glassmorphic Modal Box */}
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 12 }}
            transition={{ type: 'spring', damping: 26, stiffness: 320 }}
            className={`relative w-full ${MODAL_WIDTH_CLASSES[width]} bg-white dark:bg-slate-900 backdrop-blur-2xl z-[9999] shadow-2xl border border-slate-200/80 dark:border-slate-800 rounded-3xl flex flex-col my-auto max-h-[85vh] overflow-hidden`}
          >
            {/* Glossy Modern Header */}
            <div
              className="p-5 sm:p-6 border-b border-slate-100 dark:border-slate-800/80 text-white flex items-center justify-between flex-shrink-0 relative overflow-hidden"
              style={{ background: 'linear-gradient(135deg, #1B395F 0%, #172a45 50%, #54B5BB 100%)' }}
            >
              <div className="absolute right-0 top-0 -mt-4 -mr-4 w-32 h-32 bg-white/10 rounded-full blur-2xl pointer-events-none" />
              <div className="flex items-center gap-3 min-w-0 z-10">
                {icon ? (
                  <div className="p-2.5 rounded-2xl bg-white/10 backdrop-blur-md text-white border border-white/20 flex-shrink-0">
                    {icon}
                  </div>
                ) : (
                  <div className="p-2.5 rounded-2xl bg-white/10 text-white flex-shrink-0">
                    <Sparkles size={18} />
                  </div>
                )}
                <div className="min-w-0">
                  <h2 className="text-base sm:text-lg font-black tracking-tight text-white truncate">{title}</h2>
                  {subtitle && (
                    <p className="text-xs text-white/80 truncate mt-0.5">{subtitle}</p>
                  )}
                </div>
              </div>

              <button
                onClick={onClose}
                className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-full transition-colors cursor-pointer z-10 flex-shrink-0"
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>

            {/* Scrollable Body */}
            <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5 custom-scrollbar bg-slate-50/50 dark:bg-slate-900/50 text-slate-800 dark:text-slate-200">
              {children}
            </div>

            {/* Interactive Footer */}
            {footer && (
              <div className="p-4 sm:p-5 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-wrap items-center justify-end gap-3 flex-shrink-0">
                {footer}
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};