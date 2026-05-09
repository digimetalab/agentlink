import os from 'os';
import path from 'path';
import { JsonAdapter } from './base';

export class ClaudeAdapter extends JsonAdapter {
  readonly name = 'claude';

  getConfigPath(): string {
    return path.join(os.homedir(), '.claude', 'mcp.json');
  }
}
