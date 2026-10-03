import { useState, useRef, useEffect, useCallback } from 'react';
import {
  ArrowLeft, Send, Mic, MicOff, Brain, TrendingUp, Target,
  CheckCircle2, AlertTriangle, ChevronDown, ChevronUp,
  RefreshCw, Trophy, Zap, Users, Shield, Copy, Check
} from 'lucide-react';
import { Language } from '../types';

interface NegotiationPageProps {
  lang: Language;
  onBack: () => void;
}

type Persona = 'tough' | 'collaborative' | 'aggressive' | 'diplomatic';
type Stage = 'setup' | 'negotiating' | 'deal_reached';

interface Message {
  role: 'user' | 'ai';
  content: string;
  score?: number;
  timestamp: string;
}

interface Analysis {
  userScore: number;
  tacticsUsed: string[];
  strengths: string[];
  improvements: string[];
  nextMoveAdvice: string;
  dealProgress: number;
}

const API_BASE = 'https://elyvori-api.onrender.com';

const PERSONAS: { id: Persona; icon: string; labelEn: string; labelAr: string; descEn: string; descAr: string; color: string }[] = [
  { id: 'collaborative', icon: '🤝', labelEn: 'Collaborative', labelAr: 'تعاوني', descEn: 'Win-win seeker', descAr: 'يبحث عن مصلحة الطرفين', color: 'emerald' },
  { id: 'diplomatic', icon: '🎩', labelEn: 'Diplomatic', labelAr: 'دبلوماسي', descEn: 'Relationship-focused', descAr: 'يركز على العلاقة', color: 'blue' },
  { id: 'tough', icon: '💼', labelEn: 'Tough', labelAr: 'صعب', descEn: 'Holds firm positions', descAr: 'يتمسك بموقفه', color: 'amber' },
  { id: 'aggressive', icon: '⚡', labelEn: 'Aggressive', labelAr: 'عدواني', descEn: 'High pressure tactics', descAr: 'يستخدم الضغط', color: 'red' },
];

const CONTEXTS = [
  { id: 'salary', en: 'Salary & Compensation Negotiation', ar: 'التفاوض على الراتب والمزايا' },
  { id: 'freelance', en: 'Freelance Contract Terms', ar: 'شروط عقد الفريلانس' },
  { id: 'business', en: 'Business Partnership Deal', ar: 'صفقة شراكة تجارية' },
  { id: 'vendor', en: 'Vendor / Supplier Contract', ar: 'عقد مورّد أو موردين' },
  { id: 'real_estate', en: 'Real Estate Transaction', ar: 'صفقة عقارية' },
  { id: 'custom', en: 'Custom Scenario', ar: 'سيناريو مخصص' },
];

export function NegotiationPage({ lang, onBack }: NegotiationPageProps) {
  const [stage, setStage] = useState<Stage>('setup');
  const [persona, setPersona] = useState<Persona>('tough');
  const [contextId, setContextId] = useState('salary');
  const [customContext, setCustomContext] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [dealSummary, setDealSummary] = useState('');
  const [showAnalysis, setShowAnalysis] = useState(true);
  const [copied, setCopied] = useState(false);
  const [totalScore, setTotalScore] = useState(0);
  const [moveCount, setMoveCount] = useState(0);
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const isRtl = lang === 'ar';

  const selectedPersona = PERSONAS.find(p => p.id === persona)!;
  const selectedContext = CONTEXTS.find(c => c.id === contextId)!;
  const contextText = contextId === 'custom' ? customContext : (lang === 'en' ? selectedContext.en : selectedContext.ar);

  const t = {
    back: lang === 'en' ? 'Back' : 'رجوع',
    badge: lang === 'en' ? 'AI Negotiation Simulator' : 'محاكاة التفاوض الذكي',
    title: lang === 'en' ? 'Negotiation\nSimulator' : 'محاكاة\nالتفاوض',
    subtitle: lang === 'en'
      ? 'Practice negotiation against a smart AI counterparty. Get real-time scoring, tactics feedback, and coaching — before the real deal.'
      : 'تدرّب على التفاوض مع طرف ذكاء اصطناعي. احصل على تقييم فوري وتحليل تكتيكات وتدريب — قبل الصفقة الحقيقية.',
    choosePersona: lang === 'en' ? 'Choose AI Persona' : 'اختر شخصية الذكاء الاصطناعي',
    chooseContext: lang === 'en' ? 'Negotiation Scenario' : 'سيناريو التفاوض',
    customPlaceholder: lang === 'en' ? 'Describe your negotiation scenario...' : 'اشرح سيناريو التفاوض الخاص بك...',
    startBtn: lang === 'en' ? 'Start Simulation' : 'ابدأ المحاكاة',
    inputPlaceholder: lang === 'en' ? 'Type your negotiation move...' : 'اكتب حركتك التفاوضية...',
    analysis: lang === 'en' ? 'Real-Time Analysis' : 'التحليل الفوري',
    score: lang === 'en' ? 'Move Score' : 'نقاط الحركة',
    tactics: lang === 'en' ? 'Tactics Used' : 'التكتيكات المستخدمة',
    strengths: lang === 'en' ? 'Strengths' : 'نقاط القوة',
    improvements: lang === 'en' ? 'Improve' : 'للتحسين',
    advice: lang === 'en' ? 'Next Move Tip' : 'نصيحة حركتك القادمة',
    progress: lang === 'en' ? 'Deal Progress' : 'تقدم الصفقة',
    dealReached: lang === 'en' ? '🎉 Deal Reached!' : '🎉 تم الاتفاق!',
    dealSummary: lang === 'en' ? 'Agreed Terms' : 'الشروط المتفق عليها',
    avgScore: lang === 'en' ? 'Avg Score' : 'متوسط النقاط',
    moves: lang === 'en' ? 'Moves' : 'حركة',
    newSim: lang === 'en' ? 'New Simulation' : 'محاكاة جديدة',
    copySummary: lang === 'en' ? 'Copy Summary' : 'نسخ الملخص',
    you: lang === 'en' ? 'You' : 'أنت',
    ai: lang === 'en' ? 'AI Counterparty' : 'الطرف الآخر (AI)',
    listening: lang === 'en' ? 'Listening...' : 'أستمع...',
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim() || loading) return;
    setInput('');
    setLoading(true);

    const userMsg: Message = { role: 'user', content: text.trim(), timestamp: new Date().toISOString() };
    setMessages(prev => [...prev, userMsg]);

    try {
      const res = await fetch(`${API_BASE}/public/negotiation`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userMessage: text.trim(),
          context: contextText,
          persona,
          history: messages.map(m => ({ role: m.role, content: m.content })),
          lang,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      const aiMsg: Message = {
        role: 'ai',
        content: data.aiMessage,
        score: data.analysis?.userScore,
        timestamp: new Date().toISOString(),
      };
      setMessages(prev => [...prev, aiMsg]);
      setAnalysis(data.analysis);
      setMoveCount(prev => prev + 1);
      setTotalScore(prev => prev + (data.analysis?.userScore || 0));

      if (data.isDealReached) {
        setDealSummary(data.dealSummary || '');
        setStage('deal_reached');
      }
    } catch (e) {
      setMessages(prev => [...prev, { role: 'ai', content: lang === 'en' ? 'Error — please try again.' : 'خطأ — حاول مرة أخرى.', timestamp: new Date().toISOString() }]);
    } finally {
      setLoading(false);
    }
  }, [loading, messages, contextText, persona, lang]);

  const startVoice = () => {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) return;
    const r = new SR();
    recognitionRef.current = r;
    r.lang = lang === 'ar' ? 'ar-SA' : 'en-US';
    r.onresult = (e: any) => {
      const text = e.results[0][0].transcript;
      setInput(text);
      setIsListening(false);
    };
    r.onend = () => setIsListening(false);
    r.start();
    setIsListening(true);
  };

  const stopVoice = () => {
    recognitionRef.current?.stop();
    setIsListening(false);
  };

  const avgScore = moveCount > 0 ? Math.round(totalScore / moveCount) : 0;

  const scoreColor = (s: number) => s >= 75 ? 'text-emerald-400' : s >= 50 ? 'text-amber-400' : 'text-red-400';
  const scoreRing = (s: number) => s >= 75 ? '#10b981' : s >= 50 ? '#f59e0b' : '#ef4444';

  // Progress bar color
  const progressColor = (p: number) => p >= 75 ? '#10b981' : p >= 40 ? '#f59e0b' : '#6366f1';

  const colorMap: Record<string, string> = {
    emerald: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400',
    blue: 'border-blue-500/30 bg-blue-500/10 text-blue-400',
    amber: 'border-amber-500/30 bg-amber-500/10 text-amber-400',
    red: 'border-red-500/30 bg-red-500/10 text-red-400',
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-8">

        {/* Back */}
        <button onClick={onBack} className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors mb-8">
          <ArrowLeft className={`h-4 w-4 ${isRtl ? 'rotate-180' : ''}`} />
          {t.back}
        </button>

        {/* Setup Stage */}
        {stage === 'setup' && (
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-10">
              <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/20 bg-indigo-500/10 px-3.5 py-1.5 text-xs font-semibold text-indigo-400 mb-6">
                <Brain className="h-3.5 w-3.5" />
                {t.badge}
              </div>
              <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight mb-4 whitespace-pre-line">
                <span className="bg-gradient-to-r from-indigo-400 via-violet-300 to-purple-400 bg-clip-text text-transparent">
                  {t.title}
                </span>
              </h1>
              <p className="text-slate-300 text-sm leading-relaxed max-w-lg mx-auto">{t.subtitle}</p>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 space-y-6">
              {/* Persona */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">{t.choosePersona}</label>
                <div className="grid grid-cols-2 gap-2">
                  {PERSONAS.map(p => (
                    <button key={p.id} onClick={() => setPersona(p.id)}
                      className={`flex items-center gap-3 rounded-xl border p-3 text-left transition-all ${
                        persona === p.id
                          ? `${colorMap[p.color]} border-opacity-60`
                          : 'border-slate-800 bg-slate-950/40 text-slate-400 hover:border-slate-700'
                      }`}>
                      <span className="text-xl">{p.icon}</span>
                      <div>
                        <p className="text-sm font-semibold text-white">{lang === 'en' ? p.labelEn : p.labelAr}</p>
                        <p className="text-[11px] text-slate-500">{lang === 'en' ? p.descEn : p.descAr}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Context */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">{t.chooseContext}</label>
                <div className="grid grid-cols-2 gap-2 mb-3">
                  {CONTEXTS.map(c => (
                    <button key={c.id} onClick={() => setContextId(c.id)}
                      className={`rounded-lg border px-3 py-2 text-xs font-medium text-left transition-all ${
                        contextId === c.id
                          ? 'border-indigo-500/40 bg-indigo-500/10 text-indigo-300'
                          : 'border-slate-800 bg-slate-950/40 text-slate-400 hover:border-slate-700'
                      }`}>
                      {lang === 'en' ? c.en : c.ar}
                    </button>
                  ))}
                </div>
                {contextId === 'custom' && (
                  <textarea value={customContext} onChange={e => setCustomContext(e.target.value)}
                    placeholder={t.customPlaceholder} rows={3}
                    className="w-full rounded-xl border border-slate-700 bg-slate-950/60 px-4 py-3 text-sm text-white placeholder:text-slate-600 focus:border-indigo-500 focus:outline-none resize-none" />
                )}
              </div>

              <button
                onClick={() => setStage('negotiating')}
                disabled={contextId === 'custom' && !customContext.trim()}
                className="w-full rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 disabled:opacity-40 py-3.5 text-sm font-bold text-white transition-all shadow-lg shadow-indigo-500/25 flex items-center justify-center gap-2"
              >
                <Zap className="h-4 w-4" />
                {t.startBtn}
              </button>
            </div>
          </div>
        )}

        {/* Negotiating Stage */}
        {stage === 'negotiating' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-[calc(100vh-180px)]">

            {/* Chat Panel */}
            <div className="lg:col-span-2 flex flex-col rounded-2xl border border-slate-800 bg-slate-900/60 overflow-hidden">
              {/* Chat header */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 bg-slate-900/80 flex-shrink-0">
                <div className="flex items-center gap-3">
                  <div className={`h-9 w-9 rounded-xl flex items-center justify-center text-lg border ${colorMap[selectedPersona.color]}`}>
                    {selectedPersona.icon}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white">{lang === 'en' ? selectedPersona.labelEn : selectedPersona.labelAr}</p>
                    <p className="text-[11px] text-slate-500">{lang === 'en' ? selectedContext.en : selectedContext.ar}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-center">
                    <p className="text-xs text-slate-500">{t.avgScore}</p>
                    <p className={`text-sm font-bold ${scoreColor(avgScore)}`}>{avgScore}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-slate-500">{t.moves}</p>
                    <p className="text-sm font-bold text-white">{moveCount}</p>
                  </div>
                  <button onClick={() => { setStage('setup'); setMessages([]); setAnalysis(null); setMoveCount(0); setTotalScore(0); }}
                    className="flex items-center gap-1 text-xs text-slate-500 hover:text-white transition-colors">
                    <RefreshCw className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.length === 0 && (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                      <div className="text-4xl mb-3">{selectedPersona.icon}</div>
                      <p className="text-slate-500 text-sm">
                        {lang === 'en' ? 'Make your opening move...' : 'ابدأ بحركتك الأولى...'}
                      </p>
                    </div>
                  </div>
                )}
                {messages.map((msg, i) => (
                  <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                    <div className={`flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold ${
                      msg.role === 'user' ? 'bg-indigo-600 text-white' : `border ${colorMap[selectedPersona.color]}`
                    }`}>
                      {msg.role === 'user' ? '👤' : selectedPersona.icon}
                    </div>
                    <div className={`flex flex-col gap-1 max-w-[75%] ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                      <div className={`rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                        msg.role === 'user'
                          ? 'bg-indigo-600/20 border border-indigo-500/20 text-slate-100 rounded-tr-sm'
                          : 'bg-slate-800/60 border border-slate-700/40 text-slate-200 rounded-tl-sm'
                      }`}>
                        {msg.content}
                      </div>
                      {msg.score !== undefined && msg.role === 'ai' && (
                        <div className="flex items-center gap-1.5 px-1">
                          <div className={`text-[11px] font-bold ${scoreColor(msg.score)}`}>
                            {lang === 'en' ? 'Your move:' : 'حركتك:'} {msg.score}/100
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                {loading && (
                  <div className="flex gap-3">
                    <div className={`flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center text-xs border ${colorMap[selectedPersona.color]}`}>
                      {selectedPersona.icon}
                    </div>
                    <div className="bg-slate-800/60 border border-slate-700/40 rounded-2xl rounded-tl-sm px-4 py-3">
                      <div className="flex gap-1">
                        {[0,1,2].map(i => (
                          <div key={i} className="h-1.5 w-1.5 rounded-full bg-slate-500 animate-bounce" style={{ animationDelay: `${i*0.15}s` }} />
                        ))}
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className="flex-shrink-0 border-t border-slate-800 p-4">
                <div className="flex gap-2">
                  <button onClick={isListening ? stopVoice : startVoice}
                    className={`flex-shrink-0 h-10 w-10 rounded-xl flex items-center justify-center transition-colors ${
                      isListening ? 'bg-red-500/20 border border-red-500/30 text-red-400' : 'bg-slate-800 border border-slate-700 text-slate-400 hover:text-white'
                    }`}>
                    {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                  </button>
                  <input
                    type="text"
                    value={isListening ? t.listening : input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && sendMessage(input)}
                    placeholder={t.inputPlaceholder}
                    disabled={loading || isListening}
                    className="flex-1 rounded-xl border border-slate-700 bg-slate-950/60 px-4 py-2.5 text-sm text-white placeholder:text-slate-600 focus:border-indigo-500 focus:outline-none transition-colors disabled:opacity-50"
                  />
                  <button
                    onClick={() => sendMessage(input)}
                    disabled={loading || !input.trim()}
                    className="flex-shrink-0 h-10 w-10 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 flex items-center justify-center transition-colors"
                  >
                    <Send className="h-4 w-4 text-white" />
                  </button>
                </div>
              </div>
            </div>

            {/* Analysis Panel */}
            <div className="flex flex-col gap-3 overflow-y-auto">

              {/* Deal Progress */}
              {analysis && (
                <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-400">{t.progress}</p>
                    <p className="text-sm font-bold" style={{ color: progressColor(analysis.dealProgress) }}>{analysis.dealProgress}%</p>
                  </div>
                  <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${analysis.dealProgress}%`, background: `linear-gradient(90deg, #6366f1, ${progressColor(analysis.dealProgress)})` }} />
                  </div>
                </div>
              )}

              {/* Score Ring */}
              {analysis && (
                <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 flex items-center gap-4">
                  <div className="relative flex-shrink-0 h-16 w-16">
                    <svg className="h-full w-full -rotate-90" viewBox="0 0 60 60">
                      <circle cx="30" cy="30" r="25" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="6" />
                      <circle cx="30" cy="30" r="25" fill="none" stroke={scoreRing(analysis.userScore)} strokeWidth="6" strokeLinecap="round"
                        strokeDasharray={`${analysis.userScore * 1.57} 157`} style={{ transition: 'stroke-dasharray 0.5s ease' }} />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className={`text-sm font-extrabold ${scoreColor(analysis.userScore)}`}>{analysis.userScore}</span>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 uppercase tracking-wider">{t.score}</p>
                    <p className="text-xs text-slate-300 mt-1 leading-relaxed">{analysis.nextMoveAdvice}</p>
                  </div>
                </div>
              )}

              {/* Tactics + Strengths + Improvements */}
              {analysis && (
                <div className="rounded-xl border border-slate-800 bg-slate-900/60 overflow-hidden">
                  <button onClick={() => setShowAnalysis(!showAnalysis)}
                    className="w-full flex items-center justify-between px-4 py-3 border-b border-slate-800/60">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-3.5 w-3.5 text-indigo-400" />
                      <span className="text-xs font-bold uppercase tracking-wider text-indigo-400">{t.analysis}</span>
                    </div>
                    {showAnalysis ? <ChevronUp className="h-4 w-4 text-slate-500" /> : <ChevronDown className="h-4 w-4 text-slate-500" />}
                  </button>
                  {showAnalysis && (
                    <div className="p-4 space-y-3">
                      {analysis.tacticsUsed.length > 0 && (
                        <div>
                          <p className="text-[10px] font-bold text-slate-500 uppercase mb-1.5">{t.tactics}</p>
                          <div className="flex flex-wrap gap-1">
                            {analysis.tacticsUsed.map((t2, i) => (
                              <span key={i} className="text-[11px] px-2 py-0.5 rounded-full bg-indigo-500/15 border border-indigo-500/20 text-indigo-300">{t2}</span>
                            ))}
                          </div>
                        </div>
                      )}
                      {analysis.strengths.length > 0 && (
                        <div>
                          <p className="text-[10px] font-bold text-emerald-500 uppercase mb-1.5">{t.strengths}</p>
                          {analysis.strengths.map((s, i) => (
                            <div key={i} className="flex gap-1.5 mb-1">
                              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 flex-shrink-0 mt-0.5" />
                              <p className="text-xs text-slate-300">{s}</p>
                            </div>
                          ))}
                        </div>
                      )}
                      {analysis.improvements.length > 0 && (
                        <div>
                          <p className="text-[10px] font-bold text-amber-500 uppercase mb-1.5">{t.improvements}</p>
                          {analysis.improvements.map((imp, i) => (
                            <div key={i} className="flex gap-1.5 mb-1">
                              <AlertTriangle className="h-3.5 w-3.5 text-amber-400 flex-shrink-0 mt-0.5" />
                              <p className="text-xs text-slate-300">{imp}</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {!analysis && (
                <div className="rounded-xl border border-slate-800 bg-slate-900/30 p-6 text-center">
                  <Brain className="h-8 w-8 text-slate-700 mx-auto mb-2" />
                  <p className="text-xs text-slate-600">
                    {lang === 'en' ? 'Analysis appears after your first move' : 'التحليل يظهر بعد أول حركة'}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Deal Reached */}
        {stage === 'deal_reached' && (
          <div className="max-w-xl mx-auto text-center">
            <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-8 mb-6">
              <Trophy className="h-12 w-12 text-emerald-400 mx-auto mb-4" />
              <h2 className="text-2xl font-extrabold text-white mb-2">{t.dealReached}</h2>
              <div className="flex justify-center gap-6 mt-4 mb-6">
                <div>
                  <p className="text-xs text-slate-500">{t.avgScore}</p>
                  <p className={`text-2xl font-black ${scoreColor(avgScore)}`}>{avgScore}/100</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">{t.moves}</p>
                  <p className="text-2xl font-black text-white">{moveCount}</p>
                </div>
              </div>
              {dealSummary && (
                <div className="text-left rounded-xl border border-slate-700 bg-slate-900/60 p-4 mb-4">
                  <p className="text-xs font-bold uppercase tracking-wider text-emerald-400 mb-2">{t.dealSummary}</p>
                  <p className="text-sm text-slate-200 leading-relaxed whitespace-pre-line">{dealSummary}</p>
                </div>
              )}
              <div className="flex gap-3">
                <button onClick={() => { navigator.clipboard?.writeText(dealSummary); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
                  className="flex-1 flex items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-800 py-3 text-sm font-semibold text-white transition-colors">
                  {copied ? <><Check className="h-4 w-4 text-emerald-400" />{t.copySummary}</> : <><Copy className="h-4 w-4" />{t.copySummary}</>}
                </button>
                <button onClick={() => { setStage('setup'); setMessages([]); setAnalysis(null); setMoveCount(0); setTotalScore(0); setDealSummary(''); }}
                  className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 py-3 text-sm font-bold text-white transition-colors">
                  <RefreshCw className="h-4 w-4" />
                  {t.newSim}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
