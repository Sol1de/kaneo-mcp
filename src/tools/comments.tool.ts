import type { McpServer } from "@modelcontextprotocol/server";
import { z } from "zod/v4";
import type { KaneoClient } from "../clients/client.js";
import type { Activity } from "../types/index.js";
import { jsonResponse } from "./index.js";

export function registerCommentTools(server: McpServer, client: KaneoClient) {
  server.registerTool(
    "get-task-comments",
    {
      title: "Get Task Comments",
      description:
        "Get all comments and activity history for a task.",
      inputSchema: z.object({
        taskId: z.string().describe("Task ID"),
      }),
    },
    async ({ taskId }) => {
      const activities = await client.get<Activity[]>(
        `/activity/${encodeURIComponent(taskId)}`,
      );
      return jsonResponse(activities);
    },
  );

  server.registerTool(
    "create-comment",
    {
      title: "Create Comment",
      description: "Add a comment to a task.",
      inputSchema: z.object({
        taskId: z.string().describe("Task ID"),
        comment: z.string().describe("Comment text"),
      }),
    },
    async (body) => {
      const activity = await client.post<Activity>("/activity/comment", body);
      return jsonResponse(activity);
    },
  );
}
