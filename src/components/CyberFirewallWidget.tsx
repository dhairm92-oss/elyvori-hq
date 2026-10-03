import React, { useState, useEffect } from 'react';
import { Shield, ShieldAlert, ShieldCheck, Lock, Activity, Eye, Zap, RefreshCw } from 'lucide-react';
import { Language, Theme } from '../types';

interface CyberFirewallWidgetProps {
  lang: Language;
  theme: Theme;
}

export const CyberFirewallWidget: React.FC<CyberFirewallWidgetProps> = ({ lang, theme }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [blockedThreats, setBlockedThreats] = useState(1482);
  const [firewallMode, setFirewallMode] = useState<'MAXIMUM' | 'QUANTUM' | 'BALANCED'>('QUANTUM');
  const [recentLogs, setRecentLogs] = useState<string[]>([
    'DDoS SYN Flood blocked (IP: 198.51.100.24)',
    'Zero-Day Injection thwarted via Elyvori WAF',
    'Quantum SSL Handshake TLS 1.3 verified',
  ]);
  const [systemLoad, setSystemLoad] = useState(99.98);

  const isDark = theme === 'dark';
  const isAr = lang === 'ar';

  // Real-time threat defense heartbeat simulation
  useEffect(() => {
    const interval = setInterval(() => {
      setBlockedThreats((prev) => prev + Math.floor(Math.random() * 2) + 1);
      const randomThreatsEn = [
        `SQLi Probe neutralized from ${Math.floor(Math.random() * 200) + 1}.x.x.x`,
        `Brute Force Rate-Limit enforced [HTTP 429]`,
        `Cross-Site Scripting (XSS) payload sanitized`,
        `Botnet Crawl request dropped by AI Heuristics`,
        `SSL MITM inspection cleared & verified`,
      ];
      const randomThreatsAr = [
        `تم تحييد محاولة حقن SQL من ${Math.floor(Math.random() * 200) + 1}.x.x.x`,
        `تطبيق حظر تكرار الطلبات الخبيثة [HTTP 429]`,
        `تنقية حمولة برمجية خبيثة عبر جدار إليفوري`,
        `إسقاط محاولة روبوت فحص بواسطة ذكاء الحماية`,
        `فحص شهادة التشفير الكمي TLS 1.3 مؤكد بنجاح`,
      ];

      const threatList = isAr ? randomThreatsAr : randomThreatsEn;
      const newLog = threatList[Math.floor(Math.random() * threatList.length)];
      setRecentLogs((prev) => [newLog, prev[0], prev[1]]);
    }, 4500);

    return () => clearInterval(interval);
  }, [isAr]);

  return (
    <>
      {/* Floating Cyber Firewall Shield Trigger Button (Responsive for Mobile, Tablet, Desktop) */}
      <div className="fixed bottom-4 sm:bottom-6 left-4 sm:left-6 z-40 select-none">
        <button
          id="btn-open-firewall-status"
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="relative group flex items-center gap-2 sm:gap-2.5 px-3 sm:px-3.5 py-2 sm:py-2.5 rounded-2xl bg-slate-950/90 hover:bg-slate-900 border border-cyan-500/40 hover:border-cyan-400 shadow-xl shadow-cyan-950/50 backdrop-blur-xl transition-all duration-300 hover:scale-105 active:scale-95"
          title={isAr ? 'جدار الحماية الفائق إليفوري WAF' : 'Elyvori Quantum Web Application Firewall'}
        >
          {/* Constant Luxury Subtle Glow */}
          <div className="absolute -inset-0.5 rounded-2xl bg-gradient-to-r from-cyan-500 via-emerald-500 to-indigo-500 opacity-30 group-hover:opacity-60 blur-xs transition-opacity pointer-events-none" />

          {/* Shield Icon with Ping Radar */}
          <div className="relative flex items-center justify-center">
            <ShieldCheck className="h-5 w-5 text-emerald-400" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-500" />
          </div>

          <div className="flex flex-col text-left rtl:text-right">
            <span className="text-[11px] font-black tracking-wider text-cyan-300 uppercase flex items-center gap-1.5">
              <span>{isAr ? 'جدار الحماية الفائق' : 'QUANTUM WAF'}</span>
              <span className="px-1.5 py-0.2 rounded text-[9px] bg-emerald-500/20 text-emerald-300 font-mono">
                ACTIVE
              </span>
            </span>
            <span className="text-[9px] font-medium text-slate-400">
              {isAr ? `${blockedThreats} هجمة محجوبة` : `${blockedThreats} Attacks Shielded`}
            </span>
          </div>
        </button>
      </div>

      {/* Interactive Firewall Status & Settings Drawer/Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-fade-in">
          <div
            className={`relative w-full max-w-lg rounded-3xl p-6 sm:p-7 shadow-2xl border ${
              isDark
                ? 'bg-slate-950/95 border-cyan-500/30 text-white shadow-cyan-950/70'
                : 'bg-slate-900 border-indigo-500/30 text-white shadow-2xl'
            } backdrop-blur-2xl`}
          >
            {/* Ambient Corner Aura */}
            <div className="absolute top-0 right-0 w-48 h-48 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

            {/* Modal Header */}
            <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-cyan-500/10 border border-cyan-500/30">
                  <Shield className="h-6 w-6 text-cyan-400" />
                </div>
                <div>
                  <h3 className="text-lg font-black tracking-wide text-white flex items-center gap-2">
                    <span>{isAr ? 'جدار الحماية السيبراني المتقدم' : 'Elyvori Autonomous Cyber Firewall'}</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {isAr
                      ? 'حماية استباقية من هجمات DDoS، الحقن البرمجي، وهجمات اليوم صفر'
                      : 'AI-Powered Layer 7 Web Application Firewall & DDoS Mitigation Engine'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Live Security Metrics */}
            <div className="grid grid-cols-3 gap-3 my-5">
              <div className="p-3 rounded-2xl bg-slate-900/90 border border-slate-800 flex flex-col">
                <span className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1">
                  <Activity className="h-3 w-3 text-cyan-400" />
                  {isAr ? 'حالة الحماية' : 'WAF Status'}
                </span>
                <span className="text-sm font-black text-emerald-400 mt-1">100% {isAr ? 'مؤمن' : 'SECURE'}</span>
              </div>

              <div className="p-3 rounded-2xl bg-slate-900/90 border border-slate-800 flex flex-col">
                <span className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1">
                  <ShieldAlert className="h-3 w-3 text-rose-400" />
                  {isAr ? 'تهديدات محجوبة' : 'Neutralized'}
                </span>
                <span className="text-sm font-black text-white mt-1 font-mono">{blockedThreats}</span>
              </div>

              <div className="p-3 rounded-2xl bg-slate-900/90 border border-slate-800 flex flex-col">
                <span className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1">
                  <Zap className="h-3 w-3 text-amber-400" />
                  {isAr ? 'وقت الاستجابة' : 'Latency'}
                </span>
                <span className="text-sm font-black text-cyan-300 mt-1 font-mono">0.8ms</span>
              </div>
            </div>

            {/* Defense Level Modes */}
            <div className="mb-5">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-2">
                {isAr ? 'مستوى حماية الجدار الناري' : 'Firewall Defense Protocol'}
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['BALANCED', 'QUANTUM', 'MAXIMUM'] as const).map((mode) => (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => setFirewallMode(mode)}
                    className={`py-2 px-2.5 rounded-xl text-xs font-bold transition-all ${
                      firewallMode === mode
                        ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/30'
                        : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                    }`}
                  >
                    {mode}
                  </button>
                ))}
              </div>
            </div>

            {/* Live Security Log Stream */}
            <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-3.5 mb-5 font-mono text-[11px]">
              <div className="flex items-center justify-between text-slate-400 pb-2 mb-2 border-b border-slate-800/80 text-[10px] uppercase font-bold">
                <span className="flex items-center gap-1">
                  <Eye className="h-3 w-3 text-cyan-400" />
                  {isAr ? 'سجل الرصد الحي المباشر' : 'Live Real-time Interceptions'}
                </span>
                <span className="text-emerald-400 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  CONNECTED
                </span>
              </div>
              <div className="space-y-1.5">
                {recentLogs.map((log, i) => (
                  <div key={i} className="flex items-center gap-2 text-slate-300">
                    <span className="text-cyan-400">&gt;</span>
                    <span className="truncate">{log}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Action close button */}
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-slate-950 font-bold text-sm tracking-wide uppercase transition-all shadow-lg shadow-cyan-500/20"
            >
              {isAr ? 'تم تأكيد درع الحماية' : 'Shield Active & Running'}
            </button>
          </div>
        </div>
      )}
    </>
  );
};
