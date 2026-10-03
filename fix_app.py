with open('D:/Elyvori/elyvori-hq/src/App.tsx', encoding='utf-8') as f:
    content = f.read()

content = content.replace(
    "import { CareerAgentPage } from './components/CareerAgentPage';",
    "import { CareerAgentPage } from './components/CareerAgentPage';\nimport { ContractAnalyzerPage } from './components/ContractAnalyzerPage';"
)
content = content.replace(
    "const [showCareerAgent, setShowCareerAgent] = useState<boolean>(false);",
    "const [showCareerAgent, setShowCareerAgent] = useState<boolean>(false);\n  const [showContractAnalyzer, setShowContractAnalyzer] = useState<boolean>(false);"
)
content = content.replace(
    "onOpenCareerAgent={() => setShowCareerAgent(true)}",
    "onOpenCareerAgent={() => setShowCareerAgent(true)}\n        onOpenContractAnalyzer={() => setShowContractAnalyzer(true)}"
)
content = content.replace(
    "{showCareerAgent ? (",
    "{showContractAnalyzer ? (\n        <ContractAnalyzerPage lang={lang} onBack={() => setShowContractAnalyzer(false)} />\n      ) : showCareerAgent ? ("
)

with open('D:/Elyvori/elyvori-hq/src/App.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("Done")
