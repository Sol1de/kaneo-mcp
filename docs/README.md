# Kaneo MCP Server Documentation

MCP (Model Context Protocol) server that exposes 22 tools for interacting with the [Kaneo](https://kaneo.app) Kanban project management API. Built with HTTP Streamable transport for remote, multi-user usage.

## Table of Contents

| Document | Description |
|----------|-------------|
| [Installation](installation.md) | Prerequisites, environment variables, running the server |
| [Architecture](architecture.md) | Codebase structure, layers, session management |
| [Tools Reference](tools.md) | All 22 MCP tools with parameters and examples |
| [Contributing](contributing.md) | How to add tools, conventions, build & test |

## Quick Start

```bash
git clone git@github.com:Sol1de/kaneo-mcp.git && cd kaneo-mcp
npm install
cp .env.example .env   # edit with your own variables
npm run dev
```

The server starts at `http://localhost:3000/mcp`.

## Tech Stack

- **Runtime**: Node.js >= 18
- **Language**: TypeScript
- **Framework**: [Hono](https://hono.dev) (HTTP server)
- **MCP SDK**: `@modelcontextprotocol/server` v2 + `@modelcontextprotocol/node`
- **Validation**: Zod
- **Auth**: Bearer token (Kaneo API key)
