import path from 'path';
import fs from 'fs/promises';
import { constants } from 'fs';
import { AgentAdapter } from './adapters/base';
import { ClaudeAdapter } from './adapters/claude';
import { GeminiAdapter } from './adapters/gemini';
import { OpenCodeAdapter } from './adapters/opencode';
import { CodexAdapter } from './adapters/codex';
import { AgentLinkConfig, agentlinkSchema } from './schema/agentlink.schema';
import { MCPServerConfig, mcpConfigSchema } from './schema/mcp.schema';
import { readJson, writeJson, fileExists } from './utils/fs';
import { diffServers, DiffResult } from './utils/diff';
import { interpolateConfig } from './utils/env';
import { BackupManager } from './utils/backup';
import { formatValidationError } from './utils/validation-formatter';

export interface AgentInfo {
  name: string;
  configPath: string;
}

export interface SyncOptions {
  agents?: string[];
  dryRun?: boolean;
}

export interface SyncResult {
  synced: string[];
  failed: string[];
}

export interface AgentHealth {
  name: string;
  isInstalled: boolean;
  configPath?: string;
  permissions: {
    read: boolean;
    write: boolean;
  };
  isValidConfig: boolean;
  zombies: string[];
  issues: string[];
}

export interface DoctorResult {
  agents: AgentHealth[];
  localConfigValid: boolean;
}

export class AgentLink {
  private configPath: string;
  private adapters: AgentAdapter[];
  private backupManager: BackupManager;

  constructor(cwd: string = process.cwd()) {
    this.configPath = path.join(cwd, 'agentlink.json');
    this.adapters = [
      new ClaudeAdapter(),
      new GeminiAdapter(),
      new OpenCodeAdapter(),
      new CodexAdapter()
    ];
    this.backupManager = new BackupManager();
  }

  async init(): Promise<void> {
    if (await fileExists(this.configPath)) {
      throw new Error(`agentlink.json already exists in ${path.dirname(this.configPath)}`);
    }
    const defaultConfig: AgentLinkConfig = {
      $schema: "https://agentlink.dev/schema/v1.json",
      version: "1",
      mcpServers: {},
      agents: {
        include: ["claude", "gemini", "opencode", "codex"],
        autoSync: true
      }
    };
    await writeJson(this.configPath, defaultConfig);
  }

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

  async detectAgents(): Promise<AgentInfo[]> {
    const installed: AgentInfo[] = [];
    for (const adapter of this.adapters) {
      if (await adapter.isInstalled()) {
        installed.push({
          name: adapter.name,
          configPath: adapter.getConfigPath(),
        });
      }
    }
    return installed;
  }

  async sync(options: SyncOptions = {}): Promise<SyncResult> {
    const config = await this.readLocalConfig();
    const servers = config.mcpServers || {};
    const interpolatedServers = interpolateConfig(servers);
    
    let targetAdapters = this.adapters;
    if (options.agents && options.agents.length > 0) {
      targetAdapters = this.adapters.filter(a => options.agents!.includes(a.name));
    } else if (config.agents?.include) {
      targetAdapters = this.adapters.filter(a => config.agents!.include!.includes(a.name));
    }

    const result: SyncResult = { synced: [], failed: [] };

    await Promise.all(targetAdapters.map(async (adapter) => {
      if (!(await adapter.isInstalled())) {
        result.failed.push(adapter.name);
        return;
      }
      try {
        if (!options.dryRun) {
          const agentConfig = await adapter.readConfig();
          // Create a deep clone for backup to avoid mutation issues
          const backupConfig = JSON.parse(JSON.stringify(agentConfig));
          await this.backupManager.createBackup(adapter.name, backupConfig);
          
          agentConfig.mcpServers = interpolatedServers;
          await adapter.writeConfig(agentConfig);
        }
        result.synced.push(adapter.name);
      } catch (err) {
        result.failed.push(adapter.name);
      }
    }));

    return result;
  }

  async addServer(name: string, config: MCPServerConfig): Promise<void> {
    const localConfig = await this.readLocalConfig();
    if (!localConfig.mcpServers) {
      localConfig.mcpServers = {};
    }
    localConfig.mcpServers[name] = config;
    await writeJson(this.configPath, localConfig);
  }

  async removeServer(name: string): Promise<void> {
    const localConfig = await this.readLocalConfig();
    if (!localConfig.mcpServers || !localConfig.mcpServers[name]) {
      throw new Error(`Server '${name}' not found in agentlink.json`);
    }
    delete localConfig.mcpServers[name];
    await writeJson(this.configPath, localConfig);
  }

  async listServers(): Promise<Record<string, MCPServerConfig>> {
    const localConfig = await this.readLocalConfig();
    return localConfig.mcpServers || {};
  }

  async pull(fromAgent: string): Promise<void> {
    const adapter = this.adapters.find(a => a.name === fromAgent);
    if (!adapter) {
      throw new Error(`Unknown agent: ${fromAgent}`);
    }
    if (!(await adapter.isInstalled())) {
      throw new Error(`Agent ${fromAgent} is not installed or missing config.`);
    }
    const agentConfig = await adapter.readConfig();
    
    let localConfig: AgentLinkConfig = { version: "1" };
    if (await fileExists(this.configPath)) {
      localConfig = await this.readLocalConfig();
    }
    localConfig.mcpServers = agentConfig.mcpServers || {};
    
    await writeJson(this.configPath, localConfig);
  }

  async diff(): Promise<Record<string, DiffResult>> {
    const localConfig = await this.readLocalConfig();
    const localServers = localConfig.mcpServers || {};
    const interpolatedLocal = interpolateConfig(localServers);
    
    const diffs: Record<string, DiffResult> = {};
    for (const adapter of this.adapters) {
      if (await adapter.isInstalled()) {
        const agentConfig = await adapter.readConfig();
        const agentServers = agentConfig.mcpServers || {};
        diffs[adapter.name] = diffServers(agentServers, interpolatedLocal);
      }
    }
    return diffs;
  }

  async doctor(): Promise<DoctorResult> {
    let localConfigValid = true;
    let localServers: string[] = [];
    try {
      const config = await this.readLocalConfig();
      localServers = Object.keys(config.mcpServers || {});
    } catch {
      localConfigValid = false;
    }

    const agentHealths: AgentHealth[] = [];

    for (const adapter of this.adapters) {
      const configPath = adapter.getConfigPath();
      const isInstalled = await adapter.isInstalled();
      
      const health: AgentHealth = {
        name: adapter.name,
        isInstalled,
        configPath,
        permissions: { read: false, write: false },
        isValidConfig: false,
        zombies: [],
        issues: []
      };

      if (isInstalled) {
        // Check permissions
        try {
          await fs.access(configPath, constants.R_OK);
          health.permissions.read = true;
        } catch {
          health.issues.push('No read permission');
        }

        try {
          await fs.access(configPath, constants.W_OK);
          health.permissions.write = true;
        } catch {
          health.issues.push('No write permission');
        }

        // Read and validate config
        if (health.permissions.read) {
          try {
            const data = await readJson<any>(configPath);
            const result = mcpConfigSchema.safeParse(data);
            if (result.success) {
              health.isValidConfig = true;
              const agentServers = Object.keys(result.data.mcpServers || {});
              health.zombies = agentServers.filter(s => !localServers.includes(s));
            } else {
              health.issues.push(`Invalid config format: ${result.error.message}`);
            }
          } catch (err: any) {
            health.issues.push(`Failed to read config: ${err.message}`);
          }
        }
      }

      agentHealths.push(health);
    }

    return {
      agents: agentHealths,
      localConfigValid
    };
  }
}
