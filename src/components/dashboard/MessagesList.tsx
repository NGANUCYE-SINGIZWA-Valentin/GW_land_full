import React from 'react';

interface Message {
  name: string;
  message: string;
  time: string;
  avatar: string;
  unread: boolean;
}

interface MessagesListProps {
  messages: Message[];
  onViewAll?: () => void;
  onMessageClick?: (message: Message, index: number) => void;
}

export const MessagesList: React.FC<MessagesListProps> = ({ messages, onViewAll, onMessageClick }) => {
  return (
    <div className="bg-white p-5 sm:p-6 rounded-2xl shadow-sm shadow-slate-200 w-full">
      <div className="flex justify-between items-center mb-5">
        <h2 className="text-sm sm:text-base font-medium tracking-tight antialiased text-slate-700 truncate">Recent Inquiries</h2>
        <button
          onClick={onViewAll}
          className="text-xs font-semibold text-brand-primary hover:text-brand-primary-hover hover:underline flex-shrink-0"
        >
          View All
        </button>
      </div>
      <div className="space-y-3">
        {messages.map((msg, i) => (
          <div key={i} onClick={() => onMessageClick?.(msg, i)} className={`flex items-start gap-3 p-2.5 rounded-xl border transition-all hover:bg-slate-100 cursor-pointer ${msg.unread ? 'bg-blue-50/30 border-blue-100/50' : 'bg-slate-50/30 border-slate-50'}`}>
            <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0 ${msg.unread ? 'bg-blue-500 text-white' : 'bg-slate-200 text-slate-600'}`}>
              {msg.avatar}
            </div>
            <div className="flex flex-col min-w-0 flex-1">
              <div className="flex items-center justify-between gap-2">
                <span className={`text-sm truncate ${msg.unread ? 'font-semibold text-slate-800' : 'font-medium text-slate-700'}`}>
                  {msg.name}
                </span>
                <span className="text-[10px] text-slate-400 whitespace-nowrap flex-shrink-0">{msg.time}</span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5 line-clamp-1 leading-relaxed">{msg.message}</p>
            </div>
            {msg.unread && (
              <span className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0 mt-1.5" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};