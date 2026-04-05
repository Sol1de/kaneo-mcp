import { Environment } from "./env.js";
import { SessionManager } from "./session.js";
import { McpService } from "./services/mcp.service.js";

export const env = new Environment();
export const sessions = new SessionManager(env);
export const mcpService = new McpService(sessions);
