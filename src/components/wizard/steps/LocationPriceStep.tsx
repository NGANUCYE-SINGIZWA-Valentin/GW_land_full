import React, { useState } from 'react';
import { Field, Input, Select } from '@/components/wizard/FormField';
import { LocationPickerMap } from '@/components/wizard/LocationPickerMap';
import { LocationPriceData } from '@/types/addProperty';
import { useLocationPicker } from '@/hooks/useLocations';
import { CheckCircle2, AlertCircle, ArrowRightLeft, Sparkles, ShieldCheck } from 'lucide-react';

interface LocationPriceStepProps {
  data: LocationPriceData;
  onChange: (data: LocationPriceData) => void;
}

// Current approx benchmark rate (1 USD ~ 1,350 RWF)
const RWF_PER_USD = 1350;

export const LocationPriceStep: React.FC<LocationPriceStepProps> = ({ data, onChange }) => {
  const picker = useLocationPicker();

  const update = <K extends keyof LocationPriceData>(key: K, value: LocationPriceData[K]) => {
    onChange({ ...data, [key]: value });
  };

  // UPI regex pattern for Rwanda: e.g. 1/03/08/02/1234 or 5/01/02/03/456
  const isUpiValidFormat = (upi: string) => {
    if (!upi.trim()) return false;
    const clean = upi.trim();
    return /^[1-5]\/\d{2}\/\d{2}\/\d{2}\/\d{1,6}$/.test(clean);
  };

  const autoConvertRwfToUsd = () => {
    const rwf = parseFloat(data.priceRwf);
    if (!isNaN(rwf) && rwf > 0) {
      const approxUsd = Math.round(rwf / RWF_PER_USD);
      update('priceUsd', String(approxUsd));
    }
  };

  const autoConvertUsdToRwf = () => {
    const usd = parseFloat(data.priceUsd);
    if (!isNaN(usd) && usd > 0) {
      const approxRwf = Math.round(usd * RWF_PER_USD);
      update('priceRwf', String(approxRwf));
    }
  };

  const hasUpi = Boolean(data.upi && data.upi.trim().length > 0);
  const upiValid = hasUpi && isUpiValidFormat(data.upi);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-base font-bold text-[#0F172A]">Location &amp; Valuation</h2>
        <p className="text-xs text-slate-500 mt-0.5">Specify the administrative location in Rwanda, parcel valuation, and land registry identifiers.</p>
      </div>

      {/* Administrative Hierarchy */}
      <div className="bg-slate-50/70 p-4 rounded-2xl border border-slate-200/80 space-y-4">
        <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-600">Rwandan Administrative Location</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
      </div>

      {/* Map Picker */}
      <Field label="Pin the location on the map (optional)">
        <LocationPickerMap
          lat={data.latitude ? Number(data.latitude) : null}
          lng={data.longitude ? Number(data.longitude) : null}
          onChange={(lat, lng) => {
            onChange({ ...data, latitude: lat.toFixed(6), longitude: lng.toFixed(6) });
          }}
        />
        <p className="mt-1.5 text-xs text-[#94A3B8]">Click anywhere on the Rwanda map to drop a pin or fine-tune exact parcel GPS coordinates.</p>
      </Field>

      <div className="grid grid-cols-2 gap-4">
        <Field label="Latitude (GPS)">
          <Input
            value={data.latitude}
            onChange={(e) => update('latitude', e.target.value)}
            placeholder="-1.953600"
          />
        </Field>
        <Field label="Longitude (GPS)">
          <Input
            value={data.longitude}
            onChange={(e) => update('longitude', e.target.value)}
            placeholder="30.060500"
          />
        </Field>
      </div>

      {/* Pricing with Dual Conversion */}
      <div className="bg-slate-50/70 p-4 rounded-2xl border border-slate-200/80 space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-[#0F172A] uppercase tracking-wider">
            Price — provide RWF and/or USD <span className="text-rose-500">*</span>
          </label>
          <span className="text-[11px] text-slate-500">Benchmark: 1 USD ≈ 1,350 RWF</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <div className="flex">
              <span className="flex items-center px-3 border border-r-0 border-[#E2E8F0] rounded-l-xl bg-[#F8FAFC] text-xs font-bold text-slate-600">RWF</span>
              <Input
                type="number"
                min="0"
                value={data.priceRwf}
                onChange={(e) => update('priceRwf', e.target.value)}
                placeholder="50,000,000"
                className="rounded-l-none flex-1"
              />
            </div>
            {data.priceRwf && parseFloat(data.priceRwf) > 0 && (
              <div className="mt-1.5 flex items-center justify-between text-[11px] text-slate-500">
                <span>≈ ${(Math.round(parseFloat(data.priceRwf) / RWF_PER_USD)).toLocaleString()} USD</span>
                <button
                  type="button"
                  onClick={autoConvertRwfToUsd}
                  className="text-teal-600 hover:text-teal-700 font-bold flex items-center gap-1 cursor-pointer"
                >
                  <Sparkles size={11} /> Auto-fill USD
                </button>
              </div>
            )}
          </div>

          <div>
            <div className="flex">
              <span className="flex items-center px-3 border border-r-0 border-[#E2E8F0] rounded-l-xl bg-[#F8FAFC] text-xs font-bold text-slate-600">USD</span>
              <Input
                type="number"
                min="0"
                value={data.priceUsd}
                onChange={(e) => update('priceUsd', e.target.value)}
                placeholder="37,000"
                className="rounded-l-none flex-1"
              />
            </div>
            {data.priceUsd && parseFloat(data.priceUsd) > 0 && (
              <div className="mt-1.5 flex items-center justify-between text-[11px] text-slate-500">
                <span>≈ {(Math.round(parseFloat(data.priceUsd) * RWF_PER_USD)).toLocaleString()} RWF</span>
                <button
                  type="button"
                  onClick={autoConvertUsdToRwf}
                  className="text-teal-600 hover:text-teal-700 font-bold flex items-center gap-1 cursor-pointer"
                >
                  <Sparkles size={11} /> Auto-fill RWF
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Land Size */}
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
            <option value="sqm">Square meters (sqm / m²)</option>
            <option value="hectare">Hectares (ha)</option>
          </Select>
        </Field>
      </div>

      {/* Rwanda Land Authority Details */}
      <div className="space-y-4 pt-2">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-[#0F172A] flex items-center gap-1.5">
            <ShieldCheck size={16} className="text-teal-600" />
            National Land Authority (NLA) Registry &amp; Zoning
          </h3>
          {hasUpi && (
            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold border ${
              upiValid ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-700 border-amber-200'
            }`}>
              {upiValid ? <CheckCircle2 size={11} /> : <AlertCircle size={11} />}
              {upiValid ? 'Standard UPI Format' : 'Check UPI Format (e.g. 1/03/08/02/1234)'}
            </span>
          )}
        </div>

        <Field label="UPI — Unique Parcel Identifier (Rwanda Land Registry)">
          <Input
            value={data.upi}
            onChange={(e) => update('upi', e.target.value)}
            placeholder="e.g. 1/03/08/02/1234"
          />
        </Field>
        <p className="-mt-3 text-xs text-slate-500">
          The official parcel number from the Rwanda National Land Authority (LAIS). Format: <span className="font-mono text-slate-700 font-bold">Province/District/Sector/Cell/Parcel</span>. Parcels with verified UPI receive priority marketplace placement.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Tenure Type">
            <Select value={data.tenureType} onChange={(e) => update('tenureType', e.target.value as typeof data.tenureType)}>
              <option value="">Not specified</option>
              <option value="leasehold">Emphyteutic Leasehold (Official 20-99 Year State Lease)</option>
              <option value="freehold">Freehold Title</option>
              <option value="customary">Customary Tenure</option>
            </Select>
          </Field>
          <Field label="Master Plan Zoning Classification">
            <Select value={data.landUse} onChange={(e) => update('landUse', e.target.value as typeof data.landUse)}>
              <option value="">Not specified</option>
              <option value="residential">R1/R2 — Low &amp; Medium Density Residential</option>
              <option value="commercial">C1/C2 — Mixed Commercial &amp; Retail Core</option>
              <option value="agricultural">A — Agricultural &amp; Agro-forestry</option>
              <option value="mixed">Mixed-Use Commercial &amp; Residential</option>
            </Select>
          </Field>
        </div>

        <Field label="Infrastructure &amp; Utilities">
          <div className="flex flex-wrap gap-4 pt-1 bg-slate-50/50 p-3 rounded-xl border border-slate-200">
            {([
              ['hasRoadAccess', 'Asphalt / Graded Road Access'],
              ['hasWater', 'WASAC Clean Water Connection'],
              ['hasElectricity', 'REG Grid Electricity Connection'],
            ] as const).map(([key, label]) => (
              <label key={key} className="flex items-center gap-2 text-xs font-semibold text-[#334155] cursor-pointer">
                <input
                  type="checkbox"
                  checked={data[key]}
                  onChange={(e) => update(key, e.target.checked)}
                  className="w-4 h-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500 cursor-pointer"
                />
                {label}
              </label>
            ))}
          </div>
        </Field>
      </div>
    </div>
  );
};
