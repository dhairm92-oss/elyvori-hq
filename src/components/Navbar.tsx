import { useState, useRef, useEffect } from 'react';
import {
  Sun, Moon, Globe, LogIn, LogOut, ShieldCheck,
  Briefcase, Scale, HeadphonesIcon, Menu, X,
  Handshake, ChevronDown, Sparkles, LayoutGrid, Activity, BarChart3
} from 'lucide-react';
import { Logo } from './Logo';
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
  onOpenKanban?: () => void;
  onOpenTracker?: () => void;
}

export function Navbar({
  lang, theme, onToggleLang, onToggleTheme,
  auth, onOpenAuthModal, onSignOut,
  onOpenCareerAgent, onOpenContractAnalyzer,
  onOpenCustomerSupport, onOpenNegotiation,
  onOpenKanban,
  onOpenTracker,
}: NavbarProps) {
  const t = translations[lang];
  const isDark = theme === 'dark';
  const isRtl = lang === 'ar';
  // ELYVORI-DEALS-NAV: deals board link for the Elyvori team only
  const OWNER_EMAILS = ['dhairm92@gmail.com'];
  const signedEmail = String(auth.userEmail || (() => { try { return localStorage.getItem('elyvori_user') || ''; } catch { return ''; } })()).toLowerCase();
  const isOwner = auth.isAuthenticated && OWNER_EMAILS.includes(signedEmail);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [agentsOpen, setAgentsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setAgentsOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const closeAll = () => { setAgentsOpen(false); setMobileOpen(false); };

  const agents = [
    // ELYVORI-ACCOUNT-NAV: customer plan / credits page
    ...(auth.isAuthenticated ? [{ icon: Sparkles, labelEn: 'My plan & credits', labelAr: 'حسابي وباقتي', descEn: 'Plan, credits, usage & wallet', descAr: 'الباقة والرصيد والاستهلاك والمحفظة', color: '#22c55e', action: () => { closeAll(); window.location.href = '/account.html'; } }] : []),
    { icon: Briefcase, labelEn: 'Career Agent', labelAr: 'وكيل التوظيف', descEn: 'Resume matching & cover letters', descAr: 'مطابقة السيرة ورسائل التغطية', color: '#6366f1', action: () => { closeAll(); onOpenCareerAgent(); } },
    { icon: Scale, labelEn: 'Contract AI', labelAr: 'محلل العقود', descEn: 'Forensic contract risk analysis', descAr: 'تحليل مخاطر العقود', color: '#8b5cf6', action: () => { closeAll(); onOpenContractAnalyzer(); } },
    { icon: HeadphonesIcon, labelEn: 'Support AI', labelAr: 'دعم العملاء', descEn: 'Customer de-escalation & response', descAr: 'تهدئة العملاء وردود جاهزة', color: '#0ea5e9', action: () => { closeAll(); onOpenCustomerSupport(); } },
    { icon: Handshake, labelEn: 'Negotiate AI', labelAr: 'محاكاة التفاوض', descEn: 'Real-time negotiation simulator', descAr: 'محاكاة التفاوض الذكي', color: '#f43f5e', action: () => { closeAll(); onOpenNegotiation(); } },
    ...(onOpenTracker ? [{ icon: Activity, labelEn: 'Track Project', labelAr: 'تتبع مشروعك', descEn: 'Live project progress tracker', descAr: 'تابع تقدم مشروعك لحظة بلحظة', color: '#00E5FF', action: () => { closeAll(); onOpenTracker?.(); } }] : []),
    ...(onOpenKanban && auth.isAuthenticated ? [{ icon: LayoutGrid, labelEn: 'Task Matrix', labelAr: 'لوحة المهام', descEn: 'Kanban board for projects', descAr: 'تتبع المهام والمشاريع', color: '#14b8a6', action: () => { closeAll(); onOpenKanban(); } }] : []),
  ];

  const scrollTo = (id: string) => {
    closeAll();
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <>
      <header
        dir={isRtl ? 'rtl' : 'ltr'}
        style={{ fontFamily: "'Cairo','Inter',sans-serif", position: 'sticky', top: 0, zIndex: 100 }}
        className="w-full border-b border-white/10 bg-slate-950/90 backdrop-blur-xl"
      >
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">

          {/* Brand */}
          <a href="#top" onClick={closeAll} className="flex items-center gap-2 flex-shrink-0">
            <Logo isDark={isDark} />
          </a>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-1">
            {[
              { label: t.nav.services, id: 'services' },
              { label: t.nav.pricing, id: 'pricing' },
              { label: t.nav.demo, id: 'demo' },
            ].map(link => (
              <button
                key={link.id}
                type="button"
                onClick={() => scrollTo(link.id)}
                className="px-3 py-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-all text-sm"
              >
                {link.label}
              </button>
            ))}

            {/* AI Agents Dropdown */}
            <div ref={dropdownRef} style={{ position: 'relative' }}>
              <button
                type="button"
                onClick={() => setAgentsOpen(v => !v)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold text-slate-300 hover:text-white hover:bg-white/5 transition-all"
              >
                <Sparkles className="h-3.5 w-3.5 text-cyan-400" />
                <span>{lang === 'en' ? 'AI Agents' : 'الوكلاء الذكيون'}</span>
                <ChevronDown className={`h-3.5 w-3.5 transition-transform ${agentsOpen ? 'rotate-180' : ''}`} />
              </button>

              {agentsOpen && (
                <div
                  style={{ position: 'absolute', top: '100%', left: isRtl ? 'auto' : 0, right: isRtl ? 0 : 'auto', marginTop: 8, width: 280, zIndex: 200 }}
                  className="rounded-2xl border border-white/10 bg-slate-900/98 backdrop-blur-xl shadow-2xl overflow-hidden"
                >
                  <div className="px-4 py-2.5 border-b border-white/5">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-300">
                      {lang === 'en' ? '✨ Specialized AI Agents' : '✨ الوكلاء المتخصصون'}
                    </p>
                  </div>
                  <div className="p-2">
                    {agents.map((agent, i) => {
                      const Icon = agent.icon;
                      return (
                        <button
                          key={i}
                          type="button"
                          onClick={agent.action}
                          className="w-full flex items-center gap-3 rounded-xl px-3 py-2.5 text-start hover:bg-white/5 transition-all group"
                        >
                          <div className="flex-shrink-0 h-9 w-9 rounded-xl flex items-center justify-center"
                            style={{ background: agent.color + '22', border: `1px solid ${agent.color}44` }}>
                            <Icon className="h-4 w-4" style={{ color: agent.color }} />
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-white">
                              {lang === 'en' ? agent.labelEn : agent.labelAr}
                            </p>
                            <p className="text-[11px] text-slate-500 dark:text-slate-300">
                              {lang === 'en' ? agent.descEn : agent.descAr}
                            </p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </nav>

          {/* Right Controls */}
          <div className="flex items-center gap-2" style={{ position: 'relative', zIndex: 200 }}>

            {/* Auth */}
            {auth.isAuthenticated ? (
              <div className="hidden sm:flex items-center gap-2">
                {isOwner && (
                  <a
                    href="/deals.html"
                    className="flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold text-black transition-all hover:opacity-90"
                    style={{ background: 'linear-gradient(135deg, #22c55e, #00E5FF)' }}
                  >
                    <BarChart3 className="h-3.5 w-3.5" />
                    <span>{lang === 'ar' ? 'الصفقات' : 'Deals'}</span>
                  </a>
                )}
                <div className="flex items-center gap-1.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 text-xs font-medium text-emerald-400">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  <span className="max-w-[80px] truncate text-[11px]">
                    {auth.organizationName || auth.userEmail || 'Active'}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={onSignOut}
                  className="flex items-center gap-1.5 rounded-xl border border-rose-900/40 bg-rose-950/30 px-3 py-1.5 text-xs font-semibold text-rose-300 hover:bg-rose-900/40 transition-all"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  <span>{t.nav.signOut}</span>
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={onOpenAuthModal}
                className="hidden sm:flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold text-black transition-all"
                style={{ background: 'linear-gradient(135deg, #00E5FF, #7C3AED)' }}
              >
                <LogIn className="h-3.5 w-3.5" />
                <span>{lang === 'ar' ? 'تسجيل الدخول' : 'Sign In'}</span>
              </button>
            )}

            {/* Language Toggle */}
            <button
              type="button"
              onClick={onToggleLang}
              className="flex items-center gap-1 rounded-lg border border-white/10 bg-white/5 px-2.5 py-1.5 text-xs font-bold text-slate-200 hover:bg-white/10 transition-all"
            >
              <Globe className="h-3.5 w-3.5 text-cyan-400" />
              <span>{lang === 'en' ? 'ع' : 'EN'}</span>
            </button>

            {/* Theme Toggle */}
            <button aria-label="Toggle day / night mode" title="Day / Night"
              type="button"
              onClick={onToggleTheme}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-slate-200 hover:bg-white/10 transition-all"
            >
              {isDark ? <Sun className="h-3.5 w-3.5 text-amber-400" /> : <Moon className="h-3.5 w-3.5 text-indigo-400" />}
            </button>

            {/* Hamburger */}
            <button aria-label="Menu" title="Menu"
              type="button"
              onClick={() => setMobileOpen(v => !v)}
              className="lg:hidden flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-slate-200 hover:bg-white/10 transition-all"
            >
              {mobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileOpen && (
          <div className="lg:hidden border-t border-white/10 bg-slate-950/98 px-4 py-4">
            <div className="flex flex-col gap-1 mb-4">
              {[
                { label: t.nav.services, id: 'services' },
                { label: t.nav.pricing, id: 'pricing' },
                { label: t.nav.demo, id: 'demo' },
              ].map(link => (
                <button key={link.id} type="button" onClick={() => scrollTo(link.id)}
                  className="px-3 py-2 rounded-lg text-slate-300 hover:text-white hover:bg-white/5 transition-all text-sm text-start">
                  {link.label}
                </button>
              ))}
            </div>

            <div className="border-t border-white/5 pt-4">
              <p className="text-[10px] uppercase tracking-widest text-slate-600 dark:text-slate-400 mb-2 px-3">
                {lang === 'en' ? 'AI Agents' : 'الوكلاء الذكيون'}
              </p>
              {agents.map((agent, i) => {
                const Icon = agent.icon;
                return (
                  <button key={i} type="button" onClick={agent.action}
                    className="w-full flex items-center gap-3 rounded-xl px-3 py-2.5 hover:bg-white/5 transition-all">
                    <Icon className="h-4 w-4" style={{ color: agent.color }} />
                    <span className="text-sm font-medium text-slate-300">
                      {lang === 'en' ? agent.labelEn : agent.labelAr}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="border-t border-white/5 pt-4 mt-4 flex flex-col gap-2">
              {isOwner && (
                <a href="/deals.html" onClick={closeAll}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-bold text-black transition-all"
                  style={{ background: 'linear-gradient(135deg, #22c55e, #00E5FF)' }}>
                  <BarChart3 className="h-4 w-4" />
                  <span>{lang === 'ar' ? '📊 لوحة الصفقات' : '📊 Deals board'}</span>
                </a>
              )}
              {auth.isAuthenticated ? (
                <button type="button" onClick={() => { closeAll(); onSignOut(); }}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-rose-300 hover:bg-rose-950/30 transition-all">
                  <LogOut className="h-4 w-4" />
                  <span>{t.nav.signOut}</span>
                </button>
              ) : (
                <button type="button" onClick={() => { closeAll(); onOpenAuthModal(); }}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-bold text-black transition-all"
                  style={{ background: 'linear-gradient(135deg, #00E5FF, #7C3AED)' }}>
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
