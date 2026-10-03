with open('D:/Elyvori/elyvori-hq/src/translations.ts', encoding='utf-8', errors='replace', newline='') as f:
    content = f.read()

content_lf = content.replace('\r\n', '\n')

# Find the exact text around line 480 (Briefcase)
idx = content_lf.find("'Briefcase' as const,")
while idx > 0:
    # Check if this is in the Arabic section (after ar: {)
    before = content_lf[max(0,idx-50):idx]
    print(f"At {idx}: {repr(content_lf[idx:idx+80])}")
    idx = content_lf.find("'Briefcase' as const,", idx+1)
