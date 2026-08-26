import React from 'react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';

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
  { name: 'Week 1', revenue: 15000 },
  { name: 'Week 2', revenue: 20000 },
  { name: 'Week 3', revenue: 45000 },
  { name: 'Week 4', revenue: 70000 },
];

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const val = Number(payload[0].value || 0);
    return (
      <div className="bg-emerald-600 text-white px-3 py-1.5 rounded-xl text-xs font-bold shadow-lg -translate-y-8 relative z-50">
        RWF {val.toLocaleString()}
        <div className="absolute left-1/2 -translate-x-1/2 top-full border-t-4 border-t-emerald-600 border-x-4 border-x-transparent" />
      </div>
    );
  }
  return null;
};

export const RevenueChart: React.FC<RevenueChartProps> = ({
  data = defaultData,
  totalRwf,
  totalUsd,
  title = 'Revenue Summary'
}) => {
  const chartData = data && data.length > 0 ? data : defaultData;

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm w-full">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-6">
        <div>
          <h2 className="text-base font-semibold tracking-tight antialiased text-slate-800">
            {title}
          </h2>
          {totalRwf !== undefined && (
            <p className="text-xs font-medium text-slate-500 mt-0.5">
              Total Completed: <span className="font-bold text-emerald-600">RWF {totalRwf.toLocaleString()}</span>
              {totalUsd ? ` / $${totalUsd.toLocaleString()}` : ''}
            </p>
          )}
        </div>
        <select className="text-xs font-semibold text-slate-500 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 focus:outline-none cursor-pointer hover:bg-slate-100 transition-colors">
          <option>Last 30 Days</option>
          <option>This Year</option>
        </select>
      </div>

      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 20, right: 10, left: 10, bottom: 0 }}>
            <defs>
              <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10B981" stopOpacity={0.25}/>
                <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid vertical={true} horizontal={true} stroke="#F1F5F9" />
            <XAxis 
              dataKey="name" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: '#64748B', fontSize: 11 }}
              dy={10}
            />
            <YAxis 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: '#64748B', fontSize: 11 }}
              tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#10B981', strokeWidth: 1.5 }} />
            <Area 
              type="monotone" 
              dataKey="revenue" 
              stroke="#10B981" 
              strokeWidth={2.5}
              fillOpacity={1} 
              fill="url(#colorRevenue)" 
              activeDot={{ r: 5, stroke: '#fff', strokeWidth: 2, fill: '#10B981' }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};