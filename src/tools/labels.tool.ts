import type { McpServer } from "@modelcontextprotocol/server";
import { z } from "zod/v4";
import type { KaneoClient } from "../clients/client.js";
import type { Label } from "../types/index.js";
import { jsonResponse } from "./helpers.js";

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
      return jsonResponse(labels);
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
      return jsonResponse(labels);
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
      return jsonResponse(result);
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
      return jsonResponse(result);
    },
  );
}
