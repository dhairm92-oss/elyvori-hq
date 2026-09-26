import { useEffect, useState } from 'react';
import { Language } from '../types';

interface MobileSplashProps {
  onComplete: () => void;
  lang: Language;
}

type SplashStage = 'logo' | 'auth';
type AuthMode = 'welcome' | 'signin' | 'signup';

const API_BASE = 'https://elyvori-api.onrender.com';

export function MobileSplash({ onComplete, lang }: MobileSplashProps) {
  const [stage, setStage] = useState<SplashStage>('logo');
  const [progress, setProgress] = useState(0);
  const [authMode, setAuthMode] = useState<AuthMode>('welcome');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [logoVisible, setLogoVisible] = useState(false);
  const [textVisible, setTextVisible] = useState(false);
  const [taglineVisible, setTaglineVisible] = useState(false);

  const t = {
    tagline: lang === 'en' ? 'Intelligent Systems for Real Business Growth' : 'أنظمة ذكية لنمو أعمال حقيقي',
    welcome: lang === 'en' ? 'Welcome to Elyvori' : 'أهلاً بك في إليفوري',
    welcomeSub: lang === 'en'
      ? 'Your AI-powered business platform'
      : 'منصتك الذكية لإدارة الأعمال',
    signIn: lang === 'en' ? 'Sign In' : 'تسجيل الدخول',
    signUp: lang === 'en' ? 'Create Account' : 'إنشاء حساب',
    continueGuest: lang === 'en' ? 'Continue as Guest' : 'متابعة كزائر',
    email: lang === 'en' ? 'Email Address' : 'البريد الإلكتروني',
    password: lang === 'en' ? 'Password' : 'كلمة المرور',
    fullName: lang === 'en' ? 'Full Name' : 'الاسم الكامل',
    back: lang === 'en' ? 'Back' : 'رجوع',
    noAccount: lang === 'en' ? "Don't have an account?" : 'ليس لديك حساب؟',
    hasAccount: lang === 'en' ? 'Already have an account?' : 'لديك حساب بالفعل؟',
    or: lang === 'en' ? 'or' : 'أو',
  };

  // Splash animation sequence
  useEffect(() => {
    const t1 = setTimeout(() => setLogoVisible(true), 300);
    const t2 = setTimeout(() => setTextVisible(true), 800);
    const t3 = setTimeout(() => setTaglineVisible(true), 1300);

    // Progress bar
    let p = 0;
    const interval = setInterval(() => {
      p += 2;
      setProgress(p);
      if (p >= 100) clearInterval(interval);
    }, 35);

    const t4 = setTimeout(() => setStage('auth'), 2800);

    return () => {
      clearTimeout(t1); clearTimeout(t2);
      clearTimeout(t3); clearTimeout(t4);
      clearInterval(interval);
    };
  }, []);

  const handleSignIn = async () => {
    if (!email || !password) { setError(lang === 'en' ? 'Please fill all fields.' : 'الرجاء ملء جميع الحقول.'); return; }
    setLoading(true); setError('');
    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Sign in failed');
      localStorage.setItem('elyvori_token', data.token || data.access_token);
      localStorage.setItem('elyvori_user', email);
      localStorage.setItem('elyvori_mobile_auth', 'true');
      onComplete();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async () => {
    if (!email || !password || !name) { setError(lang === 'en' ? 'Please fill all fields.' : 'الرجاء ملء جميع الحقول.'); return; }
    setLoading(true); setError('');
    try {
      const res = await fetch(`${API_BASE}/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Sign up failed');
      localStorage.setItem('elyvori_token', data.token || data.access_token);
      localStorage.setItem('elyvori_user', email);
      localStorage.setItem('elyvori_mobile_auth', 'true');
      onComplete();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  if (stage === 'logo') {
    return (
      <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-slate-950 overflow-hidden">
        {/* Animated background rings */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="h-[500px] w-[500px] rounded-full border border-indigo-500/5 animate-ping" style={{ animationDuration: '3s' }} />
          <div className="absolute h-[350px] w-[350px] rounded-full border border-violet-500/10 animate-ping" style={{ animationDuration: '2.5s', animationDelay: '0.5s' }} />
          <div className="absolute h-[200px] w-[200px] rounded-full border border-cyan-500/15 animate-ping" style={{ animationDuration: '2s', animationDelay: '1s' }} />
        </div>

        {/* Glow blob */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-64 w-64 rounded-full bg-indigo-600/20 blur-[80px] pointer-events-none" />

        {/* Logo */}
        <div className={`relative flex flex-col items-center transition-all duration-700 ${logoVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-75'}`}>
          {/* Logo mark */}
          <div className="relative mb-6">
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 blur-xl opacity-60" />
            <div className="relative h-24 w-24 rounded-2xl bg-gradient-to-br from-indigo-500 via-violet-600 to-purple-600 flex items-center justify-center shadow-2xl"
              style={{ boxShadow: '0 0 60px rgba(99,102,241,0.5), 0 0 120px rgba(139,92,246,0.3)' }}>
              <svg viewBox="0 0 48 48" className="h-12 w-12" fill="none">
                <polygon points="24,4 44,36 4,36" fill="none" stroke="white" strokeWidth="3" strokeLinejoin="round" opacity="0.9"/>
                <polygon points="24,14 36,36 12,36" fill="white" opacity="0.15"/>
                <circle cx="24" cy="28" r="4" fill="white" opacity="0.9"/>
              </svg>
            </div>
          </div>

          {/* Brand name */}
          <div className={`transition-all duration-700 delay-300 ${textVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <h1 className="text-5xl font-black tracking-[0.15em] text-white mb-2"
              style={{ textShadow: '0 0 40px rgba(139,92,246,0.8), 0 0 80px rgba(99,102,241,0.4)' }}>
              ELYVORI
            </h1>
          </div>

          {/* Tagline */}
          <div className={`transition-all duration-700 delay-500 ${taglineVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <p className="text-slate-400 text-sm tracking-wider text-center px-8">{t.tagline}</p>
          </div>
        </div>

        {/* Progress bar */}
        <div className="absolute bottom-16 left-8 right-8">
          <div className="h-0.5 w-full bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-75"
              style={{
                width: `${progress}%`,
                background: 'linear-gradient(90deg, #6366f1, #8b5cf6, #a78bfa)',
                boxShadow: '0 0 12px rgba(139,92,246,0.8)',
              }}
            />
          </div>
          <p className="text-center text-[11px] text-slate-600 mt-3 tracking-widest uppercase">
            {lang === 'en' ? 'Loading...' : 'جاري التحميل...'}
          </p>
        </div>
      </div>
    );
  }

  // Auth stage
  return (
    <div className="fixed inset-0 z-[9999] flex flex-col bg-slate-950 overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 h-64 w-64 rounded-full bg-indigo-600/15 blur-[100px] pointer-events-none" />

      {/* Header */}
      <div className="flex items-center justify-center pt-10 pb-6 flex-shrink-0">
        <div className="flex flex-col items-center gap-2">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg"
            style={{ boxShadow: '0 0 20px rgba(99,102,241,0.4)' }}>
            <svg viewBox="0 0 48 48" className="h-6 w-6" fill="none">
              <polygon points="24,4 44,36 4,36" fill="none" stroke="white" strokeWidth="3" strokeLinejoin="round" opacity="0.9"/>
              <circle cx="24" cy="28" r="4" fill="white" opacity="0.9"/>
            </svg>
          </div>
          <span className="text-lg font-black tracking-[0.15em] text-white">ELYVORI</span>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col px-6 overflow-y-auto">

        {authMode === 'welcome' && (
          <div className="flex flex-col flex-1 justify-center gap-4">
            <div className="text-center mb-4">
              <h2 className="text-2xl font-extrabold text-white mb-2">{t.welcome}</h2>
              <p className="text-slate-400 text-sm">{t.welcomeSub}</p>
            </div>

            {/* Sign Up (primary) */}
            <button
              onClick={() => setAuthMode('signup')}
              className="w-full rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 py-4 text-sm font-bold text-white shadow-xl transition-all active:scale-95"
              style={{ boxShadow: '0 8px 30px rgba(99,102,241,0.4)' }}
            >
              {t.signUp}
            </button>

            {/* Sign In */}
            <button
              onClick={() => setAuthMode('signin')}
              className="w-full rounded-2xl border border-slate-700 bg-slate-900 py-4 text-sm font-bold text-white transition-all active:scale-95"
            >
              {t.signIn}
            </button>

            {/* Guest */}
            <button
              onClick={onComplete}
              className="w-full py-3 text-xs font-medium text-slate-500 hover:text-slate-300 transition-colors"
            >
              {t.continueGuest}
            </button>
          </div>
        )}

        {(authMode === 'signin' || authMode === 'signup') && (
          <div className="flex flex-col gap-4 pt-2">
            <div className="text-center mb-2">
              <h2 className="text-xl font-extrabold text-white">
                {authMode === 'signin' ? t.signIn : t.signUp}
              </h2>
            </div>

            {authMode === 'signup' && (
              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase tracking-wider">{t.fullName}</label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Mohammed Al-Ahmad"
                  className="w-full rounded-2xl border border-slate-700 bg-slate-900 px-4 py-4 text-sm text-white placeholder:text-slate-600 focus:border-indigo-500 focus:outline-none transition-colors"
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase tracking-wider">{t.email}</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@company.com"
                className="w-full rounded-2xl border border-slate-700 bg-slate-900 px-4 py-4 text-sm text-white placeholder:text-slate-600 focus:border-indigo-500 focus:outline-none transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase tracking-wider">{t.password}</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-2xl border border-slate-700 bg-slate-900 px-4 py-4 text-sm text-white placeholder:text-slate-600 focus:border-indigo-500 focus:outline-none transition-colors"
              />
            </div>

            {error && (
              <div className="rounded-xl bg-red-500/10 border border-red-500/20 px-4 py-2.5 text-xs text-red-400">{error}</div>
            )}

            <button
              onClick={authMode === 'signin' ? handleSignIn : handleSignUp}
              disabled={loading}
              className="w-full rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 py-4 text-sm font-bold text-white shadow-xl transition-all active:scale-95 disabled:opacity-60 mt-2"
              style={{ boxShadow: '0 8px 30px rgba(99,102,241,0.35)' }}
            >
              {loading ? '...' : authMode === 'signin' ? t.signIn : t.signUp}
            </button>

            <div className="text-center space-y-2">
              <p className="text-xs text-slate-500">
                {authMode === 'signin' ? t.noAccount : t.hasAccount}{' '}
                <button
                  onClick={() => { setError(''); setAuthMode(authMode === 'signin' ? 'signup' : 'signin'); }}
                  className="text-indigo-400 font-semibold"
                >
                  {authMode === 'signin' ? t.signUp : t.signIn}
                </button>
              </p>
              <button onClick={() => setAuthMode('welcome')} className="text-xs text-slate-600 hover:text-slate-400">
                ← {t.back}
              </button>
              <button onClick={onComplete} className="block w-full text-xs text-slate-600 pt-1">
                {t.continueGuest}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Bottom safe area */}
      <div className="h-8 flex-shrink-0" />
    </div>
  );
}
