# Linux Diagnostic Interface

A React dashboard for [linux-diagnostic-agent](https://github.com/atakang7/linux-diagnostic-agent) — the open-source Linux log and network metric scraper. This is the web UI that visualises the telemetry the agent collects, over a REST + WebSocket API.

> **Backend required.** This interface talks to the `linux-diagnostic-agent` HTTP/WS server (default `http://localhost:8080`). Run the agent first.

## Features

- **File Explorer** — browse the remote filesystem exposed by the agent and tail files in place.
- **Live Log Viewer** — streams log entries over a WebSocket connection, with search across files and time-range filtering. Keeps the last 1000 entries in memory.
- **Network Monitor** — plots network packet metrics (by protocol, time window) using Recharts.
- **WebSocket Tester** — send raw frames to the agent's `/ws` endpoint for debugging.
- **API Playground** — point-and-click interface for the agent's REST endpoints (`/api/files`, `/api/logs`, `/api/logs/search`, `/api/network/metrics`).

## Tech

- React 18 + TypeScript
- Mantine 7 (components) + Tailwind CSS (layout)
- TanStack Query (server state), Axios (REST), native WebSocket (streaming)
- Recharts (charts), React Router (navigation)

## Getting started

```bash
# 1. Start the backend agent first (see linux-diagnostic-agent repo)
# 2. Install and run this UI
npm install
npm start          # dev server on http://localhost:3000
```

By default the UI expects the agent at `http://localhost:8080` and `ws://localhost:8080/ws`. Override the base URL in `src/services/api.ts` if your agent runs elsewhere.

## Configuration

| Setting | Location | Default |
|---|---|---|
| Agent REST base URL | `src/services/api.ts` | `http://localhost:8080` |
| Agent WebSocket URL | `src/services/api.ts`, `src/hooks/useLogStream.ts` | `ws://localhost:8080/ws` |

## Screenshots

![Dashboard](https://github.com/user-attachments/assets/38af3251-cdd4-44ed-80e6-3ee991c3bc77)
![Network Monitor](https://github.com/user-attachments/assets/bb48b999-392c-47c6-9d09-e0c852cb583f)
![Log Viewer](https://github.com/user-attachments/assets/eefa4e58-17f2-4a00-5b9d-d3784afe9e85)

## License

MIT
