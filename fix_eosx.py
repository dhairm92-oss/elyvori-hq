with open('D:/Elyvori/elyvori-hq/src/components/CustomProductSection.tsx', encoding='utf-8', errors='replace', newline='') as f:
    content = f.read()
content = content.replace('\r\n', '\n')

print(f"Total chars: {len(content)}")
print(f"Last 100 chars: {repr(content[-100:])}")

# Remove EOSX and anything after it
if 'EOSX' in content:
    idx = content.rfind('EOSX')
    content = content[:idx].rstrip()
    print("Removed EOSX!")

# Make sure file ends properly
if not content.endswith('\n'):
    content += '\n'

with open('D:/Elyvori/elyvori-hq/src/components/CustomProductSection.tsx', 'w', encoding='utf-8', newline='\n') as f:
    f.write(content)
print("Saved!")
print(f"Last 50 chars now: {repr(content[-50:])}")
