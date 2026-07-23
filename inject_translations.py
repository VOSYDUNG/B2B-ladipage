import json
import re

with open("translations.json", "r", encoding="utf-8") as f:
    translations = json.load(f)

with open("script.js", "r", encoding="utf-8") as f:
    content = f.read()

start_pattern = r'const TRANSLATIONS = \{'
match = re.search(start_pattern, content)
if match:
    start_idx = match.end() - 1 # Points to '{'
    brace_count = 0
    end_idx = -1
    for i in range(start_idx, len(content)):
        if content[i] == '{':
            brace_count += 1
        elif content[i] == '}':
            brace_count -= 1
            if brace_count == 0:
                end_idx = i
                break
            
    if end_idx != -1:
        # Build new TRANSLATIONS string
        # since start_idx points to '{' and end_idx points to '}', we replace the whole block '{...}'
        new_translations_str = json.dumps(translations, ensure_ascii=False, indent=2)
        new_content = content[:start_idx] + new_translations_str + content[end_idx+1:]
        
        with open("script.js", "w", encoding="utf-8") as f:
            f.write(new_content)
        print("Successfully updated TRANSLATIONS in script.js")
    else:
        print("Failed to find end of TRANSLATIONS object")
else:
    print("Failed to find start of TRANSLATIONS object")
