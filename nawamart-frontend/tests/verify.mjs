import { chromium } from 'playwright';
import { spawn } from 'child_process';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const FRONTEND_DIR = path.resolve(__dirname, '..');

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

const CHECKS = [
  // Each entry: { path, name, checks: [{ selector, property, expectedBg, expectedText }] }
  {
    path: '/',
    name: 'Landing',
    checks: [
      { selector: 'nav', bgProp: 'background-color', compareBg: true },
      { selector: 'body', bgProp: 'background-color', compareBg: true },
    ],
  },
  {
    path: '/merchant/login',
    name: 'MerchantLogin',
    checks: [
      // The card - should be surface color (dark) vs white (light)
      { selector: '.rounded-3xl.shadow-xl', bgProp: 'background-color', compareBg: true },
      // The form panel gradient bg
      { selector: '.flex-1.flex.items-center', bgProp: 'background-image', compareGradient: true },
    ],
  },
  {
    path: '/customer/register',
    name: 'CustomerRegister',
    checks: [
      { selector: '.rounded-3xl.shadow-xl', bgProp: 'background-color', compareBg: true },
    ],
  },
  {
    path: '/admin/login',
    name: 'AdminLogin',
    checks: [
      { selector: '.rounded-3xl', bgProp: 'background-color', compareBg: true },
    ],
  },
  {
    path: '/changelog',
    name: 'Changelog',
    checks: [
      { selector: 'body', bgProp: 'background-color', compareBg: true },
    ],
  },
  {
    path: '/developers',
    name: 'DeveloperPortal',
    checks: [
      { selector: 'body', bgProp: 'background-color', compareBg: true },
    ],
  },
];

async function parseColor(colorStr) {
  // rgb(r,g,b) or rgba(r,g,b,a) -> return { r, g, b } or null
  const match = colorStr?.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
  if (match) return { r: parseInt(match[1]), g: parseInt(match[2]), b: parseInt(match[3]) };
  const matchA = colorStr?.match(/rgba\((\d+),\s*(\d+),\s*(\d+)/);
  if (matchA) return { r: parseInt(matchA[1]), g: parseInt(matchA[2]), b: parseInt(matchA[3]) };
  return null;
}

function isDark(color) {
  if (!color) return false;
  const luminance = 0.299 * color.r + 0.587 * color.g + 0.114 * color.b;
  return luminance < 128;
}

async function run() {
  console.log('Starting Vite dev server...');
  const server = spawn('npx.cmd', ['vite', '--port', '5200'], {
    cwd: FRONTEND_DIR,
    shell: true,
    stdio: ['ignore', 'pipe', 'pipe'],
  });

  const baseUrl = 'http://localhost:5200';
  let started = false;
  for (let i = 0; i < 30; i++) {
    await sleep(1000);
    try {
      const resp = await fetch(baseUrl);
      if (resp.ok) { started = true; break; }
    } catch {}
  }
  if (!started) {
    console.error('Server failed to start');
    server.kill();
    process.exit(1);
  }

  const browser = await chromium.launch({ headless: true });
  let allPassed = true;

  try {
    for (const pageDef of CHECKS) {
      console.log(`\n=== ${pageDef.name} (${pageDef.path}) ===`);

      // Light mode test
      const pLight = await browser.newPage({ viewport: { width: 1440, height: 900 } });
      await pLight.goto(`${baseUrl}${pageDef.path}`, { timeout: 15000 }).catch(() => {});
      await sleep(1500);

      // Dark mode test
      const pDark = await browser.newPage({ viewport: { width: 1440, height: 900 } });
      await pDark.goto(`${baseUrl}${pageDef.path}`, { timeout: 15000 }).catch(() => {});
      await sleep(500);
      await pDark.evaluate(() => document.documentElement.classList.add('dark'));
      await sleep(500);

      for (const check of pageDef.checks) {
        try {
          // Check light
          const lightEl = await pLight.$(check.selector);
          const lightBg = lightEl ? await lightEl.evaluate((el, prop) => window.getComputedStyle(el)[prop], check.bgProp) : null;

          // Check dark
          const darkEl = await pDark.$(check.selector);
          const darkBg = darkEl ? await darkEl.evaluate((el, prop) => window.getComputedStyle(el)[prop], check.bgProp) : null;

          const lColor = parseColor(lightBg);
          const dColor = parseColor(darkBg);

          const lightIsDark = isDark(lColor);
          const darkIsDark = isDark(dColor);

          const status = (lightIsDark === false && darkIsDark === true) ? '✓' : (lightIsDark === false && darkIsDark === false) ? '✗ NOT DARK' : (lightIsDark === true && darkIsDark === true) ? '⚠ ALREADY DARK' : '?';

          if (status !== '✓') allPassed = false;
          console.log(`  ${status} ${check.selector}: light=${lightIsDark ? 'DARK' : 'LIGHT'} → dark=${darkIsDark ? 'DARK' : 'LIGHT'}`);
        } catch (e) {
          console.log(`  ? ${check.selector}: error - ${e.message.slice(0, 80)}`);
        }
      }

      await pLight.close();
      await pDark.close();
    }

    const summary = allPassed ? '\n✓ ALL DARK MODE CHECKS PASSED' : '\n✗ SOME CHECKS FAILED';
    console.log(summary);
  } finally {
    await browser.close();
    server.kill();
  }
}

run();
