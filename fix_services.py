with open('D:/Elyvori/elyvori-hq/src/translations.ts', encoding='utf-8') as f:
    content = f.read()

# Add Contract Analyzer service after Career Agent in English
old_en = """          iconName: 'Briefcase' as const,
        },
      ],
      interactivePreview: 'Live Capability Snapshot',"""

new_en = """          iconName: 'Briefcase' as const,
        },
        {
          id: 'contract-analyzer',
          title: 'Contract Analyzer',
          shortDesc: 'AI forensic scan of any contract — risk score, red flags, and ready-to-use counter-proposals to protect your interests.',
          fullDesc: 'Uploads or pastes any contract and performs a deep forensic analysis: calculates a 0-100 safety score, extracts dangerous clauses with plain-language explanations, identifies financial and liability risks, and generates professional counter-proposals you can use directly in negotiations.',
          badge: 'Legal Risk Guard',
          deliverables: [
            'Safety score (0-100) with instant verdict: sign, negotiate, or reject',
            'Red flag clauses identified with severity level and explanation',
            'Financial & liability risk breakdown',
            'Ready-to-use counter-proposals for every risky clause',
          ],
          metrics: 'Forensic AI contract protection, delivered in seconds',
          iconName: 'Scale' as const,
        },
      ],
      interactivePreview: 'Live Capability Snapshot',"""

content = content.replace(old_en, new_en)

# Add Scale to servicesList in pricing (English)
content = content.replace(
    "        'Career Agent',\n      ],",
    "        'Career Agent',\n        'Contract Analyzer',\n      ],"
)

# Add contractAnalyzer to plan limits (English - all 3 plans)
content = content.replace(
    "            careerAgent: '1 trial job match report',",
    "            careerAgent: '1 trial job match report',\n            contractAnalyzer: '1 trial contract analysis',"
)
content = content.replace(
    "            careerAgent: 'Up to 5 job match reports per month',",
    "            careerAgent: 'Up to 5 job match reports per month',\n            contractAnalyzer: 'Up to 10 contract analyses per month',"
)
content = content.replace(
    "            careerAgent: 'Unlimited job matching and cover letters',",
    "            careerAgent: 'Unlimited job matching and cover letters',\n            contractAnalyzer: 'Unlimited contract analyses',"
)

with open('D:/Elyvori/elyvori-hq/src/translations.ts', 'w', encoding='utf-8') as f:
    f.write(content)

count = content.count('contract-analyzer')
print(f"Done: contract-analyzer appears {count} times")
