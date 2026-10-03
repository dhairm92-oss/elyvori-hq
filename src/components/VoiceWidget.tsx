import { useState, useRef, useEffect } from 'react';
import { Language } from '../types';

interface Message {
  id: number;
  role: 'ai' | 'user';
  text: string;
  time: string;
}

interface VoiceWidgetProps {
  lang?: Language;
}

const API = 'https://elyvori-api.onrender.com';

// Only one widget renders, even if <VoiceWidget/> is mounted more than once
let elvOwner: object | null = null;
const ELV_RELEASE = 'elv-widget-release';

const TEXT = {
  en: {
    name: 'Elyvori AI',
    status: 'Online · replies instantly',
    welcome:
      "👋 Hello! I'm **Elyvori AI** — your autonomous business engine.\n\nI can help you with:\n\n🔥 **Digital Products** — build & sell PDF products automatically\n💻 **Websites & Apps** — full-stack builds in minutes\n📢 **Marketing** — bilingual EN/AR campaigns\n👥 **Recruitment** — AI-powered hiring CRM\n📝 **Contracts** — instant risk analysis\n\nWhat can I build for you today?",
    placeholder: 'Ask me anything…',
    listening: 'Listening…',
    suggestions: ['Build me a website', 'Create a digital product', 'Analyze a contract'],
    error: 'Sorry, something went wrong. Please try again.',
    offline: 'Could not connect. Please try again in a moment.',
    noVoice: "Voice input isn't supported in this browser. You can type your message instead.",
    footer: 'ELYVORI AI · Powered by Gemini',
    open: 'Open Elyvori AI chat',
    close: 'Close chat',
    reset: 'New conversation',
    speak: 'Speak',
    stop: 'Stop listening',
    send: 'Send',
  },
  ar: {
    name: 'إليفوري AI',
    status: 'متصل · يرد فوراً',
    welcome:
      '👋 مرحباً! أنا **إليفوري AI** — محرّك نمو أعمالك.\n\nأستطيع مساعدتك في:\n\n🔥 **المنتجات الرقمية** — بناء وبيع منتجات PDF تلقائياً\n💻 **المواقع والتطبيقات** — بناء متكامل خلال دقائق\n📢 **التسويق** — حملات ثنائية اللغة (عربي/إنجليزي)\n👥 **التوظيف** — نظام توظيف ذكي\n📝 **العقود** — تحليل فوري للمخاطر\n\nماذا أبني لك اليوم؟',
    placeholder: 'اسألني أي شيء…',
    listening: 'جارٍ الاستماع…',
    suggestions: ['ابنِ لي موقعاً', 'أريد منتجاً رقمياً', 'حلّل عقداً'],
    error: 'عذراً، حدث خطأ. حاول مرة أخرى.',
    offline: 'تعذّر الاتصال. حاول مرة أخرى بعد قليل.',
    noVoice: 'المتصفح لا يدعم الإدخال الصوتي، يمكنك كتابة رسالتك بدلاً من ذلك.',
    footer: 'ELYVORI AI · مدعوم بالذكاء الاصطناعي',
    open: 'فتح محادثة إليفوري',
    close: 'إغلاق المحادثة',
    reset: 'محادثة جديدة',
    speak: 'تحدّث',
    stop: 'إيقاف الاستماع',
    send: 'إرسال',
  },
};

function formatTime(lang?: string) {
  const locale = lang === 'ar' ? 'ar-u-nu-latn' : 'en-US';
  return new Date().toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' });
}

function escapeHtml(s: string) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function renderText(text: string) {
  return escapeHtml(text)
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\n/g, '<br/>');
}

/* ---------- icons (inherit currentColor) ---------- */
const svgProps = {
  width: 18,
  height: 18,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  'aria-hidden': true,
};
const SendIcon = ({ flip }: { flip: boolean }) => (
  <svg {...svgProps} style={flip ? { transform: 'scaleX(-1)' } : undefined}>
    <path d="M22 2 11 13" />
    <path d="M22 2 15 22l-4-9-9-4 20-7z" />
  </svg>
);
const MicIcon = () => (
  <svg {...svgProps}>
    <rect x="9" y="2" width="6" height="12" rx="3" />
    <path d="M5 10a7 7 0 0 0 14 0" />
    <path d="M12 17v5" />
  </svg>
);
const StopIcon = () => (
  <svg {...svgProps}>
    <rect x="6" y="6" width="12" height="12" rx="2.5" fill="currentColor" stroke="none" />
  </svg>
);
const CloseIcon = ({ size = 18 }: { size?: number }) => (
  <svg {...svgProps} width={size} height={size}>
    <path d="M18 6 6 18" />
    <path d="m6 6 12 12" />
  </svg>
);
const ResetIcon = () => (
  <svg {...svgProps} width={16} height={16}>
    <path d="M3 12a9 9 0 1 0 3-6.7" />
    <path d="M3 3v5h5" />
  </svg>
);

const STYLES = `
@keyframes elvFloat{0%,100%{transform:translateY(0)}50%{transform:translateY(-6px)}}
@keyframes elvPulse{0%,100%{box-shadow:0 0 0 0 rgba(0,229,255,0),0 0 20px rgba(0,229,255,.3)}50%{box-shadow:0 0 0 12px rgba(0,229,255,0),0 0 40px rgba(0,229,255,.55)}}
@keyframes elvExpand{from{opacity:0;transform:scale(.92) translateY(16px)}to{opacity:1;transform:none}}
@keyframes elvMsg{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}
@keyframes elvRing{from{transform:scale(1);opacity:.6}to{transform:scale(1.8);opacity:0}}
@keyframes elvMic{0%,100%{box-shadow:0 0 0 0 rgba(239,68,68,.45)}50%{box-shadow:0 0 0 8px rgba(239,68,68,0)}}
@keyframes elvDot{0%,80%,100%{transform:scale(.6);opacity:.4}40%{transform:scale(1);opacity:1}}
@keyframes elvBadge{0%{transform:scale(0)}60%{transform:scale(1.25)}100%{transform:scale(1)}}

.elv-root{
  --elv-bg:rgba(6,9,22,.96);
  --elv-head:linear-gradient(135deg,rgba(0,229,255,.07),rgba(124,58,237,.07));
  --elv-text:rgba(255,255,255,.92);
  --elv-muted:rgba(255,255,255,.5);
  --elv-border:rgba(255,255,255,.08);
  --elv-ai-bg:rgba(0,229,255,.07);
  --elv-ai-border:rgba(0,229,255,.16);
  --elv-input-bg:rgba(255,255,255,.05);
  --elv-btn-bg:rgba(255,255,255,.07);
  --elv-chip-bg:rgba(0,229,255,.08);
  --elv-chip-border:rgba(0,229,255,.22);
  --elv-chip-text:#67E8F9;
  --elv-shadow:0 0 60px rgba(0,229,255,.12),0 30px 60px rgba(0,0,0,.55);
}
html.light .elv-root{
  --elv-bg:rgba(255,255,255,.98);
  --elv-head:linear-gradient(135deg,rgba(0,229,255,.10),rgba(124,58,237,.07));
  --elv-text:#0F172A;
  --elv-muted:#64748B;
  --elv-border:rgba(15,23,42,.08);
  --elv-ai-bg:#F1F5F9;
  --elv-ai-border:rgba(15,23,42,.06);
  --elv-input-bg:#F8FAFC;
  --elv-btn-bg:rgba(15,23,42,.05);
  --elv-chip-bg:rgba(8,145,178,.07);
  --elv-chip-border:rgba(8,145,178,.25);
  --elv-chip-text:#0E7490;
  --elv-shadow:0 24px 60px -12px rgba(15,23,42,.30),0 0 0 1px rgba(15,23,42,.04);
}

/* floating button */
.elv-btn-wrap{position:fixed;bottom:28px;right:28px;z-index:9999}
.elv-btn{width:64px;height:64px;border-radius:50%;background:linear-gradient(135deg,rgba(0,20,40,.96),rgba(10,5,30,.96));border:1.5px solid rgba(0,229,255,.6);cursor:pointer;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:3px;animation:elvFloat 3s ease-in-out infinite,elvPulse 2s ease-in-out infinite;transition:transform .2s,border-color .2s;position:relative;color:#fff;padding:0}
.elv-btn:hover{transform:scale(1.08)!important;border-color:#00E5FF}
.elv-btn:focus-visible{outline:2px solid #00E5FF;outline-offset:3px}
.elv-btn-core{width:32px;height:32px;border-radius:50%;background:linear-gradient(135deg,#00E5FF,#7C3AED);display:grid;place-items:center;box-shadow:0 0 14px rgba(0,229,255,.6);color:#020617;font-size:13px;font-weight:900;font-family:Inter,system-ui,sans-serif}
.elv-btn-label{color:#00E5FF;font-size:8px;font-weight:700;letter-spacing:1.5px;font-family:Inter,system-ui,sans-serif}
.elv-ring,.elv-ring2{position:absolute;inset:-4px;border-radius:50%;pointer-events:none}
.elv-ring{border:1.5px solid rgba(0,229,255,.4);animation:elvRing 2s ease-out infinite}
.elv-ring2{border:1.5px solid rgba(124,58,237,.3);animation:elvRing 2s ease-out .7s infinite}
.elv-badge{position:absolute;top:-4px;right:-4px;width:20px;height:20px;border-radius:50%;background:linear-gradient(135deg,#ef4444,#dc2626);border:2px solid rgba(4,6,20,.9);color:#fff;font-size:11px;font-weight:900;display:grid;place-items:center;animation:elvBadge .3s cubic-bezier(.34,1.56,.64,1)}

/* chat window */
.elv-chat{position:fixed;bottom:108px;right:28px;z-index:9998;width:min(400px,calc(100vw - 32px));height:min(580px,calc(100dvh - 140px));background:var(--elv-bg);color:var(--elv-text);border:1px solid var(--elv-border);border-radius:24px;backdrop-filter:blur(24px);-webkit-backdrop-filter:blur(24px);display:flex;flex-direction:column;overflow:hidden;box-shadow:var(--elv-shadow);animation:elvExpand .35s cubic-bezier(.34,1.56,.64,1) both;font-family:inherit}
.elv-accent-line{height:2px;flex-shrink:0;background:linear-gradient(90deg,transparent,#00E5FF,#7C3AED,transparent)}
.elv-head{display:flex;align-items:center;gap:12px;padding:14px 16px;background:var(--elv-head);border-bottom:1px solid var(--elv-border);flex-shrink:0}
.elv-avatar{position:relative;flex-shrink:0;width:40px;height:40px;border-radius:50%;background:linear-gradient(135deg,#00E5FF,#7C3AED);display:grid;place-items:center;color:#020617;font-weight:900;font-size:14px;box-shadow:0 0 16px rgba(0,229,255,.35);font-family:Inter,system-ui,sans-serif}
.elv-avatar.sm{width:28px;height:28px;font-size:10px;box-shadow:none}
.elv-online{position:absolute;bottom:0;inset-inline-end:0;width:11px;height:11px;border-radius:50%;background:#10B981;border:2px solid var(--elv-bg)}
.elv-head-text{flex:1;min-width:0}
.elv-title{font-size:15px;font-weight:800;line-height:1.25;color:var(--elv-text)}
.elv-status{display:flex;align-items:center;gap:6px;font-size:12px;color:var(--elv-muted);margin-top:2px}
.elv-status::before{content:"";width:6px;height:6px;border-radius:50%;background:#10B981}
.elv-icon-btn{width:34px;height:34px;flex-shrink:0;border-radius:10px;border:1px solid var(--elv-border);background:var(--elv-btn-bg);color:var(--elv-muted);display:grid;place-items:center;cursor:pointer;transition:color .2s,background .2s;padding:0}
.elv-icon-btn:hover{color:var(--elv-text)}
.elv-icon-btn:focus-visible,.elv-tool:focus-visible,.elv-chip:focus-visible{outline:2px solid #00E5FF;outline-offset:2px}

.elv-msgs{flex:1;overflow-y:auto;padding:16px;display:flex;flex-direction:column;gap:14px;overscroll-behavior:contain}
.elv-msgs::-webkit-scrollbar{width:4px}
.elv-msgs::-webkit-scrollbar-thumb{background:rgba(0,229,255,.25);border-radius:4px}
.elv-row{display:flex;gap:8px;align-items:flex-end;animation:elvMsg .3s ease both}
.elv-row.user{flex-direction:row-reverse}
.elv-col{display:flex;flex-direction:column;gap:4px;max-width:82%;min-width:0}
.elv-row.ai .elv-col{align-items:flex-start}
.elv-row.user .elv-col{align-items:flex-end}
.elv-bubble{padding:10px 14px;border-radius:18px;font-size:13.5px;line-height:1.75;overflow-wrap:anywhere;text-align:start}
.elv-bubble strong{font-weight:800}
.elv-row.ai .elv-bubble{background:var(--elv-ai-bg);border:1px solid var(--elv-ai-border);color:var(--elv-text);border-end-start-radius:6px}
.elv-row.user .elv-bubble{background:linear-gradient(135deg,#0891B2,#7C3AED);color:#fff;border-end-end-radius:6px}
.elv-time{font-size:10.5px;color:var(--elv-muted);padding-inline:4px}
.elv-typing{display:flex;gap:5px;align-items:center;padding:14px 16px}
.elv-typing span{width:7px;height:7px;border-radius:50%;background:#00E5FF;animation:elvDot 1.2s infinite}
.elv-typing span:nth-child(2){animation-delay:.2s}
.elv-typing span:nth-child(3){animation-delay:.4s}
.elv-listening{align-self:center;display:flex;align-items:center;gap:8px;padding:7px 14px;border-radius:999px;background:rgba(239,68,68,.1);border:1px solid rgba(239,68,68,.3);color:#EF4444;font-size:13px;font-weight:600}

.elv-chips{display:flex;flex-wrap:wrap;gap:8px;padding:0 16px 12px}
.elv-chip{border:1px solid var(--elv-chip-border);background:var(--elv-chip-bg);color:var(--elv-chip-text);border-radius:999px;padding:6px 12px;font-size:12px;font-weight:600;font-family:inherit;cursor:pointer;transition:transform .15s}
.elv-chip:hover{transform:translateY(-1px)}

.elv-composer{padding:12px 14px 10px;border-top:1px solid var(--elv-border);flex-shrink:0}
.elv-inputbar{display:flex;align-items:center;gap:6px;background:var(--elv-input-bg);border:1px solid var(--elv-border);border-radius:16px;padding:5px;padding-inline-start:14px;transition:border-color .2s,box-shadow .2s}
.elv-inputbar:focus-within{border-color:rgba(0,229,255,.55);box-shadow:0 0 0 3px rgba(0,229,255,.12)}
.elv-input{flex:1;min-width:0;border:0;background:transparent;color:var(--elv-text);font:inherit;font-size:14px;outline:0;padding:8px 0}
.elv-input::placeholder{color:var(--elv-muted)}
.elv-tool{width:38px;height:38px;flex-shrink:0;border-radius:12px;border:0;display:grid;place-items:center;cursor:pointer;background:var(--elv-btn-bg);color:var(--elv-muted);transition:all .2s;padding:0}
.elv-tool:hover{color:var(--elv-text)}
.elv-tool.listening{background:#EF4444;color:#fff;animation:elvMic 1s infinite}
.elv-send{background:linear-gradient(135deg,#00E5FF,#7C3AED);color:#fff;box-shadow:0 4px 14px rgba(0,229,255,.3)}
.elv-send:hover{color:#fff;transform:translateY(-1px)}
.elv-send:disabled{background:var(--elv-btn-bg);color:var(--elv-muted);box-shadow:none;cursor:not-allowed;transform:none}
.elv-foot{font-size:10.5px;color:var(--elv-muted);text-align:center;margin:8px 0 0;opacity:.8}

@media (max-width:767px){
  .elv-btn-wrap{bottom:calc(20px + env(safe-area-inset-bottom));right:16px}
  .elv-btn{width:56px;height:56px;animation:elvPulse 2.4s ease-in-out infinite}
  .elv-chat{left:12px;right:12px;width:auto;bottom:calc(88px + env(safe-area-inset-bottom));height:min(600px,calc(100dvh - 150px));border-radius:22px}
  .elv-input{font-size:16px}
  body.elv-chat-open #floating-side-brand-widget{opacity:0;pointer-events:none;transform:scale(.85)}
}
@media (prefers-reduced-motion:reduce){
  .elv-btn,.elv-ring,.elv-ring2,.elv-chat,.elv-row{animation:none!important}
}
`;

export function VoiceWidget({ lang = 'en' }: VoiceWidgetProps) {
  const isAr = lang === 'ar';
  const t = TEXT[isAr ? 'ar' : 'en'];

  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [listening, setListening] = useState(false);
  const [unread, setUnread] = useState(1);
  const [messages, setMessages] = useState<Message[]>([
    { id: 1, role: 'ai', text: t.welcome, time: formatTime(lang) },
  ]);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);
  const ownerKey = useRef({});
  const [isOwner, setIsOwner] = useState(false);

  // single-instance guard
  useEffect(() => {
    const claim = () => {
      if (!elvOwner) { elvOwner = ownerKey.current; setIsOwner(true); }
    };
    claim();
    window.addEventListener(ELV_RELEASE, claim);
    return () => {
      window.removeEventListener(ELV_RELEASE, claim);
      if (elvOwner === ownerKey.current) {
        elvOwner = null;
        window.dispatchEvent(new Event(ELV_RELEASE));
      }
    };
  }, []);

  // welcome message follows the site language (until the visitor starts chatting)
  useEffect(() => {
    setMessages(prev =>
      prev.length === 1 && prev[0].role === 'ai' ? [{ ...prev[0], text: t.welcome }] : prev
    );
  }, [lang]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (open) {
      setUnread(0);
      const id = setTimeout(() => inputRef.current?.focus(), 350);
      return () => clearTimeout(id);
    }
  }, [open]);

  useEffect(() => {
    document.body.classList.toggle('elv-chat-open', open);
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  useEffect(() => () => document.body.classList.remove('elv-chat-open'), []);

  useEffect(() => {
    if (open) bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages, open, loading, listening]);

  const addAi = (text: string) =>
    setMessages(prev => [...prev, { id: Date.now() + Math.random(), role: 'ai', text, time: formatTime(lang) }]);

  const sendMessage = async (text?: string) => {
    const msg = (text ?? input).trim();
    if (!msg || loading) return;
    setInput('');
    setMessages(prev => [...prev, { id: Date.now(), role: 'user', text: msg, time: formatTime(lang) }]);
    setLoading(true);
    try {
      const res = await fetch(`${API}/public/voice/ask`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: msg, lang }),
      });
      const data = (await res.json()) as any;
      addAi(data.reply || data.message || t.error);
    } catch {
      addAi(t.offline);
    } finally {
      setLoading(false);
    }
  };

  const startListening = () => {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) { addAi(t.noVoice); return; }
    const recognition = new SR();
    recognition.lang = isAr ? 'ar-SA' : 'en-US';
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.onstart = () => setListening(true);
    recognition.onend = () => setListening(false);
    recognition.onerror = () => setListening(false);
    recognition.onresult = (e: any) => {
      const transcript = e.results[0][0].transcript;
      setInput(transcript);
      setTimeout(() => sendMessage(transcript), 250);
    };
    recognitionRef.current = recognition;
    recognition.start();
  };

  const stopListening = () => {
    recognitionRef.current?.stop();
    setListening(false);
  };

  const resetChat = () =>
    setMessages([{ id: Date.now(), role: 'ai', text: t.welcome, time: formatTime(lang) }]);

  if (!isOwner) return null;

  return (
    <div className="elv-root">
      <style>{STYLES}</style>

      {open && (
        <div className="elv-chat" dir={isAr ? 'rtl' : 'ltr'} role="dialog" aria-label={t.name}>
          <div className="elv-accent-line" />

          <div className="elv-head">
            <div className="elv-avatar">
              E
              <span className="elv-online" />
            </div>
            <div className="elv-head-text">
              <div className="elv-title">{t.name}</div>
              <div className="elv-status">{t.status}</div>
            </div>
            <button type="button" className="elv-icon-btn" onClick={resetChat} aria-label={t.reset} title={t.reset}>
              <ResetIcon />
            </button>
            <button type="button" className="elv-icon-btn" onClick={() => setOpen(false)} aria-label={t.close} title={t.close}>
              <CloseIcon size={16} />
            </button>
          </div>

          <div className="elv-msgs" aria-live="polite">
            {messages.map(msg => (
              <div key={msg.id} className={`elv-row ${msg.role}`}>
                {msg.role === 'ai' && <div className="elv-avatar sm">E</div>}
                <div className="elv-col">
                  <div className="elv-bubble" dir="auto" dangerouslySetInnerHTML={{ __html: renderText(msg.text) }} />
                  <div className="elv-time">{msg.time}</div>
                </div>
              </div>
            ))}

            {listening && (
              <div className="elv-listening">
                <MicIcon />
                <span>{t.listening}</span>
              </div>
            )}

            {loading && (
              <div className="elv-row ai">
                <div className="elv-avatar sm">E</div>
                <div className="elv-col">
                  <div className="elv-bubble elv-typing" aria-label="…">
                    <span /><span /><span />
                  </div>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {messages.length <= 1 && !loading && (
            <div className="elv-chips">
              {t.suggestions.map(s => (
                <button key={s} type="button" className="elv-chip" onClick={() => sendMessage(s)}>
                  {s}
                </button>
              ))}
            </div>
          )}

          <div className="elv-composer">
            <form
              className="elv-inputbar"
              onSubmit={e => { e.preventDefault(); sendMessage(); }}
            >
              <input
                ref={inputRef}
                className="elv-input"
                value={input}
                onChange={e => setInput(e.target.value)}
                placeholder={listening ? t.listening : t.placeholder}
                disabled={loading || listening}
                dir="auto"
                enterKeyHint="send"
                aria-label={t.placeholder}
              />
              <button
                type="button"
                className={`elv-tool ${listening ? 'listening' : ''}`}
                onClick={listening ? stopListening : startListening}
                aria-label={listening ? t.stop : t.speak}
                title={listening ? t.stop : t.speak}
              >
                {listening ? <StopIcon /> : <MicIcon />}
              </button>
              <button
                type="submit"
                className="elv-tool elv-send"
                disabled={loading || !input.trim()}
                aria-label={t.send}
                title={t.send}
              >
                <SendIcon flip={isAr} />
              </button>
            </form>
            <p className="elv-foot">{t.footer}</p>
          </div>
        </div>
      )}

      <div className="elv-btn-wrap">
        <div style={{ position: 'relative' }}>
          <div className="elv-ring" />
          <div className="elv-ring2" />
          <button
            type="button"
            className="elv-btn"
            onClick={() => setOpen(o => !o)}
            aria-label={open ? t.close : t.open}
            aria-expanded={open}
          >
            {open ? (
              <CloseIcon size={20} />
            ) : (
              <>
                <span className="elv-btn-core">E</span>
                <span className="elv-btn-label">AI</span>
              </>
            )}
          </button>
          {unread > 0 && !open && <div className="elv-badge">{unread}</div>}
        </div>
      </div>
    </div>
  );
}
