with open('D:/Elyvori/elyvori-hq/src/App.tsx', encoding='utf-8', errors='replace', newline='') as f:
    content = f.read()

content = content.replace('\r\n', '\n')

# Add showTracker state
old_state = "  const [showKanban, setShowKanban] = useState<boolean>(false);"
new_state = """  const [showKanban, setShowKanban] = useState<boolean>(false);
  const [showTracker, setShowTracker] = useState<boolean>(false);"""

content = content.replace(old_state, new_state)
print("Added state")

# Add onOpenTracker to Navbar props
old_navbar = "        onOpenKanban={() => setShowKanban(true)}"
new_navbar = """        onOpenKanban={() => setShowKanban(true)}
        onOpenTracker={() => setShowTracker(true)}"""

content = content.replace(old_navbar, new_navbar)
print("Added navbar prop")

# Find where showKanban is rendered and add showTracker
old_kanban_render = "      {showKanban && <KanbanBoard lang={lang} token={auth.token || ''} />}"
new_kanban_render = """      {showKanban && <KanbanBoard lang={lang} token={auth.token || ''} />}
      {showTracker && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 9999, overflowY: 'auto' }}>
          <button
            onClick={() => setShowTracker(false)}
            style={{
              position: 'fixed', top: 20, right: 20, zIndex: 10000,
              background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)',
              color: 'white', borderRadius: '50%', width: 40, height: 40,
              cursor: 'pointer', fontSize: 18, display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >✕</button>
          <ProjectTracker lang={lang} token={auth.token || ''} />
        </div>
      )}"""

if old_kanban_render in content:
    content = content.replace(old_kanban_render, new_kanban_render)
    print("Added tracker render")
else:
    # Try to find where KanbanBoard is rendered
    idx = content.find('KanbanBoard')
    print(f"KanbanBoard found at: {idx}")
    print(repr(content[idx-10:idx+100]))

with open('D:/Elyvori/elyvori-hq/src/App.tsx', 'w', encoding='utf-8', newline='\n') as f:
    f.write(content)
print("Saved App.tsx")
