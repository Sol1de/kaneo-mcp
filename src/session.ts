import { randomUUID } from "node:crypto";
import { McpServer } from "@modelcontextprotocol/server";
import { NodeStreamableHTTPServerTransport } from "@modelcontextprotocol/node";
import { KaneoClient } from "./clients/client.js";
import { registerAllTools } from "./tools/index.js";
import type { Environment } from "./env.js";
import type { Session } from "./types/index.js";

export class SessionManager {
  private readonly sessions = new Map<string, Session>();
  private readonly env: Environment;

  constructor(env: Environment) {
    this.env = env;
  }

  get(sessionId: string): Session | undefined {
    return this.sessions.get(sessionId);
  }

  has(sessionId: string): boolean {
    return this.sessions.has(sessionId);
  }

  create(kaneoToken: string): Session {
    const server = new McpServer({ name: "kaneo-mcp", version: "1.0.0" });
    const client = KaneoClient.create({
      baseUrl: this.env.kaneoUrl,
      token: kaneoToken,
      workspaceId: this.env.workspaceId,
    });
    registerAllTools(server, client);

    const transport = new NodeStreamableHTTPServerTransport({
      sessionIdGenerator: () => randomUUID(),
      enableJsonResponse: true,
      onsessioninitialized: (sessionId) => {
        this.sessions.set(sessionId, { transport, server });
      },
    });

    transport.onclose = () => {
      if (transport.sessionId) {
        this.sessions.delete(transport.sessionId);
      }
    };

    return { server, transport };
  }
}
