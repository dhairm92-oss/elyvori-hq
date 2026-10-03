# Fix App.tsx - add client info states and pass to ProjectTracker
with open('D:/Elyvori/elyvori-hq/src/App.tsx', encoding='utf-8', errors='replace', newline='') as f:
    content = f.read()
content = content.replace('\r\n', '\n')

# Add client info states
old_state = "  const [trackerTaskId, setTrackerTaskId] = useState<string | undefined>(undefined);"
new_state = """  const [trackerTaskId, setTrackerTaskId] = useState<string | undefined>(undefined);
  const [trackerClientName, setTrackerClientName] = useState<string>('');
  const [trackerClientEmail, setTrackerClientEmail] = useState<string>('');
  const [trackerContractId, setTrackerContractId] = useState<string>('');"""

if old_state in content:
    content = content.replace(old_state, new_state)
    print("Added client info states!")

# Update onOpenTracker to accept client info
old_tracker_open = "onOpenTracker={(tid) => { setTrackerTaskId(tid); setShowTracker(true); }}"
new_tracker_open = "onOpenTracker={(tid) => { setTrackerTaskId(tid); setShowTracker(true); }} onTrackerClientInfo={(name, email, contractId) => { setTrackerClientName(name); setTrackerClientEmail(email); setTrackerContractId(contractId); }}"

# Find ContactDemoSection in App.tsx and pass onOpenTracker with client info
old_contact = "onOpenTracker={(tid) => { setTrackerTaskId(tid); setShowTracker(true); }}"
new_contact = """onOpenTracker={(tid) => { setTrackerTaskId(tid); setShowTracker(true); }}"""

# Pass client info to ProjectTracker
old_project_tracker = "<ProjectTracker lang={lang} token={auth.token || ''} taskId={trackerTaskId} />"
new_project_tracker = "<ProjectTracker lang={lang} token={auth.token || ''} taskId={trackerTaskId} clientName={trackerClientName} clientEmail={trackerClientEmail} contractId={trackerContractId} />"

if old_project_tracker in content:
    content = content.replace(old_project_tracker, new_project_tracker)
    print("Updated ProjectTracker props!")
else:
    print("ProjectTracker pattern not found")

with open('D:/Elyvori/elyvori-hq/src/App.tsx', 'w', encoding='utf-8', newline='\n') as f:
    f.write(content)
print("Saved App.tsx!")

# Now update ContactDemoSection to pass client info when opening tracker
with open('D:/Elyvori/elyvori-hq/src/components/ContactDemoSection.tsx', encoding='utf-8', errors='replace', newline='') as f:
    c2 = f.read()
c2 = c2.replace('\r\n', '\n')

# Update interface to accept client info callback
old_iface = """interface ContactDemoSectionProps {
  lang: Language;
  onOpenTracker?: (taskId?: string) => void;
}"""
new_iface = """interface ContactDemoSectionProps {
  lang: Language;
  onOpenTracker?: (taskId?: string) => void;
  onTrackerClientInfo?: (name: string, email: string, contractId: string) => void;
}"""

if old_iface in c2:
    c2 = c2.replace(old_iface, new_iface)
    print("Updated ContactDemoSection interface!")

# Update function params
c2 = c2.replace(
    "export function ContactDemoSection({ lang, onOpenTracker }",
    "export function ContactDemoSection({ lang, onOpenTracker, onTrackerClientInfo }"
)

# Pass client info when opening tracker
old_open = """      const tid = (responseData as any).taskId || (responseData as any).id || null;
      if (tid) setTaskId(tid);
      setStatus('success');
      // Auto-open tracker after 1.5 seconds
      if (onOpenTracker) {
        setTimeout(() => onOpenTracker(tid || undefined), 1500);
      }"""

new_open = """      const tid = (responseData as any).taskId || (responseData as any).id || null;
      if (tid) setTaskId(tid);
      setStatus('success');
      // Auto-open tracker after 1.5 seconds
      if (onOpenTracker) {
        const cid = (signature as any)?.contractId || '';
        if (onTrackerClientInfo) {
          onTrackerClientInfo(pendingData.name, pendingData.email, cid);
        }
        setTimeout(() => onOpenTracker(tid || undefined), 1500);
      }"""

if old_open in c2:
    c2 = c2.replace(old_open, new_open)
    print("Updated onOpenTracker call!")
else:
    print("onOpenTracker pattern not found")

with open('D:/Elyvori/elyvori-hq/src/components/ContactDemoSection.tsx', 'w', encoding='utf-8', newline='\n') as f:
    f.write(c2)
print("Saved ContactDemoSection!")
print("ALL DONE!")
