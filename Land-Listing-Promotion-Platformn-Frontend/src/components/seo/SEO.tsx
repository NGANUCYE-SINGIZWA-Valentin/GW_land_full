import React from 'react';
import { Helmet } from 'react-helmet-async';
import { SEOConfig, siteConfig, seo as seoConfig } from '@/config/seo';

interface SEOProps extends Partial<SEOConfig> {
  /** Utilise une clé de la config centralisée (ex: 'home', 'about', 'contact') */
  pageKey?: string;
  /** Surcharge le titre (utilisé pour les pages dynamiques comme les détails de propriété) */
  title?: string;
  /** Surcharge la description */
  description?: string;
  /** Image OG personnalisée */
  ogImage?: string;
  /** URL canonique personnalisée */
  canonical?: string;
}

export const SEO: React.FC<SEOProps> = ({
  pageKey,
  title: customTitle,
  description: customDescription,
  ogImage: customOgImage,
  canonical: customCanonical,
  ...overrides
}) => {
  const baseUrl = siteConfig.url;

  // Résoudre la config : priorité à la config centralisée via pageKey, puis aux surcharges
  const pageConfig = pageKey ? seoConfig[pageKey] : undefined;

  const resolved: SEOConfig = {
    title: '',
    description: '',
    ogType: 'website',
    twitterCard: 'summary_large_image',
    ...(pageConfig ?? {}),
    ...overrides,
  };

  const title = customTitle || resolved.title || siteConfig.fullName;
  const description = customDescription || resolved.description || siteConfig.tagline;
  const ogImage = customOgImage || resolved.ogImage || siteConfig.defaultImage;
  const canonical = customCanonical || resolved.canonical;
  const ogTitle = resolved.ogTitle || title;
  const ogDescription = resolved.ogDescription || description;
  const ogType = resolved.ogType || 'website';
  const twitterCard = resolved.twitterCard || 'summary_large_image';

  return (
    <Helmet>
      {/* Meta tags de base */}
      <title>{title}</title>
      <meta name="description" content={description} />

      {/* Open Graph */}
      <meta property="og:title" content={ogTitle} />
      <meta property="og:description" content={ogDescription} />
      <meta property="og:image" content={ogImage.startsWith('http') ? ogImage : `${baseUrl}${ogImage}`} />
      <meta property="og:url" content={canonical || baseUrl} />
      <meta property="og:type" content={ogType} />
      <meta property="og:site_name" content={siteConfig.fullName} />
      <meta property="og:locale" content="en_US" />

      {/* Twitter Cards */}
      <meta name="twitter:card" content={twitterCard} />
      <meta name="twitter:title" content={ogTitle} />
      <meta name="twitter:description" content={ogDescription} />
      <meta name="twitter:image" content={ogImage.startsWith('http') ? ogImage : `${baseUrl}${ogImage}`} />
      {siteConfig.twitterHandle && <meta name="twitter:site" content={siteConfig.twitterHandle} />}

      {/* Canonical URL */}
      {canonical && <link rel="canonical" href={canonical} />}

      {/* Balise de langue */}
      <html lang="en" />
    </Helmet>
  );
};