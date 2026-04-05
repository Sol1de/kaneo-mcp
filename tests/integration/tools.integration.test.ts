import { describe, it, expect, beforeAll, afterAll, beforeEach } from "vitest";
import { MockMcpServer } from "../helpers/MockMcpServer.js";
import { MockKaneoApi } from "../helpers/MockKaneoApi.js";
import { KaneoClient } from "../../src/clients/client.js";
import { registerAllTools } from "../../src/tools/index.js";
import type { McpServer } from "@modelcontextprotocol/server";

describe("Integration: Tools → KaneoClient → HTTP", () => {
  const mockApi = new MockKaneoApi();
  let server: MockMcpServer;
  let client: KaneoClient;

  beforeAll(async () => {
    await mockApi.start();
  });

  afterAll(async () => {
    await mockApi.stop();
  });

  beforeEach(() => {
    server = new MockMcpServer();
    client = KaneoClient.create({
      baseUrl: `http://localhost:${mockApi.port}`,
      token: "test-token",
      workspaceId: "ws-int",
    });
    registerAllTools(server as unknown as McpServer, client);
    mockApi.reset();
  });

  // --- Projects ---

  it("list-projects → GET /api/project?workspaceId=ws-int", async () => {
    await server.getHandler("list-projects")({});
    expect(mockApi.lastRequest!.method).toBe("GET");
    expect(mockApi.lastRequest!.url).toBe("/api/project?workspaceId=ws-int");
    expect(mockApi.lastRequest!.headers.authorization).toBe("Bearer test-token");
  });

  it("get-project → GET /api/project/{id}", async () => {
    await server.getHandler("get-project")({ id: "p1" });
    expect(mockApi.lastRequest!.method).toBe("GET");
    expect(mockApi.lastRequest!.url).toBe("/api/project/p1");
  });

  it("create-project → POST /api/project", async () => {
    await server.getHandler("create-project")({ name: "P", slug: "p" });
    expect(mockApi.lastRequest!.method).toBe("POST");
    expect(mockApi.lastRequest!.url).toBe("/api/project");
    expect(JSON.parse(mockApi.lastRequest!.body)).toEqual({
      name: "P",
      slug: "p",
      icon: "",
      workspaceId: "ws-int",
    });
  });

  it("update-project → PUT /api/project/{id}", async () => {
    await server.getHandler("update-project")({ id: "p1", name: "New" });
    expect(mockApi.lastRequest!.method).toBe("PUT");
    expect(mockApi.lastRequest!.url).toBe("/api/project/p1");
    expect(JSON.parse(mockApi.lastRequest!.body)).toEqual({ name: "New" });
  });

  it("delete-project → DELETE /api/project/{id}", async () => {
    await server.getHandler("delete-project")({ id: "p1" });
    expect(mockApi.lastRequest!.method).toBe("DELETE");
    expect(mockApi.lastRequest!.url).toBe("/api/project/p1");
  });

  // --- Tasks ---

  it("list-tasks → GET /api/task/tasks/{projectId}", async () => {
    await server.getHandler("list-tasks")({ projectId: "p1" });
    expect(mockApi.lastRequest!.method).toBe("GET");
    expect(mockApi.lastRequest!.url).toBe("/api/task/tasks/p1");
  });

  it("get-task → GET /api/task/{id}", async () => {
    await server.getHandler("get-task")({ id: "t1" });
    expect(mockApi.lastRequest!.method).toBe("GET");
    expect(mockApi.lastRequest!.url).toBe("/api/task/t1");
  });

  it("create-task → POST /api/task/{projectId}", async () => {
    await server.getHandler("create-task")({
      projectId: "p1",
      title: "T",
      description: "D",
      priority: "high",
      status: "todo",
    });
    expect(mockApi.lastRequest!.method).toBe("POST");
    expect(mockApi.lastRequest!.url).toBe("/api/task/p1");
    expect(JSON.parse(mockApi.lastRequest!.body)).toEqual({
      title: "T",
      description: "D",
      priority: "high",
      status: "todo",
    });
  });

  it("update-task → PUT /api/task/{id}", async () => {
    await server.getHandler("update-task")({ id: "t1", title: "New" });
    expect(mockApi.lastRequest!.method).toBe("PUT");
    expect(mockApi.lastRequest!.url).toBe("/api/task/t1");
    expect(JSON.parse(mockApi.lastRequest!.body)).toEqual({ title: "New" });
  });

  it("move-task → PUT /api/task/status/{id}", async () => {
    await server.getHandler("move-task")({ id: "t1", status: "done" });
    expect(mockApi.lastRequest!.method).toBe("PUT");
    expect(mockApi.lastRequest!.url).toBe("/api/task/status/t1");
    expect(JSON.parse(mockApi.lastRequest!.body)).toEqual({ status: "done" });
  });

  it("delete-task → DELETE /api/task/{id}", async () => {
    await server.getHandler("delete-task")({ id: "t1" });
    expect(mockApi.lastRequest!.method).toBe("DELETE");
    expect(mockApi.lastRequest!.url).toBe("/api/task/t1");
  });

  it("export-tasks → GET /api/task/export/{projectId}", async () => {
    await server.getHandler("export-tasks")({ projectId: "p1" });
    expect(mockApi.lastRequest!.method).toBe("GET");
    expect(mockApi.lastRequest!.url).toBe("/api/task/export/p1");
  });

  // --- Columns ---

  it("list-columns → GET /api/column/{projectId}", async () => {
    await server.getHandler("list-columns")({ projectId: "p1" });
    expect(mockApi.lastRequest!.method).toBe("GET");
    expect(mockApi.lastRequest!.url).toBe("/api/column/p1");
  });

  it("create-column → POST /api/column", async () => {
    await server.getHandler("create-column")({
      projectId: "p1",
      name: "Review",
      position: 2,
    });
    expect(mockApi.lastRequest!.method).toBe("POST");
    expect(mockApi.lastRequest!.url).toBe("/api/column");
    expect(JSON.parse(mockApi.lastRequest!.body)).toEqual({
      projectId: "p1",
      name: "Review",
      position: 2,
    });
  });

  // --- Comments ---

  it("get-task-comments → GET /api/activity/{taskId}", async () => {
    await server.getHandler("get-task-comments")({ taskId: "t1" });
    expect(mockApi.lastRequest!.method).toBe("GET");
    expect(mockApi.lastRequest!.url).toBe("/api/activity/t1");
  });

  it("create-comment → POST /api/activity/comment", async () => {
    await server.getHandler("create-comment")({
      taskId: "t1",
      comment: "hello",
    });
    expect(mockApi.lastRequest!.method).toBe("POST");
    expect(mockApi.lastRequest!.url).toBe("/api/activity/comment");
    expect(JSON.parse(mockApi.lastRequest!.body)).toEqual({
      taskId: "t1",
      comment: "hello",
    });
  });

  // --- Labels ---

  it("list-labels → GET /api/label/workspace/{wsId}", async () => {
    await server.getHandler("list-labels")({});
    expect(mockApi.lastRequest!.method).toBe("GET");
    expect(mockApi.lastRequest!.url).toBe("/api/label/workspace/ws-int");
  });

  it("get-task-labels → GET /api/label/task/{taskId}", async () => {
    await server.getHandler("get-task-labels")({ taskId: "t1" });
    expect(mockApi.lastRequest!.method).toBe("GET");
    expect(mockApi.lastRequest!.url).toBe("/api/label/task/t1");
  });

  it("attach-label → POST /api/label/attach", async () => {
    await server.getHandler("attach-label")({ taskId: "t1", labelId: "l1" });
    expect(mockApi.lastRequest!.method).toBe("POST");
    expect(mockApi.lastRequest!.url).toBe("/api/label/attach");
    expect(JSON.parse(mockApi.lastRequest!.body)).toEqual({
      taskId: "t1",
      labelId: "l1",
    });
  });

  it("detach-label → DELETE /api/label/detach?taskId=t1&labelId=l1", async () => {
    await server.getHandler("detach-label")({ taskId: "t1", labelId: "l1" });
    expect(mockApi.lastRequest!.method).toBe("DELETE");
    expect(mockApi.lastRequest!.url).toBe("/api/label/detach?taskId=t1&labelId=l1");
  });

  // --- Search ---

  it("search → GET /api/search?q=bug", async () => {
    await server.getHandler("search")({ q: "bug" });
    expect(mockApi.lastRequest!.method).toBe("GET");
    expect(mockApi.lastRequest!.url).toBe("/api/search?q=bug");
  });

  // --- Workspace ---

  it("list-workspace-members → GET /api/workspace/{wsId}/members", async () => {
    await server.getHandler("list-workspace-members")({});
    expect(mockApi.lastRequest!.method).toBe("GET");
    expect(mockApi.lastRequest!.url).toBe("/api/workspace/ws-int/members");
  });
});
