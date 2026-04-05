import { Hono } from "hono";
import type { ContentfulStatusCode } from "hono/utils/http-status";
import { RESPONSE_ALREADY_SENT } from "@hono/node-server/utils/response";
import type { AppEnv } from "../types/index.js";
import { mcpService } from "../container.js";

const mcp = new Hono<AppEnv>();

mcp.post("/", async (c) => {
  const result = await mcpService.handlePost(
    c.req.header("mcp-session-id"),
    c.get("kaneoToken"),
    await c.req.json(),
    c.env.incoming,
    c.env.outgoing,
  );

  if (result.kind === "handled") return RESPONSE_ALREADY_SENT;
  return c.json(result.body, result.status as ContentfulStatusCode);
});

mcp.on(["GET", "DELETE"], "/", async (c) => {
  const result = await mcpService.handleSessionRequest(
    c.req.header("mcp-session-id"),
    c.env.incoming,
    c.env.outgoing,
  );

  if (result.kind === "handled") return RESPONSE_ALREADY_SENT;
  return c.json(result.body, result.status as ContentfulStatusCode);
});

export default mcp;
