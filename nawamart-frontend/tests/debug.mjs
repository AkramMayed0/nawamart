import { chromium } from 'playwright';
import { spawn } from 'child_process';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const FRONTEND_DIR = path.resolve(__dirname, '..');

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function parseColor(colorStr) {
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

  try {
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    await page.goto(`${baseUrl}/`, { timeout: 15000 });
    await sleep(2000);

    // Check initial state (light mode)
    const bodyBg = await page.evaluate(() => {
      const el = document.querySelector('body');
      return {
        bgColor: getComputedStyle(el).backgroundColor,
        bgColor2: getComputedStyle(el).background,  // complete background shorthand
        hasDark: document.documentElement.classList.contains('dark'),
        htmlClasses: document.documentElement.className,
      };
    });
    console.log('LIGHT MODE (initial):', JSON.stringify(bodyBg, null, 2));

    // Now add dark class
    await page.evaluate(() => document.documentElement.classList.add('dark'));
    await sleep(1000);

    const bodyBgDark = await page.evaluate(() => {
      const el = document.querySelector('body');
      const html = document.documentElement;
      return {
        bgColor: getComputedStyle(el).backgroundColor,
        bgColor2: getComputedStyle(el).background,
        hasDark: html.classList.contains('dark'),
        cssBgColor: getComputedStyle(html).getPropertyValue('--color-bg').trim(),
        cssSurface: getComputedStyle(html).getPropertyValue('--color-surface').trim(),
      };
    });
    console.log('DARK MODE (after adding .dark):', JSON.stringify(bodyBgDark, null, 2));

    // Check nav element
    const navInfo = await page.evaluate(() => {
      const nav = document.querySelector('nav');
      const html = document.documentElement;
      return {
        navBgColor: nav ? getComputedStyle(nav).backgroundColor : 'no nav',
        navBgColor2: nav ? getComputedStyle(nav).background : 'no nav',
        htmlSurfaceDark: getComputedStyle(html).getPropertyValue('--color-surface').trim(),
        htmlCssText: getComputedStyle(html).cssText?.substring(0, 500),
        darkRuleApplies: html.classList.contains('dark'),
      };
    });
    console.log('NAV INFO (dark mode):', JSON.stringify(navInfo, null, 2));

    // Check .rounded-3xl.shadow-xl on merchant login page
    const merchantPage = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    await merchantPage.goto(`${baseUrl}/merchant/login`, { timeout: 15000 });
    await sleep(2000);

    const mInfo = await merchantPage.evaluate(() => {
      const el = document.querySelector('.rounded-3xl.shadow-xl');
      const html = document.documentElement;
      return {
        cardBgColor: el ? getComputedStyle(el).backgroundColor : 'not found',
        cardClasses: el?.className || 'not found',
        htmlHasDark: html.classList.contains('dark'),
        htmlSurface: getComputedStyle(html).getPropertyValue('--color-surface').trim(),
      };
    });
    console.log('MERCHANT LOGIN (light, no dark class):', JSON.stringify(mInfo, null, 2));

    await merchantPage.evaluate(() => document.documentElement.classList.add('dark'));
    await sleep(1000);

    const mInfoDark = await merchantPage.evaluate(() => {
      const el = document.querySelector('.rounded-3xl.shadow-xl');
      const html = document.documentElement;
      return {
        cardBgColor: el ? getComputedStyle(el).backgroundColor : 'not found',
        htmlSurface: getComputedStyle(html).getPropertyValue('--color-surface').trim(),
        htmlBg: getComputedStyle(html).getPropertyValue('--color-bg').trim(),
      };
    });
    console.log('MERCHANT LOGIN (dark mode):', JSON.stringify(mInfoDark, null, 2));

    await merchantPage.close();

    // Also check body color directly
    const bodyInfo = await page.evaluate(() => {
      const body = document.body;
      const html = document.documentElement;
      return {
        bodyBgComputed: getComputedStyle(body).backgroundColor,
        htmlBgProperty: getComputedStyle(html).getPropertyValue('--color-bg').trim(),
        htmlBgVarResolved: (() => {
          const style = document.createElement('style');
          style.textContent = '.test-bg { background: var(--bg) }';
          document.head.appendChild(style);
          const testEl = document.createElement('div');
          testEl.className = 'test-bg';
          document.body.appendChild(testEl);
          const result = getComputedStyle(testEl).backgroundColor;
          document.head.removeChild(style);
          document.body.removeChild(testEl);
          return result;
        })(),
      };
    });
    console.log('BODY COLOR CHECK:', JSON.stringify(bodyInfo, null, 2));

    await page.close();
    console.log('\n✓ Diagnostic complete');
  } catch (e) {
    console.error('Error:', e);
  } finally {
    await browser.close();
    server.kill();
  }
}

run();
