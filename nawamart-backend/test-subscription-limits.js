require('dotenv').config();
const http = require('http');

// Simple HTTP client helper
function request(method, path, body, token = null) {
  return new Promise((resolve, reject) => {
    const payload = body ? JSON.stringify(body) : null;
    const headers = { 'Content-Type': 'application/json' };
    if (payload) headers['Content-Length'] = Buffer.byteLength(payload);
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const req = http.request(
      { hostname: 'localhost', port: 5000, path, method, headers },
      (res) => {
        let data = '';
        res.on('data', (chunk) => (data += chunk));
        res.on('end', () => {
          try {
            resolve({ status: res.statusCode, body: JSON.parse(data) });
          } catch {
            resolve({ status: res.statusCode, body: data });
          }
        });
      }
    );
    req.on('error', reject);
    if (payload) req.write(payload);
    req.end();
  });
}

function expectOk(label, res, expectedStatus = 201) {
  if (res.status !== expectedStatus) {
    throw new Error(`[${label}] Expected status ${expectedStatus}, got ${res.status}: ${JSON.stringify(res.body)}`);
  }
  console.log(`✅ ${label} → ${res.status}`);
}

async function run() {
  const suffix = Math.random().toString(36).substring(7);
  const c = {
    green: (s) => `\x1b[32m${s}\x1b[0m`,
    cyan:  (s) => `\x1b[36m${s}\x1b[0m`,
    bold:  (s) => `\x1b[1m${s}\x1b[0m`,
    red:   (s) => `\x1b[31m${s}\x1b[0m`,
    yellow: (s) => `\x1b[33m${s}\x1b[0m`,
  };

  console.log(c.bold(c.cyan('\n══════════════════════════════════════════════════')));
  console.log(c.bold(c.cyan('  NawaMart — Subscription & Plan Limit Tests')));
  console.log(c.bold(c.cyan('══════════════════════════════════════════════════\n')));

  // ── 1. Register Merchant ──────────────────────────────────────────────────────
  console.log('🔄 Step 1: Registering merchant...');
  const merRes = await request('POST', '/api/auth/merchant/register', {
    name: 'تاجر بلان',
    email: `merchant-plan-${suffix}@test.com`,
    phone: '710000001',
    password: 'password123'
  });
  expectOk('POST /api/auth/merchant/register', merRes);
  const mToken = merRes.body.data.token;

  // ── 2. Create Store (Starts on 'free' plan) ───────────────────────────────────
  console.log('\n🔄 Step 2: Creating store (defaults to "free" plan)...');
  const storeRes = await request('POST', '/api/stores', {
    name: `متجر خطة ${suffix}`,
    description: 'متجر اختبار خطة الاشتراك والحدود',
    category: 'electronics',
    contactPhone: '710000002',
    paymentAccounts: { cherry: '987654' }
  }, mToken);
  expectOk('POST /api/stores', storeRes);
  const storeId = storeRes.body.data._id;
  
  console.log(`ℹ️ Store Plan: ${c.bold(c.yellow(storeRes.body.data.plan))}`);

  // ── 3. Create 5 Products (Free limit is 5) ───────────────────────────────────
  console.log('\n🔄 Step 3: Creating 5 products under the Free plan limit...');
  for (let i = 1; i <= 5; i++) {
    const prodRes = await request('POST', '/api/products', {
      storeId,
      name: `منتج مجاني ${i}`,
      description: `وصف منتج مجاني رقم ${i}`,
      price: 10 * i,
      stock: 5,
      category: 'electronics'
    }, mToken);
    expectOk(`POST /api/products (Product ${i}/5)`, prodRes);
  }

  // ── 4. Try to Create the 6th Product (Should fail with 403) ────────────────────
  console.log('\n🔄 Step 4: Attempting to create a 6th product (expecting 403 limit block)...');
  const failRes = await request('POST', '/api/products', {
    storeId,
    name: 'منتج مجاني 6',
    description: 'هذا المنتج يجب أن يفشل في الإنشاء بسبب الحد الأقصى',
    price: 60,
    stock: 5,
    category: 'electronics'
  }, mToken);

  if (failRes.status === 403) {
    console.log(c.bold(c.green('✅ Got 403 Forbidden as expected!')));
    console.log(`💬 Error message: ${c.bold(c.yellow(failRes.body.message))}`);
  } else {
    throw new Error(`Expected 403 Forbidden for 6th product limit, got ${failRes.status}: ${JSON.stringify(failRes.body)}`);
  }

  // ── 5. Seed the Admin ─────────────────────────────────────────────────────────
  console.log('\n🔄 Step 5: Seeding the Administrator account...');
  const seedRes = await request('POST', '/api/admin/seed', {});
  if (seedRes.status === 201 || seedRes.status === 409) {
    console.log(`✅ Admin seed completed/already-done (Status: ${seedRes.status})`);
  } else {
    throw new Error(`Failed to seed admin, got ${seedRes.status}: ${JSON.stringify(seedRes.body)}`);
  }

  // ── 6. Log in as Admin ────────────────────────────────────────────────────────
  console.log('\n🔄 Step 6: Logging in as Administrator...');
  const loginRes = await request('POST', '/api/admin/login', {
    email: 'admin@nawamart.com',
    password: 'Admin@123456'
  });
  expectOk('POST /api/admin/login', loginRes, 200);
  const aToken = loginRes.body.data.token;

  // ── 7. Submit Subscription Request (Merchant) ──────────────────────────────────
  console.log('\n🔄 Step 7: Submitting "pro" plan subscription upgrade request...');
  const reqSubRes = await request('POST', '/api/subscriptions/request', {
    storeId,
    requestedPlan: 'pro',
    waslUrl: 'https://cloudinary.com/nawamart/wasl/dummy-wasl-receipt.jpg'
  }, mToken);
  expectOk('POST /api/subscriptions/request', reqSubRes);
  const subscriptionId = reqSubRes.body.data._id;

  // ── 8. List Pending Subscriptions & Approve (Admin) ───────────────────────────
  console.log('\n🔄 Step 8: Approving "pro" subscription request as Administrator...');
  const approveRes = await request('PUT', `/api/subscriptions/${subscriptionId}/approve`, {}, aToken);
  expectOk(`PUT /api/subscriptions/:id/approve`, approveRes, 200);
  
  // Verify plan upgrade in store
  const checkStoreRes = await request('GET', `/api/stores/my`, null, mToken);
  expectOk('GET /api/stores/my (verify upgrade)', checkStoreRes, 200);
  const upgradedStore = checkStoreRes.body.data.find(s => s._id === storeId);
  if (!upgradedStore) {
    throw new Error('Could not find store in merchant list after upgrade');
  }
  
  console.log(`ℹ️ Store Plan after upgrade: ${c.bold(c.green(upgradedStore.plan))}`);
  if (upgradedStore.plan !== 'pro') {
    throw new Error(`Expected store plan to be "pro", but got "${upgradedStore.plan}"`);
  }

  // ── 9. Try to Create the 6th Product Again (Should succeed now under Pro plan) ──
  console.log('\n🔄 Step 9: Re-attempting to create the 6th product under the Pro plan (limit is 50)...');
  const successRes = await request('POST', '/api/products', {
    storeId,
    name: 'منتج ممتاز 6',
    description: 'تم إنشاء هذا المنتج بنجاح بعد الترقية إلى الخطة الاحترافية',
    price: 60,
    stock: 5,
    category: 'electronics'
  }, mToken);
  expectOk('POST /api/products (6th product under Pro plan)', successRes);

  console.log(c.bold(c.green('\n══════════════════════════════════════════════════')));
  console.log(c.bold(c.green('  ✅ All subscription & plan limit tests passed!')));
  console.log(c.bold(c.green('══════════════════════════════════════════════════\n')));
}

run().catch((err) => {
  console.error('\x1b[31m❌ Test failed:\x1b[0m', err);
  process.exitCode = 1;
});
