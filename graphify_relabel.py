import sys, json
from graphify.build import build_from_json
from graphify.analyze import god_nodes, surprising_connections, suggest_questions
from graphify.report import generate
from pathlib import Path

def regenerate_report():
    extraction = json.loads(Path('graphify-out/.graphify_extract.json').read_text(encoding='utf-8'))
    detection  = json.loads(Path('graphify-out/.graphify_detect.json').read_text(encoding='utf-8'))
    analysis   = json.loads(Path('graphify-out/.graphify_analysis.json').read_text(encoding='utf-8'))

    G = build_from_json(extraction)
    communities = {int(k): v for k, v in analysis['communities'].items()}
    cohesion = {int(k): v for k, v in analysis['cohesion'].items()}
    tokens = {'input': extraction.get('input_tokens', 0), 'output': extraction.get('output_tokens', 0)}

    labels = {
        0: "Configuration Schemas",
        1: "CLI UI & Utilities",
        2: "AgentLink Core Logic",
        3: "MCP Adapters & Filesystem",
        4: "Adapter Design Pattern",
        5: "Configuration Sync & Diff",
        6: "Claude Adapter Implementation",
        7: "Codex Adapter Implementation",
        8: "Gemini Adapter Implementation",
        9: "OpenCode Adapter Implementation",
        10: "CLI Initialization",
        11: "Graphify Init Script",
        12: "Build Configuration",
        13: "Test Configuration",
        14: "CLI Binary Entry",
        15: "Library Entry Point",
        16: "AgentLink Initialization",
        17: "Local Config Management",
        18: "Server Management (Add)",
        19: "Server Management (Remove)",
        20: "Server Management (List)",
        21: "Pull Workflow",
        22: "Environment Utilities"
    }

    questions = suggest_questions(G, communities, labels)

    report = generate(G, communities, cohesion, labels, analysis['gods'], analysis['surprises'], detection, tokens, '.', suggested_questions=questions)
    Path('graphify-out/GRAPH_REPORT.md').write_text(report, encoding='utf-8')
    Path('graphify-out/.graphify_labels.json').write_text(json.dumps({str(k): v for k, v in labels.items()}), encoding='utf-8')
    print('Report updated with community labels')

if __name__ == "__main__":
    regenerate_report()
