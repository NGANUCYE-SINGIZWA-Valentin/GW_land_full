// Price buckets in RWF — matches the backend's price_rwf filter (?min_price / ?max_price).
export const PRICE_RANGES = [
  { label: 'Any Price', min: 0, max: Infinity },
  { label: 'Under 5M RWF', min: 0, max: 5_000_000 },
  { label: '5M – 20M RWF', min: 5_000_000, max: 20_000_000 },
  { label: '20M – 50M RWF', min: 20_000_000, max: 50_000_000 },
  { label: 'Above 50M RWF', min: 50_000_000, max: Infinity },
];

// Land size buckets in square meters — matches the backend's size filter
// (?min_size / ?max_size, combined with ?size_unit=sqm).
export const SIZE_RANGES = [
  { label: 'Any Size', min: 0, max: Infinity },
  { label: 'Under 300 sqm', min: 0, max: 300 },
  { label: '300 – 1,000 sqm', min: 300, max: 1000 },
  { label: '1,000 – 5,000 sqm', min: 1000, max: 5000 },
  { label: 'Above 5,000 sqm', min: 5000, max: Infinity },
];
