import React, { useEffect, useMemo, useRef, useState } from 'react';
import { StatCard } from '@/components/dashboard/StatCard';
import { TableBlueprint, ColumnConfig } from '@/components/dashboard/TableBlueprint';
import { ChatModal } from '@/components/dashboard/ChatModal';
import { Avatar } from '@/components/ui/Avatar';
import { MessagesSquare, Users, Building2, CalendarDays, Eye, Shield, Sparkles } from 'lucide-react';
import * as adminApi from '@/api/admin';
import type { AdminConversation, Message } from '@/api/types';
import { formatRelativeTime } from '@/utils/format';
import { useInterval } from '@/hooks/useInterval';

const INBOX_POLL_MS = 15000;

export const AdminMessages: React.FC = () => {
    const [conversations, setConversations] = useState<AdminConversation[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedConversation, setSelectedConversation] = useState<AdminConversation | null>(null);
    const [thread, setThread] = useState<Message[]>([]);
    const [threadLoading, setThreadLoading] = useState(false);
    const bottomRef = useRef<HTMLDivElement>(null);

    const loadConversations = (silent = false) => {
        if (!silent) setLoading(true);
        adminApi.getAllConversations()
            .then((res) => setConversations(res.conversations))
            .finally(() => { if (!silent) setLoading(false); });
    };

    useEffect(() => { loadConversations(); }, []);
    useInterval(() => { if (!document.hidden) loadConversations(true); }, INBOX_POLL_MS);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [thread]);

    const totalMessages = useMemo(
        () => conversations.reduce((sum, c) => sum + Number(c.message_count || 0), 0),
        [conversations]
    );

    const openThread = async (conversation: AdminConversation) => {
        setSelectedConversation(conversation);
        setIsModalOpen(true);
        setThreadLoading(true);
        try {
            const { messages } = await adminApi.getConversationThread(
                conversation.sender_id, conversation.receiver_id, conversation.listing_id
            );
            setThread(messages);
        } finally {
            setThreadLoading(false);
        }
    };

    const columns: ColumnConfig<AdminConversation>[] = [
        {
            header: 'Sender (Buyer/User)',
            render: (c) => (
                <div className="flex items-center gap-3">
                    <Avatar name={c.sender_name} size="md" />
                    <div className="min-w-0">
                        <h4 className="text-sm font-bold text-slate-800 truncate max-w-[140px]">{c.sender_name}</h4>
                        <p className="text-[11px] font-medium" style={{ color: '#54B5BB' }}>Initiator</p>
                    </div>
                </div>
            ),
        },
        {
            header: 'Recipient (Seller/User)',
            render: (c) => (
                <div className="flex items-center gap-3">
                    <Avatar name={c.receiver_name} size="md" />
                    <div className="min-w-0">
                        <h4 className="text-sm font-bold text-slate-800 truncate max-w-[140px]">{c.receiver_name}</h4>
                        <p className="text-[11px] font-medium" style={{ color: '#1B395F' }}>Recipient</p>
                    </div>
                </div>
            ),
        },
        {
            header: 'Property Target',
            render: (c) => (
                <div className="flex items-center gap-2 max-w-[180px]">
                    <div className="p-1.5 rounded-lg flex-shrink-0" style={{ background: 'rgba(27,57,95,0.08)', color: '#1B395F' }}>
                        <Building2 size={14} />
                    </div>
                    <span className="text-xs font-semibold text-slate-800 truncate">{c.listing_title || 'General Inquiry'}</span>
                </div>
            ),
        },
        { header: 'Latest Snippet', render: (c) => <span className="text-slate-500 text-xs truncate max-w-[220px] block font-medium">{c.body}</span> },
        { header: 'Last Active', render: (c) => formatRelativeTime(c.created_at), cellClassName: 'text-slate-400 text-xs font-semibold' },
        {
            header: 'Volume',
            render: (c) => (
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-extrabold border"
                    style={{ background: 'rgba(27,57,95,0.08)', color: '#1B395F', borderColor: 'rgba(27,57,95,0.15)' }}>
                    {c.message_count} msg{Number(c.message_count) > 1 ? 's' : ''}
                </span>
            ),
        },
        {
            header: 'Action', headerClassName: 'text-right', cellClassName: 'text-right',
            render: (c) => (
                <button onClick={() => openThread(c)}
                    className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl border transition-all hover:scale-105"
                    style={{ color: '#1B395F', background: 'rgba(27,57,95,0.08)', borderColor: 'rgba(27,57,95,0.15)' }}>
                    <Eye size={14} /> Audit Thread
                </button>
            ),
        },
    ];

    return (
        <div className="space-y-8 font-sans antialiased">
            {/* Hero */}
            <div className="relative overflow-hidden rounded-3xl p-8 text-white shadow-2xl border border-slate-800"
                style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1B395F 60%, #54B5BB 100%)' }}>
                <div className="absolute right-0 top-0 -mt-10 -mr-10 w-72 h-72 rounded-full blur-3xl pointer-events-none opacity-20"
                    style={{ background: '#54B5BB' }} />
                <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                    <div>
                        <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider mb-3 border"
                            style={{ background: 'rgba(84,181,187,0.2)', color: '#a7e8eb', borderColor: 'rgba(84,181,187,0.3)' }}>
                            <Shield size={12} /> Platform Governance
                        </span>
                        <h1 className="text-2xl md:text-3xl font-black tracking-tight">Communication Oversight</h1>
                        <p className="text-slate-300 text-sm mt-1 max-w-xl">Audit buyer-seller message exchanges for safety, verify inquiry activity, and monitor transactions.</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="px-4 py-2.5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 text-center">
                            <p className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">Conversations</p>
                            <p className="text-xl font-black">{conversations.length}</p>
                        </div>
                        <div className="px-4 py-2.5 rounded-2xl backdrop-blur-md border text-center"
                            style={{ background: 'rgba(84,181,187,0.2)', borderColor: 'rgba(84,181,187,0.3)' }}>
                            <p className="text-[11px] font-bold text-[#a7e8eb] uppercase tracking-wider">Total Messages</p>
                            <p className="text-xl font-black text-[#54B5BB]">{totalMessages}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* KPI */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 max-w-xl">
                <StatCard title="Active Threads" value={String(conversations.length)} icon={<Users size={20} />} accentGradient="indigo" showSubtext={false} />
                <StatCard title="Total Message Volume" value={String(totalMessages)} icon={<MessagesSquare size={20} />} accentGradient="purple" showSubtext={false} />
            </div>

            {/* Table */}
            <TableBlueprint data={conversations} columns={columns} isLoading={loading}
                emptyMessage={loading ? 'Loading conversations...' : 'No conversations on the platform yet.'}
                searchPlaceholder="Search participants or property..." searchKeys={['sender_name', 'receiver_name', 'listing_title']}
                totalItems={conversations.length} hasPrevPage={false} hasNextPage={false} />

            {/* ── Centered Read-Only Audit Modal ── */}
            <ChatModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title="Conversation Audit"
                subtitle="Read-Only Oversight View"
                icon={<Shield size={18} />}
                footer={
                    <button onClick={() => setIsModalOpen(false)}
                        className="w-full py-2.5 text-white font-bold rounded-2xl text-sm transition-all hover:opacity-90"
                        style={{ background: 'linear-gradient(135deg, #1B395F 0%, #54B5BB 100%)' }}>
                        Close Audit View
                    </button>
                }
            >
                {selectedConversation && (
                    <div className="space-y-5">
                        {/* Participants */}
                        <div>
                            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block mb-2">Participant Audit</span>
                            <div className="grid grid-cols-2 gap-3">
                                {[
                                    { name: selectedConversation.sender_name, role: 'Initiator', color: '#54B5BB' },
                                    { name: selectedConversation.receiver_name, role: 'Recipient', color: '#1B395F' },
                                ].map((p) => (
                                    <div key={p.name} className="p-3 bg-slate-50 rounded-2xl border border-slate-200 flex items-center gap-2.5">
                                        <Avatar name={p.name} size="sm" />
                                        <div className="min-w-0">
                                            <h5 className="text-xs font-bold text-slate-900 truncate">{p.name}</h5>
                                            <p className="text-[10px] font-bold" style={{ color: p.color }}>{p.role}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Property */}
                        {selectedConversation.listing_title && (
                            <div className="p-4 rounded-2xl border flex items-center gap-3"
                                style={{ background: 'rgba(84,181,187,0.07)', borderColor: 'rgba(84,181,187,0.2)' }}>
                                <div className="p-2.5 rounded-xl flex-shrink-0" style={{ background: 'rgba(84,181,187,0.15)', color: '#54B5BB' }}>
                                    <Building2 size={18} />
                                </div>
                                <div className="min-w-0">
                                    <span className="text-[10px] font-extrabold uppercase tracking-wider block" style={{ color: '#54B5BB' }}>Property Reference</span>
                                    <h4 className="text-sm font-bold text-slate-900 truncate">{selectedConversation.listing_title}</h4>
                                </div>
                            </div>
                        )}

                        {/* Transcript */}
                        <div className="space-y-4">
                            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">Conversation Transcript</span>
                            {threadLoading ? (
                                <div className="py-10 text-center text-sm text-slate-400 animate-pulse">Loading transcript…</div>
                            ) : thread.map((m) => {
                                const isFromA = m.sender_id === selectedConversation.sender_id;
                                return (
                                    <div key={m.id} className={`flex flex-col ${isFromA ? 'items-start' : 'items-end'}`}>
                                        <span className="text-[10px] font-bold text-slate-400 mb-1">
                                            {isFromA ? selectedConversation.sender_name : selectedConversation.receiver_name}
                                        </span>
                                        <div className={`max-w-[80%] rounded-3xl px-4 py-3 text-sm shadow-sm ${isFromA ? 'bg-white border border-slate-200 text-slate-800' : 'text-white'}`}
                                            style={!isFromA ? { background: 'linear-gradient(135deg, #1B395F 0%, #54B5BB 100%)' } : {}}>
                                            <p className="leading-relaxed font-medium">{m.body}</p>
                                        </div>
                                        <span className="mt-1 flex items-center gap-1 text-[10px] font-semibold text-slate-400">
                                            <CalendarDays size={11} /> {formatRelativeTime(m.created_at)}
                                        </span>
                                    </div>
                                );
                            })}
                            <div ref={bottomRef} />
                        </div>
                    </div>
                )}
            </ChatModal>
        </div>
    );
};
