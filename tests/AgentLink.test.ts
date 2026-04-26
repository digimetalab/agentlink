import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AgentLink } from '../src/AgentLink';
import * as fsUtils from '../src/utils/fs';

vi.mock('../src/utils/fs');

describe('AgentLink', () => {
  let agentLink: AgentLink;

  beforeEach(() => {
    agentLink = new AgentLink('/mock/dir');
    vi.resetAllMocks();
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
      
      await agentLink.addServer('test', { command: 'cmd' });
      expect(fsUtils.writeJson).toHaveBeenCalledWith(
        expect.stringContaining('agentlink.json'),
        { mcpServers: { test: { command: 'cmd' } } }
      );
    });
  });

  describe('removeServer', () => {
    it('should throw if server does not exist', async () => {
      vi.mocked(fsUtils.fileExists).mockResolvedValue(true);
      vi.mocked(fsUtils.readJson).mockResolvedValue({ mcpServers: {} });
      
      await expect(agentLink.removeServer('test')).rejects.toThrow(/not found in agentlink.json/);
    });

    it('should remove server and save', async () => {
      vi.mocked(fsUtils.fileExists).mockResolvedValue(true);
      vi.mocked(fsUtils.readJson).mockResolvedValue({ mcpServers: { test: { command: 'cmd' } } });
      
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
    it('should sync to target agents', async () => {
      vi.mocked(fsUtils.fileExists).mockImplementation(async (p: string) => {
        return p.includes('agentlink.json') || p.includes('.claude');
      });
      vi.mocked(fsUtils.readJson).mockImplementation(async (p: string) => {
        if (p.includes('agentlink.json')) return { mcpServers: { test: { command: 'sync' } } };
        return { mcpServers: {} };
      });

      const result = await agentLink.sync({ agents: ['claude'] });
      expect(result.synced).toEqual(['claude']);
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

      const diff = await agentLink.diff();
      expect(diff.claude).toBeDefined();
      expect(diff.claude.modified).toEqual(['test']);
    });
  });
});
