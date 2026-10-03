# 1. Update ContactDemoSection to accept onOpenTracker prop
with open('D:/Elyvori/elyvori-hq/src/components/ContactDemoSection.tsx', encoding='utf-8', errors='replace', newline='') as f:
    content = f.read()

content = content.replace('\r\n', '\n')

# Add onOpenTracker to interface
old_interface = """interface ContactDemoSectionProps {
  lang: Language;
}"""
new_interface = """interface ContactDemoSectionProps {
  lang: Language;
  onOpenTracker?: (taskId?: string) => void;
}"""
content = content.replace(old_interface, new_interface)
print("Added to interface")

# Add to function params
old_params = "export function ContactDemoSection({ lang }: ContactDemoSectionProps)"
new_params = "export function ContactDemoSection({ lang, onOpenTracker }: ContactDemoSectionProps)"
content = content.replace(old_params, new_params)
print("Added to params")

# Add taskId state
old_state = "  const [telegramUsername, setTelegramUsername] = useState('');"
new_state = "  const [telegramUsername, setTelegramUsername] = useState('');\n  const [taskId, setTaskId] = useState<string | null>(null);"
content = content.replace(old_state, new_state)
print("Added taskId state")

# After setStatus success, open tracker
old_success = "      setStatus('success');\n    } catch (err: any) {"
new_success = """      const tid = (responseData as any).taskId || (responseData as any).id || null;
      if (tid) setTaskId(tid);
      setStatus('success');
      // Auto-open tracker after 1.5 seconds
      if (onOpenTracker) {
        setTimeout(() => onOpenTracker(tid || undefined), 1500);
      }
    } catch (err: any) {"""
content = content.replace(old_success, new_success)
print("Added auto-open tracker")

with open('D:/Elyvori/elyvori-hq/src/components/ContactDemoSection.tsx', 'w', encoding='utf-8', newline='\n') as f:
    f.write(content)
print("Saved ContactDemoSection.tsx")

# 2. Update App.tsx to pass onOpenTracker to ContactDemoSection
with open('D:/Elyvori/elyvori-hq/src/App.tsx', encoding='utf-8', errors='replace', newline='') as f:
    content2 = f.read()

content2 = content2.replace('\r\n', '\n')

# Add taskId state
old_tracker_state = "  const [showTracker, setShowTracker] = useState<boolean>(false);"
new_tracker_state = "  const [showTracker, setShowTracker] = useState<boolean>(false);\n  const [trackerTaskId, setTrackerTaskId] = useState<string | undefined>(undefined);"
content2 = content2.replace(old_tracker_state, new_tracker_state)
print("Added trackerTaskId state to App")

# Find ContactDemoSection and add onOpenTracker prop
old_contact = "<ContactDemoSection lang={lang}"
new_contact = "<ContactDemoSection lang={lang} onOpenTracker={(tid) => { setTrackerTaskId(tid); setShowTracker(true); }}"
content2 = content2.replace(old_contact, new_contact)
print("Added onOpenTracker to ContactDemoSection")

# Update ProjectTracker to pass taskId
old_tracker = "<ProjectTracker lang={lang} token={auth.token || ''} />"
new_tracker = "<ProjectTracker lang={lang} token={auth.token || ''} taskId={trackerTaskId} />"
content2 = content2.replace(old_tracker, new_tracker)
print("Added taskId to ProjectTracker")

with open('D:/Elyvori/elyvori-hq/src/App.tsx', 'w', encoding='utf-8', newline='\n') as f:
    f.write(content2)
print("Saved App.tsx")
print("ALL DONE!")
