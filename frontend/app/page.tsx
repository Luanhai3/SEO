'use client';

import { useState, useRef, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useSession, signIn, signOut } from "next-auth/react";
import {
  Search,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Loader2,
  ArrowRight,
  Activity,
  Globe,
  Download,
  Lock,
  X,
} from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import confetti from 'canvas-confetti';
import Footer from './components/Footer';
import Header from './components/Header';

/* ================= COMPONENTS ================= */

const Typewriter = ({ text, className }: { text: string; className?: string }) => {
  const [displayText, setDisplayText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    let timer: NodeJS.Timeout;

    if (!isDeleting && displayText.length < text.length) {
      // Đang gõ chữ
      timer = setTimeout(() => {
        setDisplayText(text.slice(0, displayText.length + 1));
      }, 150);
    } else if (!isDeleting && displayText.length === text.length) {
      // Gõ xong, chờ 2s rồi xóa
      timer = setTimeout(() => {
        setIsDeleting(true);
      }, 2000);
    } else if (isDeleting && displayText.length > 0) {
      // Đang xóa chữ (nhanh hơn)
      timer = setTimeout(() => {
        setDisplayText(text.slice(0, displayText.length - 1));
      }, 50);
    } else if (isDeleting && displayText.length === 0) {
      // Xóa xong, chờ 0.5s rồi gõ lại
      timer = setTimeout(() => {
        setIsDeleting(false);
      }, 500);
    }

    return () => clearTimeout(timer);
  }, [displayText, isDeleting, text]);

  return (
    <span className="inline-flex">
      <span className={className}>{displayText}</span>
      <span className="animate-pulse text-cyan-400 ml-1">|</span>
    </span>
  );
};

/* ================= TYPES ================= */

interface AuditResult {
  id?: string;
  url: string;
  score: number;
  summary: {
    passed: number;
    warning: number;
    critical: number;
  };
  audits: {
    title: string;
    status: 'passed' | 'warning' | 'critical';
    msg: string;
    fix: string;
  }[];
  date?: string;
}

/* ================= PAGE ================= */

function HomeContent() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AuditResult | null>(null);
  const [error, setError] = useState('');
  const { data: session, status } = useSession();
  const [isPro, setIsPro] = useState(false);
  const [paymentConfig, setPaymentConfig] = useState<{ url: string; fields: any } | null>(null);
  const paymentFormRef = useRef<HTMLFormElement>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [history, setHistory] = useState<any[]>([]);
  const [compareSelection, setCompareSelection] = useState<string[]>([]);
  const [showCompareModal, setShowCompareModal] = useState(false);
  const [shake, setShake] = useState(false);
  const audioCtxRef = useRef<AudioContext | null>(null);

  const searchParams = useSearchParams();
  const router = useRouter();

  // Đảm bảo URL không có dấu gạch chéo ở cuối
  const API_URL = (process.env.NEXT_PUBLIC_API_URL || 'https://seo-audit-backend-ebvj.onrender.com').replace(/\/$/, '');

  // Debug: Kiểm tra xem Frontend đang kết nối tới đâu
  useEffect(() => {
    console.log('🔌 API URL đang sử dụng:', API_URL);
  }, [API_URL]);

  // Kiểm tra trạng thái PRO
  useEffect(() => {
    if (!session?.user?.email) return;
    const userEmail = session.user.email;
    // 1. Kiểm tra LocalStorage trước
    const savedPro = localStorage.getItem(`isPro_${userEmail}`);
    if (savedPro === 'true') {
      setIsPro(true);
      return; // Nếu đã lưu là PRO thì không cần poll nữa
    }

    const checkProStatus = async () => {
      try {
        const res = await fetch(`${API_URL}/api/check-pro/${encodeURIComponent(userEmail)}`);
        const data = await res.json();
        if (data.isPro) {
          setIsPro(true);
          // 2. Lưu vào LocalStorage khi xác nhận thành công
          localStorage.setItem(`isPro_${userEmail}`, 'true');
        }
      } catch (error) {
        console.error('Lỗi kiểm tra PRO:', error);
      }
    };

    checkProStatus();
    const interval = setInterval(checkProStatus, 5000); // Polling mỗi 5s
    return () => clearInterval(interval);
  }, [API_URL, session, isPro]);

  // Reset isPro khi logout
  useEffect(() => {
    if (!session) {
      setIsPro(false);
    }
  }, [session]);

  // Lấy lịch sử Audit để vẽ biểu đồ
  useEffect(() => {
    if (session?.user?.email) {
      const fetchHistory = async () => {
        try {
          const email = session?.user?.email;
          if (!email) return;
          const res = await fetch(`${API_URL}/api/history/${encodeURIComponent(email)}`);
          const data = await res.json();
          setHistory(data);
        } catch (e) { 
          console.error(e); 
        }
      };
      fetchHistory();
    }
  }, [API_URL, session, result]); // Cập nhật khi có kết quả mới

  /* ================= SOUND EFFECTS ================= */

  const playTypingSound = () => {
    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContext) return;

      if (!audioCtxRef.current) {
        audioCtxRef.current = new AudioContext();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') ctx.resume();

      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);

      // Hiệu ứng âm thanh "Blip" điện tử ngẫu nhiên
      oscillator.type = 'sine';
      const freq = 600 + Math.random() * 200; // Tần số ngẫu nhiên 600-800Hz để tạo cảm giác tự nhiên
      oscillator.frequency.setValueAtTime(freq, ctx.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.1);

      gainNode.gain.setValueAtTime(0.03, ctx.currentTime); // Âm lượng nhỏ (3%)
      gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);

      oscillator.start();
      oscillator.stop(ctx.currentTime + 0.1);
    } catch (e) {}
  };

  /* ================= SEO CHECK ================= */

  const handleCheck = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation: Kiểm tra rỗng hoặc không có dấu chấm (không phải domain)
    if (!url.trim() || !url.includes('.')) {
      setShake(true);
      setError('Vui lòng nhập đúng định dạng URL (ví dụ: vnexpress.net)');
      setTimeout(() => setShake(false), 500); // Reset trạng thái sau khi rung xong
      return;
    }

    setLoading(true);
    setResult(null);
    setError('');

    try {
      const response = await fetch(`${API_URL}/api/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url, email: session?.user?.email }),
      });

      const data = await response.json();

      if (data.error) {
        setError(data.msg || 'Có lỗi xảy ra khi phân tích.');
      } else {
        setResult(data);
      }
    } catch {
      setError('Không thể kết nối đến server.');
    } finally {
      setLoading(false);
    }
  };

  /* ================= PAYMENT ================= */

  const handleSePayCheckout = async () => {
    if (!session?.user?.email) {
      signIn('google'); // Yêu cầu đăng nhập nếu chưa
      return;
    }

    // Hiệu ứng pháo giấy chúc mừng
    confetti({
      particleCount: 150,
      spread: 60,
      origin: { y: 0.7 },
      colors: ['#06b6d4', '#3b82f6', '#8b5cf6'] // Cyan, Blue, Purple
    });

    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/create-payment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: 50000,
          orderDescription: `Nâng cấp PRO cho user ${session.user.email}`,
        }),
      });

      const data = await response.json();

      if (data.checkoutUrl && data.checkoutFormfields) {
        setPaymentConfig({
          url: data.checkoutUrl,
          fields: data.checkoutFormfields,
        });
      }
    } catch {
      setError('Lỗi kết nối đến cổng thanh toán.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (paymentConfig && paymentFormRef.current) {
      paymentFormRef.current.submit();
    }
  }, [paymentConfig]);

  useEffect(() => {
    if (searchParams.get('payment') === 'success') {
      setShowSuccessModal(true);
      router.replace('/');
    }
  }, [searchParams, router]);

  // --- FIREWORKS EFFECT ---
  useEffect(() => {
    if (showSuccessModal) {
      const duration = 15 * 1000; // Bắn liên tục trong 15 giây
      const animationEnd = Date.now() + duration;
      const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 100 };

      const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

      const interval = setInterval(() => {
        const timeLeft = animationEnd - Date.now();

        if (timeLeft <= 0) {
          return clearInterval(interval);
        }

        const particleCount = 50 * (timeLeft / duration);
        confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
        confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
      }, 250);

      return () => clearInterval(interval);
    }
  }, [showSuccessModal]);

  /* ================= PDF EXPORT ================= */

  const handleDownloadPDF = () => {
    if (!result) return;

    // Chặn nếu chưa phải PRO
    if (!isPro) {
      if (confirm('Tính năng xuất PDF chỉ dành cho tài khoản PRO. Bạn có muốn nâng cấp ngay (50k) không?')) {
        handleSePayCheckout();
      }
      return;
    }

    const doc = new jsPDF();

    // Helper: Chuyển tiếng Việt có dấu thành không dấu để tránh lỗi font trong PDF
    const toAscii = (str: string) => {
      return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/đ/g, "d").replace(/Đ/g, "D");
    };

    // 1. Header
    doc.setFontSize(22);
    doc.setTextColor(37, 99, 235); // Blue-600
    doc.text('SEO Audit Report', 14, 20);

    // 2. Meta Info
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Generated by SEO Audit Tool`, 14, 26);
    
    doc.setTextColor(0);
    doc.setFontSize(11);
    doc.text(`Website: ${result.url}`, 14, 36);
    doc.text(`Date: ${new Date().toLocaleDateString()}`, 14, 42);
    doc.text(`Score: ${result.score}/100`, 14, 48);

    // 3. Summary
    doc.text(`Passed: ${result.summary.passed}   Warning: ${result.summary.warning}   Critical: ${result.summary.critical}`, 14, 56);

    // 4. Table Data
    const tableData = result.audits.map((a) => [
      toAscii(a.title),
      a.status.toUpperCase(),
      toAscii(a.msg),
      toAscii(a.fix)
    ]);

    // 5. Draw Table
    autoTable(doc, {
      startY: 62,
      head: [['Item', 'Status', 'Issue', 'Fix']],
      body: tableData,
      theme: 'grid',
      headStyles: { fillColor: [37, 99, 235] },
      styles: { fontSize: 9, cellPadding: 3 },
      columnStyles: {
        0: { cellWidth: 35 }, // Item
        1: { cellWidth: 20 }, // Status
      },
    });

    doc.save(`SEO-Report-${Date.now()}.pdf`);
  };

  /* ================= COMPARISON ================= */

  const toggleCompareSelection = (id: string) => {
    setCompareSelection(prev => {
      if (prev.includes(id)) {
        return prev.filter(i => i !== id);
      }
      if (prev.length >= 2) {
        return [prev[1], id]; // Giữ lại cái mới nhất và cái vừa chọn
      }
      return [...prev, id];
    });
  };

  const getComparisonData = () => {
    if (compareSelection.length !== 2) return null;
    const item1 = history.find(h => h.id === compareSelection[0]);
    const item2 = history.find(h => h.id === compareSelection[1]);
    if (!item1 || !item2) return null;
    
    // Sắp xếp theo thời gian để item1 luôn là cũ hơn, item2 là mới hơn
    return new Date(item1.date).getTime() < new Date(item2.date).getTime() ? { old: item1, new: item2 } : { old: item2, new: item1 };
  };

  const handleDownloadComparisonPDF = () => {
    const data = getComparisonData();
    if (!data) return;
    
    // Kiểm tra quyền PRO
    if (!isPro) {
      if (confirm('Tính năng xuất báo cáo so sánh chỉ dành cho tài khoản PRO. Bạn có muốn nâng cấp ngay (50k) không?')) {
        handleSePayCheckout();
      }
      return;
    }

    const { old: oldItem, new: newItem } = data;
    const doc = new jsPDF();

    const toAscii = (str: string) => {
      return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/đ/g, "d").replace(/Đ/g, "D");
    };

    // 1. Header
    doc.setFontSize(22);
    doc.setTextColor(37, 99, 235);
    doc.text('SEO Comparison Report', 14, 20);

    // 2. Meta Info
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Generated by SEO Audit Tool`, 14, 26);
    
    doc.setTextColor(0);
    doc.setFontSize(11);
    doc.text(`Website: ${newItem.url}`, 14, 36);
    doc.text(`Report Date: ${new Date().toLocaleDateString()}`, 14, 42);

    // 3. Overview Table
    doc.setFontSize(14);
    doc.text('Overview', 14, 55);
    
    const scoreDiff = newItem.score - oldItem.score;
    const diffText = scoreDiff > 0 ? `+${scoreDiff}` : `${scoreDiff}`;
    
    const overviewData = [
      ['Date', new Date(oldItem.date).toLocaleDateString(), new Date(newItem.date).toLocaleDateString()],
      ['Score', oldItem.score.toString(), `${newItem.score} (${diffText})`]
    ];

    autoTable(doc, {
      startY: 60,
      head: [['Metric', 'Old Audit', 'New Audit']],
      body: overviewData,
      theme: 'grid',
      headStyles: { fillColor: [50, 50, 50] },
    });

    // 4. Detailed Changes Table
    doc.text('Detailed Changes', 14, (doc as any).lastAutoTable.finalY + 15);

    const tableData = newItem.audits.map((audit: any) => {
      const oldAudit = oldItem.audits.find((a: any) => a.title === audit.title) || {};
      const oldStatus = oldAudit.status ? oldAudit.status.toUpperCase() : 'N/A';
      const newStatus = audit.status.toUpperCase();
      
      let change = '-';
      if (oldAudit.status !== 'passed' && audit.status === 'passed') change = 'IMPROVED';
      else if (oldAudit.status === 'passed' && audit.status !== 'passed') change = 'WORSE';

      return [
        toAscii(audit.title),
        oldStatus,
        newStatus,
        change
      ];
    });

    autoTable(doc, {
      startY: (doc as any).lastAutoTable.finalY + 20,
      head: [['Item', 'Old Status', 'New Status', 'Change']],
      body: tableData,
      theme: 'grid',
      headStyles: { fillColor: [37, 99, 235] },
      styles: { fontSize: 9, cellPadding: 3 },
      columnStyles: { 0: { cellWidth: 60 } },
      didParseCell: function(data) {
        if (data.section === 'body' && data.column.index === 3) {
            if (data.cell.raw === 'IMPROVED') data.cell.styles.textColor = [0, 180, 0];
            else if (data.cell.raw === 'WORSE') data.cell.styles.textColor = [200, 0, 0];
        }
      }
    });

    doc.save(`SEO-Comparison-${Date.now()}.pdf`);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    
    // PERFORMANCE: Nếu đang có frame chờ xử lý thì bỏ qua sự kiện này (Debounce)
    if (target.dataset.ticking) return;
    
    target.dataset.ticking = "true";
    const { clientX, clientY } = e;

    requestAnimationFrame(() => {
      const rect = target.getBoundingClientRect();
      const x = clientX - rect.left;
      const y = clientY - rect.top;
      target.style.setProperty("--mouse-x", `${x}px`);
      target.style.setProperty("--mouse-y", `${y}px`);

      // --- 3D TILT CALCULATION ---
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const rotateX = ((y - centerY) / centerY) * -5; 
      const rotateY = ((x - centerX) / centerX) * 5;
      
      target.style.setProperty("--tilt-x", `${rotateX}deg`);
      target.style.setProperty("--tilt-y", `${rotateY}deg`);
      
      // Đánh dấu đã xử lý xong frame này
      delete target.dataset.ticking;
    });
  };

  const handleMouseLeave = (e: React.MouseEvent<HTMLDivElement>) => {
    e.currentTarget.style.setProperty("--tilt-x", "0deg");
    e.currentTarget.style.setProperty("--tilt-y", "0deg");
  };

  const handleGlobalMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    if (target.dataset.tickingGlobal) return;
    target.dataset.tickingGlobal = "true";

    const { clientX, clientY } = e;

    requestAnimationFrame(() => {
      const x = (clientX / window.innerWidth) - 0.5;
      const y = (clientY / window.innerHeight) - 0.5;
      
      target.style.setProperty("--parallax-x", `${x}`);
      target.style.setProperty("--parallax-y", `${y}`);
      
      delete target.dataset.tickingGlobal;
    });
  };

  /* ================= RENDER ================= */

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'SEO Audit Tool',
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'Web Browser',
    offers: {
      '@type': 'Offer',
      price: '50000',
      priceCurrency: 'VND',
      description: 'Nâng cấp PRO'
    },
    description: 'Phân tích SEO On-page, Technical và Content với công nghệ AI. Tối ưu hóa thứ hạng tìm kiếm chỉ trong vài giây.'
  };

  return (
    <div 
      onMouseMove={handleGlobalMouseMove}
      className="min-h-screen bg-[#050505] text-white font-sans selection:bg-cyan-500/30 flex flex-col relative overflow-hidden"
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {/* Background Glow Effects */}
      <div className="absolute top-0 left-1/2 w-[1000px] h-[500px] bg-blue-600/20 rounded-full blur-[120px] -z-10 mix-blend-screen pointer-events-none transition-transform duration-1000 ease-out" style={{ transform: 'translate(calc(-50% + var(--parallax-x, 0) * 50px), calc(var(--parallax-y, 0) * 50px))' }} />
      <div className="absolute bottom-0 right-0 w-[800px] h-[600px] bg-purple-600/10 rounded-full blur-[100px] -z-10 mix-blend-screen pointer-events-none transition-transform duration-1000 ease-out" style={{ transform: 'translate(calc(var(--parallax-x, 0) * -60px), calc(var(--parallax-y, 0) * -60px))' }} />

      <Header />

      <main className="max-w-4xl mx-auto px-4 py-16 md:py-24 flex-grow w-full relative z-10">
        {/* HERO SECTION */}
        <div className="text-center mb-16 space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-bold uppercase tracking-widest mb-4">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"/>
            Web3 SEO Tool
          </div>
          <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-white leading-tight">
            Audit Website <br/>
            <Typewriter 
              text="Siêu Tốc Độ" 
              className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600" 
            />
          </h1>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto leading-relaxed">
            Phân tích SEO On-page, Technical và Content với công nghệ AI. <br className="hidden md:block"/>
            Tối ưu hóa thứ hạng tìm kiếm chỉ trong vài giây.
          </p>
        </div>

        {/* INPUT FORM */}
        <div className="bg-white/5 backdrop-blur-lg p-2 rounded-2xl border border-white/10 mb-16 max-w-2xl mx-auto shadow-2xl shadow-black/50 ring-1 ring-white/5">
          <form onSubmit={handleCheck} className="flex flex-col md:flex-row gap-2">
            <div className={`flex-1 relative group ${shake ? 'animate-shake' : ''}`}>
              <div className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${shake ? 'text-red-500' : 'text-gray-500 group-focus-within:text-cyan-400'}`}>
                <Globe className="w-5 h-5" />
              </div>
              <input
                className={`w-full h-14 pl-12 pr-4 rounded-xl bg-black/40 border outline-none transition-all text-white placeholder:text-gray-600 font-medium ${shake ? 'border-red-500/50 ring-2 ring-red-500/20' : 'border-transparent focus:border-cyan-500/50 focus:bg-black/60 focus:ring-2 focus:ring-cyan-500/20'}`}
                placeholder="Nhập domain (vd: vnexpress.net)"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                onKeyDown={playTypingSound}
              />
            </div>
            <button 
              disabled={loading}
              className="h-14 px-8 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded-xl font-bold shadow-lg shadow-cyan-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed disabled:grayscale"
            >
              {loading ? <Loader2 className="animate-spin" /> : <Search className="w-5 h-5" />}
              <span className="hidden md:inline">Phân tích ngay</span>
            </button>
          </form>
        </div>

        {error && (
          <div className="bg-red-500/10 text-red-400 p-4 rounded-xl mb-8 text-center border border-red-500/20 font-medium backdrop-blur-sm">
            <AlertTriangle className="w-5 h-5 inline-block mr-2 -mt-1" />
            {error}
          </div>
        )}

        {loading && (
          <div className="space-y-8 animate-pulse">
            {/* SCORE DASHBOARD SKELETON */}
            <div className="grid md:grid-cols-3 gap-6">
              {/* Score Circle Skeleton */}
              <div className="glass-card p-6 rounded-3xl flex flex-col items-center justify-center md:col-span-1 h-64">
                <div className="w-40 h-40 rounded-full bg-white/5 border-8 border-white/5"></div>
                <div className="mt-6 h-4 w-24 bg-white/5 rounded-full"></div>
              </div>

              {/* Stats Grid Skeleton */}
              <div className="md:col-span-2 grid grid-cols-3 gap-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="glass-card rounded-3xl p-5 flex flex-col justify-center items-center h-full">
                    <div className="h-8 w-12 bg-white/5 rounded-lg mb-2"></div>
                    <div className="h-4 w-20 bg-white/5 rounded-lg"></div>
                  </div>
                ))}
              </div>
            </div>

            {/* AUDIT LIST SKELETON */}
            <div className="space-y-4">
              <div className="h-7 w-40 bg-white/5 rounded-lg"></div>
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="glass-card p-5 rounded-2xl">
                  <div className="flex items-start gap-4">
                    <div className="w-6 h-6 rounded-full bg-white/5 shrink-0"></div>
                    <div className="flex-1 space-y-3">
                      <div className="h-5 w-1/3 bg-white/5 rounded-lg"></div>
                      <div className="h-4 w-2/3 bg-white/5 rounded-lg"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* HISTORY CHART (Chỉ hiện khi có dữ liệu lịch sử) */}
        {history.length > 1 && !loading && (
          <div className="mb-16 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-100">
            <div className="glass-card p-6 md:p-8 rounded-3xl shadow-2xl relative overflow-hidden">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-2xl font-bold text-white">Xu hướng điểm số</h3>
                  <p className="text-sm text-gray-400">Lịch sử kiểm tra gần đây của bạn</p>
                </div>
                <div className="px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-bold">
                  LIVE DATA
                </div>
              </div>
              
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={history}>
                    <defs>
                      <linearGradient id="colorScore" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor="#06b6d4" />
                        <stop offset="100%" stopColor="#3b82f6" />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                    <XAxis dataKey="date" tickFormatter={(d) => new Date(d).toLocaleDateString('vi-VN', {day: '2-digit', month: '2-digit'})} stroke="#6b7280" tick={{fontSize: 12}} tickLine={false} axisLine={false} />
                    <YAxis domain={[0, 100]} stroke="#6b7280" tick={{fontSize: 12}} tickLine={false} axisLine={false} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#13131A', borderColor: '#ffffff20', borderRadius: '12px', color: '#fff' }}
                      itemStyle={{ color: '#22d3ee' }}
                    />
                    <Line type="monotone" dataKey="score" stroke="url(#colorScore)" strokeWidth={4} dot={{r: 4, fill: '#06b6d4', strokeWidth: 2, stroke: '#fff'}} activeDot={{r: 8, fill: '#fff'}} animationDuration={1500} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {/* HISTORY LIST & COMPARE SELECTION */}
        {history.length > 0 && !loading && (
          <div className="mb-16 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-white">Lịch sử kiểm tra</h3>
              {compareSelection.length === 2 && (
                <button 
                  onClick={() => setShowCompareModal(true)}
                  className="bg-cyan-600 hover:bg-cyan-500 text-white px-4 py-2 rounded-xl font-bold transition-colors shadow-lg shadow-cyan-500/20 animate-pulse"
                >
                  So sánh ngay ({compareSelection.length}/2)
                </button>
              )}
            </div>

            <div className="grid gap-4">
              {history.map((item: any) => (
                <div 
                  key={item.id || item.date} 
                  onClick={() => item.id && toggleCompareSelection(item.id)}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-center justify-between ${
                    compareSelection.includes(item.id) 
                      ? 'bg-cyan-900/20 border-cyan-500/50 shadow-[0_0_15px_rgba(6,182,212,0.1)]' 
                      : 'glass-card hover:border-white/20'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-5 h-5 rounded-md border flex items-center justify-center ${
                      compareSelection.includes(item.id) ? 'bg-cyan-500 border-cyan-500' : 'border-gray-600'
                    }`}>
                      {compareSelection.includes(item.id) && <CheckCircle className="w-3.5 h-3.5 text-white" />}
                    </div>
                    <div>
                      <p className="font-bold text-white">{item.url}</p>
                      <p className="text-xs text-gray-400">{new Date(item.date).toLocaleString('vi-VN')}</p>
                    </div>
                  </div>
                  <div className={`text-xl font-black ${item.score >= 80 ? 'text-green-500' : item.score >= 50 ? 'text-yellow-500' : 'text-red-500'}`}>
                    {item.score}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {result && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
            
            {/* SCORE DASHBOARD */}
            <div className="grid md:grid-cols-3 gap-6">
              {/* Score Circle */}
              <div className="glass-card p-8 rounded-3xl flex flex-col items-center justify-center md:col-span-1 relative overflow-hidden shadow-2xl">
                <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent pointer-events-none" />
                <div className="relative w-48 h-48 flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-90 drop-shadow-[0_0_15px_rgba(0,0,0,0.5)]">
                    <circle cx="96" cy="96" r="80" stroke="#2A2A35" strokeWidth="12" fill="transparent" />
                    <circle cx="96" cy="96" r="80" stroke="currentColor" strokeWidth="12" fill="transparent" 
                      strokeDasharray={502} 
                      strokeDashoffset={502 - (502 * result.score) / 100} 
                      className={`${result.score >= 80 ? 'text-green-500 drop-shadow-[0_0_10px_rgba(34,197,94,0.5)]' : result.score >= 50 ? 'text-yellow-500 drop-shadow-[0_0_10px_rgba(234,179,8,0.5)]' : 'text-red-500 drop-shadow-[0_0_10px_rgba(239,68,68,0.5)]'} transition-all duration-1000 ease-out`} 
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute flex flex-col items-center">
                    <span className="text-6xl font-black text-white tracking-tighter">{result.score}</span>
                    <span className="text-xs font-bold text-gray-500 uppercase tracking-widest mt-2">Điểm SEO</span>
                  </div>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="md:col-span-2 grid grid-cols-3 gap-4">
                <div onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave} className="relative glass-card rounded-3xl p-6 flex flex-col justify-center items-center text-center hover:border-green-500/30 transition-colors group overflow-hidden">
                  <div className="pointer-events-none absolute -inset-px opacity-0 transition duration-300 group-hover:opacity-100" style={{ background: `radial-gradient(600px circle at var(--mouse-x) var(--mouse-y), rgba(34, 197, 94, 0.15), transparent 40%)` }} />
                  <span className="relative z-10 text-4xl font-bold text-green-500 mb-2 group-hover:scale-110 transition-transform">{result.summary.passed}</span>
                  <span className="relative z-10 text-sm font-medium text-gray-400 uppercase tracking-wider">Đạt chuẩn</span>
                </div>
                <div onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave} className="relative glass-card rounded-3xl p-6 flex flex-col justify-center items-center text-center hover:border-yellow-500/30 transition-colors group overflow-hidden">
                  <div className="pointer-events-none absolute -inset-px opacity-0 transition duration-300 group-hover:opacity-100" style={{ background: `radial-gradient(600px circle at var(--mouse-x) var(--mouse-y), rgba(234, 179, 8, 0.15), transparent 40%)` }} />
                  <span className="relative z-10 text-4xl font-bold text-yellow-500 mb-2 group-hover:scale-110 transition-transform">{result.summary.warning}</span>
                  <span className="relative z-10 text-sm font-medium text-gray-400 uppercase tracking-wider">Cảnh báo</span>
                </div>
                <div onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave} className="relative glass-card rounded-3xl p-6 flex flex-col justify-center items-center text-center hover:border-red-500/30 transition-colors group overflow-hidden">
                  <div className="pointer-events-none absolute -inset-px opacity-0 transition duration-300 group-hover:opacity-100" style={{ background: `radial-gradient(600px circle at var(--mouse-x) var(--mouse-y), rgba(239, 68, 68, 0.15), transparent 40%)` }} />
                  <span className="relative z-10 text-4xl font-bold text-red-500 mb-2 group-hover:scale-110 transition-transform">{result.summary.critical}</span>
                  <span className="relative z-10 text-sm font-medium text-gray-400 uppercase tracking-wider">Nghiêm trọng</span>
                </div>
              </div>
            </div>

            {/* AUDIT LIST */}
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-2xl font-bold text-white px-1">Chi tiết kiểm tra</h3>
                <button 
                  onClick={handleDownloadPDF}
                  className={`flex items-center gap-2 text-sm font-bold px-5 py-2.5 rounded-xl transition-all border ${
                    isPro 
                      ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30 hover:bg-cyan-500/20 hover:shadow-[0_0_20px_rgba(34,211,238,0.2)]' 
                      : 'bg-white/5 text-gray-400 border-white/10 hover:bg-white/10'
                  }`}
                >
                  {isPro ? <Download className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                  {isPro ? 'Tải báo cáo PDF' : 'Mở khóa PDF'}
                </button>
              </div>
              {result.audits.map((a, i) => (
                <div key={i} onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave} className={`relative group glass-card p-6 rounded-2xl transition-all duration-300 hover:bg-white/10 overflow-hidden ${
                  a.status === 'critical' ? 'border-l-4 border-l-red-500 hover:border-red-500/50 hover:shadow-[0_0_25px_rgba(239,68,68,0.2)]' : 
                  a.status === 'warning' ? 'border-l-4 border-l-yellow-500 hover:border-yellow-500/50 hover:shadow-[0_0_25px_rgba(234,179,8,0.2)]' : 
                  'border-l-4 border-l-green-500 hover:border-green-500/50 hover:shadow-[0_0_25px_rgba(34,197,94,0.2)]'
                }`}>
                  <div className="pointer-events-none absolute -inset-px opacity-0 transition duration-300 group-hover:opacity-100" style={{ background: `radial-gradient(600px circle at var(--mouse-x) var(--mouse-y), rgba(255, 255, 255, 0.06), transparent 40%)` }} />
                  <div className="relative z-10 flex items-start gap-5">
                    <div className="mt-1 shrink-0 p-2 rounded-lg bg-black/30">
                      {a.status === 'passed' && <CheckCircle className="w-6 h-6 text-green-500" />}
                      {a.status === 'warning' && <AlertTriangle className="w-6 h-6 text-yellow-500" />}
                      {a.status === 'critical' && <XCircle className="w-6 h-6 text-red-500" />}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-bold text-gray-100 text-lg">{a.title}</h4>
                        <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider ${
                          a.status === 'critical' ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 
                          a.status === 'warning' ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20' : 'bg-green-500/10 text-green-400 border border-green-500/20'
                        }`}>{a.status}</span>
                      </div>
                      <p className="text-gray-400 leading-relaxed text-sm">{a.msg}</p>
                      
                      {a.status !== 'passed' && (
                        <div className="mt-4 pt-4 border-t border-white/5">
                          <div className="flex items-start gap-3 text-sm text-gray-300 bg-white/5 p-4 rounded-xl border border-white/5">
                            <ArrowRight className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" />
                            <div>
                              <span className="font-bold text-cyan-400 block mb-1">Giải pháp: </span>
                              {a.fix}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* PRO CTA */}
            <div className="relative overflow-hidden rounded-3xl p-10 text-center border border-white/10 group">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-900/40 to-purple-900/40 -z-10" />
              <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 -z-10" />
              
              <h3 className="text-3xl font-black text-white mb-3 tracking-tight">Mở khóa sức mạnh <span className="text-cyan-400">PRO</span></h3>
              <p className="text-blue-200 mb-8 max-w-lg mx-auto leading-relaxed">
                Nâng cấp tài khoản PRO để tải báo cáo PDF, lưu lịch sử kiểm tra và nhận tư vấn từ chuyên gia.
              </p>
              <button
                onClick={handleSePayCheckout}
                className="relative inline-flex items-center justify-center px-8 py-4 text-base font-bold text-white transition-all duration-200 bg-gradient-to-r from-cyan-600 to-blue-600 rounded-xl hover:from-cyan-500 hover:to-blue-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 focus:ring-offset-gray-900 shadow-[0_0_30px_rgba(6,182,212,0.3)] hover:shadow-[0_0_50px_rgba(6,182,212,0.5)]"
              >
                Nâng cấp ngay - 50k/tháng
              </button>
            </div>
          </div>
        )}
      </main>

      <Footer />

      {paymentConfig && (
        <form ref={paymentFormRef} action={paymentConfig.url} method="POST" className="hidden">
          {Object.keys(paymentConfig.fields).map((key) => (
            <input key={key} type="hidden" name={key} value={paymentConfig.fields[key]} />
          ))}
        </form>
      )}

      {showSuccessModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="glass-card p-8 rounded-3xl text-center shadow-2xl max-w-sm w-full">
            <CheckCircle className="mx-auto text-green-500 w-12 h-12" />
            <h3 className="text-xl font-bold mt-4 text-white">Thanh toán thành công</h3>
            <button
              onClick={() => setShowSuccessModal(false)}
              className="mt-6 bg-cyan-600 hover:bg-cyan-500 text-white px-6 py-2 rounded-xl font-bold transition-colors"
            >
              OK
            </button>
          </div>
        </div>
      )}

      {/* COMPARISON MODAL */}
      {showCompareModal && getComparisonData() && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="glass-card w-full max-w-5xl h-[90vh] rounded-3xl shadow-2xl flex flex-col overflow-hidden">
            {/* Header */}
            <div className="p-6 border-b border-white/10 flex justify-between items-center bg-[#0A0A0F]">
              <h3 className="text-2xl font-bold text-white">So sánh kết quả</h3>
              <div className="flex items-center gap-3">
                <button 
                  onClick={handleDownloadComparisonPDF}
                  className={`flex items-center gap-2 text-sm font-bold px-4 py-2 rounded-lg transition-colors border ${
                    isPro ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30 hover:bg-cyan-500/20' : 'bg-white/5 text-gray-400 border-white/10 hover:bg-white/10'
                  }`}
                >
                  {isPro ? <Download className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                  {isPro ? 'Xuất PDF' : 'Xuất PDF (PRO)'}
                </button>
                <button onClick={() => setShowCompareModal(false)} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                  <X className="w-6 h-6 text-gray-400" />
                </button>
              </div>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto p-6">
              {(() => {
                const { old: oldItem, new: newItem } = getComparisonData()!;
                const scoreDiff = newItem.score - oldItem.score;
                
                return (
                  <div className="space-y-8">
                    {/* Overview */}
                    <div className="grid grid-cols-2 gap-8">
                      <div className="text-center p-4 rounded-2xl bg-white/5 border border-white/5">
                        <p className="text-gray-400 text-sm mb-2">{new Date(oldItem.date).toLocaleString('vi-VN')}</p>
                        <div className="text-4xl font-black text-gray-500">{oldItem.score}</div>
                      </div>
                      <div className="text-center p-4 rounded-2xl bg-white/5 border border-cyan-500/30 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-2">
                          <span className={`text-xs font-bold px-2 py-1 rounded-full ${scoreDiff >= 0 ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                            {scoreDiff > 0 ? '+' : ''}{scoreDiff}
                          </span>
                        </div>
                        <p className="text-cyan-400 text-sm mb-2">{new Date(newItem.date).toLocaleString('vi-VN')}</p>
                        <div className={`text-4xl font-black ${newItem.score >= oldItem.score ? 'text-green-500' : 'text-red-500'}`}>{newItem.score}</div>
                      </div>
                    </div>

                    {/* Detailed Comparison Table */}
                    <div className="border border-white/10 rounded-2xl overflow-hidden">
                      <table className="w-full text-left text-sm">
                        <thead className="bg-white/5 text-gray-400 uppercase font-bold">
                          <tr>
                            <th className="p-4 w-1/3">Tiêu chí</th>
                            <th className="p-4 w-1/3 border-l border-white/10">Cũ ({new Date(oldItem.date).toLocaleDateString('vi-VN')})</th>
                            <th className="p-4 w-1/3 border-l border-white/10 text-cyan-400">Mới ({new Date(newItem.date).toLocaleDateString('vi-VN')})</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                          {newItem.audits.map((audit: any, index: number) => {
                            const oldAudit = oldItem.audits.find((a: any) => a.title === audit.title) || {};
                            const isImproved = oldAudit.status !== 'passed' && audit.status === 'passed';
                            const isWorse = oldAudit.status === 'passed' && audit.status !== 'passed';

                            return (
                              <tr key={index} className="hover:bg-white/5 transition-colors">
                                <td className="p-4 font-medium text-gray-200">{audit.title}</td>
                                <td className={`p-4 border-l border-white/10 ${oldAudit.status === 'passed' ? 'text-green-500' : oldAudit.status === 'warning' ? 'text-yellow-500' : 'text-red-500'}`}>{oldAudit.status?.toUpperCase()}</td>
                                <td className={`p-4 border-l border-white/10 font-bold ${audit.status === 'passed' ? 'text-green-500' : audit.status === 'warning' ? 'text-yellow-500' : 'text-red-500'} ${isImproved ? 'bg-green-500/10' : isWorse ? 'bg-red-500/10' : ''}`}>
                                  {audit.status?.toUpperCase()}
                                  {isImproved && <span className="ml-2 text-xs bg-green-500 text-white px-1.5 py-0.5 rounded">TỐT LÊN</span>}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ================= EXPORT ================= */

export default function Home() {
  return (
    <Suspense fallback={<div className="p-10 text-center">Loading...</div>}>
      <HomeContent />
    </Suspense>
  );
}
