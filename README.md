# linux-diagnostic-interface

React console for operators inspecting logs and network packets collected by the [Linux Diagnostic Client](https://github.com/atakang7/linux-diagnostic-client).

```text
+------------------------+          +-------------------------+             +-------+
| linux-diagnostic-agent | --TCP--> | linux-diagnostic-client | --REST/WS--> | src   |
+------------------------+          +-------------------------+             +-------+
```

## Quick start

Node 22 and a running diagnostic client are required. See [local setup](docs/how-to/run-locally.md).

```sh
npm ci
npm start
```

## Layout

| Path | What it is |
| --- | --- |
| [src/](src/README.md) | React routes, API transport, and live streams |
| [scripts/](scripts/README.md) | Browser and development proxy checks |

## Docs

- [Documentation index](docs/README.md)
- [Verify changes](docs/how-to/verify.md)
- [Deploy](docs/how-to/deploy.md)
- [Configuration](docs/reference/configuration.md)
- [HTTP and WebSocket protocol](docs/reference/protocol.md)
- [Architecture](docs/explanation/architecture.md)

## Limits

- The backend and Linux collector are separate projects.
- The diagnostic client has no built-in HTTP authentication or TLS.
- Browser checks do not test privileged Linux packet capture.
