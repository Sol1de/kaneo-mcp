#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { KaneoClient } from "./client.js";
import { registerProjectTools } from "./tools/projects.js";
import { registerTaskTools } from "./tools/tasks.js";
import { registerColumnTools } from "./tools/columns.js";
import { registerCommentTools } from "./tools/comments.js";
import { registerLabelTools } from "./tools/labels.js";
import { registerSearchTools } from "./tools/search.js";
import { registerWorkspaceTools } from "./tools/workspace.js";

const server = new McpServer({
  name: "kaneo-mcp",
  version: "1.0.0",
});

const client = new KaneoClient();

registerProjectTools(server, client);
registerTaskTools(server, client);
registerColumnTools(server, client);
registerCommentTools(server, client);
registerLabelTools(server, client);
registerSearchTools(server, client);
registerWorkspaceTools(server, client);

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Kaneo MCP Server running on stdio");
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
