# -*- coding: utf-8 -*-
"""
Elyvori - Mobile fix (Day 13)
- Cairo font (Google Fonts) + correct viewport
- No horizontal scroll on any phone
- Brighter, clearer hero text colors
- Hide FloatingSideLogo + Hero3DVisuals on mobile (they cover the text)
- Better Arabic line-height on mobile
- Prints a diagnostics report for the next round of fixes
Safe to run more than once (uses markers). Revert anytime with: git checkout .
"""
import os, re, sys

try:
    sys.stdout.reconfigure(encoding="utf-8")
except Exception:
    pass

ROOT = os.path.dirname(os.path.abspath(__file__))
SRC = os.path.join(ROOT, "src")
COMP = os.path.join(SRC, "components")
changes, warnings = [], []


def rd(p):
    with open(p, "r", encoding="utf-8") as f:
        return f.read()


def wr(p, s):
    with open(p, "w", encoding="utf-8", newline="") as f:
        f.write(s)


def rel(p):
    return os.path.relpath(p, ROOT)


# ---------------------------------------------------------------- 1) index.html
html_p = os.path.join(ROOT, "index.html")
if os.path.exists(html_p):
    h = rd(html_p)
    o = h
    vp = '<meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />'
    if re.search(r'<meta[^>]+name=["\']viewport["\'][^>]*>', h, re.I):
        h = re.sub(r'<meta[^>]+name=["\']viewport["\'][^>]*>', vp, h, count=1, flags=re.I)
    else:
        h = h.replace("<head>", "<head>\n    " + vp, 1)
    if "family=Cairo" not in h:
        fonts = (
            '\n    <!-- ELYVORI-FONT -->\n'
            '    <link rel="preconnect" href="https://fonts.googleapis.com" />\n'
            '    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />\n'
            '    <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;500;600;700;800&display=swap" rel="stylesheet" />\n'
        )
        h = h.replace("</head>", fonts + "  </head>", 1)
    if h != o:
        wr(html_p, h)
        changes.append("index.html: viewport + Cairo font")
else:
    warnings.append("index.html not found")

# ---------------------------------------------------------------- 2) index.css
css_p = os.path.join(SRC, "index.css")
CSS_MARK = "/* ===== ELYVORI-MOBILE-FIX ===== */"
CSS_BLOCK = CSS_MARK + r"""
:root {
  --ely-text-body: #DCE3EE;
  --ely-text-muted: #B4BFD0;
}

html, body, #root {
  max-width: 100%;
  overflow-x: clip;
}

body {
  font-family: 'Cairo', system-ui, -apple-system, 'Segoe UI', sans-serif;
  -webkit-text-size-adjust: 100%;
  text-rendering: optimizeLegibility;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

button, input, textarea, select {
  font-family: inherit;
}

img, video, canvas {
  max-width: 100%;
  height: auto;
}

@media (max-width: 767px) {
  section, header, nav, footer, main {
    max-width: 100vw;
  }

  h1 {
    line-height: 1.45 !important;
    letter-spacing: 0 !important;
    word-break: normal;
    overflow-wrap: anywhere;
  }

  h2, h3 {
    line-height: 1.5 !important;
    letter-spacing: 0 !important;
  }

  p {
    line-height: 1.9;
    letter-spacing: 0;
    overflow-wrap: anywhere;
  }
}
/* ===== /ELYVORI-MOBILE-FIX ===== */
"""
if os.path.exists(css_p):
    c = rd(css_p)
    if CSS_MARK in c:
        c = re.sub(re.escape(CSS_MARK) + r".*?/\* ===== /ELYVORI-MOBILE-FIX ===== \*/\n?", CSS_BLOCK, c, flags=re.S)
    else:
        c = c.rstrip() + "\n\n" + CSS_BLOCK
    wr(css_p, c)
    changes.append("src/index.css: mobile-fit + Cairo + Arabic line-height")
else:
    warnings.append("src/index.css not found")

# ------------------------------------- 3) hide decorative overlays on mobile
# wraps <Comp ... /> in <div className="hidden md:contents"> (no layout change on desktop)
HIDE_ON_MOBILE = ["FloatingSideLogo", "Hero3DVisuals"]
scan = [os.path.join(SRC, "App.tsx")] + [
    os.path.join(COMP, f) for f in os.listdir(COMP) if f.endswith(".tsx")
] if os.path.isdir(COMP) else [os.path.join(SRC, "App.tsx")]

for name in HIDE_ON_MOBILE:
    found = False
    for p in scan:
        if not os.path.exists(p) or os.path.basename(p) == name + ".tsx":
            continue
        s = rd(p)
        pat = re.compile(r'(?<!md:contents">)<' + name + r'(\s[^<>]*?)?/>', re.S)
        if pat.search(s):
            s2 = pat.sub(lambda m: '<div className="hidden md:contents">' + m.group(0) + "</div>", s)
            if s2 != s:
                wr(p, s2)
                changes.append(f"{rel(p)}: <{name}/> hidden on mobile")
            found = True
        elif ('md:contents"><' + name) in s:
            found = True
    if not found:
        warnings.append(f"<{name} /> usage not found (not hidden)")

# -------------------------------------------- 4) brighter hero text colors
hero_p = os.path.join(COMP, "Hero.tsx")
if os.path.exists(hero_p):
    s = rd(hero_p)
    n_total = 0
    out = []
    for line in s.split("\n"):
        if "dark:text-" in line:
            line, n = re.subn(r'dark:text-(gray|slate|zinc|neutral)-(400|500|600)\b', 'dark:text-slate-200', line)
        else:
            line, n = re.subn(r'(?<![\w:-])text-(gray|slate|zinc|neutral)-(400|500)\b', 'text-slate-200', line)
        n_total += n
        out.append(line)
    if n_total:
        wr(hero_p, "\n".join(out))
        changes.append(f"src/components/Hero.tsx: {n_total} muted text color(s) -> slate-200")
    else:
        warnings.append("Hero.tsx: no gray/slate-400/500 text classes found")
else:
    warnings.append("Hero.tsx not found")

# ---------------------------------------------------------- 5) diagnostics
DIAG_FILES = ["Navbar.tsx", "Logo.tsx", "QuantumHexLogo.tsx", "Hero.tsx", "Hero3DVisuals.tsx", "FloatingSideLogo.tsx"]
DIAG_PAT = re.compile(
    r'(w-\[|min-w-|h-\[|-right-|-left-|right-\[|left-\[|translate-x|whitespace-nowrap|text-\[\d|text-[6-9]xl|scale-|ELYVORI|fixed)'
)
diag = []
for f in DIAG_FILES:
    p = os.path.join(COMP, f)
    if not os.path.exists(p):
        continue
    for i, line in enumerate(rd(p).split("\n"), 1):
        if DIAG_PAT.search(line):
            diag.append(f"{f}:{i}: {line.strip()[:160]}")

print("\n================ ELYVORI MOBILE FIX ================")
print("CHANGES:")
for c in changes or ["(none)"]:
    print("  +", c)
if warnings:
    print("WARNINGS:")
    for w in warnings:
        print("  !", w)
print("\nDIAGNOSTICS (copy this to Claude):")
for d in diag[:120]:
    print("  ", d)
print("====================================================\n")
