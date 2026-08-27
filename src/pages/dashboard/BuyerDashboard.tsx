import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, MessageSquareText, Home, ArrowRightLeft, Calculator, Calendar, Heart, Eye, Sparkles, MapPin, Filter } from 'lucide-react';
import { StatCard } from '@/components/dashboard/StatCard';
import { MessagesList } from '@/components/dashboard/MessagesList';
import { PropertyCard } from '@/components/ui/Card';
import { PropertyCompareModal } from '@/components/dashboard/PropertyCompareModal';
import { MortgageCalculatorModal } from '@/components/dashboard/MortgageCalculatorModal';
import { SiteVisitModal } from '@/components/dashboard/SiteVisitModal';
import { DashboardButton } from '@/components/ui/DashboardButton';
import { useAuth } from '@/components/auth/AuthContext';
import * as messagesApi from '@/api/messages';
import * as listingsApi from '@/api/listings';
import { adaptListingSummary } from '@/utils/listingAdapters';
import type { Conversation } from '@/api/types';
import type { Property } from '@/types/property';
import { formatRelativeTime, initials } from '@/utils/format';

export const BuyerDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [allListings, setAllListings] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState<string>('all');

  // Modal states
  const [isCompareOpen, setIsCompareOpen] = useState(false);
  const [isMortgageOpen, setIsMortgageOpen] = useState(false);
  const [isVisitOpen, setIsVisitOpen] = useState(false);

  useEffect(() => {
    Promise.all([
      messagesApi.getInbox(),
      listingsApi.getPublicListings({ limit: 12 }),
    ])
      .then(([inboxRes, listingsRes]) => {
        setConversations(inboxRes?.conversations || []);
        setAllListings((listingsRes?.listings || []).map(adaptListingSummary));
      })
      .catch(() => {
        setConversations([]);
        setAllListings([]);
      })
      .finally(() => setLoading(false));
  }, []);

  const unread = (conversations || []).reduce((sum, c) => sum + Number(c.unread_count || 0), 0);
  const otherPartyName = (c: Conversation) => (c.sender_id === user?.id ? c.receiver_name : c.sender_name) || 'Seller';

  const filteredProperties = useMemo(() => {
    let list = allListings;
    if (selectedDistrict !== 'all') {
      list = list.filter((p) => (p.location?.district || '').toLowerCase() === selectedDistrict.toLowerCase());
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter((p) =>
        p.title.toLowerCase().includes(q) ||
        (p.location?.district || '').toLowerCase().includes(q) ||
        (p.location?.sector || '').toLowerCase().includes(q)
      );
    }
    return list;
  }, [allListings, selectedDistrict, searchQuery]);

  const messages = (conversations || []).slice(0, 5).map((c) => {
    const name = otherPartyName(c);
    return {
      name,
      message: c.body || '',
      time: formatRelativeTime(c.created_at),
      avatar: initials(name),
      unread: Number(c.unread_count || 0) > 0,
    };
  });

  const districts = ['all', 'Gasabo', 'Kicukiro', 'Nyarugenge', 'Bugesera', 'Rubavu', 'Musanze'];

  return (
    <div className="w-full min-w-0 space-y-6">
      {/* Buyer Hero Banner (Navy & Teal Gradient) */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#122844] via-[#1B395F] to-[#122844] p-6 sm:p-8 text-white shadow-xl border border-slate-800">
        <div className="absolute top-0 right-0 -translate-y-12 translate-x-12 w-96 h-96 bg-[#54B5BB]/20 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#54B5BB]/20 text-[#54B5BB] text-xs font-bold border border-[#54B5BB]/30 backdrop-blur-md">
              <span className="w-2 h-2 rounded-full bg-[#54B5BB] animate-pulse" /> Property Finder Portal
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Welcome back, {user?.fullName?.split(' ')[0] || 'Buyer'} 👋
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-xl leading-relaxed">
              Explore verified land parcels across Rwanda, estimate payments in RWF/USD, schedule on-site boundary visits, and negotiate directly with owners.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <DashboardButton
              variant="outline"
              size="md"
              pill
              onClick={() => setIsVisitOpen(true)}
              icon={<Calendar size={15} />}
              className="bg-white/10 text-white border-white/20 hover:bg-white/20 hover:text-white"
            >
              Schedule Visit
            </DashboardButton>

            <DashboardButton
              variant="outline"
              size="md"
              pill
              onClick={() => setIsCompareOpen(true)}
              icon={<ArrowRightLeft size={15} />}
              className="bg-white/10 text-white border-white/20 hover:bg-white/20 hover:text-white"
            >
              Compare Plots
            </DashboardButton>

            <DashboardButton
              variant="outline"
              size="md"
              pill
              onClick={() => setIsMortgageOpen(true)}
              icon={<Calculator size={15} />}
              className="bg-white/10 text-white border-white/20 hover:bg-white/20 hover:text-white"
            >
              Loan Estimator
            </DashboardButton>

            <DashboardButton
              variant="teal"
              size="md"
              pill
              onClick={() => navigate('/properties')}
              icon={<Search size={15} />}
            >
              Explore Plots
            </DashboardButton>
          </div>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 w-full min-w-0">
        <StatCard
          title="Active Inquiries"
          value={String(conversations.length)}
          accentGradient="teal"
          icon={<MessageSquareText size={20} />}
          onClick={() => navigate('/dashboard/messages')}
          comparisonLabel="seller chats"
        />
        <StatCard
          title="Unread Messages"
          value={String(unread)}
          changeType={unread > 0 ? 'positive' : 'neutral'}
          change={unread > 0 ? `${unread} new` : 'All read'}
          accentGradient="amber"
          icon={<MessageSquareText size={20} />}
          onClick={() => navigate('/dashboard/messages')}
          comparisonLabel="notifications"
        />
        <StatCard
          title="Saved Favorites"
          value="4"
          accentGradient="navy"
          icon={<Heart size={20} />}
          comparisonLabel="bookmarked plots"
          onClick={() => navigate('/dashboard/favorites')}
        />
      </div>

      {/* Main Grid: Latest Listings + Messages */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-[0_2px_12px_-3px_rgba(0,0,0,0.04)] overflow-hidden">
            <div className="p-5 border-b border-slate-100 dark:border-slate-800 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h2 className="text-base font-extrabold tracking-tight text-slate-800 dark:text-white">
                    Explore Rwandan Land Catalog
                  </h2>
                  <p className="text-xs text-slate-400">Newly approved parcels with cadastral titles</p>
                </div>
                <button
                  onClick={() => navigate('/properties')}
                  className="text-xs font-extrabold text-[#54B5BB] hover:text-[#439CA2] hover:underline cursor-pointer self-start sm:self-auto transition-colors"
                >
                  Browse Full Map →
                </button>
              </div>

              {/* Quick District Filter Chips */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                {districts.map((d) => (
                  <button
                    key={d}
                    onClick={() => setSelectedDistrict(d)}
                    className={`px-3.5 py-1.5 rounded-2xl text-xs font-extrabold whitespace-nowrap capitalize transition-all duration-200 cursor-pointer shadow-xs hover:-translate-y-0.5 active:translate-y-0 ${
                      selectedDistrict === d
                        ? 'bg-[#1B395F] text-white shadow-sm shadow-[#1B395F]/20'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 hover:text-[#1B395F]'
                    }`}
                  >
                    {d === 'all' ? 'All Districts' : d}
                  </button>
                ))}
              </div>

              {/* Search Bar */}
              <div className="relative">
                <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Filter by title, sector, or keywords (e.g. Nyarutarama, lake view, commercial)..."
                  className="w-full pl-9 pr-4 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-white text-xs font-semibold focus:ring-2 focus:ring-[#54B5BB] focus:outline-none shadow-xs"
                />
              </div>
            </div>

            {loading ? (
              <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                {Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-44 rounded-2xl bg-slate-100 dark:bg-slate-800 animate-pulse" />)}
              </div>
            ) : (filteredProperties || []).length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400 font-medium">
                No properties match your filter. Try choosing a different district or search query.
              </div>
            ) : (
              <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
                {(filteredProperties || []).slice(0, 6).map((property) => (
                  <PropertyCard key={property.id} property={property} size="sm" />
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <MessagesList messages={messages} onViewAll={() => navigate('/dashboard/messages')} />
        </div>
      </div>

      {/* Modals */}
      <PropertyCompareModal
        isOpen={isCompareOpen}
        onClose={() => setIsCompareOpen(false)}
        availableProperties={allListings}
      />
      <MortgageCalculatorModal isOpen={isMortgageOpen} onClose={() => setIsMortgageOpen(false)} />
      <SiteVisitModal isOpen={isVisitOpen} onClose={() => setIsVisitOpen(false)} />
    </div>
  );
};

export default BuyerDashboard;
