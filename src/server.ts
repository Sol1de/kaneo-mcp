#!/usr/bin/env node

import { Hono } from "hono";
import { serve } from "@hono/node-server";
import type { AppEnv } from "./types/index.js";
import { env } from "./container.js";
import { authMiddleware } from "./middleware/auth.js";
import { mcpRoutes } from "./routes/index.js";

const app = new Hono<AppEnv>();
app.use("/mcp/*", authMiddleware);
app.route("/mcp", mcpRoutes);
app.notFound((c) => c.json({ error: "Not found" }, 404));

serve({ fetch: app.fetch, port: env.port }, (info) => {
  console.error(`Kaneo MCP Server listening on port ${info.port}`);
  console.error(`Endpoint: http://localhost:${info.port}/mcp`);
});
