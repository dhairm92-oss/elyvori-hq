with open('D:/Elyvori/elyvori-hq/src/App.tsx', encoding='utf-8') as f:
    content = f.read()

# Force dark class on document always
if "documentElement.classList.add('dark')" not in content:
    # Add after the theme useEffect or at start of component
    content = content.replace(
        "export default function App() {",
        "export default function App() {\n  // Force dark mode always for cyberpunk background\n  if (typeof document !== 'undefined') document.documentElement.classList.add('dark');"
    )

with open('D:/Elyvori/elyvori-hq/src/App.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
print("Done")
