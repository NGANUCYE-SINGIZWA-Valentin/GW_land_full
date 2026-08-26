import React, { useState } from 'react';
import { TableBlueprint, ColumnConfig } from '@/components/dashboard/TableBlueprint';
import { exportToCSV, printSummaryReport } from '@/utils/ExportUtility';
import { ShieldCheck, Download, Printer, Filter, UserCheck, Key, ShieldAlert } from 'lucide-react';

interface AuditEntry {
  id: string;
  timestamp: string;
  adminName: string;
  adminEmail: string;
  action: 'USER_ROLE_CHANGE' | 'PROPERTY_APPROVAL' | 'PRICING_UPDATE' | 'ACCOUNT_IMPERSONATION' | 'CONTENT_DELETION';
  details: string;
  ipAddress: string;
}

const DUMMY_AUDIT_LOGS: AuditEntry[] = [
  {
    id: 'a1',
    timestamp: '2026-08-11 21:30:15',
    adminName: 'Admin GW',
    adminEmail: 'admin@gwland.com',
    action: 'PROPERTY_APPROVAL',
    details: 'Approved listing #104 (Prime Residential Plot Gasabo)',
    ipAddress: '197.243.12.88',
  },
  {
    id: 'a2',
    timestamp: '2026-08-11 19:45:00',
    adminName: 'Admin GW',
    adminEmail: 'admin@gwland.com',
    action: 'USER_ROLE_CHANGE',
    details: 'Promoted seller@test.com to Verified Seller status',
    ipAddress: '197.243.12.88',
  },
  {
    id: 'a3',
    timestamp: '2026-08-10 14:12:33',
    adminName: 'SubAdmin Moderation',
    adminEmail: 'subadmin@gwland.com',
    action: 'CONTENT_DELETION',
    details: 'Removed reported duplicate listing #88',
    ipAddress: '41.186.77.102',
  },
  {
    id: 'a4',
    timestamp: '2026-08-10 09:00:10',
    adminName: 'Admin GW',
    adminEmail: 'admin@gwland.com',
    action: 'ACCOUNT_IMPERSONATION',
    details: 'Initiated impersonation session for buyer@test.com',
    ipAddress: '197.243.12.88',
  },
];

export const AdminAuditLog: React.FC = () => {
  const [logs] = useState<AuditEntry[]>(DUMMY_AUDIT_LOGS);

  const columns: ColumnConfig<AuditEntry>[] = [
    {
      header: 'Timestamp',
      accessorKey: 'timestamp',
      cellClassName: 'text-xs font-semibold text-slate-500 font-mono',
    },
    {
      header: 'Admin User',
      render: (log) => (
        <div className="flex flex-col">
          <span className="text-xs font-bold text-slate-800 dark:text-white">{log.adminName}</span>
          <span className="text-[10px] text-slate-400">{log.adminEmail}</span>
        </div>
      ),
    },
    {
      header: 'Action Type',
      render: (log) => {
        const badgeColors: Record<AuditEntry['action'], string> = {
          PROPERTY_APPROVAL: 'bg-emerald-50 text-emerald-600 border-emerald-200',
          USER_ROLE_CHANGE: 'bg-blue-50 text-blue-600 border-blue-200',
          PRICING_UPDATE: 'bg-amber-50 text-amber-600 border-amber-200',
          ACCOUNT_IMPERSONATION: 'bg-purple-50 text-purple-600 border-purple-200',
          CONTENT_DELETION: 'bg-rose-50 text-rose-600 border-rose-200',
        };
        return (
          <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold border ${badgeColors[log.action]}`}>
            {log.action}
          </span>
        );
      },
    },
    {
      header: 'Event Details',
      accessorKey: 'details',
      cellClassName: 'text-xs text-slate-700 dark:text-slate-300 font-medium',
    },
    {
      header: 'IP Address',
      accessorKey: 'ipAddress',
      cellClassName: 'text-xs text-slate-400 font-mono',
    },
  ];

  const handleExportCSV = () => {
    exportToCSV(logs, 'GW_LAND_Audit_Log');
  };

  const handlePrintReport = () => {
    printSummaryReport(
      'System Audit & Security Logs',
      ['Timestamp', 'Admin User', 'Action', 'Details', 'IP Address'],
      logs.map((l) => [l.timestamp, l.adminName, l.action, l.details, l.ipAddress])
    );
  };

  return (
    <div className="w-full min-w-0 space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
            <ShieldCheck size={24} />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">
              System Audit Logs & Trail
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Immutable history of administrative actions, user permissions, and security events
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-2xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Download size={14} /> Export CSV
          </button>
          <button
            onClick={handlePrintReport}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-md shadow-indigo-500/20 cursor-pointer"
          >
            <Printer size={14} /> Printable Report
          </button>
        </div>
      </div>

      {/* Table Component */}
      <TableBlueprint
        data={logs}
        columns={columns}
        searchPlaceholder="Search audit logs..."
        searchKeys={['adminName', 'details', 'action', 'ipAddress']}
        totalItems={logs.length}
      />
    </div>
  );
};
