import React, { useMemo } from 'react';
import { Eye, MapPin, Clock, Maximize2 } from 'lucide-react';
import { LandDetailsData, LocationPriceData, MediaDocumentsData } from '@/types/addProperty';
import { useLocations } from '@/hooks/useLocations';

interface PropertyPreviewCardProps {
  landDetails: LandDetailsData;
  locationPrice: LocationPriceData;
  media: MediaDocumentsData;
}

export const PropertyPreviewCard: React.FC<PropertyPreviewCardProps> = ({ landDetails, locationPrice, media }) => {
  const { districts } = useLocations();
  const districtName = districts.find((d) => d.id === locationPrice.districtId)?.name;

  const coverImageUrl = useMemo(
    () => (media.images[0] ? URL.createObjectURL(media.images[0]) : null),
    [media.images]
  );

  const priceLabel = locationPrice.priceRwf
    ? `RWF ${Number(locationPrice.priceRwf).toLocaleString()}`
    : locationPrice.priceUsd
    ? `USD ${Number(locationPrice.priceUsd).toLocaleString()}`
    : 'Price not set';

  return (
    <div className="sticky top-0">
      <p className="text-sm font-semibold text-[#0F172A] mb-3">Preview</p>
      <div className="bg-white border border-[#E2E8F0] rounded-xl overflow-hidden shadow-sm">
        <div className="h-36 bg-gray-100 overflow-hidden">
          {coverImageUrl ? (
            <img src={coverImageUrl} alt="Land" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-[#94A3B8] text-xs">
              No image yet
            </div>
          )}
        </div>
        <div className="p-4">
          <div className="flex items-center justify-between mb-1">
            <h3 className="text-lg font-bold text-[#0F172A]">{priceLabel}</h3>
            <span className="flex items-center gap-1 text-[11px] text-[#64748B]">
              <Eye size={12} /> 0 views
            </span>
          </div>
          <p className="text-sm font-medium text-[#1E293B] mb-1">
            {landDetails.title || 'Untitled listing'}
          </p>
          <p className="flex items-center gap-1 text-xs text-[#64748B] mb-3">
            <Maximize2 size={12} />
            {locationPrice.sizeValue ? `${locationPrice.sizeValue} ${locationPrice.sizeUnit}` : '—'}
          </p>
          <div className="flex items-center gap-1 text-xs text-[#64748B] mb-1">
            <MapPin size={12} />
            <span className="truncate">{districtName || 'No district selected'}</span>
          </div>
          <div className="flex items-center gap-1 text-xs text-[#64748B]">
            <Clock size={12} />
            <span>Pending approval once published</span>
          </div>
        </div>
      </div>
    </div>
  );
};
