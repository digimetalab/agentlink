import os from 'os';
import path from 'path';
import { JsonAdapter } from './base';

export class CodexAdapter extends JsonAdapter {
  readonly name = 'codex';

  getConfigPath(): string {
    return path.join(os.homedir(), '.codex', 'mcp.json');
  }
}
