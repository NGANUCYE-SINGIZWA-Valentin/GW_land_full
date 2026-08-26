import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, MessageSquareText, Home, ArrowRightLeft, Calculator, Calendar } from 'lucide-react';
import { StatCard } from '@/components/dashboard/StatCard';
import { MessagesList } from '@/components/dashboard/MessagesList';
import { QuickActionsGrid } from '@/components/dashboard/QuickActionsGrid';
import { PropertyCard } from '@/components/ui/Card';
import { PropertyCompareModal } from '@/components/dashboard/PropertyCompareModal';
import { MortgageCalculatorModal } from '@/components/dashboard/MortgageCalculatorModal';
import { SiteVisitModal } from '@/components/dashboard/SiteVisitModal';
import { useAuth } from '@/components/auth/AuthContext';
import * as messagesApi from '@/api/messages';
import * as listingsApi from '@/api/listings';
import { adaptListingSummary } from '@/utils/listingAdapters';
import type { Conversation } from '@/api/types';
import type { Property } from '@/types/property';
import { formatRelativeTime, initials } from '@/utils/format';

const BUYER_ACTIONS = [
  { label: 'Browse Properties', icon: <Search size={15} /> },
  { label: 'My Messages', icon: <MessageSquareText size={15} /> },
];

export const BuyerDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [latest, setLatest] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal states
  const [isCompareOpen, setIsCompareOpen] = useState(false);
  const [isMortgageOpen, setIsMortgageOpen] = useState(false);
  const [isVisitOpen, setIsVisitOpen] = useState(false);

  useEffect(() => {
    Promise.all([
      messagesApi.getInbox(),
      listingsApi.getPublicListings({ limit: 4 }),
    ])
      .then(([inboxRes, listingsRes]) => {
        setConversations(inboxRes.conversations);
        setLatest(listingsRes.listings.map(adaptListingSummary));
      })
      .finally(() => setLoading(false));
  }, []);

  const unread = conversations.reduce((sum, c) => sum + Number(c.unread_count || 0), 0);
  const otherPartyName = (c: Conversation) => (c.sender_id === user?.id ? c.receiver_name : c.sender_name);

  const messages = conversations.slice(0, 5).map((c) => {
    const name = otherPartyName(c);
    return {
      name,
      message: c.body,
      time: formatRelativeTime(c.created_at),
      avatar: initials(name),
      unread: Number(c.unread_count || 0) > 0,
    };
  });

  return (
    <div className="w-full min-w-0 space-y-6">
      {/* Buyer Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 p-6 sm:p-8 text-white shadow-xl border border-slate-800">
        <div className="absolute top-0 right-0 -translate-y-12 translate-x-12 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-semibold border border-blue-500/30">
              <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" /> Property Finder Portal
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              Welcome back, {user?.fullName?.split(' ')[0]} 👋
            </h1>
            <p className="text-sm text-slate-300 max-w-xl">
              Discover verified land plots, view price comparisons in RWF & USD, and connect with trusted sellers.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setIsVisitOpen(true)}
              className="px-4 py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white text-xs font-extrabold border border-white/20 transition-all cursor-pointer flex items-center gap-1.5 backdrop-blur-md"
            >
              <Calendar size={15} /> Schedule Site Visit
            </button>

            <button
              onClick={() => setIsCompareOpen(true)}
              className="px-4 py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white text-xs font-extrabold border border-white/20 transition-all cursor-pointer flex items-center gap-1.5 backdrop-blur-md"
            >
              <ArrowRightLeft size={15} /> Compare Plots
            </button>

            <button
              onClick={() => setIsMortgageOpen(true)}
              className="px-4 py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white text-xs font-extrabold border border-white/20 transition-all cursor-pointer flex items-center gap-1.5 backdrop-blur-md"
            >
              <Calculator size={15} /> Loan Estimator
            </button>

            <button
              onClick={() => navigate('/properties')}
              className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white text-xs font-extrabold shadow-lg shadow-blue-500/25 transition-all hover:scale-105 active:scale-95 cursor-pointer flex items-center gap-1.5"
            >
              <Search size={15} /> Explore All Plots
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-xl">
        <StatCard title="Active Conversations" value={String(conversations.length)} accentGradient="indigo" icon={<MessageSquareText size={20} />} onClick={() => navigate('/messages')} />
        <StatCard title="Unread Messages" value={String(unread)} changeType={unread > 0 ? 'positive' : 'neutral'} change={unread > 0 ? `${unread} unread` : 'Read all'} accentGradient="cyan" icon={<MessageSquareText size={20} />} onClick={() => navigate('/messages')} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
            <div className="flex justify-between items-center p-4 sm:p-6 border-b border-slate-100 dark:border-slate-800">
              <h2 className="text-sm sm:text-base font-extrabold tracking-tight text-slate-800 dark:text-white">Newest Land Listings</h2>
              <button onClick={() => navigate('/properties')} className="text-xs font-bold text-brand-primary hover:underline cursor-pointer">Browse All</button>
            </div>
            {loading ? (
              <div className="p-6 grid grid-cols-2 gap-4">
                {Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-40 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse" />)}
              </div>
            ) : latest.length === 0 ? (
              <div className="p-6 text-sm text-slate-400">No listings available yet — check back soon.</div>
            ) : (
              <div className="p-4 sm:p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                {latest.map((property) => (
                  <PropertyCard key={property.id} property={property} size="sm" />
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <MessagesList
            messages={messages}
            onViewAll={() => navigate('/messages')}
          />

          <QuickActionsGrid
            actions={BUYER_ACTIONS}
            onActionClick={(index) => {
              const routes = [
                () => navigate('/properties'),
                () => navigate('/messages'),
              ];
              routes[index]();
            }}
          />

          <div className="bg-brand-primary rounded-2xl p-6 text-white flex flex-col gap-3">
            <Home size={24} className="opacity-80" />
            <p className="text-sm font-semibold leading-relaxed">
              Ready to find your next plot? Browse verified listings across every district in Rwanda.
            </p>
            <button
              onClick={() => navigate('/properties')}
              className="self-start bg-white text-brand-primary text-xs font-bold px-4 py-2 rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
            >
              Browse Properties
            </button>
          </div>
        </div>
      </div>

      {/* Modals */}
      <PropertyCompareModal
        isOpen={isCompareOpen}
        onClose={() => setIsCompareOpen(false)}
        availableProperties={latest}
      />

      <MortgageCalculatorModal
        isOpen={isMortgageOpen}
        onClose={() => setIsMortgageOpen(false)}
      />

      <SiteVisitModal
        isOpen={isVisitOpen}
        onClose={() => setIsVisitOpen(false)}
        property={latest[0] || null}
      />
    </div>
  );
};
