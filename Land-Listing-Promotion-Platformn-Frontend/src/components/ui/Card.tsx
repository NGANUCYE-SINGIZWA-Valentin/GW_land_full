import React from 'react';
import { Link } from 'react-router-dom';
import { Property } from '@/types/property';
import { Maximize2, MapPin, Edit, Trash2, Eye, ArrowRight, ShieldCheck, Heart } from 'lucide-react';
import { formatCompactPrice } from '@/utils/format';
import { formatSize } from '@/utils/listingAdapters';
import { Highlight } from '@/pages/public/PropertiesPage';
import { useAuth } from '@/components/auth/AuthContext';
import { useFavorites } from '@/components/favorites/FavoritesContext';

interface PropertyCardProps {
  property: Property;
  variant?: 'public' | 'dashboard';
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  onHover?: (id: string | null) => void;
  size?: 'sm' | 'md';
  highlight?: string;
}

export const PropertyCard: React.FC<PropertyCardProps> = ({
  property,
  variant = 'public',
  onEdit,
  onDelete,
  onHover,
  size,
  highlight = '',
}) => {
  const isDashboard = variant === 'dashboard';
  const { user } = useAuth();
  const { isFavorited, toggleFavorite } = useFavorites();
  const showFavorite = !isDashboard && user?.role === 'Buyer';
  const favorited = showFavorite && isFavorited(property.id);

  const cardContent = (
    <div
      className={`bg-white dark:bg-slate-900 rounded-3xl overflow-hidden border border-slate-200/90 dark:border-slate-800 transition-all duration-300 group ${isDashboard
          ? 'flex flex-col sm:flex-row h-auto sm:h-48'
          : 'hover:border-brand-secondary/40 hover:-translate-y-1'
        }`}
      onMouseEnter={() => onHover?.(property.id)}
      onMouseLeave={() => onHover?.(null)}
    >
      {/* 1. Zone Image / Tag */}
      <div className={`relative overflow-hidden bg-slate-50 dark:bg-slate-800 shrink-0 ${isDashboard ? 'w-full sm:w-48 h-48 sm:h-full' : size === 'sm' ? 'h-36 sm:h-48' : 'h-36 sm:h-56 md:h-60'
        }`}>
        <img
          src={property.imageUrl}
          alt={property.title}
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
        />

        {!isDashboard && (
          <>
            <div className="absolute top-2 left-2 sm:top-3 sm:left-3 flex flex-col gap-1 z-10">
              {/* FEATURED Badge */}
              {property.tag === 'FEATURED' && (
                <span className="text-[8px] sm:text-[9px] tracking-wider font-extrabold px-1.5 py-0.5 sm:px-2.5 sm:py-1 rounded bg-brand-primary text-white shadow-sm">
                  FEATURED
                </span>
              )}
              {/* VERIFIED Badge — only shown when the seller actually holds the badge */}
              {property.isVerifiedSeller && (
                <span className="text-[8px] sm:text-[9px] tracking-wider font-extrabold px-1.5 py-0.5 sm:px-2.5 sm:py-1 rounded bg-emerald-600 text-white shadow-sm flex items-center gap-0.5 sm:gap-1">
                  <ShieldCheck size={10} /> VERIFIED
                </span>
              )}
            </div>
            {showFavorite && (
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  toggleFavorite(property.id);
                }}
                aria-label={favorited ? 'Remove from favorites' : 'Add to favorites'}
                className="absolute top-2 right-2 sm:top-3 sm:right-3 z-10 p-1.5 sm:p-2 rounded-full bg-white/90 dark:bg-slate-900/80 backdrop-blur-sm shadow-sm hover:scale-110 active:scale-95 transition-transform duration-150 cursor-pointer"
              >
                <Heart
                  size={14}
                  className={favorited ? 'fill-red-500 text-red-500' : 'text-slate-500'}
                />
              </button>
            )}
          </>
        )}
      </div>

      {/* 2. Zone Contenu Principal */}
      <div className="p-3 sm:p-5 flex flex-col justify-between flex-grow">
        <div>
          <div className="flex justify-between items-start mb-1">
            <h3 className="text-sm sm:text-xl font-extrabold text-slate-900 dark:text-white tracking-tight truncate">
              RWF {formatCompactPrice(property.price)}
            </h3>

            {/* Statut spécifique au Dashboard */}
            {isDashboard && (
              <span className="text-[10px] sm:text-[11px] font-semibold px-2 py-0.5 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 rounded-full border border-emerald-200 dark:border-emerald-800/50">
                Actif
              </span>
            )}
          </div>

          <h4 className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200 line-clamp-1 mb-0.5 sm:mb-1 group-hover:text-brand-primary dark:group-hover:text-brand-secondary transition-colors">
            <Highlight text={property.title} query={highlight} />
          </h4>

          <div className="flex items-center gap-1 text-slate-400 dark:text-slate-500 text-[10px] sm:text-xs truncate">
            <MapPin size={11} className="text-brand-secondary shrink-0" />
            <span className="truncate">
              <Highlight text={property.location} query={highlight} />
            </span>
          </div>
        </div>

        {/* 3. Section Conditionnelle Bas de Carte */}
        {isDashboard ? (
          /* VARIANTE DASHBOARD : Barre d'actions d'administration */
          <div className="flex items-center justify-between pt-2 sm:pt-3 border-t border-slate-100 dark:border-slate-800 mt-2">
            <div className="flex gap-2 sm:gap-4 text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 font-medium">
              <span className="flex items-center gap-1"><Maximize2 size={11} /> {formatSize(property.sizeValue, property.sizeUnit)}</span>
            </div>

            <div className="flex gap-1">
              <button
                onClick={() => onEdit?.(property.id)}
                className="p-1.5 text-slate-600 dark:text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                title="Modifier"
              >
                <Edit size={14} />
              </button>
              <button
                onClick={() => onDelete?.(property.id)}
                className="p-1.5 text-slate-600 dark:text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                title="Supprimer"
              >
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        ) : (
          /* VARIANTE PUBLIQUE : Taille du terrain + Vues & View Details */
          <div className="mt-2 sm:mt-3 pt-2 sm:pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-col gap-2 sm:gap-3.5">
            <div className="flex items-center justify-between">
              <div className="flex flex-wrap items-center gap-x-1.5 sm:gap-x-2.5 gap-y-0.5 text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 font-bold">
                <span className="flex items-center gap-1"><Maximize2 size={12} /> {formatSize(property.sizeValue, property.sizeUnit)}</span>
              </div>

              <span className="hidden sm:flex items-center gap-1 text-[11px] text-slate-400 dark:text-slate-500 font-semibold shrink-0">
                <Eye size={12} />
                {property.viewCount} views
              </span>
            </div>

            <div className="flex justify-end pt-1 border-t border-slate-50 dark:border-slate-800">
              <span className="text-[11px] sm:text-xs font-extrabold text-brand-primary dark:text-brand-secondary group-hover:text-brand-secondary transition-colors flex items-center gap-1 cursor-pointer">
                View Details
                <ArrowRight size={12} className="transform group-hover:translate-x-1.5 transition-transform duration-300" />
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  if (isDashboard) {
    return cardContent;
  }

  return (
    <Link to={`/properties/${property.slug}`} className="block">
      {cardContent}
    </Link>
  );
};
