import { describe, it, expect, beforeEach } from "vitest";
import { MockMcpServer } from "../helpers/MockMcpServer.js";
import { MockKaneoClient } from "../helpers/MockKaneoClient.js";
import { registerProjectTools } from "../../src/tools/projects.tool.js";
import type { KaneoClient } from "../../src/clients/client.js";
import type { McpServer } from "@modelcontextprotocol/server";

describe("Project Tools", () => {
  let server: MockMcpServer;
  let client: MockKaneoClient;

  beforeEach(() => {
    server = new MockMcpServer();
    client = new MockKaneoClient("ws-default");
    registerProjectTools(
      server as unknown as McpServer,
      client as unknown as KaneoClient,
    );
  });

  it("registers all project tools", () => {
    expect(server.toolNames).toEqual([
      "list-projects",
      "get-project",
      "create-project",
      "update-project",
      "delete-project",
    ]);
  });

  describe("list-projects", () => {
    it("uses default workspaceId", async () => {
      await server.getHandler("list-projects")({});
      expect(client.lastCall).toEqual({
        method: "get",
        path: "/project?workspaceId=ws-default",
      });
    });

    it("uses custom workspaceId and includeArchived", async () => {
      await server.getHandler("list-projects")({
        workspaceId: "custom-ws",
        includeArchived: true,
      });
      expect(client.lastCall).toEqual({
        method: "get",
        path: "/project?workspaceId=custom-ws&includeArchived=true",
      });
    });
  });

  describe("get-project", () => {
    it("calls GET with project id", async () => {
      await server.getHandler("get-project")({ id: "p1" });
      expect(client.lastCall).toEqual({
        method: "get",
        path: "/project/p1",
      });
    });
  });

  describe("create-project", () => {
    it("posts with defaults", async () => {
      await server.getHandler("create-project")({ name: "P", slug: "p" });
      expect(client.lastCall).toEqual({
        method: "post",
        path: "/project",
        body: { name: "P", slug: "p", icon: "", workspaceId: "ws-default" },
      });
    });

    it("posts with explicit icon and workspaceId", async () => {
      await server.getHandler("create-project")({
        name: "P",
        slug: "p",
        icon: "rocket",
        workspaceId: "ws-custom",
      });
      expect(client.lastCall).toEqual({
        method: "post",
        path: "/project",
        body: { name: "P", slug: "p", icon: "rocket", workspaceId: "ws-custom" },
      });
    });
  });

  describe("update-project", () => {
    it("puts only provided fields", async () => {
      await server.getHandler("update-project")({ id: "p1", name: "New" });
      expect(client.lastCall).toEqual({
        method: "put",
        path: "/project/p1",
        body: { name: "New" },
      });
    });

    it("filters out undefined fields", async () => {
      await server.getHandler("update-project")({
        id: "p1",
        name: "New",
        slug: undefined,
        icon: undefined,
      });
      expect(client.lastCall!.body).toEqual({ name: "New" });
    });
  });

  describe("delete-project", () => {
    it("calls DEL with project id", async () => {
      await server.getHandler("delete-project")({ id: "p1" });
      expect(client.lastCall).toEqual({
        method: "del",
        path: "/project/p1",
      });
    });
  });
});
