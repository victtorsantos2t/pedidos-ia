import json
import codecs

with codecs.open('lint_final.json', 'r', encoding='utf-16le') as f:
    results = json.loads(f.read())

for file in results:
    if file['errorCount'] > 0:
        for msg in file['messages']:
            if msg.get('ruleId') in ('react/no-unescaped-entities', '@typescript-eslint/no-empty-object-type'):
                print(f"{file['filePath']} - {msg['ruleId']} at Line {msg.get('line', '?')}")
