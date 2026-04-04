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

## Setup

### 1. Get your API key

1. Sign in to your Kaneo instance
2. Go to **Settings → Account → Developer Settings**
3. Click **Create API Key** and copy it immediately

### 2. Find your Workspace ID

List your workspaces via the API or find it in the Kaneo URL.

### 3. Configure

Set these environment variables:

```
KANEO_URL=https://your-kaneo-instance.com
KANEO_TOKEN=your-api-key
KANEO_WORKSPACE_ID=your-workspace-id
```

## Installation

### npm (recommended)

```bash
npm install -g kaneo-mcp
```

### From source

```bash
git clone https://github.com/your-username/kaneo-mcp.git
cd kaneo-mcp
npm install
npm run build
```

## Usage

### Claude Code

```bash
claude mcp add kaneo -- \
  env KANEO_URL=https://your-instance.com \
  KANEO_TOKEN=your-token \
  KANEO_WORKSPACE_ID=your-workspace-id \
  npx kaneo-mcp
```

### Claude Desktop

Add to `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "kaneo": {
      "command": "npx",
      "args": ["kaneo-mcp"],
      "env": {
        "KANEO_URL": "https://your-instance.com",
        "KANEO_TOKEN": "your-token",
        "KANEO_WORKSPACE_ID": "your-workspace-id"
      }
    }
  }
}
```

### From source (Claude Desktop)

```json
{
  "mcpServers": {
    "kaneo": {
      "command": "node",
      "args": ["/path/to/kaneo-mcp/dist/index.js"],
      "env": {
        "KANEO_URL": "https://your-instance.com",
        "KANEO_TOKEN": "your-token",
        "KANEO_WORKSPACE_ID": "your-workspace-id"
      }
    }
  }
}
```

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

## License

MIT
