import { MCPConfig } from '../schema/mcp.schema';
import { fileExists } from '../utils/fs';

export abstract class AgentAdapter {
  abstract readonly name: string;
  abstract getConfigPath(): string;
  abstract readConfig(): Promise<MCPConfig>;
  abstract writeConfig(config: MCPConfig): Promise<void>;

  async isInstalled(): Promise<boolean> {
    return fileExists(this.getConfigPath());
  }
}
