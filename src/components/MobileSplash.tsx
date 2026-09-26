import { useEffect, useState, useRef } from 'react';
import { Language } from '../types';

interface MobileSplashProps {
  onComplete: () => void;
  lang: Language;
}

type SplashStage = 'intro' | 'auth';
type AuthMode = 'welcome' | 'signin' | 'signup';

const API_BASE = 'https://elyvori-api.onrender.com';

export function MobileSplash({ onComplete, lang }: MobileSplashProps) {
  const [stage, setStage] = useState<SplashStage>('intro');
  const [progress, setProgress] = useState(0);
  const [phase, setPhase] = useState(0);
  const [authMode, setAuthMode] = useState<AuthMode>('welcome');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);

  const t = {
    tagline: lang === 'en' ? 'Intelligent Systems · Real Business Growth' : 'أنظمة ذكية · نمو أعمال حقيقي',
    welcome: lang === 'en' ? 'Welcome to Elyvori' : 'أهلاً بك في إليفوري',
    sub: lang === 'en' ? 'Your AI-powered business platform' : 'منصتك الذكية لإدارة الأعمال',
    signIn: lang === 'en' ? 'Sign In' : 'تسجيل الدخول',
    signUp: lang === 'en' ? 'Get Started Free' : 'ابدأ مجاناً',
    guest: lang === 'en' ? 'Continue as Guest →' : 'متابعة كزائر →',
    email: lang === 'en' ? 'Email Address' : 'البريد الإلكتروني',
    password: lang === 'en' ? 'Password' : 'كلمة المرور',
    fullName: lang === 'en' ? 'Full Name' : 'الاسم الكامل',
    back: lang === 'en' ? 'Back' : 'رجوع',
    noAccount: lang === 'en' ? "New here?" : 'جديد هنا؟',
    hasAccount: lang === 'en' ? 'Have an account?' : 'لديك حساب؟',
    loading: lang === 'en' ? 'INITIALIZING' : 'جاري التهيئة',
  };

  // Particle canvas animation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles: { x: number; y: number; vx: number; vy: number; size: number; opacity: number; hue: number }[] = [];
    for (let i = 0; i < 60; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        size: Math.random() * 2 + 0.5,
        opacity: Math.random() * 0.4 + 0.1,
        hue: Math.random() * 60 + 240,
      });
    }

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${p.hue}, 80%, 70%, ${p.opacity})`;
        ctx.fill();
      });

      // Draw connections
      particles.forEach((p1, i) => {
        particles.slice(i + 1).forEach(p2 => {
          const dx = p1.x - p2.x;
          const dy = p1.y - p2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 80) {
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = `hsla(260, 80%, 70%, ${0.08 * (1 - dist / 80)})`;
            ctx.stroke();
          }
        });
      });

      animRef.current = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(animRef.current);
  }, []);

  // Splash sequence
  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];
    timers.push(setTimeout(() => setPhase(1), 200));
    timers.push(setTimeout(() => setPhase(2), 700));
    timers.push(setTimeout(() => setPhase(3), 1200));
    timers.push(setTimeout(() => setPhase(4), 1700));

    let p = 0;
    const interval = setInterval(() => {
      p += 1.8;
      setProgress(Math.min(p, 100));
      if (p >= 100) clearInterval(interval);
    }, 30);

    timers.push(setTimeout(() => setStage('auth'), 3200));
    return () => { timers.forEach(clearTimeout); clearInterval(interval); };
  }, []);

  const handleAuth = async (mode: 'signin' | 'signup') => {
    if (!email || !password || (mode === 'signup' && !name)) {
      setError(lang === 'en' ? 'Please fill all fields.' : 'الرجاء ملء جميع الحقول.');
      return;
    }
    setLoading(true); setError('');
    try {
      const res = await fetch(`${API_BASE}/auth/${mode === 'signin' ? 'login' : 'signup'}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(mode === 'signin' ? { email, password } : { email, password, name }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed');
      localStorage.setItem('elyvori_token', data.token || data.access_token || 'guest');
      localStorage.setItem('elyvori_user', email);
      localStorage.setItem('elyvori_mobile_auth', 'true');
      onComplete();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] bg-[#030309] overflow-hidden">
      {/* Particle canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />

      {/* Gradient overlays */}
      <div className="absolute inset-0 bg-gradient-to-b from-indigo-950/30 via-transparent to-violet-950/40 pointer-events-none" />

      {/* Center glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(99,102,241,0.25) 0%, rgba(139,92,246,0.1) 50%, transparent 70%)', filter: 'blur(20px)' }} />

      {stage === 'intro' && (
        <div className="absolute inset-0 flex flex-col items-center justify-center px-8">

          {/* 3D Logo container */}
          <div className={`relative mb-8 transition-all duration-700 ${phase >= 1 ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-8 scale-90'}`}
            style={{ perspective: '800px' }}>

            {/* Outer glow rings */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-44 h-44 rounded-full border border-indigo-500/20 animate-spin" style={{ animationDuration: '8s' }} />
              <div className="absolute w-36 h-36 rounded-full border border-violet-500/15 animate-spin" style={{ animationDuration: '6s', animationDirection: 'reverse' }} />
            </div>

            {/* Main logo */}
            <div className="relative w-32 h-32 flex items-center justify-center"
              style={{ transform: 'rotateX(15deg) rotateY(-10deg)', transformStyle: 'preserve-3d' }}>

              {/* Shadow layer */}
              <div className="absolute inset-2 rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-700 blur-xl opacity-70"
                style={{ transform: 'translateZ(-20px)' }} />

              {/* Main face */}
              <div className="relative w-28 h-28 rounded-3xl flex items-center justify-center"
                style={{
                  background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 50%, #6d28d9 100%)',
                  boxShadow: '0 0 0 1px rgba(255,255,255,0.1) inset, 0 25px 60px rgba(99,102,241,0.5), 0 0 100px rgba(139,92,246,0.3)',
                  transform: 'translateZ(0px)',
                }}>

                {/* Top shine */}
                <div className="absolute top-0 left-0 right-0 h-1/2 rounded-t-3xl bg-gradient-to-b from-white/15 to-transparent" />

                {/* Logo SVG */}
                <svg viewBox="0 0 60 60" className="w-16 h-16 relative z-10" fill="none">
                  <polygon points="30,6 52,46 8,46" fill="none" stroke="rgba(255,255,255,0.9)" strokeWidth="2.5" strokeLinejoin="round"/>
                  <polygon points="30,18 44,46 16,46" fill="rgba(255,255,255,0.12)"/>
                  <line x1="30" y1="6" x2="30" y2="46" stroke="rgba(255,255,255,0.15)" strokeWidth="1"/>
                  <circle cx="30" cy="36" r="5" fill="white" opacity="0.95"/>
                  <circle cx="30" cy="36" r="8" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="1"/>
                </svg>
              </div>
            </div>
          </div>

          {/* Brand name */}
          <div className={`text-center mb-2 transition-all duration-700 ${phase >= 2 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
            <h1 className="text-5xl font-black tracking-[0.2em] text-white"
              style={{ textShadow: '0 0 30px rgba(139,92,246,0.9), 0 0 60px rgba(99,102,241,0.5), 0 0 100px rgba(79,70,229,0.3)' }}>
              ELYVORI
            </h1>
          </div>

          {/* Tagline */}
          <div className={`text-center mb-12 transition-all duration-700 ${phase >= 3 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <p className="text-slate-400 text-xs tracking-[0.15em] uppercase">{t.tagline}</p>
          </div>

          {/* Loading bar */}
          <div className={`w-full max-w-xs transition-all duration-700 ${phase >= 4 ? 'opacity-100' : 'opacity-0'}`}>
            <div className="relative h-[2px] w-full bg-slate-800 rounded-full overflow-visible mb-3">
              <div className="absolute top-0 left-0 h-full rounded-full transition-all duration-75"
                style={{
                  width: `${progress}%`,
                  background: 'linear-gradient(90deg, #6366f1, #8b5cf6, #a78bfa, #c4b5fd)',
                  boxShadow: '0 0 12px 2px rgba(139,92,246,0.8), 0 0 24px 4px rgba(99,102,241,0.5)',
                }} />
              {/* Traveling glow dot */}
              <div className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full -translate-x-1/2 transition-all duration-75"
                style={{
                  left: `${progress}%`,
                  background: 'white',
                  boxShadow: '0 0 8px 3px rgba(255,255,255,0.8), 0 0 20px 6px rgba(139,92,246,0.9)',
                  opacity: progress > 0 && progress < 100 ? 1 : 0,
                }} />
            </div>
            <p className="text-center text-[10px] tracking-[0.3em] text-slate-600 uppercase font-mono">
              {t.loading} {Math.round(progress)}%
            </p>
          </div>
        </div>
      )}

      {stage === 'auth' && (
        <div className="absolute inset-0 flex flex-col overflow-y-auto">

          {/* Mini header */}
          <div className="flex-shrink-0 flex items-center justify-center pt-10 pb-6">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, #4f46e5, #7c3aed)', boxShadow: '0 0 20px rgba(99,102,241,0.5)' }}>
                <svg viewBox="0 0 60 60" className="w-5 h-5" fill="none">
                  <polygon points="30,6 52,46 8,46" fill="none" stroke="white" strokeWidth="3" strokeLinejoin="round"/>
                  <circle cx="30" cy="36" r="5" fill="white"/>
                </svg>
              </div>
              <span className="text-xl font-black tracking-[0.15em] text-white"
                style={{ textShadow: '0 0 20px rgba(139,92,246,0.6)' }}>
                ELYVORI
              </span>
            </div>
          </div>

          <div className="flex-1 flex flex-col px-6 pb-8">

            {authMode === 'welcome' && (
              <div className="flex flex-col flex-1 justify-center gap-4">
                <div className="text-center mb-6">
                  <h2 className="text-2xl font-extrabold text-white mb-2">{t.welcome}</h2>
                  <p className="text-slate-400 text-sm">{t.sub}</p>
                </div>

                {/* Feature pills */}
                <div className="flex flex-wrap justify-center gap-2 mb-4">
                  {['🤖 AI Agents', '⚖️ Contract AI', '🎯 Support AI'].map(f => (
                    <span key={f} className="text-[11px] px-3 py-1 rounded-full border border-slate-700 bg-slate-900/60 text-slate-400">{f}</span>
                  ))}
                </div>

                <button onClick={() => setAuthMode('signup')}
                  className="w-full rounded-2xl py-4 text-sm font-bold text-white transition-all active:scale-95"
                  style={{ background: 'linear-gradient(135deg, #4f46e5, #7c3aed)', boxShadow: '0 8px 30px rgba(99,102,241,0.45), 0 0 0 1px rgba(255,255,255,0.08) inset' }}>
                  {t.signUp}
                </button>

                <button onClick={() => setAuthMode('signin')}
                  className="w-full rounded-2xl border border-slate-700 bg-slate-900/80 py-4 text-sm font-bold text-white transition-all active:scale-95"
                  style={{ boxShadow: '0 0 0 1px rgba(255,255,255,0.04) inset' }}>
                  {t.signIn}
                </button>

                <button onClick={onComplete} className="w-full py-3 text-xs text-slate-500 hover:text-slate-300 transition-colors">
                  {t.guest}
                </button>
              </div>
            )}

            {(authMode === 'signin' || authMode === 'signup') && (
              <div className="flex flex-col gap-4 pt-2">
                <h2 className="text-xl font-extrabold text-white text-center mb-1">
                  {authMode === 'signin' ? t.signIn : t.signUp}
                </h2>

                {authMode === 'signup' && (
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 mb-1.5 uppercase tracking-wider">{t.fullName}</label>
                    <input type="text" value={name} onChange={e => setName(e.target.value)}
                      placeholder="Mohammed Al-Ahmad"
                      className="w-full rounded-2xl border border-slate-800 bg-slate-900/90 px-4 py-4 text-sm text-white placeholder:text-slate-700 focus:border-indigo-500 focus:outline-none transition-colors"
                      style={{ boxShadow: '0 0 0 1px rgba(255,255,255,0.03) inset' }} />
                  </div>
                )}

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 mb-1.5 uppercase tracking-wider">{t.email}</label>
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                    placeholder="you@company.com"
                    className="w-full rounded-2xl border border-slate-800 bg-slate-900/90 px-4 py-4 text-sm text-white placeholder:text-slate-700 focus:border-indigo-500 focus:outline-none transition-colors"
                    style={{ boxShadow: '0 0 0 1px rgba(255,255,255,0.03) inset' }} />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 mb-1.5 uppercase tracking-wider">{t.password}</label>
                  <input type="password" value={password} onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full rounded-2xl border border-slate-800 bg-slate-900/90 px-4 py-4 text-sm text-white placeholder:text-slate-700 focus:border-indigo-500 focus:outline-none transition-colors"
                    style={{ boxShadow: '0 0 0 1px rgba(255,255,255,0.03) inset' }} />
                </div>

                {error && (
                  <div className="rounded-xl bg-red-500/10 border border-red-500/20 px-4 py-2.5 text-xs text-red-400">{error}</div>
                )}

                <button
                  onClick={() => handleAuth(authMode)}
                  disabled={loading}
                  className="w-full rounded-2xl py-4 text-sm font-bold text-white transition-all active:scale-95 disabled:opacity-60 mt-1"
                  style={{ background: 'linear-gradient(135deg, #4f46e5, #7c3aed)', boxShadow: '0 8px 30px rgba(99,102,241,0.4), 0 0 0 1px rgba(255,255,255,0.08) inset' }}>
                  {loading ? '...' : authMode === 'signin' ? t.signIn : t.signUp}
                </button>

                <div className="text-center space-y-2 pt-1">
                  <p className="text-xs text-slate-600">
                    {authMode === 'signin' ? t.noAccount : t.hasAccount}{' '}
                    <button onClick={() => { setError(''); setAuthMode(authMode === 'signin' ? 'signup' : 'signin'); }}
                      className="text-indigo-400 font-semibold">
                      {authMode === 'signin' ? t.signUp : t.signIn}
                    </button>
                  </p>
                  <button onClick={() => setAuthMode('welcome')} className="text-xs text-slate-700 hover:text-slate-500">← {t.back}</button>
                  <br/>
                  <button onClick={onComplete} className="text-xs text-slate-700 hover:text-slate-500">{t.guest}</button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
