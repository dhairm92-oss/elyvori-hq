with open('D:/Elyvori/elyvori-hq/src/components/ContactDemoSection.tsx', encoding='utf-8', errors='replace', newline='') as f:
    content = f.read()
content = content.replace('\r\n', '\n')

# Fix: add proper closing for the fragment
old = """    </section>
  );
}"""

new = """    </section>
    </>
  );
}"""

if old in content:
    content = content.replace(old, new)
    print("Fixed! Added closing <>")
else:
    print("Pattern not found")
    # Show end of file
    lines = content.split('\n')
    for i, l in enumerate(lines[-8:], len(lines)-7):
        print(f"{i}: {repr(l)}")

with open('D:/Elyvori/elyvori-hq/src/components/ContactDemoSection.tsx', 'w', encoding='utf-8', newline='\n') as f:
    f.write(content)
print("Saved!")
