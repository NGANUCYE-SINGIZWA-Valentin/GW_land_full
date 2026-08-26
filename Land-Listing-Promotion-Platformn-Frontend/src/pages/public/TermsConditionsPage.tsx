import React from 'react';
import { SEO } from '@/components/seo/SEO';
import { BreadcrumbJsonLd } from '@/components/seo/JsonLd';
import { Container } from '@/components/ui/Container';
import { TableOfContents } from '@/components/ui/TableOfContents';

const sections = [
  { id: 'acceptance', label: 'Acceptance of Terms' },
  { id: 'services', label: 'Description of Services' },
  { id: 'user-obligations', label: 'User Obligations' },
  { id: 'intellectual-property', label: 'Intellectual Property' },
  { id: 'limitation', label: 'Limitation of Liability' },
  { id: 'changes', label: 'Changes to Terms' },
];

export const TermsConditionsPage: React.FC = () => {
  return (
    <div className="bg-brand-surface dark:bg-slate-950 py-16 md:py-24 pb-16 md:pb-32 transition-colors duration-300">
      <SEO pageKey="terms" />
      <BreadcrumbJsonLd items={[
        { label: 'Home', url: '/' },
        { label: 'Terms & Conditions', url: '/terms-conditions' },
      ]} />
      <Container>
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
          {/* 📑 TABLE OF CONTENTS — sidebar, masqué en mobile/tablet */}
          <aside className="hidden lg:block w-full lg:w-64 shrink-0">
            <div className="sticky top-24">
              <TableOfContents sections={sections} />
            </div>
          </aside>

          {/* 📄 CONTENU PRINCIPAL */}
          <div className="flex-1 min-w-0">
            <h1 className="text-3xl font-semibold text-brand-text dark:text-white mb-8">Terms & Conditions</h1>

            <div className="text-sm text-gray-600 dark:text-slate-400 space-y-8">
              <section id="acceptance">
                <h2 className="text-lg font-semibold text-brand-text dark:text-white mb-3">Acceptance of Terms</h2>
                <p>
                  Welcome to GW Land. By accessing or using our platform, you agree to be bound by these Terms and Conditions.
                  Please read them carefully before using our services. If you do not agree with any part of these terms,
                  you should not use our website or services.
                </p>
              </section>

              <section id="services">
                <h2 className="text-lg font-semibold text-brand-text dark:text-white mb-3">Description of Services</h2>
                <p>
                  GW Land provides an online platform that connects property buyers, sellers, and renters. We facilitate
                  property listings, inquiries, and related real estate services. The information provided on this website
                  is for general informational purposes only. We make every effort to ensure the accuracy of property
                  listings but do not guarantee their completeness.
                </p>
                <p className="mt-3">
                  Users should independently verify all information before making a property purchase or rental decision.
                </p>
              </section>

              <section id="user-obligations">
                <h2 className="text-lg font-semibold text-brand-text dark:text-white mb-3">User Obligations</h2>
                <p>
                  As a user of our platform, you agree to provide accurate and up-to-date information when creating an
                  account or submitting inquiries. You are responsible for maintaining the confidentiality of your account
                  credentials and for all activities that occur under your account.
                </p>
                <p className="mt-3">
                  You agree not to use the platform for any unlawful purpose or in violation of any applicable laws or regulations.
                </p>
              </section>

              <section id="intellectual-property">
                <h2 className="text-lg font-semibold text-brand-text dark:text-white mb-3">Intellectual Property</h2>
                <p>
                  All content, trademarks, and intellectual property on this website are owned by or licensed to GW Land.
                  You may not reproduce, distribute, modify, or create derivative works from any content without our
                  prior written consent.
                </p>
              </section>

              <section id="limitation">
                <h2 className="text-lg font-semibold text-brand-text dark:text-white mb-3">Limitation of Liability</h2>
                <p>
                  GW Land shall not be liable for any indirect, incidental, special, consequential, or punitive damages
                  arising out of your use of the platform. We provide our services on an "as is" and "as available" basis
                  without warranties of any kind, either express or implied.
                </p>
              </section>

              <section id="changes">
                <h2 className="text-lg font-semibold text-brand-text dark:text-white mb-3">Changes to Terms</h2>
                <p>
                  We reserve the right to modify these terms at any time without prior notice. Changes will be effective
                  immediately upon posting on this page. Your continued use of the platform after any modifications
                  indicates your acceptance of the updated terms.
                </p>
              </section>
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
};