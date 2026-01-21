'use client';

import Link from 'next/link';
import { Activity, Mail, Send } from 'lucide-react';

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans selection:bg-cyan-500/30 flex flex-col relative overflow-hidden">
      {/* Background Glow Effects */}
      <div className="absolute top-0 left-1/2 w-[1000px] h-[500px] bg-blue-600/20 rounded-full blur-[120px] -z-10 mix-blend-screen pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[800px] h-[600px] bg-purple-600/10 rounded-full blur-[100px] -z-10 mix-blend-screen pointer-events-none" />

      <header className="bg-[#050505]/80 backdrop-blur-xl border-b border-white/10 sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-white font-bold text-xl tracking-tight">
            <div className="p-1.5 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg shadow-[0_0_15px_rgba(6,182,212,0.5)]">
              <Activity className="w-5 h-5 text-white" />
            </div>
            <span>SEO<span className="text-cyan-400">Audit</span></span>
          </Link>
          <nav className="hidden md:flex gap-8 text-sm font-medium text-gray-400 items-center">
            <Link href="/features" className="hover:text-cyan-400 transition-colors">Tính năng</Link>
            <Link href="/pricing" className="hover:text-cyan-400 transition-colors">Bảng giá</Link>
            <Link href="/" className="px-5 py-2 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-white transition-all hover:border-cyan-500/50 hover:shadow-[0_0_15px_rgba(6,182,212,0.2)]">
              Trang chủ
            </Link>
          </nav>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-16 md:py-24 flex-grow w-full relative z-10">
        <div className="flex items-center gap-4 mb-8">
          <div className="p-3 bg-purple-500/10 rounded-2xl border border-purple-500/20">
            <Mail className="w-8 h-8 text-purple-400" />
          </div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-white">
            Liên hệ <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-500 to-red-500">Hỗ trợ</span>
          </h1>
        </div>
        
        <div className="glass-card p-8 md:p-10 rounded-3xl border border-white/10 text-gray-300 leading-relaxed space-y-8">
          <p className="text-lg">Nếu bạn cần hỗ trợ hoặc có câu hỏi, vui lòng liên hệ:</p>
          
          <div className="flex items-center gap-4 p-4 bg-white/5 rounded-xl border border-white/10 hover:border-cyan-500/30 transition-colors group">
            <div className="w-12 h-12 rounded-full bg-cyan-500/20 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
              <Mail className="w-6 h-6 text-cyan-400" />
            </div>
            <div>
              <div className="text-sm text-gray-500">Email hỗ trợ</div>
              <a href="mailto:hoangthienluan17@gmail.com" className="text-xl font-bold text-white hover:text-cyan-400 transition-colors">
                hoangthienluan17@gmail.com
              </a>
            </div>
          </div>

          <div className="space-y-4">
            <p className="font-medium text-white">Hoặc sử dụng form liên hệ:</p>
            <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
              <div className="grid md:grid-cols-2 gap-4">
                <input 
                  type="text" 
                  placeholder="Tên của bạn" 
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/20 transition-all"
                />
                <input 
                  type="email" 
                  placeholder="Email liên hệ" 
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/20 transition-all"
                />
              </div>
              <textarea 
                rows={4} 
                placeholder="Nội dung tin nhắn..." 
                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/20 transition-all resize-none"
              />
              <button className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold shadow-lg shadow-cyan-500/20 transition-all flex items-center justify-center gap-2">
                <Send className="w-4 h-4" /> Gửi tin nhắn
              </button>
            </form>
            <p className="text-sm text-gray-500 text-center mt-4">Chúng tôi sẽ phản hồi trong thời gian sớm nhất.</p>
          </div>
        </div>
      </main>

      <footer className="bg-[#050505] border-t border-white/10 py-10 mt-auto relative z-10">
        <div className="max-w-5xl mx-auto px-4 text-center">
          <p className="text-gray-500 text-sm mb-6">© {new Date().getFullYear()} SEO Audit Tool. Built for the future.</p>
        </div>
      </footer>
    </div>
  );
}