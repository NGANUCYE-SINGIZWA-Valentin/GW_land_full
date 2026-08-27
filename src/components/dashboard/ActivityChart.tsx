import React, { useState } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';
import { TrendingUp, Layers, Users as UsersIcon } from 'lucide-react';
import type { DailyCount } from '@/api/types';

interface ActivityChartProps {
  listingsByDay?: DailyCount[];
  usersByDay?: DailyCount[];
  title?: string;
}

const formatDay = (iso?: string) => {
  if (!iso) return '';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return String(iso);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#122844] text-white p-3.5 rounded-2xl border border-slate-700/60 shadow-2xl backdrop-blur-md min-w-[160px]">
        <p className="text-xs font-bold text-slate-300 mb-2 border-b border-slate-700 pb-1.5">{label}</p>
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center justify-between text-xs my-1.5 gap-4">
            <span className="flex items-center gap-1.5 font-medium text-slate-200">
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: entry.color }} />
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
  listingsByDay = [],
  usersByDay = [],
  title = 'Platform Activity & Growth'
}) => {
  const [range, setRange] = useState<'7d' | '30d'>('30d');

  const safeListings = Array.isArray(listingsByDay) ? listingsByDay : [];
  const safeUsers = Array.isArray(usersByDay) ? usersByDay : [];

  const rawData = safeListings.map((l, i) => ({
    day: l?.day ? formatDay(l.day) : `D${i + 1}`,
    listings: Number(l?.count || 0),
    users: Number(safeUsers[i]?.count || 0),
  }));

  const data = range === '7d' ? rawData.slice(-7) : rawData;
  const totalListingsCount = data.reduce((acc, curr) => acc + curr.listings, 0);
  const totalUsersCount = data.reduce((acc, curr) => acc + curr.users, 0);
  const hasActivity = data.some((d) => d.listings > 0 || d.users > 0);

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_2px_12px_-3px_rgba(0,0,0,0.04)] p-5 sm:p-6 w-full min-w-0">
      {/* Header with Title & Range Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-[#54B5BB]/15 text-[#1B395F] border border-[#54B5BB]/30">
              <TrendingUp size={18} />
            </div>
            <h2 className="text-base font-extrabold text-slate-800 tracking-tight">{title}</h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">Listing submissions and new user registrations over time</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Summary Badges */}
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200/60 p-1 rounded-xl text-xs font-bold">
            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white shadow-xs text-[#1B395F]">
              <span className="w-2 h-2 rounded-full bg-[#1B395F]" />
              {totalListingsCount} listings
            </span>
            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white shadow-xs text-[#3FA2A8]">
              <span className="w-2 h-2 rounded-full bg-[#54B5BB]" />
              {totalUsersCount} users
            </span>
          </div>

          {/* Time range selector pills */}
          <div className="flex bg-slate-100 p-1 rounded-xl text-xs font-bold">
            {(['7d', '30d'] as const).map((r) => (
              <button
                key={r}
                onClick={() => setRange(r)}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  range === r
                    ? 'bg-[#1B395F] text-white shadow-sm'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {r === '7d' ? '7 Days' : '30 Days'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {!hasActivity ? (
        <div className="h-64 flex flex-col items-center justify-center text-sm text-slate-400 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
          <Layers size={32} className="text-slate-300 mb-2" />
          <p>No activity records for this period</p>
        </div>
      ) : (
        <div className="h-64 sm:h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="listingsGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#1B395F" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#1B395F" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="usersGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#54B5BB" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#54B5BB" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
              <XAxis dataKey="day" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: '#94A3B8' }} />
              <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: '#94A3B8' }} allowDecimals={false} />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="listings"
                name="Listings"
                stroke="#1B395F"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#listingsGradient)"
              />
              <Area
                type="monotone"
                dataKey="users"
                name="Users"
                stroke="#54B5BB"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#usersGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
};
