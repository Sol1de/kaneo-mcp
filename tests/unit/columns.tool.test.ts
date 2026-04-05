import { describe, it, expect, beforeEach } from "vitest";
import { MockMcpServer } from "../helpers/MockMcpServer.js";
import { MockKaneoClient } from "../helpers/MockKaneoClient.js";
import { registerColumnTools } from "../../src/tools/columns.tool.js";
import type { KaneoClient } from "../../src/clients/client.js";
import type { McpServer } from "@modelcontextprotocol/server";

describe("Column Tools", () => {
  let server: MockMcpServer;
  let client: MockKaneoClient;

  beforeEach(() => {
    server = new MockMcpServer();
    client = new MockKaneoClient("ws-default");
    registerColumnTools(
      server as unknown as McpServer,
      client as unknown as KaneoClient,
    );
  });

  describe("list-columns", () => {
    it("calls GET /column/{projectId}", async () => {
      await server.getHandler("list-columns")({ projectId: "p1" });
      expect(client.lastCall).toEqual({
        method: "get",
        path: "/column/p1",
      });
    });
  });

  describe("create-column", () => {
    it("posts to /column with full body", async () => {
      await server.getHandler("create-column")({
        projectId: "p1",
        name: "Review",
        position: 2,
      });
      expect(client.lastCall).toEqual({
        method: "post",
        path: "/column",
        body: { projectId: "p1", name: "Review", position: 2 },
      });
    });
  });
});
