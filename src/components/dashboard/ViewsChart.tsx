import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

const data = [
  { name: 'Jan', views: 3200 },
  { name: 'Feb', views: 4800 },
  { name: 'Mar', views: 4100 },
  { name: 'Apr', views: 5900 },
  { name: 'May', views: 6700 },
  { name: 'Jun', views: 8100 },
  { name: 'Jul', views: 7500 },
  { name: 'Aug', views: 8700 },
  { name: 'Sep', views: 6100 },
  { name: 'Oct', views: 8300 },
];

// Formateur pour l'axe Y (ex: 6000 -> 6K)
const formatYAxis = (tickItem: number) => {
  return tickItem === 0 ? '0' : `${tickItem / 1000}K`;
};

// Tooltip customisé type "Bubble" qui se positionne au-dessus du point
const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-sky-500 text-white px-3 py-1 rounded-lg text-xs font-bold shadow-lg -translate-y-8 relative z-50">
        {payload[0].value.toLocaleString()} views
        {/* Petit triangle en bas pour l'effet bulle */}
        <div className="absolute left-1/2 -translate-x-1/2 top-full border-t-4 border-t-sky-500 border-x-4 border-x-transparent" />
      </div>
    );
  }
  return null;
};

export const ViewsChart: React.FC = () => {
  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">

      {/* 📋 EN-TÊTE (même style que RevenueChart) */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-base font-semibold tracking-tight antialiased text-slate-700">
          Views Overview
        </h2>
        <select className="text-xs font-semibold text-slate-500 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 focus:outline-none cursor-pointer hover:bg-slate-100 transition-colors">
          <option>This Year</option>
        </select>
      </div>

      {/* 📊 CONSTRUCTEUR GRAPHIQUE AREA (même type que RevenueChart) */}
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 20, right: 10, left: -20, bottom: 0 }}>
            <defs>
              {/* Dégradé bleu progressif (même que RevenueChart) */}
              <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
              </linearGradient>
            </defs>

            {/* Lignes de repère verticales et horizontales discrètes */}
            <CartesianGrid
              vertical={true}
              horizontal={true}
              stroke="#F1F5F9"
              strokeDasharray="0 0"
            />

            <XAxis
              dataKey="name"
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#64748B', fontSize: 12 }}
              dy={10}
            />

            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#64748B', fontSize: 12 }}
              tickFormatter={formatYAxis}
            />

            <Tooltip
              content={<CustomTooltip />}
              cursor={{ stroke: '#3B82F6', strokeWidth: 2 }}
            />

            <Area
              type="monotone"
              dataKey="views"
              stroke="#3B82F6"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorViews)"
              activeDot={{ r: 5, stroke: '#fff', strokeWidth: 2, fill: '#3B82F6' }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};