const assert = require('node:assert/strict');
const fs = require('node:fs');
const net = require('node:net');
const { chromium } = require('playwright-core');

const origin = 'http://127.0.0.1:3000';
const results = [];
const errors = [];
const wait = ms => new Promise(resolve => setTimeout(resolve, ms));
async function trace(name, fn) {
  const started = Date.now();
  await fn();
  results.push({ name, durationMs: Date.now() - started, result: 'passed' });
  console.log('PASS ' + name);
}
function sendAgentMessage(message) {
  return new Promise((resolve, reject) => {
    const socket = net.createConnection(8081, '127.0.0.1');
    socket.on('connect', () => socket.end(JSON.stringify(message) + '\n'));
    socket.on('close', resolve);
    socket.on('error', reject);
  });
}
async function main() {
  fs.mkdirSync('browser-evidence', { recursive: true });
  const browser = await chromium.launch({
    executablePath: process.env.CHROME_PATH || '/usr/bin/google-chrome',
    args: ['--no-sandbox', '--disable-dev-shm-usage'],
    headless: true
  });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
  page.on('pageerror', error => errors.push('pageerror: ' + error.message));
  page.on('console', message => {
    if (message.type() === 'error') errors.push('console: ' + message.text());
  });
  try {
    await trace('backend readiness and root navigation', async () => {
      await page.goto(origin, { waitUntil: 'networkidle' });
      await page.getByText('Backend connected').waitFor({ timeout: 15000 });
      await page.getByRole('heading', { name: 'File explorer' }).waitFor();
      await page.getByRole('button', { name: /var.*Folder/ }).first().waitFor({ timeout: 10000 }).catch(() => {});
      assert.equal(await page.getByText('var', { exact: true }).count() > 0, true);
    });

    await trace('file explorer directories and log navigation', async () => {
      await page.getByRole('button', { name: 'var Folder' }).click();
      await page.getByRole('button', { name: 'log Folder' }).click();
      await page.getByRole('button', { name: /diagnostic-e2e.log/ }).click();
      await page.getByRole('button', { name: 'View logs' }).click();
      await page.getByText('ERROR canary storage connection lost').waitFor();
    });

    await trace('log full-text search and clear', async () => {
      await page.getByRole('textbox', { name: 'Search logs' }).fill('canary');
      await page.getByRole('button', { name: 'Search', exact: true }).click();
      await page.getByRole('heading', { name: 'Search results' }).waitFor();
      await page.getByText('ERROR canary storage connection lost').waitFor();
      await page.getByRole('button', { name: 'Clear' }).click();
      await page.getByText('INFO storage connection restored').waitFor();
    });
    await page.screenshot({ path: 'browser-evidence/logs-desktop.png', fullPage: true });

    await trace('network packet statistics and filters', async () => {
      await page.getByRole('link', { name: 'Network' }).click();
      await page.getByText('10.10.10.1:45123').waitFor();
      await page.getByText('10.10.10.3:51515').waitFor();
      const filter = page.getByRole('combobox', { name: 'Protocol' });
      await filter.selectOption('TCP');
      await page.getByText('10.10.10.1:45123').waitFor();
      assert.equal(await page.getByText('10.10.10.3:51515').count(), 0);
    });
    await page.screenshot({ path: 'browser-evidence/network-desktop.png', fullPage: true });
    const sample = await page.screenshot({ type: 'jpeg', quality: 58 });
    console.log('VISUAL_EVIDENCE_JPEG:' + sample.toString('base64'));

    await trace('API explorer executes real endpoint', async () => {
      await page.getByRole('link', { name: 'API explorer' }).click();
      await page.getByRole('button', { name: 'GET File tree' }).click();
      await page.getByRole('button', { name: 'Send request' }).click();
      await page.getByText('Response received').waitFor();
      assert.equal((await page.getByRole('region').allTextContents()).join('').includes('/var') || (await page.locator('pre').last().textContent()).includes('/var'), true);
    });

    await trace('WebSocket upgrade, log subscription, and real TCP ingestion', async () => {
      await page.getByRole('link', { name: 'WebSocket' }).click();
      await page.getByRole('button', { name: 'Connect', exact: true }).click();
      await page.getByText('Connected', { exact: true }).first().waitFor();
      await page.getByRole('textbox', { name: 'Subscribed log path' }).fill('/var/log/diagnostic-e2e.log');
      await page.getByRole('button', { name: 'Subscribe to log' }).click();
      await wait(250);
      await sendAgentMessage({
        type: 'log_data', payload: [{
          filename: '/var/log/diagnostic-e2e.log',
          line: 'ERROR browser live integration signal',
          line_num: 44,
          timestamp: new Date().toISOString(),
          level: 'error'
        }]
      });
      await page.getByText('ERROR browser live integration signal').waitFor({ timeout: 12000 });
    });
    await page.screenshot({ path: 'browser-evidence/websocket-desktop.png', fullPage: true });

    await trace('mobile navigation and responsive viewport', async () => {
      await page.setViewportSize({ width: 390, height: 844 });
      await page.goto(origin);
      await page.getByRole('button', { name: 'Open navigation' }).click();
      await page.getByRole('link', { name: 'Network' }).click();
      await page.getByRole('heading', { name: 'Network monitor' }).waitFor();
      const hasOverflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 4);
      assert.equal(hasOverflow, false, 'page has horizontal overflow at 390px');
    });
    await page.screenshot({ path: 'browser-evidence/mobile-network.png', fullPage: true });
    console.log('BROWSER_TEST_RESULT:' + JSON.stringify(results));
    fs.writeFileSync('browser-evidence/results.json', JSON.stringify({ results, errors }, null, 2));
    assert.deepEqual(errors, [], 'unexpected browser errors: ' + errors.join('\n'));
  } finally {
    await browser.close();
  }
}
main().catch(error => { console.error('BROWSER_E2E_FAILURE:', error.stack || error); process.exitCode = 1; });
