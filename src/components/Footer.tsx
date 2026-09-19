import { Logo } from './Logo';
import { QuantumButton } from './QuantumButton';
import { Language, Theme } from '../types';
import { translations } from '../translations';
import { Globe, ArrowUp } from 'lucide-react';

interface FooterProps {
  lang: Language;
  theme: Theme;
}

export function Footer({ lang, theme }: FooterProps) {
  const t = translations[lang];
  const isDark = theme === 'dark';

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <footer
      id="main-footer"
      className="border-t border-slate-200/80 dark:border-slate-800/80 bg-white/70 dark:bg-slate-950/70 py-12 backdrop-blur-sm"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          {/* Brand Col */}
          <div className="md:col-span-2 space-y-4">
            <Logo isDark={isDark} />
            <p className="max-w-md text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
              {t.footer.brandTagline}
            </p>
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>{t.footer.backendStatus}</span>
            </div>
          </div>

          {/* 4 Core Services Col */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white mb-3">
              {t.footer.servicesCol}
            </h4>
            <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-400">
              {t.services.items.map((s) => (
                <li key={s.id}>
                  <button
                    type="button"
                    onClick={() => scrollTo('services')}
                    className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors text-left"
                  >
                    {s.title}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Solutions & Quick Links */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white mb-3">
              {t.footer.solutionsCol}
            </h4>
            <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-400">
              <li>
                <button
                  type="button"
                  onClick={() => scrollTo('pricing')}
                  className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                >
                  {t.nav.pricing}
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => scrollTo('demo')}
                  className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                >
                  {t.nav.demo}
                </button>
              </li>
              <li>
                <span className="text-slate-400 dark:text-slate-500">
                  {lang === 'en' ? 'Bilingual System (EN/AR)' : 'نظام ثنائي اللغة (عربي/إنجليزي)'}
                </span>
              </li>
              <li>
                <span className="text-slate-400 dark:text-slate-500">
                  {lang === 'en' ? 'Real API Integrations' : 'ربط واجهات برمجة حقيقية'}
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-slate-200 dark:border-slate-800/80 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 dark:text-slate-400">
          <div>
            &copy; {new Date().getFullYear()} {t.footer.rights}
          </div>
          <QuantumButton
            variant="secondary"
            size="sm"
            onClick={scrollToTop}
          >
            <span>{lang === 'en' ? 'Back to top' : 'العودة للأعلى'}</span>
            <ArrowUp className="h-3 w-3" />
          </QuantumButton>
        </div>
      </div>
    </footer>
  );
}
