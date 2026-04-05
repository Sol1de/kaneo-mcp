import type { NodeStreamableHTTPServerTransport } from "@modelcontextprotocol/node";
import type { McpServer } from "@modelcontextprotocol/server";

export interface Session {
  transport: NodeStreamableHTTPServerTransport;
  server: McpServer;
}
