with open('D:/Elyvori/elyvori-hq/src/components/ContactDemoSection.tsx', encoding='utf-8', errors='replace', newline='') as f:
    content = f.read()

content = content.replace('\r\n', '\n')

# Add ContractModal import
if 'ContractModal' not in content:
    content = content.replace(
        "import { Language } from '../types';",
        "import { Language } from '../types';\nimport { ContractModal, ContractSignature } from './ContractModal';"
    )
    print("Added import")

# Add showContract state
if 'showContract' not in content:
    content = content.replace(
        "  const [taskId, setTaskId] = useState<string | null>(null);",
        """  const [taskId, setTaskId] = useState<string | null>(null);
  const [showContract, setShowContract] = useState(false);
  const [pendingData, setPendingData] = useState<{name:string;email:string;message:string;agentType:string} | null>(null);"""
    )
    print("Added state")

# Detect agent type from message
agent_detection = """
  const detectAgentType = (msg: string): string => {
    const m = msg.toLowerCase();
    if (m.includes('website') || m.includes('app') || m.includes('موقع') || m.includes('تطبيق')) return 'web-app-building';
    if (m.includes('digital product') || m.includes('pdf') || m.includes('template') || m.includes('منتج رقمي')) return 'digital-products';
    if (m.includes('recruit') || m.includes('hiring') || m.includes('cv') || m.includes('توظيف') || m.includes('سيرة')) return 'recruitment-crm';
    if (m.includes('marketing') || m.includes('campaign') || m.includes('تسويق') || m.includes('حملة')) return 'marketing-agent';
    if (m.includes('content') || m.includes('blog') || m.includes('article') || m.includes('محتوى') || m.includes('مقال')) return 'content-agent';
    if (m.includes('lead') || m.includes('prospect') || m.includes('عميل محتمل')) return 'lead-finder';
    if (m.includes('job') || m.includes('career') || m.includes('وظيفة') || m.includes('عمل')) return 'career-agent';
    if (m.includes('contract') || m.includes('legal') || m.includes('عقد') || m.includes('قانوني')) return 'contract-analyzer';
    if (m.includes('support') || m.includes('customer') || m.includes('دعم') || m.includes('عميل')) return 'customer-support';
    if (m.includes('negotiat') || m.includes('deal') || m.includes('تفاوض') || m.includes('صفقة')) return 'negotiation';
    return 'default';
  };
"""

if 'detectAgentType' not in content:
    content = content.replace(
        "  const handleSubmit = async (e: FormEvent) => {",
        agent_detection + "\n  const handleSubmit = async (e: FormEvent) => {"
    )
    print("Added agent detection")

# Show contract before submitting
old_submit_start = "  const handleSubmit = async (e: FormEvent) => {\n    e.preventDefault();\n    if (!name.trim() || !email.trim() || !message.trim()) return;\n    setStatus('loading');"
new_submit_start = """  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim()) return;
    // Show contract first
    const agentType = detectAgentType(message);
    setPendingData({ name: name.trim(), email: email.trim(), message: message.trim(), agentType });
    setShowContract(true);
  };

  const handleContractSigned = async (signature: ContractSignature) => {
    setShowContract(false);
    if (!pendingData) return;
    setStatus('loading');"""

if old_submit_start in content:
    content = content.replace(old_submit_start, new_submit_start)
    print("Modified submit to show contract first")

    # Fix the closing of handleSubmit - add closing brace for handleContractSigned
    old_catch = "    } catch (err: any) {\n      setErrorMessage(err.message || labels.error);\n      setStatus('error');\n    }\n  };"
    new_catch = """    } catch (err: any) {
      setErrorMessage(err.message || labels.error);
      setStatus('error');
    }
  };"""
    content = content.replace(old_catch, new_catch)

# Fix name/email/message references in fetch calls
content = content.replace(
    "name.trim()", "pendingData?.name || name.trim()"
).replace(
    "email.trim()", "pendingData?.email || email.trim()"
).replace(
    "message.trim()", "pendingData?.message || message.trim()"
)

# Add ContractModal to JSX - find return statement end
old_return_end = "  return (\n    <"
# Find the closing of the component
idx = content.rfind("  return (\n")
if idx > 0:
    print(f"Found return at {idx}")

# Add ContractModal before the main return
contract_jsx = """  return (
    <>
      {showContract && pendingData && (
        <ContractModal
          lang={lang}
          agentType={pendingData.agentType}
          clientName={pendingData.name}
          clientEmail={pendingData.email}
          projectDetails={pendingData.message}
          onSign={handleContractSigned}
          onClose={() => setShowContract(false)}
        />
      )}
"""

if '    <>\n      {showContract' not in content:
    content = content.replace("  return (\n    <section", contract_jsx + "    <section")
    # Find and fix the closing
    content = content.replace("  );\n}", "    </>\n  );\n}", 1)
    print("Added ContractModal to JSX")

with open('D:/Elyvori/elyvori-hq/src/components/ContactDemoSection.tsx', 'w', encoding='utf-8', newline='\n') as f:
    f.write(content)
print("Saved ContactDemoSection.tsx")
print("ALL DONE!")
