import type { McpServer } from "@modelcontextprotocol/server";
import type { KaneoClient } from "../clients/client.js";
import { registerProjectTools } from "./projects.tool.js";
import { registerTaskTools } from "./tasks.tool.js";
import { registerColumnTools } from "./columns.tool.js";
import { registerCommentTools } from "./comments.tool.js";
import { registerLabelTools } from "./labels.tool.js";
import { registerSearchTools } from "./search.tool.js";
import { registerWorkspaceTools } from "./workspace.tool.js";

export function registerAllTools(server: McpServer, client: KaneoClient) {
  registerProjectTools(server, client);
  registerTaskTools(server, client);
  registerColumnTools(server, client);
  registerCommentTools(server, client);
  registerLabelTools(server, client);
  registerSearchTools(server, client);
  registerWorkspaceTools(server, client);
}
