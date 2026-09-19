import React from 'react';

interface QuantumHexLogoProps {
  className?: string;
  isDark?: boolean;
}

export const QuantumHexLogo: React.FC<QuantumHexLogoProps> = ({ className = '', isDark = true }) => {
  return (
    <div className={`relative flex items-center gap-3 font-bold tracking-tight select-none group cursor-pointer ${className}`}>
      {/* Outer Multi-Layer Plasma Aura */}
      <div className="relative flex h-11 w-11 items-center justify-center">
        {/* Layer 1: Ambient pulsing neon blur */}
        <div className="absolute -inset-2 rounded-2xl bg-gradient-to-r from-cyan-400 via-fuchsia-500 to-indigo-500 opacity-60 blur-md group-hover:opacity-100 group-hover:scale-115 transition-all duration-500 animate-pulse pointer-events-none" />

        {/* Layer 2: Fast spinning electric conic perimeter ring */}
        <div
          className="absolute -inset-0.5 rounded-2xl opacity-90 transition-all duration-300 pointer-events-none"
          style={{
            background: 'conic-gradient(from 0deg, #06b6d4, #8b5cf6, #ec4899, #10b981, #06b6d4)',
            animation: 'spin 3.5s linear infinite',
          }}
        />

        {/* Layer 3: Counter-rotating outer particle ring */}
        <div
          className="absolute -inset-1 rounded-2xl border border-cyan-400/40 pointer-events-none"
          style={{
            animation: 'spin 7s linear infinite reverse',
            borderStyle: 'dashed',
          }}
        />

        {/* Core Jewel Container */}
        <div
          className={`relative flex h-[38px] w-[38px] items-center justify-center rounded-[13px] shadow-2xl transition-transform duration-300 group-hover:scale-105 ${
            isDark ? 'bg-slate-950/95' : 'bg-slate-900'
          } backdrop-blur-xl border border-white/20`}
        >
          {/* Dynamic Animated Quantum SVG Symbol */}
          <svg
            className="h-6 w-6 filter drop-shadow-[0_0_8px_rgba(6,182,212,0.8)]"
            viewBox="0 0 32 32"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <linearGradient id="quantum-core-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#22d3ee" />
                <stop offset="45%" stopColor="#818cf8" />
                <stop offset="80%" stopColor="#e879f9" />
                <stop offset="100%" stopColor="#34d399" />
              </linearGradient>
              <linearGradient id="neon-glow-stroke" x1="0%" y1="100%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#38bdf8" />
                <stop offset="100%" stopColor="#c084fc" />
              </linearGradient>
            </defs>

            {/* Hexagonal Shield Perimeter with Electric Nodes */}
            <polygon
              points="16 2, 28 8.5, 28 23.5, 16 30, 4 23.5, 4 8.5"
              stroke="url(#neon-glow-stroke)"
              strokeWidth="2.2"
              strokeLinejoin="round"
              className="transition-all"
            />

            {/* Inner Stylized 3D Quantum "E" Core */}
            <path
              d="M11 9H22M11 16H19.5M11 23H22"
              stroke="url(#quantum-core-grad)"
              strokeWidth="2.6"
              strokeLinecap="round"
            />
            {/* Center vertical connector with pulse */}
            <line
              x1="11"
              y1="9"
              x2="11"
              y2="23"
              stroke="url(#quantum-core-grad)"
              strokeWidth="2.6"
              strokeLinecap="round"
            />

            {/* Glowing Quantum Core Orb */}
            <circle
              cx="21"
              cy="16"
              r="2.5"
              fill="#22d3ee"
              className="animate-ping opacity-75 origin-center"
            />
            <circle
              cx="21"
              cy="16"
              r="2"
              fill="#ffffff"
            />

            {/* Orbital micro satellites */}
            <circle cx="28" cy="8.5" r="1.5" fill="#e879f9" />
            <circle cx="4" cy="23.5" r="1.5" fill="#34d399" />
          </svg>

          {/* Glowing center spark */}
          <div className="absolute inset-0 bg-cyan-400/10 rounded-[13px] animate-pulse pointer-events-none" />
        </div>
      </div>

      {/* Brand Typography with moving holographic metallic sheen */}
      <div className="flex flex-col leading-none">
        <span
          className="text-xl font-black tracking-wider uppercase transition-all duration-300"
          style={{
            background: 'linear-gradient(135deg, #ffffff 0%, #a5f3fc 25%, #c084fc 60%, #38bdf8 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            filter: 'drop-shadow(0 2px 10px rgba(34,211,238,0.35))',
          }}
        >
          ELYVORI
        </span>
        <div className="flex items-center gap-1.5 mt-0.5">
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
          <span className="text-[10px] font-extrabold tracking-[0.2em] uppercase text-cyan-400/90 dark:text-cyan-300">
            NEURAL SYSTEMS
          </span>
        </div>
      </div>
    </div>
  );
};
