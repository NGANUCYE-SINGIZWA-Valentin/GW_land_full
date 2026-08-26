import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import GWLandLogo from '@/components/ui/GWLandLogo';

interface MobileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

export const MobileDrawer: React.FC<MobileDrawerProps> = ({ isOpen, onClose, children }) => {
  // Lock body scroll when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  return (
    <>
      {/* Backdrop overlay — visible jusqu'à xl (synchro avec Header) */}
      <div
        className={`xl:hidden fixed top-0 left-0 w-screen h-screen bg-black/40 backdrop-blur-sm z-[10000] transition-opacity duration-300 ${
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer panel — slides in from the right, visible jusqu'à xl */}
      <div
        className={`xl:hidden fixed right-0 top-0 bottom-0 w-full max-w-sm bg-white dark:bg-slate-900 z-[10001] shadow-2xl flex flex-col transition-transform duration-300 ease-in-out transform ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
        role="dialog"
        aria-modal="true"
        aria-label="Navigation menu"
      >
        {/* Fixed header with close button */}
        <div className="p-4 border-b border-gray-100 dark:border-slate-800 flex items-center justify-between flex-shrink-0 min-h-[60px]">
          <div className="flex items-center gap-2 h-9 overflow-visible">
            <GWLandLogo variant="color" className="h-full w-auto max-w-[120px] max-h-9 object-contain object-center" />
            <span className="text-base font-black tracking-tight text-slate-900 dark:text-white whitespace-nowrap">
              GW<span className="text-brand-primary dark:text-brand-secondary ml-0.5">Homes</span>
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
            aria-label="Close menu"
          >
            <X size={20} />
          </button>
        </div>

        {/* Scrollable content area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {children}
        </div>
      </div>
    </>
  );
};