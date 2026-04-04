export class Environment {
  readonly kaneoUrl: string;
  readonly workspaceId: string;
  readonly port: number;

  constructor() {
    const kaneoUrl = process.env.KANEO_URL;
    const workspaceId = process.env.KANEO_WORKSPACE_ID;

    if (!kaneoUrl) throw new Error("KANEO_URL environment variable is required");
    if (!workspaceId)
      throw new Error("KANEO_WORKSPACE_ID environment variable is required");

    this.kaneoUrl = kaneoUrl;
    this.workspaceId = workspaceId;
    this.port = parseInt(process.env.MCP_PORT ?? "3000", 10);
  }
}
