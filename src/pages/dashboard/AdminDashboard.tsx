import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Users, Layers, Clock, Tag, CheckSquare,
  UserCheck, Flag, ShieldAlert, Bell, UserPlus, Home as HomeIcon,
  MessageSquare as MessageSquareIcon, Heart as HeartIcon, DollarSign,
} from 'lucide-react';
import { StatCard } from '@/components/dashboard/StatCard';
import { ActivityChart } from '@/components/dashboard/ActivityChart';
import { RevenueChart, RevenuePoint } from '@/components/dashboard/RevenueChart';
import { TopAgentsCard } from '@/components/dashboard/TopAgentsCard';
import { PendingApprovalsCard } from '@/components/dashboard/PendingApprovalsCard';
import { QuickActionsGrid } from '@/components/dashboard/QuickActionsGrid';
import { FeaturedPropertiesGrid } from '@/components/dashboard/FeaturedPropertiesGrid';
import * as adminApi from '@/api/admin';
import type { Analytics, AdminListing, BackendUser, AdminNotification, RevenueSummary } from '@/api/types';
import { formatRelativeTime } from '@/utils/format';

const activityIcon = (type: string) => {
  if (type === 'new_listing') return <HomeIcon size={14} />;
  if (type === 'new_user') return <UserPlus size={14} />;
  return <Bell size={14} />;
};

const ADMIN_ACTIONS = [
  { label: 'Approve Listings', icon: <CheckSquare size={15} /> },
  { label: 'Manage Users', icon: <UserCheck size={15} /> },
  { label: 'Review Reports', icon: <ShieldAlert size={15} /> },
  { label: 'View Revenue', icon: <DollarSign size={15} /> },
];

const priceLabel = (l: AdminListing) =>
  l.price_rwf ? `RWF ${Number(l.price_rwf).toLocaleString()}` : l.price_usd ? `USD ${Number(l.price_usd).toLocaleString()}` : 'Price on request';

export const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();

  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [users, setUsers] = useState<BackendUser[]>([]);
  const [listings, setListings] = useState<AdminListing[]>([]);
  const [topSellers, setTopSellers] = useState<adminApi.TopSeller[]>([]);
  const [reportsPending, setReportsPending] = useState(0);
  const [notifications, setNotifications] = useState<AdminNotification[] | null>(null);
  const [revenueSummary, setRevenueSummary] = useState<RevenueSummary | null>(null);

  useEffect(() => {
    adminApi.getAnalytics().then(setAnalytics);
    adminApi.getAllUsers().then((res) => setUsers(res.users));
    adminApi.getAllListings(undefined, 1, 100).then((res) => setListings(res.listings));
    adminApi.getTopSellers().then((res) => setTopSellers(res.sellers));
    adminApi.getReports().then((res) => setReportsPending(res.reports.filter((r) => r.status === 'pending').length));
    adminApi.getNotifications().then((res) => setNotifications(res.notifications)).catch(() => setNotifications([]));
    adminApi.getRevenueSummary().then(setRevenueSummary).catch(() => setRevenueSummary(null));
  }, []);

  const pendingUsers = users.filter((u) => u.status === 'pending').length;
  const activeSellers = users.filter((u) => u.role === 'seller' && u.status === 'approved').length;
  const featured = listings.filter((l) => l.is_featured).slice(0, 4).map((l) => ({
    id: l.id,
    image: l.cover_image || '/assets/images/gw-homes-og.png',
    title: l.title,
    location: `${l.sector}, ${l.district}`,
    price: priceLabel(l),
    tag: 'Featured',
  }));

  const APPROVALS = [
    { label: 'Listings Awaiting Approval', count: Number(analytics?.listings.pending ?? 0), icon: <CheckSquare size={16} /> },
    { label: 'Users Awaiting Approval', count: pendingUsers, icon: <UserCheck size={16} /> },
    { label: 'Reported Listings', count: reportsPending, icon: <Flag size={16} /> },
  ];

  const chartRevenueData: RevenuePoint[] = revenueSummary?.revenue_by_day
    ? revenueSummary.revenue_by_day.map((d) => ({
        name: new Date(d.day).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        revenue: Number(d.total_rwf || 0),
      }))
    : [];

  return (
    <div className="space-y-6 w-full min-w-0 overflow-x-hidden">

      {/* Top Welcome Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-6 sm:p-8 text-white shadow-xl border border-slate-800">
        <div className="absolute top-0 right-0 -translate-y-12 translate-x-12 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-semibold border border-indigo-500/30">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" /> Platform Command Center
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              System Overview & Analytics
            </h1>
            <p className="text-sm text-slate-300 max-w-xl">
              Monitor land listings, user growth, revenue streams, and content moderation across Rwanda.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 self-start md:self-auto">
            <button
              onClick={() => navigate('/admin/audit-logs')}
              className="px-4 py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white text-xs font-extrabold border border-white/20 transition-all cursor-pointer flex items-center gap-1.5 backdrop-blur-md"
            >
              <ShieldAlert size={15} /> Audit Logs
            </button>

            <button
              onClick={() => navigate('/admin/properties')}
              className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white text-xs font-extrabold shadow-lg shadow-indigo-500/25 transition-all hover:scale-105 active:scale-95 cursor-pointer"
            >
              Review Listings
            </button>
          </div>
        </div>
      </div>

      {/* Main KPI Stat Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4 w-full min-w-0">
        <StatCard title="Total Users" value={String(analytics?.total_users ?? '—')} change="+18.4%" accentGradient="indigo" icon={<Users size={20} />} onClick={() => navigate('/admin/users')} />
        <StatCard title="Total Listings" value={String(analytics?.listings.total ?? '—')} change="+24.1%" accentGradient="cyan" icon={<Layers size={20} />} onClick={() => navigate('/admin/properties')} />
        <StatCard title="Pending Listings" value={String(analytics?.listings.pending ?? '—')} change={analytics?.listings.pending ? `${analytics.listings.pending} action required` : 'All clear'} changeType={analytics?.listings.pending ? 'negative' : 'positive'} accentGradient="amber" icon={<Clock size={20} />} onClick={() => navigate('/admin/properties')} />
        <StatCard title="Total Revenue" value={revenueSummary ? `RWF ${Number(revenueSummary.total_rwf).toLocaleString()}` : 'RWF 0'} change="+32.0%" accentGradient="emerald" icon={<DollarSign size={20} />} onClick={() => navigate('/admin/revenue')} />
        <StatCard title="Active Sellers" value={String(activeSellers)} change="+14.0%" accentGradient="purple" icon={<UserCheck size={20} />} onClick={() => navigate('/admin/users')} />
      </div>

      {/* Secondary Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full min-w-0">
        <StatCard title="Total Messages" value={String(analytics?.total_messages ?? '—')} icon={<MessageSquareIcon size={20} />} showSubtext={false} accentGradient="indigo" onClick={() => navigate('/admin/messages')} />
        <StatCard title="Total Reports" value={String(analytics?.total_reports ?? '—')} icon={<Flag size={20} />} showSubtext={false} accentGradient="amber" onClick={() => navigate('/admin/reported-content')} />
        <StatCard title="Saved Favorites" value={String(analytics?.total_favorites ?? '—')} icon={<HeartIcon size={20} />} showSubtext={false} accentGradient="emerald" />
      </div>

      {/* Charts Dual Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full min-w-0">
        <ActivityChart listingsByDay={analytics?.listings_by_day ?? []} usersByDay={analytics?.users_by_day ?? []} />
        <RevenueChart data={chartRevenueData} totalRwf={Number(revenueSummary?.total_rwf || 0)} totalUsd={Number(revenueSummary?.total_usd || 0)} />
      </div>



      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 w-full min-w-0 items-start">

        <div className="lg:col-span-2 space-y-6 w-full min-w-0">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden w-full min-w-0">
            <div className="flex justify-between items-center p-4 sm:p-6 border-b border-slate-50">
              <h2 className="text-sm sm:text-base font-medium tracking-tight antialiased text-slate-700">Most Viewed Listings</h2>
              <button onClick={() => navigate('/admin/properties')} className="text-xs font-semibold text-brand-primary hover:underline">View All</button>
            </div>
            {!analytics ? (
              <div className="p-6 text-sm text-slate-400">Loading…</div>
            ) : analytics.most_viewed_listings.length === 0 ? (
              <div className="p-6 text-sm text-slate-400">No approved listings yet.</div>
            ) : (
              <div className="divide-y divide-slate-50">
                {analytics.most_viewed_listings.map((l) => (
                  <div key={l.id} className="flex items-center justify-between gap-3 p-4 hover:bg-slate-50 transition-colors">
                    <span className="text-sm font-medium text-slate-700 truncate">{l.title}</span>
                    <span className="text-xs font-semibold text-slate-500 whitespace-nowrap">{l.view_count} views</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden w-full min-w-0">
            <div className="flex justify-between items-center p-4 sm:p-6 border-b border-slate-50">
              <h2 className="text-sm sm:text-base font-medium tracking-tight antialiased text-slate-700">Recent Activity</h2>
            </div>
            {notifications === null ? (
              <div className="p-6 text-sm text-slate-400">Loading…</div>
            ) : notifications.length === 0 ? (
              <div className="flex flex-col items-center gap-2 p-10 text-center">
                <motion.div
                  className="w-11 h-11 rounded-full bg-slate-50 flex items-center justify-center"
                  animate={{ y: [0, -3, 0] }}
                  transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
                >
                  <Bell size={18} className="text-slate-300" />
                </motion.div>
                <p className="text-sm text-slate-400">No recent activity yet — new listings and user sign-ups will show up here.</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-50">
                {notifications.slice(0, 6).map((n, i) => (
                  <motion.div
                    key={n.id}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2, delay: Math.min(i, 6) * 0.04, ease: 'easeOut' }}
                    className={`flex items-start gap-3 p-4 hover:bg-slate-50 transition-colors ${!n.is_read ? 'bg-blue-50/30' : ''}`}
                  >
                    <div className="p-2 rounded-lg bg-slate-50 text-slate-400 flex-shrink-0">
                      {activityIcon(n.type)}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm text-slate-700 leading-snug">{n.message}</p>
                      <p className="text-xs text-slate-400 mt-0.5">{formatRelativeTime(n.created_at)}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6 w-full min-w-0">
          <TopAgentsCard
            agents={topSellers.slice(0, 4).map((s) => ({
              name: s.full_name,
              count: Number(s.listing_count),
              label: s.is_verified ? 'Verified' : 'Seller',
              style: s.is_verified ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-50 text-slate-600',
            }))}
            onViewAll={() => navigate('/admin/top-agents')}
          />

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
            actions={ADMIN_ACTIONS}
            onActionClick={(index) => {
              const routes = [
                () => navigate('/admin/properties'),
                () => navigate('/admin/users'),
                () => navigate('/admin/reported-content'),
                () => navigate('/admin/revenue'),
              ];
              routes[index]();
            }}
          />
        </div>
      </div>

      {featured.length > 0 && (
        <FeaturedPropertiesGrid
          title="Featured Properties"
          properties={featured}
          onViewAll={() => navigate('/admin/properties')}
          onCardClick={() => navigate('/admin/properties')}
        />
      )}

    </div>
  );
};
