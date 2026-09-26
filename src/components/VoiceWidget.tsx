import { useState, useRef, useCallback } from 'react';
import { Mic, MicOff, X, Loader2 } from 'lucide-react';
import { Language } from '../types';

interface VoiceWidgetProps {
  lang: Language;
}

type VoiceState = 'idle' | 'listening' | 'thinking' | 'error';

const API_BASE = 'https://elyvori-api.onrender.com';

export function VoiceWidget({ lang }: VoiceWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [voiceState, setVoiceState] = useState<VoiceState>('idle');
  const [transcript, setTranscript] = useState('');
  const [reply, setReply] = useState('');
  const [isSupported] = useState(() =>
    !!(window as any).SpeechRecognition || !!(window as any).webkitSpeechRecognition
  );
  const recognitionRef = useRef<any>(null);
  const finalTranscriptRef = useRef('');
  const isRtl = lang === 'ar';

  const t = {
    title: lang === 'en' ? 'Voice Assistant' : 'المساعد الصوتي',
    subtitle: lang === 'en' ? 'Speak naturally — I\'m listening' : 'تكلم بشكل طبيعي — أنا أستمع',
    listening: lang === 'en' ? 'Listening...' : 'أستمع إليك...',
    thinking: lang === 'en' ? 'Thinking...' : 'أفكر...',
    you: lang === 'en' ? 'You' : 'أنت',
    assistant: lang === 'en' ? 'Elyvori' : 'إليفوري',
    placeholder: lang === 'en'
      ? '"Build me a website" · "Find me a job" · "Create content"'
      : '"ابنيلي موقع" · "لاقيلي وظيفة" · "اعملي محتوى"',
    tapToSpeak: lang === 'en' ? 'Tap to speak' : 'اضغط للكلام',
    tapToStop: lang === 'en' ? 'Tap to stop' : 'اضغط للإيقاف',
    notSupported: lang === 'en' ? 'Voice not supported. Try Chrome.' : 'الصوت غير مدعوم. جرب Chrome.',
  };

  const stopListening = useCallback(() => {
    try { recognitionRef.current?.stop(); } catch {}
    recognitionRef.current = null;
  }, []);

  const askGemini = useCallback(async (userText: string) => {
    setVoiceState('thinking');
    try {
      const res = await fetch(`${API_BASE}/public/voice/ask`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userText, lang }),
      });
      const data = await res.json();
      setReply(data.reply || (lang === 'en' ? 'How can I help you?' : 'كيف يمكنني مساعدتك؟'));
    } catch {
      setReply(lang === 'en' ? 'Sorry, something went wrong.' : 'عذراً، حدث خطأ ما.');
    } finally {
      setVoiceState('idle');
    }
  }, [lang]);

  const startListening = useCallback(() => {
    if (!isSupported) return;
    stopListening();
    setTranscript('');
    setReply('');
    finalTranscriptRef.current = '';
    setVoiceState('listening');

    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const r = new SR();
    recognitionRef.current = r;
    r.lang = lang === 'ar' ? 'ar-SA' : 'en-US';
    r.continuous = true;
    r.interimResults = true;

    r.onresult = (e: any) => {
      let interim = '';
      let final = '';
      for (let i = 0; i < e.results.length; i++) {
        if (e.results[i].isFinal) {
          final += e.results[i][0].transcript;
        } else {
          interim += e.results[i][0].transcript;
        }
      }
      if (final) {
        finalTranscriptRef.current = final;
        setTranscript(final);
      } else if (interim) {
        setTranscript(interim);
      }
    };

    r.onerror = () => setVoiceState('idle');
    r.onend = () => {
      const text = finalTranscriptRef.current || transcript;
      if (text.trim()) {
        askGemini(text.trim());
      } else {
        setVoiceState('idle');
      }
    };

    r.start();

    // Auto-stop after 8 seconds
    setTimeout(() => {
      try { r.stop(); } catch {}
    }, 8000);
  }, [isSupported, lang, stopListening, askGemini, transcript]);

  const handleClose = useCallback(() => {
    stopListening();
    setIsOpen(false);
    setVoiceState('idle');
    setTranscript('');
    setReply('');
  }, [stopListening]);

  const stateColor = {
    idle: 'from-indigo-500 via-violet-600 to-purple-600',
    listening: 'from-red-500 to-rose-600',
    thinking: 'from-amber-500 to-orange-500',
    error: 'from-red-600 to-red-700',
  };

  return (
    <>
      <style>{`
        @keyframes wave {
          from { transform: scaleY(0.4); }
          to { transform: scaleY(1); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-6px); }
        }
        .voice-float { animation: float 3s ease-in-out infinite; }
      `}</style>

      <div className={`fixed bottom-6 z-[9999] ${isRtl ? 'left-6' : 'right-6'}`}>

        {/* Panel */}
        {isOpen && (
          <div className="mb-5 w-[320px] overflow-hidden rounded-2xl border border-white/10 bg-slate-950/95 shadow-2xl backdrop-blur-xl"
            style={{ boxShadow: '0 25px 60px rgba(0,0,0,0.8), 0 0 0 1px rgba(255,255,255,0.06)' }}
          >
            {/* Header */}
            <div className="relative flex items-center justify-between border-b border-white/5 px-5 py-4">
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-600/10 to-violet-600/5" />
              <div className="relative flex items-center gap-3">
                <div className={`flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br ${stateColor[voiceState]} shadow-lg`}>
                  <div className="h-2 w-2 rounded-full bg-white/90" />
                </div>
                <div>
                  <p className="text-sm font-bold text-white">{t.title}</p>
                  <p className="text-[11px] text-slate-400">
                    {voiceState === 'idle' && t.subtitle}
                    {voiceState === 'listening' && t.listening}
                    {voiceState === 'thinking' && t.thinking}
                  </p>
                </div>
              </div>
              <button onClick={handleClose} className="relative flex h-7 w-7 items-center justify-center rounded-full text-slate-500 transition-colors hover:bg-white/10 hover:text-white">
                <X className="h-3.5 w-3.5" />
              </button>
            </div>

            {/* State visual */}
            <div className="flex min-h-[70px] items-center justify-center border-b border-white/5 bg-black/20 py-4">
              {voiceState === 'idle' && (
                <p className="px-6 text-center text-xs leading-relaxed text-slate-500 italic">{t.placeholder}</p>
              )}
              {voiceState === 'listening' && (
                <div className="flex items-center gap-[3px]">
                  {[1,2,3,4,5,6,7].map(i => (
                    <div key={i} className="rounded-full bg-red-400" style={{
                      width: '3px', height: `${8 + Math.abs(Math.sin(i)) * 14}px`,
                      animation: `wave 0.7s ease-in-out ${i * 0.09}s infinite alternate`
                    }} />
                  ))}
                </div>
              )}
              {voiceState === 'thinking' && (
                <div className="flex items-center gap-1.5">
                  {[0,1,2].map(i => (
                    <div key={i} className="h-2 w-2 rounded-full bg-amber-400"
                      style={{ animation: `pulse 1s ease-in-out ${i * 0.2}s infinite` }} />
                  ))}
                </div>
              )}
            </div>

            {/* Conversation */}
            {(transcript || reply) && (
              <div className="max-h-[160px] overflow-y-auto p-4 space-y-3">
                {transcript && (
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-400">{t.you}</span>
                    <div className="rounded-xl rounded-tl-sm bg-indigo-600/15 px-3.5 py-2.5 border border-indigo-500/20">
                      <p className="text-[13px] text-slate-200 leading-relaxed">{transcript}</p>
                    </div>
                  </div>
                )}
                {reply && (
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-400">{t.assistant}</span>
                    <div className="rounded-xl rounded-tl-sm bg-emerald-600/10 px-3.5 py-2.5 border border-emerald-500/20">
                      <p className="text-[13px] text-slate-200 leading-relaxed">{reply}</p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Mic button */}
            <div className="flex flex-col items-center gap-2 px-5 py-5">
              {!isSupported ? (
                <p className="text-xs text-red-400">{t.notSupported}</p>
              ) : (
                <>
                  <button
                    onClick={voiceState === 'listening' ? stopListening : startListening}
                    disabled={voiceState === 'thinking'}
                    className={`relative flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br ${stateColor[voiceState]} text-white shadow-xl transition-all duration-300 disabled:opacity-50 hover:scale-105`}
                    style={{ boxShadow: voiceState === 'listening' ? '0 8px 32px rgba(239,68,68,0.5)' : '0 8px 32px rgba(99,102,241,0.4)' }}
                  >
                    {voiceState === 'thinking' ? (
                      <Loader2 className="h-6 w-6 animate-spin" />
                    ) : voiceState === 'listening' ? (
                      <MicOff className="h-6 w-6" />
                    ) : (
                      <Mic className="h-6 w-6" />
                    )}
                  </button>
                  <p className="text-[11px] text-slate-600">
                    {voiceState === 'listening' ? t.tapToStop : t.tapToSpeak}
                  </p>
                </>
              )}
            </div>
          </div>
        )}

        {/* Floating button */}
        <div className="relative flex items-center justify-center">
          {!isOpen && <div className="absolute inset-0 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 opacity-30 blur-xl scale-150" />}
          <button
            onClick={() => isOpen ? handleClose() : setIsOpen(true)}
            className={`voice-float relative flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br transition-all duration-300 ${
              isOpen ? 'from-slate-700 to-slate-800 shadow-lg' : 'from-indigo-500 via-violet-600 to-purple-600 shadow-2xl hover:scale-110'
            }`}
            style={{ boxShadow: isOpen ? '0 4px 20px rgba(0,0,0,0.4)' : '0 8px 40px rgba(99,102,241,0.6), 0 0 0 1px rgba(255,255,255,0.1)' }}
            title={t.title}
          >
            {isOpen ? <X className="h-6 w-6 text-white" /> : (
              <>
                <Mic className="h-6 w-6 text-white drop-shadow-lg" />
                <span className="absolute top-1 right-1 flex h-2.5 w-2.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
                </span>
              </>
            )}
          </button>
        </div>
      </div>
    </>
  );
}
