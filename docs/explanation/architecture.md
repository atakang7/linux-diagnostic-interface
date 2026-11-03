# Architecture

The [diagnostic agent](https://github.com/atakang7/linux-diagnostic-agent) supplies Linux telemetry to the separate [diagnostic client](https://github.com/atakang7/linux-diagnostic-client). The client owns storage and exposes HTTP and WebSocket interfaces. This repository contains the browser console.

`src/services/api.ts` is the HTTP and WebSocket transport for the screens under `src/components/`. `src/hooks/useLogStream.ts` subscribes to log updates and reconnects after a closed socket.

CRA serves the app in development. `src/setupProxy.js` forwards requests to the client and preserves the browser Host for the backend's WebSocket Origin check. Static hosting needs equivalent proxy routes.

The UI can inspect stored logs while the agent is offline. New log and packet events depend on agent ingestion. The [browser tests](../../scripts/README.md) seed TimescaleDB and send a sample agent message; they do not exercise privileged packet capture.
