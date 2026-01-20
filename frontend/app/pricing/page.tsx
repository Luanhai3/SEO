'use client';

import Link from 'next/link';
import { Activity, Check, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';

export default function PricingPage() {
  const [currency, setCurrency] = useState<'VND' | 'USD'>('VND');

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
            <Link href="/pricing" className="text-cyan-400 transition-colors">Bảng giá</Link>
            <Link href="/" className="px-5 py-2 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-white transition-all hover:border-cyan-500/50 hover:shadow-[0_0_15px_rgba(6,182,212,0.2)]">
              Trang chủ
            </Link>
          </nav>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-16 md:py-24 flex-grow w-full relative z-10">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-black tracking-tighter text-white mb-6">
            Chọn Gói <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600">Phù Hợp</span>
          </h1>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto">
            Bắt đầu miễn phí hoặc nâng cấp để mở khóa toàn bộ sức mạnh của công cụ SEO Audit.
          </p>

          {/* CURRENCY TOGGLE */}
          <div className="flex justify-center mt-8">
            <div className="bg-white/5 p-1 rounded-xl border border-white/10 inline-flex relative">
              <button
                onClick={() => setCurrency('VND')}
                className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${currency === 'VND' ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-500/20' : 'text-gray-400 hover:text-white'}`}
              >
                VND
              </button>
              <button
                onClick={() => setCurrency('USD')}
                className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${currency === 'USD' ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-500/20' : 'text-gray-400 hover:text-white'}`}
              >
                USD
              </button>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* FREE PLAN */}
          <div className="glass-card p-8 rounded-3xl border border-white/10 flex flex-col relative overflow-hidden group hover:border-white/20 transition-all">
            <div className="mb-6">
              <h3 className="text-xl font-bold text-gray-300 mb-2">Cơ bản</h3>
              <div className="flex items-baseline gap-1">
                <AnimatedPrice value={0} currency={currency} />
                <span className="text-gray-500">/tháng</span>
              </div>
              <p className="text-gray-400 text-sm mt-4">Dành cho người mới bắt đầu tìm hiểu SEO.</p>
            </div>
            
            <div className="flex-grow space-y-4 mb-8">
              <FeatureItem text="1 Website / ngày" active />
              <FeatureItem text="Phân tích On-page cơ bản" active />
              <FeatureItem text="Điểm số SEO tổng quan" active />
              <FeatureItem text="Xuất báo cáo PDF" active={false} />
              <FeatureItem text="Lịch sử & So sánh" active={false} />
              <FeatureItem text="Email báo cáo định kỳ" active={false} />
            </div>

            <Link href="/" className="w-full py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold text-center transition-all">
              Bắt đầu ngay
            </Link>
          </div>

          {/* PRO PLAN */}
          <div className="glass-card p-8 rounded-3xl border border-cyan-500/30 flex flex-col relative overflow-hidden group hover:border-cyan-500/50 transition-all shadow-[0_0_30px_rgba(6,182,212,0.1)]">
            <div className="absolute top-0 right-0 bg-gradient-to-bl from-cyan-500 to-blue-600 text-white text-xs font-bold px-4 py-1 rounded-bl-xl">
              KHUYÊN DÙNG
            </div>
            
            <div className="mb-6">
              <h3 className="text-xl font-bold text-cyan-400 mb-2">Chuyên nghiệp</h3>
              <div className="flex items-baseline gap-1">
                <AnimatedPrice value={currency === 'VND' ? 50000 : 2} currency={currency} />
                <span className="text-gray-500">/tháng</span>
              </div>
              <p className="text-gray-400 text-sm mt-4">Dành cho Freelancer và chủ doanh nghiệp nhỏ.</p>
            </div>
            
            <div className="flex-grow space-y-4 mb-8">
              <FeatureItem text="Không giới hạn Website" active />
              <FeatureItem text="Phân tích chuyên sâu & Gợi ý sửa" active />
              <FeatureItem text="Điểm số SEO chi tiết" active />
              <FeatureItem text="Xuất báo cáo PDF (Tiếng Việt)" active />
              <FeatureItem text="Lịch sử & So sánh tiến độ" active />
              <FeatureItem text="Email báo cáo hàng tuần" active />
            </div>

            <Link 
              href="/" 
              onClick={() => confetti({
                particleCount: 120,
                spread: 70,
                origin: { y: 0.6 },
                colors: ['#22d3ee', '#3b82f6', '#a855f7']
              })}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-center transition-all shadow-lg shadow-cyan-500/20"
            >
              Nâng cấp ngay
            </Link>
          </div>
        </div>
      </main>

      <footer className="bg-[#050505] border-t border-white/10 py-10 mt-auto relative z-10">
        <div className="max-w-5xl mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-6 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
             <Activity className="w-6 h-6 text-cyan-500" />
             <span className="font-bold text-white text-xl">SEO<span className="text-cyan-500">Audit</span></span>
          </div>
          <p className="text-gray-500 text-sm mb-6">© {new Date().getFullYear()} SEO Audit Tool. Built for the future.</p>
        </div>
      </footer>
    </div>
  );
}

function AnimatedPrice({ value, currency }: { value: number; currency: 'VND' | 'USD' }) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    let startTimestamp: number | null = null;
    const duration = 1000;
    const start = 0; // Luôn đếm từ 0 lên để tạo hiệu ứng nảy số

    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3); // Cubic ease out
      
      setDisplayValue(start + (value - start) * ease);

      if (progress < 1) {
        window.requestAnimationFrame(step);
      }
    };
    
    window.requestAnimationFrame(step);
  }, [value]);

  return (
    <span className="text-4xl font-black text-white">
      {currency === 'VND' 
        ? `${Math.floor(displayValue).toLocaleString('vi-VN')}đ` 
        : `$${Math.floor(displayValue)}`
      }
    </span>
  );
}

function FeatureItem({ text, active }: { text: string; active: boolean }) {
  return (
    <div className="flex items-center gap-3">
      <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${active ? 'bg-green-500/20 text-green-400' : 'bg-white/5 text-gray-600'}`}>
        {active ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
      </div>
      <span className={`text-sm ${active ? 'text-gray-200' : 'text-gray-500 line-through'}`}>{text}</span>
    </div>
  );
}