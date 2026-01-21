'use client';

import Link from 'next/link';
import { Mail, Send, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { useState } from 'react';
import Footer from '../components/Footer';
import Header from '../components/Header';

export default function ContactPage() {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) return;

    setLoading(true);
    setStatus('idle');

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setStatus('success');
        setFormData({ name: '', email: '', message: '' });
      } else {
        setStatus('error');
      }
    } catch (error) {
      setStatus('error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans selection:bg-cyan-500/30 flex flex-col relative overflow-hidden">
      {/* Background Glow Effects */}
      <div className="absolute top-0 left-1/2 w-[1000px] h-[500px] bg-blue-600/20 rounded-full blur-[120px] -z-10 mix-blend-screen pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[800px] h-[600px] bg-purple-600/10 rounded-full blur-[100px] -z-10 mix-blend-screen pointer-events-none" />

      <Header />

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
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div className="grid md:grid-cols-2 gap-4">
                <input 
                  type="text" 
                  placeholder="Tên của bạn" 
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/20 transition-all"
                />
                <input 
                  type="email" 
                  placeholder="Email liên hệ" 
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/20 transition-all"
                />
              </div>
              <textarea 
                rows={4} 
                placeholder="Nội dung tin nhắn..." 
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                required
                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/20 transition-all resize-none"
              />
              <button 
                disabled={loading}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold shadow-lg shadow-cyan-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                {loading ? 'Đang gửi...' : 'Gửi tin nhắn'}
              </button>
              {status === 'success' && (
                <div className="flex items-center gap-2 text-green-400 bg-green-400/10 p-3 rounded-xl border border-green-400/20 animate-in fade-in slide-in-from-bottom-2">
                  <CheckCircle className="w-5 h-5" />
                  <span>Tin nhắn đã được gửi thành công!</span>
                </div>
              )}
              {status === 'error' && (
                <div className="flex items-center gap-2 text-red-400 bg-red-400/10 p-3 rounded-xl border border-red-400/20 animate-in fade-in slide-in-from-bottom-2">
                  <AlertCircle className="w-5 h-5" />
                  <span>Có lỗi xảy ra. Vui lòng thử lại sau.</span>
                </div>
              )}
            </form>
            <p className="text-sm text-gray-500 text-center mt-4">Chúng tôi sẽ phản hồi trong thời gian sớm nhất.</p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}