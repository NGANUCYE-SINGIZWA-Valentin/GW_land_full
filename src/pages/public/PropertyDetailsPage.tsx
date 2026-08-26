import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Maximize2, MapPin, Phone, MessageCircle, Flag, Eye, X, FileCheck, Route, Droplet, Zap, ScrollText } from 'lucide-react';
import { SEO } from '@/components/seo/SEO';
import { RealEstateListingJsonLd, BreadcrumbJsonLd } from '@/components/seo/JsonLd';
import { Button } from '@/components/ui/Button';
import { Container } from '@/components/ui/Container';
import { PropertyMap } from '@/components/public/PropertyMap';
import { MediaLightbox } from '@/components/ui/MediaLightBox';
import * as listingsApi from '@/api/listings';
import * as miscApi from '@/api/misc';
import { ApiError } from '@/api/client';
import { adaptListingDetail, formatSize, formatPricePerSqm } from '@/utils/listingAdapters';
import type { PropertyDetail } from '@/types/property';
import type { ReportReasonCategory } from '@/api/types';

const TENURE_LABEL: Record<string, string> = {
  freehold: 'Freehold',
  leasehold: 'Leasehold',
  customary: 'Customary tenure',
};

const LAND_USE_LABEL: Record<string, string> = {
  residential: 'Residential',
  commercial: 'Commercial',
  agricultural: 'Agricultural',
  mixed: 'Mixed use',
};

const REPORT_REASONS: { value: ReportReasonCategory; labelKey: string }[] = [
  { value: 'fraudulent', labelKey: 'propertyDetails.reasonFraudulent' },
  { value: 'incorrect_info', labelKey: 'propertyDetails.reasonIncorrectInfo' },
  { value: 'already_sold', labelKey: 'propertyDetails.reasonAlreadySold' },
  { value: 'inappropriate', labelKey: 'propertyDetails.reasonInappropriate' },
  { value: 'duplicate', labelKey: 'propertyDetails.reasonDuplicate' },
  { value: 'other', labelKey: 'propertyDetails.reasonOther' },
];

export const PropertyDetailsPage: React.FC = () => {
  const { t } = useTranslation();
  const { slug } = useParams<{ slug: string }>();
  const [property, setProperty] = useState<PropertyDetail | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [loading, setLoading] = useState(true);

  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  const [inquiryForm, setInquiryForm] = useState({ name: '', email: '', phone: '', message: '' });
  const [inquiryStatus, setInquiryStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [inquiryError, setInquiryError] = useState('');

  const [reportOpen, setReportOpen] = useState(false);
  const [reportCategory, setReportCategory] = useState<ReportReasonCategory | ''>('');
  const [reportReason, setReportReason] = useState('');
  const [reportStatus, setReportStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');

  useEffect(() => {
    if (!slug) return;
    let cancelled = false;
    setLoading(true);
    listingsApi
      .getListingBySlug(slug)
      .then(({ listing }) => !cancelled && setProperty(adaptListingDetail(listing)))
      .catch(() => !cancelled && setNotFound(true))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [slug]);

  const openLightbox = (index: number) => { setLightboxIndex(index); setLightboxOpen(true); };

  const handleInquirySubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!property) return;
    setInquiryError('');
    if (!inquiryForm.name || !inquiryForm.email || !inquiryForm.message) {
      setInquiryError(t('propertyDetails.fillRequiredFields'));
      return;
    }
    setInquiryStatus('sending');
    try {
      await miscApi.sendContactForm({
        listing_id: property.id,
        sender_name: inquiryForm.name,
        sender_email: inquiryForm.email,
        sender_phone: inquiryForm.phone || undefined,
        message_body: inquiryForm.message,
      });
      setInquiryStatus('sent');
      setInquiryForm({ name: '', email: '', phone: '', message: '' });
    } catch (err) {
      setInquiryStatus('error');
      setInquiryError(err instanceof ApiError ? err.message : t('propertyDetails.sendError'));
    }
  };

  const handleReportSubmit = async () => {
    if (!property || !reportCategory) return;
    setReportStatus('sending');
    try {
      await miscApi.reportListing(property.id, reportCategory, reportReason.trim() || undefined);
      setReportStatus('sent');
    } catch {
      setReportStatus('error');
    }
  };

  if (loading) {
    return (
      <div className="px-6 lg:px-16 py-24 max-w-7xl mx-auto text-center">
        <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-brand-primary border-t-transparent" />
      </div>
    );
  }

  if (notFound || !property) {
    return (
      <>
        <SEO
          title="Property Not Found — GW Homes"
          description="The property you are looking for does not exist or has been removed."
        />
        <div className="px-6 lg:px-16 py-24 max-w-7xl mx-auto text-center">
          <h2 className="text-2xl font-semibold text-brand-text mb-4">{t('propertyDetails.notFound')}</h2>
          <Link to="/">
            <Button variant="primary">{t('propertyDetails.backToHome')}</Button>
          </Link>
        </div>
      </>
    );
  }

  const gallery = property.images.length > 0 ? property.images : [property.imageUrl];
  const extraPhotosCount = Math.max(gallery.length - 2, 0);

  return (
    <>
      <SEO
        title={`${property.title} — GW Homes`}
        description={property.description?.slice(0, 160) || `View details for ${property.title} in ${property.location}.`}
        ogImage={property.imageUrl}
        canonical={`/properties/${property.slug}`}
      />
      <RealEstateListingJsonLd
        title={property.title}
        description={property.description || ''}
        url={`/properties/${property.slug}`}
        image={property.imageUrl}
        price={property.price}
        priceCurrency="RWF"
        location={property.location}
        area={formatSize(property.sizeValue, property.sizeUnit)}
      />
      <BreadcrumbJsonLd items={[
        { label: 'Home', url: '/' },
        { label: 'Properties', url: '/properties' },
        { label: property.title, url: `/properties/${property.slug}` },
      ]} />

      {/* Gallery */}
      <div className="mx-auto w-full bg-brand-surface dark:bg-slate-950 pt-6 md:py-6 space-y-8 md:space-y-10 transition-colors duration-300">
        <div className="px-6 lg:px-16 max-w-7xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-10">
            <div className="sm:col-span-2 h-72 sm:h-[420px] rounded-2xl overflow-hidden bg-gray-100 dark:bg-slate-800 cursor-pointer" onClick={() => openLightbox(0)}>
              <img src={gallery[0]} alt={property.title} className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
            </div>
            <div className="grid grid-rows-2 gap-3 h-72 sm:h-[420px]">
              <div className="rounded-2xl overflow-hidden bg-gray-100 dark:bg-slate-800 cursor-pointer" onClick={() => openLightbox(1)}>
                <img src={gallery[1] ?? gallery[0]} alt={`${property.title} 2`} className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
              </div>
              <div className="relative rounded-2xl overflow-hidden bg-gray-100 dark:bg-slate-800 cursor-pointer" onClick={() => openLightbox(2)}>
                <img src={gallery[2] ?? gallery[0]} alt={`${property.title} 3`} className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
                {extraPhotosCount > 0 && (
                  <button className="absolute inset-0 bg-black/50 text-white text-sm font-semibold flex items-center justify-center hover:bg-black/60 transition-colors">
                    {t('propertyDetails.morePhotos', { count: extraPhotosCount })}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <MediaLightbox isOpen={lightboxOpen} images={gallery} initialIndex={lightboxIndex} onClose={() => setLightboxOpen(false)} />

      <div className="w-full bg-brand-surface dark:bg-slate-950 py-8 md:py-10 space-y-8 md:space-y-10 transition-colors duration-300">
        <Container>
          <div className="w-full bg-brand-surface dark:bg-slate-950 space-y-8 md:space-y-10">
            <div className="relative rounded-[2.5rem] p-8 md:p-12 overflow-hidden bg-gradient-to-b from-white dark:from-slate-900 via-white/35 dark:via-slate-900/50 to-white/3 dark:to-slate-900/10 border border-white/60 dark:border-slate-800 backdrop-blur-md shadow-[0_20px_50px_-12px_rgba(148,163,184,0.12)]">
              <div className="relative z-10">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">

                  {/* Main content */}
                  <div className="lg:col-span-2">
                    <div className="flex flex-wrap justify-between items-start gap-2 mb-1">
                      <h1 className="text-2xl font-semibold text-brand-text dark:text-white">{property.title}</h1>
                      <span className="text-2xl font-semibold text-brand-primary dark:text-brand-secondary">
                        {property.price ? `RWF ${property.price.toLocaleString()}` : t('propertyDetails.priceOnRequest')}
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-gray-400 dark:text-slate-500 text-sm mb-2">
                      <span className="flex items-center gap-1"><MapPin size={14} />{property.location}</span>
                      <span className="flex items-center gap-1"><Eye size={14} />{property.viewCount} {t('propertyDetails.views')}</span>
                    </div>
                    <div className="mb-8">
                      <button
                        type="button"
                        onClick={() => setReportOpen(true)}
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 dark:text-slate-500 hover:text-red-500 transition-colors cursor-pointer"
                      >
                        <Flag size={12} /> {t('propertyDetails.reportListing')}
                      </button>
                    </div>

                    <section className="mb-8">
                      <h3 className="text-lg font-semibold text-brand-text dark:text-white mb-3">{t('propertyDetails.description')}</h3>
                      <p className="text-gray-500 dark:text-slate-400 text-sm leading-relaxed">{property.description}</p>
                    </section>

                    <section className="mb-8">
                      <h3 className="text-lg font-semibold text-brand-text dark:text-white mb-4">{t('propertyDetails.keyFeatures')}</h3>
                      <div className="flex flex-wrap gap-6 text-sm text-gray-600 dark:text-slate-350 font-medium">
                        <span className="flex items-center gap-2"><Maximize2 size={18} className="text-brand-primary dark:text-brand-secondary" /> {formatSize(property.sizeValue, property.sizeUnit)}</span>
                        {formatPricePerSqm(property.price, property.sizeValue, property.sizeUnit) && (
                          <span className="flex items-center gap-2 text-gray-500 dark:text-slate-400">{formatPricePerSqm(property.price, property.sizeValue, property.sizeUnit)}</span>
                        )}
                        {property.priceUsd && (
                          <span className="flex items-center gap-2 text-gray-500 dark:text-slate-400">{t('propertyDetails.alsoListedAt', { price: property.priceUsd.toLocaleString() })}</span>
                        )}
                        {property.tenureType && (
                          <span className="flex items-center gap-2"><ScrollText size={18} className="text-brand-primary dark:text-brand-secondary" /> {TENURE_LABEL[property.tenureType]}</span>
                        )}
                        {property.landUse && (
                          <span className="flex items-center gap-2">{LAND_USE_LABEL[property.landUse]}</span>
                        )}
                        {property.hasRoadAccess && (
                          <span className="flex items-center gap-2"><Route size={18} className="text-brand-primary dark:text-brand-secondary" /> Road access</span>
                        )}
                        {property.hasWater && (
                          <span className="flex items-center gap-2"><Droplet size={18} className="text-brand-primary dark:text-brand-secondary" /> Water</span>
                        )}
                        {property.hasElectricity && (
                          <span className="flex items-center gap-2"><Zap size={18} className="text-brand-primary dark:text-brand-secondary" /> Electricity</span>
                        )}
                      </div>
                      {property.upi && (
                        <div className={`mt-4 inline-flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold ${property.upiVerified ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400' : 'bg-slate-50 text-slate-500 dark:bg-slate-800 dark:text-slate-400'}`}>
                          <FileCheck size={14} />
                          UPI {property.upi} {property.upiVerified ? '— verified by our team' : '— pending verification'}
                        </div>
                      )}
                    </section>

                    {property.lat && property.lng && (
                      <section>
                        <h3 className="text-lg font-semibold text-brand-text dark:text-white mb-4">{t('propertyDetails.location')}</h3>
                        <div className="h-72 rounded-2xl overflow-hidden shadow-[0_20px_50px_-12px_rgba(148,163,184,0.32)]">
                          <PropertyMap properties={[property]} />
                        </div>
                      </section>
                    )}
                  </div>

                  {/* Sidebar */}
                  <div className="lg:col-span-1">
                    {property.seller && (
                      <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-[0_20px_50px_-12px_rgba(148,163,184,0.32)] p-6 mb-6">
                        <h4 className="text-base font-semibold text-brand-text dark:text-white mb-4">{t('propertyDetails.listingSeller')}</h4>
                        <div className="flex items-center gap-3 mb-5">
                          <div className="w-12 h-12 rounded-full bg-brand-primary/10 dark:bg-brand-secondary/10 flex items-center justify-center font-bold text-brand-primary dark:text-brand-secondary">
                            {property.seller.name.charAt(0)}
                          </div>
                          <span className="font-semibold text-brand-text dark:text-slate-200">
                            {property.seller.name} {property.seller.verified && <span className="ml-1 text-[10px] font-bold text-emerald-600">✓ {t('propertyDetails.verified')}</span>}
                          </span>
                        </div>
                        <ul className="space-y-3 text-sm text-gray-600 dark:text-slate-350">
                          {property.seller.phone && (
                            <li className="flex items-center gap-3">
                              <Phone size={16} className="text-brand-accent" />
                              <a href={`tel:${property.seller.phone}`} className="hover:text-brand-accent transition-colors">{property.seller.phone}</a>
                            </li>
                          )}
                          {property.seller.whatsapp && (
                            <li className="flex items-center gap-3">
                              <MessageCircle size={16} className="text-[#25D366]" />
                              <a
                                href={`https://wa.me/${property.seller.whatsapp.replace(/[^0-9]/g, '')}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-[#25D366] font-medium hover:underline transition-colors"
                              >
                                {t('propertyDetails.chatOnWhatsapp')}
                              </a>
                            </li>
                          )}
                        </ul>
                      </div>
                    )}

                    <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-[0_20px_50px_-12px_rgba(148,163,184,0.32)] p-6">
                      <h4 className="text-base font-semibold text-brand-text dark:text-white mb-4">{t('propertyDetails.enquireTitle')}</h4>
                      {inquiryStatus === 'sent' ? (
                        <p className="text-sm font-semibold text-emerald-600">{t('propertyDetails.messageSent')}</p>
                      ) : (
                        <form className="space-y-3" onSubmit={handleInquirySubmit}>
                          {inquiryError && <p className="text-xs font-semibold text-red-500">{inquiryError}</p>}
                          <input
                            type="text"
                            placeholder={t('propertyDetails.fullName')}
                            value={inquiryForm.name}
                            onChange={(e) => setInquiryForm((f) => ({ ...f, name: e.target.value }))}
                            className="w-full px-4 py-2.5 rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 text-sm focus:outline-none focus:border-brand-accent dark:focus:border-brand-secondary"
                          />
                          <input
                            type="email"
                            placeholder={t('propertyDetails.emailAddress')}
                            value={inquiryForm.email}
                            onChange={(e) => setInquiryForm((f) => ({ ...f, email: e.target.value }))}
                            className="w-full px-4 py-2.5 rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 text-sm focus:outline-none focus:border-brand-accent dark:focus:border-brand-secondary"
                          />
                          <input
                            type="tel"
                            placeholder={t('propertyDetails.phoneNumber')}
                            value={inquiryForm.phone}
                            onChange={(e) => setInquiryForm((f) => ({ ...f, phone: e.target.value }))}
                            className="w-full px-4 py-2.5 rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 text-sm focus:outline-none focus:border-brand-accent dark:focus:border-brand-secondary"
                          />
                          <textarea
                            placeholder={t('propertyDetails.messagePlaceholder')}
                            rows={3}
                            value={inquiryForm.message}
                            onChange={(e) => setInquiryForm((f) => ({ ...f, message: e.target.value }))}
                            className="w-full px-4 py-2.5 rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 text-sm focus:outline-none focus:border-brand-accent dark:focus:border-brand-secondary"
                          />
                          <Button
                            type="submit"
                            variant="primary"
                            disabled={inquiryStatus === 'sending'}
                            className="w-full dark:bg-brand-secondary dark:text-slate-900 dark:hover:bg-brand-secondary-hover"
                          >
                            {inquiryStatus === 'sending' ? t('propertyDetails.sending') : t('propertyDetails.send')}
                          </Button>
                        </form>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </div>

      {/* Report modal */}
      {reportOpen && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40" onClick={() => setReportOpen(false)} />
          <div className="relative w-full max-w-sm bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl p-6">
            <button
              onClick={() => setReportOpen(false)}
              className="absolute right-4 top-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X size={16} />
            </button>
            <h3 className="text-base font-semibold text-slate-800 dark:text-white mb-1">{t('propertyDetails.reportModalTitle')}</h3>
            {reportStatus === 'sent' ? (
              <p className="mt-3 text-sm font-semibold text-emerald-600">{t('propertyDetails.reportThanks')}</p>
            ) : (
              <>
                <p className="text-xs text-slate-400 mb-4">{t('propertyDetails.reportSubtitle')}</p>
                <select
                  value={reportCategory}
                  onChange={(e) => setReportCategory(e.target.value as ReportReasonCategory)}
                  className="w-full mb-3 px-3 py-2.5 rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 text-sm focus:outline-none focus:border-red-400"
                >
                  <option value="" disabled>{t('propertyDetails.selectReason')}</option>
                  {REPORT_REASONS.map((r) => (
                    <option key={r.value} value={r.value}>{t(r.labelKey)}</option>
                  ))}
                </select>
                <textarea
                  rows={3}
                  value={reportReason}
                  onChange={(e) => setReportReason(e.target.value)}
                  placeholder={t('propertyDetails.additionalDetails')}
                  className="w-full px-3 py-2.5 rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 text-sm focus:outline-none focus:border-red-400"
                />
                {reportStatus === 'error' && <p className="mt-2 text-xs font-semibold text-red-500">{t('propertyDetails.reportError')}</p>}
                <Button
                  type="button"
                  variant="primary"
                  disabled={!reportCategory || reportStatus === 'sending'}
                  onClick={handleReportSubmit}
                  className="w-full mt-4 bg-red-600 hover:bg-red-700"
                >
                  {reportStatus === 'sending' ? t('propertyDetails.submitting') : t('propertyDetails.submitReport')}
                </Button>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
};
