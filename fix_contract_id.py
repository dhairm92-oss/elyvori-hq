with open('D:/Elyvori/elyvori-hq/src/components/ContractModal.tsx', encoding='utf-8', errors='replace', newline='') as f:
    content = f.read()
content = content.replace('\r\n', '\n')

# Fix: use useState for contractId so it doesn't regenerate
old = """  const contract = AGENT_CONTRACTS[agentType] || AGENT_CONTRACTS['default'];
  const contractId = generateContractId();"""

new = """  const contract = AGENT_CONTRACTS[agentType] || AGENT_CONTRACTS['default'];
  const [contractId] = useState(() => generateContractId());"""

if old in content:
    content = content.replace(old, new)
    print("Fixed contractId!")
else:
    print("Pattern not found")

with open('D:/Elyvori/elyvori-hq/src/components/ContractModal.tsx', 'w', encoding='utf-8', newline='\n') as f:
    f.write(content)
print("Saved!")
