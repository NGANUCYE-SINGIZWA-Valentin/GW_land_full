import React from 'react';
import { PropertyRow } from './PropertyRow';

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

interface ListingsTableProps {
  title: string;
  properties: PropertyData[];
  onViewAll?: () => void;
  viewAllLabel?: string;
  onPropertyEyeClick?: (propertyId: string) => void;
}

export const ListingsTable: React.FC<ListingsTableProps> = ({
  title,
  properties,
  onViewAll,
  viewAllLabel = 'View All',
  onPropertyEyeClick
}) => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden w-full min-w-0">
      <div className="flex justify-between items-center p-4 sm:p-6 border-b border-slate-50">
        <h2 className="text-sm sm:text-base text-base font-medium tracking-tight antialiased text-slate-700 truncate">{title}</h2>
        <button
          onClick={onViewAll}
          className="text-xs font-semibold text-brand-primary hover:text-brand-primary-hover hover:underline flex-shrink-0"
        >
          {viewAllLabel}
        </button>
      </div>

      <div className="w-full overflow-x-auto custom-scrollbar">
        <table className="w-full text-left border-collapse min-w-[700px]">
          <thead>
            <tr className="bg-slate-50/70 text-slate-400 text-[11px] text-base font-medium tracking-tight antialiase tracking-wider border-b border-slate-200">
              <th className="py-3 px-4">Property</th>
              <th className="py-3 px-4">Type</th>
              <th className="py-3 px-4 text-center">Units</th>
              <th className="py-3 px-4">Cost</th>
              <th className="py-3 px-4 text-center">Active</th>
              <th className="py-3 px-4">Views</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {properties.map((prop, index) => <PropertyRow key={index} property={prop} onEyeClick={onPropertyEyeClick} />)}
          </tbody>
        </table>
      </div>
    </div>
  );
};