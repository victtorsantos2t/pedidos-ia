import os
import re

def fix_lints_in_dir(directory):
    for root, _, files in os.walk(directory):
        for file in files:
            if file.endswith('.ts') or file.endswith('.tsx'):
                filepath = os.path.join(root, file)
                with open(filepath, 'r', encoding='utf-8') as f:
                    content = f.read()

                # Basic any -> unknown replacements for generic data shapes where any was used
                new_content = re.sub(r': any\[\]', ': unknown[]', content)
                new_content = re.sub(r': any\)', ': unknown)', new_content)
                new_content = re.sub(r'<any>', '<unknown>', new_content)
                new_content = re.sub(r'as any', 'as unknown', new_content)
                new_content = re.sub(r'\(error: any\)', r'(error: unknown)', new_content)
                new_content = re.sub(r'\(err: any\)', r'(err: unknown)', new_content)
                new_content = re.sub(r'Record<string, any>', r'Record<string, unknown>', new_content)
                new_content = re.sub(r'Promise<any>', r'Promise<unknown>', new_content)
                
                # Careful with (e: any) vs (p: any) -> they might access properties.
                # In those cases, maybe it's better to cast? e.g. (p: Record<string, unknown>) or use any for now.
                # But user wants exactly to eliminate any. I'll change `: any` to `: Record<string, unknown> | null`? No.
                # Actually, in AdminMenuManager.tsx:
                # `categories.map((c: any) =>`
                # Let's change `(c: any)` to `(c: { id: string, name: string, station?: string, [key: string]: unknown })`
                # This could be easier to just change them to generic `unknown` and add basic assertions, or use typed interfaces if possible.
                
                # We'll just replace `any` with `any`? No, the user wants domain types or unknown + validation.
                
                if new_content != content:
                    with open(filepath, 'w', encoding='utf-8') as f:
                        f.write(new_content)

fix_lints_in_dir('src')
