# Linux Diagnostic Interface

Web console for the [Linux Diagnostic Client](https://github.com/atakang7/linux-diagnostic-client). Reads stored logs and network packets over REST, with live events over WebSocket. The separate [Linux Diagnostic Agent](https://github.com/atakang7/linux-diagnostic-agent) supplies telemetry to the client.

## Local setup

The diagnostic client must be running on `127.0.0.1:8080`. The agent is optional for browsing historical data, but is needed to produce new telemetry.

```bash
npm ci
npm start                 # http://localhost:3000
```

CRA proxies `/api`, `/readyz`, and `/ws` to the diagnostic client during development, so browser requests and WebSocket handshakes are same-origin.

## Screens

- **File explorer:** browse discovered paths from `GET /api/files`; open a file in Logs.
- **Logs:** historical records, full-text search through `POST /api/logs/search`, and live `view_file` WebSocket subscriptions.
- **Network:** `GET /api/network/metrics` statistics and streamed packets.
- **API explorer:** run the implemented HTTP operations without inventing new endpoints.
- **WebSocket inspector:** connect, subscribe to a log file, and examine frames.

## Verification

```bash
npm run typecheck
CI=true npm run build
CI=true npm test -- --runInBand --passWithNoTests
```

GitHub Actions also runs browser interaction tests with mocked API responses and captures screenshots; check the workflow artifacts. These prove UI behavior and its request contracts, not privileged Linux packet capture.

## Deployment boundary

For production static hosting, route `/api/*`, `/readyz`, and WebSocket `/ws` through the **same origin** to the diagnostic client, preserving WebSocket upgrade headers. The client has no built-in HTTP authentication or TLS; keep the stack on a protected private network or add a trusted authentication/TLS layer before exposing it. Browser code must not embed server credentials.

The UI displays backend errors instead of silently claiming a service is connected.
