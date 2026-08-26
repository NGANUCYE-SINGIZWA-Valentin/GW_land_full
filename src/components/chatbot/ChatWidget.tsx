import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
} from 'react';
import { useLocation } from 'react-router-dom';
import { MessageCircle, X, Minus, Send } from 'lucide-react';
import { getChatResponse } from './chatbot.engine';
import { WELCOME_MESSAGE, SUGGESTED_QUESTIONS } from './chatbot.knowledge';
import { ChatMessage, type Message } from './ChatMessage';
import GWLandLogo from '@/components/ui/GWLandLogo';

// Lazy-load is handled at the App level — this component itself is the lazy target.

let msgCounter = 0;
const makeId = () => `msg-${++msgCounter}-${Date.now()}`;

const makeMessage = (
  role: Message['role'],
  text: string,
  link?: Message['link']
): Message => ({ id: makeId(), role, text, link, timestamp: new Date() });

/** Typing indicator dots */
const TypingIndicator: React.FC = () => (
  <div className="flex gap-2 justify-start" aria-label="Assistant is typing" role="status">
    <div className="shrink-0 w-7 h-7 rounded-full bg-brand-primary flex items-center justify-center mt-1 p-1">
      <GWLandLogo className="w-full h-full" />
    </div>
    <div className="bg-gray-100 rounded-2xl rounded-tl-sm px-4 py-3 flex items-center gap-1">
      {[0, 1, 2].map(i => (
        <span
          key={i}
          className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"
          style={{ animationDelay: `${i * 150}ms` }}
        />
      ))}
    </div>
  </div>
);

export const ChatWidget: React.FC = () => {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    makeMessage('bot', WELCOME_MESSAGE),
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen && !isMinimized) {
      setTimeout(() => inputRef.current?.focus(), 150);
      setUnreadCount(0);
    }
  }, [isOpen, isMinimized]);

  // Trap focus inside panel for accessibility
  useEffect(() => {
    if (!isOpen || isMinimized) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isMinimized]);

  const sendMessage = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || isTyping) return;

      setShowSuggestions(false);
      setInput('');
      setMessages(prev => [...prev, makeMessage('user', trimmed)]);
      setIsTyping(true);

      try {
        const response = await getChatResponse(trimmed, location.pathname);
        setMessages(prev => [
          ...prev,
          makeMessage('bot', response.answer, response.link),
        ]);
        if (!isOpen || isMinimized) {
          setUnreadCount(c => c + 1);
        }
      } catch {
        setMessages(prev => [
          ...prev,
          makeMessage('bot', 'Sorry, something went wrong. Please try again.'),
        ]);
      } finally {
        setIsTyping(false);
        setTimeout(() => inputRef.current?.focus(), 100);
      }
    },
    [isTyping, location.pathname, isOpen, isMinimized]
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  const handleSuggestion = (q: string) => sendMessage(q);

  const handleOpen = () => {
    setIsOpen(true);
    setIsMinimized(false);
    setUnreadCount(0);
  };

  const handleMinimize = () => setIsMinimized(true);
  const handleMaximize = () => { setIsMinimized(false); setUnreadCount(0); };
  // Close panel but keep floating button visible
  const handleClose = () => { setIsOpen(false); setIsMinimized(false); };
  return (
    <>
      {/* ── Floating trigger button — shown when chat is closed ── */}
      {!isOpen && (
        <button
          onClick={isMinimized ? handleMaximize : handleOpen}
          aria-label="Open website assistant"
          className="fixed bottom-6 right-6 z-[110] w-14 h-14 bg-brand-primary hover:bg-brand-primary-hover text-white rounded-full shadow-lg flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95 focus:outline-none focus:ring-2 focus:ring-brand-primary focus:ring-offset-2"
        >
          <MessageCircle size={24} />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
              {unreadCount}
            </span>
          )}
        </button>
      )}

      {/* ── Chat panel ── */}
      {isOpen && (
        <div
          ref={panelRef}
          role="dialog"
          aria-label="Website Assistant"
          aria-modal="true"
          className={`fixed bottom-6 right-6 z-[110] w-[360px] max-w-[calc(100vw-24px)] sm:max-w-[360px] bg-white rounded-2xl shadow-[0_20px_50px_-12px_rgba(148,163,184,0.32)] border border-gray-100 flex flex-col transition-all duration-300 ${
            isMinimized ? 'h-[58px] overflow-hidden' : 'h-[560px] max-h-[calc(100vh-80px)] overflow-hidden'
          }`}
        >
          {/* Header — always visible, even when minimized */}
          <div
            className="flex items-center gap-3 px-4 py-3 bg-white border-b border-gray-100 text-brand-text shrink-0 cursor-pointer"
            onClick={isMinimized ? handleMaximize : undefined}
          >
            <div className="w-8 h-8 rounded-full bg-brand-primary flex items-center justify-center">
              <MessageCircle size={18} className="text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold leading-tight text-brand-text">Website Assistant</p>
              <p className="text-[11px] text-gray-400 leading-tight">GW Land · Always here to help</p>
            </div>
            <div className="flex items-center gap-1" onClick={e => e.stopPropagation()}>
              {!isMinimized ? (
                <button
                  onClick={handleMinimize}
                  aria-label="Minimize chat"
                  className="w-7 h-7 rounded-full hover:bg-gray-100 text-gray-500 flex items-center justify-center transition-colors"
                >
                  <Minus size={14} />
                </button>
              ) : (
                <button
                  onClick={handleMaximize}
                  aria-label="Expand chat"
                  className="w-7 h-7 rounded-full hover:bg-gray-100 text-gray-500 flex items-center justify-center transition-colors"
                >
                  <MessageCircle size={14} />
                </button>
              )}
              <button
                onClick={handleClose}
                aria-label="Close chat"
                title="Close"
                className="w-7 h-7 rounded-full hover:bg-gray-100 text-gray-500 flex items-center justify-center transition-colors"
              >
                <X size={14} />
              </button>
            </div>
          </div>

          {/* Body — hidden when minimized */}
          {!isMinimized && (
            <>
              {/* Messages */}
              <div
                className="flex-1 min-h-0 overflow-y-auto px-4 py-4 flex flex-col gap-3"
                role="list"
                aria-label="Chat messages"
                aria-live="polite"
                aria-atomic="false"
              >
                {messages.map(msg => (
                  <ChatMessage key={msg.id} message={msg} />
                ))}
                {isTyping && <TypingIndicator />}
                <div ref={messagesEndRef} />
              </div>

              {/* Suggested questions */}
              {showSuggestions && (
                <div className="px-4 pb-2 flex flex-wrap gap-1.5 shrink-0">
                  {SUGGESTED_QUESTIONS.map(q => (
                    <button
                      key={q}
                      onClick={() => handleSuggestion(q)}
                      className="text-[11px] font-medium px-2.5 py-1 rounded-full bg-gray-100 text-gray-600 hover:bg-brand-primary hover:text-white transition-colors border border-gray-200 hover:border-brand-primary"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              )}

              {/* Input */}
              <form
                onSubmit={handleSubmit}
                className="flex items-center gap-2 px-3 py-3 border-t border-gray-100 shrink-0"
              >
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  placeholder="Ask me anything…"
                  aria-label="Type your message"
                  disabled={isTyping}
                  className="flex-1 text-sm bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:border-brand-primary transition-colors placeholder-gray-400 disabled:opacity-50"
                />
                <button
                  type="submit"
                  disabled={!input.trim() || isTyping}
                  aria-label="Send message"
                  className="w-9 h-9 rounded-xl bg-brand-primary hover:bg-brand-primary-hover text-white flex items-center justify-center transition-all disabled:opacity-40 disabled:cursor-not-allowed active:scale-95"
                >
                  <Send size={15} />
                </button>
              </form>
            </>
          )}
        </div>
      )}
    </>
  );
};
