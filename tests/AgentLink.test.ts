import { describe, it, expect, vi, beforeEach } from 'vitest';
import fs from 'fs/promises';
import { AgentLink } from '../src/AgentLink';
import * as fsUtils from '../src/utils/fs';
import { BackupManager } from '../src/utils/backup';

vi.mock('fs/promises');
vi.mock('../src/utils/fs');
vi.mock('../src/utils/backup');

describe('AgentLink', () => {
  let agentLink: AgentLink;
  let mockBackupManager: any;

  beforeEach(() => {
    vi.resetAllMocks();
    agentLink = new AgentLink('/mock/dir');
    mockBackupManager = (BackupManager as any).mock.instances[0];
  });

  describe('detectAgents', () => {
    it('should return empty if no agents installed', async () => {
      vi.mocked(fsUtils.fileExists).mockResolvedValue(false);
      const agents = await agentLink.detectAgents();
      expect(agents).toEqual([]);
    });

    it('should return installed agents', async () => {
      vi.mocked(fsUtils.fileExists).mockImplementation(async (p: string) => {
        return p.includes('.claude') || p.includes('.gemini');
      });
      const agents = await agentLink.detectAgents();
      expect(agents.map(a => a.name)).toEqual(['claude', 'gemini']);
    });
  });

  describe('addServer', () => {
    it('should throw if agentlink.json does not exist', async () => {
      vi.mocked(fsUtils.fileExists).mockResolvedValue(false);
      await expect(agentLink.addServer('test', { command: 'test' })).rejects.toThrow(/not found/);
    });

    it('should add server and save', async () => {
      vi.mocked(fsUtils.fileExists).mockResolvedValue(true);
      vi.mocked(fsUtils.readJson).mockResolvedValue({ mcpServers: {} });
      vi.mocked(fs.readFile).mockResolvedValue(JSON.stringify({ mcpServers: {} }));
      
      await agentLink.addServer('test', { command: 'cmd' });
      expect(fsUtils.writeJson).toHaveBeenCalledWith(
        expect.stringContaining('agentlink.json'),
        { mcpServers: { test: { command: 'cmd' } } }
      );
    });
  });

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

  describe('removeServer', () => {
    it('should throw if server does not exist', async () => {
      vi.mocked(fsUtils.fileExists).mockResolvedValue(true);
      vi.mocked(fsUtils.readJson).mockResolvedValue({ mcpServers: {} });
      vi.mocked(fs.readFile).mockResolvedValue(JSON.stringify({ mcpServers: {} }));
      
      await expect(agentLink.removeServer('test')).rejects.toThrow(/not found in agentlink.json/);
    });

    it('should remove server and save', async () => {
      vi.mocked(fsUtils.fileExists).mockResolvedValue(true);
      vi.mocked(fsUtils.readJson).mockResolvedValue({ mcpServers: { test: { command: 'cmd' } } });
      vi.mocked(fs.readFile).mockResolvedValue(JSON.stringify({ mcpServers: { test: { command: 'cmd' } } }));
      
      await agentLink.removeServer('test');
      expect(fsUtils.writeJson).toHaveBeenCalledWith(
        expect.stringContaining('agentlink.json'),
        { mcpServers: {} }
      );
    });
  });

  describe('listServers', () => {
    it('should return servers', async () => {
      vi.mocked(fsUtils.fileExists).mockResolvedValue(true);
      vi.mocked(fsUtils.readJson).mockResolvedValue({ mcpServers: { test: { command: 'cmd' } } });
      vi.mocked(fs.readFile).mockResolvedValue(JSON.stringify({ mcpServers: { test: { command: 'cmd' } } }));
      
      const servers = await agentLink.listServers();
      expect(servers).toEqual({ test: { command: 'cmd' } });
    });
  });

  describe('pull', () => {
    it('should pull from agent and save to local', async () => {
      vi.mocked(fsUtils.fileExists).mockImplementation(async (p: string) => {
        return p.includes('.claude') || p.includes('agentlink.json');
      });
      vi.mocked(fsUtils.readJson).mockImplementation(async (p: string) => {
        if (p.includes('.claude')) return { mcpServers: { test: { command: 'pulled' } } };
        return { mcpServers: {} };
      });
      vi.mocked(fs.readFile).mockImplementation(async (p: string) => {
        if (p.includes('agentlink.json')) return JSON.stringify({ mcpServers: {} });
        return '';
      });
      
      await agentLink.pull('claude');
      expect(fsUtils.writeJson).toHaveBeenCalledWith(
        expect.stringContaining('agentlink.json'),
        expect.objectContaining({ mcpServers: { test: { command: 'pulled' } } })
      );
    });

    it('should throw if agent does not exist', async () => {
      await expect(agentLink.pull('unknown')).rejects.toThrow(/Unknown agent/);
    });
  });

  describe('sync', () => {
    it('should sync to target agents and create a backup', async () => {
      vi.mocked(fsUtils.fileExists).mockImplementation(async (p: string) => {
        return p.includes('agentlink.json') || p.includes('.claude');
      });
      vi.mocked(fsUtils.readJson).mockImplementation(async (p: string) => {
        if (p.includes('agentlink.json')) return { mcpServers: { test: { command: 'sync' } } };
        if (p.includes('.claude')) return { mcpServers: { old: { command: 'old' } } };
        return {};
      });
      vi.mocked(fs.readFile).mockImplementation(async (p: string) => {
        if (p.includes('agentlink.json')) return JSON.stringify({ mcpServers: { test: { command: 'sync' } } });
        return '';
      });

      const result = await agentLink.sync({ agents: ['claude'] });
      expect(result.synced).toEqual(['claude']);
      
      // Verify backup was created
      expect(mockBackupManager.createBackup).toHaveBeenCalledWith('claude', { 
        mcpServers: { old: { command: 'old' } } 
      });

      // Verify config was updated
      expect(fsUtils.writeJson).toHaveBeenCalledWith(
        expect.stringContaining('.claude'),
        { mcpServers: { test: { command: 'sync' } } }
      );
    });
  });

  describe('diff', () => {
    it('should return diffs for installed agents', async () => {
      vi.mocked(fsUtils.fileExists).mockImplementation(async (p: string) => {
        return p.includes('agentlink.json') || p.includes('.claude');
      });
      vi.mocked(fsUtils.readJson).mockImplementation(async (p: string) => {
        if (p.includes('agentlink.json')) return { mcpServers: { test: { command: 'new' } } };
        if (p.includes('.claude')) return { mcpServers: { test: { command: 'old' } } };
        return {};
      });
      vi.mocked(fs.readFile).mockImplementation(async (p: string) => {
        if (p.includes('agentlink.json')) return JSON.stringify({ mcpServers: { test: { command: 'new' } } });
        return '';
      });

      const diff = await agentLink.diff();
      expect(diff.claude).toBeDefined();
      expect(diff.claude.modified).toEqual(['test']);
    });
  });

  describe('doctor', () => {
    it('should report healthy state when everything is fine', async () => {
      vi.mocked(fsUtils.fileExists).mockResolvedValue(true);
      vi.mocked(fsUtils.readJson).mockImplementation(async (p: string) => {
        if (p.includes('agentlink.json')) return { mcpServers: { test: { command: 'cmd' } } };
        if (p.includes('.claude')) return { mcpServers: { test: { command: 'cmd' } } };
        return { mcpServers: {} };
      });
      vi.mocked(fs.readFile).mockImplementation(async (p: string) => {
        if (p.includes('agentlink.json')) return JSON.stringify({ mcpServers: { test: { command: 'cmd' } } });
        return '';
      });
      vi.mocked(fs.access).mockResolvedValue(undefined); // Success

      const result = await agentLink.doctor();
      expect(result.localConfigValid).toBe(true);
      const claude = result.agents.find(a => a.name === 'claude');
      expect(claude?.isInstalled).toBe(true);
      expect(claude?.permissions.read).toBe(true);
      expect(claude?.permissions.write).toBe(true);
      expect(claude?.isValidConfig).toBe(true);
      expect(claude?.zombies).toEqual([]);
      expect(claude?.issues).toEqual([]);
    });

    it('should detect zombie servers', async () => {
      vi.mocked(fsUtils.fileExists).mockResolvedValue(true);
      vi.mocked(fsUtils.readJson).mockImplementation(async (p: string) => {
        if (p.includes('agentlink.json')) return { mcpServers: { test: { command: 'cmd' } } };
        if (p.includes('.claude')) return { mcpServers: { test: { command: 'cmd' }, zombie: { command: 'z' } } };
        return { mcpServers: {} };
      });
      vi.mocked(fs.readFile).mockImplementation(async (p: string) => {
        if (p.includes('agentlink.json')) return JSON.stringify({ mcpServers: { test: { command: 'cmd' } } });
        return '';
      });
      vi.mocked(fs.access).mockResolvedValue(undefined);

      const result = await agentLink.doctor();
      const claude = result.agents.find(a => a.name === 'claude');
      expect(claude?.zombies).toEqual(['zombie']);
    });

    it('should report permission issues', async () => {
      vi.mocked(fsUtils.fileExists).mockImplementation(async (p: string) => p.includes('.claude'));
      vi.mocked(fsUtils.readJson).mockResolvedValue({ mcpServers: {} });
      vi.mocked(fs.access).mockRejectedValue(new Error('Permission denied'));

      const result = await agentLink.doctor();
      const claude = result.agents.find(a => a.name === 'claude');
      expect(claude?.permissions.read).toBe(false);
      expect(claude?.permissions.write).toBe(false);
      expect(claude?.issues).toContain('No read permission');
      expect(claude?.issues).toContain('No write permission');
    });

    it('should report invalid config', async () => {
      vi.mocked(fsUtils.fileExists).mockResolvedValue(true);
      vi.mocked(fsUtils.readJson).mockImplementation(async (p: string) => {
        if (p.includes('agentlink.json')) return { mcpServers: {} };
        if (p.includes('.claude')) return { invalid: 'config' };
        return {};
      });
      vi.mocked(fs.access).mockResolvedValue(undefined);

      const result = await agentLink.doctor();
      const claude = result.agents.find(a => a.name === 'claude');
      expect(claude?.isValidConfig).toBe(false);
      expect(claude?.issues[0]).toMatch(/Invalid config format/);
    });
  });
});
