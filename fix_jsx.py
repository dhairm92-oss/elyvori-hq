with open('D:/Elyvori/elyvori-hq/src/components/ContactDemoSection.tsx', encoding='utf-8', errors='replace', newline='') as f:
    content = f.read()
content = content.replace('\r\n', '\n')

# Fix the closing - remove extra <> wrapper
old = """    </section>
    </>
  );
}"""
new = """    </section>
  );
}"""

if old in content:
    content = content.replace(old, new)
    print("Fixed closing tags!")
else:
    print("Pattern not found, checking...")
    # Try to find the issue
    idx = content.rfind('</>') 
    print(f"Last </> at index: {idx}")
    print(repr(content[idx-50:idx+20]))

with open('D:/Elyvori/elyvori-hq/src/components/ContactDemoSection.tsx', 'w', encoding='utf-8', newline='\n') as f:
    f.write(content)
print("Saved!")
