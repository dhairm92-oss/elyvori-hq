with open('D:/Elyvori/elyvori-hq/src/App.tsx', encoding='utf-8', errors='replace', newline='') as f:
    content = f.read()
content = content.replace('\r\n', '\n')

# Remove ALL CyberFirewallWidget component instances (not imports)
lines = content.split('\n')
new_lines = []
skip_next = False
for i, line in enumerate(lines):
    # Skip CyberFirewallWidget component lines and their comments
    if '<CyberFirewallWidget' in line:
        # Also remove the comment line before it
        if new_lines and '{/* Cyber Firewall' in new_lines[-1]:
            new_lines.pop()
        continue
    new_lines.append(line)

content = '\n'.join(new_lines)

# Now add it ONCE before </div>
old_end = """      {/* Voice Assistant Widget */}
      <VoiceWidget lang={lang} />

    </div>"""

new_end = """      {/* Voice Assistant Widget */}
      <VoiceWidget lang={lang} />

      {/* Cyber Firewall Widget */}
      <CyberFirewallWidget lang={lang} theme={theme} />

    </div>"""

if old_end in content:
    content = content.replace(old_end, new_end)
    print("Added CyberFirewallWidget once!")
else:
    print("Pattern not found")

with open('D:/Elyvori/elyvori-hq/src/App.tsx', 'w', encoding='utf-8', newline='\n') as f:
    f.write(content)

# Verify count
count = content.count('<CyberFirewallWidget')
print(f"CyberFirewallWidget count: {count} (import + 1 usage = 2)")
print("Done!")
