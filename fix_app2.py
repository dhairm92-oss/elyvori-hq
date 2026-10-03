with open('D:/Elyvori/elyvori-hq/src/App.tsx', encoding='utf-8') as f:
    content = f.read()

# Add import
content = content.replace(
    "import { ContractAnalyzerPage } from './components/ContractAnalyzerPage';",
    "import { ContractAnalyzerPage } from './components/ContractAnalyzerPage';\nimport { CustomerSupportPage } from './components/CustomerSupportPage';"
)

# Add state
content = content.replace(
    "const [showContractAnalyzer, setShowContractAnalyzer] = useState<boolean>(false);",
    "const [showContractAnalyzer, setShowContractAnalyzer] = useState<boolean>(false);\n  const [showCustomerSupport, setShowCustomerSupport] = useState<boolean>(false);"
)

# Add prop to Navbar
content = content.replace(
    "onOpenContractAnalyzer={() => setShowContractAnalyzer(true)}",
    "onOpenContractAnalyzer={() => setShowContractAnalyzer(true)}\n        onOpenCustomerSupport={() => setShowCustomerSupport(true)}"
)

# Add routing
content = content.replace(
    "{showContractAnalyzer ? (",
    "{showCustomerSupport ? (\n        <CustomerSupportPage lang={lang} onBack={() => setShowCustomerSupport(false)} />\n      ) : showContractAnalyzer ? ("
)

with open('D:/Elyvori/elyvori-hq/src/App.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("Done:", content.count('CustomerSupport'))
