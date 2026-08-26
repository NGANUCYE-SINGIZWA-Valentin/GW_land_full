import React from 'react';
import { AddPropertyFormData } from '@/types/addProperty';
import { useLocations } from '@/hooks/useLocations';

interface ReviewPublishStepProps {
  data: AddPropertyFormData;
  onEditStep: (stepIndex: number) => void;
}

const SummaryRow: React.FC<{ label: string; value: React.ReactNode }> = ({ label, value }) => (
  <div className="flex justify-between gap-4 py-1.5 text-sm">
    <span className="text-[#64748B]">{label}</span>
    <span className="text-[#1E293B] font-medium text-right">{value || '—'}</span>
  </div>
);

const SummaryCard: React.FC<{ title: string; onEdit: () => void; children: React.ReactNode }> = ({ title, onEdit, children }) => (
  <div className="border border-[#E2E8F0] rounded-xl p-4">
    <div className="flex items-center justify-between mb-2">
      <p className="text-sm font-semibold text-[#0F172A]">{title}</p>
      <button type="button" onClick={onEdit} className="text-xs font-medium text-blue-600 hover:underline">
        Edit
      </button>
    </div>
    {children}
  </div>
);

export const ReviewPublishStep: React.FC<ReviewPublishStepProps> = ({ data, onEditStep }) => {
  const { landDetails, locationPrice, media } = data;
  const { districts } = useLocations();
  const districtName = districts.find((d) => d.id === locationPrice.districtId)?.name;

  const priceLabel = [
    locationPrice.priceRwf ? `RWF ${Number(locationPrice.priceRwf).toLocaleString()}` : null,
    locationPrice.priceUsd ? `USD ${Number(locationPrice.priceUsd).toLocaleString()}` : null,
  ].filter(Boolean).join(' / ');

  return (
    <div className="space-y-5">
      <h2 className="text-base font-semibold text-[#0F172A]">Review &amp; Publish</h2>
      <p className="text-sm text-[#64748B]">Check everything below before submitting this listing for admin approval.</p>

      <SummaryCard title="Land Details" onEdit={() => onEditStep(0)}>
        <SummaryRow label="Title" value={landDetails.title} />
        <SummaryRow label="Description" value={landDetails.description} />
      </SummaryCard>

      <SummaryCard title="Location & Price" onEdit={() => onEditStep(1)}>
        <SummaryRow label="District" value={districtName} />
        <SummaryRow label="Price" value={priceLabel} />
        <SummaryRow label="Size" value={locationPrice.sizeValue ? `${locationPrice.sizeValue} ${locationPrice.sizeUnit}` : ''} />
        {(locationPrice.latitude || locationPrice.longitude) && (
          <SummaryRow label="Coordinates" value={`${locationPrice.latitude}, ${locationPrice.longitude}`} />
        )}
      </SummaryCard>

      <SummaryCard title="Media & Documents" onEdit={() => onEditStep(2)}>
        <SummaryRow label="Photos" value={`${media.images.length} uploaded`} />
        <SummaryRow label="Documents" value={`${media.documents.length} uploaded`} />
      </SummaryCard>
    </div>
  );
};
