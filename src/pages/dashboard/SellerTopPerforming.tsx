import React, { useEffect, useMemo, useState } from 'react';
import { StatCard } from '@/components/dashboard/StatCard';
import { TableBlueprint, ColumnConfig } from '@/components/dashboard/TableBlueprint';
import { DrawerBlueprint } from '@/components/dashboard/DrawerBlueprint';
import { DashboardButton } from '@/components/ui/DashboardButton';
import {
    Trophy,
    Eye,
    MapPin,
    Building2,
    Maximize2,
} from 'lucide-react';
import { useCurrency } from '@/context/CurrencyContext';
import * as listingsApi from '@/api/listings';
import type { MyListing } from '@/api/types';

const sizeLabel = (l: MyListing) => `${Number(l.size_value).toLocaleString()} ${l.size_unit === 'hectare' ? 'ha' : 'sqm'}`;

interface RankedListing extends MyListing {
    rank: number;
}

export const SellerTopPerforming: React.FC = () => {
    const { formatCurrency } = useCurrency();
    const [listings, setListings] = useState<MyListing[]>([]);
    const [loading, setLoading] = useState(true);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [selected, setSelected] = useState<RankedListing | null>(null);

    useEffect(() => {
        listingsApi
            .getMyListings()
            .then((res) => setListings(res?.listings || []))
            .catch(() => setListings([]))
            .finally(() => setLoading(false));
    }, []);

    const ranked: RankedListing[] = useMemo(
        () => [...(listings || [])]
            .sort((a, b) => (b.view_count || 0) - (a.view_count || 0))
            .map((l, i) => ({ ...l, rank: i + 1 })),
        [listings]
    );

    const totalViews = (listings || []).reduce((sum, l) => sum + (l.view_count || 0), 0);
    const approvedCount = (listings || []).filter((l) => l.status === 'approved').length;

    const openDrawer = (listing: RankedListing) => {
        setSelected(listing);
        setIsDrawerOpen(true);
    };

    const columns: ColumnConfig<RankedListing>[] = useMemo(() => [
        {
            header: 'Rank',
            render: (l) => (
                <div className="flex items-center justify-center w-8 h-8">
                    <span className={`text-sm font-bold ${l.rank === 1 ? 'text-yellow-500' : l.rank === 2 ? 'text-gray-400' : l.rank === 3 ? 'text-amber-600' : 'text-slate-600'}`}>
                        #{l.rank}
                    </span>
                </div>
            ),
        },
        {
            header: 'Property',
            render: (l) => (
                <div className="flex items-center gap-3">
                    <img
                        src={l.cover_image || '/assets/images/gw-homes-og.png'}
                        alt=""
                        className="w-12 h-9 object-cover rounded-lg bg-slate-100 border border-slate-200 flex-shrink-0"
                    />
                    <div className="flex flex-col min-w-0">
                        <span className="text-base font-medium tracking-tight text-slate-700 truncate">{l.title}</span>
                        <span className="text-xs text-slate-400 font-normal flex items-center gap-1">
                            <MapPin size={10} />{l.sector}, {l.district}
                        </span>
                    </div>
                </div>
            ),
        },
        { header: 'Location', render: (l) => `${l.sector}, ${l.district}`, cellClassName: 'text-slate-700 text-base font-medium tracking-tight antialiased' },
        { 
            header: 'Price', 
            render: (l) => l.price_rwf ? formatCurrency(l.price_rwf) : 'Price on request', 
            cellClassName: 'text-slate-700 text-base font-semibold tracking-tight antialiased' 
        },
        { header: 'Views', render: (l) => <span className="flex items-center gap-1.5"><Eye size={14} className="text-slate-400" />{l.view_count.toLocaleString()}</span>, cellClassName: 'text-slate-700 text-base font-medium tracking-tight antialiased' },
        {
            header: 'Action',
            cellClassName: 'text-right',
            render: (l) => (
                <DashboardButton variant="outline" fullWidth={false} onClick={() => openDrawer(l)}>
                    View Details
                </DashboardButton>
            ),
        },
    ], [formatCurrency]);

    return (
        <div className="space-y-8 font-sans antialiased w-full min-w-0">

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                <StatCard title="Total Properties" value={String(listings.length)} icon={<Building2 size={20} />} showSubtext={false} />
                <StatCard title="Live Listings" value={String(approvedCount)} icon={<Trophy size={20} />} showSubtext={false} />
                <StatCard title="Total Views" value={totalViews.toLocaleString()} icon={<Eye size={20} />} showSubtext={false} />
            </div>

            <div>
                <div className="px-1 mb-4">
                    <h3 className="text-sm font-semibold text-slate-700 tracking-tight">Top Performing Properties</h3>
                    <p className="text-xs text-slate-400 mt-0.5">Ranked by number of views.</p>
                </div>
                <TableBlueprint
                    data={ranked}
                    columns={columns}
                    isLoading={loading}
                    emptyMessage={loading ? 'Loading…' : 'No properties found.'}
                    searchPlaceholder="Search by title or location..."
                    searchKeys={['title', 'district', 'sector']}
                    totalItems={ranked.length}
                    hasPrevPage={false}
                    hasNextPage={false}
                />
            </div>

            {selected && (
                <DrawerBlueprint
                    isOpen={isDrawerOpen}
                    onClose={() => setIsDrawerOpen(false)}
                    title="Property Performance Details"
                    footer={
                        <DashboardButton variant="outline" onClick={() => setIsDrawerOpen(false)}>
                            Close
                        </DashboardButton>
                    }
                >
                    <>
                        <div>
                            <div className="flex items-center gap-2 mb-3">
                                <span className="text-xs font-medium uppercase tracking-wider text-slate-400">Property Information</span>
                                <div className="flex-1 h-px bg-slate-100" />
                            </div>

                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-semibold text-slate-700">Title</span>
                                    <span className="text-sm font-medium text-slate-500">{selected.title}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-semibold text-slate-700">Location</span>
                                    <span className="text-sm font-medium text-slate-500 flex items-center gap-1.5">
                                        <MapPin size={14} className="text-slate-400" />
                                        {selected.sector}, {selected.district}
                                    </span>
                                </div>
                                <div className="p-4 rounded-xl border border-slate-100 bg-white shadow-sm flex items-center justify-between">
                                    <span className="text-sm font-semibold text-slate-700">Price</span>
                                    <span className="text-sm font-medium text-slate-500">{selected.price_rwf ? formatCurrency(selected.price_rwf) : 'Price on request'}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-semibold text-slate-700">Status</span>
                                    <span className="text-sm font-medium text-slate-500 capitalize">{selected.status}</span>
                                </div>
                            </div>
                        </div>

                        <div>
                            <div className="flex items-center gap-2 mb-3">
                                <span className="text-xs font-medium uppercase tracking-wider text-slate-400">Performance</span>
                                <div className="flex-1 h-px bg-slate-100" />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                                    <span className="text-xs text-slate-400 font-medium">Total Views</span>
                                    <p className="text-lg font-semibold text-slate-700 mt-1 flex items-center gap-1.5">
                                        <Eye size={16} className="text-slate-400" />
                                        {selected.view_count.toLocaleString()}
                                    </p>
                                </div>
                                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                                    <span className="text-xs text-slate-400 font-medium">Size</span>
                                    <p className="text-lg font-semibold text-slate-700 mt-1 flex items-center gap-1.5">
                                        <Maximize2 size={16} className="text-slate-400" />
                                        {sizeLabel(selected)}
                                    </p>
                                </div>
                                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl col-span-2">
                                    <span className="text-xs text-slate-400 font-medium">Rank among your listings</span>
                                    <p className="text-lg font-semibold text-slate-700 mt-1 flex items-center gap-1.5">
                                        <Trophy size={16} className="text-amber-500" />
                                        #{selected.rank}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </>
                </DrawerBlueprint>
            )}
        </div>
    );
};
