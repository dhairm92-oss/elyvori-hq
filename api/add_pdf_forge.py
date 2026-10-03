with open('D:/Elyvori/apps/api/src/app.module.ts', encoding='utf-8', errors='replace', newline='') as f:
    content = f.read()
content = content.replace('\r\n', '\n')

# Add import
old_import = "import { TrendSentinelModule } from './trend-sentinel/trend-sentinel.module';"
new_import = """import { TrendSentinelModule } from './trend-sentinel/trend-sentinel.module';
import { PdfForgeModule } from './pdf-forge/pdf-forge.module';"""

if old_import in content:
    content = content.replace(old_import, new_import)
    print("Added PdfForgeModule import!")

# Add to imports array
old_arr = "    TrendSentinelModule,"
new_arr = "    TrendSentinelModule,\n    PdfForgeModule,"

if old_arr in content:
    content = content.replace(old_arr, new_arr)
    print("Added to imports array!")

with open('D:/Elyvori/apps/api/src/app.module.ts', 'w', encoding='utf-8', newline='\n') as f:
    f.write(content)
print("Saved!")
