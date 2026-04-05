export interface RecordedCall {
  method: "get" | "post" | "put" | "del";
  path: string;
  body?: unknown;
}

export class MockKaneoClient {
  readonly workspaceId: string;
  readonly calls: RecordedCall[] = [];
  private nextResponse: unknown = {};

  constructor(workspaceId = "ws-default") {
    this.workspaceId = workspaceId;
  }

  willReturn(data: unknown): this {
    this.nextResponse = data;
    return this;
  }

  async get<T>(path: string): Promise<T> {
    this.calls.push({ method: "get", path });
    return this.nextResponse as T;
  }

  async post<T>(path: string, body: unknown): Promise<T> {
    this.calls.push({ method: "post", path, body });
    return this.nextResponse as T;
  }

  async put<T>(path: string, body: unknown): Promise<T> {
    this.calls.push({ method: "put", path, body });
    return this.nextResponse as T;
  }

  async del<T>(path: string): Promise<T> {
    this.calls.push({ method: "del", path });
    return this.nextResponse as T;
  }

  get lastCall(): RecordedCall | undefined {
    return this.calls.at(-1);
  }

  reset(): void {
    this.calls.length = 0;
  }
}
