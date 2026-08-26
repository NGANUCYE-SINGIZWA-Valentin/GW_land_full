import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Settings, Save, Loader2, Info, CheckCircle2, RefreshCw } from 'lucide-react';
import * as adminApi from '@/api/admin';
import * as paymentsApi from '@/api/payments';
import type { PricingPlan, PlanKey } from '@/api/types';
import { useCurrency } from '@/context/CurrencyContext';
import { DashboardButton } from '@/components/ui/DashboardButton';

const PLAN_ICONS: Record<string, string> = {
    listing_fee: '📋',
    featured_placement: '⭐',
    subscription_monthly: '🔄',
};

export const AdminSettings: React.FC = () => {
    const { formatCurrency } = useCurrency();
    const [plans, setPlans] = useState<PricingPlan[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState<string | null>(null);
    const [saved, setSaved] = useState<string | null>(null);
    const [edits, setEdits] = useState<Record<string, { rwf: string; usd: string }>>({});

    useEffect(() => { loadPlans(); }, []);

    const loadPlans = async () => {
        setLoading(true);
        try {
            const res = await paymentsApi.getPricingPlans();
            setPlans(res.plans);
            const init: Record<string, { rwf: string; usd: string }> = {};
            res.plans.forEach(p => {
                init[p.plan_key] = {
                    rwf: String(p.amount_rwf || ''),
                    usd: String(p.amount_usd || ''),
                };
            });
            setEdits(init);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (planKey: string) => {
        setSaving(planKey);
        try {
            await adminApi.updatePricingPlan(planKey as PlanKey, {
                amount_rwf: Number(edits[planKey].rwf),
                amount_usd: edits[planKey].usd ? Number(edits[planKey].usd) : null,
            });
            setSaved(planKey);
            setTimeout(() => setSaved(null), 2500);
            await loadPlans();
        } catch (err) {
            console.error(err);
        } finally {
            setSaving(null);
        }
    };

    const handleChange = (key: string, field: 'rwf' | 'usd', val: string) => {
        setEdits(prev => ({ ...prev, [key]: { ...prev[key], [field]: val } }));
    };

    const isDirty = (plan: PricingPlan) =>
        edits[plan.plan_key]?.rwf !== String(plan.amount_rwf || '') ||
        edits[plan.plan_key]?.usd !== String(plan.amount_usd || '');

    return (
        <div className="w-full min-w-0 space-y-8 font-sans antialiased">
            {/* Header */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6 sm:p-8 text-white shadow-xl border border-slate-700">
                <div className="absolute top-0 right-0 -translate-y-8 translate-x-8 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
                <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-semibold border border-indigo-500/30">
                            <Settings size={12} /> Platform Configuration
                        </div>
                        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Settings &amp; Pricing</h1>
                        <p className="text-sm text-slate-400 max-w-xl">Configure global pricing plans for sellers. Changes reflect immediately on the Seller Pricing page.</p>
                    </div>
                    <button
                        onClick={loadPlans}
                        className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold border border-white/20 transition-all cursor-pointer backdrop-blur-sm"
                    >
                        <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Refresh
                    </button>
                </div>
            </div>

            {/* Pricing Plans Card */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/80 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-indigo-500/10 text-indigo-600 flex items-center justify-center">
                        <Info size={16} />
                    </div>
                    <div>
                        <h3 className="text-sm font-extrabold text-slate-800 tracking-tight">Pricing Plans</h3>
                        <p className="text-xs text-slate-500">Edit prices below and click Save for each plan individually.</p>
                    </div>
                </div>

                {loading ? (
                    <div className="flex items-center justify-center py-16 gap-3 text-slate-400">
                        <Loader2 className="animate-spin" size={24} />
                        <span className="text-sm font-medium">Loading pricing plans…</span>
                    </div>
                ) : (
                    <div className="divide-y divide-slate-100">
                        {plans.map((plan) => (
                            <motion.div
                                key={plan.plan_key}
                                layout
                                className="p-5 sm:p-6 hover:bg-slate-50/50 transition-colors"
                            >
                                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
                                    {/* Plan Info */}
                                    <div className="flex items-start gap-4 flex-1">
                                        <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border border-indigo-100 flex items-center justify-center text-xl flex-shrink-0">
                                            {PLAN_ICONS[plan.plan_key] || '💳'}
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-extrabold text-slate-800">{plan.label}</h4>
                                            <p className="text-xs text-slate-500 mt-0.5 max-w-xs">{plan.description}</p>
                                            <div className="mt-2 text-xs font-mono font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md inline-block">
                                                {plan.plan_key}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Price Inputs */}
                                    <div className="flex flex-col sm:flex-row items-end gap-3 lg:gap-4">
                                        <div className="space-y-1 w-full sm:w-36">
                                            <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Amount (RWF)</label>
                                            <input
                                                type="number"
                                                value={edits[plan.plan_key]?.rwf}
                                                onChange={e => handleChange(plan.plan_key, 'rwf', e.target.value)}
                                                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition-shadow"
                                            />
                                        </div>
                                        <div className="space-y-1 w-full sm:w-36">
                                            <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Amount (USD)</label>
                                            <input
                                                type="number"
                                                value={edits[plan.plan_key]?.usd}
                                                onChange={e => handleChange(plan.plan_key, 'usd', e.target.value)}
                                                placeholder="Optional"
                                                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition-shadow placeholder:text-slate-300"
                                            />
                                        </div>
                                        <div className="w-full sm:w-auto">
                                            <button
                                                onClick={() => handleSave(plan.plan_key)}
                                                disabled={saving === plan.plan_key || !isDirty(plan)}
                                                className={`
                                                    w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 cursor-pointer
                                                    ${saved === plan.plan_key
                                                        ? 'bg-emerald-500 text-white'
                                                        : isDirty(plan)
                                                            ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:scale-105 active:scale-95'
                                                            : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                                                    }
                                                `}
                                            >
                                                {saving === plan.plan_key ? (
                                                    <><Loader2 size={15} className="animate-spin" /> Saving…</>
                                                ) : saved === plan.plan_key ? (
                                                    <><CheckCircle2 size={15} /> Saved!</>
                                                ) : (
                                                    <><Save size={15} /> Save</>
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* Live preview */}
                                {!isDirty(plan) && (
                                    <div className="mt-3 text-xs text-slate-400 flex items-center gap-1.5">
                                        <span className="text-emerald-500">●</span>
                                        Current live price: <span className="font-bold text-slate-700">{formatCurrency(Number(plan.amount_rwf))}</span>
                                        {plan.amount_usd && <span className="text-slate-400">/ USD {Number(plan.amount_usd).toLocaleString()}</span>}
                                    </div>
                                )}
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};
