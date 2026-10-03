import { Check, Sparkles, Zap } from 'lucide-react';
import { Language } from '../types';
import { translations } from '../translations';

interface PricingSectionProps {
  lang: Language;
  onSelectPlan: (planId: string) => void;
  onOpenCheckout?: (plan: 'starter' | 'pro') => void;
}

export function PricingSection({ lang, onSelectPlan, onOpenCheckout }: PricingSectionProps) {
  const t = translations[lang];
  const isRtl = lang === 'ar';

  const allServices = lang === 'en' ? [
    'Digital Products Builder',
    'Website & App Engineering',
    'Recruitment CRM',
    'Bilingual Marketing Agent',
    'Content Creation Agent',
    'Lead Discovery Agent',
    'Career Agent',
    'Contract Analyzer',
    'Customer Support AI',
    'AI Negotiation Simulator',
  ] : [
    'منشئ المنتجات الرقمية',
    'هندسة المواقع والتطبيقات',
    'نظام إدارة التوظيف',
    'وكيل التسويق ثنائي اللغة',
    'وكيل إنشاء المحتوى',
    'وكيل اكتشاف العملاء',
    'وكيل التوظيف',
    'محلل العقود',
    'ذكاء دعم العملاء',
    'محاكاة التفاوض الذكي',
  ];

  const tierStyles = [
    { border: 'rgba(0,229,255,0.15)', glow: 'none', btnBg: 'rgba(0,229,255,0.08)', btnBorder: 'rgba(0,229,255,0.3)', btnText: '#00E5FF' },
    { border: 'rgba(0,229,255,0.5)', glow: '0 0 60px rgba(0,229,255,0.12), 0 0 0 1px rgba(0,229,255,0.15)', btnBg: 'linear-gradient(135deg,#00E5FF,#7C3AED,#D500F9)', btnBorder: 'transparent', btnText: 'white' },
    { border: 'rgba(213,0,249,0.2)', glow: 'none', btnBg: 'rgba(213,0,249,0.08)', btnBorder: 'rgba(213,0,249,0.3)', btnText: '#D500F9' },
  ];

  return (
    <section
      id="pricing"
      dir={isRtl ? 'rtl' : 'ltr'}
      style={{ colorScheme: 'dark', fontFamily: "'Cairo','Inter',sans-serif" }}
      className="relative py-16 sm:py-24 bg-transparent"
    >
      {/* Background */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] rounded-full opacity-20"
          style={{ background: 'radial-gradient(ellipse, rgba(213,0,249,0.2) 0%, transparent 70%)' }} />
        <div className="absolute inset-0 opacity-[0.02]"
          style={{ backgroundImage: 'linear-gradient(rgba(0,229,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(0,229,255,1) 1px, transparent 1px)', backgroundSize: '60px 60px' }} />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#00E5FF]/20 bg-[#00E5FF]/5 px-4 py-1.5 text-xs font-semibold text-[#00E5FF] mb-4">
            <Sparkles className="h-3.5 w-3.5" />
            <span>{t.pricing.sectionBadge}</span>
          </div>
          <h2 id="pricing-title" className="text-3xl sm:text-4xl font-extrabold text-white"
            style={{ textShadow: '0 0 40px rgba(0,229,255,0.15)' }}>
            {t.pricing.sectionTitle}
          </h2>
          <p id="pricing-subtitle" className="mt-3 text-base text-slate-400 leading-relaxed">
            {t.pricing.sectionSubtitle}
          </p>

          {/* All 9 services included */}
          <div className="mt-6 rounded-xl border border-[#00E5FF]/10 bg-[#00E5FF]/[0.03] px-5 py-4">
            <p className="text-xs font-bold text-[#00E5FF] mb-3 uppercase tracking-widest">
              {lang === 'en' ? 'All 10 AI Agents Included in Every Tier:' : 'جميع الوكلاء العشرة مشمولون في كل خطة:'}
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              {allServices.map((s, i) => (
                <span key={i} className="inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-[11px] font-medium"
                  style={{ borderColor: 'rgba(0,229,255,0.12)', background: 'rgba(0,229,255,0.04)', color: '#94a3b8' }}>
                  <Check className="h-3 w-3 text-emerald-400" />
                  {s}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 items-stretch">
          {t.pricing.tiers.map((tier, tIdx) => {
            const isPopular = tier.popular;
            const style = tierStyles[tIdx] || tierStyles[0];

            return (
              <div
                key={tier.id}
                id={`pricing-card-${tier.id}`}
                className="relative flex flex-col rounded-2xl p-6 sm:p-7 transition-all duration-300"
                style={{
                  background: 'rgba(8,10,18,0.75)',
                  border: `1px solid ${style.border}`,
                  boxShadow: style.glow,
                  backdropFilter: 'blur(12px)',
                  transform: isPopular ? 'translateY(-6px)' : 'none',
                }}
              >
                {/* Top accent */}
                {isPopular && (
                  <>
                    <div className="absolute top-0 left-8 right-8 h-px"
                      style={{ background: 'linear-gradient(90deg, transparent, rgba(0,229,255,0.6), transparent)' }} />
                    <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full px-4 py-1 text-[11px] font-bold text-white"
                      style={{ background: 'linear-gradient(135deg, #00E5FF, #7C3AED)', boxShadow: '0 4px 15px rgba(0,229,255,0.3)' }}>
                      {lang === 'en' ? 'Most Popular' : 'الأكثر شيوعاً'}
                    </div>
                  </>
                )}

                <div className="flex-1">
                  {/* Title */}
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-xl font-bold text-white">{tier.name}</h3>
                    <span className="rounded-lg px-2.5 py-0.5 text-xs font-semibold border"
                      style={{ borderColor: 'rgba(0,229,255,0.2)', background: 'rgba(0,229,255,0.06)', color: '#00E5FF' }}>
                      {tier.projectLimit}
                    </span>
                  </div>

                  <p className="text-xs text-slate-500 leading-relaxed mb-5 min-h-[36px]">{tier.desc}</p>

                  {/* Price */}
                  <div className="flex items-baseline gap-1 mb-6">
                    <span className="text-4xl sm:text-5xl font-extrabold text-white"
                      style={{ textShadow: isPopular ? '0 0 30px rgba(0,229,255,0.3)' : 'none' }}>
                      {tier.price}
                    </span>
                    <span className="text-sm text-slate-500">{tier.period}</span>
                  </div>

                  {/* Service limits */}
                  <div className="rounded-xl border p-4 mb-5"
                    style={{ borderColor: 'rgba(255,255,255,0.05)', background: 'rgba(255,255,255,0.02)' }}>
                    <div className="text-[10px] font-bold text-[#00E5FF] uppercase tracking-widest mb-3">
                      {lang === 'en' ? 'Service Limits in Plan' : 'حدود الخدمة في الخطة'}
                    </div>
                    <ul className="space-y-1.5 text-xs">
                      {[
                        [lang === 'en' ? 'Digital Products:' : 'المنتجات الرقمية:', tier.serviceCoverage.digitalProducts],
                        [lang === 'en' ? 'Web & App Build:' : 'بناء المواقع والتطبيقات:', tier.serviceCoverage.webApp],
                        [lang === 'en' ? 'Recruitment CRM:' : 'نظام التوظيف:', tier.serviceCoverage.recruitmentCRM],
                        [lang === 'en' ? 'Marketing Agent:' : 'وكيل التسويق:', tier.serviceCoverage.marketingAgent],
                        [lang === 'en' ? 'Content Agent:' : 'وكيل المحتوى:', tier.serviceCoverage.contentAgent],
                        [lang === 'en' ? 'Lead Discovery:' : 'اكتشاف العملاء:', tier.serviceCoverage.leadFinder],
                        [lang === 'en' ? 'Career Agent:' : 'وكيل التوظيف:', tier.serviceCoverage.careerAgent],
                        [lang === 'en' ? 'Contract Analyzer:' : 'محلل العقود:', lang === 'en' ? (tIdx === 0 ? '1 analysis' : tIdx === 1 ? 'Up to 10/month' : 'Unlimited') : (tIdx === 0 ? 'تحليل واحد' : tIdx === 1 ? 'حتى 10/شهر' : 'غير محدود')],
                        [lang === 'en' ? 'Support AI:' : 'دعم العملاء AI:', lang === 'en' ? (tIdx === 0 ? '1 analysis' : tIdx === 1 ? 'Up to 10/month' : 'Unlimited') : (tIdx === 0 ? 'تحليل واحد' : tIdx === 1 ? 'حتى 10/شهر' : 'غير محدود')],
                      ].map(([label, value], i) => (
                        <li key={i} className="flex items-center justify-between gap-2">
                          <span className="text-slate-600">{label}</span>
                          <span className="font-semibold text-slate-300 text-right">{value}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Features */}
                  <div className="space-y-2.5">
                    <div className="text-[10px] font-bold uppercase tracking-widest text-slate-600">
                      {lang === 'en' ? 'Included Capabilities' : 'الإمكانيات المشمولة'}
                    </div>
                    {tier.features.map((feat, fIdx) => (
                      <div key={fIdx} className="flex items-start gap-2.5 text-xs text-slate-400">
                        <Check className="h-3.5 w-3.5 text-emerald-400 flex-shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* CTA Button */}
                <div className="mt-7 pt-5 border-t" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
                  <button
                    onClick={() => { if (tier.id === 'starter' || tier.id === 'pro') { onOpenCheckout ? onOpenCheckout(tier.id as 'starter' | 'pro') : onSelectPlan(tier.id); } else { onSelectPlan(tier.id); } }}
                    className="w-full flex items-center justify-center gap-2 rounded-xl py-3.5 text-sm font-bold transition-all"
                    style={{
                      background: style.btnBg,
                      border: `1px solid ${style.btnBorder}`,
                      color: style.btnText,
                      boxShadow: isPopular ? '0 0 25px rgba(0,229,255,0.2)' : 'none',
                    }}
                  >
                    <Zap className="h-4 w-4" />
                    <span>{tier.cta}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
