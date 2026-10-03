# Fix App.tsx - disable heavy 3D background
with open('D:/Elyvori/elyvori-hq/src/App.tsx', encoding='utf-8', errors='replace', newline='') as f:
    content = f.read()

content = content.replace('\r\n', '\n')

# Comment out heavy components
content = content.replace(
    "<Elyvori3DBackground theme={theme} lang={lang} />",
    "{/* <Elyvori3DBackground theme={theme} lang={lang} /> */}"
)
content = content.replace(
    "<FloatingSideLogo isDark={theme === 'dark'} lang={lang} />",
    "{/* <FloatingSideLogo isDark={theme === 'dark'} lang={lang} /> */}"
)

with open('D:/Elyvori/elyvori-hq/src/App.tsx', 'w', encoding='utf-8', newline='\n') as f:
    f.write(content)
print("Disabled heavy 3D components")

# Fix ParticleBackground - reduce particles count
with open('D:/Elyvori/elyvori-hq/src/components/ParticleBackground.tsx', encoding='utf-8', errors='replace', newline='') as f:
    content2 = f.read()

content2 = content2.replace('\r\n', '\n')

# Find particle count and reduce it
import re
# Replace common particle count patterns
content2 = re.sub(r'const\s+PARTICLE_COUNT\s*=\s*\d+', 'const PARTICLE_COUNT = 20', content2)
content2 = re.sub(r'count\s*[:=]\s*[1-9]\d{2,}', 'count = 20', content2)
content2 = re.sub(r'particles\.length\s*<\s*[1-9]\d{2,}', 'particles.length < 20', content2)

# Also reduce animation frame rate if possible
content2 = content2.replace('requestAnimationFrame', 'requestAnimationFrame')

with open('D:/Elyvori/elyvori-hq/src/components/ParticleBackground.tsx', 'w', encoding='utf-8', newline='\n') as f:
    f.write(content2)
print("Reduced particle count")
print("Done!")
