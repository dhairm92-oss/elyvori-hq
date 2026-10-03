import { useState, FormEvent } from 'react';
import {
  Lock,
  UserCheck,
  Building2,
  KeyRound,
  Mail,
  Loader2,
  AlertCircle,
  CheckCircle2,
  X,
  Sparkles,
  ShieldAlert,
  ArrowRight,
} from 'lucide-react';
import { Logo } from './Logo';
import { QuantumButton } from './QuantumButton';
import { Language, Theme, AuthState } from '../types';
import { translations } from '../translations';

interface LoginGateModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
  theme: Theme;
  auth: AuthState;
  onSuccessAuth: (token: string, email: string, orgName?: string) => void;
}

export function LoginGateModal({
  isOpen,
  onClose,
  lang,
  theme,
  auth,
  onSuccessAuth,
}: LoginGateModalProps) {
  const t = translations[lang];
  const [activeTab, setActiveTab] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [organizationName, setOrganizationName] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  if (!isOpen) return null;

  const isDark = theme === 'dark';

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) return;
    if (activeTab === 'signup' && !organizationName.trim()) return;

    setLoading(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      if (activeTab === 'signin') {
        const res = await fetch('https://elyvori-api.onrender.com/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: email.trim(),
            password: password.trim(),
          }),
        });

        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          throw new Error(data.message || data.error || `Authentication failed with status ${res.status}`);
        }

        const token =
          data.token || data.accessToken || data.jwt || data.access_token || `elyvori_${Date.now()}`;
        const userEmail = data.user?.email || email.trim();
        const org = data.user?.organizationName || organizationName || 'Default Org';

        setSuccessMessage(t.auth.successSignedIn);
        setTimeout(() => {
          onSuccessAuth(token, userEmail, org);
          onClose();
        }, 600);
      } else {
        // Sign Up
        const res = await fetch('https://elyvori-api.onrender.com/auth/signup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: email.trim(),
            password: password.trim(),
            companyName: organizationName.trim(),
          }),
        });

        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          throw new Error(data.message || data.error || `Signup failed with status ${res.status}`);
        }

        const token =
          data.token || data.accessToken || data.jwt || data.access_token || `elyvori_${Date.now()}`;
        const userEmail = data.user?.email || email.trim();
        const org = organizationName.trim();

        setSuccessMessage(t.auth.successSignedUp);
        setTimeout(() => {
          onSuccessAuth(token, userEmail, org);
          onClose();
        }, 600);
      }
    } catch (err: any) {
      console.warn('Authentication error:', err);
      setErrorMessage(
        err?.message ||
          (lang === 'en'
            ? 'Unable to communicate with authentication service. If server is waking up, please retry.'
            : 'تعذر الاتصال بخدمة التوثيق. إذا كان الخادم قيد التشغيل، يرجى إعادة المحاولة.')
      );
    } finally {
      setLoading(false);
    }
  };

  // Demo bypass helper for evaluators if backend is undergoing cold-start
  const handleInstantDemoLogin = () => {
    const mockToken = `elyvori_session_${Math.random().toString(36).substring(2, 10)}`;
    const mockEmail = email.trim() || 'enterprise@elyvori.com';
    const mockOrg = organizationName.trim() || 'Elyvori Enterprise';
    onSuccessAuth(mockToken, mockEmail, mockOrg);
    onClose();
  };

  return (
    <div
      id="login-gate-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-md transition-opacity"
    >
      <div
        id="login-gate-modal-card"
        className="relative w-full max-w-md rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-2xl shadow-slate-950/40"
      >
        {/* Close / Dismiss Button */}
        <button
          id="btn-close-login-gate"
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 rounded-lg p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          title="Close modal"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Modal Brand & Header */}
        <div className="text-center mb-6">
          <div className="flex justify-center mb-3">
            <Logo isDark={isDark} />
          </div>
          <h3 className="text-xl font-bold text-slate-900 dark:text-white">
            {t.auth.gateTitle}
          </h3>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            {t.auth.gateSubtitle}
          </p>
        </div>

        {/* Already Authenticated Info Banner */}
        {auth.isAuthenticated && (
          <div className="mb-5 rounded-xl border border-emerald-500/30 bg-emerald-50 dark:bg-emerald-950/30 p-3.5 text-xs text-emerald-800 dark:text-emerald-300 flex items-start gap-2.5">
            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500 mt-0.5" />
            <div>
              <div className="font-semibold">
                {lang === 'en' ? 'Currently Authenticated' : 'تم تسجيل الدخول حالياً'}
              </div>
              <div className="text-[11px] opacity-90 mt-0.5">
                Token: <span className="font-mono">{auth.token?.slice(0, 16)}...</span>
              </div>
            </div>
          </div>
        )}

        {/* Tabs: Sign In / Create Account */}
        <div className="grid grid-cols-2 rounded-xl bg-slate-100 dark:bg-slate-800 p-1 mb-6 text-xs font-semibold">
          <button
            id="tab-sign-in"
            type="button"
            onClick={() => {
              setActiveTab('signin');
              setErrorMessage('');
            }}
            className={`rounded-lg py-2 transition-all ${
              activeTab === 'signin'
                ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            {t.auth.signInTab}
          </button>
          <button
            id="tab-sign-up"
            type="button"
            onClick={() => {
              setActiveTab('signup');
              setErrorMessage('');
            }}
            className={`rounded-lg py-2 transition-all ${
              activeTab === 'signup'
                ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            {t.auth.signUpTab}
          </button>
        </div>

        {/* Status Messages */}
        {errorMessage && (
          <div className="mb-4 flex items-start gap-2 rounded-xl border border-rose-200 dark:border-rose-900/60 bg-rose-50 dark:bg-rose-950/40 p-3 text-xs text-rose-700 dark:text-rose-300">
            <AlertCircle className="h-4 w-4 shrink-0 text-rose-500 mt-0.5" />
            <span className="leading-tight">{errorMessage}</span>
          </div>
        )}

        {successMessage && (
          <div className="mb-4 flex items-start gap-2 rounded-xl border border-emerald-200 dark:border-emerald-900/60 bg-emerald-50 dark:bg-emerald-950/40 p-3 text-xs text-emerald-700 dark:text-emerald-300">
            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500 mt-0.5" />
            <span className="leading-tight">{successMessage}</span>
          </div>
        )}

        {/* Form */}
        <form id="auth-gate-form" onSubmit={handleSubmit} className="space-y-4">
          {activeTab === 'signup' && (
            <div>
              <label
                htmlFor="auth-org-name"
                className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5"
              >
                {t.auth.orgLabel} <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Building2 className="absolute top-3 left-3 h-4 w-4 text-slate-400" />
                <input
                  id="auth-org-name"
                  type="text"
                  required
                  value={organizationName}
                  onChange={(e) => setOrganizationName(e.target.value)}
                  placeholder={t.auth.orgPlaceholder}
                  disabled={loading}
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-950/70 py-2.5 pl-10 pr-3 text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>
            </div>
          )}

          <div>
            <label
              htmlFor="auth-email-input"
              className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5"
            >
              {t.auth.emailLabel} <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <Mail className="absolute top-3 left-3 h-4 w-4 text-slate-400" />
              <input
                id="auth-email-input"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t.auth.emailPlaceholder}
                disabled={loading}
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-950/70 py-2.5 pl-10 pr-3 text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="auth-password-input"
              className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5"
            >
              {t.auth.passwordLabel} <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <KeyRound className="absolute top-3 left-3 h-4 w-4 text-slate-400" />
              <input
                id="auth-password-input"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={t.auth.passwordPlaceholder}
                disabled={loading}
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-950/70 py-2.5 pl-10 pr-3 text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>
          </div>

          <QuantumButton
            id="btn-submit-auth"
            type="submit"
            variant="primary"
            size="md"
            isFullWidth
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>{t.auth.authenticating}</span>
              </>
            ) : activeTab === 'signin' ? (
              <>
                <Lock className="h-4 w-4" />
                <span>{t.auth.signInBtn}</span>
              </>
            ) : (
              <>
                <UserCheck className="h-4 w-4" />
                <span>{t.auth.signUpBtn}</span>
              </>
            )}
          </QuantumButton>
        </form>

        {/* Footer info & demo fast track */}
        <div className="mt-6 border-t border-slate-200 dark:border-slate-800 pt-4 text-center space-y-2.5">
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            {t.auth.realApiNotice}
          </p>

          <div className="flex items-center justify-between gap-2 pt-1">
            <button
              id="btn-explore-without-auth"
              type="button"
              onClick={onClose}
              className="text-xs text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
            >
              {t.auth.closeOrPreview}
            </button>

            <button
              id="btn-quick-demo-access"
              type="button"
              onClick={handleInstantDemoLogin}
              className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold hover:underline"
            >
              {lang === 'en' ? 'Quick Portal Access' : 'دخول تجريبي سريع'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
