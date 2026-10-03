import React, { useState } from 'react';
import { Sparkles, X, Layers, ExternalLink } from 'lucide-react';

interface FloatingSideLogoProps {
  isDark?: boolean;
  lang?: 'en' | 'ar';
}

export const FloatingSideLogo: React.FC<FloatingSideLogoProps> = ({ isDark = true, lang = 'en' }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const isRtl = lang === 'ar';

  return (
    <aside
      id="floating-side-brand-widget"
      aria-label="Brand floating badge"
      className={`fixed top-1/3 z-50 transition-all duration-300 pointer-events-auto ${
        isRtl ? 'left-3 sm:left-6' : 'right-3 sm:right-6'
      }`}
    >
      <div className="relative group">
        {/* Ambient Pulsing Glow Aura behind badge */}
        <div className="absolute -inset-2 rounded-2xl bg-gradient-to-r from-indigo-500 via-cyan-400 to-emerald-400 opacity-70 blur-md animate-pulse group-hover:opacity-100 transition-opacity" />

        {/* Orbiting ring */}
        <div className="absolute -inset-1 rounded-2xl border border-indigo-400/40 animate-[spin_8s_linear_infinite] pointer-events-none" />

        {/* Floating container */}
        <div
          onClick={() => setIsExpanded((prev) => !prev)}
          className={`relative flex items-center gap-2.5 p-2 rounded-2xl cursor-pointer select-none backdrop-blur-xl border transition-all duration-300 hover:scale-105 active:scale-95 shadow-2xl ${
            isDark
              ? 'bg-slate-950/85 border-indigo-500/40 shadow-indigo-950/80 text-white'
              : 'bg-white/90 border-indigo-200 shadow-indigo-300/40 text-slate-900'
          }`}
          title={isRtl ? 'شعار إليفوري المتوهج - اضغط للتكبير' : 'Elyvori Floating 3D Emblem - Click to expand'}
        >
          {/* Animated 3D Micro Core */}
          <div className="relative w-10 h-10 flex items-center justify-center rounded-xl bg-gradient-to-tr from-cyan-400 via-fuchsia-500 to-indigo-500 p-[1.5px] shadow-lg shadow-cyan-500/40 animate-[bounce_3s_ease-in-out_infinite]">
            <div
              className={`w-full h-full rounded-[10px] flex items-center justify-center ${
                isDark ? 'bg-slate-950' : 'bg-slate-900'
              }`}
            >
              {/* Inner animated rotating quantum icon */}
              <svg
                className="w-5 h-5 filter drop-shadow-[0_0_6px_rgba(6,182,212,0.8)] animate-[spin_8s_linear_infinite]"
                viewBox="0 0 32 32"
                fill="none"
              >
                <polygon
                  points="16 2, 28 8.5, 28 23.5, 16 30, 4 23.5, 4 8.5"
                  stroke="#22d3ee"
                  strokeWidth="2.5"
                  strokeLinejoin="round"
                />
                <path
                  d="M11 9H22M11 16H19.5M11 23H22"
                  stroke="#e879f9"
                  strokeWidth="2.8"
                  strokeLinecap="round"
                />
                <circle cx="21" cy="16" r="2.5" fill="#34d399" />
              </svg>
            </div>
            {/* Pulsing beacon dot */}
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-cyan-500"></span>
            </span>
          </div>

          {/* Text with dynamic 3D gradient */}
          <div className="hidden sm:flex flex-col pr-1">
            <span className="text-[11px] font-extrabold tracking-widest bg-gradient-to-r from-indigo-400 via-cyan-300 to-emerald-300 bg-clip-text text-transparent animate-pulse">
              ELYVORI
            </span>
            <span className="text-[9px] font-semibold text-slate-400 flex items-center gap-1">
              <Sparkles className="w-2.5 h-2.5 text-cyan-400 animate-spin" />
              <span>{isRtl ? 'ذكاء اصطناعي' : 'AI SYSTEMS'}</span>
            </span>
          </div>
        </div>

        {/* Modal tooltip when clicked */}
        {isExpanded && (
          <div
            className={`absolute top-full mt-3 w-64 p-4 rounded-2xl border backdrop-blur-2xl shadow-2xl transition-all animate-in fade-in zoom-in-95 ${
              isRtl ? 'left-0' : 'right-0'
            } ${
              isDark
                ? 'bg-slate-900/95 border-indigo-500/30 text-white shadow-indigo-950/80'
                : 'bg-white/95 border-indigo-200 text-slate-900 shadow-xl'
            }`}
          >
            <div className="flex items-center justify-between pb-2 border-b border-indigo-500/20 mb-2.5">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-cyan-400" />
                <span className="text-xs font-bold tracking-wider">ELYVORI 3D</span>
              </div>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsExpanded(false);
                }}
                className="p-1 rounded-lg hover:bg-slate-800/40 text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
            <p className="text-xs text-slate-300 dark:text-slate-300 leading-relaxed">
              {isRtl
                ? 'إليفوري للحلول الذكية — بناء المنتجات الرقمية، المواقع، التطبيقات، أنظمة التوظيف، وحملات التسويق الآلية.'
                : 'Elyvori AI Systems — Building high-impact digital products, web/mobile apps, recruitment CRMs & bilingual marketing.'}
            </p>
            <div className="mt-3 pt-2 flex items-center justify-between text-[11px] text-cyan-400 font-medium">
              <span className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                {isRtl ? 'النظام نشط' : 'Online & Active'}
              </span>
              <a
                href="#services"
                onClick={() => setIsExpanded(false)}
                className="hover:underline flex items-center gap-0.5"
              >
                {isRtl ? 'الخدمات' : 'Explore'} <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};
