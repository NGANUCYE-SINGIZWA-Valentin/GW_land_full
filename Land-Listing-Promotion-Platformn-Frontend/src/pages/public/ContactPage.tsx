import React from 'react';
import { SEO } from '@/components/seo/SEO';
import { BreadcrumbJsonLd } from '@/components/seo/JsonLd';
import { ContactSection } from '../../sections/ContactSection';

export const ContactPage: React.FC = () => {
  return (
    <>
      <SEO pageKey="contact" />
      <BreadcrumbJsonLd items={[
        { label: 'Home', url: '/' },
        { label: 'Contact Us', url: '/contact' },
      ]} />
      <ContactSection />
    </>
  );
};