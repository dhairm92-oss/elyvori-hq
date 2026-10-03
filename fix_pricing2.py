with open('D:/Elyvori/elyvori-hq/src/components/PricingSection.tsx', encoding='utf-8', errors='replace', newline='') as f:
    content = f.read()
content = content.replace('\r\n', '\n')

# Update interface
old_iface = """interface PricingSectionProps {
  lang: Language;
  onSelectPlan: (planId: string) => void;
}

export function PricingSection({ lang, onSelectPlan }: PricingSectionProps) {"""

new_iface = """interface PricingSectionProps {
  lang: Language;
  onSelectPlan: (planId: string) => void;
  onOpenCheckout?: (plan: 'starter' | 'pro') => void;
}

export function PricingSection({ lang, onSelectPlan, onOpenCheckout }: PricingSectionProps) {"""

content = content.replace(old_iface, new_iface)
print("Updated interface!")

# Fix the button click
old_btn = "onClick={() => onSelectPlan(tier.id)}"
new_btn = "onClick={() => { if (tier.id === 'starter' || tier.id === 'pro') { onOpenCheckout ? onOpenCheckout(tier.id as 'starter' | 'pro') : onSelectPlan(tier.id); } else { onSelectPlan(tier.id); } }}"

content = content.replace(old_btn, new_btn)
print("Fixed button!")

with open('D:/Elyvori/elyvori-hq/src/components/PricingSection.tsx', 'w', encoding='utf-8', newline='\n') as f:
    f.write(content)
print("Saved!")
