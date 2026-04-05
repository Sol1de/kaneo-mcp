import { describe, it, expect, beforeEach } from "vitest";
import { MockMcpServer } from "../helpers/MockMcpServer.js";
import { MockKaneoClient } from "../helpers/MockKaneoClient.js";
import { registerWorkspaceTools } from "../../src/tools/workspace.tool.js";
import type { KaneoClient } from "../../src/clients/client.js";
import type { McpServer } from "@modelcontextprotocol/server";

describe("Workspace Tools", () => {
  let server: MockMcpServer;
  let client: MockKaneoClient;

  beforeEach(() => {
    server = new MockMcpServer();
    client = new MockKaneoClient("ws-default");
    registerWorkspaceTools(
      server as unknown as McpServer,
      client as unknown as KaneoClient,
    );
  });

  describe("list-workspace-members", () => {
    it("uses default workspaceId", async () => {
      await server.getHandler("list-workspace-members")({});
      expect(client.lastCall).toEqual({
        method: "get",
        path: "/workspace/ws-default/members",
      });
    });

    it("uses custom workspaceId", async () => {
      await server.getHandler("list-workspace-members")({
        workspaceId: "custom-ws",
      });
      expect(client.lastCall).toEqual({
        method: "get",
        path: "/workspace/custom-ws/members",
      });
    });
  });
});
