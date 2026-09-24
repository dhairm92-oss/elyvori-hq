import { useState } from 'react';
import {
  Package,
  Layout,
  Users,
  Megaphone,
  CheckCircle2,
  FileText,
  Table,
  GraduationCap,
  Server,
  Database,
  Smartphone,
  Globe2,
  TrendingUp,
  Sparkles,
  ArrowUpRight,
  Search,
  Briefcase,
} from 'lucide-react';
import { Language } from '../types';
import { translations } from '../translations';
import { QuantumButton } from './QuantumButton';

interface ServicesSectionProps {
  lang: Language;
  onRequestDemo: () => void;
}

export function ServicesSection({ lang, onRequestDemo }: ServicesSectionProps) {
  const t = translations[lang];
  const [activeTab, setActiveTab] = useState<string>('digital-products');
  const isRtl = lang === 'ar';

  // FIX: this map only listed the original 4 icons - when the Content
  // Creation Agent and Lead Discovery Agent services were added (using
  // 'FileText' and 'Search' as their iconName), this map had no entry
  // for either one, so IconComponent resolved to `undefined` and React
  // crashed with a blank page the moment ServicesSection tried to render
  // it. Every icon actually used by any service in translations.ts must
  // have a matching entry here.
  const icons = {
    Package: Package,
    Layout: Layout,
    Users: Users,
    Megaphone: Megaphone,
    FileText: FileText,
    Search: Search,
    Briefcase: Briefcase,
  };

  const totalServices = t.services.items.length;

  return (
    <section id="services" className="relative py-16 sm:py-24 border-t border-slate-200/80 dark:border-slate-800/80">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-indigo-500/20 bg-indigo-500/10 px-3 py-1 text-xs font-semibold text-indigo-600 dark:text-indigo-400 mb-3">
            <Sparkles className="h-3 w-3" />
            <span>{t.services.sectionBadge}</span>
          </div>
          <h2
            id="services-title"
            className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white"
          >
            {t.services.sectionTitle}
          </h2>
          <p
            id="services-subtitle"
            className="mt-3 text-base sm:text-lg text-slate-600 dark:text-slate-300"
          >
            {t.services.sectionSubtitle}
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
          {t.services.items.map((srv, idx) => {
            const IconComponent = icons[srv.iconName];
            const isSelected = activeTab === srv.id;

            return (
              <div
                key={srv.id}
                id={`service-card-${srv.id}`}
                onClick={() => setActiveTab(srv.id)}
                className={`group relative flex flex-col justify-between rounded-2xl border p-6 sm:p-8 transition-all duration-300 cursor-pointer ${
                  isSelected
                    ? 'border-indigo-500/80 bg-gradient-to-b from-indigo-50/50 to-white dark:from-slate-900 dark:to-slate-950 shadow-md shadow-indigo-500/10 ring-1 ring-indigo-500/40'
                    : 'border-slate-200 dark:border-slate-850 bg-white/70 dark:bg-slate-900/50 hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-sm'
                }`}
              >
                <div>
                  {/* Top Meta: Icon + Badge + Index */}
                  <div className="flex items-center justify-between gap-3 mb-5">
                    <div className="flex items-center gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-600/10 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400">
                        {IconComponent && <IconComponent className="h-6 w-6" />}
                      </div>
                      <div>
                        <span className="inline-block rounded-md bg-slate-100 dark:bg-slate-800 px-2.5 py-0.5 text-xs font-semibold text-slate-700 dark:text-slate-300">
                          {srv.badge}
                        </span>
                        <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                          {String(idx + 1).padStart(2, '0')} / {String(totalServices).padStart(2, '0')}
                        </div>
                      </div>
                    </div>
                    <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-1 rounded-full border border-emerald-200 dark:border-emerald-800/40">
                      {srv.metrics}
                    </span>
                  </div>

                  {/* Title & Short Description */}
                  <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                    {srv.title}
                  </h3>

                  <p className="mt-2 text-sm sm:text-base font-medium text-slate-700 dark:text-slate-200 leading-relaxed">
                    {srv.shortDesc}
                  </p>

                  <p className="mt-2 text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                    {srv.fullDesc}
                  </p>

                  {/* Deliverables List */}
                  <div className="mt-6 border-t border-slate-100 dark:border-slate-800/80 pt-4">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                      {lang === 'en' ? 'Core Deliverables' : 'المخرجات الأساسية'}
                    </h4>
                    <ul className="space-y-2">
                      {srv.deliverables.map((item, itemIdx) => (
                        <li key={itemIdx} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-600 dark:text-slate-300">
                          <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Bottom CTA for card */}
                <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800/60 flex items-center justify-between">
                  <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 flex items-center gap-1">
                    {lang === 'en' ? 'Interactive Preview' : 'معاينة تفاعلية'}
                    <ArrowUpRight className={`h-3.5 w-3.5 ${isRtl ? 'rotate-[-90deg]' : ''}`} />
                  </span>
                  <span className="text-[11px] text-slate-400">
                    {isSelected ? (lang === 'en' ? 'Active view' : 'معروض حالياً') : (lang === 'en' ? 'Click to inspect' : 'اضغط للمعاينة')}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Dynamic Capability Showcase Box */}
        <div className="mt-12 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/80 p-6 sm:p-8 backdrop-blur-md shadow-sm">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5 mb-6">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                {t.services.interactivePreview}
              </span>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mt-1">
                {t.services.items.find((s) => s.id === activeTab)?.title}
              </h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {t.services.items.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setActiveTab(s.id)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                    activeTab === s.id
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  {s.title}
                </button>
              ))}
            </div>
          </div>

          {/* Specific interactive showcase per service */}
          {activeTab === 'digital-products' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 p-4">
                <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 mb-2">
                  <FileText className="h-5 w-5" />
                  <span className="font-semibold text-sm">
                    {lang === 'en' ? 'PDF Playbooks & Guides' : 'أدلة وكتيبات استراتيجية PDF'}
                  </span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  {lang === 'en'
                    ? 'Engineered 40-page market playbooks with research data, diagrams, and ready-to-sell typography.'
                    : 'كتيبات تشغيلية احترافية مكونة من 40 صفحة مع بيانات أبحاث ومخططات وتصميم جاهز للبيع.'}
                </p>
                <div className="mt-3 flex items-center justify-between text-[11px] text-emerald-600 dark:text-emerald-400 font-mono">
                  <span>Format: Print-ready PDF</span>
                  <span>Demand Gap: 98%</span>
                </div>
              </div>

              <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 p-4">
                <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 mb-2">
                  <Table className="h-5 w-5" />
                  <span className="font-semibold text-sm">
                    {lang === 'en' ? 'Excel Financial Templates' : 'قوالب مالية وجداول إكسيل'}
                  </span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  {lang === 'en'
                    ? 'Automated spreadsheet models with dynamic macros, KPIs, and pre-configured financial formulas.'
                    : 'نماذج جداول بيانات ذكية بمعادلات مالية وأدوات أداء جاهزة للاستخدام.'}
                </p>
                <div className="mt-3 flex items-center justify-between text-[11px] text-emerald-600 dark:text-emerald-400 font-mono">
                  <span>Format: .XLSX & Google Sheets</span>
                  <span>Formula Verified</span>
                </div>
              </div>

              <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 p-4">
                <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 mb-2">
                  <GraduationCap className="h-5 w-5" />
                  <span className="font-semibold text-sm">
                    {lang === 'en' ? 'Structured Mini-Courses' : 'دورات تدريبية مصغرة منظمة'}
                  </span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  {lang === 'en'
                    ? 'Full video lecture outlines, student slide decks, actionable homework quizzes, and launch copy.'
                    : 'خطط دروس مرئية، شرائح عرض للطلاب، اختبارات تفاعلية، ونصوص إطلاق جاهزة.'}
                </p>
                <div className="mt-3 flex items-center justify-between text-[11px] text-emerald-600 dark:text-emerald-400 font-mono">
                  <span>5-Module Bundle</span>
                  <span>LMS Ready</span>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'web-app-building' && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 p-3.5">
                <div className="flex items-center gap-2 text-indigo-500 mb-1.5">
                  <Layout className="h-4 w-4" />
                  <span className="text-xs font-bold">Web Frontend</span>
                </div>
                <p className="text-[12px] text-slate-600 dark:text-slate-400">
                  React 19, TypeScript, Tailwind CSS with fully responsive layouts.
                </p>
              </div>
              <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 p-3.5">
                <div className="flex items-center gap-2 text-emerald-500 mb-1.5">
                  <Smartphone className="h-4 w-4" />
                  <span className="text-xs font-bold">Android App</span>
                </div>
                <p className="text-[12px] text-slate-600 dark:text-slate-400">
                  Native Android builds, Jetpack Compose UI, API synchronization.
                </p>
              </div>
              <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 p-3.5">
                <div className="flex items-center gap-2 text-blue-500 mb-1.5">
                  <Server className="h-4 w-4" />
                  <span className="text-xs font-bold">Backend Services</span>
                </div>
                <p className="text-[12px] text-slate-600 dark:text-slate-400">
                  Node / Python REST API microservices with JWT authentication & rate limiting.
                </p>
              </div>
              <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 p-3.5">
                <div className="flex items-center gap-2 text-purple-500 mb-1.5">
                  <Database className="h-4 w-4" />
                  <span className="text-xs font-bold">Database Setup</span>
                </div>
                <p className="text-[12px] text-slate-600 dark:text-slate-400">
                  Production PostgreSQL / Firestore schemas with automated migrations.
                </p>
              </div>
            </div>
          )}

          {activeTab === 'recruitment-crm' && (
            <div className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 p-3">
                  <div className="text-[11px] font-semibold text-slate-500 uppercase">Stage 1: Ingestion</div>
                  <div className="text-sm font-bold text-slate-900 dark:text-white mt-1">CV & Resume Parsing</div>
                  <div className="text-xs text-slate-500 mt-1">Direct PDF/Doc parsing into structured skill records</div>
                </div>
                <div className="rounded-xl border border-indigo-500/40 bg-indigo-50/50 dark:bg-indigo-950/20 p-3">
                  <div className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 uppercase">Stage 2: Scoring</div>
                  <div className="text-sm font-bold text-slate-900 dark:text-white mt-1">Competency Vector Match</div>
                  <div className="text-xs text-indigo-600/80 dark:text-indigo-400/80 mt-1">94% candidate match score against role rubric</div>
                </div>
                <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 p-3">
                  <div className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 uppercase">Stage 3: Decision</div>
                  <div className="text-sm font-bold text-slate-900 dark:text-white mt-1">Interview Prep Generator</div>
                  <div className="text-xs text-slate-500 mt-1">Tailored probing questions targeting candidate gaps</div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'marketing-agent' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                    English Variant (LinkedIn & X)
                  </span>
                  <span className="text-[10px] bg-slate-200 dark:bg-slate-800 px-2 py-0.5 rounded font-mono">
                    Professional Voice
                  </span>
                </div>
                <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-sans">
                  "Scaling digital products used to take months of manual R&D. With Elyvori's intelligent market gap analysis, your team turns commercial voids into validated revenue streams in under 48 hours. #AIAutomation #DigitalProducts #GrowthStrategy"
                </p>
              </div>

              <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 p-4 text-right" dir="rtl">
                <div className="flex items-center justify-between mb-2" dir="ltr">
                  <span className="text-[10px] bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 px-2 py-0.5 rounded font-mono">
                    صياغة عربية أصيلة
                  </span>
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                    النسخة العربية المترجمة أصلياً
                  </span>
                </div>
                <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-cairo">
                  "تحويل الأفكار إلى منتجات رقمية تجارية لم يعد يتطلب أشهراً من العمل التقليدي. تتيح لك أنظمة إليفوري الذكية اكتشاف فجوات السوق وبناء منتجات مربحة وجاهزة للإطلاق في أقل من 48 ساعة فقط. #أتمتة_الأعمال #منتجات_رقمية #ريادة_الأعمال"
                </p>
              </div>
            </div>
          )}

          {activeTab === 'content-agent' && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 p-3.5">
                <div className="flex items-center gap-2 text-indigo-500 mb-1.5">
                  <FileText className="h-4 w-4" />
                  <span className="text-xs font-bold">{lang === 'en' ? 'Blog Article' : 'مقالة مدونة'}</span>
                </div>
                <p className="text-[12px] text-slate-600 dark:text-slate-400">
                  {lang === 'en' ? '500-900 words, fully structured and specific to the topic.' : '500-900 كلمة، منظمة بالكامل ومحددة للموضوع.'}
                </p>
              </div>
              <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 p-3.5">
                <div className="flex items-center gap-2 text-emerald-500 mb-1.5">
                  <Table className="h-4 w-4" />
                  <span className="text-xs font-bold">{lang === 'en' ? 'Video Script' : 'سكربت فيديو'}</span>
                </div>
                <p className="text-[12px] text-slate-600 dark:text-slate-400">
                  {lang === 'en' ? 'Ready to record, with a hook and a clear call to action.' : 'جاهز للتسجيل، بمقدمة جذابة ودعوة واضحة لاتخاذ إجراء.'}
                </p>
              </div>
              <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 p-3.5">
                <div className="flex items-center gap-2 text-blue-500 mb-1.5">
                  <Megaphone className="h-4 w-4" />
                  <span className="text-xs font-bold">{lang === 'en' ? 'Social Posts' : 'منشورات سوشل ميديا'}</span>
                </div>
                <p className="text-[12px] text-slate-600 dark:text-slate-400">
                  {lang === 'en' ? 'Platform-native copy for Instagram, X, and LinkedIn.' : 'نصوص مصممة خصيصاً لإنستغرام وإكس ولينكد إن.'}
                </p>
              </div>
              <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 p-3.5">
                <div className="flex items-center gap-2 text-purple-500 mb-1.5">
                  <Package className="h-4 w-4" />
                  <span className="text-xs font-bold">{lang === 'en' ? 'Product Description' : 'وصف المنتج'}</span>
                </div>
                <p className="text-[12px] text-slate-600 dark:text-slate-400">
                  {lang === 'en' ? 'Persuasive, benefit-led copy ready to publish.' : 'نص مقنع يركز على الفائدة، جاهز للنشر.'}
                </p>
              </div>
            </div>
          )}

          {activeTab === 'lead-finder' && (
            <div className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 p-3">
                  <div className="text-[11px] font-semibold text-slate-500 uppercase">
                    {lang === 'en' ? 'Step 1: Search' : 'الخطوة 1: البحث'}
                  </div>
                  <div className="text-sm font-bold text-slate-900 dark:text-white mt-1">
                    {lang === 'en' ? 'Targeted Niche & Location' : 'مجال وموقع جغرافي مستهدف'}
                  </div>
                  <div className="text-xs text-slate-500 mt-1">
                    {lang === 'en' ? 'Search a specific business type and city' : 'بحث في نوع أعمال ومدينة محددة'}
                  </div>
                </div>
                <div className="rounded-xl border border-indigo-500/40 bg-indigo-50/50 dark:bg-indigo-950/20 p-3">
                  <div className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 uppercase">
                    {lang === 'en' ? 'Step 2: Evidence' : 'الخطوة 2: الأدلة'}
                  </div>
                  <div className="text-sm font-bold text-slate-900 dark:text-white mt-1">
                    {lang === 'en' ? 'No-Website Identification' : 'تحديد الأعمال بلا موقع'}
                  </div>
                  <div className="text-xs text-indigo-600/80 dark:text-indigo-400/80 mt-1">
                    {lang === 'en' ? 'Only social pages or directory listings found' : 'فقط صفحات سوشل ميديا أو قوائم أدلة'}
                  </div>
                </div>
                <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 p-3">
                  <div className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 uppercase">
                    {lang === 'en' ? 'Step 3: Outreach' : 'الخطوة 3: التواصل'}
                  </div>
                  <div className="text-sm font-bold text-slate-900 dark:text-white mt-1">
                    {lang === 'en' ? 'Free Demo + Warm Email' : 'موقع تجريبي مجاني + رسالة تواصل'}
                  </div>
                  <div className="text-xs text-slate-500 mt-1">
                    {lang === 'en' ? 'A real working demo, not just a pitch' : 'موقع تجريبي حقيقي وشغال، لا عرض بيع فقط'}
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="mt-6 flex justify-end">
            <QuantumButton
              variant="accent"
              size="sm"
              onClick={onRequestDemo}
            >
              <span>{lang === 'en' ? 'Request a walkthrough for your organization' : 'اطلب جولة توضيحية خاصة بمؤسستك'}</span>
              <ArrowUpRight className={`h-3.5 w-3.5 ${isRtl ? 'rotate-[-90deg]' : ''}`} />
            </QuantumButton>
          </div>
        </div>
      </div>
    </section>
  );
}
