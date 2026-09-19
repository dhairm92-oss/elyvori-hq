import { Check, Sparkles, Layers } from 'lucide-react';
import { Language } from '../types';
import { translations } from '../translations';
import { QuantumButton } from './QuantumButton';

interface PricingSectionProps {
  lang: Language;
  onSelectPlan: (planId: string) => void;
}

export function PricingSection({ lang, onSelectPlan }: PricingSectionProps) {
  const t = translations[lang];

  return (
    <section id="pricing" className="relative py-16 sm:py-24 border-t border-slate-200/80 dark:border-slate-800/80">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-indigo-500/20 bg-indigo-500/10 px-3 py-1 text-xs font-semibold text-indigo-600 dark:text-indigo-400 mb-3">
            <Layers className="h-3 w-3" />
            <span>{t.pricing.sectionBadge}</span>
          </div>
          <h2
            id="pricing-title"
            className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white"
          >
            {t.pricing.sectionTitle}
          </h2>
          <p
            id="pricing-subtitle"
            className="mt-3 text-base sm:text-lg text-slate-600 dark:text-slate-300"
          >
            {t.pricing.sectionSubtitle}
          </p>

          {/* Unified coverage banner */}
          <div className="mt-6 inline-flex flex-wrap items-center justify-center gap-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 px-4 py-2 text-xs font-medium text-slate-700 dark:text-slate-300">
            <span className="font-bold text-indigo-600 dark:text-indigo-400">{t.pricing.coverageLabel}</span>
            {t.pricing.servicesList.map((srvName, sIdx) => (
              <span key={sIdx} className="inline-flex items-center gap-1 bg-white dark:bg-slate-800 px-2 py-0.5 rounded-md border border-slate-200 dark:border-slate-700 text-[11px]">
                <Check className="h-3 w-3 text-emerald-500" />
                {srvName}
              </span>
            ))}
          </div>
        </div>

        {/* 3 Tiers Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 items-stretch">
          {t.pricing.tiers.map((tier) => {
            const isStarter = tier.popular;

            return (
              <div
                key={tier.id}
                id={`pricing-card-${tier.id}`}
                className={`relative flex flex-col justify-between rounded-2xl p-6 sm:p-8 transition-all duration-300 ${
                  isStarter
                    ? 'border-2 border-indigo-600 dark:border-indigo-500 bg-white dark:bg-slate-900 shadow-xl shadow-indigo-500/10 ring-1 ring-indigo-500/20 md:-translate-y-2'
                    : 'border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/50 hover:border-slate-300 dark:hover:border-slate-700 shadow-xs'
                }`}
              >
                {/* Popular Pill */}
                {isStarter && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-indigo-600 to-blue-600 px-3.5 py-0.5 text-[11px] font-bold uppercase tracking-wider text-white shadow-md">
                    {lang === 'en' ? 'Most Popular' : 'الأكثر طلباً'}
                  </div>
                )}

                <div>
                  {/* Tier Title & Description */}
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                      {tier.name}
                    </h3>
                    <span className="rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800/40 px-2.5 py-0.5 text-xs font-semibold">
                      {tier.projectLimit}
                    </span>
                  </div>

                  <p className="mt-2 text-xs sm:text-sm text-slate-500 dark:text-slate-400 min-h-[40px]">
                    {tier.desc}
                  </p>

                  {/* Price */}
                  <div className="mt-6 flex items-baseline gap-1">
                    <span className="text-4xl sm:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                      {tier.price}
                    </span>
                    <span className="text-sm font-medium text-slate-500 dark:text-slate-400">
                      {tier.period}
                    </span>
                  </div>

                  {/* Coverage Breakdown */}
                  <div className="mt-6 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/40 p-3.5">
                    <div className="text-[11px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 mb-2">
                      {lang === 'en' ? 'Service Limits in Plan' : 'حدود الخدمات في الباقة'}
                    </div>
                    <ul className="space-y-1 text-xs text-slate-600 dark:text-slate-300">
                      <li className="flex items-center justify-between">
                        <span className="text-slate-500">{lang === 'en' ? 'Digital Products:' : 'المنتجات الرقمية:'}</span>
                        <span className="font-semibold text-right">{tier.serviceCoverage.digitalProducts}</span>
                      </li>
                      <li className="flex items-center justify-between">
                        <span className="text-slate-500">{lang === 'en' ? 'Web & App Build:' : 'المواقع والتطبيقات:'}</span>
                        <span className="font-semibold text-right">{tier.serviceCoverage.webApp}</span>
                      </li>
                      <li className="flex items-center justify-between">
                        <span className="text-slate-500">{lang === 'en' ? 'Recruitment CRM:' : 'إدارة التوظيف:'}</span>
                        <span className="font-semibold text-right">{tier.serviceCoverage.recruitmentCRM}</span>
                      </li>
                      <li className="flex items-center justify-between">
                        <span className="text-slate-500">{lang === 'en' ? 'Marketing Agent:' : 'وكيل التسويق:'}</span>
                        <span className="font-semibold text-right">{tier.serviceCoverage.marketingAgent}</span>
                      </li>
                    </ul>
                  </div>

                  {/* Feature List */}
                  <div className="mt-6 space-y-2.5">
                    <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      {lang === 'en' ? 'Included Capabilities' : 'المزايا المشمولة'}
                    </div>
                    {tier.features.map((feat, fIdx) => (
                      <div key={fIdx} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-600 dark:text-slate-300">
                        <Check className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Select Button */}
                <div className="mt-8 pt-4">
                  <QuantumButton
                    id={`btn-select-tier-${tier.id}`}
                    variant={isStarter ? 'primary' : 'secondary'}
                    size="md"
                    isFullWidth
                    onClick={() => onSelectPlan(tier.id)}
                  >
                    <span>{tier.cta}</span>
                  </QuantumButton>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
