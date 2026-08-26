import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { StatCard } from '@/components/dashboard/StatCard';
import { TableBlueprint, ColumnConfig } from '@/components/dashboard/TableBlueprint';
import { DrawerBlueprint } from '@/components/dashboard/DrawerBlueprint';
import { ActionDropdown } from '@/components/dashboard/ActionDropdown';
import { AlertDialog } from '@/components/ui/AlertDialog';
import { DashboardButton } from '@/components/ui/DashboardButton';
import { Field, Input, TextArea } from '@/components/wizard/FormField';
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
} from 'lucide-react';
import { useCurrency } from '@/context/CurrencyContext';
import * as listingsApi from '@/api/listings';
import { ApiError } from '@/api/client';
import type { MyListing, ListingStatus } from '@/api/types';

type KpiFilter = 'all' | 'pending' | 'approved' | 'sold';

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

    const loadListings = () => {
        setLoading(true);
        setError('');
        listingsApi
            .getMyListings()
            .then((res) => setListings(res.listings))
            .catch((err) => {
                const msg = err?.message || 'Failed to load your properties.';
                setError(msg);
            })
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        loadListings();
    }, []);

    const [activeKpiFilter, setActiveKpiFilter] = useState<KpiFilter>('all');

    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [selectedListing, setSelectedListing] = useState<MyListing | null>(null);
    const [editMode, setEditMode] = useState(false);
    const [editForm, setEditForm] = useState({ title: '', description: '', price_rwf: '', price_usd: '', size_value: '' });
    const [isSaving, setIsSaving] = useState(false);
    const [actionError, setActionError] = useState('');

    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [listingToDelete, setListingToDelete] = useState<MyListing | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const kpiCounts = useMemo(() => ({
        all: listings.length,
        pending: listings.filter((l) => l.status === 'pending').length,
        approved: listings.filter((l) => l.status === 'approved').length,
        sold: listings.filter((l) => l.status === 'sold').length,
    }), [listings]);

    const filteredListings = useMemo(() => {
        switch (activeKpiFilter) {
            case 'pending': return listings.filter((l) => l.status === 'pending');
            case 'approved': return listings.filter((l) => l.status === 'approved');
            case 'sold': return listings.filter((l) => l.status === 'sold');
            default: return listings;
        }
    }, [listings, activeKpiFilter]);

    const openEdit = (listing: MyListing) => {
        setSelectedListing(listing);
        setEditForm({
            title: listing.title,
            description: listing.description,
            price_rwf: listing.price_rwf ? String(listing.price_rwf) : '',
            price_usd: listing.price_usd ? String(listing.price_usd) : '',
            size_value: String(listing.size_value),
        });
        setEditMode(true);
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

    const handleMarkSold = async (listing: MyListing) => {
        try {
            await listingsApi.markListingSold(listing.id);
            setIsDrawerOpen(false);
            loadListings();
        } catch (err) {
            setActionError(err instanceof ApiError ? err.message : 'Failed to mark as sold.');
        }
    };

    const askDelete = (listing: MyListing) => {
        setListingToDelete(listing);
        setIsDeleteDialogOpen(true);
    };

    const confirmDelete = async () => {
        if (!listingToDelete) return;
        setIsDeleting(true);
        try {
            await listingsApi.deleteListing(listingToDelete.id);
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

    const columns: ColumnConfig<MyListing>[] = useMemo(() => [
        {
            header: 'Title',
            render: (listing) => (
                <div className="flex items-center gap-4">
                    <img
                        src={listing.cover_image || '/assets/images/gw-homes-og.png'}
                        alt=""
                        className="w-14 h-10 object-cover rounded-lg bg-slate-100 border border-slate-200 flex-shrink-0"
                    />
                    <div className="flex flex-col min-w-0">
                        <span className="text-base font-medium tracking-tight text-slate-700 truncate max-w-[180px]">
                            {listing.title}
                        </span>
                        <span className="text-xs text-slate-400 font-normal">{listing.slug}</span>
                    </div>
                </div>
            ),
        },
        { header: 'Location', render: (l) => `${l.sector}, ${l.district}`, cellClassName: 'text-slate-700 text-base font-medium tracking-tight antialiased' },
        { 
            header: 'Price', 
            render: (l) => l.price_rwf ? formatCurrency(l.price_rwf) : 'Price on request', 
            cellClassName: 'text-slate-700 text-base font-medium tracking-tight antialiased' 
        },
        { header: 'Size', render: formatSize, cellClassName: 'text-slate-700 text-base font-medium tracking-tight antialiased' },
        { header: 'Views', accessorKey: 'view_count', cellClassName: 'text-slate-700 text-base font-medium tracking-tight antialiased' },
        {
            header: 'Status',
            render: (listing) => (
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium tracking-tight antialiased border ${STATUS_STYLE[listing.status]}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${STATUS_DOT[listing.status]}`} />
                    {STATUS_LABEL[listing.status]}{listing.is_featured ? ' ★' : ''}
                </span>
            ),
        },
        {
            header: 'Action',
            headerClassName: 'text-right',
            cellClassName: 'text-right',
            render: (listing) => (
                <ActionDropdown
                    canReview={true}
                    canMarkSold={listing.status === 'approved'}
                    canDelete={listing.status !== 'sold'}
                    onReview={() => openEdit(listing)}
                    onMarkSold={() => handleMarkSold(listing)}
                    onDelete={() => askDelete(listing)}
                />
            ),
        },
    ], [navigate, formatCurrency]);

    const kpiCards: { filter: KpiFilter; title: string; icon: React.ReactNode; countKey: keyof typeof kpiCounts }[] = [
        { filter: 'all', title: 'All Properties', icon: <Home size={20} />, countKey: 'all' },
        { filter: 'pending', title: 'Pending Review', icon: <Clock size={20} />, countKey: 'pending' },
        { filter: 'approved', title: 'Live', icon: <CheckCircle2 size={20} />, countKey: 'approved' },
        { filter: 'sold', title: 'Sold', icon: <Tag size={20} />, countKey: 'sold' },
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
                    <h3 className="text-sm font-semibold text-slate-700 tracking-tight">My Properties</h3>
                    <p className="text-xs text-slate-400 mt-0.5">View and manage all your listed properties.</p>
                </div>
                {error && (
                    <div className="mb-4 flex items-center justify-between gap-3 text-sm text-red-700 bg-red-50 border border-red-200 rounded-2xl px-4 py-3">
                        <span>⚠️ {error}</span>
                        <button
                            onClick={loadListings}
                            className="text-xs font-bold underline text-red-600 hover:text-red-800 whitespace-nowrap"
                        >
                            Retry
                        </button>
                    </div>
                )}
                <div className="flex flex-col">
                    <div className="flex justify-end px-1 mb-4">
                        <DashboardButton
                            variant="primary"
                            fullWidth={false}
                            onClick={() => navigate('/dashboard/properties/new')}
                        >
                            Add Property
                        </DashboardButton>
                    </div>
                    <TableBlueprint
                        data={filteredListings}
                        columns={columns}
                        isLoading={loading}
                        emptyMessage={loading ? 'Loading…' : 'No properties matched your criteria.'}
                        searchPlaceholder="Search properties..."
                        searchKeys={['title', 'district', 'sector']}
                        filterConfig={[
                            {
                                accessorKey: 'status',
                                label: 'Status',
                                options: [
                                    { label: 'Pending', value: 'pending' },
                                    { label: 'Live', value: 'approved' },
                                    { label: 'Sold', value: 'sold' },
                                    { label: 'Rejected', value: 'rejected' },
                                ],
                            },
                        ]}
                        totalItems={filteredListings.length}
                        hasPrevPage={false}
                        hasNextPage={false}
                    />
                </div>
            </div>

            <AlertDialog
                isOpen={isDeleteDialogOpen}
                onClose={() => {
                    setIsDeleteDialogOpen(false);
                    setListingToDelete(null);
                }}
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
                    title={editMode ? 'Edit Property' : 'Property Details'}
                    footer={
                        editMode ? (
                            <>
                                <DashboardButton variant="outline" onClick={() => setIsDrawerOpen(false)}>Cancel</DashboardButton>
                                <DashboardButton variant="primary" onClick={handleSaveEdit} disabled={isSaving}>
                                    {isSaving ? 'Saving…' : 'Save Changes'}
                                </DashboardButton>
                            </>
                        ) : (
                            <>
                                {selectedListing.status === 'approved' && (
                                    <DashboardButton variant="outline" onClick={() => handleMarkSold(selectedListing)}>
                                        Mark Sold
                                    </DashboardButton>
                                )}
                                <DashboardButton variant="danger-outline" onClick={() => askDelete(selectedListing)}>
                                    Delete
                                </DashboardButton>
                            </>
                        )
                    }
                >
                    {actionError && <p className="mb-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{actionError}</p>}
                    {editMode ? (
                        <div className="space-y-4">
                            <Field label="Title" required>
                                <Input value={editForm.title} onChange={(e) => setEditForm((f) => ({ ...f, title: e.target.value }))} />
                            </Field>
                            <Field label="Description" required>
                                <TextArea rows={4} value={editForm.description} onChange={(e) => setEditForm((f) => ({ ...f, description: e.target.value }))} />
                            </Field>
                            <div className="grid grid-cols-2 gap-4">
                                <Field label="Price RWF">
                                    <Input type="number" value={editForm.price_rwf} onChange={(e) => setEditForm((f) => ({ ...f, price_rwf: e.target.value }))} />
                                </Field>
                                <Field label="Price USD">
                                    <Input type="number" value={editForm.price_usd} onChange={(e) => setEditForm((f) => ({ ...f, price_usd: e.target.value }))} />
                                </Field>
                            </div>
                            <Field label={`Size (${selectedListing.size_unit})`}>
                                <Input type="number" value={editForm.size_value} onChange={(e) => setEditForm((f) => ({ ...f, size_value: e.target.value }))} />
                            </Field>
                            {selectedListing.status === 'approved' && (
                                <p className="text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                                    Editing a live listing sends it back to admin for re-approval.
                                </p>
                            )}
                        </div>
                    ) : (
                        <div className="space-y-6">
                            <div>
                                <label className="text-sm font-semibold text-slate-700 block mb-1.5">Title</label>
                                <div className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-base font-medium text-slate-700 flex items-center gap-2.5">
                                    <Home size={18} className="text-slate-400 flex-shrink-0" />
                                    <span className="truncate">{selectedListing.title}</span>
                                </div>
                            </div>
                            <div>
                                <label className="text-sm font-semibold text-slate-700 block mb-1.5">Price</label>
                                <div className="px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-600 flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-slate-300" />
                                    <span>{selectedListing.price_rwf ? formatCurrency(selectedListing.price_rwf) : 'Price on request'}</span>
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
                            {selectedListing.status === 'rejected' && selectedListing.rejection_reason && (
                                <div>
                                    <label className="text-sm font-semibold text-slate-700 block mb-1.5">Rejection reason</label>
                                    <div className="w-full px-3.5 py-2.5 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
                                        {selectedListing.rejection_reason}
                                    </div>
                                </div>
                            )}
                            <DashboardButton variant="outline" onClick={() => openEdit(selectedListing)}>
                                Edit Listing
                            </DashboardButton>
                        </div>
                    )}
                </DrawerBlueprint>
            )}
        </div>
    );
};
