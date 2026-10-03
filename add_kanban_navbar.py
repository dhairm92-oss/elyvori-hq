with open('D:/Elyvori/elyvori-hq/src/components/Navbar.tsx', encoding='utf-8', errors='replace', newline='') as f:
    content = f.read()

content = content.replace('\r\n', '\n')

# Add LayoutGrid icon import
content = content.replace(
    "  Handshake, ChevronDown, Sparkles, Zap",
    "  Handshake, ChevronDown, Sparkles, Zap, LayoutGrid"
)

# Add prop to interface
content = content.replace(
    "  onOpenNegotiation: () => void;\n}",
    "  onOpenNegotiation: () => void;\n  onOpenKanban?: () => void;\n}"
)

# Add to destructuring
content = content.replace(
    "  onOpenCareerAgent, onOpenContractAnalyzer,\n  onOpenCustomerSupport, onOpenNegotiation,\n}",
    "  onOpenCareerAgent, onOpenContractAnalyzer,\n  onOpenCustomerSupport, onOpenNegotiation,\n  onOpenKanban,\n}"
)

# Find where negotiation button is and add kanban button after it
# Look for the negotiation button pattern
old_neg = "onOpenNegotiation"
idx = content.find("onClick={onOpenNegotiation}")
if idx > 0:
    # Find the closing of this button
    end = content.find('</button>', idx) + 9
    kanban_btn = """\n              {onOpenKanban && auth.isAuthenticated && (
                <button
                  onClick={() => { onOpenKanban(); setAgentsOpen(false); }}
                  className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-slate-300 hover:text-white hover:bg-white/5 transition-colors"
                >
                  <LayoutGrid className="h-4 w-4 text-[#00E5FF]" />
                  {lang === 'en' ? 'Task Matrix' : 'لوحة المهام'}
                </button>
              )}"""
    content = content[:end] + kanban_btn + content[end:]
    print("Added Kanban button to navbar dropdown")
else:
    print("Negotiation button not found")
    print(f"onOpenNegotiation occurrences: {content.count('onOpenNegotiation')}")

with open('D:/Elyvori/elyvori-hq/src/components/Navbar.tsx', 'w', encoding='utf-8', newline='\n') as f:
    f.write(content)
print("Done!")
