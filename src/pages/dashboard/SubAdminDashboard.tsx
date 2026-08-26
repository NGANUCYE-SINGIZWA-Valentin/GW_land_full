import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Star, UserCheck, Flag, CheckSquare, ShieldAlert } from 'lucide-react';
import { useCurrency } from '@/context/CurrencyContext';
import { StatCard } from '@/components/dashboard/StatCard';
import { PendingApprovalsCard } from '@/components/dashboard/PendingApprovalsCard';
import { QuickActionsGrid } from '@/components/dashboard/QuickActionsGrid';
import { FeaturedPropertiesGrid } from '@/components/dashboard/FeaturedPropertiesGrid';
import * as adminApi from '@/api/admin';
import type { Analytics, AdminListing, BackendUser } from '@/api/types';

const SUB_ADMIN_ACTIONS = [
  { label: 'Approve Listings', icon: <CheckSquare size={15} /> },
  { label: 'Verify Sellers', icon: <UserCheck size={15} /> },
  { label: 'Review Reports', icon: <ShieldAlert size={15} /> },
];

export const SubAdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { formatCurrency } = useCurrency();

  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [users, setUsers] = useState<BackendUser[]>([]);
  const [listings, setListings] = useState<AdminListing[]>([]);
  const [reportsPending, setReportsPending] = useState(0);

  useEffect(() => {
    adminApi.getAnalytics().then(setAnalytics);
    adminApi.getAllUsers().then((res) => setUsers(res.users));
    adminApi.getAllListings(undefined, 1, 100).then((res) => setListings(res.listings));
    adminApi.getReports().then((res) => setReportsPending(res.reports.filter((r) => r.status === 'pending').length));
  }, []);

  const pendingUsers = users.filter((u) => u.status === 'pending').length;
  const featuredCount = listings.filter((l) => l.is_featured).length;
  const featured = listings.filter((l) => l.is_featured).slice(0, 4).map((l) => ({
    id: l.id,
    image: l.cover_image || '/assets/images/gw-homes-og.png',
    title: l.title,
    location: `${l.sector}, ${l.district}`,
    price: l.price_rwf ? formatCurrency(l.price_rwf) : 'Price on request',
    tag: 'Featured',
  }));

  const APPROVALS = [
    { label: 'Listings Awaiting Approval', count: Number(analytics?.listings.pending ?? 0), icon: <CheckSquare size={16} /> },
    { label: 'Users Awaiting Approval', count: pendingUsers, icon: <UserCheck size={16} /> },
    { label: 'Reported Listings', count: reportsPending, icon: <Flag size={16} /> },
  ];

  return (
    <div className="w-full min-w-0 space-y-6">

      {/* Moderation Command Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-purple-950 to-slate-900 p-6 sm:p-8 text-white shadow-xl border border-slate-800">
        <div className="absolute top-0 right-0 -translate-y-12 translate-x-12 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 text-xs font-semibold border border-purple-500/30">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" /> Content Moderation Center
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              Sub-Admin Moderation Portal
            </h1>
            <p className="text-sm text-slate-300 max-w-xl">
              Review submitted land listings, assist with user verifications, and inspect reported content flags.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/admin/properties')}
              className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white text-xs font-extrabold shadow-lg shadow-purple-500/25 transition-all hover:scale-105 active:scale-95 cursor-pointer"
            >
              Review Pending ({analytics?.listings.pending ?? 0})
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full min-w-0">
        <StatCard title="Featured Listings" value={String(featuredCount)} accentGradient="indigo" icon={<Star size={20} />} onClick={() => navigate('/admin/properties')} />
        <StatCard title="Pending Users" value={String(pendingUsers)} accentGradient="cyan" icon={<UserCheck size={20} />} onClick={() => navigate('/admin/users')} />
        <StatCard title="Reported Listings" value={String(reportsPending)} changeType={reportsPending > 0 ? 'negative' : 'positive'} change={reportsPending > 0 ? 'Requires Action' : 'Clean'} accentGradient="amber" icon={<Flag size={20} />} onClick={() => navigate('/admin/reported-content')} />
        <StatCard title="Pending Listings" value={String(analytics?.listings.pending ?? '—')} accentGradient="purple" icon={<CheckSquare size={20} />} onClick={() => navigate('/admin/properties')} />
      </div>


      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 w-full min-w-0 items-start">

        <div className="lg:col-span-2 space-y-6 w-full min-w-0">
          {featured.length > 0 && (
            <FeaturedPropertiesGrid
              title="Featured Properties"
              properties={featured}
              onViewAll={() => navigate('/admin/properties')}
              onCardClick={() => navigate('/admin/properties')}
            />
          )}
        </div>

        <div className="space-y-6 w-full min-w-0">
          <PendingApprovalsCard
            items={APPROVALS}
            onItemClick={(index) => {
              const routes = [
                () => navigate('/admin/properties'),
                () => navigate('/admin/users'),
                () => navigate('/admin/reported-content'),
              ];
              routes[index]?.();
            }}
          />

          <QuickActionsGrid
            actions={SUB_ADMIN_ACTIONS}
            onActionClick={(index) => {
              const routes = [
                () => navigate('/admin/properties'),
                () => navigate('/admin/users'),
                () => navigate('/admin/reported-content'),
              ];
              routes[index]();
            }}
          />
        </div>
      </div>

    </div>
  );
};
