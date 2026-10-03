with open('D:/Elyvori/elyvori-hq/src/components/ProjectTracker.tsx', encoding='utf-8', errors='replace', newline='') as f:
    content = f.read()
content = content.replace('\r\n', '\n')

# Fix the closing - remove extra </div>
old = """      </div>
    </div>
    </div>
    </>
  );
}"""

new = """      </div>
    </div>
    </>
  );
}"""

if old in content:
    content = content.replace(old, new)
    print("Fixed ProjectTracker closing tags!")
else:
    print("Pattern not found, trying alternative...")
    # Show last 15 lines
    lines = content.split('\n')
    for i, line in enumerate(lines[-15:], len(lines)-14):
        print(f"{i}: {repr(line)}")

with open('D:/Elyvori/elyvori-hq/src/components/ProjectTracker.tsx', 'w', encoding='utf-8', newline='\n') as f:
    f.write(content)
print("Saved!")
