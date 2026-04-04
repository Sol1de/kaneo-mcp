import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod/v4";
import type { KaneoClient } from "../client.js";
import type { SearchResult } from "../types.js";

export function registerSearchTools(server: McpServer, client: KaneoClient) {
  server.registerTool(
    "search",
    {
      title: "Search Kaneo",
      description:
        "Search across tasks, projects, workspaces, comments, and activities.",
      inputSchema: z.object({
        q: z.string().describe("Search query"),
        type: z
          .enum(["all", "tasks", "projects", "workspaces", "comments", "activities"])
          .optional()
          .describe("Filter results by type (default: all)"),
        workspaceId: z
          .string()
          .optional()
          .describe("Filter by workspace ID"),
        projectId: z.string().optional().describe("Filter by project ID"),
        limit: z
          .number()
          .int()
          .min(1)
          .max(50)
          .optional()
          .describe("Max results (1-50, default: 20)"),
      }),
    },
    async ({ q, type, workspaceId, projectId, limit }) => {
      const params = new URLSearchParams({ q });
      if (type) params.set("type", type);
      if (workspaceId) params.set("workspaceId", workspaceId);
      if (projectId) params.set("projectId", projectId);
      if (limit) params.set("limit", String(limit));
      const result = await client.get<SearchResult>(`/search?${params}`);
      return {
        content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }],
      };
    },
  );
}
