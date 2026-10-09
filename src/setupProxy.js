const { createProxyMiddleware } = require('http-proxy-middleware');

// The backend validates that the WebSocket Origin matches the Host.
// Preserve the browser-facing Host rather than rewriting it to :8080.
module.exports = function setupProxy(app) {
  app.use(
    ['/api', '/readyz', '/ws'],
    createProxyMiddleware({
      target: 'http://127.0.0.1:8080',
      changeOrigin: false,
      ws: true,
      logLevel: 'warn'
    })
  );
};
