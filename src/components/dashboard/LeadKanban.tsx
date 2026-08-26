import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Phone, Mail, Calendar, ArrowRight, CheckCircle2, MessageSquare } from 'lucide-react';

export interface Lead {
  id: string;
  name: string;
  phone: string;
  email: string;
  propertyTitle: string;
  stage: 'New Inquiry' | 'Site Tour Scheduled' | 'Offer Received' | 'In Negotiation' | 'Closed';
  date: string;
}

const STAGES: Lead['stage'][] = [
  'New Inquiry',
  'Site Tour Scheduled',
  'Offer Received',
  'In Negotiation',
  'Closed',
];

const INITIAL_LEADS: Lead[] = [
  {
    id: 'l1',
    name: 'Jean Paul Habimana',
    phone: '+250 788 123 456',
    email: 'jp.habimana@gmail.com',
    propertyTitle: 'Prime Residential Plot 1,200sqm Gasabo',
    stage: 'New Inquiry',
    date: 'Today, 10:30 AM',
  },
  {
    id: 'l2',
    name: 'Marie Claire Uwineza',
    phone: '+250 783 987 654',
    email: 'm.uwineza@yahoo.com',
    propertyTitle: 'Commercial Land Rebero Hillside',
    stage: 'Site Tour Scheduled',
    date: 'Tomorrow, 2:00 PM',
  },
  {
    id: 'l3',
    name: 'David Mugisha',
    phone: '+250 785 555 121',
    email: 'dmugisha@tech.rw',
    propertyTitle: 'Agricultural Plot 2.5 Hectares Bugesera',
    stage: 'Offer Received',
    date: 'Yesterday',
  },
  {
    id: 'l4',
    name: 'Grace Mukamana',
    phone: '+250 788 444 888',
    email: 'grace@kigalirealty.rw',
    propertyTitle: 'Prime Residential Plot 1,200sqm Gasabo',
    stage: 'Closed',
    date: '3 days ago',
  },
];

interface LeadKanbanProps {
  onOpenChatModal?: (name: string) => void;
}

export const LeadKanban: React.FC<LeadKanbanProps> = ({ onOpenChatModal }) => {
  const [leads, setLeads] = useState<Lead[]>(INITIAL_LEADS);

  const moveStage = (id: string, currentStage: Lead['stage']) => {
    const currentIndex = STAGES.indexOf(currentStage);
    if (currentIndex < STAGES.length - 1) {
      const nextStage = STAGES[currentIndex + 1];
      setLeads(leads.map((l) => (l.id === id ? { ...l, stage: nextStage } : l)));
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-extrabold text-slate-800 dark:text-white">
            Lead CRM Pipeline
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Track prospective buyer inquiries by status stage
          </p>
        </div>
      </div>

      {/* Kanban Board Columns */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 overflow-x-auto pb-2">
        {STAGES.map((stage) => {
          const stageLeads = leads.filter((l) => l.stage === stage);

          return (
            <div
              key={stage}
              className="bg-slate-50/70 dark:bg-slate-900/60 rounded-2xl p-3 border border-slate-200/80 dark:border-slate-800 flex flex-col min-h-[300px]"
            >
              {/* Column Header */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-200/60 dark:border-slate-800 mb-3">
                <span className="text-xs font-extrabold text-slate-700 dark:text-slate-300 truncate">
                  {stage}
                </span>
                <span className="w-5 h-5 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-[10px] font-extrabold flex items-center justify-center">
                  {stageLeads.length}
                </span>
              </div>

              {/* Cards */}
              <div className="space-y-3 flex-1">
                {stageLeads.map((lead) => (
                  <motion.div
                    key={lead.id}
                    layout
                    className="p-3.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 shadow-xs space-y-2.5"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <span className="block text-xs font-bold text-slate-800 dark:text-white truncate">
                          {lead.name}
                        </span>
                        <span className="block text-[10px] text-slate-400 truncate">
                          {lead.propertyTitle}
                        </span>
                      </div>
                    </div>

                    <div className="text-[11px] text-slate-500 space-y-1">
                      <div className="flex items-center gap-1.5">
                        <Phone size={11} className="text-slate-400" />
                        <span className="font-medium">{lead.phone}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Calendar size={11} className="text-slate-400" />
                        <span>{lead.date}</span>
                      </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="pt-2 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between">
                      <button
                        onClick={() => onOpenChatModal?.(lead.name)}
                        className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <MessageSquare size={12} /> Chat
                      </button>

                      {stage !== 'Closed' && (
                        <button
                          onClick={() => moveStage(lead.id, lead.stage)}
                          className="text-[10px] font-extrabold px-2 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800/40 hover:bg-indigo-100 flex items-center gap-1 cursor-pointer"
                        >
                          Next <ArrowRight size={10} />
                        </button>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
