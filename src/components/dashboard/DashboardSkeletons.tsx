import React from 'react';
import { Skeleton, SkeletonText, SkeletonAvatar, SkeletonBadge, SkeletonButton } from '@/components/ui/Skeleton';

/**
 * Skeleton for single KPI Metric StatCard
 */
export const StatCardSkeleton: React.FC<{ accentGradient?: string }> = () => {
  return (
    <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-md rounded-3xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-lg shadow-slate-200/50 dark:shadow-none flex flex-col justify-between h-[142px] relative overflow-hidden">
      <div className="flex items-start justify-between">
        <div className="space-y-1.5 flex-1 pr-3">
          <Skeleton className="h-3.5 w-24 rounded-md" />
          <Skeleton className="h-7 w-28 rounded-lg mt-1" />
        </div>
        <Skeleton className="w-11 h-11 rounded-2xl shrink-0" />
      </div>
      <div className="flex items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-800/60">
        <Skeleton className="h-4 w-12 rounded-full" />
        <Skeleton className="h-3 w-20 rounded-md" />
      </div>
    </div>
  );
};

/**
 * Grid of StatCard skeletons
 */
export const StatGridSkeleton: React.FC<{ count?: number; cols?: string }> = ({
  count = 5,
  cols = 'grid-cols-2 sm:grid-cols-3 xl:grid-cols-5',
}) => {
  return (
    <div className={`grid ${cols} gap-3.5 w-full min-w-0`}>
      {Array.from({ length: count }).map((_, i) => (
        <StatCardSkeleton key={i} />
      ))}
    </div>
  );
};

/**
 * Skeleton for Chart / Analytics Widgets (Revenue, Activity, Views)
 */
export const ChartWidgetSkeleton: React.FC<{ height?: number; title?: string }> = ({
  height = 320,
}) => {
  return (
    <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none flex flex-col justify-between">
      <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800/80">
        <div className="space-y-1.5">
          <Skeleton className="h-5 w-44 rounded-lg" />
          <Skeleton className="h-3.5 w-60 rounded-md" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-8 w-20 rounded-xl" />
          <Skeleton className="h-8 w-20 rounded-xl" />
        </div>
      </div>

      <div className="py-6 flex items-end justify-between gap-3" style={{ height }}>
        {Array.from({ length: 8 }).map((_, i) => {
          const barHeight = 25 + ((i * 37) % 65);
          return (
            <div key={i} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
              <Skeleton
                className="w-full rounded-xl"
                style={{ height: `${barHeight}%` }}
              />
              <Skeleton className="h-3 w-8 rounded-md" />
            </div>
          );
        })}
      </div>
    </div>
  );
};

/**
 * Complete Data Table Skeleton with toolbar, columns header, and rows
 */
export const DataTableSkeleton: React.FC<{
  rows?: number;
  columns?: number;
  hasToolbar?: boolean;
}> = ({ rows = 6, columns = 6, hasToolbar = true }) => {
  return (
    <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none overflow-hidden">
      {hasToolbar && (
        <div className="p-5 border-b border-slate-100 dark:border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-50/50 dark:bg-slate-900/50">
          <div className="w-full sm:w-80">
            <Skeleton className="h-10 w-full rounded-2xl" />
          </div>
          <div className="flex items-center gap-2 ml-auto">
            <Skeleton className="h-9 w-24 rounded-xl" />
            <Skeleton className="h-9 w-24 rounded-xl" />
            <Skeleton className="h-9 w-28 rounded-xl" />
          </div>
        </div>
      )}

      <div className="w-full overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[600px]">
          <thead>
            <tr className="bg-slate-100/60 dark:bg-slate-800/50 border-b border-slate-200/80 dark:border-slate-800">
              {Array.from({ length: columns }).map((_, i) => (
                <th key={i} className="py-3.5 px-4 sm:px-5">
                  <Skeleton className="h-3.5 w-20 rounded-md" />
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
            {Array.from({ length: rows }).map((_, r) => (
              <tr key={r} className="hover:bg-slate-50/40 dark:hover:bg-slate-800/40">
                {Array.from({ length: columns }).map((_, c) => (
                  <td key={c} className="py-4 px-4 sm:px-5">
                    {c === 0 ? (
                      <div className="flex items-center gap-3">
                        <Skeleton className="w-12 h-12 rounded-xl shrink-0" />
                        <div className="space-y-1.5 flex-1">
                          <Skeleton className="h-4 w-36 rounded-md" />
                          <Skeleton className="h-3 w-24 rounded-md" />
                        </div>
                      </div>
                    ) : c === columns - 1 ? (
                      <div className="flex items-center gap-2 justify-end">
                        <Skeleton className="h-8 w-16 rounded-xl" />
                        <Skeleton className="h-8 w-8 rounded-xl" />
                      </div>
                    ) : c === 1 ? (
                      <Skeleton className="h-4 w-28 rounded-md" />
                    ) : c === 2 ? (
                      <Skeleton className="h-6 w-20 rounded-full" />
                    ) : (
                      <Skeleton className="h-4 w-20 rounded-md" />
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="p-4 bg-slate-50/60 dark:bg-slate-900/60 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
        <Skeleton className="h-4 w-36 rounded-md" />
        <div className="flex items-center gap-2">
          <Skeleton className="h-8 w-20 rounded-xl" />
          <Skeleton className="h-8 w-20 rounded-xl" />
        </div>
      </div>
    </div>
  );
};

/**
 * Skeleton for Property Card
 */
export const PropertyCardSkeleton: React.FC = () => {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-md overflow-hidden flex flex-col justify-between">
      {/* Cover Image Placeholder */}
      <div className="relative aspect-[16/10] w-full bg-slate-200 dark:bg-slate-800 animate-pulse overflow-hidden">
        <div className="absolute top-3 left-3 flex gap-2">
          <Skeleton className="h-6 w-16 rounded-full bg-white/70 dark:bg-slate-900/70" />
        </div>
        <div className="absolute top-3 right-3">
          <Skeleton className="h-8 w-8 rounded-full bg-white/70 dark:bg-slate-900/70" />
        </div>
      </div>

      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Skeleton className="h-3.5 w-24 rounded-md" />
            <Skeleton className="h-3.5 w-16 rounded-md" />
          </div>
          <Skeleton className="h-5 w-4/5 rounded-lg" />
          <div className="flex items-center gap-1.5 pt-0.5">
            <Skeleton className="h-3.5 w-3.5 rounded-full" />
            <Skeleton className="h-3.5 w-36 rounded-md" />
          </div>
        </div>

        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="space-y-1">
            <Skeleton className="h-3 w-12 rounded-md" />
            <Skeleton className="h-5 w-28 rounded-lg" />
          </div>
          <Skeleton className="h-9 w-24 rounded-2xl" />
        </div>
      </div>
    </div>
  );
};

/**
 * Grid of Property Card Skeletons
 */
export const PropertyGridSkeleton: React.FC<{ count?: number }> = ({ count = 6 }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 w-full">
      {Array.from({ length: count }).map((_, i) => (
        <PropertyCardSkeleton key={i} />
      ))}
    </div>
  );
};

/**
 * Skeleton for Top Agents / Broker Card
 */
export const TopAgentsCardSkeleton: React.FC = () => {
  return (
    <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none space-y-4">
      <div className="flex items-center justify-between">
        <Skeleton className="h-5 w-32 rounded-lg" />
        <Skeleton className="h-4 w-16 rounded-md" />
      </div>
      <div className="space-y-3 pt-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40">
            <div className="flex items-center gap-3">
              <Skeleton className="w-6 h-6 rounded-full" />
              <Skeleton className="w-10 h-10 rounded-full" />
              <div className="space-y-1">
                <Skeleton className="h-4 w-28 rounded-md" />
                <Skeleton className="h-3 w-20 rounded-md" />
              </div>
            </div>
            <Skeleton className="h-6 w-16 rounded-full" />
          </div>
        ))}
      </div>
    </div>
  );
};

/**
 * Skeleton for Approvals / Priority Breakdown Cards
 */
export const PendingApprovalsCardSkeleton: React.FC = () => {
  return (
    <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none space-y-4">
      <div className="flex items-center justify-between">
        <Skeleton className="h-5 w-40 rounded-lg" />
        <Skeleton className="h-6 w-12 rounded-full" />
      </div>
      <div className="space-y-3 pt-1">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex items-center justify-between p-3.5 rounded-2xl border border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-3">
              <Skeleton className="w-8 h-8 rounded-xl" />
              <div className="space-y-1">
                <Skeleton className="h-4 w-36 rounded-md" />
                <Skeleton className="h-3 w-24 rounded-md" />
              </div>
            </div>
            <Skeleton className="h-7 w-16 rounded-xl" />
          </div>
        ))}
      </div>
    </div>
  );
};

/**
 * Skeleton for Quick Actions Bar
 */
export const QuickActionsSkeleton: React.FC = () => {
  return (
    <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none space-y-3">
      <Skeleton className="h-5 w-36 rounded-lg" />
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="p-4 rounded-2xl border border-slate-100 dark:border-slate-800 flex flex-col items-center gap-2 text-center">
            <Skeleton className="w-10 h-10 rounded-2xl" />
            <Skeleton className="h-3.5 w-20 rounded-md mt-1" />
          </div>
        ))}
      </div>
    </div>
  );
};

/**
 * Skeleton for Messages List
 */
export const MessagesListSkeleton: React.FC<{ count?: number }> = ({ count = 5 }) => {
  return (
    <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xl overflow-hidden divide-y divide-slate-100 dark:divide-slate-800">
      <div className="p-5 flex items-center justify-between">
        <Skeleton className="h-5 w-36 rounded-lg" />
        <Skeleton className="h-8 w-24 rounded-xl" />
      </div>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="p-4.5 flex items-start gap-3.5">
          <Skeleton className="w-11 h-11 rounded-full shrink-0" />
          <div className="flex-1 space-y-1.5">
            <div className="flex items-center justify-between">
              <Skeleton className="h-4 w-32 rounded-md" />
              <Skeleton className="h-3 w-16 rounded-md" />
            </div>
            <Skeleton className="h-3.5 w-3/4 rounded-md" />
          </div>
        </div>
      ))}
    </div>
  );
};

export default {
  StatCardSkeleton,
  StatGridSkeleton,
  ChartWidgetSkeleton,
  DataTableSkeleton,
  PropertyCardSkeleton,
  PropertyGridSkeleton,
  TopAgentsCardSkeleton,
  PendingApprovalsCardSkeleton,
  QuickActionsSkeleton,
  MessagesListSkeleton,
};
