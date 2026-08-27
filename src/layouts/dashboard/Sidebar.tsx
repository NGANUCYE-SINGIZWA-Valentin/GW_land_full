import React, { ReactElement, useState, useEffect } from 'react';
import { NavLink, Link } from 'react-router-dom';
import {
  LayoutDashboard, Users,
  Building2, Wallet,
  MessageSquare,
  PlusCircle,
  X, Store, Flag,
  Trophy, User, TrendingUp, Tag, Heart, Settings,
  ChevronLeft, ChevronRight, CheckCheck, Sparkles, LogOut,
  PanelLeftClose, PanelLeftOpen
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import GWLandLogo from '@/components/ui/GWLandLogo';
import { Avatar } from '@/components/ui/Avatar';
import { useAuth } from '@/components/auth/AuthContext';
import { Tooltip } from '@/components/ui/Tooltip';

interface SidebarLinkProps {
  icon: ReactElement;
  label: string;
  to: string;
  isCollapsed: boolean;
  sectionTitle?: string;
}

const SidebarLink: React.FC<SidebarLinkProps> = ({ icon, label, to, isCollapsed, sectionTitle }) => {
  const content = (
    <NavLink
      to={to}
      end
      className={({ isActive }) => `
        relative flex items-center ${isCollapsed ? 'justify-center px-2 py-3 mx-auto w-12 h-12' : 'gap-3 px-3.5 py-2.5 mx-2'}
        rounded-2xl transition-all duration-200 text-left group text-sm font-semibold
        ${isActive
          ? 'bg-gradient-to-r from-brand-primary/15 via-brand-primary/10 to-transparent text-brand-primary dark:text-teal-400 shadow-xs'
          : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/70 dark:hover:bg-slate-800/60'
        }
      `}
      style={({ isActive }) =>
        isActive
          ? { color: '#1B395F' }
          : {}
      }
    >
      {({ isActive }) => (
        <>
          {isActive && (
            <span
              className={`absolute ${isCollapsed ? 'left-0 top-1/2 -translate-y-1/2 h-7 w-1' : 'left-0 top-1/2 -translate-y-1/2 h-6 w-1.5'} rounded-r-full shadow-sm`}
              style={{ background: 'linear-gradient(to bottom, #1B395F, #54B5BB)' }}
            />
          )}
          <span
            className={`${
              isActive
                ? 'scale-110'
                : 'text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-300'
            } flex-shrink-0 transition-transform duration-200 flex items-center justify-center`}
            style={isActive ? { color: '#54B5BB' } : {}}
          >
            {icon}
          </span>
          {!isCollapsed && <span className="truncate min-w-0 font-semibold">{label}</span>}
        </>
      )}
    </NavLink>
  );

  if (isCollapsed) {
    return (
      <div className="flex justify-center my-1">
        <Tooltip
          position="right"
          variant="brand"
          maxWidth="max-w-[200px]"
          content={
            <div className="space-y-0.5">
              <span className="font-bold text-white text-xs">{label}</span>
              {sectionTitle && (
                <span className="block text-[10px] text-[#54B5BB] uppercase tracking-wider font-extrabold">
                  {sectionTitle}
                </span>
              )}
            </div>
          }
        >
          {content}
        </Tooltip>
      </div>
    );
  }

  return content;
};

interface SidebarSectionProps {
  title: string;
  links: Array<{ icon: ReactElement; label: string; to: string }>;
  isCollapsed: boolean;
}

const SidebarSection: React.FC<SidebarSectionProps> = ({ title, links, isCollapsed }) => (
  <div className="mb-4">
    {!isCollapsed ? (
      <p className="px-4 text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1.5">
        {title}
      </p>
    ) : (
      <div className="w-8 mx-auto my-2 border-t border-slate-200/80 dark:border-slate-800" />
    )}
    <nav className="space-y-0.5">
      {links.map((link, index) => (
        <SidebarLink
          key={index}
          to={link.to}
          icon={link.icon}
          label={link.label}
          isCollapsed={isCollapsed}
          sectionTitle={title}
        />
      ))}
    </nav>
  </div>
);

export interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

const ROLE_BADGE: Record<string, { label: string; shortLabel: string; className: string }> = {
  Administrator: {
    label: 'Admin Portal',
    shortLabel: 'Admin',
    className: 'bg-[#1B395F]/10 text-[#1B395F] dark:text-teal-400 border border-[#1B395F]/20',
  },
  SubAdmin: {
    label: 'Sub-Admin Portal',
    shortLabel: 'Sub',
    className: 'bg-purple-500/10 text-purple-700 dark:text-purple-400 border border-purple-500/20',
  },
  Seller: {
    label: 'Seller Portal',
    shortLabel: 'Seller',
    className: 'bg-teal-500/10 text-teal-700 dark:text-teal-400 border border-teal-500/20',
  },
  Buyer: {
    label: 'Buyer Portal',
    shortLabel: 'Buyer',
    className: 'bg-blue-500/10 text-blue-700 dark:text-blue-400 border border-blue-500/20',
  },
};

export const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  onClose,
  isCollapsed: controlledCollapsed,
  onToggleCollapse,
}) => {
  const { user, logout } = useAuth();
  const role = user?.role ?? 'Seller';

  // Support both controlled and uncontrolled collapse state
  const [internalCollapsed, setInternalCollapsed] = useState<boolean>(() => {
    try {
      const stored = localStorage.getItem('gw_sidebar_collapsed');
      return stored !== null ? JSON.parse(stored) : false;
    } catch {
      return false;
    }
  });

  const isCollapsed = controlledCollapsed !== undefined ? controlledCollapsed : internalCollapsed;

  const handleToggle = () => {
    if (onToggleCollapse) {
      onToggleCollapse();
    } else {
      setInternalCollapsed((prev) => {
        const next = !prev;
        try {
          localStorage.setItem('gw_sidebar_collapsed', JSON.stringify(next));
        } catch {
          /* ignore */
        }
        return next;
      });
    }
  };

  const isAdmin = role === 'Administrator';
  const isSubAdmin = role === 'SubAdmin';
  const isSeller = role === 'Seller';
  const isBuyer = role === 'Buyer';

  const sellerLinks = [
    {
      section: 'Main',
      links: [
        { icon: <Store size={18} />, label: 'Dashboard', to: '/seller/dashboard' },
      ],
    },
    {
      section: 'Properties',
      links: [
        { icon: <Building2 size={18} />, label: 'My Properties', to: '/seller/properties' },
        { icon: <PlusCircle size={18} />, label: 'Add Property', to: '/dashboard/properties/new' },
      ],
    },
    {
      section: 'Activity & Growth',
      links: [
        { icon: <MessageSquare size={18} />, label: 'Buyer Inquiries', to: '/seller/inquiries' },
        { icon: <TrendingUp size={18} />, label: 'Top Performing', to: '/seller/top-performing' },
        { icon: <Tag size={18} />, label: 'Pricing Plans', to: '/seller/pricing' },
      ],
    },
    {
      section: 'Account',
      links: [
        { icon: <User size={18} />, label: 'Account Profile', to: '/account' },
      ],
    },
  ];

  const adminLinks = [
    {
      section: 'Analytics',
      links: [
        { icon: <LayoutDashboard size={18} />, label: 'Dashboard', to: '/admin/dashboard' },
        { icon: <Users size={18} />, label: 'User Management', to: '/admin/users' },
        { icon: <Flag size={18} />, label: 'Reported Content', to: '/admin/reported-content' },
        { icon: <Trophy size={18} />, label: 'Top Agents', to: '/admin/top-agents' },
        { icon: <MessageSquare size={18} />, label: 'Messages', to: '/admin/messages' },
      ],
    },
    {
      section: 'Platform Data',
      links: [
        { icon: <Building2 size={18} />, label: 'All Properties', to: '/admin/properties' },
        { icon: <Wallet size={18} />, label: 'Revenue & Plans', to: '/admin/revenue' },
        { icon: <CheckCheck size={18} />, label: 'Audit Trail', to: '/admin/audit-logs' },
      ],
    },
    {
      section: 'System',
      links: [
        { icon: <Settings size={18} />, label: 'Settings & Config', to: '/admin/settings' },
        { icon: <User size={18} />, label: 'Account Profile', to: '/account' },
      ],
    },
  ];

  const subAdminLinks = [
    {
      section: 'Management',
      links: [
        { icon: <LayoutDashboard size={18} />, label: 'Dashboard', to: '/admin/sub-dashboard' },
        { icon: <Users size={18} />, label: 'User Management', to: '/admin/users' },
        { icon: <Flag size={18} />, label: 'Reported Content', to: '/admin/reported-content' },
        { icon: <Trophy size={18} />, label: 'Top Agents', to: '/admin/top-agents' },
        { icon: <MessageSquare size={18} />, label: 'Messages', to: '/admin/messages' },
      ],
    },
    {
      section: 'Data',
      links: [
        { icon: <Building2 size={18} />, label: 'Properties', to: '/admin/properties' },
        { icon: <CheckCheck size={18} />, label: 'Audit Trail', to: '/admin/audit-logs' },
      ],
    },
    {
      section: 'Account',
      links: [
        { icon: <User size={18} />, label: 'Account Profile', to: '/account' },
      ],
    },
  ];

  const buyerLinks = [
    {
      section: 'Main',
      links: [
        { icon: <LayoutDashboard size={18} />, label: 'Overview', to: '/dashboard' },
        { icon: <Heart size={18} />, label: 'Favorites', to: '/favorites' },
        { icon: <MessageSquare size={18} />, label: 'Messages', to: '/messages' },
      ],
    },
    {
      section: 'Account',
      links: [
        { icon: <User size={18} />, label: 'Account Profile', to: '/account' },
      ],
    },
  ];

  const getLinksForRole = () => {
    if (isSeller) return sellerLinks;
    if (isAdmin) return adminLinks;
    if (isSubAdmin) return subAdminLinks;
    if (isBuyer) return buyerLinks;
    return [];
  };

  const links = getLinksForRole();
  const badge = ROLE_BADGE[role];

  return (
    <>
      {/* Backdrop/Overlay mobile */}
      <div
        onClick={onClose}
        className={`fixed inset-0 bg-slate-950/60 backdrop-blur-md z-40 lg:hidden transition-opacity duration-300 ${
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      />

      {/* Sidebar Panel */}
      <aside
        className={`
        fixed inset-y-0 left-0 z-50 bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl border-r border-slate-200/80 dark:border-slate-800 flex flex-col justify-between h-full
        transition-all duration-300 ease-in-out
        lg:relative lg:translate-x-0 lg:z-0 flex-shrink-0 shadow-lg lg:shadow-none
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        ${isCollapsed ? 'lg:w-20 w-64' : 'w-64'}
      `}
      >
        <div className="flex flex-col h-full min-h-0">

          {/* Header / Logo + Collapse Toggle */}
          <div
            className={`p-3.5 flex items-center ${
              isCollapsed ? 'justify-center' : 'justify-between'
            } gap-2 flex-shrink-0 border-b border-slate-100 dark:border-slate-800/80 mb-2`}
          >
            <Link to="/" className="flex items-center gap-2.5 min-w-0 group" title="GW Land Home">
              <GWLandLogo className="h-8 w-auto flex-shrink-0 group-hover:scale-105 transition-transform" />
              {!isCollapsed && (
                <span className="text-lg font-black tracking-tight text-slate-900 dark:text-white truncate">
                  GW<span className="gradient-text-brand ml-0.5">LAND</span>
                </span>
              )}
            </Link>

            {/* Collapse toggle on Desktop */}
            <div className="hidden lg:flex items-center">
              <Tooltip
                position="right"
                variant="dark"
                content={isCollapsed ? 'Expand Sidebar (Full View)' : 'Collapse Sidebar (Icon View)'}
              >
                <button
                  type="button"
                  onClick={handleToggle}
                  aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                  className="p-1.5 text-slate-400 hover:text-brand-primary dark:hover:text-teal-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all cursor-pointer"
                >
                  {isCollapsed ? <PanelLeftOpen size={17} /> : <PanelLeftClose size={17} />}
                </button>
              </Tooltip>
            </div>

            {/* Mobile close button */}
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl lg:hidden flex-shrink-0"
              aria-label="Close menu"
            >
              <X size={18} />
            </button>
          </div>

          {/* Role badge */}
          {badge && (
            <div className={`px-3 pb-2 pt-0.5 ${isCollapsed ? 'flex justify-center' : ''}`}>
              {isCollapsed ? (
                <Tooltip position="right" variant="brand" content={`Active Portal: ${badge.label}`}>
                  <span
                    className={`w-3 h-3 rounded-full flex items-center justify-center cursor-help ${
                      role === 'Administrator' ? 'bg-[#1B395F]' : 'bg-[#54B5BB]'
                    } ring-2 ring-white dark:ring-slate-900`}
                  />
                </Tooltip>
              ) : (
                <span
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${badge.className}`}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
                  {badge.label}
                </span>
              )}
            </div>
          )}

          {/* Navigation Links */}
          <div className="px-2 space-y-4 overflow-y-auto flex-1 custom-scrollbar pb-4 pt-1">
            {links.map((section, index) => (
              <SidebarSection
                key={index}
                title={section.section}
                links={section.links}
                isCollapsed={isCollapsed}
              />
            ))}
          </div>

          {/* User Profile Footer */}
          <div className="border-t border-slate-200/80 dark:border-slate-800 p-2">
            {isCollapsed ? (
              <div className="flex flex-col items-center gap-2 py-1">
                <Tooltip
                  position="right"
                  variant="brand"
                  content={
                    <div className="space-y-1 text-left">
                      <p className="font-bold text-white text-xs">{user?.fullName ?? 'User'}</p>
                      <p className="text-[11px] text-slate-300">{user?.email ?? ''}</p>
                      <span className="inline-block px-2 py-0.5 rounded-md bg-white/15 text-[10px] font-semibold text-teal-300">
                        {badge?.label || role}
                      </span>
                    </div>
                  }
                >
                  <Link to="/account" className="relative group block p-1">
                    <Avatar src={user?.photoUrl} name={user?.fullName ?? 'User'} size="sm" />
                    <span className="absolute bottom-1 right-1 w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-slate-900" />
                  </Link>
                </Tooltip>

                <Tooltip position="right" variant="dark" content="Expand Sidebar">
                  <button
                    onClick={handleToggle}
                    className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  >
                    <ChevronRight size={15} />
                  </button>
                </Tooltip>
              </div>
            ) : (
              <div className="space-y-2">
                <Link
                  to="/account"
                  className="p-2.5 rounded-2xl flex items-center gap-3 hover:bg-slate-100/70 dark:hover:bg-slate-800/70 transition-colors group"
                >
                  <div className="relative flex-shrink-0">
                    <Avatar src={user?.photoUrl} name={user?.fullName ?? 'User'} size="md" />
                    <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-slate-900" />
                  </div>
                  <div className="overflow-hidden min-w-0 flex-1">
                    <h4 className="text-xs font-bold text-slate-800 dark:text-white truncate group-hover:text-brand-primary dark:group-hover:text-teal-400 transition-colors">
                      {user?.fullName ?? 'User'}
                    </h4>
                    <p className="text-[11px] text-slate-400 dark:text-slate-500 truncate">{user?.email ?? ''}</p>
                  </div>
                </Link>

                <div className="flex items-center justify-between px-2 pt-1">
                  <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                    Compact view
                  </span>
                  <button
                    type="button"
                    onClick={handleToggle}
                    className="inline-flex items-center gap-1 px-2 py-1 text-[11px] font-bold text-slate-500 hover:text-brand-primary rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  >
                    <ChevronLeft size={13} /> Collapse
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
