with open('D:/Elyvori/elyvori-hq/src/App.tsx', encoding='utf-8', errors='replace', newline='') as f:
    content = f.read()

content = content.replace('\r\n', '\n')

# Restore 3D background
content = content.replace(
    "{/* <Elyvori3DBackground theme={theme} lang={lang} /> */}",
    "<Elyvori3DBackground theme={theme} lang={lang} />"
)

# Restore FloatingSideLogo
content = content.replace(
    "{/* <FloatingSideLogo isDark={theme === 'dark'} lang={lang} /> */}",
    "<FloatingSideLogo isDark={theme === 'dark'} lang={lang} />"
)

with open('D:/Elyvori/elyvori-hq/src/App.tsx', 'w', encoding='utf-8', newline='\n') as f:
    f.write(content)
print("Restored backgrounds")
print("Done!")
