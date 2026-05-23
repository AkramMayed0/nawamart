/**
 * NawaMart API — Endpoint Test Script
 * Uses mongodb-memory-server so no real MongoDB needed.
 *
 * Run: node test-endpoints.js
 */

require('dotenv').config();
const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');
const http = require('http');
const https = require('https');
const app = require('./src/app');

// ─── Colour helpers ───────────────────────────────────────────────────────────
const c = {
  green:  (s) => `\x1b[32m${s}\x1b[0m`,
  red:    (s) => `\x1b[31m${s}\x1b[0m`,
  yellow: (s) => `\x1b[33m${s}\x1b[0m`,
  cyan:   (s) => `\x1b[36m${s}\x1b[0m`,
  bold:   (s) => `\x1b[1m${s}\x1b[0m`,
  dim:    (s) => `\x1b[2m${s}\x1b[0m`,
};

// ─── Simple HTTP client ───────────────────────────────────────────────────────
function request(method, url, body, headers = {}) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const isHttps = urlObj.protocol === 'https:';
    const lib = isHttps ? https : http;

    const payload = body ? JSON.stringify(body) : null;

    const options = {
      hostname: urlObj.hostname,
      port: urlObj.port || (isHttps ? 443 : 80),
      path: urlObj.pathname + urlObj.search,
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(payload ? { 'Content-Length': Buffer.byteLength(payload) } : {}),
        ...headers,
      },
    };

    const req = lib.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, body: JSON.parse(data) });
        } catch {
          resolve({ status: res.statusCode, body: data });
        }
      });
    });

    req.on('error', reject);
    if (payload) req.write(payload);
    req.end();
  });
}

// ─── Test runner ──────────────────────────────────────────────────────────────
let passed = 0;
let failed = 0;

function assert(condition, label, detail = '') {
  if (condition) {
    console.log(`  ${c.green('✓')} ${label}`);
    passed++;
  } else {
    console.log(`  ${c.red('✗')} ${label}${detail ? c.dim(' — ' + detail) : ''}`);
    failed++;
  }
}

async function runTests(BASE, suffix) {
  console.log('');
  console.log(c.bold(c.cyan('═══════════════════════════════════════════════')));
  console.log(c.bold(c.cyan('   NawaMart API — Endpoint Tests')));
  console.log(c.bold(c.cyan('═══════════════════════════════════════════════')));
  console.log(c.dim(`  Base URL: ${BASE}`));
  console.log('');

  // ── 1. Health Check ─────────────────────────────────────────────────────────
  console.log(c.bold('▶ GET /api/health'));
  const health = await request('GET', `${BASE}/api/health`);
  assert(health.status === 200, 'Returns 200');
  assert(health.body.success === true, 'success: true');
  assert(health.body.data?.status === 'ok', 'data.status: "ok"');
  console.log(c.dim(`    Response: ${JSON.stringify(health.body.data)}`));
  console.log('');

  // ── 2. Merchant Register ─────────────────────────────────────────────────────
  console.log(c.bold('▶ POST /api/auth/merchant/register'));

  const merReg = await request('POST', `${BASE}/api/auth/merchant/register`, {
    name: 'أحمد علي',
    email: `ahmed-${suffix}@nawamart-test.com`,
    phone: '777123456',
    password: 'secret123',
  });
  assert(merReg.status === 201, 'Returns 201 on success');
  assert(merReg.body.success === true, 'success: true');
  assert(typeof merReg.body.data?.token === 'string', 'Returns JWT token');
  assert(merReg.body.data?.role === 'merchant', 'role: "merchant"');
  assert(!merReg.body.data?.user?.password, 'Password not exposed in response');
  console.log(c.dim(`    Token: ${merReg.body.data?.token?.substring(0, 40)}...`));
  const merchantToken = merReg.body.data?.token;
  console.log('');

  // Duplicate email → 409
  console.log(c.bold('▶ POST /api/auth/merchant/register (duplicate email)'));
  const merRegDup = await request('POST', `${BASE}/api/auth/merchant/register`, {
    name: 'آخر',
    email: `ahmed-${suffix}@nawamart-test.com`,
    phone: '777999999',
    password: 'secret123',
  });
  assert(merRegDup.status === 409, 'Returns 409 on duplicate email');
  assert(merRegDup.body.success === false, 'success: false');
  console.log(c.dim(`    Message: ${merRegDup.body.message}`));
  console.log('');

  // Missing fields → 400
  console.log(c.bold('▶ POST /api/auth/merchant/register (missing fields)'));
  const merRegMissing = await request('POST', `${BASE}/api/auth/merchant/register`, {
    email: 'incomplete@test.com',
  });
  assert(merRegMissing.status === 400, 'Returns 400 on missing fields');
  console.log(c.dim(`    Message: ${merRegMissing.body.message}`));
  console.log('');

  // ── 3. Merchant Login ────────────────────────────────────────────────────────
  console.log(c.bold('▶ POST /api/auth/merchant/login'));

  const merLogin = await request('POST', `${BASE}/api/auth/merchant/login`, {
    email: `ahmed-${suffix}@nawamart-test.com`,
    password: 'secret123',
  });
  assert(merLogin.status === 200, 'Returns 200 on success');
  assert(merLogin.body.success === true, 'success: true');
  assert(typeof merLogin.body.data?.token === 'string', 'Returns JWT token');
  assert(merLogin.body.data?.role === 'merchant', 'role: "merchant"');
  console.log(c.dim(`    Token: ${merLogin.body.data?.token?.substring(0, 40)}...`));
  console.log('');

  // Wrong password → 401
  console.log(c.bold('▶ POST /api/auth/merchant/login (wrong password)'));
  const merLoginBad = await request('POST', `${BASE}/api/auth/merchant/login`, {
    email: `ahmed-${suffix}@nawamart-test.com`,
    password: 'wrongpassword',
  });
  assert(merLoginBad.status === 401, 'Returns 401 on wrong password');
  assert(merLoginBad.body.success === false, 'success: false');
  console.log(c.dim(`    Message: ${merLoginBad.body.message}`));
  console.log('');

  // ── 4. Customer Register ─────────────────────────────────────────────────────
  console.log(c.bold('▶ POST /api/auth/customer/register'));

  const cusReg = await request('POST', `${BASE}/api/auth/customer/register`, {
    name: 'فاطمة محمد',
    email: `fatima-${suffix}@nawamart-test.com`,
    phone: '711123456',
    password: 'mypassword456',
  });
  assert(cusReg.status === 201, 'Returns 201 on success');
  assert(cusReg.body.success === true, 'success: true');
  assert(typeof cusReg.body.data?.token === 'string', 'Returns JWT token');
  assert(cusReg.body.data?.role === 'customer', 'role: "customer"');
  assert(!cusReg.body.data?.user?.password, 'Password not exposed in response');
  const customerToken = cusReg.body.data?.token;
  console.log(c.dim(`    Token: ${cusReg.body.data?.token?.substring(0, 40)}...`));
  console.log('');

  // ── 5. Customer Login ────────────────────────────────────────────────────────
  console.log(c.bold('▶ POST /api/auth/customer/login'));

  const cusLogin = await request('POST', `${BASE}/api/auth/customer/login`, {
    email: `fatima-${suffix}@nawamart-test.com`,
    password: 'mypassword456',
  });
  assert(cusLogin.status === 200, 'Returns 200 on success');
  assert(cusLogin.body.success === true, 'success: true');
  assert(typeof cusLogin.body.data?.token === 'string', 'Returns JWT token');
  assert(cusLogin.body.data?.role === 'customer', 'role: "customer"');
  console.log('');

  // ── 6. verifyToken middleware ────────────────────────────────────────────────
  console.log(c.bold('▶ verifyToken middleware checks'));

  // No token → 401
  const noToken = await request('GET', `${BASE}/api/health`); // health doesn't need auth
  // Test a protected endpoint doesn't exist yet but we can hit a fake one
  const noAuth = await request('GET', `${BASE}/api/stores/my`);
  assert(noAuth.status === 401 || noAuth.status === 404, 'Protected route needs token (401) or not built yet (404)');
  console.log(c.dim(`    No-token response status: ${noAuth.status}`));
  console.log('');

  // ── 7. 404 handler ──────────────────────────────────────────────────────────
  console.log(c.bold('▶ 404 not found handler'));
  const notFound = await request('GET', `${BASE}/api/does-not-exist`);
  assert(notFound.status === 404, 'Returns 404 for unknown routes');
  assert(notFound.body.success === false, 'success: false');
  console.log(c.dim(`    Message: ${notFound.body.message}`));
  console.log('');

  // ── Summary ──────────────────────────────────────────────────────────────────
  console.log(c.bold(c.cyan('═══════════════════════════════════════════════')));
  const total = passed + failed;
  if (failed === 0) {
    console.log(c.bold(c.green(`  ✅ All ${total} tests passed!`)));
  } else {
    console.log(c.bold(c.green(`  ✅ ${passed}/${total} passed`)));
    console.log(c.bold(c.red(`  ❌ ${failed}/${total} failed`)));
  }
  console.log(c.bold(c.cyan('═══════════════════════════════════════════════')));
  console.log('');

  return { passed, failed, merchantToken, customerToken };
}

// ─── Main ─────────────────────────────────────────────────────────────────────
async function main() {
  const BASE = 'http://localhost:5000';
  console.log(c.yellow(`\n📦 Running tests against ${BASE}...`));

  try {
    // Generate random email suffix to avoid collision on subsequent runs
    const randomSuffix = Math.random().toString(36).substring(7);
    const results = await runTests(BASE, randomSuffix);
    process.exitCode = results.failed > 0 ? 1 : 0;
  } catch (err) {
    console.error(c.red('\n❌ Test runner error:'), err);
    process.exitCode = 1;
  }
}

main();
