import React from 'react';
import { SEO } from '@/components/seo/SEO';
import { BreadcrumbJsonLd } from '@/components/seo/JsonLd';
import { Container } from '@/components/ui/Container';
import { TableOfContents } from '@/components/ui/TableOfContents';

const sections = [
  { id: 'information-collection', label: 'Information We Collect' },
  { id: 'how-we-use', label: 'How We Use Your Information' },
  { id: 'data-sharing', label: 'Data Sharing & Disclosure' },
  { id: 'data-security', label: 'Data Security' },
  { id: 'your-rights', label: 'Your Rights' },
  { id: 'contact', label: 'Contact Us' },
];

export const PrivacyPolicyPage: React.FC = () => {
  return (
    <div className="bg-brand-surface dark:bg-slate-950 py-16 md:py-24 pb-16 md:pb-32 transition-colors duration-300">
      <SEO pageKey="privacy" />
      <BreadcrumbJsonLd items={[
        { label: 'Home', url: '/' },
        { label: 'Privacy Policy', url: '/privacy-policy' },
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
            <h1 className="text-3xl font-semibold text-brand-text dark:text-white mb-8">Privacy Policy</h1>

            <div className="text-sm text-gray-600 dark:text-slate-400 space-y-8">
              <section id="information-collection">
                <h2 className="text-lg font-semibold text-brand-text dark:text-white mb-3">Information We Collect</h2>
                <p>
                  Welcome to GW Land. We respect your privacy and are committed to protecting your personal data.
                  This privacy policy will inform you as to how we look after your personal data when you visit our website
                  and tell you about your privacy rights and how the law protects you.
                </p>
                <p className="mt-3">
                  We collect information you provide directly to us, such as when you create an account, submit a property inquiry,
                  or contact our support team. This may include your name, email address, phone number, and property preferences.
                </p>
              </section>

              <section id="how-we-use">
                <h2 className="text-lg font-semibold text-brand-text dark:text-white mb-3">How We Use Your Information</h2>
                <p>
                  We use the information we collect to provide, maintain, and improve our services, including to process transactions,
                  send you related information, and respond to your comments and questions.
                </p>
              </section>

              <section id="data-sharing">
                <h2 className="text-lg font-semibold text-brand-text dark:text-white mb-3">Data Sharing & Disclosure</h2>
                <p>
                  We do not sell your personal data to third parties. We may share your information with trusted service providers
                  who assist us in operating our website and conducting our business, as long as they agree to keep your information confidential.
                </p>
              </section>

              <section id="data-security">
                <h2 className="text-lg font-semibold text-brand-text dark:text-white mb-3">Data Security</h2>
                <p>
                  We implement a variety of security measures to maintain the safety of your personal information when you enter,
                  submit, or access your personal data. However, no method of transmission over the Internet is 100% secure.
                </p>
              </section>

              <section id="your-rights">
                <h2 className="text-lg font-semibold text-brand-text dark:text-white mb-3">Your Rights</h2>
                <p>
                  You have the right to access, update, or delete your personal data at any time. You can do this by contacting us
                  directly. We will respond to your request within a reasonable timeframe.
                </p>
              </section>

              <section id="contact">
                <h2 className="text-lg font-semibold text-brand-text dark:text-white mb-3">Contact Us</h2>
                <p>
                  For any inquiries regarding your data or this privacy policy, please contact us at{' '}
                  <a href="mailto:info@gwland.rw" className="text-brand-primary dark:text-brand-secondary hover:underline">info@gwland.rw</a>.
                </p>
              </section>
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
};