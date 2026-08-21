import React from 'react';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
}

export const ApexMotorsportsLogo: React.FC<LogoProps> = ({
  className = '',
  size = 'md',
  showText = false,
}) => {
  const sizeMap = {
    sm: { box: 'w-8 h-8', text: 'text-sm', sub: 'text-[9px]' },
    md: { box: 'w-11 h-11', text: 'text-lg', sub: 'text-[10px]' },
    lg: { box: 'w-14 h-14', text: 'text-2xl', sub: 'text-xs' },
    xl: { box: 'w-20 h-20', text: 'text-3xl', sub: 'text-sm' },
  };

  const currentSize = sizeMap[size];

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* Precision Emblem Container */}
      <div
        className={`relative ${currentSize.box} rounded-2xl bg-gradient-to-b from-[#181a2e] via-[#0d0f1d] to-[#05060c] border border-white/20 p-1 flex items-center justify-center shadow-xl shadow-[#ff1744]/20 overflow-hidden group`}
      >
        {/* Ambient Carbon Fiber Weave Pattern */}
        <div className="absolute inset-0 bg-[radial-gradient(#ff1744_0.8px,transparent_0.8px)] [background-size:6px_6px] opacity-20 pointer-events-none" />
        
        {/* Aerodynamic Speed Glow Accent */}
        <div className="absolute -inset-1 bg-gradient-to-r from-[#ff1744]/35 via-rose-500/20 to-cyan-400/30 opacity-75 group-hover:opacity-100 transition-opacity duration-300 blur-sm pointer-events-none" />

        {/* High-Resolution Precision Vector Emblem */}
        <svg
          viewBox="0 0 100 100"
          className="w-full h-full relative z-10 drop-shadow-md overflow-visible"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            {/* Scarlet Racing Red Gradient */}
            <linearGradient id="apexScarlet" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ff4d6d" />
              <stop offset="50%" stopColor="#ff1744" />
              <stop offset="100%" stopColor="#b70020" />
            </linearGradient>

            {/* Cyan Telemetry Ray */}
            <linearGradient id="telemetryCyan" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#00f2fe" />
              <stop offset="100%" stopColor="#4facfe" />
            </linearGradient>

            {/* Titanium Metallic Sheen */}
            <linearGradient id="titaniumSheen" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="45%" stopColor="#e2e8f0" />
              <stop offset="100%" stopColor="#64748b" />
            </linearGradient>

            {/* Gold Apex Clip Accents */}
            <linearGradient id="apexGold" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#fbbf24" />
              <stop offset="100%" stopColor="#d97706" />
            </linearGradient>
          </defs>

          {/* Circuit Ribbon / Track Outer Apex Arc */}
          <path
            d="M 18,74 
               C 12,52 20,26 44,16 
               C 66,8 88,20 86,44 
               C 84,66 64,84 42,84 
               C 32,84 24,80 18,74 Z"
            stroke="url(#apexScarlet)"
            strokeWidth="3.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="filter drop-shadow-[0_0_8px_rgba(255,23,68,0.8)]"
          />

          {/* High-speed Racing Kerbing Segment */}
          <path
            d="M 44,16 C 56,12 70,16 78,26"
            stroke="#ffffff"
            strokeWidth="2.5"
            strokeDasharray="4 3"
            strokeLinecap="round"
            opacity="0.9"
          />

          {/* Precision Apex Velocity Arrow / Hypercar Wedge */}
          <path
            d="M 28,68 
               L 48,34 
               C 52,28 60,28 64,34 
               L 80,60 
               C 83,65 80,72 74,72 
               L 54,64 
               L 34,72 
               C 28,72 25,65 28,68 Z"
            fill="url(#titaniumSheen)"
            className="filter drop-shadow-[0_4px_8px_rgba(0,0,0,0.8)]"
          />

          {/* Aero Cockpit Canopy & Core */}
          <path
            d="M 50,38 L 58,54 L 50,60 L 42,54 Z"
            fill="#090a14"
            stroke="url(#apexScarlet)"
            strokeWidth="1.2"
          />

          {/* High Downforce GT Wing Blade */}
          <path
            d="M 30,68 L 70,68"
            stroke="#ff1744"
            strokeWidth="3"
            strokeLinecap="round"
          />

          {/* Apex Telemetry Vector Beam */}
          <path
            d="M 14,80 Q 40,86 68,76"
            stroke="url(#telemetryCyan)"
            strokeWidth="2.5"
            strokeLinecap="round"
            opacity="0.95"
          />

          {/* Golden Apex Clipping Indicator */}
          <circle cx="50" cy="18" r="2.8" fill="url(#apexGold)" className="filter drop-shadow-[0_0_6px_#fbbf24]" />
          <circle cx="50" cy="18" r="1.2" fill="#ffffff" />
        </svg>

        {/* Bottom Illumination Line */}
        <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#ff1744] to-transparent opacity-90" />
      </div>

      {/* Typography Brand Name */}
      {showText && (
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5 leading-none">
            <span className={`font-black tracking-wider text-white uppercase font-mono ${currentSize.text} drop-shadow-sm`}>
              APEX
            </span>
            <span className={`font-black tracking-wider text-[#ff1744] uppercase font-mono ${currentSize.text} drop-shadow-sm`}>
              MOTORSPORTS
            </span>
          </div>
          <span className={`${currentSize.sub} font-mono font-bold tracking-widest text-slate-400 uppercase mt-0.5`}>
            Multi-Discipline Racing & Telemetry
          </span>
        </div>
      )}
    </div>
  );
};
