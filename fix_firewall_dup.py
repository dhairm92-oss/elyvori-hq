with open('D:/Elyvori/elyvori-hq/src/App.tsx', encoding='utf-8', errors='replace', newline='') as f:
    content = f.read()
content = content.replace('\r\n', '\n')

# Remove duplicate CyberFirewallWidget components
old = """      {/* Cyber Firewall Widget */}
      <CyberFirewallWidget lang={lang} theme={theme} />

      {/* Cyber Firewall Widget */}
      <CyberFirewallWidget lang={lang} theme={theme} />

      {/* Cyber Firewall Widget */}
      <CyberFirewallWidget lang={lang} theme={theme} />"""

new = """      {/* Cyber Firewall Widget */}
      <CyberFirewallWidget lang={lang} theme={theme} />"""

if old in content:
    content = content.replace(old, new)
    print("Fixed duplicates!")
else:
    # Try removing all and adding once
    while '      <CyberFirewallWidget lang={lang} theme={theme} />\n      <CyberFirewallWidget lang={lang} theme={theme} />' in content:
        content = content.replace(
            '      <CyberFirewallWidget lang={lang} theme={theme} />\n      <CyberFirewallWidget lang={lang} theme={theme} />',
            '      <CyberFirewallWidget lang={lang} theme={theme} />'
        )
    print("Fixed by loop!")

with open('D:/Elyvori/elyvori-hq/src/App.tsx', 'w', encoding='utf-8', newline='\n') as f:
    f.write(content)

# Verify
with open('D:/Elyvori/elyvori-hq/src/App.tsx', encoding='utf-8') as f:
    lines = f.readlines()
count = sum(1 for l in lines if 'CyberFirewallWidget' in l and 'import' not in l)
print(f"CyberFirewallWidget count in body: {count} (should be 1)")
print("Saved!")
