import React, { useEffect, useState } from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { StatCard } from '@/components/dashboard/StatCard';
import { TableBlueprint, ColumnConfig } from '@/components/dashboard/TableBlueprint';
import { DashboardButton } from '@/components/ui/DashboardButton';
import { AlertDialog } from '@/components/ui/AlertDialog';
import {
    DollarSign, Clock, CheckCircle2, XCircle, Settings2,
} from 'lucide-react';
import * as adminApi from '@/api/admin';
import * as paymentsApi from '@/api/payments';
import { ApiError } from '@/api/client';
import type { AdminPayment, RevenueSummary, PricingPlan, PlanKey } from '@/api/types';

const STATUS_BADGE: Record<string, { bg: string; icon: React.ReactNode; label: string }> = {
    completed: { bg: 'bg-emerald-50 border-emerald-100 text-emerald-600', icon: <CheckCircle2 size={14} />, label: 'Completed' },
    confirmed: { bg: 'bg-emerald-50 border-emerald-100 text-emerald-600', icon: <CheckCircle2 size={14} />, label: 'Completed' },
    approved: { bg: 'bg-emerald-50 border-emerald-100 text-emerald-600', icon: <CheckCircle2 size={14} />, label: 'Completed' },
    pending: { bg: 'bg-amber-50 border-amber-100 text-amber-600', icon: <Clock size={14} />, label: 'Pending' },
    failed: { bg: 'bg-red-50 border-red-100 text-red-600', icon: <XCircle size={14} />, label: 'Failed' },
    rejected: { bg: 'bg-red-50 border-red-100 text-red-600', icon: <XCircle size={14} />, label: 'Rejected' },
};

const PLAN_LABEL: Record<string, string> = {
    listing_fee: 'Listing Fee',
    featured_placement: 'Featured Placement',
    subscription: 'Subscription',
};

const formatDay = (iso: string) => new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

export const AdminRevenue: React.FC = () => {
    const [payments, setPayments] = useState<AdminPayment[]>([]);
    const [summary, setSummary] = useState<RevenueSummary | null>(null);
    const [loading, setLoading] = useState(true);

    const [confirmTarget, setConfirmTarget] = useState<AdminPayment | null>(null);
    const [confirmAction, setConfirmAction] = useState<'confirm' | 'reject' | null>(null);
    const [actionLoading, setActionLoading] = useState(false);
    const [actionError, setActionError] = useState('');

    const [plans, setPlans] = useState<PricingPlan[]>([]);
    const [editingPlan, setEditingPlan] = useState<PlanKey | null>(null);
    const [editAmount, setEditAmount] = useState('');
    const [savingPlan, setSavingPlan] = useState(false);

    const loadAll = () => {
        setLoading(true);
        Promise.all([
            adminApi.getAllPayments(),
            adminApi.getRevenueSummary(),
            paymentsApi.getPricingPlans(),
        ])
            .then(([paymentsRes, summaryRes, pricingRes]) => {
                setPayments(paymentsRes?.payments || []);
                setSummary(summaryRes || null);
                setPlans(pricingRes?.plans || []);
            })
            .catch(() => {
                setPayments([]);
                setSummary(null);
                setPlans([]);
            })
            .finally(() => setLoading(false));
    };

    useEffect(() => { loadAll(); }, []);

    const askAction = (payment: AdminPayment, action: 'confirm' | 'reject') => {
        setConfirmTarget(payment);
        setConfirmAction(action);
        setActionError('');
    };

    const runAction = async () => {
        if (!confirmTarget || !confirmAction) return;
        setActionLoading(true);
        setActionError('');
        try {
            if (confirmAction === 'confirm') await adminApi.confirmPayment(confirmTarget.id);
            else await adminApi.rejectPayment(confirmTarget.id);
            setConfirmTarget(null);
            setConfirmAction(null);
            loadAll();
        } catch (err) {
            setActionError(err instanceof ApiError ? err.message : 'Something went wrong.');
        } finally {
            setActionLoading(false);
        }
    };

    const startEditPlan = (plan: PricingPlan) => {
        setEditingPlan(plan.plan_key);
        setEditAmount(plan.amount_rwf);
    };

    const savePlan = async (planKey: PlanKey) => {
        setSavingPlan(true);
        try {
            await adminApi.updatePricingPlan(planKey, { amount_rwf: Number(editAmount) });
            setEditingPlan(null);
            loadAll();
        } catch {
            // surfaced implicitly by amount not changing; keep it simple here
        } finally {
            setSavingPlan(false);
        }
    };

    const columns: ColumnConfig<AdminPayment>[] = [
        { header: 'Date', render: (p) => new Date(p.created_at).toLocaleDateString(), cellClassName: 'text-slate-700 text-base font-medium tracking-tight antialiased' },
        { header: 'Seller', render: (p) => <span className="text-slate-700 text-base font-medium">{p.user_name}</span> },
        { header: 'Service', render: (p) => PLAN_LABEL[p.payment_type] || p.payment_type, cellClassName: 'text-slate-700 text-base font-medium tracking-tight antialiased' },
        { header: 'Amount', render: (p) => `${p.currency} ${Number(p.amount).toLocaleString()}`, cellClassName: 'text-slate-700 text-base font-semibold tracking-tight antialiased' },
        { header: 'Method', accessorKey: 'provider', cellClassName: 'text-slate-600 text-base font-medium tracking-tight antialiased capitalize' },
        { header: 'Reference', render: (p) => <span className="text-slate-500 text-sm truncate max-w-[140px] block">{p.reference_note || '—'}</span> },
        {
            header: 'Status',
            render: (p) => {
                const statusKey = String(p.status || 'pending').toLowerCase();
                const c = STATUS_BADGE[statusKey] || {
                    bg: 'bg-slate-100 border-slate-200 text-slate-600',
                    icon: <Clock size={14} />,
                    label: p.status || 'Unknown',
                };
                return <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium tracking-tight antialiased border ${c.bg}`}>{c.icon} {c.label}</span>;
            },
        },
        {
            header: 'Action',
            headerClassName: 'text-right',
            cellClassName: 'text-right',
            render: (p) => p.status === 'pending' ? (
                <div className="flex gap-1.5 justify-end">
                    <button onClick={() => askAction(p, 'confirm')} className="px-2.5 py-1.5 text-xs font-semibold text-emerald-600 bg-emerald-50 border border-emerald-100 rounded-lg hover:bg-emerald-100 transition-colors cursor-pointer">Confirm</button>
                    <button onClick={() => askAction(p, 'reject')} className="px-2.5 py-1.5 text-xs font-semibold text-red-600 bg-red-50 border border-red-100 rounded-lg hover:bg-red-100 transition-colors cursor-pointer">Reject</button>
                </div>
            ) : <span className="text-slate-300 text-xs">—</span>,
        },
    ];

    const chartData = (summary?.revenue_by_day || []).map((d) => ({ day: formatDay(d.day), revenue: Number(d.total_rwf) }));

    return (
        <div className="w-full min-w-0 space-y-8 font-sans antialiased">

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard title="Total Revenue (RWF)" value={summary ? Number(summary.total_rwf).toLocaleString() : '—'} icon={<DollarSign size={20} />} showSubtext={false} />
                <StatCard title="Completed Payments" value={summary?.completed_count ?? '—'} icon={<CheckCircle2 size={20} />} showSubtext={false} />
                <StatCard title="Pending Confirmation" value={summary?.pending_count ?? '—'} icon={<Clock size={20} />} showSubtext={false} />
                <StatCard title="Total Revenue (USD)" value={summary ? `$${Number(summary.total_usd).toLocaleString()}` : '—'} icon={<DollarSign size={20} />} showSubtext={false} />
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 sm:p-6">
                <h2 className="text-sm sm:text-base font-medium tracking-tight antialiased text-slate-700 mb-1">Revenue — last 30 days</h2>
                <p className="text-xs text-slate-400 mb-4">Confirmed payments only.</p>
                {chartData.every((d) => d.revenue === 0) ? (
                    <div className="h-48 flex items-center justify-center text-sm text-slate-400">No confirmed revenue in the last 30 days yet.</div>
                ) : (
                    <div className="h-56 -ml-2">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={chartData} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                                <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={{ stroke: '#E2E8F0' }} tickLine={false} interval="preserveStartEnd" minTickGap={24} />
                                <YAxis tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} width={40} />
                                <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #E2E8F0', fontSize: 12 }} formatter={(v) => [`RWF ${Number(v).toLocaleString()}`, 'Revenue']} />
                                <Bar dataKey="revenue" fill="#1B395F" radius={[6, 6, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                )}
            </div>

            <div>
                <div className="px-1 mb-4 flex items-center gap-2">
                    <Settings2 size={16} className="text-slate-400" />
                    <h3 className="text-sm font-semibold text-slate-700 tracking-tight">Pricing Configuration</h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {plans.map((plan) => (
                        <div key={plan.plan_key} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
                            <p className="text-sm font-semibold text-slate-700">{plan.label}</p>
                            <p className="text-xs text-slate-400 mt-1 mb-3">{plan.description}</p>
                            {editingPlan === plan.plan_key ? (
                                <div className="flex items-center gap-2">
                                    <input
                                        type="number"
                                        value={editAmount}
                                        onChange={(e) => setEditAmount(e.target.value)}
                                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-brand-primary"
                                    />
                                    <DashboardButton variant="primary" fullWidth={false} onClick={() => savePlan(plan.plan_key)} disabled={savingPlan}>Save</DashboardButton>
                                </div>
                            ) : (
                                <div className="flex items-center justify-between">
                                    <span className="text-lg font-bold text-slate-800">RWF {Number(plan.amount_rwf).toLocaleString()}</span>
                                    <button onClick={() => startEditPlan(plan)} className="text-xs font-semibold text-brand-primary hover:underline cursor-pointer">Edit</button>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            <div>
                <div className="px-1 mb-4">
                    <h3 className="text-sm font-semibold text-slate-700 tracking-tight">All Payments</h3>
                    <p className="text-xs text-slate-400 mt-0.5">Every payment across the platform. Confirming here is the only thing that unlocks a featured listing or activates a subscription.</p>
                </div>
                <TableBlueprint
                    data={payments}
                    columns={columns}
                    isLoading={loading}
                    emptyMessage={loading ? 'Loading…' : 'No payments yet.'}
                    searchPlaceholder="Search by seller or reference..."
                    searchKeys={['user_name', 'user_email', 'reference_note']}
                    filterConfig={[
                        {
                            accessorKey: 'status',
                            label: 'Status',
                            options: [
                                { label: 'Pending', value: 'pending' },
                                { label: 'Completed', value: 'completed' },
                                { label: 'Failed', value: 'failed' },
                            ],
                        },
                    ]}
                    totalItems={payments.length}
                    hasPrevPage={false}
                    hasNextPage={false}
                />
            </div>

            <AlertDialog
                isOpen={!!confirmTarget}
                onClose={() => { setConfirmTarget(null); setConfirmAction(null); }}
                onConfirm={runAction}
                title={confirmAction === 'confirm' ? 'Confirm Payment' : 'Reject Payment'}
                description={
                    confirmAction === 'confirm'
                        ? `Confirm that "${confirmTarget?.user_name}" actually paid ${confirmTarget?.currency} ${confirmTarget ? Number(confirmTarget.amount).toLocaleString() : ''}? This will ${confirmTarget?.payment_type === 'featured_placement' ? 'feature their listing' : confirmTarget?.payment_type === 'subscription' ? 'activate their subscription' : 'mark the fee as paid'} immediately.`
                        : `Mark this payment as failed? The seller will need to submit a new payment.`
                }
                confirmLabel={confirmAction === 'confirm' ? 'Confirm' : 'Reject'}
                cancelLabel="Cancel"
                variant={confirmAction === 'reject' ? 'danger' : 'success'}
                isLoading={actionLoading}
            />
            {actionError && <p className="text-xs font-semibold text-red-500 px-1">{actionError}</p>}
        </div>
    );
};
