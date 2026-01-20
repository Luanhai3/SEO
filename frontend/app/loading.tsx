export default function Loading() {
  return (
    <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center relative overflow-hidden z-50">
      {/* Background Glow Effects */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px] animate-pulse" />
      
      <div className="relative flex items-center justify-center">
        {/* Outer Ring - Cyan */}
        <div className="w-24 h-24 rounded-full border-2 border-white/5 border-t-cyan-500 animate-spin" style={{ animationDuration: '1s' }}></div>
        
        {/* Middle Ring - Purple */}
        <div className="absolute w-16 h-16 rounded-full border-2 border-white/5 border-r-purple-500 animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
        
        {/* Inner Ring - Blue */}
        <div className="absolute w-8 h-8 rounded-full border-2 border-white/5 border-b-blue-500 animate-spin" style={{ animationDuration: '2s' }}></div>
        
        {/* Core Glow */}
        <div className="absolute w-1 h-1 bg-white rounded-full shadow-[0_0_20px_rgba(255,255,255,1)] animate-ping"></div>
      </div>
      
      <div className="mt-8 flex flex-col items-center gap-2">
        <h2 className="text-sm font-bold text-gray-400 tracking-[0.3em] uppercase animate-pulse">
          System Initializing
        </h2>
        <div className="flex gap-1">
          <div className="w-1 h-1 bg-cyan-500 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
          <div className="w-1 h-1 bg-cyan-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
          <div className="w-1 h-1 bg-cyan-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
        </div>
      </div>
    </div>
  );
}