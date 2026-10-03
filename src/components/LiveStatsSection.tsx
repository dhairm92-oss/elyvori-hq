import { useEffect, useState } from 'react';
import { Rocket, Zap, ShieldCheck } from 'lucide-react';
import { Language } from '../types';

interface LiveStatsSectionProps {
  lang: Language;
}

interface StatsData {
  totalProjects: number;
  avgBuildMinutes: number | null;
}

// A "live stats bar" placed right under the Hero section - the same
// pattern companies like Vercel and Stripe use to show real activity
// (deployments shipped, payments processed) rather than a generic
// marketing claim. Pulls real numbers from /public/stats (backed by
// actual completed builds in the database), and quietly shows nothing
// rather than a jarring "0" if the backend has no data yet or is
// unreachable - a real product should never display a fake number.
export function LiveStatsSection({ lang }: LiveStatsSectionProps) {
  const [stats, setStats] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    fetch('https://elyvori-api.onrender.com/public/stats')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!cancelled && data) setStats(data);
      })
      .catch(() => {
        /* Silently ignore - the section just won't render below. */
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // Nothing meaningful to show yet (no completed builds recorded, or
  // the request failed) - stay silent instead of showing zeros.
  if (loading || !stats || stats.totalProjects === 0) return null;

  const items = [
    {
      icon: Rocket,
      value: `${stats.totalProjects}`,
      label: lang === 'en' ? 'Real websites & apps built' : 'موقع وتطبيق حقيقي تم بناؤه',
    },
    ...(stats.avgBuildMinutes
      ? [
          {
            icon: Zap,
            value: lang === 'en' ? `${stats.avgBuildMinutes} min` : `${stats.avgBuildMinutes} دقيقة`,
            label: lang === 'en' ? 'Average build time' : 'متوسط وقت البناء',
          },
        ]
      : []),
    {
      icon: ShieldCheck,
      value: '100%',
      label: lang === 'en' ? 'Real backend & database' : 'بخادم وقاعدة بيانات حقيقية',
    },
  ];

  return (
    <section className="relative py-8 sm:py-10 bg-slate-900 dark:bg-slate-950 border-y border-slate-800">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-4 divide-y sm:divide-y-0 sm:divide-x divide-slate-800">
          {items.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div key={idx} className="flex items-center gap-4 pt-6 sm:pt-0 first:pt-0 sm:px-6 first:sm:pl-0">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-500/15 text-indigo-400">
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                    {item.value}
                  </div>
                  <div className="text-xs sm:text-sm text-slate-400 mt-0.5">{item.label}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
