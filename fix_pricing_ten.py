with open('D:/Elyvori/elyvori-hq/src/components/PricingSection.tsx', encoding='utf-8') as f:
    content = f.read()

# Fix "All 9 Services" to "All 10 Services"
content = content.replace(
    "lang === 'en' ? 'All 9 Services Included in Every Tier:' : 'جميع الخدمات التسع مشمولة في كل خطة:'",
    "lang === 'en' ? 'All 10 AI Agents Included in Every Tier:' : 'جميع الوكلاء العشرة مشمولون في كل خطة:'"
)

# Add AI Negotiation Simulator to the list
content = content.replace(
    "    'Customer Support AI',\n  ] : [",
    "    'Customer Support AI',\n    'AI Negotiation Simulator',\n  ] : ["
)
content = content.replace(
    "    'ذكاء دعم العملاء',\n  ];",
    "    'ذكاء دعم العملاء',\n    'محاكاة التفاوض الذكي',\n  ];"
)

with open('D:/Elyvori/elyvori-hq/src/components/PricingSection.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
print("Done")
