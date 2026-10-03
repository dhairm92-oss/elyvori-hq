# Fix ParticleBackground - add pointer-events-none
with open('D:/Elyvori/elyvori-hq/src/components/ParticleBackground.tsx', encoding='utf-8', errors='replace', newline='') as f:
    content = f.read()
content = content.replace('\r\n', '\n')

# Find canvas element and add pointer-events-none style
import re
# Add pointer-events: none to canvas style
content = re.sub(
    r'(style=\{\{[^}]*position:\s*[\'"]fixed[\'"][^}]*)\}\}',
    r'\1, pointerEvents: "none"}}',
    content
)
# Also add to any canvas element
content = content.replace(
    '<canvas ',
    '<canvas style={{pointerEvents:"none"}} '
)

with open('D:/Elyvori/elyvori-hq/src/components/ParticleBackground.tsx', 'w', encoding='utf-8', newline='\n') as f:
    f.write(content)
print("Fixed ParticleBackground pointer events")

# Fix Elyvori3DBackground - add pointer-events-none
with open('D:/Elyvori/elyvori-hq/src/components/Elyvori3DBackground.tsx', encoding='utf-8', errors='replace', newline='') as f:
    content2 = f.read()
content2 = content2.replace('\r\n', '\n')

# Add pointer-events-none to the main wrapper
content2 = re.sub(
    r'(className="[^"]*(?:fixed|absolute)[^"]*")',
    lambda m: m.group(0) if 'pointer-events-none' in m.group(0) else m.group(0).replace('"', ' pointer-events-none"', 1),
    content2,
    count=1
)

with open('D:/Elyvori/elyvori-hq/src/components/Elyvori3DBackground.tsx', 'w', encoding='utf-8', newline='\n') as f:
    f.write(content2)
print("Fixed Elyvori3DBackground pointer events")
print("Done!")
