# Configuration

| Variable | Used by | Default | Meaning |
| --- | --- | --- | --- |
| `DIAGNOSTIC_BACKEND_URL` | CRA proxy in `src/setupProxy.js` | `http://127.0.0.1:8080` | Backend HTTP and WebSocket upstream |
| `REACT_APP_API_BASE_URL` | Browser bundle | Unset | Optional REST and WebSocket origin override |
| `REACT_APP_API_TIMEOUT_MS` | Browser bundle | `10000` | Positive HTTP timeout in milliseconds; invalid values use the default |

`REACT_APP_*` variables are compiled into the frontend bundle. The default browser transport uses the page origin, including in a static deployment.

| Address | Listener |
| --- | --- |
| `localhost:3000` | CRA development UI |
| `127.0.0.1:8080` | Diagnostic client HTTP and WebSocket server |
| `127.0.0.1:8081` | Diagnostic client agent ingestion listener in browser tests |
