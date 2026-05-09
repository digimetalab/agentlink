# AgentLink Project Context

## Project Overview
**AgentLink** is a universal MCP (Model Context Protocol) configuration synchronization tool for AI coding agents. It allows developers to define MCP servers once in a single `agentlink.json` file and synchronize that configuration across multiple supported agents, including Claude Code, Gemini CLI, OpenCode, and OpenAI Codex.

### Core Technologies
- **Runtime:** Node.js
- **Language:** TypeScript
- **Architecture:** Adapter-based design for supporting multiple agents.
- **CLI Framework:** Commander.js
- **Validation:** Zod
- **Build Tool:** tsup
- **Testing:** Vitest

## Getting Started

### Prerequisites
- Node.js (Latest LTS recommended)
- npm

### Installation
```bash
npm install
```

### Building the Project
```bash
npm run build
```

### Running Tests
```bash
npm test          # Run tests once
npm run test:watch # Run tests in watch mode
```

### Development Mode / REPL
To run the CLI in development mode (launches the REPL if no arguments are provided):
```bash
npx ts-node src/cli.ts
# or after build
node bin/agentlink.js
```

## Architecture & Project Structure

- `src/AgentLink.ts`: The main orchestration class. Handles initialization, agent detection, syncing, and server management.
- `src/adapters/`: Contains the `AgentAdapter` interface and specific implementations for each supported AI agent.
  - `base.ts`: Abstract base class for adapters.
  - `claude.ts`, `gemini.ts`, etc.: Agent-specific configuration handling.
- `src/schema/`: Zod schemas for `agentlink.json` and MCP server configurations.
- `src/utils/`: Shared utilities for file system operations, diffing, and environment variable interpolation.
- `src/cli.ts`: Entry point for the CLI and REPL interface.

## Development Conventions

- **TypeScript:** Use strict typing. Define interfaces/types for all data structures.
- **Schema First:** Always update the Zod schemas in `src/schema/` when changing the configuration format.
- **Adapters:** When adding support for a new agent, create a new adapter in `src/adapters/` that extends `BaseAdapter`.
- **Testing:** Every new feature or bug fix should be accompanied by a test in the `tests/` directory. Use Vitest for assertions and mocking.
- **Error Handling:** Use descriptive error messages. In the CLI, use `ora` for spinners and `chalk` for colored output.
- **Secrets:** Never write raw secrets to configuration files. Use environment variable interpolation (e.g., `${GITHUB_TOKEN}`) which AgentLink handles during sync.

## Key Commands

- `agentlink init`: Initializes a new `agentlink.json`.
- `agentlink sync`: Syncs the local `agentlink.json` to all detected agents.
- `agentlink add <name> --command <cmd>`: Adds a new MCP server.
- `agentlink status`: Shows detected agents and their config paths.
- `agentlink pull --from <agent>`: Imports configuration from an existing agent.
