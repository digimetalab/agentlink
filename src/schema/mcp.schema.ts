import { z } from 'zod';

export const mcpServerSchema = z.object({
  command: z.string(),
  args: z.array(z.string()).optional(),
  env: z.record(z.string(), z.string()).optional(),
});

export type MCPServerConfig = z.infer<typeof mcpServerSchema>;

export const mcpConfigSchema = z.object({
  mcpServers: z.record(z.string(), mcpServerSchema),
});

export type MCPConfig = z.infer<typeof mcpConfigSchema>;
