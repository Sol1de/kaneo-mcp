import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod/v4";
import type { KaneoClient } from "../client.js";
import type { WorkspaceMember } from "../types.js";

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
      return {
        content: [{ type: "text" as const, text: JSON.stringify(members, null, 2) }],
      };
    },
  );
}
