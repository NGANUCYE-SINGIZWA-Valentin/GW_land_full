import React, { useEffect, useState, useMemo } from 'react';
import { TableBlueprint, ColumnConfig } from '@/components/dashboard/TableBlueprint';
import { DashboardButton } from '@/components/ui/DashboardButton';
import { CheckCircle2, Clock, XCircle, Star, Repeat, Smartphone, CreditCard, Landmark, Info } from 'lucide-react';
import { useCurrency } from '@/context/CurrencyContext';
import { useNavigate } from 'react-router-dom';
import * as paymentsApi from '@/api/payments';
import * as listingsApi from '@/api/listings';
import { ApiError } from '@/api/client';
import type { Payment, PricingPlan, PaymentProvider, PlanKey } from '@/api/types';
import type { MyListing } from '@/api/types';

const STATUS_BADGE: Record<Payment['status'], { bg: string; icon: React.ReactNode; label: string }> = {
    completed: { bg: 'bg-emerald-50 border-emerald-100 text-emerald-600', icon: <CheckCircle2 size={14} />, label: 'Completed' },
    pending: { bg: 'bg-amber-50 border-amber-100 text-amber-600', icon: <Clock size={14} />, label: 'Awaiting confirmation' },
    failed: { bg: 'bg-red-50 border-red-100 text-red-600', icon: <XCircle size={14} />, label: 'Failed' },
};

const PROVIDER_OPTIONS: { value: PaymentProvider; label: string; icon: React.ReactNode }[] = [
    { value: 'momo', label: 'MTN Mobile Money', icon: <Smartphone size={16} /> },
    { value: 'card', label: 'Debit / Credit Card', icon: <CreditCard size={16} /> },
    { value: 'bank_transfer', label: 'Bank Transfer', icon: <Landmark size={16} /> },
];

interface PayModalState {
    planKey: PlanKey;
    listingId?: string;
}

export const SellerPricing: React.FC = () => {
    const navigate = useNavigate();
    const { formatCurrency } = useCurrency();

    const [plans, setPlans] = useState<PricingPlan[]>([]);
    const [payments, setPayments] = useState<Payment[]>([]);
    const [listings, setListings] = useState<MyListing[]>([]);
    const [loading, setLoading] = useState(true);

    const [payModal, setPayModal] = useState<PayModalState | null>(null);
    const [provider, setProvider] = useState<PaymentProvider>('momo');
    const [selectedListingId, setSelectedListingId] = useState('');
    const [referenceNote, setReferenceNote] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState('');

    const loadAll = () => {
        setLoading(true);
        Promise.all([
            paymentsApi.getPricingPlans(),
            paymentsApi.getMyPayments(),
            listingsApi.getMyListings(),
        ])
            .then(([plansRes, paymentsRes, listingsRes]) => {
                setPlans(plansRes.plans);
                setPayments(paymentsRes.payments);
                setListings(listingsRes.listings.filter((l) => l.status === 'approved'));
            })
            .finally(() => setLoading(false));
    };

    useEffect(() => { loadAll(); }, []);

    const planByKey = (key: PlanKey) => plans.find((p) => p.plan_key === key);

    const openPayModal = (planKey: PlanKey, listingId?: string) => {
        setPayModal({ planKey, listingId });
        setProvider('momo');
        setSelectedListingId(listingId || '');
        setReferenceNote('');
        setSubmitError('');
    };

    const handlePay = async () => {
        if (!payModal) return;
        if (payModal.planKey === 'featured_placement' && !selectedListingId) {
            setSubmitError('Choose which listing to feature.');
            return;
        }
        setSubmitting(true);
        setSubmitError('');
        try {
            await paymentsApi.createPayment({
                plan_key: payModal.planKey,
                provider,
                currency: 'RWF',
                listing_id: payModal.planKey === 'featured_placement' ? selectedListingId : undefined,
                reference_note: referenceNote.trim() || undefined,
            });
            setPayModal(null);
            loadAll();
        } catch (err) {
            setSubmitError(err instanceof ApiError ? err.message : 'Something went wrong.');
        } finally {
            setSubmitting(false);
        }
    };

    const columns: ColumnConfig<Payment>[] = useMemo(() => [
        { header: 'Date', render: (p) => new Date(p.created_at).toLocaleDateString(), cellClassName: 'text-slate-700 text-base font-medium tracking-tight antialiased' },
        { header: 'Service', render: (p) => planByKey(p.plan_key)?.label || p.plan_key, cellClassName: 'text-slate-700 text-base font-medium tracking-tight antialiased' },
        { header: 'Amount', render: (p) => formatCurrency(Number(p.amount)), cellClassName: 'text-slate-700 text-base font-semibold tracking-tight antialiased' },
        { header: 'Method', render: (p) => PROVIDER_OPTIONS.find((o) => o.value === p.provider)?.label || p.provider, cellClassName: 'text-slate-600 text-base font-medium tracking-tight antialiased' },
        {
            header: 'Status',
            render: (p) => {
                const c = STATUS_BADGE[p.status];
                return (
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium tracking-tight antialiased border ${c.bg}`}>
                        {c.icon} {c.label}
                    </span>
                );
            },
        },
    ], [formatCurrency]);

    const featuredPlan = planByKey('featured_placement');
    const subscriptionPlan = planByKey('subscription_monthly');
    const listingFeePlan = planByKey('listing_fee');

    return (
        <div className="w-full min-w-0 space-y-8 font-sans antialiased">

            <div>
                <div className="px-1 mb-4">
                    <h3 className="text-sm font-semibold text-slate-700 tracking-tight">Promote &amp; Subscribe</h3>
                    <p className="text-xs text-slate-400 mt-0.5">Choose a payment method — every payment is confirmed manually by our team once received.</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex flex-col">
                        <div className="p-2.5 rounded-xl bg-amber-50 text-amber-500 w-fit mb-4">
                            <Star size={20} />
                        </div>
                        <h4 className="text-base font-semibold text-slate-800">{featuredPlan?.label || 'Featured Homepage Placement'}</h4>
                        <p className="text-sm text-slate-400 mt-1 flex-1">{featuredPlan?.description}</p>
                        <p className="text-2xl font-bold text-slate-800 mt-4">
                            {featuredPlan ? formatCurrency(Number(featuredPlan.amount_rwf)) : '—'}
                        </p>
                        <DashboardButton
                            variant="primary"
                            className="mt-4"
                            disabled={!featuredPlan || listings.length === 0}
                            onClick={() => openPayModal('featured_placement')}
                        >
                            {listings.length === 0 ? 'No approved listings yet' : 'Feature a Listing'}
                        </DashboardButton>
                    </div>

                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex flex-col">
                        <div className="p-2.5 rounded-xl bg-brand-primary/10 text-brand-primary w-fit mb-4">
                            <Repeat size={20} />
                        </div>
                        <h4 className="text-base font-semibold text-slate-800">{subscriptionPlan?.label || 'Agent Monthly Plan'}</h4>
                        <p className="text-sm text-slate-400 mt-1 flex-1">{subscriptionPlan?.description}</p>
                        <p className="text-2xl font-bold text-slate-800 mt-4">
                            {subscriptionPlan ? `${formatCurrency(Number(subscriptionPlan.amount_rwf))}/mo` : '—'}
                        </p>
                        <DashboardButton
                            variant="primary"
                            className="mt-4"
                            disabled={!subscriptionPlan}
                            onClick={() => openPayModal('subscription_monthly')}
                        >
                            Subscribe
                        </DashboardButton>
                    </div>
                </div>
                {listingFeePlan && (
                    <div className="flex items-center gap-2 text-xs text-slate-500 mt-4 px-1">
                        <Info size={16} />
                        Reference: listing submissions currently carry a {listingFeePlan.label.toLowerCase()} of {formatCurrency(Number(listingFeePlan.amount_rwf))} - not yet enforced at submission time.
                    </div>
                )}
            </div>

            <div>
                <div className="px-1 mb-4">
                    <h3 className="text-sm font-semibold text-slate-700 tracking-tight">Payment History</h3>
                    <p className="text-xs text-slate-400 mt-0.5">All payments and billing activity for your account.</p>
                </div>
                <TableBlueprint
                    data={payments}
                    columns={columns}
                    isLoading={loading}
                    emptyMessage={loading ? 'Loading…' : 'No payments yet.'}
                    searchPlaceholder="Search payments..."
                    searchKeys={['plan_key', 'provider']}
                    totalItems={payments.length}
                    hasPrevPage={false}
                    hasNextPage={false}
                />
            </div>

            {payModal && (
                <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/40" onClick={() => setPayModal(null)} />
                    <div className="relative w-full max-w-sm bg-white rounded-2xl border border-slate-200 shadow-xl p-6">
                        <h3 className="text-base font-semibold text-slate-800 mb-1">
                            {payModal.planKey === 'featured_placement' ? 'Feature a Listing' : 'Subscribe to Monthly Plan'}
                        </h3>
                        <p className="text-xs text-slate-400 mb-4">
                            {payModal.planKey === 'featured_placement'
                                ? `${formatCurrency(Number(featuredPlan?.amount_rwf || 0))} - 30 days on the homepage.`
                                : `${formatCurrency(Number(subscriptionPlan?.amount_rwf || 0))} per month.`}
                        </p>

                        {payModal.planKey === 'featured_placement' && (
                            <label className="block text-xs font-semibold text-slate-600 mb-4">
                                Listing to feature
                                <select
                                    value={selectedListingId}
                                    onChange={(e) => setSelectedListingId(e.target.value)}
                                    className="mt-1.5 w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-brand-primary"
                                >
                                    <option value="">Select a listing…</option>
                                    {listings.map((l) => (
                                        <option key={l.id} value={l.id}>{l.title}</option>
                                    ))}
                                </select>
                            </label>
                        )}

                        <label className="block text-xs font-semibold text-slate-600 mb-4">
                            Payment method
                            <div className="mt-1.5 grid grid-cols-1 gap-2">
                                {PROVIDER_OPTIONS.map((opt) => (
                                    <button
                                        key={opt.value}
                                        type="button"
                                        onClick={() => setProvider(opt.value)}
                                        className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl border text-sm font-medium text-left transition-colors ${provider === opt.value ? 'border-brand-primary bg-brand-primary/5 text-brand-primary' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                                    >
                                        {opt.icon} {opt.label}
                                    </button>
                                ))}
                            </div>
                        </label>

                        <label className="block text-xs font-semibold text-slate-600 mb-4">
                            Payment reference (optional)
                            <input
                                type="text"
                                value={referenceNote}
                                onChange={(e) => setReferenceNote(e.target.value)}
                                placeholder="e.g. MoMo transaction ID"
                                className="mt-1.5 w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-brand-primary"
                            />
                        </label>

                        <p className="text-xs text-slate-400 mb-4">
                            This records your payment as pending. Send the amount via {PROVIDER_OPTIONS.find(o => o.value === provider)?.label} to our team, then we'll confirm it here — no charge happens automatically.
                        </p>

                        {submitError && <p className="text-xs font-semibold text-red-500 mb-3">{submitError}</p>}

                        <div className="flex gap-2">
                            <DashboardButton variant="outline" fullWidth={false} onClick={() => setPayModal(null)}>Cancel</DashboardButton>
                            <DashboardButton variant="primary" fullWidth={false} onClick={handlePay} disabled={submitting}>
                                {submitting ? 'Submitting…' : 'Confirm Payment Intent'}
                            </DashboardButton>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
