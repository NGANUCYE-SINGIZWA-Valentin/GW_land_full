import React, { ReactElement } from 'react';

interface ApprovalItem {
  label: string;
  count: number;
  icon: ReactElement;
}

interface PendingApprovalsCardProps {
  items: ApprovalItem[];
  onViewAll?: () => void;
  onItemClick?: (index: number) => void;
}

export const PendingApprovalsCard: React.FC<PendingApprovalsCardProps> = ({ items = [], onViewAll, onItemClick }) => {
  const safeItems = Array.isArray(items) ? items : [];

  return (
    <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-sm w-full">
      <div className="flex justify-between items-center mb-5">
        <h2 className="text-sm sm:text-base font-medium tracking-tight antialiased text-slate-700 truncate">Pending Approvals</h2>
        <button
          onClick={onViewAll}
          className="text-xs font-semibold text-brand-primary hover:text-brand-primary-hover hover:underline flex-shrink-0"
        >
          View All
        </button>
      </div>
      <div className="space-y-3">
        {safeItems.map((item, i) => (
          <div
            key={i}
            onClick={() => onItemClick?.(i)}
            className="flex items-center justify-between p-2.5 rounded-xl border border-slate-50 hover:bg-slate-100 bg-slate-50/30 gap-2 cursor-pointer"
          >
            <div className="flex items-center gap-2.5 min-w-0 text-slate-500">
              <div className="flex-shrink-0 text-slate-400">{item.icon}</div>
              <span className="text-xs text-base font-medium tracking-tight antialiased text-slate-700 truncate">{item.label}</span>
            </div>
            <span className="text-xs text-base font-medium tracking-tight antialiased text-amber-600 bg-amber-50 w-7 h-6 flex items-center justify-center rounded-lg flex-shrink-0">{item.count}</span>
          </div>
        ))}
      </div>
    </div>
  );
};