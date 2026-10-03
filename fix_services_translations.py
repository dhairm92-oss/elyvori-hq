with open('D:/Elyvori/elyvori-hq/src/translations.ts', encoding='utf-8') as f:
    content = f.read()

# Add Customer Support and Negotiation to English services
en_new_services = """          iconName: 'Scale' as const,
        },
        {
          id: 'customer-support',
          title: 'Customer Support AI',
          shortDesc: 'Instantly analyze angry customer messages and generate professional de-escalation strategies with ready-to-send responses.',
          fullDesc: 'Paste any customer complaint — WhatsApp, email, or live chat — and receive a full sentiment analysis, churn risk score, de-escalation strategy, internal action steps, and a ready-to-send response in seconds.',
          badge: 'Customer Experience',
          deliverables: [
            'Sentiment analysis: tone, churn risk, and resolution time estimate',
            'Professional de-escalation strategy tailored to the situation',
            'Ready-to-send response in the right tone and channel',
            'Internal action steps and compensation suggestions',
          ],
          metrics: 'Instant de-escalation, delivered in seconds',
          iconName: 'HeadphonesIcon' as const,
        },
        {
          id: 'negotiation',
          title: 'AI Negotiation Simulator',
          shortDesc: 'Practice real negotiation scenarios against a smart AI counterparty — get live scoring, tactic feedback, and coaching before the real deal.',
          fullDesc: 'Select a negotiation persona and scenario, then engage in a realistic back-and-forth simulation. The AI acts as your counterparty, analyzes every move you make, scores your tactics in real time, and coaches you toward a better outcome.',
          badge: 'Negotiation Training',
          deliverables: [
            'Real-time negotiation scoring (0-100) per move',
            'Tactic identification: anchoring, concession, pressure detection',
            'Live coaching tips after every exchange',
            'Deal summary and agreed terms upon completion',
          ],
          metrics: 'Real-time negotiation coaching',
          iconName: 'Handshake' as const,
        },"""

content = content.replace(
    "          iconName: 'Scale' as const,\n        },\n      ],\n      interactivePreview: 'Live Capability Snapshot',",
    en_new_services + "\n      ],\n      interactivePreview: 'Live Capability Snapshot',"
)

# Add to Arabic services (find Arabic contract-analyzer section)
ar_new_services = """          iconName: 'Scale' as const,
        },
        {
          id: 'customer-support',
          title: 'ذكاء دعم العملاء',
          shortDesc: 'حلل رسائل العملاء الغاضبين فوراً واحصل على استراتيجية تهدئة احترافية مع رد جاهز للإرسال.',
          fullDesc: 'الصق أي شكوى من عميل — واتساب أو إيميل أو محادثة مباشرة — واحصل على تحليل كامل للمشاعر ودرجة خطر الفقدان واستراتيجية تهدئة وخطوات داخلية ورد جاهز في ثوانٍ.',
          badge: 'تجربة العملاء',
          deliverables: [
            'تحليل المشاعر: النبرة، مخاطر الفقدان، وتقدير وقت الحل',
            'استراتيجية تهدئة احترافية مصممة للموقف',
            'رد جاهز للإرسال بالنبرة والقناة المناسبة',
            'خطوات داخلية ومقترحات تعويض',
          ],
          metrics: 'تهدئة فورية في ثوانٍ',
          iconName: 'HeadphonesIcon' as const,
        },
        {
          id: 'negotiation',
          title: 'محاكاة التفاوض الذكي',
          shortDesc: 'تدرب على سيناريوهات تفاوض حقيقية مع طرف ذكاء اصطناعي — احصل على تقييم فوري وتحليل تكتيكات وتدريب قبل الصفقة الحقيقية.',
          fullDesc: 'اختر شخصية تفاوض وسيناريو، ثم انخرط في محاكاة واقعية. يتصرف الذكاء الاصطناعي كطرفك المقابل، ويحلل كل حركة، ويقيّم تكتيكاتك في الوقت الفعلي، ويدربك نحو نتيجة أفضل.',
          badge: 'تدريب التفاوض',
          deliverables: [
            'تقييم التفاوض الفوري (0-100) لكل حركة',
            'تحديد التكتيكات: التثبيت، التنازل، كشف الضغط',
            'نصائح تدريبية حية بعد كل تبادل',
            'ملخص الصفقة والشروط المتفق عليها عند الانتهاء',
          ],
          metrics: 'تدريب تفاوض في الوقت الفعلي',
          iconName: 'Handshake' as const,
        },"""

# Find Arabic contract-analyzer block
content = content.replace(
    "          iconName: 'Scale' as const,\n        },\n      ],\n      interactivePreview: '\u0644\u0642\u0637\u0629",
    ar_new_services + "\n      ],\n      interactivePreview: '\u0644\u0642\u0637\u0629"
)

with open('D:/Elyvori/elyvori-hq/src/translations.ts', 'w', encoding='utf-8') as f:
    f.write(content)

# Count services
en_count = content.count("id: 'digital-products'")
print(f"Done. EN services blocks: checking...")
import re
ids = re.findall(r"id: '(digital-products|web-app|recruitment|marketing|content|lead|career|contract|customer-support|negotiation)'", content)
print(f"Service IDs found: {len(ids)} — {set(ids)}")
