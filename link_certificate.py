with open('D:/Elyvori/elyvori-hq/src/components/ProjectTracker.tsx', encoding='utf-8', errors='replace', newline='') as f:
    content = f.read()

content = content.replace('\r\n', '\n')

# Add import
if 'CompletionCertificate' not in content:
    content = content.replace(
        "import { Language } from '../types';",
        "import { Language } from '../types';\nimport { CompletionCertificate, CertificateData } from './CompletionCertificate';"
    )
    print("Added import")

# Add clientName and clientEmail props
old_interface = """interface ProjectTrackerProps {
  lang: Language;
  token: string;
  taskId?: string;
  agentType?: string;
}"""
new_interface = """interface ProjectTrackerProps {
  lang: Language;
  token: string;
  taskId?: string;
  agentType?: string;
  clientName?: string;
  clientEmail?: string;
  projectDetails?: string;
  contractId?: string;
}"""
content = content.replace(old_interface, new_interface)
print("Updated interface")

# Add certificate state
old_func = "export function ProjectTracker({ lang, token, taskId, agentType }: ProjectTrackerProps) {"
new_func = "export function ProjectTracker({ lang, token, taskId, agentType, clientName, clientEmail, projectDetails, contractId }: ProjectTrackerProps) {"
content = content.replace(old_func, new_func)
print("Updated function params")

# Add certificate state variable
old_states = "  const [currentStepIdx, setCurrentStepIdx] = useState(0);"
new_states = """  const [currentStepIdx, setCurrentStepIdx] = useState(0);
  const [showCertificate, setShowCertificate] = useState(false);
  const [certificateData, setCertificateData] = useState<CertificateData | null>(null);"""
content = content.replace(old_states, new_states)
print("Added certificate state")

# Show certificate when complete
old_complete = "    const timer = setTimeout(() => {\n      setSteps(prev => {\n        const newSteps = [...prev];\n        if (currentStepIdx < newSteps.length) {\n          newSteps[currentStepIdx] = { ...newSteps[currentStepIdx], status: 'done' };\n          if (currentStepIdx + 1 < newSteps.length) {\n            newSteps[currentStepIdx + 1] = { ...newSteps[currentStepIdx + 1], status: 'running' };\n          }\n        }\n        return newSteps;\n      });\n      setCurrentStepIdx(prev => prev + 1);\n    }, 3000);"

new_complete = """    const timer = setTimeout(() => {
      setSteps(prev => {
        const newSteps = [...prev];
        if (currentStepIdx < newSteps.length) {
          newSteps[currentStepIdx] = { ...newSteps[currentStepIdx], status: 'done' };
          if (currentStepIdx + 1 < newSteps.length) {
            newSteps[currentStepIdx + 1] = { ...newSteps[currentStepIdx + 1], status: 'running' };
          }
        }
        return newSteps;
      });
      const nextIdx = currentStepIdx + 1;
      setCurrentStepIdx(nextIdx);
      // Show certificate when all steps done
      if (nextIdx >= steps.length && steps.length > 0) {
        setTimeout(() => {
          const certId = Math.random().toString(36).substring(2, 10).toUpperCase();
          setCertificateData({
            clientName: clientName || 'Valued Client',
            clientEmail: clientEmail || '',
            agentType: agentType || 'default',
            projectDetails: projectDetails || '',
            contractId: contractId || 'N/A',
            completedAt: new Date().toISOString(),
            certificateId: certId,
          });
          setShowCertificate(true);
        }, 1500);
      }
    }, 3000);"""

if old_complete in content:
    content = content.replace(old_complete, new_complete)
    print("Added certificate trigger")
else:
    print("Timer pattern not found")

# Add certificate modal to return
old_return = "  return (\n    <div style={{"
new_return = """  return (
    <>
      {showCertificate && certificateData && (
        <CompletionCertificate
          lang={lang}
          data={certificateData}
          onClose={() => setShowCertificate(false)}
          onDownload={() => {
            alert(lang === 'ar' ? 'جاري تحضير PDF...' : 'Preparing PDF...');
          }}
        />
      )}
    <div style={{"""

content = content.replace(old_return, new_return)

# Fix closing tag
content = content.replace(
    "  );\n}",
    "    </div>\n    </>\n  );\n}",
    1
)
print("Added certificate to JSX")

with open('D:/Elyvori/elyvori-hq/src/components/ProjectTracker.tsx', 'w', encoding='utf-8', newline='\n') as f:
    f.write(content)
print("Saved!")
print("ALL DONE!")
