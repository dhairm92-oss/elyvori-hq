import { useState, useRef, useEffect } from 'react';
import {
  Sun, Moon, Globe, LogIn, LogOut, ShieldCheck,
  Briefcase, Scale, HeadphonesIcon, Menu, X,
  Handshake, ChevronDown, Sparkles, Zap
} from 'lucide-react';
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
  onOpenNegotiation: () => void;
}

export function Navbar({
  lang, theme, onToggleLang, onToggleTheme,
  auth, onOpenAuthModal, onSignOut,
  onOpenCareerAgent, onOpenContractAnalyzer,
  onOpenCustomerSupport, onOpenNegotiation,
}: NavbarProps) {
  const t = translations[lang];
  const isDark = theme === 'dark';
  const [mobileOpen, setMobileOpen] = useState(false);
  const [agentsOpen, setAgentsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setAgentsOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const scrollTo = (id: string) => {
    setMobileOpen(false);
    setAgentsOpen(false);
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  const agents = [
    {
      icon: Briefcase,
      labelEn: 'Career Agent',
      labelAr: 'وكيل التوظيف',
      descEn: 'Resume matching & cover letters',
      descAr: 'مطابقة السيرة ورسائل التغطية',
      color: 'from-indigo-500 to-blue-500',
      glow: 'rgba(99,102,241,0.4)',
      onClick: () => { setAgentsOpen(false); setMobileOpen(false); onOpenCareerAgent(); },
    },
    {
      icon: Scale,
      labelEn: 'Contract AI',
      labelAr: 'محلل العقود',
      descEn: 'Forensic contract risk analysis',
      descAr: 'تحليل مخاطر العقود',
      color: 'from-violet-500 to-purple-500',
      glow: 'rgba(139,92,246,0.4)',
      onClick: () => { setAgentsOpen(false); setMobileOpen(false); onOpenContractAnalyzer(); },
    },
    {
      icon: HeadphonesIcon,
      labelEn: 'Support AI',
      labelAr: 'دعم العملاء',
      descEn: 'Customer de-escalation & response',
      descAr: 'تهدئة العملاء وردود جاهزة',
      color: 'from-sky-500 to-cyan-500',
      glow: 'rgba(14,165,233,0.4)',
      onClick: () => { setAgentsOpen(false); setMobileOpen(false); onOpenCustomerSupport(); },
    },
    {
      icon: Handshake,
      labelEn: 'Negotiate AI',
      labelAr: 'محاكاة التفاوض',
      descEn: 'Real-time negotiation simulator',
      descAr: 'محاكاة التفاوض الذكي',
      color: 'from-rose-500 to-pink-500',
      glow: 'rgba(244,63,94,0.4)',
      onClick: () => { setAgentsOpen(false); setMobileOpen(false); onOpenNegotiation(); },
    },
  ];

  return (
    <>
      <style>{`
        @keyframes dropIn {
          from { opacity: 0; transform: translateY(-8px) scale(0.97); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        .dropdown-enter { animation: dropIn 0.18s ease forwards; }
        .agent-btn:hover .agent-glow { opacity: 1; }
      `}</style>

      <header className="sticky top-0 z-40 w-full border-b border-slate-200/60 dark:border-slate-800/60 bg-white/85 dark:bg-slate-950/85 backdrop-blur-xl transition-colors duration-200">
        <div className="mx-auto flex h-15 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8 py-2.5">

          {/* Brand */}
          <a href="#top" className="flex items-center gap-2 transition-transform hover:scale-[1.01] flex-shrink-0">
            <Logo isDark={isDark} />
          </a>

          {/* Desktop nav */}
          <nav className="hidden lg:flex items-center gap-1 text-sm font-medium">
            {[
              { label: t.nav.services, id: 'services' },
              { label: t.nav.pricing, id: 'pricing' },
              { label: t.nav.demo, id: 'demo' },
            ].map(link => (
              <button key={link.id} type="button" onClick={() => scrollTo(link.id)}
                className="px-3 py-1.5 rounded-lg text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-all text-sm">
                {link.label}
              </button>
            ))}

            {/* AI Agents Dropdown */}
            <div ref={dropdownRef} className="relative">
              <button
                type="button"
                onClick={() => setAgentsOpen(!agentsOpen)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold transition-all duration-200 ${
                  agentsOpen
                    ? 'bg-gradient-to-r from-indigo-500/15 to-violet-500/15 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60'
                }`}
              >
                <Sparkles className={`h-3.5 w-3.5 transition-colors ${agentsOpen ? 'text-indigo-500' : 'text-slate-400'}`} />
                <span>{lang === 'en' ? 'AI Agents' : 'الوكلاء الذكيون'}</span>
                <ChevronDown className={`h-3.5 w-3.5 transition-transform duration-200 ${agentsOpen ? 'rotate-180 text-indigo-500' : 'text-slate-400'}`} />
              </button>

              {/* Dropdown */}
              {agentsOpen && (
                <div className="dropdown-enter absolute top-full mt-2 left-0 w-72 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl shadow-2xl overflow-hidden"
                  style={{ boxShadow: '0 20px 60px rgba(0,0,0,0.3), 0 0 0 1px rgba(255,255,255,0.05)' }}>

                  {/* Header */}
                  <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800">
                    <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400">
                      {lang === 'en' ? '🤖 Specialized AI Agents' : '🤖 الوكلاء المتخصصون'}
                    </p>
                  </div>

                  {/* Agent buttons */}
                  <div className="p-2">
                    {agents.map((agent, i) => {
                      const Icon = agent.icon;
                      return (
                        <button key={i} type="button" onClick={agent.onClick}
                          className="agent-btn relative w-full flex items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-all hover:bg-slate-50 dark:hover:bg-slate-800/60 group">
                          {/* Glow effect */}
                          <div className="agent-glow absolute inset-0 rounded-xl opacity-0 transition-opacity duration-300 pointer-events-none"
                            style={{ background: `radial-gradient(ellipse at left, ${agent.glow} 0%, transparent 70%)` }} />

                          {/* Icon */}
                          <div className={`relative flex-shrink-0 h-9 w-9 rounded-xl bg-gradient-to-br ${agent.color} flex items-center justify-center shadow-lg transition-transform group-hover:scale-110`}
                            style={{ boxShadow: `0 4px 15px ${agent.glow}` }}>
                            <Icon className="h-4 w-4 text-white" />
                          </div>

                          {/* Label */}
                          <div className="relative">
                            <p className="text-sm font-semibold text-slate-800 dark:text-white group-hover:text-slate-900 dark:group-hover:text-white">
                              {lang === 'en' ? agent.labelEn : agent.labelAr}
                            </p>
                            <p className="text-[11px] text-slate-400 dark:text-slate-500">
                              {lang === 'en' ? agent.descEn : agent.descAr}
                            </p>
                          </div>

                          {/* Arrow */}
                          <div className="relative ml-auto opacity-0 group-hover:opacity-100 transition-opacity">
                            <span className="text-slate-300 text-xs">→</span>
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  {/* Footer */}
                  <div className="px-4 py-2.5 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
                    <p className="text-[10px] text-slate-400 text-center">
                      {lang === 'en' ? '✨ Powered by Gemini AI' : '✨ مدعوم بـ Gemini AI'}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </nav>

          {/* Right controls */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Auth - desktop */}
            {auth.isAuthenticated ? (
              <div className="hidden sm:flex items-center gap-2">
                <div className="flex items-center gap-1.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 text-xs font-medium text-emerald-700 dark:text-emerald-400">
                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
                  <span className="max-w-[80px] truncate font-mono text-[11px]">
                    {auth.organizationName || auth.userEmail || t.nav.tokenStored}
                  </span>
                </div>
                <button type="button" onClick={onSignOut}
                  className="flex items-center gap-1.5 rounded-xl border border-rose-200 dark:border-rose-900/40 bg-rose-50 dark:bg-rose-950/30 px-3 py-1.5 text-xs font-semibold text-rose-700 dark:text-rose-300 hover:bg-rose-100 transition-all">
                  <LogOut className="h-3.5 w-3.5" />
                  <span>{t.nav.signOut}</span>
                </button>
              </div>
            ) : (
              <div className="hidden sm:block">
                <QuantumButton id="btn-navbar-signin" variant="primary" size="sm" onClick={onOpenAuthModal}>
                  <LogIn className="h-3.5 w-3.5 text-cyan-300" />
                  <span>{lang === 'ar' ? 'تسجيل الدخول' : 'Sign In'}</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-300 animate-pulse" />
                </QuantumButton>
              </div>
            )}

            <div className="h-5 w-px bg-slate-200 dark:bg-slate-800 hidden sm:block" />

            {/* Language */}
            <button type="button" onClick={onToggleLang}
              className="flex items-center gap-1 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-100/80 dark:bg-slate-900/80 px-2 py-1.5 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors">
              <Globe className="h-3.5 w-3.5 text-cyan-500" />
              <span>{lang === 'en' ? 'ع' : 'EN'}</span>
            </button>

            {/* Theme */}
            <button type="button" onClick={onToggleTheme}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-100/80 dark:bg-slate-900/80 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors">
              {isDark ? <Sun className="h-3.5 w-3.5 text-amber-400" /> : <Moon className="h-3.5 w-3.5 text-indigo-600" />}
            </button>

            {/* Hamburger */}
            <button type="button" onClick={() => setMobileOpen(!mobileOpen)}
              className="lg:hidden flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-100/80 dark:bg-slate-900/80 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors">
              {mobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileOpen && (
          <div className="lg:hidden border-t border-slate-200/60 dark:border-slate-800/60 bg-white/95 dark:bg-slate-950/95 backdrop-blur-xl px-4 py-4">

            {/* Nav links */}
            <div className="flex flex-col gap-0.5 pb-3 border-b border-slate-100 dark:border-slate-800/60 mb-3">
              {[
                { label: t.nav.services, id: 'services' },
                { label: t.nav.pricing, id: 'pricing' },
                { label: t.nav.demo, id: 'demo' },
              ].map(link => (
                <button key={link.id} type="button" onClick={() => scrollTo(link.id)}
                  className="text-left px-3 py-2.5 rounded-xl text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors">
                  {link.label}
                </button>
              ))}
            </div>

            {/* AI Agents mobile */}
            <div className="mb-3">
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 px-3 mb-2">
                {lang === 'en' ? '🤖 AI Agents' : '🤖 الوكلاء الذكيون'}
              </p>
              <div className="grid grid-cols-2 gap-2">
                {agents.map((agent, i) => {
                  const Icon = agent.icon;
                  return (
                    <button key={i} type="button" onClick={agent.onClick}
                      className="flex items-center gap-2 rounded-xl px-3 py-2.5 border border-slate-200/60 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 text-left transition-all hover:border-slate-300 dark:hover:border-slate-700">
                      <div className={`h-7 w-7 rounded-lg bg-gradient-to-br ${agent.color} flex items-center justify-center flex-shrink-0`}
                        style={{ boxShadow: `0 3px 10px ${agent.glow}` }}>
                        <Icon className="h-3.5 w-3.5 text-white" />
                      </div>
                      <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">
                        {lang === 'en' ? agent.labelEn : agent.labelAr}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Auth mobile */}
            <div className="border-t border-slate-100 dark:border-slate-800/60 pt-3">
              {auth.isAuthenticated ? (
                <button type="button" onClick={() => { setMobileOpen(false); onSignOut(); }}
                  className="w-full flex items-center gap-2 rounded-xl border border-rose-200 dark:border-rose-900/40 bg-rose-50 dark:bg-rose-950/30 px-4 py-3 text-sm font-semibold text-rose-700 dark:text-rose-300">
                  <LogOut className="h-4 w-4" />
                  <span>{t.nav.signOut}</span>
                </button>
              ) : (
                <button type="button" onClick={() => { setMobileOpen(false); onOpenAuthModal(); }}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-500 px-4 py-3 text-sm font-semibold text-white shadow-lg">
                  <LogIn className="h-4 w-4" />
                  <span>{lang === 'ar' ? 'تسجيل الدخول' : 'Sign In'}</span>
                </button>
              )}
            </div>
          </div>
        )}
      </header>
    </>
  );
}
