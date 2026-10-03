with open('D:/Elyvori/elyvori-hq/src/App.tsx', encoding='utf-8') as f:
    content = f.read()

# Force dark theme always
content = content.replace(
    "  const [theme, setTheme] = useState<Theme>(() => {\n    const saved = localStorage.getItem('elyvori_theme') as Theme;\n    return saved || 'dark';\n  });",
    "  const [theme, setTheme] = useState<Theme>('dark');"
)

# Force dark class on html element always
content = content.replace(
    "    if (theme === 'dark') {\n      document.documentElement.classList.add('dark');\n    } else {\n      document.documentElement.classList.remove('dark');\n    }",
    "    document.documentElement.classList.add('dark');"
)

with open('D:/Elyvori/elyvori-hq/src/App.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("Done:", content.count("classList.add('dark')"))
