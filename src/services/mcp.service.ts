import type { IncomingMessage, ServerResponse } from "node:http";
import { isInitializeRequest } from "@modelcontextprotocol/server";
import type { SessionManager } from "../session.js";
import type { McpResult } from "../types/index.js";

export class McpService {
  constructor(private readonly sessions: SessionManager) {}

  async handlePost(
    sessionId: string | undefined,
    kaneoToken: string,
    body: unknown,
    incoming: IncomingMessage,
    outgoing: ServerResponse,
  ): Promise<McpResult> {
    if (sessionId && this.sessions.has(sessionId)) {
      const session = this.sessions.get(sessionId)!;
      await session.transport.handleRequest(incoming, outgoing, body);
      return { kind: "handled" };
    }

    if (!sessionId && isInitializeRequest(body)) {
      const { server, transport } = this.sessions.create(kaneoToken);
      await server.connect(transport);
      await transport.handleRequest(incoming, outgoing, body);
      return { kind: "handled" };
    }

    return {
      kind: "error",
      status: 400,
      body: {
        jsonrpc: "2.0",
        error: { code: -32000, message: "Invalid session or request" },
        id: null,
      },
    };
  }

  async handleSessionRequest(
    sessionId: string | undefined,
    incoming: IncomingMessage,
    outgoing: ServerResponse,
  ): Promise<McpResult> {
    if (sessionId && this.sessions.has(sessionId)) {
      const session = this.sessions.get(sessionId)!;
      await session.transport.handleRequest(incoming, outgoing);
      return { kind: "handled" };
    }

    return {
      kind: "error",
      status: 400,
      body: { error: "Invalid or missing session" },
    };
  }
}
