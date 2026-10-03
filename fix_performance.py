with open('D:/Elyvori/elyvori-hq/src/App.tsx', encoding='utf-8', errors='replace', newline='') as f:
    content = f.read()
content = content.replace('\r\n', '\n')

# Remove imports
content = content.replace("import { ParticleBackground } from './components/ParticleBackground';\n", '')
content = content.replace("import { Elyvori3DBackground } from './components/Elyvori3DBackground';\n", '')

# Remove components from JSX
content = content.replace('<ParticleBackground />\n', '')
content = content.replace('<ParticleBackground/>\n', '')
content = content.replace('<Elyvori3DBackground />\n', '')
content = content.replace('<Elyvori3DBackground/>\n', '')

print("Removed background components!")

with open('D:/Elyvori/elyvori-hq/src/App.tsx', 'w', encoding='utf-8', newline='\n') as f:
    f.write(content)
print("Saved!")
