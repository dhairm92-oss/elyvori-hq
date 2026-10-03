import os

files = [
    'D:/Elyvori/elyvori-hq/src/components/Hero.tsx',
    'D:/Elyvori/elyvori-hq/src/components/ServicesSection.tsx',
    'D:/Elyvori/elyvori-hq/src/components/PricingSection.tsx',
    'D:/Elyvori/elyvori-hq/src/components/ContactDemoSection.tsx',
]

for path in files:
    try:
        with open(path, encoding='utf-8') as f:
            content = f.read()
        # Remove solid dark backgrounds from sections so canvas shows through
        content = content.replace('className="relative py-24 overflow-hidden bg-[#0F111A]"', 'className="relative py-24 overflow-hidden bg-transparent"')
        content = content.replace('className="relative overflow-hidden pt-12 pb-20 sm:pt-20 sm:pb-28 bg-[#0F111A]"', 'className="relative overflow-hidden pt-12 pb-20 sm:pt-20 sm:pb-28 bg-transparent"')
        content = content.replace('className="relative py-16 sm:py-24 bg-[#0F111A]"', 'className="relative py-16 sm:py-24 bg-transparent"')
        # Make card backgrounds semi-transparent
        content = content.replace("background: 'rgba(15,17,26,0.8)'", "background: 'rgba(8,10,18,0.75)'")
        content = content.replace("background: 'rgba(15,17,26,0.6)'", "background: 'rgba(8,10,18,0.55)'")
        content = content.replace("background: '#0F111A]/90'", "background: 'rgba(8,10,18,0.85)'")
        # Fix ContactDemoSection background
        content = content.replace('className="relative py-24 overflow-hidden bg-transparent"', 'className="relative py-24 overflow-hidden bg-transparent"')
        with open(path, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Fixed: {path.split('/')[-1]}")
    except Exception as e:
        print(f"Error {path}: {e}")

# Also fix other sections that have light/white backgrounds
other_files = [
    'D:/Elyvori/elyvori-hq/src/components/LiveStatsSection.tsx',
    'D:/Elyvori/elyvori-hq/src/components/SocialProofSection.tsx', 
    'D:/Elyvori/elyvori-hq/src/components/BeforeAfterSection.tsx',
    'D:/Elyvori/elyvori-hq/src/components/Footer.tsx',
]
for path in other_files:
    try:
        with open(path, encoding='utf-8') as f:
            content = f.read()
        # Remove white/light backgrounds
        content = content.replace('bg-white', 'bg-transparent')
        content = content.replace('bg-slate-50', 'bg-transparent')
        content = content.replace('bg-gray-50', 'bg-transparent')
        with open(path, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Fixed: {path.split('/')[-1]}")
    except Exception as e:
        print(f"Skip {path.split('/')[-1]}: {e}")
