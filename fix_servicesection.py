with open('D:/Elyvori/elyvori-hq/src/components/ServicesSection.tsx', encoding='utf-8') as f:
    content = f.read()

# Add Scale to imports
content = content.replace(
    "  Briefcase,\n} from 'lucide-react';",
    "  Briefcase,\n  Scale,\n} from 'lucide-react';"
)

# Add Scale to icons map
content = content.replace(
    "    Briefcase: Briefcase,\n  };",
    "    Briefcase: Briefcase,\n    Scale: Scale,\n  };"
)

with open('D:/Elyvori/elyvori-hq/src/components/ServicesSection.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("Done:", content.count('Scale'))
