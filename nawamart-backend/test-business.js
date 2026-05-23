require('dotenv').config();
const http = require('http');

// Simple HTTP client
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
          try { resolve({ status: res.statusCode, body: JSON.parse(data) }); }
          catch { resolve({ status: res.statusCode, body: data }); }
        });
      }
    );
    req.on('error', reject);
    if (payload) req.write(payload);
    req.end();
  });
}

// Helper: fail loudly if an API call didn't succeed
function expectOk(label, res, expectedStatus = 201) {
  if (res.status !== expectedStatus) {
    throw new Error(`[${label}] Expected ${expectedStatus}, got ${res.status}: ${JSON.stringify(res.body)}`);
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
  };

  console.log(c.bold(c.cyan('\n══════════════════════════════════════════')));
  console.log(c.bold(c.cyan('  NawaMart — Business Logic Flow Tests')));
  console.log(c.bold(c.cyan('══════════════════════════════════════════\n')));

  // ── 1. Register Merchant ──────────────────────────────────────────────────────
  const merRes = await request('POST', '/api/auth/merchant/register', {
    name: 'تاجر أعمال', email: `biz-${suffix}@test.com`, phone: '700000001', password: 'password123'
  });
  expectOk('POST /api/auth/merchant/register', merRes);
  const mToken = merRes.body.data.token;

  // ── 2. Register Customer ──────────────────────────────────────────────────────
  const cusRes = await request('POST', '/api/auth/customer/register', {
    name: 'مشتري', email: `cus-${suffix}@test.com`, phone: '700000002', password: 'password123'
  });
  expectOk('POST /api/auth/customer/register', cusRes);
  const cToken = cusRes.body.data.token;

  // ── 3. Create Store ───────────────────────────────────────────────────────────
  const storeRes = await request('POST', '/api/stores', {
    name: `متجر ${suffix}`,
    description: 'وصف المتجر التجريبي',
    category: 'electronics',
    contactPhone: '700000003',
    paymentAccounts: { cherry: '123456' }
  }, mToken);
  expectOk('POST /api/stores', storeRes);
  const storeId = storeRes.body.data._id;
  const storeSlug = storeRes.body.data.slug;

  // ── 4. Get My Stores ──────────────────────────────────────────────────────────
  const myStoresRes = await request('GET', '/api/stores/my', null, mToken);
  expectOk('GET /api/stores/my', myStoresRes, 200);

  // ── 5. Get Store by Slug (Public) ─────────────────────────────────────────────
  const encodedSlug = encodeURIComponent(storeSlug);
  const slugRes = await request('GET', `/api/stores/${encodedSlug}`, null);
  expectOk(`GET /api/stores/:slug`, slugRes, 200);

  // ── 6. Create Product ─────────────────────────────────────────────────────────
  const prodRes = await request('POST', '/api/products', {
    storeId, name: 'منتج تجريبي', description: 'وصف المنتج', price: 100, stock: 10, category: 'electronics'
  }, mToken);
  expectOk('POST /api/products', prodRes);
  const prodId = prodRes.body.data._id;

  // ── 7. Get Products by Store (Public) ─────────────────────────────────────────
  const prodsRes = await request('GET', `/api/products/store/${storeId}`, null);
  expectOk('GET /api/products/store/:storeId', prodsRes, 200);

  // ── 8. Update Product ─────────────────────────────────────────────────────────
  const updProdRes = await request('PUT', `/api/products/${prodId}`, {
    price: 90, stock: 8
  }, mToken);
  expectOk('PUT /api/products/:id', updProdRes, 200);

  // ── 9. Create Order (Customer) ────────────────────────────────────────────────
  const orderRes = await request('POST', '/api/orders', {
    storeId,
    items: [{ product: prodId, quantity: 2 }],
    deliveryAddress: {
      city: 'صنعاء',
      details: 'حدة',
      phone: '700000002'
    },
    paymentMethod: 'cash'
  }, cToken);
  expectOk('POST /api/orders', orderRes);
  const orderId = orderRes.body.data._id;

  // ── 10. Get Merchant Orders ───────────────────────────────────────────────────
  const merOrdersRes = await request('GET', '/api/orders/merchant', null, mToken);
  expectOk('GET /api/orders/merchant', merOrdersRes, 200);

  // ── 11. Confirm Order ─────────────────────────────────────────────────────────
  const confirmRes = await request('PUT', `/api/orders/${orderId}/confirm`, {}, mToken);
  expectOk(`PUT /api/orders/${orderId}/confirm`, confirmRes, 200);

  // ── 12. Ship Order ────────────────────────────────────────────────────────────
  const shipRes = await request('PUT', `/api/orders/${orderId}/ship`, {}, mToken);
  expectOk(`PUT /api/orders/${orderId}/ship`, shipRes, 200);

  // ── 13. Deliver Order ─────────────────────────────────────────────────────────
  const deliverRes = await request('PUT', `/api/orders/${orderId}/deliver`, {}, mToken);
  expectOk(`PUT /api/orders/${orderId}/deliver`, deliverRes, 200);

  // ── 14. Init Chat (Customer → Store) ─────────────────────────────────────────
  const chatRes = await request('POST', '/api/chats', { storeId }, cToken);
  expectOk('POST /api/chats (init)', chatRes);
  const chatId = chatRes.body.data._id;

  // ── 15. Get Chat ──────────────────────────────────────────────────────────────
  const getChatRes = await request('GET', `/api/chats/${chatId}`, null, cToken);
  expectOk(`GET /api/chats/${chatId}`, getChatRes, 200);

  // ── 16. Send Message (Customer) ───────────────────────────────────────────────
  const msgRes = await request('POST', `/api/chats/${chatId}/message`, {
    content: 'هل المنتج متاح؟'
  }, cToken);
  expectOk(`POST /api/chats/${chatId}/message`, msgRes);

  // ── 17. Send Message (Merchant) ───────────────────────────────────────────────
  const merMsgRes = await request('POST', `/api/chats/${chatId}/message`, {
    content: 'نعم، متاح وسيتم الشحن خلال يومين'
  }, mToken);
  expectOk(`POST /api/chats/${chatId}/message (merchant reply)`, merMsgRes);

  // ── 18. Delete Product ────────────────────────────────────────────────────────
  const delProdRes = await request('DELETE', `/api/products/${prodId}`, null, mToken);
  expectOk('DELETE /api/products/:id', delProdRes, 200);

  console.log(c.bold(c.green('\n══════════════════════════════════════════')));
  console.log(c.bold(c.green('  ✅ All business flow tests passed!')));
  console.log(c.bold(c.green('══════════════════════════════════════════\n')));
}

run().catch((err) => {
  console.error('\x1b[31m❌ Test failed:\x1b[0m', err.message);
  process.exitCode = 1;
});
