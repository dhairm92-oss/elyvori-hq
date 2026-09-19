import { ArrowRight, Sparkles, CheckCircle2 } from 'lucide-react';
import { Language } from '../types';
import { translations } from '../translations';
import { Hero3DVisuals } from './Hero3DVisuals';
import { QuantumButton } from './QuantumButton';

interface HeroProps {
  lang: Language;
  onExploreServices: () => void;
  onRequestDemo: () => void;
}

export function Hero({ lang, onExploreServices, onRequestDemo }: HeroProps) {
  const t = translations[lang];
  const isRtl = lang === 'ar';

  return (
    <section id="hero-section" className="relative overflow-hidden pt-12 pb-20 sm:pt-20 sm:pb-28">
      {/* Background glow accents */}
      <div className="pointer-events-none absolute -top-24 left-1/2 -z-10 h-96 w-96 -translate-x-1/2 rounded-full bg-gradient-to-tr from-indigo-500/20 via-blue-500/15 to-emerald-400/20 blur-3xl" />

      <div className="mx-auto max-w-5xl px-4 text-center sm:px-6 lg:px-8">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/20 bg-indigo-500/10 px-3.5 py-1.5 text-xs font-semibold text-indigo-600 dark:text-indigo-400 mb-6 backdrop-blur-sm">
          <Sparkles className="h-3.5 w-3.5 text-indigo-500" />
          <span>{t.hero.badge}</span>
        </div>

        {/* Heading */}
        <h1
          id="hero-title"
          className="text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-5xl md:text-6xl leading-[1.15]"
        >
          <span className="bg-gradient-to-r from-indigo-600 via-blue-600 to-emerald-500 dark:from-indigo-400 dark:via-blue-300 dark:to-emerald-400 bg-clip-text text-transparent">
            {t.hero.titleHighlight}
          </span>{' '}
          {t.hero.titleRest}
        </h1>

        {/* Subtitle */}
        <p
          id="hero-subtitle"
          className="mx-auto mt-6 max-w-3xl text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed font-normal"
        >
          {t.hero.subtitle}
        </p>

        {/* Action Buttons */}
        <div id="hero-cta-group" className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-5">
          <QuantumButton
            id="hero-btn-request-demo"
            variant="primary"
            size="lg"
            onClick={onRequestDemo}
          >
            <span>{t.hero.ctaPrimary}</span>
            <ArrowRight className={`h-4 w-4 ${isRtl ? 'rotate-180' : ''}`} />
          </QuantumButton>

          <QuantumButton
            id="hero-btn-explore-services"
            variant="secondary"
            size="lg"
            onClick={onExploreServices}
          >
            <span>{t.hero.ctaSecondary}</span>
          </QuantumButton>
        </div>

        {/* 3D Company Visuals Suite (Requested 3D pictures & vertical sculpture at beginning of page) */}
        <Hero3DVisuals lang={lang} />

        {/* Stats Strip */}
        <div
          id="hero-stats-strip"
          className="mt-14 grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4 border-t border-slate-200/70 dark:border-slate-800/80 pt-10"
        >
          {t.hero.stats.map((st, i) => (
            <div
              key={i}
              className="flex flex-col items-center rounded-xl border border-slate-100 dark:border-slate-850 bg-slate-50/70 dark:bg-slate-900/40 p-3.5 backdrop-blur-xs"
            >
              <span className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                {st.value}
              </span>
              <span className="mt-1 text-xs text-slate-500 dark:text-slate-400 text-center font-medium">
                {st.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
