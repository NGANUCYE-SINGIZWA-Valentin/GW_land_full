import type { ListingDetail, ListingSummary } from '@/api/types';
import type { Property, PropertyDetail } from '@/types/property';

const PLACEHOLDER_IMAGE = '/assets/images/gw-homes-og.png';

function computeTag(createdAt: string, isFeatured: boolean): Property['tag'] {
  if (isFeatured) return 'FEATURED';
  const ageInDays = (Date.now() - new Date(createdAt).getTime()) / (1000 * 60 * 60 * 24);
  return ageInDays <= 14 ? 'NEW' : null;
}

export function adaptListingSummary(listing: ListingSummary): Property {
  return {
    id: listing.id,
    slug: listing.slug,
    title: listing.title,
    price: listing.price_rwf ? Number(listing.price_rwf) : 0,
    priceUsd: listing.price_usd ? Number(listing.price_usd) : null,
    location: `${listing.sector}, ${listing.district}`,
    sizeValue: Number(listing.size_value),
    sizeUnit: listing.size_unit,
    imageUrl: listing.cover_image || PLACEHOLDER_IMAGE,
    tag: computeTag(listing.created_at, listing.is_featured),
    viewCount: listing.view_count,
    isVerifiedSeller: false,
  };
}

export function adaptListingDetail(listing: ListingDetail): PropertyDetail {
  return {
    id: listing.id,
    slug: listing.slug,
    title: listing.title,
    price: listing.price_rwf ? Number(listing.price_rwf) : 0,
    priceUsd: listing.price_usd ? Number(listing.price_usd) : null,
    location: `${listing.sector}, ${listing.district}`,
    sizeValue: Number(listing.size_value),
    sizeUnit: listing.size_unit,
    imageUrl: listing.images[0] || PLACEHOLDER_IMAGE,
    images: listing.images.length ? listing.images : [PLACEHOLDER_IMAGE],
    tag: computeTag(listing.created_at, listing.is_featured),
    viewCount: listing.view_count,
    isVerifiedSeller: listing.seller?.is_verified ?? false,
    lat: listing.latitude ? Number(listing.latitude) : undefined,
    lng: listing.longitude ? Number(listing.longitude) : undefined,
    description: listing.description,
    upi: listing.upi,
    upiVerified: listing.upi_verified,
    tenureType: listing.tenure_type,
    landUse: listing.land_use,
    hasRoadAccess: listing.has_road_access,
    hasWater: listing.has_water,
    hasElectricity: listing.has_electricity,
    seller: listing.seller
      ? {
          name: listing.seller.full_name,
          phone: listing.seller.phone,
          whatsapp: listing.seller.whatsapp_number,
          verified: listing.seller.is_verified,
        }
      : undefined,
  };
}

export function formatSize(value: number, unit: 'sqm' | 'hectare'): string {
  const label = unit === 'hectare' ? 'ha' : 'sqm';
  return `${value.toLocaleString()} ${label}`;
}

export function formatPriceRwf(price: number): string {
  return price ? `${price.toLocaleString()}` : 'Price on request';
}

/** Converts a size to square metres so price/sqm is comparable across listings entered in hectares. */
export function toSqm(value: number, unit: 'sqm' | 'hectare'): number {
  return unit === 'hectare' ? value * 10000 : value;
}

export function formatPricePerSqm(price: number, sizeValue: number, sizeUnit: 'sqm' | 'hectare'): string | null {
  const sqm = toSqm(sizeValue, sizeUnit);
  if (!price || !sqm) return null;
  return `RWF ${Math.round(price / sqm).toLocaleString()} / sqm`;
}
