# kaneo-mcp

MCP (Model Context Protocol) server for [Kaneo](https://kaneo.app) — a self-hosted Kanban project management tool. Enables AI assistants to manage your projects and tasks through natural language.

## Features

- **Projects** — List, create, update, delete projects
- **Tasks** — Full CRUD, move between columns, export, filter & sort
- **Columns** — View and create Kanban board columns
- **Comments** — Read and add comments on tasks
- **Labels** — List, attach, and detach labels
- **Search** — Global search across tasks, projects, and more
- **Workspace** — List workspace members
- **HTTP remote server** — deploy alongside Kaneo on your VPS

## Setup

### 1. Get your API key

1. Sign in to your Kaneo instance
2. Go to **Settings → Account → Developer Settings**
3. Click **Create API Key** and copy it immediately

### 2. Find your Workspace ID

List your workspaces via the API or find it in the Kaneo URL.

---

## Deployment

Deploy on your server alongside Kaneo. Team members just configure a URL — no Node.js or installation needed.

### Deploy with Docker

```bash
git clone https://github.com/your-username/kaneo-mcp.git
cd kaneo-mcp
```

Edit `docker-compose.yml` with your settings, then:

```bash
docker compose up -d
```

#### Environment variables (server-side)

| Variable | Required | Description |
|---|---|---|
| `KANEO_URL` | Yes | URL of your Kaneo instance |
| `KANEO_WORKSPACE_ID` | Yes | Default workspace ID |
| `MCP_SECRET` | Yes | Shared secret for team authentication |
| `MCP_PORT` | No | HTTP port (default: 3000) |

### User configuration — Claude Desktop

Each team member adds this to their `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "kaneo": {
      "url": "https://mcp.your-domain.com/mcp",
      "headers": {
        "X-MCP-Secret": "your-team-secret",
        "X-Kaneo-Token": "your-personal-kaneo-api-key"
      }
    }
  }
}
```

- `X-MCP-Secret` — the shared team secret (same for everyone)
- `X-Kaneo-Token` — each user's personal Kaneo API key

---

## Available Tools

| Tool | Description |
|------|-------------|
| `list-projects` | List all projects in the workspace |
| `get-project` | Get project details |
| `create-project` | Create a new project |
| `update-project` | Update project details |
| `delete-project` | Delete a project |
| `list-tasks` | List tasks with filters and sorting |
| `get-task` | Get task details |
| `create-task` | Create a new task |
| `update-task` | Update all task fields |
| `move-task` | Move task to a different column |
| `delete-task` | Delete a task |
| `export-tasks` | Export all tasks from a project |
| `list-columns` | List Kanban board columns |
| `create-column` | Create a new column |
| `get-task-comments` | Get task comments and activity |
| `create-comment` | Add a comment to a task |
| `list-labels` | List workspace labels |
| `get-task-labels` | Get labels on a task |
| `attach-label` | Attach a label to a task |
| `detach-label` | Remove a label from a task |
| `search` | Search across all Kaneo data |
| `list-workspace-members` | List workspace members |

## Building binaries

To build a standalone binary (no Node.js required to run):

```bash
npm run build
npm run build:binary
```

The binary will be in `build/kaneo-mcp-<os>-<arch>`.

## License

MIT
