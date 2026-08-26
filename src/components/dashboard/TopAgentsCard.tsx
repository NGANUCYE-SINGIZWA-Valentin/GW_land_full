import React from 'react';
import { Avatar } from '@/components/ui/Avatar';

interface Agent {
  name: string;
  count: number;
  label: string;
  style: string;
}

interface TopAgentsCardProps {
  agents: Agent[];
  onViewAll?: () => void;
}

export const TopAgentsCard: React.FC<TopAgentsCardProps> = ({ agents, onViewAll }) => {
  return (
    <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-sm w-full">
      <div className="flex justify-between items-center mb-5">
        <h2 className="text-sm sm:text-base text-base font-medium tracking-tight antialiased text-slate-700 truncate">Top Agents</h2>
        <button
          onClick={onViewAll}
          className="text-xs font-semibold text-brand-primary hover:text-brand-primary-hover hover:underline flex-shrink-0"
        >
          View All
        </button>
      </div>
      <div className="space-y-4">
        {agents.map((agent, i) => (
          <div key={i} className="flex items-center justify-between gap-2 p-2.5 rounded-xl border border-slate-50 hover:bg-slate-100 bg-slate-50/30">
            <div className="flex items-center gap-3 min-w-0">
              <Avatar name={agent.name} size="md" />
              <div className="flex flex-col min-w-0">
                <span className="text-sm text-base font-medium tracking-tight antialiased text-slate-700 truncate">{agent.name}</span>
                <span className="text-xs text-slate-400 font-medium tracking-tight antialiased truncate">{agent.count} Listings</span>
              </div>
            </div>
            <span className={`text-[10px] text-base font-medium tracking-tight antialiased px-2 py-0.5 rounded-md flex-shrink-0 ${agent.style}`}>{agent.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};