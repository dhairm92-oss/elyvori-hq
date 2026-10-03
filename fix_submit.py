with open('D:/Elyvori/elyvori-hq/src/components/ContactDemoSection.tsx', encoding='utf-8', errors='replace', newline='') as f:
    content = f.read()
content = content.replace('\r\n', '\n')

old = """  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!pendingData?.name || name.trim() || !pendingData?.email || email.trim() || !pendingData?.message || message.trim()) return;
    // Show contract first
    const agentType = detectAgentType(message);
    setPendingData({ name: pendingData?.name || name.trim(), email: pendingData?.email || email.trim(), message: pendingData?.message || message.trim(), agentType });
    setShowContract(true);
  };"""

new = """  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim()) return;
    // Show contract first
    const agentType = detectAgentType(message);
    setPendingData({ name: name.trim(), email: email.trim(), message: message.trim(), agentType });
    setShowContract(true);
  };"""

if old in content:
    content = content.replace(old, new)
    print("Fixed handleSubmit!")
else:
    print("Pattern not found")

with open('D:/Elyvori/elyvori-hq/src/components/ContactDemoSection.tsx', 'w', encoding='utf-8', newline='\n') as f:
    f.write(content)
print("Saved!")
