// Elyvori guided tours + helper (same script as the static pages): see public/ely-tour.js
if (typeof document !== 'undefined' && !document.querySelector('script[src="/ely-tour.js"]')) {
  const s = document.createElement('script');
  s.src = '/ely-tour.js';
  s.defer = true;
  document.head.appendChild(s);
}
export {};
