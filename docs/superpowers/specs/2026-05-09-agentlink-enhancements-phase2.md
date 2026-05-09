# Design Spec: AgentLink Enhancements (Phase 2)

**Date**: 2026-05-09
**Status**: Draft
**Topic**: Advanced Diagnostics, Backups, Validation, and Documentation

## 1. Overview
This phase enhances AgentLink with professional-grade diagnostics, data protection, and user experience improvements. Key features include a global backup system, a comprehensive `doctor` command, snippet-style error reporting, and updated documentation.

## 2. Architecture: Integrated Orchestration
We will use an integrated approach where core logic resides in `AgentLink.ts`, supported by specialized utility classes.

### 2.1 Backup Manager
A new `BackupManager` class will handle configuration backups.
- **Location**: `~/.agentlink/backups/`
- **Logic**:
    - Triggered before any write operation in `AgentLink.sync`.
    - Stores files in `agent-name/YYYY-MM-DD_HH-mm-ss.json`.
    - Rotation: Max 10 files per agent.
- **Tools**: `fs-extra` (optional) or native `fs/promises`.

### 2.2 `agentlink doctor` Command
A diagnostic suite to verify system health.
- **Checks**:
    - Configuration file existence and permissions (R/W).
    - Schema integrity for `agentlink.json` and all detected agent configs.
    - **Zombie Detection**: Identify MCP servers present in agents but missing from `agentlink.json`.
    - **Consistency**: Verify if synchronized agents actually match the central config.
- **Output**: A clean summary table with actionable advice for failures.

### 2.3 Pretty Error Reporting
Transform Zod validation errors into visual code snippets.
- **Mechanism**:
    - Use `json-source-map` to find line/column numbers for Zod error paths.
    - Format output using a custom "snippet" formatter (similar to Rust/TS errors).
- **Triggers**:
    - During `sync` (if source or target is invalid).
    - During `doctor` execution.
    - During `add/remove` if the resulting file would be invalid.

### 2.4 Documentation & CLI Refinement
- **README.md**: Add "Advanced Usage", "Interpolation Cookbook", and "Security Best Practices".
- **CLI**: Update help descriptions and add the `doctor` command.
- **REPL**: Add `/doctor` and update `/add` help text.

## 3. Implementation Details

### 3.1 Dependencies to Add
- `json-source-map`: To map Zod paths to line numbers.
- `zod-validation-error`: For readable Zod error messages.

### 3.2 Key Class Updates
- `AgentLink.ts`:
    - `doctor()`: Main diagnostic logic.
    - `sync()`: Integrate `BackupManager`.
- `src/utils/backup.ts`: New utility for rotation and storage.
- `src/utils/validation-formatter.ts`: New utility for code snippets.

## 4. Testing Strategy
- **Unit Tests**:
    - `BackupManager`: Verify rotation and file creation.
    - `Doctor`: Mock broken configs and verify zombie detection logic.
    - `Validation Formatter`: Verify snippet generation from mock JSON strings.
- **Integration Tests**:
    - Run `sync` and verify backups are created correctly.

## 5. Success Criteria
- [ ] `agentlink doctor` reports all health checks and zombies correctly.
- [ ] Backups are created automatically and rotated at 10 files.
- [ ] Schema errors show code snippets with line numbers.
- [ ] README contains a clear cookbook for interpolation.
