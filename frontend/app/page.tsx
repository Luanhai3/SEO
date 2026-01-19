'use client';

import { useState, useRef, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
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
} from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

/* ================= TYPES ================= */

interface AuditResult {
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

  /* ================= SEO CHECK ================= */

  const handleCheck = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) return;

    setLoading(true);
    setResult(null);
    setError('');

    try {
      const response = await fetch(`${API_URL}/api/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
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

  /* ================= LOGOUT ================= */

  const handleLogout = () => {
    if (session?.user?.email) localStorage.removeItem(`isPro_${session.user.email}`);
    setIsPro(false);
    signOut();
  };

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

  /* ================= RENDER ================= */

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-blue-100 flex flex-col">
      <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-20">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 text-blue-600 font-bold text-xl">
          <Activity className="w-6 h-6" />
            <span>SEO Audit Tool</span>
          </div>
          <nav className="hidden md:flex gap-6 text-sm font-medium text-slate-600 items-center">
            <a href="#" className="hover:text-blue-600 transition-colors">Tính năng</a>
            <a href="#" className="hover:text-blue-600 transition-colors">Bảng giá</a>
            {status === 'loading' ? (
              <span className="text-slate-400">...</span>
            ) : session ? (
              <div className="flex items-center gap-3">
                {session.user?.image && (
                  <img 
                    src={session.user.image} 
                    alt={session.user.name || 'Avatar'} 
                    className="w-8 h-8 rounded-full border border-slate-200"
                  />
                )}
                <span className="text-slate-900 font-semibold">{session.user?.name}</span>
                <button onClick={handleLogout} className="text-red-500 hover:text-red-600 transition-colors ml-2">
                  Đăng xuất
                </button>
              </div>
            ) : (
              <button onClick={() => signIn('google')} className="hover:text-blue-600 transition-colors">Đăng nhập</button>
            )}
          </nav>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-12 md:py-20 flex-grow w-full">
        {/* HERO SECTION */}
        <div className="text-center mb-10 space-y-4">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900">
            Kiểm tra SEO Website <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Miễn Phí</span>
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Phân tích toàn diện các yếu tố On-page, Technical và Content chỉ trong 5 giây.
          </p>
        </div>

        {/* INPUT FORM */}
        <div className="bg-white p-2 rounded-2xl shadow-xl shadow-blue-900/5 border border-slate-100 mb-12 max-w-2xl mx-auto">
          <form onSubmit={handleCheck} className="flex flex-col md:flex-row gap-2">
            <div className="flex-1 relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                <Globe className="w-5 h-5" />
              </div>
              <input
                className="w-full h-14 pl-12 pr-4 rounded-xl bg-slate-50 border-transparent focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all text-slate-800 placeholder:text-slate-400 font-medium"
                placeholder="Nhập địa chỉ website (vd: vnexpress.net)"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                required
              />
            </div>
            <button 
              disabled={loading}
              className="h-14 px-8 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-lg shadow-blue-600/20 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? <Loader2 className="animate-spin" /> : <Search className="w-5 h-5" />}
              <span className="hidden md:inline">Phân tích</span>
            </button>
          </form>
        </div>

        {error && <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-8 text-center border border-red-100 font-medium">{error}</div>}

        {loading && (
          <div className="space-y-8 animate-pulse">
            {/* SCORE DASHBOARD SKELETON */}
            <div className="grid md:grid-cols-3 gap-6">
              {/* Score Circle Skeleton */}
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center justify-center md:col-span-1 h-64">
                <div className="w-40 h-40 rounded-full bg-slate-200 border-8 border-slate-100"></div>
                <div className="mt-6 h-4 w-24 bg-slate-200 rounded-full"></div>
              </div>

              {/* Stats Grid Skeleton */}
              <div className="md:col-span-2 grid grid-cols-3 gap-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="bg-slate-50 rounded-2xl p-5 border border-slate-100 flex flex-col justify-center items-center h-full">
                    <div className="h-8 w-12 bg-slate-200 rounded-lg mb-2"></div>
                    <div className="h-4 w-20 bg-slate-200 rounded-lg"></div>
                  </div>
                ))}
              </div>
            </div>

            {/* AUDIT LIST SKELETON */}
            <div className="space-y-4">
              <div className="h-7 w-40 bg-slate-200 rounded-lg"></div>
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="bg-white p-5 rounded-xl shadow-sm border border-slate-100">
                  <div className="flex items-start gap-4">
                    <div className="w-6 h-6 rounded-full bg-slate-200 shrink-0"></div>
                    <div className="flex-1 space-y-3">
                      <div className="h-5 w-1/3 bg-slate-200 rounded-lg"></div>
                      <div className="h-4 w-2/3 bg-slate-200 rounded-lg"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {result && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            
            {/* SCORE DASHBOARD */}
            <div className="grid md:grid-cols-3 gap-6">
              {/* Score Circle */}
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center justify-center md:col-span-1 relative overflow-hidden">
                <div className="relative w-40 h-40 flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle cx="80" cy="80" r="70" stroke="currentColor" strokeWidth="10" fill="transparent" className="text-slate-100" />
                    <circle cx="80" cy="80" r="70" stroke="currentColor" strokeWidth="10" fill="transparent" 
                      strokeDasharray={440} 
                      strokeDashoffset={440 - (440 * result.score) / 100} 
                      className={`${result.score >= 80 ? 'text-green-500' : result.score >= 50 ? 'text-yellow-500' : 'text-red-500'} transition-all duration-1000 ease-out`} 
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute flex flex-col items-center">
                    <span className="text-5xl font-black text-slate-800">{result.score}</span>
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mt-1">Điểm SEO</span>
                  </div>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="md:col-span-2 grid grid-cols-3 gap-4">
                <div className="bg-green-50 rounded-2xl p-5 border border-green-100 flex flex-col justify-center items-center text-center">
                  <span className="text-3xl font-bold text-green-600 mb-1">{result.summary.passed}</span>
                  <span className="text-sm font-medium text-green-800">Đạt chuẩn</span>
                </div>
                <div className="bg-yellow-50 rounded-2xl p-5 border border-yellow-100 flex flex-col justify-center items-center text-center">
                  <span className="text-3xl font-bold text-yellow-600 mb-1">{result.summary.warning}</span>
                  <span className="text-sm font-medium text-yellow-800">Cảnh báo</span>
                </div>
                <div className="bg-red-50 rounded-2xl p-5 border border-red-100 flex flex-col justify-center items-center text-center">
                  <span className="text-3xl font-bold text-red-600 mb-1">{result.summary.critical}</span>
                  <span className="text-sm font-medium text-red-800">Nghiêm trọng</span>
                </div>
              </div>
            </div>

            {/* AUDIT LIST */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-slate-800 px-1">Chi tiết kiểm tra</h3>
                <button 
                  onClick={handleDownloadPDF}
                  className={`flex items-center gap-2 text-sm font-bold px-4 py-2 rounded-lg transition-colors border ${
                    isPro 
                      ? 'text-blue-600 hover:bg-blue-50 border-blue-100' 
                      : 'text-slate-500 hover:bg-slate-50 border-slate-200'
                  }`}
                >
                  {isPro ? <Download className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                  {isPro ? 'Tải báo cáo PDF' : 'Tải PDF (PRO)'}
                </button>
              </div>
              {result.audits.map((a, i) => (
                <div key={i} className={`group bg-white p-5 rounded-xl shadow-sm border hover:shadow-md transition-all ${
                  a.status === 'critical' ? 'border-l-4 border-l-red-500 border-slate-100' : 
                  a.status === 'warning' ? 'border-l-4 border-l-yellow-500 border-slate-100' : 
                  'border-l-4 border-l-green-500 border-slate-100'
                }`}>
                  <div className="flex items-start gap-4">
                    <div className="mt-1 shrink-0">
                      {a.status === 'passed' && <CheckCircle className="w-6 h-6 text-green-500" />}
                      {a.status === 'warning' && <AlertTriangle className="w-6 h-6 text-yellow-500" />}
                      {a.status === 'critical' && <XCircle className="w-6 h-6 text-red-500" />}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="font-bold text-slate-800 text-lg">{a.title}</h4>
                        <span className={`text-xs font-bold px-2 py-1 rounded-full uppercase ${
                          a.status === 'critical' ? 'bg-red-100 text-red-700' : 
                          a.status === 'warning' ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'
                        }`}>{a.status}</span>
                      </div>
                      <p className="text-slate-600 leading-relaxed">{a.msg}</p>
                      
                      {a.status !== 'passed' && (
                        <div className="mt-4 pt-4 border-t border-slate-50">
                          <div className="flex items-start gap-2 text-sm text-slate-700 bg-slate-50 p-3 rounded-lg">
                            <ArrowRight className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" />
                            <div>
                              <span className="font-bold text-slate-900">Cách sửa: </span>
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
            <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-8 text-white text-center shadow-xl shadow-blue-900/20">
              <h3 className="text-2xl font-bold mb-2">Cần báo cáo chi tiết hơn?</h3>
              <p className="text-blue-100 mb-6 max-w-lg mx-auto">
                Nâng cấp tài khoản PRO để tải báo cáo PDF, lưu lịch sử kiểm tra và nhận tư vấn từ chuyên gia.
              </p>
              <button
                onClick={handleSePayCheckout}
                className="bg-white text-blue-700 px-8 py-3 rounded-full font-bold hover:bg-blue-50 transition-colors shadow-md"
              >
                Nâng cấp ngay - 50k/tháng
              </button>
            </div>
          </div>
        )}
      </main>

      <footer className="bg-white border-t border-slate-200 py-8 mt-auto">
        <div className="max-w-5xl mx-auto px-4 text-center text-slate-500 text-sm">
          <p>© {new Date().getFullYear()} SEO Audit Tool. All rights reserved.</p>
          <div className="flex justify-center gap-6 mt-4">
            <a href="#" className="hover:text-blue-600 transition-colors">Điều khoản</a>
            <a href="#" className="hover:text-blue-600 transition-colors">Bảo mật</a>
            <a href="#" className="hover:text-blue-600 transition-colors">Liên hệ</a>
          </div>
        </div>
      </footer>

      {paymentConfig && (
        <form ref={paymentFormRef} action={paymentConfig.url} method="POST" className="hidden">
          {Object.keys(paymentConfig.fields).map((key) => (
            <input key={key} type="hidden" name={key} value={paymentConfig.fields[key]} />
          ))}
        </form>
      )}

      {showSuccessModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center">
          <div className="bg-white p-8 rounded-xl text-center">
            <CheckCircle className="mx-auto text-green-500 w-12 h-12" />
            <h3 className="text-xl font-bold mt-4">Thanh toán thành công</h3>
            <button
              onClick={() => setShowSuccessModal(false)}
              className="mt-6 bg-blue-600 text-white px-6 py-2 rounded-lg"
            >
              OK
            </button>
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
