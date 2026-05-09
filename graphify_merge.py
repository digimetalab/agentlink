import json
from pathlib import Path

def merge():
    try:
        with open('graphify-out/.graphify_ast.json', 'r') as f:
            ast = json.load(f)
    except FileNotFoundError:
        ast = {'nodes': [], 'edges': []}

    try:
        with open('graphify-out/graphify_chunk_01.json', 'r') as f:
            sem = json.load(f)
    except FileNotFoundError:
        sem = {'nodes': [], 'edges': [], 'hyperedges': []}

    # Merge nodes
    seen = {n['id'] for n in ast['nodes']}
    merged_nodes = list(ast['nodes'])
    for n in sem.get('nodes', []):
        if n['id'] not in seen:
            merged_nodes.append(n)
            seen.add(n['id'])

    # Merge edges
    merged_edges = ast.get('edges', []) + sem.get('edges', [])
    
    # Merge hyperedges
    merged_hyperedges = sem.get('hyperedges', [])

    merged = {
        'nodes': merged_nodes,
        'edges': merged_edges,
        'hyperedges': merged_hyperedges,
        'input_tokens': sem.get('input_tokens', 0),
        'output_tokens': sem.get('output_tokens', 0),
    }

    with open('graphify-out/.graphify_extract.json', 'w') as f:
        json.dump(merged, f, indent=2)
    
    # Also save to .graphify_semantic.json for consistency with skill
    with open('graphify-out/.graphify_semantic.json', 'w') as f:
        json.dump(sem, f, indent=2)

    print(f'Merged: {len(merged_nodes)} nodes, {len(merged_edges)} edges ({len(ast["nodes"])} AST + {len(sem.get("nodes", []))} semantic)')

if __name__ == "__main__":
    merge()
