with open('D:/Elyvori/elyvori-hq/src/components/ProjectTracker.tsx', encoding='utf-8', errors='replace', newline='') as f:
    content = f.read()
content = content.replace('\r\n', '\n')

old = """          if (data.step && data.step > 0) {
            updateStep(Math.min(data.step - 1, steps.length - 1));
            if (data.status === 'done' || data.step >= steps.length) {
              showCert(steps.length - 1);
            }
          }"""

new = """          if (data.step && data.step > 0) {
            if (data.status === 'done' || data.step >= steps.length) {
              // All done - mark all steps as done
              setSteps(prev => prev.map(s => ({ ...s, status: 'done' as const })));
              setCurrentStepIdx(steps.length);
              showCert(steps.length - 1);
            } else {
              updateStep(Math.min(data.step - 1, steps.length - 1));
            }
          }"""

if old in content:
    content = content.replace(old, new)
    print("Fixed polling completion!")
else:
    print("Pattern not found")

with open('D:/Elyvori/elyvori-hq/src/components/ProjectTracker.tsx', 'w', encoding='utf-8', newline='\n') as f:
    f.write(content)
print("Saved!")
