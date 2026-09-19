import { Sun, Moon, Globe, LogIn, LogOut, CheckCircle, ShieldCheck } from 'lucide-react';
import { Logo } from './Logo';
import { QuantumButton } from './QuantumButton';
import { Language, Theme, AuthState } from '../types';
import { translations } from '../translations';

interface NavbarProps {
  lang: Language;
  theme: Theme;
  onToggleLang: () => void;
  onToggleTheme: () => void;
  auth: AuthState;
  onOpenAuthModal: () => void;
  onSignOut: () => void;
}

export function Navbar({
  lang,
  theme,
  onToggleLang,
  onToggleTheme,
  auth,
  onOpenAuthModal,
  onSignOut,
}: NavbarProps) {
  const t = translations[lang];
  const isDark = theme === 'dark';

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header
      id="navbar-header"
      className="sticky top-0 z-40 w-full border-b border-slate-200/80 dark:border-slate-800/80 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md transition-colors duration-200"
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand */}
        <a
          href="#top"
          id="navbar-brand-link"
          className="flex items-center gap-2 transition-transform hover:scale-[1.01]"
        >
          <Logo isDark={isDark} />
        </a>

        {/* Center navigation links */}
        <nav id="navbar-nav-links" className="hidden lg:flex items-center gap-7 text-sm font-medium">
          <button
            id="nav-link-services"
            type="button"
            onClick={() => scrollTo('services')}
            className="text-slate-600 hover:text-cyan-500 dark:text-slate-300 dark:hover:text-cyan-400 transition-colors"
          >
            {t.nav.services}
          </button>
          <button
            id="nav-link-pricing"
            type="button"
            onClick={() => scrollTo('pricing')}
            className="text-slate-600 hover:text-cyan-500 dark:text-slate-300 dark:hover:text-cyan-400 transition-colors"
          >
            {t.nav.pricing}
          </button>
          <button
            id="nav-link-demo"
            type="button"
            onClick={() => scrollTo('demo')}
            className="text-slate-600 hover:text-cyan-500 dark:text-slate-300 dark:hover:text-cyan-400 transition-colors"
          >
            {t.nav.demo}
          </button>
        </nav>

        {/* Right Controls: Sign In, Language, Theme */}
        <div id="navbar-actions" className="flex items-center gap-2 sm:gap-2.5">
          {/* Sign In / Auth Button Styled Prominently */}
          {auth.isAuthenticated ? (
            <div className="flex items-center gap-2">
              <div
                id="user-badge"
                className="hidden sm:flex items-center gap-1.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 text-xs font-medium text-emerald-700 dark:text-emerald-400 backdrop-blur-sm"
              >
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
                <span className="max-w-[110px] truncate font-mono text-[11px]">
                  {auth.organizationName || auth.userEmail || t.nav.tokenStored}
                </span>
              </div>
              <button
                id="btn-sign-out"
                type="button"
                onClick={onSignOut}
                className="flex items-center gap-1.5 rounded-xl border border-rose-200 dark:border-rose-900/40 bg-rose-50 dark:bg-rose-950/30 px-3 py-1.5 text-xs font-semibold text-rose-700 dark:text-rose-300 hover:bg-rose-100 dark:hover:bg-rose-900/50 transition-all"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span>{t.nav.signOut}</span>
              </button>
            </div>
          ) : (
            <QuantumButton
              id="btn-navbar-signin"
              variant="primary"
              size="sm"
              onClick={onOpenAuthModal}
            >
              <LogIn className="h-3.5 w-3.5 text-cyan-300" />
              <span className="tracking-wide">
                {lang === 'ar' ? 'تسجيل الدخول' : 'Sign In'}
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-300 animate-pulse" />
            </QuantumButton>
          )}

          {/* Vertical subtle divider */}
          <div className="h-5 w-px bg-slate-200 dark:bg-slate-800 mx-0.5" />

          {/* Language Toggle */}
          <button
            id="btn-language-toggle"
            type="button"
            onClick={onToggleLang}
            title={lang === 'en' ? 'Switch to Arabic (العربية)' : 'التبديل إلى الإنجليزية (English)'}
            className="flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100/80 dark:bg-slate-900/80 px-2.5 py-1.5 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
          >
            <Globe className="h-3.5 w-3.5 text-cyan-500" />
            <span>{lang === 'en' ? 'العربية' : 'EN'}</span>
          </button>

          {/* Theme Toggle */}
          <button
            id="btn-theme-toggle"
            type="button"
            onClick={onToggleTheme}
            title={isDark ? 'Switch to Light mode' : 'Switch to Dark mode'}
            className="flex h-8 w-8 items-center justify-center rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100/80 dark:bg-slate-900/80 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
          >
            {isDark ? (
              <Sun className="h-4 w-4 text-amber-400" />
            ) : (
              <Moon className="h-4 w-4 text-indigo-600" />
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
