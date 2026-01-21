'use client';

import Link from 'next/link';
import { FileText } from 'lucide-react';
import Footer from '../components/Footer';
import Header from '../components/Header';

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans selection:bg-cyan-500/30 flex flex-col relative overflow-hidden">
      {/* Background Glow Effects */}
      <div className="absolute top-0 left-1/2 w-[1000px] h-[500px] bg-blue-600/20 rounded-full blur-[120px] -z-10 mix-blend-screen pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[800px] h-[600px] bg-purple-600/10 rounded-full blur-[100px] -z-10 mix-blend-screen pointer-events-none" />

      <Header />

      <main className="max-w-3xl mx-auto px-4 py-16 md:py-24 flex-grow w-full relative z-10">
        <div className="flex items-center gap-4 mb-8">
          <div className="p-3 bg-cyan-500/10 rounded-2xl border border-cyan-500/20">
            <FileText className="w-8 h-8 text-cyan-400" />
          </div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-white">
            Điều khoản <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600">Sử dụng</span>
          </h1>
        </div>
        
        <div className="glass-card p-8 md:p-10 rounded-3xl border border-white/10 text-gray-300 leading-relaxed space-y-6 text-lg">
          <p className="font-medium text-white">Khi sử dụng website này, bạn đồng ý tuân thủ các điều khoản sau:</p>
          <ul className="list-decimal list-inside space-y-4 pl-2 marker:text-cyan-500 marker:font-bold">
            <li>Website cung cấp các công cụ và thông tin phục vụ mục đích tham khảo.</li>
            <li>Chúng tôi không chịu trách nhiệm cho các thiệt hại phát sinh từ việc sử dụng dữ liệu trên website.</li>
            <li>Người dùng không được sử dụng website cho các mục đích vi phạm pháp luật.</li>
            <li>Điều khoản có thể được thay đổi mà không cần thông báo trước.</li>
          </ul>
          <div className="pt-6 mt-6 border-t border-white/10 text-red-400 bg-red-500/5 p-4 rounded-xl border border-red-500/10">
            Nếu bạn không đồng ý với bất kỳ điều khoản nào, vui lòng ngừng sử dụng website.
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}