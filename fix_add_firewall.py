with open('D:/Elyvori/elyvori-hq/src/App.tsx', encoding='utf-8', errors='replace', newline='') as f:
    content = f.read()
content = content.replace('\r\n', '\n')

# Check imports
if 'CyberFirewallWidget' not in content:
    # Add import
    old_import = "import { VoiceWidget } from './components/VoiceWidget';"
    new_import = """import { VoiceWidget } from './components/VoiceWidget';
import { CyberFirewallWidget } from './components/CyberFirewallWidget';"""
    if old_import in content:
        content = content.replace(old_import, new_import)
        print("Added CyberFirewallWidget import!")

# Add component
old_voice = "      {/* Voice Assistant Widget */}\n      <VoiceWidget lang={lang} />"
new_voice = """      {/* Voice Assistant Widget */}
      <VoiceWidget lang={lang} />

      {/* Cyber Firewall Widget */}
      <CyberFirewallWidget lang={lang} theme={theme} />"""

if old_voice in content:
    content = content.replace(old_voice, new_voice)
    print("Added CyberFirewallWidget!")
else:
    print("Pattern not found")

with open('D:/Elyvori/elyvori-hq/src/App.tsx', 'w', encoding='utf-8', newline='\n') as f:
    f.write(content)
print("Saved!")
