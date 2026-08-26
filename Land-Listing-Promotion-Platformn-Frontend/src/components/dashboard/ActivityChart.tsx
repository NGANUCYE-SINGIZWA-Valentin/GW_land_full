import React, { useState } from 'react';
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
} from 'recharts';
import { TrendingUp, Layers, Users as UsersIcon } from 'lucide-react';
import type { DailyCount } from '@/api/types';

interface ActivityChartProps {
  listingsByDay: DailyCount[];
  usersByDay: DailyCount[];
  title?: string;
}

const formatDay = (iso: string) =>
  new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-900/95 dark:bg-slate-950/95 text-white p-3 rounded-2xl border border-slate-700/60 shadow-2xl backdrop-blur-md min-w-[140px]">
        <p className="text-xs font-bold text-slate-300 mb-2 border-b border-slate-800 pb-1">{label}</p>
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center justify-between text-xs my-1 gap-3">
            <span className="flex items-center gap-1.5 font-medium" style={{ color: entry.color }}>
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
              {entry.name}:
            </span>
            <span className="font-extrabold text-white">{entry.value}</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export const ActivityChart: React.FC<ActivityChartProps> = ({
  listingsByDay,
  usersByDay,
  title = 'Platform Activity Trends'
}) => {
  const [range, setRange] = useState<'7d' | '30d'>('30d');

  const rawData = listingsByDay.map((l, i) => ({
    day: formatDay(l.day),
    listings: Number(l.count),
    users: Number(usersByDay[i]?.count ?? 0),
  }));

  const data = range === '7d' ? rawData.slice(-7) : rawData;
  const totalListingsCount = data.reduce((acc, curr) => acc + curr.listings, 0);
  const totalUsersCount = data.reduce((acc, curr) => acc + curr.users, 0);
  const hasActivity = data.some((d) => d.listings > 0 || d.users > 0);

  return (
    <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm p-6 w-full min-w-0">
      {/* Header with Title & Range Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
              <TrendingUp size={18} />
            </div>
            <h2 className="text-base font-extrabold text-slate-800 dark:text-white tracking-tight">{title}</h2>
          </div>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Growth metrics & listing additions across Rwanda</p>
        </div>

        <div className="flex items-center gap-3">
          {/* Summary Pills */}
          <div className="hidden md:flex items-center gap-2 bg-slate-100 dark:bg-slate-800/80 p-1.5 rounded-2xl text-xs font-semibold">
            <span className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-white dark:bg-slate-700 shadow-sm text-indigo-600 dark:text-indigo-400">
              <Layers size={12} /> {totalListingsCount} listings
            </span>
            <span className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-white dark:bg-slate-700 shadow-sm text-teal-600 dark:text-teal-400">
              <UsersIcon size={12} /> {totalUsersCount} users
            </span>
          </div>

          {/* Time range selector */}
          <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl text-xs font-bold">
            {(['7d', '30d'] as const).map((r) => (
              <button
                key={r}
                onClick={() => setRange(r)}
                className={`px-3 py-1.5 rounded-xl transition-all ${
                  range === r
                    ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm'
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                {r === '7d' ? '7 Days' : '30 Days'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {!hasActivity ? (
        <div className="h-64 flex flex-col items-center justify-center text-sm text-slate-400 bg-slate-50/50 dark:bg-slate-800/30 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
          <TrendingUp size={24} className="opacity-40 mb-2" />
          <p>No activity registered in this period.</p>
        </div>
      ) : (
        <div className="h-64 sm:h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="listingsFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#6366F1" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="#6366F1" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="usersFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#14B8A6" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="#14B8A6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
              <XAxis
                dataKey="day"
                tick={{ fontSize: 11, fill: '#94A3B8' }}
                axisLine={{ stroke: '#E2E8F0' }}
                tickLine={false}
                interval="preserveStartEnd"
                minTickGap={20}
              />
              <YAxis
                allowDecimals={false}
                tick={{ fontSize: 11, fill: '#94A3B8' }}
                axisLine={false}
                tickLine={false}
                width={28}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                iconType="circle"
                iconSize={8}
                wrapperStyle={{ fontSize: 12, paddingTop: 10, color: '#64748B' }}
              />
              <Area
                type="monotone"
                dataKey="listings"
                name="New Listings"
                stroke="#6366F1"
                strokeWidth={2.5}
                fill="url(#listingsFill)"
                activeDot={{ r: 6, stroke: '#fff', strokeWidth: 2, fill: '#6366F1' }}
              />
              <Area
                type="monotone"
                dataKey="users"
                name="New Registrations"
                stroke="#14B8A6"
                strokeWidth={2.5}
                fill="url(#usersFill)"
                activeDot={{ r: 6, stroke: '#fff', strokeWidth: 2, fill: '#14B8A6' }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
};

