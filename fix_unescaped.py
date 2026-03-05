import glob, re
import os

for fpath in glob.glob('src/components/**/*.tsx', recursive=True):
    with open(fpath, 'r', encoding='utf-8') as f:
        content = f.read()

    # The issue: "{value}" inside JSX. 
    # Example: "{rating.comment || 'Não informado.'}"
    new_content = re.sub(r'"\{([^}]+)\}"', r'&quot;{\1}&quot;', content)
    
    if new_content != content:
        with open(fpath, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f"Fixed {fpath}")
