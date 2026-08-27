import React, { useState } from 'react';
import { 
  MapPin, 
  Calendar, 
  User, 
  Mail, 
  Tag, 
  Maximize2, 
  MoreVertical, 
  Eye, 
  Edit3, 
  Trash2, 
  Star, 
  CheckCircle2, 
  Copy, 
  Check,
  ExternalLink,
  ShieldCheck
} from 'lucide-react';
import type { AdminListing, MyListing, ListingStatus } from '@/api/types';
import { formatRelativeTime } from '@/utils/format';

interface PropertyCardProps {
  property: AdminListing | MyListing | any;
  onEdit?: () => void;
  onDelete?: () => void;
  onView?: () => void;
  onToggleFeatured?: () => void;
  onApprove?: () => void;
  onReject?: () => void;
  onMarkSold?: () => void;
  isAdminView?: boolean;
}

export const PropertyCard: React.FC<PropertyCardProps> = ({
  property,
  onEdit,
  onDelete,
  onView,
  onToggleFeatured,
  onApprove,
  onReject,
  onMarkSold,
  isAdminView = false,
}) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [copiedUpi, setCopiedUpi] = useState(false);

  if (!property) return null;

  const status: ListingStatus = property.status || 'pending';

  const statusConfig = {
    approved: {
      label: 'Published',
      pill: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      dot: 'bg-emerald-500',
    },
    pending: {
      label: 'Pending Review',
      pill: 'bg-amber-50 text-amber-700 border-amber-200',
      dot: 'bg-amber-500',
    },
    sold: {
      label: 'Sold Out',
      pill: 'bg-blue-50 text-blue-700 border-blue-200',
      dot: 'bg-blue-500',
    },
    rejected: {
      label: 'Rejected',
      pill: 'bg-rose-50 text-rose-700 border-rose-200',
      dot: 'bg-rose-500',
    },
  }[status] || {
    label: status,
    pill: 'bg-slate-50 text-slate-700 border-slate-200',
    dot: 'bg-slate-400',
  };

  const formattedPrice = property.price_rwf
    ? `RWF ${Number(property.price_rwf).toLocaleString()}`
    : property.price_usd
    ? `USD ${Number(property.price_usd).toLocaleString()}`
    : 'Price on request';

  const sizeText = property.size_value
    ? `${Number(property.size_value).toLocaleString()} ${property.size_unit === 'hectare' ? 'ha' : 'sqm'}`
    : '—';

  const coverImage = property.cover_image || property.images?.[0] || '/assets/images/gw-homes-og.png';
  const ownerName = property.seller_name || property.seller?.full_name || 'Verified Owner';
  const ownerEmail = property.seller_email || property.seller?.email || 'seller@gwland.rw';
  const propertyId = property.upi || (property.id ? String(property.id).slice(0, 8) : 'GW-577');
  const dateStr = property.updated_at ? formatRelativeTime(property.updated_at) : formatRelativeTime(property.created_at || new Date().toISOString());

  const handleCopyUPI = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (property.upi) {
      navigator.clipboard.writeText(property.upi);
      setCopiedUpi(true);
      setTimeout(() => setCopiedUpi(false), 2000);
    }
  };

  return (
    <div className="group relative bg-white rounded-2xl border border-slate-200/80 shadow-[0_2px_12px_-3px_rgba(0,0,0,0.04)] hover:shadow-xl hover:border-slate-300 transition-all duration-300 flex flex-col justify-between overflow-hidden">
      {/* Top Media Container */}
      <div className="relative h-48 sm:h-52 w-full overflow-hidden bg-slate-100">
        <img
          src={coverImage}
          alt={property.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          onError={(e) => {
            (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=600&q=80';
          }}
        />

        {/* Top Floating Badges */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none">
          <div className="flex items-center gap-1.5 flex-wrap">
            {/* Status pill */}
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border backdrop-blur-md shadow-xs ${statusConfig.pill}`}>
              <span className={`w-2 h-2 rounded-full ${statusConfig.dot} animate-pulse`} />
              {statusConfig.label}
            </span>

            {/* Featured tag */}
            {property.is_featured && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-extrabold bg-[#F38118] text-white shadow-xs">
                <Star size={11} className="fill-white" /> Featured
              </span>
            )}
          </div>

          {/* View Count */}
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold bg-[#122844]/80 text-white backdrop-blur-md">
            <Eye size={12} /> {property.view_count || 0}
          </span>
        </div>

        {/* Price tag banner at bottom of image */}
        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
          <span className="px-3 py-1 rounded-xl bg-[#122844]/90 backdrop-blur-md text-white text-sm font-black shadow-sm">
            {formattedPrice}
          </span>

          <span className="px-2.5 py-1 rounded-xl bg-white/90 backdrop-blur-md text-[#1B395F] text-xs font-bold shadow-sm">
            {sizeText}
          </span>
        </div>
      </div>

      {/* Card Content Body */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-4">
        {/* Title and location */}
        <div>
          <div className="flex items-start justify-between gap-2">
            <h3 
              onClick={onView}
              className="text-base font-extrabold text-slate-800 hover:text-[#1B395F] line-clamp-1 cursor-pointer transition-colors"
              title={property.title}
            >
              {property.title}
            </h3>

            {/* Action 3-dots Menu Button */}
            <div className="relative flex-shrink-0">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setMenuOpen(!menuOpen);
                }}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                title="Options"
              >
                <MoreVertical size={16} />
              </button>

              {menuOpen && (
                <>
                  <div 
                    className="fixed inset-0 z-40" 
                    onClick={() => setMenuOpen(false)} 
                  />
                  <div className="absolute right-0 top-full mt-1 w-44 bg-white rounded-xl shadow-xl border border-slate-200/90 py-1.5 z-50 text-xs font-semibold text-slate-700 divide-y divide-slate-100">
                    <div className="py-1">
                      {onView && (
                        <button
                          onClick={() => { setMenuOpen(false); onView(); }}
                          className="w-full text-left px-3.5 py-2 hover:bg-slate-50 flex items-center gap-2 cursor-pointer"
                        >
                          <Eye size={14} className="text-slate-400" /> View Details
                        </button>
                      )}
                      {onEdit && (
                        <button
                          onClick={() => { setMenuOpen(false); onEdit(); }}
                          className="w-full text-left px-3.5 py-2 hover:bg-slate-50 flex items-center gap-2 cursor-pointer text-[#1B395F]"
                        >
                          <Edit3 size={14} className="text-[#1B395F]" /> Edit Property
                        </button>
                      )}
                      {onToggleFeatured && (
                        <button
                          onClick={() => { setMenuOpen(false); onToggleFeatured(); }}
                          className="w-full text-left px-3.5 py-2 hover:bg-slate-50 flex items-center gap-2 cursor-pointer"
                        >
                          <Star size={14} className="text-amber-500" />
                          {property.is_featured ? 'Remove Featured' : 'Mark Featured'}
                        </button>
                      )}
                    </div>

                    {isAdminView && (
                      <div className="py-1">
                        {status === 'pending' && onApprove && (
                          <button
                            onClick={() => { setMenuOpen(false); onApprove(); }}
                            className="w-full text-left px-3.5 py-2 hover:bg-emerald-50 text-emerald-600 flex items-center gap-2 cursor-pointer"
                          >
                            <CheckCircle2 size={14} /> Approve Listing
                          </button>
                        )}
                        {status === 'pending' && onReject && (
                          <button
                            onClick={() => { setMenuOpen(false); onReject(); }}
                            className="w-full text-left px-3.5 py-2 hover:bg-rose-50 text-rose-600 flex items-center gap-2 cursor-pointer"
                          >
                            <ShieldCheck size={14} /> Reject Listing
                          </button>
                        )}
                      </div>
                    )}

                    {onMarkSold && status !== 'sold' && (
                      <div className="py-1">
                        <button
                          onClick={() => { setMenuOpen(false); onMarkSold(); }}
                          className="w-full text-left px-3.5 py-2 hover:bg-blue-50 text-blue-600 flex items-center gap-2 cursor-pointer"
                        >
                          <Tag size={14} /> Mark as Sold
                        </button>
                      </div>
                    )}

                    {onDelete && (
                      <div className="py-1">
                        <button
                          onClick={() => { setMenuOpen(false); onDelete(); }}
                          className="w-full text-left px-3.5 py-2 hover:bg-rose-50 text-rose-600 flex items-center gap-2 cursor-pointer"
                        >
                          <Trash2 size={14} /> Delete
                        </button>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-1">
            <MapPin size={13} className="text-[#54B5BB] flex-shrink-0" />
            <span className="truncate">{property.sector || 'Kinyinya'}, {property.district || 'Gasabo'}</span>
          </div>
        </div>

        {/* 2x2 Meta Grid (Modeled on Image 2) */}
        <div className="grid grid-cols-2 gap-2.5 p-3 rounded-xl bg-slate-50/80 border border-slate-100 text-xs">
          <div className="space-y-0.5">
            <span className="text-[10.5px] font-bold text-slate-400 uppercase tracking-wider block">Owner</span>
            <span className="font-bold text-[#1B395F] hover:underline cursor-pointer truncate block" title={ownerName}>
              {ownerName}
            </span>
          </div>

          <div className="space-y-0.5">
            <span className="text-[10.5px] font-bold text-slate-400 uppercase tracking-wider block">Added By</span>
            <span className="font-medium text-slate-600 truncate block" title={ownerEmail}>
              {ownerEmail}
            </span>
          </div>

          <div className="space-y-0.5">
            <span className="text-[10.5px] font-bold text-slate-400 uppercase tracking-wider block">UPI Code</span>
            <button
              onClick={handleCopyUPI}
              className="inline-flex items-center gap-1 font-mono font-bold text-slate-700 hover:text-[#1B395F] transition-colors cursor-pointer truncate max-w-full"
              title="Click to copy UPI"
            >
              <span className="truncate">{property.upi || propertyId}</span>
              {copiedUpi ? <Check size={11} className="text-emerald-600" /> : <Copy size={11} className="text-slate-400" />}
            </button>
          </div>

          <div className="space-y-0.5">
            <span className="text-[10.5px] font-bold text-slate-400 uppercase tracking-wider block">Last Updated</span>
            <span className="font-medium text-slate-500 truncate block">
              {dateStr}
            </span>
          </div>
        </div>

        {/* Action Buttons Footer */}
        <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100">
          <button
            onClick={onView}
            className="flex-1 py-2 px-3 rounded-xl bg-slate-100 hover:bg-[#1B395F] hover:text-white text-slate-700 text-xs font-bold transition-all duration-200 flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Eye size={13} /> View Details
          </button>

          {onEdit && (
            <button
              onClick={onEdit}
              className="py-2 px-3 rounded-xl bg-[#54B5BB]/15 hover:bg-[#54B5BB] text-[#1B395F] hover:text-white text-xs font-bold transition-all duration-200 flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Edit3 size={13} /> Edit
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
