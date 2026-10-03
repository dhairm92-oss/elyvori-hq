# Link checkout to App.tsx and PricingSection
with open('D:/Elyvori/elyvori-hq/src/App.tsx', encoding='utf-8', errors='replace', newline='') as f:
    content = f.read()

content = content.replace('\r\n', '\n')

# Add CheckoutPage import
if 'CheckoutPage' not in content:
    content = content.replace(
        "import { KanbanBoard } from './components/KanbanBoard';",
        "import { KanbanBoard } from './components/KanbanBoard';\nimport { CheckoutPage } from './components/CheckoutPage';"
    )
    print("Added import")

# Add showCheckout state
if 'showCheckout' not in content:
    content = content.replace(
        "  const [showTracker, setShowTracker] = useState<boolean>(false);",
        """  const [showTracker, setShowTracker] = useState<boolean>(false);
  const [showCheckout, setShowCheckout] = useState<boolean>(false);
  const [checkoutPlan, setCheckoutPlan] = useState<'starter' | 'pro'>('starter');"""
    )
    print("Added state")

# Add checkout render
old_tracker = """      {showTracker ? (
        <div style={{ position: 'fixed', inset: 0, zIndex: 9999, overflowY: 'auto' }}>"""
new_tracker = """      {showCheckout && (
        <CheckoutPage
          lang={lang}
          auth={auth}
          initialPlan={checkoutPlan}
          onClose={() => setShowCheckout(false)}
          onOpenAuthModal={() => setIsAuthModalOpen(true)}
        />
      )}
      {showTracker ? (
        <div style={{ position: 'fixed', inset: 0, zIndex: 9999, overflowY: 'auto' }}>"""
content = content.replace(old_tracker, new_tracker)
print("Added checkout render")

# Pass onOpenCheckout to PricingSection
old_pricing = "<PricingSection lang={lang}"
new_pricing = "<PricingSection lang={lang} onOpenCheckout={(plan) => { setCheckoutPlan(plan); setShowCheckout(true); }}"
content = content.replace(old_pricing, new_pricing)
print("Added to PricingSection")

with open('D:/Elyvori/elyvori-hq/src/App.tsx', 'w', encoding='utf-8', newline='\n') as f:
    f.write(content)
print("Saved App.tsx")

# Now update PricingSection to accept and use onOpenCheckout
with open('D:/Elyvori/elyvori-hq/src/components/PricingSection.tsx', encoding='utf-8', errors='replace', newline='') as f:
    pricing = f.read()

pricing = pricing.replace('\r\n', '\n')

# Add onOpenCheckout to interface
old_pricing_interface = "interface PricingSectionProps {\n  lang: Language;\n}"
new_pricing_interface = "interface PricingSectionProps {\n  lang: Language;\n  onOpenCheckout?: (plan: 'starter' | 'pro') => void;\n}"

if old_pricing_interface in pricing:
    pricing = pricing.replace(old_pricing_interface, new_pricing_interface)
    print("Updated PricingSection interface")
else:
    # Try to find the interface
    idx = pricing.find('PricingSectionProps')
    print(f"PricingSectionProps at: {idx}")
    print(repr(pricing[idx:idx+100]))

# Add to function params
pricing = pricing.replace(
    "export function PricingSection({ lang }",
    "export function PricingSection({ lang, onOpenCheckout }"
)
print("Updated PricingSection params")

# Replace upgrade buttons to call onOpenCheckout
pricing = pricing.replace(
    "onClick={() => scrollTo('demo')}",
    "onClick={() => onOpenCheckout?.('starter')}"
)
pricing = pricing.replace(
    "onClick={() => scrollTo('pro')}",
    "onClick={() => onOpenCheckout?.('pro')}"
)

# Find upgrade buttons more broadly
import re
# Replace "Upgrade to Starter" button action
pricing = re.sub(
    r"(Upgrade to Starter[^}]*}[^)]*\))",
    lambda m: m.group(0),
    pricing
)

with open('D:/Elyvori/elyvori-hq/src/components/PricingSection.tsx', 'w', encoding='utf-8', newline='\n') as f:
    f.write(pricing)
print("Saved PricingSection.tsx")
print("ALL DONE!")
