import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users, Layers, Clock, Tag, CheckSquare,
  UserCheck, Flag, ShieldAlert, Bell, UserPlus, Home as HomeIcon,
  MessageSquare as MessageSquareIcon, Heart as HeartIcon, DollarSign,
  Plus, ArrowUpRight, TrendingUp, Award, Sparkles, Building2,
  Search, MapPin, Eye, CheckCircle2, XCircle, Download, RefreshCw, ExternalLink
} from 'lucide-react';
import { StatCard } from '@/components/dashboard/StatCard';
import { ActivityChart } from '@/components/dashboard/ActivityChart';
import { RevenueChart, RevenuePoint } from '@/components/dashboard/RevenueChart';
import { TopAgentsCard } from '@/components/dashboard/TopAgentsCard';
import { PendingApprovalsCard } from '@/components/dashboard/PendingApprovalsCard';
import { PriorityBreakdownCard } from '@/components/dashboard/PriorityBreakdownCard';
import { FeaturedPropertiesGrid } from '@/components/dashboard/FeaturedPropertiesGrid';
import { DashboardButton } from '@/components/ui/DashboardButton';
import { DrawerBlueprint } from '@/components/dashboard/DrawerBlueprint';
import {
  StatCardSkeleton,
  StatGridSkeleton,
  ChartWidgetSkeleton,
  TopAgentsCardSkeleton,
  PendingApprovalsCardSkeleton,
  PropertyGridSkeleton,
} from '@/components/dashboard/DashboardSkeletons';
import { exportToCSV } from '@/utils/ExportUtility';
import * as adminApi from '@/api/admin';
import type { Analytics, AdminListing, BackendUser, AdminNotification, RevenueSummary } from '@/api/types';
import { formatRelativeTime } from '@/utils/format';

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
  const [loading, setLoading] = useState(true);

  // Quick Listing Access & Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'sold'>('all');
  const [selectedListing, setSelectedListing] = useState<AdminListing | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const loadData = () => {
    setLoading(true);
    Promise.all([
      adminApi.getAnalytics().catch(() => null),
      adminApi.getAllUsers().catch(() => ({ users: [] })),
      adminApi.getAllListings(undefined, 1, 100).catch(() => ({ listings: [] })),
      adminApi.getTopSellers().catch(() => ({ sellers: [] })),
      adminApi.getReports().catch(() => ({ reports: [] })),
      adminApi.getNotifications().catch(() => ({ notifications: [] })),
      adminApi.getRevenueSummary().catch(() => null),
    ]).then(([analyticsRes, usersRes, listingsRes, topSellersRes, reportsRes, notifRes, revRes]) => {
      setAnalytics(analyticsRes);
      setUsers(usersRes?.users || []);
      setListings(listingsRes?.listings || []);
      setTopSellers(topSellersRes?.sellers || []);
      setReportsPending((reportsRes?.reports || []).filter((r: any) => r.status === 'pending').length);
      setNotifications(notifRes?.notifications || []);
      setRevenueSummary(revRes);
    }).finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, []);

  const pendingUsers = (users || []).filter((u) => u.status === 'pending').length;
  const activeSellers = (users || []).filter((u) => u.role === 'seller' && u.status === 'approved').length;
  const pendingListings = Number(analytics?.listings?.pending ?? (listings || []).filter(l => l.status === 'pending').length ?? 0) || 0;
  const approvedListings = Number(analytics?.listings?.approved ?? (listings || []).filter(l => l.status === 'approved').length ?? 0) || 0;
  const soldListings = Number(analytics?.listings?.sold ?? (listings || []).filter(l => l.status === 'sold').length ?? 0) || 0;

  const filteredListings = useMemo(() => {
    let list = listings || [];
    if (statusFilter !== 'all') {
      list = list.filter((l) => l.status === statusFilter);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter((l) =>
        l.title.toLowerCase().includes(q) ||
        (l.upi && l.upi.toLowerCase().includes(q)) ||
        l.district.toLowerCase().includes(q) ||
        l.sector.toLowerCase().includes(q) ||
        (l.seller_name && l.seller_name.toLowerCase().includes(q))
      );
    }
    return list;
  }, [listings, statusFilter, searchQuery]);

  const handleApprove = async (id: string) => {
    setActionLoading(true);
    try {
      await adminApi.approveListing(id);
      setIsDrawerOpen(false);
      loadData();
    } catch (e) {
      console.error(e);
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async (id: string) => {
    setActionLoading(true);
    try {
      await adminApi.rejectListing(id, 'Admin rejection');
      setIsDrawerOpen(false);
      loadData();
    } catch (e) {
      console.error(e);
    } finally {
      setActionLoading(false);
    }
  };

  const handleExportAll = () => {
    const data = listings.map((l) => ({
      Title: l.title,
      UPI: l.upi || 'N/A',
      District: l.district,
      Sector: l.sector,
      Price_RWF: l.price_rwf || 0,
      Status: l.status,
      Seller: l.seller_name || 'N/A',
      Created_At: l.created_at,
    }));
    exportToCSV(data, 'GWLand_All_Properties_Export');
  };

  const featured = (listings || []).filter((l) => l.is_featured).slice(0, 4).map((l) => ({
    id: l.id,
    image: l.cover_image || '/assets/images/gw-homes-og.png',
    title: l.title,
    location: `${l.sector}, ${l.district}`,
    price: priceLabel(l),
    tag: 'Featured',
  }));

  const APPROVALS = [
    { label: 'Listings Awaiting Approval', count: pendingListings, icon: <CheckSquare size={16} /> },
    { label: 'Users Awaiting Verification', count: pendingUsers, icon: <UserCheck size={16} /> },
    { label: 'Reported Content Reviews', count: reportsPending, icon: <Flag size={16} /> },
  ];

  const chartRevenueData: RevenuePoint[] = revenueSummary?.revenue_by_day
    ? revenueSummary.revenue_by_day.map((d) => ({
        name: d.day ? new Date(d.day).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '',
        revenue: Number(d.total_rwf || 0),
      }))
    : [];

  const agentsFormatted = (topSellers || []).map((s, idx) => ({
    name: s.full_name || (s as any).name || 'Agent',
    count: Number(s.listing_count || 0),
    score: Math.max(98 - idx * 3, 85),
    role: idx === 0 ? 'Lead Broker' : 'Certified Land Agent',
  }));

  return (
    <div className="space-y-6 w-full min-w-0 overflow-x-hidden">
      {/* Top Welcome Hero Banner (Landing Page Navy & Teal Gradient) */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#122844] via-[#1B395F] to-[#122844] p-6 sm:p-8 text-white shadow-xl border border-slate-800">
        <div className="absolute top-0 right-0 -translate-y-12 translate-x-12 w-96 h-96 bg-[#54B5BB]/15 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#54B5BB]/20 text-[#54B5BB] text-xs font-bold border border-[#54B5BB]/30 backdrop-blur-md">
              <span className="w-2 h-2 rounded-full bg-[#54B5BB] animate-pulse" /> Executive Operations Center
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              GW Land Real Estate Management
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-xl leading-relaxed">
              Supervise land transactions, moderate verified property titles, monitor active seller performance, and track national revenue metrics.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 self-start md:self-auto">
            <DashboardButton
              variant="outline"
              size="md"
              pill
              onClick={handleExportAll}
              icon={<Download size={15} />}
              className="bg-white/10 text-white border-white/20 hover:bg-white/20 hover:text-white"
            >
              Export Catalog
            </DashboardButton>

            <DashboardButton
              variant="outline"
              size="md"
              pill
              onClick={() => navigate('/admin/audit-logs')}
              icon={<ShieldAlert size={15} />}
              className="bg-white/10 text-white border-white/20 hover:bg-white/20 hover:text-white"
            >
              Audit Logs
            </DashboardButton>

            <DashboardButton
              variant="teal"
              size="md"
              pill
              onClick={() => {
                const el = document.getElementById('admin-listing-access-section');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
                else navigate('/admin/properties');
              }}
              icon={<Layers size={15} />}
            >
              Manage Properties
            </DashboardButton>
          </div>
        </div>
      </div>

      {/* Main KPI Stat Cards Grid */}
      {loading ? (
        <StatGridSkeleton count={5} cols="grid-cols-2 sm:grid-cols-3 xl:grid-cols-5" />
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-5 gap-3.5 w-full min-w-0">
          <StatCard
            title="Total Users"
            value={String(analytics?.total_users ?? (users.length || '—'))}
            change="+18.4%"
            accentGradient="navy"
            icon={<Users size={20} />}
            onClick={() => navigate('/admin/users')}
            comparisonLabel="platform users"
          />
          <StatCard
            title="Total Listings"
            value={String(analytics?.listings?.total ?? (listings.length || '—'))}
            change="+24.1%"
            accentGradient="teal"
            icon={<Layers size={20} />}
            onClick={() => {
              setStatusFilter('all');
              const el = document.getElementById('admin-listing-access-section');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
            comparisonLabel="in catalog"
          />
          <StatCard
            title="Pending Listings"
            value={String(pendingListings)}
            change={pendingListings > 0 ? `${pendingListings} action required` : 'All verified'}
            changeType={pendingListings > 0 ? 'negative' : 'positive'}
            accentGradient="amber"
            icon={<Clock size={20} />}
            onClick={() => {
              setStatusFilter('pending');
              const el = document.getElementById('admin-listing-access-section');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
            comparisonLabel="moderation queue"
          />
          <StatCard
            title="Total Revenue"
            value={revenueSummary ? `RWF ${Number(revenueSummary.total_rwf).toLocaleString()}` : 'RWF 0'}
            change="+32.0%"
            accentGradient="emerald"
            icon={<DollarSign size={20} />}
            onClick={() => navigate('/admin/revenue')}
            comparisonLabel="processed"
          />
          <StatCard
            title="Active Sellers"
            value={String(activeSellers || '—')}
            change="+14.0%"
            accentGradient="purple"
            icon={<UserCheck size={20} />}
            onClick={() => navigate('/admin/users')}
            comparisonLabel="verified brokers"
          />
        </div>
      )}

      {/* Secondary Metrics Bar */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 w-full min-w-0">
          <StatCardSkeleton />
          <StatCardSkeleton />
          <StatCardSkeleton />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 w-full min-w-0">
          <StatCard
            title="Client Inquiries"
            value={String(analytics?.total_messages ?? '—')}
            icon={<MessageSquareIcon size={18} />}
            showSubtext={false}
            accentGradient="navy"
            onClick={() => navigate('/admin/messages')}
          />
          <StatCard
            title="Pending Reports"
            value={String(reportsPending || '0')}
            icon={<Flag size={18} />}
            showSubtext={false}
            accentGradient="amber"
            onClick={() => navigate('/admin/reported-content')}
          />
          <StatCard
            title="Saved Favorites"
            value={String(analytics?.total_favorites ?? '—')}
            icon={<HeartIcon size={18} />}
            showSubtext={false}
            accentGradient="teal"
          />
        </div>
      )}

      {/* Direct Listing Access, Search & Instant Moderation Section */}
      <div id="admin-listing-access-section" className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-[0_2px_12px_-3px_rgba(0,0,0,0.04)] space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-extrabold text-slate-800 dark:text-white">
              Land & Property Catalog Direct Access
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Instant parcel lookup, cadastral UPI verification, and approval workflow
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {(['all', 'pending', 'approved', 'sold'] as const).map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3.5 py-1.5 rounded-2xl text-xs font-extrabold capitalize transition-all duration-200 cursor-pointer shadow-xs hover:-translate-y-0.5 active:translate-y-0 ${
                  statusFilter === st
                    ? 'bg-[#1B395F] text-white shadow-sm shadow-[#1B395F]/20'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 hover:text-[#1B395F]'
                }`}
              >
                {st} ({listings.filter((l) => st === 'all' || l.status === st).length})
              </button>
            ))}
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search parcels by Title, UPI, District (Gasabo, Kicukiro, Nyarugenge, Rubavu, Musanze...), or Seller..."
            className="w-full pl-9 pr-4 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-white text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#54B5BB] shadow-xs"
          />
        </div>

        {/* Listings Compact List */}
        {loading ? (
          <div className="divide-y divide-slate-100 dark:divide-slate-800 border border-slate-100 dark:border-slate-800 rounded-2xl overflow-hidden p-2 space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="p-3 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 rounded-2xl bg-slate-200 dark:bg-slate-800 animate-pulse shrink-0" />
                  <div className="space-y-2">
                    <div className="h-4 w-44 rounded-md bg-slate-200 dark:bg-slate-800 animate-pulse" />
                    <div className="h-3 w-32 rounded-md bg-slate-200 dark:bg-slate-800 animate-pulse" />
                  </div>
                </div>
                <div className="flex gap-2">
                  <div className="h-8 w-20 rounded-xl bg-slate-200 dark:bg-slate-800 animate-pulse" />
                  <div className="h-8 w-8 rounded-xl bg-slate-200 dark:bg-slate-800 animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800 border border-slate-100 dark:border-slate-800 rounded-2xl overflow-hidden">
            {(filteredListings || []).length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400 font-medium">
                No listings match your search criteria.
              </div>
            ) : (
              (filteredListings || []).slice(0, 8).map((listing) => (
                <div
                  key={listing.id}
                  className="p-4 hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="flex items-start gap-3 min-w-0">
                    <img
                      src={listing.cover_image || '/assets/images/gw-homes-og.png'}
                      alt={listing.title}
                      className="w-14 h-14 rounded-2xl object-cover border border-slate-200 dark:border-slate-700 shrink-0 shadow-xs"
                      referrerPolicy="no-referrer"
                    />
                    <div className="min-w-0 space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-extrabold text-xs text-slate-800 dark:text-white truncate">
                          {listing.title}
                        </span>
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase border ${
                            listing.status === 'approved'
                              ? 'bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300'
                              : listing.status === 'pending'
                              ? 'bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300'
                              : 'bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300'
                          }`}
                        >
                          {listing.status}
                        </span>
                        {listing.is_featured && (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-50 text-purple-600 dark:bg-purple-950/40 dark:text-purple-300 border border-purple-200">
                            Featured
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 text-[11px] text-slate-500 dark:text-slate-400">
                        <span className="flex items-center gap-1">
                          <MapPin size={11} className="text-teal-500" />
                          {listing.sector}, {listing.district}
                        </span>
                        {listing.upi && (
                          <span className="font-mono bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded-lg text-[10px]">
                            UPI: {listing.upi}
                          </span>
                        )}
                        <span className="font-bold text-slate-700 dark:text-slate-300">
                          {listing.price_rwf ? `RWF ${Number(listing.price_rwf).toLocaleString()}` : 'Price on request'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                    <button
                      onClick={() => {
                        setSelectedListing(listing);
                        setIsDrawerOpen(true);
                      }}
                      className="px-3 py-1.5 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs hover:shadow-sm hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200"
                    >
                      <Eye size={13} />
                      <span>Inspect</span>
                    </button>

                    {listing.status === 'pending' && (
                      <>
                        <button
                          onClick={() => handleApprove(listing.id)}
                          disabled={actionLoading}
                          className="px-3 py-1.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1 cursor-pointer shadow-sm shadow-emerald-600/20 hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200"
                        >
                          <CheckCircle2 size={13} /> Approve
                        </button>
                        <button
                          onClick={() => handleReject(listing.id)}
                          disabled={actionLoading}
                          className="px-3 py-1.5 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold flex items-center gap-1 cursor-pointer shadow-sm shadow-rose-600/20 hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200"
                        >
                          <XCircle size={13} /> Reject
                        </button>
                      </>
                    )}

                    <button
                      onClick={() => navigate(`/properties/${listing.slug || listing.id}`)}
                      className="p-2 rounded-2xl border border-slate-200 dark:border-slate-700 text-slate-500 hover:text-slate-800 dark:hover:text-white hover:border-[#54B5BB] shadow-xs hover:shadow-sm hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 cursor-pointer"
                      title="View live parcel"
                    >
                      <ExternalLink size={13} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Charts Dual Grid (Area Charts with Navy & Teal) */}
      {loading ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full min-w-0">
          <ChartWidgetSkeleton height={280} />
          <ChartWidgetSkeleton height={280} />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full min-w-0">
          <ActivityChart
            listingsByDay={analytics?.listings_by_day ?? []}
            usersByDay={analytics?.users_by_day ?? []}
            title="Listing Submissions & User Influx"
          />
          <RevenueChart
            data={chartRevenueData}
            totalRwf={Number(revenueSummary?.total_rwf || 0)}
            totalUsd={Number(revenueSummary?.total_usd || 0)}
            title="Revenue & Subscription Earnings"
          />
        </div>
      )}

      {/* 3-Column Lower Analytics Suite */}
      {loading ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 w-full min-w-0 items-start">
          <PendingApprovalsCardSkeleton />
          <TopAgentsCardSkeleton />
          <PendingApprovalsCardSkeleton />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 w-full min-w-0 items-start">
          <PriorityBreakdownCard
            pendingCount={pendingListings}
            approvedCount={approvedListings}
            soldCount={soldListings}
            reportsCount={reportsPending}
          />

          <TopAgentsCard
            agents={agentsFormatted}
            onViewAll={() => navigate('/admin/users')}
          />

          <PendingApprovalsCard
            items={APPROVALS}
            onViewAll={() => navigate('/admin/properties')}
            onItemClick={(idx) => {
              if (idx === 0) navigate('/admin/properties');
              else if (idx === 1) navigate('/admin/users');
              else if (idx === 2) navigate('/admin/reported-content');
            }}
          />
        </div>
      )}

      {/* Featured Properties Grid */}
      {featured.length > 0 && (
        <FeaturedPropertiesGrid
          title="Spotlight Properties Across Rwanda"
          properties={featured}
          onViewAll={() => navigate('/admin/properties')}
          onCardClick={() => navigate('/admin/properties')}
        />
      )}

      {/* Inspect Property Drawer */}
      {selectedListing && (
        <DrawerBlueprint
          isOpen={isDrawerOpen}
          onClose={() => setIsDrawerOpen(false)}
          title={`Review Parcel: ${selectedListing.title}`}
          footer={
            <div className="flex items-center justify-between w-full gap-3">
              <DashboardButton variant="ghost" onClick={() => setIsDrawerOpen(false)}>
                Close
              </DashboardButton>
              <div className="flex items-center gap-2">
                {selectedListing.status === 'pending' && (
                  <>
                    <DashboardButton
                      variant="outline"
                      onClick={() => handleReject(selectedListing.id)}
                      disabled={actionLoading}
                      icon={<XCircle size={14} />}
                    >
                      Reject
                    </DashboardButton>
                    <DashboardButton
                      variant="teal"
                      onClick={() => handleApprove(selectedListing.id)}
                      disabled={actionLoading}
                      icon={<CheckCircle2 size={14} />}
                    >
                      Approve Listing
                    </DashboardButton>
                  </>
                )}
              </div>
            </div>
          }
        >
          <div className="space-y-4 text-xs">
            <img
              src={selectedListing.cover_image || '/assets/images/gw-homes-og.png'}
              alt={selectedListing.title}
              className="w-full h-48 rounded-2xl object-cover border border-slate-200 dark:border-slate-700"
              referrerPolicy="no-referrer"
            />
            <div className="grid grid-cols-2 gap-3 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700">
              <div>
                <span className="text-slate-400 font-bold uppercase text-[10px] block">Location</span>
                <span className="font-extrabold text-slate-800 dark:text-white">
                  {selectedListing.sector}, {selectedListing.district}
                </span>
              </div>
              <div>
                <span className="text-slate-400 font-bold uppercase text-[10px] block">UPI Number</span>
                <span className="font-mono font-bold text-slate-800 dark:text-white">
                  {selectedListing.upi || 'Pending verification'}
                </span>
              </div>
              <div>
                <span className="text-slate-400 font-bold uppercase text-[10px] block">Price</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">
                  {priceLabel(selectedListing)}
                </span>
              </div>
              <div>
                <span className="text-slate-400 font-bold uppercase text-[10px] block">Plot Dimensions</span>
                <span className="font-bold text-slate-800 dark:text-white">
                  {selectedListing.size_value} {selectedListing.size_unit}
                </span>
              </div>
            </div>

            <div>
              <span className="text-slate-400 font-bold uppercase text-[10px] block mb-1">Description</span>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-800/30 p-3 rounded-xl">
                {selectedListing.description || 'No description provided.'}
              </p>
            </div>
          </div>
        </DrawerBlueprint>
      )}
    </div>
  );
};
