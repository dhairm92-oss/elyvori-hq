import { useState, useRef, useEffect } from 'react';
import { Language } from '../types';

interface MsgAction {
  label: string;
  copy?: string;
  type?: AssistantAction;
  url?: string;
}

interface Message {
  id: number;
  role: 'ai' | 'user';
  text: string;
  time: string;
  voice?: boolean;
  actions?: MsgAction[];
  progress?: { steps: string[]; current: number; done?: boolean; failed?: boolean };
}

// actions the assistant can trigger on the page (handled in App.tsx)
type AssistantAction = 'digital' | 'auth' | 'career' | 'contract' | 'support' | 'negotiation' | 'tracker' | 'pricing';
type Intent = 'digital' | 'prospects' | 'website' | 'contract' | 'career' | 'support' | 'negotiation' | 'pricing' | 'tracker' | null;

const FREE_SITE_LIMIT = 3; // shown in texts - the real limit is enforced by the API
const BUILD_TIMEOUT_MS = 6 * 60 * 1000;

function runAction(type: AssistantAction) {
  // ELYVORI-DIGITAL-INTENT: jump to the "Your Own Digital Product" section
  if (type === 'digital') {
    const h = Array.from(document.querySelectorAll('h1, h2, h3')).find(
      (x) => /60/.test(x.textContent || '') && /digital product|منتج/i.test(x.textContent || ''),
    );
    const target = (h?.parentElement?.parentElement?.parentElement as HTMLElement | null) || (h as HTMLElement | null) ||
      document.getElementById('service-card-digital-products');
    target?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    window.setTimeout(() => {
      const input = target?.querySelector('input') as HTMLInputElement | null;
      input?.focus({ preventScroll: true });
    }, 900);
    return;
  }
  window.dispatchEvent(new CustomEvent('elyvori:action', { detail: { type } }));
  if (type === 'pricing') document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' });
}

function detectIntent(text: string): Intent {
  const s = ' ' + text.toLowerCase() + ' ';
  const has = (...w: string[]) => w.some(x => s.includes(x));
  const wantsToMake = has('اعمل', 'إعمل', 'ابن', 'إبن', 'بدي', 'بدّي', 'أريد', 'اريد', 'صمم', 'صمّم', 'أنشئ', 'انشئ', 'جهز', 'جهّز',
    'build', 'make', 'create', 'need', 'want', 'design', 'set up', 'launch');
  // ELYVORI-PROSPECTS: find businesses without a website and pitch them a free demo
  const hunting = has('دور', 'دوّر', 'ابحث', 'إبحث', 'فتش', 'لاقي', 'لاقيلي', 'جيبلي', 'find', 'search', 'look for', 'hunt');
  const targets = has('شركات', 'شركة', 'مطاعم', 'مطعم', 'عيادات', 'عيادة', 'محلات', 'صالونات', 'بزنس', 'business', 'compan', 'restaurant', 'clinic', 'shop', 'store', 'salon');
  const noSite = has('ما عند', 'ماعند', 'مش عند', 'مو عند', 'بدون', 'ليس لديها', 'ليس لها', 'لا تملك', 'without', 'no website', "don't have", "doesn't have", 'no site', 'no app');
  // ELYVORI-PROSPECTS-ANY: any business type - 'search for ... that have no website/app'
  const siteWord = has('موقع', 'مواقع', 'ويب', 'تطبيق', 'website', 'site', 'web', ' app');
  if (hunting && noSite && (targets || siteWord)) return 'prospects';
  // ELYVORI-DIGITAL-STEMS: any form of منتج + رقمي (منتجاً رقمياً، منتجات رقمية، ...)
  if (/منت[جچ]/.test(s) && /رقم[يىا]/.test(s)) return 'digital';
  if (has('منتج رقمي', 'منتج رقمى', 'منتجات رقمية', 'منتجات رقميه', 'منتج ديجيتال', 'كتاب الكتروني', 'كتاب إلكتروني', 'كتاب تلوين',
    'دليل pdf', ' pdf', 'digital product', 'ebook', 'e-book', 'coloring book', 'colouring book')) return 'digital';
  if (has('عقد', 'عقود', 'contract', 'legal', 'قانوني', 'اتفاقية', 'agreement')) return 'contract';
  if (has('وظيف', 'شغل', 'job', 'career', ' cv', 'resume', 'سيرة ذاتية', 'سيرتي')) return 'career';
  if (has('دعم العملاء', 'خدمة العملاء', 'customer support', 'شكوى', 'complaint')) return 'support';
  if (has('تفاوض', 'negotiat')) return 'negotiation';
  if (has('تتبع مشروع', 'track my project', 'project status', 'حالة مشروعي')) return 'tracker';
  if (has('موقع', 'website', 'web site', 'landing page', 'صفحة هبوط', 'متجر', 'online store', 'webapp', 'web app') && wantsToMake) return 'website';
  if (has('سعر', 'أسعار', 'اسعار', 'الخطط', 'باقة', 'باقات', 'اشتراك', 'pricing', 'price', ' plans', 'subscription')) return 'pricing';
  return null;
}

function getAuth() {
  try {
    const token = localStorage.getItem('elyvori_token');
    const email = localStorage.getItem('elyvori_user') || 'guest';
    return { token, email };
  } catch {
    return { token: null, email: 'guest' };
  }
}

// free-plan status lives on the server (3 free website builds per account)
async function fetchFreeSites(token: string): Promise<{ left: number; balance: number; cost: number } | 'auth' | null> {
  try {
    const res = await fetch(`${API}/billing/free-sites`, { headers: { Authorization: `Bearer ${token}` } });
    if (res.status === 401 || res.status === 403) return 'auth';
    if (!res.ok) return null;
    const d = (await res.json()) as any;
    return { left: Number(d.left ?? 0), balance: Number(d.balance ?? 0), cost: Number(d.cost ?? 50) };
  } catch {
    return null;
  }
}

function isPublicUrl(u?: string | null) {
  return !!u && /^https?:\/\//.test(u) && !/localhost|127\.0\.0\.1|0\.0\.0\.0/.test(u);
}

interface VoiceWidgetProps {
  lang?: Language;
}

const API = 'https://elyvori-api.onrender.com';
const SPEAK_KEY = 'elyvori_voice_reply';

// Only one widget renders, even if <VoiceWidget/> is mounted more than once
let elvOwner: object | null = null;
const ELV_RELEASE = 'elv-widget-release';

type VoiceState = 'idle' | 'listening' | 'processing';

const TEXT = {
  en: {
    name: 'Elyvori AI',
    status: 'Online · replies instantly',
    speaking: 'Speaking…',
    welcome:
      "👋 Hello! I'm **Elyvori AI** — your autonomous business engine.\n\nTap the 🎙 mic and just talk to me — or type. I can help you with:\n\n🔥 **Digital Products** — build & sell PDF products automatically\n💻 **Websites & Apps** — full-stack builds in minutes\n📢 **Marketing** — bilingual EN/AR campaigns\n👥 **Recruitment & Jobs** — AI-powered hiring and job search\n📝 **Contracts** — instant risk analysis\n\nWhat can I build for you today?",
    placeholder: 'Ask me anything…',
    listening: 'Listening…',
    speakNow: 'Speak now…',
    processing: 'Turning your voice into text…',
    suggestions: ['Build me a website', 'Create a digital product', 'Analyze a contract'],
    error: 'Sorry, something went wrong. Please try again.',
    offline: 'Could not connect. Please try again in a moment.',
    micDenied: '🎙 Microphone access is blocked. Allow the microphone for this site in your browser settings, then tap the mic again.',
    micMissing: '🎙 No microphone was found on this device.',
    noSpeech: "I didn't catch that. Tap the mic and try again.",
    sttUnavailable: "Voice input isn't available in this browser yet. Please try Chrome, Edge or Safari — or type your message.",
    footer: 'ELYVORI AI · Powered by Gemini',
    open: 'Open Elyvori AI chat',
    close: 'Close chat',
    reset: 'New conversation',
    speak: 'Talk to Elyvori',
    stopAndSend: 'Send voice message',
    cancel: 'Cancel',
    send: 'Send',
    voiceOn: 'Voice replies on',
    voiceOff: 'Voice replies off',
    needLogin: "Sure! To build your website I first need you to sign in — it takes 10 seconds. After that you can use the **free plan (up to 3 websites)** or upgrade.",
    loginBtn: 'Sign in / Create account',
    quotaReached: `You've used all **${FREE_SITE_LIMIT} free websites**. Pick a plan to keep building — I'll be right here.`,
    plansBtn: 'View plans',
    askDetails: "Great, let's build it! 🚀 Tell me in one message:\n\n• Your business name\n• What you do (e.g. restaurant, clinic, store)\n• Anything you want on the site (menu, booking, WhatsApp, colors…)",
    building: "On it — give me a moment… ✨ I'm building your website now.",
    buildSteps: ['Understanding your business', 'Designing the pages', 'Writing the code', 'Publishing your site'],
    buildDone: '🎉 Your website is ready!',
    openSite: 'Open my website',
    freeLeft: 'You have **{n} free website(s)** left on the free plan.',
    loggedIn: "You're signed in ✅ — let's build your website!",
    trackBtn: 'Track Project',
    buildQueued: "Your website has been built ✅ — I'm finishing the public link. You can follow it in Track Project and we'll email you the link.",
    buildFailed: "I couldn't finish the build this time. Please try again in a minute — or tap Track Project.",
    huntStart: "On it 🕵️ — the Elyvori agents are searching for businesses without a website, then I'll build the best match a free demo. This takes about 3–5 minutes.",
    huntSteps: ['Searching the market', 'Checking who has no website', 'Building a free demo site', 'Writing the outreach message'],
    huntFound: '🎯 Found **{name}**{why}\n\nFree demo: {url}\n\n**Ready-to-send message:**\n{msg}',
    huntOthers: '\n\nI also found: {list}. Ask me again to build the next one.',
    huntNoEmail: '\n\n⚠️ No public email was found — send it on their Instagram/WhatsApp/Google Maps page.',
    huntNone: "I searched but couldn't confirm a business without a website this time. Try a city or type, e.g. \"clinics in Riyadh without a website\".",
    huntNoDemo: 'I found **{name}** but couldn’t finish the demo site this time. Try again in a minute.',
    huntNotAllowed: 'This tool is only available to the Elyvori team.',
    huntStarted: '🎯 Found **{n}** {cat} in {city} with no website:\n{list}\n\nThe agents are now building each one a free demo site, emailing them, and handling the replies and the deal. You will get every step on **Telegram and email** 📲',
    huntOpenDemo: 'Open demo',
    huntCopy: 'Copy message',
    huntEmail: 'Email them',
    copied: 'Copied ✅',
    sessionExpired: 'Your session has expired — please sign in again and I will continue.',
    opening: {
      digital: "Let's make it! ✨ Taking you to **Your Own Digital Product** — write your name, email and pick what you love, and the AI builds it in about a minute.",
      contract: "Sure — opening the **Contract Analyzer** for you now. Upload your contract and I'll flag the risks.",
      career: "Sure — opening the **Career Agent**. Upload your CV and I'll find real jobs that match you.",
      support: 'Opening **Customer Support AI** for you now.',
      negotiation: 'Opening the **Negotiation Simulator** now.',
      tracker: 'Opening your **project tracker** now.',
      pricing: 'Here are our plans — the **Free plan** lets you build up to 3 websites.',
    },
  },
  ar: {
    name: 'إليفوري AI',
    status: 'متصل · يرد فوراً',
    speaking: 'يتحدث الآن…',
    welcome:
      '👋 مرحباً! أنا **إليفوري AI** — محرّك نمو أعمالك.\n\nاضغط على 🎙 المايك واحكِ معي مباشرة — أو اكتب. أستطيع مساعدتك في:\n\n🔥 **المنتجات الرقمية** — بناء وبيع منتجات PDF تلقائياً\n💻 **المواقع والتطبيقات** — بناء متكامل خلال دقائق\n📢 **التسويق** — حملات ثنائية اللغة (عربي/إنجليزي)\n👥 **التوظيف والوظائف** — توظيف ذكي وبحث عن وظائف\n📝 **العقود** — تحليل فوري للمخاطر\n\nماذا أبني لك اليوم؟',
    placeholder: 'اسألني أي شيء…',
    listening: 'جارٍ الاستماع…',
    speakNow: 'تكلّم الآن…',
    processing: 'جارٍ تحويل صوتك إلى نص…',
    suggestions: ['ابنِ لي موقعاً', 'أريد منتجاً رقمياً', 'حلّل عقداً'],
    error: 'عذراً، حدث خطأ. حاول مرة أخرى.',
    offline: 'تعذّر الاتصال. حاول مرة أخرى بعد قليل.',
    micDenied: '🎙 الوصول للمايكروفون مرفوض. اسمح للموقع باستخدام المايكروفون من إعدادات المتصفح، ثم اضغط على المايك مرة أخرى.',
    micMissing: '🎙 لم يتم العثور على مايكروفون في هذا الجهاز.',
    noSpeech: 'لم أسمعك جيداً. اضغط على المايك وحاول مرة أخرى.',
    sttUnavailable: 'الإدخال الصوتي غير متاح على هذا المتصفح حالياً. جرّب Chrome أو Edge أو Safari — أو اكتب رسالتك.',
    footer: 'ELYVORI AI · مدعوم بالذكاء الاصطناعي',
    open: 'فتح محادثة إليفوري',
    close: 'إغلاق المحادثة',
    reset: 'محادثة جديدة',
    speak: 'تحدّث مع إليفوري',
    stopAndSend: 'إرسال الرسالة الصوتية',
    cancel: 'إلغاء',
    send: 'إرسال',
    voiceOn: 'الرد الصوتي مفعّل',
    voiceOff: 'الرد الصوتي متوقف',
    needLogin: 'أكيد! عشان أبني موقعك لازم تسجّل دخول أولاً — بتاخذ ١٠ ثواني. بعدها بتقدر تستخدم **الخطة المجانية (لحد ٣ مواقع)** أو ترقّي خطتك.',
    loginBtn: 'تسجيل الدخول / إنشاء حساب',
    quotaReached: `استخدمت كل **المواقع المجانية (${FREE_SITE_LIMIT})**. اختر خطة عشان نكمل البناء — أنا هون.`,
    plansBtn: 'عرض الخطط',
    askDetails: 'تمام، يلا نبنيه! 🚀 احكيلي برسالة وحدة:\n\n• اسم نشاطك\n• شو بتشتغل (مطعم، عيادة، متجر…)\n• شو بدك يكون بالموقع (منيو، حجز، واتساب، ألوان…)',
    building: 'حاضر، لحظات… ✨ بلّشت أبني موقعك هلأ.',
    buildSteps: ['فهم نشاطك', 'تصميم الصفحات', 'كتابة الكود', 'نشر الموقع'],
    buildDone: '🎉 موقعك جاهز!',
    openSite: 'افتح موقعي',
    freeLeft: 'ضايلك **{n} موقع مجاني** بالخطة المجانية.',
    loggedIn: 'تمام، سجّلت دخولك ✅ — يلا نبني موقعك!',
    trackBtn: 'تتبع مشروعك',
    buildQueued: 'موقعك انبنى ✅ — بجهّز الرابط العام. بتقدر تتابعه من "تتبع مشروعك" وبنبعثلك الرابط على الإيميل.',
    buildFailed: 'ما قدرت أكمّل البناء هالمرة. جرّب كمان دقيقة — أو افتح تتبع المشروع.',
    huntStart: 'حاضر 🕵️ — وكلاء إليفوري بيدوروا هلأ على شركات ما عندها مواقع، وبعدين ببني لأفضل وحدة موقع تجريبي مجاني. بياخد تقريباً 3–5 دقايق.',
    huntSteps: ['البحث بالسوق', 'التأكد مين ما عنده موقع', 'بناء موقع تجريبي مجاني', 'كتابة رسالة التواصل'],
    huntFound: '🎯 لقيت **{name}**{why}\n\nالموقع التجريبي: {url}\n\n**الرسالة جاهزة للإرسال:**\n{msg}',
    huntOthers: '\n\nولقيت كمان: {list}. اطلب مني مرة ثانية وببني للي بعدها.',
    huntNoEmail: '\n\n⚠️ ما لقيت إيميل عام إلهم — ابعتها على انستغرام أو واتساب أو صفحتهم على خرائط جوجل.',
    huntNone: 'دورت بس ما قدرت أتأكد من شركة ما عندها موقع هالمرة. جرّب تحدد مدينة أو نوع، مثلاً "عيادات في الرياض ما عندها موقع".',
    huntNoDemo: 'لقيت **{name}** بس ما قدرت أكمّل الموقع التجريبي هالمرة. جرّب كمان دقيقة.',
    huntNotAllowed: 'هالأداة متاحة لفريق إليفوري بس.',
    huntStarted: '🎯 لقيت **{n}** ({cat} في {city}) ما عندهم موقع:\n{list}\n\nالوكلاء هلأ بيبنوا لكل واحد موقع تجريبي مجاني، وبيراسلوهم، وبيردوا عليهم وبيكمّلوا الصفقة. كل خطوة بتوصلك على **تليجرام والإيميل** 📲',
    huntOpenDemo: 'افتح الموقع التجريبي',
    huntCopy: 'انسخ الرسالة',
    huntEmail: 'ابعتلهم إيميل',
    copied: 'تم النسخ ✅',
    sessionExpired: 'انتهت جلستك — سجّل دخول مرة ثانية وبكمّل معك.',
    opening: {
      digital: 'يلا نعمله! ✨ بنقلك هلأ على **منتجك الرقمي الخاص** — اكتب اسمك وإيميلك واختار اللي بتحبه، والذكاء الاصطناعي بيجهزه خلال دقيقة تقريباً.',
      contract: 'أكيد — بفتحلك **محلل العقود** هلأ. ارفع العقد وبطلعلك المخاطر.',
      career: 'أكيد — بفتحلك **وكيل التوظيف**. ارفع سيرتك الذاتية وبلاقيلك وظائف حقيقية بتناسبك.',
      support: 'بفتحلك **دعم العملاء الذكي** هلأ.',
      negotiation: 'بفتحلك **محاكاة التفاوض** هلأ.',
      tracker: 'بفتحلك **تتبع مشروعك** هلأ.',
      pricing: 'هاي خططنا — **الخطة المجانية** بتخليك تبني لحد ٣ مواقع.',
    },
  },
};

function formatTime(lang?: string) {
  const locale = lang === 'ar' ? 'ar-u-nu-latn' : 'en-US';
  return new Date().toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' });
}

function formatDuration(sec: number) {
  return `${Math.floor(sec / 60)}:${String(sec % 60).padStart(2, '0')}`;
}

function escapeHtml(s: string) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function renderText(text: string) {
  return escapeHtml(text)
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\n/g, '<br/>');
}

// text that is nice to read aloud (no markdown, emoji, urls)
function speakable(text: string) {
  return text
    .replace(/\*\*/g, '')
    .replace(/https?:\/\/\S+/g, '')
    .replace(/[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}\u{FE0F}\u{200D}]/gu, '')
    .replace(/\s*\n+\s*/g, '. ')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

// convert any recording (webm/ogg/mp4) to 16 kHz mono WAV - accepted by every speech-to-text API
async function toWav(blob: Blob): Promise<Blob> {
  const Ctx = window.AudioContext || (window as any).webkitAudioContext;
  const ctx: AudioContext = new Ctx();
  const audio = await ctx.decodeAudioData(await blob.arrayBuffer());
  try { await ctx.close(); } catch { /* ignore */ }
  const rate = 16000;
  const off = new OfflineAudioContext(1, Math.max(1, Math.ceil(audio.duration * rate)), rate);
  const src = off.createBufferSource();
  src.buffer = audio;
  src.connect(off.destination);
  src.start();
  const data = (await off.startRendering()).getChannelData(0);
  const view = new DataView(new ArrayBuffer(44 + data.length * 2));
  const str = (o: number, s: string) => { for (let i = 0; i < s.length; i++) view.setUint8(o + i, s.charCodeAt(i)); };
  str(0, 'RIFF'); view.setUint32(4, 36 + data.length * 2, true); str(8, 'WAVE'); str(12, 'fmt ');
  view.setUint32(16, 16, true); view.setUint16(20, 1, true); view.setUint16(22, 1, true);
  view.setUint32(24, rate, true); view.setUint32(28, rate * 2, true); view.setUint16(32, 2, true);
  view.setUint16(34, 16, true); str(36, 'data'); view.setUint32(40, data.length * 2, true);
  for (let i = 0; i < data.length; i++) {
    const v = Math.max(-1, Math.min(1, data[i]));
    view.setInt16(44 + i * 2, v < 0 ? v * 0x8000 : v * 0x7fff, true);
  }
  return new Blob([view], { type: 'audio/wav' });
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
const MicIcon = ({ size = 18 }: { size?: number }) => (
  <svg {...svgProps} width={size} height={size}>
    <rect x="9" y="2" width="6" height="12" rx="3" />
    <path d="M5 10a7 7 0 0 0 14 0" />
    <path d="M12 17v5" />
  </svg>
);
const CheckIcon = () => (
  <svg {...svgProps} strokeWidth={2.6}>
    <path d="M20 6 9 17l-5-5" />
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
const SpeakerIcon = ({ on }: { on: boolean }) => (
  <svg {...svgProps} width={16} height={16}>
    <path d="M11 5 6 9H2v6h4l5 4V5z" />
    {on ? (
      <>
        <path d="M15.5 8.5a5 5 0 0 1 0 7" />
        <path d="M19 5a10 10 0 0 1 0 14" />
      </>
    ) : (
      <>
        <path d="m22 9-6 6" />
        <path d="m16 9 6 6" />
      </>
    )}
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
/* ---------- voice ---------- */
@keyframes elvRec{0%,100%{opacity:1}50%{opacity:.35}}
@keyframes elvSpin{to{transform:rotate(360deg)}}
@keyframes elvMicGlow{0%,100%{box-shadow:0 0 0 0 rgba(0,229,255,.35)}50%{box-shadow:0 0 0 6px rgba(0,229,255,0)}}
.elv-mic{background:transparent;color:var(--elv-chip-text);border:1.5px solid var(--elv-chip-border);animation:elvMicGlow 2.4s ease-in-out infinite}
.elv-mic:hover{background:var(--elv-chip-bg);color:var(--elv-chip-text)}
.elv-recbar{display:flex;align-items:center;gap:10px;background:var(--elv-input-bg);border:1px solid rgba(239,68,68,.35);border-radius:16px;padding:5px;box-shadow:0 0 0 3px rgba(239,68,68,.08)}
.elv-recbar.processing{border-color:var(--elv-chip-border);box-shadow:0 0 0 3px rgba(0,229,255,.08)}
.elv-recinfo{display:flex;align-items:center;gap:8px;flex-shrink:0;font-size:13px;font-weight:700;color:#EF4444;font-variant-numeric:tabular-nums}
.elv-recdot{width:9px;height:9px;border-radius:50%;background:#EF4444;animation:elvRec 1s ease-in-out infinite}
.elv-wave{flex:1;min-width:0;height:30px;display:flex;align-items:center;justify-content:center;gap:3px;overflow:hidden}
.elv-wave span{width:3px;height:4px;border-radius:3px;background:linear-gradient(180deg,#00E5FF,#7C3AED);transition:height .08s linear}
.elv-cancel{background:var(--elv-btn-bg);color:var(--elv-muted)}
.elv-done{background:linear-gradient(135deg,#10B981,#0891B2);color:#fff;box-shadow:0 4px 14px rgba(16,185,129,.3)}
.elv-done:hover{color:#fff;transform:translateY(-1px)}
.elv-spinner{width:16px;height:16px;border-radius:50%;border:2px solid var(--elv-chip-border);border-top-color:#00E5FF;animation:elvSpin .8s linear infinite;flex-shrink:0}
.elv-proc-text{flex:1;font-size:13px;color:var(--elv-muted);padding-inline:6px}
.elv-row.draft .elv-bubble{background:transparent!important;color:var(--elv-text)!important;border:1.5px dashed var(--elv-chip-border)!important;opacity:.9}
.elv-draft-empty{color:var(--elv-muted);font-style:italic}
.elv-voice-tag{display:inline-flex;align-items:center;gap:4px;font-size:10.5px;color:var(--elv-muted)}
.elv-status.talking::before{background:#00E5FF;animation:elvRec 1s ease-in-out infinite}
.elv-icon-btn.on{color:var(--elv-chip-text);border-color:var(--elv-chip-border)}
.elv-actions{display:flex;flex-wrap:wrap;gap:8px;margin-top:2px}
.elv-action{border:0;border-radius:12px;padding:8px 14px;font:inherit;font-size:13px;font-weight:700;cursor:pointer;color:#fff;background:linear-gradient(135deg,#0891B2,#7C3AED);box-shadow:0 6px 16px -6px rgba(124,58,237,.5);transition:transform .15s}
.elv-action:hover{transform:translateY(-1px)}
.elv-progress{display:flex;flex-direction:column;gap:10px;min-width:220px}
.elv-step{display:flex;align-items:center;gap:10px;font-size:13px;color:var(--elv-muted)}
.elv-step-dot{width:20px;height:20px;border-radius:50%;display:grid;place-items:center;flex-shrink:0;border:2px solid var(--elv-border)}
.elv-step-dot svg{width:12px;height:12px}
.elv-step.active{color:var(--elv-text);font-weight:700}
.elv-step.active .elv-step-dot{border-color:#00E5FF;border-top-color:transparent;animation:elvSpin .8s linear infinite}
.elv-step.done{color:var(--elv-text)}
.elv-step.done .elv-step-dot{background:#10B981;border-color:#10B981;color:#fff}
.elv-step.failed .elv-step-dot{background:#EF4444;border-color:#EF4444;color:#fff}
`;

const WAVE_BARS = 22;

export function VoiceWidget({ lang = 'en' }: VoiceWidgetProps) {
  const isAr = lang === 'ar';
  const t = TEXT[isAr ? 'ar' : 'en'];

  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [unread, setUnread] = useState(1);
  const [messages, setMessages] = useState<Message[]>([
    { id: 1, role: 'ai', text: t.welcome, time: formatTime(lang) },
  ]);

  // voice
  const [voiceState, setVoiceState] = useState<VoiceState>('idle');
  const [draft, setDraft] = useState('');
  const [seconds, setSeconds] = useState(0);
  const [speaking, setSpeaking] = useState(false);
  const [speakOn, setSpeakOn] = useState<boolean>(() => {
    try { return localStorage.getItem(SPEAK_KEY) !== 'off'; } catch { return true; }
  });

  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const ownerKey = useRef({});
  const autoClosedRef = useRef(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const speakSeqRef = useRef(0);
  const [isOwner, setIsOwner] = useState(false);

  const recognitionRef = useRef<any>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const rafRef = useRef<number>(0);
  const timerRef = useRef<number>(0);
  const waveRef = useRef<HTMLDivElement>(null);
  const modeRef = useRef<'sr' | 'rec' | null>(null);
  const cancelledRef = useRef(false);
  const finalTextRef = useRef('');
  const draftRef = useRef('');
  const langRef = useRef(lang);
  langRef.current = lang;
  const speakOnRef = useRef(speakOn);
  speakOnRef.current = speakOn;

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
    cancelVoice();
    if (autoClosedRef.current) autoClosedRef.current = false; // closed by the assistant: let it finish talking
    else stopSpeaking();
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    document.body.classList.toggle('elv-chat-open', open);
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  useEffect(() => () => {
    document.body.classList.remove('elv-chat-open');
    cleanupVoice();
    stopSpeaking();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (open) bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages, open, loading, draft, voiceState]);

  /* ---------------- speech output ---------------- */
  function stopSpeaking() {
    speakSeqRef.current++;
    try { window.speechSynthesis?.cancel(); } catch { /* ignore */ }
    try { audioRef.current?.pause(); } catch { /* ignore */ }
    audioRef.current = null;
    setSpeaking(false);
  }

  function speakWithBrowser(clean: string) {
    const synth = window.speechSynthesis;
    if (!synth) return;
    synth.cancel();
    const u = new SpeechSynthesisUtterance(clean);
    const code = replyLangRef.current;
    u.lang = code === 'ar' ? 'ar-SA' : 'en-US';
    const v = synth.getVoices().find(x => x.lang?.toLowerCase().startsWith(code));
    if (v) u.voice = v;
    u.onstart = () => setSpeaking(true);
    u.onend = () => setSpeaking(false);
    u.onerror = () => setSpeaking(false);
    synth.speak(u);
  }

  // natural voice from the API (ElevenLabs); falls back to the browser's own voice
  async function speak(text: string) {
    const clean = speakable(text);
    const voiceLang = replyLangRef.current;
    if (!clean) return;
    stopSpeaking();
    const myTurn = ++speakSeqRef.current;
    try {
      const ctrl = new AbortController();
      const tm = window.setTimeout(() => ctrl.abort(), 8000);
      const res = await fetch(`${API}/public/voice/speak`, {
        method: 'POST',
        signal: ctrl.signal,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: clean.slice(0, 600), lang: voiceLang }),
      });
      window.clearTimeout(tm);
      if (!res.ok) throw new Error(String(res.status));
      const blob = await res.blob();
      if (myTurn !== speakSeqRef.current || !blob.size) return; // something newer started
      const url = URL.createObjectURL(blob);
      const audio = new Audio(url);
      audioRef.current = audio;
      audio.onplay = () => setSpeaking(true);
      audio.onended = audio.onerror = () => { setSpeaking(false); URL.revokeObjectURL(url); };
      await audio.play();
    } catch {
      if (myTurn === speakSeqRef.current) speakWithBrowser(clean);
    }
  }

  const toggleSpeak = () => {
    setSpeakOn(on => {
      const next = !on;
      try { localStorage.setItem(SPEAK_KEY, next ? 'on' : 'off'); } catch { /* ignore */ }
      if (!next) stopSpeaking();
      return next;
    });
  };

  /* ---------------- chat ---------------- */
  const addAi = (text: string) =>
    setMessages(prev => [...prev, { id: Date.now() + Math.random(), role: 'ai', text, time: formatTime(langRef.current) }]);

  const pendingRef = useRef<'details' | null>(null);
  // reply in the language the visitor actually writes/speaks, not only the site language
  const replyLangRef = useRef<'ar' | 'en'>(isAr ? 'ar' : 'en');
  const T = () => TEXT[replyLangRef.current];
  const [waitingLogin, setWaitingLogin] = useState(false);
  const lastViaVoiceRef = useRef(false);

  // on phones the chat covers the page: after opening a page/modal, step aside so it is visible
  const closeOnMobile = () => {
    if (window.matchMedia('(max-width: 767px)').matches) {
      autoClosedRef.current = true;
      setOpen(false);
    }
  };

  const reply = (text: string, viaVoice: boolean, extra?: Partial<Message>) => {
    setMessages(prev => [...prev, { id: Date.now() + Math.random(), role: 'ai', text, time: formatTime(langRef.current), ...extra }]);
    if (viaVoice && speakOnRef.current) speak(text);
  };

  const askGemini = async (msg: string, viaVoice: boolean) => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/public/voice/ask`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: msg, lang: langRef.current }),
      });
      const data = (await res.json()) as any;
      reply(data.reply || data.message || T().error, viaVoice);
    } catch {
      reply(T().offline, viaVoice);
    } finally {
      setLoading(false);
    }
  };

  const buildWebsite = async (details: string, viaVoice: boolean) => {
    const { token } = getAuth();
    if (!token) { reply(T().needLogin, viaVoice, { actions: [{ label: T().loginBtn, type: 'auth' }] }); return; }

    reply(T().building, viaVoice);
    const progId = Date.now() + 1;
    setMessages(prev => [...prev, { id: progId, role: 'ai', text: '', time: formatTime(langRef.current), progress: { steps: T().buildSteps, current: 0 } }]);
    const setProg = (p: Partial<NonNullable<Message['progress']>>) =>
      setMessages(prev => prev.map(m => (m.id === progId && m.progress ? { ...m, progress: { ...m.progress, ...p } } : m)));
    let step = 0;
    const ticker = window.setInterval(() => { step = Math.min(step + 1, T().buildSteps.length - 1); setProg({ current: step }); }, 9000);

    const ctrl = new AbortController();
    const timeout = window.setTimeout(() => ctrl.abort(), BUILD_TIMEOUT_MS);
    setLoading(true);
    try {
      const res = await fetch(`${API}/orchestrator/command`, {
        method: 'POST',
        signal: ctrl.signal,
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          intent: 'build_code',
          text: `Build a complete, modern, responsive website and publish it. Website language: ${replyLangRef.current === 'ar' ? 'Arabic (RTL)' : 'English'}. Business details from the client: ${details}`,
        }),
      });
      if (res.status === 401 || res.status === 403) {
        setProg({ failed: true });
        reply(T().sessionExpired, viaVoice, { actions: [{ label: T().loginBtn, type: 'auth' }] });
        return;
      }
      if (!res.ok) throw new Error(String(res.status));
      const data = (await res.json()) as any;
      if (data?.data?.creditsExhausted) {
        setProg({ failed: true });
        reply(T().quotaReached, viaVoice, { actions: [{ label: T().plansBtn, type: 'pricing' }] });
        return;
      }
      const candidates = [data?.data?.publicUrl, data?.data?.liveUrl, data?.liveUrl];
      const siteUrl: string | undefined = candidates.find(isPublicUrl);
      if (siteUrl) {
        setProg({ current: T().buildSteps.length - 1, done: true });
        reply(T().buildDone, viaVoice, { actions: [{ label: T().openSite, url: siteUrl }] });
      } else if (data?.intent === 'build_code' || data?.data?.filePaths) {
        setProg({ current: T().buildSteps.length - 1, done: true });
        reply(T().buildQueued, viaVoice, { actions: [{ label: T().trackBtn, type: 'tracker' }] });
      } else {
        throw new Error('no result');
      }
    } catch {
      setProg({ failed: true });
      reply(T().buildFailed, viaVoice, { actions: [{ label: T().trackBtn, type: 'tracker' }] });
    } finally {
      window.clearInterval(ticker);
      window.clearTimeout(timeout);
      setLoading(false);
    }
  };

  // ELYVORI-PROSPECTS: run the prospect-hunter agent on the server
  const huntProspects = async (request: string, viaVoice: boolean) => {
    const { token } = getAuth();
    if (!token) { reply(T().needLogin, viaVoice, { actions: [{ label: T().loginBtn, type: 'auth' }] }); return; }

    reply(T().huntStart, viaVoice);
    const progId = Date.now() + 1;
    setMessages(prev => [...prev, { id: progId, role: 'ai', text: '', time: formatTime(langRef.current), progress: { steps: T().huntSteps, current: 0 } }]);
    const setProg = (p: Partial<NonNullable<Message['progress']>>) =>
      setMessages(prev => prev.map(m => (m.id === progId && m.progress ? { ...m, progress: { ...m.progress, ...p } } : m)));
    let step = 0;
    const ticker = window.setInterval(() => { step = Math.min(step + 1, T().huntSteps.length - 1); setProg({ current: step }); }, 8000);
    const ctrl = new AbortController();
    const timeout = window.setTimeout(() => ctrl.abort(), 10 * 60 * 1000);
    setLoading(true);
    try {
      const res = await fetch(`${API}/orchestrator/command`, {
        method: 'POST',
        signal: ctrl.signal,
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ intent: 'find_and_pitch_local_prospects', text: request }),
      });
      if (res.status === 401 || res.status === 403) {
        setProg({ failed: true });
        reply(T().sessionExpired, viaVoice, { actions: [{ label: T().loginBtn, type: 'auth' }] });
        return;
      }
      if (!res.ok) throw new Error(String(res.status));
      const data = (await res.json()) as any;
      const d = data?.data || {};
      if (d.notAllowed) { setProg({ failed: true }); reply(T().huntNotAllowed, viaVoice); return; }
      if (d.creditsExhausted) { setProg({ failed: true }); reply(T().quotaReached, viaVoice, { actions: [{ label: T().plansBtn, type: 'pricing' }] }); return; }
      const businesses: any[] = Array.isArray(d.businesses) ? d.businesses : [];
      if (!businesses.length) { setProg({ failed: true }); reply(T().huntNone, viaVoice); return; }
      // ELYVORI-PROSPECTS-BG: the server now works in the background and reports to Telegram + email
      if (d.started) {
        setProg({ current: T().huntSteps.length - 1, done: true });
        const list = businesses
          .map((b: any) => `• ${b.businessName}${b.rating ? ` ⭐ ${b.rating}` : ''}${b.phone ? ` — ${b.phone}` : ''}`)
          .join('\n');
        reply(
          T().huntStarted.replace('{n}', String(businesses.length)).replace('{cat}', String(d.category || '')).replace('{city}', String(d.city || '')).replace('{list}', list),
          viaVoice,
        );
        return;
      }
      const target = d.target || businesses[0];
      const name = String(target?.businessName || '');
      if (!isPublicUrl(d.demoUrl)) { setProg({ failed: true }); reply(T().huntNoDemo.replace('{name}', name), viaVoice); return; }

      setProg({ current: T().huntSteps.length - 1, done: true });
      const outreach = String(d.outreachDraft || '');
      const why = target?.evidence ? ` — ${target.evidence}` : '';
      let text = T().huntFound.replace('{name}', name).replace('{why}', why).replace('{url}', d.demoUrl).replace('{msg}', outreach);
      const others = businesses.slice(1).map((b: any) => b?.businessName).filter(Boolean);
      if (others.length) text += T().huntOthers.replace('{list}', others.join('، '));
      const email = target?.contactEmail ? String(target.contactEmail) : '';
      if (!email) text += T().huntNoEmail;
      const actions: MsgAction[] = [
        { label: T().huntOpenDemo, url: d.demoUrl },
        { label: T().huntCopy, copy: outreach },
      ];
      if (email) {
        const subject = replyLangRef.current === 'ar' ? `موقع تجريبي مجاني لـ ${name}` : `A free website demo for ${name}`;
        actions.push({ label: T().huntEmail, url: `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(outreach)}` });
      }
      reply(text, false, { actions });
      if (viaVoice && speakOnRef.current) speak(T().huntFound.split('\n')[0].replace('{name}', name).replace('{why}', ''));
    } catch {
      setProg({ failed: true });
      reply(T().buildFailed, viaVoice);
    } finally {
      window.clearInterval(ticker);
      window.clearTimeout(timeout);
      setLoading(false);
    }
  };

  const startWebsiteFlow = async (viaVoice: boolean) => {
    const { token } = getAuth();
    if (!token) {
      reply(T().needLogin, viaVoice, { actions: [{ label: T().loginBtn, type: 'auth' }] });
      lastViaVoiceRef.current = viaVoice;
      setWaitingLogin(true); // continue by itself as soon as the visitor signs in
      try { sessionStorage.setItem('elyvori_resume', JSON.stringify({ what: 'website', lang: replyLangRef.current, at: Date.now() })); } catch { /* ignore */ }
      return;
    }
    setLoading(true);
    const status = await fetchFreeSites(token);
    setLoading(false);
    if (status === 'auth') {
      reply(T().sessionExpired, viaVoice, { actions: [{ label: T().loginBtn, type: 'auth' }] });
      lastViaVoiceRef.current = viaVoice;
      setWaitingLogin(true);
      return;
    }
    if (status && status.left <= 0 && status.balance < status.cost) {
      reply(T().quotaReached, viaVoice, { actions: [{ label: T().plansBtn, type: 'pricing' }] });
      return;
    }
    pendingRef.current = 'details';
    const leftNote = status && status.left > 0 ? `\n\n${T().freeLeft.replace('{n}', String(status.left))}` : '';
    reply(T().askDetails + leftNote, viaVoice);
  };

  // came back from Google/GitHub sign-in (full page reload): pick the website request up again
  useEffect(() => {
    if (!isOwner) return;
    try {
      const raw = sessionStorage.getItem('elyvori_resume');
      if (!raw) return;
      const r = JSON.parse(raw);
      if (Date.now() - (r.at || 0) > 20 * 60 * 1000) { sessionStorage.removeItem('elyvori_resume'); return; }
      if (!getAuth().token) return;
      sessionStorage.removeItem('elyvori_resume');
      replyLangRef.current = r.lang === 'ar' ? 'ar' : 'en';
      setOpen(true);
      window.setTimeout(() => { reply(T().loggedIn, false); startWebsiteFlow(false); }, 700);
    } catch { /* ignore */ }
  }, [isOwner]); // eslint-disable-line react-hooks/exhaustive-deps

  // after "sign in first": watch for the login to finish, then pick the request up again
  useEffect(() => {
    if (!waitingLogin) return;
    const startedAt = Date.now();
    const id = window.setInterval(() => {
      if (Date.now() - startedAt > 15 * 60 * 1000) { setWaitingLogin(false); return; }
      if (getAuth().token) {
        setWaitingLogin(false);
        try { sessionStorage.removeItem('elyvori_resume'); } catch { /* ignore */ }
        setOpen(true);
        window.setTimeout(() => {
          reply(T().loggedIn, lastViaVoiceRef.current);
          startWebsiteFlow(lastViaVoiceRef.current);
        }, 600);
      }
    }, 1000);
    return () => window.clearInterval(id);
  }, [waitingLogin]); // eslint-disable-line react-hooks/exhaustive-deps

  const sendMessage = async (text?: string, viaVoice = false) => {
    const msg = (text ?? input).trim();
    if (!msg || loading) return;
    setInput('');
    stopSpeaking();
    replyLangRef.current = /[\u0600-\u06FF]/.test(msg) ? 'ar' : /[a-z]/i.test(msg) ? 'en' : (langRef.current === 'ar' ? 'ar' : 'en');
    setMessages(prev => [...prev, { id: Date.now(), role: 'user', text: msg, time: formatTime(langRef.current), voice: viaVoice }]);

    // waiting for the business details of a website
    if (pendingRef.current === 'details') {
      pendingRef.current = null;
      buildWebsite(msg, viaVoice);
      return;
    }

    const intent = detectIntent(msg);
    if (intent === 'prospects') {
      huntProspects(msg, viaVoice);
      return;
    }
    if (intent === 'website') {
      startWebsiteFlow(viaVoice);
      return;
    }
    if (intent) {
      reply(T().opening[intent], viaVoice);
      window.setTimeout(() => { runAction(intent); closeOnMobile(); }, 1000);
      return;
    }
    askGemini(msg, viaVoice);
  };

  const onActionClick = (a: MsgAction) => {
    if (a.copy !== undefined) {
      const done = () => reply(T().copied, false);
      try { navigator.clipboard.writeText(a.copy).then(done, done); } catch { done(); }
      return;
    }
    if (a.url) { window.open(a.url, '_blank', 'noopener'); return; }
    if (a.type) { runAction(a.type); closeOnMobile(); }
  };

  /* ---------------- speech input ---------------- */
  function cleanupVoice() {
    window.clearInterval(timerRef.current);
    cancelAnimationFrame(rafRef.current);
    streamRef.current?.getTracks().forEach(tr => tr.stop());
    streamRef.current = null;
    try { audioCtxRef.current?.close(); } catch { /* ignore */ }
    audioCtxRef.current = null;
    recognitionRef.current = null;
    recorderRef.current = null;
    modeRef.current = null;
    setVoiceState('idle');
    setDraft('');
    draftRef.current = '';
  }

  function startWave(stream: MediaStream) {
    try {
      const Ctx = window.AudioContext || (window as any).webkitAudioContext;
      const ctx: AudioContext = new Ctx();
      audioCtxRef.current = ctx;
      const src = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 64;
      src.connect(analyser);
      const data = new Uint8Array(analyser.frequencyBinCount);
      const tick = () => {
        analyser.getByteFrequencyData(data);
        const bars = waveRef.current?.children;
        if (bars) {
          for (let i = 0; i < bars.length; i++) {
            const v = data[(i * 2) % data.length] / 255;
            (bars[i] as HTMLElement).style.height = `${4 + v * 24}px`;
          }
        }
        rafRef.current = requestAnimationFrame(tick);
      };
      tick();
    } catch { /* wave is decorative */ }
  }

  function startRecorder(stream: MediaStream) {
    if (typeof MediaRecorder === 'undefined') {
      cleanupVoice();
      addAi(t.sttUnavailable);
      return;
    }
    modeRef.current = 'rec';
    chunksRef.current = [];
    const rec = new MediaRecorder(stream);
    recorderRef.current = rec;
    rec.ondataavailable = e => { if (e.data.size) chunksRef.current.push(e.data); };
    rec.onstop = async () => {
      if (cancelledRef.current) { cleanupVoice(); return; }
      const blob = new Blob(chunksRef.current, { type: rec.mimeType || 'audio/webm' });
      streamRef.current?.getTracks().forEach(tr => tr.stop());
      cancelAnimationFrame(rafRef.current);
      window.clearInterval(timerRef.current);
      setVoiceState('processing');
      try {
        let upload: Blob = blob;
        try { upload = await toWav(blob); } catch { /* send the original recording */ }
        const fd = new FormData();
        fd.append('audio', upload, upload.type === 'audio/wav' ? 'voice.wav' : 'voice.webm');
        fd.append('lang', langRef.current);
        const res = await fetch(`${API}/public/voice/transcribe`, { method: 'POST', body: fd });
        if (!res.ok) throw new Error(String(res.status));
        const data = (await res.json()) as any;
        const text = (data.text || data.transcript || '').trim();
        cleanupVoice();
        if (text) sendMessage(text, true);
        else addAi(t.noSpeech);
      } catch {
        cleanupVoice();
        addAi(t.sttUnavailable);
      }
    };
    rec.start();
  }

  async function startVoice() {
    if (voiceState !== 'idle' || loading) return;
    stopSpeaking();
    cancelledRef.current = false;
    finalTextRef.current = '';
    draftRef.current = '';
    setDraft('');

    let stream: MediaStream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch (e: any) {
      addAi(e?.name === 'NotFoundError' ? t.micMissing : t.micDenied);
      return;
    }
    streamRef.current = stream;
    setVoiceState('listening');
    setSeconds(0);
    const started = Date.now();
    timerRef.current = window.setInterval(() => {
      const s = Math.floor((Date.now() - started) / 1000);
      setSeconds(s);
      if (s >= 60) stopVoice(); // safety limit
    }, 250);
    startWave(stream);

    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) { startRecorder(stream); return; }

    modeRef.current = 'sr';
    const r = new SR();
    r.lang = langRef.current === 'ar' ? 'ar-SA' : 'en-US';
    r.continuous = false;
    r.interimResults = true;
    r.onresult = (e: any) => {
      let finalText = '';
      let interim = '';
      for (let i = 0; i < e.results.length; i++) {
        const res = e.results[i];
        if (res.isFinal) finalText += res[0].transcript;
        else interim += res[0].transcript;
      }
      finalTextRef.current = finalText;
      const live = (finalText + ' ' + interim).trim();
      draftRef.current = live;
      setDraft(live);
    };
    r.onerror = (e: any) => {
      const err = e?.error;
      if (err === 'no-speech' || err === 'aborted') return; // handled in onend
      // the browser's speech service is missing or blocked (e.g. Opera, Firefox, some Android
      // browsers). The microphone itself works, so record the audio and transcribe it on our server.
      modeRef.current = null;
      try { recognitionRef.current?.abort(); } catch { /* ignore */ }
      if (streamRef.current && !cancelledRef.current) startRecorder(streamRef.current);
    };
    r.onend = () => {
      if (modeRef.current !== 'sr') return; // switched to recorder or already cleaned
      const text = (finalTextRef.current || draftRef.current).trim();
      const cancelled = cancelledRef.current;
      cleanupVoice();
      if (cancelled) return;
      if (text) sendMessage(text, true);
      else addAi(t.noSpeech);
    };
    recognitionRef.current = r;
    try { r.start(); } catch { startRecorder(stream); }
  }

  function stopVoice() {
    if (modeRef.current === 'sr') recognitionRef.current?.stop();
    else if (modeRef.current === 'rec' && recorderRef.current?.state === 'recording') recorderRef.current.stop();
  }

  function cancelVoice() {
    cancelledRef.current = true;
    if (modeRef.current === 'sr') { try { recognitionRef.current?.abort(); } catch { /* ignore */ } cleanupVoice(); }
    else if (modeRef.current === 'rec' && recorderRef.current?.state === 'recording') recorderRef.current.stop();
    else if (voiceState !== 'idle') cleanupVoice();
  }

  const resetChat = () => {
    cancelVoice();
    stopSpeaking();
    setMessages([{ id: Date.now(), role: 'ai', text: t.welcome, time: formatTime(lang) }]);
  };

  if (!isOwner) return null;

  const busyVoice = voiceState !== 'idle';

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
              <div className={`elv-status ${speaking ? 'talking' : ''}`}>{speaking ? t.speaking : t.status}</div>
            </div>
            <button
              type="button"
              className={`elv-icon-btn ${speakOn ? 'on' : ''}`}
              onClick={toggleSpeak}
              aria-label={speakOn ? t.voiceOn : t.voiceOff}
              title={speakOn ? t.voiceOn : t.voiceOff}
              aria-pressed={speakOn}
            >
              <SpeakerIcon on={speakOn} />
            </button>
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
                  {msg.progress ? (
                    <div className="elv-bubble elv-progress">
                      {msg.progress.steps.map((st, i) => {
                        const p = msg.progress!;
                        const state = p.failed && i === p.current ? 'failed' : p.done || i < p.current ? 'done' : i === p.current ? 'active' : 'todo';
                        return (
                          <div key={st} className={`elv-step ${state}`}>
                            <span className="elv-step-dot">{state === 'done' ? <CheckIcon /> : state === 'failed' ? <CloseIcon size={12} /> : null}</span>
                            <span>{st}</span>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="elv-bubble" dir="auto" dangerouslySetInnerHTML={{ __html: renderText(msg.text) }} />
                  )}
                  {msg.actions && msg.actions.length > 0 && (
                    <div className="elv-actions">
                      {msg.actions.map(a => (
                        <button key={a.label} type="button" className="elv-action" onClick={() => onActionClick(a)}>
                          {a.label}
                        </button>
                      ))}
                    </div>
                  )}
                  <div className="elv-time">
                    {msg.voice && (
                      <span className="elv-voice-tag"><MicIcon size={11} /> </span>
                    )}
                    {msg.time}
                  </div>
                </div>
              </div>
            ))}

            {voiceState === 'listening' && (
              <div className="elv-row user draft">
                <div className="elv-col">
                  <div className="elv-bubble" dir="auto">
                    {draft || <span className="elv-draft-empty">{modeRef.current === 'rec' ? t.listening : t.speakNow}</span>}
                  </div>
                </div>
              </div>
            )}

            {loading && !messages.some(m => m.progress && !m.progress.done && !m.progress.failed) && (
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

          {messages.length <= 1 && !loading && !busyVoice && (
            <div className="elv-chips">
              {t.suggestions.map(s => (
                <button key={s} type="button" className="elv-chip" onClick={() => sendMessage(s)}>
                  {s}
                </button>
              ))}
            </div>
          )}

          <div className="elv-composer">
            {voiceState === 'idle' && (
              <form className="elv-inputbar" onSubmit={e => { e.preventDefault(); sendMessage(); }}>
                <input
                  ref={inputRef}
                  className="elv-input"
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  placeholder={t.placeholder}
                  disabled={loading}
                  dir={input ? 'auto' : isAr ? 'rtl' : 'ltr'}
                  enterKeyHint="send"
                  aria-label={t.placeholder}
                />
                <button
                  type="button"
                  className="elv-tool elv-mic"
                  onClick={startVoice}
                  disabled={loading}
                  aria-label={t.speak}
                  title={t.speak}
                >
                  <MicIcon />
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
            )}

            {voiceState === 'listening' && (
              <div className="elv-recbar">
                <button type="button" className="elv-tool elv-cancel" onClick={cancelVoice} aria-label={t.cancel} title={t.cancel}>
                  <CloseIcon />
                </button>
                <div className="elv-recinfo">
                  <span className="elv-recdot" />
                  <span>{formatDuration(seconds)}</span>
                </div>
                <div className="elv-wave" ref={waveRef} aria-hidden="true">
                  {Array.from({ length: WAVE_BARS }).map((_, i) => <span key={i} />)}
                </div>
                <button type="button" className="elv-tool elv-done" onClick={stopVoice} aria-label={t.stopAndSend} title={t.stopAndSend}>
                  <CheckIcon />
                </button>
              </div>
            )}

            {voiceState === 'processing' && (
              <div className="elv-recbar processing">
                <span className="elv-spinner" style={{ marginInlineStart: 10 }} />
                <span className="elv-proc-text">{t.processing}</span>
              </div>
            )}

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
