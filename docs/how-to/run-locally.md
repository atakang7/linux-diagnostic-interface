# Run the console locally

1. Start the [Linux Diagnostic Client](https://github.com/atakang7/linux-diagnostic-client) with its HTTP listener at `127.0.0.1:8080`.
2. In this repository, start the web server:

   ```sh
   npm ci
   npm start
   ```

3. Open `http://localhost:3000`.

For a different backend address, copy `.env.example` to `.env`, change `DIAGNOSTIC_BACKEND_URL`, and restart the dev server.

The [Linux Diagnostic Agent](https://github.com/atakang7/linux-diagnostic-agent) is needed to collect new telemetry. The client can return existing records without it.
