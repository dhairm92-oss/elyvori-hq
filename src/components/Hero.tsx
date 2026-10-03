import { ArrowRight, Sparkles, Zap } from 'lucide-react';
import { Language } from '../types';
import { translations } from '../translations';
import { Hero3DVisuals } from './Hero3DVisuals';
import { QuantumButton } from './QuantumButton';
import { LiveDemoAnimation } from './LiveDemoAnimation';

interface HeroProps {
  lang: Language;
  onExploreServices: () => void;
  onRequestDemo: () => void;
}

export function Hero({ lang, onExploreServices, onRequestDemo }: HeroProps) {
  const t = translations[lang];
  const isRtl = lang === 'ar';

  const stats = [
    { value: '10', label: lang === 'en' ? 'Core AI Agents' : 'وكيل ذكاء اصطناعي' },
    { value: '100%', label: lang === 'en' ? 'Real Backends & DBs Built' : 'خوادم وقواعد بيانات حقيقية' },
    { value: 'EN / AR', label: lang === 'en' ? 'Native Bilingual Support' : 'دعم ثنائي اللغة' },
    { value: 'Instant', label: lang === 'en' ? 'Market Gap Analysis' : 'تحليل فجوات السوق' },
  ];

  return (
    <section
      id="hero-section"
      dir={isRtl ? 'rtl' : 'ltr'}
      style={{ colorScheme: 'dark', fontFamily: "'Cairo', 'Inter', sans-serif" }}
      className="relative overflow-hidden pt-12 pb-20 sm:pt-20 sm:pb-28 bg-transparent"
    >
      {/* Background effects */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] rounded-full opacity-30"
          style={{ background: 'radial-gradient(ellipse, rgba(0,229,255,0.12) 0%, rgba(124,58,237,0.08) 50%, transparent 70%)' }} />
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] rounded-full opacity-20"
          style={{ background: 'radial-gradient(ellipse, rgba(213,0,249,0.15) 0%, transparent 70%)' }} />
        <div className="absolute inset-0 opacity-[0.025]"
          style={{ backgroundImage: 'linear-gradient(rgba(0,229,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(0,229,255,1) 1px, transparent 1px)', backgroundSize: '80px 80px' }} />
      </div>

      <div className="relative mx-auto max-w-5xl px-4 text-center sm:px-6 lg:px-8">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 rounded-full border border-[#00E5FF]/20 bg-[#00E5FF]/5 px-4 py-1.5 text-xs font-semibold text-[#00E5FF] mb-6 backdrop-blur-sm">
          <Sparkles className="h-3.5 w-3.5" />
          <span>{t.hero.badge}</span>
        </div>

        {/* Heading */}
        <h1
          id="hero-title"
          className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl md:text-6xl leading-[1.15]"
          style={{ textShadow: '0 0 80px rgba(0,229,255,0.15)' }}
        >
          <span style={{ background: 'linear-gradient(135deg, #00E5FF, #7C3AED, #D500F9)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
            {t.hero.titleHighlight}
          </span>{' '}
          <span className="text-white">{t.hero.titleRest}</span>
        </h1>

        {/* Subtitle */}
        <p
          id="hero-subtitle"
          className="mx-auto mt-6 max-w-3xl text-base sm:text-lg text-slate-200 leading-relaxed"
        >
          {t.hero.subtitle}
        </p>

        {/* Action Buttons */}
        <div id="hero-cta-group" className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={onRequestDemo}
            className="group flex items-center gap-2 rounded-xl px-6 py-3.5 text-sm font-bold text-white transition-all duration-300"
            style={{
              background: 'linear-gradient(135deg, #00E5FF, #7C3AED, #D500F9)',
              boxShadow: '0 0 30px rgba(0,229,255,0.25), 0 4px 20px rgba(213,0,249,0.2)',
            }}
          >
            <Zap className="h-4 w-4" />
            <span>{t.hero.ctaPrimary}</span>
            <ArrowRight className={`h-4 w-4 transition-transform group-hover:translate-x-1 ${isRtl ? 'rotate-180' : ''}`} />
          </button>

          <button
            onClick={onExploreServices}
            className="flex items-center gap-2 rounded-xl border border-[#00E5FF]/20 bg-[#00E5FF]/5 px-6 py-3.5 text-sm font-semibold text-[#00E5FF] transition-all hover:bg-[#00E5FF]/10 hover:border-[#00E5FF]/40"
          >
            <span>{t.hero.ctaSecondary}</span>
          </button>
        </div>

        {/* Live Demo */}
        <div className="mt-14">
          <LiveDemoAnimation lang={lang} />
        </div>

        <div className="hidden md:contents"><Hero3DVisuals lang={lang} /></div>

        {/* Stats Strip */}
        <div
          id="hero-stats-strip"
          className="mt-14 grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4 border-t pt-10"
          style={{ borderColor: 'rgba(0,229,255,0.1)' }}
        >
          {stats.map((st, i) => (
            <div
              key={i}
              className="flex flex-col items-center rounded-xl border p-4"
              style={{
                borderColor: 'rgba(0,229,255,0.12)',
                background: 'rgba(0,229,255,0.03)',
                backdropFilter: 'blur(8px)',
              }}
            >
              <span className="text-xl sm:text-2xl font-bold tracking-tight text-white"
                style={{ textShadow: '0 0 20px rgba(0,229,255,0.4)' }}>
                {st.value}
              </span>
              <span className="mt-1 text-xs text-slate-200 text-center">{st.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
