with open('D:/Elyvori/elyvori-hq/src/App.tsx', encoding='utf-8', errors='replace', newline='') as f:
    content = f.read()

content = content.replace('\r\n', '\n')

# Fix the broken arrow and back text
content = content.replace(
    '            â†گ {lang === \'ar\' ? \'ط±ط¬ظˆط¹\' : \'Back\'}',
    "            ← {lang === 'ar' ? 'رجوع' : 'Back'}"
)

# Also fix any other encoding issues
content = content.replace('â†گ', '←')

with open('D:/Elyvori/elyvori-hq/src/App.tsx', 'w', encoding='utf-8', newline='\n') as f:
    f.write(content)
print("Fixed App.tsx")

# Fix KanbanBoard - remove auto-refresh to prevent slowdown
with open('D:/Elyvori/elyvori-hq/src/components/KanbanBoard.tsx', encoding='utf-8', errors='replace', newline='') as f:
    content2 = f.read()

content2 = content2.replace('\r\n', '\n')

# Remove auto-refresh interval
old_interval = """    const interval = setInterval(fetchKanban, 30000); // Auto-refresh every 30s
    return () => clearInterval(interval);"""
new_interval = "    // Manual refresh only"

content2 = content2.replace(old_interval, new_interval)

with open('D:/Elyvori/elyvori-hq/src/components/KanbanBoard.tsx', 'w', encoding='utf-8', newline='\n') as f:
    f.write(content2)
print("Fixed KanbanBoard.tsx - removed auto-refresh")
print("Done!")
