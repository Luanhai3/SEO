'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useSession, signIn, signOut } from "next-auth/react";
import { Activity, Menu, X, AlertTriangle } from 'lucide-react';

export default function Header() {
  const { data: session, status } = useSession();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  // Prevent scrolling when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileMenuOpen]);

  const handleLogout = () => {
    setShowLogoutConfirm(true);
  };

  const performLogout = () => {
    if (session?.user?.email) localStorage.removeItem(`isPro_${session.user.email}`);
    signOut();
    setShowLogoutConfirm(false);
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      <header className="bg-[#050505]/80 backdrop-blur-xl border-b border-white/10 sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-white font-bold text-xl tracking-tight">
            <div className="p-1.5 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg shadow-[0_0_15px_rgba(6,182,212,0.5)]">
              <Activity className="w-5 h-5 text-white" />
            </div>
            <span>SEO<span className="text-cyan-400">Audit</span></span>
          </Link>
          
          <nav className="flex gap-4 md:gap-8 text-sm font-medium text-gray-400 items-center">
            <Link href="/features" className="hidden md:block hover:text-cyan-400 transition-colors">Tính năng</Link>
            <Link href="/pricing" className="hidden md:block hover:text-cyan-400 transition-colors">Bảng giá</Link>
            
            {status === 'loading' ? (
              <span className="text-gray-600 hidden md:inline">...</span>
            ) : session ? (
              <div className="hidden md:flex items-center gap-2 md:gap-3 pl-0 md:pl-4 md:border-l border-white/10">
                {session.user?.image && (
                  <Image 
                    src={session.user.image} 
                    alt={session.user.name || 'Avatar'} 
                    width={32}
                    height={32}
                    className="rounded-full border border-white/10 ring-2 ring-black"
                    priority
                  />
                )}
                <span className="hidden md:inline text-gray-200 font-semibold">{session.user?.name}</span>
                <button onClick={handleLogout} className="text-red-400 hover:text-red-300 transition-colors ml-1 md:ml-2 text-xs uppercase tracking-wider font-bold">
                  Thoát
                </button>
              </div>
            ) : (
              <button onClick={() => signIn('google')} className="hidden md:block px-4 py-2 md:px-5 md:py-2 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-white transition-all hover:border-cyan-500/50 hover:shadow-[0_0_15px_rgba(6,182,212,0.2)] text-xs md:text-sm">
                Đăng nhập
              </button>
            )}

            <button 
              className="md:hidden p-2 -mr-2 text-gray-400 hover:text-white transition-colors relative z-[101]"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              <div className="relative w-6 h-6">
                <Menu 
                  className={`w-6 h-6 absolute top-0 left-0 transition-all duration-300 transform ${
                    isMobileMenuOpen ? 'opacity-0 rotate-90 scale-50' : 'opacity-100 rotate-0 scale-100'
                  }`} 
                />
                <X 
                  className={`w-6 h-6 absolute top-0 left-0 transition-all duration-300 transform ${
                    isMobileMenuOpen ? 'opacity-100 rotate-0 scale-100' : 'opacity-0 -rotate-90 scale-50'
                  }`} 
                />
              </div>
            </button>
          </nav>
        </div>

        {/* Mobile Menu Overlay */}
        {/* Backdrop */}
        <div 
          className={`fixed inset-0 z-[90] bg-black/60 backdrop-blur-sm md:hidden transition-opacity duration-300 ${isMobileMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
          onClick={() => setIsMobileMenuOpen(false)}
        />

        <div className={`fixed inset-y-0 right-0 z-[100] w-[80%] max-w-sm bg-[#050505] border-l border-white/10 md:hidden transition-transform duration-300 ease-in-out ${isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}>
            <div className="px-4 h-16 flex items-center justify-between border-b border-white/10">
              <div className="flex items-center gap-2 text-white font-bold text-xl tracking-tight">
                <div className="p-1.5 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg shadow-[0_0_15px_rgba(6,182,212,0.5)]">
                  <Activity className="w-5 h-5 text-white" />
                </div>
                <span>SEO<span className="text-cyan-400">Audit</span></span>
              </div>
            </div>
            <div className="p-6 flex flex-col gap-6 text-lg font-medium text-gray-300">
              <Link 
                href="/" 
                onClick={() => setIsMobileMenuOpen(false)} 
                className={`hover:text-cyan-400 transition-all duration-500 ease-out transform ${isMobileMenuOpen ? 'translate-x-0 opacity-100' : 'translate-x-8 opacity-0'}`}
                style={{ transitionDelay: isMobileMenuOpen ? '50ms' : '0ms' }}
              >
                Trang chủ
              </Link>
              <Link 
                href="/features" 
                onClick={() => setIsMobileMenuOpen(false)} 
                className={`hover:text-cyan-400 transition-all duration-500 ease-out transform ${isMobileMenuOpen ? 'translate-x-0 opacity-100' : 'translate-x-8 opacity-0'}`}
                style={{ transitionDelay: isMobileMenuOpen ? '100ms' : '0ms' }}
              >
                Tính năng
              </Link>
              <Link 
                href="/pricing" 
                onClick={() => setIsMobileMenuOpen(false)} 
                className={`hover:text-cyan-400 transition-all duration-500 ease-out transform ${isMobileMenuOpen ? 'translate-x-0 opacity-100' : 'translate-x-8 opacity-0'}`}
                style={{ transitionDelay: isMobileMenuOpen ? '200ms' : '0ms' }}
              >
                Bảng giá
              </Link>

              {/* User Profile & Logout Section */}
              <div 
                className={`pt-6 border-t border-white/10 flex flex-col gap-4 transition-all duration-500 ease-out transform ${isMobileMenuOpen ? 'translate-x-0 opacity-100' : 'translate-x-8 opacity-0'}`}
                style={{ transitionDelay: isMobileMenuOpen ? '300ms' : '0ms' }}
              >
                {session ? (
                  <>
                    <div className="flex items-center gap-3">
                      {session.user?.image && (
                        <Image 
                          src={session.user.image} 
                          alt={session.user.name || 'Avatar'} 
                          width={40}
                          height={40}
                          className="rounded-full border border-white/10 ring-2 ring-black"
                        />
                      )}
                      <div className="flex flex-col">
                        <span className="text-white font-bold text-base">{session.user?.name}</span>
                        <span className="text-xs text-gray-500">{session.user?.email}</span>
                      </div>
                    </div>
                    <button 
                      onClick={performLogout}
                      className="w-full py-3 rounded-xl bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 transition-all font-bold flex items-center justify-center gap-2"
                    >
                      Đăng xuất
                    </button>
                  </>
                ) : (
                  <button 
                    onClick={() => { signIn('google'); setIsMobileMenuOpen(false); }}
                    className="w-full py-3 rounded-xl bg-white/5 text-white border border-white/10 hover:bg-white/10 hover:border-cyan-500/50 transition-all font-bold"
                  >
                    Đăng nhập
                  </button>
                )}
              </div>
            </div>
        </div>
      </header>

      {/* LOGOUT CONFIRMATION MODAL */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[110]">
          <div className="glass-card p-6 rounded-3xl text-center shadow-2xl max-w-sm w-full border border-white/10 animate-in fade-in zoom-in duration-200">
            <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-6 h-6 text-red-500" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Xác nhận đăng xuất</h3>
            <p className="text-gray-400 mb-6">Bạn có chắc chắn muốn đăng xuất khỏi hệ thống không?</p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="flex-1 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white font-medium transition-colors border border-white/10"
              >
                Hủy
              </button>
              <button
                onClick={performLogout}
                className="flex-1 px-4 py-2 rounded-xl bg-red-500 hover:bg-red-600 text-white font-bold transition-colors shadow-lg shadow-red-500/20"
              >
                Đăng xuất
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}