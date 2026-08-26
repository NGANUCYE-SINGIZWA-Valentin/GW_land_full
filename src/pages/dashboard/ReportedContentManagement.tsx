import React, { useEffect, useMemo, useState } from 'react';
import { StatCard } from '@/components/dashboard/StatCard';
import { TableBlueprint, ColumnConfig } from '@/components/dashboard/TableBlueprint';
import { DrawerBlueprint } from '@/components/dashboard/DrawerBlueprint';
import { AlertDialog } from '@/components/ui/AlertDialog';
import { DashboardButton } from '@/components/ui/DashboardButton';
import {
    Flag,
    CheckCircle2,
    XCircle,
    AlertTriangle,
    Home,
    CalendarDays,
    Clock,
    Mail,
} from 'lucide-react';
import { useAuth } from '@/components/auth/AuthContext';
import * as adminApi from '@/api/admin';
import { ApiError } from '@/api/client';
import type { Report, ReportReasonCategory } from '@/api/types';

type KpiFilter = 'all' | 'pending' | 'reviewed' | 'dismissed';

const REASON_LABEL: Record<ReportReasonCategory, string> = {
    fraudulent: 'Fraudulent listing',
    incorrect_info: 'Incorrect information',
    already_sold: 'Already sold',
    inappropriate: 'Inappropriate content',
    duplicate: 'Duplicate listing',
    other: 'Other',
};

const STATUS_STYLE: Record<Report['status'], string> = {
    reviewed: 'bg-emerald-50 border-emerald-100 text-emerald-600',
    pending: 'bg-amber-50 border-amber-100 text-amber-600',
    dismissed: 'bg-slate-100 border-slate-200 text-slate-500',
};
const STATUS_DOT: Record<Report['status'], string> = {
    reviewed: 'bg-emerald-500', pending: 'bg-amber-500', dismissed: 'bg-slate-400',
};

export const ReportedContentManagement: React.FC = () => {
    const { user } = useAuth();
    const isAdmin = user?.role === 'Administrator';

    const [reports, setReports] = useState<Report[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [activeKpiFilter, setActiveKpiFilter] = useState<KpiFilter>('all');

    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [selectedReport, setSelectedReport] = useState<Report | null>(null);
    const [actionError, setActionError] = useState('');

    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [reportToDelete, setReportToDelete] = useState<Report | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const loadReports = () => {
        setLoading(true);
        adminApi.getReports()
            .then((res) => setReports(res.reports))
            .catch(() => setError('Failed to load reports.'))
            .finally(() => setLoading(false));
    };

    useEffect(() => { loadReports(); }, []);

    const kpiCounts = useMemo(() => ({
        all: reports.length,
        pending: reports.filter((r) => r.status === 'pending').length,
        reviewed: reports.filter((r) => r.status === 'reviewed').length,
        dismissed: reports.filter((r) => r.status === 'dismissed').length,
    }), [reports]);

    const filteredReports = useMemo(() => {
        switch (activeKpiFilter) {
            case 'pending': return reports.filter((r) => r.status === 'pending');
            case 'reviewed': return reports.filter((r) => r.status === 'reviewed');
            case 'dismissed': return reports.filter((r) => r.status === 'dismissed');
            default: return reports;
        }
    }, [reports, activeKpiFilter]);

    const openDrawer = (report: Report) => {
        setSelectedReport(report);
        setActionError('');
        setIsDrawerOpen(true);
    };

    const handleUpdateStatus = async (report: Report, status: 'reviewed' | 'dismissed') => {
        setActionError('');
        try {
            await adminApi.updateReportStatus(report.id, status);
            setIsDrawerOpen(false);
            loadReports();
        } catch (err) {
            setActionError(err instanceof ApiError ? err.message : 'Failed to update report.');
        }
    };

    const askDelete = (report: Report) => {
        setReportToDelete(report);
        setIsDeleteDialogOpen(true);
    };

    const confirmDelete = async () => {
        if (!reportToDelete) return;
        setIsDeleting(true);
        try {
            await adminApi.deleteReport(reportToDelete.id);
            setIsDeleteDialogOpen(false);
            setReportToDelete(null);
            setIsDrawerOpen(false);
            loadReports();
        } catch (err) {
            setError(err instanceof ApiError ? err.message : 'Failed to delete report.');
        } finally {
            setIsDeleting(false);
        }
    };

    const columns: ColumnConfig<Report>[] = [
        {
            header: 'Listing',
            render: (r) => (
                <div className="flex flex-col min-w-0">
                    <span className="text-base font-medium tracking-tight text-slate-700 truncate max-w-[180px]">
                        {r.listing_title || 'Listing removed'}
                    </span>
                    <span className="text-xs text-slate-400 font-normal">{r.listing_slug}</span>
                </div>
            ),
        },
        {
            header: 'Reason',
            render: (r) => (
                <span className="text-slate-700 text-base font-medium tracking-tight antialiased truncate block max-w-[240px]" title={r.reason || undefined}>
                    {REASON_LABEL[r.reason_category]}
                </span>
            ),
        },
        { header: 'Reporter', render: (r) => r.reporter_email || 'Registered user', cellClassName: 'text-slate-700 text-base font-medium tracking-tight antialiased' },
        { header: 'Date', render: (r) => new Date(r.created_at).toLocaleDateString(), cellClassName: 'text-slate-700 text-base font-medium tracking-tight antialiased' },
        {
            header: 'Status',
            render: (r) => (
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium tracking-tight antialiased border ${STATUS_STYLE[r.status]}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${STATUS_DOT[r.status]}`} />
                    {r.status}
                </span>
            ),
        },
        {
            header: 'Action',
            headerClassName: 'text-right',
            cellClassName: 'text-right',
            render: (r) => (
                <button
                    onClick={() => openDrawer(r)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-brand-primary bg-brand-primary/5 border border-brand-primary/10 rounded-lg hover:bg-brand-primary/10 transition-colors cursor-pointer"
                >
                    View Details
                </button>
            ),
        },
    ];

    const kpiCards: { filter: KpiFilter; title: string; icon: React.ReactNode; countKey: keyof typeof kpiCounts }[] = [
        { filter: 'all', title: 'All Reports', icon: <Flag size={20} />, countKey: 'all' },
        { filter: 'pending', title: 'Pending Review', icon: <Clock size={20} />, countKey: 'pending' },
        { filter: 'reviewed', title: 'Reviewed', icon: <CheckCircle2 size={20} />, countKey: 'reviewed' },
        { filter: 'dismissed', title: 'Dismissed', icon: <XCircle size={20} />, countKey: 'dismissed' },
    ];

    return (
        <div className="w-full min-w-0 space-y-8 font-sans antialiased">

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
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
                <div className="px-1 mb-4">
                    <h3 className="text-sm font-semibold text-slate-700 tracking-tight">Reported Listings</h3>
                    <p className="text-xs text-slate-400 mt-0.5">Review listings flagged by visitors and buyers.</p>
                </div>
                {error && <p className="mb-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>}
                <TableBlueprint
                    data={filteredReports}
                    columns={columns}
                    isLoading={loading}
                    emptyMessage={loading ? 'Loading…' : 'No reports matched your criteria.'}
                    searchPlaceholder="Search reports..."
                    searchKeys={['reason', 'listing_title', 'reporter_email']}
                    filterConfig={[
                        {
                            accessorKey: 'status',
                            label: 'Status',
                            options: [
                                { label: 'Pending', value: 'pending' },
                                { label: 'Reviewed', value: 'reviewed' },
                                { label: 'Dismissed', value: 'dismissed' },
                            ],
                        },
                    ]}
                    totalItems={filteredReports.length}
                    hasPrevPage={false}
                    hasNextPage={false}
                />
            </div>

            <AlertDialog
                isOpen={isDeleteDialogOpen}
                onClose={() => { setIsDeleteDialogOpen(false); setReportToDelete(null); }}
                onConfirm={confirmDelete}
                title="Delete Report"
                description="Are you sure you want to delete this report? This action cannot be undone."
                confirmLabel="Delete"
                cancelLabel="Cancel"
                variant="danger"
                isLoading={isDeleting}
            />

            {selectedReport && (
                <DrawerBlueprint
                    isOpen={isDrawerOpen}
                    onClose={() => setIsDrawerOpen(false)}
                    title="Report Details"
                    footer={
                        <>
                            {isAdmin && (
                                <DashboardButton variant="danger-outline" onClick={() => askDelete(selectedReport)}>Delete</DashboardButton>
                            )}
                            {selectedReport.status === 'pending' && (
                                <>
                                    <DashboardButton variant="outline" onClick={() => handleUpdateStatus(selectedReport, 'dismissed')}>Dismiss</DashboardButton>
                                    <DashboardButton variant="primary" onClick={() => handleUpdateStatus(selectedReport, 'reviewed')}>Mark Reviewed</DashboardButton>
                                </>
                            )}
                        </>
                    }
                >
                    {actionError && <p className="mb-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{actionError}</p>}

                    <div>
                        <div className="flex items-center gap-2 mb-3">
                            <span className="text-xs font-medium uppercase tracking-wider text-slate-400">Reported Listing</span>
                            <div className="flex-1 h-px bg-slate-100" />
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className="text-sm font-semibold text-slate-700 block mb-1.5">Listing</label>
                                <div className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-base font-medium text-slate-700 flex items-center gap-2.5">
                                    <Home size={18} className="text-slate-400 flex-shrink-0" />
                                    <span className="truncate">{selectedReport.listing_title || 'Listing removed'}</span>
                                </div>
                            </div>
                            <div>
                                <label className="text-sm font-semibold text-slate-700 block mb-1.5">Reporter</label>
                                <div className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-base font-medium text-slate-700 flex items-center gap-2.5">
                                    <Mail size={18} className="text-slate-400 flex-shrink-0" />
                                    <span className="truncate">{selectedReport.reporter_email || 'Registered user (email hidden)'}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div>
                        <div className="flex items-center gap-2 mb-3">
                            <span className="text-xs font-medium uppercase tracking-wider text-slate-400">Report Details</span>
                            <div className="flex-1 h-px bg-slate-100" />
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className="text-sm font-semibold text-slate-700 block mb-1.5">Reason</label>
                                <div className="w-full px-3.5 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 leading-relaxed flex items-start gap-2.5">
                                    <AlertTriangle size={18} className="text-slate-400 flex-shrink-0 mt-0.5" />
                                    <div>
                                        <span className="block font-semibold">{REASON_LABEL[selectedReport.reason_category]}</span>
                                        {selectedReport.reason && <span className="block mt-1 text-slate-500 font-normal">{selectedReport.reason}</span>}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div>
                        <div className="flex items-center gap-2 mb-3">
                            <span className="text-xs font-medium uppercase tracking-wider text-slate-400">Status</span>
                            <div className="flex-1 h-px bg-slate-100" />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
                                <div className="flex items-center gap-2 text-slate-400 mb-2">
                                    <Flag size={16} />
                                    <span className="text-xs font-medium">Status</span>
                                </div>
                                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${STATUS_STYLE[selectedReport.status]}`}>
                                    <span className={`w-1.5 h-1.5 rounded-full ${STATUS_DOT[selectedReport.status]}`} />
                                    {selectedReport.status}
                                </span>
                            </div>
                            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
                                <div className="flex items-center gap-2 text-slate-400 mb-1">
                                    <CalendarDays size={16} />
                                    <span className="text-xs font-medium">Reported On</span>
                                </div>
                                <p className="text-sm font-semibold text-slate-700">{new Date(selectedReport.created_at).toLocaleDateString()}</p>
                            </div>
                        </div>
                    </div>
                </DrawerBlueprint>
            )}
        </div>
    );
};
