'use client';

import Link from 'next/link';
import { Activity, Zap, Search, FileText, History, Mail, Layout, ShieldCheck } from 'lucide-react';
import Footer from '../components/Footer';

export default function FeaturesPage() {
  const features = [
    {
      icon: <Zap className="w-8 h-8 text-yellow-400" />,
      title: "Phân tích Tốc độ",
      description: "Đo lường thời gian tải trang và phản hồi server (TTFB) để đảm bảo trải nghiệm người dùng nhanh nhất."
    },
    {
      icon: <Search className="w-8 h-8 text-blue-400" />,
      title: "Audit On-page",
      description: "Quét toàn bộ các yếu tố SEO quan trọng: Title, Meta Description, H1, Alt ảnh, Open Graph và Canonical."
    },
    {
      icon: <FileText className="w-8 h-8 text-green-400" />,
      title: "Báo cáo PDF",
      description: "Xuất báo cáo chuyên nghiệp chỉ với một cú nhấp chuột. Hỗ trợ tiếng Việt, dễ dàng gửi cho khách hàng."
    },
    {
      icon: <History className="w-8 h-8 text-purple-400" />,
      title: "Lịch sử & So sánh",
      description: "Lưu trữ lịch sử kiểm tra không giới hạn. So sánh trực quan sự thay đổi điểm số giữa các lần Audit."
    },
    {
      icon: <Mail className="w-8 h-8 text-red-400" />,
      title: "Email Định kỳ",
      description: "Tự động gửi báo cáo tiến độ SEO hàng tuần qua email giúp bạn theo dõi sát sao dự án."
    },
    {
      icon: <Layout className="w-8 h-8 text-cyan-400" />,
      title: "Giao diện Web3",
      description: "Trải nghiệm người dùng hiện đại với giao diện Dark Mode, hiệu ứng Glassmorphism và tương tác 3D mượt mà."
    },
    {
      icon: <ShieldCheck className="w-8 h-8 text-orange-400" />,
      title: "Bảo mật & Riêng tư",
      description: "Dữ liệu của bạn được bảo vệ an toàn. Hỗ trợ đăng nhập Google và thanh toán bảo mật qua SePay."
    }
  ];

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
            <Link href="/features" className="text-cyan-400 transition-colors">Tính năng</Link>
            <Link href="/pricing" className="hover:text-cyan-400 transition-colors">Bảng giá</Link>
            <Link href="/" className="px-5 py-2 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-white transition-all hover:border-cyan-500/50 hover:shadow-[0_0_15px_rgba(6,182,212,0.2)]">
              Trang chủ
            </Link>
          </nav>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-16 md:py-24 flex-grow w-full relative z-10">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-black tracking-tighter text-white mb-6">
            Tính Năng <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600">Vượt Trội</span>
          </h1>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto">
            Khám phá bộ công cụ SEO mạnh mẽ được thiết kế để giúp website của bạn bứt phá thứ hạng tìm kiếm.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <div key={index} className="glass-card p-8 rounded-3xl hover:bg-white/5 transition-all duration-300 group border border-white/5 hover:border-white/20">
              <div className="mb-6 p-4 bg-white/5 rounded-2xl w-fit group-hover:scale-110 transition-transform duration-300 shadow-lg shadow-black/20">
                {feature.icon}
              </div>
              <h3 className="text-xl font-bold text-white mb-3 group-hover:text-cyan-400 transition-colors">{feature.title}</h3>
              <p className="text-gray-400 leading-relaxed text-sm">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </main>

      <Footer />
    </div>
  );
}