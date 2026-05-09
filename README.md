# agentlink

> Universal MCP config sync for AI coding agents — one command to rule them all.

[![npm version](https://img.shields.io/npm/v/agentlink.svg?style=flat-square)](https://www.npmjs.com/package/agentlink)
[![npm downloads](https://img.shields.io/npm/dw/agentlink.svg?style=flat-square)](https://www.npmjs.com/package/agentlink)
[![license](https://img.shields.io/npm/l/agentlink.svg?style=flat-square)](./LICENSE)
[![GitHub](https://img.shields.io/badge/github-digimetalab%2Fagentlink-blue?style=flat-square)](https://github.com/digimetalab/agentlink)

---

## The Problem

You use multiple AI coding agents — **Claude Code**, **Gemini CLI**, **Codex**, **OpenCode** — and every single one has its own config file in a different location with a different format.

Add a new MCP server? You have to configure it **four times**. Remove one? Same story. It's 2026 and we're still copying JSON by hand.

**agentlink fixes this.**

---

## What is agentlink?

`agentlink` is a CLI tool and npm package that acts as a **universal MCP configuration layer** across all major AI coding agents. Define your MCP servers once in a single `agentlink.json` file — agentlink syncs it everywhere.

```
Your agentlink.json
       │
       ├──▶ ~/.claude/mcp.json          (Claude Code)
       ├──▶ ~/.gemini/mcp_servers.json  (Gemini CLI)
       ├──▶ ~/.opencode/mcp.json        (OpenCode)
       └──▶ ~/.codex/mcp.json           (OpenAI Codex)
```

---

## Install

```bash
npm install -g agentlink
```

Or use without installing:

```bash
npx agentlink
```

---

## Quick Start

```bash
# Initialize agentlink in your project
npx agentlink init

# Add an MCP server (syncs to all connected agents)
npx agentlink add github

# Sync your config to all detected agents
npx agentlink sync

# Check status — which agents are linked
npx agentlink status
```

---

## CLI Commands

| Command | Description |
|---|---|
| `agentlink init` | Initialize `agentlink.json` in current directory |
| `agentlink sync` | Sync MCP config to all detected agents |
| `agentlink sync --agents claude,gemini` | Sync to specific agents only |
| `agentlink add <name> --command <cmd> [--env K=V,...]` | Add an MCP server with optional env vars and sync |
| `agentlink remove <mcp-server>` | Remove an MCP server and sync |
| `agentlink list` | List all configured MCP servers |
| `agentlink status` | Show all linked agents and their config paths |
| `agentlink pull` | Pull config from a specific agent as source of truth |
| `agentlink diff` | Show config differences between agents |
| `agentlink doctor` | Run comprehensive health check and zombie detection |

---

## Supported Agents

| Agent | Config Path | Status |
|---|---|---|
| Claude Code | `~/.claude/mcp.json` | ✅ Supported |
| Gemini CLI | `~/.gemini/mcp_servers.json` | ✅ Supported |
| OpenCode | `~/.opencode/mcp.json` | ✅ Supported |
| OpenAI Codex | `~/.codex/mcp.json` | ✅ Supported |
| Cursor | `.cursor/mcp.json` | 🔜 Coming soon |
| Windsurf | `.windsurf/mcp.json` | 🔜 Coming soon |

---

## agentlink.json Format

```json
{
  "$schema": "https://agentlink.dev/schema/v1.json",
  "version": "1",
  "mcpServers": {
    "github": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-github"],
      "env": {
        "GITHUB_TOKEN": "${GITHUB_TOKEN}"
      }
    },
    "filesystem": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-filesystem", "/home/user/projects"]
    },
    "context7": {
      "command": "npx",
      "args": ["-y", "@upstash/context7-mcp"]
    }
  },
  "agents": {
    "include": ["claude", "gemini", "opencode", "codex"],
    "autoSync": true
  }
}
```

---

## Advanced Usage

### Environment Variable Interpolation

AgentLink supports environment variable interpolation in your `agentlink.json`. This allows you to share configurations without committing sensitive secrets like API keys.

Use the `${VAR_NAME}` or `${VAR_NAME:-default_value}` syntax:

```json
{
  "mcpServers": {
    "github": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-github"],
      "env": {
        "GITHUB_TOKEN": "${GITHUB_TOKEN}"
      }
    }
  }
}
```

**Security Benefit:** When syncing, AgentLink replaces these placeholders with actual values from your local environment. Raw secrets are **never** written to `agentlink.json`, keeping your repository safe.

### Health Check (Doctor)

If you're experiencing issues with sync or permissions, run the `doctor` command:

```bash
agentlink doctor
```

This will perform a comprehensive health check, including:
- Validating your local `agentlink.json`
- Checking install status and permissions for all supported agents
- Detecting "zombie" servers (servers defined in an agent's config but missing from `agentlink.json`)

---

## Use as a Library

```typescript
import { AgentLink } from 'agentlink';

const link = new AgentLink();

// Detect all installed agents
const agents = await link.detectAgents();
console.log(agents); // ['claude', 'gemini', 'opencode']

// Sync config to all agents
await link.sync();

// Add a new MCP server programmatically
await link.addServer('github', {
  command: 'npx',
  args: ['-y', '@modelcontextprotocol/server-github'],
  env: { GITHUB_TOKEN: process.env.GITHUB_TOKEN }
});

// Get diff between agents
const diff = await link.diff('claude', 'gemini');
```

---

## Why agentlink?

- **Zero learning curve** — works with your existing MCP configs
- **Agent auto-detection** — finds installed agents automatically
- **Conflict resolution** — smart merge when configs diverge
- **Env variable safety** — never writes raw secrets to config files
- **TypeScript-first** — full type safety, works in any JS/TS project
- **MCP standard** — follows the Model Context Protocol specification

---

## Roadmap

- [x] Core sync engine
- [x] Claude Code + Gemini CLI support
- [x] OpenCode + Codex support
- [ ] Cursor & Windsurf support
- [ ] GUI companion app
- [ ] Team config sharing via git
- [ ] MCP server marketplace integration

---

## Contributing

PRs welcome! See [CONTRIBUTING.md](./CONTRIBUTING.md).

```bash
git clone https://github.com/digimetalab/agentlink
cd agentlink
npm install
npm run dev
```

---

## License

MIT © [digimetalab](https://github.com/digimetalab)

---

<div align="center">
  <sub>Built for the vibe coding era ⚡ by <a href="https://github.com/digimetalab">digimetalab</a></sub>
</div>