#!/usr/bin/env node

import { createServer } from "node:http";
import { randomUUID } from "node:crypto";
import { McpServer, isInitializeRequest } from "@modelcontextprotocol/server";
import { NodeStreamableHTTPServerTransport } from "@modelcontextprotocol/node";
import { KaneoClient } from "./clients/index.js";
import { registerAllTools } from "./tools/index.js";

const KANEO_URL = process.env.KANEO_URL;
const KANEO_WORKSPACE_ID = process.env.KANEO_WORKSPACE_ID;
const MCP_SECRET = process.env.MCP_SECRET;
const MCP_PORT = parseInt(process.env.MCP_PORT ?? "3000", 10);

if (!KANEO_URL) throw new Error("KANEO_URL environment variable is required");
if (!KANEO_WORKSPACE_ID)
  throw new Error("KANEO_WORKSPACE_ID environment variable is required");
if (!MCP_SECRET)
  throw new Error("MCP_SECRET environment variable is required");

// Track active sessions: sessionId → { transport, server }
const sessions = new Map<
  string,
  { transport: NodeStreamableHTTPServerTransport; server: McpServer }
>();

function authenticate(
  req: import("node:http").IncomingMessage,
): { kaneoToken: string } | { error: string; status: number } {
  const secret = req.headers["x-mcp-secret"] as string | undefined;
  if (!secret || secret !== MCP_SECRET) {
    return { error: "Invalid or missing X-MCP-Secret header", status: 401 };
  }

  const kaneoToken = req.headers["x-kaneo-token"] as string | undefined;
  if (!kaneoToken) {
    return { error: "Missing X-Kaneo-Token header", status: 401 };
  }

  return { kaneoToken };
}

function createSessionServer(kaneoToken: string): {
  server: McpServer;
  transport: NodeStreamableHTTPServerTransport;
} {
  const server = new McpServer({ name: "kaneo-mcp", version: "1.0.0" });
  const client = KaneoClient.create({
    baseUrl: KANEO_URL!,
    token: kaneoToken,
    workspaceId: KANEO_WORKSPACE_ID!,
  });
  registerAllTools(server, client);

  const transport = new NodeStreamableHTTPServerTransport({
    sessionIdGenerator: () => randomUUID(),
    onsessioninitialized: (sessionId) => {
      sessions.set(sessionId, { transport, server });
      console.error(`Session initialized: ${sessionId}`);
    },
  });

  transport.onclose = () => {
    if (transport.sessionId) {
      sessions.delete(transport.sessionId);
      console.error(`Session closed: ${transport.sessionId}`);
    }
  };

  return { server, transport };
}

const httpServer = createServer(async (req, res) => {
  // CORS headers for browser-based clients
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Content-Type, X-MCP-Secret, X-Kaneo-Token, mcp-session-id",
  );
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, DELETE, OPTIONS");

  if (req.method === "OPTIONS") {
    res.writeHead(204);
    res.end();
    return;
  }

  // Only handle /mcp path
  const url = new URL(req.url ?? "/", `http://localhost:${MCP_PORT}`);
  if (url.pathname !== "/mcp") {
    res.writeHead(404, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "Not found" }));
    return;
  }

  // Authenticate
  const auth = authenticate(req);
  if ("error" in auth) {
    res.writeHead(auth.status, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: auth.error }));
    return;
  }

  const sessionId = req.headers["mcp-session-id"] as string | undefined;

  if (req.method === "GET" || req.method === "DELETE") {
    // GET = SSE stream, DELETE = close session — both need existing session
    if (sessionId && sessions.has(sessionId)) {
      const session = sessions.get(sessionId)!;
      await session.transport.handleRequest(req, res);
    } else {
      res.writeHead(400, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "Invalid or missing session" }));
    }
    return;
  }

  if (req.method === "POST") {
    // Read body
    const chunks: Buffer[] = [];
    for await (const chunk of req) {
      chunks.push(chunk as Buffer);
    }
    const body = JSON.parse(Buffer.concat(chunks).toString());

    // Existing session
    if (sessionId && sessions.has(sessionId)) {
      const session = sessions.get(sessionId)!;
      await session.transport.handleRequest(req, res, body);
      return;
    }

    // New session — must be an initialize request
    if (!sessionId && isInitializeRequest(body)) {
      const { server, transport } = createSessionServer(auth.kaneoToken);
      await server.connect(transport);
      await transport.handleRequest(req, res, body);
      return;
    }

    res.writeHead(400, { "Content-Type": "application/json" });
    res.end(
      JSON.stringify({
        jsonrpc: "2.0",
        error: { code: -32000, message: "Invalid session or request" },
        id: null,
      }),
    );
    return;
  }

  res.writeHead(405, { "Content-Type": "application/json" });
  res.end(JSON.stringify({ error: "Method not allowed" }));
});

httpServer.listen(MCP_PORT, () => {
  console.error(`Kaneo MCP Server (HTTP) listening on port ${MCP_PORT}`);
  console.error(`Endpoint: http://localhost:${MCP_PORT}/mcp`);
});
