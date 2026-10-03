with open('D:/Elyvori/elyvori-hq/src/translations.ts', encoding='utf-8', errors='replace', newline='') as f:
    content = f.read()

# Find the end of Arabic services items and add missing 3
old = """          iconName: 'Briefcase' as const,
        },
      ],
      interactivePreview: 'ظ†ط¸ط±ط© ط¹ط§ظ…ط© ط¹ظ„ظ‰ ط§ظ„ط¥ظ…ظƒط§ظ†ظٹط§طھ ط§ظ„ظپط¹ظ„ظٹط©',"""

new = """          iconName: 'Briefcase' as const,
        },
        {
          id: 'contract-analyzer',
          title: 'وكيل تحليل العقود',
          shortDesc: 'يحلل العقود القانونية بعمق ويكشف الثغرات والمخاطر والبنود المجحفة.',
          fullDesc: 'يقرأ العقد كاملاً ويحدد البنود الإشكالية والمخاطر القانونية والثغرات، ويقدم توصيات واضحة لحماية مصالحك.',
          badge: 'الحماية القانونية',
          deliverables: [
            'تحليل شامل لكل بنود العقد',
            'كشف الثغرات والمخاطر الخفية',
            'توصيات قانونية واضحة وقابلة للتنفيذ',
            'ملخص تنفيذي للنقاط الحرجة',
          ],
          metrics: 'حماية قانونية فورية',
          iconName: 'Scale' as const,
        },
        {
          id: 'negotiation',
          title: 'وكيل التفاوض',
          shortDesc: 'يحلل المحادثات التجارية ويقدم ردوداً ذكية لتحسين نتائج التفاوض.',
          fullDesc: 'يدرس سياق المفاوضات ويقترح استراتيجيات وردوداً مدروسة تساعدك على الحصول على أفضل النتائج.',
          badge: 'استراتيجية التفاوض',
          deliverables: [
            'تحليل موقف الطرف الآخر وأهدافه',
            'استراتيجيات تفاوض مخصصة للموقف',
            'ردود جاهزة للسيناريوهات المختلفة',
            'تقييم صفقة عادل وموضوعي',
          ],
          metrics: 'صفقات أفضل في وقت أقل',
          iconName: 'Handshake' as const,
        },
        {
          id: 'customer-support',
          title: 'وكيل خدمة العملاء',
          shortDesc: 'يرد على استفسارات العملاء بذكاء ويحل مشاكلهم تلقائياً.',
          fullDesc: 'يفهم سياق العميل ومشكلته ويقدم ردوداً دقيقة ومفيدة تعكس صوت علامتك التجارية وتحل المشكلة فعلاً.',
          badge: 'رضا العملاء',
          deliverables: [
            'ردود ذكية تعكس صوت العلامة التجارية',
            'تصعيد المشاكل المعقدة للفريق المختص',
            'تحليل أنماط المشاكل المتكررة',
            'تحسين مستمر بناءً على التغذية الراجعة',
          ],
          metrics: 'استجابة فورية على مدار الساعة',
          iconName: 'HeadphonesIcon' as const,
        },
      ],
      interactivePreview: 'نظرة عامة على الإمكانيات الفعلية',"""

content_lf = content.replace('\r\n', '\n')
if old in content_lf:
    content_lf = content_lf.replace(old, new)
    with open('D:/Elyvori/elyvori-hq/src/translations.ts', 'w', encoding='utf-8', newline='\n') as f:
        f.write(content_lf)
    print("SUCCESS: Added 3 missing Arabic services")
else:
    print("Pattern not found")
    idx = content_lf.find("iconName: 'Briefcase' as const,\n        },\n      ],")
    print(f"Found at: {idx}")
