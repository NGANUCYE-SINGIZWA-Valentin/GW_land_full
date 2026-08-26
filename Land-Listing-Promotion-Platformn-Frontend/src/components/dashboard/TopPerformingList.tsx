import React from 'react';
import { TrendingUp, Eye, MessageCircle, DollarSign } from 'lucide-react';

interface TopPerformingItem {
  name: string;
  views: number;
  inquiries?: number;
  revenue?: string;
}

interface TopPerformingListProps {
  items: TopPerformingItem[];
  onViewAll?: () => void;
  onItemClick?: (item: TopPerformingItem, index: number) => void;
}

export const TopPerformingList: React.FC<TopPerformingListProps> = ({ items, onViewAll, onItemClick }) => {
  return (
    <div className="bg-white p-5 sm:p-6 rounded-2xl shadow-sm shadow-slate-200 w-full">
      <div className="flex justify-between items-center mb-5">
        <h2 className="text-sm sm:text-base font-medium tracking-tight antialiased text-slate-700 truncate">Top Performing</h2>
        <button
          onClick={onViewAll}
          className="text-xs font-semibold text-brand-primary hover:text-brand-primary-hover hover:underline flex-shrink-0"
        >
          View All
        </button>
      </div>
      <div className="space-y-3">
        {items.map((item, i) => (
          <div key={i} onClick={() => onItemClick?.(item, i)} className="flex items-center justify-between p-2.5 rounded-xl border border-slate-50 hover:bg-slate-100 bg-slate-50/30 gap-2 cursor-pointer">
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0 ${i === 0 ? 'bg-amber-50 text-amber-600' : i === 1 ? 'bg-slate-100 text-slate-500' : 'bg-orange-50 text-orange-600'}`}>
                <TrendingUp size={14} />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-sm font-medium text-slate-700 truncate">{item.name}</span>
                <div className="flex items-center gap-3 text-[10px] text-slate-400">
                  <span className="flex items-center gap-1"><Eye size={10} />{item.views.toLocaleString()}</span>
                  {item.inquiries !== undefined && (
                    <span className="flex items-center gap-1"><MessageCircle size={10} />{item.inquiries}</span>
                  )}
                  {item.revenue !== undefined && (
                    <span className="flex items-center gap-1"><DollarSign size={10} />{item.revenue}</span>
                  )}
                </div>
              </div>
            </div>
            <div className="flex-shrink-0">
              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-md ${i === 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-500'}`}>
                {i === 0 ? 'Top' : `#${i + 1}`}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};