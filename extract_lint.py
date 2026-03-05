import json

with open('lint_results.json', 'r', encoding='utf-8') as f:
    results = json.load(f)

for file in results:
    if file['errorCount'] > 0:
        filepath = file['filePath']
        for msg in file['messages']:
            if msg['severity'] == 2:
                print(f"{filepath} - {msg['message']}")
