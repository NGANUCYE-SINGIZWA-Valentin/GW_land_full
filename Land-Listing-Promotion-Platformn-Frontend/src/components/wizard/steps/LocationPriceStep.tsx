import React from 'react';
import { Field, Input, Select } from '@/components/wizard/FormField';
import { LocationPickerMap } from '@/components/wizard/LocationPickerMap';
import { LocationPriceData } from '@/types/addProperty';
import { useLocationPicker } from '@/hooks/useLocations';

interface LocationPriceStepProps {
  data: LocationPriceData;
  onChange: (data: LocationPriceData) => void;
}

export const LocationPriceStep: React.FC<LocationPriceStepProps> = ({ data, onChange }) => {
  const picker = useLocationPicker();

  const update = <K extends keyof LocationPriceData>(key: K, value: LocationPriceData[K]) => {
    onChange({ ...data, [key]: value });
  };

  return (
    <div className="space-y-5">
      <h2 className="text-base font-semibold text-[#0F172A]">Location &amp; Price</h2>

      <div className="grid grid-cols-2 gap-4">
        <Field label="Province" required>
          <Select
            value={picker.provinceId ?? ''}
            onChange={(e) => picker.selectProvince(e.target.value ? Number(e.target.value) : null)}
          >
            <option value="">Select province…</option>
            {picker.provinces.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </Select>
        </Field>
        <Field label="District" required>
          <Select
            value={picker.districtId ?? ''}
            onChange={(e) => {
              const id = e.target.value ? Number(e.target.value) : null;
              picker.selectDistrict(id);
              onChange({ ...data, districtId: id, sectorId: null });
            }}
            disabled={!picker.provinceId}
          >
            <option value="">Select district…</option>
            {picker.districts.map((d) => (
              <option key={d.id} value={d.id}>{d.name}</option>
            ))}
          </Select>
        </Field>
      </div>

      <Field label="Sector" required>
        <Select
          value={picker.sectorId ?? ''}
          onChange={(e) => {
            const id = e.target.value ? Number(e.target.value) : null;
            picker.selectSector(id);
            update('sectorId', id);
          }}
          disabled={!picker.districtId}
        >
          <option value="">{picker.sectorsLoading ? 'Loading sectors…' : 'Select sector…'}</option>
          {picker.sectors.map((s) => (
            <option key={s.id} value={s.id}>{s.name}</option>
          ))}
        </Select>
      </Field>

      <Field label="Pin the location on the map (optional)">
        <LocationPickerMap
          lat={data.latitude ? Number(data.latitude) : null}
          lng={data.longitude ? Number(data.longitude) : null}
          onChange={(lat, lng) => {
            onChange({ ...data, latitude: lat.toFixed(6), longitude: lng.toFixed(6) });
          }}
        />
        <p className="mt-1.5 text-xs text-[#94A3B8]">Click anywhere on the map to drop a pin, or drag it to fine-tune the exact spot.</p>
      </Field>

      <div className="grid grid-cols-2 gap-4">
        <Field label="Latitude (optional)">
          <Input
            value={data.latitude}
            onChange={(e) => update('latitude', e.target.value)}
            placeholder="-1.9536"
          />
        </Field>
        <Field label="Longitude (optional)">
          <Input
            value={data.longitude}
            onChange={(e) => update('longitude', e.target.value)}
            placeholder="30.0605"
          />
        </Field>
      </div>

      <Field label="Price — provide RWF and/or USD" required>
        <div className="grid grid-cols-2 gap-4">
          <div className="flex">
            <span className="flex items-center px-3 border border-r-0 border-[#E2E8F0] rounded-l-lg bg-[#F8FAFC] text-sm text-[#94A3B8]">RWF</span>
            <Input
              type="number"
              min="0"
              value={data.priceRwf}
              onChange={(e) => update('priceRwf', e.target.value)}
              placeholder="5000000"
              className="rounded-l-none flex-1"
            />
          </div>
          <div className="flex">
            <span className="flex items-center px-3 border border-r-0 border-[#E2E8F0] rounded-l-lg bg-[#F8FAFC] text-sm text-[#94A3B8]">USD</span>
            <Input
              type="number"
              min="0"
              value={data.priceUsd}
              onChange={(e) => update('priceUsd', e.target.value)}
              placeholder="4000"
              className="rounded-l-none flex-1"
            />
          </div>
        </div>
      </Field>

      <div className="grid grid-cols-2 gap-4">
        <Field label="Land size" required>
          <Input
            type="number"
            min="0"
            value={data.sizeValue}
            onChange={(e) => update('sizeValue', e.target.value)}
            placeholder="500"
          />
        </Field>
        <Field label="Unit" required>
          <Select value={data.sizeUnit} onChange={(e) => update('sizeUnit', e.target.value as 'sqm' | 'hectare')}>
            <option value="sqm">Square meters (sqm)</option>
            <option value="hectare">Hectares</option>
          </Select>
        </Field>
      </div>

      <h3 className="text-sm font-semibold text-[#0F172A] pt-2">Land Details</h3>

      <Field label="UPI — Unique Parcel Identifier (optional)">
        <Input
          value={data.upi}
          onChange={(e) => update('upi', e.target.value)}
          placeholder="e.g. 1/03/04/03/1234"
        />
      </Field>
      <p className="-mt-3 text-xs text-[#94A3B8]">The parcel number from the Rwanda land registry (LAIS). Listings with a UPI our team has checked show a verified badge.</p>

      <div className="grid grid-cols-2 gap-4">
        <Field label="Tenure type (optional)">
          <Select value={data.tenureType} onChange={(e) => update('tenureType', e.target.value as typeof data.tenureType)}>
            <option value="">Not specified</option>
            <option value="freehold">Freehold</option>
            <option value="leasehold">Leasehold</option>
            <option value="customary">Customary</option>
          </Select>
        </Field>
        <Field label="Land use (optional)">
          <Select value={data.landUse} onChange={(e) => update('landUse', e.target.value as typeof data.landUse)}>
            <option value="">Not specified</option>
            <option value="residential">Residential</option>
            <option value="commercial">Commercial</option>
            <option value="agricultural">Agricultural</option>
            <option value="mixed">Mixed use</option>
          </Select>
        </Field>
      </div>

      <Field label="Access & utilities (optional)">
        <div className="flex flex-wrap gap-4 pt-1">
          {([
            ['hasRoadAccess', 'Road access'],
            ['hasWater', 'Water'],
            ['hasElectricity', 'Electricity'],
          ] as const).map(([key, label]) => (
            <label key={key} className="flex items-center gap-2 text-sm text-[#334155] cursor-pointer">
              <input
                type="checkbox"
                checked={data[key]}
                onChange={(e) => update(key, e.target.checked)}
                className="w-4 h-4 rounded border-[#CBD5E1] text-brand-primary focus:ring-brand-primary"
              />
              {label}
            </label>
          ))}
        </div>
      </Field>
    </div>
  );
};
