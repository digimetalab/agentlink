# Graph Report - .  (2026-05-09)

## Corpus Check
- Corpus is ~4,720 words - fits in a single context window. You may not need a graph.

## Summary
- 99 nodes · 170 edges · 23 communities (11 shown, 12 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 2 edges (avg confidence: 0.9)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- [[_COMMUNITY_Configuration Schemas|Configuration Schemas]]
- [[_COMMUNITY_CLI UI & Utilities|CLI UI & Utilities]]
- [[_COMMUNITY_AgentLink Core Logic|AgentLink Core Logic]]
- [[_COMMUNITY_MCP Adapters & Filesystem|MCP Adapters & Filesystem]]
- [[_COMMUNITY_Adapter Design Pattern|Adapter Design Pattern]]
- [[_COMMUNITY_Configuration Sync & Diff|Configuration Sync & Diff]]
- [[_COMMUNITY_Claude Adapter Implementation|Claude Adapter Implementation]]
- [[_COMMUNITY_Codex Adapter Implementation|Codex Adapter Implementation]]
- [[_COMMUNITY_Gemini Adapter Implementation|Gemini Adapter Implementation]]
- [[_COMMUNITY_OpenCode Adapter Implementation|OpenCode Adapter Implementation]]
- [[_COMMUNITY_CLI Initialization|CLI Initialization]]
- [[_COMMUNITY_AgentLink Initialization|AgentLink Initialization]]
- [[_COMMUNITY_Local Config Management|Local Config Management]]
- [[_COMMUNITY_Server Management (Add)|Server Management (Add)]]
- [[_COMMUNITY_Server Management (Remove)|Server Management (Remove)]]
- [[_COMMUNITY_Server Management (List)|Server Management (List)]]
- [[_COMMUNITY_Pull Workflow|Pull Workflow]]
- [[_COMMUNITY_Environment Utilities|Environment Utilities]]

## God Nodes (most connected - your core abstractions)
1. `writeJson()` - 14 edges
2. `AgentLink` - 13 edges
3. `fileExists()` - 9 edges
4. `readJson()` - 7 edges
5. `ClaudeAdapter` - 6 edges
6. `MCPConfig` - 6 edges
7. `CodexAdapter` - 5 edges
8. `GeminiAdapter` - 5 edges
9. `OpenCodeAdapter` - 5 edges
10. `interpolateConfig()` - 5 edges

## Surprising Connections (you probably didn't know these)
- `Adapter Pattern` --rationale_for--> `AgentAdapter`  [INFERRED]
  src/AgentLink.ts → src/adapters/base.ts
- `AgentLink` --references--> `ClaudeAdapter`  [EXTRACTED]
  src/AgentLink.ts → src/adapters/claude.ts
- `AgentLink` --references--> `GeminiAdapter`  [EXTRACTED]
  src/AgentLink.ts → src/adapters/gemini.ts
- `AgentLink` --references--> `OpenCodeAdapter`  [EXTRACTED]
  src/AgentLink.ts → src/adapters/opencode.ts
- `AgentLink` --references--> `CodexAdapter`  [EXTRACTED]
  src/AgentLink.ts → src/adapters/codex.ts

## Hyperedges (group relationships)
- **Sync Workflow** — agentlink_readlocalconfig, env_interpolateconfig, agentlink_sync [INFERRED 0.85]
- **MCP Adapters** — claude_claudeadapter, gemini_geminiadapter, opencode_opencodeadapter, codex_codexadapter [EXTRACTED 1.00]

## Communities (23 total, 12 thin omitted)

### Community 0 - "Configuration Schemas"
Cohesion: 0.19
Nodes (10): AgentLinkConfig, agentlinkSchema, mcpConfigSchema, MCPServerConfig, mcpServerSchema, AgentInfo, SyncOptions, SyncResult (+2 more)

### Community 1 - "CLI UI & Utilities"
Cohesion: 0.16
Nodes (14): agentLink, allAgents, centerPlain(), config, drawBanner(), info, installedNames, isInstalled (+6 more)

### Community 2 - "AgentLink Core Logic"
Cohesion: 0.26
Nodes (3): AgentLink, interpolateConfig(), interpolateEnv()

### Community 3 - "MCP Adapters & Filesystem"
Cohesion: 0.42
Nodes (4): MCPConfig, fileExists(), readJson(), writeJson()

### Community 4 - "Adapter Design Pattern"
Cohesion: 0.36
Nodes (8): Adapter Pattern, AgentLink, AgentAdapter, ClaudeAdapter, startREPL, CodexAdapter, GeminiAdapter, OpenCodeAdapter

### Community 5 - "Configuration Sync & Diff"
Cohesion: 0.4
Nodes (5): AgentLink.diff, AgentLink.sync, diffServers, interpolateConfig, Environment Variable Interpolation

## Knowledge Gaps
- **29 isolated node(s):** `AgentInfo`, `SyncOptions`, `SyncResult`, `program`, `agentLink` (+24 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **12 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `AgentLink` connect `AgentLink Core Logic` to `Configuration Schemas`, `CLI UI & Utilities`, `MCP Adapters & Filesystem`?**
  _High betweenness centrality (0.083) - this node is a cross-community bridge._
- **Why does `writeJson()` connect `MCP Adapters & Filesystem` to `Configuration Schemas`, `AgentLink Core Logic`, `Claude Adapter Implementation`, `Codex Adapter Implementation`, `Gemini Adapter Implementation`, `OpenCode Adapter Implementation`?**
  _High betweenness centrality (0.061) - this node is a cross-community bridge._
- **Why does `ClaudeAdapter` connect `Claude Adapter Implementation` to `Configuration Schemas`, `MCP Adapters & Filesystem`?**
  _High betweenness centrality (0.033) - this node is a cross-community bridge._
- **What connects `AgentInfo`, `SyncOptions`, `SyncResult` to the rest of the system?**
  _29 weakly-connected nodes found - possible documentation gaps or missing edges._