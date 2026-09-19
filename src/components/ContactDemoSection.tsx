import { useState, FormEvent } from 'react';
import { Send, CheckCircle2, AlertCircle, Loader2, Sparkles } from 'lucide-react';
import { Language } from '../types';
import { translations } from '../translations';
import { QuantumButton } from './QuantumButton';

interface ContactDemoSectionProps {
  lang: Language;
}

export function ContactDemoSection({ lang }: ContactDemoSectionProps) {
  const t = translations[lang];
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim()) return;

    setStatus('loading');
    setErrorMessage('');

    try {
      const response = await fetch('https://elyvori-api.onrender.com/public/demo-request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          message: message.trim(),
        }),
      });

      if (!response.ok) {
        let errDetail = '';
        try {
          const data = await response.json();
          errDetail = data.message || data.error || '';
        } catch {
          // not json
        }
        throw new Error(errDetail || `Request failed with status ${response.status}`);
      }

      setStatus('success');
      setName('');
      setEmail('');
      setMessage('');
    } catch (err: any) {
      console.warn('Demo request error:', err);
      // If server took too long or returned network error, explain clearly
      setErrorMessage(
        err?.message ||
          (lang === 'en'
            ? 'Failed to deliver inquiry to backend. If the Render instance is spinning up, please retry shortly.'
            : 'تعذر إرسال الطلب إلى الخادم. إذا كان الخادم في مرحلة التهيئة، يرجى المحاولة بعد قليل.')
      );
      setStatus('error');
    }
  };

  const handleReset = () => {
    setStatus('idle');
    setErrorMessage('');
  };

  return (
    <section id="demo" className="relative py-16 sm:py-24 border-t border-slate-200/80 dark:border-slate-800/80">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-indigo-500/20 bg-indigo-500/10 px-3 py-1 text-xs font-semibold text-indigo-600 dark:text-indigo-400 mb-3">
            <Sparkles className="h-3 w-3" />
            <span>{t.demo.sectionBadge}</span>
          </div>
          <h2
            id="demo-form-heading"
            className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white"
          >
            {t.demo.sectionTitle}
          </h2>
          <p
            id="demo-form-subheading"
            className="mt-3 text-base text-slate-600 dark:text-slate-300"
          >
            {t.demo.sectionSubtitle}
          </p>
        </div>

        {/* Card Box */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 p-6 sm:p-10 shadow-xl shadow-slate-900/5 backdrop-blur-md">
          {status === 'success' ? (
            <div
              id="demo-success-container"
              className="text-center py-8 space-y-4"
            >
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="h-10 w-10" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
                {t.demo.form.successTitle}
              </h3>
              <p className="max-w-md mx-auto text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                {t.demo.form.successMessage}
              </p>
              <div className="pt-4">
                <button
                  id="btn-submit-another-demo"
                  type="button"
                  onClick={handleReset}
                  className="rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-5 py-2.5 text-xs font-semibold text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-750 transition-colors"
                >
                  {t.demo.form.sendAnother}
                </button>
              </div>
            </div>
          ) : (
            <form id="demo-request-form" onSubmit={handleSubmit} className="space-y-5">
              {status === 'error' && (
                <div
                  id="demo-error-alert"
                  className="flex items-start gap-3 rounded-xl border border-rose-200 dark:border-rose-900/60 bg-rose-50 dark:bg-rose-950/40 p-4 text-xs text-rose-800 dark:text-rose-300"
                >
                  <AlertCircle className="h-5 w-5 shrink-0 text-rose-600 dark:text-rose-400 mt-0.5" />
                  <div className="space-y-1">
                    <span className="font-semibold">{t.demo.form.errorMessage}</span>
                    {errorMessage && <p className="font-mono text-[11px] opacity-90">{errorMessage}</p>}
                  </div>
                </div>
              )}

              {/* Grid for Name and Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label
                    htmlFor="demo-name-input"
                    className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2"
                  >
                    {t.demo.form.nameLabel} <span className="text-rose-500">*</span>
                  </label>
                  <input
                    id="demo-name-input"
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={t.demo.form.namePlaceholder}
                    disabled={status === 'loading'}
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50/80 dark:bg-slate-950/80 px-4 py-3 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-colors"
                  />
                </div>

                <div>
                  <label
                    htmlFor="demo-email-input"
                    className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2"
                  >
                    {t.demo.form.emailLabel} <span className="text-rose-500">*</span>
                  </label>
                  <input
                    id="demo-email-input"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={t.demo.form.emailPlaceholder}
                    disabled={status === 'loading'}
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50/80 dark:bg-slate-950/80 px-4 py-3 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-colors"
                  />
                </div>
              </div>

              {/* Message */}
              <div>
                <label
                  htmlFor="demo-message-input"
                  className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2"
                >
                  {t.demo.form.messageLabel} <span className="text-rose-500">*</span>
                </label>
                <textarea
                  id="demo-message-input"
                  rows={4}
                  required
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder={t.demo.form.messagePlaceholder}
                  disabled={status === 'loading'}
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50/80 dark:bg-slate-950/80 px-4 py-3 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-colors"
                />
              </div>

              {/* Submit button & endpoint disclosure */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  {t.demo.form.note}
                </p>

                <QuantumButton
                  id="btn-submit-demo"
                  type="submit"
                  variant="accent"
                  size="lg"
                  disabled={status === 'loading'}
                >
                  {status === 'loading' ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>{t.demo.form.sendingBtn}</span>
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4" />
                      <span>{t.demo.form.submitBtn}</span>
                    </>
                  )}
                </QuantumButton>
              </div>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
