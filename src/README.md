Part of [linux-diagnostic-interface](../README.md).

# Web console

The React app shows file inventory, logs, network packets, and diagnostic client connections.

## Run

```sh
npm ci
npm start
```

The development server listens on port 3000. Start the [diagnostic client](https://github.com/atakang7/linux-diagnostic-client) first.

## Test

```sh
npm run typecheck
CI=true npm test -- --runInBand --passWithNoTests
CI=true npm run build
```

## Config

| Variable | Default | What |
| --- | --- | --- |
| `DIAGNOSTIC_BACKEND_URL` | `http://127.0.0.1:8080` | Development proxy target |
| `REACT_APP_API_BASE_URL` | Same origin | REST and WebSocket base URL |
| `REACT_APP_API_TIMEOUT_MS` | `10000` | HTTP request timeout in milliseconds |

See [configuration](../docs/reference/configuration.md) for scope and deployment behavior.

## Interfaces

| Route | Screen | Data |
| --- | --- | --- |
| `/` | File explorer | Directory entries |
| `/logs` | Log viewer | History, search, live log events |
| `/network` | Network monitor | Statistics and packet events |
| `/api` | API explorer | Supported HTTP requests |
| `/ws-test` | WebSocket inspector | Subscriptions and frames |

HTTP paths and WebSocket messages are in the [protocol reference](../docs/reference/protocol.md).
