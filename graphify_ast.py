import sys, json
from graphify.extract import collect_files, extract
from pathlib import Path

code_files = []
try:
    with open('graphify-out/.graphify_detect.json', 'r') as f:
        detect = json.load(f)
except FileNotFoundError:
    print("Error: graphify-out/.graphify_detect.json not found.")
    sys.exit(1)

for f in detect.get('files', {}).get('code', []):
    path = Path(f)
    code_files.extend(collect_files(path) if path.is_dir() else [path])

if code_files:
    result = extract(code_files, cache_root=Path('.'))
    with open('graphify-out/.graphify_ast.json', 'w') as f:
        json.dump(result, f, indent=2)
    print(f'AST: {len(result["nodes"])} nodes, {len(result["edges"])} edges')
else:
    with open('graphify-out/.graphify_ast.json', 'w') as f:
        json.dump({'nodes':[],'edges':[],'input_tokens':0,'output_tokens':0}, f)
    print('No code files - skipping AST extraction')
