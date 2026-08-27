import React, { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ChevronLeft, ChevronRight, RotateCcw, Search, SlidersHorizontal, Star } from 'lucide-react';
import { SEO } from '@/components/seo/SEO';
import { BreadcrumbJsonLd } from '@/components/seo/JsonLd';
import { Container } from '@/components/ui/Container';
import { PropertyCard } from '@/components/ui/Card';
import { PropertiesNewsletter } from '@/components/ui/Newsletter';
import { PRICE_RANGES, SIZE_RANGES } from '@/data/filters';
import { useLocations } from '@/hooks/useLocations';
import * as listingsApi from '@/api/listings';
import { adaptListingSummary } from '@/utils/listingAdapters';
import type { Property } from '@/types/property';

export const Highlight: React.FC<{ text?: string; query?: string }> = ({ text = '', query = '' }) => {
  if (!text) return null;
  if (!query || !query.trim()) return <>{text}</>;
  const safeText = String(text);
  const index = safeText.toLowerCase().indexOf(query.toLowerCase());
  if (index === -1) return <>{safeText}</>;
  return <>{safeText.slice(0, index)}<mark className="rounded bg-[#fff0df] px-0.5 text-[#b35b08]">{safeText.slice(index, index + query.length)}</mark>{safeText.slice(index + query.length)}</>;
};

interface FilterFormProps {
  textQuery: string;
  districtId: number | null;
  priceIdx: number;
  sizeIdx: number;
  featuredOnly: boolean;
  districts: { id: number; name: string; province?: string }[];
  onTextQueryChange: (value: string) => void;
  onDistrictChange: (value: number | null) => void;
  onPriceIdxChange: (value: number) => void;
  onSizeIdxChange: (value: number) => void;
  onFeaturedChange: (value: boolean) => void;
  onClearFilters: () => void;
}

const FilterForm: React.FC<FilterFormProps> = ({
  textQuery, districtId, priceIdx, sizeIdx, featuredOnly, districts,
  onTextQueryChange, onDistrictChange, onPriceIdxChange, onSizeIdxChange, onFeaturedChange, onClearFilters,
}) => {
  const { t } = useTranslation();
  return (
  <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-[0_18px_45px_-28px_rgba(10,31,68,0.5)]">
    <div className="mb-5 flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
      <div>
        <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-brand-secondary">{t('properties.refineSearch')}</p>
      </div>
      <SlidersHorizontal size={20} className="text-[#0a1f44] dark:text-slate-350" />
    </div>
    <div className="space-y-4">
      <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400">
        {t('properties.keyword')}
        <input
          value={textQuery}
          onChange={(event) => onTextQueryChange(event.target.value)}
          placeholder={t('properties.keywordPlaceholder')}
          className="mt-2 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-3 text-sm text-slate-800 dark:text-slate-100 outline-none transition focus:border-brand-secondary focus:ring-4 focus:ring-brand-secondary/10"
        />
      </label>
      <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400">
        {t('properties.district')}
        <select
          value={districtId ?? ''}
          onChange={(event) => onDistrictChange(event.target.value ? Number(event.target.value) : null)}
          className="mt-2 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-3 text-sm text-slate-800 dark:text-slate-100 outline-none transition focus:border-brand-secondary focus:ring-4 focus:ring-brand-secondary/10"
        >
          <option value="">{t('properties.allDistricts')}</option>
          {districts.map((d) => (
            <option key={d.id} value={d.id} className="bg-white dark:bg-slate-900">{d.name}{d.province ? ` (${d.province})` : ''}</option>
          ))}
        </select>
      </label>
      <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400">
        {t('properties.price')}
        <select
          value={priceIdx}
          onChange={(event) => onPriceIdxChange(Number(event.target.value))}
          className="mt-2 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-3 text-sm text-slate-800 dark:text-slate-100 outline-none transition focus:border-brand-secondary focus:ring-4 focus:ring-brand-secondary/10"
        >
          {PRICE_RANGES.map((range, index) => (
            <option key={range.label} value={index} className="bg-white dark:bg-slate-900">{range.label}</option>
          ))}
        </select>
      </label>
      <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400">
        {t('properties.landSize')}
        <select
          value={sizeIdx}
          onChange={(event) => onSizeIdxChange(Number(event.target.value))}
          className="mt-2 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-3 text-sm text-slate-800 dark:text-slate-100 outline-none transition focus:border-brand-secondary focus:ring-4 focus:ring-brand-secondary/10"
        >
          {SIZE_RANGES.map((range, index) => (
            <option key={range.label} value={index} className="bg-white dark:bg-slate-900">{range.label}</option>
          ))}
        </select>
      </label>
      <label className="flex items-center gap-2.5 text-sm font-semibold text-slate-600 dark:text-slate-300 cursor-pointer">
        <input
          type="checkbox"
          checked={featuredOnly}
          onChange={(event) => onFeaturedChange(event.target.checked)}
          className="rounded border-slate-300 text-brand-primary focus:ring-brand-primary h-4 w-4"
        />
        <Star size={14} className="text-amber-500" /> {t('properties.featuredOnlyValue')}
      </label>
    </div>
    <button
      type="button"
      onClick={onClearFilters}
      className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 py-3 text-sm font-bold text-slate-700 dark:text-slate-200 transition-all duration-200 hover:bg-brand-primary hover:text-white dark:hover:bg-brand-secondary dark:hover:text-slate-900 shadow-sm cursor-pointer"
    >
      <RotateCcw size={15} /> {t('properties.resetFilters')}
    </button>
  </div>
  );
};

export const PropertiesPage: React.FC = () => {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const { districts } = useLocations();

  const [textQuery, setTextQuery] = useState(searchParams.get('q') ?? '');
  const [districtId, setDistrictId] = useState<number | null>(
    searchParams.get('district_id') ? Number(searchParams.get('district_id')) : null
  );
  const [priceIdx, setPriceIdx] = useState(0);
  const [sizeIdx, setSizeIdx] = useState(0);
  const [featuredOnly, setFeaturedOnly] = useState(searchParams.get('featured') === 'true');
  const [page, setPage] = useState(1);

  const [properties, setProperties] = useState<Property[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const minPrice = searchParams.get('min_price');
    const maxPrice = searchParams.get('max_price');
    if (minPrice || maxPrice) {
      const idx = PRICE_RANGES.findIndex(
        (r) => String(r.min || '') === (minPrice ?? '') && String(r.max === Infinity ? '' : r.max) === (maxPrice ?? '')
      );
      if (idx >= 0) setPriceIdx(idx);
    }
    const minSize = searchParams.get('min_size');
    const maxSize = searchParams.get('max_size');
    if (minSize || maxSize) {
      const idx = SIZE_RANGES.findIndex(
        (r) => String(r.min || '') === (minSize ?? '') && String(r.max === Infinity ? '' : r.max) === (maxSize ?? '')
      );
      if (idx >= 0) setSizeIdx(idx);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    setPage(1);
  }, [textQuery, districtId, priceIdx, sizeIdx, featuredOnly]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    const price = PRICE_RANGES[priceIdx];
    const sizeRange = SIZE_RANGES[sizeIdx];

    listingsApi
      .getPublicListings({
        page,
        limit: 12,
        q: textQuery.trim() || undefined,
        district_id: districtId ?? undefined,
        min_price: price.min > 0 ? price.min : undefined,
        max_price: price.max !== Infinity ? price.max : undefined,
        min_size: sizeRange.min > 0 ? sizeRange.min : undefined,
        max_size: sizeRange.max !== Infinity ? sizeRange.max : undefined,
        featured: featuredOnly || undefined,
      })
      .then((res) => {
        if (cancelled) return;
        setProperties(res.listings.map(adaptListingSummary));
        setTotalPages(res.total_pages);
        setTotal(res.total);
      })
      .catch(() => {
        if (!cancelled) {
          setProperties([]);
          setTotalPages(1);
          setTotal(0);
        }
      })
      .finally(() => !cancelled && setLoading(false));

    return () => {
      cancelled = true;
    };
  }, [page, textQuery, districtId, priceIdx, sizeIdx, featuredOnly]);

  useEffect(() => {
    const params: Record<string, string> = {};
    if (textQuery.trim()) params.q = textQuery.trim();
    if (districtId) params.district_id = String(districtId);
    if (featuredOnly) params.featured = 'true';
    setSearchParams(params, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [textQuery, districtId, featuredOnly]);

  const districtOptions = useMemo(() => districts.map((d) => ({ id: d.id, name: d.name, province: d.province })), [districts]);

  const clearFilters = () => {
    setTextQuery('');
    setDistrictId(null);
    setPriceIdx(0);
    setSizeIdx(0);
    setFeaturedOnly(false);
  };

  return (
    <div className="min-h-screen bg-[#f7f9fb] dark:bg-slate-950 pb-16 transition-colors duration-300">
      <SEO pageKey="properties" />
      <BreadcrumbJsonLd items={[{ label: 'Home', url: '/' }, { label: 'Properties', url: '/properties' }]} />
      <Container>
        <section id="property-results" className="py-10 md:py-14">
          <div className="mb-8 text-center">
            <h2 className="text-2xl font-extrabold text-[#0a1f44] dark:text-white md:text-4xl tracking-tight">{t('properties.exploreTitle')}</h2>
            {!loading && <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{t('properties.listingsFound', { count: total })}</p>}
          </div>
          <div className="grid items-start gap-8 lg:grid-cols-[280px_1fr]">
            <aside className="lg:sticky lg:top-28">
              <FilterForm
                textQuery={textQuery}
                districtId={districtId}
                priceIdx={priceIdx}
                sizeIdx={sizeIdx}
                featuredOnly={featuredOnly}
                districts={districtOptions}
                onTextQueryChange={setTextQuery}
                onDistrictChange={setDistrictId}
                onPriceIdxChange={setPriceIdx}
                onSizeIdxChange={setSizeIdx}
                onFeaturedChange={setFeaturedOnly}
                onClearFilters={clearFilters}
              />
            </aside>
            <div>
              {loading ? (
                <div className="grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-2 xl:grid-cols-3">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="h-64 animate-pulse rounded-3xl bg-slate-200/70 dark:bg-slate-800/60" />
                  ))}
                </div>
              ) : properties.length ? (
                <>
                  <div className="grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-2 xl:grid-cols-3">
                    {properties.map((property) => (
                      <PropertyCard key={property.id} property={property} highlight={textQuery} />
                    ))}
                  </div>
                  {totalPages > 1 && (
                    <div className="mt-8 flex items-center justify-center gap-3">
                      <button
                        type="button"
                        disabled={page <= 1}
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 disabled:opacity-30"
                      >
                        <ChevronLeft size={16} />
                      </button>
                      <span className="text-sm font-semibold text-slate-600 dark:text-slate-300">{t('properties.pageOf', { page, totalPages })}</span>
                      <button
                        type="button"
                        disabled={page >= totalPages}
                        onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                        className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 disabled:opacity-30"
                      >
                        <ChevronRight size={16} />
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <div className="rounded-2xl border border-dashed border-slate-350 dark:border-slate-800 bg-white dark:bg-slate-900 px-6 py-20 text-center">
                  <Search size={30} className="mx-auto text-[#3b82a5] dark:text-slate-600" />
                  <p className="mt-4 font-semibold text-[#0a1f44] dark:text-slate-200">{t('properties.noMatchFilters')}</p>
                  <button type="button" onClick={clearFilters} className="mt-3 text-sm font-bold text-brand-secondary cursor-pointer">{t('properties.resetSearch')}</button>
                </div>
              )}
            </div>
          </div>
        </section>
        <section className="pb-10 md:pb-14">
          <PropertiesNewsletter />
        </section>
      </Container>
    </div>
  );
};
