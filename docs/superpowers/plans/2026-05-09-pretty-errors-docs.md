# Pretty Errors & Docs Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Improve error reporting for schema violations using pretty snippets and update user documentation to reflect new features.

**Architecture:** Integrate `formatValidationError` into `AgentLink.readLocalConfig` to provide contextual error messages when `agentlink.json` is invalid. Update `README.md` with comprehensive usage guides.

**Tech Stack:** TypeScript, Zod, Chalk, json-source-map, Vitest.

---

### Task 1: Update AgentLink to use Pretty Errors

**Files:**
- Modify: `src/AgentLink.ts`

- [ ] **Step 1: Import formatValidationError and fs**

```typescript
import { formatValidationError } from './utils/validation-formatter';
// ensure fs is imported from 'fs/promises' if not already
```

- [ ] **Step 2: Update readLocalConfig to use formatValidationError**

```typescript
  async readLocalConfig(): Promise<AgentLinkConfig> {
    if (!(await fileExists(this.configPath))) {
      throw new Error(`agentlink.json not found in ${path.dirname(this.configPath)}. Run 'agentlink init' first.`);
    }
    
    const rawContent = await fs.readFile(this.configPath, 'utf-8');
    let data: any;
    try {
      data = JSON.parse(rawContent);
    } catch (err: any) {
      throw new Error(`Failed to parse agentlink.json: ${err.message}`);
    }

    const result = agentlinkSchema.safeParse(data);
    if (!result.success) {
      const formattedError = formatValidationError(result.error, rawContent, 'agentlink.json');
      throw new Error(formattedError);
    }
    return result.data;
  }
```

### Task 2: Add Validation Error Test Case

**Files:**
- Modify: `tests/AgentLink.test.ts`

- [ ] **Step 1: Add a test case for validation errors**

```typescript
  describe('readLocalConfig validation', () => {
    it('should throw a formatted validation error when schema is invalid', async () => {
      vi.mocked(fsUtils.fileExists).mockResolvedValue(true);
      // Mock raw content with an invalid schema (e.g., version as a number instead of string)
      const invalidContent = JSON.stringify({
        version: 1, // Should be "1"
        mcpServers: {}
      }, null, 2);
      
      vi.mocked(fs.readFile).mockResolvedValue(invalidContent as any);
      
      await expect(agentLink.readLocalConfig()).rejects.toThrow(/Validation error in agentlink.json/);
    });
  });
```

- [ ] **Step 2: Run tests to verify**

Run: `npm test tests/AgentLink.test.ts`
Expected: PASS

### Task 3: Update README.md Documentation

**Files:**
- Modify: `README.md`

- [ ] **Step 1: Add "Advanced Usage" section with Env Var interpolation**

Add after "agentlink.json Format":

```markdown
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
```

- [ ] **Step 2: Update "CLI Commands" table**

Add `agentlink doctor` and clarify `--env` flag if necessary.

```markdown
| Command | Description |
|---|---|
| ... | ... |
| `agentlink add <name> --command <cmd> [--env K=V,...]` | Add an MCP server with optional env vars and sync |
| `agentlink doctor` | Run comprehensive health check and zombie detection |
```

- [ ] **Step 3: Commit all changes**

```bash
git add src/AgentLink.ts tests/AgentLink.test.ts README.md
git commit -m "feat: pretty validation errors and enhanced documentation"
```
