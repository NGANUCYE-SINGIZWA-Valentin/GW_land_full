import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Layers, CheckSquare, Eye,
  Plus, Edit, Search, Filter, MapPin, Calculator,
  Target, MessageSquareText, Home, FileText, Download,
  TrendingUp, Sparkles, Building2, Award, Clock, ExternalLink
} from 'lucide-react';
import { StatCard } from '@/components/dashboard/StatCard';
import { FeaturedPropertiesGrid } from '@/components/dashboard/FeaturedPropertiesGrid';
import { MessagesList } from '@/components/dashboard/MessagesList';
import { TopPerformingList } from '@/components/dashboard/TopPerformingList';
import { LeadKanban } from '@/components/dashboard/LeadKanban';
import { DocumentVaultModal } from '@/components/dashboard/DocumentVaultModal';
import { ChatModal } from '@/components/dashboard/ChatModal';
import { DashboardButton } from '@/components/ui/DashboardButton';
import { exportToCSV } from '@/utils/ExportUtility';
import { useAuth } from '@/components/auth/AuthContext';
import { useCurrency } from '@/context/CurrencyContext';
import * as listingsApi from '@/api/listings';
import * as messagesApi from '@/api/messages';
import type { MyListing, Conversation } from '@/api/types';
import { formatRelativeTime, initials } from '@/utils/format';

const priceLabel = (l: MyListing) =>
  l.price_rwf ? `RWF ${Number(l.price_rwf).toLocaleString()}` : l.price_usd ? `USD ${Number(l.price_usd).toLocaleString()}` : 'Price on request';

export const SellerDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { formatCurrency } = useCurrency();
  const [listings, setListings] = useState<MyListing[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'approved' | 'pending' | 'sold'>('all');

  // Quick Valuation Estimator State
  const [calcDistrict, setCalcDistrict] = useState('Gasabo');
  const [calcSqm, setCalcSqm] = useState(450);
  const [calcEstimatedPrice, setCalcEstimatedPrice] = useState<number | null>(null);

  // Modals
  const [isVaultOpen, setIsVaultOpen] = useState(false);
  const [chatUser, setChatUser] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([listingsApi.getMyListings(), messagesApi.getInbox()])
      .then(([listingsRes, inboxRes]) => {
        setListings(listingsRes?.listings || []);
        setConversations(inboxRes?.conversations || []);
      })
      .catch(() => {
        setListings([]);
        setConversations([]);
      })
      .finally(() => setLoading(false));
  }, []);

  // Calculate estimated price based on district rates
  useEffect(() => {
    const rates: Record<string, number> = {
      Gasabo: 75000,
      Kicukiro: 68000,
      Nyarugenge: 60000,
      Bugesera: 32000,
      Rwamagana: 24000,
      Rubavu: 38000,
      Musanze: 35000,
      Huye: 22000,
      Muhanga: 20000,
    };
    const rate = rates[calcDistrict] || 40000;
    setCalcEstimatedPrice(calcSqm * rate);
  }, [calcDistrict, calcSqm]);

  const total = (listings || []).length;
  const approved = (listings || []).filter((l) => l.status === 'approved').length;
  const pending = (listings || []).filter((l) => l.status === 'pending').length;
  const sold = (listings || []).filter((l) => l.status === 'sold').length;
  const totalViews = (listings || []).reduce((sum, l) => sum + (l.view_count || 0), 0);
  const unread = (conversations || []).reduce((sum, c) => sum + Number(c.unread_count || 0), 0);

  const filteredListings = useMemo(() => {
    let list = listings || [];
    if (statusFilter !== 'all') {
      list = list.filter((l) => l.status === statusFilter);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter((l) =>
        l.title.toLowerCase().includes(q) ||
        l.district.toLowerCase().includes(q) ||
        l.sector.toLowerCase().includes(q)
      );
    }
    return list;
  }, [listings, statusFilter, searchQuery]);

  const topListings = [...(listings || [])]
    .sort((a, b) => (b.view_count || 0) - (a.view_count || 0))
    .slice(0, 4)
    .map((l) => ({
      name: l.title,
      views: l.view_count || 0,
      location: `${l.sector}, ${l.district}`,
      revenue: l.price_rwf ? `RWF ${Number(l.price_rwf).toLocaleString()}` : undefined
    }));

  const featured = (listings || [])
    .filter((l) => l.is_featured)
    .slice(0, 4)
    .map((l) => ({
      id: l.id,
      image: l.cover_image || '/assets/images/gw-homes-og.png',
      title: l.title,
      location: `${l.sector}, ${l.district}`,
      price: priceLabel(l),
      tag: 'Featured',
    }));

  const messages = (conversations || []).slice(0, 5).map((c) => {
    const otherName = (c.sender_id === user?.id ? c.receiver_name : c.sender_name) || 'Buyer';
    return {
      name: otherName,
      message: c.body || '',
      time: formatRelativeTime(c.created_at),
      avatar: initials(otherName),
      unread: Number(c.unread_count || 0) > 0,
    };
  });

  const handleExportListings = () => {
    const exportData = listings.map((l) => ({
      Title: l.title,
      District: l.district,
      Sector: l.sector,
      Price_RWF: l.price_rwf,
      Status: l.status,
      Views: l.view_count,
      Created_At: l.created_at,
    }));
    exportToCSV(exportData, 'My_Seller_Listings');
  };

  return (
    <div className="w-full min-w-0 space-y-6">
      {/* Seller Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#122844] via-[#1B395F] to-[#122844] p-6 sm:p-8 text-white shadow-xl border border-slate-800">
        <div className="absolute top-0 right-0 -translate-y-12 translate-x-12 w-96 h-96 bg-[#54B5BB]/20 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#54B5BB]/20 text-[#54B5BB] text-xs font-bold border border-[#54B5BB]/30 backdrop-blur-md">
              <span className="w-2 h-2 rounded-full bg-[#54B5BB] animate-pulse" /> Verified Seller Hub
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Welcome back, {user?.fullName?.split(' ')[0] || 'Partner'} 👋
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-xl leading-relaxed">
              Track viewer engagement, manage client lead stages, upload land deed documents, and publish new parcels.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <DashboardButton
              variant="outline"
              size="md"
              pill
              onClick={() => setIsVaultOpen(true)}
              icon={<FileText size={15} />}
              className="bg-white/10 text-white border-white/20 hover:bg-white/20 hover:text-white"
            >
              Document Vault
            </DashboardButton>

            <DashboardButton
              variant="outline"
              size="md"
              pill
              onClick={handleExportListings}
              icon={<Download size={15} />}
              className="bg-white/10 text-white border-white/20 hover:bg-white/20 hover:text-white"
            >
              Export CSV
            </DashboardButton>

            <DashboardButton
              variant="teal"
              size="md"
              pill
              onClick={() => navigate('/dashboard/properties/new')}
              icon={<Plus size={16} />}
            >
              + Add Property
            </DashboardButton>
          </div>
        </div>
      </div>

      {/* Main KPI Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 w-full min-w-0">
        <StatCard
          title="Total Properties"
          value={String(total)}
          icon={<Layers size={20} />}
          accentGradient="teal"
          change="+15.2%"
          comparisonLabel="portfolio count"
          onClick={() => {
            setStatusFilter('all');
            const el = document.getElementById('seller-listings-section');
            if (el) el.scrollIntoView({ behavior: 'smooth' });
          }}
        />
        <StatCard
          title="Live & Verified"
          value={String(approved)}
          icon={<CheckSquare size={20} />}
          accentGradient="emerald"
          comparisonLabel="active on site"
          onClick={() => {
            setStatusFilter('approved');
            const el = document.getElementById('seller-listings-section');
            if (el) el.scrollIntoView({ behavior: 'smooth' });
          }}
        />
        <StatCard
          title="Total Viewers"
          value={totalViews.toLocaleString()}
          icon={<Eye size={20} />}
          accentGradient="navy"
          change="+28.4%"
          comparisonLabel="client impressions"
        />
        <StatCard
          title="Active Leads"
          value={String(conversations.length)}
          icon={<MessageSquareText size={20} />}
          accentGradient="amber"
          badgeText={unread > 0 ? `${unread} unread` : undefined}
          comparisonLabel="buyer conversations"
          onClick={() => navigate('/dashboard/messages')}
        />
      </div>

      {/* Quick Land Valuation Estimator Tool */}
      <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-[0_2px_12px_-3px_rgba(0,0,0,0.04)]">
        <div className="flex items-center gap-2.5 mb-3">
          <div className="w-8 h-8 rounded-xl bg-teal-500/10 text-teal-600 dark:text-teal-400 flex items-center justify-center font-bold">
            <Calculator size={16} />
          </div>
          <div>
            <h2 className="text-sm font-extrabold text-slate-800 dark:text-white">
              Instant Land Price Estimator (Rwandan Market Rates)
            </h2>
            <p className="text-[11px] text-slate-400">
              Calculate estimated market listing values based on district cadastral benchmarks
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-center">
          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
              Select District
            </label>
            <select
              value={calcDistrict}
              onChange={(e) => setCalcDistrict(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold text-slate-800 dark:text-white focus:ring-2 focus:ring-[#54B5BB]"
            >
              {['Gasabo', 'Kicukiro', 'Nyarugenge', 'Bugesera', 'Rwamagana', 'Rubavu', 'Musanze', 'Huye', 'Muhanga'].map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
              Plot Size (Square Meters)
            </label>
            <input
              type="number"
              value={calcSqm}
              onChange={(e) => setCalcSqm(Number(e.target.value) || 0)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold text-slate-800 dark:text-white focus:ring-2 focus:ring-[#54B5BB]"
              min={50}
              step={50}
            />
          </div>

          <div className="p-3 rounded-2xl bg-teal-50/70 dark:bg-teal-950/30 border border-teal-200/70 dark:border-teal-800/40">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-teal-700 dark:text-teal-400 block">
              Estimated Market Value
            </span>
            <span className="text-base sm:text-lg font-black text-[#1B395F] dark:text-teal-300">
              {calcEstimatedPrice ? formatCurrency(calcEstimatedPrice) : '—'}
            </span>
          </div>
        </div>
      </div>

      {/* Direct Listing Access & Management Section */}
      <div id="seller-listings-section" className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-[0_2px_12px_-3px_rgba(0,0,0,0.04)] space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-extrabold text-slate-800 dark:text-white">
              My Property Listings
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Quickly manage, edit, and check approval states of your submitted land parcels
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {(['all', 'approved', 'pending', 'sold'] as const).map((st) => (
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
            placeholder="Search your listings by Title, District or Sector..."
            className="w-full pl-9 pr-4 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-white text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#54B5BB] shadow-xs"
          />
        </div>

        {/* Listings List */}
        <div className="divide-y divide-slate-100 dark:divide-slate-800 border border-slate-100 dark:border-slate-800 rounded-2xl overflow-hidden">
          {filteredListings.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-400 font-medium">
              No listings match your search criteria.
            </div>
          ) : (
            filteredListings.map((listing) => (
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
                    </div>
                    <div className="flex items-center gap-3 text-[11px] text-slate-500 dark:text-slate-400">
                      <span className="flex items-center gap-1">
                        <MapPin size={11} className="text-teal-500" />
                        {listing.sector}, {listing.district}
                      </span>
                      <span className="flex items-center gap-1">
                        <Eye size={11} /> {listing.view_count || 0} views
                      </span>
                      <span className="font-bold text-slate-700 dark:text-slate-300">
                        {priceLabel(listing)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                  <button
                    onClick={() => navigate(`/dashboard/properties/edit/${listing.id}`)}
                    className="px-3.5 py-1.5 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-extrabold flex items-center gap-1 cursor-pointer shadow-xs hover:shadow-sm hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200"
                  >
                    <Edit size={13} /> Edit
                  </button>

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
      </div>

      {/* Top Performing Listings & Messages Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full min-w-0">
        <TopPerformingList
          items={topListings}
          onViewAll={() => navigate('/dashboard/properties')}
        />
        <MessagesList
          messages={messages}
          onViewAll={() => navigate('/dashboard/messages')}
          onReply={(name) => setChatUser(name)}
        />
      </div>

      {/* Lead Pipeline Kanban */}
      <LeadKanban />

      {/* Featured Properties Grid */}
      {featured.length > 0 && (
        <FeaturedPropertiesGrid
          title="Your Featured Parcels"
          properties={featured}
          onViewAll={() => navigate('/dashboard/properties')}
          onCardClick={() => navigate('/dashboard/properties')}
        />
      )}

      {/* Vault Modal */}
      <DocumentVaultModal
        isOpen={isVaultOpen}
        onClose={() => setIsVaultOpen(false)}
        properties={listings.map((l) => ({ id: l.id, title: l.title }))}
      />

      {/* Interactive Chat Modal */}
      {chatUser && (
        <ChatModal
          isOpen={Boolean(chatUser)}
          onClose={() => setChatUser(null)}
          recipientName={chatUser}
        />
      )}
    </div>
  );
};
