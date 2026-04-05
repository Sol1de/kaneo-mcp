# Tools Reference

All 22 MCP tools exposed by the server. Each tool accepts JSON input and returns a JSON text response.

---

## Projects

### `list-projects`

List all projects in the workspace.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `workspaceId` | string | No | Workspace ID (defaults to `KANEO_WORKSPACE_ID`) |
| `includeArchived` | boolean | No | Include archived projects |

```json
{ "workspaceId": "ws_abc", "includeArchived": true }
```

### `get-project`

Get details of a specific project.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string | Yes | Project ID |

```json
{ "id": "proj_123" }
```

### `create-project`

Create a new project in the workspace.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `name` | string | Yes | Project name |
| `slug` | string | Yes | URL-friendly identifier |
| `icon` | string | No | Project icon (emoji or identifier) |
| `workspaceId` | string | No | Workspace ID (defaults to `KANEO_WORKSPACE_ID`) |

```json
{ "name": "Backend API", "slug": "backend-api", "icon": "rocket" }
```

### `update-project`

Update an existing project. Only provide fields you want to change.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string | Yes | Project ID |
| `name` | string | No | Project name |
| `slug` | string | No | URL-friendly identifier |
| `icon` | string | No | Project icon |
| `description` | string | No | Project description |
| `isPublic` | boolean | No | Whether the project is public |

```json
{ "id": "proj_123", "name": "Backend API v2", "isPublic": true }
```

### `delete-project`

Permanently delete a project and all its tasks. **Cannot be undone.**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string | Yes | Project ID |

```json
{ "id": "proj_123" }
```

---

## Tasks

### `list-tasks`

List tasks for a project with optional filtering and sorting.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `projectId` | string | Yes | Project ID |
| `status` | string | No | Filter by task status |
| `priority` | string | No | Filter by priority (`no-priority`, `low`, `medium`, `high`, `urgent`) |
| `assigneeId` | string | No | Filter by assigned user ID |
| `sortBy` | string | No | Sort field: `createdAt`, `priority`, `dueDate`, `position`, `title`, `number` |
| `sortOrder` | string | No | `asc` or `desc` |
| `dueBefore` | string | No | Filter tasks due before this date (ISO 8601) |
| `dueAfter` | string | No | Filter tasks due after this date (ISO 8601) |
| `page` | string | No | Page number for pagination |
| `limit` | string | No | Results per page |

```json
{ "projectId": "proj_123", "priority": "high", "sortBy": "dueDate", "sortOrder": "asc" }
```

### `get-task`

Get details of a specific task.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string | Yes | Task ID |

```json
{ "id": "task_456" }
```

### `create-task`

Create a new task in a project.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `projectId` | string | Yes | Project ID |
| `title` | string | Yes | Task title |
| `description` | string | Yes | Task description |
| `priority` | string | Yes | `no-priority`, `low`, `medium`, `high`, or `urgent` |
| `status` | string | Yes | Task status (must match a column name in the project) |
| `dueDate` | string | No | Due date (ISO 8601) |
| `userId` | string | No | User ID to assign the task to |

```json
{
  "projectId": "proj_123",
  "title": "Fix login bug",
  "description": "Users cannot log in with SSO",
  "priority": "high",
  "status": "To Do"
}
```

### `update-task`

Update an existing task. Only provide fields you want to change.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string | Yes | Task ID |
| `title` | string | No | Task title |
| `description` | string | No | Task description |
| `priority` | string | No | `no-priority`, `low`, `medium`, `high`, or `urgent` |
| `status` | string | No | Task status |
| `projectId` | string | No | Project ID |
| `position` | number | No | Position/order in the column |
| `dueDate` | string | No | Due date (ISO 8601) |
| `userId` | string | No | Assigned user ID |

```json
{ "id": "task_456", "priority": "urgent", "dueDate": "2025-06-01T00:00:00Z" }
```

### `move-task`

Move a task to a different column/status on the Kanban board.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string | Yes | Task ID |
| `status` | string | Yes | New status (column name) to move the task to |

```json
{ "id": "task_456", "status": "In Review" }
```

### `delete-task`

Permanently delete a task. **Cannot be undone.**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string | Yes | Task ID |

```json
{ "id": "task_456" }
```

### `export-tasks`

Export all tasks from a project as JSON. Useful for reports or summaries.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `projectId` | string | Yes | Project ID |

```json
{ "projectId": "proj_123" }
```

---

## Columns

### `list-columns`

List all columns (statuses) for a project, ordered by position. Shows the Kanban board structure.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `projectId` | string | Yes | Project ID |

```json
{ "projectId": "proj_123" }
```

### `create-column`

Create a new column (status) in a project's Kanban board.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `projectId` | string | Yes | Project ID |
| `name` | string | Yes | Column name (e.g. "In Review", "Blocked") |
| `position` | number | Yes | Column position (0-based order) |

```json
{ "projectId": "proj_123", "name": "In Review", "position": 2 }
```

---

## Comments

### `get-task-comments`

Get all comments and activity history for a task.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `taskId` | string | Yes | Task ID |

```json
{ "taskId": "task_456" }
```

### `create-comment`

Add a comment to a task.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `taskId` | string | Yes | Task ID |
| `comment` | string | Yes | Comment text |

```json
{ "taskId": "task_456", "comment": "Looks good, merging now" }
```

---

## Labels (4 tools)

### `list-labels`

List all labels in the workspace.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `workspaceId` | string | No | Workspace ID (defaults to `KANEO_WORKSPACE_ID`) |

```json
{}
```

### `get-task-labels`

Get all labels attached to a specific task.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `taskId` | string | Yes | Task ID |

```json
{ "taskId": "task_456" }
```

### `attach-label`

Attach an existing label to a task.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `taskId` | string | Yes | Task ID |
| `labelId` | string | Yes | Label ID |

```json
{ "taskId": "task_456", "labelId": "label_789" }
```

### `detach-label`

Remove a label from a task.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `taskId` | string | Yes | Task ID |
| `labelId` | string | Yes | Label ID |

```json
{ "taskId": "task_456", "labelId": "label_789" }
```

---

## Search

### `search`

Search across tasks, projects, workspaces, comments, and activities.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `q` | string | Yes | Search query |
| `type` | string | No | Filter by type: `all`, `tasks`, `projects`, `workspaces`, `comments`, `activities` |
| `workspaceId` | string | No | Filter by workspace ID |
| `projectId` | string | No | Filter by project ID |
| `limit` | number | No | Max results (1-50, default: 20) |

```json
{ "q": "login bug", "type": "tasks", "limit": 10 }
```

---

## Workspace

### `list-workspace-members`

List all members of the workspace with their roles.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `workspaceId` | string | No | Workspace ID (defaults to `KANEO_WORKSPACE_ID`) |

```json
{}
```
