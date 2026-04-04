#!/usr/bin/env node

import { Hono } from "hono";
import { serve, type HttpBindings } from "@hono/node-server";
import { Environment } from "./env.js";
import { SessionManager } from "./session.js";
import { authMiddleware, type AuthVariables } from "./middleware/auth.js";
import { createMcpRoutes } from "./routes/mcp.js";

type AppEnv = {
  Bindings: HttpBindings;
  Variables: AuthVariables;
};

const env = new Environment();
const sessions = new SessionManager(env);

const app = new Hono<AppEnv>();
app.use("/mcp/*", authMiddleware);
app.route("/mcp", createMcpRoutes(sessions));
app.notFound((c) => c.json({ error: "Not found" }, 404));

serve({ fetch: app.fetch, port: env.port }, (info) => {
  console.error(`Kaneo MCP Server listening on port ${info.port}`);
  console.error(`Endpoint: http://localhost:${info.port}/mcp`);
});
