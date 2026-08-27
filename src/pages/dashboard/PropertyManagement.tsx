import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { StatCard } from '@/components/dashboard/StatCard';
import { TableBlueprint, ColumnConfig } from '@/components/dashboard/TableBlueprint';
import { DrawerBlueprint } from '@/components/dashboard/DrawerBlueprint';
import { PropertyCard } from '@/components/dashboard/PropertyCard';
import {
  StatGridSkeleton,
  PropertyGridSkeleton,
} from '@/components/dashboard/DashboardSkeletons';
import { AlertDialog } from '@/components/ui/AlertDialog';
import { DashboardButton } from '@/components/ui/DashboardButton';
import { TextArea } from '@/components/wizard/FormField';
import {
  Tooltip,
  PropertyStatusBadgeTooltip,
  TruncatedCellTooltip,
} from '@/components/ui/Tooltip';
import {
  Home,
  Clock,
  CheckCircle2,
  Star,
  Building2,
  DollarSign,
  Maximize2,
  MapPin,
  User,
  LayoutGrid,
  List,
  Search,
  Plus,
  Filter,
  ShieldCheck,
  FileText,
  ExternalLink,
  Tag,
  Trash2,
  RefreshCw,
} from 'lucide-react';
import { useAuth } from '@/components/auth/AuthContext';
import * as adminApi from '@/api/admin';
import { ApiError } from '@/api/client';
import type { AdminListing, ListingStatus } from '@/api/types';

type KpiFilter = 'all' | 'pending' | 'approved' | 'featured' | 'sold';
type ViewMode = 'grid' | 'table';

const STATUS_STYLE: Record<ListingStatus, string> = {
  approved: 'bg-emerald-50 border-emerald-100 text-emerald-600',
  pending: 'bg-amber-50 border-amber-100 text-amber-600',
  sold: 'bg-blue-50 border-blue-100 text-blue-600',
  rejected: 'bg-red-50 border-red-100 text-red-600',
};
const STATUS_DOT: Record<ListingStatus, string> = {
  approved: 'bg-emerald-500', pending: 'bg-amber-500', sold: 'bg-blue-500', rejected: 'bg-red-500',
};

const formatPrice = (l: AdminListing): string => {
  const parts: string[] = [];
  if (l.price_rwf) parts.push(`RWF ${Number(l.price_rwf).toLocaleString()}`);
  if (l.price_usd) parts.push(`USD ${Number(l.price_usd).toLocaleString()}`);
  return parts.join(' / ') || 'Price on request';
};
const formatSize = (l: AdminListing): string => `${Number(l.size_value).toLocaleString()} ${l.size_unit === 'hectare' ? 'ha' : 'sqm'}`;

export const PropertyManagement: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const isAdmin = user?.role === 'Administrator';

  const [listings, setListings] = useState<AdminListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeKpiFilter, setActiveKpiFilter] = useState<KpiFilter>('all');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [searchQuery, setSearchQuery] = useState('');

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedListing, setSelectedListing] = useState<AdminListing | null>(null);
  const [drawerMode, setDrawerMode] = useState<'review' | 'reject'>('review');
  const [rejectReason, setRejectReason] = useState('');
  const [actionError, setActionError] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [listingToDelete, setListingToDelete] = useState<AdminListing | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const loadListings = () => {
    setLoading(true);
    adminApi.getAllListings(undefined, 1, 100)
      .then((res) => setListings(res?.listings || []))
      .catch(() => setError('Failed to load listings.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadListings(); }, []);

  const kpiCounts = useMemo(() => ({
    all: listings.length,
    pending: listings.filter((l) => l.status === 'pending').length,
    approved: listings.filter((l) => l.status === 'approved').length,
    featured: listings.filter((l) => l.is_featured).length,
    sold: listings.filter((l) => l.status === 'sold').length,
  }), [listings]);

  const filteredListings = useMemo(() => {
    let result = listings;
    if (activeKpiFilter === 'pending') result = result.filter((l) => l.status === 'pending');
    else if (activeKpiFilter === 'approved') result = result.filter((l) => l.status === 'approved');
    else if (activeKpiFilter === 'featured') result = result.filter((l) => l.is_featured);
    else if (activeKpiFilter === 'sold') result = result.filter((l) => l.status === 'sold');

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter((l) =>
        l.title.toLowerCase().includes(q) ||
        (l.upi && l.upi.toLowerCase().includes(q)) ||
        l.district.toLowerCase().includes(q) ||
        l.sector.toLowerCase().includes(q) ||
        (l.seller_name && l.seller_name.toLowerCase().includes(q))
      );
    }
    return result;
  }, [listings, activeKpiFilter, searchQuery]);

  const openReview = (listing: AdminListing) => {
    setSelectedListing(listing);
    setDrawerMode('review');
    setActionError('');
    setIsDrawerOpen(true);
  };

  const openReject = (listing: AdminListing) => {
    setSelectedListing(listing);
    setDrawerMode('reject');
    setRejectReason('');
    setActionError('');
    setIsDrawerOpen(true);
  };

  const handleApprove = async (listing: AdminListing) => {
    setActionLoading(true);
    try {
      await adminApi.approveListing(listing.id);
      setIsDrawerOpen(false);
      loadListings();
    } catch (err) {
      setActionError(err instanceof ApiError ? err.message : 'Failed to approve.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!selectedListing || !rejectReason.trim()) return;
    setActionLoading(true);
    try {
      await adminApi.rejectListing(selectedListing.id, rejectReason.trim());
      setIsDrawerOpen(false);
      loadListings();
    } catch (err) {
      setActionError(err instanceof ApiError ? err.message : 'Failed to reject.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggleFeatured = async (listing: AdminListing) => {
    try {
      await adminApi.setFeatured(listing.id, !listing.is_featured);
      loadListings();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to update featured status.');
    }
  };

  const confirmDelete = (listing: AdminListing) => {
    setListingToDelete(listing);
    setIsDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!listingToDelete) return;
    setIsDeleting(true);
    try {
      await adminApi.deleteListing(listingToDelete.id);
      setIsDeleteDialogOpen(false);
      setListingToDelete(null);
      loadListings();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to delete listing.');
    } finally {
      setIsDeleting(false);
    }
  };

  const tableColumns: ColumnConfig<AdminListing>[] = [
    {
      header: 'Property Details',
      accessorKey: 'title',
      tooltip: 'Parcel title, sector & district location, and unique UPI registry identifier. Click title to inspect documents.',
      render: (l) => (
        <div className="flex items-center gap-3">
          <img
            src={l.cover_image || '/assets/images/gw-homes-og.png'}
            alt=""
            className="w-12 h-12 rounded-xl object-cover border border-slate-100 flex-shrink-0"
          />
          <div className="flex flex-col min-w-0">
            <TruncatedCellTooltip
              text={l.title}
              fullText={l.title}
              subtext={`${l.sector}, ${l.district} — ${formatSize(l)}`}
              maxWidthClass="max-w-[200px] sm:max-w-xs"
            />
            <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-0.5">
              <MapPin size={11} className="text-[#54B5BB]" />
              <span className="truncate">{l.sector}, {l.district}</span>
              {l.upi && (
                <TruncatedCellTooltip
                  text={l.upi}
                  fullText={l.upi}
                  subtext="National Land Authority Unique Parcel Identifier (UPI)"
                  allowCopy={true}
                  badge="UPI Code"
                  maxWidthClass="max-w-[130px]"
                />
              )}
            </div>
          </div>
        </div>
      ),
    },
    {
      header: 'Price & Size',
      accessorKey: 'price_rwf',
      tooltip: 'Listing price converted in dual currencies (RWF / USD) and total surveyed land area.',
      render: (l) => (
        <div className="flex flex-col">
          <span className="font-bold text-slate-800 text-xs">{formatPrice(l)}</span>
          <span className="text-[11px] text-slate-400">{formatSize(l)}</span>
        </div>
      ),
    },
    {
      header: 'Seller',
      accessorKey: 'seller_name',
      tooltip: 'Verified property owner, broker agency, or real estate developer contact.',
      render: (l) => (
        <div className="flex flex-col">
          <TruncatedCellTooltip
            text={l.seller_name || 'Owner'}
            fullText={l.seller_name || 'Owner'}
            subtext={l.seller_email || 'No email registered'}
            maxWidthClass="max-w-[140px]"
          />
          <span className="text-[10.5px] text-slate-400">{l.seller_email || '—'}</span>
        </div>
      ),
    },
    {
      header: 'Status',
      accessorKey: 'status',
      tooltip: 'Land registry vetting and marketplace visibility status. Hover badge for lifecycle details.',
      render: (l) => (
        <PropertyStatusBadgeTooltip
          status={l.status}
          isFeatured={l.is_featured}
        />
      ),
    },
    {
      header: 'Actions',
      accessorKey: 'id',
      tooltip: 'Administrative verification tools: Inspect deed dossier, feature on home spotlights, or delete.',
      render: (l) => (
        <div className="flex items-center justify-end gap-1.5">
          <Tooltip content="Inspect deed docs & review parcel" position="top" variant="dark">
            <button
              onClick={() => openReview(l)}
              className="p-1.5 rounded-lg bg-slate-100 hover:bg-[#1B395F] hover:text-white text-slate-700 transition-colors cursor-pointer"
            >
              <ShieldCheck size={15} />
            </button>
          </Tooltip>
          <Tooltip content={l.is_featured ? 'Remove from Featured carousel' : 'Spotlight as Featured Property'} position="top" variant="brand">
            <button
              onClick={() => handleToggleFeatured(l)}
              className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                l.is_featured ? 'bg-amber-50 text-amber-600 border-amber-200' : 'bg-white text-slate-400 border-slate-200 hover:text-amber-500'
              }`}
            >
              <Star size={15} />
            </button>
          </Tooltip>
          {isAdmin && (
            <Tooltip content="Permanently delete parcel listing" position="top" variant="danger">
              <button
                onClick={() => confirmDelete(l)}
                className="p-1.5 rounded-lg bg-white border border-rose-200 text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
              >
                <Trash2 size={15} />
              </button>
            </Tooltip>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6 w-full min-w-0">
      {/* Top Header & Quick Action Bar (Modeled on Image 2) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
            Property & Land Listings
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Review land titles, moderate seller submissions, and manage featured platform parcels.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <DashboardButton
            variant="outline"
            size="sm"
            onClick={loadListings}
            icon={<RefreshCw size={14} className={loading ? 'animate-spin' : ''} />}
          >
            Refresh
          </DashboardButton>

          <DashboardButton
            variant="primary"
            size="md"
            pill
            onClick={() => navigate('/dashboard/properties/new')}
            icon={<Plus size={16} />}
          >
            + Add New Property
          </DashboardButton>
        </div>
      </div>

      {/* KPI Filter Stat Cards (Image 1 & 2 Style) */}
      {loading ? (
        <StatGridSkeleton count={5} cols="grid-cols-2 sm:grid-cols-3 lg:grid-cols-5" />
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
          <StatCard
            title="All Listings"
            value={String(kpiCounts.all)}
            icon={<Building2 size={18} />}
            accentGradient="navy"
            isActive={activeKpiFilter === 'all'}
            onClick={() => setActiveKpiFilter('all')}
            comparisonLabel="total in DB"
          />
          <StatCard
            title="Pending Review"
            value={String(kpiCounts.pending)}
            icon={<Clock size={18} />}
            accentGradient="amber"
            isActive={activeKpiFilter === 'pending'}
            onClick={() => setActiveKpiFilter('pending')}
            changeType={kpiCounts.pending > 0 ? 'negative' : 'positive'}
            change={kpiCounts.pending > 0 ? `${kpiCounts.pending} queued` : 'Clear'}
            comparisonLabel="requires action"
          />
          <StatCard
            title="Published / Live"
            value={String(kpiCounts.approved)}
            icon={<CheckCircle2 size={18} />}
            accentGradient="emerald"
            isActive={activeKpiFilter === 'approved'}
            onClick={() => setActiveKpiFilter('approved')}
            change="+8.2%"
            comparisonLabel="active buyers"
          />
          <StatCard
            title="Featured Lands"
            value={String(kpiCounts.featured)}
            icon={<Star size={18} />}
            accentGradient="teal"
            isActive={activeKpiFilter === 'featured'}
            onClick={() => setActiveKpiFilter('featured')}
            comparisonLabel="promoted"
          />
          <StatCard
            title="Completed / Sold"
            value={String(kpiCounts.sold)}
            icon={<Tag size={18} />}
            accentGradient="cyan"
            isActive={activeKpiFilter === 'sold'}
            onClick={() => setActiveKpiFilter('sold')}
            comparisonLabel="transacted"
          />
        </div>
      )}

      {/* Search, Filter & View Mode Switcher Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-[0_2px_12px_-3px_rgba(0,0,0,0.04)] flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Search input with icon */}
        <div className="relative w-full md:w-80">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search title, UPI, sector, district..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1B395F] transition-all"
          />
        </div>

        {/* View mode toggle (Grid / Table) + Status Filter Tabs */}
        <div className="flex items-center justify-between md:justify-end w-full md:w-auto gap-3">
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-bold">
            {(['all', 'pending', 'approved', 'featured', 'sold'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveKpiFilter(tab)}
                className={`px-3 py-1.5 rounded-lg capitalize transition-all cursor-pointer ${
                  activeKpiFilter === tab
                    ? 'bg-[#1B395F] text-white shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1 border border-slate-200 rounded-xl p-1 bg-slate-50">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                viewMode === 'grid' ? 'bg-[#1B395F] text-white shadow-xs' : 'text-slate-400 hover:text-slate-700'
              }`}
              title="Grid View"
            >
              <LayoutGrid size={16} />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                viewMode === 'table' ? 'bg-[#1B395F] text-white shadow-xs' : 'text-slate-400 hover:text-slate-700'
              }`}
              title="Table View"
            >
              <List size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      {loading ? (
        viewMode === 'grid' ? (
          <PropertyGridSkeleton count={6} />
        ) : (
          <TableBlueprint
            columns={tableColumns}
            data={[]}
            isLoading={true}
            totalItems={0}
          />
        )
      ) : filteredListings.length === 0 ? (
        <div className="bg-white p-12 rounded-2xl border border-dashed border-slate-200 text-center space-y-3">
          <Building2 size={40} className="mx-auto text-slate-300" />
          <h3 className="text-base font-extrabold text-slate-700">No properties found</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            {searchQuery ? `No properties matching "${searchQuery}"` : 'No listings currently under this filter.'}
          </p>
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="text-xs font-bold text-[#1B395F] hover:underline"
            >
              Clear Search Query
            </button>
          )}
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full min-w-0">
          {filteredListings.map((property) => (
            <PropertyCard
              key={property.id}
              property={property}
              isAdminView={true}
              onView={() => openReview(property)}
              onToggleFeatured={() => handleToggleFeatured(property)}
              onApprove={() => handleApprove(property)}
              onReject={() => openReject(property)}
              onDelete={isAdmin ? () => confirmDelete(property) : undefined}
            />
          ))}
        </div>
      ) : (
        <TableBlueprint
          columns={tableColumns}
          data={filteredListings}
          totalItems={filteredListings.length}
        />
      )}

      {/* Property Review & Verification Drawer */}
      <DrawerBlueprint
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        title={drawerMode === 'review' ? 'Property Verification & Inspection' : 'Reject Listing'}
        subtitle={selectedListing?.title}
        footer={
          drawerMode === 'review' ? (
            <div className="flex gap-3 w-full">
              {selectedListing?.status === 'pending' && (
                <>
                  <DashboardButton
                    variant="danger-outline"
                    fullWidth
                    onClick={() => setDrawerMode('reject')}
                  >
                    Reject Listing
                  </DashboardButton>
                  <DashboardButton
                    variant="teal"
                    fullWidth
                    onClick={() => selectedListing && handleApprove(selectedListing)}
                    disabled={actionLoading}
                  >
                    {actionLoading ? 'Approving...' : 'Approve & Publish'}
                  </DashboardButton>
                </>
              )}
              {selectedListing?.status === 'approved' && (
                <DashboardButton
                  variant="outline"
                  fullWidth
                  onClick={() => setIsDrawerOpen(false)}
                >
                  Close
                </DashboardButton>
              )}
            </div>
          ) : (
            <div className="flex gap-3 w-full">
              <DashboardButton variant="outline" fullWidth onClick={() => setDrawerMode('review')}>
                Back to Review
              </DashboardButton>
              <DashboardButton
                variant="danger"
                fullWidth
                onClick={handleReject}
                disabled={actionLoading || !rejectReason.trim()}
              >
                {actionLoading ? 'Rejecting...' : 'Confirm Rejection'}
              </DashboardButton>
            </div>
          )
        }
      >
        {selectedListing && drawerMode === 'review' && (
          <div className="space-y-6">
            {/* Cover Image & Status */}
            <div className="relative rounded-2xl overflow-hidden h-52 bg-slate-100 border border-slate-200">
              <img
                src={selectedListing.cover_image || '/assets/images/gw-homes-og.png'}
                alt=""
                className="w-full h-full object-cover"
              />
              <span className={`absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-black border backdrop-blur-md shadow-xs ${STATUS_STYLE[selectedListing.status] || 'bg-slate-100 border-slate-200 text-slate-600'}`}>
                {String(selectedListing.status || 'unknown').toUpperCase()}
              </span>
            </div>

            {/* Core Specs Grid */}
            <div className="grid grid-cols-2 gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-200/70 text-xs">
              <div>
                <span className="text-slate-400 font-bold uppercase text-[10px]">Price</span>
                <p className="font-black text-slate-800 text-sm">{formatPrice(selectedListing)}</p>
              </div>
              <div>
                <span className="text-slate-400 font-bold uppercase text-[10px]">Parcel Size</span>
                <p className="font-black text-slate-800 text-sm">{formatSize(selectedListing)}</p>
              </div>
              <div>
                <span className="text-slate-400 font-bold uppercase text-[10px]">UPI Code</span>
                <p className="font-mono font-bold text-slate-700">{selectedListing.upi || 'Not provided'}</p>
              </div>
              <div>
                <span className="text-slate-400 font-bold uppercase text-[10px]">Location</span>
                <p className="font-semibold text-slate-700">{selectedListing.sector}, {selectedListing.district}</p>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Property Description</h4>
              <p className="text-xs text-slate-700 leading-relaxed bg-white p-3.5 rounded-xl border border-slate-200">
                {selectedListing.description || 'No detailed description provided by the seller.'}
              </p>
            </div>

            {/* Seller Contact Info */}
            <div className="space-y-1.5">
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Seller Information</h4>
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-400">Name:</span>
                  <span className="font-bold text-slate-800">{selectedListing.seller_name || 'Verified Landowner'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Email:</span>
                  <span className="font-medium text-slate-600">{selectedListing.seller_email || '—'}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {selectedListing && drawerMode === 'reject' && (
          <div className="space-y-4">
            <p className="text-xs text-slate-500">
              Please specify the rejection reason. This message will be sent to the seller:
            </p>
            <TextArea
              label="Rejection Reason"
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="e.g. UPI code does not match official land registry or boundary photos are unclear..."
              rows={4}
              required
            />
            {actionError && <p className="text-xs text-rose-600 font-semibold">{actionError}</p>}
          </div>
        )}
      </DrawerBlueprint>

      {/* Delete Confirmation Alert Dialog */}
      <AlertDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        title="Delete Listing?"
        description={`Are you sure you want to permanently delete "${listingToDelete?.title}"? This action cannot be undone.`}
        confirmLabel={isDeleting ? 'Deleting...' : 'Delete Listing'}
        variant="danger"
        onConfirm={handleDelete}
      />
    </div>
  );
};
