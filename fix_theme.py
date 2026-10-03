# -*- coding: utf-8 -*-
"""
Elyvori - Day/Night theme that changes the WHOLE site (mobile + laptop)
Problem: App.tsx always did document.documentElement.classList.add('dark'),
so in "light" mode only the icon changed and most of the site stayed dark.
Fix:
 1) App.tsx: toggle html.dark / html.light with the real theme + smooth fade
 2) index.html: apply saved theme before React loads (no flash) + theme-color
 3) index.css: polished light palette for every section (cards, pricing, header...)
Safe to run more than once. Revert with: git checkout .
"""
import os, re, sys
try:
    sys.stdout.reconfigure(encoding="utf-8")
except Exception:
    pass

ROOT = os.path.dirname(os.path.abspath(__file__))
SRC = os.path.join(ROOT, "src")
changes, warnings = [], []

def load(p):
    with open(p, "r", encoding="utf-8") as f:
        s = f.read()
    return s.replace("\r\n", "\n"), ("\r\n" in s)

def save(p, s, crlf):
    if crlf:
        s = s.replace("\n", "\r\n")
    with open(p, "w", encoding="utf-8", newline="") as f:
        f.write(s)

# ------------------------------------------------------------- 1) App.tsx
app = os.path.join(SRC, "App.tsx")
s, crlf = load(app)
if "ELYVORI-THEME-SYNC" in s:
    changes.append("App.tsx: already patched")
else:
    m = re.search(r"localStorage\.setItem\(\s*['\"`]elyvori_theme['\"`]\s*,\s*([A-Za-z_$][\w$]*)\s*\)", s)
    var = m.group(1) if m else None
    pat = re.compile(r"document\.documentElement\.classList\.add\(\s*['\"`]dark['\"`]\s*\)\s*;?")
    if var and pat.search(s):
        block = (
            "/* ELYVORI-THEME-SYNC */ {\n"
            "      const root = document.documentElement;\n"
            f"      const isDarkTheme = {var} === 'dark';\n"
            "      root.classList.add('theme-anim');\n"
            "      root.classList.toggle('dark', isDarkTheme);\n"
            "      root.classList.toggle('light', !isDarkTheme);\n"
            "      root.style.colorScheme = isDarkTheme ? 'dark' : 'light';\n"
            "      document.querySelector('meta[name=\"theme-color\"]')?.setAttribute('content', isDarkTheme ? '#080A12' : '#F6F8FC');\n"
            "      window.setTimeout(() => root.classList.remove('theme-anim'), 450);\n"
            "    }"
        )
        s = pat.sub(lambda _m: block, s, count=1)
        save(app, s, crlf)
        changes.append(f"App.tsx: html.dark/light now follows theme (variable: {var})")
    else:
        warnings.append("App.tsx: could not find classList.add('dark') + elyvori_theme - send App.tsx to Claude")

# ----------------------------------------------------------- 2) index.html
html_p = os.path.join(ROOT, "index.html")
h, crlf = load(html_p)
if "ELYVORI-THEME-BOOT" not in h:
    boot = (
        '\n    <!-- ELYVORI-THEME-BOOT -->\n'
        '    <meta name="theme-color" content="#080A12" />\n'
        "    <script>(function(){try{var t=localStorage.getItem('elyvori_theme');var d=t!=='light';"
        "var r=document.documentElement;r.classList.toggle('dark',d);r.classList.toggle('light',!d);"
        "r.style.colorScheme=d?'dark':'light';var m=document.querySelector('meta[name=\"theme-color\"]');"
        "if(m)m.setAttribute('content',d?'#080A12':'#F6F8FC');}catch(e){}})();</script>\n"
    )
    h = h.replace("</head>", boot + "  </head>", 1)
    save(html_p, h, crlf)
    changes.append("index.html: theme applied before load (no flash) + theme-color")

# ------------------------------------------------------------ 3) index.css
CSS = r"""/* ===== ELYVORI-LIGHT-THEME ===== */
html.light { color-scheme: light; }
html.light body { background: #F6F8FC; color: #0F172A; }

/* dark surfaces -> light surfaces (overlays/backdrops excluded) */
html.light :is([class*="bg-slate-950"],[class*="bg-slate-900"],[class*="bg-slate-800"],[class*="bg-gray-950"],[class*="bg-gray-900"],[class*="bg-zinc-950"],[class*="bg-zinc-900"],[class*="bg-neutral-900"],[class*="bg-[#0"],[class*="bg-black/"]):not([class*="inset-0"]):not(.elv-keep-dark) {
  background-color: rgba(255, 255, 255, 0.92);
}
html.light :is([class*="bg-slate-900"],[class*="bg-slate-950"],[class*="bg-[#0"])[class*="rounded"]:not([class*="inset-0"]) {
  box-shadow: 0 1px 2px rgba(15, 23, 42, 0.04), 0 10px 30px -12px rgba(15, 23, 42, 0.12);
}
html.light header {
  background-color: rgba(255, 255, 255, 0.85);
  border-color: rgba(15, 23, 42, 0.08);
  box-shadow: 0 1px 0 rgba(15, 23, 42, 0.04);
}

/* faint white overlays -> faint dark overlays */
html.light [class*="bg-white/"]:not([class*="bg-white/6"]):not([class*="bg-white/7"]):not([class*="bg-white/8"]):not([class*="bg-white/9"]) {
  background-color: rgba(15, 23, 42, 0.04);
}
html.light [class*="hover:bg-white/"]:hover { background-color: rgba(15, 23, 42, 0.06); }

/* borders */
html.light :is([class*="border-white/"],[class*="border-slate-800"],[class*="border-slate-700"],[class*="border-gray-800"],[class*="border-zinc-800"]) {
  border-color: rgba(15, 23, 42, 0.10);
}

/* text */
html.light :is(.text-white,.text-slate-50,.text-slate-100,.text-gray-50,.text-gray-100) { color: #0F172A; }
html.light :is(.text-slate-200,.text-gray-200) { color: #1E293B; }
html.light :is(.text-slate-300,.text-gray-300) { color: #475569; }
html.light :is(.text-slate-400,.text-gray-400) { color: #64748B; }
html.light :is([class*="hover:text-white"]):hover { color: #0F172A; }

/* bright accents -> deeper accents (readable on white) */
html.light :is([class*="text-cyan-200"],[class*="text-cyan-300"],[class*="text-cyan-400"]) { color: #0891B2; }
html.light :is([class*="text-emerald-300"],[class*="text-emerald-400"]) { color: #059669; }
html.light :is([class*="text-indigo-300"],[class*="text-indigo-400"]) { color: #4F46E5; }
html.light :is([class*="text-violet-300"],[class*="text-violet-400"],[class*="text-purple-300"],[class*="text-purple-400"]) { color: #7C3AED; }
html.light :is([class*="text-fuchsia-300"],[class*="text-fuchsia-400"],[class*="text-pink-300"],[class*="text-pink-400"]) { color: #C026D3; }
html.light :is([class*="text-amber-300"],[class*="text-amber-400"],[class*="text-yellow-300"],[class*="text-yellow-400"]) { color: #B45309; }
html.light :is([class*="text-rose-300"],[class*="text-rose-400"],[class*="text-red-300"],[class*="text-red-400"]) { color: #E11D48; }
html.light :is([class*="text-sky-300"],[class*="text-sky-400"],[class*="text-blue-300"],[class*="text-blue-400"]) { color: #2563EB; }

/* inline-styled dark cards/sections (Services, Pricing, Custom product) */
html.light :is([style*="rgba(15, 17, 26"],[style*="rgba(8, 10, 18"],[style*="rgba(3, 5, 18"],[style*="rgba(4, 6, 20"]):not(.elv-chat):not(.elv-chat *):not(.elv-btn):not(.elv-btn *) {
  background: rgba(255, 255, 255, 0.96) !important;
  box-shadow: 0 1px 2px rgba(15, 23, 42, 0.04), 0 12px 32px -14px rgba(15, 23, 42, 0.18) !important;
}
html.light [style*="rgb(2, 4, 8)"]:not(.elv-chat *) {
  background: linear-gradient(180deg, #F6F8FC 0%, #EEF2FF 50%, #F6F8FC 100%) !important;
}
html.light [style*="background: rgba(255, 255, 255, 0.0"]:not(.elv-chat *) {
  background: #FFFFFF !important;
  border-color: rgba(15, 23, 42, 0.08) !important;
  box-shadow: 0 12px 32px -14px rgba(15, 23, 42, 0.15) !important;
}
html.light [style*="border: 1px solid rgba(255, 255, 255"]:not(.elv-chat *) { border-color: rgba(15, 23, 42, 0.10) !important; }

/* inline text colors */
html.light [class*="text-[#00E5FF]"], html.light [class*="text-[#00e5ff]"] { color: #0891B2; }
html.light :is([style^="color: rgb(0, 229, 255)"],[style*="; color: rgb(0, 229, 255)"]):not(.elv-chat *):not(.elv-btn *) { color: #0891B2 !important; }
html.light :is([style^="color: rgba(255, 255, 255"],[style*="; color: rgba(255, 255, 255"]):not(.elv-chat *):not(.elv-btn *) { color: #475569 !important; }
html.light :is([style^="color: rgb(255, 255, 255)"],[style*="; color: rgb(255, 255, 255)"],[style^="color: white"],[style*="; color: white"]):not([style*="gradient"]):not(.elv-chat *):not(.elv-btn *) { color: #0F172A !important; }
html.light :is([style^="color: rgb(148, 163, 184)"],[style*="; color: rgb(148, 163, 184)"]) { color: #64748B !important; }
html.light :is([style^="color: rgb(245, 158, 11)"],[style*="; color: rgb(245, 158, 11)"],[style^="color: rgb(255, 165, 0)"],[style*="; color: rgb(255, 165, 0)"]) { color: #B45309 !important; }

/* keep original colors on colored buttons/badges */
html.light :is([class^="bg-gradient"],[class*=" bg-gradient"],[class^="bg-indigo-5"],[class*=" bg-indigo-5"],[class^="bg-indigo-6"],[class*=" bg-indigo-6"],[class^="bg-indigo-7"],[class*=" bg-indigo-7"],[class^="bg-violet-5"],[class*=" bg-violet-5"],[class^="bg-violet-6"],[class*=" bg-violet-6"],[class^="bg-purple-5"],[class*=" bg-purple-5"],[class^="bg-purple-6"],[class*=" bg-purple-6"],[class^="bg-cyan-5"],[class*=" bg-cyan-5"],[class^="bg-cyan-6"],[class*=" bg-cyan-6"],[class^="bg-blue-5"],[class*=" bg-blue-5"],[class^="bg-blue-6"],[class*=" bg-blue-6"],[class^="bg-emerald-5"],[class*=" bg-emerald-5"],[class^="bg-emerald-6"],[class*=" bg-emerald-6"],[class^="bg-rose-5"],[class*=" bg-rose-5"],[class^="bg-rose-6"],[class*=" bg-rose-6"],[class^="bg-red-5"],[class*=" bg-red-5"],[class^="bg-red-6"],[class*=" bg-red-6"],[class^="bg-fuchsia-5"],[class*=" bg-fuchsia-5"],[class^="bg-fuchsia-6"],[class*=" bg-fuchsia-6"],[class^="bg-sky-5"],[class*=" bg-sky-5"],[class^="bg-sky-6"],[class*=" bg-sky-6"],[class^="bg-teal-5"],[class*=" bg-teal-5"],[class^="bg-teal-6"],[class*=" bg-teal-6"]), html.light :is([class^="bg-gradient"],[class*=" bg-gradient"],[class^="bg-indigo-5"],[class*=" bg-indigo-5"],[class^="bg-indigo-6"],[class*=" bg-indigo-6"],[class^="bg-indigo-7"],[class*=" bg-indigo-7"],[class^="bg-violet-5"],[class*=" bg-violet-5"],[class^="bg-violet-6"],[class*=" bg-violet-6"],[class^="bg-purple-5"],[class*=" bg-purple-5"],[class^="bg-purple-6"],[class*=" bg-purple-6"],[class^="bg-cyan-5"],[class*=" bg-cyan-5"],[class^="bg-cyan-6"],[class*=" bg-cyan-6"],[class^="bg-blue-5"],[class*=" bg-blue-5"],[class^="bg-blue-6"],[class*=" bg-blue-6"],[class^="bg-emerald-5"],[class*=" bg-emerald-5"],[class^="bg-emerald-6"],[class*=" bg-emerald-6"],[class^="bg-rose-5"],[class*=" bg-rose-5"],[class^="bg-rose-6"],[class*=" bg-rose-6"],[class^="bg-red-5"],[class*=" bg-red-5"],[class^="bg-red-6"],[class*=" bg-red-6"],[class^="bg-fuchsia-5"],[class*=" bg-fuchsia-5"],[class^="bg-fuchsia-6"],[class*=" bg-fuchsia-6"],[class^="bg-sky-5"],[class*=" bg-sky-5"],[class^="bg-sky-6"],[class*=" bg-sky-6"],[class^="bg-teal-5"],[class*=" bg-teal-5"],[class^="bg-teal-6"],[class*=" bg-teal-6"]) * { color: revert-layer; }

/* smooth switch (class added for ~450ms while toggling) */
html.theme-anim, html.theme-anim *, html.theme-anim *::before, html.theme-anim *::after {
  transition: background-color .4s ease, color .4s ease, border-color .4s ease, box-shadow .4s ease !important;
}

/* theme toggle icon: little spin-in */
@keyframes elvThemeIcon { from { transform: rotate(-120deg) scale(0.4); opacity: 0; } to { transform: none; opacity: 1; } }
header svg:is(.lucide-sun, .lucide-moon) { animation: elvThemeIcon 0.5s cubic-bezier(0.34, 1.56, 0.64, 1); }
@media (prefers-reduced-motion: reduce) {
  header svg:is(.lucide-sun, .lucide-moon) { animation: none; }
  html.theme-anim, html.theme-anim * { transition: none !important; }
}
/* ===== /ELYVORI-LIGHT-THEME ===== */
"""
css_p = os.path.join(SRC, "index.css")
c, crlf = load(css_p)
START, END = "/* ===== ELYVORI-LIGHT-THEME ===== */", "/* ===== /ELYVORI-LIGHT-THEME ===== */"
if START in c:
    c = re.sub(re.escape(START) + r".*?" + re.escape(END) + r"\n?", lambda _m: CSS, c, flags=re.S)
else:
    c = c.rstrip() + "\n\n" + CSS
save(css_p, c, crlf)
changes.append("index.css: full light theme palette")

print("\n============ ELYVORI DAY/NIGHT FIX ============")
for x in changes:
    print("  +", x)
for w in warnings:
    print("  !", w)
print("===============================================\n")
