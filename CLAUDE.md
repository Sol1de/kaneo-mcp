# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build & Run Commands

```bash
npm run build          # TypeScript → dist/
npm run start          # Run HTTP server (requires KANEO_URL, KANEO_WORKSPACE_ID)
npm run dev            # Dev mode (tsx, loads .env automatically)
npm run build:bundle   # esbuild → single CJS file in build/kaneo-mcp.cjs
npm run build:binary   # Node SEA binary in build/kaneo-mcp-{os}-{arch}
```

Smoke test after build:
```bash
KANEO_URL=http://localhost KANEO_WORKSPACE_ID=test node dist/server.js &
sleep 1 && kill $!
# Should print: Kaneo MCP Server listening on port 3000
```

## Architecture

MCP server exposing 22 tools for the Kaneo Kanban API. HTTP Streamable transport via Hono.

### Request Flow

1. **`server.ts`** — Hono app, mounts auth middleware on `/mcp/*`, delegates to MCP routes
2. **`middleware/auth.ts`** — extracts Kaneo API token from `Authorization: Bearer` header or `?token=` query param, sets it on context
3. **`routes/mcp.ts`** — handles POST/GET/DELETE on `/mcp`, manages session lifecycle (initialize → reuse → cleanup) using raw Node `incoming`/`outgoing` via `@hono/node-server`
4. **`session.ts`** — `SessionManager` class: creates `McpServer` + `KaneoClient` + `NodeStreamableHTTPServerTransport` per session, stores in `Map<sessionId, Session>`
5. **`clients/client.ts`** — `KaneoClient` class: thin fetch wrapper, prepends `{KANEO_URL}/api`, adds Bearer token, typed `get/post/put/del` methods
6. **`tools/*.ts`** — each exports `register*Tools(server, client)`, defines tools with Zod input schemas, calls KaneoClient methods
7. **`types/*.ts`** — TypeScript interfaces matching Kaneo API responses

### Environment (`env.ts`)

Required: `KANEO_URL`, `KANEO_WORKSPACE_ID`. Optional: `MCP_PORT` (default 3000), OAuth vars (`ZITADEL_ISSUER`, `ZITADEL_AUDIENCE`, `MCP_SERVER_ORIGIN`), `KANEO_DEFAULT_API_KEY`, `KANEO_USER_TOKEN_MAP` (JSON object mapping user IDs to tokens).

### Adding a New Tool

1. Create or edit a file in `src/tools/` (naming: `*.tool.ts`)
2. Export a `register*Tools(server, client)` function that calls `server.registerTool(name, { description, inputSchema: z.object({...}) }, handler)`
3. If new file, import and call it in `src/tools/index.ts`

### Conventions

- Tool responses use `jsonResponse(data)` helper from `tools/helpers.ts`
- IDs in URL paths are wrapped with `encodeURIComponent()`
- Query strings built with `URLSearchParams`
- Tools that accept `workspaceId` default to `client.workspaceId` when not provided
- Zod v4 imported from `zod/v4`
- MCP SDK v2 — server imports from `@modelcontextprotocol/server`, Node HTTP transport from `@modelcontextprotocol/node`

### Kaneo API

Base: `{KANEO_URL}/api`. Bearer token auth. Key paths:
- `/project`, `/task/{id}`, `/task/tasks/{projectId}`, `/task/status/{id}`
- `/column/{projectId}`, `/activity/{taskId}`, `/activity/comment`
- `/label/workspace/{workspaceId}`, `/search`, `/workspace/{workspaceId}/members`
- Task priorities: `no-priority | low | medium | high | urgent`
