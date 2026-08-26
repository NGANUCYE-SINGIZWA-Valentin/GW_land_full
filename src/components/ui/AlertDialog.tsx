import React from 'react';
import { Trash2, RefreshCw, ArrowUpCircle, Settings, X } from 'lucide-react';

export type AlertVariant = 'danger' | 'primary' | 'success' | 'dark';

interface AlertDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: AlertVariant;
  isLoading?: boolean;
}

export const AlertDialog: React.FC<AlertDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  variant = "primary",
  isLoading = false,
}) => {
  if (!isOpen) return null;

  // 1. Dictionnaire d'icônes et configurations graphiques basées sur l'UI de référence
  const variantConfig = {
    danger: {
      icon: <Trash2 size={20} className="text-red-500" />,
      iconBg: "bg-red-50 border-red-100",
      btnConfirm: "bg-red-600 hover:bg-red-700 text-white shadow-sm focus:ring-red-500/20",
    },
    primary: {
      icon: <RefreshCw size={18} className="text-brand-primary animate-mid-spin" />, // 'brand-primary' de ton app
      iconBg: "bg-blue-50 border-blue-100",
      btnConfirm: "bg-brand-primary hover:bg-brand-primary/95 text-white shadow-sm focus:ring-brand-primary/20",
    },
    success: {
      icon: <ArrowUpCircle size={20} className="text-emerald-500" />,
      iconBg: "bg-emerald-50 border-emerald-100",
      btnConfirm: "bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm focus:ring-emerald-500/20",
    },
    dark: {
      icon: <Settings size={20} className="text-slate-600" />,
      iconBg: "bg-slate-100 border-slate-200",
      btnConfirm: "bg-slate-900 hover:bg-slate-800 text-white shadow-sm focus:ring-slate-900/20",
    },
  };

  const currentVariant = variantConfig[variant];

  return (
    <>
      {/* Backdrop translucide plein écran (sans blur, calqué sur ton overlay de drawer) */}
      <div
        className="fixed top-0 left-0 w-screen h-screen bg-slate-900/40 z-[10000] transition-opacity duration-300 opacity-100"
        onClick={onClose}
      />

      {/* Conteneur de la boîte d'alerte (Centré à l'écran) */}
      <div className="fixed inset-0 z-[10001] flex items-center justify-center p-4 pointer-events-none">
        <div className="w-full max-w-[440px] bg-white rounded-2xl border border-slate-200 shadow-xl p-6 pointer-events-auto flex flex-col gap-5 animate-in fade-in zoom-in-95 duration-150">
          
          {/* Structure Supérieure : Icône en haut à gauche et bouton de fermeture optionnel */}
          <div className="flex items-start justify-between">
            <div className={`w-10 h-10 rounded-xl border flex items-center justify-center ${currentVariant.iconBg}`}>
              {currentVariant.icon}
            </div>
            <button
              onClick={onClose}
              className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer"
            >
              <X size={16} />
            </button>
          </div>

          {/* Structure Centrale : Textes empilés d'après ton croquis/UI */}
          <div className="space-y-1.5 text-left">
            <h3 className="text-base font-semibold tracking-tight antialiased text-slate-700 tracking-tight antialiased">
              {title}
            </h3>
            <p className="text-xs font-normal text-slate-400 leading-relaxed antialiased">
              {description}
            </p>
          </div>

          {/* Structure Basse : Actions alignées à droite comme sur la capture d'écran */}
          <div className="flex items-center justify-end gap-2.5 pt-1">
            <button
              onClick={onClose}
              disabled={isLoading}
              className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-600 font-semibold text-xs rounded-xl transition-all cursor-pointer active:scale-[0.98] disabled:opacity-50"
            >
              {cancelLabel}
            </button>
            <button
              onClick={onConfirm}
              disabled={isLoading}
              className={`px-4 py-2 font-semibold text-xs rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-[0.98] disabled:opacity-70 focus:outline-none focus:ring-4 ${currentVariant.btnConfirm}`}
            >
              {isLoading && (
                <div className="w-3 h-3 rounded-full border-2 border-white/30 border-t-white animate-spin" />
              )}
              {confirmLabel}
            </button>
          </div>

        </div>
      </div>
    </>
  );
};