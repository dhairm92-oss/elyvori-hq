with open('D:/Elyvori/elyvori-hq/src/App.tsx', encoding='utf-8') as f:
    content = f.read()

# Remove MobileSplash import
content = content.replace(
    "\nimport { MobileSplash } from './components/MobileSplash';",
    ""
)

# Remove mobile splash state
content = content.replace(
    """  // Mobile splash: show on first visit on mobile devices only
  const [showMobileSplash, setShowMobileSplash] = useState<boolean>(() => {
    const isMobile = window.innerWidth < 768;
    const hasSeenSplash = localStorage.getItem('elyvori_mobile_auth');
    return isMobile && !hasSeenSplash;
  });

  // Controls Login Gate modal visibility""",
    "  // Controls Login Gate modal visibility"
)

# Remove splash render
content = content.replace(
    """  // Show mobile splash on first mobile visit
  if (showMobileSplash) {
    return (
      <MobileSplash
        lang={lang}
        onComplete={() => {
          localStorage.setItem('elyvori_mobile_auth', 'true');
          setShowMobileSplash(false);
        }}
      />
    );
  }

  return (
    <div""",
    """  return (
    <div"""
)

with open('D:/Elyvori/elyvori-hq/src/App.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("Done. MobileSplash removed:", 'MobileSplash' not in content)
