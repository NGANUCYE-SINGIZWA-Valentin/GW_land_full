import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Layers, CheckSquare, Eye,
  Plus, Edit,
  Target, MessageSquareText, Home, FileText, Download
} from 'lucide-react';
import { StatCard } from '@/components/dashboard/StatCard';
import { QuickActionsGrid } from '@/components/dashboard/QuickActionsGrid';
import { FeaturedPropertiesGrid } from '@/components/dashboard/FeaturedPropertiesGrid';
import { MessagesList } from '@/components/dashboard/MessagesList';
import { TopPerformingList } from '@/components/dashboard/TopPerformingList';
import { LeadKanban } from '@/components/dashboard/LeadKanban';
import { DocumentVaultModal } from '@/components/dashboard/DocumentVaultModal';
import { ChatModal } from '@/components/dashboard/ChatModal';
import { exportToCSV } from '@/utils/ExportUtility';
import { useAuth } from '@/components/auth/AuthContext';
import * as listingsApi from '@/api/listings';
import * as messagesApi from '@/api/messages';
import type { MyListing, Conversation } from '@/api/types';
import { formatRelativeTime, initials } from '@/utils/format';

const SELLER_ACTIONS = [
  { label: 'Add Listing', icon: <Plus size={15} /> },
  { label: 'Edit Listings', icon: <Edit size={15} /> },
  { label: 'View Messages', icon: <MessageSquareText size={15} /> },
  { label: 'Promote Property', icon: <Target size={15} /> },
];

const priceLabel = (l: MyListing) =>
  l.price_rwf ? `RWF ${Number(l.price_rwf).toLocaleString()}` : l.price_usd ? `USD ${Number(l.price_usd).toLocaleString()}` : 'Price on request';

export const SellerDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [listings, setListings] = useState<MyListing[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [isVaultOpen, setIsVaultOpen] = useState(false);
  const [chatUser, setChatUser] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([listingsApi.getMyListings(), messagesApi.getInbox()])
      .then(([listingsRes, inboxRes]) => {
        setListings(listingsRes.listings);
        setConversations(inboxRes.conversations);
      })
      .finally(() => setLoading(false));
  }, []);

  const total = listings.length;
  const approved = listings.filter((l) => l.status === 'approved').length;
  const sold = listings.filter((l) => l.status === 'sold').length;
  const totalViews = listings.reduce((sum, l) => sum + l.view_count, 0);
  const unread = conversations.reduce((sum, c) => sum + Number(c.unread_count || 0), 0);

  const recentListings = [...listings]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 5);

  const topListings = [...listings]
    .sort((a, b) => b.view_count - a.view_count)
    .slice(0, 4)
    .map((l) => ({ name: l.title, views: l.view_count }));

  const featured = listings
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

  const messages = conversations.slice(0, 5).map((c) => {
    const otherName = c.sender_id === user?.id ? c.receiver_name : c.sender_name;
    return {
      name: otherName,
      message: c.body,
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
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-teal-950 to-slate-900 p-6 sm:p-8 text-white shadow-xl border border-slate-800">
        <div className="absolute top-0 right-0 -translate-y-12 translate-x-12 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/20 text-teal-300 text-xs font-semibold border border-teal-500/30">
              <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse" /> Seller Command Center
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              Welcome back, {user?.fullName?.split(' ')[0]} 👋
            </h1>
            <p className="text-sm text-slate-300 max-w-xl">
              Track view counts, manage your lead pipeline, upload land title documents, and manage listings.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setIsVaultOpen(true)}
              className="px-4 py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white text-xs font-extrabold border border-white/20 transition-all cursor-pointer flex items-center gap-1.5 backdrop-blur-md"
            >
              <FileText size={15} /> Document Vault
            </button>

            <button
              onClick={handleExportListings}
              className="px-4 py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white text-xs font-extrabold border border-white/20 transition-all cursor-pointer flex items-center gap-1.5 backdrop-blur-md"
            >
              <Download size={15} /> Export CSV
            </button>

            <button
              onClick={() => navigate('/dashboard/properties/new')}
              className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-600 hover:to-emerald-700 text-white text-xs font-extrabold shadow-lg shadow-teal-500/25 transition-all hover:scale-105 active:scale-95 cursor-pointer flex items-center gap-1.5"
            >
              <Plus size={16} /> Add New Listing
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4 w-full min-w-0">
        <StatCard title="Total Listings" value={String(total)} accentGradient="indigo" icon={<Layers size={20} />} onClick={() => navigate('/seller/properties')} />
        <StatCard title="Live Listings" value={String(approved)} accentGradient="emerald" icon={<CheckSquare size={20} />} onClick={() => navigate('/seller/properties')} />
        <StatCard title="Total Views" value={totalViews.toLocaleString()} accentGradient="cyan" icon={<Eye size={20} />} />
        <StatCard title="Unread Messages" value={String(unread)} changeType={unread > 0 ? 'positive' : 'neutral'} change={unread > 0 ? `${unread} new` : 'Caught up'} accentGradient="amber" icon={<MessageSquareText size={20} />} onClick={() => navigate('/seller/inquiries')} />
        <StatCard title="Sold Listings" value={String(sold)} accentGradient="purple" icon={<Home size={20} />} onClick={() => navigate('/seller/properties')} />
      </div>

      {/* Lead Management Kanban Section */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
        <LeadKanban onOpenChatModal={(name) => setChatUser(name)} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 w-full min-w-0 items-start">
        <div className="lg:col-span-2 space-y-6 w-full min-w-0">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden w-full min-w-0">
            <div className="flex justify-between items-center p-4 sm:p-6 border-b border-slate-100 dark:border-slate-800">
              <h2 className="text-sm sm:text-base font-extrabold tracking-tight antialiased text-slate-800 dark:text-white">My Listings</h2>
              <button onClick={() => navigate('/seller/properties')} className="text-xs font-bold text-brand-primary hover:underline cursor-pointer">Manage All</button>
            </div>
            {loading ? (
              <div className="p-6 text-sm text-slate-400">Loading…</div>
            ) : recentListings.length === 0 ? (
              <div className="p-6 text-sm text-slate-400">You haven't listed any land yet.</div>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {recentListings.map((l) => (
                  <div key={l.id} className="flex items-center gap-3 p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <img src={l.cover_image || '/assets/images/gw-homes-og.png'} alt="" className="w-10 h-10 rounded-xl object-cover flex-shrink-0" />
                    <div className="flex flex-col min-w-0 flex-1">
                      <span className="text-sm font-bold text-slate-800 dark:text-white truncate">{l.title}</span>
                      <span className="text-xs text-slate-400 truncate">{l.sector}, {l.district}</span>
                    </div>
                    <span className="text-sm font-semibold text-slate-700 dark:text-slate-300 whitespace-nowrap">{priceLabel(l)}</span>
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-lg whitespace-nowrap ${
                      l.status === 'approved' ? 'bg-emerald-50 text-emerald-600' :
                      l.status === 'pending' ? 'bg-amber-50 text-amber-600' :
                      l.status === 'sold' ? 'bg-blue-50 text-blue-600' : 'bg-red-50 text-red-600'
                    }`}>
                      {l.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6 w-full min-w-0">
          <MessagesList
            messages={messages}
            onViewAll={() => navigate('/seller/inquiries')}
            onMessageClick={() => navigate('/seller/inquiries')}
          />

          <TopPerformingList
            items={topListings}
            onViewAll={() => navigate('/seller/top-performing')}
          />

          <QuickActionsGrid
            actions={SELLER_ACTIONS}
            onActionClick={(index) => {
              const routes = [
                () => navigate('/dashboard/properties/new'),
                () => navigate('/seller/properties'),
                () => navigate('/seller/inquiries'),
                () => navigate('/seller/pricing'),
              ];
              routes[index]();
            }}
          />
        </div>
      </div>

      {featured.length > 0 && (
        <FeaturedPropertiesGrid
          title="My Featured Properties"
          properties={featured}
          onViewAll={() => navigate('/seller/properties')}
          onCardClick={() => navigate('/seller/properties')}
        />
      )}

      {/* Document Vault Modal */}
      <DocumentVaultModal
        isOpen={isVaultOpen}
        onClose={() => setIsVaultOpen(false)}
      />

      {/* Chat Modal */}
      {chatUser && (
        <ChatModal
          isOpen={!!chatUser}
          onClose={() => setChatUser(null)}
          recipientName={chatUser}
        />
      )}
    </div>
  );
};
