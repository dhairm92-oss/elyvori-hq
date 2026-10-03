with open('D:/Elyvori/elyvori-hq/src/components/CompletionCertificate.tsx', encoding='utf-8', errors='replace', newline='') as f:
    content = f.read()
content = content.replace('\r\n', '\n')

# Add useState import
if "import { useState }" not in content and "import React" not in content:
    content = "import { useState } from 'react';\n" + content
    print("Added useState import!")
else:
    print("Already imported")

with open('D:/Elyvori/elyvori-hq/src/components/CompletionCertificate.tsx', 'w', encoding='utf-8', newline='\n') as f:
    f.write(content)
print("Saved!")
