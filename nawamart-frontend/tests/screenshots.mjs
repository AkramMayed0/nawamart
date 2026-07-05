import { chromium } from 'playwright';
import { spawn } from 'child_process';
import * as path from 'path';
import * as fs from 'fs';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUTPUT_DIR = path.resolve(__dirname, '..', 'screenshots');
const FRONTEND_DIR = path.resolve(__dirname, '..');

const PAGES = [
  { path: '/', name: 'landing' },
  { path: '/changelog', name: 'changelog' },
  { path: '/merchant/login', name: 'merchant-login' },
  { path: '/merchant/register', name: 'merchant-register' },
  { path: '/merchant/forgot-password', name: 'merchant-forgot-password' },
  { path: '/customer/login', name: 'customer-login' },
  { path: '/customer/register', name: 'customer-register' },
  { path: '/admin/login', name: 'admin-login' },
  { path: '/developers', name: 'developers' },
  { path: '/merchant/mfa-challenge', name: 'mfa-challenge' },
  // Will show redirect / route guard but still tests layout
  { path: '/dashboard', name: 'dashboard-redirect' },
  { path: '/admin/dashboard', name: 'admin-redirect' },
];

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function takeScreenshots(browser, baseUrl) {
  // Clean output
  if (fs.existsSync(OUTPUT_DIR)) {
    fs.rmSync(OUTPUT_DIR, { recursive: true });
  }
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  const contextLight = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 1,
    locale: 'ar',
  });

  const contextDark = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 1,
    locale: 'ar',
  });

  // Screenshot light mode
  console.log('=== LIGHT MODE ===');
  for (const page of PAGES) {
    const p = await contextLight.newPage();
    try {
      await p.goto(`${baseUrl}${page.path}`, { timeout: 15000, waitUntil: 'networkidle' }).catch(() => {});
      await sleep(1500);
      const filePath = path.join(OUTPUT_DIR, `light-${page.name}.png`);
      await p.screenshot({ path: filePath, fullPage: true });
      console.log(`  ✓ light-${page.name}.png`);
    } catch (e) {
      console.log(`  ✗ light-${page.name}.png (error: ${e.message.slice(0, 60)})`);
    }
    await p.close();
  }

  // Screenshot dark mode
  console.log('=== DARK MODE ===');
  for (const page of PAGES) {
    const p = await contextDark.newPage();
    try {
      await p.goto(`${baseUrl}${page.path}`, { timeout: 15000, waitUntil: 'networkidle' }).catch(() => {});
      await sleep(500);
      // Apply dark mode
      await p.evaluate(() => {
        document.documentElement.classList.add('dark');
      });
      await sleep(1000);
      const filePath = path.join(OUTPUT_DIR, `dark-${page.name}.png`);
      await p.screenshot({ path: filePath, fullPage: true });
      console.log(`  ✓ dark-${page.name}.png`);
    } catch (e) {
      console.log(`  ✗ dark-${page.name}.png (error: ${e.message.slice(0, 60)})`);
    }
    await p.close();
  }

  await contextLight.close();
  await contextDark.close();
}

async function main() {
  // Start Vite dev server
  console.log('Starting Vite dev server...');
  const server = spawn('npx.cmd', ['vite', '--port', '5199'], {
    cwd: FRONTEND_DIR,
    shell: true,
    stdio: ['ignore', 'pipe', 'pipe'],
  });

  const baseUrl = 'http://localhost:5199';

  // Wait for server to be ready
  let started = false;
  for (let i = 0; i < 30; i++) {
    await sleep(1000);
    try {
      const resp = await fetch(baseUrl);
      if (resp.ok) { started = true; break; }
    } catch {}
  }

  if (!started) {
    console.error('Failed to start Vite dev server');
    server.kill();
    process.exit(1);
  }

  console.log(`Dev server ready at ${baseUrl}`);

  // Launch Playwright
  const browser = await chromium.launch({ headless: true });

  try {
    await takeScreenshots(browser, baseUrl);
    console.log(`\nAll screenshots saved to ${OUTPUT_DIR}`);
  } catch (e) {
    console.error('Screenshot error:', e);
  } finally {
    await browser.close();
    server.kill();
  }
}

main();
