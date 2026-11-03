# Verify a change

Run the same package checks as the [Web workflow](../../.github/workflows/web.yml):

```sh
npm ci
npm run typecheck
CI=true npm test -- --runInBand --passWithNoTests
CI=true npm run build
```

The [browser workflow](../../.github/workflows/browser.yml) runs the built site through Nginx with the real diagnostic client and seeded TimescaleDB. It also checks the CRA proxy and uploads screenshots from `browser-evidence/`.
