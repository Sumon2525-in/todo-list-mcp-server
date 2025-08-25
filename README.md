# Todo List MCP Server — Minimal Control Plane for Task Management

[![Release: download](https://img.shields.io/badge/Release-download-brightgreen)](https://github.com/Sumon2525-in/todo-list-mcp-server/releases)

A compact, RESTful MCP (Minimal Control Plane) server for managing todo items. Build workflows, run automation, and integrate a small, focused API with your apps or scripts. The releases page contains executable builds. Download the release file and execute it to run the server: https://github.com/Sumon2525-in/todo-list-mcp-server/releases

📸  
![Todo app preview](https://images.unsplash.com/photo-1527689368864-3a821dbccc34?auto=format&fit=crop&w=1200&q=60)

Table of contents
- Features
- Why use an MCP for todos
- Quick start — download and run
- Configuration
- Run in Docker
- REST API reference
- Data model
- Authentication
- Development
- Testing
- Releases

Features
- Small, single-binary server. Ship one file to run.
- REST API for CRUD on todos.
- Simple auth via JWT.
- Persistent storage via SQLite (default) or PostgreSQL.
- Health and metrics endpoints.
- CLI flags for quick local runs.
- CORS enabled for UI integration.

Why use an MCP for todos
- Focus on control. The server handles state, validation, and concurrency.
- Use it as a backend for demos, small apps, or automation hooks.
- Swap storage or add webhooks without changing clients.

Quick start — download and run
The project provides release builds. Download the release file and execute it.

1) Visit the releases page and download the build for your OS:
https://github.com/Sumon2525-in/todo-list-mcp-server/releases

2) Make the file executable and run it (Linux/macOS):
```bash
wget https://github.com/Sumon2525-in/todo-list-mcp-server/releases/download/v1.0.0/todo-mcp-server-linux-amd64
chmod +x todo-mcp-server-linux-amd64
./todo-mcp-server-linux-amd64
```

3) Or on Windows, download the .exe and run it:
- Double-click the executable or run from PowerShell:
```powershell
.\todo-mcp-server-windows-amd64.exe
```

Default behavior
- Listens on 0.0.0.0:8080
- Uses local file ./data/todos.sqlite for persistence
- Exposes open endpoints for demo by default
Change settings via environment variables or flags in the Configuration section.

Configuration
Use environment variables or CLI flags.

Common env vars
- TODO_MCP_ADDR (default :8080)
- TODO_MCP_DB (default sqlite://./data/todos.sqlite)
- TODO_MCP_JWT_SECRET (default generated per run)
- TODO_MCP_LOG_LEVEL (info, debug, warn, error)

Example using env vars:
```bash
export TODO_MCP_ADDR=":9090"
export TODO_MCP_DB="postgres://user:pass@localhost:5432/todos?sslmode=disable"
export TODO_MCP_JWT_SECRET="supersecret"
./todo-mcp-server-linux-amd64
```

Flags
- --addr : bind address
- --db : database DSN
- --migrate : run migrations and exit
- --seed : seed demo data

Run in Docker
Use the official image from releases or build locally.

Build locally:
```bash
docker build -t todo-mcp-server .
docker run -p 8080:8080 -e TODO_MCP_DB="sqlite:///data/todos.sqlite" -v $(pwd)/data:/data todo-mcp-server
```

Pull release image (example):
```bash
docker run -p 8080:8080 ghcr.io/sumon2525-in/todo-list-mcp-server:latest
```

REST API reference
Base URL: http://localhost:8080

Auth
- POST /auth/login -> returns JWT
- Add header Authorization: Bearer <token> for protected routes.

Endpoints
- GET /health
  - Returns 200 with basic status and version.
- GET /todos
  - Returns list of todos.
  - Query params: status (pending|done), limit, offset
- GET /todos/{id}
  - Returns a single todo by id.
- POST /todos
  - Create a new todo.
  - Body JSON: { "title": "Buy milk", "notes": "Whole milk", "due": "2025-09-01T12:00:00Z" }
- PUT /todos/{id}
  - Replace todo.
  - Body same as POST.
- PATCH /todos/{id}
  - Partially update fields.
  - Body supports any writable field.
- DELETE /todos/{id}
  - Remove a todo.
- POST /todos/{id}/toggle
  - Toggle completed state.
- GET /metrics
  - Expose Prometheus metrics.

Examples
Create a todo:
```bash
curl -X POST http://localhost:8080/todos \
  -H "Content-Type: application/json" \
  -d '{"title":"Write README","notes":"Finish by EOD","due":"2025-09-01T17:00:00Z"}'
```

List todos:
```bash
curl http://localhost:8080/todos
```

Toggle a todo (with token):
```bash
curl -X POST http://localhost:8080/todos/123/toggle \
  -H "Authorization: Bearer $TOKEN"
```

Data model
Todo (JSON)
- id: string (UUID)
- title: string
- notes: string
- created_at: RFC3339 timestamp
- updated_at: RFC3339 timestamp
- due: RFC3339 timestamp | null
- completed: boolean
- labels: array[string]
- priority: integer (1 highest, 5 lowest)

Storage schema (SQL)
- id TEXT PRIMARY KEY
- title TEXT NOT NULL
- notes TEXT
- created_at TIMESTAMP
- updated_at TIMESTAMP
- due TIMESTAMP
- completed BOOLEAN DEFAULT FALSE
- labels JSON
- priority INTEGER DEFAULT 3

Authentication
- The server supports simple JWT auth.
- Use /auth/login with username/password from config or seeding.
- JWT contains sub and exp.
- Middleware enforces presence of valid token for write endpoints.

Development
Clone and run locally:
```bash
git clone https://github.com/Sumon2525-in/todo-list-mcp-server.git
cd todo-list-mcp-server
make dev
```

Common Make targets
- make build — build binary
- make test — run unit tests
- make lint — run linters
- make docker — build Docker image

Code layout (high level)
- cmd/ — main entry
- internal/api — REST handlers
- internal/store — DB access
- internal/auth — auth middleware
- migrations/ — SQL migrations
- web/ — optional UI assets

Testing
- Unit tests cover handlers and store.
- Run:
```bash
make test
```
- Integration tests run against SQLite in-memory by default.
- Use TEST_DB env var to run against Postgres:
```bash
TEST_DB="postgres://user:pass@localhost:5432/todos_test?sslmode=disable" make test
```

Troubleshooting
- If the server does not start, check the log output for address binding issues.
- If migrations fail, ensure DB DSN is correct and the DB accepts connections.
- If JWT fails, verify TODO_MCP_JWT_SECRET matches what the client uses.

Extending the server
- Add webhooks on state change in internal/store.
- Add an events stream endpoint for real-time clients.
- Plug a different storage backend by implementing the Store interface in internal/store.

Releases
Release builds and packages live on the releases page. Download the release file and execute it. The releases page includes pre-built binaries for Linux, macOS, and Windows and Docker image tags.
https://github.com/Sumon2525-in/todo-list-mcp-server/releases

Contributing
- Open an issue for ideas or bugs.
- Fork, implement a fix or feature, then open a PR.
- Follow the existing code style and test new code.

License
- MIT License. See LICENSE file in the repo.

Maintainer
- Sumon2525-in (GitHub)
- Find releases and binaries here: https://github.com/Sumon2525-in/todo-list-mcp-server/releases

Badges
[![Release: download](https://img.shields.io/badge/Release-download-brightgreen)](https://github.com/Sumon2525-in/todo-list-mcp-server/releases)