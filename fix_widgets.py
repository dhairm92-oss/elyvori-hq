# -*- coding: utf-8 -*-
"""
Elyvori - floating widgets on mobile (Day 13)
- VoiceWidget (AI button): only ONE instance renders (it was mounted twice in App.tsx)
- Mobile: AI button bottom-right, Elyvori badge bottom-left, same height, safe-area aware
- Desktop: unchanged (badge stays at the side, 1/3 from top)
- Badge popup opens upward on mobile so it stays on screen
- Footer gets bottom padding on mobile so the buttons never cover content
Revert with: git checkout .
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


def load(p):
    with open(p, "r", encoding="utf-8") as f:
        s = f.read()
    crlf = "\r\n" in s
    return s.replace("\r\n", "\n"), crlf


def save(p, s, crlf):
    if crlf:
        s = s.replace("\n", "\r\n")
    with open(p, "w", encoding="utf-8", newline="") as f:
        f.write(s)


def rep(s, old, new, label, is_regex=False):
    if is_regex:
        s2, n = re.subn(old, new, s, count=1, flags=re.S)
    else:
        n = 1 if old in s else 0
        s2 = s.replace(old, new, 1)
    if n:
        changes.append(label)
    else:
        warnings.append("not found: " + label)
    return s2


# =============================================================== VoiceWidget
vw = os.path.join(COMP, "VoiceWidget.tsx")
if os.path.exists(vw):
    s, crlf = load(vw)
    if "ELV_RELEASE" not in s:
        s = rep(
            s,
            "const API = 'https://elyvori-api.onrender.com';\n",
            "const API = 'https://elyvori-api.onrender.com';\n\n"
            "// Only one widget renders, even if <VoiceWidget/> is mounted more than once\n"
            "let elvOwner: object | null = null;\n"
            "const ELV_RELEASE = 'elv-widget-release';\n",
            "VoiceWidget: single-instance guard (module)",
        )
        s = rep(
            s,
            "  const recognitionRef = useRef<any>(null);\n",
            "  const recognitionRef = useRef<any>(null);\n"
            "  const ownerKey = useRef({});\n"
            "  const [isOwner, setIsOwner] = useState(false);\n\n"
            "  useEffect(() => {\n"
            "    const claim = () => {\n"
            "      if (!elvOwner) { elvOwner = ownerKey.current; setIsOwner(true); }\n"
            "    };\n"
            "    claim();\n"
            "    window.addEventListener(ELV_RELEASE, claim);\n"
            "    return () => {\n"
            "      window.removeEventListener(ELV_RELEASE, claim);\n"
            "      if (elvOwner === ownerKey.current) {\n"
            "        elvOwner = null;\n"
            "        window.dispatchEvent(new Event(ELV_RELEASE));\n"
            "      }\n"
            "    };\n"
            "  }, []);\n",
            "VoiceWidget: single-instance guard (hooks)",
        )
        s = rep(
            s,
            r"\n  return \(\n    <>\n      <style>",
            "\n  if (!isOwner) return null;\n\n  return (\n    <>\n      <style>",
            "VoiceWidget: render only the owner",
            is_regex=True,
        )
    # mobile position: bottom-right, safe-area aware, aligned with the badge
    s = rep(
        s,
        r"@media\(max-width:480px\)\{\.elv-btn-wrap\{bottom:20px;right:20px\}\.elv-btn\{width:56px;height:56px\}\.elv-chat\{bottom:88px;right:16px;",
        "@media(max-width:767px){.elv-btn-wrap{bottom:calc(20px + env(safe-area-inset-bottom));right:16px}"
        ".elv-btn{width:56px;height:56px;animation:elvPulse 2.4s ease-in-out infinite}"
        ".elv-chat{bottom:calc(88px + env(safe-area-inset-bottom));right:16px;height:min(560px,calc(100dvh - 130px));",
        "VoiceWidget: mobile position + calmer motion",
        is_regex=True,
    )
    save(vw, s, crlf)
else:
    warnings.append("VoiceWidget.tsx not found")

# ========================================================== FloatingSideLogo
fl = os.path.join(COMP, "FloatingSideLogo.tsx")
if os.path.exists(fl):
    s, crlf = load(fl)
    # position: mobile bottom-left, desktop unchanged
    s = rep(
        s,
        r"className=\{`fixed top-1/3 z-50 transition-all duration-300 pointer-events-auto \$\{\s*isRtl \? 'left-3 sm:left-6' : 'right-3 sm:right-6'\s*\}`\}",
        "className={`fixed z-50 transition-all duration-300 pointer-events-auto left-4 bottom-[calc(20px+env(safe-area-inset-bottom))] md:bottom-auto md:top-1/3 ${\n"
        "        isRtl ? 'md:left-6' : 'md:left-auto md:right-6'\n"
        "      }`}",
        "FloatingSideLogo: mobile bottom-left",
        is_regex=True,
    )
    # no bounce on mobile (keeps it aligned with the AI button); desktop keeps it
    s = rep(
        s,
        "shadow-lg shadow-cyan-500/40 animate-[bounce_3s_ease-in-out_infinite]",
        "shadow-lg shadow-cyan-500/40 md:animate-[bounce_3s_ease-in-out_infinite]",
        "FloatingSideLogo: bounce only on desktop",
    )
    # popup: opens upward on mobile, downward on desktop
    s = rep(
        s,
        r"className=\{`absolute top-full mt-3 w-64 p-4 rounded-2xl border backdrop-blur-2xl shadow-2xl transition-all animate-in fade-in zoom-in-95 \$\{\s*isRtl \? 'left-0' : 'right-0'\s*\}",
        "className={`absolute bottom-full mb-3 md:bottom-auto md:mb-0 md:top-full md:mt-3 w-64 max-w-[calc(100vw-32px)] p-4 rounded-2xl border backdrop-blur-2xl shadow-2xl transition-all animate-in fade-in zoom-in-95 left-0 ${\n"
        "              isRtl ? '' : 'md:left-auto md:right-0'\n"
        "            }",
        "FloatingSideLogo: popup opens upward on mobile",
        is_regex=True,
    )
    save(fl, s, crlf)
else:
    warnings.append("FloatingSideLogo.tsx not found")

# ================================================= App.tsx: show badge again
app = os.path.join(SRC, "App.tsx")
if os.path.exists(app):
    s, crlf = load(app)
    s2 = re.sub(r'<div className="hidden md:contents">\s*(<FloatingSideLogo\b[^<>]*?/>)\s*</div>', r"\1", s, flags=re.S)
    if s2 != s:
        changes.append("App.tsx: FloatingSideLogo visible on mobile again")
        save(app, s2, crlf)
    n = len(re.findall(r"<VoiceWidget\b", s2))
    if n > 1:
        print(f"  note: <VoiceWidget/> is used {n}x in App.tsx - now harmless (only one renders)")

# ============================================ index.css: footer breathing room
css = os.path.join(SRC, "index.css")
MARK = "/* ELYVORI-WIDGETS-SPACE */"
if os.path.exists(css):
    s, crlf = load(css)
    if MARK not in s:
        s = s.rstrip() + "\n\n" + MARK + "\n@media (max-width: 767px) {\n  footer { padding-bottom: calc(96px + env(safe-area-inset-bottom)) !important; }\n}\n"
        save(css, s, crlf)
        changes.append("index.css: footer space for floating buttons")

print("\n============ ELYVORI WIDGETS FIX ============")
print("CHANGES:")
for c in changes or ["(none)"]:
    print("  +", c)
if warnings:
    print("WARNINGS:")
    for w in warnings:
        print("  !", w)
print("=============================================\n")
