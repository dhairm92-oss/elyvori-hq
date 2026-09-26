with open('D:/Elyvori/elyvori-hq/src/components/ContactDemoSection.tsx', encoding='utf-8') as f:
    content = f.read()

# Add isSupportMode state
content = content.replace(
    "  const [isContractMode, setIsContractMode] = useState(false);",
    "  const [isContractMode, setIsContractMode] = useState(false);\n  const [isSupportMode, setIsSupportMode] = useState(false);"
)

# Detect support mode from response
content = content.replace(
    "      const responseData = await response.json().catch(() => ({}));\n      setIsContractMode((responseData as any).mode === 'contract_analysis');",
    "      const responseData = await response.json().catch(() => ({}));\n      setIsContractMode((responseData as any).mode === 'contract_analysis');\n      setIsSupportMode((responseData as any).mode === 'customer_support');"
)

# Update success message for support mode
content = content.replace(
    "                {isContractMode",
    "                {isSupportMode\n                  ? (lang === 'en'\n                    ? '🎯 Your customer support analysis is ready! A professional de-escalation report with ready-to-send response will arrive in your inbox within 2 minutes.'\n                    : '🎯 جاري تحليل رسالة العميل الآن. تقرير احترافي مع رد جاهز للإرسال سيصل إلى بريدك خلال دقيقتين.')\n                  : isContractMode"
)

# Close the ternary properly  
content = content.replace(
    "                  : t.demo.form.successMessage}",
    "                  : t.demo.form.successMessage}}"
)
# Fix double closing
content = content.replace(
    "                  : t.demo.form.successMessage}}",
    "                  : t.demo.form.successMessage}"
)

with open('D:/Elyvori/elyvori-hq/src/components/ContactDemoSection.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("Done:", content.count('isSupportMode'))
