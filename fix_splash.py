with open('D:/Elyvori/elyvori-hq/src/App.tsx', encoding='utf-8') as f:
    content = f.read()

# Add import
content = content.replace(
    "import { CustomerSupportPage } from './components/CustomerSupportPage';",
    "import { CustomerSupportPage } from './components/CustomerSupportPage';\nimport { MobileSplash } from './components/MobileSplash';"
)

# Add mobile splash state after other states
content = content.replace(
    "  // Controls Login Gate modal visibility",
    """  // Mobile splash: show on first visit on mobile devices only
  const [showMobileSplash, setShowMobileSplash] = useState<boolean>(() => {
    const isMobile = window.innerWidth < 768;
    const hasSeenSplash = localStorage.getItem('elyvori_mobile_auth');
    return isMobile && !hasSeenSplash;
  });

  // Controls Login Gate modal visibility"""
)

# Add MobileSplash render before everything else in return
content = content.replace(
    "  return (\n    <div",
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
    <div"""
)

with open('D:/Elyvori/elyvori-hq/src/App.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("Done:", content.count('MobileSplash'))
