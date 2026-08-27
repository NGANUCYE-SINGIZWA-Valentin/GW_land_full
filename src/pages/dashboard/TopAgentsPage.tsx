import React, { useEffect, useMemo, useState } from 'react';
import { StatCard } from '@/components/dashboard/StatCard';
import { TableBlueprint, ColumnConfig } from '@/components/dashboard/TableBlueprint';
import { DrawerBlueprint } from '@/components/dashboard/DrawerBlueprint';
import { DashboardButton } from '@/components/ui/DashboardButton';
import { Avatar } from '@/components/ui/Avatar';
import {
    Trophy,
    Users,
    Award,
    Mail,
    Eye,
    Home,
    ShieldCheck,
} from 'lucide-react';
import * as adminApi from '@/api/admin';
import type { TopSeller } from '@/api/admin';

interface RankedSeller extends TopSeller {
    rank: number;
}

export const TopAgentsPage: React.FC = () => {
    const [sellers, setSellers] = useState<TopSeller[]>([]);
    const [loading, setLoading] = useState(true);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [selectedSeller, setSelectedSeller] = useState<RankedSeller | null>(null);

    useEffect(() => {
        adminApi.getTopSellers()
            .then((res) => setSellers(res?.sellers || []))
            .catch(() => setSellers([]))
            .finally(() => setLoading(false));
    }, []);

    const ranked: RankedSeller[] = useMemo(
        () => (sellers || []).map((s, i) => ({ ...s, rank: i + 1 })),
        [sellers]
    );

    const kpiCounts = useMemo(() => ({
        total: ranked.length,
        verified: ranked.filter((s) => s.is_verified).length,
        totalListings: ranked.reduce((sum, s) => sum + Number(s.listing_count), 0),
        totalViews: ranked.reduce((sum, s) => sum + Number(s.total_views), 0),
    }), [ranked]);

    const openDrawer = (seller: RankedSeller) => {
        setSelectedSeller(seller);
        setIsDrawerOpen(true);
    };

    const columns: ColumnConfig<RankedSeller>[] = [
        {
            header: 'Rank',
            render: (s) => (
                <div className="flex items-center justify-center w-8 h-8">
                    <span className={`text-sm font-bold ${s.rank === 1 ? 'text-yellow-500' : s.rank === 2 ? 'text-gray-400' : s.rank === 3 ? 'text-amber-600' : 'text-slate-600'}`}>
                        #{s.rank}
                    </span>
                </div>
            ),
        },
        {
            header: 'Seller',
            render: (s) => (
                <div className="flex items-center gap-3">
                    <Avatar src={s.photo_url} name={s.full_name} size="md" />
                    <div className="flex flex-col min-w-0">
                        <span className="text-base font-medium tracking-tight text-slate-700 truncate flex items-center gap-1">
                            {s.full_name}
                            {s.is_verified && <ShieldCheck size={13} className="text-emerald-500" />}
                        </span>
                        <span className="text-xs text-slate-400 font-normal truncate">{s.email}</span>
                    </div>
                </div>
            ),
        },
        { header: 'Live Listings', accessorKey: 'listing_count', cellClassName: 'text-slate-700 text-base font-medium tracking-tight antialiased' },
        { header: 'Total Views', accessorKey: 'total_views', cellClassName: 'text-slate-700 text-base font-medium tracking-tight antialiased' },
        {
            header: 'Action',
            headerClassName: 'text-right',
            cellClassName: 'text-right',
            render: (s) => (
                <button
                    onClick={() => openDrawer(s)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-brand-primary bg-brand-primary/5 border border-brand-primary/10 rounded-lg hover:bg-brand-primary/10 transition-colors cursor-pointer"
                >
                    View Details
                </button>
            ),
        },
    ];

    const kpiCards = [
        { title: 'Ranked Sellers', value: String(kpiCounts.total), icon: <Users size={20} /> },
        { title: 'Verified Sellers', value: String(kpiCounts.verified), icon: <Award size={20} /> },
        { title: 'Total Live Listings', value: String(kpiCounts.totalListings), icon: <Home size={20} /> },
        { title: 'Total Views', value: kpiCounts.totalViews.toLocaleString(), icon: <Eye size={20} /> },
    ];

    return (
        <div className="w-full min-w-0 space-y-8 font-sans antialiased">

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {kpiCards.map((kpi, index) => (
                    <StatCard key={index} title={kpi.title} value={kpi.value} icon={kpi.icon} showSubtext={false} />
                ))}
            </div>

            <div>
                <div className="px-1 mb-4">
                    <h3 className="text-sm font-semibold text-slate-700 tracking-tight">Top Performing Sellers</h3>
                    <p className="text-xs text-slate-400 mt-0.5">Ranked by number of live listings, then total views.</p>
                </div>
                <TableBlueprint
                    data={ranked}
                    columns={columns}
                    isLoading={loading}
                    emptyMessage={loading ? 'Loading…' : 'No sellers with live listings yet.'}
                    searchPlaceholder="Search by seller name or email..."
                    searchKeys={['full_name', 'email']}
                    totalItems={ranked.length}
                    hasPrevPage={false}
                    hasNextPage={false}
                />
            </div>

            {selectedSeller && (
                <DrawerBlueprint
                    isOpen={isDrawerOpen}
                    onClose={() => setIsDrawerOpen(false)}
                    title="Seller Details"
                    footer={
                        <DashboardButton variant="outline" onClick={() => setIsDrawerOpen(false)}>Close</DashboardButton>
                    }
                >
                    <>
                        <div>
                            <div className="flex items-center gap-2 mb-3">
                                <span className="text-xs font-medium uppercase tracking-wider text-slate-400">Seller Information</span>
                                <div className="flex-1 h-px bg-slate-100" />
                            </div>
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-semibold text-slate-700">Full Name</span>
                                    <span className="text-sm font-medium text-slate-500">{selectedSeller.full_name}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-semibold text-slate-700">Email</span>
                                    <span className="text-sm font-medium text-slate-500 flex items-center gap-1.5">
                                        <Mail size={14} className="text-slate-400" />
                                        {selectedSeller.email}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-semibold text-slate-700">Verified</span>
                                    <span className="text-sm font-medium text-slate-500">{selectedSeller.is_verified ? 'Yes' : 'No'}</span>
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
                                    <span className="text-xs text-slate-400 font-medium">Live Listings</span>
                                    <p className="text-lg font-semibold text-slate-700 mt-1">{selectedSeller.listing_count}</p>
                                </div>
                                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                                    <span className="text-xs text-slate-400 font-medium">Total Views</span>
                                    <p className="text-lg font-semibold text-slate-700 mt-1">{selectedSeller.total_views}</p>
                                </div>
                                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl col-span-2">
                                    <span className="text-xs text-slate-400 font-medium">Rank</span>
                                    <p className="text-lg font-semibold text-slate-700 mt-1 flex items-center gap-1.5">
                                        <Trophy size={16} className="text-amber-500" />
                                        #{selectedSeller.rank}
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
