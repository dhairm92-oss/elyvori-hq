with open('D:/Elyvori/elyvori-hq/src/components/Navbar.tsx', encoding='utf-8', errors='replace', newline='') as f:
    content = f.read()

content = content.replace('\r\n', '\n')

# Add Kanban to agents array after Negotiate AI
old = "      onClick: () => { setAgentsOpen(false); setMobileOpen(false); onOpenNegotiation(); },\n    },\n  ];"
new = """      onClick: () => { setAgentsOpen(false); setMobileOpen(false); onOpenNegotiation(); },
    },
    ...(onOpenKanban && auth.isAuthenticated ? [{
      icon: LayoutGrid,
      labelEn: 'Task Matrix',
      labelAr: 'لوحة المهام',
      descEn: 'Kanban board for your projects',
      descAr: 'تتبع المهام والمشاريع',
      color: 'from-teal-500 to-cyan-500',
      glow: 'rgba(20,184,166,0.4)',
      onClick: () => { setAgentsOpen(false); setMobileOpen(false); onOpenKanban(); },
    }] : []),
  ];"""

if old in content:
    content = content.replace(old, new)
    print("Added Kanban to agents array")
else:
    print("Pattern not found")

with open('D:/Elyvori/elyvori-hq/src/components/Navbar.tsx', 'w', encoding='utf-8', newline='\n') as f:
    f.write(content)
print("Done!")
