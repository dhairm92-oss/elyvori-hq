import { useEffect, useState } from 'react';
import { Building2, Globe, Smartphone, Users, Megaphone } from 'lucide-react';
import { Language } from '../types';

interface SocialProofSectionProps {
  lang: Language;
}

interface ActivityItem {
  businessName: string;
  serviceLabel: string;
  createdAt: string;
}

const serviceIcons: Record<string, typeof Globe> = {
  Website: Globe,
  'Mobile App': Smartphone,
  'Recruitment CRM': Users,
  'Marketing Campaign': Megaphone,
};

// Real social proof - actual business names that recently had a
// successful project built, shown the way established companies do it:
// the business/project name, never the person's name or contact info.
// Stays silent (renders nothing) if there's no real activity yet or the
// request fails, since a fabricated example would undermine the exact
// trust this section exists to build.
export function SocialProofSection({ lang }: SocialProofSectionProps) {
  const [items, setItems] = useState<ActivityItem[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch('https://elyvori-api.onrender.com/public/recent-activity')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!cancelled && Array.isArray(data) && data.length > 0) setItems(data);
      })
      .catch(() => {
        /* Silently ignore - section won't render. */
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (!items) return null;

  const timeAgo = (dateStr: string): string => {
    const diffMs = Date.now() - new Date(dateStr).getTime();
    const diffHours = Math.floor(diffMs / 3600000);
    if (diffHours < 1) return lang === 'en' ? 'Just now' : 'الآن';
    if (diffHours < 24) return lang === 'en' ? `${diffHours}h ago` : `منذ ${diffHours} ساعة`;
    const diffDays = Math.floor(diffHours / 24);
    return lang === 'en' ? `${diffDays}d ago` : `منذ ${diffDays} يوم`;
  };

  return (
    <section className="relative py-16 sm:py-20 border-t border-slate-200/80 dark:border-slate-800/80">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-indigo-500/20 bg-indigo-500/10 px-3 py-1 text-xs font-semibold text-indigo-600 dark:text-indigo-400 mb-3">
            <Building2 className="h-3 w-3" />
            <span>{lang === 'en' ? 'Real Activity' : 'نشاط حقيقي'}</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            {lang === 'en' ? 'Businesses Recently Built With Elyvori' : 'أعمال بُنيت مؤخراً مع إليفوري'}
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((item, idx) => {
            const Icon = serviceIcons[item.serviceLabel] || Globe;
            return (
              <div
                key={idx}
                className="flex items-center gap-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/50 px-4 py-3.5"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-indigo-600/10 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400">
                  <Icon className="h-4.5 w-4.5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-bold text-slate-900 dark:text-white truncate">
                    {item.businessName}
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">
                    {item.serviceLabel} &middot; {timeAgo(item.createdAt)}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
