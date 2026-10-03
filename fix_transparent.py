import re

# Fix App.tsx to make main content area transparent
with open('D:/Elyvori/elyvori-hq/src/App.tsx', encoding='utf-8') as f:
    content = f.read()

# Make the main div transparent/dark
content = content.replace(
    'className="relative min-h-screen',
    'className="relative min-h-screen bg-transparent'
)
content = content.replace(
    'className="min-h-screen',
    'className="min-h-screen bg-transparent'
)

with open('D:/Elyvori/elyvori-hq/src/App.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
print("Done App.tsx")

# Fix index.css or tailwind to force dark background on body
with open('D:/Elyvori/elyvori-hq/src/index.css', encoding='utf-8', errors='replace') as f:
    css = f.read()

if 'body {' not in css:
    css = "body { background: #080A12 !important; }\n" + css
else:
    css = re.sub(r'body\s*{', 'body { background: #080A12 !important; color: white;', css, count=1)

with open('D:/Elyvori/elyvori-hq/src/index.css', 'w', encoding='utf-8') as f:
    f.write(css)
print("Done index.css")
