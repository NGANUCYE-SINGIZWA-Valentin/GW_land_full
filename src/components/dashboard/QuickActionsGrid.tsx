import React, { ReactElement } from 'react';

interface ActionItem {
  label: string;
  icon: ReactElement;
}

interface QuickActionsGridProps {
  title?: string;
  actions: ActionItem[];
  onActionClick?: (index: number) => void;
}

export const QuickActionsGrid: React.FC<QuickActionsGridProps> = ({
  title = 'Quick Actions',
  actions,
  onActionClick
}) => {
  return (
    <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-sm w-full">
      <h2 className="text-sm sm:text-base text-base font-medium tracking-tight antialiased text-slate-700 mb-4">{title}</h2>
      <div className="grid grid-cols-2 gap-3">
        {actions.map((act, i) => (
          <button
            key={i}
            onClick={() => onActionClick?.(i)}
            className="group flex flex-col items-start gap-2 p-3 rounded-xl border border-orange-100/40 bg-orange-50/10 hover:bg-slate-100 text-left transition-all duration-200 w-full min-w-0"
          >
            <div className="text-slate-400 group-hover:text-brand-dark flex-shrink-0 transition-colors duration-200">
              {act.icon}
            </div>
            <span className="text-[11px] font-medium tracking-tight antialiased text-slate-700 group-hover:text-brand-dark truncate w-full transition-colors duration-200">
              {act.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};