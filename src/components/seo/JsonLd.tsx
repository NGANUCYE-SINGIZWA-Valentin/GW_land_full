import React from 'react';
import { Helmet } from 'react-helmet-async';
import { siteConfig } from '@/config/seo';

/** JSON-LD pour l'organisation (GWLand) */
export const OrganizationJsonLd: React.FC = () => {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: siteConfig.fullName,
    alternateName: siteConfig.name,
    url: siteConfig.url,
    logo: `${siteConfig.url}/favicon/favicon.svg`,
    description: siteConfig.tagline,
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Norrsken House',
      addressLocality: 'Kigali',
      addressCountry: 'RW',
    },
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: siteConfig.phone,
      email: siteConfig.email,
      contactType: 'customer service',
    },
    sameAs: [
      'https://wa.me/250782576686',
    ],
  };

  return (
    <Helmet>
      <script type="application/ld+json">{JSON.stringify(schema)}</script>
    </Helmet>
  );
};

/** JSON-LD pour le site Web (WebSite + SearchAction) */
export const WebSiteJsonLd: React.FC = () => {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: siteConfig.fullName,
    url: siteConfig.url,
    description: siteConfig.tagline,
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${siteConfig.url}/properties?location={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };

  return (
    <Helmet>
      <script type="application/ld+json">{JSON.stringify(schema)}</script>
    </Helmet>
  );
};

/** JSON-LD pour une propriété (RealEstateListing) */
interface RealEstateListingJsonLdProps {
  title: string;
  description: string;
  url: string;
  image: string;
  price: number;
  priceCurrency?: string;
  location: string;
  bedrooms?: number;
  bathrooms?: number;
  area?: string | number;
}

export const RealEstateListingJsonLd: React.FC<RealEstateListingJsonLdProps> = ({
  title,
  description,
  url,
  image,
  price,
  priceCurrency = 'USD',
  location,
  bedrooms,
  bathrooms,
  area,
}) => {
  const schema: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'RealEstateListing',
    name: title,
    description,
    url: `${siteConfig.url}${url}`,
    image: image.startsWith('http') ? image : `${siteConfig.url}${image}`,
    offers: {
      '@type': 'Offer',
      price,
      priceCurrency,
      availability: 'https://schema.org/InStock',
    },
    address: {
      '@type': 'PostalAddress',
      addressLocality: location,
      addressCountry: 'RW',
    },
  };

  if (bedrooms) schema.numberOfBedrooms = bedrooms;
  if (bathrooms) schema.numberOfBathrooms = bathrooms;
  if (area) schema.floorSize = { '@type': 'QuantitativeValue', value: area };

  return (
    <Helmet>
      <script type="application/ld+json">{JSON.stringify(schema)}</script>
    </Helmet>
  );
};

/** JSON-LD pour le breadcrumb (BreadcrumbList) */
interface BreadcrumbItem {
  label: string;
  url: string;
}

export const BreadcrumbJsonLd: React.FC<{ items: BreadcrumbItem[] }> = ({ items }) => {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.label,
      item: `${siteConfig.url}${item.url}`,
    })),
  };

  return (
    <Helmet>
      <script type="application/ld+json">{JSON.stringify(schema)}</script>
    </Helmet>
  );
};