'use client';

import Link from 'next/link';
import { Activity } from 'lucide-react';

const FacebookIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" /></svg>
);
const TwitterIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-12.7 12.5 4 1.2 8.1-.3 9.1-1.4-.6.1-1.1-.7-1.2-1.8.3.3.6.3.9.1-1.3-.5-2-3-2-3 .2.1.4.1.4.1-.8-.2-1.3-1.8-1.1-2.2.6 1 2.3 1.6 4.1 1.7-.4-1.8 2-3.2 3.5-1.8.6-.2 1.2-.6 1.7-.9-.2.6-.6 1.1-1.1 1.4.6-.1 1.1-.3 1.6-.5-.5.6-1 1.1-1.5 1.5z" /></svg>
);
const GithubIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" /><path d="M9 18c-4.51 2-5-2-7-2" /></svg>
);
const LinkedinIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" /><rect width="4" height="12" x="2" y="9" /><circle cx="4" cy="4" r="2" /></svg>
);

export default function Footer() {
  return (
    <footer className="bg-[#050505] border-t border-white/10 pt-16 pb-8 mt-auto relative z-10 overflow-hidden">
      {/* Noise Texture Overlay (2-3%) */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')] mix-blend-overlay"></div>
      
      <div className="max-w-6xl mx-auto px-4 relative z-10">
        <div className="grid md:grid-cols-2 gap-12 mb-12">
          {/* Cột 1: Brand & Social */}
          <div className="flex flex-col items-center md:items-start gap-6">
            <Link href="/" className="flex items-center gap-3 group">
               <div className="p-2.5 bg-gradient-to-br from-cyan-500/10 to-blue-600/10 rounded-xl border border-white/10 group-hover:border-cyan-500/50 transition-all duration-300 group-hover:shadow-[0_0_20px_rgba(6,182,212,0.15)]">
                 <Activity className="w-6 h-6 text-cyan-400" />
               </div>
               <span className="font-black text-2xl tracking-tight text-white group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-cyan-400 group-hover:to-blue-500 transition-all duration-300">
                 SEO<span className="text-cyan-400 group-hover:text-blue-500 transition-colors">Audit</span>
               </span>
            </Link>
            
            <p className="text-gray-500 text-sm font-medium tracking-wide">Built for the future.</p>

            <div className="flex gap-4">
                <a href="https://www.facebook.com/eouaen/?locale=vi_VN" target="_blank" rel="noopener noreferrer" className="p-3 rounded-full bg-white/5 border border-white/5 hover:bg-cyan-500/10 hover:border-cyan-500/30 hover:text-cyan-400 text-gray-400 transition-all duration-300 hover:scale-110 hover:shadow-lg hover:shadow-cyan-500/10">
                  <FacebookIcon className="w-5 h-5" />
                </a>
                <a href="#" className="p-3 rounded-full bg-white/5 border border-white/5 hover:bg-cyan-500/10 hover:border-cyan-500/30 hover:text-cyan-400 text-gray-400 transition-all duration-300 hover:scale-110 hover:shadow-lg hover:shadow-cyan-500/10">
                  <TwitterIcon className="w-5 h-5" />
                </a>
                <a href="https://github.com/Luanhai3" target="_blank" rel="noopener noreferrer" className="p-3 rounded-full bg-white/5 border border-white/5 hover:bg-cyan-500/10 hover:border-cyan-500/30 hover:text-cyan-400 text-gray-400 transition-all duration-300 hover:scale-110 hover:shadow-lg hover:shadow-cyan-500/10">
                  <GithubIcon className="w-5 h-5" />
                </a>
                <a href="https://www.linkedin.com/in/lu%C3%A2n-ho%C3%A0ng-34bb122bb/" target="_blank" rel="noopener noreferrer" className="p-3 rounded-full bg-white/5 border border-white/5 hover:bg-cyan-500/10 hover:border-cyan-500/30 hover:text-cyan-400 text-gray-400 transition-all duration-300 hover:scale-110 hover:shadow-lg hover:shadow-cyan-500/10">
                  <LinkedinIcon className="w-5 h-5" />
                </a>
            </div>
          </div>

          {/* Cột 2: Legal Links */}
          <div className="flex flex-col items-center md:items-end justify-center">
            <nav className="flex flex-wrap justify-center md:justify-end gap-x-8 gap-y-4 text-sm font-medium text-gray-500">
                <Link href="/terms" className="hover:text-cyan-400 transition-colors duration-300">Điều khoản</Link>
                <Link href="/privacy" className="hover:text-cyan-400 transition-colors duration-300">Bảo mật</Link>
                <Link href="/contact" className="hover:text-cyan-400 transition-colors duration-300">Liên hệ</Link>
            </nav>
          </div>
        </div>

        {/* Bottom Center: Meta info */}
        <div className="pt-8 border-t border-white/5 text-center">
          <p className="text-gray-600 text-xs tracking-wider">© {new Date().getFullYear()} SEO Audit Tool. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}