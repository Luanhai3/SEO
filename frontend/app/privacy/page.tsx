'use client';

import Link from 'next/link';
import { ShieldCheck } from 'lucide-react';
import Footer from '../components/Footer';
import Header from '../components/Header';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans selection:bg-cyan-500/30 flex flex-col relative overflow-hidden">
      {/* Background Glow Effects */}
      <div className="absolute top-0 left-1/2 w-[1000px] h-[500px] bg-blue-600/20 rounded-full blur-[120px] -z-10 mix-blend-screen pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[800px] h-[600px] bg-purple-600/10 rounded-full blur-[100px] -z-10 mix-blend-screen pointer-events-none" />

      <Header />

      <main className="max-w-3xl mx-auto px-4 py-16 md:py-24 flex-grow w-full relative z-10">
        <div className="flex items-center gap-4 mb-8">
          <div className="p-3 bg-green-500/10 rounded-2xl border border-green-500/20">
            <ShieldCheck className="w-8 h-8 text-green-400" />
          </div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-white">
            Chính sách <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 via-emerald-500 to-teal-600">Bảo mật</span>
          </h1>
        </div>
        
        <div className="glass-card p-8 md:p-10 rounded-3xl border border-white/10 text-gray-300 leading-relaxed space-y-6 text-lg">
          <p className="font-medium text-white">Chúng tôi tôn trọng quyền riêng tư của người dùng.</p>
          <ul className="list-decimal list-inside space-y-4 pl-2 marker:text-green-500 marker:font-bold">
            <li><strong className="text-white">Dữ liệu thu thập:</strong> email, thông tin tài khoản, thông tin thanh toán (nếu có).</li>
            <li><strong className="text-white">Mục đích sử dụng:</strong> cung cấp dịch vụ, hỗ trợ người dùng, cải thiện sản phẩm.</li>
            <li>Chúng tôi không chia sẻ dữ liệu cá nhân cho bên thứ ba, trừ khi có yêu cầu pháp lý.</li>
            <li>Dữ liệu được lưu trữ và bảo mật theo các tiêu chuẩn hợp lý.</li>
          </ul>
          <div className="pt-6 mt-6 border-t border-white/10 text-gray-400 italic">
            Người dùng có thể liên hệ để yêu cầu chỉnh sửa hoặc xóa dữ liệu cá nhân.
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}