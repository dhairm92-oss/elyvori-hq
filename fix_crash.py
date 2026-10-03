# -*- coding: utf-8 -*-
"""
Elyvori - fix white screen: "ParticleBackground is not defined"
Removes leftover JSX usages of deleted background components
(ParticleBackground, Elyvori3DBackground) that are no longer imported.
Revert with: git checkout .
"""
import os, re, sys

try:
    sys.stdout.reconfigure(encoding="utf-8")
except Exception:
    pass

ROOT = os.path.dirname(os.path.abspath(__file__))
SRC = os.path.join(ROOT, "src")
NAMES = ["ParticleBackground", "Elyvori3DBackground"]
changed = []

for dp, _, files in os.walk(SRC):
    for fn in files:
        if not fn.endswith((".tsx", ".ts", ".jsx", ".js")):
            continue
        if os.path.splitext(fn)[0] in NAMES:
            continue
        p = os.path.join(dp, fn)
        with open(p, "r", encoding="utf-8") as f:
            s = f.read()
        o = s
        for name in NAMES:
            if ("<" + name) not in s:
                continue
            if re.search(r"import[^;]*\b" + name + r"\b", s):
                continue  # still imported -> fine
            el = r"<" + name + r"\b[^<>]*?/>"
            # {cond && <X />}  or  {cond ? <X /> : null}
            s = re.sub(r"\{[^{}<>]*&&\s*" + el + r"\s*\}", "", s, flags=re.S)
            s = re.sub(r"\{[^{}<>]*\?\s*" + el + r"\s*:\s*null\s*\}", "", s, flags=re.S)
            # wrapped by our hidden md:contents div
            s = re.sub(r'<div className="hidden md:contents">\s*' + el + r"\s*</div>", "", s, flags=re.S)
            # plain <X />
            s = re.sub(r"[ \t]*" + el + r"[ \t]*\r?\n?", "", s, flags=re.S)
            # <X>...</X>
            s = re.sub(r"<" + name + r"\b[^>]*>.*?</" + name + r">", "", s, flags=re.S)
            if ("<" + name) in s:
                print(f"  ! {os.path.relpath(p, ROOT)}: <{name}> still present - send this file to Claude")
        if s != o:
            with open(p, "w", encoding="utf-8", newline="") as f:
                f.write(s)
            changed.append(os.path.relpath(p, ROOT))

print("\n========== ELYVORI CRASH FIX ==========")
print("Fixed files:" if changed else "Nothing found to fix.")
for c in changed:
    print("  +", c)
print("=======================================\n")
