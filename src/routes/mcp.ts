import { Hono } from "hono";
import type { HttpBindings } from "@hono/node-server";
import { RESPONSE_ALREADY_SENT } from "@hono/node-server/utils/response";
import { isInitializeRequest } from "@modelcontextprotocol/server";
import type { SessionManager } from "../session.js";
import type { AuthVariables } from "../middleware/auth.js";

type Env = {
  Bindings: HttpBindings;
  Variables: AuthVariables;
};

export function createMcpRoutes(sessions: SessionManager): Hono<Env> {
  const mcp = new Hono<Env>();

  mcp.post("/", async (c) => {
    const kaneoToken = c.get("kaneoToken");
    const body = await c.req.json();
    const { incoming, outgoing } = c.env;
    const sessionId = c.req.header("mcp-session-id");

    if (sessionId && sessions.has(sessionId)) {
      const session = sessions.get(sessionId)!;
      await session.transport.handleRequest(incoming, outgoing, body);
      return RESPONSE_ALREADY_SENT;
    }

    if (!sessionId && isInitializeRequest(body)) {
      const { server, transport } = sessions.create(kaneoToken);
      await server.connect(transport);
      await transport.handleRequest(incoming, outgoing, body);
      return RESPONSE_ALREADY_SENT;
    }

    return c.json(
      {
        jsonrpc: "2.0",
        error: { code: -32000, message: "Invalid session or request" },
        id: null,
      },
      400,
    );
  });

  mcp.on(["GET", "DELETE"], "/", async (c) => {
    const sessionId = c.req.header("mcp-session-id");

    if (sessionId && sessions.has(sessionId)) {
      const session = sessions.get(sessionId)!;
      await session.transport.handleRequest(c.env.incoming, c.env.outgoing);
      return RESPONSE_ALREADY_SENT;
    }

    return c.json({ error: "Invalid or missing session" }, 400);
  });

  return mcp;
}
