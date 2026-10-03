with open('D:/Elyvori/elyvori-hq/src/components/CompletionCertificate.tsx', encoding='utf-8', errors='replace', newline='') as f:
    content = f.read()
content = content.replace('\r\n', '\n')

# Fix the outer overlay to allow scrolling + add big close button
old = """    <div style={{
      position: 'fixed', inset: 0, zIndex: 10000,
      background: 'rgba(0,0,0,0.9)', backdropFilter: 'blur(10px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 20, fontFamily: "'Cairo','Inter',sans-serif",
      direction: isAr ? 'rtl' : 'ltr',
    }}>"""

new = """    <div style={{
      position: 'fixed', inset: 0, zIndex: 10000,
      background: 'rgba(0,0,0,0.9)', backdropFilter: 'blur(10px)',
      display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
      padding: '20px 20px 40px', fontFamily: "'Cairo','Inter',sans-serif",
      direction: isAr ? 'rtl' : 'ltr',
      overflowY: 'auto',
    }}>
      <button onClick={onClose} style={{
        position: 'fixed', top: 16, right: 16, zIndex: 10001,
        background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.3)',
        color: 'white', borderRadius: '50%', width: 44, height: 44,
        cursor: 'pointer', fontSize: 20, fontWeight: 700,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>✕</button>"""

if old in content:
    content = content.replace(old, new)
    print("Fixed certificate overlay!")
else:
    print("Pattern not found - searching...")
    idx = content.find("position: 'fixed', inset: 0, zIndex: 10000")
    print(f"Found at: {idx}")
    print(repr(content[idx:idx+200]))

with open('D:/Elyvori/elyvori-hq/src/components/CompletionCertificate.tsx', 'w', encoding='utf-8', newline='\n') as f:
    f.write(content)
print("Saved!")
