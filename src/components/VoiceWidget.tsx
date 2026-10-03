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

const WELCOME_EN = `👋 Hello! I'm **Elyvori AI** — your autonomous business engine.\n\nI can help you with:\n\n🔥 **Digital Products** — Build & sell PDF products automatically\n💻 **Websites & Apps** — Full-stack builds in minutes\n📢 **Marketing** — Bilingual EN/AR campaigns\n👥 **Recruitment** — AI-powered hiring CRM\n📄 **Contracts** — Instant risk analysis\n\nWhat can I build for you today?`;
const WELCOME_AR = `👋 مرحباً! أنا **إليفوري AI** — محرك نمو أعمالك.\n\nأستطيع مساعدتك في:\n\n🔥 **المنتجات الرقمية** — بناء وبيع PDF تلقائياً\n💻 **المواقع والتطبيقات** — بناء متكامل في دقائق\n📢 **التسويق** — حملات ثنائية اللغة\n👥 **التوظيف** — نظام توظيف ذكي\n📄 **العقود** — تحليل فوري للمخاطر\n\nماذا أبني لك اليوم؟`;

function formatTime() {
  return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function renderText(text: string) {
  return text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\n/g, '<br/>');
}

export function VoiceWidget({ lang = 'en' }: VoiceWidgetProps) {
  const isAr = lang === 'ar';
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [listening, setListening] = useState(false);
  const [unread, setUnread] = useState(1);
  const [messages, setMessages] = useState<Message[]>([
    { id: 1, role: 'ai', text: isAr ? WELCOME_AR : WELCOME_EN, time: formatTime() }
  ]);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if (open) { setUnread(0); setTimeout(() => inputRef.current?.focus(), 400); }
  }, [open]);

  useEffect(() => {
    if (open && bottomRef.current) bottomRef.current.scrollIntoView({ behavior: 'smooth' });
  }, [messages, open]);

  // Voice recognition setup
  const startListening = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert(isAr ? 'المتصفح لا يدعم التعرف على الصوت' : 'Browser does not support voice recognition');
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.lang = isAr ? 'ar-SA' : 'en-US';
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.onstart = () => setListening(true);
    recognition.onend = () => setListening(false);
    recognition.onresult = (e: any) => {
      const transcript = e.results[0][0].transcript;
      setInput(transcript);
      setTimeout(() => sendMessage(transcript), 300);
    };
    recognition.onerror = () => setListening(false);
    recognitionRef.current = recognition;
    recognition.start();
  };

  const stopListening = () => {
    if (recognitionRef.current) { recognitionRef.current.stop(); setListening(false); }
  };

  const sendMessage = async (text?: string) => {
    const msg = (text || input).trim();
    if (!msg || loading) return;
    setInput('');
    const userMsg: Message = { id: Date.now(), role: 'user', text: msg, time: formatTime() };
    setMessages(prev => [...prev, userMsg]);
    setLoading(true);
    try {
      const res = await fetch(`${API}/public/voice/ask`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: msg, lang }),
      });
      const data = await res.json() as any;
      const reply = data.reply || data.message || (isAr ? 'عذراً، حدث خطأ.' : 'Sorry, something went wrong.');
      setMessages(prev => [...prev, { id: Date.now() + 1, role: 'ai', text: reply, time: formatTime() }]);
    } catch {
      setMessages(prev => [...prev, { id: Date.now() + 1, role: 'ai', text: isAr ? 'تعذر الاتصال.' : 'Could not connect.', time: formatTime() }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{`
        @keyframes elvFloat{0%,100%{transform:translateY(0)}50%{transform:translateY(-6px)}}
        @keyframes elvPulse{0%,100%{box-shadow:0 0 0 0 rgba(0,229,255,0),0 0 20px rgba(0,229,255,0.3)}50%{box-shadow:0 0 0 12px rgba(0,229,255,0),0 0 40px rgba(0,229,255,0.6)}}
        @keyframes elvExpand{from{opacity:0;transform:scale(0.7) translateY(30px)}to{opacity:1;transform:scale(1) translateY(0)}}
        @keyframes msgSlide{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
        @keyframes ringExp{from{transform:scale(1);opacity:0.6}to{transform:scale(1.8);opacity:0}}
        @keyframes micPulse{0%,100%{box-shadow:0 0 0 0 rgba(239,68,68,0.4)}50%{box-shadow:0 0 0 10px rgba(239,68,68,0)}}
        @keyframes d1{0%,80%,100%{transform:scale(0.6);opacity:0.4}40%{transform:scale(1);opacity:1}}
        @keyframes d2{0%,20%,100%{transform:scale(0.6);opacity:0.4}60%{transform:scale(1);opacity:1}}
        @keyframes d3{0%,40%,100%{transform:scale(0.6);opacity:0.4}80%{transform:scale(1);opacity:1}}
        @keyframes badgePop{0%{transform:scale(0)}60%{transform:scale(1.3)}100%{transform:scale(1)}}
        .elv-btn-wrap{position:fixed;bottom:28px;right:28px;z-index:9999}
        .elv-btn{width:64px;height:64px;border-radius:50%;background:linear-gradient(135deg,rgba(0,20,40,0.95),rgba(10,5,30,0.95));border:1.5px solid rgba(0,229,255,0.6);backdrop-filter:blur(20px);cursor:pointer;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:3px;animation:elvFloat 3s ease-in-out infinite,elvPulse 2s ease-in-out infinite;transition:transform 0.2s,border-color 0.2s;position:relative}
        .elv-btn:hover{transform:scale(1.12)!important;border-color:rgba(0,229,255,1)}
        .elv-ring{position:absolute;inset:-4px;border-radius:50%;border:1.5px solid rgba(0,229,255,0.4);animation:ringExp 2s ease-out infinite;pointer-events:none}
        .elv-ring2{position:absolute;inset:-4px;border-radius:50%;border:1.5px solid rgba(124,58,237,0.3);animation:ringExp 2s ease-out 0.7s infinite;pointer-events:none}
        .elv-badge{position:absolute;top:-4px;right:-4px;width:20px;height:20px;border-radius:50%;background:linear-gradient(135deg,#ef4444,#dc2626);border:2px solid rgba(4,6,20,0.9);color:#fff;font-size:11px;font-weight:900;display:flex;align-items:center;justify-content:center;animation:badgePop 0.3s cubic-bezier(0.34,1.56,0.64,1)}
        .elv-chat{position:fixed;bottom:108px;right:28px;z-index:9998;width:min(400px,calc(100vw - 32px));height:min(560px,calc(100vh - 150px));background:rgba(3,5,18,0.93);border:1px solid rgba(0,229,255,0.2);border-radius:28px;backdrop-filter:blur(30px);display:flex;flex-direction:column;overflow:hidden;animation:elvExpand 0.4s cubic-bezier(0.34,1.56,0.64,1) forwards;box-shadow:0 0 60px rgba(0,229,255,0.15),0 0 120px rgba(124,58,237,0.1),0 30px 60px rgba(0,0,0,0.6)}
        .elv-msg{animation:msgSlide 0.3s ease both}
        .elv-input{background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);border-radius:16px;color:#fff;padding:13px 96px 13px 18px;font-size:14px;width:100%;box-sizing:border-box;outline:none;font-family:inherit;transition:border 0.25s}
        .elv-input:focus{border-color:rgba(0,229,255,0.5)}
        .elv-input::placeholder{color:rgba(255,255,255,0.25)}
        .elv-scroll::-webkit-scrollbar{width:3px}
        .elv-scroll::-webkit-scrollbar-thumb{background:rgba(0,229,255,0.2);border-radius:2px}
        .mic-btn{width:34px;height:34px;border-radius:10px;border:none;cursor:pointer;display:flex;align-items:center;justify-content:center;font-size:16px;transition:all 0.25s}
        .mic-btn.active{background:linear-gradient(135deg,#ef4444,#dc2626);animation:micPulse 1s infinite;box-shadow:0 0 16px rgba(239,68,68,0.5)}
        .mic-btn.idle{background:rgba(255,255,255,0.08)}
        .send-btn{width:34px;height:34px;border-radius:10px;border:none;cursor:pointer;display:flex;align-items:center;justify-content:center;font-size:15px;transition:all 0.25s}
        @media(max-width:480px){.elv-btn-wrap{bottom:20px;right:20px}.elv-btn{width:56px;height:56px}.elv-chat{bottom:88px;right:16px;width:calc(100vw - 32px);border-radius:22px}.elv-input{padding:13px 90px 13px 16px}}
      `}</style>

      {/* Chat Window */}
      {open && (
        <div className="elv-chat" dir={isAr ? 'rtl' : 'ltr'} style={{ fontFamily: isAr ? "'Cairo','Inter',sans-serif" : "'Inter',sans-serif" }}>
          <div style={{ height: 2, background: 'linear-gradient(90deg,transparent,#00E5FF,#7C3AED,transparent)', flexShrink: 0 }} />

          {/* Header */}
          <div style={{ padding: '14px 18px', background: 'linear-gradient(135deg,rgba(0,229,255,0.04),rgba(124,58,237,0.04))', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
            <div style={{ position: 'relative', flexShrink: 0 }}>
              <div style={{ width: 42, height: 42, borderRadius: '50%', background: 'linear-gradient(135deg,#00E5FF,#7C3AED)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 16px rgba(0,229,255,0.4)' }}>
                <span style={{ color: '#000', fontSize: 13, fontWeight: 900 }}>E</span>
              </div>
              <div style={{ position: 'absolute', bottom: 1, right: 1, width: 10, height: 10, borderRadius: '50%', background: '#10B981', border: '2px solid rgba(3,5,18,0.95)', boxShadow: '0 0 6px rgba(16,185,129,0.6)' }} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ color: '#fff', fontSize: 14, fontWeight: 700 }}>Elyvori AI</div>
              <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: 11 }}>{isAr ? '⚡ يرد فوراً' : '⚡ Replies instantly'}</div>
            </div>
            <button onClick={() => setMessages([{ id: Date.now(), role: 'ai', text: isAr ? WELCOME_AR : WELCOME_EN, time: formatTime() }])} style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.4)', borderRadius: 8, width: 30, height: 30, cursor: 'pointer', fontSize: 13, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>↺</button>
            <button onClick={() => setOpen(false)} style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.5)', borderRadius: 8, width: 30, height: 30, cursor: 'pointer', fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
          </div>

          {/* Messages */}
          <div className="elv-scroll" style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: 14 }}>
            {messages.map((msg, i) => (
              <div key={msg.id} className="elv-msg" style={{ animationDelay: `${i * 0.04}s`, display: 'flex', flexDirection: msg.role === 'user' ? (isAr ? 'row' : 'row-reverse') : (isAr ? 'row-reverse' : 'row'), gap: 8, alignItems: 'flex-end' }}>
                {msg.role === 'ai' && (
                  <div style={{ width: 30, height: 30, borderRadius: '50%', flexShrink: 0, background: 'linear-gradient(135deg,#00E5FF,#7C3AED)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 10px rgba(0,229,255,0.3)' }}>
                    <span style={{ color: '#000', fontSize: 9, fontWeight: 900 }}>E</span>
                  </div>
                )}
                <div style={{ maxWidth: '80%', display: 'flex', flexDirection: 'column', gap: 3 }}>
                  <div style={{ padding: '11px 15px', borderRadius: msg.role === 'ai' ? (isAr ? '18px 18px 4px 18px' : '18px 18px 18px 4px') : (isAr ? '18px 4px 18px 18px' : '4px 18px 18px 18px'), background: msg.role === 'ai' ? 'rgba(0,229,255,0.07)' : 'linear-gradient(135deg,#00E5FF,#7C3AED)', border: msg.role === 'ai' ? '1px solid rgba(0,229,255,0.12)' : 'none', color: msg.role === 'ai' ? 'rgba(255,255,255,0.88)' : '#000', fontSize: 13, lineHeight: 1.65 }}
                    dangerouslySetInnerHTML={{ __html: renderText(msg.text) }} />
                  <div style={{ color: 'rgba(255,255,255,0.2)', fontSize: 10, textAlign: msg.role === 'user' ? (isAr ? 'left' : 'right') : (isAr ? 'right' : 'left'), paddingInline: '4px' }}>{msg.time}</div>
                </div>
              </div>
            ))}

            {listening && (
              <div className="elv-msg" style={{ display: 'flex', alignItems: 'center', gap: 10, justifyContent: 'center' }}>
                <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 20, padding: '8px 16px', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 16 }}>🎤</span>
                  <span style={{ color: '#ef4444', fontSize: 13, fontWeight: 600 }}>{isAr ? 'جارٍ الاستماع...' : 'Listening...'}</span>
                  <div style={{ display: 'flex', gap: 3 }}>
                    {[0,1,2].map(i => <div key={i} style={{ width: 4, height: 4, borderRadius: '50%', background: '#ef4444', animation: `d${i+1} 1s infinite` }} />)}
                  </div>
                </div>
              </div>
            )}

            {loading && (
              <div className="elv-msg" style={{ display: 'flex', gap: 8, alignItems: 'flex-end', flexDirection: isAr ? 'row-reverse' : 'row' }}>
                <div style={{ width: 30, height: 30, borderRadius: '50%', flexShrink: 0, background: 'linear-gradient(135deg,#00E5FF,#7C3AED)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ color: '#000', fontSize: 9, fontWeight: 900 }}>E</span>
                </div>
                <div style={{ padding: '14px 18px', borderRadius: isAr ? '18px 18px 4px 18px' : '18px 18px 18px 4px', background: 'rgba(0,229,255,0.07)', border: '1px solid rgba(0,229,255,0.12)', display: 'flex', gap: 5, alignItems: 'center' }}>
                  {[{a:'d1 1.2s 0s infinite'},{a:'d2 1.2s 0.2s infinite'},{a:'d3 1.2s 0.4s infinite'}].map((d,i) => (
                    <div key={i} style={{ width: 7, height: 7, borderRadius: '50%', background: '#00E5FF', animation: d.a }} />
                  ))}
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Quick suggestions */}
          {messages.length <= 1 && !loading && (
            <div style={{ padding: '0 14px 10px', display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {(isAr ? ['ابنِ لي موقعاً', 'أريد منتجاً رقمياً', 'حلل عقداً'] : ['Build me a website', 'Create a digital product', 'Analyze a contract']).map(s => (
                <button key={s} onClick={() => { setInput(s); sendMessage(s); }}
                  style={{ background: 'rgba(0,229,255,0.08)', border: '1px solid rgba(0,229,255,0.2)', color: '#00E5FF', borderRadius: 20, padding: '5px 12px', fontSize: 11, cursor: 'pointer', fontFamily: 'inherit' }}>
                  {s}
                </button>
              ))}
            </div>
          )}

          {/* Input Area */}
          <div style={{ padding: '12px 14px 14px', borderTop: '1px solid rgba(255,255,255,0.05)', background: 'rgba(0,0,0,0.2)', flexShrink: 0 }}>
            <div style={{ position: 'relative' }}>
              <input
                ref={inputRef}
                className="elv-input"
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
                placeholder={listening ? (isAr ? '🎤 جارٍ الاستماع...' : '🎤 Listening...') : (isAr ? 'اسألني أي شيء...' : 'Ask me anything...')}
                disabled={loading || listening}
                style={{ paddingRight: isAr ? '18px' : '96px', paddingLeft: isAr ? '96px' : '18px' }}
              />
              {/* Buttons */}
              <div style={{ position: 'absolute', [isAr ? 'left' : 'right']: 8, top: '50%', transform: 'translateY(-50%)', display: 'flex', gap: 5 }}>
                {/* Mic Button */}
                <button
                  className={`mic-btn ${listening ? 'active' : 'idle'}`}
                  onClick={listening ? stopListening : startListening}
                  title={isAr ? 'تحدث' : 'Speak'}
                >
                  {listening ? '⏹' : '🎤'}
                </button>
                {/* Send Button */}
                <button
                  className="send-btn"
                  onClick={() => sendMessage()}
                  disabled={loading || !input.trim()}
                  style={{ background: input.trim() ? 'linear-gradient(135deg,#00E5FF,#7C3AED)' : 'rgba(255,255,255,0.06)', color: input.trim() ? '#000' : 'rgba(255,255,255,0.25)', boxShadow: input.trim() ? '0 0 16px rgba(0,229,255,0.4)' : 'none', cursor: input.trim() ? 'pointer' : 'not-allowed' }}
                >
                  {isAr ? '↩' : '↑'}
                </button>
              </div>
            </div>
            <p style={{ color: 'rgba(255,255,255,0.12)', fontSize: 10, textAlign: 'center', margin: '8px 0 0', letterSpacing: 0.5 }}>
              ELYVORI AI · {isAr ? 'مدعوم بالذكاء الاصطناعي' : 'Powered by Gemini'}
            </p>
          </div>
          <div style={{ height: 1, background: 'linear-gradient(90deg,transparent,#7C3AED,#00E5FF,transparent)', flexShrink: 0 }} />
        </div>
      )}

      {/* Floating Button */}
      <div className="elv-btn-wrap">
        <div style={{ position: 'relative' }}>
          <div className="elv-ring" />
          <div className="elv-ring2" />
          <button className="elv-btn" onClick={() => setOpen(o => !o)} aria-label="Open Elyvori AI">
            {open ? (
              <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: 20 }}>✕</span>
            ) : (
              <>
                <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg,#00E5FF,#7C3AED)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 14px rgba(0,229,255,0.6)' }}>
                  <span style={{ color: '#000', fontSize: 13, fontWeight: 900, fontFamily: 'Inter,sans-serif' }}>E</span>
                </div>
                <span style={{ color: '#00E5FF', fontSize: 8, fontWeight: 700, letterSpacing: 1.5, fontFamily: 'Inter,sans-serif' }}>AI</span>
              </>
            )}
          </button>
          {unread > 0 && !open && <div className="elv-badge">{unread}</div>}
        </div>
      </div>
    </>
  );
}
