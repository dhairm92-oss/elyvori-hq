with open('D:/Elyvori/elyvori-hq/src/components/Navbar.tsx', encoding='utf-8', errors='replace', newline='') as f:
    content = f.read()

content = content.replace('\r\n', '\n')

# Add Activity icon to imports
content = content.replace(
    "  Handshake, ChevronDown, Sparkles, LayoutGrid",
    "  Handshake, ChevronDown, Sparkles, LayoutGrid, Activity"
)
print("Added Activity icon")

# Add tracker to agents array
old = "    ...(onOpenKanban && auth.isAuthenticated ? [{ icon: LayoutGrid, labelEn: 'Task Matrix', labelAr:"
new = """    ...(onOpenTracker ? [{ icon: Activity, labelEn: 'Track Project', labelAr: '\u062a\u062a\u0628\u0639 \u0645\u0634\u0631\u0648\u0639\u0643', descEn: 'Live project progress tracker', descAr: '\u062a\u0627\u0628\u0639 \u062a\u0642\u062f\u0645 \u0645\u0634\u0631\u0648\u0639\u0643 \u0644\u062d\u0638\u0629 \u0628\u0644\u062d\u0638\u0629', color: '#00E5FF', action: () => { closeAll(); onOpenTracker?.(); } }] : []),
    ...(onOpenKanban && auth.isAuthenticated ? [{ icon: LayoutGrid, labelEn: 'Task Matrix', labelAr:"""

if old in content:
    content = content.replace(old, new)
    print("Added tracker agent")
else:
    print("Pattern not found!")

with open('D:/Elyvori/elyvori-hq/src/components/Navbar.tsx', 'w', encoding='utf-8', newline='\n') as f:
    f.write(content)
print("Saved Navbar.tsx")
