import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'fs/promises';
import path from 'path';
import os from 'os';
import { BackupManager } from '../../src/utils/backup';

describe('BackupManager', () => {
  const testDir = path.join(os.tmpdir(), 'agentlink-test-backups-' + Math.random().toString(36).slice(2));
  let backupManager: BackupManager;

  beforeEach(async () => {
    await fs.mkdir(testDir, { recursive: true });
    backupManager = new BackupManager(testDir);
  });

  afterEach(async () => {
    await fs.rm(testDir, { recursive: true, force: true });
  });

  it('should create a backup file with JSON content', async () => {
    const content = { foo: 'bar' };
    const filePath = await backupManager.createBackup('test-agent', content);

    expect(filePath).toContain('test-agent');
    expect(filePath.endsWith('.json')).toBe(true);
    
    const savedContent = JSON.parse(await fs.readFile(filePath, 'utf-8'));
    expect(savedContent).toEqual(content);
  });

  it('should rotate backups to keep only the last 10', async () => {
    const agentName = 'rotate-test';
    const agentDir = path.join(testDir, agentName);
    await fs.mkdir(agentDir, { recursive: true });

    // Manually create 12 files with different timestamp names
    for (let i = 0; i < 12; i++) {
      const timestamp = `2026-05-09_14-30-${String(i).padStart(2, '0')}`;
      const filePath = path.join(agentDir, `${timestamp}.json`);
      await fs.writeFile(filePath, JSON.stringify({ index: i }));
    }

    // Trigger rotation by creating one more backup via the manager
    // This will actually create a 13th file and then rotate to 10.
    await backupManager.createBackup(agentName, { index: 12 });

    const files = await fs.readdir(agentDir);
    const jsonFiles = files.filter(f => f.endsWith('.json'));
    
    expect(jsonFiles.length).toBe(10);
    
    const contents = await Promise.all(
      jsonFiles.map(async f => JSON.parse(await fs.readFile(path.join(agentDir, f), 'utf-8')))
    );
    
    const indices = contents.map(c => c.index).sort((a, b) => a - b);
    // Should keep the 10 latest ones (from 3 to 12)
    expect(indices).toEqual([3, 4, 5, 6, 7, 8, 9, 10, 11, 12]);
  });
});
