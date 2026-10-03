with open('D:/Elyvori/elyvori-hq/src/App.tsx', encoding='utf-8') as f:
    content = f.read()

# Add import
content = content.replace(
    "import { CustomerSupportPage } from './components/CustomerSupportPage';",
    "import { CustomerSupportPage } from './components/CustomerSupportPage';\nimport { NegotiationPage } from './components/NegotiationPage';"
)

# Add state
content = content.replace(
    "  const [showCustomerSupport, setShowCustomerSupport] = useState<boolean>(false);",
    "  const [showCustomerSupport, setShowCustomerSupport] = useState<boolean>(false);\n  const [showNegotiation, setShowNegotiation] = useState<boolean>(false);"
)

# Add prop to Navbar
content = content.replace(
    "onOpenCustomerSupport={() => setShowCustomerSupport(true)}",
    "onOpenCustomerSupport={() => setShowCustomerSupport(true)}\n        onOpenNegotiation={() => setShowNegotiation(true)}"
)

# Add routing
content = content.replace(
    "{showCustomerSupport ? (",
    "{showNegotiation ? (\n        <NegotiationPage lang={lang} onBack={() => setShowNegotiation(false)} />\n      ) : showCustomerSupport ? ("
)

with open('D:/Elyvori/elyvori-hq/src/App.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("Done:", content.count('Negotiation'))
