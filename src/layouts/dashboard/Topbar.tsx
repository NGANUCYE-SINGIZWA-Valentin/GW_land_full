import React, { useEffect, useRef, useState } from 'react';
import { Settings } from 'lucide-react';
import { NavLink, useNavigate, Link } from 'react-router-dom';
import {
  Bell, LogOut, MessageCircle, ChevronDown, CheckCheck,
  LayoutDashboard, Users, Building2, Wallet, MessageSquare,
  PlusCircle, Store, Flag, Trophy, TrendingUp, Tag, Heart,
  Menu, X
} from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { useAuth } from '@/components/auth/AuthContext';
import { useCurrency } from '@/context/CurrencyContext';
import { Avatar } from '@/components/ui/Avatar';
import GWLandLogo from '@/components/ui/GWLandLogo';
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

/* ─── nav items per role ─────────────────────────────────────── */
interface NavItem { icon: React.ReactNode; label: string; to: string }

function getNavItems(role: string): NavItem[] {
  switch (role) {
    case 'Administrator':
      return [
        { icon: <LayoutDashboard size={15} />, label: 'Dashboard', to: '/admin/dashboard' },
        { icon: <Users size={15} />, label: 'Users', to: '/admin/users' },
        { icon: <Building2 size={15} />, label: 'Properties', to: '/admin/properties' },
        { icon: <Wallet size={15} />, label: 'Revenue', to: '/admin/revenue' },
        { icon: <MessageSquare size={15} />, label: 'Messages', to: '/admin/messages' },
        { icon: <Flag size={15} />, label: 'Reports', to: '/admin/reported-content' },
        { icon: <Trophy size={15} />, label: 'Top Agents', to: '/admin/top-agents' },
        { icon: <CheckCheck size={15} />, label: 'Audit Trail', to: '/admin/audit-logs' },
      ];
    case 'SubAdmin':
      return [
        { icon: <LayoutDashboard size={15} />, label: 'Dashboard', to: '/admin/sub-dashboard' },
        { icon: <Users size={15} />, label: 'Users', to: '/admin/users' },
        { icon: <Building2 size={15} />, label: 'Properties', to: '/admin/properties' },
        { icon: <MessageSquare size={15} />, label: 'Messages', to: '/admin/messages' },
        { icon: <Flag size={15} />, label: 'Reports', to: '/admin/reported-content' },
        { icon: <Trophy size={15} />, label: 'Top Agents', to: '/admin/top-agents' },
        { icon: <CheckCheck size={15} />, label: 'Audit Trail', to: '/admin/audit-logs' },
      ];
    case 'Seller':
      return [
        { icon: <Store size={15} />, label: 'Dashboard', to: '/seller/dashboard' },
        { icon: <Building2 size={15} />, label: 'My Properties', to: '/seller/properties' },
        { icon: <PlusCircle size={15} />, label: 'Add Property', to: '/dashboard/properties/new' },
        { icon: <MessageSquare size={15} />, label: 'Inquiries', to: '/seller/inquiries' },
        { icon: <TrendingUp size={15} />, label: 'Top Performing', to: '/seller/top-performing' },
        { icon: <Tag size={15} />, label: 'Pricing', to: '/seller/pricing' },
      ];
    case 'Buyer':
      return [
        { icon: <LayoutDashboard size={15} />, label: 'Overview', to: '/dashboard' },
        { icon: <Heart size={15} />, label: 'Favorites', to: '/favorites' },
        { icon: <MessageSquare size={15} />, label: 'Messages', to: '/messages' },
      ];
    default:
      return [];
  }
}

function getRoleMeta(role: string) {
  const map: Record<string, { label: string; dot: string; pill: string }> = {
    Administrator: { label: 'Admin Portal', dot: 'bg-[#54B5BB]', pill: 'bg-[#1B395F]/10 text-[#1B395F] border-[#1B395F]/20' },
    SubAdmin:      { label: 'Sub-Admin Portal', dot: 'bg-purple-400', pill: 'bg-purple-50 text-purple-700 border-purple-200' },
    Seller:        { label: 'Seller Portal', dot: 'bg-[#54B5BB]', pill: 'bg-[#54B5BB]/10 text-[#1B395F] border-[#54B5BB]/30' },
    Buyer:         { label: 'Buyer Portal', dot: 'bg-blue-400', pill: 'bg-blue-50 text-blue-700 border-blue-200' },
  };
  return map[role] ?? { label: role, dot: 'bg-slate-400', pill: 'bg-slate-100 text-slate-600 border-slate-200' };
}

/* ─── dropdown animation ─────────────────────────────────────── */
const dropdownV = {
  hidden: { opacity: 0, scale: 0.94, y: -8 },
  visible: { opacity: 1, scale: 1, y: 0, transition: { type: 'spring' as const, damping: 22, stiffness: 320 } },
  exit:   { opacity: 0, scale: 0.94, y: -8, transition: { duration: 0.15 } },
};

/* ─── component ──────────────────────────────────────────────── */
const Topbar: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { currency, setCurrency } = useCurrency();
  const role = user?.role ?? '';
  const navItems = getNavItems(role);
  const roleMeta = getRoleMeta(role);

  const isSeller    = role === 'Seller';
  const isBuyer     = role === 'Buyer';
  const isAdminLike = role === 'Administrator' || role === 'SubAdmin';

  const [unreadMessages, setUnreadMessages] = useState(0);
  const [notifications,  setNotifications]  = useState<AdminNotification[]>([]);
  const [notifOpen,   setNotifOpen]   = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [mobileOpen,  setMobileOpen]  = useState(false);

  const notifRef   = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);
  const mobileRef  = useRef<HTMLDivElement>(null);
  useClickOutside(notifRef,   () => setNotifOpen(false));
  useClickOutside(profileRef, () => setProfileOpen(false));
  useClickOutside(mobileRef,  () => setMobileOpen(false));

  useEffect(() => {
    let cancelled = false;
    const load = () => {
      if (isSeller || isBuyer) {
        messagesApi.getUnreadCount().then(r => !cancelled && setUnreadMessages(r.unread_count)).catch(() => {});
      } else if (isAdminLike) {
        adminApi.getNotifications().then(r => !cancelled && setNotifications(r.notifications)).catch(() => {});
      }
    };
    load();
    const iv = setInterval(load, 30_000);
    return () => { cancelled = true; clearInterval(iv); };
  }, [isSeller, isBuyer, isAdminLike]);

  const unreadNotif = notifications.filter(n => !n.is_read).length;

  const handleNotifClick = async (n: AdminNotification) => {
    if (!n.is_read) {
      try {
        await adminApi.markNotificationRead(n.id);
        setNotifications(prev => prev.map(x => x.id === n.id ? { ...x, is_read: true } : x));
      } catch { /* non-critical */ }
    }
    setNotifOpen(false);
    if (n.type === 'new_listing') navigate('/admin/properties');
    else if (n.type === 'new_user') navigate('/admin/users');
  };

  /* ── render ── */
  return (
    <header className="shrink-0 z-30 bg-white border-b border-slate-200/70 shadow-sm w-full max-w-[100vw]">

      {/* ═══ Main bar ═══ */}
      <div className="flex items-center gap-3 h-16 px-3 lg:px-6 min-w-0 max-w-full">

        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 flex-shrink-0 group mr-2">
          <GWLandLogo className="h-8 w-auto flex-shrink-0" />
          <span className="text-lg font-black tracking-tight hidden sm:block" style={{ color: '#1B395F' }}>
            GW<span style={{ color: '#54B5BB' }}>LAND</span>
          </span>
        </Link>

        {/* Vertical divider */}
        <div className="hidden lg:block h-6 w-px bg-slate-200 flex-shrink-0" />

        {/* ── Desktop nav links — pill-style ── */}
        <nav className="hidden lg:flex items-center gap-1 flex-1 min-w-0 overflow-x-auto no-scrollbar py-1">
          {navItems.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              end
              className={({ isActive }) =>
                `flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-[13px] font-semibold whitespace-nowrap transition-all duration-150 flex-shrink-0 border ${
                  isActive
                    ? 'text-white border-transparent shadow-sm'
                    : 'text-slate-500 border-transparent hover:border-slate-200 hover:bg-slate-50 hover:text-slate-800'
                }`
              }
              style={({ isActive }) => isActive
                ? { background: 'linear-gradient(135deg, #1B395F 0%, #54B5BB 100%)', boxShadow: '0 2px 8px rgba(27,57,95,0.25)' }
                : {}
              }
            >
              {({ isActive }) => (
                <>
                  <span className={`flex-shrink-0 transition-colors ${isActive ? 'text-white' : 'text-slate-400'}`}>
                    {item.icon}
                  </span>
                  {item.label}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Spacer (mobile) */}
        <div className="flex-1 lg:hidden" />

        {/* ── Right utilities ── */}
        <div className="flex items-center gap-1 flex-shrink-0">

          {/* Role badge — desktop only */}
          <span className={`hidden xl:inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold border flex-shrink-0 mr-1 ${roleMeta.pill}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${roleMeta.dot} animate-pulse`} />
            {roleMeta.label}
          </span>

          {/* Unread message bubble */}
          {(isSeller || isBuyer) && unreadMessages > 0 && (
            <button
              onClick={() => navigate(isSeller ? '/seller/inquiries' : '/messages')}
              className="relative p-2 text-slate-400 hover:text-[#1B395F] hover:bg-[#1B395F]/8 rounded-xl transition-all"
              title="Unread messages"
            >
              <MessageCircle size={19} />
              <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-[16px]">
                <span className="motion-safe:animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
                <span className="relative inline-flex h-4 min-w-[16px] items-center justify-center rounded-full bg-rose-500 px-1 text-[9px] font-extrabold text-white">
                  {unreadMessages > 9 ? '9+' : unreadMessages}
                </span>
              </span>
            </button>
          )}

          {/* Notification bell (admin) */}
          {isAdminLike && (
            <div className="relative" ref={notifRef}>
              <button
                onClick={() => setNotifOpen(v => !v)}
                className="relative p-2 text-slate-400 hover:text-[#1B395F] hover:bg-[#1B395F]/8 rounded-xl transition-all"
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
                      {notifications.length === 0 ? (
                        <div className="px-4 py-10 text-center">
                          <div className="w-10 h-10 rounded-2xl flex items-center justify-center mx-auto mb-3"
                            style={{ background: 'rgba(84,181,187,0.12)', color: '#54B5BB' }}>
                            <CheckCheck size={20} />
                          </div>
                          <p className="text-sm font-semibold text-slate-500">All caught up!</p>
                        </div>
                      ) : notifications.slice(0, 8).map(n => (
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
          <select
            value={currency}
            onChange={(e) => setCurrency(e.target.value as any)}
            className="hidden sm:block px-2.5 py-1 text-xs font-extrabold rounded-full bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 focus:outline-none transition-all cursor-pointer"
          >
            <option value="RWF">RWF</option>
            <option value="USD">USD ($)</option>
            <option value="EUR">EUR (€)</option>
            <option value="GBP">GBP (£)</option>
          </select>

          {/* Divider */}
          <div className="h-6 w-px bg-slate-200 mx-1" />

          {/* Avatar + profile dropdown */}
          <div className="relative z-50" ref={profileRef}>
            <button
              onClick={() => setProfileOpen(v => !v)}
              className="flex items-center gap-2 pl-1 pr-2.5 py-1 rounded-full border border-transparent hover:border-slate-200 hover:bg-slate-50 transition-all group cursor-pointer"
            >
              <Avatar src={user?.photoUrl} name={user?.fullName ?? 'User'} size="sm" />
              <div className="hidden sm:flex flex-col items-start min-w-0 max-w-[110px]">
                <span className="text-[12px] font-extrabold truncate leading-tight transition-colors group-hover:text-[#1B395F]" style={{ color: '#1B395F' }}>
                  {user?.fullName ?? 'User'}
                </span>
                <span className="text-[10px] font-medium text-slate-400 truncate">{roleMeta.label}</span>
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

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileOpen(v => !v)}
            className="lg:hidden p-2 text-slate-500 hover:bg-slate-100 rounded-xl transition-all ml-1"
          >
            {mobileOpen ? <X size={19} /> : <Menu size={19} />}
          </button>
        </div>
      </div>

      {/* ═══ Mobile nav slide-down ═══ */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            ref={mobileRef as React.RefObject<HTMLDivElement>}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.22, ease: [0.23, 1, 0.32, 1] }}
            className="lg:hidden border-t border-slate-200/80 bg-white overflow-hidden"
          >
            <nav className="flex flex-col gap-1 p-3">
              {navItems.map(item => (
                <NavLink
                  key={item.to} to={item.to} end
                  onClick={() => setMobileOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-semibold transition-all ${
                      isActive ? 'text-white' : 'text-slate-600 hover:bg-slate-100'
                    }`
                  }
                  style={({ isActive }) => isActive
                    ? { background: 'linear-gradient(135deg, #1B395F 0%, #54B5BB 100%)' }
                    : {}
                  }
                >
                  {({ isActive }) => (
                    <>
                      <span className={isActive ? 'text-white' : 'text-slate-400'}>{item.icon}</span>
                      {item.label}
                    </>
                  )}
                </NavLink>
              ))}
              <div className="my-1.5 h-px bg-slate-100 mx-2" />
              <button
                onClick={() => { setMobileOpen(false); logout(); navigate('/login', { replace: true }); }}
                className="flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-semibold text-rose-600 hover:bg-rose-50 transition-all text-left cursor-pointer"
              >
                <LogOut size={15} className="text-rose-500" />
                Sign Out
              </button>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Topbar;
