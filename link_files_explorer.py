with open('D:/Elyvori/elyvori-hq/src/components/CompletionCertificate.tsx', encoding='utf-8', errors='replace', newline='') as f:
    content = f.read()

content = content.replace('\r\n', '\n')

# Add import
if 'ProjectFilesExplorer' not in content:
    content = content.replace(
        "import { Language } from '../types';",
        "import { Language } from '../types';\nimport { ProjectFilesExplorer } from './ProjectFilesExplorer';"
    )
    print("Added import")

# Add taskId and token props
old_interface = """interface CompletionCertificateProps {
  lang: Language;
  data: CertificateData;
  onClose: () => void;
  onDownload?: () => void;
}"""
new_interface = """interface CompletionCertificateProps {
  lang: Language;
  data: CertificateData;
  onClose: () => void;
  onDownload?: () => void;
  token?: string;
  taskId?: string;
}"""
content = content.replace(old_interface, new_interface)
print("Updated interface")

# Update function params
content = content.replace(
    "export function CompletionCertificate({ lang, data, onClose, onDownload }: CompletionCertificateProps)",
    "export function CompletionCertificate({ lang, data, onClose, onDownload, token, taskId }: CompletionCertificateProps)"
)
print("Updated params")

# Add showFiles state
old_const = "  const isAr = lang === 'ar';"
new_const = "  const isAr = lang === 'ar';\n  const [showFiles, setShowFiles] = useState(false);"
content = content.replace(old_const, new_const)

# Add useState import if needed
if "useState" not in content:
    content = content.replace(
        "import { Language } from '../types';",
        "import { useState } from 'react';\nimport { Language } from '../types';"
    )
print("Added state")

# Add View Files button next to Download
old_buttons = """          <div style={{ display: 'flex', gap: 12 }}>
            <button
              onClick={onClose}"""
new_buttons = """          {showFiles && (
            <ProjectFilesExplorer
              lang={lang}
              token={token || ''}
              taskId={taskId}
              onClose={() => setShowFiles(false)}
            />
          )}
          <div style={{ display: 'flex', gap: 12 }}>
            <button
              onClick={onClose}"""
content = content.replace(old_buttons, new_buttons)
print("Added files explorer trigger")

# Add View Files button
old_download_btn = """            <button
              onClick={onDownload}
              style={{
                flex: 2, padding: '12px 20px',
                background: `linear-gradient(135deg, ${agent.colorFrom}, ${agent.colorTo})`,
                border: 'none', borderRadius: 12,
                color: '#000', fontSize: 14, fontWeight: 800,
                cursor: 'pointer',
                boxShadow: `0 0 20px ${agent.colorFrom}40`,
              }}
            >
              {isAr ? '⬇️ تحميل الشهادة PDF' : '⬇️ Download Certificate PDF'}
            </button>"""
new_download_btn = """            <button
              onClick={() => setShowFiles(true)}
              style={{
                flex: 1, padding: '12px 20px',
                background: 'rgba(0,229,255,0.1)',
                border: '1px solid rgba(0,229,255,0.3)',
                borderRadius: 12,
                color: '#00E5FF', fontSize: 14, fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              {isAr ? '📁 عرض الملفات' : '📁 View Files'}
            </button>
            <button
              onClick={onDownload}
              style={{
                flex: 1, padding: '12px 20px',
                background: `linear-gradient(135deg, ${agent.colorFrom}, ${agent.colorTo})`,
                border: 'none', borderRadius: 12,
                color: '#000', fontSize: 14, fontWeight: 800,
                cursor: 'pointer',
                boxShadow: `0 0 20px ${agent.colorFrom}40`,
              }}
            >
              {isAr ? '⬇️ شهادة PDF' : '⬇️ Certificate PDF'}
            </button>"""

content = content.replace(old_download_btn, new_download_btn)
print("Added View Files button")

with open('D:/Elyvori/elyvori-hq/src/components/CompletionCertificate.tsx', 'w', encoding='utf-8', newline='\n') as f:
    f.write(content)
print("Saved!")
print("ALL DONE!")
