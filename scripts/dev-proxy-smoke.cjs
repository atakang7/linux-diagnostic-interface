const assert = require('node:assert/strict');
const { chromium } = require('playwright-core');

async function main() {
  const browser = await chromium.launch({
    executablePath: process.env.CHROME_PATH || '/usr/bin/google-chrome',
    args: ['--no-sandbox', '--disable-dev-shm-usage']
  });
  try {
    const page = await browser.newPage();
    await page.goto('http://127.0.0.1:3001', { waitUntil: 'domcontentloaded' });
    await page.getByRole('heading', { name: 'File explorer' }).waitFor({ timeout: 12000 });
    const result = await page.evaluate(async () => {
      const readiness = await fetch('/readyz');
      const body = await readiness.text();
      const socketOpened = await new Promise(resolve => {
        const ws = new WebSocket('ws://' + location.host + '/ws');
        const timeout = setTimeout(() => { ws.close(); resolve(false); }, 6000);
        ws.onopen = () => { clearTimeout(timeout); ws.close(); resolve(true); };
        ws.onerror = () => { clearTimeout(timeout); resolve(false); };
      });
      return { status: readiness.status, body, socketOpened };
    });
    assert.equal(result.status, 200);
    assert.match(result.body, /ready/);
    assert.equal(result.socketOpened, true, 'development WebSocket proxy rejected by same-origin check');
    console.log('PASS CRA development proxy: /readyz and WebSocket handshake');
  } finally {
    await browser.close();
  }
}
main().catch(error => { console.error(error.stack || error); process.exitCode = 1; });
