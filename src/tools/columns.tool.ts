import type { McpServer } from "@modelcontextprotocol/server";
import { z } from "zod/v4";
import type { KaneoClient } from "../clients/client.js";
import type { Column } from "../types/index.js";
import { jsonResponse } from "./index.js";

export function registerColumnTools(server: McpServer, client: KaneoClient) {
  server.registerTool(
    "list-columns",
    {
      title: "List Columns",
      description:
        "List all columns (statuses) for a project, ordered by position. Use this to see the Kanban board structure.",
      inputSchema: z.object({
        projectId: z.string().describe("Project ID"),
      }),
    },
    async ({ projectId }) => {
      const columns = await client.get<Column[]>(
        `/column/${encodeURIComponent(projectId)}`,
      );
      return jsonResponse(columns);
    },
  );

  server.registerTool(
    "create-column",
    {
      title: "Create Column",
      description: "Create a new column (status) in a project's Kanban board.",
      inputSchema: z.object({
        projectId: z.string().describe("Project ID"),
        name: z.string().describe("Column name (e.g. 'In Review', 'Blocked')"),
        position: z.number().describe("Column position (0-based order)"),
      }),
    },
    async (body) => {
      const column = await client.post<Column>("/column", body);
      return jsonResponse(column);
    },
  );
}
