export class Environment {
  readonly kaneoUrl: string;
  readonly workspaceId: string;
  readonly port: number;

  // OAuth (optional — enabled when ZITADEL_ISSUER is set)
  readonly zitadelIssuer?: string;
  readonly zitadelAudience?: string;
  readonly mcpServerOrigin?: string;
  readonly kaneoDefaultApiKey?: string;
  readonly kaneoUserTokenMap?: Map<string, string>;

  get oauthEnabled(): boolean {
    return !!this.zitadelIssuer;
  }

  constructor() {
    const kaneoUrl = process.env.KANEO_URL;
    const workspaceId = process.env.KANEO_WORKSPACE_ID;

    if (!kaneoUrl) throw new Error("KANEO_URL environment variable is required");
    if (!workspaceId)
      throw new Error("KANEO_WORKSPACE_ID environment variable is required");

    this.kaneoUrl = kaneoUrl;
    this.workspaceId = workspaceId;
    this.port = parseInt(process.env.MCP_PORT ?? "3000", 10);

    // OAuth config
    this.zitadelIssuer = process.env.ZITADEL_ISSUER;
    this.zitadelAudience = process.env.ZITADEL_AUDIENCE;
    this.mcpServerOrigin = process.env.MCP_SERVER_ORIGIN;
    this.kaneoDefaultApiKey = process.env.KANEO_DEFAULT_API_KEY;

    if (this.zitadelIssuer) {
      if (!this.zitadelAudience)
        throw new Error("ZITADEL_AUDIENCE is required when ZITADEL_ISSUER is set");
      if (!this.mcpServerOrigin)
        throw new Error("MCP_SERVER_ORIGIN is required when ZITADEL_ISSUER is set");
    }

    const userTokenMapJson = process.env.KANEO_USER_TOKEN_MAP;
    if (userTokenMapJson) {
      const parsed = JSON.parse(userTokenMapJson) as Record<string, string>;
      this.kaneoUserTokenMap = new Map(Object.entries(parsed));
    }
  }
}
