import { useState, useRef, useEffect } from 'react';
import {
  Sparkles,
  Upload,
  FileText,
  CheckCircle2,
  Search,
  Target,
  Mail,
  ArrowLeft,
  Loader2,
  ExternalLink,
  Copy,
  Check,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { Language } from '../types';

interface CareerAgentPageProps {
  lang: Language;
  onBack: () => void;
}

type Stage = 'idle' | 'uploading' | 'processing' | 'done' | 'error';

interface JobMatch {
  company: string;
  role: string;
  matchScore: number;
  applyUrl: string;
  whyMatch: string;
  coverLetter: string | null;
}

interface CareerAgentResult {
  profile: {
    name: string | null;
    summary: string;
    technicalSkills: string[];
  };
  atsOptimization: { keyImprovements: string[]; optimizedBullets: string[] } | null;
  matches: JobMatch[];
}

// A dedicated, full-page experience for the Career Agent - browsable
// results shown directly on the page (not only delivered by email),
// since seeing real matches appear live is what makes the result feel
// trustworthy and professional, the same way a real job board works.
// Polls the backend job-status endpoint every few seconds after upload
// until the pipeline finishes, then renders the report inline.
export function CareerAgentPage({ lang, onBack }: CareerAgentPageProps) {
  const [file, setFile] = useState<File | null>(null);
  const [email, setEmail] = useState('');
  const [stage, setStage] = useState<Stage>('idle');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [result, setResult] = useState<CareerAgentResult | null>(null);
  const [atsExpanded, setAtsExpanded] = useState(false);
  const [expandedLetters, setExpandedLetters] = useState<Set<number>>(new Set());
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const isRtl = lang === 'ar';

  const t = {
    back: lang === 'en' ? 'Back to Elyvori' : 'العودة إلى إليفوري',
    badge: lang === 'en' ? 'AI Career Agent' : 'وكيل التوظيف الذكي',
    title: lang === 'en' ? 'Your Next Job,\nFound by AI' : 'وظيفتك القادمة،\nيجدها الذكاء الاصطناعي',
    subtitle:
      lang === 'en'
        ? 'Upload your resume. Our AI deeply analyzes your skills, optimizes your resume for ATS, searches real current job openings, and writes a personalized cover letter for each match — shown right here, and backed up to your inbox.'
        : 'ارفع سيرتك الذاتية. يحلل ذكاؤنا الاصطناعي مهاراتك، يحسّن سيرتك لأنظمة الفرز الآلي، يبحث عن وظائف حقيقية متاحة الآن، ويكتب رسالة تغطية مخصصة لكل تطابق — تظهر هنا مباشرة، وتصلك أيضاً على بريدك.',
    steps: [
      { icon: FileText, label: lang === 'en' ? 'Deep Resume Parsing' : 'تحليل عميق للسيرة الذاتية' },
      { icon: Target, label: lang === 'en' ? 'ATS Optimization' : 'تحسين للفرز الآلي' },
      { icon: Search, label: lang === 'en' ? 'Real Job Market Search' : 'بحث حقيقي بسوق العمل' },
      { icon: Mail, label: lang === 'en' ? 'Live Results + Email' : 'نتائج حية + إيميل' },
    ],
    dropzoneTitle: lang === 'en' ? 'Drop your resume here' : 'اسحب سيرتك الذاتية هنا',
    dropzoneSubtitle: lang === 'en' ? 'or click to browse — PDF only, max 10MB' : 'أو اضغط للاختيار — PDF فقط، حتى 10 ميجابايت',
    emailLabel: lang === 'en' ? 'Your Email Address' : 'بريدك الإلكتروني',
    emailPlaceholder: lang === 'en' ? 'you@example.com' : 'you@example.com',
    submitBtn: lang === 'en' ? 'Analyze My Resume' : 'حلّل سيرتي الذاتية',
    submitting: lang === 'en' ? 'Uploading...' : 'جاري الرفع...',
    processingTitle: lang === 'en' ? 'Analyzing your resume...' : 'جاري تحليل سيرتك الذاتية...',
    processingSubtitle:
      lang === 'en'
        ? 'This usually takes 1-3 minutes - searching real job listings takes real time. Feel free to keep this tab open.'
        : 'عادة تأخذ 1-3 دقائق - البحث عن وظائف حقيقية يأخذ وقتاً فعلياً. اترك هذا التبويب مفتوحاً.',
    another: lang === 'en' ? 'Analyze Another Resume' : 'حلّل سيرة ذاتية أخرى',
    errorFileType: lang === 'en' ? 'Please upload a PDF file.' : 'الرجاء رفع ملف بصيغة PDF.',
    errorEmail: lang === 'en' ? 'Please enter a valid email address.' : 'الرجاء إدخال بريد إلكتروني صحيح.',
    errorGeneric: lang === 'en' ? 'Something went wrong. Please try again.' : 'حدث خطأ ما. الرجاء المحاولة مرة أخرى.',
    atsTitle: lang === 'en' ? 'ATS-Optimized Resume Summary' : 'ملخص السيرة الذاتية المحسّنة',
    keyImprovements: lang === 'en' ? 'Key improvements made' : 'التحسينات الرئيسية',
    optimizedBullets: lang === 'en' ? 'Rewritten bullet points' : 'النقاط المعاد صياغتها',
    candidateSummary: lang === 'en' ? 'Candidate Summary' : 'ملخص المرشح',
    matchedJobs: lang === 'en' ? 'Matched Opportunities' : 'الوظائف المطابقة',
    match: lang === 'en' ? 'Match' : 'تطابق',
    apply: lang === 'en' ? 'Apply Now' : 'قدّم الآن',
    viewLetter: lang === 'en' ? 'View Cover Letter' : 'عرض رسالة التغطية',
    hideLetter: lang === 'en' ? 'Hide Cover Letter' : 'إخفاء رسالة التغطية',
    copy: lang === 'en' ? 'Copy' : 'نسخ',
    copied: lang === 'en' ? 'Copied!' : 'تم النسخ!',
    emailBackup: lang === 'en' ? "A full copy of this report was also sent to your email." : 'تم إرسال نسخة كاملة من هذا التقرير إلى بريدك الإلكتروني أيضاً.',
    noMatches: lang === 'en' ? 'No genuine job matches were found this time - try again shortly.' : 'لم يتم العثور على وظائف مطابقة حقيقية هذه المرة - حاول مرة أخرى بعد قليل.',
  };

  useEffect(() => {
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, []);

  const handleFileSelect = (selected: File | null) => {
    if (!selected) return;
    if (selected.type !== 'application/pdf') {
      setErrorMsg(t.errorFileType);
      return;
    }
    setErrorMsg(null);
    setFile(selected);
  };

  const pollJob = (jobId: string) => {
    pollRef.current = setInterval(async () => {
      try {
        const res = await fetch(`https://elyvori-api.onrender.com/public/career-agent/${jobId}`);
        if (!res.ok) return;
        const data = await res.json();
        if (data.status === 'done') {
          if (pollRef.current) clearInterval(pollRef.current);
          setResult(data.result);
          setStage('done');
        } else if (data.status === 'failed') {
          if (pollRef.current) clearInterval(pollRef.current);
          setErrorMsg(data.error || t.errorGeneric);
          setStage('error');
        }
        // status === 'processing' -> keep polling silently
      } catch {
        // transient network hiccup - keep polling, don't fail the whole flow
      }
    }, 3000);
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
    setStage('uploading');

    try {
      const formData = new FormData();
      formData.append('resume', file);
      formData.append('email', email);

      const response = await fetch('https://elyvori-api.onrender.com/public/career-agent', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Request failed');
      const data = await response.json();
      if (!data.jobId) throw new Error('No job ID returned');

      setStage('processing');
      pollJob(data.jobId);
    } catch {
      setErrorMsg(t.errorGeneric);
      setStage('error');
    }
  };

  const resetForm = () => {
    if (pollRef.current) clearInterval(pollRef.current);
    setFile(null);
    setEmail('');
    setStage('idle');
    setErrorMsg(null);
    setResult(null);
    setAtsExpanded(false);
    setExpandedLetters(new Set());
  };

  const toggleLetter = (index: number) => {
    setExpandedLetters((prev) => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  };

  const copyLetter = (text: string, index: number) => {
    navigator.clipboard?.writeText(text).then(() => {
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000);
    });
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

        {stage !== 'done' && (
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
        )}

        {stage !== 'done' && (
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
        )}

        {/* Upload / processing / error card */}
        {stage !== 'done' && (
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 backdrop-blur-sm p-6 sm:p-10 shadow-2xl">
            {stage === 'processing' ? (
              <div className="text-center py-8">
                <Loader2 className="h-10 w-10 text-indigo-400 animate-spin mx-auto mb-5" />
                <h3 className="text-xl font-bold text-white mb-3">{t.processingTitle}</h3>
                <p className="text-slate-400 text-sm leading-relaxed max-w-md mx-auto">{t.processingSubtitle}</p>
              </div>
            ) : (
              <>
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
                  disabled={stage === 'uploading'}
                  className="mt-6 w-full rounded-lg bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 disabled:opacity-60 text-white font-semibold py-3.5 text-sm transition-all shadow-lg shadow-indigo-500/25"
                >
                  {stage === 'uploading' ? t.submitting : t.submitBtn}
                </button>
              </>
            )}
          </div>
        )}

        {/* Results view */}
        {stage === 'done' && result && (
          <div className="space-y-6">
            <div className="text-center mb-4">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-400">
                <CheckCircle2 className="h-7 w-7" />
              </div>
              <h2 className="text-2xl font-bold text-white">
                {result.matches.length > 0
                  ? `${result.matches.length} ${t.matchedJobs}`
                  : t.noMatches}
              </h2>
              <p className="text-xs text-slate-500 mt-2">{t.emailBackup}</p>
            </div>

            {/* Candidate summary */}
            <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-400 mb-2">
                {t.candidateSummary}
              </h3>
              <p className="text-sm text-slate-300 leading-relaxed">{result.profile.summary}</p>
              {result.profile.technicalSkills.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {result.profile.technicalSkills.slice(0, 12).map((skill, i) => (
                    <span
                      key={i}
                      className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-slate-800 text-slate-300"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* ATS optimization (collapsible) */}
            {result.atsOptimization && (
              <div className="rounded-xl border border-slate-800 bg-slate-900/50 overflow-hidden">
                <button
                  onClick={() => setAtsExpanded(!atsExpanded)}
                  className="w-full flex items-center justify-between p-5 text-left"
                >
                  <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-400">{t.atsTitle}</h3>
                  {atsExpanded ? (
                    <ChevronUp className="h-4 w-4 text-slate-400" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-slate-400" />
                  )}
                </button>
                {atsExpanded && (
                  <div className="px-5 pb-5 space-y-4">
                    <div>
                      <div className="text-[11px] font-semibold text-slate-500 mb-1.5">{t.keyImprovements}</div>
                      <ul className="space-y-1">
                        {result.atsOptimization.keyImprovements.map((imp, i) => (
                          <li key={i} className="text-xs text-slate-300 flex items-start gap-1.5">
                            <span className="text-emerald-400">•</span> {imp}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <div className="text-[11px] font-semibold text-slate-500 mb-1.5">{t.optimizedBullets}</div>
                      <ul className="space-y-1.5">
                        {result.atsOptimization.optimizedBullets.map((b, i) => (
                          <li key={i} className="text-xs text-slate-300 flex items-start gap-1.5">
                            <span className="text-indigo-400">•</span> {b}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Job matches */}
            {result.matches.map((m, i) => (
              <div key={i} className="rounded-xl border border-slate-800 bg-slate-900/50 p-5">
                <div className="flex items-start justify-between gap-4 mb-2">
                  <div>
                    <h4 className="text-base font-bold text-white">{m.role}</h4>
                    <p className="text-sm text-slate-400">{m.company}</p>
                  </div>
                  <span className="shrink-0 text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-400">
                    {m.matchScore}% {t.match}
                  </span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed mb-4">{m.whyMatch}</p>

                <div className="flex flex-wrap items-center gap-3">
                  <a
                    href={m.applyUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 px-3.5 py-2 rounded-lg transition-colors"
                  >
                    {t.apply} <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                  {m.coverLetter && (
                    <button
                      onClick={() => toggleLetter(i)}
                      className="text-xs font-medium text-indigo-400 hover:text-indigo-300 transition-colors"
                    >
                      {expandedLetters.has(i) ? t.hideLetter : t.viewLetter}
                    </button>
                  )}
                </div>

                {m.coverLetter && expandedLetters.has(i) && (
                  <div className="mt-4 rounded-lg border border-slate-800 bg-slate-950/60 p-4">
                    <div className="flex justify-end mb-2">
                      <button
                        onClick={() => copyLetter(m.coverLetter!, i)}
                        className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-400 hover:text-white transition-colors"
                      >
                        {copiedIndex === i ? (
                          <>
                            <Check className="h-3 w-3 text-emerald-400" /> {t.copied}
                          </>
                        ) : (
                          <>
                            <Copy className="h-3 w-3" /> {t.copy}
                          </>
                        )}
                      </button>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-line">{m.coverLetter}</p>
                  </div>
                )}
              </div>
            ))}

            <div className="text-center pt-2">
              <button
                onClick={resetForm}
                className="text-sm font-semibold text-indigo-400 hover:text-indigo-300 transition-colors"
              >
                {t.another}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
