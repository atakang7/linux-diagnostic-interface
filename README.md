# Linux Diagnostic Interface

Browser console for the [Linux Diagnostic Client](https://github.com/atakang7/linux-diagnostic-client). It displays stored logs and network packets over HTTP, then receives new events over WebSocket. The [Linux Diagnostic Agent](https://github.com/atakang7/linux-diagnostic-agent) feeds the client.

## Quick start

Use Node.js 22.16.0 and start the diagnostic client on `127.0.0.1:8080`. The agent is only needed to collect new telemetry.

```sh
nvm use
npm ci
npm start
```

Open `http://localhost:3000`. The development server proxies `/api`, `/readyz` and `/ws` to the client.

## Configuration

The defaults work for a local client. For another address or timeout, copy `.env.example` to `.env` before starting the development server.

| Variable | Default | Use |
| --- | --- | --- |
| `DIAGNOSTIC_BACKEND_URL` | `http://127.0.0.1:8080` | Development proxy target |
| `REACT_APP_API_BASE_URL` | Empty (same origin) | HTTP and WebSocket origin |
| `REACT_APP_API_TIMEOUT_MS` | `10000` | HTTP request timeout in milliseconds |

`REACT_APP_*` values are included in the browser build. Do not put credentials in them. Keep `REACT_APP_API_BASE_URL` empty when using the same-origin proxy.

## Use

File explorer lists paths from `GET /api/files` and opens a selected file in Logs. Logs uses `GET /api/logs`, `POST /api/logs/search` and a `view_file` WebSocket subscription. Network shows `GET /api/network/metrics` and live packet events. API explorer sends the supported requests; WebSocket inspector displays received frames.

## Build and deploy

```sh
npm ci
CI=true npm run build
```

Serve `build/` as static files. Route `/api/*` and `/readyz` to the diagnostic client, and proxy `/ws` with HTTP/1.1 WebSocket upgrade headers. Keep all three paths on the browser's origin.

## Verify

```sh
npm run typecheck
CI=true npm test -- --runInBand
CI=true npm run build
```

GitHub Actions runs these checks and a browser test against the diagnostic client with TimescaleDB. Screenshots and test results are attached to the browser workflow run.

## Limitations

The diagnostic client does not provide HTTP authentication or TLS. Use a private network or put an authenticated TLS proxy in front of the stack before allowing remote access. The UI cannot capture Linux telemetry by itself. Live log history is capped at 1,000 messages in the browser; incoming network packets are capped at 200.
