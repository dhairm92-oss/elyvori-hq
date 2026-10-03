with open('D:/Elyvori/elyvori-hq/src/App.tsx', encoding='utf-8', errors='replace', newline='') as f:
    content = f.read()

content = content.replace('\r\n', '\n')

# Add showTracker to the render chain
old = "      {showKanban && auth.token ? ("
new = """      {showTracker ? (
        <div style={{ position: 'fixed', inset: 0, zIndex: 9999, overflowY: 'auto' }}>
          <button
            onClick={() => setShowTracker(false)}
            style={{
              position: 'fixed', top: 20, right: 20, zIndex: 10000,
              background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)',
              color: 'white', borderRadius: '50%', width: 40, height: 40,
              cursor: 'pointer', fontSize: 18,
            }}
          >✕</button>
          <ProjectTracker lang={lang} token={auth.token || ''} />
        </div>
      ) : showKanban && auth.token ? ("""

if old in content:
    content = content.replace(old, new)
    print("Added tracker render")
else:
    print("Pattern not found")

with open('D:/Elyvori/elyvori-hq/src/App.tsx', 'w', encoding='utf-8', newline='\n') as f:
    f.write(content)
print("Saved")
