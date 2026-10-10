/* Elyvori first-party visit counter: one small hit per page view to the Elyvori API.
   No cookies, no third parties, no IP stored. Respects "Do Not Track". */
(function () {
  if (window.__elyTrack) return; window.__elyTrack = 1;
  var API = 'https://elyvori-api.onrender.com';
  try { if (navigator.doNotTrack === '1' || window.doNotTrack === '1' || navigator.globalPrivacyControl) return; } catch (e) {}
  if (/^(localhost|127\.|\[::1\])/.test(location.hostname)) return;
  function id() { var a = new Uint8Array(12); (window.crypto || {}).getRandomValues ? crypto.getRandomValues(a) : a.forEach(function (_, i) { a[i] = Math.random() * 256; }); return Array.prototype.map.call(a, function (b) { return ('0' + b.toString(16)).slice(-2); }).join(''); }
  function keep(store, k) { try { var v = store.getItem(k); if (!v) { v = id(); store.setItem(k, v); } return v; } catch (e) { return id(); } }
  var vid = keep(localStorage, 'ely_vid'), sid = keep(sessionStorage, 'ely_sid'), last = '', first = true;
  function send() {
    var path = location.pathname || '/';
    if (path === last) return; last = path;
    var ref = '';
    try { if (first && document.referrer && new URL(document.referrer).hostname !== location.hostname) ref = document.referrer; } catch (e) {}
    first = false;
    var h = { 'Content-Type': 'application/json' }, tok = null;
    try { tok = localStorage.getItem('elyvori_token'); } catch (e) {}
    if (tok && tok.split('.').length === 3) h.Authorization = 'Bearer ' + tok;
    var tz = ''; try { tz = Intl.DateTimeFormat().resolvedOptions().timeZone || ''; } catch (e) {}
    try {
      fetch(API + '/analytics/hit', { method: 'POST', headers: h, body: JSON.stringify({
        path: path, ref: ref, vid: vid, sid: sid, lang: (document.documentElement.lang || navigator.language || '').slice(0, 12),
        tz: tz, screen: (screen.width || 0) + 'x' + (screen.height || 0)
      }) }).catch(function () {});
    } catch (e) {}
  }
  function soon() { setTimeout(send, 300); }
  ['pushState', 'replaceState'].forEach(function (m) { var o = history[m]; history[m] = function () { var r = o.apply(this, arguments); soon(); return r; }; });
  window.addEventListener('popstate', soon);
  if (document.readyState === 'complete') soon(); else window.addEventListener('load', soon);
})();
