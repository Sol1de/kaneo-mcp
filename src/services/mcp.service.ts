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
    const method = (body as { method?: string })?.method ?? "unknown";
    console.error(`[MCP] POST method=${method} sessionId=${sessionId ?? "none"} hasToken=${!!kaneoToken}`);

    if (sessionId && this.sessions.has(sessionId)) {
      const session = this.sessions.get(sessionId)!;
      try {
        await session.transport.handleRequest(incoming, outgoing, body);
      } catch (err) {
        console.error(`[MCP] Error in session handler:`, err);
        throw err;
      }
      return { kind: "handled" };
    }

    if (isInitializeRequest(body)) {
      console.error(`[MCP] Creating new session (stale sessionId=${sessionId ?? "none"})`);
      const { server, transport } = this.sessions.create(kaneoToken);
      await server.connect(transport);
      await transport.handleRequest(incoming, outgoing, body);
      return { kind: "handled" };
    }

    console.error(`[MCP] Rejected: sessionId=${sessionId} known=${sessionId ? this.sessions.has(sessionId) : "N/A"} isInit=false`);
    return {
      kind: "error",
      status: 404,
      body: {
        jsonrpc: "2.0",
        error: { code: -32000, message: "Session not found. Please re-initialize." },
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
