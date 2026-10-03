with open('D:/Elyvori/elyvori-hq/src/App.tsx', encoding='utf-8', errors='replace', newline='') as f:
    content = f.read()
content = content.replace('\r\n', '\n')

# Add import
old_import = "import { Footer } from './components/Footer';"
new_import = """import { Footer } from './components/Footer';
import { CustomProductSection } from './components/CustomProductSection';"""

if old_import in content:
    content = content.replace(old_import, new_import)
    print("Added import!")

# Add section before footer
old_section = "        <ContactDemoSection"
new_section = """        <CustomProductSection lang={lang} />

        <ContactDemoSection"""

if old_section in content:
    content = content.replace(old_section, new_section)
    print("Added section!")

with open('D:/Elyvori/elyvori-hq/src/App.tsx', 'w', encoding='utf-8', newline='\n') as f:
    f.write(content)
print("Saved!")
