import React, { ReactElement } from 'react';
import { NavLink, Link } from 'react-router-dom';
import {
  LayoutDashboard, Users,
  Building2, Wallet,
  MessageSquare,
  PlusCircle,
  X, Store, Flag,
  Trophy, User, TrendingUp, Tag, Heart, Settings
} from 'lucide-react';
import GWLandLogo from '@/components/ui/GWLandLogo';
import { Avatar } from '@/components/ui/Avatar';
import { useAuth } from '@/components/auth/AuthContext';

interface SidebarLinkProps {
  icon: ReactElement;
  label: string;
  to: string;
}

const SidebarLink: React.FC<SidebarLinkProps> = ({ icon, label, to }) => (
  <NavLink
    to={to}
    end
    className={({ isActive }) => `
      relative flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-200 text-left group text-sm font-semibold
      ${isActive
        ? 'bg-gradient-to-r from-indigo-500/15 via-indigo-500/10 to-transparent text-indigo-600 dark:text-indigo-400 shadow-sm'
        : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/60 dark:hover:bg-slate-800/50'
      }
    `}
  >
    {({ isActive }) => (
      <>
        {isActive && (
          <span className="absolute left-0 top-1/2 -translate-y-1/2 h-6 w-1.5 rounded-r-full bg-gradient-to-b from-indigo-500 to-purple-600 shadow-md shadow-indigo-500/30" />
        )}
        <span className={`${isActive ? 'text-indigo-600 dark:text-indigo-400 scale-110' : 'text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300'} flex-shrink-0 transition-all duration-200`}>
          {icon}
        </span>
        <span className="truncate min-w-0">{label}</span>
      </>
    )}
  </NavLink>
);

interface SidebarSectionProps {
  title: string;
  links: Array<{ icon: ReactElement; label: string; to: string }>;
}

const SidebarSection: React.FC<SidebarSectionProps> = ({ title, links }) => (
  <div>
    <p className="px-4 text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2">{title}</p>
    <nav className="space-y-1">
      {links.map((link, index) => (
        <SidebarLink key={index} to={link.to} icon={link.icon} label={link.label} />
      ))}
    </nav>
  </div>
);

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const ROLE_BADGE: Record<string, { label: string; className: string }> = {
  Administrator: { label: 'Admin Portal', className: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20' },
  SubAdmin: { label: 'Sub-Admin Portal', className: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20' },
  Seller: { label: 'Seller Portal', className: 'bg-teal-500/10 text-teal-600 dark:text-teal-400 border border-teal-500/20' },
  Buyer: { label: 'Buyer Portal', className: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20' },
};

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const role = user?.role ?? 'Seller';

  const isAdmin = role === 'Administrator';
  const isSubAdmin = role === 'SubAdmin';
  const isSeller = role === 'Seller';
  const isBuyer = role === 'Buyer';

  const sellerLinks = [
    {
      section: 'Main',
      links: [
        { icon: <Store size={18} />, label: 'Dashboard', to: '/seller/dashboard' },
      ]
    },
    {
      section: 'Properties',
      links: [
        { icon: <Building2 size={18} />, label: 'My Properties', to: '/seller/properties' },
        { icon: <PlusCircle size={18} />, label: 'Add Property', to: '/dashboard/properties/new' },
      ]
    },
    {
      section: 'Activity',
      links: [
        { icon: <MessageSquare size={18} />, label: 'Inquiries', to: '/seller/inquiries' },
        { icon: <TrendingUp size={18} />, label: 'Top Performing', to: '/seller/top-performing' },
        { icon: <Tag size={18} />, label: 'Pricing', to: '/seller/pricing' },
      ]
    },
    {
      section: 'Account',
      links: [
        { icon: <User size={18} />, label: 'Profile', to: '/account' },
      ]
    }
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
      ]
    },
    {
      section: 'Data',
      links: [
        { icon: <Building2 size={18} />, label: 'Properties', to: '/admin/properties' },
        { icon: <Wallet size={18} />, label: 'Revenue', to: '/admin/revenue' },
      ]
    },
    {
      section: 'System',
      links: [
        { icon: <Settings size={18} />, label: 'Settings & Pricing', to: '/admin/settings' },
        { icon: <User size={18} />, label: 'Profile', to: '/account' },
      ]
    }
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
      ]
    },
    {
      section: 'Data',
      links: [
        { icon: <Building2 size={18} />, label: 'Properties', to: '/admin/properties' },
      ]
    },
    {
      section: 'Account',
      links: [
        { icon: <User size={18} />, label: 'Profile', to: '/account' },
      ]
    }
  ];

  const buyerLinks = [
    {
      section: 'Main',
      links: [
        { icon: <LayoutDashboard size={18} />, label: 'Overview', to: '/dashboard' },
        { icon: <Heart size={18} />, label: 'Favorites', to: '/favorites' },
        { icon: <MessageSquare size={18} />, label: 'Messages', to: '/messages' },
      ]
    },
    {
      section: 'Account',
      links: [
        { icon: <User size={18} />, label: 'Profile', to: '/account' },
      ]
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
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl border-r border-slate-200/80 dark:border-slate-800 flex flex-col justify-between h-full
        transform transition-transform duration-300 ease-in-out
        lg:relative lg:translate-x-0 lg:z-0 flex-shrink-0 shadow-lg lg:shadow-none
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex flex-col h-full min-h-0">

          {/* Logo + Close Button */}
          <div className="p-4 flex items-center justify-between gap-3 flex-shrink-0 border-b border-slate-100 dark:border-slate-800/80 mb-2">
            <Link to="/" className="flex items-center gap-2.5 min-w-0 group">
              <GWLandLogo className="h-8 w-auto flex-shrink-0 group-hover:scale-105 transition-transform" />
              <span className="text-xl font-black tracking-tight text-slate-900 dark:text-white truncate">
                GW<span className="gradient-text-brand ml-0.5">LAND</span>
              </span>
            </Link>
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
            <div className="px-4 pb-3 pt-1">
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${badge.className}`}>
                <span className="w-1.5 h-1.5 rounded-full bg-current animate-ping" />
                {badge.label}
              </span>
            </div>
          )}

          {/* Navigation */}
          <div className="px-3 space-y-6 overflow-y-auto flex-1 custom-scrollbar pb-4">
            {links.map((section, index) => (
              <SidebarSection
                key={index}
                title={section.section}
                links={section.links}
              />
            ))}
          </div>

          {/* User Profile Footer */}
          <Link
            to="/account"
            className="p-4 border-t border-slate-200/80 dark:border-slate-800 flex items-center gap-3 flex-shrink-0 hover:bg-slate-100/50 dark:hover:bg-slate-800/50 transition-colors group"
          >
            <div className="relative">
              <Avatar src={user?.photoUrl} name={user?.fullName ?? 'User'} size="md" />
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-slate-900" />
            </div>
            <div className="overflow-hidden min-w-0">
              <h4 className="text-xs font-bold text-slate-800 dark:text-white truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{user?.fullName ?? 'User'}</h4>
              <p className="text-[11px] text-slate-400 dark:text-slate-500 truncate">{user?.email ?? ''}</p>
            </div>
          </Link>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
