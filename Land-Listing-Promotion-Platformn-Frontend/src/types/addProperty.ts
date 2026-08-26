export interface LandDetailsData {
  title: string;
  description: string;
}

export interface LocationPriceData {
  districtId: number | null;
  sectorId: number | null;
  latitude: string;
  longitude: string;
  priceRwf: string;
  priceUsd: string;
  sizeValue: string;
  sizeUnit: 'sqm' | 'hectare';
  upi: string;
  tenureType: '' | 'freehold' | 'leasehold' | 'customary';
  landUse: '' | 'residential' | 'commercial' | 'agricultural' | 'mixed';
  hasRoadAccess: boolean;
  hasWater: boolean;
  hasElectricity: boolean;
}

export interface MediaDocumentsData {
  images: File[];
  documents: File[];
}

export interface AddPropertyFormData {
  landDetails: LandDetailsData;
  locationPrice: LocationPriceData;
  media: MediaDocumentsData;
}

export const STEPS = [
  { key: 'details', label: 'Land Details' },
  { key: 'location', label: 'Location & Price' },
  { key: 'media', label: 'Media & Documents' },
  { key: 'review', label: 'Review & Publish' },
] as const;

export type StepKey = (typeof STEPS)[number]['key'];

export const createEmptyFormData = (): AddPropertyFormData => ({
  landDetails: {
    title: '',
    description: '',
  },
  locationPrice: {
    districtId: null,
    sectorId: null,
    latitude: '',
    longitude: '',
    priceRwf: '',
    priceUsd: '',
    sizeValue: '',
    sizeUnit: 'sqm',
    upi: '',
    tenureType: '',
    landUse: '',
    hasRoadAccess: false,
    hasWater: false,
    hasElectricity: false,
  },
  media: {
    images: [],
    documents: [],
  },
});
