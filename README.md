# Linux Diagnostic Interface

React console for [Linux Diagnostic Client](https://github.com/atakang7/linux-diagnostic-client) logs and packets over HTTP and WebSocket.

```text
+-----------+  calls  +--------+  HTTP/WS  +-------------------+  SQL   +-------------+
| Dashboard | ------> | api.ts | --------> | diagnostic-client | -----> | TimescaleDB |
+-----------+         +--------+           +-------------------+        +-------------+
```

## Run

Start the diagnostic client at `127.0.0.1:8080`, then run:

```sh
nvm use
npm ci
npm start
```

Open `http://localhost:3000`. For static hosting, run `CI=true npm run build`, serve `build/`, and proxy `/api`, `/readyz`, and WebSocket `/ws` to the client.

## Config

Copy `.env.example` to `.env` to change defaults.

| var | default | what |
| --- | --- | --- |
| `DIAGNOSTIC_BACKEND_URL` | `http://127.0.0.1:8080` | Local development proxy target |
| `REACT_APP_API_BASE_URL` | Empty (same origin) | Browser HTTP and WebSocket origin |
| `REACT_APP_API_TIMEOUT_MS` | `10000` | HTTP timeout, milliseconds |

## CI

`.github/workflows/web.yml` runs typecheck, tests, and build; `browser.yml` tests the UI with TimescaleDB and the diagnostic client.

```text
+-------------+  runs   +----------------+  HTTP/WS  +-------+  proxy  +-------------------+
| browser.yml | ------> | browser-e2e.cjs| --------> | nginx | ------> | diagnostic-client |
+-------------+         +----------------+           +-------+         +-------------------+
```

Verify locally:

```sh
npm run typecheck
CI=true npm test -- --runInBand
CI=true npm run build
```

## Limits

- The diagnostic client has no HTTP authentication or TLS; use a protected network or an authenticated TLS proxy.
- The browser retains at most 1,000 live log entries and 200 network packets.
- The [Linux Diagnostic Agent](https://github.com/atakang7/linux-diagnostic-agent) is required for new telemetry.
- `REACT_APP_*` values are public in the browser build; do not store credentials in them.
