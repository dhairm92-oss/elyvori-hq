import { useState, useRef, useCallback } from 'react';
import {
  Shield, Upload, FileText, AlertTriangle, CheckCircle2,
  DollarSign, ArrowLeft, Loader2, ChevronDown, ChevronUp,
  Copy, Check, RefreshCw, Scale
} from 'lucide-react';
import { Language } from '../types';

interface ContractAnalyzerPageProps {
  lang: Language;
  onBack: () => void;
}

interface RedFlag {
  clause: string;
  risk: string;
  severity: 'high' | 'medium' | 'low';
}

interface FinancialRisk {
  issue: string;
  explanation: string;
}

interface CounterProposal {
  original: string;
  suggested: string;
  reason: string;
}

interface AnalysisResult {
  safetyScore: number;
  verdict: string;
  summary: string;
  redFlags: RedFlag[];
  financialRisks: FinancialRisk[];
  counterProposals: CounterProposal[];
}

type Stage = 'idle' | 'analyzing' | 'done' | 'error';

const API_BASE = 'https://elyvori-api.onrender.com';

export function ContractAnalyzerPage({ lang, onBack }: ContractAnalyzerPageProps) {
  const [stage, setStage] = useState<Stage>('idle');
  const [file, setFile] = useState<File | null>(null);
  const [rawText, setRawText] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [expandedFlags, setExpandedFlags] = useState<Set<number>>(new Set([0]));
  const [expandedProposals, setExpandedProposals] = useState<Set<number>>(new Set());
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<'upload' | 'paste'>('upload');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isRtl = lang === 'ar';

  const t = {
    back: lang === 'en' ? 'Back to Elyvori' : 'العودة إلى إليفوري',
    badge: lang === 'en' ? 'AI Legal Guard' : 'الحارس القانوني الذكي',
    title: lang === 'en' ? 'Contract Risk\nAnalyzer' : 'محلل مخاطر\nالعقود',
    subtitle: lang === 'en'
      ? 'Upload any contract and get an instant forensic risk report — red flags, financial traps, and ready-to-use counter-proposals to protect your interests.'
      : 'ارفع أي عقد واحصل على تقرير مخاطر فوري — البنود الخطرة، الفخاخ المالية، ومقترحات تعديل جاهزة لحماية مصالحك.',
    uploadTab: lang === 'en' ? 'Upload PDF' : 'رفع PDF',
    pasteTab: lang === 'en' ? 'Paste Text' : 'لصق النص',
    dropzone: lang === 'en' ? 'Drop contract PDF here' : 'اسحب ملف العقد هنا',
    dropzoneSub: lang === 'en' ? 'or click to browse — PDF only, max 10MB' : 'أو اضغط للاختيار — PDF فقط، حتى 10 ميجابايت',
    pasteLabel: lang === 'en' ? 'Paste contract text here' : 'الصق نص العقد هنا',
    pastePlaceholder: lang === 'en'
      ? 'Paste the full contract text here for analysis...'
      : 'الصق النص الكامل للعقد هنا للتحليل...',
    analyze: lang === 'en' ? 'Analyze Contract' : 'حلّل العقد',
    analyzing: lang === 'en' ? 'Running forensic analysis...' : 'جاري التحليل الجنائي...',
    analyzeAgain: lang === 'en' ? 'Analyze Another Contract' : 'حلّل عقداً آخر',
    safetyScore: lang === 'en' ? 'Safety Score' : 'نقاط الأمان',
    verdict: lang === 'en' ? 'Verdict' : 'الحكم',
    summary: lang === 'en' ? 'Executive Summary' : 'الملخص التنفيذي',
    redFlags: lang === 'en' ? 'Red Flag Clauses' : 'البنود الخطرة',
    financialRisks: lang === 'en' ? 'Financial & Liability Risks' : 'المخاطر المالية والمسؤولية',
    counterProposals: lang === 'en' ? 'Actionable Counter-Proposals' : 'مقترحات التعديل القابلة للتطبيق',
    original: lang === 'en' ? 'Original Clause' : 'البند الأصلي',
    suggested: lang === 'en' ? 'Suggested Rewrite' : 'الصياغة المقترحة',
    reason: lang === 'en' ? 'Why this change' : 'سبب التغيير',
    copy: lang === 'en' ? 'Copy' : 'نسخ',
    copied: lang === 'en' ? 'Copied!' : 'تم النسخ!',
    viewDetails: lang === 'en' ? 'View details' : 'عرض التفاصيل',
    hideDetails: lang === 'en' ? 'Hide details' : 'إخفاء التفاصيل',
    noFile: lang === 'en' ? 'Please upload a PDF or paste contract text.' : 'الرجاء رفع ملف PDF أو لصق نص العقد.',
    errorGeneric: lang === 'en' ? 'Analysis failed. Please try again.' : 'فشل التحليل. الرجاء المحاولة مرة أخرى.',
    disclaimer: lang === 'en'
      ? '⚖️ This is AI-powered contractual analysis, not formal legal counsel. Consult a licensed attorney for binding legal advice.'
      : '⚖️ هذا تحليل عقدي بالذكاء الاصطناعي وليس استشارة قانونية رسمية. استشر محامياً مرخصاً للحصول على مشورة قانونية ملزمة.',
    severityHigh: lang === 'en' ? 'High Risk' : 'خطر عالٍ',
    severityMedium: lang === 'en' ? 'Medium Risk' : 'خطر متوسط',
    severityLow: lang === 'en' ? 'Low Risk' : 'خطر منخفض',
  };

  const severityConfig = {
    high: { label: t.severityHigh, bg: 'bg-red-500/15', border: 'border-red-500/30', text: 'text-red-400', dot: 'bg-red-500' },
    medium: { label: t.severityMedium, bg: 'bg-amber-500/15', border: 'border-amber-500/30', text: 'text-amber-400', dot: 'bg-amber-500' },
    low: { label: t.severityLow, bg: 'bg-blue-500/15', border: 'border-blue-500/30', text: 'text-blue-400', dot: 'bg-blue-500' },
  };

  const scoreColor = (score: number) => {
    if (score >= 75) return { text: 'text-emerald-400', ring: 'text-emerald-500', bg: 'from-emerald-500 to-teal-500' };
    if (score >= 50) return { text: 'text-amber-400', ring: 'text-amber-500', bg: 'from-amber-500 to-orange-500' };
    return { text: 'text-red-400', ring: 'text-red-500', bg: 'from-red-500 to-rose-600' };
  };

  const handleFileSelect = (f: File | null) => {
    if (!f) return;
    if (f.type !== 'application/pdf') { setErrorMsg(t.noFile); return; }
    setErrorMsg('');
    setFile(f);
  };

  const handleAnalyze = useCallback(async () => {
    if (activeTab === 'upload' && !file) { setErrorMsg(t.noFile); return; }
    if (activeTab === 'paste' && !rawText.trim()) { setErrorMsg(t.noFile); return; }
    setErrorMsg('');
    setStage('analyzing');

    try {
      let res: Response;
      if (activeTab === 'upload' && file) {
        const formData = new FormData();
        formData.append('contract', file);
        res = await fetch(`${API_BASE}/public/contract-analyzer`, { method: 'POST', body: formData });
      } else {
        const formData = new FormData();
        formData.append('text', rawText);
        res = await fetch(`${API_BASE}/public/contract-analyzer`, { method: 'POST', body: formData });
      }
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error((err as any).message || 'Analysis failed');
      }
      const data = await res.json();
      setResult(data);
      setStage('done');
    } catch (e: any) {
      setErrorMsg(e.message || t.errorGeneric);
      setStage('error');
    }
  }, [activeTab, file, rawText, t.noFile, t.errorGeneric]);

  const resetForm = () => {
    setStage('idle');
    setFile(null);
    setRawText('');
    setResult(null);
    setErrorMsg('');
    setExpandedFlags(new Set([0]));
    setExpandedProposals(new Set());
  };

  const copyText = (text: string, idx: number) => {
    navigator.clipboard?.writeText(text).then(() => {
      setCopiedIndex(idx);
      setTimeout(() => setCopiedIndex(null), 2000);
    });
  };

  const toggleFlag = (i: number) => {
    setExpandedFlags(prev => { const n = new Set(prev); if (n.has(i)) n.delete(i); else n.add(i); return n; });
  };

  const toggleProposal = (i: number) => {
    setExpandedProposals(prev => { const n = new Set(prev); if (n.has(i)) n.delete(i); else n.add(i); return n; });
  };

  const colors = result ? scoreColor(result.safetyScore) : scoreColor(0);

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
            <div className="inline-flex items-center gap-2 rounded-full border border-violet-500/20 bg-violet-500/10 px-3.5 py-1.5 text-xs font-semibold text-violet-400 mb-6">
              <Scale className="h-3.5 w-3.5" />
              <span>{t.badge}</span>
            </div>
            <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight leading-tight mb-6 whitespace-pre-line">
              <span className="bg-gradient-to-r from-violet-400 via-purple-300 to-indigo-400 bg-clip-text text-transparent">
                {t.title}
              </span>
            </h1>
            <p className="text-slate-300 text-base sm:text-lg leading-relaxed max-w-xl mx-auto">{t.subtitle}</p>
          </div>
        )}

        {/* Input card */}
        {stage !== 'done' && (
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 backdrop-blur-sm p-6 sm:p-8 shadow-2xl">
            {stage === 'analyzing' ? (
              <div className="text-center py-10">
                <div className="relative mx-auto mb-6 flex h-16 w-16 items-center justify-center">
                  <div className="absolute inset-0 rounded-full bg-violet-500/20 animate-ping" />
                  <Shield className="h-8 w-8 text-violet-400 relative z-10" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">{t.analyzing}</h3>
                <div className="flex justify-center gap-1.5 mt-5">
                  {['Parsing document...', 'Identifying clauses...', 'Scoring risks...', 'Writing counter-proposals...'].map((step, i) => (
                    <div key={i} className="h-1.5 w-1.5 rounded-full bg-violet-500 animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
                  ))}
                </div>
              </div>
            ) : (
              <>
                {/* Tabs */}
                <div className="flex gap-2 mb-6">
                  {(['upload', 'paste'] as const).map(tab => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-semibold transition-all ${
                        activeTab === tab
                          ? 'bg-violet-600 text-white'
                          : 'text-slate-400 hover:text-white hover:bg-slate-800'
                      }`}
                    >
                      {tab === 'upload' ? <FileText className="h-3.5 w-3.5" /> : <RefreshCw className="h-3.5 w-3.5" />}
                      {tab === 'upload' ? t.uploadTab : t.pasteTab}
                    </button>
                  ))}
                </div>

                {activeTab === 'upload' ? (
                  <div
                    onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={e => { e.preventDefault(); setIsDragging(false); handleFileSelect(e.dataTransfer.files?.[0] ?? null); }}
                    onClick={() => fileInputRef.current?.click()}
                    className={`rounded-xl border-2 border-dashed p-8 text-center cursor-pointer transition-colors ${
                      isDragging ? 'border-violet-400 bg-violet-500/10'
                      : file ? 'border-emerald-500/50 bg-emerald-500/5'
                      : 'border-slate-700 hover:border-slate-600 bg-slate-950/40'
                    }`}
                  >
                    <input ref={fileInputRef} type="file" accept="application/pdf" className="hidden"
                      onChange={e => handleFileSelect(e.target.files?.[0] ?? null)} />
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
                          <div className="text-sm font-semibold text-white">{t.dropzone}</div>
                          <div className="text-xs text-slate-500 mt-1">{t.dropzoneSub}</div>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <textarea
                    value={rawText}
                    onChange={e => setRawText(e.target.value)}
                    placeholder={t.pastePlaceholder}
                    rows={8}
                    className="w-full rounded-xl border border-slate-700 bg-slate-950/60 px-4 py-3 text-sm text-white placeholder:text-slate-600 focus:border-violet-500 focus:outline-none resize-none transition-colors"
                  />
                )}

                {errorMsg && (
                  <div className="mt-4 text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-2.5">{errorMsg}</div>
                )}

                <button
                  onClick={handleAnalyze}
                  disabled={stage === 'analyzing'}
                  className="mt-6 w-full rounded-lg bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 disabled:opacity-60 text-white font-semibold py-3.5 text-sm transition-all shadow-lg shadow-violet-500/25 flex items-center justify-center gap-2"
                >
                  <Shield className="h-4 w-4" />
                  {t.analyze}
                </button>

                <p className="mt-4 text-[11px] text-slate-600 text-center leading-relaxed">{t.disclaimer}</p>
              </>
            )}
          </div>
        )}

        {/* Results */}
        {stage === 'done' && result && (
          <div className="space-y-5">
            {/* Safety Score */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 flex flex-col sm:flex-row items-center gap-6">
              {/* Score ring */}
              <div className="relative flex-shrink-0 flex h-28 w-28 items-center justify-center">
                <svg className="absolute inset-0 h-full w-full -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="8" />
                  <circle
                    cx="50" cy="50" r="42" fill="none"
                    stroke="currentColor" strokeWidth="8" strokeLinecap="round"
                    className={colors.ring}
                    strokeDasharray={`${result.safetyScore * 2.64} 264`}
                    style={{ transition: 'stroke-dasharray 1s ease' }}
                  />
                </svg>
                <div className="text-center">
                  <div className={`text-2xl font-extrabold ${colors.text}`}>{result.safetyScore}</div>
                  <div className="text-[10px] text-slate-500 font-medium">/100</div>
                </div>
              </div>
              <div className="flex-1 text-center sm:text-left">
                <p className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-1">{t.safetyScore}</p>
                <div className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold mb-3 bg-gradient-to-r ${colors.bg} text-white`}>
                  {result.safetyScore >= 75 ? <CheckCircle2 className="h-3.5 w-3.5" /> : <AlertTriangle className="h-3.5 w-3.5" />}
                  {result.safetyScore >= 75 ? (lang === 'en' ? 'Generally Safe' : 'آمن بشكل عام') :
                   result.safetyScore >= 50 ? (lang === 'en' ? 'Negotiate First' : 'تفاوض أولاً') :
                   (lang === 'en' ? 'High Risk — Review Carefully' : 'خطر عالٍ — راجع بعناية')}
                </div>
                <p className="text-sm text-slate-300 leading-relaxed">{result.verdict}</p>
              </div>
            </div>

            {/* Summary */}
            <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-violet-400 mb-2">{t.summary}</h3>
              <p className="text-sm text-slate-300 leading-relaxed">{result.summary}</p>
            </div>

            {/* Red Flags */}
            {result.redFlags.length > 0 && (
              <div className="rounded-xl border border-slate-800 bg-slate-900/50 overflow-hidden">
                <div className="px-5 py-4 border-b border-slate-800 flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-red-400" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-red-400">{t.redFlags}</h3>
                  <span className="ml-auto text-[11px] font-semibold px-2 py-0.5 rounded-full bg-red-500/15 text-red-400">{result.redFlags.length}</span>
                </div>
                <div className="divide-y divide-slate-800/60">
                  {result.redFlags.map((flag, i) => {
                    const sev = severityConfig[flag.severity] || severityConfig.medium;
                    return (
                      <div key={i} className={`p-4 ${sev.bg} border-l-2 ${sev.border}`}>
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-2">
                            <div className={`h-2 w-2 rounded-full flex-shrink-0 mt-0.5 ${sev.dot}`} />
                            <span className={`text-[11px] font-bold uppercase tracking-wider ${sev.text}`}>{sev.label}</span>
                          </div>
                          <button onClick={() => toggleFlag(i)} className="text-slate-500 hover:text-white transition-colors">
                            {expandedFlags.has(i) ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                          </button>
                        </div>
                        {expandedFlags.has(i) && (
                          <div className="mt-3 space-y-2">
                            <div className="rounded-lg bg-slate-950/60 border border-slate-800 px-3 py-2">
                              <p className="text-[11px] font-semibold text-slate-500 mb-1">{lang === 'en' ? 'Clause' : 'البند'}</p>
                              <p className="text-xs text-slate-300 italic leading-relaxed">"{flag.clause}"</p>
                            </div>
                            <p className="text-xs text-slate-300 leading-relaxed">{flag.risk}</p>
                          </div>
                        )}
                        {!expandedFlags.has(i) && (
                          <p className="mt-2 text-xs text-slate-400 line-clamp-1 pl-4">"{flag.clause}"</p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Financial Risks */}
            {result.financialRisks.length > 0 && (
              <div className="rounded-xl border border-slate-800 bg-slate-900/50 overflow-hidden">
                <div className="px-5 py-4 border-b border-slate-800 flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-amber-400" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400">{t.financialRisks}</h3>
                </div>
                <div className="p-4 space-y-3">
                  {result.financialRisks.map((risk, i) => (
                    <div key={i} className="flex gap-3">
                      <div className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-amber-500" />
                      <div>
                        <p className="text-sm font-semibold text-white">{risk.issue}</p>
                        <p className="text-xs text-slate-400 leading-relaxed mt-0.5">{risk.explanation}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Counter-proposals */}
            {result.counterProposals.length > 0 && (
              <div className="rounded-xl border border-slate-800 bg-slate-900/50 overflow-hidden">
                <div className="px-5 py-4 border-b border-slate-800 flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-400">{t.counterProposals}</h3>
                </div>
                <div className="divide-y divide-slate-800/60">
                  {result.counterProposals.map((proposal, i) => (
                    <div key={i} className="p-4">
                      <button onClick={() => toggleProposal(i)} className="w-full flex items-center justify-between text-left gap-3">
                        <p className="text-sm font-semibold text-white line-clamp-1">{proposal.original}</p>
                        {expandedProposals.has(i) ? <ChevronUp className="h-4 w-4 text-slate-500 flex-shrink-0" /> : <ChevronDown className="h-4 w-4 text-slate-500 flex-shrink-0" />}
                      </button>
                      {expandedProposals.has(i) && (
                        <div className="mt-3 space-y-3">
                          <div className="rounded-lg border border-red-500/20 bg-red-500/5 px-3 py-2.5">
                            <p className="text-[10px] font-bold uppercase tracking-wider text-red-400 mb-1">{t.original}</p>
                            <p className="text-xs text-slate-300 italic leading-relaxed">"{proposal.original}"</p>
                          </div>
                          <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/5 px-3 py-2.5">
                            <div className="flex items-center justify-between mb-1">
                              <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">{t.suggested}</p>
                              <button onClick={() => copyText(proposal.suggested, i)} className="inline-flex items-center gap-1 text-[10px] font-semibold text-slate-400 hover:text-white transition-colors">
                                {copiedIndex === i ? <><Check className="h-3 w-3 text-emerald-400" />{t.copied}</> : <><Copy className="h-3 w-3" />{t.copy}</>}
                              </button>
                            </div>
                            <p className="text-xs text-emerald-200 leading-relaxed">{proposal.suggested}</p>
                          </div>
                          <p className="text-xs text-slate-500 leading-relaxed italic">{proposal.reason}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Disclaimer + Reset */}
            <div className="rounded-xl border border-slate-800/50 bg-slate-900/30 px-5 py-4">
              <p className="text-[11px] text-slate-600 leading-relaxed text-center">{t.disclaimer}</p>
            </div>
            <div className="text-center pt-2">
              <button onClick={resetForm} className="text-sm font-semibold text-violet-400 hover:text-violet-300 transition-colors">
                {t.analyzeAgain}
              </button>
            </div>
          </div>
        )}

        {/* Error state */}
        {stage === 'error' && (
          <div className="mt-6 rounded-xl border border-red-500/20 bg-red-500/10 p-5 text-center">
            <AlertTriangle className="h-8 w-8 text-red-400 mx-auto mb-3" />
            <p className="text-sm text-red-300 mb-4">{errorMsg}</p>
            <button onClick={resetForm} className="text-sm font-semibold text-violet-400 hover:text-violet-300 transition-colors">
              {t.analyzeAgain}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
