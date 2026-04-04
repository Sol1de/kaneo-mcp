# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build & Run Commands

```bash
npm run build          # TypeScript → dist/
npm run start          # Run HTTP server (requires KANEO_URL, KANEO_WORKSPACE_ID)
npm run dev            # Dev mode (tsx)
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

MCP server exposing 22 tools for the Kaneo Kanban API. HTTP Streamable transport only.

### Entry Point

- **`src/server.ts`** — HTTP Streamable transport (remote, multi-user). Each request carries `Authorization: Bearer <kaneo-api-key>` header. Creates a `KaneoClient.create()` per session with the user's token. Manages sessions via a `Map<sessionId, {transport, server}>`.

### Layers

1. **Transport** (`server.ts`) — HTTP server, wires up McpServer
2. **Tools** (`tools/index.ts`) — barrel that calls all 7 `register*Tools()` functions
3. **Tool modules** (`tools/*.ts`) — each exports `register*Tools(server, client)`, defines tools with Zod input schemas, calls KaneoClient methods, returns JSON text content
4. **Client** (`client.ts`) — thin fetch wrapper: prepends `{KANEO_URL}/api`, adds Bearer token, typed `get/post/put/del` methods
5. **Types** (`types/*.ts`) — TypeScript interfaces matching Kaneo API responses, one per file with barrel index

### Adding a New Tool

1. Create or edit a file in `src/tools/`
2. Call `server.registerTool(name, { description, inputSchema: z.object({...}) }, handler)`
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
