with open('D:/Elyvori/elyvori-hq/src/components/ContactDemoSection.tsx', encoding='utf-8', errors='replace', newline='') as f:
    content = f.read()
content = content.replace('\r\n', '\n')

# Fix pendingData references in the fetch calls
# The issue is pendingData?.name etc used before pendingData is set
old = """        body: JSON.stringify({
          visitorName: pendingData?.name || name.trim(),
          visitorEmail: pendingData?.email || email.trim(),
          projectDetails: pendingData?.message || message.trim(),
        }),"""

new = """        body: JSON.stringify({
          visitorName: name.trim(),
          visitorEmail: email.trim(),
          projectDetails: message.trim(),
        }),"""

if old in content:
    content = content.replace(old, new)
    print("Fixed visitorName/Email/Details!")

# Fix telegramUsername reference
old2 = "body: JSON.stringify({ businessName: pendingData?.name || name.trim(), contactEmail: pendingData?.email || email.trim(), niche: pendingData?.message || message.trim(), lang, telegramUsername: telegramUsername.trim() })"
new2 = "body: JSON.stringify({ businessName: name.trim(), contactEmail: email.trim(), niche: message.trim(), lang, telegramUsername: telegramUsername.trim() })"

if old2 in content:
    content = content.replace(old2, new2)
    print("Fixed telegram!")

# Find and fix all pendingData references in handleContractSigned
idx = content.find('handleContractSigned')
if idx > 0:
    print("Found handleContractSigned")
    print(repr(content[idx:idx+500]))

with open('D:/Elyvori/elyvori-hq/src/components/ContactDemoSection.tsx', 'w', encoding='utf-8', newline='\n') as f:
    f.write(content)
print("Saved!")
