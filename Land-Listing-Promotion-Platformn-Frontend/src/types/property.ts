// Display-ready shape for a land listing, adapted from the backend's
// ListingSummary/ListingDetail (see src/utils/listingAdapters.ts).
export interface Property {
  id: string;
  slug: string;
  title: string;
  /** Price in RWF, the platform's primary display currency. */
  price: number;
  priceUsd: number | null;
  location: string;
  sizeValue: number;
  sizeUnit: 'sqm' | 'hectare';
  imageUrl: string;
  images?: string[];
  tag: 'FEATURED' | 'NEW' | null;
  viewCount: number;
  isVerifiedSeller: boolean;
  lat?: number;
  lng?: number;
}

export interface PropertyDetail extends Property {
  description: string;
  images: string[];
  upi: string | null;
  upiVerified: boolean;
  tenureType: 'freehold' | 'leasehold' | 'customary' | null;
  landUse: 'residential' | 'commercial' | 'agricultural' | 'mixed' | null;
  hasRoadAccess: boolean;
  hasWater: boolean;
  hasElectricity: boolean;
  seller?: {
    name: string;
    phone: string | null;
    whatsapp: string | null;
    verified: boolean;
  };
}
