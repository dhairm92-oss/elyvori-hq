with open('D:/Elyvori/elyvori-hq/src/components/ProjectTracker.tsx', encoding='utf-8', errors='replace', newline='') as f:
    content = f.read()

content = content.replace('\r\n', '\n')

# Find where certificate is shown and add email sending
old = """          setShowCertificate(true);
        }, 1500);"""

new = """          setShowCertificate(true);
          // Send certificate email automatically
          if (clientEmail) {
            fetch(`${API}/public/send-certificate`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                clientName: clientName || 'Valued Client',
                clientEmail,
                agentType: agentType || 'default',
                projectDetails: projectDetails || '',
                contractId: contractId || 'N/A',
                certificateId: certId,
                completedAt: new Date().toISOString(),
              }),
            }).catch(() => {});
          }
        }, 1500);"""

if old in content:
    content = content.replace(old, new)
    print("Added email sending!")
else:
    print("Pattern not found")

with open('D:/Elyvori/elyvori-hq/src/components/ProjectTracker.tsx', 'w', encoding='utf-8', newline='\n') as f:
    f.write(content)
print("Saved!")
