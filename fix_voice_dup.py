with open('D:/Elyvori/elyvori-hq/src/App.tsx', encoding='utf-8', errors='replace', newline='') as f:
    content = f.read()
content = content.replace('\r\n', '\n')

# Remove duplicate VoiceWidget
while '      <VoiceWidget lang={lang} />\n      <VoiceWidget lang={lang} />' in content:
    content = content.replace(
        '      <VoiceWidget lang={lang} />\n      <VoiceWidget lang={lang} />',
        '      <VoiceWidget lang={lang} />'
    )
    print("Removed duplicate!")

with open('D:/Elyvori/elyvori-hq/src/App.tsx', 'w', encoding='utf-8', newline='\n') as f:
    f.write(content)

count = content.count('<VoiceWidget')
print(f"VoiceWidget count: {count} (import + 1 usage = 2 is correct)")
print("Saved!")
