import type { McpServer } from "@modelcontextprotocol/server";
import { z } from "zod/v4";
import type { KaneoClient } from "../clients/client.js";
import type { Project } from "../types/index.js";
import { jsonResponse } from "./helpers.js";

export function registerProjectTools(server: McpServer, client: KaneoClient) {
  server.registerTool(
    "list-projects",
    {
      title: "List Projects",
      description:
        "List all projects in the workspace. Optionally include archived projects.",
      inputSchema: z.object({
        workspaceId: z
          .string()
          .optional()
          .describe("Workspace ID (defaults to KANEO_WORKSPACE_ID)"),
        includeArchived: z
          .boolean()
          .optional()
          .describe("Include archived projects"),
      }),
    },
    async ({ workspaceId, includeArchived }) => {
      const wsId = workspaceId ?? client.workspaceId;
      let path = `/project?workspaceId=${encodeURIComponent(wsId)}`;
      if (includeArchived) path += "&includeArchived=true";
      const projects = await client.get<Project[]>(path);
      return jsonResponse(projects);
    },
  );

  server.registerTool(
    "get-project",
    {
      title: "Get Project",
      description: "Get details of a specific project by ID.",
      inputSchema: z.object({
        id: z.string().describe("Project ID"),
      }),
    },
    async ({ id }) => {
      const project = await client.get<Project>(`/project/${encodeURIComponent(id)}`);
      return jsonResponse(project);
    },
  );

  server.registerTool(
    "create-project",
    {
      title: "Create Project",
      description: "Create a new project in the workspace.",
      inputSchema: z.object({
        name: z.string().describe("Project name"),
        slug: z.string().describe("URL-friendly identifier for the project"),
        icon: z.string().optional().describe("Project icon (emoji or identifier)"),
        workspaceId: z
          .string()
          .optional()
          .describe("Workspace ID (defaults to KANEO_WORKSPACE_ID)"),
      }),
    },
    async ({ name, slug, icon, workspaceId }) => {
      const project = await client.post<Project>("/project", {
        name,
        slug,
        icon: icon ?? "",
        workspaceId: workspaceId ?? client.workspaceId,
      });
      return jsonResponse(project);
    },
  );

  server.registerTool(
    "update-project",
    {
      title: "Update Project",
      description:
        "Update an existing project's details. Only provide the fields you want to change.",
      inputSchema: z.object({
        id: z.string().describe("Project ID"),
        name: z.string().optional().describe("Project name"),
        slug: z.string().optional().describe("URL-friendly identifier"),
        icon: z.string().optional().describe("Project icon"),
        description: z.string().optional().describe("Project description"),
        isPublic: z.boolean().optional().describe("Whether the project is public"),
      }),
    },
    async ({ id, ...body }) => {
      const filtered = Object.fromEntries(
        Object.entries(body).filter(([, v]) => v !== undefined),
      );
      const project = await client.put<Project>(
        `/project/${encodeURIComponent(id)}`,
        filtered,
      );
      return jsonResponse(project);
    },
  );

  server.registerTool(
    "delete-project",
    {
      title: "Delete Project",
      description:
        "Permanently delete a project and all its tasks. This action cannot be undone.",
      inputSchema: z.object({
        id: z.string().describe("Project ID"),
      }),
    },
    async ({ id }) => {
      const result = await client.del<Project>(`/project/${encodeURIComponent(id)}`);
      return jsonResponse(result);
    },
  );
}
