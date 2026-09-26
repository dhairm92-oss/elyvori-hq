import { useState, useCallback } from 'react';
import {
  ArrowLeft, MessageSquare, Send, Copy, Check, AlertTriangle,
  CheckCircle2, Clock, Zap, Users, ChevronDown, ChevronUp,
  Loader2, RefreshCw, Smartphone, Mail, MessageCircle, Globe,
  TrendingUp, Shield, Activity
} from 'lucide-react';
import { Language } from '../types';

interface CustomerSupportPageProps {
  lang: Language;
  onBack: () => void;
}

type Channel = 'whatsapp' | 'email' | 'chat' | 'other';
type Stage = 'idle' | 'analyzing' | 'done' | 'error';
type RiskLevel = 'high' | 'medium' | 'low';
type Tone = 'furious' | 'frustrated' | 'disappointed' | 'panicked' | 'neutral';

interface SupportResult {
  sentimentAnalysis: {
    tone: Tone;
    painPoint: string;
    riskLevel: RiskLevel;
    urgency: string;
  };
  deescalationStrategy: {
    approach: string;
    reasoning: string;
    keyPoints: string[];
  };
  readyResponse: {
    subject?: string;
    body: string;
    language: string;
    channel: Channel;
  };
  internalNextSteps: {
    immediateActions: string[];
    escalate: boolean;
    estimatedResolutionTime: string;
    compensationSuggestion?: string;
  };
  overallRiskScore: number;
}

const API_BASE = 'https://elyvori-api.onrender.com';

const CHANNEL_ICONS: Record<Channel, any> = {
  whatsapp: Smartphone,
  email: Mail,
  chat: MessageCircle,
  other: Globe,
};

export function CustomerSupportPage({ lang, onBack }: CustomerSupportPageProps) {
  const [stage, setStage] = useState<Stage>('idle');
  const [customerMessage, setCustomerMessage] = useState('');
  const [orderContext, setOrderContext] = useState('');
  const [channel, setChannel] = useState<Channel>('whatsapp');
  const [businessType, setBusinessType] = useState('');
  const [ownerEmail, setOwnerEmail] = useState('');
  const [emailSent, setEmailSent] = useState(false);
  const [result, setResult] = useState<SupportResult | null>(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [copiedResponse, setCopiedResponse] = useState(false);
  const [showStrategy, setShowStrategy] = useState(true);
  const [showInternal, setShowInternal] = useState(true);
  const isRtl = lang === 'ar';

  const t = {
    back: lang === 'en' ? 'Back to Elyvori' : 'العودة إلى إليفوري',
    badge: lang === 'en' ? 'AI Customer Guard' : 'حارس العملاء الذكي',
    title: lang === 'en' ? 'Customer Support\nAI Agent' : 'وكيل دعم\nالعملاء الذكي',
    subtitle: lang === 'en'
      ? 'Paste any angry customer message and get an instant de-escalation strategy, a ready-to-send response, and internal action steps — in seconds.'
      : 'الصق أي رسالة عميل غاضب واحصل فوراً على استراتيجية تهدئة، ورد جاهز للإرسال، وخطوات عمل داخلية — في ثوانٍ.',
    messageLabel: lang === 'en' ? 'Customer Message' : 'رسالة العميل',
    messagePlaceholder: lang === 'en'
      ? 'Paste the customer\'s message here — WhatsApp, email, or chat...'
      : 'الصق رسالة العميل هنا — واتساب، إيميل، أو شات...',
    contextLabel: lang === 'en' ? 'Order / Context (optional)' : 'سياق الطلب (اختياري)',
    contextPlaceholder: lang === 'en'
      ? 'e.g. Order #1234, shipped 3 days ago, product: wireless headphones, policy: 14-day return...'
      : 'مثال: طلب رقم 1234، تم الشحن قبل 3 أيام، المنتج: سماعات لاسلكية، سياسة: استرجاع 14 يوم...',
    channelLabel: lang === 'en' ? 'Channel' : 'القناة',
    businessLabel: lang === 'en' ? 'Business Type (optional)' : 'نوع الأعمال (اختياري)',
    businessPlaceholder: lang === 'en' ? 'e.g. Online fashion store, SaaS platform...' : 'مثال: متجر ملابس، منصة SaaS...',
    analyze: lang === 'en' ? 'Analyze & Generate Response' : 'حلّل وأنشئ الرد',
    analyzing: lang === 'en' ? 'Analyzing customer sentiment...' : 'جاري تحليل مشاعر العميل...',
    again: lang === 'en' ? 'Analyze Another Message' : 'حلّل رسالة أخرى',
    sentimentTitle: lang === 'en' ? 'Sentiment Analysis' : 'تحليل المشاعر',
    strategyTitle: lang === 'en' ? 'De-escalation Strategy' : 'استراتيجية التهدئة',
    responseTitle: lang === 'en' ? 'Ready-to-Send Response' : 'الرد الجاهز للإرسال',
    internalTitle: lang === 'en' ? 'Internal Action Steps' : 'الخطوات الداخلية',
    copy: lang === 'en' ? 'Copy Response' : 'نسخ الرد',
    copied: lang === 'en' ? 'Copied!' : 'تم النسخ!',
    escalate: lang === 'en' ? '⚠️ Escalate to Manager' : '⚠️ تصعيد للمدير',
    noEscalate: lang === 'en' ? '✅ Handle Autonomously' : '✅ معالجة تلقائية',
    resolution: lang === 'en' ? 'Est. Resolution' : 'وقت الحل المتوقع',
    compensation: lang === 'en' ? 'Compensation Suggestion' : 'مقترح التعويض',
    riskScore: lang === 'en' ? 'Churn Risk' : 'خطر الفقدان',
    subject: lang === 'en' ? 'Subject' : 'الموضوع',
    emailLabel: lang === 'en' ? 'Your Email (to receive the report)' : 'إيميلك (لاستلام التقرير)',
    emailPlaceholder: lang === 'en' ? 'your@email.com' : 'your@email.com',
    noMessage: lang === 'en' ? 'Please paste a customer message.' : 'الرجاء لصق رسالة العميل.',
    error: lang === 'en' ? 'Analysis failed. Please try again.' : 'فشل التحليل. الرجاء المحاولة مرة أخرى.',
    whatsapp: 'WhatsApp',
    email: lang === 'en' ? 'Email' : 'إيميل',
    chat: 'Live Chat',
    other: lang === 'en' ? 'Other' : 'أخرى',
  };

  const toneConfig: Record<Tone, { label: string; color: string; bg: string; border: string }> = {
    furious: { label: lang === 'en' ? '🔥 Furious' : '🔥 غاضب جداً', color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/30' },
    frustrated: { label: lang === 'en' ? '😤 Frustrated' : '😤 محبط', color: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/30' },
    disappointed: { label: lang === 'en' ? '😞 Disappointed' : '😞 خائب الأمل', color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/30' },
    panicked: { label: lang === 'en' ? '😰 Panicked' : '😰 مذعور', color: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/30' },
    neutral: { label: lang === 'en' ? '😐 Neutral' : '😐 محايد', color: 'text-slate-400', bg: 'bg-slate-500/10', border: 'border-slate-500/30' },
  };

  const riskConfig: Record<RiskLevel, { label: string; color: string; dot: string }> = {
    high: { label: lang === 'en' ? 'High Risk' : 'خطر عالٍ', color: 'text-red-400', dot: 'bg-red-500' },
    medium: { label: lang === 'en' ? 'Medium Risk' : 'خطر متوسط', color: 'text-amber-400', dot: 'bg-amber-500' },
    low: { label: lang === 'en' ? 'Low Risk' : 'خطر منخفض', color: 'text-emerald-400', dot: 'bg-emerald-500' },
  };

  const handleAnalyze = useCallback(async () => {
    if (!customerMessage.trim()) { setErrorMsg(t.noMessage); return; }
    setErrorMsg(''); setStage('analyzing');
    try {
      const res = await fetch(`${API_BASE}/public/customer-support`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerMessage: customerMessage.trim(),
          orderContext: orderContext.trim(),
          channel,
          lang,
          businessType: businessType.trim(),
          ownerEmail: ownerEmail.trim(),
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error((err as any).message || 'Analysis failed');
      }
      const data = await res.json();
      setResult(data);
      setStage('done');
      if (ownerEmail.trim()) setEmailSent(true);
    } catch (e: any) {
      setErrorMsg(e.message || t.error);
      setStage('error');
    }
  }, [customerMessage, orderContext, channel, lang, businessType, t.noMessage, t.error]);

  const copyResponse = () => {
    if (!result) return;
    navigator.clipboard?.writeText(result.readyResponse.body).then(() => {
      setCopiedResponse(true);
      setTimeout(() => setCopiedResponse(false), 2500);
    });
  };

  const reset = () => {
    setStage('idle'); setResult(null); setErrorMsg('');
    setCustomerMessage(''); setOrderContext(''); setBusinessType('');
    setEmailSent(false);
  };

  const riskScoreColor = (score: number) =>
    score >= 70 ? 'text-red-400' : score >= 40 ? 'text-amber-400' : 'text-emerald-400';

  const channels: { id: Channel; label: string; icon: any }[] = [
    { id: 'whatsapp', label: t.whatsapp, icon: Smartphone },
    { id: 'email', label: t.email, icon: Mail },
    { id: 'chat', label: t.chat, icon: MessageCircle },
    { id: 'other', label: t.other, icon: Globe },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 py-10 sm:py-16">

        {/* Back */}
        <button onClick={onBack} className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors mb-10">
          <ArrowLeft className={`h-4 w-4 ${isRtl ? 'rotate-180' : ''}`} />
          {t.back}
        </button>

        {/* Hero */}
        {stage !== 'done' && (
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 rounded-full border border-sky-500/20 bg-sky-500/10 px-3.5 py-1.5 text-xs font-semibold text-sky-400 mb-6">
              <Users className="h-3.5 w-3.5" />
              <span>{t.badge}</span>
            </div>
            <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight leading-tight mb-6 whitespace-pre-line">
              <span className="bg-gradient-to-r from-sky-400 via-blue-300 to-indigo-400 bg-clip-text text-transparent">
                {t.title}
              </span>
            </h1>
            <p className="text-slate-300 text-base sm:text-lg leading-relaxed max-w-xl mx-auto">{t.subtitle}</p>
          </div>
        )}

        {/* Input */}
        {stage !== 'done' && (
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 backdrop-blur-sm p-6 sm:p-8 shadow-2xl">
            {stage === 'analyzing' ? (
              <div className="text-center py-12">
                <div className="relative mx-auto mb-6 flex h-16 w-16 items-center justify-center">
                  <div className="absolute inset-0 rounded-full bg-sky-500/20 animate-ping" />
                  <Activity className="h-8 w-8 text-sky-400 relative z-10" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">{t.analyzing}</h3>
                <div className="flex justify-center gap-1.5 mt-5">
                  {[0,1,2,3].map(i => (
                    <div key={i} className="h-1.5 w-1.5 rounded-full bg-sky-500 animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
                  ))}
                </div>
              </div>
            ) : (
              <>
                {/* Channel selector */}
                <div className="mb-5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">{t.channelLabel}</label>
                  <div className="flex gap-2 flex-wrap">
                    {channels.map(ch => {
                      const Icon = ch.icon;
                      return (
                        <button
                          key={ch.id}
                          onClick={() => setChannel(ch.id)}
                          className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                            channel === ch.id
                              ? 'bg-sky-600 text-white'
                              : 'bg-slate-800 text-slate-400 hover:text-white'
                          }`}
                        >
                          <Icon className="h-3.5 w-3.5" />
                          {ch.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Customer message */}
                <div className="mb-4">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">{t.messageLabel} <span className="text-red-400">*</span></label>
                  <textarea
                    value={customerMessage}
                    onChange={e => setCustomerMessage(e.target.value)}
                    placeholder={t.messagePlaceholder}
                    rows={5}
                    className="w-full rounded-xl border border-slate-700 bg-slate-950/60 px-4 py-3 text-sm text-white placeholder:text-slate-600 focus:border-sky-500 focus:outline-none resize-none transition-colors"
                  />
                </div>

                {/* Order context */}
                <div className="mb-4">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">{t.contextLabel}</label>
                  <textarea
                    value={orderContext}
                    onChange={e => setOrderContext(e.target.value)}
                    placeholder={t.contextPlaceholder}
                    rows={3}
                    className="w-full rounded-xl border border-slate-700 bg-slate-950/60 px-4 py-3 text-sm text-white placeholder:text-slate-600 focus:border-sky-500 focus:outline-none resize-none transition-colors"
                  />
                </div>

                {/* Business type */}
                <div className="mb-5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">{t.businessLabel}</label>
                  <input
                    type="text"
                    value={businessType}
                    onChange={e => setBusinessType(e.target.value)}
                    placeholder={t.businessPlaceholder}
                    className="w-full rounded-xl border border-slate-700 bg-slate-950/60 px-4 py-3 text-sm text-white placeholder:text-slate-600 focus:border-sky-500 focus:outline-none transition-colors"
                  />
                </div>

                {/* Owner email */}
                <div className="mb-5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">{t.emailLabel}</label>
                  <input
                    type="email"
                    value={ownerEmail}
                    onChange={e => setOwnerEmail(e.target.value)}
                    placeholder={t.emailPlaceholder}
                    className="w-full rounded-xl border border-slate-700 bg-slate-950/60 px-4 py-3 text-sm text-white placeholder:text-slate-600 focus:border-sky-500 focus:outline-none transition-colors"
                  />
                </div>

                {errorMsg && (
                  <div className="mb-4 text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-2.5">{errorMsg}</div>
                )}

                <button
                  onClick={handleAnalyze}
                  className="w-full rounded-lg bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white font-semibold py-3.5 text-sm transition-all shadow-lg shadow-sky-500/25 flex items-center justify-center gap-2"
                >
                  <Zap className="h-4 w-4" />
                  {t.analyze}
                </button>
              </>
            )}
          </div>
        )}

        {/* Results */}
        {stage === 'done' && result && (
          <div className="space-y-4">

            {/* Email sent banner */}
        {emailSent && (
          <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-5 py-3 flex items-center gap-3">
            <CheckCircle2 className="h-4 w-4 text-emerald-400 flex-shrink-0" />
            <p className="text-sm text-emerald-300">
              {lang === 'en'
                ? `📧 Full support report sent to ${ownerEmail}`
                : `📧 تم إرسال تقرير الدعم الكامل إلى ${ownerEmail}`}
            </p>
          </div>
        )}

        {/* Top metrics row */}
            <div className="grid grid-cols-3 gap-3">
              {/* Tone */}
              <div className={`rounded-xl border ${toneConfig[result.sentimentAnalysis.tone].border} ${toneConfig[result.sentimentAnalysis.tone].bg} p-4 text-center`}>
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">{lang === 'en' ? 'Tone' : 'النبرة'}</p>
                <p className={`text-sm font-bold ${toneConfig[result.sentimentAnalysis.tone].color}`}>{toneConfig[result.sentimentAnalysis.tone].label}</p>
              </div>
              {/* Risk */}
              <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-4 text-center">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">{t.riskScore}</p>
                <div className="flex items-center justify-center gap-1.5">
                  <div className={`h-2 w-2 rounded-full ${riskConfig[result.sentimentAnalysis.riskLevel].dot}`} />
                  <p className={`text-sm font-bold ${riskConfig[result.sentimentAnalysis.riskLevel].color}`}>{riskConfig[result.sentimentAnalysis.riskLevel].label}</p>
                </div>
              </div>
              {/* Urgency */}
              <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-4 text-center">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">{t.resolution}</p>
                <p className="text-sm font-bold text-white">{result.internalNextSteps.estimatedResolutionTime}</p>
              </div>
            </div>

            {/* Pain point */}
            <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-4">
              <p className="text-[10px] font-bold uppercase tracking-wider text-sky-400 mb-1">{lang === 'en' ? 'Core Pain Point' : 'جوهر المشكلة'}</p>
              <p className="text-sm text-slate-200">{result.sentimentAnalysis.painPoint}</p>
            </div>

            {/* De-escalation strategy */}
            <div className="rounded-xl border border-slate-800 bg-slate-900/50 overflow-hidden">
              <button
                onClick={() => setShowStrategy(!showStrategy)}
                className="w-full flex items-center justify-between px-5 py-4 border-b border-slate-800/60"
              >
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-violet-400" />
                  <span className="text-xs font-bold uppercase tracking-wider text-violet-400">{t.strategyTitle}</span>
                </div>
                {showStrategy ? <ChevronUp className="h-4 w-4 text-slate-500" /> : <ChevronDown className="h-4 w-4 text-slate-500" />}
              </button>
              {showStrategy && (
                <div className="p-5 space-y-3">
                  <div>
                    <p className="text-xs font-semibold text-white mb-1">{result.deescalationStrategy.approach}</p>
                    <p className="text-xs text-slate-400 leading-relaxed">{result.deescalationStrategy.reasoning}</p>
                  </div>
                  {result.deescalationStrategy.keyPoints.length > 0 && (
                    <div className="space-y-1.5">
                      {result.deescalationStrategy.keyPoints.map((point, i) => (
                        <div key={i} className="flex gap-2">
                          <div className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-violet-500" />
                          <p className="text-xs text-slate-300 leading-relaxed">{point}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Ready response */}
            <div className="rounded-xl border border-sky-500/20 bg-sky-500/5 overflow-hidden">
              <div className="flex items-center justify-between px-5 py-4 border-b border-sky-500/10">
                <div className="flex items-center gap-2">
                  <Send className="h-4 w-4 text-sky-400" />
                  <span className="text-xs font-bold uppercase tracking-wider text-sky-400">{t.responseTitle}</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-sky-500/15 text-sky-400 font-semibold">{result.readyResponse.channel}</span>
                </div>
                <button
                  onClick={copyResponse}
                  className="flex items-center gap-1.5 text-[11px] font-semibold px-3 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white transition-colors"
                >
                  {copiedResponse ? <><Check className="h-3 w-3" />{t.copied}</> : <><Copy className="h-3 w-3" />{t.copy}</>}
                </button>
              </div>
              <div className="p-5">
                {result.readyResponse.subject && (
                  <div className="mb-3 pb-3 border-b border-sky-500/10">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">{t.subject}: </span>
                    <span className="text-xs text-white font-semibold">{result.readyResponse.subject}</span>
                  </div>
                )}
                <p className="text-sm text-slate-100 leading-relaxed whitespace-pre-line">{result.readyResponse.body}</p>
              </div>
            </div>

            {/* Internal steps */}
            <div className="rounded-xl border border-slate-800 bg-slate-900/50 overflow-hidden">
              <button
                onClick={() => setShowInternal(!showInternal)}
                className="w-full flex items-center justify-between px-5 py-4 border-b border-slate-800/60"
              >
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-emerald-400" />
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">{t.internalTitle}</span>
                  {result.internalNextSteps.escalate && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-500/15 text-red-400 font-bold">ESCALATE</span>
                  )}
                </div>
                {showInternal ? <ChevronUp className="h-4 w-4 text-slate-500" /> : <ChevronDown className="h-4 w-4 text-slate-500" />}
              </button>
              {showInternal && (
                <div className="p-5 space-y-4">
                  <div className={`flex items-center gap-2 rounded-lg px-3 py-2 ${result.internalNextSteps.escalate ? 'bg-red-500/10 border border-red-500/20' : 'bg-emerald-500/10 border border-emerald-500/20'}`}>
                    {result.internalNextSteps.escalate
                      ? <AlertTriangle className="h-4 w-4 text-red-400 flex-shrink-0" />
                      : <CheckCircle2 className="h-4 w-4 text-emerald-400 flex-shrink-0" />}
                    <p className={`text-xs font-semibold ${result.internalNextSteps.escalate ? 'text-red-300' : 'text-emerald-300'}`}>
                      {result.internalNextSteps.escalate ? t.escalate : t.noEscalate}
                    </p>
                  </div>
                  <div className="space-y-2">
                    {result.internalNextSteps.immediateActions.map((action, i) => (
                      <div key={i} className="flex gap-2.5 items-start">
                        <div className="flex-shrink-0 h-5 w-5 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center">
                          <span className="text-[10px] font-bold text-slate-400">{i + 1}</span>
                        </div>
                        <p className="text-xs text-slate-300 leading-relaxed pt-0.5">{action}</p>
                      </div>
                    ))}
                  </div>
                  {result.internalNextSteps.compensationSuggestion && (
                    <div className="rounded-lg bg-amber-500/10 border border-amber-500/20 px-3 py-2.5">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-amber-400 mb-1">{t.compensation}</p>
                      <p className="text-xs text-amber-200">{result.internalNextSteps.compensationSuggestion}</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="text-center pt-2">
              <button onClick={reset} className="text-sm font-semibold text-sky-400 hover:text-sky-300 transition-colors">
                {t.again}
              </button>
            </div>
          </div>
        )}

        {stage === 'error' && (
          <div className="mt-6 rounded-xl border border-red-500/20 bg-red-500/10 p-5 text-center">
            <AlertTriangle className="h-8 w-8 text-red-400 mx-auto mb-3" />
            <p className="text-sm text-red-300 mb-4">{errorMsg}</p>
            <button onClick={reset} className="text-sm font-semibold text-sky-400 hover:text-sky-300 transition-colors">{t.again}</button>
          </div>
        )}
      </div>
    </div>
  );
}
 
