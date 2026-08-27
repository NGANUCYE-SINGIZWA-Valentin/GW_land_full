import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { StatCard } from '@/components/dashboard/StatCard';
import { TableBlueprint, ColumnConfig } from '@/components/dashboard/TableBlueprint';
import { DrawerBlueprint } from '@/components/dashboard/DrawerBlueprint';
import { PropertyCard } from '@/components/dashboard/PropertyCard';
import { AlertDialog } from '@/components/ui/AlertDialog';
import { DashboardButton } from '@/components/ui/DashboardButton';
import { Field, Input, TextArea } from '@/components/wizard/FormField';
import {
  Tooltip,
  PropertyStatusBadgeTooltip,
  TruncatedCellTooltip,
} from '@/components/ui/Tooltip';
import {
  Home,
  CheckCircle2,
  Tag,
  Clock,
  DollarSign,
  Maximize2,
  MapPin,
  Eye,
  Edit2,
  Trash2,
  LayoutGrid,
  List,
  Search,
  Plus,
  RefreshCw,
  Sparkles,
  Building2,
  TrendingUp,
} from 'lucide-react';
import { useCurrency } from '@/context/CurrencyContext';
import * as listingsApi from '@/api/listings';
import { ApiError } from '@/api/client';
import type { MyListing, ListingStatus } from '@/api/types';

type KpiFilter = 'all' | 'pending' | 'approved' | 'sold';
type ViewMode = 'grid' | 'table';

const STATUS_LABEL: Record<ListingStatus, string> = {
  pending: 'Pending',
  approved: 'Live',
  rejected: 'Rejected',
  sold: 'Sold',
};

const STATUS_STYLE: Record<ListingStatus, string> = {
  approved: 'bg-emerald-50 border-emerald-100 text-emerald-600',
  pending: 'bg-amber-50 border-amber-100 text-amber-600',
  sold: 'bg-blue-50 border-blue-100 text-blue-600',
  rejected: 'bg-red-50 border-red-100 text-red-600',
};

const STATUS_DOT: Record<ListingStatus, string> = {
  approved: 'bg-emerald-500',
  pending: 'bg-amber-500',
  sold: 'bg-blue-500',
  rejected: 'bg-red-500',
};

const formatSize = (l: MyListing): string => `${Number(l.size_value).toLocaleString()} ${l.size_unit === 'hectare' ? 'ha' : 'sqm'}`;

export const SellerPropertyManagement: React.FC = () => {
  const navigate = useNavigate();
  const { formatCurrency } = useCurrency();

  const [listings, setListings] = useState<MyListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeKpiFilter, setActiveKpiFilter] = useState<KpiFilter>('all');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [searchQuery, setSearchQuery] = useState('');

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedListing, setSelectedListing] = useState<MyListing | null>(null);
  const [editForm, setEditForm] = useState({ title: '', description: '', price_rwf: '', price_usd: '', size_value: '' });
  const [isSaving, setIsSaving] = useState(false);
  const [actionError, setActionError] = useState('');

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [listingToDelete, setListingToDelete] = useState<MyListing | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const loadListings = () => {
    setLoading(true);
    setError('');
    listingsApi
      .getMyListings()
      .then((res) => setListings(res?.listings || []))
      .catch((err) => {
        const msg = err?.message || 'Failed to load your properties.';
        setError(msg);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadListings();
  }, []);

  const kpiCounts = useMemo(() => ({
    all: listings.length,
    pending: listings.filter((l) => l.status === 'pending').length,
    approved: listings.filter((l) => l.status === 'approved').length,
    sold: listings.filter((l) => l.status === 'sold').length,
  }), [listings]);

  const filteredListings = useMemo(() => {
    let result = listings;
    if (activeKpiFilter === 'pending') result = result.filter((l) => l.status === 'pending');
    else if (activeKpiFilter === 'approved') result = result.filter((l) => l.status === 'approved');
    else if (activeKpiFilter === 'sold') result = result.filter((l) => l.status === 'sold');

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter((l) =>
        l.title.toLowerCase().includes(q) ||
        (l.upi && l.upi.toLowerCase().includes(q)) ||
        l.district.toLowerCase().includes(q) ||
        l.sector.toLowerCase().includes(q)
      );
    }
    return result;
  }, [listings, activeKpiFilter, searchQuery]);

  const openEdit = (listing: MyListing) => {
    setSelectedListing(listing);
    setEditForm({
      title: listing.title,
      description: listing.description || '',
      price_rwf: listing.price_rwf ? String(listing.price_rwf) : '',
      price_usd: listing.price_usd ? String(listing.price_usd) : '',
      size_value: String(listing.size_value || ''),
    });
    setActionError('');
    setIsDrawerOpen(true);
  };

  const handleSaveEdit = async () => {
    if (!selectedListing) return;
    setIsSaving(true);
    setActionError('');
    try {
      await listingsApi.updateListing(selectedListing.id, {
        title: editForm.title,
        description: editForm.description,
        price_rwf: editForm.price_rwf ? Number(editForm.price_rwf) : undefined,
        price_usd: editForm.price_usd ? Number(editForm.price_usd) : undefined,
        size_value: editForm.size_value ? Number(editForm.size_value) : undefined,
      });
      setIsDrawerOpen(false);
      loadListings();
    } catch (err) {
      setActionError(err instanceof ApiError ? err.message : 'Failed to save changes.');
    } finally {
      setIsSaving(false);
    }
  };

  const confirmDelete = (listing: MyListing) => {
    setListingToDelete(listing);
    setIsDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!listingToDelete) return;
    setIsDeleting(true);
    try {
      await listingsApi.deleteListing(listingToDelete.id);
      setIsDeleteDialogOpen(false);
      setListingToDelete(null);
      loadListings();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to delete listing.');
    } finally {
      setIsDeleting(false);
    }
  };

  const tableColumns: ColumnConfig<MyListing>[] = [
    {
      header: 'Property Details',
      accessorKey: 'title',
      tooltip: 'Your parcel title, location, and official UPI code. Click title or edit button to update.',
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
              subtext={`${l.sector}, ${l.district} • ${formatSize(l)}`}
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
                  badge="UPI"
                  maxWidthClass="max-w-[120px]"
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
      tooltip: 'Asking price converted to your active viewing currency, alongside surveyed land size.',
      render: (l) => (
        <div className="flex flex-col">
          <span className="font-bold text-slate-800 text-xs">{formatCurrency(l.price_rwf, l.price_usd)}</span>
          <span className="text-[11px] text-slate-400">{formatSize(l)}</span>
        </div>
      ),
    },
    {
      header: 'Engagement',
      accessorKey: 'view_count',
      tooltip: 'Total distinct buyer views and impressions recorded since publication.',
      render: (l) => (
        <Tooltip content={`${l.view_count || 0} prospective buyers visited this property`} position="top" variant="brand">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-700 bg-slate-50 px-2.5 py-1 rounded-full border border-slate-100 cursor-default">
            <Eye size={13} className="text-[#54B5BB]" />
            <span>{l.view_count || 0} views</span>
          </div>
        </Tooltip>
      ),
    },
    {
      header: 'Status',
      accessorKey: 'status',
      tooltip: 'Current approval stage on the marketplace. Hover badge to learn next steps.',
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
      tooltip: 'Modify property details, adjust price, or withdraw listing.',
      render: (l) => (
        <div className="flex items-center justify-end gap-1.5">
          <Tooltip content="Edit pricing and property details" position="top" variant="dark">
            <button
              onClick={() => openEdit(l)}
              className="p-1.5 rounded-lg bg-slate-100 hover:bg-[#1B395F] hover:text-white text-slate-700 transition-colors cursor-pointer"
            >
              <Edit2 size={15} />
            </button>
          </Tooltip>
          <Tooltip content="Delete this listing" position="top" variant="danger">
            <button
              onClick={() => confirmDelete(l)}
              className="p-1.5 rounded-lg bg-white border border-rose-200 text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
            >
              <Trash2 size={15} />
            </button>
          </Tooltip>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6 w-full min-w-0">
      {/* Top Header & Actions Toolbar (Image 2 style) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
            My Land Portfolio
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Manage your property listings, update pricing, track client views, and promote parcels.
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
            variant="teal"
            size="md"
            pill
            onClick={() => navigate('/dashboard/properties/new')}
            icon={<Plus size={16} />}
          >
            + Add New Property
          </DashboardButton>
        </div>
      </div>

      {/* KPI Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <StatCard
          title="All Listings"
          value={String(kpiCounts.all)}
          icon={<Building2 size={18} />}
          accentGradient="teal"
          isActive={activeKpiFilter === 'all'}
          onClick={() => setActiveKpiFilter('all')}
          comparisonLabel="in your account"
        />
        <StatCard
          title="Published & Live"
          value={String(kpiCounts.approved)}
          icon={<CheckCircle2 size={18} />}
          accentGradient="emerald"
          isActive={activeKpiFilter === 'approved'}
          onClick={() => setActiveKpiFilter('approved')}
          comparisonLabel="visible to buyers"
        />
        <StatCard
          title="Under Review"
          value={String(kpiCounts.pending)}
          icon={<Clock size={18} />}
          accentGradient="amber"
          isActive={activeKpiFilter === 'pending'}
          onClick={() => setActiveKpiFilter('pending')}
          comparisonLabel="admin verification"
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

      {/* Search & View Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-[0_2px_12px_-3px_rgba(0,0,0,0.04)] flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-80">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search your listings by title, UPI, sector..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#54B5BB] transition-all"
          />
        </div>

        <div className="flex items-center justify-between md:justify-end w-full md:w-auto gap-3">
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-bold">
            {(['all', 'approved', 'pending', 'sold'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveKpiFilter(tab)}
                className={`px-3 py-1.5 rounded-lg capitalize transition-all cursor-pointer ${
                  activeKpiFilter === tab
                    ? 'bg-[#1B395F] text-white shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {tab === 'approved' ? 'Live' : tab}
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

      {/* Listings Display Grid or Table */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-80 bg-slate-100 rounded-2xl" />
          ))}
        </div>
      ) : filteredListings.length === 0 ? (
        <div className="bg-white p-12 rounded-2xl border border-dashed border-slate-200 text-center space-y-4">
          <Building2 size={40} className="mx-auto text-slate-300" />
          <h3 className="text-base font-extrabold text-slate-700">No properties in this view</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            {searchQuery ? `No properties matching "${searchQuery}"` : 'Create your first land parcel listing to start receiving buyer leads.'}
          </p>
          <DashboardButton
            variant="teal"
            size="md"
            pill
            onClick={() => navigate('/dashboard/properties/new')}
            icon={<Plus size={16} />}
          >
            + Create New Listing
          </DashboardButton>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full min-w-0">
          {filteredListings.map((property) => (
            <PropertyCard
              key={property.id}
              property={property}
              isAdminView={false}
              onView={() => openEdit(property)}
              onEdit={() => openEdit(property)}
              onDelete={() => confirmDelete(property)}
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

      {/* Edit Property Drawer */}
      <DrawerBlueprint
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        title="Edit Listing Details"
        subtitle={selectedListing?.title}
        footer={
          <div className="flex gap-3 w-full">
            <DashboardButton variant="outline" fullWidth onClick={() => setIsDrawerOpen(false)}>
              Cancel
            </DashboardButton>
            <DashboardButton
              variant="teal"
              fullWidth
              onClick={handleSaveEdit}
              disabled={isSaving}
            >
              {isSaving ? 'Saving Changes...' : 'Save Changes'}
            </DashboardButton>
          </div>
        }
      >
        <div className="space-y-4">
          <Field label="Property Title" required>
            <Input
              value={editForm.title}
              onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
              placeholder="e.g. Prime Commercial Land in Kinyinya"
            />
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Price in RWF">
              <Input
                type="number"
                value={editForm.price_rwf}
                onChange={(e) => setEditForm({ ...editForm, price_rwf: e.target.value })}
                placeholder="e.g. 45000000"
              />
            </Field>

            <Field label="Price in USD">
              <Input
                type="number"
                value={editForm.price_usd}
                onChange={(e) => setEditForm({ ...editForm, price_usd: e.target.value })}
                placeholder="e.g. 35000"
              />
            </Field>
          </div>

          <Field label="Parcel Size (sqm / ha)">
            <Input
              type="number"
              value={editForm.size_value}
              onChange={(e) => setEditForm({ ...editForm, size_value: e.target.value })}
              placeholder="e.g. 600"
            />
          </Field>

          <Field label="Description">
            <TextArea
              value={editForm.description}
              onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
              rows={4}
              placeholder="Provide key details about road access, zoning, topography..."
            />
          </Field>

          {actionError && <p className="text-xs text-rose-600 font-semibold">{actionError}</p>}
        </div>
      </DrawerBlueprint>

      {/* Delete Confirmation Alert Dialog */}
      <AlertDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        title="Delete Property Listing?"
        description={`Are you sure you want to delete "${listingToDelete?.title}"? All associated inquiries and view metrics will be removed.`}
        confirmLabel={isDeleting ? 'Deleting...' : 'Delete Listing'}
        variant="danger"
        onConfirm={handleDelete}
      />
    </div>
  );
};
