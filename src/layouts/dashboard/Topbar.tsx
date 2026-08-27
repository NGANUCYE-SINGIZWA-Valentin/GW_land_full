import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Bell, LogOut, MessageCircle, ChevronDown, CheckCheck,
  Building2, MessageSquare,
  PlusCircle, Store, Flag, Trophy, TrendingUp, Tag, Heart,
  Menu, Settings, PanelLeftClose, PanelLeftOpen,
  Search, ExternalLink, Compass, ShieldCheck
} from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { useAuth } from '@/components/auth/AuthContext';
import { useCurrency } from '@/context/CurrencyContext';
import { Avatar } from '@/components/ui/Avatar';
import GWLandLogo from '@/components/ui/GWLandLogo';
import { Tooltip } from '@/components/ui/Tooltip';
import * as messagesApi from '@/api/messages';
import * as adminApi from '@/api/admin';
import type { AdminNotification } from '@/api/types';
import { formatRelativeTime } from '@/utils/format';

/* ─── util: close on outside click ──────────────────────────── */
function useClickOutside(ref: React.RefObject<HTMLElement | null>, cb: () => void) {
  useEffect(() => {
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) cb(); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, [ref, cb]);
}

function getRoleMeta(role: string) {
  const map: Record<string, { label: string; dot: string; pill: string; badge: string }> = {
    Administrator: { label: 'Admin Portal', dot: 'bg-[#54B5BB]', pill: 'bg-[#1B395F]/10 text-[#1B395F] border-[#1B395F]/20', badge: 'Admin' },
    SubAdmin:      { label: 'Sub-Admin Portal', dot: 'bg-purple-400', pill: 'bg-purple-50 text-purple-700 border-purple-200', badge: 'Moderator' },
    Seller:        { label: 'Seller Portal', dot: 'bg-[#54B5BB]', pill: 'bg-[#54B5BB]/10 text-[#1B395F] border-[#54B5BB]/30', badge: 'Seller/Agent' },
    Buyer:         { label: 'Buyer Portal', dot: 'bg-blue-400', pill: 'bg-blue-50 text-blue-700 border-blue-200', badge: 'Buyer' },
  };
  return map[role] ?? { label: role, dot: 'bg-slate-400', pill: 'bg-slate-100 text-slate-600 border-slate-200', badge: role };
}

function getBreadcrumb(pathname: string): { section: string; page: string } {
  if (pathname.startsWith('/admin/dashboard') || pathname.startsWith('/admin/sub-dashboard')) return { section: 'Administration', page: 'Overview' };
  if (pathname.startsWith('/admin/properties')) return { section: 'Registry', page: 'Properties & UPI Review' };
  if (pathname.startsWith('/admin/users')) return { section: 'Access Control', page: 'User Accounts' };
  if (pathname.startsWith('/admin/revenue')) return { section: 'Finance', page: 'Revenue & Plans' };
  if (pathname.startsWith('/admin/reported-content')) return { section: 'Trust & Safety', page: 'Disputes & Reports' };
  if (pathname.startsWith('/admin/top-agents')) return { section: 'Directory', page: 'Top Performing Agents' };
  if (pathname.startsWith('/admin/audit-logs')) return { section: 'Security', page: 'Audit Trail & Logs' };
  if (pathname.startsWith('/admin/messages')) return { section: 'Communications', page: 'Admin Messages' };
  if (pathname.startsWith('/admin/settings')) return { section: 'System', page: 'Platform Settings' };
  
  if (pathname.startsWith('/seller/dashboard')) return { section: 'Seller Hub', page: 'Dashboard Overview' };
  if (pathname.startsWith('/seller/properties')) return { section: 'Portfolios', page: 'My Land Listings' };
  if (pathname.startsWith('/dashboard/properties/new')) return { section: 'Publishing', page: 'Add Land Parcel' };
  if (pathname.startsWith('/seller/inquiries')) return { section: 'Leads', page: 'Buyer Inquiries' };
  if (pathname.startsWith('/seller/top-performing')) return { section: 'Analytics', page: 'Top Performing Listings' };
  if (pathname.startsWith('/seller/pricing')) return { section: 'Monetization', page: 'Boosts & Pricing' };
  
  if (pathname.startsWith('/dashboard')) return { section: 'Buyer Hub', page: 'Marketplace Overview' };
  if (pathname.startsWith('/favorites')) return { section: 'Saved', page: 'Favorite Properties' };
  if (pathname.startsWith('/messages')) return { section: 'Inquiries', page: 'Seller Conversations' };
  if (pathname.startsWith('/account')) return { section: 'Profile', page: 'Account Settings' };
  
  return { section: 'Dashboard', page: 'Overview' };
}

/* ─── dropdown animation ─────────────────────────────────────── */
const dropdownV = {
  hidden: { opacity: 0, scale: 0.94, y: -8 },
  visible: { opacity: 1, scale: 1, y: 0, transition: { type: 'spring' as const, damping: 22, stiffness: 320 } },
  exit:   { opacity: 0, scale: 0.94, y: -8, transition: { duration: 0.15 } },
};

export interface TopbarProps {
  onToggleMobileSidebar?: () => void;
  onToggleCollapseSidebar?: () => void;
  isSidebarCollapsed?: boolean;
}

/* ─── component ──────────────────────────────────────────────── */
export const Topbar: React.FC<TopbarProps> = ({
  onToggleMobileSidebar,
  onToggleCollapseSidebar,
  isSidebarCollapsed = false,
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const { currency, setCurrency } = useCurrency();
  const role = user?.role ?? '';
  const roleMeta = getRoleMeta(role);
  const breadcrumb = getBreadcrumb(location.pathname);

  const isSeller    = role === 'Seller';
  const isBuyer     = role === 'Buyer';
  const isAdminLike = role === 'Administrator' || role === 'SubAdmin';

  const [unreadMessages, setUnreadMessages] = useState(0);
  const [notifications,  setNotifications]  = useState<AdminNotification[]>([]);
  const [notifOpen,   setNotifOpen]   = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const notifRef   = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);
  useClickOutside(notifRef,   () => setNotifOpen(false));
  useClickOutside(profileRef, () => setProfileOpen(false));

  useEffect(() => {
    let cancelled = false;
    const load = () => {
      if (isSeller || isBuyer) {
        messagesApi.getUnreadCount().then(r => !cancelled && setUnreadMessages(Number(r?.unread_count || 0))).catch(() => {});
      } else if (isAdminLike) {
        adminApi.getNotifications().then(r => !cancelled && setNotifications(Array.isArray(r?.notifications) ? r.notifications : [])).catch(() => {});
      }
    };
    load();
    const iv = setInterval(load, 30_000);
    return () => { cancelled = true; clearInterval(iv); };
  }, [isSeller, isBuyer, isAdminLike]);

  const unreadNotif = (notifications || []).filter(n => !n?.is_read).length;

  const handleNotifClick = async (n: AdminNotification) => {
    if (!n?.is_read) {
      try {
        await adminApi.markNotificationRead(n.id);
        setNotifications(prev => (prev || []).map(x => x.id === n.id ? { ...x, is_read: true } : x));
      } catch { /* non-critical */ }
    }
    setNotifOpen(false);
    if (n.type === 'new_listing') navigate('/admin/properties');
    else if (n.type === 'new_user') navigate('/admin/users');
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    if (isAdminLike) {
      navigate(`/admin/properties?q=${encodeURIComponent(searchQuery.trim())}`);
    } else if (isSeller) {
      navigate(`/seller/properties?q=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate(`/properties?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  /* ── render ── */
  return (
    <header className="shrink-0 z-30 bg-white border-b border-slate-200/80 shadow-xs w-full max-w-[100vw]">

      {/* ═══ Main bar ═══ */}
      <div className="flex items-center justify-between gap-3 h-16 px-3 sm:px-5 lg:px-6 min-w-0 max-w-full">

        {/* ── Left section: Sidebar toggles & Breadcrumbs ── */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
          {/* Mobile menu trigger */}
          <button
            onClick={onToggleMobileSidebar}
            className="lg:hidden p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-all mr-0.5 cursor-pointer"
            aria-label="Toggle navigation menu"
          >
            <Menu size={20} />
          </button>

          {/* Logo (shown on mobile or when standalone) */}
          <Link to="/" className="flex items-center gap-2 flex-shrink-0 group mr-2 lg:hidden">
            <GWLandLogo className="h-7 w-auto flex-shrink-0" />
            <span className="text-base font-black tracking-tight" style={{ color: '#1B395F' }}>
              GW<span style={{ color: '#54B5BB' }}>LAND</span>
            </span>
          </Link>

          {/* Desktop Sidebar Collapse Button */}
          {onToggleCollapseSidebar && (
            <div className="hidden lg:flex items-center">
              <Tooltip
                content={isSidebarCollapsed ? 'Expand navigation sidebar' : 'Collapse navigation sidebar (Icon only)'}
                position="right"
                variant="dark"
              >
                <button
                  type="button"
                  onClick={onToggleCollapseSidebar}
                  className="p-2 text-slate-400 hover:text-[#1B395F] hover:bg-slate-100 rounded-xl transition-all cursor-pointer"
                  aria-label="Toggle sidebar width"
                >
                  {isSidebarCollapsed ? <PanelLeftOpen size={18} /> : <PanelLeftClose size={18} />}
                </button>
              </Tooltip>
            </div>
          )}

          {/* Breadcrumbs / Page context */}
          <div className="hidden sm:flex items-center gap-2 min-w-0 border-l border-slate-200 pl-3">
            <span className="text-xs font-semibold text-slate-400 truncate">
              {breadcrumb.section}
            </span>
            <span className="text-slate-300 text-xs">/</span>
            <span className="text-xs font-extrabold text-slate-800 truncate" style={{ color: '#1B395F' }}>
              {breadcrumb.page}
            </span>
          </div>

          {/* Quick Search Bar */}
          <form onSubmit={handleSearchSubmit} className="hidden md:flex items-center relative max-w-xs lg:max-w-sm w-full ml-2">
            <Search size={14} className="absolute left-3 text-slate-400 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={
                isAdminLike ? 'Search UPI, listings, users...' :
                isSeller ? 'Search your properties, UPI...' : 'Search verified land across Rwanda...'
              }
              className="w-full pl-8 pr-3 py-1.5 bg-slate-50 hover:bg-slate-100/80 focus:bg-white text-xs font-medium text-slate-800 placeholder-slate-400 rounded-full border border-slate-200 focus:border-[#54B5BB] focus:ring-2 focus:ring-[#54B5BB]/20 transition-all outline-none"
            />
          </form>
        </div>

        {/* ── Right utilities ── */}
        <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">

          {/* Primary Quick Action Button */}
          {isSeller && (
            <Link
              to="/dashboard/properties/new"
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold text-white shadow-sm hover:opacity-95 transition-all"
              style={{ background: 'linear-gradient(135deg, #1B395F 0%, #54B5BB 100%)' }}
            >
              <PlusCircle size={14} />
              <span>Add Property</span>
            </Link>
          )}

          {isBuyer && (
            <Link
              to="/properties"
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold text-white shadow-sm hover:opacity-95 transition-all"
              style={{ background: 'linear-gradient(135deg, #1B395F 0%, #54B5BB 100%)' }}
            >
              <Compass size={14} />
              <span>Browse Parcels</span>
            </Link>
          )}

          {/* Role badge */}
          <span className={`hidden xl:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border flex-shrink-0 ${roleMeta.pill}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${roleMeta.dot} animate-pulse`} />
            {roleMeta.badge}
          </span>

          {/* Unread message bubble */}
          {(isSeller || isBuyer) && (
            <Tooltip content={unreadMessages > 0 ? `${unreadMessages} unread messages` : 'Messages'} position="bottom" variant="dark">
              <button
                onClick={() => navigate(isSeller ? '/seller/inquiries' : '/messages')}
                className="relative p-2 text-slate-400 hover:text-[#1B395F] hover:bg-[#1B395F]/8 rounded-xl transition-all cursor-pointer"
                aria-label="Messages"
              >
                <MessageCircle size={19} />
                {unreadMessages > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-[16px]">
                    <span className="motion-safe:animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
                    <span className="relative inline-flex h-4 min-w-[16px] items-center justify-center rounded-full bg-rose-500 px-1 text-[9px] font-extrabold text-white">
                      {unreadMessages > 9 ? '9+' : unreadMessages}
                    </span>
                  </span>
                )}
              </button>
            </Tooltip>
          )}

          {/* Notification bell (admin) */}
          {isAdminLike && (
            <div className="relative" ref={notifRef}>
              <Tooltip content="System Notifications" position="bottom" variant="dark">
                <button
                  onClick={() => setNotifOpen(v => !v)}
                  className="relative p-2 text-slate-400 hover:text-[#1B395F] hover:bg-[#1B395F]/8 rounded-xl transition-all cursor-pointer"
                  aria-label="Notifications"
                >
                  <Bell size={19} />
                  {unreadNotif > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-[16px]">
                      <span className="motion-safe:animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ background: '#54B5BB' }} />
                      <span className="relative inline-flex h-4 min-w-[16px] items-center justify-center rounded-full px-1 text-[9px] font-extrabold text-white" style={{ background: '#1B395F' }}>
                        {unreadNotif > 9 ? '9+' : unreadNotif}
                      </span>
                    </span>
                  )}
                </button>
              </Tooltip>

              <AnimatePresence>
                {notifOpen && (
                  <motion.div variants={dropdownV} initial="hidden" animate="visible" exit="exit"
                    className="absolute right-0 top-full mt-3 w-80 max-w-[90vw] bg-white shadow-2xl shadow-slate-900/10 border border-slate-200/80 rounded-3xl z-50 overflow-hidden"
                  >
                    <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between"
                      style={{ background: 'linear-gradient(135deg, #f8fafc 0%, rgba(84,181,187,0.08) 100%)' }}>
                      <span className="text-xs font-extrabold uppercase tracking-widest" style={{ color: '#1B395F' }}>Notifications</span>
                      {unreadNotif > 0 && (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold border"
                          style={{ background: 'rgba(27,57,95,0.08)', color: '#1B395F', borderColor: 'rgba(27,57,95,0.15)' }}>
                          {unreadNotif} new
                        </span>
                      )}
                    </div>
                    <div className="max-h-72 overflow-y-auto custom-scrollbar">
                      {(notifications || []).length === 0 ? (
                        <div className="px-4 py-10 text-center">
                          <div className="w-10 h-10 rounded-2xl flex items-center justify-center mx-auto mb-3"
                            style={{ background: 'rgba(84,181,187,0.12)', color: '#54B5BB' }}>
                            <CheckCheck size={20} />
                          </div>
                          <p className="text-sm font-semibold text-slate-500">All caught up!</p>
                        </div>
                      ) : (notifications || []).slice(0, 8).map(n => (
                        <button key={n.id} onClick={() => handleNotifClick(n)}
                          className={`w-full text-left px-5 py-3.5 border-b border-slate-50 last:border-0 flex items-start gap-3 transition-colors hover:bg-slate-50 ${!n.is_read ? 'bg-blue-50/40' : ''}`}
                        >
                          <span className={`mt-2 w-2 h-2 rounded-full flex-shrink-0 ${!n.is_read ? 'animate-pulse' : 'bg-slate-300'}`}
                            style={!n.is_read ? { background: '#54B5BB' } : {}} />
                          <span className="min-w-0 flex-1">
                            <span className="block text-xs font-semibold text-slate-800 leading-snug">{n.message}</span>
                            <span className="block text-[10px] text-slate-400 mt-1">{formatRelativeTime(n.created_at)}</span>
                          </span>
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}

          {/* Currency Switcher */}
          <div className="relative">
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value as any)}
              className="px-2.5 py-1.5 text-xs font-extrabold rounded-full bg-slate-100 hover:bg-slate-200/80 border border-slate-200 text-slate-700 focus:outline-none transition-all cursor-pointer"
              title="Change Display Currency"
            >
              <option value="RWF">RWF (Frw)</option>
              <option value="USD">USD ($)</option>
              <option value="EUR">EUR (€)</option>
              <option value="GBP">GBP (£)</option>
            </select>
          </div>

          {/* Public Site Link */}
          <Tooltip content="Open Public Marketplace" position="bottom" variant="dark">
            <Link
              to="/"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden md:flex p-2 text-slate-400 hover:text-[#1B395F] hover:bg-slate-100 rounded-xl transition-all cursor-pointer"
            >
              <ExternalLink size={17} />
            </Link>
          </Tooltip>

          {/* Divider */}
          <div className="h-6 w-px bg-slate-200 mx-1" />

          {/* Avatar + profile dropdown */}
          <div className="relative z-50" ref={profileRef}>
            <button
              onClick={() => setProfileOpen(v => !v)}
              className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-full border border-transparent hover:border-slate-200 hover:bg-slate-50 transition-all group cursor-pointer"
            >
              <Avatar src={user?.photoUrl} name={user?.fullName ?? 'User'} size="sm" />
              <div className="hidden sm:flex flex-col items-start min-w-0 max-w-[110px]">
                <span className="text-[12px] font-extrabold truncate leading-tight transition-colors group-hover:text-[#1B395F]" style={{ color: '#1B395F' }}>
                  {user?.fullName ?? 'User'}
                </span>
                <span className="text-[10px] font-medium text-slate-400 truncate">{roleMeta.badge}</span>
              </div>
              <ChevronDown size={13} className={`text-slate-400 transition-transform hidden sm:block ${profileOpen ? 'rotate-180' : ''}`} />
            </button>

            <AnimatePresence>
              {profileOpen && (
                <motion.div variants={dropdownV} initial="hidden" animate="visible" exit="exit"
                  className="absolute right-0 top-full mt-3 w-58 bg-white shadow-2xl shadow-slate-900/15 border border-slate-200/80 rounded-3xl z-50 overflow-hidden"
                  style={{ minWidth: '220px' }}
                >
                  {/* Header */}
                  <div className="px-4 py-4 border-b border-slate-100"
                    style={{ background: 'linear-gradient(135deg, rgba(27,57,95,0.06) 0%, rgba(84,181,187,0.06) 100%)' }}>
                    <div className="flex items-center gap-2.5">
                      <Avatar src={user?.photoUrl} name={user?.fullName ?? 'User'} size="md" />
                      <div className="min-w-0">
                        <p className="text-sm font-extrabold truncate" style={{ color: '#1B395F' }}>{user?.fullName}</p>
                        <p className="text-[11px] text-slate-500 truncate">{user?.email}</p>
                        <span className={`inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${roleMeta.pill}`}>
                          {roleMeta.label}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="py-2 px-2 space-y-0.5">
                    <button
                      onClick={() => { setProfileOpen(false); navigate('/account'); }}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-all text-left cursor-pointer"
                    >
                      <div className="p-1.5 rounded-lg bg-slate-100 text-slate-500 flex-shrink-0">
                        <Settings size={13} />
                      </div>
                      Account Settings
                    </button>
                    <button
                      onClick={() => { setProfileOpen(false); logout(); navigate('/login', { replace: true }); }}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-rose-600 hover:bg-rose-50 transition-all text-left cursor-pointer"
                    >
                      <div className="p-1.5 rounded-lg bg-rose-50 text-rose-500 flex-shrink-0">
                        <LogOut size={13} />
                      </div>
                      Sign Out
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Topbar;
