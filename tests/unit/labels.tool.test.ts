import { describe, it, expect, beforeEach } from "vitest";
import { MockMcpServer } from "../helpers/MockMcpServer.js";
import { MockKaneoClient } from "../helpers/MockKaneoClient.js";
import { registerLabelTools } from "../../src/tools/labels.tool.js";
import type { KaneoClient } from "../../src/clients/client.js";
import type { McpServer } from "@modelcontextprotocol/server";

describe("Label Tools", () => {
  let server: MockMcpServer;
  let client: MockKaneoClient;

  beforeEach(() => {
    server = new MockMcpServer();
    client = new MockKaneoClient("ws-default");
    registerLabelTools(
      server as unknown as McpServer,
      client as unknown as KaneoClient,
    );
  });

  describe("list-labels", () => {
    it("uses default workspaceId", async () => {
      await server.getHandler("list-labels")({});
      expect(client.lastCall).toEqual({
        method: "get",
        path: "/label/workspace/ws-default",
      });
    });

    it("uses custom workspaceId", async () => {
      await server.getHandler("list-labels")({ workspaceId: "custom-ws" });
      expect(client.lastCall).toEqual({
        method: "get",
        path: "/label/workspace/custom-ws",
      });
    });
  });

  describe("get-task-labels", () => {
    it("calls GET /label/task/{taskId}", async () => {
      await server.getHandler("get-task-labels")({ taskId: "t1" });
      expect(client.lastCall).toEqual({
        method: "get",
        path: "/label/task/t1",
      });
    });
  });

  describe("attach-label", () => {
    it("posts to /label/attach with body", async () => {
      await server.getHandler("attach-label")({
        taskId: "t1",
        labelId: "l1",
      });
      expect(client.lastCall).toEqual({
        method: "post",
        path: "/label/attach",
        body: { taskId: "t1", labelId: "l1" },
      });
    });
  });

  describe("detach-label", () => {
    it("calls DEL with query params", async () => {
      await server.getHandler("detach-label")({
        taskId: "t1",
        labelId: "l1",
      });
      expect(client.lastCall).toEqual({
        method: "del",
        path: "/label/detach?taskId=t1&labelId=l1",
      });
    });
  });
});
