import { useState, FormEvent, useRef } from 'react';
import { Send, CheckCircle2, AlertCircle, Loader2, Paperclip, X, FileText, Sparkles, Zap } from 'lucide-react';
import { Language } from '../types';
import { ContractModal, ContractSignature } from './ContractModal';
import { translations } from '../translations';

interface ContactDemoSectionProps {
  lang: Language;
  onOpenTracker?: (taskId?: string) => void;
  onTrackerClientInfo?: (name: string, email: string, contractId: string) => void;
}

const API_BASE = 'https://elyvori-api.onrender.com';

export function ContactDemoSection({ lang, onOpenTracker, onTrackerClientInfo }: ContactDemoSectionProps) {
  const t = translations[lang];
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [isContractMode, setIsContractMode] = useState(false);
  const [isSupportMode, setIsSupportMode] = useState(false);
  const [resumeError, setResumeError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isRtl = lang === 'ar';

  const [telegramUsername, setTelegramUsername] = useState('');
  const [taskId, setTaskId] = useState<string | null>(null);
  const [showContract, setShowContract] = useState(false);
  const [pendingData, setPendingData] = useState<{name:string;email:string;message:string;agentType:string} | null>(null);

  const labels = {
    sectionBadge: lang === 'en' ? 'Get in Touch' : 'تواصل معنا',
    heading: lang === 'en' ? 'Start Your Project Today' : 'ابدأ مشروعك اليوم',
    subheading: lang === 'en'
      ? 'Tell us about your organization or project requirements. Our engineering team will prepare a targeted walkthrough.'
      : 'أخبرنا عن متطلبات مشروعك. سيقوم فريقنا الهندسي بإعداد عرض توضيحي مخصص لك.',
    nameLabel: lang === 'en' ? 'Full Name' : 'الاسم الكامل',
    namePlaceholder: lang === 'en' ? 'Sarah Al-Mansoor' : 'سارة المنصور',
    emailLabel: lang === 'en' ? 'Work Email Address' : 'البريد الإلكتروني',
    emailPlaceholder: lang === 'en' ? 'sarah@company.com' : 'sarah@company.com',
    messageLabel: lang === 'en' ? 'Project Details & Service Interests' : 'تفاصيل المشروع والخدمات المطلوبة',
    messagePlaceholder: lang === 'en'
      ? 'Please detail which of our services you require and your target timeline...'
      : 'يرجى تفصيل الخدمات المطلوبة وجدولك الزمني المستهدف...',
    resumeLabel: lang === 'en' ? 'Attach resume (optional)' : 'إرفاق السيرة الذاتية (اختياري)',
    resumeHint: lang === 'en'
      ? "Have a resume? Attach it as a PDF and we'll find real matching jobs for you instead."
      : 'هل لديك سيرة ذاتية؟ أرفقها كـ PDF وسنجد لك وظائف حقيقية مناسبة.',
    submitBtn: lang === 'en' ? 'Send Request' : 'إرسال الطلب',
    telegramLabel: lang === 'en' ? 'Telegram Username (optional)' : 'معرف Telegram (اختياري)',
    telegramPlaceholder: lang === 'en' ? '@username' : '@username',
    telegramHint: lang === 'en'
      ? '📱 Open @ElyvoriAdminBot and press Start to receive your project via Telegram too.'
      : '📱 افتح @ElyvoriAdminBot واضغط Start لتوصلك نتيجة مشروعك على Telegram أيضاً.',
    successContract: lang === 'en'
      ? '⚖️ Contract analysis in progress — a forensic risk report will arrive in your inbox within 2 minutes.'
      : '⚖️ جاري تحليل العقد — تقرير المخاطر القانوني سيصل إلى بريدك خلال دقيقتين.',
    successSupport: lang === 'en'
      ? '🎯 Customer support analysis ready — a professional de-escalation report will arrive within 2 minutes.'
      : '🎯 جاري تحليل رسالة العميل — تقرير احترافي سيصل إلى بريدك خلال دقيقتين.',
    successGeneral: lang === 'en'
      ? "✅ Request received! Our AI systems are already working on your project. You'll receive a confirmation email shortly."
      : '✅ تم استلام طلبك! أنظمة الذكاء الاصطناعي لدينا بدأت العمل على مشروعك. ستصلك رسالة تأكيد قريباً.',
    error: lang === 'en' ? 'Something went wrong. Please try again.' : 'حدث خطأ ما. يرجى المحاولة مرة أخرى.',
    secure: lang === 'en'
      ? `Submissions are transmitted securely to ${API_BASE}/public/demo-request`
      : `يتم إرسال البيانات بأمان إلى ${API_BASE}/public/demo-request`,
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setResumeError(null);
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.type !== 'application/pdf') { setResumeError('Only PDF files are accepted.'); return; }
    if (file.size > 5 * 1024 * 1024) { setResumeError('File must be under 5MB.'); return; }
    setResumeFile(file);
  };


  const detectAgentType = (msg: string): string => {
    const m = msg.toLowerCase();
    if (m.includes('website') || m.includes('app') || m.includes('موقع') || m.includes('تطبيق')) return 'web-app-building';
    if (m.includes('digital product') || m.includes('pdf') || m.includes('template') || m.includes('منتج رقمي')) return 'digital-products';
    if (m.includes('recruit') || m.includes('hiring') || m.includes('cv') || m.includes('توظيف') || m.includes('سيرة')) return 'recruitment-crm';
    if (m.includes('marketing') || m.includes('campaign') || m.includes('تسويق') || m.includes('حملة')) return 'marketing-agent';
    if (m.includes('content') || m.includes('blog') || m.includes('article') || m.includes('محتوى') || m.includes('مقال')) return 'content-agent';
    if (m.includes('lead') || m.includes('prospect') || m.includes('عميل محتمل')) return 'lead-finder';
    if (m.includes('job') || m.includes('career') || m.includes('وظيفة') || m.includes('عمل')) return 'career-agent';
    if (m.includes('contract') || m.includes('legal') || m.includes('عقد') || m.includes('قانوني')) return 'contract-analyzer';
    if (m.includes('support') || m.includes('customer') || m.includes('دعم') || m.includes('عميل')) return 'customer-support';
    if (m.includes('negotiat') || m.includes('deal') || m.includes('تفاوض') || m.includes('صفقة')) return 'negotiation';
    return 'default';
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim()) return;
    // Show contract first
    const agentType = detectAgentType(message);
    setPendingData({ name: name.trim(), email: email.trim(), message: message.trim(), agentType });
    setShowContract(true);
  };

  const handleContractSigned = async (signature: ContractSignature) => {
    setShowContract(false);
    if (!pendingData) return;
    setStatus('loading');
    setIsContractMode(false);
    setIsSupportMode(false);

    try {
      let response: Response;
      if (resumeFile) {
        const formData = new FormData();
        formData.append('businessName', pendingData.name);
        formData.append('contactEmail', pendingData.email);
        formData.append('niche', pendingData.message);
        formData.append('lang', lang);
        formData.append('resume', resumeFile);
        response = await fetch(`${API_BASE}/public/career-agent`, { method: 'POST', body: formData });
      } else {
        response = await fetch(`${API_BASE}/public/demo-request`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ businessName: pendingData.name, contactEmail: pendingData.email, niche: pendingData.message, lang, telegramUsername: telegramUsername.trim() }),
        });
      }

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error((err as any).message || 'Request failed');
      }

      const responseData = await response.json().catch(() => ({}));
      setIsContractMode((responseData as any).mode === 'contract_analysis');
      setIsSupportMode((responseData as any).mode === 'customer_support');

      // Send confirmation email via Vercel serverless function
      fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          visitorName: name.trim(),
          visitorEmail: email.trim(),
          projectDetails: message.trim(),
        }),
      }).catch(() => {}); // non-blocking

      const tid = (responseData as any).taskId || (responseData as any).id || null;
      if (tid) setTaskId(tid);
      setStatus('success');
      // Auto-open tracker after 1.5 seconds
      if (onOpenTracker) {
        const cid = (signature as any)?.contractId || '';
        if (onTrackerClientInfo) {
          onTrackerClientInfo(pendingData.name, pendingData.email, cid);
        }
        setTimeout(() => onOpenTracker(tid || undefined), 1500);
      }
    } catch (err: any) {
      setErrorMessage(err.message || labels.error);
      setStatus('error');
    }
  };

  const inputBase = `w-full rounded-xl border bg-black/60 px-4 py-3.5 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:ring-1 transition-all duration-200 border-[#00E5FF]/20 focus:border-[#00E5FF] focus:ring-[#00E5FF]/30 focus:shadow-[0_0_20px_rgba(0,229,255,0.1)]`;

  return (
    <>
      {showContract && pendingData && (
        <ContractModal
          lang={lang}
          agentType={pendingData.agentType}
          clientName={pendingData.name}
          clientEmail={pendingData.email}
          projectDetails={pendingData.message}
          onSign={handleContractSigned}
          onClose={() => setShowContract(false)}
        />
      )}
    <section
      id="demo"
      dir={isRtl ? 'rtl' : 'ltr'}
      style={{ colorScheme: 'dark', fontFamily: "'Cairo', 'Readex Pro', 'Inter', sans-serif" }}
      className="relative py-24 overflow-hidden bg-[#0F111A]"
    >
      {/* Background effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] rounded-full opacity-20"
          style={{ background: 'radial-gradient(ellipse, rgba(0,229,255,0.15) 0%, transparent 70%)' }} />
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] rounded-full opacity-10"
          style={{ background: 'radial-gradient(ellipse, rgba(213,0,249,0.2) 0%, transparent 70%)' }} />
        {/* Grid lines */}
        <div className="absolute inset-0 opacity-[0.03]"
          style={{ backgroundImage: 'linear-gradient(rgba(0,229,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(0,229,255,1) 1px, transparent 1px)', backgroundSize: '60px 60px' }} />
      </div>

      <div className="relative mx-auto max-w-2xl px-4 sm:px-6">

        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#00E5FF]/20 bg-[#00E5FF]/5 px-4 py-1.5 mb-6">
            <Sparkles className="h-3.5 w-3.5 text-[#00E5FF]" />
            <span className="text-xs font-semibold tracking-widest text-[#00E5FF] uppercase">{labels.sectionBadge}</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-4 leading-tight"
            style={{ textShadow: '0 0 40px rgba(0,229,255,0.2)' }}>
            {labels.heading}
          </h2>
          <p className="text-slate-400 text-sm leading-relaxed max-w-lg mx-auto">{labels.subheading}</p>
        </div>

        {/* Form Card */}
        <div className="relative rounded-2xl border border-[#00E5FF]/20 bg-[#0F111A]/90 backdrop-blur-2xl p-6 sm:p-8"
          style={{ boxShadow: '0 0 60px rgba(0,229,255,0.08), 0 0 0 1px rgba(0,229,255,0.05) inset' }}>

          {/* Top accent line */}
          <div className="absolute top-0 left-8 right-8 h-px"
            style={{ background: 'linear-gradient(90deg, transparent, rgba(0,229,255,0.5), transparent)' }} />

          {status === 'success' ? (
            <div className="py-10 text-center">
              <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl border border-emerald-500/20 bg-emerald-500/10 mb-5"
                style={{ boxShadow: '0 0 30px rgba(16,185,129,0.2)' }}>
                <CheckCircle2 className="h-8 w-8 text-emerald-400" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">
                {isSupportMode ? labels.successSupport : isContractMode ? labels.successContract : labels.successGeneral}
              </h3>
              <p className="text-xs text-amber-400/80 bg-amber-500/10 border border-amber-500/20 rounded-lg px-3 py-2 mt-3">
                {lang === 'en'
                  ? '📬 Confirmation email sent! If you don\'t see it, check your Spam/Junk folder.'
                  : '📬 تم إرسال إيميل التأكيد! إذا لم تجده، تحقق من مجلد Spam أو البريد غير المرغوب.'}
              </p>
              <button onClick={() => { setStatus('idle'); setName(''); setEmail(''); setMessage(''); setResumeFile(null); }}
                className="mt-6 text-xs text-[#00E5FF]/60 hover:text-[#00E5FF] transition-colors underline underline-offset-4">
                {lang === 'en' ? 'Submit another request' : 'إرسال طلب آخر'}
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">

              {/* Name */}
              <div>
                <label className="block text-xs font-bold mb-2 text-[#00E5FF]/80 tracking-wide">
                  {labels.nameLabel} <span className="text-[#D500F9]">*</span>
                </label>
                <input type="text" value={name} onChange={e => setName(e.target.value)} required
                  placeholder={labels.namePlaceholder}
                  dir={isRtl ? 'rtl' : 'ltr'}
                  className={inputBase} />
              </div>

              {/* Email */}
              <div>
                <label className="block text-xs font-bold mb-2 text-[#00E5FF]/80 tracking-wide">
                  {labels.emailLabel} <span className="text-[#D500F9]">*</span>
                </label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
                  placeholder={labels.emailPlaceholder}
                  dir="ltr"
                  className={inputBase} />
              </div>

              {/* Message */}
              <div>
                <label className="block text-xs font-bold mb-2 text-[#00E5FF]/80 tracking-wide">
                  {labels.messageLabel} <span className="text-[#D500F9]">*</span>
                </label>
                <textarea value={message} onChange={e => setMessage(e.target.value)} required
                  placeholder={labels.messagePlaceholder}
                  dir={isRtl ? 'rtl' : 'ltr'}
                  rows={4}
                  className={`${inputBase} resize-none leading-relaxed`} />
              </div>

              {/* Telegram */}
              <div className="rounded-xl border border-dashed border-[#00E5FF]/15 bg-white/[0.02] p-4">
                <label className="block text-xs font-bold mb-1 text-[#00E5FF]/80 tracking-wide">{labels.telegramLabel}</label>
                <input
                  type="text"
                  value={telegramUsername}
                  onChange={e => setTelegramUsername(e.target.value)}
                  placeholder={labels.telegramPlaceholder}
                  dir="ltr"
                  className={inputBase}
                />
                <p className="text-[11px] text-slate-600 mt-2 leading-relaxed">{labels.telegramHint}</p>
              </div>

              {/* Resume Upload */}
              <div className="rounded-xl border border-dashed border-[#00E5FF]/15 bg-white/[0.02] p-4">
                <p className="text-xs font-semibold text-slate-400 mb-1">{labels.resumeLabel}</p>
                <p className="text-[11px] text-slate-600 mb-3 leading-relaxed">{labels.resumeHint}</p>
                {resumeFile ? (
                  <div className="flex items-center gap-2 rounded-lg border border-[#00E5FF]/20 bg-[#00E5FF]/5 px-3 py-2">
                    <FileText className="h-4 w-4 text-[#00E5FF] flex-shrink-0" />
                    <span className="text-xs text-white flex-1 truncate">{resumeFile.name}</span>
                    <button type="button" onClick={() => { setResumeFile(null); if (fileInputRef.current) fileInputRef.current.value = ''; }}
                      className="text-slate-500 hover:text-white transition-colors">
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ) : (
                  <button type="button" onClick={() => fileInputRef.current?.click()}
                    className="flex items-center gap-2 rounded-lg border border-slate-700/60 bg-slate-800/40 px-3 py-2 text-xs text-slate-400 hover:border-[#00E5FF]/30 hover:text-[#00E5FF] transition-all">
                    <Paperclip className="h-3.5 w-3.5" />
                    <span>{lang === 'en' ? 'Choose PDF file' : 'اختر ملف PDF'}</span>
                  </button>
                )}
                <input ref={fileInputRef} type="file" accept=".pdf" onChange={handleFileChange} className="hidden" />
                {resumeError && <p className="mt-2 text-[11px] text-red-400">{resumeError}</p>}
              </div>

              {/* Error */}
              {status === 'error' && (
                <div className="flex items-center gap-2 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3">
                  <AlertCircle className="h-4 w-4 text-red-400 flex-shrink-0" />
                  <p className="text-xs text-red-300">{errorMessage || labels.error}</p>
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={status === 'loading' || !name || !email || !message}
                className="group relative w-full overflow-hidden rounded-xl py-4 text-sm font-bold text-white transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  background: 'linear-gradient(135deg, #00E5FF, #7C3AED, #D500F9)',
                  boxShadow: '0 0 30px rgba(0,229,255,0.25), 0 4px 20px rgba(213,0,249,0.2)',
                }}
              >
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  style={{ background: 'linear-gradient(135deg, #00E5FF, #D500F9, #00E5FF)', backgroundSize: '200%' }} />
                <span className="relative flex items-center justify-center gap-2">
                  {status === 'loading' ? (
                    <><Loader2 className="h-4 w-4 animate-spin" />{lang === 'en' ? 'Processing...' : 'جاري المعالجة...'}</>
                  ) : (
                    <><Zap className="h-4 w-4" />{labels.submitBtn}</>
                  )}
                </span>
              </button>

              {/* Security note */}
              <p className="text-center text-[10px] text-slate-700 leading-relaxed px-2">
                🔒 {labels.secure}
              </p>
            </form>
          )}
        </div>
      </div>
    </section>
    </>
  );
}
