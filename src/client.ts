export class KaneoClient {
  private baseUrl: string;
  private token: string;
  readonly workspaceId: string;

  constructor() {
    const url = process.env.KANEO_URL;
    const token = process.env.KANEO_TOKEN;
    const workspaceId = process.env.KANEO_WORKSPACE_ID;

    if (!url) throw new Error("KANEO_URL environment variable is required");
    if (!token) throw new Error("KANEO_TOKEN environment variable is required");
    if (!workspaceId)
      throw new Error("KANEO_WORKSPACE_ID environment variable is required");

    this.baseUrl = url.replace(/\/+$/, "") + "/api";
    this.token = token;
    this.workspaceId = workspaceId;
  }

  private async request<T>(
    method: string,
    path: string,
    body?: unknown,
  ): Promise<T> {
    const url = `${this.baseUrl}${path}`;
    const headers: Record<string, string> = {
      Authorization: `Bearer ${this.token}`,
      "Content-Type": "application/json",
    };

    const res = await fetch(url, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new Error(`Kaneo API ${method} ${path} failed (${res.status}): ${text}`);
    }

    return res.json() as Promise<T>;
  }

  get<T>(path: string): Promise<T> {
    return this.request<T>("GET", path);
  }

  post<T>(path: string, body: unknown): Promise<T> {
    return this.request<T>("POST", path, body);
  }

  put<T>(path: string, body: unknown): Promise<T> {
    return this.request<T>("PUT", path, body);
  }

  del<T>(path: string): Promise<T> {
    return this.request<T>("DELETE", path);
  }
}
