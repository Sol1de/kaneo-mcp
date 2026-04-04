import type { McpServer } from "@modelcontextprotocol/server";
import { z } from "zod/v4";
import type { KaneoClient } from "../clients/client.js";
import type { WorkspaceMember } from "../types/index.js";
import { jsonResponse } from "./helpers.js";

export function registerWorkspaceTools(server: McpServer, client: KaneoClient) {
  server.registerTool(
    "list-workspace-members",
    {
      title: "List Workspace Members",
      description: "List all members of the workspace with their roles.",
      inputSchema: z.object({
        workspaceId: z
          .string()
          .optional()
          .describe("Workspace ID (defaults to KANEO_WORKSPACE_ID)"),
      }),
    },
    async ({ workspaceId }) => {
      const wsId = workspaceId ?? client.workspaceId;
      const members = await client.get<WorkspaceMember[]>(
        `/workspace/${encodeURIComponent(wsId)}/members`,
      );
      return jsonResponse(members);
    },
  );
}
