import fs from 'fs/promises';
import path from 'path';

export async function fileExists(filePath: string): Promise<boolean> {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

export async function readJson<T>(filePath: string): Promise<T> {
  const content = await fs.readFile(filePath, 'utf-8');
  return JSON.parse(content) as T;
}

export async function writeJson(filePath: string, data: any): Promise<void> {
  const dir = path.dirname(filePath);
  await fs.mkdir(dir, { recursive: true });
  
  const tempPath = `${filePath}.${Math.random().toString(36).slice(2)}.tmp`;
  try {
    await fs.writeFile(tempPath, JSON.stringify(data, null, 2) + '\n', 'utf-8');
    await fs.rename(tempPath, filePath);
  } catch (err) {
    if (await fileExists(tempPath)) {
      await fs.unlink(tempPath);
    }
    throw err;
  }
}
