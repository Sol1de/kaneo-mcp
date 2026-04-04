# Architecture

## Overview

The server follows a layered architecture where each layer has a single responsibility:

```
HTTP Request
    |
    v
┌──────────────────────────┐
│  Transport (server.ts)   │  Hono HTTP server, routing
├──────────────────────────┤
│  Auth (middleware/auth)   │  Extracts Bearer token
├──────────────────────────┤
│  Routes (routes/mcp.ts)  │  Session lookup, MCP protocol handling
├──────────────────────────┤
│  Sessions (session.ts)   │  Creates McpServer + KaneoClient per user
├──────────────────────────┤
│  Tools (tools/*.ts)      │  22 MCP tools with Zod schemas
├──────────────────────────┤
│  Client (clients/client) │  Thin fetch wrapper for Kaneo API
└──────────────────────────┘
    |
    v
  Kaneo API ({KANEO_URL}/api)
```

## Layers

### 1. Transport — `src/server.ts`

Entry point. Creates a Hono HTTP server and wires up:
- Auth middleware on `/mcp/*`
- MCP routes on `/mcp`
- A 404 fallback

### 2. Auth Middleware — `src/middleware/auth.ts`

Extracts the Kaneo API key from:
1. `Authorization: Bearer <token>` header
2. `?token=<token>` query parameter (fallback)

Sets `kaneoToken` on the Hono context for downstream handlers.

### 3. MCP Routes — `src/routes/mcp.ts`

Handles the MCP Streamable HTTP protocol:
- **POST `/mcp`** — If no `mcp-session-id` header and the body is an `initialize` request, creates a new session. Otherwise, routes to the existing session's transport.
- **GET/DELETE `/mcp`** — SSE streaming and session teardown for existing sessions.

### 4. Session Manager — `src/session.ts`

Manages `Map<sessionId, Session>`. Each session contains:
- A `McpServer` instance (from MCP SDK)
- A `NodeStreamableHTTPServerTransport`
- A `KaneoClient` bound to the user's token

When a new session is created:
1. `McpServer` is instantiated
2. `KaneoClient.create()` is called with the user's token
3. `registerAllTools(server, client)` registers all 22 tools
4. Transport generates a UUID session ID

Sessions are cleaned up when the transport closes.

### 5. Tools — `src/tools/*.ts`

Seven tool modules, each exporting a `register*Tools(server, client)` function:

| Module | Tools | Count |
|--------|-------|-------|
| `projects.tool.ts` | list, get, create, update, delete | 5 |
| `tasks.tool.ts` | list, get, create, update, move, delete, export | 7 |
| `columns.tool.ts` | list, create | 2 |
| `comments.tool.ts` | get-task-comments, create-comment | 2 |
| `labels.tool.ts` | list, get-task-labels, attach, detach | 4 |
| `search.tool.ts` | search | 1 |
| `workspace.tool.ts` | list-workspace-members | 1 |

The barrel `src/tools/index.ts` calls all seven `register*Tools()` functions.

### 6. Client — `src/clients/client.ts`

Thin fetch wrapper around the Kaneo REST API:
- Prepends `{KANEO_URL}/api` to all paths
- Adds `Authorization: Bearer <token>` header
- Exposes typed `get`, `post`, `put`, `del` methods
- Created via the static factory `KaneoClient.create(opts)`

### 7. Types — `src/types/*.ts`

TypeScript interfaces matching Kaneo API responses: `Project`, `Task`, `Column`, `Activity`, `Label`, `SearchResult`, `WorkspaceMember`. Barrel-exported from `src/types/index.ts`.

## Directory Structure

```
src/
├── server.ts              # Entry point, Hono app
├── env.ts                 # Environment class (env var parsing)
├── session.ts             # SessionManager class
├── middleware/
│   └── auth.ts            # Bearer token extraction
├── routes/
│   └── mcp.ts             # MCP HTTP protocol handler
├── clients/
│   └── client.ts          # KaneoClient (fetch wrapper)
├── tools/
│   ├── index.ts           # Barrel — registerAllTools()
│   ├── helpers.ts         # jsonResponse() helper
│   ├── projects.tool.ts
│   ├── tasks.tool.ts
│   ├── columns.tool.ts
│   ├── comments.tool.ts
│   ├── labels.tool.ts
│   ├── search.tool.ts
│   └── workspace.tool.ts
└── types/
    ├── index.ts           # Barrel export
    ├── project.type.ts
    ├── task.type.ts
    ├── column.type.ts
    ├── activity.type.ts
    ├── label.type.ts
    ├── search.type.ts
    └── workspace.type.ts
```

## Request Lifecycle

1. HTTP request hits Hono server
2. Auth middleware extracts Kaneo token from header or query
3. MCP route checks `mcp-session-id` header
4. If new: creates session (McpServer + KaneoClient + Transport)
5. Transport handles MCP JSON-RPC protocol
6. Tool handler runs, calls `KaneoClient` method
7. `KaneoClient` makes fetch request to Kaneo API
8. Response flows back through MCP protocol to the client
