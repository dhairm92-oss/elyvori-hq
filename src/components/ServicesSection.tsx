import { useState } from 'react';
import {
  Package, Layout, Users, Megaphone, CheckCircle2,
  FileText, Table, GraduationCap, Server, Database,
  Smartphone, Globe2, TrendingUp, Sparkles, ArrowUpRight,
  Search, Briefcase, Scale, HeadphonesIcon, Handshake, Zap
} from 'lucide-react';
import { Language } from '../types';
import { translations } from '../translations';

interface ServicesSectionProps {
  lang: Language;
  onRequestDemo: () => void;
}

export function ServicesSection({ lang, onRequestDemo }: ServicesSectionProps) {
  const t = translations[lang];
  const [activeTab, setActiveTab] = useState<string>('digital-products');
  const isRtl = lang === 'ar';

  const icons: Record<string, any> = {
    Package, Layout, Users, Megaphone, FileText,
    Search, Briefcase, Scale, HeadphonesIcon, Handshake,
  };

  const totalServices = t.services.items.length;

  const accentColors = [
    { border: 'rgba(0,229,255,0.3)', glow: 'rgba(0,229,255,0.08)', icon: '#00E5FF', badge: 'rgba(0,229,255,0.1)' },
    { border: 'rgba(124,58,237,0.3)', glow: 'rgba(124,58,237,0.08)', icon: '#7C3AED', badge: 'rgba(124,58,237,0.1)' },
    { border: 'rgba(16,185,129,0.3)', glow: 'rgba(16,185,129,0.08)', icon: '#10b981', badge: 'rgba(16,185,129,0.1)' },
    { border: 'rgba(213,0,249,0.3)', glow: 'rgba(213,0,249,0.08)', icon: '#D500F9', badge: 'rgba(213,0,249,0.1)' },
    { border: 'rgba(245,158,11,0.3)', glow: 'rgba(245,158,11,0.08)', icon: '#f59e0b', badge: 'rgba(245,158,11,0.1)' },
    { border: 'rgba(59,130,246,0.3)', glow: 'rgba(59,130,246,0.08)', icon: '#3b82f6', badge: 'rgba(59,130,246,0.1)' },
    { border: 'rgba(239,68,68,0.3)', glow: 'rgba(239,68,68,0.08)', icon: '#ef4444', badge: 'rgba(239,68,68,0.1)' },
    { border: 'rgba(99,102,241,0.3)', glow: 'rgba(99,102,241,0.08)', icon: '#6366f1', badge: 'rgba(99,102,241,0.1)' },
    { border: 'rgba(20,184,166,0.3)', glow: 'rgba(20,184,166,0.08)', icon: '#14b8a6', badge: 'rgba(20,184,166,0.1)' },
    { border: 'rgba(255,165,0,0.3)', glow: 'rgba(255,165,0,0.08)', icon: '#FFA500', badge: 'rgba(255,165,0,0.1)' },
  ];

  return (
    <section
      id="services"
      dir={isRtl ? 'rtl' : 'ltr'}
      style={{ colorScheme: 'dark', fontFamily: "'Cairo','Inter',sans-serif" }}
      className="relative py-16 sm:py-24 bg-transparent"
    >
      {/* Background */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full opacity-10"
          style={{ background: 'radial-gradient(ellipse, rgba(124,58,237,0.3) 0%, transparent 70%)' }} />
        <div className="absolute inset-0 opacity-[0.02]"
          style={{ backgroundImage: 'linear-gradient(rgba(0,229,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(0,229,255,1) 1px, transparent 1px)', backgroundSize: '60px 60px' }} />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#00E5FF]/20 bg-[#00E5FF]/5 px-4 py-1.5 text-xs font-semibold text-[#00E5FF] mb-4">
            <Sparkles className="h-3.5 w-3.5" />
            <span>{t.services.sectionBadge}</span>
          </div>
          <h2 id="services-title" className="text-3xl sm:text-4xl font-extrabold text-white"
            style={{ textShadow: '0 0 40px rgba(0,229,255,0.15)' }}>
            {t.services.sectionTitle}
          </h2>
          <p id="services-subtitle" className="mt-3 text-base text-slate-400 leading-relaxed">
            {t.services.sectionSubtitle}
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 lg:gap-6">
          {t.services.items.map((srv, idx) => {
            const IconComponent = icons[srv.iconName];
            const isSelected = activeTab === srv.id;
            const accent = accentColors[idx % accentColors.length];

            return (
              <div
                key={srv.id}
                id={`service-card-${srv.id}`}
                onClick={() => setActiveTab(srv.id)}
                className="group relative flex flex-col justify-between rounded-2xl p-6 sm:p-7 transition-all duration-300 cursor-pointer"
                style={{
                  background: isSelected
                    ? `linear-gradient(135deg, rgba(15,17,26,0.95), rgba(15,17,26,0.8))`
                    : 'rgba(15,17,26,0.6)',
                  border: `1px solid ${isSelected ? accent.border : 'rgba(255,255,255,0.06)'}`,
                  boxShadow: isSelected ? `0 0 40px ${accent.glow}, 0 0 0 1px ${accent.border}` : 'none',
                  backdropFilter: 'blur(12px)', position: 'relative', zIndex: 1,
                }}
              >
                {/* Top accent line when selected */}
                {isSelected && (
                  <div className="absolute top-0 left-8 right-8 h-px"
                    style={{ background: `linear-gradient(90deg, transparent, ${accent.icon}, transparent)` }} />
                )}

                <div>
                  {/* Icon + Badge + Index */}
                  <div className="flex items-center justify-between gap-3 mb-5">
                    <div className="flex items-center gap-3">
                      <div className="flex h-11 w-11 items-center justify-center rounded-xl transition-transform group-hover:scale-110"
                        style={{ background: accent.badge, border: `1px solid ${accent.border}`, boxShadow: `0 0 20px ${accent.glow}` }}>
                        {IconComponent && <IconComponent className="h-5 w-5" style={{ color: accent.icon }} />}
                      </div>
                      <div>
                        <span className="inline-block rounded-lg px-2.5 py-0.5 text-xs font-semibold text-white"
                          style={{ background: accent.badge, border: `1px solid ${accent.border}` }}>
                          {srv.badge}
                        </span>
                        <div className="text-[10px] text-slate-600 font-mono mt-0.5">
                          {String(idx + 1).padStart(2, '0')} / {String(totalServices).padStart(2, '0')}
                        </div>
                      </div>
                    </div>
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-full border"
                      style={{ color: '#10b981', borderColor: 'rgba(16,185,129,0.2)', background: 'rgba(16,185,129,0.08)' }}>
                      {srv.metrics}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="text-xl sm:text-2xl font-bold text-white mb-2 transition-colors"
                    style={{ color: isSelected ? accent.icon : 'white' }}>
                    {srv.title}
                  </h3>

                  <p className="text-sm font-medium text-slate-300 leading-relaxed mb-2">{srv.shortDesc}</p>
                  <p className="text-xs text-slate-500 leading-relaxed">{srv.fullDesc}</p>

                  {/* Deliverables */}
                  <div className="mt-5 border-t pt-4" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
                    <h4 className="text-[10px] font-bold uppercase tracking-widest mb-3"
                      style={{ color: accent.icon }}>
                      {lang === 'en' ? 'Core Deliverables' : 'المخرجات الأساسية'}
                    </h4>
                    <ul className="space-y-2">
                      {srv.deliverables.map((item, itemIdx) => (
                        <li key={itemIdx} className="flex items-start gap-2.5 text-xs text-slate-400">
                          <CheckCircle2 className="h-3.5 w-3.5 flex-shrink-0 mt-0.5" style={{ color: accent.icon }} />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* CTA */}
        <div className="mt-12 flex justify-center">
          <button onClick={onRequestDemo}
            className="flex items-center gap-2 rounded-xl px-6 py-3.5 text-sm font-bold text-white transition-all"
            style={{
              background: 'linear-gradient(135deg, #00E5FF, #7C3AED)',
              boxShadow: '0 0 30px rgba(0,229,255,0.2)',
            }}>
            <Zap className="h-4 w-4" />
            <span>{lang === 'en' ? 'Request a walkthrough for your organization' : 'اطلب عرضاً تجريبياً لمنظمتك'}</span>
            <ArrowUpRight className={`h-4 w-4 ${isRtl ? 'rotate-[-90deg]' : ''}`} />
          </button>
        </div>
      </div>
    </section>
  );
}

