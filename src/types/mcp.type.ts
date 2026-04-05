export type McpResult =
  | { kind: "handled" }
  | { kind: "error"; status: number; body: Record<string, unknown> };
