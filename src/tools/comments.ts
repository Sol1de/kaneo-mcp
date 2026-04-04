import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod/v4";
import type { KaneoClient } from "../client.js";
import type { Activity } from "../types.js";

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
      return {
        content: [
          { type: "text" as const, text: JSON.stringify(activities, null, 2) },
        ],
      };
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
      return {
        content: [
          { type: "text" as const, text: JSON.stringify(activity, null, 2) },
        ],
      };
    },
  );
}
