with open('D:/Elyvori/elyvori-hq/src/components/ServicesSection.tsx', encoding='utf-8', errors='replace', newline='') as f:
    content = f.read()

content_lf = content.replace('\r\n', '\n')

old = "{ border: 'rgba(20,184,166,0.3)', glow: 'rgba(20,184,166,0.08)', icon: '#14b8a6', badge: 'rgba(20,184,166,0.1)' },\n  ];"

new = """{ border: 'rgba(20,184,166,0.3)', glow: 'rgba(20,184,166,0.08)', icon: '#14b8a6', badge: 'rgba(20,184,166,0.1)' },
    { border: 'rgba(255,165,0,0.3)', glow: 'rgba(255,165,0,0.08)', icon: '#FFA500', badge: 'rgba(255,165,0,0.1)' },
  ];"""

if old in content_lf:
    content_lf = content_lf.replace(old, new)
    with open('D:/Elyvori/elyvori-hq/src/components/ServicesSection.tsx', 'w', encoding='utf-8', newline='\n') as f:
        f.write(content_lf)
    print("SUCCESS: Added 10th accent color")
else:
    print("Pattern not found")
    idx = content_lf.find('#14b8a6')
    print(f"Found at: {idx}")
    print(repr(content_lf[idx:idx+100]))
