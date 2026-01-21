'use client';

import { useState, useRef, useEffect, memo } from 'react';
import { MessageCircle, X, Send, Bot, User, Sparkles } from 'lucide-react';
import { useSession } from 'next-auth/react';
import Image from 'next/image';

// Di chuyển hằng số ra ngoài để tránh khởi tạo lại mỗi lần render
const API_URL = (process.env.NEXT_PUBLIC_API_URL || 'https://seo-audit-backend-ebvj.onrender.com').replace(/\/$/, '');

// Tách ChatWindow thành component riêng và dùng memo để tối ưu render
const ChatWindow = memo(({ messages, onSend, isLoading, userImage }: { 
  messages: { role: 'user' | 'bot'; content: string }[], 
  onSend: (msg: string) => void, 
  isLoading: boolean,
  userImage?: string | null
}) => {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    onSend(input);
    setInput('');
  };

  return (
    <div className="fixed bottom-20 right-4 md:bottom-24 md:right-6 z-50 w-[calc(100vw-2rem)] sm:w-[350px] md:w-[400px] h-[60vh] md:h-[500px] glass-card rounded-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-10 fade-in duration-300 border border-gray-200 dark:border-white/10 shadow-2xl backdrop-blur-xl bg-white/80 dark:bg-[#050505]/80">
      {/* Header */}
      <div className="p-4 bg-gray-50 dark:bg-white/5 border-b border-gray-200 dark:border-white/10 flex items-center gap-3">
        <div className="p-2 bg-cyan-100 dark:bg-cyan-500/20 rounded-lg border border-cyan-200 dark:border-cyan-500/30">
          <Bot className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
        </div>
        <div>
          <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
            AI Assistant <Sparkles className="w-3 h-3 text-yellow-500 dark:text-yellow-400" />
          </h3>
          <p className="text-xs text-green-600 dark:text-green-400 flex items-center gap-1">
            <span className="w-1.5 h-1.5 bg-green-500 dark:bg-green-400 rounded-full animate-pulse" /> Online
          </p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-white/10 scrollbar-track-transparent">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 border border-gray-200 dark:border-white/10 overflow-hidden ${
              msg.role === 'user' ? 'bg-purple-100 dark:bg-purple-500/20' : 'bg-cyan-100 dark:bg-cyan-500/20'
            }`}>
              {msg.role === 'user' ? (
                userImage ? (
                  <Image src={userImage} alt="User" width={32} height={32} className="w-full h-full object-cover" />
                ) : (
                  <User className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                )
              ) : <Bot className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />}
            </div>
            <div className={`max-w-[80%] p-3 rounded-2xl text-sm leading-relaxed shadow-sm ${
              msg.role === 'user' 
                ? 'bg-purple-100 dark:bg-purple-600/20 border border-purple-200 dark:border-purple-500/30 text-purple-900 dark:text-purple-100 rounded-tr-none' 
                : 'bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-800 dark:text-gray-200 rounded-tl-none'
            }`}>
              {msg.content}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-cyan-100 dark:bg-cyan-500/20 flex items-center justify-center shrink-0 border border-gray-200 dark:border-white/10">
              <Bot className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
            </div>
            <div className="bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 p-3 rounded-2xl rounded-tl-none flex gap-1 items-center">
              <span className="w-1.5 h-1.5 bg-cyan-500 dark:bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '0s' }} />
              <span className="w-1.5 h-1.5 bg-cyan-500 dark:bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
              <span className="w-1.5 h-1.5 bg-cyan-500 dark:bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 bg-gray-50 dark:bg-white/5 border-t border-gray-200 dark:border-white/10">
        <form 
          onSubmit={handleSubmit}
          className="flex gap-2"
        >
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Hỏi gì đó..."
            className="flex-1 bg-white dark:bg-black/40 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/20 transition-all placeholder:text-gray-400 dark:placeholder:text-gray-600"
          />
          <button 
            type="submit"
            disabled={isLoading || !input.trim()}
            className="p-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-cyan-500/20"
          >
            <Send className="w-5 h-5" />
          </button>
        </form>
      </div>
    </div>
  );
});

ChatWindow.displayName = 'ChatWindow';

export default function ChatBot() {
  const { data: session } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{ role: 'user' | 'bot'; content: string }[]>([
    { role: 'bot', content: 'Xin chào! Tôi là trợ lý AI của SEO Audit Tool. Tôi có thể giúp gì cho bạn?' }
  ]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSend = async (userMessage: string) => {
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      console.log("🤖 ChatBot connecting to:", `${API_URL}/api/chat`);

      const res = await fetch(`${API_URL}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMessage }),
      });
      const data = await res.json();
      
      setMessages(prev => [...prev, { role: 'bot', content: data.reply }]);
    } catch (error) {
      console.error("❌ ChatBot Error:", error);
      setMessages(prev => [...prev, { role: 'bot', content: 'Xin lỗi, tôi đang gặp sự cố kết nối.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-4 right-4 md:bottom-6 md:right-6 z-50 p-3 md:p-4 rounded-full shadow-[0_0_20px_rgba(6,182,212,0.4)] transition-all duration-300 hover:scale-110 group ${
          isOpen ? 'bg-red-500 rotate-90' : 'bg-gradient-to-r from-cyan-500 to-blue-600'
        }`}
      >
        {isOpen ? <X className="w-6 h-6 text-white" /> : <MessageCircle className="w-6 h-6 text-white" />}
        {!isOpen && (
          <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-ping" />
        )}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <ChatWindow 
          messages={messages} 
          onSend={handleSend} 
          isLoading={isLoading} 
          userImage={session?.user?.image}
        />
      )}
    </>
  );
}