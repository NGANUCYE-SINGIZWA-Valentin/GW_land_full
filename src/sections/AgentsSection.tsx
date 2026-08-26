import React from 'react';
import { Container } from '@/components/ui/Container';
import { AgentCard } from '@/components/ui/AgentCard';
import { agents } from '@/data/agents';

export const AgentsSection: React.FC = () => {
  return (
    <section id="agents">
      <Container>
        <div className="relative rounded-3xl p-8 md:p-12 overflow-hidden bg-gradient-to-b from-white via-white/35 to-white/3 border border-white/60 backdrop-blur-md shadow-[0_20px_50px_-12px_rgba(148,163,184,0.12)]">
          <div className="relative z-10 text-center mb-10">
            <h2 className="text-2xl font-semibold text-brand-text">Meet Our Agents</h2>
            <p className="text-gray-400 text-sm mt-1 max-w-lg mx-auto leading-relaxed">
              Local experts ready to guide you through every step of your property journey.
            </p>
          </div>

          <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {agents.map((agent) => (
              <AgentCard key={agent.id} agent={agent} />
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
};
