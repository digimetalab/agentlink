# Changelog

## [0.2.0] - 2026-05-09
### Added
- **`agentlink doctor` Command**: Comprehensive health check and "zombie server" detection.
- **Automated Backups**: Configurations are now automatically backed up to `~/.agentlink/backups/` before synchronization.
- **Pretty Error Snippets**: Informative visual reporting for JSON/Zod validation errors with line numbers and pointers.
- **Advanced Interpolation**: Support for default values in environment variables using `${VAR:-default}` syntax.
- **CLI Enhancements**: Added `--env` flag to the `add` command and improved REPL consistency.

### Changed
- **Atomic Writes**: Configuration files are now written using a temporary-file-and-rename pattern to prevent corruption.
- **Parallel Syncing**: Faster synchronization across all agents using parallel execution.
- **Improved Validation**: Strict Zod schema validation added to all configuration read/write operations.
- **Node.js Requirements**: Updated minimum required Node.js version to 20.12.0.

## [0.1.0] - 2026-04-26
### Added
- Initial release of agentlink.
- Universal MCP config synchronization.
- Support for Claude Code, Gemini CLI, OpenCode, and Codex adapters.
- Interactive and beautifully formatted CLI commands.
