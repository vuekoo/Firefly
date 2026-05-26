import subprocess
import os
import sys

os.chdir(r'C:\Users\sotu2\Desktop\blog\Firefly')

def run_cmd(cmd):
    """Run a command and return output"""
    try:
        result = subprocess.run(cmd, shell=True, capture_output=True, text=True)
        return result.returncode, result.stdout, result.stderr
    except Exception as e:
        return -1, '', str(e)

print('=== Git Status ===')
code, out, err = run_cmd('git status --porcelain')
print(out if out else '(clean)')
if err:
    print('Error:', err)

print('\n=== Checking for markdown_demonstrate in git ===')
code, out, err = run_cmd('git log --all --full-history --follow -- "src/content/posts/markdown_demonstrate.md"')
if 'commit' in out:
    print('File found in git history!')
    print(out[:500])
else:
    print('File not found in git history')

print('\n=== Listing tracked files with "demonstrate" ===')
code, out, err = run_cmd('git ls-files')
for line in out.split('\n'):
    if 'demonstrate' in line.lower():
        print(f'Found: {line}')

print('\n=== File exists locally? ===')
local_exists = os.path.exists('src/content/posts/markdown_demonstrate.md')
print(f'Local file: {local_exists}')

print('\nDone!')
