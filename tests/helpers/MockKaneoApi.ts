import { createServer, type Server, type IncomingMessage, type ServerResponse } from "node:http";

export interface RecordedRequest {
  method: string;
  url: string;
  body: string;
  headers: Record<string, string | string[] | undefined>;
}

export class MockKaneoApi {
  readonly requests: RecordedRequest[] = [];
  private server!: Server;
  port = 0;

  async start(): Promise<void> {
    this.server = createServer(async (req: IncomingMessage, res: ServerResponse) => {
      const chunks: Buffer[] = [];
      for await (const chunk of req) chunks.push(chunk as Buffer);

      this.requests.push({
        method: req.method!,
        url: req.url!,
        body: Buffer.concat(chunks).toString(),
        headers: req.headers as Record<string, string | string[] | undefined>,
      });

      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ ok: true }));
    });

    await new Promise<void>((resolve) => {
      this.server.listen(0, () => {
        this.port = (this.server.address() as { port: number }).port;
        resolve();
      });
    });
  }

  async stop(): Promise<void> {
    await new Promise<void>((resolve) => this.server.close(() => resolve()));
  }

  get lastRequest(): RecordedRequest | undefined {
    return this.requests.at(-1);
  }

  reset(): void {
    this.requests.length = 0;
  }
}
