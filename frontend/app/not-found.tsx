'use client';

import Link from 'next/link';
import { useRef } from 'react';

export default function NotFound() {
  const audioRef = useRef<{ ctx: AudioContext; noise: AudioBufferSourceNode } | null>(null);

  const playStaticNoise = () => {
    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContext) return;

      const ctx = new AudioContext();
      const bufferSize = ctx.sampleRate * 2; // Buffer 2 giây
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);

      // Tạo nhiễu trắng (Random noise)
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }

      const noise = ctx.createBufferSource();
      noise.buffer = buffer;
      noise.loop = true;

      // Điều chỉnh âm lượng (Rất quan trọng vì noise gốc rất to)
      const gainNode = ctx.createGain();
      gainNode.gain.value = 0.05; // 5% âm lượng

      noise.connect(gainNode);
      gainNode.connect(ctx.destination);
      noise.start();

      audioRef.current = { ctx, noise };
    } catch (e) {
      console.error("Audio init failed", e);
    }
  };

  const stopStaticNoise = () => {
    if (audioRef.current) {
      try {
        audioRef.current.noise.stop();
        audioRef.current.ctx.close();
      } catch (e) {}
      audioRef.current = null;
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans selection:bg-cyan-500/30 flex flex-col items-center justify-center relative overflow-hidden">
      {/* Background Glow Effects */}
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-blue-600/20 rounded-full blur-[120px] -z-10 mix-blend-screen pointer-events-none animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-purple-600/20 rounded-full blur-[120px] -z-10 mix-blend-screen pointer-events-none animate-pulse" style={{ animationDelay: '1s' }} />

      <div className="text-center z-10 px-4">
        <div className="relative inline-block">
          <h1 
            className="text-9xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 mb-2 drop-shadow-[0_0_30px_rgba(6,182,212,0.5)] glitch"
            data-text="404"
            onMouseEnter={playStaticNoise}
            onMouseLeave={stopStaticNoise}
          >
            404
          </h1>
          <div className="absolute -inset-1 bg-gradient-to-r from-cyan-400 to-purple-600 blur opacity-20 -z-10"></div>
        </div>
        
        <h2 className="text-2xl md:text-3xl font-bold text-white mb-4 mt-4">
          Lạc lối trong không gian số?
        </h2>
        <p className="text-gray-400 max-w-md mx-auto mb-8 text-lg leading-relaxed">
          Trang bạn đang tìm kiếm không tồn tại hoặc đã bị di chuyển đến một vũ trụ khác.
        </p>
        
        <Link 
          href="/"
          className="inline-flex items-center justify-center px-8 py-3 text-base font-bold text-white transition-all duration-200 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 hover:border-cyan-500/50 hover:shadow-[0_0_30px_rgba(6,182,212,0.2)] backdrop-blur-sm"
        >
          Quay về Trang chủ
        </Link>
      </div>
    </div>
  );
}