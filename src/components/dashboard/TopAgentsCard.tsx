import React from 'react';
import { Avatar } from '@/components/ui/Avatar';
import { Award, Star, TrendingUp, CheckCircle, ChevronRight } from 'lucide-react';

export interface Agent {
  name: string;
  count: number;
  label?: string;
  style?: string;
  email?: string;
  score?: number;
  role?: string;
}

interface TopAgentsCardProps {
  agents: Agent[];
  onViewAll?: () => void;
  title?: string;
}

const BADGE_CONFIG = [
  { rank: '1st', bg: 'bg-amber-100 text-amber-800 border-amber-300', icon: '👑' },
  { rank: '2nd', bg: 'bg-slate-200 text-slate-800 border-slate-300', icon: '🥈' },
  { rank: '3rd', bg: 'bg-orange-100 text-orange-800 border-orange-300', icon: '🥉' },
];

export const TopAgentsCard: React.FC<TopAgentsCardProps> = ({ 
  agents = [], 
  onViewAll,
  title = 'Top Performing Agents'
}) => {
  const safeAgents = Array.isArray(agents) ? agents : [];

  return (
    <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/80 shadow-[0_2px_12px_-3px_rgba(0,0,0,0.04)] w-full">
      <div className="flex justify-between items-center mb-5">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-[#54B5BB]/15 text-[#1B395F] border border-[#54B5BB]/30">
            <Award size={18} />
          </div>
          <div>
            <h2 className="text-base font-extrabold text-slate-800 tracking-tight">{title}</h2>
            <p className="text-xs text-slate-400">Leading sellers by listings and client inquiries</p>
          </div>
        </div>

        {onViewAll && (
          <button
            onClick={onViewAll}
            className="text-xs font-extrabold text-[#1B395F] hover:text-[#54B5BB] hover:underline flex items-center gap-1 transition-colors cursor-pointer"
          >
            View All <ChevronRight size={13} />
          </button>
        )}
      </div>

      <div className="space-y-3">
        {safeAgents.length === 0 ? (
          <div className="p-6 text-center text-xs text-slate-400">No agent data available.</div>
        ) : (
          safeAgents.slice(0, 5).map((agent, i) => {
            const rankBadge = BADGE_CONFIG[i];
            const score = agent.score || Math.max(98 - i * 4, 82);
            const performanceLabel = score >= 90 ? 'Excellent' : score >= 85 ? 'Very Good' : 'Good';
            const performanceColor = score >= 90 
              ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
              : 'bg-blue-50 text-blue-700 border-blue-200';

            return (
              <div 
                key={i} 
                className="flex items-center justify-between gap-3 p-3 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-white hover:border-slate-200 hover:shadow-xs transition-all"
              >
                <div className="flex items-center gap-3 min-w-0">
                  {/* Rank badge */}
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black border flex-shrink-0 ${
                    rankBadge ? rankBadge.bg : 'bg-slate-100 text-slate-600 border-slate-200'
                  }`}>
                    {rankBadge ? rankBadge.rank : `${i + 1}th`}
                  </div>

                  <div className="relative">
                    <Avatar name={agent.name} size="md" />
                    <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-white" />
                  </div>

                  <div className="flex flex-col min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs sm:text-sm font-extrabold text-slate-800 truncate">{agent.name}</span>
                      <CheckCircle size={12} className="text-[#54B5BB] flex-shrink-0 fill-[#54B5BB]/20" />
                    </div>
                    <span className="text-[11px] text-slate-400 font-medium truncate">
                      {agent.role || 'Certified Land Specialist'} • <strong className="text-slate-700">{agent.count}</strong> Listings
                    </span>
                  </div>
                </div>

                <div className="flex flex-col items-end flex-shrink-0">
                  <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full border ${performanceColor}`}>
                    {performanceLabel} ({score}%)
                  </span>
                  <span className="text-[10px] text-slate-400 font-semibold mt-0.5">Rating</span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
