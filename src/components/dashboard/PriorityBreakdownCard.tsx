import React from 'react';
import { Layers, CheckCircle2, AlertTriangle, Clock } from 'lucide-react';

interface PriorityItem {
  label: string;
  count: number;
  total: number;
  color: string;
  barColor: string;
  icon: React.ReactNode;
}

interface PriorityBreakdownCardProps {
  pendingCount?: number;
  approvedCount?: number;
  soldCount?: number;
  reportsCount?: number;
  title?: string;
}

export const PriorityBreakdownCard: React.FC<PriorityBreakdownCardProps> = ({
  pendingCount = 8,
  approvedCount = 42,
  soldCount = 14,
  reportsCount = 2,
  title = 'Listing Moderation & Status'
}) => {
  const total = (pendingCount + approvedCount + soldCount + reportsCount) || 1;
  const completionRate = Math.round(((approvedCount + soldCount) / total) * 100);

  const items: PriorityItem[] = [
    {
      label: 'Verified & Live',
      count: approvedCount,
      total,
      color: 'text-emerald-700',
      barColor: 'bg-emerald-500',
      icon: <CheckCircle2 size={13} className="text-emerald-500" />
    },
    {
      label: 'Pending Verification',
      count: pendingCount,
      total,
      color: 'text-amber-700',
      barColor: 'bg-amber-500',
      icon: <Clock size={13} className="text-amber-500" />
    },
    {
      label: 'Completed / Sold',
      count: soldCount,
      total,
      color: 'text-[#1B395F]',
      barColor: 'bg-[#1B395F]',
      icon: <Layers size={13} className="text-[#1B395F]" />
    },
    {
      label: 'Reports & Flagged',
      count: reportsCount,
      total,
      color: 'text-rose-700',
      barColor: 'bg-rose-500',
      icon: <AlertTriangle size={13} className="text-rose-500" />
    },
  ];

  return (
    <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/80 shadow-[0_2px_12px_-3px_rgba(0,0,0,0.04)] w-full">
      <div className="flex justify-between items-center mb-5">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-[#54B5BB]/15 text-[#1B395F] border border-[#54B5BB]/30">
            <Layers size={18} />
          </div>
          <div>
            <h2 className="text-base font-extrabold text-slate-800 tracking-tight">{title}</h2>
            <p className="text-xs text-slate-400">Inventory health and review queue</p>
          </div>
        </div>

        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-black bg-emerald-50 text-emerald-700 border border-emerald-200">
          {completionRate}% Live Rate
        </span>
      </div>

      <div className="space-y-4">
        {items.map((item, idx) => {
          const pct = Math.round((item.count / total) * 100);
          return (
            <div key={idx} className="space-y-1.5">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="flex items-center gap-1.5 text-slate-700">
                  {item.icon} {item.label}
                </span>
                <span className="text-slate-500">
                  <strong className={item.color}>{item.count}</strong> ({pct}%)
                </span>
              </div>
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                <div 
                  className={`h-full ${item.barColor} rounded-full transition-all duration-500`} 
                  style={{ width: `${Math.max(pct, item.count > 0 ? 3 : 0)}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
