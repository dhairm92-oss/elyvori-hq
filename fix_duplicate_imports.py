with open('D:/Elyvori/elyvori-hq/src/App.tsx', encoding='utf-8', errors='replace', newline='') as f:
    content = f.read()
content = content.replace('\r\n', '\n')

# Remove duplicate imports
old_dup = """import { Footer } from './components/Footer';
import { VoiceWidget } from './components/VoiceWidget';
import { CyberFirewallWidget } from './components/CyberFirewallWidget';"""

new_no_dup = "import { Footer } from './components/Footer';"

if old_dup in content:
    content = content.replace(old_dup, new_no_dup)
    print("Removed duplicate imports!")

with open('D:/Elyvori/elyvori-hq/src/App.tsx', 'w', encoding='utf-8', newline='\n') as f:
    f.write(content)
print("Saved!")
