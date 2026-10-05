import { useEffect, useRef, useState, FormEvent } from 'react';
import { Language, Theme, AuthState } from '../types';

interface LoginGateModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
  theme: Theme;
  auth: AuthState;
  onSuccessAuth: (token: string, email: string, orgName?: string) => void;
}

const API = 'https://elyvori-api.onrender.com';

const TXT = {
  en: {
    title: 'Welcome to Elyvori',
    subtitleIn: 'Sign in to build websites, analyze contracts and more.',
    subtitleUp: 'Create your free account — up to 3 websites free.',
    tabIn: 'Sign in',
    tabUp: 'Create account',
    google: 'Continue with Google',
    github: 'Continue with GitHub',
    or: 'or with email',
    company: 'Business / company name',
    companyPh: 'e.g. Alsharq Restaurant',
    email: 'Email',
    emailPh: 'you@example.com',
    password: 'Password',
    passwordPh: 'At least 6 characters',
    show: 'Show password',
    hide: 'Hide password',
    submitIn: 'Sign in',
    submitUp: 'Create my account',
    working: 'Please wait…',
    waking: 'Waking up the server — a few more seconds…',
    doneIn: 'Signed in ✅',
    doneUp: 'Account created ✅',
    signedInAs: 'You are signed in as',
    continue: 'Continue',
    switchToIn: 'Already have an account? Sign in',
    switchToUp: "Don't have an account? Create one",
    close: 'Close',
    terms: 'By continuing you agree to our terms and privacy policy.',
    err: {
      wrong: 'Wrong email or password. Check them and try again.',
      exists: 'An account with this email already exists — sign in instead.',
      short: 'The password must be at least 6 characters.',
      missing: 'Please fill in all the fields.',
      network: "We couldn't reach the server. Check your internet and try again.",
      many: 'Too many attempts. Wait a minute and try again.',
      generic: 'Something went wrong. Please try again.',
      oauth_not_configured: 'This sign-in option is not available yet — please use email.',
      oauth_cancelled: 'Sign-in was cancelled.',
      oauth_failed: "We couldn't sign you in with that account. Please try again or use email.",
    },
  },
  ar: {
    title: 'أهلاً بك في إليفوري',
    subtitleIn: 'سجّل دخولك عشان تبني مواقع، تحلّل عقود، وأكثر.',
    subtitleUp: 'أنشئ حسابك المجاني — لحد ٣ مواقع مجاناً.',
    tabIn: 'تسجيل الدخول',
    tabUp: 'حساب جديد',
    google: 'المتابعة باستخدام Google',
    github: 'المتابعة باستخدام GitHub',
    or: 'أو بالإيميل',
    company: 'اسم النشاط / الشركة',
    companyPh: 'مثلاً: مطعم الشرق',
    email: 'الإيميل',
    emailPh: 'you@example.com',
    password: 'كلمة السر',
    passwordPh: '٦ أحرف على الأقل',
    show: 'إظهار كلمة السر',
    hide: 'إخفاء كلمة السر',
    submitIn: 'تسجيل الدخول',
    submitUp: 'إنشاء حسابي',
    working: 'لحظة…',
    waking: 'السيرفر بيصحى — ثواني كمان…',
    doneIn: 'تم تسجيل الدخول ✅',
    doneUp: 'تم إنشاء حسابك ✅',
    signedInAs: 'أنت مسجّل دخول بـ',
    continue: 'متابعة',
    switchToIn: 'عندك حساب؟ سجّل دخول',
    switchToUp: 'ما عندك حساب؟ أنشئ واحد',
    close: 'إغلاق',
    terms: 'بالمتابعة أنت موافق على الشروط وسياسة الخصوصية.',
    err: {
      wrong: 'الإيميل أو كلمة السر غلط. تأكد منهم وجرّب مرة ثانية.',
      exists: 'في حساب بهالإيميل — سجّل دخول بدل ما تنشئ حساب جديد.',
      short: 'كلمة السر لازم تكون ٦ أحرف على الأقل.',
      missing: 'عبّي كل الخانات لو سمحت.',
      network: 'ما قدرنا نوصل للسيرفر. تأكد من الإنترنت وجرّب مرة ثانية.',
      many: 'محاولات كثير. استنى دقيقة وجرّب مرة ثانية.',
      generic: 'صار خطأ. جرّب مرة ثانية.',
      oauth_not_configured: 'هالطريقة لسا مش متاحة — استعمل الإيميل لو سمحت.',
      oauth_cancelled: 'تم إلغاء تسجيل الدخول.',
      oauth_failed: 'ما قدرنا ندخلك بهالحساب. جرّب مرة ثانية أو استعمل الإيميل.',
    },
  },
};

type ErrKey = keyof typeof TXT.en.err;

function oauthErrorKey(code: string | null): ErrKey | null {
  if (!code) return null;
  if (code.endsWith('not_configured')) return 'oauth_not_configured';
  if (code === 'cancelled') return 'oauth_cancelled';
  return 'oauth_failed';
}

/* ---------- icons ---------- */
const sv = {
  width: 18, height: 18, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor',
  strokeWidth: 2, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const, 'aria-hidden': true,
};
const MailI = () => (<svg {...sv}><rect x="3" y="5" width="18" height="14" rx="3" /><path d="m4 7 8 6 8-6" /></svg>);
const LockI = () => (<svg {...sv}><rect x="4" y="10" width="16" height="11" rx="3" /><path d="M8 10V7a4 4 0 0 1 8 0v3" /></svg>);
const BuildingI = () => (<svg {...sv}><rect x="4" y="3" width="16" height="18" rx="2" /><path d="M9 7h2M13 7h2M9 11h2M13 11h2M10 21v-4h4v4" /></svg>);
const EyeI = ({ off }: { off?: boolean }) => (
  <svg {...sv}>
    <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z" />
    <circle cx="12" cy="12" r="3" />
    {off && <path d="M3 3l18 18" />}
  </svg>
);
// ELYVORI-BRAND-ICONS: the official multi-colour Google "G" and the GitHub mark
const GoogleLogo = () => (
  <svg width="20" height="20" viewBox="0 0 48 48" aria-hidden="true">
    <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z" />
    <path fill="#FF3D00" d="m6.3 14.7 6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
    <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-7.9l-6.5 5C9.5 39.6 16.2 44 24 44z" />
    <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C36.9 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z" />
  </svg>
);
const GitHubLogo = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M12 .5C5.65.5.5 5.65.5 12a11.5 11.5 0 0 0 7.86 10.92c.58.1.79-.25.79-.56v-1.97c-3.2.7-3.87-1.54-3.87-1.54-.52-1.33-1.28-1.69-1.28-1.69-1.04-.71.08-.7.08-.7 1.15.08 1.76 1.19 1.76 1.19 1.03 1.76 2.69 1.25 3.35.96.1-.75.4-1.25.73-1.54-2.55-.29-5.24-1.28-5.24-5.68 0-1.26.45-2.28 1.19-3.09-.12-.29-.52-1.46.11-3.04 0 0 .97-.31 3.17 1.18a11 11 0 0 1 5.77 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.58.23 2.75.11 3.04.74.81 1.19 1.83 1.19 3.09 0 4.41-2.69 5.38-5.26 5.67.41.36.78 1.06.78 2.14v3.17c0 .31.21.67.8.56A11.5 11.5 0 0 0 23.5 12C23.5 5.65 18.35.5 12 .5z" />
  </svg>
);
const CloseI = () => (<svg {...sv}><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>);
const CheckI = () => (<svg {...sv} strokeWidth={2.6}><path d="M20 6 9 17l-5-5" /></svg>);
const AlertI = () => (<svg {...sv}><circle cx="12" cy="12" r="9" /><path d="M12 8v5M12 16h.01" /></svg>);

const CSS = `
@keyframes elgIn{from{opacity:0}to{opacity:1}}
@keyframes elgUp{from{opacity:0;transform:translateY(24px) scale(.98)}to{opacity:1;transform:none}}
@keyframes elgSheet{from{transform:translateY(100%)}to{transform:none}}
@keyframes elgSpin{to{transform:rotate(360deg)}}
.elg-overlay{
  --g-bg:#0B1020;--g-card:rgba(10,14,30,.98);--g-text:#F1F5F9;--g-muted:#94A3B8;--g-border:rgba(255,255,255,.09);
  --g-field:rgba(255,255,255,.04);--g-field-focus:rgba(0,229,255,.55);--g-tab:rgba(255,255,255,.05);--g-tab-on:rgba(255,255,255,.1);
  --g-social:rgba(255,255,255,.05);--g-social-hover:rgba(255,255,255,.09);
  position:fixed;inset:0;z-index:10050;display:flex;align-items:center;justify-content:center;padding:16px;
  background:rgba(2,6,23,.72);backdrop-filter:blur(10px);-webkit-backdrop-filter:blur(10px);animation:elgIn .2s ease both;font-family:inherit}
html.light .elg-overlay{
  --g-card:#FFFFFF;--g-text:#0F172A;--g-muted:#64748B;--g-border:rgba(15,23,42,.09);--g-field:#F8FAFC;
  --g-tab:#F1F5F9;--g-tab-on:#FFFFFF;--g-social:#FFFFFF;--g-social-hover:#F8FAFC;background:rgba(15,23,42,.45)}
.elg-card{position:relative;width:100%;max-width:440px;max-height:calc(100dvh - 32px);overflow-y:auto;overscroll-behavior:contain;
  background:var(--g-card);color:var(--g-text);border:1px solid var(--g-border);border-radius:24px;padding:28px 26px 22px;
  box-shadow:0 30px 80px -20px rgba(0,0,0,.55),0 0 0 1px rgba(0,229,255,.05);animation:elgUp .3s cubic-bezier(.22,1,.36,1) both}
html.light .elg-card{box-shadow:0 30px 80px -24px rgba(15,23,42,.35)}
.elg-accent{position:absolute;inset:0 0 auto 0;height:3px;border-radius:24px 24px 0 0;background:linear-gradient(90deg,#00E5FF,#7C3AED,#D500F9)}
.elg-close{position:absolute;top:14px;inset-inline-end:14px;width:36px;height:36px;border-radius:12px;border:1px solid var(--g-border);
  background:var(--g-tab);color:var(--g-muted);display:grid;place-items:center;cursor:pointer;padding:0}
.elg-close:hover{color:var(--g-text)}
.elg-head{text-align:center;margin-bottom:20px}
.elg-mark{width:52px;height:52px;margin:0 auto 12px;border-radius:16px;display:grid;place-items:center;font-weight:900;font-size:20px;color:#020617;
  background:linear-gradient(135deg,#00E5FF,#7C3AED);box-shadow:0 10px 30px -8px rgba(0,229,255,.55);font-family:Inter,system-ui,sans-serif}
.elg-title{font-size:21px;font-weight:800;margin:0 0 6px;color:var(--g-text)}
.elg-sub{font-size:13.5px;color:var(--g-muted);margin:0;line-height:1.6}
.elg-tabs{display:grid;grid-template-columns:1fr 1fr;gap:4px;padding:4px;border-radius:14px;background:var(--g-tab);border:1px solid var(--g-border);margin-bottom:18px}
.elg-tab{border:0;border-radius:10px;padding:10px 8px;font:inherit;font-size:14px;font-weight:700;cursor:pointer;background:transparent;color:var(--g-muted);transition:all .2s}
.elg-tab.on{background:var(--g-tab-on);color:var(--g-text);box-shadow:0 2px 10px rgba(0,0,0,.12)}
.elg-social{display:grid;gap:10px}
.elg-sbtn{display:flex;align-items:center;justify-content:center;gap:10px;width:100%;min-height:48px;border-radius:14px;border:1px solid var(--g-border);
  background:var(--g-social);color:var(--g-text);font:inherit;font-size:14.5px;font-weight:700;cursor:pointer;transition:background .2s,transform .15s}
.elg-sbtn:hover{background:var(--g-social-hover);transform:translateY(-1px)}
.elg-sbtn:disabled{opacity:.6;cursor:wait;transform:none}
.elg-badge{width:24px;height:24px;border-radius:7px;display:grid;place-items:center;font-size:13px;font-weight:900;font-family:Inter,system-ui,sans-serif;flex-shrink:0}
.elg-badge.g{background:transparent}
.elg-badge.gh{background:transparent;color:var(--g-text)}
.elg-or{display:flex;align-items:center;gap:12px;margin:18px 0;color:var(--g-muted);font-size:12.5px}
.elg-or::before,.elg-or::after{content:"";flex:1;height:1px;background:var(--g-border)}
.elg-form{display:grid;gap:14px}
.elg-label{display:block;font-size:13px;font-weight:700;margin-bottom:6px;color:var(--g-text)}
.elg-field{position:relative;display:flex;align-items:center;gap:10px;border:1px solid var(--g-border);background:var(--g-field);border-radius:14px;
  padding:0 14px;min-height:50px;transition:border-color .2s,box-shadow .2s}
.elg-field:focus-within{border-color:var(--g-field-focus);box-shadow:0 0 0 3px rgba(0,229,255,.12)}
.elg-field svg{color:var(--g-muted);flex-shrink:0}
.elg-input{flex:1;min-width:0;border:0;outline:0;background:transparent;color:var(--g-text);font:inherit;font-size:16px;padding:12px 0}
.elg-input::placeholder{color:var(--g-muted);opacity:.8}
.elg-input.ltr{direction:ltr;text-align:start}
[dir=rtl] .elg-input.ltr{text-align:right}
.elg-eye{border:0;background:transparent;color:var(--g-muted);cursor:pointer;padding:6px;margin-inline-end:-6px;display:grid;place-items:center}
.elg-eye:hover{color:var(--g-text)}
.elg-submit{position:relative;width:100%;min-height:52px;border:0;border-radius:14px;font:inherit;font-size:15.5px;font-weight:800;color:#fff;cursor:pointer;
  background:linear-gradient(135deg,#0891B2,#7C3AED 60%,#C026D3);box-shadow:0 12px 28px -12px rgba(124,58,237,.7);display:flex;align-items:center;justify-content:center;gap:10px;transition:transform .15s,filter .2s;margin-top:4px}
.elg-submit:hover{transform:translateY(-1px);filter:brightness(1.05)}
.elg-submit:disabled{cursor:wait;filter:saturate(.7);transform:none}
.elg-spin{width:18px;height:18px;border-radius:50%;border:2.5px solid rgba(255,255,255,.35);border-top-color:#fff;animation:elgSpin .8s linear infinite}
.elg-msg{display:flex;gap:10px;align-items:flex-start;border-radius:14px;padding:12px 14px;font-size:13.5px;line-height:1.6;margin-bottom:14px}
.elg-msg svg{flex-shrink:0;margin-top:2px}
.elg-msg.err{background:rgba(239,68,68,.1);border:1px solid rgba(239,68,68,.3);color:#F87171}
html.light .elg-msg.err{color:#B91C1C}
.elg-msg.ok{background:rgba(16,185,129,.1);border:1px solid rgba(16,185,129,.3);color:#34D399}
html.light .elg-msg.ok{color:#047857}
.elg-msg.info{background:rgba(0,229,255,.07);border:1px solid rgba(0,229,255,.25);color:var(--g-text)}
.elg-switch{display:block;width:100%;margin-top:14px;border:0;background:transparent;font:inherit;font-size:13.5px;font-weight:700;color:#7C3AED;cursor:pointer;padding:8px}
html:not(.light) .elg-switch{color:#A78BFA}
.elg-switch:hover{text-decoration:underline}
.elg-terms a{color:inherit;text-decoration:underline;text-underline-offset:2px}
.elg-terms{text-align:center;font-size:11.5px;color:var(--g-muted);margin:10px 0 0;line-height:1.6}
.elg-who{text-align:center;padding:8px 0 4px}
.elg-who strong{display:block;font-size:15px;margin-top:6px;word-break:break-all}
.elg-overlay button:focus-visible{outline:2px solid #00E5FF;outline-offset:2px}
.elg-input:focus,.elg-input:focus-visible{outline:none;box-shadow:none}
@media (max-width:639px){
  .elg-overlay{align-items:flex-end;padding:0}
  .elg-card{max-width:none;border-radius:26px 26px 0 0;max-height:94dvh;padding:26px 18px calc(18px + env(safe-area-inset-bottom));
    animation:elgSheet .32s cubic-bezier(.22,1,.36,1) both;border-bottom:0}
  .elg-accent{border-radius:26px 26px 0 0}
  .elg-card::before{content:"";display:block;width:42px;height:5px;border-radius:5px;background:var(--g-border);margin:-12px auto 14px}
  .elg-title{font-size:19px}
}
@media (prefers-reduced-motion:reduce){.elg-overlay,.elg-card{animation:none}}
`;

export function LoginGateModal({ isOpen, onClose, lang, auth, onSuccessAuth }: LoginGateModalProps) {
  const isAr = lang === 'ar';
  const t = TXT[isAr ? 'ar' : 'en'];

  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [company, setCompany] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [waking, setWaking] = useState(false);
  const [error, setError] = useState<ErrKey | null>(null);
  const [done, setDone] = useState(false);
  const [redirecting, setRedirecting] = useState<'google' | 'github' | null>(null);
  const firstFieldRef = useRef<HTMLInputElement>(null);

  // came back from Google/GitHub with an error -> reopen this window to show it
  useEffect(() => {
    try {
      if (sessionStorage.getItem('elyvori_oauth_reopen')) {
        sessionStorage.removeItem('elyvori_oauth_reopen');
        window.setTimeout(() => window.dispatchEvent(new CustomEvent('elyvori:action', { detail: { type: 'auth' } })), 400);
      }
    } catch { /* ignore */ }
  }, []);

  // error coming back from Google/GitHub (saved by the boot script in index.html)
  useEffect(() => {
    if (!isOpen) return;
    setDone(false);
    setRedirecting(null);
    try {
      const code = sessionStorage.getItem('elyvori_oauth_error');
      if (code) {
        sessionStorage.removeItem('elyvori_oauth_error');
        setError(oauthErrorKey(code));
      }
    } catch { /* ignore */ }
    const id = window.setTimeout(() => firstFieldRef.current?.focus(), 250);
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      window.clearTimeout(id);
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [isOpen]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!isOpen) return null;

  const switchMode = (m: 'signin' | 'signup') => { setMode(m); setError(null); };

  const startOAuth = (provider: 'google' | 'github') => {
    setRedirecting(provider);
    setError(null);
    const back = window.location.origin + window.location.pathname;
    window.location.href = `${API}/auth/${provider}/start?redirect=${encodeURIComponent(back)}`;
  };

  const request = async (path: string, body: object) => {
    const slow = window.setTimeout(() => setWaking(true), 5000); // Render free plan cold start
    try {
      for (let attempt = 0; attempt < 2; attempt++) {
        const ctrl = new AbortController();
        const tm = window.setTimeout(() => ctrl.abort(), 70000);
        try {
          const res = await fetch(`${API}${path}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
            signal: ctrl.signal,
          });
          const data = (await res.json().catch(() => ({}))) as any;
          return { res, data };
        } catch (e) {
          if (attempt === 1) throw e;
          await new Promise(r => setTimeout(r, 1500));
        } finally {
          window.clearTimeout(tm);
        }
      }
      throw new Error('unreachable');
    } finally {
      window.clearTimeout(slow);
      setWaking(false);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !password || (mode === 'signup' && !company.trim())) { setError('missing'); return; }
    if (mode === 'signup' && password.length < 6) { setError('short'); return; }

    setLoading(true);
    setError(null);
    try {
      const { res, data } = await request(
        mode === 'signin' ? '/auth/login' : '/auth/signup',
        mode === 'signin'
          ? { email: cleanEmail, password }
          : { email: cleanEmail, password, companyName: company.trim() },
      );
      if (!res.ok) {
        const msg = String(data?.message || '').toLowerCase();
        if (res.status === 401) setError('wrong');
        else if (res.status === 409 || msg.includes('already exists')) setError('exists');
        else if (res.status === 429) setError('many');
        else if (msg.includes('at least 6')) setError('short');
        else if (res.status === 400) setError('missing');
        else setError('generic');
        return;
      }
      const token: string | undefined = data.accessToken || data.token || data.access_token;
      if (!token) { setError('generic'); return; }
      const userEmail: string = data.user?.email || cleanEmail;
      const org: string | undefined = data.organization?.name || data.user?.organizationName || (mode === 'signup' ? company.trim() : undefined);
      setDone(true);
      window.setTimeout(() => { onSuccessAuth(token, userEmail, org); onClose(); }, 650);
    } catch {
      setError('network');
    } finally {
      setLoading(false);
    }
  };

  const busy = loading || !!redirecting || done;

  return (
    <div
      className="elg-overlay"
      dir={isAr ? 'rtl' : 'ltr'}
      role="dialog"
      aria-modal="true"
      aria-label={t.title}
      onMouseDown={e => { if (e.target === e.currentTarget && !busy) onClose(); }}
    >
      <style>{CSS}</style>
      <div className="elg-card" id="login-gate-modal-card">
        <div className="elg-accent" />
        <button type="button" className="elg-close" onClick={onClose} aria-label={t.close} title={t.close} id="btn-close-login-gate">
          <CloseI />
        </button>

        <div className="elg-head">
          <div className="elg-mark">E</div>
          <h2 className="elg-title">{t.title}</h2>
          <p className="elg-sub">{mode === 'signin' ? t.subtitleIn : t.subtitleUp}</p>
        </div>

        {auth.isAuthenticated && !done ? (
          <>
            <div className="elg-msg ok elg-who">
              <div style={{ width: '100%' }}>
                {t.signedInAs}
                <strong>{auth.userEmail}</strong>
              </div>
            </div>
            <button type="button" className="elg-submit" onClick={onClose}>{t.continue}</button>
          </>
        ) : (
          <>
            <div className="elg-tabs" role="tablist">
              <button type="button" role="tab" aria-selected={mode === 'signin'} className={`elg-tab ${mode === 'signin' ? 'on' : ''}`} onClick={() => switchMode('signin')}>
                {t.tabIn}
              </button>
              <button type="button" role="tab" aria-selected={mode === 'signup'} className={`elg-tab ${mode === 'signup' ? 'on' : ''}`} onClick={() => switchMode('signup')}>
                {t.tabUp}
              </button>
            </div>

            {error && (
              <div className="elg-msg err" role="alert">
                <AlertI />
                <div>
                  {t.err[error]}
                  {error === 'exists' && (
                    <button type="button" className="elg-switch" style={{ marginTop: 4, padding: 0, textAlign: 'start' }} onClick={() => switchMode('signin')}>
                      {t.switchToIn}
                    </button>
                  )}
                </div>
              </div>
            )}
            {done && (
              <div className="elg-msg ok" role="status"><CheckI /><div>{mode === 'signin' ? t.doneIn : t.doneUp}</div></div>
            )}
            {waking && !error && (
              <div className="elg-msg info" role="status"><span className="elg-spin" style={{ borderColor: 'rgba(0,229,255,.3)', borderTopColor: '#00E5FF' }} /><div>{t.waking}</div></div>
            )}

            <div className="elg-social">
              <button type="button" className="elg-sbtn" onClick={() => startOAuth('google')} disabled={busy}>
                {redirecting === 'google' ? <span className="elg-spin" style={{ borderColor: 'var(--g-border)', borderTopColor: 'var(--g-text)' }} /> : <span className="elg-badge g"><GoogleLogo /></span>}
                <span>{t.google}</span>
              </button>
              <button type="button" className="elg-sbtn" onClick={() => startOAuth('github')} disabled={busy}>
                {redirecting === 'github' ? <span className="elg-spin" style={{ borderColor: 'var(--g-border)', borderTopColor: 'var(--g-text)' }} /> : <span className="elg-badge gh"><GitHubLogo /></span>}
                <span>{t.github}</span>
              </button>
            </div>

            <div className="elg-or">{t.or}</div>

            <form className="elg-form" onSubmit={handleSubmit} noValidate id="auth-gate-form">
              {mode === 'signup' && (
                <div>
                  <label className="elg-label" htmlFor="elg-company">{t.company}</label>
                  <div className="elg-field">
                    <BuildingI />
                    <input
                      id="elg-company"
                      ref={mode === 'signup' ? firstFieldRef : undefined}
                      className="elg-input"
                      value={company}
                      onChange={e => setCompany(e.target.value)}
                      placeholder={t.companyPh}
                      autoComplete="organization"
                      disabled={busy}
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="elg-label" htmlFor="elg-email">{t.email}</label>
                <div className="elg-field">
                  <MailI />
                  <input
                    id="elg-email"
                    ref={mode === 'signin' ? firstFieldRef : undefined}
                    className="elg-input ltr"
                    type="email"
                    inputMode="email"
                    autoComplete="email"
                    autoCapitalize="none"
                    autoCorrect="off"
                    spellCheck={false}
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder={t.emailPh}
                    disabled={busy}
                  />
                </div>
              </div>

              <div>
                <label className="elg-label" htmlFor="elg-password">{t.password}</label>
                <div className="elg-field">
                  <LockI />
                  <input
                    id="elg-password"
                    className="elg-input ltr"
                    type={showPw ? 'text' : 'password'}
                    autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
                    autoCapitalize="none"
                    autoCorrect="off"
                    spellCheck={false}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder={mode === 'signup' ? t.passwordPh : '••••••••'}
                    disabled={busy}
                  />
                  <button type="button" className="elg-eye" onClick={() => setShowPw(s => !s)} aria-label={showPw ? t.hide : t.show} title={showPw ? t.hide : t.show}>
                    <EyeI off={showPw} />
                  </button>
                </div>
              </div>

              <button type="submit" className="elg-submit" disabled={busy} id="btn-submit-auth">
                {loading ? <><span className="elg-spin" /><span>{t.working}</span></> : done ? <><CheckI /><span>{mode === 'signin' ? t.doneIn : t.doneUp}</span></> : <span>{mode === 'signin' ? t.submitIn : t.submitUp}</span>}
              </button>
            </form>

            <button type="button" className="elg-switch" onClick={() => switchMode(mode === 'signin' ? 'signup' : 'signin')}>
              {mode === 'signin' ? t.switchToUp : t.switchToIn}
            </button>
            <p className="elg-terms">{isAr ? (<>بالمتابعة أنت موافق على <a href="/terms.html" target="_blank" rel="noopener">الشروط</a> و<a href="/privacy.html" target="_blank" rel="noopener">سياسة الخصوصية</a>.</>) : (<>By continuing you agree to our <a href="/terms.html" target="_blank" rel="noopener">Terms</a> and <a href="/privacy.html" target="_blank" rel="noopener">Privacy Policy</a>.</>)}</p>
          </>
        )}
      </div>
    </div>
  );
}
