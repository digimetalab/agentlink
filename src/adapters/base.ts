import { MCPConfig } from '../schema/mcp.schema';
import fs from 'fs/promises';
import path from 'path';

export abstract class AgentAdapter {
  abstract readonly name: string;
  abstract getConfigPath(): string;
  abstract readConfig(): Promise<MCPConfig>;
  abstract writeConfig(config: MCPConfig): Promise<void>;

  async isInstalled(): Promise<boolean> {
    const dir = path.dirname(this.getConfigPath());
    try {
      const stats = await fs.stat(dir);
      return stats.isDirectory();
    } catch {
      return false;
    }
  }
}
