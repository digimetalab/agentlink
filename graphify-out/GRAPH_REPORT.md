# Graph Report - agentlink  (2026-05-09)

## Corpus Check
- 33 files · ~8,305 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 209 nodes · 293 edges · 34 communities (23 shown, 11 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 2 edges (avg confidence: 0.9)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `c334f972`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

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
- [[_COMMUNITY_Graphify Init Script|Graphify Init Script]]
- [[_COMMUNITY_Build Configuration|Build Configuration]]
- [[_COMMUNITY_Test Configuration|Test Configuration]]
- [[_COMMUNITY_CLI Binary Entry|CLI Binary Entry]]
- [[_COMMUNITY_Library Entry Point|Library Entry Point]]
- [[_COMMUNITY_Server Management (Remove)|Server Management (Remove)]]
- [[_COMMUNITY_Community 27|Community 27]]
- [[_COMMUNITY_Community 28|Community 28]]
- [[_COMMUNITY_Community 29|Community 29]]
- [[_COMMUNITY_Community 30|Community 30]]
- [[_COMMUNITY_Community 31|Community 31]]
- [[_COMMUNITY_Community 32|Community 32]]
- [[_COMMUNITY_Community 33|Community 33]]

## God Nodes (most connected - your core abstractions)
1. `writeJson()` - 19 edges
2. `AgentLink` - 14 edges
3. `agentlink` - 14 edges
4. `fileExists()` - 12 edges
5. `readJson()` - 8 edges
6. `BackupManager` - 7 edges
7. `ClaudeAdapter` - 6 edges
8. `MCPConfig` - 6 edges
9. `AgentLink Project Context` - 6 edges
10. `Getting Started` - 6 edges

## Surprising Connections (you probably didn't know these)
- `Adapter Pattern` --rationale_for--> `AgentAdapter`  [INFERRED]
  src/AgentLink.ts → src/adapters/base.ts
- `isInstalled()` --calls--> `fileExists()`  [EXTRACTED]
  src/adapters/base.ts → src/utils/fs.ts
- `writeConfig()` --calls--> `writeJson()`  [EXTRACTED]
  src/adapters/base.ts → src/utils/fs.ts
- `AgentLink` --references--> `ClaudeAdapter`  [EXTRACTED]
  src/AgentLink.ts → src/adapters/claude.ts
- `AgentLink` --references--> `GeminiAdapter`  [EXTRACTED]
  src/AgentLink.ts → src/adapters/gemini.ts

## Hyperedges (group relationships)
- **Sync Workflow** — agentlink_readlocalconfig, env_interpolateconfig, agentlink_sync [INFERRED 0.85]
- **MCP Adapters** — claude_claudeadapter, gemini_geminiadapter, opencode_opencodeadapter, codex_codexadapter [EXTRACTED 1.00]

## Communities (34 total, 11 thin omitted)

### Community 0 - "Configuration Schemas"
Cohesion: 0.08
Nodes (25): Advanced Usage, agentlink, agentlink.json Format, CLI Commands, code:block1 (Your agentlink.json), code:bash (npm install -g agentlink), code:bash (npx agentlink), code:bash (# Initialize agentlink in your project) (+17 more)

### Community 1 - "CLI UI & Utilities"
Cohesion: 0.12
Nodes (17): MCPServerConfig, DoctorResult, agentLink, allAgents, centerPlain(), config, drawBanner(), info (+9 more)

### Community 2 - "AgentLink Core Logic"
Cohesion: 0.37
Nodes (7): isInstalled(), writeConfig(), MCPConfig, mcpConfigSchema, fileExists(), readJson(), writeJson()

### Community 3 - "MCP Adapters & Filesystem"
Cohesion: 0.12
Nodes (16): AgentLink Project Context, Architecture & Project Structure, Building the Project, code:bash (npm install), code:bash (npm run build), code:bash (npm test          # Run tests once), code:bash (npx ts-node src/cli.ts), Core Technologies (+8 more)

### Community 4 - "Adapter Design Pattern"
Cohesion: 0.17
Nodes (10): GeminiAdapter, AgentLinkConfig, agentlinkSchema, mcpServerSchema, AgentHealth, AgentInfo, SyncOptions, SyncResult (+2 more)

### Community 5 - "Configuration Sync & Diff"
Cohesion: 0.15
Nodes (10): claude, invalidContent, BackupManager, agentDir, content, filePath, indices, jsonFiles (+2 more)

### Community 6 - "Claude Adapter Implementation"
Cohesion: 0.24
Nodes (3): AgentLink, interpolateConfig(), interpolateEnv()

### Community 7 - "Codex Adapter Implementation"
Cohesion: 0.15
Nodes (12): code:typescript (import { formatValidationError } from './utils/validation-fo), code:typescript (async readLocalConfig(): Promise<AgentLinkConfig> {), code:typescript (describe('readLocalConfig validation', () => {), code:markdown (---), code:block5, code:block6, code:markdown (| Command | Description |), code:bash (git add src/AgentLink.ts tests/AgentLink.test.ts README.md) (+4 more)

### Community 8 - "Gemini Adapter Implementation"
Cohesion: 0.15
Nodes (12): 1. Overview, 2.1 Backup Manager, 2.2 `agentlink doctor` Command, 2.3 Pretty Error Reporting, 2.4 Documentation & CLI Refinement, 2. Architecture: Integrated Orchestration, 3.1 Dependencies to Add, 3.2 Key Class Updates (+4 more)

### Community 9 - "OpenCode Adapter Implementation"
Cohesion: 0.36
Nodes (8): Adapter Pattern, AgentLink, AgentAdapter, ClaudeAdapter, startREPL, CodexAdapter, GeminiAdapter, OpenCodeAdapter

### Community 10 - "CLI Initialization"
Cohesion: 0.33
Nodes (5): formatValidationError(), formatted, result, rootSchema, schema

### Community 11 - "Graphify Init Script"
Cohesion: 0.4
Nodes (5): AgentLink.diff, AgentLink.sync, diffServers, interpolateConfig, Environment Variable Interpolation

### Community 14 - "CLI Binary Entry"
Cohesion: 0.5
Nodes (3): [0.1.0] - 2026-04-26, Added, Changelog

## Knowledge Gaps
- **84 isolated node(s):** `AgentInfo`, `SyncOptions`, `SyncResult`, `AgentHealth`, `program` (+79 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **11 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `AgentLink` connect `Claude Adapter Implementation` to `CLI UI & Utilities`, `AgentLink Core Logic`, `Adapter Design Pattern`, `Configuration Sync & Diff`?**
  _High betweenness centrality (0.029) - this node is a cross-community bridge._
- **Why does `writeJson()` connect `AgentLink Core Logic` to `Adapter Design Pattern`, `Configuration Sync & Diff`, `Claude Adapter Implementation`, `Build Configuration`, `Test Configuration`, `Library Entry Point`?**
  _High betweenness centrality (0.028) - this node is a cross-community bridge._
- **Why does `BackupManager` connect `Configuration Sync & Diff` to `Adapter Design Pattern`?**
  _High betweenness centrality (0.023) - this node is a cross-community bridge._
- **What connects `AgentInfo`, `SyncOptions`, `SyncResult` to the rest of the system?**
  _84 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Configuration Schemas` be split into smaller, more focused modules?**
  _Cohesion score 0.08 - nodes in this community are weakly interconnected._
- **Should `CLI UI & Utilities` be split into smaller, more focused modules?**
  _Cohesion score 0.12 - nodes in this community are weakly interconnected._
- **Should `MCP Adapters & Filesystem` be split into smaller, more focused modules?**
  _Cohesion score 0.12 - nodes in this community are weakly interconnected._