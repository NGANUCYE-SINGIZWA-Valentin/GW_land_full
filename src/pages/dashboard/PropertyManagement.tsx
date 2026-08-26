import React, { useEffect, useMemo, useState } from 'react';
import { StatCard } from '@/components/dashboard/StatCard';
import { TableBlueprint, ColumnConfig } from '@/components/dashboard/TableBlueprint';
import { DrawerBlueprint } from '@/components/dashboard/DrawerBlueprint';
import { ActionDropdown } from '@/components/dashboard/ActionDropdown';
import { AlertDialog } from '@/components/ui/AlertDialog';
import { DashboardButton } from '@/components/ui/DashboardButton';
import { TextArea } from '@/components/wizard/FormField';
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
} from 'lucide-react';
import { useAuth } from '@/components/auth/AuthContext';
import * as adminApi from '@/api/admin';
import { ApiError } from '@/api/client';
import type { AdminListing, ListingStatus } from '@/api/types';

type KpiFilter = 'all' | 'pending' | 'approved' | 'featured' | 'sold';

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
    const { user } = useAuth();
    const isAdmin = user?.role === 'Administrator';

    const [listings, setListings] = useState<AdminListing[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [activeKpiFilter, setActiveKpiFilter] = useState<KpiFilter>('all');

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
            .then((res) => setListings(res.listings))
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
        switch (activeKpiFilter) {
            case 'pending': return listings.filter((l) => l.status === 'pending');
            case 'approved': return listings.filter((l) => l.status === 'approved');
            case 'featured': return listings.filter((l) => l.is_featured);
            case 'sold': return listings.filter((l) => l.status === 'sold');
            default: return listings;
        }
    }, [listings, activeKpiFilter]);

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

    const askDelete = (listing: AdminListing) => {
        setListingToDelete(listing);
        setIsDeleteDialogOpen(true);
    };

    const confirmDelete = async () => {
        if (!listingToDelete) return;
        setIsDeleting(true);
        try {
            await adminApi.deleteAnyListing(listingToDelete.id);
            setIsDeleteDialogOpen(false);
            setListingToDelete(null);
            setIsDrawerOpen(false);
            loadListings();
        } catch {
            setError('Failed to delete listing.');
        } finally {
            setIsDeleting(false);
        }
    };

    const columns: ColumnConfig<AdminListing>[] = [
        {
            header: 'Title',
            render: (l) => (
                <div className="flex items-center gap-4">
                    <img src={l.cover_image || '/assets/images/gw-homes-og.png'} alt="" className="w-14 h-10 object-cover rounded-lg bg-slate-100 border border-slate-200 flex-shrink-0" />
                    <div className="flex flex-col min-w-0">
                        <span className="text-base font-medium tracking-tight text-slate-700 truncate max-w-[180px]">{l.title}</span>
                        <span className="text-xs text-slate-400 font-normal truncate">{l.seller_name}</span>
                    </div>
                </div>
            ),
        },
        { header: 'Location', render: (l) => `${l.sector}, ${l.district}`, cellClassName: 'text-slate-700 text-base font-medium tracking-tight antialiased' },
        { header: 'Price', render: formatPrice, cellClassName: 'text-slate-700 text-base font-medium tracking-tight antialiased' },
        { header: 'Size', render: formatSize, cellClassName: 'text-slate-700 text-base font-medium tracking-tight antialiased' },
        { header: 'Views', accessorKey: 'view_count', cellClassName: 'text-slate-700 text-base font-medium tracking-tight antialiased' },
        {
            header: 'Status',
            render: (l) => (
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium tracking-tight antialiased border ${STATUS_STYLE[l.status]}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${STATUS_DOT[l.status]}`} />
                    {l.status}{l.is_featured ? ' ★' : ''}
                </span>
            ),
        },
        {
            header: 'Action',
            headerClassName: 'text-right',
            cellClassName: 'text-right',
            render: (l) => (
                <ActionDropdown
                    canReview={true}
                    canApprove={l.status === 'pending'}
                    canReject={l.status === 'pending'}
                    canPromote={isAdmin && l.status === 'approved' && !l.is_featured}
                    canUnpublish={isAdmin && l.status === 'approved' && l.is_featured}
                    canDelete={true}
                    onReview={() => openReview(l)}
                    onApprove={() => handleApprove(l)}
                    onReject={() => openReject(l)}
                    onPromote={() => handleToggleFeatured(l)}
                    onUnpublish={() => handleToggleFeatured(l)}
                    onDelete={() => askDelete(l)}
                />
            ),
        },
    ];

    const kpiCards: { filter: KpiFilter; title: string; icon: React.ReactNode; countKey: keyof typeof kpiCounts }[] = [
        { filter: 'all', title: 'All Properties', icon: <Home size={20} />, countKey: 'all' },
        { filter: 'pending', title: 'Pending Review', icon: <Clock size={20} />, countKey: 'pending' },
        { filter: 'approved', title: 'Live', icon: <CheckCircle2 size={20} />, countKey: 'approved' },
        { filter: 'featured', title: 'Featured', icon: <Star size={20} />, countKey: 'featured' },
    ];

    return (
        <div className="w-full min-w-0 space-y-8 font-sans antialiased">

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {kpiCards.map((kpi) => (
                    <StatCard
                        key={kpi.filter}
                        title={kpi.title}
                        value={String(kpiCounts[kpi.countKey])}
                        icon={kpi.icon}
                        showSubtext={false}
                        isActive={activeKpiFilter === kpi.filter}
                        onClick={() => setActiveKpiFilter(kpi.filter)}
                    />
                ))}
            </div>

            <div>
                <div className="px-1 mb-4">
                    <h3 className="text-sm font-semibold text-slate-700 tracking-tight">Seller Listings</h3>
                    <p className="text-xs text-slate-400 mt-0.5">Oversee and moderate all properties submitted by sellers.</p>
                </div>
                {error && <p className="mb-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>}
                <TableBlueprint
                    data={filteredListings}
                    columns={columns}
                    isLoading={loading}
                    emptyMessage={loading ? 'Loading…' : 'No listings matched your criteria.'}
                    searchPlaceholder="Search properties or sellers..."
                    searchKeys={['title', 'district', 'sector', 'seller_name', 'seller_email']}
                    filterConfig={[
                        {
                            accessorKey: 'status',
                            label: 'Status',
                            options: [
                                { label: 'Pending', value: 'pending' },
                                { label: 'Approved', value: 'approved' },
                                { label: 'Rejected', value: 'rejected' },
                                { label: 'Sold', value: 'sold' },
                            ],
                        },
                    ]}
                    totalItems={filteredListings.length}
                    hasPrevPage={false}
                    hasNextPage={false}
                />
            </div>

            <AlertDialog
                isOpen={isDeleteDialogOpen}
                onClose={() => { setIsDeleteDialogOpen(false); setListingToDelete(null); }}
                onConfirm={confirmDelete}
                title="Delete Property"
                description={`Are you sure you want to delete "${listingToDelete?.title}"? This action cannot be undone.`}
                confirmLabel="Delete"
                cancelLabel="Cancel"
                variant="danger"
                isLoading={isDeleting}
            />

            {selectedListing && (
                <DrawerBlueprint
                    isOpen={isDrawerOpen}
                    onClose={() => setIsDrawerOpen(false)}
                    title={drawerMode === 'reject' ? 'Reject Property' : 'Review Property'}
                    footer={
                        drawerMode === 'reject' ? (
                            <>
                                <DashboardButton variant="outline" onClick={() => setIsDrawerOpen(false)}>Cancel</DashboardButton>
                                <DashboardButton variant="danger" onClick={handleReject} disabled={actionLoading || !rejectReason.trim()}>
                                    {actionLoading ? 'Rejecting…' : 'Reject Listing'}
                                </DashboardButton>
                            </>
                        ) : (
                            <>
                                <DashboardButton variant="danger-outline" onClick={() => askDelete(selectedListing)}>Delete</DashboardButton>
                                {selectedListing.status === 'pending' && (
                                    <>
                                        <DashboardButton variant="outline" onClick={() => openReject(selectedListing)}>Reject</DashboardButton>
                                        <DashboardButton variant="primary" onClick={() => handleApprove(selectedListing)} disabled={actionLoading}>
                                            {actionLoading ? 'Approving…' : 'Approve'}
                                        </DashboardButton>
                                    </>
                                )}
                                {isAdmin && selectedListing.status === 'approved' && (
                                    <DashboardButton variant="outline" onClick={() => handleToggleFeatured(selectedListing)}>
                                        {selectedListing.is_featured ? 'Remove Featured' : 'Promote to Featured'}
                                    </DashboardButton>
                                )}
                            </>
                        )
                    }
                >
                    {actionError && <p className="mb-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{actionError}</p>}
                    {drawerMode === 'reject' ? (
                        <div className="space-y-3">
                            <p className="text-sm text-slate-500">Explain why "{selectedListing.title}" is being rejected. The seller will see this reason.</p>
                            <TextArea rows={4} value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} placeholder="e.g. Photos unclear, price missing, suspected duplicate..." />
                        </div>
                    ) : (
                        <>
                            <div>
                                <div className="flex items-center gap-2 mb-3">
                                    <span className="text-xs font-medium uppercase tracking-wider text-slate-400">Property Details</span>
                                    <div className="flex-1 h-px bg-slate-100" />
                                </div>
                                <div className="space-y-4">
                                    <div>
                                        <label className="text-sm font-semibold text-slate-700 block mb-1.5">Title</label>
                                        <div className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-base font-medium text-slate-700 flex items-center gap-2.5">
                                            <Building2 size={18} className="text-slate-400 flex-shrink-0" />
                                            <span className="truncate">{selectedListing.title}</span>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-sm font-semibold text-slate-700 block mb-1.5">Seller</label>
                                        <div className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-base font-medium text-slate-700 flex items-center gap-2.5">
                                            <User size={18} className="text-slate-400 flex-shrink-0" />
                                            <span className="truncate">{selectedListing.seller_name} ({selectedListing.seller_email})</span>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-sm font-semibold text-slate-700 block mb-1.5">Price</label>
                                        <div className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-base font-medium text-slate-700 flex items-center gap-2.5">
                                            <DollarSign size={18} className="text-slate-400 flex-shrink-0" />
                                            <span>{formatPrice(selectedListing)}</span>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-sm font-semibold text-slate-700 block mb-1.5">Size</label>
                                        <div className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-base font-medium text-slate-700 flex items-center gap-2.5">
                                            <Maximize2 size={18} className="text-slate-400 flex-shrink-0" />
                                            <span>{formatSize(selectedListing)}</span>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-sm font-semibold text-slate-700 block mb-1.5">Location</label>
                                        <div className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-base font-medium text-slate-700 flex items-center gap-2.5">
                                            <MapPin size={18} className="text-slate-400 flex-shrink-0" />
                                            <span>{selectedListing.sector}, {selectedListing.district}</span>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-sm font-semibold text-slate-700 block mb-1.5">Description</label>
                                        <div className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-600">
                                            {selectedListing.description}
                                        </div>
                                    </div>
                                    {selectedListing.status === 'rejected' && selectedListing.rejection_reason && (
                                        <div>
                                            <label className="text-sm font-semibold text-slate-700 block mb-1.5">Rejection reason</label>
                                            <div className="w-full px-3.5 py-2.5 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
                                                {selectedListing.rejection_reason}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </>
                    )}
                </DrawerBlueprint>
            )}
        </div>
    );
};
