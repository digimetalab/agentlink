export function interpolateEnv(value: string): string {
  return value.replace(/\${([^}]+)}/g, (_, envVarWithDefault) => {
    const [envVar, defaultValue] = envVarWithDefault.split(':-');
    const result = process.env[envVar.trim()];
    
    if (result !== undefined) {
      return result;
    }
    
    if (defaultValue !== undefined) {
      return defaultValue.trim();
    }
    
    console.warn(`[AgentLink] Warning: Environment variable '${envVar}' is not defined and has no default value.`);
    return '';
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
