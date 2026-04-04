import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod/v4";
import type { KaneoClient } from "../client.js";
import type { Label } from "../types.js";

export function registerLabelTools(server: McpServer, client: KaneoClient) {
  server.registerTool(
    "list-labels",
    {
      title: "List Labels",
      description: "List all labels in the workspace.",
      inputSchema: z.object({
        workspaceId: z
          .string()
          .optional()
          .describe("Workspace ID (defaults to KANEO_WORKSPACE_ID)"),
      }),
    },
    async ({ workspaceId }) => {
      const wsId = workspaceId ?? client.workspaceId;
      const labels = await client.get<Label[]>(
        `/label/workspace/${encodeURIComponent(wsId)}`,
      );
      return {
        content: [{ type: "text" as const, text: JSON.stringify(labels, null, 2) }],
      };
    },
  );

  server.registerTool(
    "get-task-labels",
    {
      title: "Get Task Labels",
      description: "Get all labels attached to a specific task.",
      inputSchema: z.object({
        taskId: z.string().describe("Task ID"),
      }),
    },
    async ({ taskId }) => {
      const labels = await client.get<Label[]>(
        `/label/task/${encodeURIComponent(taskId)}`,
      );
      return {
        content: [{ type: "text" as const, text: JSON.stringify(labels, null, 2) }],
      };
    },
  );

  server.registerTool(
    "attach-label",
    {
      title: "Attach Label to Task",
      description: "Attach an existing label to a task.",
      inputSchema: z.object({
        taskId: z.string().describe("Task ID"),
        labelId: z.string().describe("Label ID"),
      }),
    },
    async (body) => {
      const result = await client.post<unknown>("/label/attach", body);
      return {
        content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }],
      };
    },
  );

  server.registerTool(
    "detach-label",
    {
      title: "Detach Label from Task",
      description: "Remove a label from a task.",
      inputSchema: z.object({
        taskId: z.string().describe("Task ID"),
        labelId: z.string().describe("Label ID"),
      }),
    },
    async ({ taskId, labelId }) => {
      const result = await client.del<unknown>(
        `/label/detach?taskId=${encodeURIComponent(taskId)}&labelId=${encodeURIComponent(labelId)}`,
      );
      return {
        content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }],
      };
    },
  );
}
