with open('D:/Elyvori/elyvori-hq/src/App.tsx', encoding='utf-8') as f:
    content = f.read()

lines = content.split('\n')
new_lines = []
skip = False
depth = 0
i = 0
while i < len(lines):
    line = lines[i]
    if '{/* Authenticated Confirmation Banner */}' in line:
        skip = True
        i += 1
        continue
    if skip:
        depth += line.count('{') - line.count('}')
        if depth <= 0 and ')' in line and line.strip().startswith(')'):
            skip = False
            i += 1
            continue
        i += 1
        continue
    new_lines.append(line)
    i += 1

content = '\n'.join(new_lines)
with open('D:/Elyvori/elyvori-hq/src/App.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
print("Done. Banner removed:", 'Authenticated Confirmation Banner' not in content)
