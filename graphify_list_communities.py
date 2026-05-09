import json
from pathlib import Path

def list_communities():
    analysis = json.loads(Path('graphify-out/.graphify_analysis.json').read_text(encoding='utf-8'))
    extract = json.loads(Path('graphify-out/.graphify_extract.json').read_text(encoding='utf-8'))

    nodes = {n['id']: n['label'] for n in extract['nodes']}
    communities = analysis['communities']

    for cid, members in communities.items():
        member_labels = [nodes.get(m, m) for m in members]
        print(f'Community {cid}: {", ".join(member_labels[:10])}')

if __name__ == "__main__":
    list_communities()
