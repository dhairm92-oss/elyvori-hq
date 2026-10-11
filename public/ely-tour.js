/* Elyvori guided tours: a site tour, a short tour for each of the 10 services (and the Factory's agents),
   and a floating helper to replay them or find the right service for an idea.
   Standalone on purpose: it reads the page, never changes it, and a step whose target is missing is
   simply shown in the middle of the screen. Progress is kept per tour in localStorage ("ely_tours"). */
(function () {
  if (window.__elyTour) return;
  window.__elyTour = 1;

  var doc = document, html = doc.documentElement;
  var KEY = 'ely_tours';
  var PATH = location.pathname.replace(/\/+$/, '') || '/';
  var STATIC = /\.html$/.test(PATH);
  var IS_FACTORY_PAGE = /\/projects\.html$/.test(PATH);
  var IS_HOME = !STATIC;

  // ------------------------------------------------------------------ storage
  function readDone() { try { return JSON.parse(localStorage.getItem(KEY) || '{}') || {}; } catch (e) { return {}; } }
  function isDone(id) { return !!readDone()[id]; }
  function markDone(id) { try { var d = readDone(); d[id] = Date.now(); localStorage.setItem(KEY, JSON.stringify(d)); } catch (e) {} }
  function resetAll() { try { localStorage.removeItem(KEY); } catch (e) {} }

  function lang() { return (html.lang || '').slice(0, 2) === 'ar' ? 'ar' : 'en'; }
  function L(o) { return o == null ? '' : typeof o === 'string' ? o : (o[lang()] || o.en || ''); }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  var mq = function (q) { return window.matchMedia && matchMedia(q).matches; };
  function narrow() { return mq('(max-width: 640px)'); }
  function reduced() { return mq('(prefers-reduced-motion: reduce)'); }

  // ------------------------------------------------------------------ icons
  var SV = function (p, extra) { return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"' + (extra || '') + '>' + p + '</svg>'; };
  var IC = {
    help: SV('<circle cx="12" cy="12" r="9.5"/><path d="M9.3 9.2a2.8 2.8 0 0 1 5.4 1c0 1.9-2.7 2.3-2.7 4"/><path d="M12 17.3h.01"/>'),
    x: SV('<path d="M6 6l12 12M18 6L6 18"/>'),
    play: SV('<path d="M7 5.5v13l11-6.5z" fill="currentColor"/>'),
    replay: SV('<path d="M3 12a9 9 0 1 0 3-6.7"/><path d="M3 4v5h5"/>'),
    spark: SV('<path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z"/>'),
    check: SV('<path d="M5 12.5l4.5 4.5L19 7"/>'),
    arrow: SV('<path d="M5 12h14M13 6l6 6-6 6"/>', ' class="fl"'),
    back: SV('<path d="M15 18l-6-6 6-6"/>', ' class="fl"'),
    search: SV('<circle cx="11" cy="11" r="7"/><path d="M20 20l-4-4"/>'),
    // services
    'digital-products': SV('<path d="M14 3H6a1 1 0 0 0-1 1v16a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V8z"/><path d="M14 3v5h5M8 13h8M8 17h5"/>'),
    'web-app-building': SV('<rect x="2" y="4" width="13" height="10" rx="2"/><path d="M6 18h5M8.5 14v4"/><rect x="16" y="8" width="6" height="12" rx="1.6"/>'),
    'recruitment-crm': SV('<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20a6.5 6.5 0 0 1 13 0"/><path d="M16 11l2 2 4-4"/>'),
    'marketing-agent': SV('<path d="M3 11v2a1 1 0 0 0 1 1h3l5 4V6L7 10H4a1 1 0 0 0-1 1z"/><path d="M16 9a3 3 0 0 1 0 6M19 6a7 7 0 0 1 0 12"/>'),
    'content-agent': SV('<path d="M4 20h4L19 9l-4-4L4 16z"/><path d="M13.5 6.5l4 4"/>'),
    'lead-finder': SV('<circle cx="11" cy="11" r="7"/><path d="M20 20l-4-4M11 8v6M8 11h6"/>'),
    'career-agent': SV('<rect x="3" y="7" width="18" height="13" rx="2"/><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M3 13h18"/>'),
    'contract-analyzer': SV('<path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z"/><path d="M9 12l2 2 4-4"/>'),
    'customer-support': SV('<path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12z"/><path d="M8.5 12h.01M12 12h.01M15.5 12h.01"/>'),
    'negotiation': SV('<path d="M8 11l3-3 3 2 3-3 4 4-6 6-3-2-3 3-6-6z"/>')
  };

  // ------------------------------------------------------------------ the 10 services
  // open: how the service is reached. page = its own screen in the app; factory = /projects.html; card = described on the home page.
  var SERVICES = [
    { id: 'web-app-building', open: 'factory', name: { en: 'Website & App Building (the Factory)', ar: 'بناء المواقع والتطبيقات (المصنع)' },
      short: { en: 'Full websites and apps with real backends, built in VS Code on your computer — you control it from your phone.', ar: 'مواقع وتطبيقات كاملة بسيرفر حقيقي، بتنبني بـ VS Code على كمبيوترك — وإنت بتتحكّم من جوالك.' },
      kw: ['website', 'web', 'app', 'application', 'android', 'ios', 'mobile app', 'store', 'shop', 'ecommerce', 'e-commerce', 'booking', 'dashboard', 'api', 'backend', 'database', 'react', 'flutter', 'saas', 'platform', 'portal', 'system', 'code', 'build', 'موقع', 'تطبيق', 'متجر', 'حجوزات', 'حجز', 'لوحة', 'نظام', 'منصة', 'برمجة', 'سيرفر', 'قاعدة بيانات', 'اندرويد', 'أندرويد', 'ايفون', 'ابني', 'بناء'] },
    { id: 'digital-products', open: 'card', name: { en: 'Digital Products', ar: 'المنتجات الرقمية' },
      short: { en: 'Researches market gaps and builds sellable products: PDF guides, Excel templates, mini-courses.', ar: 'بيدرس فجوات السوق وبيبني منتجات بتنباع: أدلة PDF، قوالب Excel، دورات قصيرة.' },
      kw: ['pdf', 'guide', 'ebook', 'e-book', 'template', 'excel', 'sheet', 'course', 'mini-course', 'sell', 'digital product', 'passive', 'دليل', 'كتاب', 'قالب', 'اكسل', 'إكسل', 'دورة', 'كورس', 'منتج رقمي', 'أبيع', 'ابيع', 'دخل'] },
    { id: 'recruitment-crm', open: 'card', name: { en: 'Recruitment CRM', ar: 'نظام إدارة التوظيف (CRM)' },
      short: { en: 'An AI applicant tracking system: resume parsing, hiring stages, interview questions, team notes.', ar: 'نظام ذكي لمتابعة المتقدمين: قراءة السير الذاتية، مراحل التوظيف، أسئلة المقابلات، ملاحظات الفريق.' },
      kw: ['hire', 'hiring', 'recruit', 'candidate', 'applicant', 'ats', 'interview', 'hr', 'employees', 'team hiring', 'توظيف موظفين', 'موظف', 'موظفين', 'مرشح', 'متقدم', 'مقابلة', 'مقابلات', 'موارد بشرية', 'تعيين'] },
    { id: 'marketing-agent', open: 'card', name: { en: 'Marketing Agent', ar: 'وكيل التسويق' },
      short: { en: 'Bilingual Arabic/English social campaigns with calendars and hashtags, for every platform.', ar: 'حملات سوشال ميديا بالعربي والإنجليزي، مع جدول نشر وهاشتاقات، لكل المنصات.' },
      kw: ['marketing', 'campaign', 'social', 'instagram', 'facebook', 'linkedin', 'twitter', 'tiktok', 'ads', 'hashtag', 'promote', 'brand', 'تسويق', 'حملة', 'إعلان', 'اعلان', 'انستغرام', 'انستقرام', 'فيسبوك', 'سوشال', 'هاشتاق', 'ترويج'] },
    { id: 'content-agent', open: 'card', name: { en: 'Content Creation Agent', ar: 'وكيل صناعة المحتوى' },
      short: { en: 'A full content package in one go: blog article, video script, social posts, product description.', ar: 'حزمة محتوى كاملة مرة وحدة: مقال، سكربت فيديو، بوستات، ووصف منتج.' },
      kw: ['content', 'blog', 'article', 'script', 'video', 'youtube', 'post', 'copy', 'description', 'write', 'writing', 'محتوى', 'مقال', 'مدونة', 'سكربت', 'فيديو', 'يوتيوب', 'بوست', 'منشور', 'كتابة', 'وصف'] },
    { id: 'lead-finder', open: 'card', name: { en: 'Lead Discovery Agent', ar: 'وكيل اكتشاف العملاء' },
      short: { en: 'Finds local businesses with no website, builds each a free demo and writes the outreach email.', ar: 'بيلاقي محلات ما عندها موقع، بيبنيلها ديمو مجاني، وبيكتب إيميل التواصل.' },
      kw: ['leads', 'lead', 'clients', 'customers', 'prospects', 'outreach', 'cold email', 'local business', 'find clients', 'sales', 'عملاء', 'زبائن', 'زباين', 'ألاقي عملاء', 'الاقي', 'محلات', 'مبيعات', 'تواصل'] },
    { id: 'career-agent', open: 'page', action: 'career', name: { en: 'Career Agent', ar: 'وكيل التوظيف' },
      short: { en: 'Reads your CV, searches real open jobs and writes a cover letter for each real match.', ar: 'بيقرأ سيرتك الذاتية، بيدوّر على وظائف حقيقية، وبيكتب رسالة تغطية لكل وظيفة مناسبة.' },
      kw: ['job', 'jobs', 'career', 'cv', 'resume', 'cover letter', 'work', 'vacancy', 'apply', 'وظيفة', 'وظايف', 'شغل', 'سيرة', 'سي في', 'رسالة تغطية', 'تقديم', 'أشتغل'] },
    { id: 'contract-analyzer', open: 'page', action: 'contract', name: { en: 'Contract Analyzer', ar: 'وكيل تحليل العقود' },
      short: { en: 'Scans a contract for risk: safety score, red-flag clauses and ready counter-proposals.', ar: 'بيفحص العقد: درجة أمان، بنود خطيرة، واقتراحات تعديل جاهزة.' },
      kw: ['contract', 'agreement', 'clause', 'legal', 'nda', 'lease', 'terms', 'sign', 'عقد', 'عقود', 'اتفاقية', 'بند', 'بنود', 'قانوني', 'إيجار', 'ايجار', 'توقيع'] },
    { id: 'customer-support', open: 'page', action: 'support', name: { en: 'Customer Support AI', ar: 'وكيل خدمة العملاء' },
      short: { en: 'Turns an angry customer message into a calm strategy and a ready-to-send reply.', ar: 'بيحوّل رسالة زبون زعلان لخطة تهدئة ورد جاهز للإرسال.' },
      kw: ['support', 'complaint', 'angry', 'refund', 'reply', 'customer service', 'ticket', 'review', 'شكوى', 'زبون زعلان', 'زعلان', 'رد', 'خدمة العملاء', 'دعم', 'استرجاع', 'تقييم'] },
    { id: 'negotiation', open: 'page', action: 'negotiation', name: { en: 'AI Negotiation Simulator', ar: 'وكيل التفاوض' },
      short: { en: 'Practise a real negotiation against an AI counterpart, with live scoring and coaching.', ar: 'تدرّب على مفاوضة حقيقية ضد الذكاء الاصطناعي، مع تقييم وتدريب مباشر.' },
      kw: ['negotiate', 'negotiation', 'salary', 'deal', 'price', 'raise', 'bargain', 'pitch', 'تفاوض', 'مفاوضة', 'راتب', 'صفقة', 'سعر', 'زيادة', 'خصم'] }
  ];
  var byId = {}; SERVICES.forEach(function (s) { byId[s.id] = s; });

  // ------------------------------------------------------------------ finding things on the page
  function q(sel) { try { return doc.querySelector(sel); } catch (e) { return null; } }
  function visible(el) { if (!el) return false; var r = el.getBoundingClientRect(); return r.width > 2 && r.height > 2 && getComputedStyle(el).visibility !== 'hidden'; }
  function first() { for (var i = 0; i < arguments.length; i++) { var a = arguments[i]; var el = typeof a === 'function' ? a() : q(a); if (el && visible(el)) return el; } return null; }
  /** the open service page (career / contract / support / negotiation), found by its heading */
  var PAGE_SIGNS = {
    'career-agent': /Found by AI|يجدها الذكاء/, 'contract-analyzer': /Contract Risk|محلل مخاطر/,
    'customer-support': /Customer Support|وكيل دعم/, 'negotiation': /Negotiation\s*Simulator|محاكاة\s*التفاوض/
  };
  function navAgents() { var bs = doc.querySelectorAll('nav button, header button'); for (var i = 0; i < bs.length; i++) if (/AI Agents|الوكلاء الذكيون/.test(bs[i].textContent || '') && visible(bs[i])) return bs[i]; return null; }
  function pageHeading() { var hs = doc.querySelectorAll('h1'); for (var i = 0; i < hs.length; i++) if (visible(hs[i])) return hs[i]; return null; }
  function currentPage() {
    if (IS_FACTORY_PAGE) return 'web-app-building';
    var h = pageHeading(); if (!h) return null;
    var t = (h.textContent || '').replace(/\s+/g, ' ');
    for (var id in PAGE_SIGNS) if (PAGE_SIGNS[id].test(t)) return id;
    return null;
  }
  function pageRoot() { var h = pageHeading(); var n = h; for (var i = 0; n && i < 6; i++) n = n.parentElement; return n || doc.body; }
  function pageInput() {
    var root = pageRoot(), els = root.querySelectorAll('textarea, input[type=file], input:not([type=hidden]):not([type=checkbox]):not([type=radio])');
    for (var i = 0; i < els.length; i++) { var el = els[i]; if (el.type === 'file') { var lab = el.closest('label,div'); if (lab && visible(lab)) return lab; } else if (visible(el)) return el; }
    return null;
  }
  function pageAction() {
    var bs = pageRoot().querySelectorAll('button'), re = /analy|find|search|start|generate|begin|send|simulat|حلل|ابحث|ابدأ|ابدا|ولّد|ولد|أرسل|ارسل|ابدأ التفاوض|حلّل/i;
    for (var i = 0; i < bs.length; i++) if (visible(bs[i]) && re.test(bs[i].textContent || '')) return bs[i];
    return null;
  }

  // ------------------------------------------------------------------ opening a service
  function openService(s) {
    hidePanel();
    if (s.open === 'factory') { location.href = '/projects.html'; return; }
    if (!IS_HOME) { location.href = '/#ely-open=' + s.id; return; }
    if (s.open === 'page') { window.dispatchEvent(new CustomEvent('elyvori:action', { detail: { type: s.action } })); return; }
    var card = q('#service-card-' + s.id);
    if (card) { card.scrollIntoView({ behavior: reduced() ? 'auto' : 'smooth', block: 'center' }); setTimeout(function () { run(cardTour(s), { force: true }); }, reduced() ? 50 : 650); }
    else run(cardTour(s), { force: true });
  }

  // ------------------------------------------------------------------ tours
  var T = {
    next: { en: 'Next', ar: 'التالي' }, back: { en: 'Back', ar: 'رجوع' }, done: { en: 'Done', ar: 'تمام' }, skip: { en: 'Skip tour', ar: 'تخطّي الجولة' },
    start: { en: 'Show me around', ar: 'فرجيني' }, later: { en: 'Not now', ar: 'مش هلق' }, of: { en: 'of', ar: 'من' },
    helpTitle: { en: 'Elyvori guide', ar: 'دليل Elyvori' }, helpBtn: { en: 'Guide & tours', ar: 'الدليل والجولات' },
    replayHere: { en: 'Replay the tour of this page', ar: 'أعد جولة هالصفحة' }, replaySite: { en: 'Replay the Elyvori tour', ar: 'أعد جولة Elyvori كاملة' },
    whichH: { en: 'Which agent fits my idea?', ar: 'أي وكيل بيناسب فكرتي؟' }, whichPh: { en: 'Describe your idea in a few words… e.g. "an online shop for my flowers"', ar: 'اوصف فكرتك بكلمتين… مثلاً «متجر أونلاين للورد»' },
    best: { en: 'Best match', ar: 'الأنسب' }, also: { en: 'Also useful', ar: 'بتفيد كمان' }, noMatch: { en: 'Write a bit more — what do you want to get at the end?', ar: 'اكتب شوي أكثر — شو بدك يطلع معك بالآخر؟' },
    open: { en: 'Open', ar: 'افتح' }, tour: { en: 'Tour', ar: 'جولة' }, all: { en: 'All 10 agents', ar: 'الوكلاء العشرة' },
    explored: { en: 'explored', ar: 'استكشفت' }, reset: { en: 'Reset all tours', ar: 'صفّر كل الجولات' }, resetOk: { en: 'Tours will show again.', ar: 'الجولات رح تظهر من جديد.' },
    keys: { en: 'Matched:', ar: 'لأنك كتبت:' }
  };

  var SITE_TOUR = { id: 'site', steps: [
    { title: { en: 'Welcome to Elyvori 👋', ar: 'أهلاً فيك بـ Elyvori 👋' }, intro: true,
      body: { en: 'Ten AI agents under one account — from building full apps to analysing contracts. This 1-minute tour shows how it all fits together.', ar: 'عشر وكلاء ذكاء اصطناعي بحساب واحد — من بناء تطبيقات كاملة لتحليل العقود. جولة دقيقة بتفرجيك كيف كل اشي مركّب مع بعض.' } },
    { target: function () { return first('#hero-cta-group'); }, title: { en: 'Start here', ar: 'من هون بتبلّش' },
      body: { en: 'Create your account or jump straight into a demo. One sign-in works for every service, the Factory and VS Code.', ar: 'اعمل حسابك أو جرّب عرض مباشرة. تسجيل دخول واحد بيشتغل لكل الخدمات وللمصنع ولـ VS Code.' } },
    { target: function () { return first('#services-title'); }, title: { en: 'Ten specialised AI agents', ar: 'عشر وكلاء ذكاء اصطناعي متخصصين' },
      body: { en: 'Each card is one agent with its own job. Tap any card for a short tour of it — or ask the guide which one fits your idea.', ar: 'كل بطاقة وكيل إله شغلة. اضغط على أي بطاقة وبتاخد جولة قصيرة عنه — أو اسأل الدليل مين الأنسب لفكرتك.' } },
    { target: function () { return first(navAgents, 'button[aria-label="Menu"]'); }, title: { en: 'Jump between agents', ar: 'تنقّل بين الوكلاء' },
      body: { en: 'The “AI Agents” menu opens any agent directly. On the phone it is inside the menu ☰. The guide button (bottom corner) does it too.', ar: 'قائمة «الوكلاء الذكيون» بتفتح أي وكيل مباشرة. على الجوال موجودة جوا القائمة ☰. وزر الدليل (تحت بالزاوية) بيعملها كمان.' } },
    { target: function () { return first('#service-card-web-app-building'); }, title: { en: 'The Factory: phone → your computer', ar: 'المصنع: من جوالك لكمبيوترك' },
      body: { en: 'Describe an app from your phone. VS Code on your computer plans it, writes the code and checks it — and nothing is saved until you approve each step.', ar: 'اوصف التطبيق من جوالك. VS Code على كمبيوترك بيخطّطه وبيكتب الكود وبيفحصه — وما بينحفظ اشي قبل ما توافق على كل خطوة.' } },
    { title: { en: 'Your dashboard', ar: 'لوحتك' }, center: true,
      body: { en: '“My projects” shows every project: tasks, screens and credits — and lets you approve, reject or add features from anywhere.', ar: '«مشاريعي» بتورجيك كل مشروع: المهام والشاشات والرصيد — ومنها بتوافق أو بترفض أو بتزيد ميزة من أي مكان.' },
      action: { label: { en: 'Open My projects', ar: 'افتح مشاريعي' }, href: '/projects.html' } },
    { target: function () { return first('#pricing-title', '#pricing'); }, title: { en: 'Plans & credits', ar: 'الباقات والرصيد' },
      body: { en: 'Every plan includes all ten agents. Factory tasks use credits — you always see the cost before anything is charged.', ar: 'كل باقة فيها الوكلاء العشرة. مهام المصنع بتستعمل رصيد — وبتشوف السعر دايماً قبل ما ينخصم اشي.' } },
    { target: function () { return helpBtnEl(); }, title: { en: 'Need this again?', ar: 'بدك ترجعلها؟' }, pad: 6,
      body: { en: 'This button replays any tour, lists all ten agents and recommends the right one for your idea.', ar: 'هالزر بيعيد أي جولة، بيعرض الوكلاء العشرة، وبيقترحلك الوكيل المناسب لفكرتك.' } }
  ] };

  /** 3-step tour for a service described by its card (or the short intro of a page service) */
  function cardTour(s) {
    var card = function () { return first('#service-card-' + s.id); };
    var start = {
      'digital-products': { en: 'Ask the Elyvori assistant (the chat button) or the form below: tell it your niche and what you want to sell.', ar: 'اطلب من مساعد Elyvori (زر المحادثة) أو من النموذج تحت: قلّه مجالك وشو بدك تبيع.' },
      'recruitment-crm': { en: 'Request it for your team from the form below. On the phone or the computer, the hiring board works the same.', ar: 'اطلبه لفريقك من النموذج تحت. على الجوال أو الكمبيوتر، لوحة التوظيف بتشتغل نفس الإشي.' },
      'marketing-agent': { en: 'Tell the assistant (chat button) your product and audience — Arabic, English or both.', ar: 'قول للمساعد (زر المحادثة) شو منتجك ومين جمهورك — عربي، إنجليزي، أو الثنين.' },
      'content-agent': { en: 'Give the assistant (chat button) one topic; you get the whole package back in one pass.', ar: 'اعطي المساعد (زر المحادثة) موضوع واحد؛ وبيرجعلك الحزمة كاملة مرة وحدة.' },
      'lead-finder': { en: 'Tell the assistant (chat button) a niche and a city — e.g. "cafés in Ramallah".', ar: 'قول للمساعد (زر المحادثة) المجال والمدينة — مثلاً «كافيهات برام الله».' }
    }[s.id];
    var review = {
      'digital-products': { en: 'You review each file — guide, template or course outline — and ask for changes before you publish or sell it.', ar: 'بتراجع كل ملف — الدليل أو القالب أو الدورة — وبتطلب تعديلات قبل ما تنشره أو تبيعه.' },
      'recruitment-crm': { en: 'Every candidate gets a match score, stage and notes; your team decides — the AI never rejects anyone on its own.', ar: 'كل مرشح بياخد نسبة مطابقة ومرحلة وملاحظات؛ وفريقك هو اللي بيقرّر — الذكاء ما بيرفض حدا لحاله.' },
      'marketing-agent': { en: 'Posts come as drafts per platform with a calendar — edit, approve, then publish.', ar: 'البوستات بتيجي مسودات لكل منصة مع جدول — بتعدّل، بتوافق، وبعدين بتنشر.' },
      'content-agent': { en: 'Everything arrives as editable text: tweak the tone, copy what you need.', ar: 'كل اشي بيوصلك نص قابل للتعديل: عدّل الأسلوب وانسخ اللي بدك ياه.' },
      'lead-finder': { en: 'You see the evidence, the demo and the email for each business — nothing is sent until you press send.', ar: 'بتشوف الدليل والديمو والإيميل لكل محل — وما بينبعت اشي قبل ما تضغط إرسال.' }
    }[s.id];
    var steps = [{ target: card, title: s.name, body: s.short, badge: true }];
    if (s.open === 'card') {
      steps.push({ target: function () { return first('#demo') || card(); }, title: { en: 'How to start', ar: 'كيف بتبلّش' }, body: start });
      steps.push({ target: card, title: { en: 'Review before you use it', ar: 'راجع قبل ما تستعمل' }, body: review });
    } else {
      steps.push({ target: card, title: { en: 'Try it', ar: 'جرّبها' }, body: { en: 'Open it — the first time, a short tour shows you around.', ar: 'افتحها — أول مرة بتاخد جولة قصيرة جواها.' },
        action: { label: { en: 'Open', ar: 'افتح' }, run: function () { openService(s); } } });
    }
    return { id: 'card:' + s.id, done: s.open === 'card' ? s.id : null, steps: steps };
  }

  /** micro-tour inside a service page */
  function pageTour(id) {
    var s = byId[id];
    var how = {
      'career-agent': [{ en: 'Upload your CV (PDF)', ar: 'ارفع سيرتك الذاتية (PDF)' }, { en: 'Upload your CV here — from your phone\'s files or your computer. It is only used for this search.', ar: 'ارفع سيرتك هون — من ملفات الجوال أو من الكمبيوتر. بتنستعمل بس لهالبحث.' },
        { en: 'Check every match', ar: 'راجع كل وظيفة' }, { en: 'Each job shows an honest fit score from real listings. Read the cover letter, edit it, then apply yourself.', ar: 'كل وظيفة إلها نسبة مطابقة صادقة من إعلانات حقيقية. اقرأ رسالة التغطية وعدّلها، وبعدين قدّم بنفسك.' }],
      'contract-analyzer': [{ en: 'Paste or upload the contract', ar: 'الصق العقد أو ارفعه' }, { en: 'Paste the text or upload a PDF — works the same on mobile and desktop.', ar: 'الصق النص أو ارفع PDF — بتشتغل نفس الإشي على الجوال والكمبيوتر.' },
        { en: 'Review the risks', ar: 'راجع المخاطر' }, { en: 'You get a safety score, red-flag clauses and counter-proposals. It is guidance, not legal advice — check big decisions with a lawyer.', ar: 'بتاخد درجة أمان، والبنود الخطيرة، واقتراحات تعديل. هي إرشاد مش استشارة قانونية — بالقرارات الكبيرة ارجع لمحامي.' }],
      'customer-support': [{ en: 'Paste the customer\'s message', ar: 'الصق رسالة الزبون' }, { en: 'Paste the message as it came — WhatsApp, email or a review.', ar: 'الصق الرسالة زي ما وصلت — واتساب، إيميل، أو تقييم.' },
        { en: 'Review the reply', ar: 'راجع الرد' }, { en: 'You get the tone, the churn risk, a strategy and a ready reply. Edit it, then send it yourself.', ar: 'بتاخد نبرة الزبون، احتمال إنه يروح، خطة، ورد جاهز. عدّله وابعته بنفسك.' }],
      'negotiation': [{ en: 'Set the scene', ar: 'جهّز الموقف' }, { en: 'Pick a scenario or describe your own — a salary, a supplier, a client.', ar: 'اختار موقف أو اوصف موقفك — راتب، مورّد، زبون.' },
        { en: 'Learn from every move', ar: 'اتعلّم من كل حركة' }, { en: 'Each reply is scored with coaching tips; at the end you get a summary of the deal.', ar: 'كل رد إله تقييم ونصايح؛ وبالآخر بتاخد ملخص الصفقة.' }]
    }[id];
    return { id: id, done: id, steps: [
      { target: function () { return pageHeading(); }, title: s.name, body: s.short, badge: true },
      { target: pageInput, title: how[0], body: how[1] },
      { target: function () { return pageAction() || pageInput(); }, title: how[2], body: how[3] }
    ] };
  }

  /** the Factory page (projects.html): phone ↔ computer, the agents, approvals */
  function factoryTour() {
    var onProject = !!q('#remote');
    var agents = '<div class="ag">' + [
      ['🧭', { en: 'Architect', ar: 'المهندس' }, { en: 'plans screens, tasks and colours', ar: 'بيخطّط الشاشات والمهام والألوان' }],
      ['🖥️', { en: 'Web', ar: 'الويب' }, { en: 'React front ends', ar: 'واجهات React' }],
      ['📱', { en: 'Mobile', ar: 'الجوال' }, { en: 'Android / Flutter apps', ar: 'تطبيقات Android / Flutter' }],
      ['🗄️', { en: 'Backend', ar: 'السيرفر' }, { en: 'APIs and databases', ar: 'APIs وقواعد بيانات' }],
      ['⚙️', { en: 'DevOps', ar: 'DevOps' }, { en: 'project setup, scripts', ar: 'تجهيز المشروع والسكربتات' }],
      ['🛡️', { en: 'Checks', ar: 'الفحوصات' }, { en: 'tests, types, security, imports', ar: 'اختبارات، أنواع، أمان، استيرادات' }]
    ].map(function (a) { return '<div><span>' + a[0] + '</span><b>' + esc(L(a[1])) + '</b><small>' + esc(L(a[2])) + '</small></div>'; }).join('') + '</div>';
    var steps = [
      { title: { en: 'The Elyvori Factory', ar: 'مصنع Elyvori' }, badge: 'web-app-building', center: true,
        body: { en: 'A team of AI agents builds your app inside VS Code on your computer. Your code never leaves it — this page shows the progress and lets you steer from anywhere.', ar: 'فريق وكلاء ذكاء اصطناعي بيبني تطبيقك جوا VS Code على كمبيوترك. الكود ما بيطلع منه — وهالصفحة بتورجيك التقدّم وبتخليك تتحكّم من أي مكان.' } },
      { title: { en: 'Who works on your project', ar: 'مين بيشتغل على مشروعك' }, center: true, html: agents,
        body: { en: 'Each task goes to the right agent; every change must pass the checks before it reaches you.', ar: 'كل مهمة بتروح للوكيل المناسب؛ وكل تغيير لازم ينجح بالفحوصات قبل ما يوصلك.' } }
    ];
    if (onProject) {
      steps.push({ target: function () { return first('#remote'); }, title: { en: 'Control it from here', ar: 'تحكّم فيه من هون' },
        body: { en: 'Approve or reject the waiting task (you see its files and checks), build the next one, or add a feature — from your phone or any computer.', ar: 'وافق أو ارفض المهمة اللي بتستنى (بتشوف ملفاتها وفحوصاتها)، ابنِ الجاية، أو زيد ميزة — من جوالك أو من أي كمبيوتر.' } });
    } else {
      steps.push({ target: function () { return first('a[data-tip-target="new"]'); }, title: { en: 'Send a project from your phone or computer', ar: 'ابعت مشروع من جوالك أو كمبيوترك' },
        body: { en: 'On a computer with VS Code it opens there. On your phone, describe it and send it — VS Code on your linked computer picks it up in seconds.', ar: 'على كمبيوتر عليه VS Code بيفتح هناك. ومن جوالك، اوصفه وابعته — وVS Code على كمبيوترك المربوط بيستلمه خلال ثواني.' } });
      steps.push({ target: function () { return first('.pcard', '.grid'); }, title: { en: 'Review and approve each step', ar: 'راجع ووافق على كل خطوة' },
        body: { en: 'Open a project to see what waits for you: the plan, or the finished task\'s files and checks. Nothing is committed until you approve.', ar: 'افتح مشروع لتشوف شو بيستناك: الخطة، أو ملفات المهمة وفحوصاتها. ما بينحفظ اشي قبل موافقتك.' } });
    }
    return { id: onProject ? 'factory-project' : 'web-app-building', done: onProject ? 'factory-project' : 'web-app-building', steps: steps };
  }

  // ------------------------------------------------------------------ UI (shadow DOM, so the site's styles never clash)
  var host = doc.createElement('div');
  host.id = 'ely-tour';
  host.setAttribute('data-ely', '');
  var shadow = host.attachShadow ? host.attachShadow({ mode: 'open' }) : host;
  var CSS = ':host{all:initial}' +
    '*{box-sizing:border-box;font-family:inherit}' +
    '.wrap{--bg:#0B0F1C;--card:#111728;--line:rgba(148,163,184,.18);--line2:rgba(148,163,184,.3);--text:#EEF2F8;--muted:#9AA6BC;--faint:#6B778C;--cyan:#00E5FF;--violet:#7C3AED;--grad:linear-gradient(135deg,#00E5FF,#7C3AED);--dim:rgba(3,6,14,.66);--shadow:0 30px 80px -24px rgba(0,0,0,.85);font-family:"Plus Jakarta Sans",system-ui,-apple-system,"Segoe UI",sans-serif;color:var(--text);font-size:14.5px;line-height:1.55;-webkit-font-smoothing:antialiased}' +
    '.wrap.ar{font-family:"Cairo","Plus Jakarta Sans",system-ui,sans-serif}' +
    '.wrap.light{--bg:#F6F8FC;--card:#FFFFFF;--line:rgba(15,23,42,.1);--line2:rgba(15,23,42,.18);--text:#0F172A;--muted:#5B6578;--faint:#8A94A6;--dim:rgba(15,23,42,.42);--shadow:0 24px 60px -24px rgba(15,23,42,.45)}' +
    'svg{width:18px;height:18px;flex:none}.wrap.ar .fl{transform:scaleX(-1)}' +
    'button{font:inherit;color:inherit}' +
    /* overlay + spotlight */
    '.ov{position:fixed;inset:0;z-index:2147483000;pointer-events:auto}' +
    '.ov.center{background:var(--dim);backdrop-filter:blur(2px);-webkit-backdrop-filter:blur(2px)}' +
    '.spot{position:fixed;z-index:2147483001;border-radius:16px;box-shadow:0 0 0 200vmax var(--dim),0 0 0 2px rgba(0,229,255,.9),0 0 30px 4px rgba(0,229,255,.35);pointer-events:none;transition:top .35s cubic-bezier(.2,.8,.2,1),left .35s cubic-bezier(.2,.8,.2,1),width .35s,height .35s}' +
    '.wrap.light .spot{box-shadow:0 0 0 200vmax var(--dim),0 0 0 2px rgba(124,58,237,.9),0 0 26px 4px rgba(124,58,237,.3)}' +
    '.spot:after{content:"";position:absolute;inset:-6px;border-radius:20px;border:2px solid rgba(0,229,255,.55);animation:ring 2s ease-out infinite}' +
    '@keyframes ring{0%{opacity:.9;transform:scale(1)}100%{opacity:0;transform:scale(1.06)}}' +
    /* popover */
    '.pop{position:fixed;z-index:2147483002;width:min(380px,calc(100vw - 24px));background:var(--card);border:1px solid var(--line2);border-radius:20px;box-shadow:var(--shadow),0 0 0 1px rgba(0,229,255,.08);padding:18px 18px 14px;outline:none;opacity:0;transform:translateY(8px) scale(.98);transition:opacity .22s,transform .25s cubic-bezier(.2,.8,.2,1),top .35s cubic-bezier(.2,.8,.2,1),left .35s cubic-bezier(.2,.8,.2,1)}' +
    '.pop.show{opacity:1;transform:none}' +
    '.pop:before{content:"";position:absolute;inset:0 0 auto 0;height:3px;border-radius:20px 20px 0 0;background:var(--grad)}' +
    '.arrow{position:absolute;width:14px;height:14px;background:var(--card);border:1px solid var(--line2);transform:rotate(45deg)}' +
    '.arrow.up{top:-8px;border-right:0;border-bottom:0}.arrow.down{bottom:-8px;border-left:0;border-top:0}' +
    '.ph{display:flex;align-items:flex-start;gap:10px;margin-bottom:6px}' +
    '.ph h3{margin:0;font-size:17px;font-weight:800;line-height:1.35;flex:1}' +
    '.bd{width:38px;height:38px;border-radius:12px;display:grid;place-items:center;background:var(--grad);color:#fff;flex:none;box-shadow:0 10px 24px -10px rgba(0,229,255,.7)}.bd svg{width:20px;height:20px}' +
    '.x{width:32px;height:32px;border-radius:10px;border:1px solid var(--line);background:transparent;cursor:pointer;display:grid;place-items:center;color:var(--muted);flex:none}.x:hover{color:var(--text);border-color:var(--line2)}.x svg{width:16px;height:16px}' +
    '.pb{margin:0 0 12px;color:var(--muted);font-size:14px}' +
    '.ag{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px;margin:2px 0 12px}' +
    '.ag div{display:grid;grid-template-columns:auto 1fr;column-gap:8px;align-items:center;padding:8px 10px;border-radius:12px;background:rgba(148,163,184,.08);border:1px solid var(--line)}' +
    '.ag span{grid-row:span 2;font-size:18px}.ag b{font-size:13px}.ag small{color:var(--muted);font-size:11.5px;line-height:1.35}' +
    '.pf{display:flex;align-items:center;gap:8px;min-width:0}.pf>.b{flex:none}' +
    '.pf.intro{justify-content:flex-end;gap:14px;padding-top:4px}' +
    '.pf>.b[data-a=back]{border-radius:999px;width:42px;min-height:42px;padding:0}' +
    '.b.pill{border-radius:999px;min-height:42px;padding:0 8px 0 20px;gap:12px;max-width:100%}' +
    '.wrap.ar .b.pill{padding:0 20px 0 8px}' +
    '.b.pill span{flex:1;text-align:center;line-height:1;overflow:hidden;text-overflow:ellipsis}' +
    '.b.pill svg{width:28px;height:28px;padding:6px;border-radius:50%;background:rgba(255,255,255,.2)}' +
    '.b.pill:not(:has(svg)){padding:0 22px}' +
    '.pf.intro .b.ghost{border-radius:999px;min-height:42px;padding:0 16px}' +
    '.dots{display:flex;gap:5px;flex:1;min-width:0;align-items:center;overflow:hidden}.dots i{width:6px;height:6px;border-radius:99px;background:var(--line2);transition:width .25s,background .25s}.dots i.on{width:18px;background:var(--grad)}' +
    '.cnt{font-size:12px;color:var(--faint);margin-inline-end:4px;white-space:nowrap}' +
    '.b{display:inline-flex;align-items:center;justify-content:center;gap:6px;min-height:40px;padding:8px 14px;border-radius:12px;border:1px solid var(--line2);background:transparent;cursor:pointer;font-weight:700;font-size:13.5px;text-decoration:none;color:var(--text);white-space:nowrap}' +
    '.b:hover{border-color:var(--cyan)}.b.p{background:var(--grad);border:0;color:#fff;box-shadow:0 10px 24px -12px rgba(0,229,255,.7)}.b.ghost{border-color:transparent;color:var(--muted)}.b.ghost:hover{color:var(--text)}' +
    '.b svg{width:16px;height:16px}.act{margin:-2px 0 12px}' +
    '.b:focus-visible,.x:focus-visible,.fab:focus-visible,.row:focus-visible{outline:2px solid var(--cyan);outline-offset:2px}' +
    /* helper button */
    '.fab{position:fixed;z-index:2147482990;right:34px;bottom:var(--fab-b,112px);width:50px;height:50px;border-radius:16px;border:1px solid rgba(0,229,255,.45);background:var(--card);color:var(--cyan);cursor:pointer;display:grid;place-items:center;box-shadow:0 14px 34px -14px rgba(0,229,255,.6);transition:transform .2s,box-shadow .2s}' +
    '.wrap.light .fab{color:#7C3AED;border-color:rgba(124,58,237,.4);box-shadow:0 12px 28px -14px rgba(124,58,237,.5)}' +
    '.fab:hover{transform:translateY(-2px)}.fab svg{width:24px;height:24px}.fab.hid{display:none}' +
    '.fab .new{position:absolute;top:-3px;right:-3px;width:12px;height:12px;border-radius:50%;background:var(--cyan);border:2px solid var(--card);animation:ping 1.8s ease-out infinite}' +
    '@keyframes ping{0%{box-shadow:0 0 0 0 rgba(0,229,255,.6)}80%{box-shadow:0 0 0 8px rgba(0,229,255,0)}100%{box-shadow:0 0 0 0 rgba(0,229,255,0)}}' +
    /* helper panel */
    '.pnl-bg{position:fixed;inset:0;z-index:2147482995;background:transparent}' +
    '.pnl{position:fixed;z-index:2147482996;right:34px;bottom:calc(var(--fab-b,112px) + 62px);width:min(400px,calc(100vw - 32px));max-height:min(640px,calc(100vh - var(--fab-b,112px) - 90px));overflow:auto;overscroll-behavior:contain;background:var(--card);border:1px solid var(--line2);border-radius:22px;box-shadow:var(--shadow);padding:16px;opacity:0;transform:translateY(10px) scale(.98);transform-origin:bottom right;transition:opacity .2s,transform .25s cubic-bezier(.2,.8,.2,1)}' +
    '.pnl.show{opacity:1;transform:none}' +
    '.pnl h4{margin:0;font-size:16px;font-weight:800;flex:1}' +
    '.prog{display:flex;align-items:center;gap:10px;margin:10px 0 12px;font-size:12.5px;color:var(--muted)}.bar{flex:1;height:6px;border-radius:99px;background:rgba(148,163,184,.18);overflow:hidden}.bar i{display:block;height:100%;background:var(--grad);border-radius:99px}' +
    '.rp{display:grid;gap:8px;margin-bottom:14px}.rp .b{justify-content:flex-start;width:100%}' +
    '.lbl{font-size:12px;font-weight:800;color:var(--muted);margin:4px 0 6px;letter-spacing:.06em;text-transform:uppercase}.wrap.ar .lbl{letter-spacing:0}' +
    '.inp{position:relative}.inp svg{position:absolute;inset-inline-start:12px;top:13px;color:var(--faint)}' +
    '.inp textarea{width:100%;min-height:64px;resize:vertical;padding:10px 12px;padding-inline-start:38px;border-radius:14px;border:1px solid var(--line2);background:rgba(148,163,184,.06);color:var(--text);font:inherit;font-size:15px;line-height:1.45}' +
    '.inp textarea:focus{outline:none;border-color:var(--cyan);box-shadow:0 0 0 3px rgba(0,229,255,.15)}' +
    '.recs{display:grid;gap:8px;margin:10px 0 14px}.hint{font-size:12.5px;color:var(--faint);margin:8px 0 12px}' +
    '.row{display:flex;align-items:center;gap:10px;width:100%;padding:10px;border-radius:14px;border:1px solid var(--line);background:transparent;cursor:pointer;text-align:start}' +
    '.row:hover{border-color:var(--cyan)}.row.top{border-color:rgba(0,229,255,.5);background:rgba(0,229,255,.06)}' +
    '.ri{width:34px;height:34px;border-radius:10px;display:grid;place-items:center;flex:none;background:rgba(148,163,184,.1);color:var(--cyan)}.wrap.light .ri{color:#7C3AED}.row.top .ri{background:var(--grad);color:#fff}' +
    '.rt{flex:1;min-width:0}.rt b{display:block;font-size:13.5px;line-height:1.35}.rt small{display:block;color:var(--muted);font-size:12px;line-height:1.4;overflow:hidden;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical}' +
    '.tag{font-size:10.5px;font-weight:800;padding:2px 8px;border-radius:99px;background:var(--grad);color:#fff;margin-inline-start:6px;vertical-align:1px}' +
    '.seen{color:#22C55E}.seen svg{width:16px;height:16px}.chev{color:var(--faint)}' +
    '.list{display:grid;gap:6px}.foot{display:flex;justify-content:center;margin-top:12px}' +
    '@media (max-width:640px){' +
    '.pop{left:12px!important;right:12px;top:auto!important;bottom:calc(12px + env(safe-area-inset-bottom,0px));width:auto;border-radius:22px}.arrow{display:none}' +
    '.fab{right:16px;width:46px;height:46px}' +
    '.pnl{left:0;right:0;bottom:0;width:auto;max-height:86vh;border-radius:24px 24px 0 0;padding:10px 16px calc(16px + env(safe-area-inset-bottom,0px));transform:translateY(100%)}.pnl.show{transform:none}' +
    '.pnl-bg{background:var(--dim)}.grab{display:block!important;width:44px;height:5px;border-radius:99px;background:var(--line2);margin:0 auto 10px}' +
    '}' +
    '.grab{display:none}' +
    '@media (prefers-reduced-motion:reduce){.spot,.pop,.pnl{transition:none}.spot:after,.fab .new{animation:none}}';
  shadow.innerHTML = '<style>' + CSS + '</style><div class="wrap" id="w"></div>';
  var W = shadow.getElementById ? shadow.getElementById('w') : shadow.querySelector('#w');
  function sync() {
    W.className = 'wrap' + (html.classList.contains('light') ? ' light' : '') + (lang() === 'ar' ? ' ar' : '');
    W.setAttribute('dir', lang() === 'ar' ? 'rtl' : 'ltr');
  }

  // ------------------------------------------------------------------ tour runner
  var cur = null; // { tour, i, els }
  function run(tour, opts) {
    opts = opts || {};
    if (!tour || !tour.steps.length) return;
    if (!opts.force && tour.done && isDone(tour.done)) return;
    if (cur) end(false);
    hidePanel();
    sync();
    cur = { tour: tour, i: 0, prevFocus: doc.activeElement };
    paint();
    window.addEventListener('resize', place); window.addEventListener('scroll', place, true);
    doc.addEventListener('keydown', onKey, true);
  }
  function end(completed) {
    if (!cur) return;
    if (cur.tour.done && completed !== null) markDone(cur.tour.done);
    if (cur.tour.id === 'site') markDone('site');
    W.querySelectorAll('.ov,.spot,.pop').forEach(function (n) { n.remove(); });
    window.removeEventListener('resize', place); window.removeEventListener('scroll', place, true);
    doc.removeEventListener('keydown', onKey, true);
    var pf = cur.prevFocus; cur = null; refreshFab();
    if (pf && pf.focus) try { pf.focus({ preventScroll: true }); } catch (e) {}
  }
  function onKey(e) {
    if (!cur) return;
    if (e.key === 'Escape') { e.preventDefault(); end(true); }
    else if ((e.key === 'ArrowRight' && lang() === 'en') || (e.key === 'ArrowLeft' && lang() === 'ar')) { e.preventDefault(); go(1); }
    else if ((e.key === 'ArrowLeft' && lang() === 'en') || (e.key === 'ArrowRight' && lang() === 'ar')) { e.preventDefault(); go(-1); }
  }
  function go(d) {
    if (!cur) return;
    var n = cur.i + d;
    if (n < 0) return;
    if (n >= cur.tour.steps.length) return end(true);
    cur.i = n; paint();
  }
  function stepTarget(st) { try { return st.target ? st.target() : null; } catch (e) { return null; } }

  function paint() {
    var st = cur.tour.steps[cur.i], n = cur.tour.steps.length, i = cur.i;
    var target = st.center ? null : stepTarget(st);
    var ov = W.querySelector('.ov') || W.appendChild(Object.assign(doc.createElement('div'), { className: 'ov' }));
    ov.className = 'ov' + (target ? '' : ' center');
    ov.onclick = function (e) { e.stopPropagation(); };
    var spot = W.querySelector('.spot');
    if (target) { if (!spot) { spot = doc.createElement('div'); spot.className = 'spot'; W.appendChild(spot); } }
    else if (spot) spot.remove();
    var pop = W.querySelector('.pop');
    if (!pop) { pop = doc.createElement('div'); pop.className = 'pop'; pop.setAttribute('role', 'dialog'); pop.setAttribute('aria-modal', 'true'); pop.tabIndex = -1; W.appendChild(pop); }
    var badge = st.badge ? (IC[typeof st.badge === 'string' ? st.badge : (cur.tour.id.replace(/^card:/, ''))] || IC.spark) : (st.intro ? IC.spark : '');
    var last = i === n - 1;
    pop.innerHTML = '<div class="arrow"></div><div class="ph">' + (badge ? '<span class="bd">' + badge + '</span>' : '') + '<h3 id="ely-t">' + esc(L(st.title)) + '</h3>' +
      '<button class="x" type="button" data-a="close" aria-label="' + esc(L(T.skip)) + '">' + IC.x + '</button></div>' +
      '<p class="pb">' + esc(L(st.body)) + '</p>' + (st.html || '') +
      (st.action ? '<div class="act">' + (st.action.href ? '<a class="b" href="' + esc(st.action.href) + '">' + esc(L(st.action.label)) + IC.arrow + '</a>' : '<button class="b" type="button" data-a="act">' + esc(L(st.action.label)) + IC.arrow + '</button>') + '</div>' : '') +
      (st.intro
        ? '<div class="pf intro"><button class="b ghost" type="button" data-a="close">' + esc(L(T.later)) + '</button>' +
          '<button class="b p pill" type="button" data-a="next"><span>' + esc(L(T.start)) + '</span>' + IC.arrow + '</button></div>'
        : '<div class="pf">' + (n > 1 ? '<div class="dots" aria-hidden="true">' + Array.apply(null, Array(n)).map(function (_, k) { return '<i class="' + (k === i ? 'on' : '') + '"></i>'; }).join('') + '</div><span class="cnt">' + (i + 1) + ' ' + esc(L(T.of)) + ' ' + n + '</span>' : '<div class="dots"></div>') +
          (i > 0 ? '<button class="b" type="button" data-a="back" aria-label="' + esc(L(T.back)) + '">' + IC.back + '</button>' : '') +
          '<button class="b p pill" type="button" data-a="next"><span>' + esc(L(last ? T.done : T.next)) + '</span>' + (last ? '' : IC.arrow) + '</button></div>');
    pop.setAttribute('aria-labelledby', 'ely-t');
    pop.querySelectorAll('[data-a]').forEach(function (b) {
      b.onclick = function () {
        var a = b.getAttribute('data-a');
        if (a === 'close') end(true); else if (a === 'next') go(1); else if (a === 'back') go(-1);
        else if (a === 'act' && st.action.run) { end(true); st.action.run(); }
      };
    });
    if (target) {
      var r = target.getBoundingClientRect(), vh = window.innerHeight;
      var room = narrow() ? vh * 0.42 : vh * 0.62;
      if (r.top < 70 || r.bottom > room + 40) {
        var y = window.scrollY + r.top - (narrow() ? 80 : Math.max(80, (vh - r.height) / 2 - 120));
        window.scrollTo({ top: Math.max(0, y), behavior: reduced() ? 'auto' : 'smooth' });
      }
    }
    place();
    requestAnimationFrame(function () { pop.classList.add('show'); try { pop.focus({ preventScroll: true }); } catch (e) { pop.focus(); } });
    var t0 = Date.now();
    (function settle() { place(); if (Date.now() - t0 < 900 && cur) requestAnimationFrame(settle); })();
  }

  function place() {
    if (!cur) return;
    var st = cur.tour.steps[cur.i];
    var target = st.center ? null : stepTarget(st);
    var pop = W.querySelector('.pop'), spot = W.querySelector('.spot'), arrow = pop && pop.querySelector('.arrow');
    if (!pop) return;
    var vw = window.innerWidth, vh = window.innerHeight, pw = pop.offsetWidth, ph = pop.offsetHeight;
    if (!target || !spot) {
      if (arrow) arrow.style.display = 'none';
      if (!narrow()) { pop.style.left = Math.round((vw - pw) / 2) + 'px'; pop.style.top = Math.round(Math.max(16, (vh - ph) / 2)) + 'px'; }
      return;
    }
    var pad = st.pad != null ? st.pad : 8, r = target.getBoundingClientRect();
    var top = Math.max(6, r.top - pad), left = Math.max(6, r.left - pad);
    var w = Math.min(vw - left - 6, r.width + pad * 2), h = Math.min(Math.max(vh * 0.7, 60), r.height + pad * 2);
    spot.style.top = top + 'px'; spot.style.left = left + 'px'; spot.style.width = w + 'px'; spot.style.height = h + 'px';
    if (narrow()) { if (arrow) arrow.style.display = 'none'; return; }
    var below = top + h + 14, above = top - 14 - ph, y, dir;
    if (below + ph < vh - 10) { y = below; dir = 'up'; } else if (above > 10) { y = above; dir = 'down'; } else { y = Math.max(10, vh - ph - 16); dir = ''; }
    var x = Math.min(vw - pw - 12, Math.max(12, r.left + r.width / 2 - pw / 2));
    pop.style.top = Math.round(y) + 'px'; pop.style.left = Math.round(x) + 'px';
    if (arrow) {
      arrow.style.display = dir ? 'block' : 'none';
      arrow.className = 'arrow ' + dir;
      arrow.style.left = Math.round(Math.min(pw - 26, Math.max(12, r.left + r.width / 2 - x - 7))) + 'px';
    }
  }

  // ------------------------------------------------------------------ helper widget
  var fab = null, pnl = null, pnlBg = null;
  function helpBtnEl() { return fab; }
  function fabBottom() {
    if (IS_HOME) return narrow() ? 96 : 112; // above the Elyvori assistant button
    return narrow() ? (q('.mbar') && visible(q('.mbar')) ? 84 : 20) : 24;
  }
  function refreshFab() {
    if (!fab) return;
    W.style.setProperty('--fab-b', fabBottom() + 'px');
    var covered = !!q('.elv-chat') || !!q('.sheet-bg');
    fab.classList.toggle('hid', covered);
    var dot = fab.querySelector('.new');
    var unseen = !isDone('site') && IS_HOME;
    if (unseen && !dot) fab.insertAdjacentHTML('beforeend', '<span class="new"></span>'); else if (!unseen && dot) dot.remove();
    fab.setAttribute('aria-label', L(T.helpBtn)); fab.title = L(T.helpBtn);
  }
  function mountFab() {
    fab = doc.createElement('button');
    fab.className = 'fab'; fab.type = 'button'; fab.innerHTML = IC.help;
    fab.onclick = function () { pnl ? hidePanel() : showPanel(); };
    W.appendChild(fab); refreshFab();
  }

  function contextTour() {
    var p = currentPage();
    if (IS_FACTORY_PAGE) return factoryTour();
    if (p) return pageTour(p);
    return null;
  }

  function recommend(text) {
    var t = ' ' + String(text || '').toLowerCase().replace(/[^\p{L}\p{N}\s-]/gu, ' ') + ' ';
    if (t.trim().length < 3) return [];
    return SERVICES.map(function (s) {
      var hits = s.kw.filter(function (k) { return t.indexOf(k.indexOf(' ') >= 0 ? k : k) >= 0 && (k.length > 3 || new RegExp('(^|\\s)' + k + '(\\s|$)').test(t)); });
      return { s: s, score: hits.reduce(function (a, k) { return a + (k.length > 6 ? 2 : 1); }, 0), hits: hits };
    }).filter(function (x) { return x.score > 0; }).sort(function (a, b) { return b.score - a.score; }).slice(0, 3);
  }

  function serviceRow(s, cls, extra) {
    var seen = isDone(s.id) || isDone('card:' + s.id);
    return '<button class="row ' + (cls || '') + '" type="button" data-open="' + s.id + '"><span class="ri">' + (IC[s.id] || IC.spark) + '</span><span class="rt"><b>' + esc(L(s.name)) + (extra || '') + '</b><small>' + esc(L(s.short)) + '</small></span>' +
      (seen ? '<span class="seen" title="✓">' + IC.check + '</span>' : '<span class="chev">' + IC.arrow + '</span>') + '</button>';
  }

  function showPanel() {
    sync();
    hidePanel(true);
    var ctx = contextTour(), d = readDone(), explored = SERVICES.filter(function (s) { return d[s.id] || d['card:' + s.id]; }).length;
    pnlBg = doc.createElement('div'); pnlBg.className = 'pnl-bg'; pnlBg.onclick = function () { hidePanel(); };
    pnl = doc.createElement('div'); pnl.className = 'pnl'; pnl.setAttribute('role', 'dialog'); pnl.setAttribute('aria-label', L(T.helpTitle));
    pnl.innerHTML = '<div class="grab"></div><div class="ph"><span class="bd">' + IC.spark + '</span><h4>' + esc(L(T.helpTitle)) + '</h4><button class="x" type="button" data-p="close" aria-label="×">' + IC.x + '</button></div>' +
      '<div class="prog"><div class="bar"><i style="width:' + (explored * 10) + '%"></i></div><span>' + explored + '/10 ' + esc(L(T.explored)) + '</span></div>' +
      '<div class="rp">' + (ctx ? '<button class="b p" type="button" data-p="here">' + IC.replay + esc(L(T.replayHere)) + '</button>' : '') +
      '<button class="b" type="button" data-p="site">' + IC.play + esc(L(T.replaySite)) + '</button></div>' +
      '<div class="lbl">' + esc(L(T.whichH)) + '</div><div class="inp">' + IC.search + '<textarea id="ely-q" dir="auto" maxlength="400" placeholder="' + esc(L(T.whichPh)) + '"></textarea></div>' +
      '<div id="ely-r"></div>' +
      '<div class="lbl">' + esc(L(T.all)) + '</div><div class="list">' + SERVICES.map(function (s) { return serviceRow(s); }).join('') + '</div>' +
      '<div class="foot"><button class="b ghost" type="button" data-p="reset">' + esc(L(T.reset)) + '</button></div>';
    W.appendChild(pnlBg); W.appendChild(pnl);
    requestAnimationFrame(function () { pnl.classList.add('show'); });
    var ta = pnl.querySelector('#ely-q'), out = pnl.querySelector('#ely-r');
    var draw = function () {
      var v = ta.value, r = recommend(v);
      if (!v.trim()) { out.innerHTML = '<p class="hint"></p>'; return; }
      if (!r.length) { out.innerHTML = '<p class="hint">' + esc(L(T.noMatch)) + '</p>'; return; }
      out.innerHTML = '<div class="recs">' + r.map(function (x, k) {
        return serviceRow(x.s, k === 0 ? 'top' : '', k === 0 ? '<span class="tag">' + esc(L(T.best)) + '</span>' : '');
      }).join('') + '</div>';
      wireRows(out);
    };
    ta.addEventListener('input', draw); draw();
    wireRows(pnl.querySelector('.list'));
    pnl.querySelectorAll('[data-p]').forEach(function (b) {
      b.onclick = function () {
        var a = b.getAttribute('data-p');
        if (a === 'close') hidePanel();
        else if (a === 'here') { hidePanel(); run(contextTour(), { force: true }); }
        else if (a === 'site') { hidePanel(); if (IS_HOME && q('#services-title')) { window.scrollTo({ top: 0, behavior: 'auto' }); run(SITE_TOUR, { force: true }); } else location.href = '/#ely-tour=site'; }
        else if (a === 'reset') { resetAll(); hidePanel(); toastMsg(L(T.resetOk)); }
      };
    });
    var x = pnl.querySelector('.x'); if (x) x.focus();
    doc.addEventListener('keydown', panelKey, true);
  }
  function wireRows(root) { root.querySelectorAll('[data-open]').forEach(function (b) { b.onclick = function () { openService(byId[b.getAttribute('data-open')]); }; }); }
  function panelKey(e) { if (e.key === 'Escape' && pnl) { e.preventDefault(); hidePanel(); if (fab) fab.focus(); } }
  function hidePanel(instant) {
    doc.removeEventListener('keydown', panelKey, true);
    if (pnlBg) pnlBg.remove(); pnlBg = null;
    if (!pnl) return;
    var p = pnl; pnl = null;
    if (instant) p.remove(); else { p.classList.remove('show'); setTimeout(function () { p.remove(); }, 260); }
  }
  function toastMsg(m) {
    var el = doc.createElement('div');
    el.setAttribute('role', 'status');
    el.style.cssText = 'position:fixed;left:50%;transform:translateX(-50%);bottom:calc(' + (fabBottom() + 64) + 'px);z-index:2147483003;padding:10px 16px;border-radius:12px;background:var(--card);border:1px solid var(--line2);box-shadow:var(--shadow);font-size:13.5px;white-space:nowrap';
    el.textContent = m; W.appendChild(el); setTimeout(function () { el.remove(); }, 3200);
  }

  // ------------------------------------------------------------------ automatic starts
  var lastPage = null, booted = false;
  function splashGone() {
    // the mobile splash covers the whole screen at first; wait for it
    var els = doc.querySelectorAll('body > div, #root > div > div');
    for (var i = 0; i < els.length; i++) { var s = getComputedStyle(els[i]); if (s.position === 'fixed' && parseInt(s.zIndex || '0', 10) >= 50 && els[i].offsetWidth >= window.innerWidth - 2 && els[i].offsetHeight >= window.innerHeight - 2 && els[i] !== host) return false; }
    return true;
  }
  /** which tour belongs to what is on screen now (null = nothing to explain yet) */
  function ctxKey(p) {
    if (!p) return null;
    if (IS_FACTORY_PAGE) return q('#remote') ? 'factory-project' : (q('.hero') && q('a[data-tip-target="new"]') ? 'web-app-building' : null);
    return p;
  }
  function check() {
    if (!fab) return;
    refreshFab();
    if (cur || pnl) return;
    var p = currentPage(), key = ctxKey(p);
    if (key !== lastPage) {
      lastPage = key;
      if (key && !isDone(key)) setTimeout(function () { if (!cur && !pnl && ctxKey(currentPage()) === key) run(contextTour()); }, 900);
    }
    if (IS_HOME && !booted && !p && q('#services-title') && splashGone()) {
      booted = true;
      if (!isDone('site') && window.scrollY < 200) setTimeout(function () { if (!cur && !currentPage()) run(SITE_TOUR); }, 1400);
    }
  }
  // first click on a service card: its short tour
  doc.addEventListener('click', function (e) {
    var c = e.target.closest && e.target.closest('[id^="service-card-"]');
    if (!c || cur) return;
    var s = byId[c.id.replace('service-card-', '')];
    if (s && !isDone('card:' + s.id) && !isDone(s.id)) setTimeout(function () { run(cardTour(s)); markDone('card:' + s.id); }, 250);
  }, true);

  // links from other pages: /#ely-open=<service> and /#ely-tour=site
  function handleHash() {
    var m = location.hash.match(/ely-(open|tour)=([\w-]+)/);
    if (!m) return;
    history.replaceState(null, '', location.pathname + location.search);
    var tries = 0;
    (function wait() {
      if (!q('#services-title') || !splashGone()) { if (tries++ < 40) return setTimeout(wait, 250); }
      if (m[1] === 'tour') { booted = true; run(SITE_TOUR, { force: true }); }
      else if (byId[m[2]]) openService(byId[m[2]]);
    })();
  }

  function boot() {
    doc.body.appendChild(host);
    sync(); mountFab();
    var lastLang = lang();
    new MutationObserver(function () {
      sync(); refreshFab();
      var changed = lang() !== lastLang; lastLang = lang();
      // the language switch on the site re-draws the open step / panel in the new language
      if (cur) { if (changed) paint(); else place(); } else if (pnl && changed) showPanel();
    }).observe(html, { attributes: true, attributeFilter: ['class', 'lang', 'dir'] });
    var pending = null;
    new MutationObserver(function () { if (pending) return; pending = setTimeout(function () { pending = null; check(); }, 350); }).observe(doc.body, { childList: true, subtree: true });
    window.addEventListener('resize', refreshFab);
    handleHash();
    check();
  }
  if (doc.readyState === 'loading') doc.addEventListener('DOMContentLoaded', boot); else boot();

  window.ElyvoriTour = { start: function (id) { var t = id === 'site' ? SITE_TOUR : byId[id] ? (byId[id].open === 'page' && currentPage() === id ? pageTour(id) : cardTour(byId[id])) : contextTour(); run(t, { force: true }); }, reset: resetAll, recommend: function (t) { return recommend(t).map(function (x) { return x.s.id; }); } };
})();
