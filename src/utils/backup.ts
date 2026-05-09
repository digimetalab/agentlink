import fs from 'fs/promises';
import path from 'path';
import os from 'os';
import { writeJson } from './fs';

export class BackupManager {
  private baseDir: string;

  constructor(baseDir?: string) {
    this.baseDir = baseDir || path.join(os.homedir(), '.agentlink', 'backups');
  }

  /**
   * Creates a backup of the agent configuration.
   * @param name The name of the agent (e.g., 'claude', 'gemini').
   * @param content The configuration content to back up.
   * @returns The path to the created backup file.
   */
  async createBackup(name: string, content: any): Promise<string> {
    const agentDir = path.join(this.baseDir, name);
    
    // Ensure the agent directory exists
    await fs.mkdir(agentDir, { recursive: true });

    // Format: YYYY-MM-DD_HH-mm-ss
    const now = new Date();
    const timestamp = now.getFullYear() + '-' +
      String(now.getMonth() + 1).padStart(2, '0') + '-' +
      String(now.getDate()).padStart(2, '0') + '_' +
      String(now.getHours()).padStart(2, '0') + '-' +
      String(now.getMinutes()).padStart(2, '0') + '-' +
      String(now.getSeconds()).padStart(2, '0');
    
    const fileName = `${timestamp}.json`;
    const filePath = path.join(agentDir, fileName);

    await writeJson(filePath, content);
    
    // Rotate backups (keep only last 10)
    try {
      await this.rotate(agentDir);
    } catch (err) {
      // Don't fail the whole backup process if rotation fails
      console.error(`Warning: Failed to rotate backups in ${agentDir}:`, err);
    }
    
    return filePath;
  }

  /**
   * Keeps only the last 10 backups in the specified directory.
   */
  private async rotate(dir: string): Promise<void> {
    const files = await fs.readdir(dir);
    const jsonFiles = files
      .filter(f => /^\d{4}-\d{2}-\d{2}_\d{2}-\d{2}-\d{2}\.json$/.test(f))
      .sort() // Sorts by filename, which is timestamp-based
      .reverse();

    if (jsonFiles.length > 10) {
      const toDelete = jsonFiles.slice(10);
      for (const file of toDelete) {
        try {
          await fs.unlink(path.join(dir, file));
        } catch (err) {
          console.error(`Warning: Failed to delete old backup ${file}:`, err);
        }
      }
    }
  }
}
