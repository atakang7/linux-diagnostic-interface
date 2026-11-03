# Deploy the console

1. Build with Node 22:

   ```sh
   npm ci
   CI=true npm run build
   ```

2. Serve `build/` from an HTTPS origin. Fall back to `index.html` for frontend routes.
3. Forward `/api/*`, `/readyz`, and `/ws` on that origin to the diagnostic client. Preserve the original Host and WebSocket upgrade headers. The [browser workflow](../../.github/workflows/browser.yml) has a working Nginx configuration.
4. Restrict access at the proxy or private network boundary. The diagnostic client does not provide HTTP authentication or TLS.

The existing checks run on push and pull request:

```text
push -> npm ci -> typecheck -> build -> test
```
