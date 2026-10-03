import { useEffect, useState } from 'react';
import { Sparkles, Loader2, CheckCircle2, Globe } from 'lucide-react';
import { Language } from '../types';

interface LiveDemoAnimationProps {
  lang: Language;
}

const TYPED_TEXT_EN = 'Build me a website for a coffee shop...';
const TYPED_TEXT_AR = 'ابنِ لي موقعاً لمحل قهوة...';

type Phase = 'typing' | 'sending' | 'building' | 'done';

// A self-running animated mockup (no real screen recording or human
// narration needed) that loops through the exact real product flow:
// typing a request, sending it, a brief build phase, then the finished
// site appearing. This is the same style established products (Linear,
// Vercel, Stripe) use for a homepage "how it works" visual - built
// entirely in code so it never goes stale and needs no video asset.
export function LiveDemoAnimation({ lang }: LiveDemoAnimationProps) {
  const fullText = lang === 'en' ? TYPED_TEXT_EN : TYPED_TEXT_AR;
  const [phase, setPhase] = useState<Phase>('typing');
  const [typedLength, setTypedLength] = useState(0);

  useEffect(() => {
    setPhase('typing');
    setTypedLength(0);
  }, [lang]);

  // Typing effect
  useEffect(() => {
    if (phase !== 'typing') return;
    if (typedLength >= fullText.length) {
      const t = setTimeout(() => setPhase('sending'), 500);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => setTypedLength((n) => n + 1), 45);
    return () => clearTimeout(t);
  }, [phase, typedLength, fullText]);

  // Phase progression: sending -> building -> done -> (reset) typing
  useEffect(() => {
    if (phase === 'sending') {
      const t = setTimeout(() => setPhase('building'), 900);
      return () => clearTimeout(t);
    }
    if (phase === 'building') {
      const t = setTimeout(() => setPhase('done'), 1800);
      return () => clearTimeout(t);
    }
    if (phase === 'done') {
      const t = setTimeout(() => {
        setTypedLength(0);
        setPhase('typing');
      }, 2600);
      return () => clearTimeout(t);
    }
  }, [phase]);

  return (
    <div className="mx-auto max-w-lg rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xl overflow-hidden">
      {/* Fake browser chrome */}
      <div className="flex items-center gap-1.5 px-4 py-2.5 bg-slate-100 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800">
        <span className="h-2.5 w-2.5 rounded-full bg-red-400" />
        <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
        <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
      </div>

      <div className="p-5 sm:p-6 min-h-[220px] flex flex-col justify-center">
        {(phase === 'typing' || phase === 'sending') && (
          <div>
            <div className="flex items-center gap-2 mb-3 text-xs font-semibold text-indigo-600 dark:text-indigo-400">
              <Sparkles className="h-3.5 w-3.5" />
              {lang === 'en' ? 'Dispatch Objective' : 'إرسال الهدف'}
            </div>
            <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 px-3.5 py-3 text-sm text-slate-700 dark:text-slate-200 min-h-[52px]">
              {fullText.slice(0, typedLength)}
              <span className="inline-block w-0.5 h-4 bg-indigo-500 ml-0.5 animate-pulse align-middle" />
            </div>
            {phase === 'sending' && (
              <div className="mt-3 text-xs text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5" />
                {lang === 'en' ? 'Request sent' : 'تم إرسال الطلب'}
              </div>
            )}
          </div>
        )}

        {phase === 'building' && (
          <div className="flex flex-col items-center justify-center py-6 text-center">
            <Loader2 className="h-8 w-8 text-indigo-500 animate-spin mb-3" />
            <div className="text-sm font-medium text-slate-700 dark:text-slate-200">
              {lang === 'en' ? 'Building your website...' : 'يتم بناء موقعك...'}
            </div>
            <div className="text-xs text-slate-400 mt-1">
              {lang === 'en' ? 'Writing code, designing, deploying' : 'كتابة الكود، التصميم، النشر'}
            </div>
          </div>
        )}

        {phase === 'done' && (
          <div className="animate-in fade-in duration-500">
            <div className="flex items-center gap-2 mb-3 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
              <Globe className="h-3.5 w-3.5" />
              {lang === 'en' ? 'Ready to view' : 'جاهز للمعاينة'}
            </div>
            <div className="rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700">
              <div className="h-24 bg-gradient-to-br from-indigo-500 via-purple-500 to-indigo-600 flex items-center justify-center">
                <span className="text-white font-bold text-sm tracking-wide">
                  {lang === 'en' ? '☕ Sunrise Coffee Co.' : '☕ مقهى الشروق'}
                </span>
              </div>
              <div className="p-3 bg-white dark:bg-slate-800 space-y-1.5">
                <div className="h-2 w-3/4 rounded bg-slate-200 dark:bg-slate-700" />
                <div className="h-2 w-1/2 rounded bg-slate-200 dark:bg-slate-700" />
              </div>
            </div>
            <div className="mt-3 text-xs text-slate-400 text-center">
              {lang === 'en' ? 'Built in ~3 minutes, with a real backend and database' : 'بُني خلال ~3 دقايق، بخادم وقاعدة بيانات حقيقيين'}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
