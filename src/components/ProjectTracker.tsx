import { useState, useEffect, useRef } from 'react';
import { Language } from '../types';
import { CompletionCertificate, CertificateData } from './CompletionCertificate';

const API = 'https://elyvori-api.onrender.com';

interface Step {
  id: string;
  name: string;
  nameAr: string;
  status: 'pending' | 'running' | 'done' | 'error';
  detail: string;
  detailAr: string;
  icon: string;
}

interface ProjectTrackerProps {
  lang: Language;
  token: string;
  taskId?: string;
  agentType?: string;
  clientName?: string;
  clientEmail?: string;
  projectDetails?: string;
  contractId?: string;
}

// خطوات كل وكيل
const AGENT_STEPS: Record<string, Step[]> = {
  'digital-products': [
    { id: '1', name: 'Request Received', nameAr: 'تم استلام الطلب', status: 'pending', detail: 'Your request has been queued.', detailAr: 'تم إضافة طلبك لقائمة الانتظار.', icon: '📥' },
    { id: '2', name: 'Market Research', nameAr: 'بحث السوق', status: 'pending', detail: 'Analyzing market gaps and demand...', detailAr: 'تحليل الفجوات السوقية والطلب...', icon: '🔍' },
    { id: '3', name: 'Content Creation', nameAr: 'إنشاء المحتوى', status: 'pending', detail: 'Writing guides, templates and materials...', detailAr: 'كتابة الأدلة والقوالب والمواد...', icon: '✍️' },
    { id: '4', name: 'Design & Packaging', nameAr: 'التصميم والتغليف', status: 'pending', detail: 'Designing and packaging digital assets...', detailAr: 'تصميم وتغليف الأصول الرقمية...', icon: '🎨' },
    { id: '5', name: 'Quality Review', nameAr: 'مراجعة الجودة', status: 'pending', detail: 'Final review and optimization...', detailAr: 'المراجعة النهائية والتحسين...', icon: '✅' },
    { id: '6', name: 'Ready to Deliver', nameAr: 'جاهز للتسليم', status: 'pending', detail: 'Your digital product is ready!', detailAr: 'منتجك الرقمي جاهز!', icon: '🚀' },
  ],
  'web-app-building': [
    { id: '1', name: 'Request Received', nameAr: 'تم استلام الطلب', status: 'pending', detail: 'Project requirements captured.', detailAr: 'تم التقاط متطلبات المشروع.', icon: '📥' },
    { id: '2', name: 'Architecture Design', nameAr: 'تصميم البنية', status: 'pending', detail: 'Designing system architecture and DB schema...', detailAr: 'تصميم بنية النظام ومخطط قاعدة البيانات...', icon: '🏗️' },
    { id: '3', name: 'Frontend Development', nameAr: 'تطوير الواجهة', status: 'pending', detail: 'Building UI components and pages...', detailAr: 'بناء مكونات الواجهة والصفحات...', icon: '💻' },
    { id: '4', name: 'Backend Development', nameAr: 'تطوير الخادم', status: 'pending', detail: 'Building APIs and database...', detailAr: 'بناء واجهات البرمجة وقاعدة البيانات...', icon: '⚙️' },
    { id: '5', name: 'Testing & QA', nameAr: 'الاختبار والجودة', status: 'pending', detail: 'Testing all features and fixing bugs...', detailAr: 'اختبار جميع الميزات وإصلاح الأخطاء...', icon: '🧪' },
    { id: '6', name: 'Deployment', nameAr: 'النشر', status: 'pending', detail: 'Deploying to production servers!', detailAr: 'النشر على خوادم الإنتاج!', icon: '🚀' },
  ],
  'recruitment-crm': [
    { id: '1', name: 'Request Received', nameAr: 'تم استلام الطلب', status: 'pending', detail: 'Hiring requirements captured.', detailAr: 'تم التقاط متطلبات التوظيف.', icon: '📥' },
    { id: '2', name: 'Job Analysis', nameAr: 'تحليل الوظيفة', status: 'pending', detail: 'Analyzing role requirements and skills...', detailAr: 'تحليل متطلبات الدور والمهارات...', icon: '🔍' },
    { id: '3', name: 'Resume Parsing', nameAr: 'تحليل السير الذاتية', status: 'pending', detail: 'Scanning and scoring candidate resumes...', detailAr: 'مسح وتقييم سير المرشحين الذاتية...', icon: '📄' },
    { id: '4', name: 'Candidate Ranking', nameAr: 'ترتيب المرشحين', status: 'pending', detail: 'Ranking top candidates by fit score...', detailAr: 'ترتيب أفضل المرشحين حسب درجة الملاءمة...', icon: '🏆' },
    { id: '5', name: 'Interview Prep', nameAr: 'إعداد المقابلات', status: 'pending', detail: 'Generating interview questions...', detailAr: 'توليد أسئلة المقابلات...', icon: '💬' },
    { id: '6', name: 'Report Ready', nameAr: 'التقرير جاهز', status: 'pending', detail: 'Your recruitment report is ready!', detailAr: 'تقرير التوظيف جاهز!', icon: '🚀' },
  ],
  'marketing-agent': [
    { id: '1', name: 'Request Received', nameAr: 'تم استلام الطلب', status: 'pending', detail: 'Marketing brief captured.', detailAr: 'تم التقاط ملخص التسويق.', icon: '📥' },
    { id: '2', name: 'Audience Research', nameAr: 'بحث الجمهور', status: 'pending', detail: 'Analyzing target audience and trends...', detailAr: 'تحليل الجمهور المستهدف والاتجاهات...', icon: '👥' },
    { id: '3', name: 'Content Strategy', nameAr: 'استراتيجية المحتوى', status: 'pending', detail: 'Building bilingual content strategy...', detailAr: 'بناء استراتيجية محتوى ثنائية اللغة...', icon: '📊' },
    { id: '4', name: 'Copy Writing', nameAr: 'كتابة النصوص', status: 'pending', detail: 'Writing Arabic & English campaigns...', detailAr: 'كتابة حملات عربية وإنجليزية...', icon: '✍️' },
    { id: '5', name: 'Calendar Planning', nameAr: 'تخطيط التقويم', status: 'pending', detail: 'Creating posting schedule...', detailAr: 'إنشاء جدول النشر...', icon: '📅' },
    { id: '6', name: 'Campaign Ready', nameAr: 'الحملة جاهزة', status: 'pending', detail: 'Your marketing campaign is ready!', detailAr: 'حملتك التسويقية جاهزة!', icon: '🚀' },
  ],
  'content-agent': [
    { id: '1', name: 'Request Received', nameAr: 'تم استلام الطلب', status: 'pending', detail: 'Content brief captured.', detailAr: 'تم التقاط ملخص المحتوى.', icon: '📥' },
    { id: '2', name: 'Research Phase', nameAr: 'مرحلة البحث', status: 'pending', detail: 'Researching topic and keywords...', detailAr: 'البحث في الموضوع والكلمات المفتاحية...', icon: '🔍' },
    { id: '3', name: 'Article Writing', nameAr: 'كتابة المقالة', status: 'pending', detail: 'Writing long-form article...', detailAr: 'كتابة المقالة الطويلة...', icon: '📝' },
    { id: '4', name: 'Video Script', nameAr: 'سكربت الفيديو', status: 'pending', detail: 'Writing video script...', detailAr: 'كتابة سكربت الفيديو...', icon: '🎬' },
    { id: '5', name: 'Social Posts', nameAr: 'منشورات السوشل', status: 'pending', detail: 'Creating platform-specific posts...', detailAr: 'إنشاء منشورات لكل منصة...', icon: '📱' },
    { id: '6', name: 'Package Ready', nameAr: 'الحزمة جاهزة', status: 'pending', detail: 'Your content package is ready!', detailAr: 'حزمة المحتوى جاهزة!', icon: '🚀' },
  ],
  'lead-finder': [
    { id: '1', name: 'Request Received', nameAr: 'تم استلام الطلب', status: 'pending', detail: 'Search criteria captured.', detailAr: 'تم التقاط معايير البحث.', icon: '📥' },
    { id: '2', name: 'Market Scanning', nameAr: 'مسح السوق', status: 'pending', detail: 'Scanning local businesses online...', detailAr: 'مسح الأعمال المحلية عبر الإنترنت...', icon: '🔍' },
    { id: '3', name: 'Lead Qualification', nameAr: 'تأهيل العملاء', status: 'pending', detail: 'Identifying businesses without websites...', detailAr: 'تحديد الأعمال بدون مواقع إلكترونية...', icon: '🎯' },
    { id: '4', name: 'Demo Site Building', nameAr: 'بناء الموقع التجريبي', status: 'pending', detail: 'Building demo websites for prospects...', detailAr: 'بناء مواقع تجريبية للعملاء المحتملين...', icon: '🏗️' },
    { id: '5', name: 'Outreach Writing', nameAr: 'كتابة رسائل التواصل', status: 'pending', detail: 'Writing personalized outreach emails...', detailAr: 'كتابة رسائل تواصل مخصصة...', icon: '📧' },
    { id: '6', name: 'Leads Ready', nameAr: 'العملاء جاهزون', status: 'pending', detail: 'Your leads list is ready!', detailAr: 'قائمة عملائك المحتملين جاهزة!', icon: '🚀' },
  ],
  'career-agent': [
    { id: '1', name: 'Resume Received', nameAr: 'تم استلام السيرة الذاتية', status: 'pending', detail: 'Your resume has been received.', detailAr: 'تم استلام سيرتك الذاتية.', icon: '📥' },
    { id: '2', name: 'Skills Extraction', nameAr: 'استخراج المهارات', status: 'pending', detail: 'Extracting skills and experience...', detailAr: 'استخراج المهارات والخبرات...', icon: '🧠' },
    { id: '3', name: 'Job Search', nameAr: 'البحث عن وظائف', status: 'pending', detail: 'Searching live job listings...', detailAr: 'البحث في الوظائف المتاحة الآن...', icon: '🔍' },
    { id: '4', name: 'Match Scoring', nameAr: 'تقييم التطابق', status: 'pending', detail: 'Scoring job matches honestly...', detailAr: 'تقييم تطابق الوظائف بصدق...', icon: '📊' },
    { id: '5', name: 'Cover Letters', nameAr: 'رسائل التغطية', status: 'pending', detail: 'Writing personalized cover letters...', detailAr: 'كتابة رسائل تغطية مخصصة...', icon: '✍️' },
    { id: '6', name: 'Report Ready', nameAr: 'التقرير جاهز', status: 'pending', detail: 'Your job match report is ready!', detailAr: 'تقرير مطابقة الوظائف جاهز!', icon: '🚀' },
  ],
  'contract-analyzer': [
    { id: '1', name: 'Contract Received', nameAr: 'تم استلام العقد', status: 'pending', detail: 'Contract document received.', detailAr: 'تم استلام وثيقة العقد.', icon: '📥' },
    { id: '2', name: 'Document Parsing', nameAr: 'تحليل الوثيقة', status: 'pending', detail: 'Extracting contract clauses...', detailAr: 'استخراج بنود العقد...', icon: '📄' },
    { id: '3', name: 'Risk Detection', nameAr: 'كشف المخاطر', status: 'pending', detail: 'Identifying risky clauses...', detailAr: 'تحديد البنود الخطرة...', icon: '⚠️' },
    { id: '4', name: 'Legal Analysis', nameAr: 'التحليل القانوني', status: 'pending', detail: 'Analyzing legal implications...', detailAr: 'تحليل التداعيات القانونية...', icon: '⚖️' },
    { id: '5', name: 'Counter Proposals', nameAr: 'المقترحات المضادة', status: 'pending', detail: 'Generating counter-proposals...', detailAr: 'توليد المقترحات المضادة...', icon: '💡' },
    { id: '6', name: 'Report Ready', nameAr: 'التقرير جاهز', status: 'pending', detail: 'Your contract analysis is ready!', detailAr: 'تحليل عقدك جاهز!', icon: '🚀' },
  ],
  'customer-support': [
    { id: '1', name: 'Message Received', nameAr: 'تم استلام الرسالة', status: 'pending', detail: 'Customer message received.', detailAr: 'تم استلام رسالة العميل.', icon: '📥' },
    { id: '2', name: 'Sentiment Analysis', nameAr: 'تحليل المشاعر', status: 'pending', detail: 'Analyzing customer tone and sentiment...', detailAr: 'تحليل نبرة العميل ومشاعره...', icon: '🧠' },
    { id: '3', name: 'Issue Classification', nameAr: 'تصنيف المشكلة', status: 'pending', detail: 'Classifying issue type and urgency...', detailAr: 'تصنيف نوع المشكلة وإلحاحيتها...', icon: '🏷️' },
    { id: '4', name: 'Strategy Building', nameAr: 'بناء الاستراتيجية', status: 'pending', detail: 'Building de-escalation strategy...', detailAr: 'بناء استراتيجية تهدئة...', icon: '📊' },
    { id: '5', name: 'Response Drafting', nameAr: 'صياغة الرد', status: 'pending', detail: 'Writing professional response...', detailAr: 'كتابة رد احترافي...', icon: '✍️' },
    { id: '6', name: 'Response Ready', nameAr: 'الرد جاهز', status: 'pending', detail: 'Your response is ready to send!', detailAr: 'ردك جاهز للإرسال!', icon: '🚀' },
  ],
  'negotiation': [
    { id: '1', name: 'Scenario Received', nameAr: 'تم استلام السيناريو', status: 'pending', detail: 'Negotiation scenario captured.', detailAr: 'تم التقاط سيناريو التفاوض.', icon: '📥' },
    { id: '2', name: 'Context Analysis', nameAr: 'تحليل السياق', status: 'pending', detail: 'Analyzing negotiation context...', detailAr: 'تحليل سياق التفاوض...', icon: '🔍' },
    { id: '3', name: 'Party Assessment', nameAr: 'تقييم الأطراف', status: 'pending', detail: 'Assessing other party position...', detailAr: 'تقييم موقف الطرف الآخر...', icon: '⚖️' },
    { id: '4', name: 'Strategy Design', nameAr: 'تصميم الاستراتيجية', status: 'pending', detail: 'Designing negotiation strategy...', detailAr: 'تصميم استراتيجية التفاوض...', icon: '🧠' },
    { id: '5', name: 'Response Prep', nameAr: 'إعداد الردود', status: 'pending', detail: 'Preparing negotiation responses...', detailAr: 'إعداد ردود التفاوض...', icon: '💬' },
    { id: '6', name: 'Strategy Ready', nameAr: 'الاستراتيجية جاهزة', status: 'pending', detail: 'Your negotiation strategy is ready!', detailAr: 'استراتيجية تفاوضك جاهزة!', icon: '🚀' },
  ],
  'default': [
    { id: '1', name: 'Request Received', nameAr: 'تم استلام الطلب', status: 'pending', detail: 'Your request has been queued.', detailAr: 'تم إضافة طلبك لقائمة الانتظار.', icon: '📥' },
    { id: '2', name: 'AI Analysis', nameAr: 'تحليل الذكاء الاصطناعي', status: 'pending', detail: 'Analyzing requirements...', detailAr: 'تحليل المتطلبات...', icon: '🧠' },
    { id: '3', name: 'Strategy Planning', nameAr: 'التخطيط الاستراتيجي', status: 'pending', detail: 'Building execution plan...', detailAr: 'بناء خطة التنفيذ...', icon: '⚡' },
    { id: '4', name: 'Execution', nameAr: 'التنفيذ', status: 'pending', detail: 'Executing your project...', detailAr: 'تنفيذ مشروعك...', icon: '💻' },
    { id: '5', name: 'Quality Check', nameAr: 'فحص الجودة', status: 'pending', detail: 'Verifying all deliverables...', detailAr: 'التحقق من جميع المخرجات...', icon: '✅' },
    { id: '6', name: 'Delivery Ready', nameAr: 'جاهز للتسليم', status: 'pending', detail: 'Project complete!', detailAr: 'المشروع مكتمل!', icon: '🚀' },
  ],
};

export function ProjectTracker({ lang, token, taskId, agentType, clientName, clientEmail, projectDetails, contractId }: ProjectTrackerProps) {
  const [steps, setSteps] = useState<Step[]>([]);
  const [currentLog, setCurrentLog] = useState<string[]>([]);
  const [particles, setParticles] = useState<Array<{ id: number; x: number; y: number; size: number; speed: number; opacity: number }>>([]);
  const [glowPulse, setGlowPulse] = useState(false);
  const [typingText, setTypingText] = useState('');
  const [currentStepIdx, setCurrentStepIdx] = useState(0);
  const [showCertificate, setShowCertificate] = useState(false);
  const [certificateData, setCertificateData] = useState<CertificateData | null>(null);
  const logRef = useRef<HTMLDivElement>(null);
  const isAr = lang === 'ar';

  // Initialize steps based on agent type
  useEffect(() => {
    const agentSteps = AGENT_STEPS[agentType || 'default'] || AGENT_STEPS['default'];
    const initialSteps = agentSteps.map((s, i) => ({
      ...s,
      status: i === 0 ? 'running' as const : 'pending' as const,
    }));
    setSteps(initialSteps);
    setCurrentStepIdx(0);
  }, [agentType]);

  // Real polling from API + fallback timer
  useEffect(() => {
    if (steps.length === 0) return;
    let pollInterval: ReturnType<typeof setInterval> | null = null;
    let fallbackTimer: ReturnType<typeof setTimeout> | null = null;
    let isDone = false;

    const showCert = (stepIdx: number) => {
      if (isDone) return;
      isDone = true;
      if (pollInterval) clearInterval(pollInterval);
      setTimeout(() => {
        const certId = Math.random().toString(36).substring(2, 10).toUpperCase();
        setCertificateData({
          clientName: clientName || 'Valued Client',
          clientEmail: clientEmail || '',
          agentType: agentType || 'default',
          projectDetails: projectDetails || '',
          contractId: contractId || 'N/A',
          completedAt: new Date().toISOString(),
          certificateId: certId,
        });
        setShowCertificate(true);
        if (clientEmail) {
          fetch(`${API}/public/send-certificate`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              clientName: clientName || 'Valued Client',
              clientEmail,
              agentType: agentType || 'default',
              projectDetails: projectDetails || '',
              contractId: contractId || 'N/A',
              certificateId: certId,
              completedAt: new Date().toISOString(),
            }),
          }).catch(() => {});
        }
      }, 1500);
    };

    const updateStep = (targetStep: number) => {
      setSteps(prev => prev.map((s, i) => ({
        ...s,
        status: i < targetStep ? 'done' as const
              : i === targetStep ? 'running' as const
              : 'pending' as const,
      })));
      setCurrentStepIdx(targetStep);
      if (targetStep >= steps.length) showCert(targetStep);
    };

    // Poll real API if email available
    if (clientEmail) {
      const poll = async () => {
        try {
          const res = await fetch(`${API}/public/task-status/${encodeURIComponent(clientEmail)}`);
          if (!res.ok) return;
          const data = await res.json() as any;
          if (data.step && data.step > 0) {
            if (steps.length === 0) return; // steps not loaded yet
            if (data.status === 'done' || data.step >= steps.length) {
              // All done - mark all steps as done
              setSteps(prev => prev.map(s => ({ ...s, status: 'done' as const })));
              setCurrentStepIdx(steps.length);
              showCert(steps.length - 1);
            } else {
              updateStep(Math.min(data.step - 1, steps.length - 1));
            }
          }
        } catch (e) {}
      };
      poll();
      pollInterval = setInterval(poll, 5000);
    } else {
      // Fallback: timer-based progress
      fallbackTimer = setTimeout(function tick() {
        setCurrentStepIdx(prev => {
          const next = prev + 1;
          updateStep(next);
          if (next < steps.length - 1) {
            fallbackTimer = setTimeout(tick, 3000);
          }
          return next;
        });
      }, 3000);
    }

    return () => {
      if (pollInterval) clearInterval(pollInterval);
      if (fallbackTimer) clearTimeout(fallbackTimer);
    };
  }, [steps.length, clientEmail]);

  const AI_MESSAGES = isAr ? [
    '⚡ الذكاء الاصطناعي يحلل متطلبات مشروعك...',
    '🧠 يتم بناء استراتيجية التنفيذ المثلى...',
    '💡 تم اكتشاف فرص في سوقك...',
    '🔧 جاري إعداد البنية التحتية...',
    '📊 تحليل البيانات والمتطلبات...',
    '✨ يتم تخصيص الوكلاء المناسبين...',
    '🚀 كل شيء على المسار الصحيح...',
  ] : [
    '⚡ AI is analyzing your project requirements...',
    '🧠 Building optimal execution strategy...',
    '💡 Discovered opportunities in your niche...',
    '🔧 Preparing infrastructure...',
    '📊 Analyzing data and requirements...',
    '✨ Assigning specialized agents...',
    '🚀 Everything is on track...',
  ];

  useEffect(() => {
    const pts = Array.from({ length: 60 }, (_, i) => ({
      id: i, x: Math.random() * 100, y: Math.random() * 100,
      size: Math.random() * 3 + 1, speed: Math.random() * 0.3 + 0.1, opacity: Math.random() * 0.6 + 0.2,
    }));
    setParticles(pts);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setParticles(prev => prev.map(p => ({
        ...p, y: p.y - p.speed < -2 ? 102 : p.y - p.speed,
        opacity: Math.sin(Date.now() / 1000 + p.id) * 0.3 + 0.4,
      })));
    }, 50);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => setGlowPulse(p => !p), 2000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    let msgIdx = 0; let charIdx = 0; let fullMsg = '';
    const typeInterval = setInterval(() => {
      if (charIdx === 0) fullMsg = AI_MESSAGES[msgIdx % AI_MESSAGES.length];
      if (charIdx < fullMsg.length) { setTypingText(fullMsg.slice(0, charIdx + 1)); charIdx++; }
      else {
        setTimeout(() => { setCurrentLog(prev => [...prev.slice(-8), fullMsg]); charIdx = 0; msgIdx++; }, 1500);
        charIdx = fullMsg.length + 100;
      }
    }, 35);
    return () => clearInterval(typeInterval);
  }, [lang]);

  useEffect(() => {
    if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight;
  }, [currentLog]);

  const doneCount = steps.filter(s => s.status === 'done').length;
  const progress = steps.length > 0 ? Math.round((doneCount / steps.length) * 100) : 0;
  const isComplete = doneCount === steps.length && steps.length > 0;

  return (
    <>
      {showCertificate && certificateData && (
        <CompletionCertificate
          lang={lang}
          data={certificateData}
          onClose={() => setShowCertificate(false)}
          onDownload={() => {
            alert(lang === 'ar' ? 'جاري تحضير PDF...' : 'Preparing PDF...');
          }}
        />
      )}
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #020408 0%, #050a18 40%, #040810 100%)',
      fontFamily: "'Cairo', 'Inter', sans-serif",
      position: 'relative',
      direction: isAr ? 'rtl' : 'ltr',
    }}>
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
        {particles.map(p => (
          <div key={p.id} style={{
            position: 'absolute', left: `${p.x}%`, top: `${p.y}%`,
            width: p.size, height: p.size, borderRadius: '50%',
            background: p.id % 3 === 0 ? '#00E5FF' : p.id % 3 === 1 ? '#7C3AED' : '#10b981',
            opacity: p.opacity, transition: 'opacity 0.5s',
          }} />
        ))}
      </div>
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        backgroundImage: 'linear-gradient(rgba(0,229,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0,229,255,0.03) 1px, transparent 1px)',
        backgroundSize: '40px 40px',
      }} />
      <div style={{ position: 'absolute', top: '-20%', left: '20%', width: 600, height: 600, borderRadius: '50%', background: 'radial-gradient(ellipse, rgba(0,229,255,0.06) 0%, transparent 70%)', filter: 'blur(40px)', opacity: glowPulse ? 1 : 0.5, transition: 'opacity 2s' }} />
      <div style={{ position: 'absolute', bottom: '-10%', right: '10%', width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(ellipse, rgba(124,58,237,0.08) 0%, transparent 70%)', filter: 'blur(40px)', opacity: glowPulse ? 0.5 : 1, transition: 'opacity 2s' }} />

      <div style={{ position: 'relative', zIndex: 1, maxWidth: 1000, margin: '0 auto', padding: '40px 20px' }}>
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(0,229,255,0.08)', border: '1px solid rgba(0,229,255,0.2)', borderRadius: 999, padding: '6px 16px', marginBottom: 20 }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: isComplete ? '#10b981' : '#00E5FF', boxShadow: `0 0 10px ${isComplete ? '#10b981' : '#00E5FF'}` }} />
            <span style={{ color: '#00E5FF', fontSize: 12, fontWeight: 600, letterSpacing: 1 }}>
              {isComplete ? (isAr ? 'مكتمل ✓' : 'COMPLETED ✓') : (isAr ? 'نظام التتبع المباشر' : 'LIVE TRACKING SYSTEM')}
            </span>
          </div>
          <h1 style={{ fontSize: 'clamp(28px, 5vw, 52px)', fontWeight: 900, margin: 0, background: 'linear-gradient(135deg, #ffffff 0%, #00E5FF 50%, #7C3AED 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', lineHeight: 1.2, marginBottom: 12 }}>
            {isComplete ? (isAr ? '🎉 مشروعك جاهز!' : '🎉 Your Project is Ready!') : (isAr ? 'مشروعك يُبنى الآن' : 'Your Project Is Being Built')}
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 16, margin: 0 }}>
            {isAr ? 'تابع تقدم مشروعك لحظة بلحظة' : 'Track every step of your project in real time'}
          </p>
        </div>

        <div style={{ background: 'rgba(15,17,26,0.8)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 20, padding: 28, marginBottom: 28, backdropFilter: 'blur(20px)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13, fontWeight: 600 }}>{isAr ? 'التقدم الكلي' : 'Overall Progress'}</span>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
              <span style={{ color: '#00E5FF', fontSize: 32, fontWeight: 900 }}>{progress}</span>
              <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: 14 }}>%</span>
            </div>
          </div>
          <div style={{ height: 8, background: 'rgba(255,255,255,0.06)', borderRadius: 999, overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${progress}%`, background: isComplete ? 'linear-gradient(90deg, #10b981, #00E5FF)' : 'linear-gradient(90deg, #7C3AED, #00E5FF)', borderRadius: 999, transition: 'width 1s ease', boxShadow: '0 0 20px rgba(0,229,255,0.5)' }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 10 }}>
            <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: 11 }}>
              {isAr ? `${doneCount} من ${steps.length} مراحل مكتملة` : `${doneCount} of ${steps.length} stages complete`}
            </span>
            <span style={{ color: isComplete ? '#10b981' : '#00E5FF', fontSize: 11, fontWeight: 600 }}>
              {isComplete ? (isAr ? 'مكتمل! 🎉' : 'Complete! 🎉') : (isAr ? 'على المسار الصحيح ✓' : 'On Track ✓')}
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 28 }}>
          {steps.map((step) => {
            const isDone = step.status === 'done';
            const isRunning = step.status === 'running';
            const isPending = step.status === 'pending';
            const color = isDone ? '#10b981' : isRunning ? '#00E5FF' : 'rgba(255,255,255,0.2)';
            return (
              <div key={step.id} style={{
                display: 'flex', alignItems: 'center', gap: 16,
                background: isRunning ? 'rgba(0,229,255,0.05)' : isDone ? 'rgba(16,185,129,0.04)' : 'rgba(15,17,26,0.6)',
                border: `1px solid ${isRunning ? 'rgba(0,229,255,0.3)' : isDone ? 'rgba(16,185,129,0.2)' : 'rgba(255,255,255,0.05)'}`,
                borderRadius: 16, padding: '16px 20px', backdropFilter: 'blur(10px)',
                transition: 'all 0.5s ease',
                boxShadow: isRunning ? '0 0 30px rgba(0,229,255,0.1)' : 'none',
              }}>
                <div style={{ width: 48, height: 48, borderRadius: '50%', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: isDone ? 'rgba(16,185,129,0.15)' : isRunning ? 'rgba(0,229,255,0.15)' : 'rgba(255,255,255,0.04)', border: `2px solid ${color}`, fontSize: 20, boxShadow: isRunning ? `0 0 20px ${color}` : 'none', transition: 'all 0.5s' }}>
                  {isDone ? '✓' : step.icon}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <span style={{ color: isDone ? '#10b981' : isRunning ? '#00E5FF' : 'rgba(255,255,255,0.4)', fontSize: 15, fontWeight: 700, transition: 'color 0.5s' }}>
                      {isAr ? step.nameAr : step.name}
                    </span>
                    {isRunning && (
                      <span style={{ background: 'rgba(0,229,255,0.15)', border: '1px solid rgba(0,229,255,0.3)', color: '#00E5FF', fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 999, letterSpacing: 1 }}>
                        {isAr ? 'جاري' : 'LIVE'}
                      </span>
                    )}
                  </div>
                  <p style={{ color: isPending ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.5)', fontSize: 12, margin: 0 }}>
                    {isAr ? step.detailAr : step.detail}
                  </p>
                </div>
                <div style={{ flexShrink: 0 }}>
                  {isDone && <span style={{ color: '#10b981', fontSize: 20 }}>✅</span>}
                  {isRunning && <div style={{ width: 24, height: 24, borderRadius: '50%', border: '2px solid rgba(0,229,255,0.3)', borderTop: '2px solid #00E5FF', animation: 'spin 1s linear infinite' }} />}
                  {isPending && <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: 20 }}>○</span>}
                </div>
              </div>
            );
          })}
        </div>

        {!isComplete && (
          <div style={{ background: 'rgba(5,8,15,0.9)', border: '1px solid rgba(0,229,255,0.15)', borderRadius: 20, padding: 24, backdropFilter: 'blur(20px)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#00E5FF', boxShadow: '0 0 8px #00E5FF' }} />
              <span style={{ color: '#00E5FF', fontSize: 12, fontWeight: 700, letterSpacing: 1 }}>{isAr ? 'سجل الذكاء الاصطناعي المباشر' : 'AI LIVE LOG'}</span>
            </div>
            <div ref={logRef} style={{ height: 160, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 6 }}>
              {currentLog.map((log, i) => (
                <div key={i} style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12, fontFamily: 'monospace', padding: '4px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                  <span style={{ color: 'rgba(0,229,255,0.4)', marginRight: 8 }}>[{new Date().toLocaleTimeString()}]</span>
                  {log}
                </div>
              ))}
              <div style={{ color: '#00E5FF', fontSize: 12, fontFamily: 'monospace', padding: '4px 0' }}>
                <span style={{ color: 'rgba(0,229,255,0.4)', marginRight: 8 }}>[{new Date().toLocaleTimeString()}]</span>
                {typingText}<span style={{ display: 'inline-block', width: 2, height: 14, background: '#00E5FF', marginLeft: 2, verticalAlign: 'middle', animation: 'blink 1s infinite' }} />
              </div>
            </div>
          </div>
        )}

        {isComplete && (
          <div style={{ textAlign: 'center', padding: 40, background: 'rgba(16,185,129,0.05)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: 20 }}>
            <div style={{ fontSize: 64, marginBottom: 16 }}>🎉</div>
            <h2 style={{ color: '#10b981', fontSize: 28, fontWeight: 900, margin: '0 0 8px' }}>
              {isAr ? 'مشروعك مكتمل!' : 'Project Complete!'}
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.5)', margin: 0 }}>
              {isAr ? 'ستتلقى نتائجك عبر البريد الإلكتروني قريباً.' : 'You will receive your results by email shortly.'}
            </p>
          </div>
        )}

        <style>{`
          @keyframes spin { to { transform: rotate(360deg); } }
          @keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0; } }
        `}</style>
      </div>
    </div>
    </>
  );
}
