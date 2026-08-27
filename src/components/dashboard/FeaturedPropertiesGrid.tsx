import React from 'react';
import { ChevronLeft, ChevronRight, ArrowUpRight } from 'lucide-react';

interface FeaturedProperty {
  id: string;
  image: string;
  title: string;
  location: string;
  price: string;
  tag: string;
}

interface FeaturedPropertiesGridProps {
  title: string;
  properties: FeaturedProperty[];
  onViewAll?: () => void;
  onPrev?: () => void;
  onNext?: () => void;
  onCardClick?: (propertyId: string) => void;
}

export const FeaturedPropertiesGrid: React.FC<FeaturedPropertiesGridProps> = ({
  title,
  properties = [],
  onViewAll,
  onPrev,
  onNext,
  onCardClick
}) => {
  const safeProperties = Array.isArray(properties) ? properties : [];

  return (
    <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-sm w-full min-w-0">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-5">
        <h2 className="text-sm sm:text-base text-base font-medium tracking-tight antialiased text-slate-700 truncate">{title}</h2>
        <div className="flex items-center justify-between sm:justify-end gap-4 flex-shrink-0">
          <button
            onClick={onViewAll}
            className="text-xs font-semibold text-brand-primary hover:text-brand-primary-hover hover:underline"
          >
            View All
          </button>
          <div className="flex gap-1">
            <button
              onClick={onPrev}
              className="p-1.5 border border-slate-200 text-slate-400 hover:text-slate-700 rounded-lg transition-colors"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              onClick={onNext}
              className="p-1.5 border border-slate-200 text-slate-400 hover:text-slate-700 rounded-lg transition-colors"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 w-full min-w-0">
        {safeProperties.map((item, i) => (
          <div
            key={i}
            onClick={() => onCardClick?.(item.id)}
            className="group border border-slate-200 rounded-2xl overflow-hidden hover:shadow-md transition-all cursor-pointer min-w-0 w-full bg-white"
          >
            <div className="relative h-40 xs:h-44 bg-slate-100 overflow-hidden">
              <img src={item.image} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
            </div>
            <div className="p-4 space-y-1 min-w-0">
              <span className="text-[10px] text-base font-medium tracking-tight antialiased uppercase tracking-wider text-slate-400 block truncate">{item.tag}</span>
              <h3 className="text-sm text-base font-medium tracking-tight antialiased text-slate-700 truncate">{item.title}</h3>
              <p className="text-xs text-slate-400 truncate">{item.location}</p>
              <div className="flex justify-between items-center pt-2 gap-2">
                <span className="text-sm text-base font-medium tracking-tight antialiased font-black text-slate-700 truncate">{item.price}</span>
                <button className="p-1.5 bg-brand-primary hover:bg-brand-primary-hover text-white rounded-lg transition-colors flex-shrink-0">
                  <ArrowUpRight size={14} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};