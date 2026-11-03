# Diagnostic client protocol

The browser uses these HTTP operations through `src/services/api.ts`.

| Method | Path | Parameters or body | Response used |
| --- | --- | --- | --- |
| GET | `/api/files` | Query: `path`, `depth` | Array of file entries |
| GET | `/api/logs` | Query: `file`, optional `before` | Array of log entries |
| POST | `/api/logs/search` | JSON: `query`, `files` | Array of log entries |
| GET | `/api/network/metrics` | None | Counts, protocol statistics, packet array |
| GET | `/readyz` | None | Used for readiness status |

## WebSocket

`/ws` is the WebSocket endpoint. The log viewer sends:

```json
{"type":"view_file","payload":"/var/log/syslog"}
```

| Incoming `type` | Payload consumed by the UI |
| --- | --- |
| `log` | Object with `filename`, `line`, `line_num`, `timestamp`, `level` |
| `network` | Array of packets with addresses, ports, protocol, length, and timestamp |

`src/hooks/useLogStream.ts` retains up to 1000 live log entries. The network screen retains the latest 200 packets after new batches.
