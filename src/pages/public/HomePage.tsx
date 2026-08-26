import React from 'react';
import { SEO } from '@/components/seo/SEO';
import { OrganizationJsonLd, WebSiteJsonLd } from '@/components/seo/JsonLd';
import { HeroSlider } from '@/sections/HeroSlider';
import { FeaturedListings } from '@/sections/FeaturedListings';
import { TestimonialsSection } from '@/sections/TestimonialsSection';
import { BlogSection } from '@/sections/BlogSection';

export const HomePage: React.FC = () => {
  return (
    <>
      <SEO pageKey="home" />
      <OrganizationJsonLd />
      <WebSiteJsonLd />

      <HeroSlider />
      <div className="w-full bg-white dark:bg-slate-950 transition-colors duration-300">
        <FeaturedListings />
        <TestimonialsSection />
        <BlogSection />
      </div>
    </>
  );
};
