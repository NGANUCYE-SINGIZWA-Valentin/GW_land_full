/**
 * Configuration SEO centralisée pour toutes les pages publiques.
 * Chaque page exporte un objet avec title, description, et éventuellement
 * des propriétés Open Graph / Twitter Cards spécifiques.
 */

export interface SEOConfig {
  title: string;
  description: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  ogType?: string;
  twitterCard?: 'summary' | 'summary_large_image';
  canonical?: string;
}

const BASE_URL = 'https://gwland.rw';
const DEFAULT_OG_IMAGE = '/assets/images/gw-homes-og.png';

export const siteConfig = {
  name: 'GW Homes',
  fullName: 'GW Homes',
  tagline: 'Find Your Dream Property in Rwanda',
  url: BASE_URL,
  defaultImage: DEFAULT_OG_IMAGE,
  twitterHandle: '@gwhomesrw',
  address: 'Norrsken House, Kigali, Rwanda',
  phone: '+250 782 576 686',
  email: 'getwayconnection@gmail.com',
};

export const seo: Record<string, SEOConfig> = {
  home: {
    title: `GW Homes — Find Your Dream Property in Rwanda`,
    description:
      'Discover prime real estate across Kigali and beyond. Buy, sell, and rent land, apartments, villas, and commercial properties in Rwanda with GW Homes.',
    ogTitle: `GW Homes — Real Estate in Rwanda`,
    ogDescription:
      'Discover prime real estate across Kigali and beyond. Buy, sell, and rent properties in Rwanda with GW Homes.',
    ogImage: DEFAULT_OG_IMAGE,
    ogType: 'website',
    twitterCard: 'summary_large_image',
    canonical: BASE_URL,
  },
  properties: {
    title: `Properties — GW Homes`,
    description:
      'Browse hundreds of verified properties across Rwanda. Apartments, villas, land, townhouses, and more. Find your perfect match today.',
    ogTitle: `Properties in Rwanda — GW Homes`,
    ogDescription:
      'Browse hundreds of verified properties across Rwanda. Apartments, villas, land, townhouses, and more.',
    ogImage: DEFAULT_OG_IMAGE,
    ogType: 'website',
    twitterCard: 'summary_large_image',
    canonical: `${BASE_URL}/properties`,
  },
  propertyDetails: {
    title: `Property Details — GW Homes`,
    description: 'View detailed information about this property including price, location, features, and contact the listing agent.',
    ogType: 'website',
    twitterCard: 'summary_large_image',
  },
  about: {
    title: `About Us — GW Homes`,
    description:
      'Learn about GW Homes, Rwanda\'s premier real estate platform. With over 12 years of experience, we help families find their perfect property.',
    ogTitle: `About Us — GW Homes`,
    ogDescription:
      'Learn about GW Homes, Rwanda\'s premier real estate platform with over 12 years of experience.',
    ogImage: DEFAULT_OG_IMAGE,
    ogType: 'website',
    twitterCard: 'summary_large_image',
    canonical: `${BASE_URL}/about`,
  },
  contact: {
    title: `Contact Us — GW Homes`,
    description:
      'Get in touch with GW Homes. Our team is here to help with listings, pricing, or scheduling a private viewing.',
    ogTitle: `Contact Us — GW Homes`,
    ogDescription:
      'Get in touch with GW Homes. Our team is here to help with listings, pricing, or scheduling a private viewing.',
    ogImage: DEFAULT_OG_IMAGE,
    ogType: 'website',
    twitterCard: 'summary_large_image',
    canonical: `${BASE_URL}/contact`,
  },
  privacy: {
    title: `Privacy Policy — GW Homes`,
    description:
      'Read the GW Homes privacy policy to understand how we collect, use, and protect your personal data.',
    ogType: 'website',
    twitterCard: 'summary',
    canonical: `${BASE_URL}/privacy-policy`,
  },
  terms: {
    title: `Terms & Conditions — GW Homes`,
    description:
      'Read the GW Homes terms and conditions governing the use of our real estate platform and services.',
    ogType: 'website',
    twitterCard: 'summary',
    canonical: `${BASE_URL}/terms-conditions`,
  },
  blog: {
    title: `Insights & Market News — GW Homes`,
    description:
      'Stay updated with the latest Rwanda real estate news, Kigali market trends, buying guides, and property investment advice from GW Homes.',
    ogTitle: `Real Estate Insights & News — GW Homes`,
    ogDescription:
      'Stay updated with the latest Rwanda real estate news, Kigali market trends, buying guides, and property investment advice.',
    ogImage: DEFAULT_OG_IMAGE,
    ogType: 'website',
    twitterCard: 'summary_large_image',
    canonical: `${BASE_URL}/blog`,
  },
};