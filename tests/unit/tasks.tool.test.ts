import { describe, it, expect, beforeEach } from "vitest";
import { MockMcpServer } from "../helpers/MockMcpServer.js";
import { MockKaneoClient } from "../helpers/MockKaneoClient.js";
import { registerTaskTools } from "../../src/tools/tasks.tool.js";
import type { KaneoClient } from "../../src/clients/client.js";
import type { McpServer } from "@modelcontextprotocol/server";

describe("Task Tools", () => {
  let server: MockMcpServer;
  let client: MockKaneoClient;

  beforeEach(() => {
    server = new MockMcpServer();
    client = new MockKaneoClient("ws-default");
    registerTaskTools(
      server as unknown as McpServer,
      client as unknown as KaneoClient,
    );
  });

  it("registers all task tools", () => {
    expect(server.toolNames).toEqual([
      "list-tasks",
      "get-task",
      "create-task",
      "update-task",
      "move-task",
      "delete-task",
      "export-tasks",
    ]);
  });

  describe("list-tasks", () => {
    it("calls GET with projectId only", async () => {
      await server.getHandler("list-tasks")({ projectId: "p1" });
      expect(client.lastCall).toEqual({
        method: "get",
        path: "/task/tasks/p1",
      });
    });

    it("includes query params for filters", async () => {
      await server.getHandler("list-tasks")({
        projectId: "p1",
        status: "done",
        sortBy: "priority",
        sortOrder: "desc",
      });
      const path = client.lastCall!.path;
      expect(path).toContain("/task/tasks/p1?");
      expect(path).toContain("status=done");
      expect(path).toContain("sortBy=priority");
      expect(path).toContain("sortOrder=desc");
    });
  });

  describe("get-task", () => {
    it("calls GET with task id", async () => {
      await server.getHandler("get-task")({ id: "t1" });
      expect(client.lastCall).toEqual({
        method: "get",
        path: "/task/t1",
      });
    });
  });

  describe("create-task", () => {
    it("posts to /task/{projectId} with body", async () => {
      await server.getHandler("create-task")({
        projectId: "p1",
        title: "T",
        description: "D",
        priority: "high",
        status: "todo",
      });
      expect(client.lastCall).toEqual({
        method: "post",
        path: "/task/p1",
        body: { title: "T", description: "D", priority: "high", status: "todo" },
      });
    });

    it("includes optional fields", async () => {
      await server.getHandler("create-task")({
        projectId: "p1",
        title: "T",
        description: "D",
        priority: "low",
        status: "backlog",
        dueDate: "2026-01-01",
        userId: "u1",
      });
      expect(client.lastCall!.body).toEqual({
        title: "T",
        description: "D",
        priority: "low",
        status: "backlog",
        dueDate: "2026-01-01",
        userId: "u1",
      });
    });
  });

  describe("update-task", () => {
    it("puts only provided fields", async () => {
      await server.getHandler("update-task")({ id: "t1", title: "New" });
      expect(client.lastCall).toEqual({
        method: "put",
        path: "/task/t1",
        body: { title: "New" },
      });
    });

    it("filters out undefined fields", async () => {
      await server.getHandler("update-task")({
        id: "t1",
        title: "New",
        description: undefined,
        priority: undefined,
      });
      expect(client.lastCall!.body).toEqual({ title: "New" });
    });
  });

  describe("move-task", () => {
    it("puts to /task/status/{id}", async () => {
      await server.getHandler("move-task")({ id: "t1", status: "done" });
      expect(client.lastCall).toEqual({
        method: "put",
        path: "/task/status/t1",
        body: { status: "done" },
      });
    });
  });

  describe("delete-task", () => {
    it("calls DEL with task id", async () => {
      await server.getHandler("delete-task")({ id: "t1" });
      expect(client.lastCall).toEqual({
        method: "del",
        path: "/task/t1",
      });
    });
  });

  describe("export-tasks", () => {
    it("calls GET /task/export/{projectId}", async () => {
      await server.getHandler("export-tasks")({ projectId: "p1" });
      expect(client.lastCall).toEqual({
        method: "get",
        path: "/task/export/p1",
      });
    });
  });
});
