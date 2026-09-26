import { useState } from 'react';
import { Sun, Moon, Globe, LogIn, LogOut, ShieldCheck, Briefcase, Scale, HeadphonesIcon, Menu, X } from 'lucide-react';
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
  onOpenCareerAgent: () => void;
  onOpenContractAnalyzer: () => void;
  onOpenCustomerSupport: () => void;
}

export function Navbar({
  lang,
  theme,
  onToggleLang,
  onToggleTheme,
  auth,
  onOpenAuthModal,
  onSignOut,
  onOpenCareerAgent,
  onOpenContractAnalyzer,
  onOpenCustomerSupport,
}: NavbarProps) {
  const t = translations[lang];
  const isDark = theme === 'dark';
  const [mobileOpen, setMobileOpen] = useState(false);

  const scrollTo = (id: string) => {
    setMobileOpen(false);
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  const agentLinks = [
    {
      id: 'career-agent',
      label: lang === 'en' ? 'Career Agent' : 'وكيل التوظيف',
      icon: Briefcase,
      color: 'text-indigo-400 border-indigo-500/20 bg-indigo-500/10 hover:bg-indigo-500/20',
      onClick: () => { setMobileOpen(false); onOpenCareerAgent(); },
    },
    {
      id: 'contract-analyzer',
      label: lang === 'en' ? 'Contract AI' : 'محلل العقود',
      icon: Scale,
      color: 'text-violet-400 border-violet-500/20 bg-violet-500/10 hover:bg-violet-500/20',
      onClick: () => { setMobileOpen(false); onOpenContractAnalyzer(); },
    },
    {
      id: 'customer-support',
      label: lang === 'en' ? 'Support AI' : 'دعم العملاء',
      icon: HeadphonesIcon,
      color: 'text-sky-400 border-sky-500/20 bg-sky-500/10 hover:bg-sky-500/20',
      onClick: () => { setMobileOpen(false); onOpenCustomerSupport(); },
    },
  ];

  return (
    <header
      id="navbar-header"
      className="sticky top-0 z-40 w-full border-b border-slate-200/80 dark:border-slate-800/80 bg-white/90 dark:bg-slate-950/90 backdrop-blur-md transition-colors duration-200"
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">

        {/* Brand */}
        <a href="#top" id="navbar-brand-link" className="flex items-center gap-2 transition-transform hover:scale-[1.01] flex-shrink-0">
          <Logo isDark={isDark} />
        </a>

        {/* Desktop nav */}
        <nav id="navbar-nav-links" className="hidden lg:flex items-center gap-6 text-sm font-medium">
          <button type="button" onClick={() => scrollTo('services')} className="text-slate-600 hover:text-cyan-500 dark:text-slate-300 dark:hover:text-cyan-400 transition-colors">
            {t.nav.services}
          </button>
          <button type="button" onClick={() => scrollTo('pricing')} className="text-slate-600 hover:text-cyan-500 dark:text-slate-300 dark:hover:text-cyan-400 transition-colors">
            {t.nav.pricing}
          </button>
          <button type="button" onClick={() => scrollTo('demo')} className="text-slate-600 hover:text-cyan-500 dark:text-slate-300 dark:hover:text-cyan-400 transition-colors">
            {t.nav.demo}
          </button>
          {agentLinks.map(link => {
            const Icon = link.icon;
            return (
              <button key={link.id} type="button" onClick={link.onClick}
                className={`flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold transition-colors ${link.color}`}>
                <Icon className="h-3.5 w-3.5" />
                <span>{link.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Right controls */}
        <div id="navbar-actions" className="flex items-center gap-2">
          {/* Auth */}
          {auth.isAuthenticated ? (
            <div className="hidden sm:flex items-center gap-2">
              <div className="flex items-center gap-1.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 text-xs font-medium text-emerald-700 dark:text-emerald-400">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
                <span className="max-w-[90px] truncate font-mono text-[11px]">
                  {auth.organizationName || auth.userEmail || t.nav.tokenStored}
                </span>
              </div>
              <button type="button" onClick={onSignOut}
                className="flex items-center gap-1.5 rounded-xl border border-rose-200 dark:border-rose-900/40 bg-rose-50 dark:bg-rose-950/30 px-3 py-1.5 text-xs font-semibold text-rose-700 dark:text-rose-300 hover:bg-rose-100 transition-all">
                <LogOut className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">{t.nav.signOut}</span>
              </button>
            </div>
          ) : (
            <div className="hidden sm:block">
              <QuantumButton id="btn-navbar-signin" variant="primary" size="sm" onClick={onOpenAuthModal}>
                <LogIn className="h-3.5 w-3.5 text-cyan-300" />
                <span className="tracking-wide">{lang === 'ar' ? 'تسجيل الدخول' : 'Sign In'}</span>
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-300 animate-pulse" />
              </QuantumButton>
            </div>
          )}

          <div className="h-5 w-px bg-slate-200 dark:bg-slate-800 mx-0.5 hidden sm:block" />

          {/* Language */}
          <button type="button" onClick={onToggleLang}
            className="flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100/80 dark:bg-slate-900/80 px-2.5 py-1.5 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors">
            <Globe className="h-3.5 w-3.5 text-cyan-500" />
            <span>{lang === 'en' ? 'العربية' : 'EN'}</span>
          </button>

          {/* Theme */}
          <button type="button" onClick={onToggleTheme}
            className="flex h-8 w-8 items-center justify-center rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100/80 dark:bg-slate-900/80 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors">
            {isDark ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4 text-indigo-600" />}
          </button>

          {/* Hamburger — mobile/tablet only */}
          <button
            type="button"
            onClick={() => setMobileOpen(!mobileOpen)}
            className="lg:hidden flex h-8 w-8 items-center justify-center rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100/80 dark:bg-slate-900/80 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
          >
            {mobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="lg:hidden border-t border-slate-200/80 dark:border-slate-800/80 bg-white/95 dark:bg-slate-950/95 backdrop-blur-md px-4 py-4 space-y-2">
          {/* Nav links */}
          <div className="flex flex-col gap-1 pb-3 border-b border-slate-200/60 dark:border-slate-800/60">
            {[
              { label: t.nav.services, id: 'services' },
              { label: t.nav.pricing, id: 'pricing' },
              { label: t.nav.demo, id: 'demo' },
            ].map(link => (
              <button key={link.id} type="button" onClick={() => scrollTo(link.id)}
                className="text-left px-3 py-2.5 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-colors">
                {link.label}
              </button>
            ))}
          </div>

          {/* AI Agents */}
          <div className="flex flex-col gap-2 pb-3 border-b border-slate-200/60 dark:border-slate-800/60">
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 px-3 pt-1">
              {lang === 'en' ? 'AI Agents' : 'الوكلاء الذكيون'}
            </p>
            {agentLinks.map(link => {
              const Icon = link.icon;
              return (
                <button key={link.id} type="button" onClick={link.onClick}
                  className={`flex items-center gap-2.5 rounded-xl border px-4 py-2.5 text-sm font-semibold transition-colors ${link.color}`}>
                  <Icon className="h-4 w-4" />
                  <span>{link.label}</span>
                </button>
              );
            })}
          </div>

          {/* Auth */}
          <div className="pt-1">
            {auth.isAuthenticated ? (
              <button type="button" onClick={() => { setMobileOpen(false); onSignOut(); }}
                className="w-full flex items-center gap-2 rounded-xl border border-rose-200 dark:border-rose-900/40 bg-rose-50 dark:bg-rose-950/30 px-4 py-2.5 text-sm font-semibold text-rose-700 dark:text-rose-300 transition-all">
                <LogOut className="h-4 w-4" />
                <span>{t.nav.signOut}</span>
              </button>
            ) : (
              <button type="button" onClick={() => { setMobileOpen(false); onOpenAuthModal(); }}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-500 px-4 py-2.5 text-sm font-semibold text-white shadow-lg transition-all hover:opacity-90">
                <LogIn className="h-4 w-4" />
                <span>{lang === 'ar' ? 'تسجيل الدخول' : 'Sign In'}</span>
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
