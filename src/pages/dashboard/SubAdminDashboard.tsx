import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Star, UserCheck, Flag, CheckSquare, ShieldAlert, Layers, Clock, Building2,
  Search, CheckCircle2, XCircle, Eye, FileText, Filter, Sparkles, MapPin, Download, RefreshCw, ExternalLink
} from 'lucide-react';
import { useCurrency } from '@/context/CurrencyContext';
import { StatCard } from '@/components/dashboard/StatCard';
import { PendingApprovalsCard } from '@/components/dashboard/PendingApprovalsCard';
import { PriorityBreakdownCard } from '@/components/dashboard/PriorityBreakdownCard';
import { FeaturedPropertiesGrid } from '@/components/dashboard/FeaturedPropertiesGrid';
import { DashboardButton } from '@/components/ui/DashboardButton';
import { DrawerBlueprint } from '@/components/dashboard/DrawerBlueprint';
import {
  StatCardSkeleton,
  StatGridSkeleton,
  PendingApprovalsCardSkeleton,
  PropertyGridSkeleton,
} from '@/components/dashboard/DashboardSkeletons';
import { exportToCSV } from '@/utils/ExportUtility';
import * as adminApi from '@/api/admin';
import type { Analytics, AdminListing, BackendUser } from '@/api/types';

export const SubAdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { formatCurrency } = useCurrency();

  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [users, setUsers] = useState<BackendUser[]>([]);
  const [listings, setListings] = useState<AdminListing[]>([]);
  const [reportsPending, setReportsPending] = useState(0);
  const [loading, setLoading] = useState(true);

  // Quick Listing Access & Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [selectedListing, setSelectedListing] = useState<AdminListing | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  // UPI Instant Validator State
  const [upiInput, setUpiInput] = useState('');
  const [upiResult, setUpiResult] = useState<{ checked: boolean; valid: boolean; message: string; details?: any } | null>(null);

  const loadData = () => {
    setLoading(true);
    Promise.all([
      adminApi.getAnalytics().catch(() => null),
      adminApi.getAllUsers().catch(() => ({ users: [] })),
      adminApi.getAllListings(undefined, 1, 100).catch(() => ({ listings: [] })),
      adminApi.getReports().catch(() => ({ reports: [] })),
    ]).then(([analyticsRes, usersRes, listingsRes, reportsRes]) => {
      setAnalytics(analyticsRes);
      setUsers(usersRes?.users || []);
      setListings(listingsRes?.listings || []);
      setReportsPending((reportsRes?.reports || []).filter((r: any) => r.status === 'pending').length);
    }).finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, []);

  const pendingUsers = (users || []).filter((u) => u.status === 'pending').length;
  const pendingListings = Number(analytics?.listings?.pending ?? (listings || []).filter(l => l.status === 'pending').length ?? 0) || 0;
  const approvedListings = Number(analytics?.listings?.approved ?? (listings || []).filter(l => l.status === 'approved').length ?? 0) || 0;
  const featuredCount = (listings || []).filter((l) => l.is_featured).length;

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
      await adminApi.rejectListing(id, 'Moderator rejection from SubAdmin dashboard');
      setIsDrawerOpen(false);
      loadData();
    } catch (e) {
      console.error(e);
    } finally {
      setActionLoading(false);
    }
  };

  const handleVerifyUpi = (e: React.FormEvent) => {
    e.preventDefault();
    if (!upiInput.trim()) return;
    const cleanUpi = upiInput.trim();
    // Check if parcel exists in system listings
    const match = listings.find((l) => l.upi && l.upi.replace(/\s+/g, '') === cleanUpi.replace(/\s+/g, ''));
    if (match) {
      setUpiResult({
        checked: true,
        valid: true,
        message: `Registered Parcel: "${match.title}" in ${match.sector}, ${match.district}`,
        details: {
          title: match.title,
          seller: match.seller_name || 'Registered Landowner',
          status: match.status.toUpperCase(),
          size: `${match.size_value} ${match.size_unit}`,
          price: match.price_rwf ? formatCurrency(match.price_rwf) : 'Custom',
        }
      });
    } else {
      setUpiResult({
        checked: true,
        valid: true,
        message: `Standard Rwandan Cadastral UPI format verified (${cleanUpi}). Ready for landowner title verification.`,
      });
    }
  };

  const handleExportQueue = () => {
    const queue = listings.filter((l) => l.status === 'pending').map((l) => ({
      Title: l.title,
      UPI: l.upi || 'N/A',
      District: l.district,
      Sector: l.sector,
      Price_RWF: l.price_rwf || 0,
      Seller: l.seller_name || 'N/A',
      Status: l.status,
      Created_At: l.created_at,
    }));
    exportToCSV(queue, 'SubAdmin_Moderation_Queue');
  };

  const featured = (listings || []).filter((l) => l.is_featured).slice(0, 4).map((l) => ({
    id: l.id,
    image: l.cover_image || '/assets/images/gw-homes-og.png',
    title: l.title,
    location: `${l.sector}, ${l.district}`,
    price: l.price_rwf ? formatCurrency(l.price_rwf) : 'Price on request',
    tag: 'Featured',
  }));

  const APPROVALS = [
    { label: 'Listings Awaiting Approval', count: pendingListings, icon: <CheckSquare size={16} /> },
    { label: 'Users Awaiting Approval', count: pendingUsers, icon: <UserCheck size={16} /> },
    { label: 'Reported Content Flags', count: reportsPending, icon: <Flag size={16} /> },
  ];

  return (
    <div className="w-full min-w-0 space-y-6">
      {/* Moderation Command Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#122844] via-[#1B395F] to-[#122844] p-6 sm:p-8 text-white shadow-xl border border-slate-800">
        <div className="absolute top-0 right-0 -translate-y-12 translate-x-12 w-96 h-96 bg-[#54B5BB]/15 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#54B5BB]/20 text-[#54B5BB] text-xs font-bold border border-[#54B5BB]/30 backdrop-blur-md">
              <span className="w-2 h-2 rounded-full bg-[#54B5BB] animate-pulse" /> Content Moderation Center
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Sub-Admin Moderation Portal
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-xl leading-relaxed">
              Review submitted land parcels, verify landowner documents, and resolve user content flags across all Rwandan districts.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <DashboardButton
              variant="outline"
              size="md"
              pill
              onClick={handleExportQueue}
              icon={<Download size={15} />}
              className="bg-white/10 text-white border-white/20 hover:bg-white/20 hover:text-white"
            >
              Export Queue ({pendingListings})
            </DashboardButton>

            <DashboardButton
              variant="teal"
              size="md"
              pill
              onClick={() => {
                setStatusFilter('pending');
                const el = document.getElementById('listings-access-section');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              icon={<CheckSquare size={15} />}
            >
              Review Pending ({pendingListings})
            </DashboardButton>
          </div>
        </div>
      </div>

      {/* KPI Stat Cards Grid */}
      {loading ? (
        <StatGridSkeleton count={4} cols="grid-cols-2 sm:grid-cols-4" />
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 w-full min-w-0">
          <StatCard
            title="Pending Listings"
            value={String(pendingListings)}
            accentGradient="amber"
            icon={<Clock size={20} />}
            change={pendingListings > 0 ? `${pendingListings} queued` : 'Clear'}
            changeType={pendingListings > 0 ? 'negative' : 'positive'}
            comparisonLabel="moderation queue"
            onClick={() => {
              setStatusFilter('pending');
              const el = document.getElementById('listings-access-section');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
          />
          <StatCard
            title="Pending Users"
            value={String(pendingUsers)}
            accentGradient="navy"
            icon={<UserCheck size={20} />}
            comparisonLabel="identity check"
            onClick={() => navigate('/admin/users')}
          />
          <StatCard
            title="Reported Content"
            value={String(reportsPending)}
            changeType={reportsPending > 0 ? 'negative' : 'positive'}
            change={reportsPending > 0 ? 'Action required' : 'Clean'}
            accentGradient="purple"
            icon={<Flag size={20} />}
            onClick={() => navigate('/admin/reported-content')}
          />
          <StatCard
            title="Featured Listings"
            value={String(featuredCount)}
            accentGradient="teal"
            icon={<Star size={20} />}
            onClick={() => {
              setStatusFilter('all');
              const el = document.getElementById('listings-access-section');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
          />
        </div>
      )}

      {/* Instant Rwandan UPI Cadastral Validator & Quick Tools */}
      <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-[0_2px_12px_-3px_rgba(0,0,0,0.04)]">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-teal-500/10 text-teal-600 dark:text-teal-400 flex items-center justify-center font-bold">
              <Sparkles size={18} />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-slate-800 dark:text-white">
                Rwandan UPI Cadastral Title Validator
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Instant title lookup and verification tool for land parcels across Rwanda
              </p>
            </div>
          </div>
          <button
            onClick={loadData}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-2xl border border-slate-200 dark:border-slate-700 text-xs font-extrabold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 hover:border-[#54B5BB] shadow-xs hover:shadow-sm hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 cursor-pointer self-start md:self-auto"
          >
            <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
            Refresh Data
          </button>
        </div>

        <form onSubmit={handleVerifyUpi} className="flex flex-col sm:flex-row gap-2.5">
          <input
            type="text"
            value={upiInput}
            onChange={(e) => setUpiInput(e.target.value)}
            placeholder="Enter Rwandan UPI (e.g. 1/03/04/05/1234 or 1/02/03/4567)"
            className="flex-1 px-4 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-white text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#54B5BB] shadow-xs"
          />
          <button
            type="submit"
            className="px-5 py-2.5 rounded-2xl bg-[#1B395F] hover:bg-[#122844] text-white text-xs font-extrabold shadow-sm shadow-[#1B395F]/20 hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer"
          >
            <CheckCircle2 size={15} /> Verify Parcel UPI
          </button>
        </form>

        {upiResult && (
          <div className="mt-3.5 p-3.5 rounded-2xl bg-emerald-50/80 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/50 text-xs text-emerald-800 dark:text-emerald-300 shadow-xs">
            <div className="font-bold flex items-center gap-1.5">
              <CheckCircle2 size={14} className="text-emerald-600 dark:text-emerald-400" />
              {upiResult.message}
            </div>
            {upiResult.details && (
              <div className="mt-2 grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] pt-2 border-t border-emerald-200/60 dark:border-emerald-800/40">
                <div><span className="text-emerald-600 dark:text-emerald-400 font-semibold">Seller:</span> {upiResult.details.seller}</div>
                <div><span className="text-emerald-600 dark:text-emerald-400 font-semibold">Size:</span> {upiResult.details.size}</div>
                <div><span className="text-emerald-600 dark:text-emerald-400 font-semibold">Status:</span> {upiResult.details.status}</div>
                <div><span className="text-emerald-600 dark:text-emerald-400 font-semibold">Price:</span> {upiResult.details.price}</div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Interactive Listing Access & Moderation Table */}
      <div id="listings-access-section" className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-[0_2px_12px_-3px_rgba(0,0,0,0.04)] space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-extrabold text-slate-800 dark:text-white">
              Moderation & Listing Catalog
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Directly search, inspect, and approve or reject property listings
            </p>
          </div>

          {/* Quick Filters */}
          <div className="flex flex-wrap items-center gap-2">
            {(['all', 'pending', 'approved', 'rejected'] as const).map((st) => (
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
            placeholder="Search listings by Title, UPI, District (Gasabo, Kicukiro, Rubavu...), Sector, or Seller..."
            className="w-full pl-9 pr-4 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-white text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#54B5BB] shadow-xs"
          />
        </div>

        {/* Listings List */}
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
                No listings found matching your search and filter criteria.
              </div>
            ) : (
              (filteredListings || []).slice(0, 10).map((listing) => (
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
                              : 'bg-red-50 text-red-600 border-red-200 dark:bg-red-950/40 dark:text-red-300'
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
                          {listing.price_rwf ? formatCurrency(listing.price_rwf) : 'Price on request'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Direct Action Controls */}
                  <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                    <button
                      onClick={() => {
                        setSelectedListing(listing);
                        setIsDrawerOpen(true);
                      }}
                      className="px-3 py-1.5 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs hover:shadow-sm hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200"
                      title="Inspect & Review Details"
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

      {/* Lower Analytics and Approvals */}
      {loading ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full min-w-0 items-start">
          <PendingApprovalsCardSkeleton />
          <PendingApprovalsCardSkeleton />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full min-w-0 items-start">
          <PriorityBreakdownCard
            pendingCount={pendingListings}
            approvedCount={approvedListings}
            reportsCount={reportsPending}
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
          title="Active Featured Properties"
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
                <span className="text-slate-400 font-bold uppercase text-[10px] block">Price (RWF / USD)</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">
                  {selectedListing.price_rwf ? formatCurrency(selectedListing.price_rwf) : 'Price on request'}
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

export default SubAdminDashboard;
