// Elyvori visit counter (same script as the static pages): see public/ely-track.js
if (typeof document !== 'undefined' && !document.querySelector('script[src="/ely-track.js"]')) {
  const s = document.createElement('script');
  s.src = '/ely-track.js';
  s.defer = true;
  document.head.appendChild(s);
}
export {};
