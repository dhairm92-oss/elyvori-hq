# -*- coding: utf-8 -*-
"""
Elyvori - Mobile fix #2 (Day 13)
1) Hero glow circles: no wider than the phone screen
2) Hero title: Arabic-friendly spacing (no tracking-tight, bigger line-height)
3) Hero3DVisuals images: loading="lazy" (not downloaded on mobile) + WebP copies
4) Navbar: faded small text brighter in dark mode
Safe to run more than once. Revert with: git checkout .
"""
import os, re, sys, subprocess

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


# ------------------------------------------------------------ 1+2) Hero.tsx
hero = os.path.join(COMP, "Hero.tsx")
if os.path.exists(hero):
    s = rd(hero)
    o = s
    s = s.replace("w-[800px] h-[400px]", "w-[min(800px,100vw)] h-[400px]")
    s = s.replace("w-[500px] h-[500px]", "w-[min(500px,80vw)] h-[min(500px,80vw)]")
    s = s.replace(
        "text-4xl font-extrabold tracking-tight text-white sm:text-5xl md:text-6xl leading-[1.15]",
        "text-[2rem] font-extrabold tracking-normal text-white sm:text-5xl md:text-6xl leading-[1.45] md:leading-[1.25]",
    )
    if s != o:
        wr(hero, s)
        changes.append("Hero.tsx: glow circles fit phone + Arabic title spacing")
    else:
        warnings.append("Hero.tsx: nothing changed (already fixed or classes differ)")
else:
    warnings.append("Hero.tsx not found")

# ------------------------------------------------- 3) Hero3DVisuals images
h3d = os.path.join(COMP, "Hero3DVisuals.tsx")
if os.path.exists(h3d):
    s = rd(h3d)
    o = s

    def add_lazy(m):
        tag = m.group(0)
        if "loading=" not in tag:
            tag = tag.replace("<img", '<img loading="lazy" decoding="async"', 1)
        return tag

    s = re.sub(r"<img\b[^>]*?>", add_lazy, s, flags=re.S)

    # --- WebP conversion (optional, needs Pillow)
    jpg_refs = sorted(set(re.findall(r"""['"]([^'"]+\.(?:jpe?g|png))['"]""", s, re.I)))
    if jpg_refs:
        try:
            from PIL import Image  # noqa
        except ImportError:
            print("Installing Pillow for WebP conversion ...")
            subprocess.call([sys.executable, "-m", "pip", "install", "-q", "Pillow"])
        try:
            from PIL import Image
            for ref in jpg_refs:
                if ref.startswith("/"):
                    disk = os.path.join(ROOT, "public", ref.lstrip("/"))
                else:
                    disk = os.path.normpath(os.path.join(COMP, ref))
                if not os.path.exists(disk):
                    warnings.append(f"image not found on disk: {ref}")
                    continue
                webp_disk = os.path.splitext(disk)[0] + ".webp"
                if not os.path.exists(webp_disk):
                    im = Image.open(disk)
                    if im.mode not in ("RGB", "RGBA"):
                        im = im.convert("RGB")
                    if im.width > 1200:
                        im = im.resize((1200, round(im.height * 1200 / im.width)), Image.LANCZOS)
                    im.save(webp_disk, "WEBP", quality=78, method=6)
                    kb_old = os.path.getsize(disk) // 1024
                    kb_new = os.path.getsize(webp_disk) // 1024
                    changes.append(f"WebP: {os.path.basename(disk)} {kb_old}KB -> {kb_new}KB")
                webp_ref = os.path.splitext(ref)[0] + ".webp"
                s = s.replace(ref, webp_ref)
        except Exception as e:
            warnings.append(f"WebP conversion skipped: {e}")

    if s != o:
        wr(h3d, s)
        changes.append("Hero3DVisuals.tsx: images lazy (+ WebP refs)")
    else:
        warnings.append("Hero3DVisuals.tsx: nothing changed")
else:
    warnings.append("Hero3DVisuals.tsx not found")

# ------------------------------------------------------- 4) Navbar colors
nav = os.path.join(COMP, "Navbar.tsx")
if os.path.exists(nav):
    out, n_total = [], 0
    for line in rd(nav).split("\n"):
        if "dark:text-" not in line:
            line, n1 = re.subn(r"(?<![\w:-])text-slate-500\b(?! dark:)", "text-slate-500 dark:text-slate-300", line)
            line, n2 = re.subn(r"(?<![\w:-])text-slate-600\b(?! dark:)", "text-slate-600 dark:text-slate-400", line)
            n_total += n1 + n2
        out.append(line)
    if n_total:
        wr(nav, "\n".join(out))
        changes.append(f"Navbar.tsx: {n_total} faded text(s) brighter in dark mode")
else:
    warnings.append("Navbar.tsx not found")

# ------------------------------------------------- diagnostics: Navbar header
diag = []
if os.path.exists(nav):
    lines = rd(nav).split("\n")
    for i, line in enumerate(lines, 1):
        if re.search(r"(<nav|<header|max-w-|px-\d|gap-\d|QuantumHexLogo|hidden sm:|hidden md:|justify-between)", line):
            diag.append(f"Navbar.tsx:{i}: {line.strip()[:170]}")
qhl = os.path.join(COMP, "QuantumHexLogo.tsx")
if os.path.exists(qhl):
    for i, line in enumerate(rd(qhl).split("\n"), 1):
        if re.search(r"(className=|text-\w*xl|tracking)", line) and i > 100:
            diag.append(f"QuantumHexLogo.tsx:{i}: {line.strip()[:170]}")

print("\n================ ELYVORI MOBILE FIX #2 ================")
print("CHANGES:")
for c in changes or ["(none)"]:
    print("  +", c)
if warnings:
    print("WARNINGS:")
    for w in warnings:
        print("  !", w)
print("\nDIAGNOSTICS (copy this to Claude):")
for d in diag[:80]:
    print("  ", d)
print("=======================================================\n")
