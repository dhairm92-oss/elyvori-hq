with open('D:/Elyvori/elyvori-hq/src/App.tsx', encoding='utf-8', errors='replace', newline='') as f:
    content = f.read()
content = content.replace('\r\n', '\n')

old = """        <ContactDemoSection lang={lang} onOpenTracker={(tid) => { setTrackerTaskId(tid); setShowTracker(true); }} />"""

new = """        <ContactDemoSection
            lang={lang}
            onOpenTracker={(tid) => { setTrackerTaskId(tid); setShowTracker(true); }}
            onTrackerClientInfo={(name, email, contractId) => {
              setTrackerClientName(name);
              setTrackerClientEmail(email);
              setTrackerContractId(contractId);
            }}
          />"""

if old in content:
    content = content.replace(old, new)
    print("Fixed ContactDemoSection!")
else:
    print("Not found")
    idx = content.find('ContactDemoSection lang=')
    print(repr(content[idx:idx+150]))

with open('D:/Elyvori/elyvori-hq/src/App.tsx', 'w', encoding='utf-8', newline='\n') as f:
    f.write(content)
print("Saved!")
