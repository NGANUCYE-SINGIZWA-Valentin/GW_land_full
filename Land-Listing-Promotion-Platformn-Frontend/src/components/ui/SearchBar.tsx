import React, { useState, useRef, useEffect, useId, useMemo } from 'react';
import { MapPin, DollarSign, Maximize2, Star, ChevronDown, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { PRICE_RANGES, SIZE_RANGES } from '@/data/filters';
import { useLocations } from '@/hooks/useLocations';

export const SearchBar: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { districts } = useLocations();
  const [activeDropdown, setActiveDropdown] = useState<'location' | 'price' | 'size' | 'featured' | null>(null);
  const [locationQuery, setLocationQuery] = useState('');
  const [districtId, setDistrictId] = useState<number | null>(null);
  const [priceIdx, setPriceIdx] = useState<number>(0);
  const [sizeIdx, setSizeIdx] = useState<number>(0);
  const [featuredOnly, setFeaturedOnly] = useState(false);

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (districtId) params.set('district_id', String(districtId));
    else if (locationQuery.trim()) params.set('q', locationQuery.trim());
    if (priceIdx > 0) {
      const range = PRICE_RANGES[priceIdx];
      if (range.min > 0) params.set('min_price', String(range.min));
      if (range.max !== Infinity) params.set('max_price', String(range.max));
    }
    if (sizeIdx > 0) {
      const range = SIZE_RANGES[sizeIdx];
      if (range.min > 0) params.set('min_size', String(range.min));
      if (range.max !== Infinity) params.set('max_size', String(range.max));
    }
    if (featuredOnly) params.set('featured', 'true');
    navigate(`/properties?${params.toString()}`);
  };

  const rawId = useId();
  const uid = rawId.replace(/[^a-zA-Z0-9]/g, '');
  const anchorLocation = `--anchor-location-${uid}`;
  const anchorPrice = `--anchor-price-${uid}`;
  const anchorSize = `--anchor-size-${uid}`;
  const anchorFeatured = `--anchor-featured-${uid}`;

  const searchBarRef = useRef<HTMLDivElement>(null);
  const locationPopoverRef = useRef<HTMLDivElement>(null);
  const pricePopoverRef = useRef<HTMLDivElement>(null);
  const sizePopoverRef = useRef<HTMLDivElement>(null);
  const featuredPopoverRef = useRef<HTMLDivElement>(null);

  const districtLabels = useMemo(
    () => districts.map((d) => ({ id: d.id, label: d.province ? `${d.name}, ${d.province}` : d.name })),
    [districts]
  );

  const filteredLocations = useMemo(
    () =>
      locationQuery.trim() === ''
        ? districtLabels
        : districtLabels.filter((loc) => loc.label.toLowerCase().includes(locationQuery.toLowerCase())),
    [locationQuery, districtLabels]
  );

  const showLocationPopover = activeDropdown === 'location';
  const showPricePopover = activeDropdown === 'price';
  const showSizePopover = activeDropdown === 'size';
  const showFeaturedPopover = activeDropdown === 'featured';

  const syncPopover = (el: HTMLDivElement | null, shouldShow: boolean) => {
    if (!el) return;
    const isOpen = el.matches(':popover-open');
    if (shouldShow && !isOpen) {
      el.showPopover();
      requestAnimationFrame(() => {
        const rect = el.getBoundingClientRect();
        const viewportHeight = window.innerHeight;
        if (rect.bottom > viewportHeight) {
          el.classList.add('popover-flip');
        } else {
          el.classList.remove('popover-flip');
        }
      });
    }
    if (!shouldShow && isOpen) {
      el.classList.remove('popover-flip');
      el.hidePopover();
    }
  };

  useEffect(() => syncPopover(locationPopoverRef.current, showLocationPopover), [showLocationPopover]);
  useEffect(() => syncPopover(pricePopoverRef.current, showPricePopover), [showPricePopover]);
  useEffect(() => syncPopover(sizePopoverRef.current, showSizePopover), [showSizePopover]);
  useEffect(() => syncPopover(featuredPopoverRef.current, showFeaturedPopover), [showFeaturedPopover]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchBarRef.current && !searchBarRef.current.contains(event.target as Node)) {
        setActiveDropdown(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const closeDropdowns = () => setActiveDropdown(null);
    window.addEventListener('scroll', closeDropdowns, { passive: true });
    return () => window.removeEventListener('scroll', closeDropdowns);
  }, []);

  const toggleDropdown = (type: 'location' | 'price' | 'size' | 'featured') => {
    setActiveDropdown((prev) => (prev === type ? null : type));
  };

  return (
    <>
      <style>{`
        [data-anchor="${anchorLocation}"] { anchor-name: ${anchorLocation}; }
        [data-anchor="${anchorPrice}"] { anchor-name: ${anchorPrice}; }
        [data-anchor="${anchorSize}"] { anchor-name: ${anchorSize}; }
        [data-anchor="${anchorFeatured}"] { anchor-name: ${anchorFeatured}; }

        [data-popover-id="${anchorLocation}"],
        [data-popover-id="${anchorPrice}"],
        [data-popover-id="${anchorSize}"],
        [data-popover-id="${anchorFeatured}"] {
          position: fixed;
          inset: auto;
          margin: 0;
          margin-top: 8px;
          bottom: auto;
          position-try-fallbacks: flip-block;
        }

        [data-popover-id="${anchorLocation}"] {
          position-anchor: ${anchorLocation};
          top: anchor(bottom);
          left: anchor(left);
          width: 320px;
        }

        [data-popover-id="${anchorPrice}"] {
          position-anchor: ${anchorPrice};
          top: anchor(bottom);
          left: anchor(left);
          width: 260px;
        }

        [data-popover-id="${anchorSize}"] {
          position-anchor: ${anchorSize};
          top: anchor(bottom);
          left: anchor(left);
          width: 240px;
        }

        [data-popover-id="${anchorFeatured}"] {
          position-anchor: ${anchorFeatured};
          top: anchor(bottom);
          right: anchor(right);
          width: 240px;
        }

        @media (min-width: 1280px) {
          [data-popover-id="${anchorLocation}"] { width: Math.max(anchor-size(width), 320px); }
          [data-popover-id="${anchorPrice}"] { width: anchor-size(width); }
          [data-popover-id="${anchorSize}"] { width: anchor-size(width); }
          [data-popover-id="${anchorFeatured}"] { width: anchor-size(width); min-width: 240px; }
        }

        [data-popover-id].popover-flip {
          top: auto !important;
          bottom: calc(anchor(top) + 8px) !important;
          right: anchor(right) !important;
        }
        [data-popover-id="${anchorLocation}"].popover-flip {
          left: anchor(left) !important;
          right: auto !important;
        }
        [data-popover-id="${anchorPrice}"].popover-flip {
          left: anchor(left) !important;
          right: auto !important;
        }
        [data-popover-id="${anchorSize}"].popover-flip {
          left: anchor(left) !important;
          right: auto !important;
        }

        @media (max-width: 767px) {
          [data-popover-id="${anchorLocation}"],
          [data-popover-id="${anchorPrice}"],
          [data-popover-id="${anchorSize}"],
          [data-popover-id="${anchorFeatured}"] {
            left: 16px;
            right: 16px;
            width: auto;
            min-width: 0;
          }
          [data-popover-id="${anchorLocation}"].popover-flip,
          [data-popover-id="${anchorPrice}"].popover-flip,
          [data-popover-id="${anchorSize}"].popover-flip {
            left: 16px !important;
            right: 16px !important;
          }
        }
      `}</style>

      <div
        ref={searchBarRef}
        className="w-full max-w-7xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-md p-3.5 sm:p-4 rounded-3xl xl:rounded-full border border-slate-200/80 dark:border-slate-800 flex flex-col lg:grid lg:grid-cols-2 xl:flex xl:flex-row items-center gap-4 xl:gap-2 relative z-40"
      >
        {/* Segment 1: Location (real districts) */}
        <div
          data-anchor={anchorLocation}
          className="relative flex items-center gap-3 px-4 py-2 w-full xl:w-1/4 border-b lg:border-b-0 lg:border-r border-gray-100 last:border-0 group"
        >
          <div className="p-3 bg-slate-50 rounded-full text-slate-600 flex-shrink-0">
            <MapPin size={20} />
          </div>
          <div className="flex flex-col w-full min-w-0 text-left lg:text-left">
            <label className="text-xs font-medium text-slate-400">{t('properties.district')}</label>
            <input
              type="text"
              value={locationQuery}
              placeholder={t('properties.districtPlaceholder')}
              title={locationQuery}
              onChange={(e) => {
                setLocationQuery(e.target.value);
                setDistrictId(null);
                setActiveDropdown('location');
              }}
              onFocus={() => setActiveDropdown('location')}
              className="text-sm font-semibold text-slate-700 bg-transparent placeholder-slate-400 focus:outline-none mt-0.5 w-full truncate text-left"
            />
          </div>
        </div>

        {/* Segment 2: Price */}
        <div
          data-anchor={anchorPrice}
          onClick={() => toggleDropdown('price')}
          className="relative flex items-center gap-3 px-4 py-2 w-full xl:w-1/4 border-b lg:border-b-0 xl:border-r border-gray-100 last:border-0 cursor-pointer select-none"
        >
          <div className="p-3 bg-slate-50 rounded-full text-slate-600 flex-shrink-0">
            <DollarSign size={20} />
          </div>
          <div className="flex flex-col w-full min-w-0 text-left lg:text-center">
            <label className="text-xs font-medium text-slate-400">{t('properties.price')}</label>
            <div className="flex items-center justify-between mt-0.5">
              <span className="text-sm font-semibold text-slate-700 pr-2 flex-1 text-left lg:text-center truncate" title={PRICE_RANGES[priceIdx].label}>
                {PRICE_RANGES[priceIdx].label}
              </span>
              <ChevronDown size={16} className={`text-slate-400 transition-transform duration-200 flex-shrink-0 ${activeDropdown === 'price' ? 'rotate-180' : ''}`} />
            </div>
          </div>
        </div>

        {/* Segment 3: Land Size */}
        <div
          data-anchor={anchorSize}
          onClick={() => toggleDropdown('size')}
          className="relative flex items-center gap-3 px-4 py-2 w-full xl:w-1/4 border-b lg:border-b-0 lg:border-r border-gray-100 last:border-0 cursor-pointer select-none"
        >
          <div className="p-3 bg-slate-50 rounded-full text-slate-600 flex-shrink-0">
            <Maximize2 size={20} />
          </div>
          <div className="flex flex-col w-full min-w-0 text-left lg:text-center">
            <label className="text-xs font-medium text-slate-400">{t('properties.landSize')}</label>
            <div className="flex items-center justify-between mt-0.5">
              <span className="text-sm font-semibold text-slate-700 pr-2 flex-1 text-left lg:text-center" title={SIZE_RANGES[sizeIdx].label}>
                {SIZE_RANGES[sizeIdx].label}
              </span>
              <ChevronDown size={16} className={`text-slate-400 transition-transform duration-200 flex-shrink-0 ${activeDropdown === 'size' ? 'rotate-180' : ''}`} />
            </div>
          </div>
        </div>

        {/* Segment 4: Featured only */}
        <div
          data-anchor={anchorFeatured}
          onClick={() => toggleDropdown('featured')}
          className="relative flex items-center gap-3 px-4 py-2 w-full xl:w-1/4 cursor-pointer select-none"
        >
          <div className="p-3 bg-slate-50 rounded-full text-slate-600 flex-shrink-0">
            <Star size={20} />
          </div>
          <div className="flex flex-col w-full min-w-0 text-left lg:text-right">
            <label className="text-xs font-medium text-slate-400">{t('properties.listingType')}</label>
            <div className="flex items-center justify-between mt-0.5">
              <span className="text-sm font-semibold text-slate-700 pr-2 flex-1 text-left lg:text-right truncate">
                {featuredOnly ? t('properties.featuredOnlyValue') : t('properties.allListings')}
              </span>
              <ChevronDown size={16} className={`text-slate-400 transition-transform duration-200 flex-shrink-0 ${activeDropdown === 'featured' ? 'rotate-180' : ''}`} />
            </div>
          </div>
        </div>

        {/* Main Action Search Trigger */}
        <button
          onClick={handleSearch}
          className="w-full lg:col-span-2 xl:w-auto bg-brand-primary hover:bg-brand-primary-hover text-white font-bold text-base px-10 py-4 rounded-2xl xl:rounded-full transition-all duration-300 flex items-center justify-center gap-2.5 hover:scale-105 active:scale-95 flex-shrink-0 cursor-pointer"
        >
          <Search size={19} />
          <span>{t('properties.search')}</span>
        </button>

        {/* 1. Location Popover */}
        <div
          ref={locationPopoverRef}
          data-popover-id={anchorLocation}
          {...{ popover: 'manual' }}
          className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-slate-200 dark:border-slate-700 rounded-2xl p-2"
        >
          <div className="text-xs font-semibold text-slate-400 px-3 py-1.5 uppercase tracking-wider">{t('properties.districts')}</div>
          <div className="max-h-48 sm:max-h-60 overflow-y-auto">
            {filteredLocations.length === 0 ? (
              <p className="px-3 py-3 text-sm text-slate-400">{t('properties.noDistricts')}</p>
            ) : (
              filteredLocations.map((loc) => (
                <button
                  key={loc.id}
                  type="button"
                  onClick={() => {
                    setLocationQuery(loc.label);
                    setDistrictId(loc.id);
                    setActiveDropdown(null);
                  }}
                  className="w-full text-left px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 rounded-xl hover:text-brand-primary transition-colors flex items-center gap-2"
                >
                  <MapPin size={16} className="text-slate-400 shrink-0" /> {loc.label}
                </button>
              ))
            )}
          </div>
        </div>

        {/* 2. Price Popover */}
        <div
          ref={pricePopoverRef}
          data-popover-id={anchorPrice}
          {...{ popover: 'manual' }}
          className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-slate-200 dark:border-slate-700 rounded-2xl p-2"
        >
          <div className="text-xs font-semibold text-slate-400 px-3 py-1.5 uppercase tracking-wider">{t('properties.priceRange')}</div>
          <div className="max-h-60 overflow-y-auto">
            {PRICE_RANGES.map((range, idx) => (
              <button
                key={range.label}
                type="button"
                onClick={() => { setPriceIdx(idx); setActiveDropdown(null); }}
                className={`w-full text-left px-3 py-2.5 text-sm font-medium rounded-xl transition-colors ${idx === priceIdx ? 'text-brand-primary bg-slate-50' : 'text-slate-700 hover:bg-slate-50 hover:text-brand-primary'}`}
              >
                {range.label}
              </button>
            ))}
          </div>
        </div>

        {/* 3. Land Size Popover */}
        <div
          ref={sizePopoverRef}
          data-popover-id={anchorSize}
          {...{ popover: 'manual' }}
          className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-slate-200 dark:border-slate-700 rounded-2xl p-2"
        >
          <div className="text-xs font-semibold text-slate-400 px-3 py-1.5 uppercase tracking-wider">{t('properties.landSize')}</div>
          <div className="max-h-48 sm:max-h-60 overflow-y-auto">
            {SIZE_RANGES.map((range, idx) => (
              <button
                key={range.label}
                type="button"
                onClick={() => { setSizeIdx(idx); setActiveDropdown(null); }}
                className={`w-full text-left px-3 py-2.5 text-sm font-medium rounded-xl transition-colors ${idx === sizeIdx ? 'text-brand-primary bg-slate-50' : 'text-slate-700 hover:bg-slate-50 hover:text-brand-primary'}`}
              >
                {range.label}
              </button>
            ))}
          </div>
        </div>

        {/* 4. Featured-only Popover */}
        <div
          ref={featuredPopoverRef}
          data-popover-id={anchorFeatured}
          {...{ popover: 'manual' }}
          className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-slate-200 dark:border-slate-700 rounded-2xl p-2"
        >
          <button
            type="button"
            onClick={() => { setFeaturedOnly(false); setActiveDropdown(null); }}
            className={`w-full text-left px-3 py-2.5 text-sm font-medium rounded-xl transition-colors ${!featuredOnly ? 'text-brand-primary bg-slate-50' : 'text-slate-700 hover:bg-slate-50 hover:text-brand-primary'}`}
          >
            {t('properties.allListings')}
          </button>
          <button
            type="button"
            onClick={() => { setFeaturedOnly(true); setActiveDropdown(null); }}
            className={`w-full text-left px-3 py-2.5 text-sm font-medium rounded-xl transition-colors ${featuredOnly ? 'text-brand-primary bg-slate-50' : 'text-slate-700 hover:bg-slate-50 hover:text-brand-primary'}`}
          >
            {t('properties.featuredOnlyValue')}
          </button>
        </div>
      </div>
    </>
  );
};
