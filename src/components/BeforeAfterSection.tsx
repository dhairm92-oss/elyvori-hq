import { X, Check, Clock, DollarSign, Database, Smartphone } from 'lucide-react';
import { Language } from '../types';

interface BeforeAfterSectionProps {
  lang: Language;
}

// A premium "before/after" comparison, the way established companies
// (Stripe, Linear, Vercel) present transformation - not a single
// anecdotal story, but a clear, general comparison of the old way vs.
// the new way, built on real, defensible numbers already shown
// elsewhere on the page (3-minute average build time).
export function BeforeAfterSection({ lang }: BeforeAfterSectionProps) {
  const rows = [
    {
      icon: Smartphone,
      before: lang === 'en' ? 'Social media page only, no real website' : 'صفحة سوشل ميديا فقط، بدون موقع حقيقي',
      after: lang === 'en' ? 'Professional website with custom design' : 'موقع احترافي بتصميم مخصص',
    },
    {
      icon: Database,
      before: lang === 'en' ? 'No backend, no database, no real functionality' : 'بدون خادم، بدون قاعدة بيانات، بدون وظائف حقيقية',
      after: lang === 'en' ? 'Real backend, real database, fully functional' : 'خادم وقاعدة بيانات حقيقيين، وظائف كاملة',
    },
    {
      icon: Clock,
      before: lang === 'en' ? 'Weeks of waiting on a freelancer or agency' : 'أسابيع من الانتظار على فريلانسر أو وكالة',
      after: lang === 'en' ? 'Ready in an average of 3 minutes' : 'جاهز خلال 3 دقايق بالمتوسط',
    },
    {
      icon: DollarSign,
      before: lang === 'en' ? '$1,000-$5,000+ typical agency cost' : '$1,000-$5,000+ تكلفة وكالة نموذجية',
      after: lang === 'en' ? 'Starting at $19/month, all services included' : 'يبدأ من $19/شهر، كل الخدمات مشمولة',
    },
  ];

  return (
    <section className="relative py-16 sm:py-24 border-t border-slate-200/80 dark:border-slate-800/80">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            {lang === 'en' ? 'The Old Way vs. The Elyvori Way' : 'الطريقة القديمة مقابل طريقة إليفوري'}
          </h2>
          <p className="mt-3 text-slate-600 dark:text-slate-300">
            {lang === 'en'
              ? 'Every business starts somewhere. Here is what changes the moment you switch.'
              : 'كل عمل يبدأ من مكان ما. هذا ما يتغيّر لحظة التحوّل.'}
          </p>
        </div>

        <div className="overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          {/* Column Headers */}
          <div className="grid grid-cols-2 bg-slate-50 dark:bg-slate-900/60">
            <div className="flex items-center gap-2 px-4 sm:px-6 py-4 border-r border-slate-200 dark:border-slate-800">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-red-500/10 text-red-500">
                <X className="h-4 w-4" />
              </div>
              <span className="font-bold text-sm sm:text-base text-slate-500 dark:text-slate-400">
                {lang === 'en' ? 'Without Elyvori' : 'بدون إليفوري'}
              </span>
            </div>
            <div className="flex items-center gap-2 px-4 sm:px-6 py-4">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-500">
                <Check className="h-4 w-4" />
              </div>
              <span className="font-bold text-sm sm:text-base text-slate-900 dark:text-white">
                {lang === 'en' ? 'With Elyvori' : 'مع إليفوري'}
              </span>
            </div>
          </div>

          {/* Comparison Rows */}
          {rows.map((row, idx) => {
            const Icon = row.icon;
            return (
              <div
                key={idx}
                className={`grid grid-cols-2 ${idx % 2 === 0 ? 'bg-white dark:bg-slate-950' : 'bg-slate-50/50 dark:bg-slate-900/30'}`}
              >
                <div className="flex items-start gap-3 px-4 sm:px-6 py-4 border-r border-t border-slate-200 dark:border-slate-800">
                  <Icon className="h-4 w-4 text-slate-400 shrink-0 mt-0.5" />
                  <span className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 line-through decoration-slate-300 dark:decoration-slate-700">
                    {row.before}
                  </span>
                </div>
                <div className="flex items-start gap-3 px-4 sm:px-6 py-4 border-t border-slate-200 dark:border-slate-800">
                  <Icon className="h-4 w-4 text-indigo-500 shrink-0 mt-0.5" />
                  <span className="text-xs sm:text-sm font-medium text-slate-800 dark:text-slate-200">
                    {row.after}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
