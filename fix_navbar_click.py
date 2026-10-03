with open('D:/Elyvori/elyvori-hq/src/components/Navbar.tsx', encoding='utf-8', errors='replace', newline='') as f:
    content = f.read()

content = content.replace('\r\n', '\n')

# Fix the dropdown container - add z-index and ensure it doesn't block
old = 'className="dropdown-enter absolute top-full mt-2 left-0 w-72 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl shadow-2xl overflow-hidden"'
new = 'className="dropdown-enter absolute top-full mt-2 left-0 w-72 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl shadow-2xl overflow-hidden z-50"'
content = content.replace(old, new)

# Fix the dropdown wrapper div - add z-index
old2 = 'className="relative">\n              <button\n                type="button"\n                onClick={() => setAgentsOpen(!agentsOpen)}'
new2 = 'className="relative z-40">\n              <button\n                type="button"\n                onClick={() => setAgentsOpen(!agentsOpen)}'
content = content.replace(old2, new2)

# Fix header z-index
old3 = '<header className="sticky top-0 z-40'
new3 = '<header className="sticky top-0 z-30'
content = content.replace(old3, new3)

# Make right controls higher z-index
old4 = '<div className="flex items-center gap-1.5 sm:gap-2">'
new4 = '<div className="flex items-center gap-1.5 sm:gap-2 relative z-50">'
content = content.replace(old4, new4)

with open('D:/Elyvori/elyvori-hq/src/components/Navbar.tsx', 'w', encoding='utf-8', newline='\n') as f:
    f.write(content)
print("Fixed navbar z-index")
print("Done!")
