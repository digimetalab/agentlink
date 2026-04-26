import { z } from 'zod';
import { mcpServerSchema } from './mcp.schema';

export const agentlinkSchema = z.object({
  $schema: z.string().optional(),
  version: z.string().optional(),
  mcpServers: z.record(z.string(), mcpServerSchema).optional(),
  agents: z.object({
    include: z.array(z.string()).optional(),
    autoSync: z.boolean().optional(),
  }).optional(),
});

export type AgentLinkConfig = z.infer<typeof agentlinkSchema>;
