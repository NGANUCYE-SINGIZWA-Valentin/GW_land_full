import React from 'react';
import { Link } from 'react-router-dom';
import { User } from 'lucide-react';
import GWLandLogo from '@/components/ui/GWLandLogo';

export interface Message {
  id: string;
  role: 'user' | 'bot';
  text: string;
  link?: { label: string; href: string };
  timestamp: Date;
}

interface ChatMessageProps {
  message: Message;
}

/** Renders **bold**, bullet lines, and line breaks from plain text */
const renderText = (text: string): React.ReactNode => {
  return text.split('\n').map((line, i) => {
    // Bold: **text**
    const parts = line.split(/\*\*(.*?)\*\*/g);
    const rendered = parts.map((part, j) =>
      j % 2 === 1 ? <strong key={j}>{part}</strong> : part
    );
    return (
      <span key={i} className="block">
        {rendered}
        {i < text.split('\n').length - 1 && <br />}
      </span>
    );
  });
};

export const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const isBot = message.role === 'bot';

  return (
    <div
      className={`flex gap-2 ${isBot ? 'justify-start' : 'justify-end'}`}
      role="listitem"
      aria-label={`${isBot ? 'Assistant' : 'You'}: ${message.text}`}
    >
      {/* Bot avatar */}
      {isBot && (
        <div className="shrink-0 w-7 h-7 rounded-full bg-brand-primary flex items-center justify-center mt-1 p-1" aria-hidden="true">
          <GWLandLogo variant="white" className="w-full h-full" />
        </div>
      )}

      <div className={`max-w-[80%] flex flex-col gap-1 ${isBot ? 'items-start' : 'items-end'}`}>
        <div
          className={`px-3 py-2.5 rounded-2xl text-sm leading-relaxed ${
            isBot
              ? 'bg-gray-100 text-gray-800 rounded-tl-sm'
              : 'bg-brand-primary text-white rounded-tr-sm'
          }`}
        >
          {renderText(message.text)}

          {/* Optional CTA link */}
          {message.link && (
            <Link
              to={message.link.href}
              className="mt-2 inline-flex items-center gap-1 text-xs font-semibold underline text-brand-primary bg-white px-2 py-1 rounded-lg hover:bg-gray-50 transition-colors"
            >
              {message.link.label} →
            </Link>
          )}
        </div>

        <span className="text-[10px] text-gray-400 px-1">
          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>

      {/* User avatar */}
      {!isBot && (
        <div className="shrink-0 w-7 h-7 rounded-full bg-gray-200 flex items-center justify-center mt-1" aria-hidden="true">
          <User size={14} className="text-gray-600" />
        </div>
      )}
    </div>
  );
};
