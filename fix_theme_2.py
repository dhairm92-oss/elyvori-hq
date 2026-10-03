# -*- coding: utf-8 -*-
"""
Elyvori - remember the visitor's Day/Night choice after refresh.
App.tsx started every visit in 'dark', overwriting the saved choice.
Revert with: git checkout .
"""
import os, re, sys
try:
    sys.stdout.reconfigure(encoding="utf-8")
except Exception:
    pass

p = os.path.join(os.path.dirname(os.path.abspath(__file__)), "src", "App.tsx")
with open(p, "r", encoding="utf-8") as f:
    raw = f.read()
crlf = "\r\n" in raw
s = raw.replace("\r\n", "\n")

pat = re.compile(r"(const\s*\[\s*theme\s*,\s*setTheme\s*\]\s*=\s*(?:React\.)?useState(?:<[^>]*>)?\()\s*(['\"])dark\2\s*\)")
if "elyvori_theme') === 'light'" in s:
    print("  = already patched")
elif pat.search(s):
    s = pat.sub(lambda m: m.group(1) + "() => (localStorage.getItem('elyvori_theme') === 'light' ? 'light' : 'dark'))", s, count=1)
    if crlf:
        s = s.replace("\n", "\r\n")
    with open(p, "w", encoding="utf-8", newline="") as f:
        f.write(s)
    print("  + App.tsx: theme now remembered after refresh")
else:
    print("  ! pattern not found - send this line to Claude:")
    for i, line in enumerate(s.split("\n"), 1):
        if "[theme" in line:
            print(f"    App.tsx:{i}: {line.strip()}")
