import React, { useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';

interface ChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  icon?: React.ReactNode;
  footer?: React.ReactNode;
}

export const ChatModal: React.FC<ChatModalProps> = ({
  isOpen, onClose, children, title, subtitle, icon, footer
}) => {
  // Lock body scroll while open
  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  // Close on Escape
  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    if (isOpen) document.addEventListener('keydown', h);
    return () => document.removeEventListener('keydown', h);
  }, [isOpen, onClose]);

  const scrollRef = useRef<HTMLDivElement>(null);
  // Auto-scroll to bottom when children change
  useEffect(() => {
    if (isOpen && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  });

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            key="chat-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm"
          />

          {/* Modal */}
          <motion.div
            key="chat-modal"
            initial={{ opacity: 0, scale: 0.96, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 20 }}
            transition={{ type: 'spring', damping: 26, stiffness: 320 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-8 pointer-events-none"
          >
            <div
              className="pointer-events-auto w-full max-w-2xl flex flex-col bg-white rounded-3xl shadow-2xl shadow-slate-900/20 border border-slate-200/80 overflow-hidden"
              style={{ maxHeight: 'min(760px, 90vh)' }}
            >
              {/* Header */}
              <div
                className="flex items-center justify-between px-6 py-4 flex-shrink-0 border-b border-slate-100"
                style={{ background: 'linear-gradient(135deg, #1B395F 0%, #2a5298 60%, #54B5BB 100%)' }}
              >
                <div className="flex items-center gap-3 min-w-0">
                  {icon && (
                    <div className="w-9 h-9 rounded-2xl bg-white/15 flex items-center justify-center text-white flex-shrink-0">
                      {icon}
                    </div>
                  )}
                  <div className="min-w-0">
                    <h2 className="text-base font-extrabold text-white truncate">{title}</h2>
                    {subtitle && <p className="text-xs text-white/70 font-medium">{subtitle}</p>}
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 rounded-xl text-white/70 hover:text-white hover:bg-white/15 transition-all flex-shrink-0 ml-3"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Scrollable message body */}
              <div
                ref={scrollRef}
                className="flex-1 overflow-y-auto p-6 space-y-5 custom-scrollbar min-h-0"
                style={{ background: '#f8fafc' }}
              >
                {children}
              </div>

              {/* Footer (reply bar) */}
              {footer && (
                <div className="flex-shrink-0 border-t border-slate-100 bg-white px-6 py-4 space-y-3">
                  {footer}
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
