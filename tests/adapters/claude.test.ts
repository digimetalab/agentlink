import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ClaudeAdapter } from '../../src/adapters/claude';
import * as fsUtils from '../../src/utils/fs';
import os from 'os';
import path from 'path';

vi.mock('../../src/utils/fs');

describe('ClaudeAdapter', () => {
  let adapter: ClaudeAdapter;

  beforeEach(() => {
    adapter = new ClaudeAdapter();
    vi.resetAllMocks();
  });

  it('should return correct config path', () => {
    expect(adapter.getConfigPath()).toBe(path.join(os.homedir(), '.claude', 'mcp.json'));
  });

  it('isInstalled should return true if file exists', async () => {
    vi.mocked(fsUtils.fileExists).mockResolvedValue(true);
    expect(await adapter.isInstalled()).toBe(true);
  });

  it('readConfig should return empty mcpServers if file does not exist', async () => {
    vi.mocked(fsUtils.fileExists).mockResolvedValue(false);
    const config = await adapter.readConfig();
    expect(config).toEqual({ mcpServers: {} });
  });

  it('readConfig should read mcpServers from file', async () => {
    vi.mocked(fsUtils.fileExists).mockResolvedValue(true);
    vi.mocked(fsUtils.readJson).mockResolvedValue({ mcpServers: { test: { command: 'test' } } });
    
    const config = await adapter.readConfig();
    expect(config).toEqual({ mcpServers: { test: { command: 'test' } } });
  });

  it('writeConfig should save mcpServers to file', async () => {
    vi.mocked(fsUtils.fileExists).mockResolvedValue(true);
    vi.mocked(fsUtils.readJson).mockResolvedValue({ existingKey: 'value' });
    
    await adapter.writeConfig({ mcpServers: { test: { command: 'test' } } });
    
    expect(fsUtils.writeJson).toHaveBeenCalledWith(
      adapter.getConfigPath(),
      { existingKey: 'value', mcpServers: { test: { command: 'test' } } }
    );
  });
});
