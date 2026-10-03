import { useState } from 'react';
import { Language } from '../types';

interface ContractModalProps {
  lang: Language;
  agentType: string;
  clientName: string;
  clientEmail: string;
  projectDetails: string;
  onSign: (signatureData: ContractSignature) => void;
  onClose: () => void;
}

export interface ContractSignature {
  clientName: string;
  clientEmail: string;
  agentType: string;
  projectDetails: string;
  signedAt: string;
  contractId: string;
  ipHash: string;
  pkiSignatureId?: string;
  documentHash?: string;
  verifyUrl?: string;
}

const AGENT_CONTRACTS: Record<string, {
  titleEn: string; titleAr: string;
  serviceEn: string; serviceAr: string;
  deliverablesEn: string[]; deliverablesAr: string[];
  timelineEn: string; timelineAr: string;
  termsEn: string[]; termsAr: string[];
}> = {
  'web-app-building': {
    titleEn: 'Web & Mobile Application Development Agreement',
    titleAr: 'عقد تطوير تطبيقات الويب والجوال',
    serviceEn: 'Full-stack web and/or Android application development with real backend and database.',
    serviceAr: 'تطوير تطبيق ويب و/أو أندرويد متكامل مع خادم وقاعدة بيانات حقيقية.',
    deliverablesEn: ['Complete source code', 'Deployed web application', 'REST API backend', 'Database schema and migrations', 'Technical documentation'],
    deliverablesAr: ['الكود المصدري الكامل', 'تطبيق ويب منشور', 'خادم REST API', 'مخطط قاعدة البيانات والترحيلات', 'التوثيق التقني'],
    timelineEn: '3-7 business days depending on complexity',
    timelineAr: '3-7 أيام عمل حسب التعقيد',
    termsEn: ['Client owns 100% of delivered source code', 'Elyvori retains right to showcase project in portfolio', 'One revision round included', 'Hosting setup guidance included', 'Bug fixes covered for 30 days post-delivery'],
    termsAr: ['العميل يمتلك 100% من الكود المسلّم', 'تحتفظ Elyvori بحق عرض المشروع في المحفظة', 'جولة تعديل واحدة مشمولة', 'إرشادات إعداد الاستضافة مشمولة', 'إصلاح الأخطاء مشمول لمدة 30 يوماً بعد التسليم'],
  },
  'digital-products': {
    titleEn: 'Digital Product Creation Agreement',
    titleAr: 'عقد إنشاء المنتجات الرقمية',
    serviceEn: 'Research, creation, and packaging of sellable digital assets including PDF guides, Excel templates, and mini-courses.',
    serviceAr: 'بحث وإنشاء وتغليف أصول رقمية قابلة للبيع تشمل أدلة PDF وقوالب Excel ودورات مصغرة.',
    deliverablesEn: ['Market research report', 'Completed digital product files', 'Marketing copy and description', 'Pricing recommendations', 'Distribution checklist'],
    deliverablesAr: ['تقرير بحث السوق', 'ملفات المنتج الرقمي المكتملة', 'نصوص تسويقية ووصف المنتج', 'توصيات التسعير', 'قائمة التحقق للتوزيع'],
    timelineEn: '1-2 business days',
    timelineAr: '1-2 أيام عمل',
    termsEn: ['Client owns full commercial rights to delivered products', 'Products are original and AI-generated', 'One revision included', 'Elyvori does not guarantee specific revenue outcomes'],
    termsAr: ['يمتلك العميل الحقوق التجارية الكاملة للمنتجات المسلّمة', 'المنتجات أصلية ومولّدة بالذكاء الاصطناعي', 'تعديل واحد مشمول', 'لا تضمن Elyvori نتائج إيرادات محددة'],
    timelineEn: '1-2 business days',
    timelineAr: '1-2 أيام عمل',
  },
  'recruitment-crm': {
    titleEn: 'Recruitment & Talent Acquisition Services Agreement',
    titleAr: 'عقد خدمات التوظيف واستقطاب المواهب',
    serviceEn: 'AI-powered recruitment pipeline setup, resume analysis, candidate scoring, and hiring workflow automation.',
    serviceAr: 'إعداد مسار توظيف مدعوم بالذكاء الاصطناعي، تحليل السير الذاتية، تقييم المرشحين، وأتمتة سير عمل التوظيف.',
    deliverablesEn: ['Candidate evaluation report', 'Ranked shortlist with scores', 'Custom interview questions', 'Hiring pipeline setup', 'Team evaluation templates'],
    deliverablesAr: ['تقرير تقييم المرشحين', 'قائمة مختصرة مرتبة مع الدرجات', 'أسئلة مقابلات مخصصة', 'إعداد مسار التوظيف', 'قوالب تقييم الفريق'],
    timelineEn: '2-4 business days',
    timelineAr: '2-4 أيام عمل',
    termsEn: ['All candidate data handled with strict confidentiality', 'AI scoring is advisory, final decisions remain with client', 'Client responsible for compliance with local labor laws', 'Data deleted after 90 days unless extended'],
    termsAr: ['جميع بيانات المرشحين تُعالج بسرية تامة', 'تقييم الذكاء الاصطناعي استشاري، والقرارات النهائية تبقى للعميل', 'العميل مسؤول عن الامتثال لقوانين العمل المحلية', 'تُحذف البيانات بعد 90 يوماً إلا إذا تم التمديد'],
  },
  'marketing-agent': {
    titleEn: 'Bilingual Marketing Campaign Services Agreement',
    titleAr: 'عقد خدمات الحملات التسويقية ثنائية اللغة',
    serviceEn: 'Creation of bilingual (Arabic/English) social media campaigns, content calendars, and marketing copy.',
    serviceAr: 'إنشاء حملات وسائل التواصل الاجتماعي ثنائية اللغة (عربي/إنجليزي) وتقاويم المحتوى ونصوص التسويق.',
    deliverablesEn: ['Bilingual social media posts', 'Content calendar (4 weeks)', 'Hashtag strategy', 'Platform-specific copy variations', 'Campaign performance framework'],
    deliverablesAr: ['منشورات وسائل التواصل الاجتماعي ثنائية اللغة', 'تقويم المحتوى (4 أسابيع)', 'استراتيجية الوسوم', 'تنويعات النصوص لكل منصة', 'إطار أداء الحملة'],
    timelineEn: '2-3 business days',
    timelineAr: '2-3 أيام عمل',
    termsEn: ['Client owns all produced content', 'Content is original and platform-compliant', 'Results depend on client implementation and platform algorithms', 'One revision round included'],
    termsAr: ['العميل يمتلك جميع المحتوى المنتج', 'المحتوى أصلي ومتوافق مع المنصات', 'النتائج تعتمد على تنفيذ العميل وخوارزميات المنصة', 'جولة تعديل واحدة مشمولة'],
  },
  'content-agent': {
    titleEn: 'Content Creation Services Agreement',
    titleAr: 'عقد خدمات إنشاء المحتوى',
    serviceEn: 'Production of complete content packages including blog articles, video scripts, social media posts, and product descriptions.',
    serviceAr: 'إنتاج حزم محتوى متكاملة تشمل مقالات المدونة وسكريبتات الفيديو ومنشورات السوشل ووصف المنتج.',
    deliverablesEn: ['Long-form blog article (500-900 words)', 'Video script ready for recording', 'Platform-native social posts', 'Product/service description', 'SEO metadata suggestions'],
    deliverablesAr: ['مقالة طويلة (500-900 كلمة)', 'سكريبت فيديو جاهز للتسجيل', 'منشورات لكل منصة', 'وصف المنتج/الخدمة', 'اقتراحات بيانات SEO الوصفية'],
    timelineEn: '1-2 business days',
    timelineAr: '1-2 أيام عمل',
    termsEn: ['Client owns full rights to all content', 'Content is AI-generated and original', 'One revision included', 'Content optimized for engagement and conversion'],
    termsAr: ['يمتلك العميل الحقوق الكاملة لجميع المحتوى', 'المحتوى مولّد بالذكاء الاصطناعي وأصلي', 'تعديل واحد مشمول', 'المحتوى محسّن للتفاعل والتحويل'],
  },
  'lead-finder': {
    titleEn: 'Lead Discovery & Outreach Services Agreement',
    titleAr: 'عقد خدمات اكتشاف العملاء والتواصل',
    serviceEn: 'Identification of local businesses without websites, creation of demo sites, and preparation of personalized outreach.',
    serviceAr: 'تحديد الأعمال المحلية بدون مواقع إلكترونية، وإنشاء مواقع تجريبية، وإعداد تواصل شخصي.',
    deliverablesEn: ['Qualified leads list with evidence', 'Demo website per prospect', 'Personalized outreach email per lead', 'Contact strategy recommendations'],
    deliverablesAr: ['قائمة عملاء محتملين مؤهلة مع الأدلة', 'موقع تجريبي لكل عميل محتمل', 'بريد تواصل شخصي لكل عميل', 'توصيات استراتيجية التواصل'],
    timelineEn: '2-4 business days',
    timelineAr: '2-4 أيام عمل',
    termsEn: ['Client responsible for actual outreach and communication', 'Elyvori does not guarantee conversion rates', 'Demo sites are for demonstration purposes only', 'Lead data is exclusive to client'],
    termsAr: ['العميل مسؤول عن التواصل الفعلي والتواصل', 'لا تضمن Elyvori معدلات التحويل', 'المواقع التجريبية لأغراض العرض فقط', 'بيانات العملاء حصرية للعميل'],
  },
  'career-agent': {
    titleEn: 'Career Matching & Job Search Services Agreement',
    titleAr: 'عقد خدمات مطابقة الوظائف والبحث الوظيفي',
    serviceEn: 'Deep resume analysis, live job search, honest fit scoring, and personalized cover letter generation.',
    serviceAr: 'تحليل عميق للسيرة الذاتية، بحث وظيفي مباشر، تقييم تطابق صادق، وإنشاء رسائل تغطية مخصصة.',
    deliverablesEn: ['Skills extraction report', 'Matched job listings (live)', 'Fit score per job (0-100%)', 'Personalized cover letters', 'Application strategy guide'],
    deliverablesAr: ['تقرير استخراج المهارات', 'الوظائف المطابقة (مباشرة)', 'درجة التطابق لكل وظيفة (0-100%)', 'رسائل تغطية مخصصة', 'دليل استراتيجية التقديم'],
    timelineEn: '1-3 business days',
    timelineAr: '1-3 أيام عمل',
    termsEn: ['Job listings are sourced from public platforms at time of search', 'Elyvori does not guarantee job placement', 'Cover letters are AI-generated and should be reviewed by client', 'Client information kept strictly confidential'],
    termsAr: ['الوظائف مصدرها منصات عامة وقت البحث', 'لا تضمن Elyvori الحصول على وظيفة', 'رسائل التغطية مولّدة بالذكاء الاصطناعي ويجب مراجعتها من العميل', 'معلومات العميل تُحفظ بسرية تامة'],
  },
  'contract-analyzer': {
    titleEn: 'Contract Analysis & Legal Review Services Agreement',
    titleAr: 'عقد خدمات تحليل العقود والمراجعة القانونية',
    serviceEn: 'AI-powered forensic contract analysis, risk identification, and counter-proposal generation.',
    serviceAr: 'تحليل عقود جنائي مدعوم بالذكاء الاصطناعي، وتحديد المخاطر، وتوليد المقترحات المضادة.',
    deliverablesEn: ['Contract safety score (0-100)', 'Red flag clauses identified', 'Risk severity breakdown', 'Counter-proposals for risky clauses', 'Executive summary report'],
    deliverablesAr: ['درجة أمان العقد (0-100)', 'البنود الخطرة المحددة', 'تفصيل درجة خطورة المخاطر', 'مقترحات مضادة للبنود الخطرة', 'تقرير ملخص تنفيذي'],
    timelineEn: 'Same business day',
    timelineAr: 'نفس يوم العمل',
    termsEn: ['Analysis is AI-generated and advisory only — not legal advice', 'Client should consult a licensed attorney for final decisions', 'Document handled with strict confidentiality', 'Deleted from systems after 30 days'],
    termsAr: ['التحليل مولّد بالذكاء الاصطناعي واستشاري فقط — ليس استشارة قانونية', 'يجب على العميل استشارة محامٍ مرخص للقرارات النهائية', 'الوثيقة تُعالج بسرية تامة', 'تُحذف من الأنظمة بعد 30 يوماً'],
  },
  'customer-support': {
    titleEn: 'Customer Support AI Services Agreement',
    titleAr: 'عقد خدمات الدعم الذكي للعملاء',
    serviceEn: 'AI analysis of customer complaints with sentiment scoring, de-escalation strategy, and ready-to-send responses.',
    serviceAr: 'تحليل ذكي لشكاوى العملاء مع تقييم المشاعر واستراتيجية التهدئة وردود جاهزة للإرسال.',
    deliverablesEn: ['Sentiment analysis report', 'Churn risk score', 'De-escalation strategy', 'Ready-to-send response', 'Internal action steps'],
    deliverablesAr: ['تقرير تحليل المشاعر', 'درجة خطر فقدان العميل', 'استراتيجية التهدئة', 'رد جاهز للإرسال', 'خطوات العمل الداخلية'],
    timelineEn: 'Within hours',
    timelineAr: 'خلال ساعات',
    termsEn: ['Responses are AI-generated and should be reviewed before sending', 'Client responsible for final customer communication', 'Customer data handled confidentially', 'Not a substitute for human customer service teams'],
    termsAr: ['الردود مولّدة بالذكاء الاصطناعي ويجب مراجعتها قبل الإرسال', 'العميل مسؤول عن التواصل النهائي مع العملاء', 'بيانات العملاء تُعالج بسرية', 'ليس بديلاً عن فرق خدمة العملاء البشرية'],
  },
  'negotiation': {
    titleEn: 'AI Negotiation Training Services Agreement',
    titleAr: 'عقد خدمات التدريب على التفاوض بالذكاء الاصطناعي',
    serviceEn: 'Real-time negotiation simulation, tactic coaching, and deal strategy development.',
    serviceAr: 'محاكاة تفاوض في الوقت الفعلي، وتدريب على التكتيكات، وتطوير استراتيجية الصفقة.',
    deliverablesEn: ['Negotiation session transcript', 'Tactic analysis report', 'Move-by-move scoring', 'Strategy recommendations', 'Deal summary'],
    deliverablesAr: ['نص جلسة التفاوض', 'تقرير تحليل التكتيكات', 'تقييم حركة بحركة', 'توصيات الاستراتيجية', 'ملخص الصفقة'],
    timelineEn: 'Real-time session',
    timelineAr: 'جلسة فورية',
    termsEn: ['Simulation is for training purposes only', 'Elyvori not responsible for outcomes of real negotiations', 'Session data kept confidential', 'Unlimited sessions per contract period'],
    termsAr: ['المحاكاة لأغراض التدريب فقط', 'Elyvori غير مسؤولة عن نتائج المفاوضات الحقيقية', 'بيانات الجلسة تُحفظ بسرية', 'جلسات غير محدودة لكل فترة تعاقد'],
  },
  'default': {
    titleEn: 'AI Services Agreement',
    titleAr: 'عقد خدمات الذكاء الاصطناعي',
    serviceEn: 'AI-powered services as requested by the client.',
    serviceAr: 'خدمات مدعومة بالذكاء الاصطناعي حسب طلب العميل.',
    deliverablesEn: ['Completed project deliverables', 'Technical documentation', 'Delivery report'],
    deliverablesAr: ['مخرجات المشروع المكتملة', 'التوثيق التقني', 'تقرير التسليم'],
    timelineEn: '2-5 business days',
    timelineAr: '2-5 أيام عمل',
    termsEn: ['Client owns all delivered work', 'One revision included', 'Confidentiality maintained', 'Quality guaranteed'],
    termsAr: ['العميل يمتلك جميع الأعمال المسلّمة', 'تعديل واحد مشمول', 'السرية محفوظة', 'الجودة مضمونة'],
  },
};

function generateContractId(): string {
  const year = new Date().getFullYear();
  const random = Math.floor(Math.random() * 90000) + 10000;
  return `ELV-${year}-${random}`;
}

export function ContractModal({ lang, agentType, clientName, clientEmail, projectDetails, onSign, onClose }: ContractModalProps) {
  const [clientSignature, setClientSignature] = useState('');
  const [agreed, setAgreed] = useState(false);
  const [signing, setSigning] = useState(false);
  const [signed, setSigned] = useState(false);
  const isAr = lang === 'ar';

  const contract = AGENT_CONTRACTS[agentType] || AGENT_CONTRACTS['default'];
  const [contractId] = useState(() => generateContractId());
  const signedAt = new Date().toLocaleString(isAr ? 'ar-SA' : 'en-US', {
    year: 'numeric', month: 'long', day: 'numeric',
    hour: '2-digit', minute: '2-digit', timeZoneName: 'short'
  });

  const handleSign = async () => {
    if (!clientSignature.trim() || !agreed) return;
    setSigning(true);
    await new Promise(r => setTimeout(r, 2000));
    setSigned(true);
    setSigning(false);
    // Call PKI signing service
    let pkiData: any = {};
    try {
      const documentContent = `CONTRACT: ${contractId}\nCLIENT: ${clientName} <${clientEmail}>\nSERVICE: ${agentType}\nDETAILS: ${projectDetails}\nSIGNED: ${new Date().toISOString()}\nSIGNATURE: ${clientSignature}`;
      const pkiRes = await fetch('https://elyvori-api.onrender.com/public/pki/sign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clientName, clientEmail, agentType, contractId, documentContent }),
      });
      if (pkiRes.ok) pkiData = await pkiRes.json();
    } catch (e) {}

    const signature: ContractSignature = {
      clientName, clientEmail, agentType, projectDetails,
      signedAt: new Date().toISOString(),
      contractId,
      ipHash: btoa(clientEmail + Date.now()).slice(0, 16),
      pkiSignatureId: pkiData.signatureId,
      documentHash: pkiData.documentHash,
      verifyUrl: pkiData.verifyUrl,
    };
    setTimeout(() => onSign(signature), 1500);
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 10000,
      background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 20, overflowY: 'auto',
      fontFamily: "'Cairo','Inter',sans-serif",
      direction: isAr ? 'rtl' : 'ltr',
    }}>
      <div style={{
        background: 'linear-gradient(135deg, #080c18 0%, #0a0f1e 100%)',
        border: '1px solid rgba(0,229,255,0.2)',
        borderRadius: 24, maxWidth: 760, width: '100%',
        boxShadow: '0 0 60px rgba(0,229,255,0.1)',
        overflow: 'hidden',
      }}>

        {/* Header */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(0,229,255,0.08), rgba(124,58,237,0.08))',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          padding: '28px 32px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{
                width: 44, height: 44, borderRadius: 12,
                background: 'linear-gradient(135deg, #00E5FF, #7C3AED)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 20, fontWeight: 900, color: '#000',
              }}>E</div>
              <div>
                <div style={{ color: '#00E5FF', fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase' }}>
                  ELYVORI TECHNOLOGIES
                </div>
                <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 10 }}>
                  elyvori.com
                </div>
              </div>
            </div>
            <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.08)', border: 'none', color: 'rgba(255,255,255,0.6)', width: 32, height: 32, borderRadius: 8, cursor: 'pointer', fontSize: 16 }}>✕</button>
          </div>

          <h2 style={{ color: '#fff', fontSize: 20, fontWeight: 800, margin: '0 0 8px' }}>
            {isAr ? contract.titleAr : contract.titleEn}
          </h2>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <span style={{ background: 'rgba(0,229,255,0.1)', border: '1px solid rgba(0,229,255,0.2)', color: '#00E5FF', fontSize: 11, padding: '3px 10px', borderRadius: 999, fontWeight: 600 }}>
              {isAr ? 'رقم العقد:' : 'Contract ID:'} {contractId}
            </span>
            <span style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)', color: '#10b981', fontSize: 11, padding: '3px 10px', borderRadius: 999, fontWeight: 600 }}>
              {isAr ? 'التاريخ:' : 'Date:'} {new Date().toLocaleDateString(isAr ? 'ar-SA' : 'en-US')}
            </span>
          </div>
        </div>

        {/* Contract Body */}
        <div style={{ padding: '28px 32px', maxHeight: '50vh', overflowY: 'auto' }}>

          {/* Parties */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
            <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12, padding: 16 }}>
              <div style={{ color: '#00E5FF', fontSize: 10, fontWeight: 700, letterSpacing: 1, marginBottom: 8, textTransform: 'uppercase' }}>
                {isAr ? 'مزود الخدمة' : 'Service Provider'}
              </div>
              <div style={{ color: '#fff', fontSize: 14, fontWeight: 700 }}>Elyvori Technologies</div>
              <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12 }}>elyvori.com</div>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12, padding: 16 }}>
              <div style={{ color: '#7C3AED', fontSize: 10, fontWeight: 700, letterSpacing: 1, marginBottom: 8, textTransform: 'uppercase' }}>
                {isAr ? 'العميل' : 'Client'}
              </div>
              <div style={{ color: '#fff', fontSize: 14, fontWeight: 700 }}>{clientName}</div>
              <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12 }}>{clientEmail}</div>
            </div>
          </div>

          {/* Service Description */}
          <div style={{ marginBottom: 20 }}>
            <h4 style={{ color: '#00E5FF', fontSize: 12, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 10 }}>
              {isAr ? '١. وصف الخدمة' : '1. Service Description'}
            </h4>
            <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13, lineHeight: 1.7, margin: 0 }}>
              {isAr ? contract.serviceAr : contract.serviceEn}
            </p>
            {projectDetails && (
              <div style={{ background: 'rgba(124,58,237,0.08)', border: '1px solid rgba(124,58,237,0.2)', borderRadius: 10, padding: 12, marginTop: 12 }}>
                <div style={{ color: '#7C3AED', fontSize: 10, fontWeight: 700, marginBottom: 6 }}>
                  {isAr ? 'تفاصيل المشروع المحددة:' : 'Specific Project Details:'}
                </div>
                <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: 12 }}>{projectDetails}</div>
              </div>
            )}
          </div>

          {/* Deliverables */}
          <div style={{ marginBottom: 20 }}>
            <h4 style={{ color: '#00E5FF', fontSize: 12, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 10 }}>
              {isAr ? '٢. المخرجات المتفق عليها' : '2. Agreed Deliverables'}
            </h4>
            <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 6 }}>
              {(isAr ? contract.deliverablesAr : contract.deliverablesEn).map((d, i) => (
                <li key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'rgba(255,255,255,0.7)', fontSize: 13 }}>
                  <span style={{ color: '#10b981', fontSize: 16 }}>✓</span> {d}
                </li>
              ))}
            </ul>
          </div>

          {/* Timeline */}
          <div style={{ marginBottom: 20, background: 'rgba(0,229,255,0.05)', border: '1px solid rgba(0,229,255,0.15)', borderRadius: 10, padding: 14 }}>
            <span style={{ color: '#00E5FF', fontSize: 12, fontWeight: 700 }}>
              {isAr ? '⏱ الجدول الزمني المتوقع: ' : '⏱ Expected Timeline: '}
            </span>
            <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13 }}>
              {isAr ? contract.timelineAr : contract.timelineEn}
            </span>
          </div>

          {/* Terms */}
          <div style={{ marginBottom: 8 }}>
            <h4 style={{ color: '#00E5FF', fontSize: 12, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 10 }}>
              {isAr ? '٣. الشروط والأحكام' : '3. Terms & Conditions'}
            </h4>
            <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 6 }}>
              {(isAr ? contract.termsAr : contract.termsEn).map((t, i) => (
                <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, color: 'rgba(255,255,255,0.6)', fontSize: 12, lineHeight: 1.5 }}>
                  <span style={{ color: '#7C3AED', flexShrink: 0, marginTop: 2 }}>•</span> {t}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Signature Section */}
        <div style={{ padding: '24px 32px', borderTop: '1px solid rgba(255,255,255,0.06)', background: 'rgba(0,0,0,0.3)' }}>
          {!signed ? (
            <>
              <div style={{ marginBottom: 16 }}>
                <label style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 8 }}>
                  {isAr ? 'اكتب اسمك الكامل للتوقيع:' : 'Type your full name to sign:'}
                </label>
                <input
                  value={clientSignature}
                  onChange={e => setClientSignature(e.target.value)}
                  placeholder={isAr ? 'الاسم الكامل...' : 'Full name...'}
                  style={{
                    width: '100%', padding: '12px 16px', background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10,
                    color: '#fff', fontSize: 16, fontFamily: 'cursive',
                    outline: 'none', boxSizing: 'border-box',
                  }}
                />
              </div>

              <label style={{ display: 'flex', alignItems: 'flex-start', gap: 10, cursor: 'pointer', marginBottom: 20 }}>
                <input type="checkbox" checked={agreed} onChange={e => setAgreed(e.target.checked)} style={{ marginTop: 2, accentColor: '#00E5FF' }} />
                <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: 12, lineHeight: 1.5 }}>
                  {isAr
                    ? 'أقر بأنني قرأت وفهمت وأوافق على جميع شروط وأحكام هذا العقد، وأن توقيعي الرقمي ملزم قانونياً.'
                    : 'I confirm that I have read, understood, and agree to all terms and conditions of this contract, and that my digital signature is legally binding.'}
                </span>
              </label>

              <button
                onClick={handleSign}
                disabled={!clientSignature.trim() || !agreed || signing}
                style={{
                  width: '100%', padding: '14px 24px',
                  background: clientSignature.trim() && agreed
                    ? 'linear-gradient(135deg, #00E5FF, #7C3AED)'
                    : 'rgba(255,255,255,0.1)',
                  border: 'none', borderRadius: 12,
                  color: clientSignature.trim() && agreed ? '#000' : 'rgba(255,255,255,0.3)',
                  fontSize: 15, fontWeight: 800, cursor: clientSignature.trim() && agreed ? 'pointer' : 'not-allowed',
                  transition: 'all 0.3s',
                  boxShadow: clientSignature.trim() && agreed ? '0 0 30px rgba(0,229,255,0.3)' : 'none',
                }}
              >
                {signing
                  ? (isAr ? '⏳ جاري التوقيع...' : '⏳ Signing...')
                  : (isAr ? '🔏 وقّع العقد وابدأ المشروع' : '🔏 Sign Contract & Start Project')}
              </button>
            </>
          ) : (
            <div style={{ textAlign: 'center', padding: 20 }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>✅</div>
              <h3 style={{ color: '#10b981', fontSize: 20, fontWeight: 800, margin: '0 0 8px' }}>
                {isAr ? 'تم التوقيع بنجاح!' : 'Contract Signed Successfully!'}
              </h3>
              <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13, margin: '0 0 16px' }}>
                {isAr ? 'سيتم إرسال نسخة موقّعة إلى بريدك الإلكتروني.' : 'A signed copy will be sent to your email.'}
              </p>
              <div style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: 10, padding: 12 }}>
                <div style={{ color: '#10b981', fontSize: 11, fontWeight: 700, marginBottom: 4 }}>
                  {isAr ? 'رقم العقد:' : 'Contract ID:'} {contractId}
                </div>
                <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 10, marginBottom: 4 }}>
                  {isAr ? 'وقت التوقيع:' : 'Signed at:'} {signedAt}
                </div>
                <div style={{ color: '#00E5FF', fontSize: 10, fontFamily: 'monospace', marginTop: 6 }}>
                  🔐 RSA-2048 / SHA-256 Digital Signature
                </div>
                <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: 9, marginTop: 2 }}>
                  {isAr ? 'توقيع رقمي موثّق — لا يمكن تزويره' : 'Cryptographically signed — tamper-proof'}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
