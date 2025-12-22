# Khien AI Console

A TypeScript-based CLI client for MCP (Model Context Protocol) servers. This tool provides an ergonomic terminal interface for interacting with AI agents through the MCP protocol.

## Features

- **Interactive Chat Mode**: Real-time conversation with AI agents
- **Single Request Mode**: Send one-off questions and get responses
- **File Attachment Support**: Provide context through files
- **Session Management**: In-memory conversation history
- **Clean Terminal UI**: Colored output and progress indicators

## Configuration

Create a `.env` file in your project directory to configure default settings:

```bash
# Copy the example environment file
cp .env.example .env
```

### Environment Variables

- `MCP_SERVER_URL`: Default MCP server URL (can be overridden with `-s` flag)
- `MCP_TIMEOUT`: Request timeout in milliseconds (default: 30000)
- `MCP_HEADERS`: Custom headers for MCP requests (JSON format)
- `DEFAULT_FILES`: Default files to include (comma-separated)

Example `.env` file:

```env
# MCP Server Configuration
MCP_SERVER_URL=http://10.254.254.254:8080/
MCP_TIMEOUT=30000

# Optional custom headers
# MCP_HEADERS={"Authorization":"Bearer your-token"}

# Optional default files
# DEFAULT_FILES=README.md,package.json
```

## Installation

```bash
npm install -g khien-ai-console
```

Or for development:

```bash
git clone <repository>
cd khien-ai-console
npm install
# Configure your .env file
cp .env.example .env
npm run build
npm link
```

## Usage

### Interactive Chat Mode

```bash
# Start chat with default server (http://localhost:3000)
khien-ai chat

# Start chat with custom server
khien-ai chat --server http://localhost:8080

# Start chat with attached files
khien-ai chat --file src/app.ts --file README.md
```

### Single Request Mode

```bash
# Send a single question
khien-ai ask "What does this code do?"

# Send question with file context
khien-ai ask "Refactor this function" --file src/utils.ts
```

### Commands

- `chat`: Start interactive chat session
- `ask <goal>`: Send a single request and exit
- `clear`: Clear session history (in chat mode)

### Chat Mode Commands

While in interactive chat mode:
- `exit`: Quit the application
- `clear`: Clear conversation history
- `files`: Show currently attached files

## MCP Server Requirements

The CLI expects an MCP server with the following endpoints:

### `POST /mcp/process`

Request body:
```json
{
  "goal": "string",
  "resources": [
    {
      "uri": "file://path/to/file",
      "name": "filename",
      "mimeType": "text/plain",
      "content": "file content"
    }
  ],
  "history": [
    {
      "role": "user|assistant",
      "content": "message content",
      "timestamp": "2024-01-01T00:00:00.000Z"
    }
  ],
  "sessionId": "session_id"
}
```

Response body:
```json
{
  "content": "response content",
  "sessionId": "session_id",
  "status": "success|error",
  "error": "error message if any"
}
```

### `GET /health`

Returns status 200 if server is healthy.

## Development

```bash
# Install dependencies
npm install

# Run in development mode
npm run dev -- chat --file README.md

# Build for production
npm run build

# Run built version
npm start -- ask "What is this project about?"
```

## Architecture

```
src/
├── cli.ts              # CLI entry point and command parsing
├── mcp/
│   ├── client.ts       # MCP client logic
│   ├── types.ts        # MCP type definitions
│   └── transport.ts    # HTTP transport layer
├── session/
│   └── manager.ts      # Session state management
├── utils/
│   └── files.ts        # File handling utilities
└── index.ts            # Main module export
```

## License

MIT