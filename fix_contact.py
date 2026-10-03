with open('D:/Elyvori/elyvori-hq/src/components/ContactDemoSection.tsx', encoding='utf-8') as f:
    content = f.read()

# Add isContractMode state
content = content.replace(
    "  const [resumeFile, setResumeFile] = useState<File | null>(null);",
    "  const [resumeFile, setResumeFile] = useState<File | null>(null);\n  const [isContractMode, setIsContractMode] = useState(false);"
)

# Detect contract mode from response
content = content.replace(
    "      setStatus('success');\n      setName('');\n      setEmail('');\n      setMessage('');\n      setResumeFile(null);",
    "      const responseData = await response.json().catch(() => ({}));\n      setIsContractMode((responseData as any).mode === 'contract_analysis');\n      setStatus('success');\n      setName('');\n      setEmail('');\n      setMessage('');\n      setResumeFile(null);"
)

# Update success message
content = content.replace(
    "                {t.demo.form.successMessage}",
    """                {isContractMode
                  ? (lang === 'en'
                    ? '\\u2696\\ufe0f Your contract analysis is underway. A detailed forensic risk report with red flags and counter-proposals will arrive in your inbox within 2 minutes.'
                    : '\\u2696\\ufe0f \\u062c\\u0627\\u0631\\u064a \\u062a\\u062d\\u0644\\u064a\\u0644 \\u0639\\u0642\\u062f\\u0643 \\u0627\\u0644\\u0622\\u0646. \\u062a\\u0642\\u0631\\u064a\\u0631 \\u0645\\u062e\\u0627\\u0637\\u0631 \\u062a\\u0641\\u0635\\u064a\\u0644\\u064a \\u0633\\u064a\\u0635\\u0644 \\u0625\\u0644\\u0649 \\u0628\\u0631\\u064a\\u062f\\u0643 \\u062e\\u0644\\u0627\\u0644 \\u062f\\u0642\\u064a\\u0642\\u062a\\u064a\\u0646.')
                  : t.demo.form.successMessage}"""
)

with open('D:/Elyvori/elyvori-hq/src/components/ContactDemoSection.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

count = content.count('isContractMode')
print(f"Done: isContractMode appears {count} times")
