import React, { useEffect, useMemo, useRef, useState } from 'react';
import { StatCard } from '@/components/dashboard/StatCard';
import { TableBlueprint, ColumnConfig } from '@/components/dashboard/TableBlueprint';
import { ChatModal } from '@/components/dashboard/ChatModal';
import { Avatar } from '@/components/ui/Avatar';
import {
    MessageSquareText, MailQuestion, Building2, CalendarDays,
    Send, CheckCheck, FileCheck, Calendar, DollarSign, Sparkles,
} from 'lucide-react';
import { useAuth } from '@/components/auth/AuthContext';
import * as messagesApi from '@/api/messages';
import { ApiError } from '@/api/client';
import type { Conversation, Message } from '@/api/types';
import { formatRelativeTime } from '@/utils/format';
import { useInterval } from '@/hooks/useInterval';

const INBOX_POLL_MS = 10000;
const THREAD_POLL_MS = 5000;

export const BuyerMessages: React.FC = () => {
    const { user } = useAuth();
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeFilter, setActiveFilter] = useState<'all' | 'unread'>('all');

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
    const [thread, setThread] = useState<Message[]>([]);
    const [threadLoading, setThreadLoading] = useState(false);
    const [replyBody, setReplyBody] = useState('');
    const [sending, setSending] = useState(false);
    const [sendError, setSendError] = useState('');
    const bottomRef = useRef<HTMLDivElement>(null);

    const loadInbox = (silent = false) => {
        if (!silent) setLoading(true);
        messagesApi.getInbox()
            .then((res) => setConversations(res?.conversations || []))
            .catch(() => setConversations([]))
            .finally(() => { if (!silent) setLoading(false); });
    };

    useEffect(() => { loadInbox(); }, []);
    useInterval(() => { if (!document.hidden) loadInbox(true); }, INBOX_POLL_MS);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [thread]);

    const otherPartyId   = (c: Conversation) => (c.sender_id === user?.id ? c.receiver_id   : c.sender_id);
    const otherPartyName = (c: Conversation) => (c.sender_id === user?.id ? c.receiver_name : c.sender_name);

    const kpiCounts = useMemo(() => ({
        all:    conversations.length,
        unread: conversations.filter((c) => Number(c.unread_count || 0) > 0).length,
    }), [conversations]);

    const filtered = useMemo(() =>
        activeFilter === 'unread'
            ? conversations.filter((c) => Number(c.unread_count || 0) > 0)
            : conversations,
    [conversations, activeFilter]);

    const openThread = async (conversation: Conversation) => {
        setSelectedConversation(conversation);
        setIsModalOpen(true);
        setThreadLoading(true);
        setSendError('');
        setReplyBody('');
        try {
            const { messages } = await messagesApi.getThread(otherPartyId(conversation), conversation.listing_id || undefined);
            setThread(messages);
            loadInbox();
        } finally {
            setThreadLoading(false);
        }
    };

    useInterval(() => {
        if (document.hidden || !isModalOpen || !selectedConversation) return;
        messagesApi.getThread(otherPartyId(selectedConversation), selectedConversation.listing_id || undefined)
            .then(({ messages }) => setThread(messages));
    }, isModalOpen ? THREAD_POLL_MS : null);

    const handleReply = async (textToSend?: string) => {
        const messageText = textToSend || replyBody;
        if (!selectedConversation || !messageText.trim()) return;
        setSending(true); setSendError('');
        try {
            await messagesApi.sendMessage({
                receiver_id: otherPartyId(selectedConversation),
                body: messageText.trim(),
                listing_id: selectedConversation.listing_id || undefined,
            });
            if (!textToSend) setReplyBody('');
            const { messages } = await messagesApi.getThread(otherPartyId(selectedConversation), selectedConversation.listing_id || undefined);
            setThread(messages);
            loadInbox();
        } catch (err) {
            setSendError(err instanceof ApiError ? err.message : 'Failed to send message.');
        } finally {
            setSending(false);
        }
    };

    const QUICK_BUYER_ACTIONS = [
        { label: 'Request Site Visit',       icon: <Calendar size={13} />,  text: 'Hello! I am interested in visiting this land parcel. What days are best for a walk-through?' },
        { label: 'Ask for Parcel Title/UPI', icon: <FileCheck size={13} />, text: 'Hi! Could you please share the official UPI title document for verification?' },
        { label: 'Make an Offer',            icon: <DollarSign size={13} />, text: 'Hi! I would like to submit an official price offer for this property.' },
    ];

    const columns: ColumnConfig<Conversation>[] = [
        {
            header: 'Land Seller',
            render: (c) => (
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <Avatar name={otherPartyName(c)} size="md" />
                        {Number(c.unread_count || 0) > 0 && (
                            <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-blue-500 ring-2 ring-white animate-pulse" />
                        )}
                    </div>
                    <div className="min-w-0">
                        <h4 className="text-sm font-bold text-slate-800 truncate">{otherPartyName(c)}</h4>
                        <p className="text-[11px] text-slate-400 font-medium">Verified Agent / Seller</p>
                    </div>
                </div>
            ),
        },
        {
            header: 'Property Inquiry',
            render: (c) => (
                <div className="flex items-center gap-2 max-w-[200px]">
                    <div className="p-1.5 rounded-lg flex-shrink-0" style={{ background: 'rgba(27,57,95,0.08)', color: '#1B395F' }}>
                        <Building2 size={14} />
                    </div>
                    <span className="text-xs font-semibold text-slate-800 truncate">{c.listing_title || 'General Inquiry'}</span>
                </div>
            ),
        },
        { header: 'Last Message', render: (c) => <span className="text-slate-500 text-xs truncate max-w-[240px] block font-medium">{c.body}</span> },
        { header: 'Date', render: (c) => formatRelativeTime(c.created_at), cellClassName: 'text-slate-400 text-xs font-semibold' },
        {
            header: 'Status',
            render: (c) => Number(c.unread_count || 0) > 0 ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold bg-blue-50 text-blue-600 border border-blue-200">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-ping" /> {c.unread_count} new
                </span>
            ) : (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-500 border border-slate-200">
                    <CheckCheck size={13} className="text-emerald-500" /> Read
                </span>
            ),
        },
        {
            header: 'Action', headerClassName: 'text-right', cellClassName: 'text-right',
            render: (c) => (
                <button onClick={() => openThread(c)}
                    className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl border transition-all hover:scale-105"
                    style={{ color: '#1B395F', background: 'rgba(27,57,95,0.08)', borderColor: 'rgba(27,57,95,0.15)' }}>
                    <MessageSquareText size={14} /> Open Thread
                </button>
            ),
        },
    ];

    return (
        <div className="space-y-8 font-sans antialiased">
            {/* Hero */}
            <div className="relative overflow-hidden rounded-3xl p-8 text-white shadow-2xl border border-slate-800"
                style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1B395F 50%, #54B5BB 100%)' }}>
                <div className="absolute right-0 top-0 -mt-10 -mr-10 w-72 h-72 rounded-full blur-3xl pointer-events-none opacity-20"
                    style={{ background: '#54B5BB' }} />
                <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                    <div>
                        <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider mb-3 border"
                            style={{ background: 'rgba(84,181,187,0.2)', color: '#a7e8eb', borderColor: 'rgba(84,181,187,0.3)' }}>
                            <Sparkles size={12} /> Buyer Messages
                        </span>
                        <h1 className="text-2xl md:text-3xl font-black tracking-tight">Inquiries & Seller Responses</h1>
                        <p className="text-slate-300 text-sm mt-1 max-w-xl">Track conversations with land sellers, request site visits, and get land title documentation.</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="px-4 py-2.5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 text-center">
                            <p className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">Active Threads</p>
                            <p className="text-xl font-black">{kpiCounts.all}</p>
                        </div>
                        <div className="px-4 py-2.5 rounded-2xl backdrop-blur-md border text-center"
                            style={{ background: 'rgba(59,130,246,0.2)', borderColor: 'rgba(59,130,246,0.3)' }}>
                            <p className="text-[11px] font-bold text-blue-300 uppercase tracking-wider">Unread</p>
                            <p className="text-xl font-black text-blue-300">{kpiCounts.unread}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* KPI cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 max-w-xl">
                <StatCard title="All Conversations" value={String(kpiCounts.all)} icon={<MessageSquareText size={20} />}
                    accentGradient="cyan" showSubtext={false} isActive={activeFilter === 'all'} onClick={() => setActiveFilter('all')} />
                <StatCard title="Unread Messages" value={String(kpiCounts.unread)} icon={<MailQuestion size={20} />}
                    accentGradient="purple" showSubtext={false} isActive={activeFilter === 'unread'} onClick={() => setActiveFilter('unread')} />
            </div>

            {/* Table */}
            <TableBlueprint data={filtered} columns={columns} isLoading={loading}
                emptyMessage={loading ? 'Loading conversations...' : 'No conversations yet — enquire on a listing to contact a seller!'}
                searchPlaceholder="Search seller or property..." searchKeys={['sender_name', 'receiver_name', 'listing_title']}
                totalItems={filtered.length} hasPrevPage={false} hasNextPage={false} />

            {/* ── Centered Chat Modal ── */}
            <ChatModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={selectedConversation ? otherPartyName(selectedConversation) : 'Conversation'}
                subtitle="Seller Discussion Thread"
                icon={<MessageSquareText size={18} />}
                footer={selectedConversation && (
                    <div className="space-y-3">
                        <div>
                            <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 mb-2">Quick Buyer Requests</p>
                            <div className="flex flex-wrap gap-2">
                                {QUICK_BUYER_ACTIONS.map((chip, idx) => (
                                    <button key={idx} onClick={() => handleReply(chip.text)} disabled={sending}
                                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl border transition-all hover:scale-105 disabled:opacity-50"
                                        style={{ color: '#1B395F', background: 'rgba(27,57,95,0.07)', borderColor: 'rgba(27,57,95,0.15)' }}>
                                        {chip.icon} {chip.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                        {sendError && <p className="text-xs font-bold text-red-500">{sendError}</p>}
                        <div className="flex gap-2">
                            <input type="text" value={replyBody} onChange={(e) => setReplyBody(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleReply()}
                                placeholder="Type your message to the seller..."
                                className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#54B5BB]/40 focus:border-[#54B5BB] transition-all" />
                            <button onClick={() => handleReply()} disabled={sending || !replyBody.trim()}
                                className="px-5 py-3 text-white font-bold rounded-2xl flex items-center gap-2 text-sm disabled:opacity-40 transition-all hover:scale-105 flex-shrink-0"
                                style={{ background: 'linear-gradient(135deg, #1B395F 0%, #54B5BB 100%)', boxShadow: '0 4px 14px rgba(27,57,95,0.3)' }}>
                                {sending ? 'Sending...' : <><Send size={15} /> Send</>}
                            </button>
                        </div>
                    </div>
                )}
            >
                {selectedConversation && (
                    <div className="space-y-5">
                        <div className="p-4 rounded-2xl border flex items-center gap-3"
                            style={{ background: 'rgba(27,57,95,0.05)', borderColor: 'rgba(27,57,95,0.12)' }}>
                            <div className="p-2.5 rounded-xl flex-shrink-0" style={{ background: 'rgba(27,57,95,0.1)', color: '#1B395F' }}>
                                <Building2 size={18} />
                            </div>
                            <div className="min-w-0">
                                <span className="text-[10px] font-extrabold uppercase tracking-wider block" style={{ color: '#1B395F' }}>Property Reference</span>
                                <h4 className="text-sm font-bold text-slate-900 truncate">{selectedConversation.listing_title || 'Land Parcel Inquiry'}</h4>
                            </div>
                        </div>
                        {threadLoading ? (
                            <div className="py-12 text-center text-sm text-slate-400 animate-pulse">Loading messages…</div>
                        ) : thread.length === 0 ? (
                            <div className="py-12 text-center text-sm text-slate-400">No messages yet.</div>
                        ) : thread.map((m) => {
                            const isMine = m.sender_id === user?.id;
                            return (
                                <div key={m.id} className={`flex flex-col ${isMine ? 'items-end' : 'items-start'}`}>
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                                        {isMine ? 'You (Buyer)' : otherPartyName(selectedConversation)}
                                    </span>
                                    <div className={`max-w-[80%] rounded-3xl px-4 py-3 text-sm shadow-sm ${isMine ? 'text-white' : 'bg-white border border-slate-200 text-slate-800'}`}
                                        style={isMine ? { background: 'linear-gradient(135deg, #1B395F 0%, #54B5BB 100%)' } : {}}>
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
                )}
            </ChatModal>
        </div>
    );
};
