type ToolHandler = (args: Record<string, unknown>) => Promise<unknown>;

interface RegisteredToolEntry {
  name: string;
  config: Record<string, unknown>;
  handler: ToolHandler;
}

export class MockMcpServer {
  readonly tools = new Map<string, RegisteredToolEntry>();

  registerTool(name: string, config: unknown, handler: ToolHandler): void {
    this.tools.set(name, {
      name,
      config: config as Record<string, unknown>,
      handler,
    });
  }

  getHandler(name: string): ToolHandler {
    const entry = this.tools.get(name);
    if (!entry) throw new Error(`Tool "${name}" not registered`);
    return entry.handler;
  }

  get toolNames(): string[] {
    return [...this.tools.keys()];
  }
}
