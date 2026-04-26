import os from 'os';
import path from 'path';
import { AgentAdapter } from './base';
import { MCPConfig } from '../schema/mcp.schema';
import { readJson, writeJson, fileExists } from '../utils/fs';

export class ClaudeAdapter extends AgentAdapter {
  readonly name = 'claude';

  getConfigPath(): string {
    return path.join(os.homedir(), '.claude', 'mcp.json');
  }

  async readConfig(): Promise<MCPConfig> {
    if (!(await this.isInstalled())) {
      return { mcpServers: {} };
    }
    try {
      const data = await readJson<any>(this.getConfigPath());
      return { mcpServers: data.mcpServers || {} };
    } catch {
      return { mcpServers: {} };
    }
  }

  async writeConfig(config: MCPConfig): Promise<void> {
    let existingData: any = {};
    if (await this.isInstalled()) {
      try {
        existingData = await readJson<any>(this.getConfigPath());
      } catch {
        existingData = {};
      }
    }
    existingData.mcpServers = config.mcpServers;
    await writeJson(this.getConfigPath(), existingData);
  }
}
