import { describe, it, expect, beforeEach } from "vitest";
import { MockMcpServer } from "../helpers/MockMcpServer.js";
import { MockKaneoClient } from "../helpers/MockKaneoClient.js";
import { registerCommentTools } from "../../src/tools/comments.tool.js";
import type { KaneoClient } from "../../src/clients/client.js";
import type { McpServer } from "@modelcontextprotocol/server";

describe("Comment Tools", () => {
  let server: MockMcpServer;
  let client: MockKaneoClient;

  beforeEach(() => {
    server = new MockMcpServer();
    client = new MockKaneoClient("ws-default");
    registerCommentTools(
      server as unknown as McpServer,
      client as unknown as KaneoClient,
    );
  });

  describe("get-task-comments", () => {
    it("calls GET /activity/{taskId}", async () => {
      await server.getHandler("get-task-comments")({ taskId: "t1" });
      expect(client.lastCall).toEqual({
        method: "get",
        path: "/activity/t1",
      });
    });
  });

  describe("create-comment", () => {
    it("posts to /activity/comment with body", async () => {
      await server.getHandler("create-comment")({
        taskId: "t1",
        comment: "hello",
      });
      expect(client.lastCall).toEqual({
        method: "post",
        path: "/activity/comment",
        body: { taskId: "t1", comment: "hello" },
      });
    });
  });
});
