import os from 'os';
import path from 'path';
import { JsonAdapter } from './base';

export class GeminiAdapter extends JsonAdapter {
  readonly name = 'gemini';

  getConfigPath(): string {
    return path.join(os.homedir(), '.gemini', 'mcp_servers.json');
  }
}
