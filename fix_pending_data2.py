with open('D:/Elyvori/elyvori-hq/src/components/ContactDemoSection.tsx', encoding='utf-8', errors='replace', newline='') as f:
    content = f.read()
content = content.replace('\r\n', '\n')

# Fix all pendingData?.name → pendingData.name (it's checked with if(!pendingData) return)
content = content.replace("pendingData?.name || name.trim()", "pendingData.name")
content = content.replace("pendingData?.email || email.trim()", "pendingData.email")
content = content.replace("pendingData?.message || message.trim()", "pendingData.message")

print("Fixed all pendingData references!")

with open('D:/Elyvori/elyvori-hq/src/components/ContactDemoSection.tsx', 'w', encoding='utf-8', newline='\n') as f:
    f.write(content)
print("Saved!")
