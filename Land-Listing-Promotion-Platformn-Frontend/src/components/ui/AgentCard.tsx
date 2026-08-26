import React from 'react';
import { MessageCircle } from 'lucide-react';
import { Agent } from '@/data/agents';

interface AgentCardProps {
  agent: Agent;
  listingCount?: number;
}

export const AgentCard: React.FC<AgentCardProps> = ({ agent, listingCount = 0 }) => {
  const whatsappHref = `https://wa.me/${agent.whatsapp.replace(/\D/g, '')}`;

  return (
    <div className="bg-white rounded-2xl overflow-hidden border border-white/60 shadow-[0_20px_50px_-12px_rgba(148,163,184,0.32)] transition-all duration-300 hover:shadow-[0_30px_60px_-10px_rgba(148,163,184,0.2)] hover:-translate-y-0.5 group">
      <div className="h-56 bg-gray-100 overflow-hidden">
        <img
          src={agent.avatarUrl}
          alt={agent.name}
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
      </div>
      <div className="p-5">
        <h3 className="text-base font-semibold text-brand-text mb-0.5">{agent.name}</h3>
        <p className="text-xs text-gray-500 mb-4">{agent.role}</p>

        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <span className="text-xs font-semibold text-gray-500">
            {listingCount} {listingCount === 1 ? 'Listing' : 'Listings'}
          </span>
          <a
            href={whatsappHref}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-primary hover:text-brand-primary-hover transition-colors"
          >
            <MessageCircle size={14} />
            Contact
          </a>
        </div>
      </div>
    </div>
  );
};
