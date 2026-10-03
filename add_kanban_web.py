with open('D:/Elyvori/elyvori-hq/src/App.tsx', encoding='utf-8', errors='replace', newline='') as f:
    content = f.read()

content = content.replace('\r\n', '\n')

# Add import
old_import = "import { NegotiationPage } from './components/NegotiationPage';"
new_import = "import { NegotiationPage } from './components/NegotiationPage';\nimport { KanbanBoard } from './components/KanbanBoard';"
content = content.replace(old_import, new_import)

# Add state
old_state = "  const [showNegotiation, setShowNegotiation] = useState<boolean>(false);"
new_state = "  const [showNegotiation, setShowNegotiation] = useState<boolean>(false);\n  const [showKanban, setShowKanban] = useState<boolean>(false);"
content = content.replace(old_state, new_state)

# Add to Navbar props
old_navbar = "        onOpenNegotiation={() => setShowNegotiation(true)}"
new_navbar = "        onOpenNegotiation={() => setShowNegotiation(true)}\n        onOpenKanban={() => setShowKanban(true)}"
content = content.replace(old_navbar, new_navbar)

# Add to page routing
old_routing = "      {showNegotiation ? (\n        <NegotiationPage lang={lang} onBack={() => setShowNegotiation(false)} />"
new_routing = "      {showKanban && auth.token ? (\n        <div className=\"min-h-screen bg-[#0A0A14] p-6\">\n          <button onClick={() => setShowKanban(false)} className=\"mb-6 text-slate-400 hover:text-white flex items-center gap-2 text-sm\">\n            ← {lang === 'ar' ? 'رجوع' : 'Back'}\n          </button>\n          <KanbanBoard lang={lang} token={auth.token} />\n        </div>\n      ) : showNegotiation ? (\n        <NegotiationPage lang={lang} onBack={() => setShowNegotiation(false)} />"
content = content.replace(old_routing, new_routing)

with open('D:/Elyvori/elyvori-hq/src/App.tsx', 'w', encoding='utf-8', newline='\n') as f:
    f.write(content)
print("Done!")
