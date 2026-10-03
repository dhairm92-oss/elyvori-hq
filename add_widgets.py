with open('D:/Elyvori/elyvori-hq/src/App.tsx', encoding='utf-8', errors='replace', newline='') as f:
    content = f.read()
content = content.replace('\r\n', '\n')

# Add imports
old_import = "import { Footer } from './components/Footer';"
new_import = """import { Footer } from './components/Footer';
import { VoiceWidget } from './components/VoiceWidget';
import { CyberFirewallWidget } from './components/CyberFirewallWidget';"""

if old_import in content:
    content = content.replace(old_import, new_import)
    print("Added imports!")

# Add before closing </> or last tag
old_footer = "      {/* Footer */}\n      <Footer lang={lang} theme={theme} />"
new_footer = """      {/* Footer */}
      <Footer lang={lang} theme={theme} />

      {/* AI Chat Widget */}
      <VoiceWidget lang={lang} />

      {/* Cyber Firewall Widget */}
      <CyberFirewallWidget lang={lang} theme={theme} />"""

if old_footer in content:
    content = content.replace(old_footer, new_footer)
    print("Added widgets!")
else:
    print("Footer pattern not found")
    # Try alternative
    idx = content.rfind('<Footer')
    print(repr(content[idx-20:idx+80]))

with open('D:/Elyvori/elyvori-hq/src/App.tsx', 'w', encoding='utf-8', newline='\n') as f:
    f.write(content)
print("Saved!")
