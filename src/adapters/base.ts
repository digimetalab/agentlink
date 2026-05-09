import { MCPConfig, mcpConfigSchema } from '../schema/mcp.schema';
import fs from 'fs/promises';
import path from 'path';
import { readJson, writeJson, fileExists } from '../utils/fs';

export abstract class AgentAdapter {
  abstract readonly name: string;
  abstract getConfigPath(): string;
  abstract readConfig(): Promise<MCPConfig>;
  abstract writeConfig(config: MCPConfig): Promise<void>;

  async isInstalled(): Promise<boolean> {
    return fileExists(this.getConfigPath());
  }
}

export abstract class JsonAdapter extends AgentAdapter {
  async readConfig(): Promise<MCPConfig> {
    const configPath = this.getConfigPath();
    try {
      const data = await readJson<any>(configPath);
      const result = mcpConfigSchema.safeParse(data);
      if (result.success) {
        return result.data;
      }
      console.warn(`[AgentLink] Warning: Config for agent '${this.name}' at ${configPath} is invalid. Falling back to empty config.`);
      return { mcpServers: {} };
    } catch {
      return { mcpServers: {} };
    }
  }

  async writeConfig(config: MCPConfig): Promise<void> {
    const configPath = this.getConfigPath();
    let existingData: any = {};
    try {
      existingData = await readJson<any>(configPath);
    } catch {
      existingData = {};
    }
    existingData.mcpServers = config.mcpServers;
    await writeJson(configPath, existingData);
  }
}
