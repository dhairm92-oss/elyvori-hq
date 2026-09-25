import { useState, useRef, useEffect, useCallback } from 'react';
import { Mic, MicOff, Volume2, X, Loader2 } from 'lucide-react';
import { Language } from '../types';

interface VoiceWidgetProps {
  lang: Language;
}

type VoiceState = 'idle' | 'listening' | 'thinking' | 'speaking' | 'error';

const API_BASE = 'https://elyvori-api.onrender.com';

export function VoiceWidget({ lang }: VoiceWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [voiceState, setVoiceState] = useState<VoiceState>('idle');
  const [transcript, setTranscript] = useState('');
  const [reply, setReply] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isSupported, setIsSupported] = useState(true);

  const recognitionRef = useRef<any>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const isRtl = lang === 'ar';

  const t = {
    title: lang === 'en' ? 'Voice Assistant' : 'المساعد الصوتي',
    subtitle: lang === 'en'
      ? 'Press the mic and speak naturally'
      : 'اضغط على المايكروفون وتكلم بشكل طبيعي',
    listening: lang === 'en' ? 'Listening...' : 'أستمع إليك...',
    thinking: lang === 'en' ? 'Thinking...' : 'أفكر...',
    speaking: lang === 'en' ? 'Speaking...' : 'أتكلم...',
    tryAgain: lang === 'en' ? 'Try again' : 'حاول مجدداً',
    notSupported: lang === 'en'
      ? 'Voice not supported in this browser. Try Chrome.'
      : 'الصوت غير مدعوم بهذا المتصفح. جرب Chrome.',
    you: lang === 'en' ? 'You' : 'أنت',
    assistant: lang === 'en' ? 'Elyvori' : 'إليفوري',
    placeholder: lang === 'en'
      ? '"Build me a website" or "Find me a job" or "Create content"...'
      : '"ابنيلي موقع" أو "لاقيلي وظيفة" أو "اعملي محتوى"...',
  };

  // Check browser support
  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setIsSupported(false);
    }
  }, []);

  const stopAll = useCallback(() => {
    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch {}
      recognitionRef.current = null;
    }
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
  }, []);

  const speakWithElevenLabs = useCallback(async (text: string) => {
    setVoiceState('speaking');
    try {
      const res = await fetch(`${API_BASE}/public/voice/speak`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, lang }),
      });
      if (!res.ok) throw new Error('TTS failed');
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const audio = new Audio(url);
      audioRef.current = audio;
      audio.onended = () => {
        URL.revokeObjectURL(url);
        audioRef.current = null;
        setVoiceState('idle');
      };
      audio.onerror = () => {
        setVoiceState('idle');
      };
      await audio.play();
    } catch {
      // fallback to browser TTS if ElevenLabs fails
      const utter = new SpeechSynthesisUtterance(text);
      utter.lang = lang === 'ar' ? 'ar-SA' : 'en-US';
      utter.onend = () => setVoiceState('idle');
      window.speechSynthesis.speak(utter);
    }
  }, [lang]);

  const askGemini = useCallback(async (userText: string) => {
    setVoiceState('thinking');
    try {
      const res = await fetch(`${API_BASE}/public/voice/ask`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userText, lang }),
      });
      if (!res.ok) throw new Error('AI failed');
      const data = await res.json();
      const aiReply = data.reply || (lang === 'en' ? 'Sorry, I could not understand.' : 'عذراً، لم أفهم.');
      setReply(aiReply);
      await speakWithElevenLabs(aiReply);
    } catch {
      const fallback = lang === 'en'
        ? 'Sorry, something went wrong. Please try again.'
        : 'عذراً، حدث خطأ ما. الرجاء المحاولة مرة أخرى.';
      setReply(fallback);
      setVoiceState('error');
      setErrorMsg(fallback);
    }
  }, [lang, speakWithElevenLabs]);

  const startListening = useCallback(() => {
    if (!isSupported) return;
    stopAll();
    setTranscript('');
    setReply('');
    setErrorMsg('');
    setVoiceState('listening');

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;

    recognition.lang = lang === 'ar' ? 'ar-SA' : 'en-US';
    recognition.continuous = false;
    recognition.interimResults = true;

    recognition.onresult = (event: any) => {
      let interim = '';
      let final = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const t = event.results[i][0].transcript;
        if (event.results[i].isFinal) final += t;
        else interim += t;
      }
      setTranscript(final || interim);
      if (final) {
        recognition.stop();
        askGemini(final);
      }
    };

    recognition.onerror = (event: any) => {
      if (event.error === 'no-speech') {
        setVoiceState('idle');
      } else {
        setVoiceState('error');
        setErrorMsg(lang === 'en' ? 'Microphone error. Please try again.' : 'خطأ بالمايكروفون. حاول مجدداً.');
      }
    };

    recognition.onend = () => {
      if (voiceState === 'listening') setVoiceState('idle');
    };

    recognition.start();
  }, [isSupported, lang, stopAll, askGemini, voiceState]);

  const handleClose = useCallback(() => {
    stopAll();
    setIsOpen(false);
    setVoiceState('idle');
    setTranscript('');
    setReply('');
    setErrorMsg('');
  }, [stopAll]);

  const micColors = {
    idle: 'bg-indigo-600 hover:bg-indigo-500',
    listening: 'bg-red-500 animate-pulse',
    thinking: 'bg-amber-500',
    speaking: 'bg-emerald-500',
    error: 'bg-red-600',
  };

  if (!isSupported && isOpen) {
    return (
      <div className="fixed bottom-6 right-6 z-50">
        <div className="rounded-2xl border border-slate-700 bg-slate-900 p-5 shadow-2xl max-w-xs">
          <p className="text-sm text-slate-300">{t.notSupported}</p>
          <button onClick={() => setIsOpen(false)} className="mt-3 text-xs text-indigo-400">Close</button>
        </div>
      </div>
    );
  }

  return (
    <div className={`fixed bottom-6 z-50 ${isRtl ? 'left-6' : 'right-6'}`}>
      {/* Expanded panel */}
      {isOpen && (
        <div className={`mb-4 w-80 rounded-2xl border border-slate-700 bg-slate-900 shadow-2xl overflow-hidden`}>
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Volume2 className="h-4 w-4 text-indigo-400" />
              <span className="text-sm font-semibold text-white">{t.title}</span>
            </div>
            <button onClick={handleClose} className="text-slate-400 hover:text-white transition-colors">
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Body */}
          <div className="p-4 min-h-[160px] flex flex-col gap-3">
            {/* State indicator */}
            <div className="text-center">
              {voiceState === 'idle' && (
                <p className="text-xs text-slate-400">{t.subtitle}</p>
              )}
              {voiceState === 'listening' && (
                <div className="flex items-center justify-center gap-2">
                  <div className="flex gap-1">
                    {[0,1,2,3,4].map(i => (
                      <div
                        key={i}
                        className="w-1 bg-red-400 rounded-full animate-bounce"
                        style={{ height: `${8 + i * 4}px`, animationDelay: `${i * 0.1}s` }}
                      />
                    ))}
                  </div>
                  <span className="text-xs text-red-400 font-medium">{t.listening}</span>
                </div>
              )}
              {voiceState === 'thinking' && (
                <div className="flex items-center justify-center gap-2">
                  <Loader2 className="h-4 w-4 text-amber-400 animate-spin" />
                  <span className="text-xs text-amber-400 font-medium">{t.thinking}</span>
                </div>
              )}
              {voiceState === 'speaking' && (
                <div className="flex items-center justify-center gap-2">
                  <div className="flex gap-1">
                    {[0,1,2].map(i => (
                      <div
                        key={i}
                        className="w-1.5 h-4 bg-emerald-400 rounded-full animate-pulse"
                        style={{ animationDelay: `${i * 0.2}s` }}
                      />
                    ))}
                  </div>
                  <span className="text-xs text-emerald-400 font-medium">{t.speaking}</span>
                </div>
              )}
            </div>

            {/* Transcript */}
            {transcript && (
              <div className="rounded-lg bg-indigo-950/50 border border-indigo-800/40 p-3">
                <p className="text-[11px] font-semibold text-indigo-400 mb-1">{t.you}</p>
                <p className="text-xs text-slate-200 leading-relaxed">{transcript}</p>
              </div>
            )}

            {/* Reply */}
            {reply && (
              <div className="rounded-lg bg-slate-800/60 border border-slate-700/40 p-3">
                <p className="text-[11px] font-semibold text-emerald-400 mb-1">{t.assistant}</p>
                <p className="text-xs text-slate-200 leading-relaxed">{reply}</p>
              </div>
            )}

            {/* Error */}
            {errorMsg && (
              <div className="rounded-lg bg-red-950/40 border border-red-800/40 p-3">
                <p className="text-xs text-red-400">{errorMsg}</p>
                <button
                  onClick={startListening}
                  className="mt-2 text-[11px] font-semibold text-indigo-400 hover:text-indigo-300"
                >
                  {t.tryAgain}
                </button>
              </div>
            )}

            {/* Placeholder */}
            {voiceState === 'idle' && !transcript && !reply && (
              <p className="text-[11px] text-slate-600 italic text-center leading-relaxed">
                {t.placeholder}
              </p>
            )}
          </div>

          {/* Mic button inside panel */}
          <div className="px-4 pb-4 flex justify-center">
            <button
              onClick={voiceState === 'listening' ? stopAll : startListening}
              disabled={voiceState === 'thinking' || voiceState === 'speaking'}
              className={`flex h-12 w-12 items-center justify-center rounded-full text-white transition-all shadow-lg disabled:opacity-50 ${micColors[voiceState]}`}
            >
              {voiceState === 'listening' ? (
                <MicOff className="h-5 w-5" />
              ) : (
                <Mic className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>
      )}

      {/* Floating button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex h-14 w-14 items-center justify-center rounded-full shadow-2xl transition-all ${
          isOpen
            ? 'bg-slate-700 hover:bg-slate-600'
            : 'bg-gradient-to-br from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 shadow-indigo-500/30'
        }`}
        title={t.title}
      >
        {isOpen ? (
          <X className="h-6 w-6 text-white" />
        ) : (
          <Mic className="h-6 w-6 text-white" />
        )}
      </button>
    </div>
  );
}
