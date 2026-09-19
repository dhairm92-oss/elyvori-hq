import React, { useState } from 'react';
import { Sparkles, Shield, Cpu, Zap } from 'lucide-react';
import { Language } from '../types';

import elyvoriPillarImg from '../assets/images/elyvori_3d_pillar_1789821140182.jpg';
import elyvoriEmblemImg from '../assets/images/elyvori_3d_emblem_1789821153466.jpg';
import elyvoriCubeImg from '../assets/images/elyvori_3d_cube_1789821186560.jpg';

interface Hero3DVisualsProps {
  lang: Language;
}

export const Hero3DVisuals: React.FC<Hero3DVisualsProps> = ({ lang }) => {
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const isRtl = lang === 'ar';

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 16;
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * -16;
    setTilt({ x, y });
  };

  const handleMouseLeave = () => {
    setTilt({ x: 0, y: 0 });
  };

  return (
    <div
      id="hero-3d-visuals-container"
      className="mt-12 w-full max-w-6xl mx-auto px-4 select-none"
    >
      <div
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className="relative rounded-3xl p-1 bg-gradient-to-r from-indigo-500/30 via-cyan-400/30 to-emerald-400/30 shadow-2xl backdrop-blur-xl transition-all duration-300"
        style={{ perspective: '1200px' }}
      >
        {/* Outer glowing border aura */}
        <div className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-indigo-500 via-cyan-400 to-emerald-400 opacity-20 blur-xl animate-pulse pointer-events-none" />

        {/* 3D Showcase Panel */}
        <div
          className="relative rounded-[22px] bg-slate-950/90 dark:bg-slate-950/95 border border-indigo-500/20 p-5 sm:p-7 overflow-hidden transition-transform duration-500 ease-out"
          style={{
            transform: `rotateX(${tilt.y}deg) rotateY(${tilt.x}deg)`,
            transformStyle: 'preserve-3d',
          }}
        >
          {/* Header Tag */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-800/80 mb-6">
            <div className="flex items-center gap-2.5">
              <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping" />
              <span className="text-xs font-bold tracking-widest text-cyan-300 uppercase">
                {isRtl ? 'المعرض المجسم ثلاثي الأبعاد • إليفوري' : 'ELYVORI 3D HOLOGRAPHIC SUITE'}
              </span>
            </div>
            <div className="flex items-center gap-3 text-[11px] text-slate-400 font-mono">
              <span className="hidden sm:inline-flex items-center gap-1">
                <Cpu className="w-3.5 h-3.5 text-indigo-400" />
                <span>3D NEURAL ENGINE</span>
              </span>
              <span className="inline-flex items-center gap-1 text-emerald-400">
                <Zap className="w-3.5 h-3.5" />
                <span>ACTIVE</span>
              </span>
            </div>
          </div>

          {/* 3D Visuals Grid */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-stretch">
            {/* Left: Vertical 3D Monolith Pillar (صورة بطول فى بداية الصفحة باسم الشركة بتحرك ثلاثي ابعاد) */}
            <div
              id="hero-3d-vertical-pillar"
              className="md:col-span-4 relative rounded-2xl overflow-hidden border border-indigo-500/30 bg-slate-900/60 group shadow-lg shadow-indigo-950/50 flex flex-col"
              style={{ transform: 'translateZ(30px)' }}
            >
              {/* Image container with floating animation */}
              <div className="relative aspect-[9/14] w-full overflow-hidden">
                <img
                  src={elyvoriPillarImg}
                  alt="Elyvori 3D Vertical Sculpture Monolith"
                  className="w-full h-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-108 group-hover:rotate-1"
                  referrerPolicy="no-referrer"
                />
                {/* Floating shine overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent pointer-events-none" />
                
                {/* Floating 3D Badge on vertical image */}
                <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none">
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase bg-slate-950/80 text-cyan-300 border border-cyan-500/30 backdrop-blur-md flex items-center gap-1 shadow-md">
                    <Sparkles className="w-3 h-3 text-cyan-400 animate-spin" />
                    <span>3D MONOLITH</span>
                  </span>
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                </div>

                {/* Bottom caption text overlay */}
                <div className="absolute bottom-3 left-3 right-3 p-3 rounded-xl bg-slate-950/85 border border-indigo-500/30 backdrop-blur-md">
                  <div className="text-xs font-black tracking-wider text-white uppercase flex items-center justify-between">
                    <span>ELYVORI ARCHITECTURE</span>
                    <span className="text-[10px] text-cyan-400">3D</span>
                  </div>
                  <p className="text-[10px] text-slate-300 mt-1 leading-snug">
                    {isRtl
                      ? 'صرح مجسم ثلاثي الأبعاد يرمز لقوة البنية التحتية الذكية في إليفوري.'
                      : 'High-precision 3D architecture encapsulating Elyvori AI systems.'}
                  </p>
                </div>
              </div>
            </div>

            {/* Right: 3D Horizontal Showcase & Cube */}
            <div className="md:col-span-8 flex flex-col gap-5 justify-between">
              {/* Top Banner: 3D Emblem with Glowing Text */}
              <div
                id="hero-3d-emblem-card"
                className="relative rounded-2xl overflow-hidden border border-cyan-500/30 bg-slate-900/60 group shadow-lg shadow-cyan-950/40"
                style={{ transform: 'translateZ(20px)' }}
              >
                <div className="relative aspect-[16/8] sm:aspect-[16/7] w-full overflow-hidden">
                  <img
                    src={elyvoriEmblemImg}
                    alt="Elyvori 3D Emblem with Glowing Letters"
                    className="w-full h-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/30 to-transparent pointer-events-none" />

                  {/* Top Badge */}
                  <div className="absolute top-3 left-3">
                    <span className="px-3 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase bg-slate-950/80 text-emerald-300 border border-emerald-500/30 backdrop-blur-md flex items-center gap-1.5 shadow-md">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                      <span>{isRtl ? 'شعار إليفوري الثلاثي الأبعاد' : 'ELYVORI 3D EMBLEM'}</span>
                    </span>
                  </div>

                  {/* Floating Content strip */}
                  <div className="absolute bottom-3 left-3 right-3 p-3.5 rounded-xl bg-slate-950/85 border border-cyan-500/30 backdrop-blur-md flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-extrabold text-white tracking-wide">
                        {isRtl ? 'نظام إليفوري الذكي المتكامل' : 'ELYVORI AUTONOMOUS ENTERPRISE'}
                      </h4>
                      <p className="text-[11px] text-slate-300">
                        {isRtl
                          ? 'تصاميم مجسمة ثلاثية الأبعاد بدقة فائقة تعبر عن خدماتنا الأربعة المتقدمة.'
                          : 'Photorealistic volumetric 3D branding representing our 4 core services.'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom Row: 3D Holographic Cube + Interactive Feature Spec */}
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
                {/* 3D Cube Card */}
                <div
                  id="hero-3d-cube-card"
                  className="sm:col-span-5 relative rounded-2xl overflow-hidden border border-indigo-500/30 bg-slate-900/60 group shadow-md"
                  style={{ transform: 'translateZ(35px)' }}
                >
                  <div className="relative aspect-square w-full overflow-hidden">
                    <img
                      src={elyvoriCubeImg}
                      alt="Elyvori 3D Holographic Cube"
                      className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110 group-hover:rotate-3"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent pointer-events-none" />
                    <div className="absolute bottom-2 left-2 right-2 px-2.5 py-1.5 rounded-lg bg-slate-950/80 border border-indigo-400/30 backdrop-blur-xs text-center">
                      <span className="text-[10px] font-extrabold text-cyan-300 tracking-wider">
                        ELYVORI 3D CORE
                      </span>
                    </div>
                  </div>
                </div>

                {/* Key Spec Cards */}
                <div className="sm:col-span-7 flex flex-col gap-2.5">
                  <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-left flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400">
                      <Shield className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-white block">
                        {isRtl ? 'تصميم ثلاثي الأبعاد فاخر' : 'Luxury 3D Brand Experience'}
                      </span>
                      <span className="text-[11px] text-slate-400 block mt-0.5">
                        {isRtl
                          ? 'عناصر مجسمة تعكس الهوية الابتكارية للشركة في كل تفصيل.'
                          : 'Dimensional optics reinforcing our verified real business offerings.'}
                      </span>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-left flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400">
                      <Cpu className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-white block">
                        {isRtl ? 'شعار جانبي متوهج وديناميكي' : 'Dynamic Glowing Beacon'}
                      </span>
                      <span className="text-[11px] text-slate-400 block mt-0.5">
                        {isRtl
                          ? 'شعار جانبي مستمر الحركة يتيح استكشاف هوية إليفوري بنقرة واحدة.'
                          : 'Interactive floating widget keeping Elyvori brand front & center.'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
