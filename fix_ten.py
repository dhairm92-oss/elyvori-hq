with open('D:/Elyvori/elyvori-hq/src/translations.ts', encoding='utf-8') as f:
    content = f.read()

# English fixes
content = content.replace('Nine dedicated AI services', 'Ten dedicated AI services')
content = content.replace('Nine Purpose-Built AI Services', 'Ten Purpose-Built AI Services')
content = content.replace('Explore 9 Core AI Agents', 'Explore 10 Core AI Agents')
content = content.replace('nine services', 'ten services')
content = content.replace('all nine services', 'all ten services')

# Arabic fixes  
content = content.replace('تسع خدمات', 'عشر خدمات')
content = content.replace('9 خدمات', '10 خدمات')

with open('D:/Elyvori/elyvori-hq/src/translations.ts', 'w', encoding='utf-8') as f:
    f.write(content)
print("Done - all Nine→Ten")

with open('D:/Elyvori/elyvori-hq/src/components/Hero.tsx', encoding='utf-8') as f:
    content = f.read()
content = content.replace("value: '9'", "value: '10'")
content = content.replace("label: lang === 'en' ? 'Core AI Services' : 'خدمة ذكاء اصطناعي'", "label: lang === 'en' ? 'Core AI Agents' : 'وكيل ذكاء اصطناعي'")
with open('D:/Elyvori/elyvori-hq/src/components/Hero.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
print("Done - Hero stats updated to 10")
