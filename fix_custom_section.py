with open('D:/Elyvori/elyvori-hq/src/components/CustomProductSection.tsx', encoding='utf-8', errors='replace', newline='') as f:
    content = f.read()
content = content.replace('\r\n', '\n')

# Remove the echo line at the end
if 'echo "Done!"' in content:
    content = content.replace('\necho "Done!"', '')
    print("Removed echo!")

with open('D:/Elyvori/elyvori-hq/src/components/CustomProductSection.tsx', 'w', encoding='utf-8', newline='\n') as f:
    f.write(content)
print("Saved!")
