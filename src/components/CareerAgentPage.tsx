import { useState, useRef } from 'react';
import { Sparkles, Upload, FileText, CheckCircle2, Search, Target, Mail, ArrowLeft } from 'lucide-react';
import { Language } from '../types';

interface CareerAgentPageProps {
  lang: Language;
  onBack: () => void;
}

type SubmitState = 'idle' | 'uploading' | 'success' | 'error';

// A dedicated, full-page experience for the Career Agent - deliberately
// given its own space (not squeezed into the homepage) since this is a
// genuinely powerful, standalone capability: upload a real resume PDF,
// get a real report of matched jobs with personalized cover letters,
// delivered by email once the backend pipeline finishes.
export function CareerAgentPage({ lang, onBack }: CareerAgentPageProps) {
  const [file, setFile] = useState<File | null>(null);
  const [email, setEmail] = useState('');
  const [state, setState] = useState<SubmitState>('idle');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isRtl = lang === 'ar';

  const t = {
    back: lang === 'en' ? 'Back to Elyvori' : 'العودة إلى إليفوري',
    badge: lang === 'en' ? 'AI Career Agent' : 'وكيل التوظيف الذكي',
    title: lang === 'en' ? 'Your Next Job,\nFound by AI' : 'وظيفتك القادمة،\nيجدها الذكاء الاصطناعي',
    subtitle:
      lang === 'en'
        ? 'Upload your resume. Our AI deeply analyzes your skills, searches real current job openings, scores genuine matches, and writes a personalized cover letter for each one — delivered straight to your inbox.'
        : 'ارفع سيرتك الذاتية. يحلل ذكاؤنا الاصطناعي مهاراتك بعمق، يبحث عن وظائف حقيقية متاحة الآن، يقيّم التطابق بصدق، ويكتب رسالة تغطية مخصصة لكل وظيفة — تصلك مباشرة على بريدك.',
    steps: [
      { icon: FileText, label: lang === 'en' ? 'Deep Resume Parsing' : 'تحليل عميق للسيرة الذاتية' },
      { icon: Search, label: lang === 'en' ? 'Real Job Market Search' : 'بحث حقيقي بسوق العمل' },
      { icon: Target, label: lang === 'en' ? 'Honest Match Scoring' : 'تقييم تطابق صادق' },
      { icon: Mail, label: lang === 'en' ? 'Full Report by Email' : 'تقرير كامل بالإيميل' },
    ],
    dropzoneTitle: lang === 'en' ? 'Drop your resume here' : 'اسحب سيرتك الذاتية هنا',
    dropzoneSubtitle: lang === 'en' ? 'or click to browse — PDF only, max 10MB' : 'أو اضغط للاختيار — PDF فقط، حتى 10 ميجابايت',
    emailLabel: lang === 'en' ? 'Your Email Address' : 'بريدك الإلكتروني',
    emailPlaceholder: lang === 'en' ? 'you@example.com' : 'you@example.com',
    submitBtn: lang === 'en' ? 'Analyze My Resume' : 'حلّل سيرتي الذاتية',
    submitting: lang === 'en' ? 'Uploading...' : 'جاري الرفع...',
    successTitle: lang === 'en' ? "You're all set!" : 'تم بنجاح!',
    successMessage:
      lang === 'en'
        ? "We're analyzing your resume and searching for real job matches right now. Your full report — with match scores and ready-to-send cover letters — will arrive in your inbox shortly."
        : 'نحلل سيرتك الذاتية الآن ونبحث عن وظائف حقيقية مطابقة. تقريرك الكامل - مع نسب التطابق ورسائل التغطية الجاهزة - سيصل بريدك الإلكتروني قريباً.',
    another: lang === 'en' ? 'Submit Another Resume' : 'إرسال سيرة ذاتية أخرى',
    errorFileType: lang === 'en' ? 'Please upload a PDF file.' : 'الرجاء رفع ملف بصيغة PDF.',
    errorEmail: lang === 'en' ? 'Please enter a valid email address.' : 'الرجاء إدخال بريد إلكتروني صحيح.',
    errorGeneric: lang === 'en' ? 'Something went wrong. Please try again.' : 'حدث خطأ ما. الرجاء المحاولة مرة أخرى.',
  };

  const handleFileSelect = (selected: File | null) => {
    if (!selected) return;
    if (selected.type !== 'application/pdf') {
      setErrorMsg(t.errorFileType);
      return;
    }
    setErrorMsg(null);
    setFile(selected);
  };

  const handleSubmit = async () => {
    if (!file) {
      setErrorMsg(t.errorFileType);
      return;
    }
    if (!email.includes('@')) {
      setErrorMsg(t.errorEmail);
      return;
    }
    setErrorMsg(null);
    setState('uploading');

    try {
      const formData = new FormData();
      formData.append('resume', file);
      formData.append('email', email);

      const response = await fetch('https://elyvori-api.onrender.com/public/career-agent', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Request failed');
      setState('success');
    } catch {
      setErrorMsg(t.errorGeneric);
      setState('error');
    }
  };

  const resetForm = () => {
    setFile(null);
    setEmail('');
    setState('idle');
    setErrorMsg(null);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 py-10 sm:py-16">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors mb-10"
        >
          <ArrowLeft className={`h-4 w-4 ${isRtl ? 'rotate-180' : ''}`} />
          {t.back}
        </button>

        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/20 bg-indigo-500/10 px-3.5 py-1.5 text-xs font-semibold text-indigo-400 mb-6">
            <Sparkles className="h-3.5 w-3.5" />
            <span>{t.badge}</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight leading-tight mb-6 whitespace-pre-line">
            <span className="bg-gradient-to-r from-indigo-400 via-blue-300 to-emerald-400 bg-clip-text text-transparent">
              {t.title}
            </span>
          </h1>
          <p className="text-slate-300 text-base sm:text-lg leading-relaxed max-w-xl mx-auto">
            {t.subtitle}
          </p>
        </div>

        {/* Process steps */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-12">
          {t.steps.map((step, i) => {
            const Icon = step.icon;
            return (
              <div
                key={i}
                className="flex flex-col items-center text-center gap-2 rounded-xl border border-slate-800 bg-slate-900/50 p-4"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-500/15 text-indigo-400">
                  <Icon className="h-4.5 w-4.5" />
                </div>
                <span className="text-xs text-slate-400 font-medium">{step.label}</span>
              </div>
            );
          })}
        </div>

        {/* Main card */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 backdrop-blur-sm p-6 sm:p-10 shadow-2xl">
          {state === 'success' ? (
            <div className="text-center py-8">
              <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-400">
                <CheckCircle2 className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">{t.successTitle}</h3>
              <p className="text-slate-300 text-sm leading-relaxed max-w-md mx-auto mb-6">{t.successMessage}</p>
              <button
                onClick={resetForm}
                className="text-sm font-semibold text-indigo-400 hover:text-indigo-300 transition-colors"
              >
                {t.another}
              </button>
            </div>
          ) : (
            <>
              {/* Dropzone */}
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setIsDragging(false);
                  handleFileSelect(e.dataTransfer.files?.[0] ?? null);
                }}
                onClick={() => fileInputRef.current?.click()}
                className={`rounded-xl border-2 border-dashed p-8 sm:p-10 text-center cursor-pointer transition-colors ${
                  isDragging
                    ? 'border-indigo-400 bg-indigo-500/10'
                    : file
                      ? 'border-emerald-500/50 bg-emerald-500/5'
                      : 'border-slate-700 hover:border-slate-600 bg-slate-950/40'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="application/pdf"
                  className="hidden"
                  onChange={(e) => handleFileSelect(e.target.files?.[0] ?? null)}
                />
                {file ? (
                  <div className="flex flex-col items-center gap-2">
                    <FileText className="h-8 w-8 text-emerald-400" />
                    <span className="text-sm font-semibold text-white">{file.name}</span>
                    <span className="text-xs text-slate-400">{(file.size / 1024 / 1024).toFixed(1)} MB</span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-3">
                    <Upload className="h-8 w-8 text-slate-500" />
                    <div>
                      <div className="text-sm font-semibold text-white">{t.dropzoneTitle}</div>
                      <div className="text-xs text-slate-500 mt-1">{t.dropzoneSubtitle}</div>
                    </div>
                  </div>
                )}
              </div>

              {/* Email field */}
              <div className="mt-6">
                <label className="block text-xs font-semibold text-slate-400 mb-2">{t.emailLabel}</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t.emailPlaceholder}
                  className="w-full rounded-lg border border-slate-700 bg-slate-950/60 px-4 py-3 text-sm text-white placeholder:text-slate-600 focus:border-indigo-500 focus:outline-none transition-colors"
                />
              </div>

              {errorMsg && (
                <div className="mt-4 text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-2.5">
                  {errorMsg}
                </div>
              )}

              <button
                onClick={handleSubmit}
                disabled={state === 'uploading'}
                className="mt-6 w-full rounded-lg bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 disabled:opacity-60 text-white font-semibold py-3.5 text-sm transition-all shadow-lg shadow-indigo-500/25"
              >
                {state === 'uploading' ? t.submitting : t.submitBtn}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
