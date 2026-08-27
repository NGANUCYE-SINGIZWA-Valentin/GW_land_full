import React from 'react';
import { TrendingUp, Eye, MessageCircle, DollarSign, ChevronRight, Sparkles } from 'lucide-react';

interface TopPerformingItem {
  name: string;
  views: number;
  inquiries?: number;
  revenue?: string;
  location?: string;
}

interface TopPerformingListProps {
  items: TopPerformingItem[];
  onViewAll?: () => void;
  onItemClick?: (item: TopPerformingItem, index: number) => void;
  title?: string;
}

export const TopPerformingList: React.FC<TopPerformingListProps> = ({ 
  items = [], 
  onViewAll, 
  onItemClick, 
  title = 'Top Performing Listings' 
}) => {
  const safeItems = Array.isArray(items) ? items : [];

  return (
    <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/80 shadow-[0_2px_12px_-3px_rgba(0,0,0,0.04)] w-full">
      <div className="flex justify-between items-center mb-5">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-[#54B5BB]/15 text-[#1B395F] border border-[#54B5BB]/30">
            <TrendingUp size={18} />
          </div>
          <div>
            <h2 className="text-base font-extrabold text-slate-800 tracking-tight">{title}</h2>
            <p className="text-xs text-slate-400">Listings receiving the highest engagement</p>
          </div>
        </div>

        {onViewAll && (
          <button
            onClick={onViewAll}
            className="text-xs font-extrabold text-[#1B395F] hover:text-[#54B5BB] hover:underline flex items-center gap-1 transition-colors cursor-pointer"
          >
            View All <ChevronRight size={13} />
          </button>
        )}
      </div>

      <div className="space-y-2.5">
        {safeItems.length === 0 ? (
          <div className="p-6 text-center text-xs text-slate-400">No performance records found.</div>
        ) : (
          safeItems.map((item, i) => (
            <div 
              key={i} 
              onClick={() => onItemClick?.(item, i)} 
              className="flex items-center justify-between p-3 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-white hover:border-slate-200 hover:shadow-xs gap-3 cursor-pointer transition-all"
            >
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-black flex-shrink-0 ${
                  i === 0 
                    ? 'bg-amber-100 text-amber-800 border border-amber-300' 
                    : i === 1 
                    ? 'bg-slate-200 text-slate-800 border border-slate-300' 
                    : 'bg-[#54B5BB]/15 text-[#1B395F] border border-[#54B5BB]/30'
                }`}>
                  #{i + 1}
                </div>

                <div className="flex flex-col min-w-0">
                  <span className="text-xs sm:text-sm font-extrabold text-slate-800 truncate hover:text-[#1B395F]">
                    {item.name}
                  </span>
                  <div className="flex items-center gap-3 text-[11px] text-slate-400 mt-0.5">
                    <span className="flex items-center gap-1 font-semibold text-slate-600">
                      <Eye size={11} className="text-[#54B5BB]" />
                      {item.views.toLocaleString()} views
                    </span>
                    {item.inquiries !== undefined && (
                      <span className="flex items-center gap-1 font-semibold text-slate-600">
                        <MessageCircle size={11} className="text-blue-500" />
                        {item.inquiries} leads
                      </span>
                    )}
                    {item.revenue !== undefined && (
                      <span className="flex items-center gap-1 font-bold text-emerald-600">
                        <DollarSign size={11} />
                        {item.revenue}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1 text-xs font-bold text-[#1B395F]">
                <Sparkles size={14} className="text-amber-500" />
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
