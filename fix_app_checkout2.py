with open('D:/Elyvori/elyvori-hq/src/App.tsx', encoding='utf-8', errors='replace', newline='') as f:
    content = f.read()
content = content.replace('\r\n', '\n')

old = """        <PricingSection
            lang={lang}
            onSelectPlan={(_planId) => {
              if (!auth.isAuthenticated) {
                setIsAuthModalOpen(true);
              } else {
                scrollTo('demo');
              }
            }}"""

new = """        <PricingSection
            lang={lang}
            onOpenCheckout={(plan) => {
              setCheckoutPlan(plan);
              setShowCheckout(true);
            }}
            onSelectPlan={(_planId) => {
              if (!auth.isAuthenticated) {
                setIsAuthModalOpen(true);
              } else {
                scrollTo('demo');
              }
            }}"""

if old in content:
    content = content.replace(old, new)
    print("Fixed!")
else:
    print("Not found")

with open('D:/Elyvori/elyvori-hq/src/App.tsx', 'w', encoding='utf-8', newline='\n') as f:
    f.write(content)
print("Saved!")
