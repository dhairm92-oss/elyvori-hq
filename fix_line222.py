with open('D:/Elyvori/elyvori-hq/src/App.tsx', encoding='utf-8', errors='replace') as f:
    lines = f.readlines()

print(f"Total: {len(lines)}")

# Find the broken line
for i, line in enumerate(lines):
    if 'PricingSection`n' in line or 'onOpenCheckout={(plan)' in line:
        print(f"Line {i+1}: {repr(line)}")

# Fix: replace lines 221-232 with clean version
new_pricing = '''        {/* Pricing Section (Free, Starter, Pro) */}
        <PricingSection
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
            }}
          />
'''

# Find start and end of PricingSection block
start = None
end = None
for i, line in enumerate(lines):
    if '{/* Pricing Section' in line:
        start = i
    if start and '/>' in line and i > start:
        end = i + 1
        break

print(f"Block from line {start+1} to {end+1}")
print("Before fix:")
for line in lines[start:end]:
    print(repr(line))

if start and end:
    lines[start:end] = [new_pricing]
    print("\nFixed!")

with open('D:/Elyvori/elyvori-hq/src/App.tsx', 'w', encoding='utf-8', newline='\n') as f:
    f.writelines(lines)
print("Saved!")
