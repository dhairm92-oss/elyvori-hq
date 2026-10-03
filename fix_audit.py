# -*- coding: utf-8 -*-
"""
Elyvori - fixes from the full site audit (Day 13)
 1) CRITICAL: Tailwind `dark:` classes followed the PHONE's system setting, not the
    site's day/night button. On a phone in light system mode, parts of the site
    (recent work, testimonials, footer headings...) showed dark text on a dark page.
    -> @custom-variant dark now follows html.dark
 2) Readability: faded grey text brighter in night mode, cyan/green deeper in day mode
 3) Mobile: tiny 8-10px labels bumped up, bigger tap areas (header + footer links)
 4) Mobile menu: links aligned to the right in Arabic (text-left -> text-start)
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


# ------------------------------------------------------------- index.css
css_p = os.path.join(SRC, "index.css")
c, crlf = load(css_p)
o = c

# 1) dark variant follows the site's theme class
if re.search(r"@(custom-)?variant\s+dark\b", c):
    warnings.append("index.css: a dark variant is already defined - left as is")
else:
    m = re.search(r"""@import\s+["']tailwindcss["'][^;\n]*;\n?""", c)
    if m:
        c = c[: m.end()] + ("\n" if not m.group(0).endswith("\n") else "") + \
            "@custom-variant dark (&:where(.dark, .dark *));\n" + c[m.end():]
        changes.append("index.css: dark: classes now follow the site's day/night button (CRITICAL)")
    else:
        warnings.append("index.css: @import \"tailwindcss\" not found - send the top of index.css to Claude")

# 2a) deeper accents in day mode (inside the light-theme block)
c = c.replace("color: #0891B2;", "color: #0E7490;").replace("color: #0891B2 !important;", "color: #0E7490 !important;")
c = c.replace("color: #059669;", "color: #047857;")

MARK_S, MARK_E = "/* ===== ELYVORI-AUDIT-POLISH ===== */", "/* ===== /ELYVORI-AUDIT-POLISH ===== */"
POLISH = MARK_S + r"""
/* night mode: faded grey text -> readable */
html.dark :is(.text-slate-600, .text-slate-700, .text-gray-600, .text-gray-700):not([class*="dark:text-"]) { color: #94A3B8; }
html.dark :is(.text-slate-500, .text-gray-500):not([class*="dark:text-"]) { color: #8B9BB4; }
html.dark [class*="dark:text-slate-500"] { color: #8B9BB4; }
html.dark :is([style^="color: rgb(124, 58, 237)"], [style*="; color: rgb(124, 58, 237)"]) { color: #A78BFA !important; }

/* day mode: small grey / green text a bit deeper */
html.light :is(.text-slate-500, .text-gray-500) { color: #475569; }
html.light :is([style^="color: rgb(16, 185, 129)"], [style*="; color: rgb(16, 185, 129)"]) { color: #047857 !important; }
html.light :is([class*="text-emerald-500"], [class*="text-emerald-600"]) { color: #047857; }

@media (max-width: 767px) {
  /* tiny labels */
  .text-\[10px\] { font-size: 11px; }
  .text-\[9px\], .text-\[8px\] { font-size: 10px; }

  /* comfortable tap areas */
  header button { min-height: 36px; min-width: 36px; }
  footer :is(a, button) { display: inline-flex; align-items: center; min-height: 32px; }
}
""" + MARK_E + "\n"

if MARK_S in c:
    c = re.sub(re.escape(MARK_S) + r".*?" + re.escape(MARK_E) + r"\n?", lambda _m: POLISH, c, flags=re.S)
else:
    c = c.rstrip() + "\n\n" + POLISH
if c != o:
    save(css_p, c, crlf)
    changes.append("index.css: readability + mobile polish")

# ---------------------------------------------- Navbar: RTL menu alignment
nav = os.path.join(SRC, "components", "Navbar.tsx")
if os.path.exists(nav):
    s, crlf = load(nav)
    s2, n = re.subn(r"(?<![\w:-])text-left(?![\w-])", "text-start", s)
    if n:
        save(nav, s2, crlf)
        changes.append(f"Navbar.tsx: {n}x text-left -> text-start (Arabic menu aligns right)")
else:
    warnings.append("Navbar.tsx not found")

print("\n============ ELYVORI AUDIT FIXES ============")
for x in changes or ["(nothing changed)"]:
    print("  +", x)
for w in warnings:
    print("  !", w)
print("=============================================\n")
