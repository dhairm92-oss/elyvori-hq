with open('D:/Elyvori/elyvori-hq/src/translations.ts', encoding='utf-8') as f:
    content = f.read()

# Fix English - Seven → Nine, 7 → 9, 8 → 9
content = content.replace('Seven dedicated AI services', 'Nine dedicated AI services')
content = content.replace('Seven Purpose-Built AI Services', 'Nine Purpose-Built AI Services')
content = content.replace('Explore 7 Core Services', 'Explore 9 Core AI Agents')
content = content.replace('seven services', 'nine services')
content = content.replace('all seven services', 'all nine services')
content = content.replace('01 / 08', '01 / 09')
content = content.replace('02 / 08', '02 / 09')
content = content.replace('03 / 08', '03 / 09')
content = content.replace('04 / 08', '04 / 09')
content = content.replace('05 / 08', '05 / 09')
content = content.replace('06 / 08', '06 / 09')
content = content.replace('07 / 08', '07 / 09')
content = content.replace('08 / 08', '08 / 09')

# Fix Arabic
content = content.replace('سبع خدمات', 'تسع خدمات')
content = content.replace('سبع', 'تسع')
content = content.replace('7 خدمات', '9 خدمات')

with open('D:/Elyvori/elyvori-hq/src/translations.ts', 'w', encoding='utf-8') as f:
    f.write(content)

print("Done - Seven→Nine fixes applied")
