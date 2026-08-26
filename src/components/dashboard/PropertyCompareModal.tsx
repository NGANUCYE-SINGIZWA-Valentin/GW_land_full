import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, ArrowRightLeft, Building2, MapPin, Maximize2, ShieldCheck, Zap } from 'lucide-react';
import type { Property } from '@/types/property';

interface PropertyCompareModalProps {
  isOpen: boolean;
  onClose: () => void;
  availableProperties: Property[];
}

export const PropertyCompareModal: React.FC<PropertyCompareModalProps> = ({
  isOpen,
  onClose,
  availableProperties,
}) => {
  const [selectedIds, setSelectedIds] = useState<string[]>(() =>
    availableProperties.slice(0, 3).map((p) => p.id)
  );

  if (!isOpen) return null;

  const comparedProperties = availableProperties.filter((p) => selectedIds.includes(p.id));

  const toggleSelect = (id: string) => {
    if (selectedIds.includes(id)) {
      if (selectedIds.length > 1) {
        setSelectedIds(selectedIds.filter((item) => item !== id));
      }
    } else {
      if (selectedIds.length < 4) {
        setSelectedIds([...selectedIds, id]);
      }
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 backdrop-blur-md overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="relative bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl w-full max-w-5xl overflow-hidden my-auto max-h-[90vh] flex flex-col"
        >
          {/* Header */}
          <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800/80 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50 flex-shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
                <ArrowRightLeft size={20} />
              </div>
              <div>
                <h3 className="text-lg font-extrabold text-slate-800 dark:text-white">
                  Property Comparison Matrix
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Compare metrics, pricing, size, and zoning features side-by-side
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-white flex items-center justify-center transition-all cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>

          {/* Quick Selection Pills */}
          <div className="p-4 border-b border-slate-100 dark:border-slate-800/60 bg-slate-50/30 dark:bg-slate-950/40 flex items-center gap-2 overflow-x-auto no-scrollbar flex-shrink-0">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider px-2 flex-shrink-0">
              Select (Max 4):
            </span>
            {availableProperties.map((p) => {
              const isSelected = selectedIds.includes(p.id);
              return (
                <button
                  key={p.id}
                  onClick={() => toggleSelect(p.id)}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 flex-shrink-0 border cursor-pointer ${
                    isSelected
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                      : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
                  }`}
                >
                  {isSelected && <Check size={12} />}
                  <span className="truncate max-w-[140px]">{p.title}</span>
                </button>
              );
            })}
          </div>

          {/* Comparison Matrix Table Body */}
          <div className="p-6 overflow-y-auto overflow-x-auto flex-1 custom-scrollbar">
            <div className="min-w-[600px] grid grid-cols-5 gap-4">
              {/* Metric Label Column */}
              <div className="col-span-1 space-y-6 pt-44 font-bold text-xs text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                <div className="h-10 flex items-center">Price (RWF)</div>
                <div className="h-10 flex items-center">Price / sqm</div>
                <div className="h-10 flex items-center">Land Size</div>
                <div className="h-10 flex items-center">Location</div>
                <div className="h-10 flex items-center">Zoning Category</div>
                <div className="h-10 flex items-center">Utilities Included</div>
              </div>

              {/* Compared Properties Columns */}
              {comparedProperties.map((prop) => {
                const pricePerSqm = prop.size_value
                  ? Math.round(prop.price_rwf / prop.size_value)
                  : 0;

                return (
                  <div key={prop.id} className="col-span-1 flex flex-col space-y-6">
                    {/* Header Card */}
                    <div className="h-44 flex flex-col justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/60">
                      <img
                        src={prop.image_url || '/assets/images/gw-homes-og.png'}
                        alt={prop.title}
                        className="w-full h-24 object-cover rounded-xl"
                      />
                      <span className="text-xs font-bold text-slate-800 dark:text-white truncate mt-2">
                        {prop.title}
                      </span>
                    </div>

                    {/* Metrics Values */}
                    <div className="h-10 flex items-center font-extrabold text-sm text-indigo-600 dark:text-indigo-400">
                      RWF {Number(prop.price_rwf).toLocaleString()}
                    </div>

                    <div className="h-10 flex items-center font-semibold text-xs text-slate-700 dark:text-slate-300">
                      RWF {pricePerSqm.toLocaleString()} / sqm
                    </div>

                    <div className="h-10 flex items-center font-semibold text-xs text-slate-700 dark:text-slate-300">
                      {prop.size_value} {prop.size_unit}
                    </div>

                    <div className="h-10 flex items-center text-xs text-slate-600 dark:text-slate-400 truncate">
                      <MapPin size={12} className="mr-1 flex-shrink-0 text-slate-400" />
                      <span className="truncate">{prop.sector}, {prop.district}</span>
                    </div>

                    <div className="h-10 flex items-center">
                      <span className="px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[11px] font-bold border border-slate-200 dark:border-slate-700">
                        {prop.zoning || 'Residential (R1)'}
                      </span>
                    </div>

                    <div className="h-10 flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
                      <Zap size={14} /> Water & Power Ready
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
