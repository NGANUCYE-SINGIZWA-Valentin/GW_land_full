import React from 'react';
import { Eye } from 'lucide-react';

interface PropertyData {
  image: string;
  name: string;
  location: string;
  type: string;
  units: number;
  cost: string;
  activeListings: number;
  views: string;
  status: 'Active' | 'Pending' | 'Sold';
}

export const PropertyRow: React.FC<{ property: PropertyData; onEyeClick?: (propertyId: string) => void }> = ({ property, onEyeClick }) => {
  const statusStyles = {
    Active: 'bg-emerald-50 text-emerald-600',
    Pending: 'bg-amber-50 text-amber-600',
    Sold: 'bg-purple-50 text-purple-600',
  };

  return (
    <tr className="border-b border-slate-50 last:border-0 hover:bg-slate-100 transition-colors">
      <td className="py-3 px-4 max-w-[200px]">
        <div className="flex items-center gap-3 min-w-0">
          <img src={property.image} alt={property.name} className="w-10 h-10 rounded-xl object-cover flex-shrink-0" />
          <div className="flex flex-col min-w-0">
            <span className="text-sm text-base font-medium tracking-tight antialiased text-slate-700 truncate">{property.name}</span>
            <span className="text-xs text-slate-400 truncate">{property.location}</span>
          </div>
        </div>
      </td>
      <td className="py-3 px-4 text-sm text-slate-700 text-base font-medium tracking-tight antialiased whitespace-nowrap">{property.type}</td>
      <td className="py-3 px-4 text-sm text-slate-700 text-base font-medium tracking-tight antialiased text-center">{property.units}</td>
      <td className="py-3 px-4 text-sm text-slate-700 text-base font-medium tracking-tight antialiased whitespace-nowrap">{property.cost}</td>
      <td className="py-3 px-4 text-sm text-slate-700 text-base font-medium tracking-tight antialiased text-center">{property.activeListings}</td>
      <td className="py-3 px-4 text-sm text-slate-700 text-base font-medium tracking-tight antialiased whitespace-nowrap">{property.views}</td>
      <td className="py-3 px-4 whitespace-nowrap">
        <span className={`text-xs font-medium tracking-tight antialiased px-2.5 py-1 rounded-lg inline-block ${statusStyles[property.status]}`}>
          {property.status}
        </span>
      </td>
      <td className="py-3 px-4 text-right whitespace-nowrap">
        <button
          className="text-slate-400 hover:text-brand-primary p-1 rounded-lg transition-colors cursor-pointer"
          title="Voir plus"
          onClick={() => onEyeClick?.(property.name)}
        >
          <Eye size={18} />
        </button>
      </td>
    </tr>
  );
};