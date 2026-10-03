with open('D:/Elyvori/elyvori-hq/src/App.tsx', encoding='utf-8', errors='replace', newline='') as f:
    content = f.read()
content = content.replace('\r\n', '\n')

old = "        <PricingSection\n            lang={lang}\n            onSelectPlan={(_planId) => {\n              if (!auth.isAuthenticated) {\n                setIsAuthModalOpen(true);\n              } else {\n                scrollTo('demo');\n              }\n            }}\n          />"

new = "        <PricingSection\n            lang={lang}\n            onOpenCheckout={(plan) => {\n              setCheckoutPlan(plan);\n              setShowCheckout(true);\n            }}\n            onSelectPlan={(_planId) => {\n              if (!auth.isAuthenticated) {\n                setIsAuthModalOpen(true);\n              } else {\n                scrollTo('demo');\n              }\n            }}\n          />"

if old in content:
    content = content.replace(old, new)
    print("Fixed!")
else:
    print("Still not found - trying bytes check")
    idx = content.find('<PricingSection')
    chunk = content[idx:idx+250]
    for i, ch in enumerate(chunk):
        if ord(ch) not in range(32, 127) and ch not in '\n\r\t':
            print(f"Non-ASCII at {i}: {repr(ch)} ord={ord(ch)}")

with open('D:/Elyvori/elyvori-hq/src/App.tsx', 'w', encoding='utf-8', newline='\n') as f:
    f.write(content)
print("Saved!")
