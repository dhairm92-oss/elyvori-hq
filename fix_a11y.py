# -*- coding: utf-8 -*-
"""
Elyvori - names for the 2 icon-only header buttons (screen readers / SEO audits)
Revert with: git checkout .
"""
import os, re, sys
try:
    sys.stdout.reconfigure(encoding="utf-8")
except Exception:
    pass

p = os.path.join(os.path.dirname(os.path.abspath(__file__)), "src", "components", "Navbar.tsx")
with open(p, "r", encoding="utf-8") as f:
    raw = f.read()
crlf = "\r\n" in raw
s = raw.replace("\r\n", "\n")

TARGETS = [
    ('className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-slate-200 hover:bg-white/10 transition-all"',
     'aria-label="Toggle day / night mode" title="Day / Night"', "theme button"),
    ('className="lg:hidden flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-slate-200 hover:bg-white/10 transition-all"',
     'aria-label="Menu" title="Menu"', "menu button"),
]
done = []
for cls, attrs, name in TARGETS:
    i = s.find(cls)
    if i < 0:
        print(f"  ! {name}: not found")
        continue
    b = s.rfind("<button", 0, i)
    if b < 0 or "</button>" in s[b:i] or "<button" in s[b + 7:i]:
        print(f"  ! {name}: button tag not found")
        continue
    if "aria-label" in s[b:i]:
        print(f"  = {name}: already has a label")
        continue
    s = s[:b] + "<button " + attrs + s[b + len("<button"):]
    done.append(name)

if done:
    if crlf:
        s = s.replace("\n", "\r\n")
    with open(p, "w", encoding="utf-8", newline="") as f:
        f.write(s)
    for d in done:
        print(f"  + Navbar.tsx: aria-label added to {d}")
