import { describe, it, expect, beforeEach } from "vitest";
import { MockMcpServer } from "../helpers/MockMcpServer.js";
import { MockKaneoClient } from "../helpers/MockKaneoClient.js";
import { registerSearchTools } from "../../src/tools/search.tool.js";
import type { KaneoClient } from "../../src/clients/client.js";
import type { McpServer } from "@modelcontextprotocol/server";

describe("Search Tools", () => {
  let server: MockMcpServer;
  let client: MockKaneoClient;

  beforeEach(() => {
    server = new MockMcpServer();
    client = new MockKaneoClient("ws-default");
    registerSearchTools(
      server as unknown as McpServer,
      client as unknown as KaneoClient,
    );
  });

  describe("search", () => {
    it("calls GET /search with query only", async () => {
      await server.getHandler("search")({ q: "bug" });
      expect(client.lastCall).toEqual({
        method: "get",
        path: "/search?q=bug",
      });
    });

    it("includes all optional params", async () => {
      await server.getHandler("search")({
        q: "bug",
        type: "tasks",
        workspaceId: "ws1",
        projectId: "p1",
        limit: 10,
      });
      const path = client.lastCall!.path;
      expect(path).toContain("q=bug");
      expect(path).toContain("type=tasks");
      expect(path).toContain("workspaceId=ws1");
      expect(path).toContain("projectId=p1");
      expect(path).toContain("limit=10");
    });
  });
});
