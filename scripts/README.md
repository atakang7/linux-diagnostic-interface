Part of [linux-diagnostic-interface](../README.md).

# Browser checks

Two Node scripts exercise the deployed console and the CRA development proxy.

## Run

```sh
npm ci
npm install --no-save --no-package-lock playwright-core@1.58.2
node scripts/browser-e2e.cjs
```

The browser check needs the diagnostic client on port 8080, agent ingestion on port 8081, and a same-origin frontend at port 3000. The [browser workflow](../.github/workflows/browser.yml) starts those services and seeds TimescaleDB.

## Test

With the backend on port 8080 and CRA on port 3001:

```sh
node scripts/dev-proxy-smoke.cjs
```

## Config

| Variable | Default | What |
| --- | --- | --- |
| `CHROME_PATH` | `/usr/bin/google-chrome` | Browser executable for both scripts |

## Interfaces

| Script | Reads | Writes |
| --- | --- | --- |
| `browser-e2e.cjs` | HTTP port 3000, TCP port 8081 | `browser-evidence/` |
| `dev-proxy-smoke.cjs` | HTTP port 3001, `/readyz`, `/ws` | Standard output |

The [verification steps](../docs/how-to/verify.md) cover the package checks.
