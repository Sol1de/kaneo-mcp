import type { McpServer } from "@modelcontextprotocol/server";
import { z } from "zod/v4";
import type { KaneoClient } from "../clients/client.js";
import type { Task } from "../types/index.js";
import { jsonResponse } from "./helpers.js";

export function registerTaskTools(server: McpServer, client: KaneoClient) {
  server.registerTool(
    "list-tasks",
    {
      title: "List Tasks",
      description:
        "List tasks for a project with optional filtering and sorting.",
      inputSchema: z.object({
        projectId: z.string().describe("Project ID"),
        status: z.string().optional().describe("Filter by task status"),
        priority: z
          .string()
          .optional()
          .describe("Filter by priority (no-priority, low, medium, high, urgent)"),
        assigneeId: z.string().optional().describe("Filter by assigned user ID"),
        sortBy: z
          .enum(["createdAt", "priority", "dueDate", "position", "title", "number"])
          .optional()
          .describe("Sort field"),
        sortOrder: z.enum(["asc", "desc"]).optional().describe("Sort direction"),
        dueBefore: z
          .string()
          .optional()
          .describe("Filter tasks due before this date (ISO 8601)"),
        dueAfter: z
          .string()
          .optional()
          .describe("Filter tasks due after this date (ISO 8601)"),
        page: z.string().optional().describe("Page number for pagination"),
        limit: z.string().optional().describe("Results per page"),
      }),
    },
    async ({ projectId, ...filters }) => {
      const params = new URLSearchParams();
      for (const [key, value] of Object.entries(filters)) {
        if (value !== undefined) params.set(key, value);
      }
      const qs = params.toString();
      const path = `/task/tasks/${encodeURIComponent(projectId)}${qs ? `?${qs}` : ""}`;
      const result = await client.get<unknown>(path);
      return jsonResponse(result);
    },
  );

  server.registerTool(
    "get-task",
    {
      title: "Get Task",
      description: "Get details of a specific task by ID.",
      inputSchema: z.object({
        id: z.string().describe("Task ID"),
      }),
    },
    async ({ id }) => {
      const task = await client.get<Task>(`/task/${encodeURIComponent(id)}`);
      return jsonResponse(task);
    },
  );

  server.registerTool(
    "create-task",
    {
      title: "Create Task",
      description: "Create a new task in a project.",
      inputSchema: z.object({
        projectId: z.string().describe("Project ID to create the task in"),
        title: z.string().describe("Task title"),
        description: z.string().describe("Task description"),
        priority: z
          .enum(["no-priority", "low", "medium", "high", "urgent"])
          .describe("Task priority"),
        status: z.string().describe("Task status (must match a column name in the project)"),
        dueDate: z.string().optional().describe("Due date (ISO 8601)"),
        userId: z.string().optional().describe("User ID to assign the task to"),
      }),
    },
    async ({ projectId, ...body }) => {
      const task = await client.post<Task>(
        `/task/${encodeURIComponent(projectId)}`,
        body,
      );
      return jsonResponse(task);
    },
  );

  server.registerTool(
    "update-task",
    {
      title: "Update Task",
      description:
        "Update an existing task. Only provide the fields you want to change.",
      inputSchema: z.object({
        id: z.string().describe("Task ID"),
        title: z.string().optional().describe("Task title"),
        description: z.string().optional().describe("Task description"),
        priority: z
          .enum(["no-priority", "low", "medium", "high", "urgent"])
          .optional()
          .describe("Task priority"),
        status: z.string().optional().describe("Task status"),
        projectId: z.string().optional().describe("Project ID the task belongs to"),
        position: z.number().optional().describe("Task position/order in the column"),
        dueDate: z.string().optional().describe("Due date (ISO 8601)"),
        userId: z.string().optional().describe("Assigned user ID"),
      }),
    },
    async ({ id, ...body }) => {
      const filtered = Object.fromEntries(
        Object.entries(body).filter(([, v]) => v !== undefined),
      );
      const task = await client.put<Task>(
        `/task/${encodeURIComponent(id)}`,
        filtered,
      );
      return jsonResponse(task);
    },
  );

  server.registerTool(
    "move-task",
    {
      title: "Move Task",
      description:
        "Move a task to a different column/status on the Kanban board.",
      inputSchema: z.object({
        id: z.string().describe("Task ID"),
        status: z
          .string()
          .describe("New status (column name) to move the task to"),
      }),
    },
    async ({ id, status }) => {
      const task = await client.put<Task>(
        `/task/status/${encodeURIComponent(id)}`,
        { status },
      );
      return jsonResponse(task);
    },
  );

  server.registerTool(
    "delete-task",
    {
      title: "Delete Task",
      description: "Permanently delete a task. This action cannot be undone.",
      inputSchema: z.object({
        id: z.string().describe("Task ID"),
      }),
    },
    async ({ id }) => {
      const result = await client.del<Task>(`/task/${encodeURIComponent(id)}`);
      return jsonResponse(result);
    },
  );

  server.registerTool(
    "export-tasks",
    {
      title: "Export Tasks",
      description:
        "Export all tasks from a project as JSON. Useful for generating reports or summaries.",
      inputSchema: z.object({
        projectId: z.string().describe("Project ID"),
      }),
    },
    async ({ projectId }) => {
      const result = await client.get<unknown>(
        `/task/export/${encodeURIComponent(projectId)}`,
      );
      return jsonResponse(result);
    },
  );
}
