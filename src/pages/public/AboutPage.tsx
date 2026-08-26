import React from 'react';
import { Helmet } from 'react-helmet-async';
import { SEO } from '@/components/seo/SEO';
import { BreadcrumbJsonLd } from '@/components/seo/JsonLd';
import { Container } from '@/components/ui/Container';
import {
  ShieldCheck, Headset, MapPin,
  Target, Eye,
  Handshake, Award, Heart, Compass,
  CheckCircle2
} from 'lucide-react';

const ABOUT_HERO_IMAGE = 'https://images.unsplash.com/photo-1444723121867-7a241cacace9?auto=format&fit=crop&w=1600&q=80';

/* ─────────── 3 Key Statistics ─────────── */
const stats = [
  { value: '10K+', label: 'Verified Properties', desc: 'Across Kigali & Provinces' },
  { value: '5K+', label: 'Happy Clients', desc: 'Families & Investors' },
  { value: '500+', label: 'Local Agents', desc: 'Certified Professionals' },
];

/* ─────────── Why Choose Us highlights ─────────── */
const highlights = [
  {
    icon: ShieldCheck,
    title: 'Verified Listings',
    text: 'Every plot and building is thoroughly checked for authenticity and legal title clarity.'
  },
  {
    icon: Headset,
    title: 'Expert Local Guidance',
    text: 'Experienced agents on the ground to assist you at every phase of your property journey.'
  },
  {
    icon: MapPin,
    title: 'Nationwide Network',
    text: 'Comprehensive coverage extending across every district in Kigali and all five provinces.'
  },
  {
    icon: Handshake,
    title: 'Transparent Pricing',
    text: 'No hidden fees or unexpected costs. Honest pricing guaranteed for buyers and sellers.'
  },
];

/* ─────────── Core Values ─────────── */
const coreValues = [
  {
    icon: Compass,
    title: 'Integrity',
    text: 'We operate with absolute honesty, transparency, and ethical standards in every deal.'
  },
  {
    icon: Award,
    title: 'Excellence',
    text: 'We continuously elevate the standard of real estate technology and customer support.'
  },
  {
    icon: Handshake,
    title: 'Trust',
    text: 'Building enduring relationships grounded in reliability and mutual respect.'
  },
  {
    icon: Heart,
    title: 'Community',
    text: 'Empowering local neighborhoods and driving sustainable urban growth across Rwanda.'
  },
];

/* ─────────── Our Story / Timeline ─────────── */
const milestones = [
  {
    year: '2014',
    title: 'GW Homes Founded',
    text: 'Launched in Kigali with a vision to make Rwandan real estate transparent and accessible.'
  },
  {
    year: '2017',
    title: 'Nationwide Expansion',
    text: 'Extended operations to cover every province of Rwanda, partnering with certified local agents.'
  },
  {
    year: '2020',
    title: '500+ Families Served',
    text: 'Achieved a major benchmark in matching buyers, tenants, and commercial investors with ideal properties.'
  },
  {
    year: '2024',
    title: 'Digital Platform Launch',
    text: 'Pioneered advanced online property listing tools, map discovery, and direct agent connection.'
  },
  {
    year: '2026',
    title: 'Regional Industry Leader',
    text: 'Recognized as one of Rwanda’s premier real estate technology platforms.'
  },
];

export const AboutPage: React.FC = () => {
  return (
    <>
      <SEO pageKey="about" />
      <Helmet>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link href="https://fonts.googleapis.com/css2?family=Quicksand:wght@300..700&display=swap" rel="stylesheet" />
      </Helmet>
      <BreadcrumbJsonLd items={[
        { label: 'Home', url: '/' },
        { label: 'About Us', url: '/about' },
      ]} />

      {/* ─────────── 1. FULL-BLEED EDGE-TO-EDGE HERO SECTION ─────────── */}
      <section className="relative w-full min-h-[300px] sm:min-h-[380px] md:min-h-[440px] flex items-center justify-center overflow-hidden bg-slate-900">
        <img
          src={ABOUT_HERO_IMAGE}
          alt="GW Homes Rwanda real estate"
          className="absolute inset-0 w-full h-full object-cover object-center opacity-40"
        />
        {/* Sleek Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/90 via-slate-900/80 to-brand-primary/65 mix-blend-multiply" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-black/20" />

        <div className="relative z-10 w-full max-w-[1440px] px-4 sm:px-6 md:px-8 lg:px-12 mx-auto text-center py-14 sm:py-20 md:py-24">
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold text-white tracking-tight leading-tight max-w-3xl mx-auto mb-3 sm:mb-4 antialiased">
            Redefining Real Estate Across <span className="text-brand-secondary">Rwanda</span>
          </h1>

          <p className="text-sm sm:text-base md:text-lg text-slate-200/90 max-w-2xl mx-auto font-normal leading-relaxed antialiased">
            Connecting families, investors, and communities with verified properties, transparent pricing, and local expertise.
          </p>
        </div>
      </section>

      {/* ─────────── PAGE CONTENT CONTAINER (WITH AMPLE BOTTOM CLEARANCE) ─────────── */}
      <div className="w-full bg-brand-surface dark:bg-slate-950 pt-12 sm:pt-16 md:pt-24 pb-24 sm:pb-32 md:pb-40 space-y-16 sm:space-y-24 md:space-y-28 transition-colors duration-300">

        {/* ─────────── 2. WHO WE ARE & 3 STATS ─────────── */}
        <Container>
          <div className="max-w-3xl mx-auto text-center space-y-6 sm:space-y-8">
            <div>
              <span className="text-xs font-extrabold uppercase tracking-widest text-brand-primary dark:text-brand-secondary">
                Who We Are
              </span>
              <h2 className="text-2xl sm:text-4xl font-bold text-slate-900 dark:text-white leading-tight mt-2">
                Rwanda’s Premier Digital <span className="text-brand-primary dark:text-brand-secondary">Real Estate Marketplace</span>
              </h2>
            </div>

            <p className="text-slate-600 dark:text-slate-300 text-sm sm:text-base leading-relaxed">
              GW Homes is a tech-driven platform committed to making property transactions accessible, transparent, and secure across Rwanda. By pairing experienced local agents with a seamless online listing network, we deliver trusted insights and clear legal verification for every property seeker.
            </p>

            {/* 3 Key Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 pt-6 border-t border-slate-200/80 dark:border-slate-800">
              {stats.map((s) => (
                <div key={s.label} className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 shadow-sm text-center">
                  <p className="text-2xl sm:text-3xl font-extrabold text-brand-primary dark:text-brand-secondary">
                    {s.value}
                  </p>
                  <p className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white mt-1">{s.label}</p>
                  <p className="text-[11px] sm:text-xs text-slate-400 dark:text-slate-500 mt-0.5">{s.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </Container>

        {/* ─────────── 3. MISSION & VISION ─────────── */}
        <Container>
          <div className="text-center max-w-xl mx-auto mb-8 sm:mb-12">
            <span className="text-xs font-extrabold uppercase tracking-widest text-brand-primary dark:text-brand-secondary">
              Purpose & Vision
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mt-2">
              Driven by Purpose & Foresight
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 max-w-5xl mx-auto">
            {/* Mission */}
            <div className="relative group bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 shadow-[0_10px_30px_rgba(15,23,42,0.04)] hover:shadow-xl hover:border-brand-primary/40 dark:hover:border-brand-secondary/40 transition-all duration-300">
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-brand-primary/10 dark:bg-brand-secondary/10 flex items-center justify-center text-brand-primary dark:text-brand-secondary mb-5 sm:mb-6 group-hover:scale-110 transition-transform duration-300">
                <Target size={26} />
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mb-3">Our Mission</h3>
              <p className="text-slate-600 dark:text-slate-300 text-xs sm:text-sm leading-relaxed">
                To simplify and demystify property acquisition in Rwanda by providing a transparent, verified, and accessible digital platform that bridges buyers, sellers, and agents with confidence.
              </p>
              <ul className="mt-5 sm:mt-6 space-y-2 text-xs font-semibold text-slate-700 dark:text-slate-300">
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-brand-primary dark:text-brand-secondary shrink-0" />
                  <span>100% Legal Title & Property Verification</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-brand-primary dark:text-brand-secondary shrink-0" />
                  <span>Direct Communication with On-the-Ground Agents</span>
                </li>
              </ul>
            </div>

            {/* Vision */}
            <div className="relative group bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 shadow-[0_10px_30px_rgba(15,23,42,0.04)] hover:shadow-xl hover:border-brand-primary/40 dark:hover:border-brand-secondary/40 transition-all duration-300">
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-brand-primary/10 dark:bg-brand-secondary/10 flex items-center justify-center text-brand-primary dark:text-brand-secondary mb-5 sm:mb-6 group-hover:scale-110 transition-transform duration-300">
                <Eye size={26} />
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mb-3">Our Vision</h3>
              <p className="text-slate-600 dark:text-slate-300 text-xs sm:text-sm leading-relaxed">
                To become East Africa’s most trusted technology-driven real estate ecosystem, enabling sustainable community development and empowering individuals to achieve property ownership.
              </p>
              <ul className="mt-5 sm:mt-6 space-y-2 text-xs font-semibold text-slate-700 dark:text-slate-300">
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-brand-primary dark:text-brand-secondary shrink-0" />
                  <span>Innovative Digital Tools & Interactive Maps</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-brand-primary dark:text-brand-secondary shrink-0" />
                  <span>Empowering Local Real Estate Entrepreneurship</span>
                </li>
              </ul>
            </div>
          </div>
        </Container>

        {/* ─────────── 4. CORE VALUES ─────────── */}
        <div className="w-full bg-slate-100/60 dark:bg-slate-900/40 py-12 sm:py-16">
          <Container>
            <div className="text-center max-w-xl mx-auto mb-8 sm:mb-12">
              <span className="text-xs font-extrabold uppercase tracking-widest text-brand-primary dark:text-brand-secondary">
                Our Foundation
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mt-2">
                The Values That Guide Us
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {coreValues.map((v) => (
                <div
                  key={v.title}
                  className="bg-white dark:bg-slate-900 rounded-2xl p-5 sm:p-6 border border-slate-200/70 dark:border-slate-800 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 text-center"
                >
                  <div className="inline-flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-brand-primary/10 dark:bg-brand-secondary/10 text-brand-primary dark:text-brand-secondary mb-4">
                    <v.icon size={24} />
                  </div>
                  <h4 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white mb-2">{v.title}</h4>
                  <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{v.text}</p>
                </div>
              ))}
            </div>
          </Container>
        </div>

        {/* ─────────── 5. WHY CHOOSE US ─────────── */}
        <Container>
          <div className="text-center max-w-xl mx-auto mb-8 sm:mb-12">
            <span className="text-xs font-extrabold uppercase tracking-widest text-brand-primary dark:text-brand-secondary">
              Why Partner With Us
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mt-2">
              Why Choose GW Homes
            </h2>
            <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm mt-2">
              Built on transparency, local expertise, and customer satisfaction.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {highlights.map((h) => (
              <div
                key={h.title}
                className="bg-white dark:bg-slate-900 p-5 sm:p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col items-start"
              >
                <div className="w-12 h-12 rounded-xl bg-brand-primary/10 dark:bg-brand-secondary/10 flex items-center justify-center text-brand-primary dark:text-brand-secondary mb-4">
                  <h.icon size={24} />
                </div>
                <h4 className="text-base font-bold text-slate-900 dark:text-white mb-2">{h.title}</h4>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{h.text}</p>
              </div>
            ))}
          </div>
        </Container>

        {/* ─────────── 6. OUR MILESTONES & TIMELINE (RESPONSIVE & AMPLE BOTTOM MARGIN) ─────────── */}
        <Container className="pb-8 sm:pb-12 md:pb-16">
          <div className="text-center max-w-xl mx-auto mb-8 sm:mb-12">
            <span className="text-xs font-extrabold uppercase tracking-widest text-brand-primary dark:text-brand-secondary">
              Our Journey
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mt-2">
              Milestones Along the Way
            </h2>
          </div>

          <div className="relative max-w-4xl mx-auto pl-6 sm:pl-8 md:pl-0">
            {/* Left connector line for mobile, center line for desktop */}
            <div className="absolute left-[15px] sm:left-[19px] md:left-1/2 top-4 bottom-4 w-0.5 bg-slate-200 dark:bg-slate-800 md:-translate-x-1/2" />

            <div className="space-y-6 sm:space-y-8 md:space-y-12">
              {milestones.map((m, idx) => {
                const isEven = idx % 2 === 0;
                return (
                  <div
                    key={m.year}
                    className={`relative flex flex-col md:flex-row items-start md:items-center ${
                      isEven ? 'md:flex-row-reverse' : ''
                    }`}
                  >
                    {/* Timeline dot (Mobile & Desktop) */}
                    <div className="absolute left-[-24px] sm:left-[-32px] md:left-1/2 top-6 md:top-1/2 w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-brand-primary dark:bg-brand-secondary ring-4 ring-brand-surface dark:ring-slate-950 md:-translate-x-1/2 md:-translate-y-1/2 z-10" />

                    {/* Content Box */}
                    <div className="w-full md:w-[calc(50%-2rem)] bg-white dark:bg-slate-900 p-5 sm:p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow">
                      <span className="inline-block px-3 py-1 rounded-full bg-brand-primary/10 dark:bg-brand-secondary/10 text-brand-primary dark:text-brand-secondary text-xs font-bold mb-2">
                        {m.year}
                      </span>
                      <h4 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white mb-1.5">{m.title}</h4>
                      <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{m.text}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </Container>

      </div>
    </>
  );
};

export default AboutPage;

