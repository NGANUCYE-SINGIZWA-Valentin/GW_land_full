import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { StatCard } from '@/components/dashboard/StatCard';
import { TableBlueprint, ColumnConfig } from '@/components/dashboard/TableBlueprint';
import { DrawerBlueprint } from '@/components/dashboard/DrawerBlueprint';
import { ActionDropdown } from '@/components/dashboard/ActionDropdown';
import { AlertDialog } from '@/components/ui/AlertDialog';
import { DashboardButton } from '@/components/ui/DashboardButton';
import { Avatar } from '@/components/ui/Avatar';
import {
    Users,
    UserCheck,
    ShieldAlert,
    Clock,
    Store,
    Mail,
    CalendarDays,
    Activity,
    ShieldCheck,
    LogIn,
    Home,
    Flag,
    UserPlus,
    X,
    Phone,
    Key,
    Edit3,
} from 'lucide-react';
import { useAuth, ROLE_REDIRECTS } from '@/components/auth/AuthContext';
import * as adminApi from '@/api/admin';
import { ApiError } from '@/api/client';
import { formatRelativeTime } from '@/utils/format';
import type { BackendUser, UserStatus, ActivityEntry } from '@/api/types';

const EDITABLE_ROLES: BackendUser['role'][] = ['buyer', 'seller', 'sub_admin', 'admin'];

const ACTIVITY_LABEL: Record<string, string> = {
    login: 'Logged in',
    listing_created: 'Created a listing',
    listing_sold: 'Marked a listing as sold',
    listing_deleted: 'Deleted a listing',
    account_blocked: 'Account was blocked',
    account_approved: 'Account was approved',
    account_verified: 'Verified badge assigned',
    account_unverified: 'Verified badge removed',
};

const activityIcon = (action: string) => {
    if (action === 'login') return <LogIn size={14} />;
    if (action.startsWith('listing')) return <Home size={14} />;
    if (action.startsWith('account')) return <ShieldCheck size={14} />;
    if (action.startsWith('report')) return <Flag size={14} />;
    return <Activity size={14} />;
};

type KpiFilter = 'all' | 'approved' | 'blocked' | 'pending' | 'sellers';

const ROLE_LABEL: Record<BackendUser['role'], string> = {
    admin: 'Admin', sub_admin: 'Sub Admin', seller: 'Seller', buyer: 'Buyer',
};
const ROLE_STYLE: Record<BackendUser['role'], string> = {
    admin: 'bg-purple-50 text-purple-600', sub_admin: 'bg-indigo-50 text-indigo-600',
    seller: 'bg-blue-50 text-blue-600', buyer: 'bg-slate-100 text-slate-500',
};
const STATUS_STYLE: Record<UserStatus, string> = {
    approved: 'bg-emerald-50 border-emerald-100 text-emerald-600',
    pending: 'bg-amber-50 border-amber-100 text-amber-600',
    blocked: 'bg-red-50 border-red-100 text-red-600',
};
const STATUS_DOT: Record<UserStatus, string> = {
    approved: 'bg-emerald-500', pending: 'bg-amber-500', blocked: 'bg-red-500',
};

export const UserManagement: React.FC = () => {
    const navigate = useNavigate();
    const { user: currentUser, impersonate } = useAuth();
    const isAdmin = currentUser?.role === 'Administrator';

    const [users, setUsers] = useState<BackendUser[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [activeKpiFilter, setActiveKpiFilter] = useState<KpiFilter>('all');

    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<BackendUser | null>(null);
    const [actionError, setActionError] = useState('');

    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [userToDelete, setUserToDelete] = useState<BackendUser | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [createForm, setCreateForm] = useState({ full_name: '', email: '', phone: '', password: '', role: 'buyer' as BackendUser['role'] });
    const [createError, setCreateError] = useState('');
    const [creating, setCreating] = useState(false);

    const [editTarget, setEditTarget] = useState<BackendUser | null>(null);
    const [editForm, setEditForm] = useState({ full_name: '', email: '', phone: '', role: 'buyer' as BackendUser['role'] });
    const [editError, setEditError] = useState('');
    const [editing, setEditing] = useState(false);

    const [impersonatingId, setImpersonatingId] = useState<string | null>(null);

    const loadUsers = () => {
        setLoading(true);
        adminApi.getAllUsers()
            .then((res) => setUsers(res.users))
            .catch(() => setError('Failed to load users.'))
            .finally(() => setLoading(false));
    };

    useEffect(() => { loadUsers(); }, []);

    const kpiCounts = useMemo(() => ({
        all: users.length,
        approved: users.filter((u) => u.status === 'approved').length,
        blocked: users.filter((u) => u.status === 'blocked').length,
        pending: users.filter((u) => u.status === 'pending').length,
        sellers: users.filter((u) => u.role === 'seller').length,
    }), [users]);

    const filteredUsers = useMemo(() => {
        switch (activeKpiFilter) {
            case 'approved': return users.filter((u) => u.status === 'approved');
            case 'blocked': return users.filter((u) => u.status === 'blocked');
            case 'pending': return users.filter((u) => u.status === 'pending');
            case 'sellers': return users.filter((u) => u.role === 'seller');
            default: return users;
        }
    }, [users, activeKpiFilter]);

    const [activity, setActivity] = useState<ActivityEntry[]>([]);
    const [activityLoading, setActivityLoading] = useState(false);

    const openDrawer = (user: BackendUser) => {
        setSelectedUser(user);
        setActionError('');
        setIsDrawerOpen(true);
        setActivityLoading(true);
        adminApi.getUserActivity(user.id)
            .then((res) => setActivity(res.activity))
            .catch(() => setActivity([]))
            .finally(() => setActivityLoading(false));
    };

    const handleSetStatus = async (user: BackendUser, status: 'approved' | 'blocked') => {
        setActionError('');
        try {
            await adminApi.setUserStatus(user.id, status);
            setIsDrawerOpen(false);
            loadUsers();
        } catch (err) {
            setActionError(err instanceof ApiError ? err.message : 'Failed to update status.');
        }
    };

    const handleVerify = async (user: BackendUser) => {
        setActionError('');
        try {
            await adminApi.setUserVerified(user.id, !user.is_verified);
            setIsDrawerOpen(false);
            loadUsers();
        } catch (err) {
            setActionError(err instanceof ApiError ? err.message : 'Failed to update verification.');
        }
    };

    const askDelete = (user: BackendUser) => {
        setUserToDelete(user);
        setIsDeleteDialogOpen(true);
    };

    const confirmDelete = async () => {
        if (!userToDelete) return;
        setIsDeleting(true);
        try {
            await adminApi.deleteUser(userToDelete.id);
            setIsDeleteDialogOpen(false);
            setUserToDelete(null);
            setIsDrawerOpen(false);
            loadUsers();
        } catch (err) {
            setError(err instanceof ApiError ? err.message : 'Failed to delete user.');
        } finally {
            setIsDeleting(false);
        }
    };

    const handleCreateUser = async () => {
        setCreateError('');
        if (!createForm.full_name || !createForm.email || !createForm.password) {
            setCreateError('Full name, email, and password are required.');
            return;
        }
        setCreating(true);
        try {
            await adminApi.createUser(createForm);
            setIsCreateOpen(false);
            setCreateForm({ full_name: '', email: '', phone: '', password: '', role: 'buyer' });
            loadUsers();
        } catch (err) {
            setCreateError(err instanceof ApiError ? err.message : 'Failed to create user.');
        } finally {
            setCreating(false);
        }
    };

    const openEditModal = (user: BackendUser) => {
        setEditTarget(user);
        setEditForm({ full_name: user.full_name, email: user.email, phone: user.phone || '', role: user.role });
        setEditError('');
    };

    const handleUpdateUser = async () => {
        if (!editTarget) return;
        setEditError('');
        setEditing(true);
        try {
            await adminApi.updateUser(editTarget.id, editForm);
            setEditTarget(null);
            loadUsers();
        } catch (err) {
            setEditError(err instanceof ApiError ? err.message : 'Failed to update user.');
        } finally {
            setEditing(false);
        }
    };

    const handleImpersonate = async (user: BackendUser) => {
        setImpersonatingId(user.id);
        try {
            const { token } = await adminApi.impersonateUser(user.id);
            const result = await impersonate(token);
            if (result.success && result.role) {
                navigate(ROLE_REDIRECTS[result.role]);
            } else {
                setError(result.error || 'Failed to switch to that account.');
            }
        } catch (err) {
            setError(err instanceof ApiError ? err.message : 'Failed to log in as that user.');
        } finally {
            setImpersonatingId(null);
        }
    };

    const columns: ColumnConfig<BackendUser>[] = [
        {
            header: 'Name',
            render: (u) => (
                <div className="flex items-center gap-3">
                    <Avatar src={u.photo_url} name={u.full_name} size="md" />
                    <div className="flex flex-col min-w-0">
                        <span className="text-base font-medium tracking-tight text-slate-700 truncate max-w-[160px] flex items-center gap-1">
                            {u.full_name}
                            {u.is_verified && <ShieldCheck size={13} className="text-emerald-500 flex-shrink-0" />}
                        </span>
                        <span className="text-xs text-slate-400 font-normal truncate">{u.email}</span>
                    </div>
                </div>
            ),
        },
        {
            header: 'Role',
            render: (u) => <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${ROLE_STYLE[u.role]}`}>{ROLE_LABEL[u.role]}</span>,
        },
        {
            header: 'Status',
            render: (u) => (
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium tracking-tight antialiased border ${STATUS_STYLE[u.status]}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${STATUS_DOT[u.status]}`} />
                    {u.status}
                </span>
            ),
        },
        { header: 'Joined', render: (u) => new Date(u.created_at).toLocaleDateString(), cellClassName: 'text-slate-700 text-base font-medium tracking-tight antialiased' },
        {
            header: 'Action',
            headerClassName: 'text-right',
            cellClassName: 'text-right',
            render: (u) => {
                const isSelf = u.id === currentUser?.id;
                return (
                    <ActionDropdown
                        canReview={true}
                        canApprove={isAdmin && !u.is_verified && (u.role === 'seller' || u.role === 'buyer')}
                        canUnpublish={!isSelf && u.status === 'approved' && u.role !== 'admin'}
                        canArchive={!isSelf && u.status !== 'approved' && u.role !== 'admin'}
                        canDelete={isAdmin && !isSelf && u.role !== 'admin'}
                        canEdit={isAdmin}
                        canImpersonate={isAdmin && !isSelf && u.role !== 'admin'}
                        onReview={() => openDrawer(u)}
                        onApprove={() => handleVerify(u)}
                        onUnpublish={() => handleSetStatus(u, 'blocked')}
                        onArchive={() => handleSetStatus(u, 'approved')}
                        onDelete={() => askDelete(u)}
                        onEdit={() => openEditModal(u)}
                        onImpersonate={() => handleImpersonate(u)}
                    />
                );
            },
        },
    ];

    const kpiCards: { filter: KpiFilter; title: string; icon: React.ReactNode; countKey: keyof typeof kpiCounts }[] = [
        { filter: 'all', title: 'All Users', icon: <Users size={20} />, countKey: 'all' },
        { filter: 'approved', title: 'Approved', icon: <UserCheck size={20} />, countKey: 'approved' },
        { filter: 'blocked', title: 'Blocked', icon: <ShieldAlert size={20} />, countKey: 'blocked' },
        { filter: 'pending', title: 'Pending', icon: <Clock size={20} />, countKey: 'pending' },
        { filter: 'sellers', title: 'Sellers', icon: <Store size={20} />, countKey: 'sellers' },
    ];

    return (
        <div className="w-full min-w-0 space-y-8 font-sans antialiased">

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">
                {kpiCards.map((kpi) => (
                    <StatCard
                        key={kpi.filter}
                        title={kpi.title}
                        value={String(kpiCounts[kpi.countKey])}
                        icon={kpi.icon}
                        showSubtext={false}
                        isActive={activeKpiFilter === kpi.filter}
                        onClick={() => setActiveKpiFilter(kpi.filter)}
                    />
                ))}
            </div>

            <div>
                <div className="px-1 mb-4 flex items-center justify-between gap-3">
                    <div>
                        <h3 className="text-sm font-semibold text-slate-700 tracking-tight">Platform Users</h3>
                        <p className="text-xs text-slate-400 mt-0.5">Manage all registered users on the platform.</p>
                    </div>
                    {isAdmin && (
                        <DashboardButton variant="primary" fullWidth={false} onClick={() => { setIsCreateOpen(true); setCreateError(''); }}>
                            <UserPlus size={15} className="mr-1.5 inline-block" /> Add User
                        </DashboardButton>
                    )}
                </div>
                {error && <p className="mb-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>}
                <TableBlueprint
                    data={filteredUsers}
                    columns={columns}
                    isLoading={loading}
                    emptyMessage={loading ? 'Loading…' : 'No users matched your criteria.'}
                    searchPlaceholder="Search users..."
                    searchKeys={['full_name', 'email', 'role', 'status']}
                    filterConfig={[
                        {
                            accessorKey: 'role',
                            label: 'Role',
                            options: [
                                { label: 'Seller', value: 'seller' },
                                { label: 'Buyer', value: 'buyer' },
                                { label: 'Admin', value: 'admin' },
                                { label: 'Sub Admin', value: 'sub_admin' },
                            ],
                        },
                        {
                            accessorKey: 'status',
                            label: 'Status',
                            options: [
                                { label: 'Approved', value: 'approved' },
                                { label: 'Pending', value: 'pending' },
                                { label: 'Blocked', value: 'blocked' },
                            ],
                        },
                    ]}
                    totalItems={filteredUsers.length}
                    hasPrevPage={false}
                    hasNextPage={false}
                />
            </div>

            <AlertDialog
                isOpen={isDeleteDialogOpen}
                onClose={() => { setIsDeleteDialogOpen(false); setUserToDelete(null); }}
                onConfirm={confirmDelete}
                title="Delete User"
                description={`Are you sure you want to delete "${userToDelete?.full_name}"? This action cannot be undone.`}
                confirmLabel="Delete"
                cancelLabel="Cancel"
                variant="danger"
                isLoading={isDeleting}
            />

            {selectedUser && (
                <DrawerBlueprint
                    isOpen={isDrawerOpen}
                    onClose={() => setIsDrawerOpen(false)}
                    title="User Details"
                    footer={
                        <>
                            <DashboardButton variant="outline" onClick={() => setIsDrawerOpen(false)}>Close</DashboardButton>
                            {selectedUser.id !== currentUser?.id && selectedUser.status === 'approved' && (
                                <DashboardButton variant="danger" onClick={() => handleSetStatus(selectedUser, 'blocked')}>Block</DashboardButton>
                            )}
                            {selectedUser.id !== currentUser?.id && selectedUser.status !== 'approved' && (
                                <DashboardButton variant="primary" onClick={() => handleSetStatus(selectedUser, 'approved')}>Approve</DashboardButton>
                            )}
                            {isAdmin && (selectedUser.role === 'seller' || selectedUser.role === 'buyer') && (
                                <DashboardButton variant="outline" onClick={() => handleVerify(selectedUser)}>
                                    {selectedUser.is_verified ? 'Remove Verified Badge' : 'Verify User'}
                                </DashboardButton>
                            )}
                        </>
                    }
                >
                    {actionError && <p className="mb-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{actionError}</p>}
                    <div>
                        <div className="flex items-center gap-2 mb-3">
                            <span className="text-xs font-medium uppercase tracking-wider text-slate-400">User Profile</span>
                            <div className="flex-1 h-px bg-slate-100" />
                        </div>

                        <div className="flex items-center gap-4 mb-4">
                            <Avatar src={selectedUser.photo_url} name={selectedUser.full_name} size="xl" />
                            <div>
                                <h3 className="text-lg font-semibold text-slate-700 flex items-center gap-1.5">
                                    {selectedUser.full_name}
                                    {selectedUser.is_verified && <ShieldCheck size={16} className="text-emerald-500" />}
                                </h3>
                                <p className="text-sm text-slate-400">{ROLE_LABEL[selectedUser.role]}</p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="text-sm font-semibold text-slate-700 block mb-1.5">Email</label>
                                <div className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-base font-medium text-slate-700 flex items-center gap-2.5">
                                    <Mail size={18} className="text-slate-400 flex-shrink-0" />
                                    <span className="truncate">{selectedUser.email}</span>
                                </div>
                            </div>
                            {selectedUser.phone && (
                                <div>
                                    <label className="text-sm font-semibold text-slate-700 block mb-1.5">Phone</label>
                                    <div className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-base font-medium text-slate-700">
                                        {selectedUser.phone}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    <div>
                        <div className="flex items-center gap-2 mb-3">
                            <span className="text-xs font-medium uppercase tracking-wider text-slate-400">Account Status</span>
                            <div className="flex-1 h-px bg-slate-100" />
                        </div>
                        <div>
                            <div className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-base font-medium text-slate-700 flex items-center gap-2.5">
                                <Activity size={18} className="text-slate-400 flex-shrink-0" />
                                <span className={`inline-flex items-center gap-1.5 ${
                                    selectedUser.status === 'approved' ? 'text-emerald-600' :
                                    selectedUser.status === 'pending' ? 'text-amber-600' : 'text-red-600'
                                }`}>
                                    <span className={`w-2 h-2 rounded-full ${STATUS_DOT[selectedUser.status]}`} />
                                    {selectedUser.status}
                                </span>
                            </div>
                        </div>
                        <div className="mt-3 grid grid-cols-2 gap-3">
                            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
                                <div className="flex items-center gap-2 text-slate-400 mb-1">
                                    <CalendarDays size={16} />
                                    <span className="text-xs font-medium">Joined</span>
                                </div>
                                <p className="text-sm font-semibold text-slate-700">{new Date(selectedUser.created_at).toLocaleDateString()}</p>
                            </div>
                            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
                                <div className="flex items-center gap-2 text-slate-400 mb-1">
                                    <LogIn size={16} />
                                    <span className="text-xs font-medium">Last Login</span>
                                </div>
                                <p className="text-sm font-semibold text-slate-700">
                                    {selectedUser.last_login_at ? formatRelativeTime(selectedUser.last_login_at) : 'Never'}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div>
                        <div className="flex items-center gap-2 mb-3">
                            <span className="text-xs font-medium uppercase tracking-wider text-slate-400">Recent Activity</span>
                            <div className="flex-1 h-px bg-slate-100" />
                        </div>
                        {activityLoading ? (
                            <p className="text-sm text-slate-400">Loading…</p>
                        ) : activity.length === 0 ? (
                            <p className="text-sm text-slate-400">No recorded activity yet.</p>
                        ) : (
                            <div className="space-y-2">
                                {activity.map((a) => (
                                    <div key={a.id} className="flex items-start gap-3 p-3 bg-slate-50 border border-slate-200 rounded-xl">
                                        <div className="p-1.5 rounded-lg bg-white text-slate-400 border border-slate-200 flex-shrink-0">
                                            {activityIcon(a.action)}
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-sm font-medium text-slate-700">{ACTIVITY_LABEL[a.action] || a.action}</p>
                                            {a.detail && <p className="text-xs text-slate-500 truncate">{a.detail}</p>}
                                            <p className="text-xs text-slate-400 mt-0.5">{formatRelativeTime(a.created_at)}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </DrawerBlueprint>
            )}

            <AnimatePresence>
                {isCreateOpen && (
                    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
                            onClick={() => setIsCreateOpen(false)}
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 10 }}
                            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                            className="relative w-full max-w-sm bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-2xl overflow-hidden"
                        >
                            {/* Header Gradient */}
                            <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800 relative overflow-hidden"
                                style={{ background: 'linear-gradient(135deg, #1B395F 0%, #172a45 50%, #54B5BB 100%)' }}>
                                <div className="absolute right-0 top-0 -mt-8 -mr-8 w-32 h-32 bg-white/10 rounded-full blur-2xl pointer-events-none" />
                                <div className="flex items-center gap-3 relative z-10">
                                    <div className="p-2.5 rounded-2xl bg-white/10 backdrop-blur-md text-white border border-white/20">
                                        <UserPlus size={18} />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-white tracking-tight">Add New User</h3>
                                        <p className="text-xs text-white/80">Create a new account manually</p>
                                    </div>
                                </div>
                                <button onClick={() => setIsCreateOpen(false)} className="absolute right-4 top-4 text-white/70 hover:text-white hover:bg-white/10 rounded-full p-1.5 transition-colors cursor-pointer z-10">
                                    <X size={16} />
                                </button>
                            </div>

                            <div className="p-6 space-y-4">
                                <div className="space-y-3">
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                                            <Users size={16} />
                                        </div>
                                        <input type="text" placeholder="Full name" value={createForm.full_name} onChange={(e) => setCreateForm((f) => ({ ...f, full_name: e.target.value }))} className="w-full pl-10 pr-3.5 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:border-brand-primary focus:bg-white transition-colors" />
                                    </div>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                                            <Mail size={16} />
                                        </div>
                                        <input type="email" placeholder="Email address" value={createForm.email} onChange={(e) => setCreateForm((f) => ({ ...f, email: e.target.value }))} className="w-full pl-10 pr-3.5 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:border-brand-primary focus:bg-white transition-colors" />
                                    </div>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                                            <Phone size={16} />
                                        </div>
                                        <input type="tel" placeholder="Phone (optional)" value={createForm.phone} onChange={(e) => setCreateForm((f) => ({ ...f, phone: e.target.value }))} className="w-full pl-10 pr-3.5 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:border-brand-primary focus:bg-white transition-colors" />
                                    </div>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                                            <Key size={16} />
                                        </div>
                                        <input type="password" placeholder="Temporary password (min 8 chars)" value={createForm.password} onChange={(e) => setCreateForm((f) => ({ ...f, password: e.target.value }))} className="w-full pl-10 pr-3.5 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:border-brand-primary focus:bg-white transition-colors" />
                                    </div>
                                    
                                    <div className="pt-2">
                                        <label className="block text-xs font-medium text-slate-500 mb-2">Account Role</label>
                                        <div className="grid grid-cols-2 gap-2">
                                            {EDITABLE_ROLES.map((r) => (
                                                <button
                                                    key={r}
                                                    type="button"
                                                    onClick={() => setCreateForm((f) => ({ ...f, role: r as BackendUser['role'] }))}
                                                    className={`py-2 px-3 rounded-xl border text-sm font-medium transition-all ${createForm.role === r ? 'bg-brand-primary/10 border-brand-primary text-brand-primary shadow-sm' : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'}`}
                                                >
                                                    {ROLE_LABEL[r]}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {createError && (
                                    <div className="p-3 bg-red-50 border border-red-100 rounded-xl flex items-start gap-2">
                                        <ShieldAlert size={14} className="text-red-500 mt-0.5" />
                                        <p className="text-xs font-medium text-red-600">{createError}</p>
                                    </div>
                                )}

                                <div className="flex gap-3 pt-2">
                                    <button onClick={() => setIsCreateOpen(false)} className="flex-1 px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-sm font-semibold transition-colors">
                                        Cancel
                                    </button>
                                    <button onClick={handleCreateUser} disabled={creating} className="flex-1 px-4 py-3 bg-brand-primary hover:bg-brand-secondary text-white rounded-xl text-sm font-semibold shadow-md shadow-brand-primary/20 transition-all disabled:opacity-70 flex items-center justify-center gap-2">
                                        {creating ? 'Creating…' : 'Create User'}
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {editTarget && (
                    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
                            onClick={() => setEditTarget(null)}
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 10 }}
                            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                            className="relative w-full max-w-sm bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-2xl overflow-hidden"
                        >
                            {/* Header Gradient */}
                            <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800 relative overflow-hidden"
                                style={{ background: 'linear-gradient(135deg, #1B395F 0%, #172a45 50%, #54B5BB 100%)' }}>
                                <div className="absolute right-0 top-0 -mt-8 -mr-8 w-32 h-32 bg-white/10 rounded-full blur-2xl pointer-events-none" />
                                <div className="flex items-center gap-3 relative z-10">
                                    <div className="p-2.5 rounded-2xl bg-white/10 backdrop-blur-md text-white border border-white/20">
                                        <Edit3 size={18} />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-white tracking-tight">Edit User</h3>
                                        <p className="text-xs text-white/80">Update profile details</p>
                                    </div>
                                </div>
                                <button onClick={() => setEditTarget(null)} className="absolute right-4 top-4 text-white/70 hover:text-white hover:bg-white/10 rounded-full p-1.5 transition-colors cursor-pointer z-10">
                                    <X size={16} />
                                </button>
                            </div>

                            <div className="p-6 space-y-4">
                                <div className="space-y-3">
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                                            <Users size={16} />
                                        </div>
                                        <input type="text" placeholder="Full name" value={editForm.full_name} onChange={(e) => setEditForm((f) => ({ ...f, full_name: e.target.value }))} className="w-full pl-10 pr-3.5 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:border-brand-primary focus:bg-white transition-colors" />
                                    </div>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                                            <Mail size={16} />
                                        </div>
                                        <input type="email" placeholder="Email address" value={editForm.email} onChange={(e) => setEditForm((f) => ({ ...f, email: e.target.value }))} className="w-full pl-10 pr-3.5 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:border-brand-primary focus:bg-white transition-colors" />
                                    </div>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                                            <Phone size={16} />
                                        </div>
                                        <input type="tel" placeholder="Phone" value={editForm.phone} onChange={(e) => setEditForm((f) => ({ ...f, phone: e.target.value }))} className="w-full pl-10 pr-3.5 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:border-brand-primary focus:bg-white transition-colors" />
                                    </div>
                                    
                                    <div className="pt-2">
                                        <label className="block text-xs font-medium text-slate-500 mb-2">Account Role</label>
                                        <div className="grid grid-cols-2 gap-2">
                                            {EDITABLE_ROLES.map((r) => (
                                                <button
                                                    key={r}
                                                    type="button"
                                                    onClick={() => {
                                                        if (editTarget.role !== 'admin') {
                                                            setEditForm((f) => ({ ...f, role: r as BackendUser['role'] }))
                                                        }
                                                    }}
                                                    disabled={editTarget.role === 'admin'}
                                                    className={`py-2 px-3 rounded-xl border text-sm font-medium transition-all ${editForm.role === r ? 'bg-brand-primary/10 border-brand-primary text-brand-primary shadow-sm' : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'} ${editTarget.role === 'admin' ? 'opacity-50 cursor-not-allowed' : ''}`}
                                                >
                                                    {ROLE_LABEL[r]}
                                                </button>
                                            ))}
                                        </div>
                                        {editTarget.role === 'admin' && <p className="text-xs text-slate-400 mt-2">Admin accounts can't be reassigned to another role.</p>}
                                    </div>
                                </div>

                                {editError && (
                                    <div className="p-3 bg-red-50 border border-red-100 rounded-xl flex items-start gap-2">
                                        <ShieldAlert size={14} className="text-red-500 mt-0.5" />
                                        <p className="text-xs font-medium text-red-600">{editError}</p>
                                    </div>
                                )}

                                <div className="flex gap-3 pt-2">
                                    <button onClick={() => setEditTarget(null)} className="flex-1 px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-sm font-semibold transition-colors">
                                        Cancel
                                    </button>
                                    <button onClick={handleUpdateUser} disabled={editing} className="flex-1 px-4 py-3 bg-brand-primary hover:bg-brand-secondary text-white rounded-xl text-sm font-semibold shadow-md shadow-brand-primary/20 transition-all disabled:opacity-70 flex items-center justify-center gap-2">
                                        {editing ? 'Saving…' : 'Save Changes'}
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {impersonatingId && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[10001] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm"
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 10 }}
                            animate={{ scale: 1, y: 0 }}
                            className="bg-white rounded-2xl px-8 py-6 text-sm font-semibold text-slate-700 shadow-2xl flex items-center gap-3 border border-slate-100"
                        >
                            <div className="w-5 h-5 border-2 border-brand-primary border-t-transparent rounded-full animate-spin" />
                            Switching account…
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};
