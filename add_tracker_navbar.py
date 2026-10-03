with open('D:/Elyvori/elyvori-hq/src/components/Navbar.tsx', encoding='utf-8', errors='replace', newline='') as f:
    content = f.read()

content = content.replace('\r\n', '\n')

# Add onOpenTracker to interface
old_interface = "  onOpenKanban?: () => void;\n}"
new_interface = "  onOpenKanban?: () => void;\n  onOpenTracker?: () => void;\n}"
content = content.replace(old_interface, new_interface)
print("Added to interface")

# Add to destructured props
old_props = "  onOpenKanban,\n}: NavbarProps)"
new_props = "  onOpenKanban,\n  onOpenTracker,\n}: NavbarProps)"
content = content.replace(old_props, new_props)
print("Added to props")

# Find where onOpenKanban button is and add tracker button next to it
old_kanban_btn = "onOpenKanban && ("
idx = content.find(old_kanban_btn)
if idx > 0:
    print(f"Found kanban button at {idx}")
    print(repr(content[idx:idx+200]))
else:
    # Search for LayoutGrid which is the kanban icon
    idx2 = content.find('LayoutGrid')
    print(f"LayoutGrid found at: {idx2}")
    print(repr(content[max(0,idx2-100):idx2+200]))

with open('D:/Elyvori/elyvori-hq/src/components/Navbar.tsx', 'w', encoding='utf-8', newline='\n') as f:
    f.write(content)
print("Saved")
