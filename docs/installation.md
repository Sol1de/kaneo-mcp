# Installation

## Prerequisites

- **Node.js** >= 18
- A running **Kaneo** instance with API access
- A **Kaneo API key** (Bearer token)

## Setup

```bash
git clone https://github.com/Sol1de/kaneo-mcp.git
cd kaneo-mcp
npm install
```

## Environment Variables

Copy the example file and fill in your values:

```bash
cp .env.example .env
```

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `KANEO_URL` | Yes | - | Base URL of your Kaneo instance (e.g. `https://kaneo.example.com`) |
| `KANEO_WORKSPACE_ID` | Yes | - | Default workspace ID for tools that accept an optional `workspaceId` |
| `MCP_PORT` | No | `3000` | Port the MCP server listens on |

### Example `.env`

```env
KANEO_URL=https://kaneo.example.com
KANEO_WORKSPACE_ID=abc123
MCP_PORT=3000
```

## Running

### Development

```bash
npm run dev
```

Uses `tsx` with hot-reload and loads `.env` automatically.

### Production

```bash
npm run build     # Compiles TypeScript to dist/
npm run start     # Runs dist/server.js
```

### Bundled builds

```bash
npm run build:bundle   # Single CJS file → build/kaneo-mcp.cjs
npm run build:binary   # Node SEA binary → build/kaneo-mcp-{os}-{arch}
```

## Verifying the server

```bash
KANEO_URL=http://localhost KANEO_WORKSPACE_ID=test node dist/server.js &
sleep 1 && kill $!
# Expected output: Kaneo MCP Server listening on port 3000
```

## Connecting an MCP client

The server exposes a single HTTP Streamable endpoint:

```
POST http://localhost:3000/mcp
```

Every request must include:

```
Authorization: Bearer <your-kaneo-api-key>
```

Or pass the token as a query parameter:

```
POST http://localhost:3000/mcp?token=<your-kaneo-api-key>
```

The first request should be an MCP `initialize` request. The server returns an `mcp-session-id` header that must be included in all subsequent requests.

### Claude Desktop configuration

```json
{
  "mcpServers": {
    "kaneo": {
      "url": "http://localhost:3000/mcp",
      "headers": {
        "Authorization": "Bearer <your-kaneo-api-key>"
      }
    }
  }
}
```
