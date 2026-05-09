import json
from graphify.detect import detect
from pathlib import Path
import sys

# Write interpreter path
mkdir_path = Path('graphify-out')
mkdir_path.mkdir(exist_ok=True)
with open('graphify-out/.graphify_python', 'w') as f:
    f.write(sys.executable)

# Detect files
result = detect(Path('.'))
with open('graphify-out/.graphify_detect.json', 'w') as f:
    json.dump(result, f)

# Print summary
corpus = result.get('total_files', 0)
words = result.get('total_words', 0)
print(f"Corpus: {corpus} files · ~{words} words")

files = result.get('files', {})
for cat, paths in files.items():
    if paths:
        exts = set(Path(p).suffix for p in paths)
        print(f"  {cat}: {len(paths)} files ({' '.join(exts)})")
