import React, { useState } from 'react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import { DollarSign, ArrowUpRight } from 'lucide-react';

export interface RevenuePoint {
  name: string;
  revenue: number;
}

interface RevenueChartProps {
  data?: RevenuePoint[];
  totalRwf?: number;
  totalUsd?: number;
  title?: string;
}

const defaultData: RevenuePoint[] = [
  { name: 'Week 1', revenue: 1500000 },
  { name: 'Week 2', revenue: 2800000 },
  { name: 'Week 3', revenue: 4500000 },
  { name: 'Week 4', revenue: 7200000 },
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const val = Number(payload[0].value || 0);
    return (
      <div className="bg-[#122844] text-white p-3 rounded-2xl border border-slate-700/60 shadow-2xl backdrop-blur-md min-w-[140px]">
        <p className="text-[11px] font-bold text-slate-300 mb-1 border-b border-slate-700 pb-1">{label}</p>
        <div className="flex items-center justify-between text-xs mt-1">
          <span className="text-emerald-400 font-bold">Revenue:</span>
          <span className="font-black text-white">RWF {val.toLocaleString()}</span>
        </div>
      </div>
    );
  }
  return null;
};

export const RevenueChart: React.FC<RevenueChartProps> = ({
  data = defaultData,
  totalRwf,
  totalUsd,
  title = 'Revenue & Monetization'
}) => {
  const [period, setPeriod] = useState<'30d' | 'year'>('30d');
  const chartData = data && data.length > 0 ? data : defaultData;

  return (
    <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/80 shadow-[0_2px_12px_-3px_rgba(0,0,0,0.04)] w-full min-w-0">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200/60">
              <DollarSign size={18} />
            </div>
            <h2 className="text-base font-extrabold text-slate-800 tracking-tight">
              {title}
            </h2>
          </div>
          {totalRwf !== undefined && (
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs text-slate-400">Total processed:</span>
              <span className="text-xs font-black text-emerald-600">RWF {totalRwf.toLocaleString()}</span>
              {totalUsd ? <span className="text-[11px] text-slate-400">(${totalUsd.toLocaleString()})</span> : null}
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl text-xs font-bold">
          <button
            onClick={() => setPeriod('30d')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              period === '30d' ? 'bg-[#1B395F] text-white shadow-xs' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Last 30 Days
          </button>
          <button
            onClick={() => setPeriod('year')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              period === 'year' ? 'bg-[#1B395F] text-white shadow-xs' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            This Year
          </button>
        </div>
      </div>

      <div className="h-64 sm:h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10B981" stopOpacity={0.35}/>
                <stop offset="95%" stopColor="#10B981" stopOpacity={0.0}/>
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="#F1F5F9" />
            <XAxis 
              dataKey="name" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: '#94A3B8', fontSize: 11 }}
            />
            <YAxis 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: '#94A3B8', fontSize: 11 }}
              tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area 
              type="monotone" 
              dataKey="revenue" 
              stroke="#10B981" 
              strokeWidth={2.5}
              fillOpacity={1} 
              fill="url(#colorRevenue)" 
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
