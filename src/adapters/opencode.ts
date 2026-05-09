import os from 'os';
import path from 'path';
import { JsonAdapter } from './base';

export class OpenCodeAdapter extends JsonAdapter {
  readonly name = 'opencode';

  getConfigPath(): string {
    return path.join(os.homedir(), '.opencode', 'mcp.json');
  }
}
