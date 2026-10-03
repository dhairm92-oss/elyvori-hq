with open('D:/Elyvori/elyvori-hq/src/components/ServicesSection.tsx', encoding='utf-8', errors='replace', newline='') as f:
    content = f.read()

content_lf = content.replace('\r\n', '\n')

# Check what's in the icons mapping - the issue is Handshake not in icons object
old_icons = """  const icons: Record<string, any> = {
    Package, Layout, Users, Megaphone, FileText,
    Search, Briefcase, Scale, HeadphonesIcon, Handshake,
  };"""

print("icons mapping found:", old_icons in content_lf)

# Check the accentColors count
import re
matches = re.findall(r"border: 'rgba\(", content_lf)
print(f"accent colors count: {len(matches)}")

# Show the accentColors section
idx = content_lf.find('const accentColors')
print(content_lf[idx:idx+600])
