# Contributing

## Development Setup

```bash
git clone https://github.com/Sol1de/kaneo-mcp.git
cd kaneo-mcp
npm install
cp .env.example .env   # fill in your Kaneo credentials
npm run dev
```

## Adding a New Tool

### 1. Create or edit a tool module

Tool modules live in `src/tools/`. Each exports a `register*Tools(server, client)` function.

```typescript
// src/tools/example.tool.ts
import type { McpServer } from "@modelcontextprotocol/server";
import { z } from "zod/v4";
import type { KaneoClient } from "../clients/client.js";
import { jsonResponse } from "./helpers.js";

export function registerExampleTools(server: McpServer, client: KaneoClient) {
  server.registerTool(
    "my-tool-name",
    {
      title: "My Tool",
      description: "What this tool does.",
      inputSchema: z.object({
        id: z.string().describe("Resource ID"),
      }),
    },
    async ({ id }) => {
      const result = await client.get(`/some-endpoint/${encodeURIComponent(id)}`);
      return jsonResponse(result);
    },
  );
}
```

### 2. Register in the barrel

If you created a new file, import and call it in `src/tools/index.ts`:

```typescript
import { registerExampleTools } from "./example.tool.js";

export function registerAllTools(server: McpServer, client: KaneoClient) {
  // ... existing registrations
  registerExampleTools(server, client);
}
```

### 3. Add types if needed

If the Kaneo API endpoint returns a new shape, create a TypeScript interface in `src/types/` and export it from `src/types/index.ts`.

## Conventions

### Code Style

- **Zod v4** imported from `zod/v4`
- **MCP SDK v2** — server from `@modelcontextprotocol/server`, transport from `@modelcontextprotocol/node`
- Tool responses always use `jsonResponse(data)` from `tools/helpers.ts`
- IDs in URL paths are wrapped with `encodeURIComponent()`
- Query strings built with `URLSearchParams`
- Tools that accept `workspaceId` default to `client.workspaceId` when not provided
- Classes and encapsulation preferred over standalone functions

### Naming

- Tool files: `<domain>.tool.ts` (e.g. `tasks.tool.ts`)
- Type files: `<domain>.type.ts` (e.g. `task.type.ts`)
- Tool names: kebab-case (e.g. `list-tasks`, `get-task-comments`)
- Register functions: `register<Domain>Tools`

### Kaneo API Reference

Base URL: `{KANEO_URL}/api`

Key endpoints:
- `/project` — CRUD for projects
- `/task/{id}` — Single task operations
- `/task/tasks/{projectId}` — List tasks by project
- `/task/status/{id}` — Move task to new status
- `/column/{projectId}` — Columns for a project
- `/activity/{taskId}` — Task activity/comments
- `/activity/comment` — Create a comment
- `/label/workspace/{workspaceId}` — Labels in workspace
- `/label/task/{taskId}` — Labels on a task
- `/label/attach`, `/label/detach` — Label attachment
- `/search` — Global search
- `/workspace/{workspaceId}/members` — Workspace members

Task priorities: `no-priority | low | medium | high | urgent`

## Build Commands

| Command | Description |
|---------|-------------|
| `npm run build` | TypeScript to `dist/` |
| `npm run start` | Run compiled server |
| `npm run dev` | Dev mode with hot-reload |
| `npm run build:bundle` | Single CJS file in `build/` |
| `npm run build:binary` | Node SEA binary in `build/` |

## Smoke Test

After building, verify the server starts correctly:

```bash
KANEO_URL=http://localhost KANEO_WORKSPACE_ID=test node dist/server.js &
sleep 1 && kill $!
# Expected: Kaneo MCP Server listening on port 3000
```
