with open('D:/Elyvori/elyvori-hq/src/App.tsx', encoding='utf-8', errors='replace', newline='') as f:
    content = f.read()

content = content.replace('\r\n', '\n')

# Add import
if 'ProjectTracker' not in content:
    # Find last import line
    lines = content.split('\n')
    last_import_idx = 0
    for i, line in enumerate(lines):
        if line.startswith('import'):
            last_import_idx = i
    lines.insert(last_import_idx + 1, "import { ProjectTracker } from './components/ProjectTracker';")
    content = '\n'.join(lines)
    print("Added import")

# Add tracker page to views - find where KanbanBoard or NegotiationPage is used
# First let's see what pages are available
idx = content.find("currentPage")
print(f"currentPage found at: {idx}")
print(content[idx:idx+200] if idx > 0 else "NOT FOUND")

# Find where pages are rendered
idx2 = content.find("'tracker'")
print(f"tracker page: {idx2}")

with open('D:/Elyvori/elyvori-hq/src/App.tsx', 'w', encoding='utf-8', newline='\n') as f:
    f.write(content)
print("Saved")
