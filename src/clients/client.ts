import type { KaneoClientOptions } from "../types/index.js";

export class KaneoClient {
  private baseUrl: string;
  private token: string;
  readonly workspaceId: string;

  private constructor(opts: KaneoClientOptions) {
    this.baseUrl = opts.baseUrl.replace(/\/+$/, "") + "/api";
    this.token = opts.token;
    this.workspaceId = opts.workspaceId;
  }

  /**
   * Create a client from explicit options (used by HTTP transport,
   * where each request carries its own Kaneo token).
   */
  static create(opts: KaneoClientOptions): KaneoClient {
    return new KaneoClient(opts);
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
