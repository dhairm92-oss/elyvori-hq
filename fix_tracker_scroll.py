with open('D:/Elyvori/elyvori-hq/src/components/ProjectTracker.tsx', encoding='utf-8', errors='replace', newline='') as f:
    content = f.read()
content = content.replace('\r\n', '\n')

# Fix minHeight to allow scrolling - change from 100vh to auto
old = """    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #020408 0%, #050a18 40%, #040810 100%)',
      fontFamily: "'Cairo', 'Inter', sans-serif",
      position: 'relative', overflow: 'hidden',
      direction: isAr ? 'rtl' : 'ltr',
    }}>"""

new = """    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #020408 0%, #050a18 40%, #040810 100%)',
      fontFamily: "'Cairo', 'Inter', sans-serif",
      position: 'relative',
      direction: isAr ? 'rtl' : 'ltr',
    }}>"""

if old in content:
    content = content.replace(old, new)
    print("Fixed overflow hidden!")
else:
    print("Pattern not found - checking...")
    idx = content.find("overflow: 'hidden'")
    print(f"overflow hidden at: {idx}")
    if idx > 0:
        print(repr(content[max(0,idx-100):idx+50]))

with open('D:/Elyvori/elyvori-hq/src/components/ProjectTracker.tsx', 'w', encoding='utf-8', newline='\n') as f:
    f.write(content)
print("Saved!")
