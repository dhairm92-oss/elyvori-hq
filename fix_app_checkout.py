with open('D:/Elyvori/elyvori-hq/src/App.tsx', encoding='utf-8', errors='replace', newline='') as f:
    content = f.read()
content = content.replace('\r\n', '\n')

# Find and update PricingSection call
old = """        <PricingSection
            lang={lang}
            onSelectPlan={(_planId) => {
              if (!auth.isAuthenticated) {
                setIsAuthModalOpen(true);
              } else {"""

new = """        <PricingSection
            lang={lang}
            onOpenCheckout={(plan) => {
              setCheckoutPlan(plan);
              setShowCheckout(true);
            }}
            onSelectPlan={(_planId) => {
              if (!auth.isAuthenticated) {
                setIsAuthModalOpen(true);
              } else {"""

if old in content:
    content = content.replace(old, new)
    print("Fixed! Added onOpenCheckout to PricingSection!")
else:
    print("Pattern not found")
    # Show what's there
    idx = content.find('<PricingSection')
    print(repr(content[idx:idx+300]))

with open('D:/Elyvori/elyvori-hq/src/App.tsx', 'w', encoding='utf-8', newline='\n') as f:
    f.write(content)
print("Saved!")
