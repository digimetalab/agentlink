export interface DiffResult {
  hasChanges: boolean;
  added: string[];
  removed: string[];
  modified: string[];
}

export function diffServers(oldServers: Record<string, any>, newServers: Record<string, any>): DiffResult {
  const oldKeys = Object.keys(oldServers || {});
  const newKeys = Object.keys(newServers || {});

  const added = newKeys.filter(k => !oldKeys.includes(k));
  const removed = oldKeys.filter(k => !newKeys.includes(k));
  const modified = newKeys.filter(k => {
    if (added.includes(k)) return false;
    return JSON.stringify(oldServers[k]) !== JSON.stringify(newServers[k]);
  });

  return {
    hasChanges: added.length > 0 || removed.length > 0 || modified.length > 0,
    added,
    removed,
    modified,
  };
}
