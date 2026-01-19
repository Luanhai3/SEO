'use client';

import { useState, useRef, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  Search,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Loader2,
  ArrowRight,
  Activity,
  Globe,
} from 'lucide-react';

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
  const [userId] = useState(101);
  const [paymentConfig, setPaymentConfig] = useState<{ url: string; fields: any } | null>(null);
  const paymentFormRef = useRef<HTMLFormElement>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const searchParams = useSearchParams();
  const router = useRouter();

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

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
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/create-payment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: 50000,
          orderDescription: `Nâng cấp PRO cho user ${userId}`,
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

  /* ================= RENDER ================= */

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center gap-2 text-blue-600 font-bold">
          <Activity className="w-6 h-6" />
          SEO Audit Tool
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-16">
        <form onSubmit={handleCheck} className="flex gap-2 mb-8">
          <div className="flex-1 relative">
            <Globe className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              className="w-full h-14 pl-12 pr-4 rounded-xl border"
              placeholder="vd: example.com"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              required
            />
          </div>
          <button className="h-14 px-6 bg-blue-600 text-white rounded-xl font-bold">
            {loading ? <Loader2 className="animate-spin" /> : <Search />}
          </button>
        </form>

        {error && <p className="text-red-600 mb-4">{error}</p>}

        {result && (
          <div className="space-y-6">
            <h2 className="text-3xl font-black">Điểm SEO: {result.score}</h2>

            {result.audits.map((a, i) => (
              <div key={i} className="bg-white p-4 rounded-xl border">
                <div className="flex items-center gap-2 font-bold">
                  {a.status === 'passed' && <CheckCircle className="text-green-500" />}
                  {a.status === 'warning' && <AlertTriangle className="text-yellow-500" />}
                  {a.status === 'critical' && <XCircle className="text-red-500" />}
                  {a.title}
                </div>
                <p className="text-slate-600">{a.msg}</p>
                {a.status !== 'passed' && (
                  <p className="mt-2 text-sm text-blue-600 flex gap-1">
                    <ArrowRight /> {a.fix}
                  </p>
                )}
              </div>
            ))}

            <button
              onClick={handleSePayCheckout}
              className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold"
            >
              Nâng cấp PRO – 50k/tháng
            </button>
          </div>
        )}
      </main>

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
