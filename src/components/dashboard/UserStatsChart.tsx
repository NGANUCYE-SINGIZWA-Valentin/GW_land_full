import React, { useState } from 'react';
import { RadialBarChart, RadialBar, ResponsiveContainer } from 'recharts';
import {
  UserStatDataset,
  UserStatFilterCategory,
} from '@/data/userStats';
import { USER_STATS_CONFIG } from '@/data/userStats';

interface UserStatsChartProps {
  config?: UserStatFilterCategory[];
}

export const UserStatsChart: React.FC<UserStatsChartProps> = ({
  config = USER_STATS_CONFIG,
}) => {
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>(
    config[0].id
  );
  const [selectedOptionId, setSelectedOptionId] = useState<string>(
    config[0].options[0].id
  );

  const currentCategory = config.find(
    (c) => c.id === selectedCategoryId
  );

  const getDefaultDataset = (): UserStatDataset => {
    return config[0].options[0].dataset;
  };

  const currentDataset: UserStatDataset =
    currentCategory?.options.find((o) => o.id === selectedOptionId)?.dataset ??
    getDefaultDataset();

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newCategoryId = e.target.value;
    setSelectedCategoryId(newCategoryId);
    // Reset to the first option of the new category
    const newCategory = config.find(
      (c) => c.id === newCategoryId
    );
    if (newCategory) {
      setSelectedOptionId(newCategory.options[0].id);
    }
  };

  const handleOptionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedOptionId(e.target.value);
  };

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm w-full font-sans flex flex-col justify-between">
      {/* 📋 EN-TÊTE DU COMPOSANT AVEC FILTRES */}
      <div>
        <div className="flex justify-between items-start mb-2">
          <div>
            <h2 className="text-base font-semibold text-slate-700 tracking-tight antialiased">
              {currentDataset.title}
            </h2>
          </div>
          <div className="flex items-center gap-2">
            {/* Category filter */}
            <select
              value={selectedCategoryId}
              onChange={handleCategoryChange}
              className="text-xs font-semibold text-slate-500 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 focus:outline-none cursor-pointer hover:bg-slate-100 transition-colors"
            >
              {config.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.label}
                </option>
              ))}
            </select>
            {/* Option filter within the selected category */}
            {currentCategory && (
              <select
                value={selectedOptionId}
                onChange={handleOptionChange}
                className="text-xs font-semibold text-slate-500 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 focus:outline-none cursor-pointer hover:bg-slate-100 transition-colors"
              >
                {currentCategory.options.map((option) => (
                  <option key={option.id} value={option.id}>
                    {option.label}
                  </option>
                ))}
              </select>
            )}
          </div>
        </div>
      </div>

      {/* 🔄 CONSTRUCTEUR DU GRAPH CIRCULAIRE CONCENTRIQUE */}
      <div className="relative w-full h-44 my-2 flex items-center justify-center">
        {/* TEXTE CENTRAL ABSOLU */}
        <div className="absolute text-center flex flex-col items-center justify-center pointer-events-none select-none z-10">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            {currentDataset.centralLabel}
          </span>
          <span className="text-2xl font-extrabold text-slate-900 tracking-tight mt-0.5">
            {currentDataset.centralValue.toLocaleString()}
          </span>
        </div>

        <ResponsiveContainer width="100%" height="100%">
          <RadialBarChart
            cx="50%"
            cy="50%"
            innerRadius="65%"
            outerRadius="100%"
            barSize={8}
            data={currentDataset.bars}
            startAngle={90}
            endAngle={-270}
          >
            <RadialBar
              background={{ fill: '#F8FAFC' }}
              dataKey="value"
              cornerRadius={10}
            />
          </RadialBarChart>
        </ResponsiveContainer>
      </div>

      {/* 🏷️ LÉGENDE ALIGNÉE EN BAS */}
      <div className="flex items-center justify-center gap-6 border-t border-slate-50 pt-4">
        {currentDataset.legend.map((item) => (
          <div key={item.label} className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: item.color }}
            />
            <div className="flex items-baseline gap-1.5">
              <span className="text-xs font-semibold text-slate-400">
                {item.label}
              </span>
              <span className="text-xs font-bold text-slate-900">
                {item.value.toLocaleString()}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};