export function interpolateEnv(value: string): string {
  return value.replace(/\${([^}]+)}/g, (_, envVar) => {
    return process.env[envVar] ?? '';
  });
}

export function interpolateConfig(config: any): any {
  if (typeof config === 'string') {
    return interpolateEnv(config);
  }
  if (Array.isArray(config)) {
    return config.map(interpolateConfig);
  }
  if (config !== null && typeof config === 'object') {
    const result: any = {};
    for (const [key, val] of Object.entries(config)) {
      result[key] = interpolateConfig(val);
    }
    return result;
  }
  return config;
}
